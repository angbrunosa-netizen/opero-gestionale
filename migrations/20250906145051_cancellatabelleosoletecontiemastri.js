/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Per sicurezza, si eliminano prima le tabelle che hanno dipendenze (foreign keys)
  
  // NUOVO: Aggiunta eliminazione tabella 'sottoconti'
  const sottocontiExists = await knex.schema.hasTable('sottoconti');
  if (sottocontiExists) {
    await knex.schema.dropTable('sottoconti');
  }

  // Controlla se la tabella 'conti' esiste e, in caso affermativo, la elimina.
  const contiExists = await knex.schema.hasTable('conti');
  if (contiExists) {
    await knex.schema.dropTable('conti');
  }

  // Controlla se la tabella 'mastri' esiste e, in caso affermativo, la elimina.
  const mastriExists = await knex.schema.hasTable('mastri');
  if (mastriExists) {
    await knex.schema.dropTable('mastri');
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // La funzione 'down' permette di annullare la migrazione, ricreando le tabelle.

  // Ricrea la tabella 'mastri'
  await knex.schema.createTable('mastri', function(table) {
    table.increments('codice').primary().unsigned(); // Crea INT UNSIGNED, PK, AI
    table.string('descrizione', 100).notNullable();
    table.string('tipo', 50).nullable();
    table.string('gruppo', 50).nullable();
    table.timestamps(true, true);
  });

  // Ricrea la tabella 'conti' con le sue chiavi esterne
  await knex.schema.createTable('conti', function(table) {
    table.increments('id').primary();
    table.integer('id_ditta').unsigned().notNullable();
    table.integer('codice_mastro').unsigned().notNullable();
    table.string('codice_conto', 20).notNullable().unique();
    table.string('descrizione', 150).notNullable();
    table.string('natura', 50).nullable();
    table.timestamps(true, true);

    // Definizione delle foreign keys
    table.foreign('id_ditta').references('ditte.id').withKeyName('fk_conti_id_ditta');
    table.foreign('codice_mastro').references('mastri.codice').withKeyName('fk_conti_codice_mastro');
  });

  // NUOVO: Ricrea la tabella 'sottoconti'
  await knex.schema.createTable('sottoconti', function(table) {
    table.increments('id').primary();
    table.integer('id_ditta').unsigned().notNullable();
    table.integer('id_conto').notNullable(); // 'conti.id' è un INT signed
    table.string('codice_sottoconto', 20).notNullable().unique();
    table.string('descrizione', 150).notNullable();
    table.string('natura', 50).nullable();
    table.timestamps(true, true);

    // Definizione delle foreign keys
    table.foreign('id_ditta').references('ditte.id').onDelete('CASCADE').withKeyName('fk_sottoconti_id_ditta');
    table.foreign('id_conto').references('conti.id').onDelete('CASCADE').withKeyName('fk_sottoconti_id_conto');
  });
};

