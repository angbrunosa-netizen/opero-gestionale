/**
 * Migration: Aggiunta colonna visibile_sito per sito web
 * Data: 2025-12-14
 * Scopo: Aggiungere colonna visibile_sito per gestire visibilità contenuti su sito web
 */

exports.up = function(knex) {
  return Promise.all([
    // Aggiunge visibile_sito a ct_catalogo
    knex.schema.alterTable('ct_catalogo', (table) => {
      table.boolean('visibile_sito').defaultTo(false).after('gestito_a_magazzino').comment('Visibile sul sito web aziendale');
      table.index('visibile_sito', 'idx_ct_catalogo_visibile_sito');
    }),
    // Aggiunge visibile_sito a dm_files
    knex.schema.alterTable('dm_files', (table) => {
      table.boolean('visibile_sito').defaultTo(false).after('mime_type').comment('Visibile sul sito web aziendale');
      table.index('visibile_sito', 'idx_dm_files_visibile_sito');
    })
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    // Rimuove visibile_sito da ct_catalogo
    knex.schema.alterTable('ct_catalogo', (table) => {
      table.dropColumn('visibile_sito');
    }),
    // Rimuove visibile_sito da dm_files
    knex.schema.alterTable('dm_files', (table) => {
      table.dropColumn('visibile_sito');
    })
  ]);
};