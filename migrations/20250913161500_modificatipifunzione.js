/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  // Modifica la colonna ENUM per includere tutti i tipi di funzione richiesti.
  // Questo allinea il database alle opzioni che verranno mostrate nel frontend.
  return knex.schema.alterTable('sc_funzioni_contabili', function(table) {
    table.enum('tipo_funzione', [
      'Primaria', 
      'Secondaria', 
      'Finanziaria', 
      'Sistema' // Sostituisce 'Sistemistica' e si allinea alla nuova UI
    ]).notNullable().defaultTo('Primaria').alter();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // Funzione di rollback per ripristinare lo stato precedente in caso di necessità.
  return knex.schema.alterTable('sc_funzioni_contabili', function(table) {
    table.enum('tipo_funzione', [
      'Primaria', 
      'Secondaria', 
      'Sistemistica', // Ripristina il valore originale
      'Finanziaria'
    ]).notNullable().defaultTo('Primaria').alter();
  });
};
