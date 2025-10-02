/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // PRIMA: Pulisci lo stato precedente in caso di migrazione fallita
  await knex.schema.dropTableIfExists('ct_ean');

  // POI: Crea la tabella da zero per garantire uno stato pulito
  return knex.schema.createTable('ct_ean', (table) => {
    table.increments('id').primary();
    table.integer('id_ditta').unsigned().notNullable();
    table.integer('id_catalogo').unsigned().notNullable();
    table.string('codice_ean', 13).notNullable();
    table.enum('tipo_ean', ['PRODOTTO', 'CONFEZIONE']).notNullable();
    table.enum('tipo_ean_prodotto', ['PEZZO', 'PESO', 'PREZZO']).nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    // CORREZIONE DEFINITIVA: Rimosso .unsigned() per farlo corrispondere a utenti.id che è un INT standard
    table.integer('created_by'); 

    // Vincoli e chiavi esterne definite separatamente
    table.foreign('id_ditta').references('ditte.id');
    table.foreign('id_catalogo').references('ct_catalogo.id').onDelete('CASCADE');
    table.foreign('created_by').references('utenti.id');

    // Vincolo di unicità
    table.unique(['id_catalogo', 'codice_ean']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('ct_ean');
};
