/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.table('sc_registrazioni_testata', function(table) {
    // Aggiunge le colonne dopo 'descrizione_testata' per mantenere un ordine logico
    table.date('data_documento').after('descrizione_testata').nullable();
    table.string('numero_documento', 50).after('data_documento').nullable();
    table.decimal('totale_documento', 15, 2).after('numero_documento').nullable();
    
    // Aggiunge la colonna per il collegamento all'anagrafica (cliente/fornitore)
    // La colonna DEVE essere UNSIGNED per corrispondere a `ditte.id` dopo la nostra correzione
    table.integer('id_ditte').unsigned().nullable().after('totale_documento');
    
    // Aggiunge il vincolo di chiave esterna
    table.foreign('id_ditte').references('ditte.id').onDelete('SET NULL');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.table('sc_registrazioni_testata', function(table) {
    // Rimuove prima il vincolo, poi le colonne, in ordine inverso
    table.dropForeign('id_ditte');
    table.dropColumn('id_ditte');
    table.dropColumn('totale_documento');
    table.dropColumn('numero_documento');
    table.dropColumn('data_documento');
  });
};