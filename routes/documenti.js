/**
 * File: /routes/documenti.js
 *
 * Versione: 2.6 (Fix crash ReferenceError)
 *
 * Descrizione: Rotte API per la gestione documentale (DMS).
 * Gestisce la generazione di URL pre-firmati S3 per upload/download
 * e la logica di business (quote, link DB, ecc.).
 * Questo file è compatibile con l'architettura auth.js (v2.2)
 * che salva il payload in req.user.
 */

const express = require('express');
const router = express.Router();
const knex = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// CORREZIONE: Importa solo 'authenticate' e 'checkPermission' da auth.js
const { authenticate, checkPermission } = require('../utils/auth');
// (Assumiamo che logAzione sia in 'utils/log.js' se mai servirà)

// Import S3 client e comandi
const {
    s3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    getSignedUrl,
    S3_BUCKET_NAME
} = require('../utils/s3Client');

// Middleware di autenticazione per tutte le rotte DMS
router.use(authenticate);


// --- Funzione Helper per estrarre la Ditta (corretta e robusta) ---
// Questa funzione legge la ditta dal payload del token,
// come definito in utils/auth.js (v2.2)
const getDittaFromReq = (req) => {
    // req.user è l'intero payload, la ditta è in req.user.ditta
    return req.user?.ditta;
};


/**
 * API 1: POST /api/documenti/generate-upload-url
 *
 * Chiede un URL sicuro per caricare un file.
 * Controlla il permesso (DM_FILE_UPLOAD) e la quota disco della ditta.
 */
router.post('/generate-upload-url', checkPermission('DM_FILE_UPLOAD'), async (req, res) => {
    const { fileName, fileSize, mimeType } = req.body;

    // --- CONTROLLO DI SICUREZZA DITTA (Corretto v2.6) ---
    const ditta = getDittaFromReq(req); // Usa la helper function
    if (!ditta || !ditta.id) {
        return res.status(400).json({ error: 'Nessuna ditta selezionata.' });
    }
    const idDitta = ditta.id;
    // --- Fine Controllo ---
    
    // 1. Validazione input
    if (!fileName || !fileSize || isNaN(parseInt(fileSize))) {
        return res.status(400).json({ error: 'Dati file mancanti o non validi (fileName, fileSize).' });
    }

    try {
        // 2. Controllo Quota (Piani)
        // Recuperiamo i dati aggiornati sulla quota (non possiamo fidarci solo del token)
        const dittaDb = await knex('ditte').where({ id: idDitta }).first();
        if (!dittaDb) {
            return res.status(404).json({ error: 'Ditta non trovata.' });
        }

        const maxStorageBytes = dittaDb.max_storage_mb * 1024 * 1024;
        const currentStorageBytes = dittaDb.current_storage_bytes;
        const newFileSizeBytes = parseInt(fileSize);

        if (currentStorageBytes + newFileSizeBytes > maxStorageBytes) {
            return res.status(402).json({ // 402 Payment Required
                error: `Spazio di archiviazione insufficiente. (Usato: ${formatFileSize(currentStorageBytes)} / ${dittaDb.max_storage_mb} MB)` 
            });
        }

        // 3. Creazione S3 Key
        const s3Key = `ditta_${idDitta}/allegati/${uuidv4()}-${fileName}`;

        // 4. Generazione URL Pre-Firmato (PUT)
        const command = new PutObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: s3Key,
            ContentType: mimeType,
            ContentLength: newFileSizeBytes,
        });

        // Valido per 5 minuti
        const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

        res.json({ uploadUrl, s3Key });

    } catch (error) {
        console.error("Errore generazione URL upload S3:", error);
        res.status(500).json({ error: 'Impossibile generare il link per l\'upload.' });
    }
});


/**
 * API 2: POST /api/documenti/finalize-upload
 *
 * Conferma un upload S3. Scrive i metadati nel DB (dm_files, dm_allegati_link)
 * e aggiorna il contatore della quota ditta.
 * Richiede il permesso (DM_FILE_UPLOAD).
 */
