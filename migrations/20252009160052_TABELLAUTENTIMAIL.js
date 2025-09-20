/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  // Aggiunge la colonna per le note particolari alla tabella delle istanze azioni
  return knex.schema.table('ppa_istanzeazioni', function(table) {
    // Il campo TEXT è ideale per note di lunghezza variabile e potenzialmente lunghe.
    // Viene aggiunto dopo il campo 'NoteSvolgimento' per mantenere una struttura logica.
    table.text('NoteParticolari').after('NoteSvolgimento');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // Rimuove la colonna in caso di rollback della migrazione
  return knex.schema.table('ppa_istanzeazioni', function(table) {
    table.dropColumn('NoteParticolari');
  });
};
