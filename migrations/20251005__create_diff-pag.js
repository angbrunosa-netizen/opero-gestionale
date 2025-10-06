/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  // Aggiunge la colonna per i giorni di dilazione alla tabella esistente dei tipi di pagamento
  return knex.schema.table('tipi_pagamento', function(table) {
    console.log('Aggiungo colonna gg_dilazione a tipi_pagamento');
    table.integer('gg_dilazione').defaultTo(0).comment('Giorni di dilazione del pagamento.');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // Rimuove la colonna aggiunta in caso di rollback
  return knex.schema.table('tipi_pagamento', function(table) {
    console.log('Rimuovo colonna gg_dilazione da tipi_pagamento');
    table.dropColumn('gg_dilazione');
  });
};