router.post('/finalize-upload', checkPermission('DM_FILE_UPLOAD'), async (req, res) => {
    const { s3Key, fileName, fileSize, mimeType, entita_tipo, entita_id } = req.body;

    // --- CONTROLLO DI SICUREZZA DITTA (Corretto v2.6) ---
    const ditta = getDittaFromReq(req);
    if (!ditta || !ditta.id) {
        return res.status(400).json({ error: 'Nessuna ditta selezionata.' });
    }
    const idDitta = ditta.id;
    // L'architettura v2.2 salva il payload utente in req.user.user
    const idUtente = req.user?.user?.id;
    // --- Fine Controllo ---

    // 1. Validazione
    if (!s3Key || !fileName || !fileSize || !entita_tipo || !entita_id) {
        return res.status(400).json({ error: 'Dati di finalizzazione mancanti.' });
    }

    let trx;
    try {
        trx = await knex.transaction();

        // 2. Inserisci il file in 'dm_files'
        const [newFile] = await trx('dm_files').insert({
            id_ditta: idDitta,
            id_utente_upload: idUtente,
            file_name_originale: fileName,
            file_size_bytes: parseInt(fileSize),
            mime_type: mimeType,
            s3_key: s3Key,
        }).returning('*');

        // 3. Crea il link in 'dm_allegati_link'
        await trx('dm_allegati_link').insert({
            id_ditta: idDitta,
            id_file: newFile.id,
            entita_tipo,
            entita_id: parseInt(entita_id),
        });

        // 4. Aggiorna la quota disco della ditta
        await trx('ditte')
            .where({ id: idDitta })
            .increment('current_storage_bytes', parseInt(fileSize));
        
        // 5. Commit
        await trx.commit();
        res.status(201).json(newFile);

    } catch (error) {
        if (trx) await trx.rollback();
        console.error("Errore finalizzazione upload:", error);
        res.status(500).json({ error: 'Impossibile salvare i dati del file nel database.' });
    }
});


/**
 * API 3: GET /api/documenti/list/:entita_tipo/:entita_id
 *
 * Recupera l'elenco dei file allegati a una specifica entità.
 * Richiede il permesso (DM_FILE_VIEW).
 */
router.get('/list/:entita_tipo/:entita_id', checkPermission('DM_FILE_VIEW'), async (req, res) => {
    const { entita_tipo, entita_id } = req.params;

    // --- CONTROLLO DI SICUREZZA DITTA (Corretto v2.6) ---
    const ditta = getDittaFromReq(req);
    if (!ditta || !ditta.id) {
        return res.status(400).json({ error: 'Nessuna ditta selezionata.' });
    }
    const idDitta = ditta.id;
    // --- Fine Controllo ---

    try {
        const allegati = await knex('dm_allegati_link as link')
            .join('dm_files as file', 'link.id_file', 'file.id')
            .leftJoin('utenti as u', 'file.id_utente_upload', 'u.id')
            .where({
                'link.id_ditta': idDitta,
                'link.entita_tipo': entita_tipo,
                'link.entita_id': parseInt(entita_id)
            })
            .select(
                'link.id as id_link',
                'file.id as id_file',
                'file.file_name_originale',
                'file.file_size_bytes',
                'file.mime_type',
                'file.created_at',
                'u.username as utente_upload'
            )
            .orderBy('file.created_at', 'desc');
        
        res.json(allegati);

    } catch (error) {
        console.error("Errore nel recuperare la lista degli allegati:", error);
        res.status(500).json({ error: 'Impossibile recuperare la lista degli allegati.' });
    }
});


/**
 * API 4: GET /api/documenti/generate-download-url/:id_file
 *
 * Genera un URL sicuro per scaricare un file.
 * Richiede il permesso (DM_FILE_VIEW).
 */
