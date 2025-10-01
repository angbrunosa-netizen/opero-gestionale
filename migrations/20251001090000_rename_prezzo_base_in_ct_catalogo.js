/**
 * @file opero/migrations/20251001090000_rename_prezzo_base_in_ct_catalogo.js
 * @description Migrazione Knex per rinominare il campo 'prezzo_base' in 'costo_base' nella tabella ct_catalogo.
 * @date 2025-10-01
 * @version 1.0
 */

exports.up = function(knex) {
  return knex.schema.alterTable('ct_catalogo', function(table) {
    // Rinomina la colonna per riflettere il suo significato di costo d'acquisto/produzione
    table.renameColumn('prezzo_base', 'costo_base');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('ct_catalogo', function(table) {
    // Annulla la ridenominazione in caso di rollback
    table.renameColumn('costo_base', 'prezzo_base');
  });
};
