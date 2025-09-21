/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    // 1. Creiamo la nuova tabella per l'anagrafica dei tipi di scadenza
    .createTable('bs_tipi_scadenza', function(table) {
      table.increments('id').primary();
      table.integer('id_ditta').unsigned().notNullable().references('id').inTable('ditte').onDelete('CASCADE');
      table.string('codice', 50).notNullable();
      table.string('descrizione', 255).notNullable();
      table.timestamps(true, true);
      table.unique(['id_ditta', 'codice']);
    })
    // 2. Modifichiamo la tabella esistente delle scadenze
    .alterTable('bs_scadenze', function(table) {
      // Rimuoviamo la vecchia colonna di testo
      table.dropColumn('tipo_scadenza');
      // Aggiungiamo la nuova colonna come foreign key
      table.integer('id_tipo_scadenza').unsigned().nullable().references('id').inTable('bs_tipi_scadenza').onDelete('SET NULL').after('id_bene');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .alterTable('bs_scadenze', function(table) {
      table.dropForeign('id_tipo_scadenza');
      table.dropColumn('id_tipo_scadenza');
      table.string('tipo_scadenza', 255);
    })
    .dropTableIfExists('bs_tipi_scadenza');
};
