/**
 * @file opero/routes/archivio.js
 * @description Rotte per il modulo "Archivio Documentale".
 * - v1.0: Fornisce l'endpoint per la consultazione di tutti i file (DMS Fase 1).
 * - v1.1: Aggiunto endpoint per aggiornare la privacy di un file.
 * - v1.2: Aggiunto endpoint per l'upload di file.
 * - v1.3: Modificato la convenzione di nomina per includere ID ditta, ID entità e tipo entità.
 * @date 2025-11-11
 * @version 1.3
 */

const express = require('express');
const router = express.Router();
const { knex } = require('../config/db');
const { authenticate, checkPermission } = require('../utils/auth');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Configurazione di multer per gestire l'upload in memoria
const upload = multer({ storage: multer.memoryStorage() });
// URL della CDN configurata su Cloudflare
const CDN_BASE_URL = 'https://cdn.operocloud.it';
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
                ),
                knex.raw(
                    "GROUP_CONCAT(DISTINCT link.entita_tipo SEPARATOR ',') as entita_tipi"
                )
            )
            .groupBy('file.id')
            .orderBy('file.created_at', 'desc');

        for (const file of files) {
            const mimeType = file.mime_type;
            
            if (file.privacy === 'public') {
                // *** LOGICA CDN ***
                // Se è pubblico, costruiamo l'URL usando il dominio CDN.
                // Esempio: https://cdn.operocloud.it/nome-bucket/chiave-file
                file.previewUrl = `${CDN_BASE_URL}/${S3_BUCKET_NAME}/${file.s3_key}`;
            } else if (mimeType && (mimeType.startsWith('image/') || mimeType === 'application/pdf')) {
                // Se è privato, usiamo il link firmato S3 (scade in 5 min)
                const command = new GetObjectCommand({
                    Bucket: S3_BUCKET_NAME,
                    Key: file.s3_key,
                    ResponseContentDisposition: `inline; filename="${file.file_name_originale}"`
                });
                file.previewUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
            }
            delete file.s3_key; // Non esponiamo la chiave grezza se non serve
        }
        
        res.json(files);

    } catch (error) {
        console.error("Errore nel caricamento dell'archivio completo:", error);
        res.status(500).json({ error: 'Impossibile recuperare l\'archivio.' });
    }
});

/**
 * API: GET /api/archivio/entita/:entitaTipo/:entitaId
 * Recupera allegati specifici per un'entità.
 */
router.get('/entita/:entitaTipo/:entitaId', checkPermission('DM_FILE_VIEW'), async (req, res) => {
    const { entitaTipo, entitaId } = req.params;
    const idDitta = req.user?.id_ditta;

    if (!idDitta) return res.status(400).json({ error: 'Nessuna ditta selezionata.' });

    try {
        const allegati = await knex('dm_allegati_link as link')
            .join('dm_files as file', 'link.id_file', 'file.id')
            .where({
                'link.entita_tipo': entitaTipo,
                'link.entita_id': entitaId,
                'link.id_ditta': idDitta
            })
            .select(
                'file.id as id_link',
                'file.file_name_originale',
                'file.file_size_bytes',
                'file.mime_type',
                'file.privacy',
                'file.created_at',
                'file.s3_key'
            )
            .orderBy('file.created_at', 'desc');

        for (const allegato of allegati) {
            const mimeType = allegato.mime_type;
            
            if (allegato.privacy === 'public') {
                // *** LOGICA CDN ***
                allegato.previewUrl = `${CDN_BASE_URL}/${S3_BUCKET_NAME}/${allegato.s3_key}`;
            } else if (mimeType && (mimeType.startsWith('image/') || mimeType === 'application/pdf')) {
                const command = new GetObjectCommand({
                    Bucket: S3_BUCKET_NAME,
                    Key: allegato.s3_key,
                    ResponseContentDisposition: `inline; filename="${allegato.file_name_originale}"`
                });
                allegato.previewUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
            }
            delete allegato.s3_key;
        }
        res.json(allegati);
    } catch (error) {
        console.error("Errore nel recupero allegati entità:", error);
        res.status(500).json({ error: 'Impossibile recuperare gli allegati.' });
    }
});
/**
/**
 * API: PUT /api/archivio/file/:id_file/privacy
 * Aggiorna la privacy (DB + S3 ACL).
 */
