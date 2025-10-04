/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    // 1. Tabella Anagrafica Magazzini/Depositi (Struttura Unificata)
    .createTable('mg_magazzini', function(table) {
      table.increments('id').primary();
      table.integer('id_ditta').unsigned().notNullable().references('id').inTable('ditte').onDelete('CASCADE');
      table.string('codice', 20).notNullable();
      table.string('descrizione', 100).notNullable();
      table.text('note').nullable();
      table.timestamps(true, true);
      table.unique(['id_ditta', 'codice']);
    })
    // 2. Tabella Causali di Movimento (Struttura Unificata)
    .createTable('mg_causali_movimento', function(table) {
      table.increments('id').primary();
      table.integer('id_ditta').unsigned().notNullable().references('id').inTable('ditte').onDelete('CASCADE');
      table.string('codice', 20).notNullable();
      table.string('descrizione', 100).notNullable();
      table.enum('tipo', ['carico', 'scarico']).notNullable();
      table.timestamps(true, true);
      table.unique(['id_ditta', 'codice']);
    })
    // 3. Tabella Lotti di Magazzino (Essenziale per Tracciabilità)
    .createTable('mg_lotti', function(table) {
        table.increments('id').primary();
        table.integer('id_ditta').unsigned().notNullable().references('id').inTable('ditte').onDelete('CASCADE');
        table.integer('id_catalogo').unsigned().notNullable().references('id').inTable('ct_catalogo').onDelete('CASCADE');
        table.string('codice_lotto', 50).notNullable();
        table.date('data_scadenza').nullable();
        table.timestamps(true, true);
        table.unique(['id_ditta', 'id_catalogo', 'codice_lotto']);
    })
    // 4. Tabella Movimenti di Magazzino (Versione Potenziata e Corretta)
    .createTable('mg_movimenti', function(table) {
      table.increments('id').primary();
      table.integer('id_ditta').unsigned().notNullable().references('id').inTable('ditte').onDelete('CASCADE');
      table.integer('id_magazzino').unsigned().notNullable().references('id').inTable('mg_magazzini').onDelete('CASCADE');
      table.integer('id_catalogo').unsigned().notNullable().references('id').inTable('ct_catalogo').onDelete('CASCADE');
      table.integer('id_causale').unsigned().notNullable().references('id').inTable('mg_causali_movimento').onDelete('CASCADE');
      // --- CORREZIONE QUI ---
      // Rimosso .unsigned() per matchare il tipo della colonna 'utenti.id' (che è signed)
      table.integer('id_utente').nullable().references('id').inTable('utenti').onDelete('SET NULL');
      table.timestamp('data_movimento').defaultTo(knex.fn.now());
      table.decimal('quantita', 12, 4).notNullable();
      table.decimal('valore_unitario', 12, 4).nullable();
      table.string('riferimento_doc', 100).nullable();
      table.integer('id_riferimento_doc').unsigned().nullable();
      table.text('note').nullable();
      table.timestamps(true, true);
    })
    // 5. Tabella di collegamento Movimenti <-> Lotti
    .createTable('mg_movimenti_lotti', function(table) {
        table.increments('id').primary();
        table.integer('id_movimento').unsigned().notNullable().references('id').inTable('mg_movimenti').onDelete('CASCADE');
        table.integer('id_lotto').unsigned().notNullable().references('id').inTable('mg_lotti').onDelete('CASCADE');
        table.decimal('quantita', 12, 4).notNullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('mg_movimenti_lotti')
    .dropTableIfExists('mg_movimenti')
    .dropTableIfExists('mg_lotti')
    .dropTableIfExists('mg_causali_movimento')
    .dropTableIfExists('mg_magazzini');
};

