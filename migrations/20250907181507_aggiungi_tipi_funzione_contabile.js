/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable('sc_tipi_funzione_contabile', (table) => {
    table.specificType('id', 'int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY');
    table.string('codice', 20).notNullable().unique();
    table.string('nome', 100).notNullable();
    table.text('descrizione').nullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable('sc_funzione_tipo_collegamento', (table) => {
    table.specificType('id', 'int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY');

    table.integer('id_funzione_contabile').notNullable();
    table
      .foreign('id_funzione_contabile')
      .references('id')
      .inTable('sc_funzioni_contabili')
      .onDelete('CASCADE');

    table.integer('id_tipo_funzione').notNullable();
    table
      .foreign('id_tipo_funzione')
      .references('id')
      .inTable('sc_tipi_funzione_contabile')
      .onDelete('CASCADE');

    table.timestamps(true, true);

    // nome indice breve → niente più errore
    table.unique(['id_funzione_contabile', 'id_tipo_funzione'], 'uq_funz_tipo');
    
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('sc_funzione_tipo_collegamento');
  await knex.schema.dropTableIfExists('sc_tipi_funzione_contabile');
};