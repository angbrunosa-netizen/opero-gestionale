/**
 * @file opero/migrations/20251001090100_crea_tabella_ct_listini.js
 * @description Migrazione Knex per creare la nuova tabella 'ct_listini' per la gestione avanzata dei prezzi.
 * @date 2025-10-01
 * @version 1.0
 */

exports.up = function(knex) {
  return knex.schema.createTable('ct_listini', function(table) {
    table.increments('id').primary();
    table.integer('id_ditta').unsigned().notNullable();
    table.integer('id_entita_catalogo').unsigned().notNullable();

    table.string('nome_listino').notNullable();
    table.date('data_inizio_validita').notNullable();
    table.date('data_fine_validita').nullable();

    // Loop per creare i 6 blocchi prezzo, ognuno con cessione, pubblico e ricarico
    for (let i = 1; i <= 6; i++) {
      table.decimal(`prezzo_cessione_${i}`, 10, 2).defaultTo(0);
      table.decimal(`prezzo_pubblico_${i}`, 10, 2).defaultTo(0);
      table.decimal(`ricarico_${i}`, 5, 2).defaultTo(0);
    }
    
    table.timestamps(true, true);

    // Foreign Keys
    table.foreign('id_ditta').references('id').inTable('ditte').onDelete('CASCADE');
    table.foreign('id_entita_catalogo').references('id').inTable('ct_catalogo').onDelete('CASCADE');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('ct_listini');
};