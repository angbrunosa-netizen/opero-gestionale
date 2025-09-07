/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('sc_funzioni_collegate', (table) => {
    table.increments('id', 11).primary();
    
    // La funzione che "innesca" l'azione
    table.integer('id_funzione_primaria', 11).unsigned().notNullable();
    table.foreign('id_funzione_primaria').references('id').inTable('sc_funzioni_contabili').onDelete('CASCADE');
    
    // La funzione che "viene innescata"
    table.integer('id_funzione_secondaria', 11).unsigned().notNullable();
    table.foreign('id_funzione_secondaria').references('id').inTable('sc_funzioni_contabili').onDelete('CASCADE');

    // Per definire l'ordine di esecuzione delle funzioni secondarie
    table.integer('ordine_esecuzione').defaultTo(1);

        table.unique(['id_funzione_primaria', 'id_funzione_secondaria'], 'uq_funz_ril');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('sc_funzioni_collegate');
};
