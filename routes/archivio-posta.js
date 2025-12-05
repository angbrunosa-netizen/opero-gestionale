/**
 * @file opero/routes/archivio-posta.js
 * @description Rotte per il modulo "Archivio Documentale Posta" - Gestione allegati email con privacy privata
 * @date 2025-12-04
 * @version 1.0
 */

const express = require('express');
const router = express.Router();
const { knex } = require('../config/db');
const { authenticate, checkPermission } = require('../utils/auth');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

// Configurazione S3
const {
    s3Client,
    GetObjectCommand,
    getSignedUrl,
    PutObjectCommand,
    S3_BUCKET_NAME,
    S3_ENDPOINT,
} = require('../utils/s3Client');

// Configurazione crittografia per download sicuri
const secret = process.env.ENCRYPTION_SECRET || 'default_secret_key_32_chars_!!';
const ENCRYPTION_KEY = crypto.createHash('sha256').update(String(secret)).digest('base64').substr(0, 32);
const IV_LENGTH = 16;

router.use(authenticate);

/**
 * Crittografa un ID per download sicuro
 */
function encryptDownloadId(id, userId, expiresAt) {
    const data = JSON.stringify({ id, userId, expiresAt });
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Decrittografa e verifica un ID di download
 */
function decryptDownloadId(encryptedData) {
    try {
        const textParts = encryptedData.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return JSON.parse(decrypted.toString());
    } catch (error) {
        throw new Error('ID download non valido');
    }
}

/**
 * API: GET /api/archivio-posta/allegati
 * Recupera tutti gli allegati della posta con privacy privata
 */
router.get('/allegati', checkPermission('DM_FILE_VIEW'), async (req, res) => {
    const idDitta = req.user?.id_ditta;
    const idUtente = req.user?.id;

    if (!idDitta) {
        return res.status(400).json({ error: 'Nessuna ditta selezionata.' });
    }

    try {
        // Recupera allegati email con controlli privacy
        const allegati = await knex('allegati_tracciati as at')
            .join('email_inviate as ei', 'at.id_email_inviata', 'ei.id')
            .leftJoin('utenti as u', 'ei.id_utente_mittente', 'u.id')
            .where('ei.id_utente_mittente', idUtente)
            .orWhere(function() {
                this.where('ei.id_ditta', idDitta);
            })
            .select(
                'at.id',
                'at.nome_file_originale',
                'at.dimensione_file',
                'at.percorso_file_salvato as s3_key',
                'at.created_at as data_creazione',
                'at.download_id',
                'ei.destinatari',
                'ei.oggetto',
                'ei.data_invio',
                knex.raw("CONCAT(u.nome, ' ', u.cognome) as mittente")
            )
            .orderBy('ei.data_invio', 'desc');

        // Genera URL download sicuri per ogni allegato
        for (const allegato of allegati) {
            // Crea ID download sicuro con scadenza 24 ore
            const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 ore
            const secureDownloadId = encryptDownloadId(allegato.id, idUtente, expiresAt);

            // Genera URL di download sicuro
            allegato.download_url = `/api/archivio-posta/download/${secureDownloadId}`;

            // Nasconde dati sensibili
            delete allegato.s3_key;
            delete allegato.download_id;
        }

        res.json({
            success: true,
            allegati: allegati,
            totali: allegati.length
        });

    } catch (error) {
        console.error("Errore nel recupero allegati posta:", error);
        res.status(500).json({ error: 'Impossibile recuperare gli allegati.' });
    }
});

/**
 * API: GET /api/archivio-posta/download/:encryptedId
 * Endpoint sicuro per download degli allegati con controllo autorizzazioni
 */
router.get('/download/:encryptedId', async (req, res) => {
    try {
        const { encryptedId } = req.params;
        const user = req.user;

        if (!user) {
            return res.status(401).json({ error: 'Autenticazione richiesta.' });
        }

        // Decrittografa e verifica l'ID
        const downloadData = decryptDownloadId(encryptedId);

        // Verifica scadenza
        if (Date.now() > downloadData.expiresAt) {
            return res.status(410).json({ error: 'Link di download scaduto.' });
        }

        // Verifica che l'utente sia autorizzato
        if (downloadData.userId !== user.id) {
            return res.status(403).json({ error: 'Non autorizzato al download di questo file.' });
        }

        // Recupera l'allegato dal database
        const [allegati] = await knex('allegati_tracciati')
            .where('id', downloadData.id)
            .select('*');

        if (allegati.length === 0) {
            return res.status(404).json({ error: 'Allegato non trovato.' });
        }

        const allegato = allegati[0];

        // Verifica che l'allegato appartenga all'azienda dell'utente
        const [emailCheck] = await knex('email_inviate')
            .where('id', allegato.id_email_inviata)
            .andWhere(function() {
                this.where('id_utente_mittente', user.id)
                    .orWhere('id_ditta', user.id_ditta);
            });

        if (emailCheck.length === 0) {
            return res.status(403).json({ error: 'Non autorizzato ad accedere a questo allegato.' });
        }

        // Genera URL S3 firmato temporaneo (5 minuti)
        const command = new GetObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: allegato.percorso_file_salvato,
            ResponseContentDisposition: `attachment; filename="${allegato.nome_file_originale}"`
        });

        const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

        // Registra il download nel database
        await knex('allegati_tracciati')
            .where('id', allegato.id)
            .update({
                scaricato: true,
                data_download: knex.fn.now()
            });

        // Reindirizza al download S3
        res.redirect(downloadUrl);

    } catch (error) {
        console.error("Errore durante il download:", error);
        res.status(500).json({ error: 'Errore durante il download del file.' });
    }
});

