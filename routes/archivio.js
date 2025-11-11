/**
 * @file opero/routes/archivio.js
 * @description Nuova rotta per il modulo "Archivio Documentale".
 * - v1.0: Fornisce l'endpoint per la consultazione
 * di tutti i file (DMS Fase 1).
 * @date 2025-11-11
 * @version 1.0
 */

const express = require('express');
const router = express.Router();
const { knex } = require('../config/db');
const { authenticate, checkPermission } = require('../utils/auth');

// Import S3 client e comandi
const {
    s3Client,
    GetObjectCommand,
    getSignedUrl,
    S3_BUCKET_NAME,
    S3_ENDPOINT,
} = require('../utils/s3Client');

router.use(authenticate);

/**
 * API: GET /api/archivio/all-files
 *
 * Recupera TUTTI i file dalla tabella 'dm_files',
 * unendo i dati dell'utente che ha caricato e
 * aggregando (GROUP_CONCAT) tutti i link polimorfici
 * dalla tabella 'dm_allegati_link'.
 */
router.get('/all-files', checkPermission('DM_FILE_VIEW'), async (req, res) => {
    const idDitta = req.user?.id_ditta;
    if (!idDitta) {
        return res.status(400).json({ error: 'Nessuna ditta selezionata.' });
    }

    try {
        // Query complessa per aggregare i link
        const files = await knex('dm_files as file')
            .leftJoin('utenti as u', 'file.id_utente_upload', 'u.id')
            .leftJoin('dm_allegati_link as link', 'file.id', 'link.id_file')
            .where('file.id_ditta', idDitta)
            .select(
                'file.id as id_file',
                'file.file_name_originale',
                'file.file_size_bytes',
                'file.mime_type',
                'file.privacy',
                'file.created_at',
                'file.s3_key',
                knex.raw("CONCAT(u.nome, ' ', u.cognome) as utente_upload"),
                // Aggrega tutti i link in una stringa separata da virgole
                // Es: "ct_catalogo:12, BENE_STRUMENTALE:5"
                knex.raw("GROUP_CONCAT(DISTINCT CONCAT(link.entita_tipo, ':', link.entita_id) SEPARATOR ', ') as links")
            )
            .groupBy('file.id')
            .orderBy('file.created_at', 'desc');

        // Post-processamento per generare URL (come in documenti.js)
        const cleanEndpoint = S3_ENDPOINT.replace(/^(https?:\/\/)/, '');
        
        for (const file of files) {
            const mimeType = file.mime_type;
            
            if (file.privacy === 'public') {
                file.previewUrl = `http://${cleanEndpoint}/${S3_BUCKET_NAME}/${file.s3_key}`;
            } else if (mimeType && (mimeType.startsWith('image/') || mimeType === 'application/pdf')) {
                const command = new GetObjectCommand({
                    Bucket: S3_BUCKET_NAME,
                    Key: file.s3_key,
                    ResponseContentDisposition: `inline; filename="${file.file_name_originale}"`
                });
                file.previewUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
            }
            delete file.s3_key;
        }
        
        res.json(files);

    } catch (error) {
        console.error("Errore nel caricamento dell'archivio completo:", error);
        res.status(500).json({ error: 'Impossibile recuperare l\'archivio.' });
    }
});

module.exports = router;