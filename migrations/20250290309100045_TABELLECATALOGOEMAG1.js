/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  // usiamo promise.all per eseguire in parallelo la creazione delle tabelle
  // che non hanno dipendenze dirette tra loro (le tabelle di supporto)
  return Promise.all([
    // tabella per le categorie merceologiche degli articoli
    knex.schema.createTable('ct_categorie', function(table) {
      table.increments('id').primary();
      table.integer('id_ditta').unsigned().notNullable();
      table.foreign('id_ditta').references('id').inTable('ditte').onDelete('CASCADE');
      table.string('nome_categoria', 100).notNullable();
      table.text('descrizione');
      table.timestamps(true, true);
    }),
    // tabella per le unità di misura
    knex.schema.createTable('ct_unita_misura', function(table) {
      table.increments('id').primary();
      table.integer('id_ditta').unsigned().notNullable();
      table.foreign('id_ditta').references('id').inTable('ditte').onDelete('CASCADE');
      table.string('sigla_um', 10).notNullable();
      table.string('descrizione', 100);
      table.timestamps(true, true);
    }),
    // tabella per i magazzini
    knex.schema.createTable('mg_magazzini', function(table) {
      table.increments('id').primary();
      table.integer('id_ditta').unsigned().notNullable();
      table.foreign('id_ditta').references('id').inTable('ditte').onDelete('CASCADE');
      table.string('nome_magazzino', 100).notNullable();
      table.text('descrizione');
      table.timestamps(true, true);
    }),
    // tabella per le causali di movimento di magazzino
    knex.schema.createTable('mg_causali_movimento', function(table) {
      table.increments('id').primary();
      table.integer('id_ditta').unsigned().notNullable();
      table.foreign('id_ditta').references('id').inTable('ditte').onDelete('CASCADE');
      table.string('causale', 100).notNullable();
      table.enum('tipo_movimento', ['carico', 'scarico']).notNullable();
      table.timestamps(true, true);
    })
  ]).then(() => {
    // una volta create le tabelle di supporto, creiamo la tabella principale del catalogo
    return knex.schema.createTable('ct_catalogo', function(table) {
      table.increments('id').primary();
      table.integer('id_ditta').unsigned().notNullable();
      table.foreign('id_ditta').references('id').inTable('ditte').onDelete('CASCADE');
      table.string('codice_entita', 50).notNullable();
      table.string('descrizione', 255).notNullable();
      table.integer('id_categoria').unsigned().references('id').inTable('ct_categorie').onDelete('SET NULL');
      table.enum('tipo_entita', ['bene', 'servizio', 'composito']).notNullable();
      table.integer('id_unita_misura').unsigned().references('id').inTable('ct_unita_misura').onDelete('SET NULL');
      table.integer('id_aliquota_iva').unsigned().references('id').inTable('iva_contabili').onDelete('SET NULL');
      table.decimal('prezzo_base', 10, 2).defaultTo(0);
      table.boolean('gestito_a_magazzino').defaultTo(false);
      table.timestamps(true, true);
      table.unique(['id_ditta', 'codice_entita']);
    });
  }).then(() => {
    // infine, creiamo le tabelle satellite che dipendono da ct_catalogo
    return Promise.all([
      knex.schema.createTable('ct_catalogo_dati_beni', function(table) {
        table.integer('id_catalogo').unsigned().primary();
        table.foreign('id_catalogo').references('id').inTable('ct_catalogo').onDelete('CASCADE');
        table.decimal('peso', 10, 3);
        table.decimal('volume', 10, 3);
        table.string('dimensioni', 50);
      }),
      knex.schema.createTable('ct_catalogo_dati_servizi', function(table) {
        table.integer('id_catalogo').unsigned().primary();
        table.foreign('id_catalogo').references('id').inTable('ct_catalogo').onDelete('CASCADE');
        table.integer('durata_stimata');
      }),
      knex.schema.createTable('ct_catalogo_compositi', function(table) {
        table.integer('id_catalogo_padre').unsigned().notNullable();
        table.foreign('id_catalogo_padre').references('id').inTable('ct_catalogo').onDelete('CASCADE');
        table.integer('id_catalogo_componente').unsigned().notNullable();
        table.foreign('id_catalogo_componente').references('id').inTable('ct_catalogo').onDelete('CASCADE');
        table.decimal('quantita_componente', 10, 3).notNullable();
        table.primary(['id_catalogo_padre', 'id_catalogo_componente']);
      }),
      knex.schema.createTable('mg_movimenti', function(table) {
        table.increments('id').primary();
        table.integer('id_ditta').unsigned().notNullable();
        table.foreign('id_ditta').references('id').inTable('ditte').onDelete('CASCADE');
        table.integer('id_magazzino').unsigned().references('id').inTable('mg_magazzini').onDelete('CASCADE');
        table.integer('id_catalogo').unsigned().references('id').inTable('ct_catalogo').onDelete('CASCADE');
        table.integer('id_causale').unsigned().references('id').inTable('mg_causali_movimento').onDelete('CASCADE');
        table.decimal('quantita', 10, 3).notNullable();
        table.timestamp('data_movimento').defaultTo(knex.fn.now());
        // CORREZIONE: rimosso .unsigned() per matchare il tipo della colonna utenti.id
        table.integer('id_utente').references('id').inTable('utenti');
        table.text('note');
        table.timestamps(true, true);
      })
    ]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // per il rollback, eliminiamo le tabelle in ordine inverso rispetto alla creazione
  // per rispettare i vincoli di foreign key
  return knex.schema.dropTableIfExists('mg_movimenti')
    .then(() => knex.schema.dropTableIfExists('ct_catalogo_compositi'))
    .then(() => knex.schema.dropTableIfExists('ct_catalogo_dati_servizi'))
    .then(() => knex.schema.dropTableIfExists('ct_catalogo_dati_beni'))
    .then(() => knex.schema.dropTableIfExists('ct_catalogo'))
    .then(() => {
      // eliminiamo le tabelle di supporto in parallelo
      return Promise.all([
        knex.schema.dropTableIfExists('mg_causali_movimento'),
        knex.schema.dropTableIfExists('mg_magazzini'),
        knex.schema.dropTableIfExists('ct_unita_misura'),
        knex.schema.dropTableIfExists('ct_categorie')
      ]);
    });
};


