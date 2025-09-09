/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    // 1. Tabella per i TIPI di relazione
    .createTable('an_tipi_relazione', function(table) {
      table.increments('id').primary();
      table.string('descrizione', 100).notNullable().unique();
      table.timestamps(true, true);
    })
    // 2. Tabella di MAPPING per le relazioni tra anagrafiche
    .createTable('an_relazioni', function(table) {
      table.increments('id').primary();
      
      // La ditta "principale" o "di origine"
      table.integer('id_ditta_origine').unsigned().notNullable();
      table.foreign('id_ditta_origine').references('id').inTable('ditte').onDelete('CASCADE');

      // La ditta con cui si stabilisce la relazione
      table.integer('id_ditta_correlata').unsigned().notNullable();
      table.foreign('id_ditta_correlata').references('id').inTable('ditte').onDelete('CASCADE');

      // Il tipo di relazione (es. Cliente, Fornitore)
      table.integer('id_tipo_relazione').unsigned().notNullable();
      table.foreign('id_tipo_relazione').references('id').inTable('an_tipi_relazione').onDelete('CASCADE');

      table.timestamps(true, true);

      // Vincolo di unicità per evitare relazioni duplicate
      table.unique(['id_ditta_origine', 'id_ditta_correlata', 'id_tipo_relazione']);
    })
    // 3. Popoliamo la tabella dei tipi con i valori di base
    .then(() => {
        return knex('an_tipi_relazione').insert([
            { descrizione: 'Cliente' },
            { descrizione: 'Fornitore' },
            { descrizione: 'Punto Vendita' },
            { descrizione: 'Partner' }
        ]);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('an_relazioni')
    .dropTableIfExists('an_tipi_relazione');
};
