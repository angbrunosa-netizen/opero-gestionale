/**
 * Migrazione per tabelle tracking email e cleanup file S3 - v2.0 (Compatibilità MySQL 5.7/8.0)
 * File: migrations/20251203010000_email_tracking_enhancements.js
 * Modifiche: Sostituito SQL RAW con Knex Schema Builder per evitare errori "IF NOT EXISTS" su colonne.
 */

exports.up = async function(knex) {
    // 1. Tabella per tracking download dettagliato
    const hasDownloadTracking = await knex.schema.hasTable('download_tracking');
    if (!hasDownloadTracking) {
        await knex.schema.createTable('download_tracking', function(table) {
            table.increments('id').primary();
            table.string('download_id', 255).notNullable().index('idx_download_id');
            table.string('ip_address', 45).notNullable().index('idx_ip_address');
            table.text('user_agent');
            table.datetime('timestamp').notNullable().defaultTo(knex.fn.now()).index('idx_timestamp');
            table.string('referer', 500);
            table.charset('utf8mb4');
            table.collate('utf8mb4_unicode_ci');
        });
    }

    // 2. Tabella per tracking aperture email
    const hasEmailOpenTracking = await knex.schema.hasTable('email_open_tracking');
    if (!hasEmailOpenTracking) {
        await knex.schema.createTable('email_open_tracking', function(table) {
            table.increments('id').primary();
            table.string('tracking_id', 255).notNullable().unique().index('idx_tracking_id');
            table.string('ip_address', 45);
            table.text('user_agent');
            table.datetime('opened_at').index('idx_opened_at');
            table.integer('open_count').defaultTo(1);
            table.charset('utf8mb4');
            table.collate('utf8mb4_unicode_ci');
        });
    }

    // 3. Aggiorna tabella allegati_tracciati con nuovi campi (Controllo manuale per compatibilità)
    const tableAllegati = 'allegati_tracciati';
    if (await knex.schema.hasTable(tableAllegati)) {
        await knex.schema.alterTable(tableAllegati, async function(table) {
            const hasDownloadCount = await knex.schema.hasColumn(tableAllegati, 'download_count');
            if (!hasDownloadCount) table.integer('download_count').defaultTo(0);

            const hasUltimoDownload = await knex.schema.hasColumn(tableAllegati, 'ultimo_download');
            if (!hasUltimoDownload) table.datetime('ultimo_download').nullable();

            const hasCreatedAt = await knex.schema.hasColumn(tableAllegati, 'created_at');
            if (!hasCreatedAt) table.datetime('created_at').defaultTo(knex.fn.now());
        });
    }

    // 4. Aggiorna tabella email_inviate con campi tracking
    const tableEmail = 'email_inviate';
    if (await knex.schema.hasTable(tableEmail)) {
        await knex.schema.alterTable(tableEmail, async function(table) {
            const hasOpenCount = await knex.schema.hasColumn(tableEmail, 'open_count');
            if (!hasOpenCount) table.integer('open_count').defaultTo(0);

            const hasTrackingId = await knex.schema.hasColumn(tableEmail, 'tracking_id');
            if (!hasTrackingId) {
                table.string('tracking_id', 255).nullable().unique();
                table.index('tracking_id', 'idx_tracking_id'); // Aggiungi indice esplicitamente se la colonna è nuova
            }
        });
    }

    // 5. Tabella per statistiche pulizia
    const hasCleanupStats = await knex.schema.hasTable('cleanup_stats');
    if (!hasCleanupStats) {
        await knex.schema.createTable('cleanup_stats', function(table) {
            table.increments('id').primary();
            table.datetime('cleanup_date').notNullable().defaultTo(knex.fn.now()).index('idx_cleanup_date');
            table.integer('s3_files_deleted').defaultTo(0);
            table.integer('local_files_deleted').defaultTo(0);
            table.integer('db_records_deleted').defaultTo(0);
            table.integer('tracking_logs_deleted').defaultTo(0);
            table.integer('duration_ms').defaultTo(0);
            table.charset('utf8mb4');
            table.collate('utf8mb4_unicode_ci');
        });
    }

    console.log('✅ Migrazione tracking enhancements completata (Safe Mode)');
};

exports.down = async function(knex) {
    // Rimuovi le tabelle create
    await knex.schema.dropTableIfExists('download_tracking');
    await knex.schema.dropTableIfExists('email_open_tracking');
    await knex.schema.dropTableIfExists('cleanup_stats');

    // Rimuovi colonne aggiunte da allegati_tracciati
    const tableAllegati = 'allegati_tracciati';
    if (await knex.schema.hasTable(tableAllegati)) {
        await knex.schema.alterTable(tableAllegati, function(table) {
            table.dropColumn('download_count');
            table.dropColumn('ultimo_download');
            table.dropColumn('created_at');
        });
    }

    // Rimuovi colonne aggiunte da email_inviate
    const tableEmail = 'email_inviate';
    if (await knex.schema.hasTable(tableEmail)) {
        await knex.schema.alterTable(tableEmail, function(table) {
            table.dropColumn('open_count');
            // Nota: rimuovere la colonna rimuove anche l'indice associato
            table.dropColumn('tracking_id');
        });
    }

    console.log('✅ Rollback migrazione tracking enhancements completato');
};