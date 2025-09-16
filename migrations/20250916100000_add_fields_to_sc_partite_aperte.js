exports.up = function(knex) {
  return knex.schema.alterTable('sc_partite_aperte', function(table) {
    // FASE DEFINITIVA: Aggiunge le colonne senza specificare la posizione (`.after()`).
    // Questo approccio è il più robusto perché non dipende da quali colonne esistono già.

    // Aggiungiamo tutte le colonne necessarie. Il database le accoderà alla tabella.
    table.integer('id_ditta').unsigned().notNullable();
    table.integer('id_anagrafica').unsigned().nullable();
    table.string('numero_documento', 50);
    table.date('data_documento');
    table.integer('id_sottoconto').unsigned().nullable();
    table.enum('tipo_movimento', ['Apertura_Credito', 'Apertura_Debito', 'Chiusura']).notNullable().defaultTo('Apertura_Debito');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('sc_partite_aperte', function(table) {
    // Rimuove tutte le colonne aggiunte dalla funzione 'up'.
    table.dropColumn('tipo_movimento');
    table.dropColumn('id_sottoconto');
    table.dropColumn('data_documento');
    table.dropColumn('numero_documento');
    table.dropColumn('id_anagrafica');
    table.dropColumn('id_ditta');
  });
};

