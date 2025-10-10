/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.table('ac_condizioni_righe', function(table) {
    // Aggiunge la colonna per memorizzare il prezzo finale calcolato,
    // al netto di tutti gli sconti applicati.
    table.decimal('prezzo_netto', 10, 4).notNullable().after('prezzo_listino');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.table('ac_condizioni_righe', function(table) {
    table.dropColumn('prezzo_netto');
  });
};
