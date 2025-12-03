/**
 * Migrazione per tabelle tracking email e cleanup file S3
 * File: migrations/20251203010000_email_tracking_enhancements.js
 */

exports.up = async function(knex) {
    // Tabella per tracking download dettagliato
    await knex.raw(`
        CREATE TABLE IF NOT EXISTS download_tracking (
            id INT AUTO_INCREMENT PRIMARY KEY,
            download_id VARCHAR(255) NOT NULL,
            ip_address VARCHAR(45) NOT NULL,
            user_agent TEXT,
            timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            referer VARCHAR(500),
            INDEX idx_download_id (download_id),
            INDEX idx_timestamp (timestamp),
            INDEX idx_ip_address (ip_address)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Tabella per tracking aperture email
    await knex.raw(`
        CREATE TABLE IF NOT EXISTS email_open_tracking (
            id INT AUTO_INCREMENT PRIMARY KEY,
            tracking_id VARCHAR(255) NOT NULL UNIQUE,
            ip_address VARCHAR(45),
            user_agent TEXT,
            opened_at DATETIME,
            open_count INT DEFAULT 1,
            INDEX idx_tracking_id (tracking_id),
            INDEX idx_opened_at (opened_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Aggiorna tabella allegati_tracciati con nuovi campi
    await knex.raw(`
        ALTER TABLE allegati_tracciati
        ADD COLUMN IF NOT EXISTS download_count INT DEFAULT 0,
        ADD COLUMN IF NOT EXISTS ultimo_download DATETIME NULL,
        ADD COLUMN IF NOT EXISTS created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    `);

    // Aggiorna tabella email_inviate con campi tracking
    await knex.raw(`
        ALTER TABLE email_inviate
        ADD COLUMN IF NOT EXISTS open_count INT DEFAULT 0,
        ADD COLUMN IF NOT EXISTS tracking_id VARCHAR(255) UNIQUE,
        ADD INDEX idx_tracking_id (tracking_id)
    `);

    // Tabella per statistiche pulizia
    await knex.raw(`
        CREATE TABLE IF NOT EXISTS cleanup_stats (
            id INT AUTO_INCREMENT PRIMARY KEY,
            cleanup_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            s3_files_deleted INT DEFAULT 0,
            local_files_deleted INT DEFAULT 0,
            db_records_deleted INT DEFAULT 0,
            tracking_logs_deleted INT DEFAULT 0,
            duration_ms INT DEFAULT 0,
            INDEX idx_cleanup_date (cleanup_date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ Migrazione tracking enhancements completata');
};

exports.down = async function(knex) {
    // Rimuovi le tabelle create
    await knex.raw('DROP TABLE IF EXISTS download_tracking');
    await knex.raw('DROP TABLE IF EXISTS email_open_tracking');
    await knex.raw('DROP TABLE IF EXISTS cleanup_stats');

    // Rimuovi colonne aggiunte (con controllo esistenza)
    await knex.raw(`
        ALTER TABLE allegati_tracciati
        DROP COLUMN IF EXISTS download_count,
        DROP COLUMN IF EXISTS ultimo_download,
        DROP COLUMN IF EXISTS created_at
    `);

    await knex.raw(`
        ALTER TABLE email_inviate
        DROP COLUMN IF EXISTS open_count,
        DROP COLUMN IF EXISTS tracking_id
    `);

    // Rimuovi indici
    await knex.raw('ALTER TABLE email_inviate DROP INDEX IF EXISTS idx_tracking_id');

    console.log('✅ Rollback migrazione tracking enhancements completato');
};