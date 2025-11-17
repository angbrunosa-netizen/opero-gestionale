/**
 * @file opero/routes/archivio.js
 * @description Nuova rotta per il modulo "Archivio Documentale".
 * - v1.0: Fornisce l'endpoint per la consultazione
 * di tutti i file (DMS Fase 1).
 * - v1.1: Aggiunto endpoint per aggiornare la privacy di un file
 * - v1.2: Aggiunto endpoint per l'upload di file
 * @date 2025-11-11
 * @version 1.2
 */

const express = require('express');
const router = express.Router();
const { knex } = require('../config/db');
const { authenticate, checkPermission } = require('../utils/auth');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Configurazione di multer per gestire l'upload in memoria
const upload = multer({ storage: multer.memoryStorage() });

// Import S3 client e comandi
const {
    s3Client,
    GetObjectCommand,
    getSignedUrl,
    PutObjectCommand,
    PutObjectAclCommand,
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
        const files = await knex('dm_files as file')
            .leftJoin('utenti as u', 'file.id_utente_upload', 'u.id')
            .leftJoin('dm_allegati_link as link', 'file.id', 'link.id_file')
            .leftJoin('ct_catalogo as cat', function() {
                this.on('link.entita_tipo', '=', knex.raw('?', ['ct_catalogo']))
                    .andOn('link.entita_id', '=', 'cat.id');
            })
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
                knex.raw(
                    "GROUP_CONCAT(DISTINCT COALESCE(cat.descrizione, bene.descrizione, CONCAT(link.entita_tipo, ':', link.entita_id)) SEPARATOR ', ') as links_descrizione"
                )
            )
            .groupBy('file.id')
            .orderBy('file.created_at', 'desc');

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

/**
 * API: POST /api/archivio/upload
 *
 * Carica un file su S3, crea il record nel DB e lo collega all'entità.
 * Legge il campo 'privacy' dal FormData per impostare correttamente i permessi.
 */
/**
 * API: POST /api/archivio/upload
 *
 * Carica un file su S3, crea il record nel DB e lo collega all'entità.
 * Legge il campo 'privacy' dal FormData per impostare correttamente i permessi.
 */
router.post('/upload', checkPermission('DM_FILE_UPLOAD'), upload.single('file'), async (req, res) => {
    const idDitta = req.user?.id_ditta;
    const idUtenteUpload = req.user?.id;
    
    if (!idDitta || !idUtenteUpload) {
        return res.status(400).json({ error: 'Dati utente incompleti.' });
    }

    const file = req.file;
    const { entitaId, entitaTipo, idDitta: idDittaForm, note, privacy } = req.body;

    if (!file) {
        return res.status(400).json({ error: 'Nessun file caricato.' });
    }
    if (!entitaId || !entitaTipo) {
        return res.status(400).json({ error: 'ID o tipo entità mancante.' });
    }

    // Usa l'idDitta dal form se fornito, altrimenti usa quello dell'utente
    const effectiveIdDitta = idDittaForm || idDitta;
    
    // Imposta 'private' come default se non specificato
    const filePrivacy = privacy || 'private';

    // --- AGGIUNGI QUESTI LOG PER DEBUG ---
    console.log('BACKEND DEBUG - Corpo della richiesta ricevuto (req.body):', req.body);
    console.log('BACKEND DEBUG - File ricevuto (req.file):', req.file ? req.file.originalname : 'NESSUNO');
    // --- FINE LOG ---

    const trx = await knex.transaction();
    try {
        // 1. Crea un record per il file nella tabella dm_files
        const insertResult = await trx('dm_files').insert({
            file_name_originale: file.originalname,
            file_size_bytes: file.size,
            mime_type: file.mimetype,
            id_ditta: effectiveIdDitta,
            id_utente_upload: idUtenteUpload,
            privacy: filePrivacy,
            s3_key: `s3-key-will-be-generated` // Placeholder
        });
        
        // In MySQL, l'ID inserito è in insertResult[0]
        const fileRecordId = insertResult[0];

        const s3Key = `ditta-${effectiveIdDitta}/${fileRecordId}-${file.originalname}`;

        // 2. Prepara i parametri per l'upload su S3
        const uploadParams = {
            Bucket: S3_BUCKET_NAME,
            Key: s3Key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: filePrivacy === 'public' ? 'public-read' : 'private'
        };

        // 3. Esegui l'upload su S3
        await s3Client.send(new PutObjectCommand(uploadParams));

        // 4. Aggiorna il record nel DB con la chiave S3 corretta
        await trx('dm_files')
            .where('id', fileRecordId)
            .update({ s3_key: s3Key });

        // 5. Crea il link polimorfico nella tabella dm_allegati_link
        await trx('dm_allegati_link').insert({
            id_file: fileRecordId,
            entita_tipo: entitaTipo,
            entita_id: entitaId,
            note: note || null
        });

        // 6. Conferma la transazione
        await trx.commit();

        res.status(201).json({
            message: 'File caricato con successo.',
            file: {
                id: fileRecordId,
                fileName: file.originalname,
                privacy: filePrivacy
            }
        });

    } catch (error) {
        await trx.rollback();
        console.error("Errore durante l'upload del file:", error);
        res.status(500).json({ error: 'Impossibile caricare il file.' });
    }
});
module.exports = router;