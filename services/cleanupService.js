// #####################################################################
// # Servizio Pulizia Automatica File S3 - Opero Mail System
// # File: opero/services/cleanupService.js
// #####################################################################

const { dbPool } = require('../config/db');
const s3Service = require('./s3Service');
const cron = require('node-cron');

class CleanupService {
    constructor() {
        this.isRunning = false;
        this.lastCleanup = null;
        this.setupScheduledJobs();
    }

    /**
     * Configura i job schedulati per la pulizia automatica
     */
    setupScheduledJobs() {
        // Pulizia file obsoleti ogni giorno alle 2:00 AM
        cron.schedule('0 2 * * *', async () => {
            console.log('[CleanupService] Avvio pulizia automatica giornaliera');
            await this.performScheduledCleanup();
        });

        // Pulizia tracking logs vecchi ogni domenica alle 3:00 AM
        cron.schedule('0 3 * * 0', async () => {
            console.log('[CleanupService] Pulizia logs tracking settimanale');
            await this.cleanupTrackingLogs();
        });

        console.log('[CleanupService] Job schedulati configurati');
    }

    /**
     * Esegue la pulizia programmata
     */
    async performScheduledCleanup() {
        if (this.isRunning) {
            console.log('[CleanupService] Pulizia già in esecuzione, skip');
            return;
        }

        this.isRunning = true;
        const startTime = Date.now();

        try {
            const results = {
                s3FilesDeleted: 0,
                localFilesDeleted: 0,
                dbRecordsDeleted: 0,
                trackingLogsDeleted: 0
            };

            // 1. Pulizia file S3 obsoleti
            const s3Deleted = await this.cleanupObsoleteS3Files();
            results.s3FilesDeleted = s3Deleted;

            // 2. Pulizia file locali obsoleti
            const localDeleted = await this.cleanupObsoleteLocalFiles();
            results.localFilesDeleted = localDeleted;

            // 3. Pulizia record database orfani
            const dbDeleted = await this.cleanupOrphanedRecords();
            results.dbRecordsDeleted = dbDeleted;

            // 4. Pulizia tracking logs molto vecchi
            const trackingDeleted = await this.cleanupOldTrackingLogs();
            results.trackingLogsDeleted = trackingDeleted;

            const duration = Date.now() - startTime;
            this.lastCleanup = new Date();

            console.log(`[CleanupService] Pulizia completata in ${duration}ms:`, results);

            // Salva statistiche pulizia
            await this.saveCleanupStats(results);

        } catch (error) {
            console.error('[CleanupService] Errore durante pulizia automatica:', error);
        } finally {
            this.isRunning = false;
        }
    }

    /**
     * Pulizia file S3 obsoleti
     */
    async cleanupObsoleteS3Files() {
        try {
            // File più vecchi di 1 anno (365 giorni)
            const deletedCount = await s3Service.cleanupOldFiles(365);
            console.log(`[CleanupService] Eliminati ${deletedCount} file S3 obsoleti`);
            return deletedCount;
        } catch (error) {
            console.error('[CleanupService] Errore pulizia S3:', error);
            return 0;
        }
    }

    /**
     * Pulizia file locali obsoleti
     */
    async cleanupObsoleteLocalFiles() {
        const fs = require('fs');
        const path = require('path');
        const uploadsDir = path.join(__dirname, '..', 'uploads');

        let deletedCount = 0;
        const cutoffDate = new Date();
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 1); // 1 anno fa

