// #####################################################################
// # Rotte Amministrazione S3 e Storage - Opero Mail System
// # File: opero/routes/admin-s3.js
// #####################################################################

const express = require('express');
const { verifyToken } = require('../utils/auth');
const s3Service = require('../services/s3Service');
const cleanupService = require('../services/cleanupService');
const { dbPool } = require('../config/db');

const router = express.Router();

// Tutte le route richiedono autenticazione e permessi admin
router.use(verifyToken);

/**
 * Middleware per controllo permessi admin
 */
const requireAdmin = (req, res, next) => {
    const { livello } = req.user;
    if (livello < 90) {
        return res.status(403).json({
            success: false,
            message: 'Permessi insufficienti. Richiesto livello admin (90+).'
        });
    }
    next();
};

router.use(requireAdmin);

/**
 * GET /admin-s3/status
 * Stato del servizio S3
 */
router.get('/status', async (req, res) => {
    try {
        const s3Connected = await s3Service.testConnection();
        const cleanupStatus = cleanupService.getStatus();

        // Ottieni statistiche storage
        const [storageStats] = await dbPool.query(`
            SELECT
                COUNT(*) as total_attachments,
                COUNT(CASE WHEN percorso_file_salvato LIKE 'mail-attachments/%' THEN 1 END) as s3_attachments,
                COUNT(CASE WHEN percorso_file_salvato NOT LIKE 'mail-attachments/%' THEN 1 END) as local_attachments,
                SUM(COALESCE(dimensione_file, 0)) as total_size_bytes,
                COUNT(CASE WHEN scaricato = 1 THEN 1 END) as downloaded_attachments
            FROM allegati_tracciati at
            JOIN email_inviate ei ON at.id_email_inviata = ei.id
            WHERE ei.id_ditta = ?
        `, [req.user.id_ditta]);

        res.json({
            success: true,
            data: {
                s3_connection: {
                    connected: s3Connected,
                    bucket: s3Service.bucket,
                    endpoint: process.env.ARUBA_S3_ENDPOINT
                },
                cleanup_service: cleanupStatus,
                storage_stats: storageStats[0]
            }
        });

    } catch (error) {
        console.error('Errore recupero status S3:', error);
        res.status(500).json({
            success: false,
            message: 'Errore nel recupero dello stato del servizio S3'
        });
    }
});

/**
 * POST /admin-s3/test-connection
 * Test connessione S3
 */
router.post('/test-connection', async (req, res) => {
    try {
        const result = await s3Service.testConnection();

        res.json({
            success: true,
            data: {
                connected: result,
                timestamp: new Date().toISOString(),
                bucket: s3Service.bucket,
                region: s3Service.region
            }
        });

    } catch (error) {
        console.error('Errore test connessione S3:', error);
        res.status(500).json({
            success: false,
            message: 'Test connessione S3 fallito',
            error: error.message
        });
    }
});

/**
 * GET /admin-s3/files
 * Lista file su S3 con paginazione e filtri
 */
router.get('/files', async (req, res) => {
    try {
        const {
            prefix,
            limit = 100,
            page = 1,
            older_than_days
        } = req.query;

        const effectiveLimit = Math.min(parseInt(limit), 1000);
        const offset = (parseInt(page) - 1) * effectiveLimit;

        // Costruisci il prefisso base per la ditta corrente
        const basePrefix = prefix || `mail-attachments/${req.user.id_ditta}`;

        // Lista file da S3
        const s3Files = await s3Service.listFiles(basePrefix, effectiveLimit + 50);

        // Applica filtri e paginazione
        let filteredFiles = s3Files;

        if (older_than_days) {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - parseInt(older_than_days));
            filteredFiles = s3Files.filter(file => file.lastModified < cutoffDate);
        }

        // Paginazione
        const paginatedFiles = filteredFiles.slice(offset, offset + effectiveLimit);

        // Arricchisci con informazioni dal database
        const filesWithDbInfo = [];
        for (const file of paginatedFiles) {
            const [dbInfo] = await dbPool.query(`
                SELECT
                    at.nome_file_originale,
                    at.scaricato,
                    at.download_count,
                    at.data_primo_download,
                    at.id_email_inviata,
                    ei.destinatari,
                    ei.oggetto,
                    ei.data_invio
                FROM allegati_tracciati at
                JOIN email_inviate ei ON at.id_email_inviata = ei.id
                WHERE at.percorso_file_salvato = ?
                LIMIT 1
            `, [file.key]);

            filesWithDbInfo.push({
                s3_info: file,
                db_info: dbInfo.length > 0 ? dbInfo[0] : null
            });
        }

        res.json({
            success: true,
            data: {
                files: filesWithDbInfo,
                pagination: {
                    page: parseInt(page),
                    limit: effectiveLimit,
                    total: filteredFiles.length,
                    pages: Math.ceil(filteredFiles.length / effectiveLimit)
                }
            }
        });

    } catch (error) {
        console.error('Errore lista file S3:', error);
        res.status(500).json({
            success: false,
            message: 'Errore nel recupero della lista file'
        });
    }
});

