/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  // Controlla se la tabella esiste già per rendere la migrazione sicura
  if (!(await knex.schema.hasTable('sc_funzioni_collegate'))) {
    await knex.schema.createTable('sc_funzioni_collegate', (table) => {
      // Chiave primaria, INT UNSIGNED AUTO_INCREMENT
      table.increments('id').unsigned().primary();

      // FK verso la funzione che "innesca" l'azione
      table.integer('id_funzione_primaria').unsigned().notNullable();
      table
        .foreign('id_funzione_primaria')
        .references('id')
        .inTable('sc_funzioni_contabili')
        .onDelete('CASCADE');

      // FK verso la funzione che "viene innescata"
      table.integer('id_funzione_secondaria').unsigned().notNullable();
      table
        .foreign('id_funzione_secondaria')
        .references('id')
        .inTable('sc_funzioni_contabili')
        .onDelete('CASCADE');

      // Per definire l'ordine di esecuzione delle funzioni secondarie
      table.integer('ordine_esecuzione').defaultTo(1);

      // Vincolo di unicità per evitare duplicati
      table.unique(
        ['id_funzione_primaria', 'id_funzione_secondaria'],
        'uq_funzioni_collegate'
      );
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  // Rimuove la tabella in modo sicuro
  await knex.schema.dropTableIfExists('sc_funzioni_collegate');
};