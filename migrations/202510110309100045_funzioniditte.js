/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('funzioni_ditte', (table) => {
    table.increments('id').primary();
    
    // ❗ CORREZIONE: Rimosso .unsigned() per farlo corrispondere a 'funzioni.id' che è un INT con segno.
    table.integer('id_funzione').notNullable(); 
    table.foreign('id_funzione').references('funzioni.id').onDelete('CASCADE');
    
    // Mantenuto .unsigned() perché 'ditte.id' è UNSIGNED.
    table.integer('id_ditta').unsigned().notNullable();
    table.foreign('id_ditta').references('ditte.id').onDelete('CASCADE');

    table.timestamps(true, true);
    table.unique(['id_funzione', 'id_ditta']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('funzioni_ditte');
};

