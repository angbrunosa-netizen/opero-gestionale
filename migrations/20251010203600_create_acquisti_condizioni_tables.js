/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    // 1. Tabella principale: ac_listini_fornitori
    .createTable('ac_listini_fornitori', function(table) {
      table.increments('id').primary();
      table.integer('id_ditta').unsigned().notNullable().references('id').inTable('ditte').onDelete('CASCADE');
      table.integer('id_fornitore').unsigned().notNullable().references('id').inTable('ditte').onDelete('CASCADE');
      table.integer('id_articolo').unsigned().notNullable().references('id').inTable('ct_catalogo').onDelete('CASCADE');
      table.decimal('prezzo_listino', 10, 4).notNullable();
      table.date('data_inizio_validita').notNullable();
      table.date('data_fine_validita').nullable();
      table.timestamps(true, true);

      // Indici per migliorare le performance delle query
      table.index(['id_ditta', 'id_fornitore', 'id_articolo']);
    })
    // 2. Tabella contenitore: ac_condizioni_sconto
    .createTable('ac_condizioni_sconto', function(table) {
      table.increments('id').primary();
      table.integer('id_ditta').unsigned().notNullable().references('id').inTable('ditte').onDelete('CASCADE');
      table.integer('id_listino').unsigned().notNullable().references('id').inTable('ac_listini_fornitori').onDelete('CASCADE');
      table.string('descrizione', 255).notNullable();
      table.boolean('attiva').defaultTo(true);
      table.timestamps(true, true);

      table.index('id_listino');
    })
    // 3. Tabella di dettaglio: ac_sconti_dettaglio
    .createTable('ac_sconti_dettaglio', function(table) {
      table.increments('id').primary();
      table.integer('id_condizione').unsigned().notNullable().references('id').inTable('ac_condizioni_sconto').onDelete('CASCADE');
      table.integer('ordine_applicazione').notNullable();
      table.enum('tipo_sconto', ['percentuale', 'importo']).notNullable();
      table.decimal('valore_sconto', 10, 4).notNullable();
      table.enum('tipo_esigibilita', ['immediata', 'differita']).notNullable();
      table.text('note').nullable();

      table.index('id_condizione');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('ac_sconti_dettaglio')
    .dropTableIfExists('ac_condizioni_sconto')
    .dropTableIfExists('ac_listini_fornitori');
};