// migrations/20250917105500_add_data_ult_to_an_progressivi.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.table('an_progressivi', function(table) {
    // NUOVO: Aggiunta colonna per memorizzare la data dell'ultimo utilizzo del progressivo.
    // La colonna è nullable per retrocompatibilità con i record esistenti.
    table.date('data_ult').nullable().after('ultimo_numero');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.table('an_progressivi', function(table) {
    table.dropColumn('data_ult');
  });
};