/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.table('bs_scadenze', function(table) {
    // Aggiunge la colonna per la foreign key
    table.integer('id_tipo_scadenza').unsigned().nullable().after('id_bene');
    
    // Aggiunge il vincolo di foreign key
    table.foreign('id_tipo_scadenza').references('id').inTable('bs_tipi_scadenze').onDelete('SET NULL');
    
    // NOTA BENE: La vecchia colonna 'tipo_scadenza' non viene eliminata automaticamente
    // per permettere una migrazione manuale dei dati se necessario.
    // Una volta migrati i dati, si consiglia di rimuoverla con una nuova migrazione.
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.table('bs_scadenze', function(table) {
    // Rimuove prima il vincolo e poi la colonna
    table.dropForeign('id_tipo_scadenza');
    table.dropColumn('id_tipo_scadenza');
  });
};
