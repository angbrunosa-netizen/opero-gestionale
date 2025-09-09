// File: migrations/YYYYMMDDHHMMSS_aggiungi_data_registrazione_a_sc_partite_aperte.js

exports.up = function(knex) {
  return knex.schema.table('sc_partite_aperte', function(table) {
    // --- MODIFICA INIZIO ---
    // Rimuoviamo .after() perché la colonna di riferimento non esiste.
    // La colonna verrà aggiunta alla fine della tabella.
    table.date('data_registrazione').notNullable();
    // --- MODIFICA FINE ---
  });
};

exports.down = function(knex) {
  return knex.schema.table('sc_partite_aperte', function(table) {
    table.dropColumn('data_registrazione');
  });
};