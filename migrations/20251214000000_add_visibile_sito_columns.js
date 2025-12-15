/**
 * Migration: Aggiunta colonna visibile_sito per sito web
 * Data: 2025-12-14
 * Scopo: Aggiungere colonna visibile_sito per gestire visibilità contenuti su sito web
 * FIX: Resa la migrazione idempotente (non fallisce su colonne già esistenti)
 */

exports.up = function(knex) {
  return Promise.all([
    // Aggiunge visibile_sito a ct_catalogo
    knex.schema.alterTable('ct_catalogo', async (table) => {
      const columnName = 'visibile_sito';
      const tableName = 'ct_catalogo';

      // Aggiunge la colonna solo se non esiste
      if (!(await knex.schema.hasColumn(tableName, columnName))) {
        table.boolean(columnName).defaultTo(false).after('gestito_a_magazzino').comment('Visibile sul sito web aziendale');
        // Aggiunge l'indice solo se la colonna è nuova
        table.index(columnName, 'idx_ct_catalogo_visibile_sito');
      }
    }),
    
    // Aggiunge visibile_sito a dm_files
    knex.schema.alterTable('dm_files', async (table) => {
      const columnName = 'visibile_sito';
      const tableName = 'dm_files';
      
      // Aggiunge la colonna solo se non esiste
      if (!(await knex.schema.hasColumn(tableName, columnName))) {
        table.boolean(columnName).defaultTo(false).after('mime_type').comment('Visibile sul sito web aziendale');
        // Aggiunge l'indice solo se la colonna è nuova
        table.index(columnName, 'idx_dm_files_visibile_sito');
      }
    })
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    // Rimuove visibile_sito da ct_catalogo
    knex.schema.alterTable('ct_catalogo', async (table) => {
      if (await knex.schema.hasColumn('ct_catalogo', 'visibile_sito')) {
        table.dropColumn('visibile_sito');
        // Non è necessario rimuovere l'indice, dropColumn lo gestisce di solito.
      }
    }),
    
    // Rimuove visibile_sito da dm_files
    knex.schema.alterTable('dm_files', async (table) => {
      if (await knex.schema.hasColumn('dm_files', 'visibile_sito')) {
        table.dropColumn('visibile_sito');
      }
    })
  ]);
};