/**
 * API: GET /api/archivio-posta/allegato/:id
 * Dettagli specifici di un allegato
 */
router.get('/allegato/:id', checkPermission('DM_FILE_VIEW'), async (req, res) => {
    const { id } = req.params;
    const idDitta = req.user?.id_ditta;
    const idUtente = req.user?.id;

    if (!idDitta) {
        return res.status(400).json({ error: 'Nessuna ditta selezionata.' });
    }

    try {
        const [allegati] = await knex('allegati_tracciati as at')
            .join('email_inviate as ei', 'at.id_email_inviata', 'ei.id')
            .leftJoin('utenti as u', 'ei.id_utente_mittente', 'u.id')
            .where('at.id', id)
            .where(function() {
                this.where('ei.id_utente_mittente', idUtente)
                    .orWhere('ei.id_ditta', idDitta);
            })
            .select(
                'at.id',
                'at.nome_file_originale',
                'at.dimensione_file',
                'at.data_creazione',
                'at.scaricato',
                'at.data_download',
                'ei.destinatari',
                'ei.oggetto',
                'ei.data_invio',
                knex.raw("CONCAT(u.nome, ' ', u.cognome) as mittente")
            );

        if (allegati.length === 0) {
            return res.status(404).json({ error: 'Allegato non trovato o non autorizzato.' });
        }

        // Genera URL download sicuro
        const expiresAt = Date.now() + (24 * 60 * 60 * 1000);
        const secureDownloadId = encryptDownloadId(allegati[0].id, idUtente, expiresAt);
        allegati[0].download_url = `/api/archivio-posta/download/${secureDownloadId}`;

        res.json({
            success: true,
            allegato: allegati[0]
        });

    } catch (error) {
        console.error("Errore nel recupero dettagli allegato:", error);
        res.status(500).json({ error: 'Impossibile recuperare i dettagli dell\'allegato.' });
    }
});

/**
 * API: DELETE /api/archivio-posta/allegato/:id
 * Elimina un allegato (solo se autore o admin)
 */
