/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    // 1. Rimuoviamo le vecchie tabelle in ordine inverso di dipendenza
    .dropTableIfExists('ac_sconti_dettaglio')
    .dropTableIfExists('ac_condizioni_sconto')
    .dropTableIfExists('ac_listini_fornitori')
    // 2. Creiamo la nuova struttura
    .createTable('ac_condizioni_testata', function(table) {
      table.increments('id').primary();
      table.integer('id_ditta').unsigned().notNullable().references('id').inTable('ditte').onDelete('CASCADE');
      table.integer('id_fornitore').unsigned().notNullable().references('id').inTable('ditte').onDelete('CASCADE');
      table.string('descrizione', 255).notNullable();
      table.date('data_inizio_validita').notNullable();
      table.date('data_fine_validita').nullable();
      table.boolean('attiva').defaultTo(true);
      table.timestamps(true, true);
      table.index(['id_ditta', 'id_fornitore']);
    })
    .createTable('ac_condizioni_righe', function(table) {
        table.increments('id').primary();
        table.integer('id_testata').unsigned().notNullable().references('id').inTable('ac_condizioni_testata').onDelete('CASCADE');
        table.integer('id_articolo').unsigned().notNullable().references('id').inTable('ct_catalogo').onDelete('CASCADE');
        table.decimal('prezzo_listino', 10, 4).notNullable();
        table.timestamps(true, true);
        table.index(['id_testata', 'id_articolo']);
    })
    // La tabella sconti ora si lega direttamente alla riga della condizione
    .createTable('ac_sconti_dettaglio', function(table) {
        table.increments('id').primary();
        // <span style="color:green;">// CORRETTO: Il nome della colonna ora è 'id_riga'.</span>
        table.integer('id_riga').unsigned().notNullable().references('id').inTable('ac_condizioni_righe').onDelete('CASCADE');
        table.integer('ordine_applicazione').notNullable();
        table.enum('tipo_sconto', ['percentuale', 'importo']).notNullable();
        table.decimal('valore_sconto', 10, 4).notNullable();
        table.enum('tipo_esigibilita', ['immediata', 'differita']).notNullable();
        table.text('note').nullable();
        table.index('id_riga');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('ac_sconti_dettaglio')
    .dropTableIfExists('ac_condizioni_righe')
    .dropTableIfExists('ac_condizioni_testata');
};