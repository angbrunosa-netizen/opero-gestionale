/**
 * Nome File: 20251222_create_web_page_revisions_table.js
 * Percorso: migrations/20251222_create_web_page_revisions_table.js
 * Data: 22/12/2025
 * Descrizione: Crea la tabella web_page_revisions per il versioning delle pagine
 */

exports.up = async function(knex) {
    console.log('🔧 Creazione tabella web_page_revisions...');

    await knex.schema.createTable('web_page_revisions', function(table) {
        table.increments('id').primary();

        // Foreign key alla pagina
        table.integer('id_page').unsigned().notNullable();
        table.foreign('id_page').references('id').inTable('web_pages').onDelete('CASCADE');

        // Foreign key all'utente che ha fatto la modifica
        table.integer('id_utente').unsigned().notNullable();
        table.foreign('id_utente').references('id').inTable('utenti').onDelete('CASCADE');

        // Contenuto della revisione (JSON con tutti i campi della pagina)
        table.text('contenuto').notNullable();

        // Motivo della revisione
        table.string('motivo_revision', 255).defaultTo('Aggiornamento automatico');

        // Timestamp della revisione
        table.timestamp('data_revision').defaultTo(knex.fn.now());

        // Indici per performance
        table.index(['id_page', 'data_revision'], 'idx_page_revision_date');
        table.index('id_utente', 'idx_user_revisions');
    });

    console.log('✅ Tabella web_page_revisions creata con successo!');
};

exports.down = async function(knex) {
    console.log('⏪ Rimozione tabella web_page_revisions...');

    await knex.schema.dropTableIfExists('web_page_revisions');

    console.log('✅ Tabella web_page_revisions rimossa con successo!');
};