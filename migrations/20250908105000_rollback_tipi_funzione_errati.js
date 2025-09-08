// migrations/YYYYMMDDHHMMSS_rollback_tipi_funzione_errati.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  console.log('Esecuzione rollback per rimuovere tabelle funzione errate...');
  // L'ordine è importante: prima la tabella con la foreign key.
  await knex.schema.dropTableIfExists('sc_funzione_tipo_collegamento');
  await knex.schema.dropTableIfExists('sc_tipi_funzione_contabile');
  console.log('Tabelle rimosse con successo.');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // La funzione 'down' ricrea le tabelle nel caso di un rollback di questa specifica migrazione.
  // Questo garantisce la reversibilità completa dell'operazione di pulizia.
  console.log('Annullamento del rollback: ricreazione tabelle funzione errate...');
  await knex.schema.createTable('sc_tipi_funzione_contabile', (table) => {
    table.increments('id').unsigned().primary();
    table.string('codice', 20).notNullable().unique();
    table.string('nome', 100).notNullable();
    table.text('descrizione').nullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable('sc_funzione_tipo_collegamento', (table) => {
    table.increments('id').unsigned().primary();
    table.integer('id_funzione_contabile').unsigned().notNullable();
    table.foreign('id_funzione_contabile').references('id').inTable('sc_funzioni_contabili').onDelete('CASCADE');
    table.integer('id_tipo_funzione').unsigned().notNullable();
    table.foreign('id_tipo_funzione').references('id').inTable('sc_tipi_funzione_contabile').onDelete('CASCADE');
    table.timestamps(true, true);
    table.unique(['id_funzione_contabile', 'id_tipo_funzione']);
  });
  console.log('Tabelle errate ricreate.');
};