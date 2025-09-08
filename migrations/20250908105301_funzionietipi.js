// migrations/YYYYMMDDHHMMSS_aggiungi_classificazione_a_funzioni_contabili.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  console.log('Aggiunta colonna "tipo_funzione" a sc_funzioni_contabili...');
  return knex.schema.alterTable('sc_funzioni_contabili', function(table) {
    // Aggiunge la colonna per la classificazione univoca della funzione.
    // L'uso di ENUM garantisce l'integrità del dato a livello di database.
    table.enum('tipo_funzione', [
      'Primaria', 
      'Secondaria', 
      'Sistemistica', 
      'Finanziaria'
    ], { useNative: true, enumName: 'tipo_funzione_enum' }) // useNative e enumName per migliore compatibilità
    .notNullable()
    .defaultTo('Primaria')
    .after('categoria')
    .comment('Classificazione univoca della funzione contabile.');
  }).then(() => {
    console.log('Colonna "tipo_funzione" aggiunta con successo.');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  console.log('Rimozione colonna "tipo_funzione"...');
  return knex.schema.alterTable('sc_funzioni_contabili', function(table) {
    table.dropColumn('tipo_funzione');
  }).then(() => {
    // Rimuove anche il tipo ENUM creato per una pulizia completa del database.
    console.log('Rimozione tipo ENUM "tipo_funzione_enum"...');
    return knex.raw('DROP TYPE IF EXISTS tipo_funzione_enum');
  }).then(() => {
    console.log('Rollback della classificazione completato.');
  });
};