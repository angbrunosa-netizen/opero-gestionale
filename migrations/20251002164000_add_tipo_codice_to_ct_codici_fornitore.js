/**
 * @file migrations/20251002164000_add_tipo_codice_to_ct_codici_fornitore.js
 * @description Migrazione Knex per aggiungere la colonna 'tipo_codice' alla tabella 'ct_codici_fornitore'.
 * Questo campo permette di distinguere tra codici fornitore Standard ('ST') e Occasionali ('OCC').
 */
exports.up = function(knex) {
  return knex.schema.alterTable('ct_codici_fornitore', function(table) {
    // Aggiunge la colonna 'tipo_codice' con i valori permessi 'ST' e 'OCC'.
    // Non può essere nullo e ha un valore predefinito di 'OCC' per i record esistenti.
    table.enum('tipo_codice', ['ST', 'OCC']).notNullable().defaultTo('OCC');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('ct_codici_fornitore', function(table) {
    // In caso di rollback, rimuove la colonna.
    table.dropColumn('tipo_codice');
  });
};