router.delete('/allegato/:id', checkPermission('DM_FILE_DELETE'), async (req, res) => {
    const { id } = req.params;
    const idUtente = req.user?.id;
    const idDitta = req.user?.id_ditta;
    const userLivello = req.user?.livello || 0;

    try {
        // Verifica che l'allegato appartenga all'utente o all'azienda
        const [allegati] = await knex('allegati_tracciati as at')
            .join('email_inviate as ei', 'at.id_email_inviata', 'ei.id')
            .where('at.id', id)
            .select(
                'at.percorso_file_salvato as s3_key',
                'ei.id_utente_mittente',
                'ei.id_ditta'
            );

        if (allegati.length === 0) {
            return res.status(404).json({ error: 'Allegato non trovato.' });
        }

        const allegato = allegati[0];

        // Controllo autorizzazioni
        const canDelete = allegato.id_utente_mittente === idUtente ||
                        (allegato.id_ditta === idDitta && userLivello >= 90);

        if (!canDelete) {
            return res.status(403).json({ error: 'Non autorizzato a eliminare questo allegato.' });
        }

        const trx = await knex.transaction();

        try {
            // Elimina da S3 se presente
            if (allegato.s3_key && !allegato.s3_key.includes('/uploads/')) {
                try {
                    const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
                    const deleteCommand = new DeleteObjectCommand({
                        Bucket: S3_BUCKET_NAME,
                        Key: allegato.s3_key
                    });
                    await s3Client.send(deleteCommand);
                } catch (s3Error) {
                    console.error('Errore eliminazione S3:', s3Error);
                    // Continua anche se S3 fallisce
                }
            }

            // Elimina il record dal database
            await trx('allegati_tracciati').where('id', id).del();

            await trx.commit();
            res.json({ success: true, message: 'Allegato eliminato con successo.' });

        } catch (error) {
            await trx.rollback();
            throw error;
        }

    } catch (error) {
        console.error("Errore nell'eliminazione dell'allegato:", error);
        res.status(500).json({ error: 'Impossibile eliminare l\'allegato.' });
    }
});

/**
 * API: GET /api/archivio-posta/statistiche
 * Statistiche sugli allegati della posta
 */
router.get('/statistiche', checkPermission('DM_FILE_VIEW'), async (req, res) => {
    const idDitta = req.user?.id_ditta;
    const idUtente = req.user?.id;

    if (!idDitta) {
        return res.status(400).json({ error: 'Nessuna ditta selezionata.' });
    }

    try {
        const stats = await knex('allegati_tracciati as at')
            .join('email_inviate as ei', 'at.id_email_inviata', 'ei.id')
            .where(function() {
                this.where('ei.id_utente_mittente', idUtente)
                    .orWhere('ei.id_ditta', idDitta);
            })
            .select(
                knex.raw('COUNT(*) as totale_allegati'),
                knex.raw('SUM(at.dimensione_file) as dimensione_totale'),
                knex.raw('COUNT(CASE WHEN at.scaricato = 1 THEN 1 END) as allegati_scaricati'),
                knex.raw('AVG(at.dimensione_file) as dimensione_media')
            );

        const recenti = await knex('allegati_tracciati as at')
            .join('email_inviate as ei', 'at.id_email_inviata', 'ei.id')
            .where(function() {
                this.where('ei.id_utente_mittente', idUtente)
                    .orWhere('ei.id_ditta', idDitta);
            })
            .andWhere('ei.data_invio', '>=', knex.raw('DATE_SUB(NOW(), INTERVAL 30 DAY)'))
            .count('* as count')
            .first();

        res.json({
            success: true,
            statistiche: {
                totali: stats.totale_allegati || 0,
                dimensioneTotale: stats.dimensione_totale || 0,
                scaricati: stats.allegati_scaricati || 0,
                dimensioneMedia: stats.dimensione_media || 0,
                recenti: recenti.count || 0
            }
        });

    } catch (error) {
        console.error("Errore nel recupero statistiche:", error);
        console.error("Stack trace:", error.stack);
        console.error("Query parameters - idDitta:", idDitta, "idUtente:", idUtente);
        res.status(500).json({ error: 'Impossibile recuperare le statistiche.', details: error.message });
    }
});

module.exports = router;