router.put('/file/:id_file/privacy', checkPermission('DM_FILE_MANAGE'), async (req, res) => {
    const { id_file } = req.params;
    const { privacy } = req.body;
    const idDitta = req.user?.id_ditta;

    if (!idDitta) return res.status(400).json({ error: 'Nessuna ditta selezionata.' });
    if (!privacy || (privacy !== 'public' && privacy !== 'private')) {
        return res.status(400).json({ error: "Valore 'privacy' non valido." });
    }

    const trx = await knex.transaction();
    try {
        const file = await trx('dm_files').where({ id: parseInt(id_file), id_ditta: idDitta }).first('s3_key');
        if (!file) { await trx.rollback(); return res.status(404).json({ error: 'File non trovato.' }); }

        // Aggiorna DB
        await trx('dm_files').where('id', parseInt(id_file)).update({ privacy: privacy });

        // Aggiorna S3 ACL
        const newAcl = (privacy === 'public') ? 'public-read' : 'private';
        const aclCommand = new PutObjectAclCommand({
            Bucket: S3_BUCKET_NAME,
            Key: file.s3_key,
            ACL: newAcl
        });
        await s3Client.send(aclCommand);

        await trx.commit();
        res.json({ success: true, message: `Privacy aggiornata a ${privacy}.` });
    } catch (error) {
        await trx.rollback();
        console.error("Errore aggiornamento privacy:", error);
        res.status(500).json({ error: 'Impossibile aggiornare la privacy.' });
    }
});

/**
 * API: DELETE /api/archivio/scollega/:entitaTipo/:entitaId
 *
 * Scollega un file da un'entità utilizzando la chiave primaria composita.
 */
router.delete('/scollega/:entitaTipo/:entitaId', checkPermission('DM_FILE_DELETE'), async (req, res) => {
    const { entitaTipo, entitaId } = req.params;
    const idDitta = req.user?.id_ditta;

    if (!idDitta) {
        return res.status(400).json({ error: 'Nessuna ditta selezionata.' });
    }

    const trx = await knex.transaction();
    try {
        // Trova il link da eliminare usando la chiave primaria composita
        const linkToDelete = await trx('dm_allegati_link')
            .where({
                id_ditta: idDitta,
                entita_tipo: entitaTipo,
                entita_id: entitaId
            })
            .first();

        if (!linkToDelete) {
            await trx.rollback();
            return res.status(404).json({ error: 'Link non trovato.' });
        }

        // Elimina il link
        await trx('dm_allegati_link')
            .where({
                id_ditta: idDitta,
                entita_tipo: entitaTipo,
                entita_id: entitaId
            })
            .del();

        // Controlla se il file è collegato ad altre entità
        const otherLinksCount = await trx('dm_allegati_link')
            .where({ id_file: linkToDelete.id_file })
            .whereNot({
                id_ditta: idDitta,
                entita_tipo: entitaTipo,
                entita_id: entitaId
            })
            .count();

        // Se non è collegato ad altre entità, elimina anche il file
        if (otherLinksCount === 0) {
            await trx('dm_files')
                .where({ id: linkToDelete.id_file })
                .del();
        }

        await trx.commit();
        res.json({ success: true, message: 'File scollegato con successo.' });

    } catch (error) {
        await trx.rollback();
        console.error("Errore durante l'eliminazione del link:", error);
        res.status(500).json({ error: 'Impossibile scollegare il file.' });
    }
});

/**
 * API: POST /api/archivio/upload
 *
 * Carica un file su S3, crea il record nel DB e lo collega all'entità.
 * Oppure collega un file esistente all'entità.
 */
