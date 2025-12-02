/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('va_clienti_anagrafica', function(table) {
    // 1. Rimuovi la chiave primaria esistente (probabilmente su 'id_ditta')
    table.dropPrimary(); 
    
    // 2. Aggiungi la nuova colonna 'id' come chiave primaria auto-incrementante
    table.increments('id').primary();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('va_clienti_anagrafica', function(table) {
    // Per il rollback, fai il contrario:
    // 1. Rimuovi la colonna 'id'
    table.dropColumn('id');
    // 2. Ripristina la vecchia chiave primaria su 'id_ditta'
    table.primary('id_ditta');
  });
};