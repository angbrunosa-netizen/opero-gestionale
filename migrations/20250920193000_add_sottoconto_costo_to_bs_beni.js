/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('bs_beni', function(table) {
    // Aggiunge la colonna per il sottoconto di costo diretto.
    // Viene posizionata dopo 'valore_acquisto' per raggruppare i dati contabili.
    // Non è unsigned per coerenza con la chiave primaria di sc_piano_dei_conti.
    table.integer('id_sottoconto_costo')
      .nullable()
      .references('id')
      .inTable('sc_piano_dei_conti')
      .onDelete('SET NULL')
      .after('valore_acquisto');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('bs_beni', function(table) {
    // Rimuove la colonna se la migrazione viene annullata
    table.dropColumn('id_sottoconto_costo');
  });
};
