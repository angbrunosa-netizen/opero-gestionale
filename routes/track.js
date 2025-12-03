// #####################################################################
// # Rotte Tracking Download Allegati con S3 - Opero Mail System
// # File: opero/routes/track.js
// #####################################################################

const express = require('express');
const path = require('path');
const fs = require('fs');
const { verifyToken } = require('../utils/auth');
const knex = require('../config/db');
const { dbPool } = require('../config/db');
const s3Service = require('../services/s3Service');
const router = express.Router();


/**
 * Middleware per logging delle richieste di tracking
 */
router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] Tracking request: ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
    next();
});

/**
 * GET /track/open/:trackingId
 * Tracking pixel per apertura email
 */
router.get('/open/:trackingId', async (req, res) => {
    const { trackingId } = req.params;
    const userAgent = req.get('User-Agent') || 'Unknown';
    const ip = req.ip || req.connection.remoteAddress;

    try {
        // Registra apertura email
        await dbPool.query(`
            INSERT INTO email_open_tracking (tracking_id, ip_address, user_agent, opened_at)
            VALUES (?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE opened_at = IF(opened_at IS NULL, NOW(), opened_at), open_count = open_count + 1
        `, [trackingId, ip, userAgent]);

        // Aggiorna stato email inviata
        await dbPool.query(`
            UPDATE email_inviate
            SET aperta = 1, data_prima_apertura = IF(data_prima_apertura IS NULL, NOW(), data_prima_apertura), open_count = COALESCE(open_count, 0) + 1
            WHERE tracking_id = ?
        `, [trackingId]);

        // Restituisci pixel trasparente 1x1
        const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
        res.writeHead(200, {
            'Content-Type': 'image/gif',
            'Content-Length': pixel.length,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
        res.end(pixel);

    } catch (error) {
        console.error('Errore tracking apertura email:', error);
        // Restituisci comunque il pixel per non mostrare errori nell'email
        const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
        res.writeHead(200, {
            'Content-Type': 'image/gif',
            'Content-Length': pixel.length
        });
        res.end(pixel);
    }
});


/**
 * GET /track/download/:downloadId
 * Endpoint di tracking per download allegati con supporto S3
 */
router.get('/download/:downloadId', async (req, res) => {
    const { downloadId } = req.params;
    const userAgent = req.get('User-Agent') || 'Unknown';
    const ip = req.ip || req.connection.remoteAddress;

    try {
        // Cerca l'allegato nel database
        const [attachmentRows] = await dbPool.query(`
            SELECT
                at.id,
                at.nome_file_originale,
                at.percorso_file_salvato,
                at.download_id,
                at.dimensione_file,
                at.scaricato,
                at.data_primo_download,
                ei.id_ditta,
                ei.data_invio,
                u.nome as utente_creazione,
                ei.destinatari
            FROM allegati_tracciati at
            JOIN email_inviate ei ON at.id_email_inviata = ei.id
            LEFT JOIN utenti u ON ei.id_utente_mittente = u.id
            WHERE at.download_id = ?
        `, [downloadId]);

        if (attachmentRows.length === 0) {
            return res.status(404).send(`
                <!DOCTYPE html>
                <html>
                <head><title>Link non valido</title></head>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                    <h1>🔗 Link non valido</h1>
                    <p>Il link per il download dell'allegato non è valido o è scaduto.</p>
                    <p>Contatta il mittente per richiedere un nuovo link.</p>
                </body>
                </html>
            `);
        }

        const attachment = attachmentRows[0];

        // Registra il tracking del download
        const trackingData = {
            download_id: downloadId,
            ip_address: ip,
            user_agent: userAgent,
            timestamp: new Date(),
            referer: req.get('Referer') || null
        };

        // Inserisci record di tracking
        await dbPool.query(`
            INSERT INTO download_tracking (download_id, ip_address, user_agent, timestamp, referer)
            VALUES (?, ?, ?, ?, ?)
        `, [trackingData.download_id, trackingData.ip_address, trackingData.user_agent, trackingData.timestamp, trackingData.referer]);

        // Aggiorna stato scaricato se è il primo download
        if (!attachment.scaricato) {
            await dbPool.query(`
                UPDATE allegati_tracciati
                SET scaricato = 1, data_primo_download = NOW(), download_count = COALESCE(download_count, 0) + 1
                WHERE download_id = ?
            `, [downloadId]);
        } else {
            // Incrementa contatore download
            await dbPool.query(`
                UPDATE allegati_tracciati
                SET download_count = COALESCE(download_count, 0) + 1, ultimo_download = NOW()
                WHERE download_id = ?
            `, [downloadId]);
        }

        const filePath = attachment.percorso_file_salvato;

        // Verifica se il file è su S3 o locale
        if (filePath.startsWith('mail-attachments/') || filePath.includes('/')) {
            // File su S3
            try {
                const signedUrl = await s3Service.getSignedDownloadUrl(filePath, 3600); // 1 ora di validità

                // Reindirizza al URL S3 firmato
                res.redirect(signedUrl);

                // Log del download S3
                console.log(`S3 Download tracked: ${attachment.nome_file_originale} by ${trackingData.ip_address}`);

            } catch (s3Error) {
                console.error('Errore generazione URL S3:', s3Error);
                res.status(500).send(`
                    <!DOCTYPE html>
                    <html>
                    <head><title>Errore Download</title></head>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                        <h1>❌ Errore nel download</h1>
                        <p>Si è verificato un errore durante il recupero del file.</p>
                        <p>Riprova più tardi o contatta il supporto.</p>
                    </body>
                    </html>
                `);
            }

        } else {
            // File locale (fallback)
            try {
                if (!fs.existsSync(filePath)) {
                    return res.status(404).send(`
                        <!DOCTYPE html>
                        <html>
                        <head><title>File non trovato</title></head>
                        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                            <h1>📁 File non trovato</h1>
                            <p>Il file richiesto non è disponibile sul server.</p>
                            <p>Contatta il mittente per richiedere il file.</p>
                        </body>
                        </html>
                    `);
                }

                // Imposta headers per il download
                res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(attachment.nome_file_originale)}"`);
                res.setHeader('Content-Type', 'application/octet-stream');
                res.setHeader('Content-Length', attachment.dimensione_file || fs.statSync(filePath).size);

                // Stream del file
                const fileStream = fs.createReadStream(filePath);
                fileStream.pipe(res);

                fileStream.on('end', () => {
                    console.log(`Local file download tracked: ${attachment.nome_file_originale} by ${trackingData.ip_address}`);
                });

                fileStream.on('error', (error) => {
                    console.error('Errore streaming file locale:', error);
                    if (!res.headersSent) {
                        res.status(500).send('Errore durante il download del file');
                    }
                });

            } catch (localError) {
                console.error('Errore download file locale:', localError);
                res.status(500).send(`
                    <!DOCTYPE html>
                    <html>
                    <head><title>Errore Download</title></head>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                        <h1>❌ Errore nel download</h1>
                        <p>Si è verificato un errore durante il recupero del file.</p>
                    </body>
                    </html>
                `);
            }
        }

    } catch (error) {
        console.error('Errore generico tracking download:', error);
        res.status(500).send(`
            <!DOCTYPE html>
            <html>
            <head><title>Errore Server</title></head>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                <h1>🚫 Errore del server</h1>
                <p>Si è verificato un errore durante l'elaborazione della richiesta.</p>
            </body>
            </html>
        `);
    }
});

/**
 * GET /track/stats/:downloadId
 * API per ottenere statistiche download di un allegato
 */
router.get('/stats/:downloadId', async (req, res) => {
    const { downloadId } = req.params;

    try {
        // Ottieni statistiche download
        const [statsRows] = await dbPool.query(`
            SELECT
                COUNT(*) as total_downloads,
                MIN(timestamp) as first_download,
                MAX(timestamp) as last_download,
                COUNT(DISTINCT ip_address) as unique_ips
            FROM download_tracking
            WHERE download_id = ?
        `, [downloadId]);

        // Ottieni dettagli allegato
        const [attachmentRows] = await dbPool.query(`
            SELECT
                nome_file_originale,
                dimensione_file,
                scaricato,
                data_primo_download,
                COALESCE(download_count, 0) as db_download_count
            FROM allegati_tracciati
            WHERE download_id = ?
        `, [downloadId]);

        if (attachmentRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Allegato non trovato' });
        }

        const stats = statsRows[0];
        const attachment = attachmentRows[0];

        res.json({
            success: true,
            data: {
                file_name: attachment.nome_file_originale,
                file_size: attachment.dimensione_file,
                first_downloaded: attachment.data_primo_download,
                total_downloads: Math.max(stats.total_downloads, attachment.db_download_count || 0),
                unique_downloaders: stats.unique_ips,
                first_download_time: stats.first_download,
                last_download_time: stats.last_download
            }
        });

    } catch (error) {
        console.error('Errore recupero statistiche download:', error);
        res.status(500).json({ success: false, message: 'Errore nel recupero statistiche' });
    }
});

/**
 * GET /track/admin/email-stats (protetta)
 * API per statistiche email tracking
 */
router.get('/admin/email-stats', verifyToken, async (req, res) => {
    const { id: userId, id_ditta: dittaId, livello } = req.user;

    // Solo amministratori possono vedere statistiche complete
    if (livello < 80) {
        return res.status(403).json({ success: false, message: 'Permessi insufficienti' });
    }

    try {
        const [emailStats] = await dbPool.query(`
            SELECT
                COUNT(*) as total_emails,
                COUNT(CASE WHEN aperta = 1 THEN 1 END) as opened_emails,
                COUNT(CASE WHEN data_prima_apertura IS NOT NULL THEN 1 END) as emails_with_first_open,
                AVG(CASE WHEN aperta = 1 AND DATEDIFF(data_prima_apertura, data_invio) >= 0
                    THEN DATEDIFF(data_prima_apertura, data_invio) END) as avg_days_to_open
            FROM email_inviate
            WHERE id_utente_mittente = ? OR ? = 100
        `, [userId, livello]);

        const [attachmentStats] = await dbPool.query(`
            SELECT
                COUNT(*) as total_attachments,
                COUNT(CASE WHEN scaricato = 1 THEN 1 END) as downloaded_attachments,
                SUM(COALESCE(download_count, 0)) as total_downloads,
                COUNT(CASE WHEN dimensione_file > 0 THEN dimensione_file END) as total_file_size
            FROM allegati_tracciati at
            JOIN email_inviate ei ON at.id_email_inviata = ei.id
            WHERE ei.id_utente_mittente = ? OR ? = 100
        `, [userId, livello]);

        res.json({
            success: true,
            data: {
                emails: emailStats[0],
                attachments: {
                    ...attachmentStats[0],
                    avg_file_size: attachmentStats[0].total_file_size > 0 && attachmentStats[0].total_attachments > 0
                        ? Math.round(attachmentStats[0].total_file_size / attachmentStats[0].total_attachments / 1024) // KB
                        : 0
                }
            }
        });

    } catch (error) {
        console.error('Errore recupero statistiche admin:', error);
        res.status(500).json({ success: false, message: 'Errore nel recupero statistiche' });
    }
});

// --- ROTTA PER REGISTRARE UN'AZIONE UTENTE ---
router.post('/log-action', verifyToken, async (req, res) => {
    const { azione, dettagli, modulo, funzione } = req.body;
    const id_utente = req.user.id;
    const id_ditta = req.user.id_ditta;

    if (!azione) {
        return res.status(400).json({ success: false, message: 'Il campo "azione" è obbligatorio.' });
    }

    try {
        await knex('log_azioni').insert({
            id_utente: id_utente,
            id_ditta: id_ditta,
            azione: azione,
            dettagli: dettagli || '',
            modulo: modulo || null,
            funzione: funzione || null
            // 'timestamp' di solito viene gestito automaticamente dal DB (DEFAULT CURRENT_TIMESTAMP)
        });
        res.status(200).json({ success: true, message: 'Azione registrata.' });
    } catch (error) {
        const sqlError = error.sqlMessage ? ` (SQL: ${error.sqlMessage})` : '';
        console.error(`[TRACK /log-action] Errore registrazione azione con knex:${sqlError}`, error.stack || error);
        res.status(500).json({ success: false, message: 'Errore interno del server durante la registrazione.' });
    }
});


module.exports = router;
