/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('log_azioni', function(table) {
    // Aggiunge la colonna 'modulo' di tipo stringa, può essere null
    table.string('modulo').nullable();
    // Aggiunge la colonna 'funzione' di tipo stringa, può essere null
    table.string('funzione').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('log_azioni', function(table) {
    // Rimuove la colonna 'modulo'
    table.dropColumn('modulo');
    // Rimuove la colonna 'funzione'
    table.dropColumn('funzione');
  });
};