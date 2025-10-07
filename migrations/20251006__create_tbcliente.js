/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.table('va_clienti_anagrafica', function(table) {
    // Aggiungiamo la colonna
    table.integer('id_matrice_sconti').unsigned();
    // Aggiungiamo la relazione (foreign key)
    table.foreign('id_matrice_sconti').references('id').inTable('va_matrici_sconti').onDelete('SET NULL');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.table('va_clienti_anagrafica', function(table) {
    // Rimuoviamo prima la relazione
    table.dropForeign('id_matrice_sconti');
    // E poi la colonna
    table.dropColumn('id_matrice_sconti');
  });
};
