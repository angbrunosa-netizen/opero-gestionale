/**
 * File: /routes/documenti.js
 *
 * Versione: 3.1 (Fix Definitivo 500)
 *
 * Descrizione: Questa versione corregge tutti gli errori accumulati:
 * 1. (v3.0) Usa l'import corretto: `const { knex } = require('../config/db');`
 * 2. (v3.1) Seleziona 'u.nome' e 'u.cognome' (dal file utenti.sql)
 * invece di 'u.username' (che causava 'Unknown column').
 * 3. (v2.7) Usa 'req.user?.id_ditta' per compatibilità.
 */

const express = require('express');
const router = express.Router();
const { knex } = require('../config/db'); // --- CORREZIONE v3.0 ---
const { v4: uuidv4 } = require('uuid');

const { authenticate, checkPermission } = require('../utils/auth');

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


/**
 * API 1: POST /api/documenti/generate-upload-url
 *
 * Chiamata dal frontend prima di un upload.
 * Genera un URL S3 pre-firmato (PUT)
 * Richiede il permesso (DM_FILE_UPLOAD).
 */
router.post('/generate-upload-url', checkPermission('DM_FILE_UPLOAD'), async (req, res) => {
    const { fileName, fileSize, mimeType } = req.body;

    // --- CONTROLLO DI SICUREZZA DITTA (Corretto v2.7) ---
    const idDitta = req.user?.id_ditta;
    if (!idDitta) {
        return res.status(400).json({ error: 'Nessuna ditta selezionata (id_ditta non trovato nel token).' });
    }
    // --- Fine Controllo ---
    
    // TODO: Controllo Quota Storage
    // const quotaUsata = await calcolaQuotaUsata(idDitta);
    // const quotaMax = await getQuotaMax(idDitta);
    // if (quotaUsata + fileSize > quotaMax) {
    //    return res.status(413).json({ error: 'Spazio di archiviazione insufficiente.' });
    // }

    if (!fileName || !fileSize || !mimeType) {
        return res.status(400).json({ error: 'Dati file mancanti (fileName, fileSize, mimeType).' });
    }

    // Genera una chiave S3 unica
    // Formato: idDitta/uuid_random/nome_originale.ext
    const s3Key = `${idDitta}/${uuidv4()}/${fileName}`;

    try {
        const command = new PutObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: s3Key,
            ContentType: mimeType,
            ContentLength: fileSize,
            // ACL: 'public-read' // Ometti se il bucket è privato (default)
        });

        // Genera l'URL pre-firmato per il PUT
        const uploadUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 300 // L'URL scade in 5 minuti
        });

        res.json({
            uploadUrl,
            s3Key // La chiave S3 che il frontend deve rimandarci
        });

    } catch (error) {
        console.error("Errore nella generazione dell'URL di upload S3:", error);
        res.status(500).json({ error: 'Impossibile generare l\'URL di upload.' });
    }
});


/**
 * API 2: POST /api/documenti/finalize-upload
 *
 * Chiamata dal frontend DOPO un upload S3.
 * Salva il file nel db (dm_files) e crea il link (dm_allegati_link).
 * Richiede il permesso (DM_FILE_UPLOAD).
 */
