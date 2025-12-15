/**
 * Migrazione per la creazione e aggiornamento della tabella 'allegati_tracciati'.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    // Controlla se la tabella esiste
    const tableExists = await knex.schema.hasTable('allegati_tracciati');

    if (!tableExists) {
        // Se non esiste, creala completa
        console.log('📋 Tabella "allegati_tracciati" non trovata. Creazione in corso...');
        return knex.schema.createTable('allegati_tracciati', function(table) {
            table.increments('id').primary();
            table.integer('id_email_inviata').unsigned().notNullable();
            table.string('nome_file_originale', 255).notNullable();
            table.string('percorso_file_salvato', 255).notNullable();
            table.string('tipo_file', 100).nullable();
            table.integer('dimensione_file').unsigned().nullable();
            table.string('download_id', 255).notNullable().unique();
            table.tinyint('scaricato').notNullable().defaultTo(0);
            table.timestamp('data_primo_download').nullable();
            table.integer('download_count').unsigned().notNullable().defaultTo(0);
            table.timestamp('ultimo_download').nullable();
            table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

            // Definisci la chiave esterna
            table.foreign('id_email_inviata').references('id').inTable('email_inviate').onDelete('CASCADE');
        });
        console.log('✅ Tabella "allegati_tracciati" creata con successo.');

    } else {
        // Se esiste, aggiungi solo le colonne mancanti
        console.log('📋 Tabella "allegati_tracciati" trovata. Verifica colonne mancanti...');
        
        const hasDownloadCount = await knex.schema.hasColumn('allegati_tracciati', 'download_count');
        if (!hasDownloadCount) {
            console.log('➕ Aggiunta colonna "download_count"...');
            await knex.schema.table('allegati_tracciati', function(table) {
                table.integer('download_count').unsigned().notNullable().defaultTo(0).after('data_primo_download');
            });
        }

        const hasUltimoDownload = await knex.schema.hasColumn('allegati_tracciati', 'ultimo_download');
        if (!hasUltimoDownload) {
            console.log('➕ Aggiunta colonna "ultimo_download"...');
            await knex.schema.table('allegati_tracciati', function(table) {
                table.timestamp('ultimo_download').nullable().after('download_count');
            });
        }

        const hasCreatedAt = await knex.schema.hasColumn('allegati_tracciati', 'created_at');
        if (!hasCreatedAt) {
            console.log('➕ Aggiunta colonna "created_at"...');
            await knex.schema.table('allegati_tracciati', function(table) {
                table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
            });
        }
        
        console.log('✅ Verifica colonne completata.');
    }
};

/**
 * Annulla la migrazione: droppa la tabella 'allegati_tracciati'.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    console.log('🗑️ Rollback: rimozione della tabella "allegati_tracciati"...');
    return knex.schema.dropTable('allegati_tracciati');
};