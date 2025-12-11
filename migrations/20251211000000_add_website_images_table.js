/**
 * Migration: Tabella immagini_sito_web
 * Collegamenti tra siti web e immagini del sistema archivio
 */

exports.up = function(knex) {
  return knex.schema
    .createTable('immagini_sito_web', (table) => {
      table.increments('id').primary();
      table.integer('id_sito_web').unsigned().notNullable();
      table.integer('id_file').unsigned().notNullable();
      table.string('blocco_sezione', 50).default('content'); // es. 'header', 'gallery', 'content'
      table.timestamps(true, true);

      // Foreign keys
      table.foreign('id_sito_web').references('id').inTable('siti_web_aziendali').onDelete('CASCADE');
      table.foreign('id_file').references('id').inTable('dm_files').onDelete('CASCADE');

      // Indici
      table.index('id_sito_web');
      table.index('id_file');
      table.index(['id_sito_web', 'blocco_sezione']);
    });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('immagini_sito_web');
};