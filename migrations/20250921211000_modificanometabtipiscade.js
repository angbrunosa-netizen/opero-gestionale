/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  // Rinominiamo la tabella dal nome errato (singolare) a quello corretto (plurale)
  return knex.schema.renameTable('bs_tipi_scadenza', 'bs_tipi_scadenze');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // Funzione di rollback: in caso di problemi, ripristina il nome originale
  return knex.schema.renameTable('bs_tipi_scadenze', 'bs_tipi_scadenza');
};