        try {
            if (!fs.existsSync(uploadsDir)) {
                return 0;
            }

            const files = fs.readdirSync(uploadsDir);

            for (const file of files) {
                const filePath = path.join(uploadsDir, file);
                const stats = fs.statSync(filePath);

                if (stats.isFile() && stats.mtime < cutoffDate) {
                    try {
                        fs.unlinkSync(filePath);
                        deletedCount++;
                    } catch (deleteError) {
                        console.error(`[CleanupService] Errore eliminazione file ${filePath}:`, deleteError);
                    }
                }
            }

            console.log(`[CleanupService] Eliminati ${deletedCount} file locali obsoleti`);
            return deletedCount;

        } catch (error) {
            console.error('[CleanupService] Errore pulizia file locali:', error);
            return 0;
        }
    }

    /**
     * Pulizia record database orfani
     */
    async cleanupOrphanedRecords() {
        let deletedCount = 0;

        try {
            // Elimina record allegati senza email associata
            const [orphanedAttachments] = await dbPool.query(`
                SELECT at.id, at.percorso_file_salvato
                FROM allegati_tracciati at
                LEFT JOIN email_inviate ei ON at.id_email_inviata = ei.id
                WHERE ei.id IS NULL AND at.created_at < DATE_SUB(NOW(), INTERVAL 6 MONTH)
            `);

            for (const attachment of orphanedAttachments) {
                try {
                    // Elimina file S3 se presente
                    if (attachment.percorso_file_salvato && attachment.percorso_file_salvato.startsWith('mail-attachments/')) {
                        await s3Service.deleteFile(attachment.percorso_file_salvato);
                    }

                    // Elimina record database
                    await dbPool.query('DELETE FROM allegati_tracciati WHERE id = ?', [attachment.id]);
                    deletedCount++;

                } catch (error) {
                    console.error(`[CleanupService] Errore eliminazione allegato orfano ${attachment.id}:`, error);
                }
            }

            // Elimina record download tracking vecchi (2 anni)
            const [downloadTrackingResult] = await dbPool.query(`
                DELETE FROM download_tracking
                WHERE timestamp < DATE_SUB(NOW(), INTERVAL 2 YEAR)
            `);
            deletedCount += downloadTrackingResult.affectedRows;

            console.log(`[CleanupService] Eliminati ${deletedCount} record database orfani`);
            return deletedCount;

        } catch (error) {
            console.error('[CleanupService] Errore pulizia record database:', error);
            return 0;
        }
    }

    /**
     * Pulizia tracking logs molto vecchi
     */
    async cleanupOldTrackingLogs() {
        try {
            // Elimina email open tracking più vecchi di 3 anni
            const [openTrackingResult] = await dbPool.query(`
                DELETE FROM email_open_tracking
                WHERE opened_at < DATE_SUB(NOW(), INTERVAL 3 YEAR)
            `);

            console.log(`[CleanupService] Eliminati ${openTrackingResult.affectedRows} record email_open_tracking`);
            return openTrackingResult.affectedRows;

        } catch (error) {
            console.error('[CleanupService] Errore pulizia tracking logs:', error);
            return 0;
        }
    }

    /**
     * Pulizia completa tracking logs
     */
    async cleanupTrackingLogs() {
        const totalDeleted = await this.cleanupOldTrackingLogs();
        return totalDeleted;
    }

    /**
     * Salva statistiche della pulizia nel database
     */
    async saveCleanupStats(results) {
        try {
            await dbPool.query(`
                INSERT INTO cleanup_stats
                (cleanup_date, s3_files_deleted, local_files_deleted, db_records_deleted, tracking_logs_deleted, duration_ms)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [
                this.lastCleanup,
                results.s3FilesDeleted,
                results.localFilesDeleted,
                results.dbRecordsDeleted,
                results.trackingLogsDeleted,
                Date.now() - (this.lastCleanup?.getTime() || Date.now())
            ]);

        } catch (error) {
            console.error('[CleanupService] Errore salvataggio statistiche pulizia:', error);
        }
    }

    /**
     * Ottiene statistiche delle pulizie precedenti
     */
    async getCleanupStats(days = 30) {
        try {
            const [stats] = await dbPool.query(`
                SELECT
                    cleanup_date,
                    s3_files_deleted,
                    local_files_deleted,
                    db_records_deleted,
                    tracking_logs_deleted,
                    duration_ms
                FROM cleanup_stats
                WHERE cleanup_date >= DATE_SUB(NOW(), INTERVAL ? DAY)
                ORDER BY cleanup_date DESC
            `, [days]);

            return stats;

        } catch (error) {
            console.error('[CleanupService] Errore recupero statistiche pulizia:', error);
            return [];
        }
    }

    /**
     * Esegue pulizia manuale su richiesta
     */
    async performManualCleanup(options = {}) {
        const {
            s3DaysOld = 365,
            localDaysOld = 365,
            dbDaysOld = 180,
            trackingDaysOld = 1095 // 3 anni
        } = options;

        if (this.isRunning) {
            throw new Error('Pulizia già in esecuzione');
        }

        this.isRunning = true;
        const startTime = Date.now();

        try {
            const results = {
                s3FilesDeleted: 0,
                localFilesDeleted: 0,
                dbRecordsDeleted: 0,
                trackingLogsDeleted: 0
            };

            // Pulizia S3 con giorni personalizzati
            results.s3FilesDeleted = await s3Service.cleanupOldFiles(s3DaysOld);

            // Pulizia locale con giorni personalizzati
            // (Implementazione simile a cleanupObsoleteLocalFiles ma con giorni personalizzati)

            // Pulizia database con giorni personalizzati
            const [dbResult] = await dbPool.query(`
                DELETE FROM download_tracking
                WHERE timestamp < DATE_SUB(NOW(), INTERVAL ? DAY)
            `, [trackingDaysOld]);
            results.dbRecordsDeleted = dbResult.affectedRows;

            const duration = Date.now() - startTime;
            this.lastCleanup = new Date();

            console.log(`[CleanupService] Pulizia manuale completata in ${duration}ms:`, results);

            return {
                success: true,
                duration,
                results
            };

        } catch (error) {
            console.error('[CleanupService] Errore pulizia manuale:', error);
            throw error;
        } finally {
            this.isRunning = false;
        }
    }

    /**
     * Ottiene stato corrente del servizio
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            lastCleanup: this.lastCleanup,
            uptime: process.uptime()
        };
    }
}

// Esporta istanza singleton
module.exports = new CleanupService();