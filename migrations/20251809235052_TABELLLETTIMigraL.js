// MODIFICATO: migrations/20250919001500_create_allegati_tracciati_table.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  // NUOVO: Crea la tabella per tracciare gli allegati inviati e i loro download.
  return knex.schema.createTable('allegati_tracciati', (table) => {
    table.increments('id').primary();

    // Foreign Key verso l'email inviata a cui questo allegato appartiene.
    // Assumiamo che email_inviate.id sia un INT standard (SIGNED).
    table.integer('id_email_inviata').notNullable();
    table.foreign('id_email_inviata').references('id').inTable('email_inviate').onDelete('CASCADE');

    table.string('nome_file_originale', 255).notNullable();
    table.string('percorso_file_salvato', 255).notNullable();

    // UUID univoco per generare il link di download sicuro.
    table.string('download_id', 36).notNullable().unique();

    // Campi per il tracciamento
    table.boolean('scaricato').notNullable().defaultTo(false);
    table.timestamp('data_primo_scaricamento').nullable();
    
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // Rimuove la tabella in caso di rollback.
  return knex.schema.dropTable('allegati_tracciati');
};