router.get('/generate-download-url/:id_file', checkPermission('DM_FILE_VIEW'), async (req, res) => {
    const { id_file } = req.params;

    // --- CONTROLLO DI SICUREZZA DITTA (Corretto v2.6) ---
    const ditta = getDittaFromReq(req);
    if (!ditta || !ditta.id) {
        return res.status(400).json({ error: 'Nessuna ditta selezionata.' });
    }
    const idDitta = ditta.id;
    // --- Fine Controllo ---

    try {
        // 1. Cerca il file e verifica la proprietà della ditta
        const file = await knex('dm_files')
            .where({
                id: parseInt(id_file),
                id_ditta: idDitta // FONDAMENTALE: l'utente può scaricare solo file della sua ditta
            })
            .first();

        if (!file) {
            return res.status(404).json({ error: 'File non trovato o non autorizzato.' });
        }

        // 2. Genera URL Pre-Firmato (GET)
        const command = new GetObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: file.s3_key,
        });

        // Valido per 5 minuti
        const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
        
        res.json({ downloadUrl });

    } catch (error) {
        console.error("Errore generazione URL download S3:", error);
        res.status(500).json({ error: 'Impossibile generare il link per il download.' });
    }
});


/**
 * API 5: DELETE /api/documenti/link/:id_link
 *
 * Scollega un file da un'entità (elimina il record in dm_allegati_link).
 * Se il file in dm_files diventa orfano, lo elimina da S3 e aggiorna la quota.
 * Richiede il permesso (DM_FILE_DELETE).
 */
router.delete('/link/:id_link', checkPermission('DM_FILE_DELETE'), async (req, res) => {
    const { id_link } = req.params;

    // --- CONTROLLO DI SICUREZZA DITTA (Corretto v2.6) ---
    const ditta = getDittaFromReq(req);
    if (!ditta || !ditta.id) {
        return res.status(400).json({ error: 'Nessuna ditta selezionata.' });
    }
    const idDitta = ditta.id;
    // --- Fine Controllo ---

    let trx;
    try {
        trx = await knex.transaction();

        // 1. Trova il link e il file associato, verificando la ditta
        const link = await trx('dm_allegati_link')
            .where({
                id: parseInt(id_link),
                id_ditta: idDitta // FONDAMENTALE: l'utente può eliminare solo link della sua ditta
            })
            .first();

        if (!link) {
            await trx.rollback();
            return res.status(404).json({ error: 'Collegamento non trovato o non autorizzato.' });
        }
        
        const idFile = link.id_file;

        // 2. Elimina il link
        await trx('dm_allegati_link').where({ id: link.id }).del();

        // 3. Controlla se il file è orfano (non ha altri link)
        const altriLink = await trx('dm_allegati_link').where({ id_file: idFile }).first();

        if (!altriLink) {
            // 4. Se orfano: Elimina da S3 e da dm_files
            
            // 4a. Recupera i dati del file
            const file = await trx('dm_files').where({ id: idFile }).first();
            if (!file) {
                 // Questo non dovrebbe accadere se l'integrità del DB è mantenuta
                throw new Error(`File orfano con ID ${idFile} non trovato in dm_files.`);
            }

            // 4b. Elimina da S3
            const deleteCommand = new DeleteObjectCommand({
                Bucket: S3_BUCKET_NAME,
                Key: file.s3_key,
            });
            await s3Client.send(deleteCommand);

            // 4c. Elimina da dm_files
            await trx('dm_files').where({ id: idFile }).del();

            // 4d. Aggiorna (decrementa) la quota della ditta
            await trx('ditte')
                .where({ id: idDitta })
                .decrement('current_storage_bytes', file.file_size_bytes);
            
            // console.log(`File orfano ${idFile} eliminato da S3 e DB.`);
        }

        // 5. Commit
        await trx.commit();
        res.json({ success: true, message: 'Allegato scollegato con successo.' });

    } catch (error) {
        if (trx) await trx.rollback();
        console.error("Errore durante l'eliminazione del link:", error);
        res.status(500).json({ error: 'Impossibile eliminare l\'allegato.' });
    }
});


// Helper utility per il logging (da rimuovere in prod se non usata)
const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};


module.exports = router;