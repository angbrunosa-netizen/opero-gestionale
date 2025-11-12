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
/**
 * API: GET /api/archivio/all-files
 * (MODIFICATO v1.2 - Aggiunti JOIN per descrizioni)
 */
router.get('/all-files', checkPermission('DM_FILE_VIEW'), async (req, res) => {
    const idDitta = req.user?.id_ditta;
    if (!idDitta) {
        return res.status(400).json({ error: 'Nessuna ditta selezionata.' });
    }

    try {
        // --- (MODIFICA v1.2) ---
        // Query aggiornata con JOIN su tabelle specifiche
        // per recuperare le descrizioni.
        const files = await knex('dm_files as file')
            .leftJoin('utenti as u', 'file.id_utente_upload', 'u.id')
            .leftJoin('dm_allegati_link as link', 'file.id', 'link.id_file')
            // Join per il Catalogo
            .leftJoin('ct_catalogo as cat', function() {
                this.on('link.entita_tipo', '=', knex.raw('?', ['ct_catalogo']))
                    .andOn('link.entita_id', '=', 'cat.id');
            })
            // Join per i Beni Strumentali
            .leftJoin('bs_beni as bene', function() {
                this.on('link.entita_tipo', '=', knex.raw('?', ['BENE_STRUMENTALE']))
                    .andOn('link.entita_id', '=', 'bene.id');
            })
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
                // Aggrega le descrizioni trovate, o torna al link grezzo
                knex.raw(
                    "GROUP_CONCAT(DISTINCT COALESCE(cat.descrizione, bene.nome_bene, CONCAT(link.entita_tipo, ':', link.entita_id)) SEPARATOR ', ') as links_descrizione"
                )
            )
            .groupBy('file.id')
            .orderBy('file.created_at', 'desc');
        // --- FINE MODIFICA ---

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

/**
 * --- (NUOVA API v1.1) ---
 * API: PUT /api/archivio/file/:id_file/privacy
 *
 * Aggiorna la privacy di un file (nel DB e su S3).
 */
router.put('/file/:id_file/privacy', checkPermission('DM_FILE_MANAGE'), async (req, res) => {
    const { id_file } = req.params;
    const { privacy } = req.body; // 'public' o 'private'
    const idDitta = req.user?.id_ditta;

    if (!idDitta) {
        return res.status(400).json({ error: 'Nessuna ditta selezionata.' });
    }
    if (!privacy || (privacy !== 'public' && privacy !== 'private')) {
        return res.status(400).json({ error: "Valore 'privacy' non valido." });
    }

    const trx = await knex.transaction();
    try {
        // 1. Trova il file
        const file = await trx('dm_files')
            .where({
                id: parseInt(id_file),
                id_ditta: idDitta
            })
            .first('s3_key');

        if (!file) {
            await trx.rollback();
            return res.status(404).json({ error: 'File non trovato.' });
        }

        // 2. Aggiorna il DB
        await trx('dm_files')
            .where('id', parseInt(id_file))
            .update({ privacy: privacy });

        // 3. Imposta l'ACL (Permesso) su S3
        const newAcl = (privacy === 'public') ? 'public-read' : 'private';
        const aclCommand = new PutObjectAclCommand({
            Bucket: S3_BUCKET_NAME,
            Key: file.s3_key,
            ACL: newAcl
        });
        await s3Client.send(aclCommand);

        // 4. Conferma
        await trx.commit();
        res.json({ success: true, message: `Privacy aggiornata a ${privacy}.` });

    } catch (error) {
        await trx.rollback();
        console.error("Errore aggiornamento privacy file:", error);
        res.status(500).json({ error: 'Impossibile aggiornare la privacy.' });
    }
});


module.exports = router;