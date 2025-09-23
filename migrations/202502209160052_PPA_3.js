/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.table('ppa_istanzeazioni', function(table) {
    // Aggiunge un campo di testo per le note specifiche fornite
    // dal manager durante l'assegnazione dell'attività.
    table.text('NoteParticolari').nullable().after('NoteSvolgimento');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.table('ppa_istanzeazioni', function(table) {
    table.dropColumn('NoteParticolari');
  });
};