router.post('/finalize-upload', checkPermission('DM_FILE_UPLOAD'), async (req, res) => {
    const { s3Key, fileName, fileSize, mimeType, entita_tipo, entita_id } = req.body;

    // --- CONTROLLO DI SICUREZZA DITTA (Corretto v2.7) ---
    const idDitta = req.user?.id_ditta;
    if (!idDitta) {
        return res.status(400).json({ error: 'Nessuna ditta selezionata (id_ditta non trovato nel token).' });
    }
    // --- Fine Controllo ---
    
    // L'ID utente che sta eseguendo l'upload
    const idUtenteUpload = req.user?.id;
    if (!idUtenteUpload) {
         return res.status(403).json({ error: 'Token utente non valido (ID utente non trovato).' });
    }

    if (!s3Key || !fileName || !fileSize || !mimeType || !entita_tipo || !entita_id) {
        return res.status(400).json({ error: 'Dati di finalizzazione incompleti.' });
    }

    // Usiamo una transazione Knex per assicurare l'integrità
    const trx = await knex.transaction();
    try {
        // 1. Controlla se il file (s3Key) è già stato registrato
        let file = await trx('dm_files').where({ s3_key: s3Key }).first();

        let id_file;

        if (file) {
            // File già esistente, usiamo il suo ID
            id_file = file.id;
        } else {
            // 2. File non esistente: Inserisci in 'dm_files'
            const [newFile] = await trx('dm_files')
                .insert({
                    id_ditta: idDitta,
                    s3_key: s3Key,
                    file_name_originale: fileName,
                    file_size_bytes: fileSize,
                    mime_type: mimeType,
                    id_utente_upload: idUtenteUpload,
                    // created_at e updated_at gestiti da Knex (se configurato)
                })
                .returning('id'); // Richiede PostgreSQL, per MySQL/MariaDB usiamo lastInsertId
            
            // Per MySQL/MariaDB, l'ID è nel risultato
            id_file = newFile.id || newFile;
        }

        // 3. Controlla se il link esiste già
        const linkEsistente = await trx('dm_allegati_link')
            .where({
                id_ditta: idDitta,
                id_file: id_file,
                entita_tipo: entita_tipo,
                entita_id: parseInt(entita_id)
            })
            .first();

        if (linkEsistente) {
            // Il file è già collegato a questa entità
            await trx.commit();
            // Restituiamo 200 (OK) perché l'azione è idempotente
            return res.status(200).json({ success: true, message: 'File già collegato.', id_file: id_file, id_link: linkEsistente.id });
        }

        // 4. Crea il link in 'dm_allegati_link'
        const [newLink] = await trx('dm_allegati_link')
            .insert({
                id_ditta: idDitta,
                id_file: id_file,
                entita_tipo: entita_tipo,
                entita_id: parseInt(entita_id)
            })
            .returning('id');
            
        // 5. Commit della transazione
        await trx.commit();

        res.status(201).json({ success: true, message: 'Upload finalizzato e file collegato.', id_file: id_file, id_link: (newLink.id || newLink) });

    } catch (error) {
        await trx.rollback();
        console.error("Errore nella finalizzazione dell'upload:", error);
        res.status(500).json({ error: 'Impossibile salvare il riferimento del file nel database.' });
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

    // --- CONTROLLO DI SICUREZZA DITTA (Corretto v2.7) ---
    const idDitta = req.user?.id_ditta;
    if (!idDitta) {
        return res.status(400).json({ error: 'Nessuna ditta selezionata (id_ditta non trovato nel token).' });
    }
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
                // --- CORREZIONE v3.1 ---
                // Selezioniamo 'u.nome' e 'u.cognome' (basato su utenti.sql)
                'u.nome as utente_nome',
                'u.cognome as utente_cognome'
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
 * Genera un URL S3 pre-firmato (GET) per scaricare un file.
 * Richiede il permesso (DM_FILE_VIEW).
 */
router.get('/generate-download-url/:id_file', checkPermission('DM_FILE_VIEW'), async (req, res) => {
    const { id_file } = req.params;

    // --- CONTROLLO DI SICUREZZA DITTA (Corretto v2.7) ---
    const idDitta = req.user?.id_ditta;
    if (!idDitta) {
        return res.status(400).json({ error: 'Nessuna ditta selezionata (id_ditta non trovato nel token).' });
    }
    // --- Fine Controllo ---

    try {
        // 1. Verifica che il file esista e appartenga alla ditta
        const file = await knex('dm_files')
            .where({
                id: parseInt(id_file),
                id_ditta: idDitta
            })
            .first();

        if (!file) {
            return res.status(404).json({ error: 'File non trovato o accesso negato.' });
        }

        // 2. Genera URL di download
        const command = new GetObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: file.s3_key,
            // Forza il browser a scaricare vs visualizzare
            ResponseContentDisposition: `attachment; filename="${file.file_name_originale}"`
        });

        const downloadUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 300 // L'URL scade in 5 minuti
        });

        res.json({ downloadUrl });

    } catch (error) {
        console.error("Errore nella generazione dell'URL di download S3:", error);
        res.status(500).json({ error: 'Impossibile generare l\'URL di download.' });
    }
});


/**
 * API 5: DELETE /api/documenti/link/:id_link
 *
 * Scollega un file da un'entità (rimuove il link in dm_allegati_link).
 * Se il file non è più collegato a nessuna entità, lo elimina
 * dal DB (dm_files) e dal bucket S3.
 * Richiede il permesso (DM_FILE_DELETE).
 */
router.delete('/link/:id_link', checkPermission('DM_FILE_DELETE'), async (req, res) => {
    const { id_link } = req.params;

    // --- CONTROLLO DI SICUREZZA DITTA (Corretto v2.7) ---
    const idDitta = req.user?.id_ditta;
    if (!idDitta) {
        return res.status(400).json({ error: 'Nessuna ditta selezionata (id_ditta non trovato nel token).' });
    }
    // --- Fine Controllo ---
    
    const trx = await knex.transaction();
    try {
        // 1. Trova il link e il file associato
        const link = await trx('dm_allegati_link')
            .where({
                id: parseInt(id_link),
                id_ditta: idDitta
            })
            .first();

        if (!link) {
            await trx.rollback();
            return res.status(404).json({ error: 'Collegamento non trovato o accesso negato.' });
        }

        const id_file = link.id_file;

        // 2. Rimuovi il link
        await trx('dm_allegati_link').where({ id: link.id }).del();

        // 3. Controlla se esistono altri link per questo file (in questa ditta)
        const altriLink = await trx('dm_allegati_link')
            .where({
                id_file: id_file,
                id_ditta: idDitta
            })
            .first(); // .first() è ottimizzato, ci basta sapere se ne esiste almeno 1

        if (altriLink) {
            // Esistono altri link, quindi ci fermiamo qui.
            await trx.commit();
            return res.status(200).json({ success: true, message: 'File scollegato. Il file è ancora in uso altrove.' });
        }

        // 4. Non esistono altri link: Eliminiamo il file
        
        // 4a. Recupera il file per avere la s3_key
        const file = await trx('dm_files')
            .where({
                id: id_file,
                id_ditta: idDitta
            })
            .first();

        if (!file) {
            // Questo non dovrebbe accadere se l'integrità referenziale è attiva
            throw new Error(`File con ID ${id_file} non trovato anche se il link ${id_link} esisteva.`);
        }

        // 4b. Elimina da S3
        const deleteCommand = new DeleteObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: file.s3_key
        });
        await s3Client.send(deleteCommand);

        // 4c. Elimina da dm_files
        await trx('dm_files').where({ id: file.id }).del();

        // 5. Commit
        await trx.commit();

        res.status(200).json({ success: true, message: 'File scollegato ed eliminato definitivamente.' });

    } catch (error) {
        await trx.rollback();
        console.error("Errore nell'eliminazione del link/file:", error);
        // Controlla se l'errore proviene da S3 (es. file non trovato)
        if (error.name === 'NoSuchKey') {
            res.status(404).json({ error: 'File non trovato su S3, ma il collegamento è stato rimosso.' });
        } else {
            res.status(500).json({ error: 'Impossibile eliminare il collegamento o il file.' });
        }
    }
});


// Helper utility (non usata, ma può servire)
const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};


module.exports = router;

