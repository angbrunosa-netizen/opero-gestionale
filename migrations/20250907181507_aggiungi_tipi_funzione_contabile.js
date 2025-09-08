/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const hasTipi = await knex.schema.hasTable('sc_tipi_funzione_contabile');
  if (!hasTipi) {
    await knex.schema.createTable('sc_tipi_funzione_contabile', (table) => {
      table.specificType('id', 'int(11) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY');
      table.string('codice', 20).notNullable().unique();
      table.string('nome', 100).notNullable();
      table.text('descrizione').nullable();
      table.timestamps(true, true);
    });
  }

  const hasCollegamento = await knex.schema.hasTable('sc_funzione_tipo_collegamento');
  if (!hasCollegamento) {
    await knex.schema.createTable('sc_funzione_tipo_collegamento', (table) => {
      table.specificType('id', 'int(11) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY');

      // CORREZIONE: Aggiunto .unsigned() per far corrispondere il tipo con sc_funzioni_contabili.id
      table.integer('id_funzione_contabile').unsigned().notNullable();
      table
        .foreign('id_funzione_contabile')
        .references('id')
        .inTable('sc_funzioni_contabili')
        .onDelete('CASCADE');

      // CORREZIONE: Aggiunto .unsigned() per coerenza e best practice
      table.integer('id_tipo_funzione').unsigned().notNullable();
      table
        .foreign('id_tipo_funzione')
        .references('id')
        .inTable('sc_tipi_funzione_contabile')
        .onDelete('CASCADE');

      table.timestamps(true, true);
      table.unique(['id_funzione_contabile', 'id_tipo_funzione'], 'uq_funz_tipo_coll');
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('sc_funzione_tipo_collegamento');
  await knex.schema.dropTableIfExists('sc_tipi_funzione_contabile');
};