router.post('/upload', checkPermission('DM_FILE_UPLOAD'), upload.single('file'), async (req, res) => {
    const idDitta = req.user?.id_ditta;
    const idUtenteUpload = req.user?.id;

    if (!idDitta || !idUtenteUpload) {
        return res.status(400).json({ error: 'Dati utente incompleti.' });
    }

    const file = req.file;
    const { entitaId, entitaTipo, idDitta: idDittaForm, privacy, existingFileId } = req.body;

    // Controlla se stiamo collegando un file esistente
    if (existingFileId && !file) {
        return await linkExistingFile(req, res, {
            existingFileId,
            entitaId,
            entitaTipo,
            idDitta: idDittaForm || idDitta,
            privacy: privacy || 'public'
        });
    }

    // Altrimenti, procedi con l'upload normale
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

        // 2. Crea la chiave S3 con la nuova convenzione di nomina
        // Formato: ditta-{idDitta};{entitaId};{entitaTipo};{fileRecordId}-{file.originalname}
        const s3Key = `ditta-${effectiveIdDitta};${entitaId};${entitaTipo};${fileRecordId}-${file.originalname}`;

        // 3. Prepara i parametri per l'upload su S3
        const uploadParams = {
            Bucket: S3_BUCKET_NAME,
            Key: s3Key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: filePrivacy === 'public' ? 'public-read' : 'private'
        };

        // 4. Esegui l'upload su S3
        await s3Client.send(new PutObjectCommand(uploadParams));

        // 5. Aggiorna il record nel DB con la chiave S3 corretta
        await trx('dm_files')
            .where('id', fileRecordId)
            .update({ s3_key: s3Key });

        // 6. Crea il link polimorfico nella tabella dm_allegati_link
        await trx('dm_allegati_link').insert({
            id_ditta: effectiveIdDitta,
            id_file: fileRecordId,
            entita_tipo: entitaTipo,
            entita_id: entitaId,
        });

        // 7. Conferma la transazione
        await trx.commit();

        // Hook: Se è un PDF caricato per un post del blog, aggiorna automaticamente il post
        if (file.originalname.toLowerCase().endsWith('.pdf') && entitaTipo === 'Blog' && entitaId) {
            try {
                // Costruisci l'URL del file
                const fileUrl = filePrivacy === 'public'
                    ? `${process.env.CDN_BASE_URL || 'https://cdn.operobase.com'}/${process.env.S3_BUCKET_NAME}/${s3Key}`
                    : `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${s3Key}`;

                // Aggiorna il post del blog con il primo PDF (solo se non ha già un PDF)
                const { dbPool } = require('../config/db');
                await dbPool.query(
                    `UPDATE web_blog_posts
                     SET pdf_url = ?, pdf_filename = ?, updated_at = NOW()
                     WHERE id = ? AND (pdf_url IS NULL OR pdf_url = '')`,
                    [fileUrl, file.originalname, entitaId]
                );

                console.log(`🔄 Aggiornato post blog ${entitaId} con PDF: ${file.originalname}`);
            } catch (blogUpdateError) {
                console.error('⚠️ Errore aggiornamento post blog con PDF:', blogUpdateError);
                // Non bloccare la risposta anche se l'aggiornamento del post fallisce
            }
        }

        res.status(201).json({
            message: 'File caricato con successo.',
            file: {
                id: fileRecordId,
                fileName: file.originalname,
                privacy: filePrivacy,
                s3Key: s3Key
            }
        });

    } catch (error) {
        await trx.rollback();
        console.error("Errore durante l'upload del file:", error);
        res.status(500).json({ error: 'Impossibile caricare il file.' });
    }
});

/**
 * Funzione helper per collegare un file esistente a un'entità
 */
async function linkExistingFile(req, res, { existingFileId, entitaId, entitaTipo, idDitta, privacy }) {
    const trx = await knex.transaction();
    try {
        // Verifica che il file esista
        const file = await trx('dm_files').where('id', existingFileId).first();
        if (!file) {
            return res.status(404).json({ error: 'File non trovato.' });
        }

        // Verifica che il file sia già collegato a questa entità
        const existingLink = await trx('dm_allegati_link')
            .where({
                id_file: existingFileId,
                entita_tipo: entitaTipo,
                entita_id: entitaId
            })
            .first();

        if (existingLink) {
            return res.status(400).json({ error: 'Il file è già collegato a questa entità.' });
        }

        // Crea il nuovo collegamento
        await trx('dm_allegati_link').insert({
            id_ditta: idDitta,
            id_file: existingFileId,
            entita_tipo: entitaTipo,
            entita_id: entitaId,
        });

        // Aggiorna la privacy se richiesta
        if (privacy && file.privacy !== privacy) {
            const newAcl = privacy === 'public' ? 'public-read' : 'private';
            await trx('dm_files').where('id', existingFileId).update({ privacy: privacy });

            // Aggiorna anche S3 ACL
            const aclCommand = new PutObjectAclCommand({
                Bucket: S3_BUCKET_NAME,
                Key: file.s3_key,
                ACL: newAcl
            });
            await s3Client.send(aclCommand);
        }

        await trx.commit();

        res.json({
            message: 'File collegato con successo.',
            file: {
                id: existingFileId,
                fileName: file.file_name_originale,
                privacy: file.privacy
            }
        });

    } catch (error) {
        await trx.rollback();
        console.error("Errore nel collegare il file esistente:", error);
        res.status(500).json({ error: 'Impossibile collegare il file.' });
    }
}

