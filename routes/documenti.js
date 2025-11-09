/**
 * File: /routes/documenti.js
 *
 * Versione: 3.2 (Fix CORS Preflight)
 *
 * Descrizione: Questa versione corregge l'errore 403 Forbidden sulla richiesta
 * pre-flight (OPTIONS) rimuovendo 'ContentLength' dal PutObjectCommand.
 * Questo permette al browser di ottenere una firma S3 compatibile con il suo flusso di upload.
 */

const express = require('express');
const router = express.Router();
const { knex } = require('../config/db');
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

    // --- CONTROLLO DI SICUREZZA DITTA ---
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
        // --- MODIFICA CHIAVE QUI ---
        // Rimosso 'ContentLength' per garantire la compatibilità con le richieste pre-flight del browser.
        const command = new PutObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: s3Key,
            ContentType: mimeType,
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
 * ... (il resto del codice rimane invariato) ...
 */
router.post('/finalize-upload', checkPermission('DM_FILE_UPLOAD'), async (req, res) => {
    const { s3Key, fileName, fileSize, mimeType, entita_tipo, entita_id } = req.body;

    const idDitta = req.user?.id_ditta;
    if (!idDitta) {
        return res.status(400).json({ error: 'Nessuna ditta selezionata (id_ditta non trovato nel token).' });
    }
    
    const idUtenteUpload = req.user?.id;
    if (!idUtenteUpload) {
         return res.status(403).json({ error: 'Token utente non valido (ID utente non trovato).' });
    }

    if (!s3Key || !fileName || !fileSize || !mimeType || !entita_tipo || !entita_id) {
        return res.status(400).json({ error: 'Dati di finalizzazione incompleti.' });
    }

    const trx = await knex.transaction();
    try {
        let file = await trx('dm_files').where({ s3_key: s3Key }).first();
        let id_file;

        if (file) {
            id_file = file.id;
        } else {
            const [newFile] = await trx('dm_files')
                .insert({
                    id_ditta: idDitta,
                    s3_key: s3Key,
                    file_name_originale: fileName,
                    file_size_bytes: fileSize,
                    mime_type: mimeType,
                    id_utente_upload: idUtenteUpload,
                })
                .returning('id');
            
            id_file = newFile.id || newFile;
        }

        const linkEsistente = await trx('dm_allegati_link')
            .where({
                id_ditta: idDitta,
                id_file: id_file,
                entita_tipo: entita_tipo,
                entita_id: parseInt(entita_id)
            })
            .first();

        if (linkEsistente) {
            await trx.commit();
            return res.status(200).json({ success: true, message: 'File già collegato.', id_file: id_file, id_link: linkEsistente.id });
        }

        const [newLink] = await trx('dm_allegati_link')
            .insert({
                id_ditta: idDitta,
                id_file: id_file,
                entita_tipo: entita_tipo,
                entita_id: parseInt(entita_id)
            })
            .returning('id');
            
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
 * ... (il resto del codice rimane invariato) ...
 */
/**
 * API 3: GET /api/documenti/list/:entita_tipo/:entita_id
 * (MODIFICATO v3.4 - Aggiunge previewUrl)
 */
router.get('/list/:entita_tipo/:entita_id', checkPermission('DM_FILE_VIEW'), async (req, res) => {
    const { entita_tipo, entita_id } = req.params;

    const idDitta = req.user?.id_ditta;
    if (!idDitta) {
        return res.status(400).json({ error: 'Nessuna ditta selezionata (id_ditta non trovato nel token).' });
    }

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
                'file.s3_key', // <-- Aggiunto s3_key per generare URL
                'u.nome as utente_nome', 
                'u.cognome as utente_cognome'
            )
            .orderBy('file.created_at', 'desc');
        
        // --- MODIFICA v3.4: Genera URL anteprima ---
        for (const file of allegati) {
            const mimeType = file.mime_type;
            if (mimeType && (mimeType.startsWith('image/') || mimeType === 'application/pdf')) {
                const command = new GetObjectCommand({
                    Bucket: S3_BUCKET_NAME,
                    Key: file.s3_key,
                    ResponseContentDisposition: `inline; filename="${file.file_name_originale}"`
                });
                file.previewUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 min
            }
            // Rimuoviamo s3_key per sicurezza prima di inviarlo al client
            delete file.s3_key; 
        }
        // --- FINE MODIFICA ---
        
        res.json(allegati);

    } catch (error) {
        console.error("Errore nel recuperare la lista degli allegati:", error);
        res.status(500).json({ error: 'Impossibile recuperare la lista degli allegati.' });
    }
});
/**
 * API 4: GET /api/documenti/generate-download-url/:id_file
 * ... (il resto del codice rimane invariato) ...
 */
router.get('/generate-download-url/:id_file', checkPermission('DM_FILE_VIEW'), async (req, res) => {
    const { id_file } = req.params;

    const idDitta = req.user?.id_ditta;
    if (!idDitta) {
        return res.status(400).json({ error: 'Nessuna ditta selezionata (id_ditta non trovato nel token).' });
    }

    try {
        const file = await knex('dm_files')
            .where({
                id: parseInt(id_file),
                id_ditta: idDitta
            })
            .first();

        if (!file) {
            return res.status(404).json({ error: 'File non trovato o accesso negato.' });
        }

        const command = new GetObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: file.s3_key,
            ResponseContentDisposition: `attachment; filename="${file.file_name_originale}"`
        });

        const downloadUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 300
        });

        res.json({ downloadUrl });

    } catch (error) {
        console.error("Errore nella generazione dell'URL di download S3:", error);
        res.status(500).json({ error: 'Impossibile generare l\'URL di download.' });
    }
});


