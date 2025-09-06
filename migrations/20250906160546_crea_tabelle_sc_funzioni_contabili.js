/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  // Tabella anagrafica per le funzioni contabili
  return knex.schema.createTable('sc_funzioni_contabili', (table) => {
    table.increments('id').primary();
    // CORREZIONE APPLICATA: .unsigned() è stato rimosso.
    table.integer('id_ditta').notNullable(); 
    table.foreign('id_ditta').references('id').inTable('ditte').onDelete('CASCADE');
    table.string('codice_funzione', 20).notNullable();
    table.string('nome_funzione', 100).notNullable();
    table.text('descrizione').nullable();
    table.string('categoria', 50).nullable();
    table.boolean('attiva').defaultTo(true);
    table.timestamps(true, true);

    table.unique(['id_ditta', 'codice_funzione']);
  })
  .then(() => {
    // Tabella di dettaglio con i conti Dare/Avere per ogni funzione
    return knex.schema.createTable('sc_funzioni_contabili_righe', (table) => {
        table.increments('id').primary();
        table.integer('id_funzione_contabile').unsigned().notNullable();
        table.foreign('id_funzione_contabile').references('id').inTable('sc_funzioni_contabili').onDelete('CASCADE');
        // CORREZIONE APPLICATA: .unsigned() è stato rimosso.
        table.integer('id_conto').notNullable();
        table.foreign('id_conto').references('id').inTable('piano_dei_conti').onDelete('CASCADE');
        table.enum('tipo_movimento', ['D', 'A']).notNullable();
        table.string('descrizione_riga_predefinita', 255).nullable();
        table.boolean('is_sottoconto_modificabile').defaultTo(true);
        table.timestamps(true, true);
    });
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('sc_funzioni_contabili_righe')
      .then(() => {
        return knex.schema.dropTableIfExists('sc_funzioni_contabili');
      });
};