// TEMP: Endpoint di test senza autenticazione per debug BlogManager
router.get('/test-entita/:entitaTipo/:entitaId', async (req, res) => {
    console.log('🧪 TEST GET /archivio/entita SENZA AUTENTICAZIONE');

    const { entitaTipo, entitaId } = req.params;

    try {
        // Simula utente e ditta per test
        req.user = {
            id: 1,
            id_ditta: 1,
            email: 'test@example.com'
        };
        const idDitta = 1;

        console.log(`🔍 Ricerca allegati per: entita_tipo=${entitaTipo}, entita_id=${entitaId}, id_ditta=${idDitta}`);

        const allegati = await knex('dm_allegati_link as link')
            .join('dm_files as file', 'link.id_file', 'file.id')
            .where({
                'link.entita_tipo': entitaTipo,
                'link.entita_id': entitaId,
                'link.id_ditta': idDitta
            })
            .select(
                'file.id as id_link',
                'file.file_name_originale',
                'file.file_size',
                'file.file_mime_type',
                'file.privacy',
                'file.created_at',
                'file.s3_key'
            )
            .orderBy('file.created_at', 'desc');

        console.log(`📎 Trovati ${allegati.length} allegati`);

        for (const allegato of allegati) {
            console.log(`   - ${allegato.file_name_originale} (${allegato.file_mime_type})`);

            if (allegato.privacy === 'public') {
                allegato.previewUrl = `${CDN_BASE_URL}/${S3_BUCKET_NAME}/${allegato.s3_key}`;
            } else if (allegato.s3_key) {
                // Per i file non pubblici, genera URL base (senza firma per test)
                allegato.previewUrl = `https://${S3_BUCKET_NAME}.s3.amazonaws.com/${allegato.s3_key}`;
            }
            delete allegato.s3_key;
        }

        res.json({
            success: true,
            allegati: allegati,
            debug: {
                entita_tipo: entitaTipo,
                entita_id: entitaId,
                id_ditta: idDitta,
                count: allegati.length
            }
        });

    } catch (error) {
        console.error('❌ Errore test allegati entità:', error);
        res.status(500).json({
            success: false,
            error: 'Errore nel test recupero allegati: ' + error.message
        });
    }
});

// TEMP: Endpoint di test per upload senza autenticazione
router.post('/test-upload', upload.single('file'), async (req, res) => {
    console.log('🧪 TEST UPLOAD /archivio/upload SENZA AUTENTICAZIONE');

    try {
        // Simula utente e ditta per test
        req.user = {
            id: 1,
            id_ditta: 1,
            email: 'test@example.com'
        };
        const idDitta = 1;
        const idUtenteUpload = 1;

        const { entita_tipo, entita_id, privacy = 'public' } = req.body;

        console.log('📝 Dati ricevuti:', {
            entita_tipo,
            entita_id,
            privacy,
            file: req.file ? req.file.originalname : 'Nessun file'
        });

        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Nessun file caricato'
            });
        }

        if (!entita_tipo || !entita_id) {
            return res.status(400).json({
                success: false,
                error: 'Dati entita_tipo e entita_id obbligatori'
            });
        }

        res.json({
            success: true,
            message: 'Test upload completato con successo',
            data: {
                id_ditta: idDitta,
                id_utente: idUtenteUpload,
                entita_tipo,
                entita_id,
                privacy,
                file_info: {
                    originalname: req.file.originalname,
                    mimetype: req.file.mimetype,
                    size: req.file.size
                }
            }
        });

    } catch (error) {
        console.error('❌ Errore test upload:', error);
        res.status(500).json({
            success: false,
            error: 'Errore nel test upload: ' + error.message
        });
    }
});

module.exports = router;