/**
 * API 5: DELETE /api/documenti/link/:id_link
 * ... (il resto del codice rimane invariato) ...
 */
router.delete('/link/:id_link', checkPermission('DM_FILE_DELETE'), async (req, res) => {
    const { id_link } = req.params;

    const idDitta = req.user?.id_ditta;
    if (!idDitta) {
        return res.status(400).json({ error: 'Nessuna ditta selezionata (id_ditta non trovato nel token).' });
    }
    
    const trx = await knex.transaction();
    try {
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
        await trx('dm_allegati_link').where({ id: link.id }).del();

        const altriLink = await trx('dm_allegati_link')
            .where({
                id_file: id_file,
                id_ditta: idDitta
            })
            .first();

        if (altriLink) {
            await trx.commit();
            return res.status(200).json({ success: true, message: 'File scollegato. Il file è ancora in uso altrove.' });
        }

        const file = await trx('dm_files')
            .where({
                id: id_file,
                id_ditta: idDitta
            })
            .first();

        if (!file) {
            throw new Error(`File con ID ${id_file} non trovato anche se il link ${id_link} esisteva.`);
        }

        const deleteCommand = new DeleteObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: file.s3_key
        });
        await s3Client.send(deleteCommand);

        await trx('dm_files').where({ id: file.id }).del();

        await trx.commit();

        res.status(200).json({ success: true, message: 'File scollegato ed eliminato definitivamente.' });

    } catch (error) {
        await trx.rollback();
        console.error("Errore nell'eliminazione del link/file:", error);
        if (error.name === 'NoSuchKey') {
            res.status(404).json({ error: 'File non trovato su S3, ma il collegamento è stato rimosso.' });
        } else {
            res.status(500).json({ error: 'Impossibile eliminare il collegamento o il file.' });
        }
    }
});

/**
 * API 4b: GET /api/documenti/generate-preview-url/:id_file
 * (NUOVA API v3.3)
 * Genera un URL S3 pre-firmato (GET) per visualizzare (inline)
 */
router.get('/generate-preview-url/:id_file', checkPermission('DM_FILE_VIEW'), async (req, res) => {
    const { id_file } = req.params;

    const idDitta = req.user?.id_ditta;
    if (!idDitta) {
        return res.status(400).json({ error: 'Nessuna ditta selezionata (id_ditta non trovato nel token).' });
    }

    try {
        const file = await knex('dm_files')
            .where({
                id: parseInt(id_file),
                id_ditta: idDitta
            })
            .first();

        if (!file) {
            return res.status(404).json({ error: 'File non trovato o accesso negato.' });
        }

        const command = new GetObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: file.s3_key,
            // Forza la visualizzazione (se il browser può)
            ResponseContentDisposition: `inline; filename="${file.file_name_originale}"`
        });

        const previewUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 300 // 5 minuti
        });

        res.json({ previewUrl }); // Inviato come 'previewUrl'

    } catch (error) {
        console.error("Errore nella generazione dell'URL di anteprima S3:", error);
        res.status(500).json({ error: 'Impossibile generare l\'URL di anteprima.' });
    }
});


module.exports = router;