/**
 * DELETE /admin-s3/files/:s3Key
 * Elimina un file specifico da S3
 */
router.delete('/files/:s3Key(*)', async (req, res) => {
    try {
        const { s3Key } = req.params;

        // Decodifica URL-encoded key
        const decodedKey = decodeURIComponent(s3Key);

        // Verifica se il file è associato a un allegato nel database
        const [attachmentInfo] = await dbPool.query(`
            SELECT id, nome_file_originale, id_email_inviata
            FROM allegati_tracciati
            WHERE percorso_file_salvato = ?
        `, [decodedKey]);

        if (attachmentInfo.length > 0) {
            const attachment = attachmentInfo[0];

            // Elimina file S3
            const deleted = await s3Service.deleteFile(decodedKey);

            if (deleted) {
                // Elimina record database
                await dbPool.query('DELETE FROM allegati_tracciati WHERE id = ?', [attachment.id]);

                res.json({
                    success: true,
                    message: `File "${attachment.nome_file_originale}" eliminato con successo`,
                    data: {
                        s3_key: decodedKey,
                        attachment_id: attachment.id,
                        email_id: attachment.id_email_inviata
                    }
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Errore durante l\'eliminazione del file da S3'
                });
            }
        } else {
            // File non trovato nel database ma elimina comunque da S3 se esiste
            const deleted = await s3Service.deleteFile(decodedKey);

            if (deleted) {
                res.json({
                    success: true,
                    message: `File S3 eliminato (non trovato nel database)`,
                    data: { s3_key: decodedKey }
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: 'File non trovato su S3'
                });
            }
        }

    } catch (error) {
        console.error('Errore eliminazione file S3:', error);
        res.status(500).json({
            success: false,
            message: 'Errore durante l\'eliminazione del file',
            error: error.message
        });
    }
});

/**
 * POST /admin-s3/cleanup
 * Esegue pulizia manuale
 */
router.post('/cleanup', async (req, res) => {
    try {
        const {
            s3_days_old = 365,
            local_days_old = 365,
            db_days_old = 180,
            tracking_days_old = 1095
        } = req.body;

        // Esegui pulizia manuale
        const result = await cleanupService.performManualCleanup({
            s3DaysOld: s3_days_old,
            localDaysOld: local_days_old,
            dbDaysOld: db_days_old,
            trackingDaysOld: tracking_days_old
        });

        res.json({
            success: true,
            message: 'Pulizia manuale completata con successo',
            data: {
                duration: result.duration,
                results: result.results,
                parameters: {
                    s3_days_old,
                    local_days_old,
                    db_days_old,
                    tracking_days_old
                }
            }
        });

    } catch (error) {
        console.error('Errore pulizia manuale:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Errore durante la pulizia manuale'
        });
    }
});

/**
 * GET /admin-s3/cleanup-stats
 * Statistiche delle pulizie precedenti
 */
