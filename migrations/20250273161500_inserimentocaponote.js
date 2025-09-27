/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.table('ppa_istanzeazioni', function(table) {
    // Aggiungiamo la colonna 'Note' di tipo TEXT
    // per permettere l'inserimento di testi lunghi.
    table.text('Note').nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.table('ppa_istanzeazioni', function(table) {
    table.dropColumn('Note');
  });
};