router.get('/cleanup-stats', async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const stats = await cleanupService.getCleanupStats(parseInt(days));

        res.json({
            success: true,
            data: {
                stats: stats,
                total_cleanup_runs: stats.length,
                last_cleanup: stats.length > 0 ? stats[0].cleanup_date : null
            }
        });

    } catch (error) {
        console.error('Errore recupero statistiche pulizia:', error);
        res.status(500).json({
            success: false,
            message: 'Errore nel recupero delle statistiche di pulizia'
        });
    }
});

/**
 * GET /admin-s3/storage-analytics
 * Analisi dettagliata dello storage
 */
router.get('/storage-analytics', async (req, res) => {
    try {
        const { id_ditta } = req.user;

        // Statistiche generali
        const [generalStats] = await dbPool.query(`
            SELECT
                COUNT(DISTINCT at.id) as total_attachments,
                COUNT(DISTINCT CASE WHEN at.scaricato = 1 THEN at.id END) as downloaded_attachments,
                COUNT(DISTINCT CASE WHEN at.scaricato = 0 THEN at.id END) as pending_attachments,
                SUM(COALESCE(at.dimensione_file, 0)) as total_storage_bytes,
                AVG(COALESCE(at.dimensione_file, 0)) as avg_file_size_bytes,
                MAX(COALESCE(at.dimensione_file, 0)) as max_file_size_bytes,
                MIN(COALESCE(at.dimensione_file, 0)) as min_file_size_bytes,
                SUM(COALESCE(at.download_count, 0)) as total_downloads
            FROM allegati_tracciati at
            JOIN email_inviate ei ON at.id_email_inviata = ei.id
            WHERE ei.id_ditta = ?
        `, [id_ditta]);

        // Statistiche per mese
        const [monthlyStats] = await dbPool.query(`
            SELECT
                DATE_FORMAT(ei.data_invio, '%Y-%m') as month,
                COUNT(*) as attachments_count,
                SUM(COALESCE(at.dimensione_file, 0)) as storage_bytes,
                SUM(COALESCE(at.download_count, 0)) as downloads
            FROM allegati_tracciati at
            JOIN email_inviate ei ON at.id_email_inviata = ei.id
            WHERE ei.id_ditta = ?
                AND ei.data_invio >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(ei.data_invio, '%Y-%m')
            ORDER BY month DESC
        `, [id_ditta]);

        // Top file per dimensione
        const [topFiles] = await dbPool.query(`
            SELECT
                at.nome_file_originale,
                at.dimensione_file,
                at.download_count,
                ei.data_invio,
                ei.destinatari
            FROM allegati_tracciati at
            JOIN email_inviate ei ON at.id_email_inviata = ei.id
            WHERE ei.id_ditta = ?
                AND at.dimensione_file > 0
            ORDER BY at.dimensione_file DESC
            LIMIT 10
        `, [id_ditta]);

        // File mai scaricati
        const [undownloadedFiles] = await dbPool.query(`
            SELECT
                COUNT(*) as count,
                SUM(COALESCE(at.dimensione_file, 0)) as storage_wasted_bytes
            FROM allegati_tracciati at
            JOIN email_inviate ei ON at.id_email_inviata = ei.id
            WHERE ei.id_ditta = ?
                AND at.scaricato = 0
                AND ei.data_invio < DATE_SUB(NOW(), INTERVAL 30 DAY)
        `, [id_ditta]);

        res.json({
            success: true,
            data: {
                general: generalStats[0],
                monthly: monthlyStats,
                top_files: topFiles,
                undownloaded: undownloadedFiles[0],
                storage_efficiency: {
                    downloaded_percentage: generalStats[0].total_attachments > 0
                        ? Math.round((generalStats[0].downloaded_attachments / generalStats[0].total_attachments) * 100)
                        : 0,
                    wasted_storage_percentage: undownloadedFiles[0].storage_wasted_bytes > 0 && generalStats[0].total_storage_bytes > 0
                        ? Math.round((undownloadedFiles[0].storage_wasted_bytes / generalStats[0].total_storage_bytes) * 100)
                        : 0
                }
            }
        });

    } catch (error) {
        console.error('Errore analisi storage:', error);
        res.status(500).json({
            success: false,
            message: 'Errore nell\'analisi dello storage'
        });
    }
});

module.exports = router;