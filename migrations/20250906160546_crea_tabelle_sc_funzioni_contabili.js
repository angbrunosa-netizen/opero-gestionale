/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  // controlla se la tabella sc_funzioni_contabili esiste già
  const hasFunzioniContabili = await knex.schema.hasTable('sc_funzioni_contabili');
  if (!hasFunzioniContabili) {
    // crea tabella sc_funzioni_contabili
    await knex.schema.createTable('sc_funzioni_contabili', (table) => {
      // INT(11) NON UNSIGNED AUTO_INCREMENT PRIMARY KEY
      table.specificType('id', 'int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY');

      // FK verso ditte.id (int(11) non unsigned)
      table.integer('id_ditta').notNullable();
      table
        .foreign('id_ditta')
        .references('id')
        .inTable('ditte')
        .onDelete('CASCADE');

      table.string('codice_funzione', 20).notNullable();
      table.string('nome_funzione', 100).notNullable();
      table.text('descrizione').nullable();
      table.string('categoria', 50).nullable();
      table.boolean('attiva').defaultTo(true);
      table.timestamps(true, true);

      table.unique(['id_ditta', 'codice_funzione']);
    });
  }

  // controlla se la tabella sc_funzioni_contabili_righe esiste già
  const hasFunzioniContabiliRighe = await knex.schema.hasTable('sc_funzioni_contabili_righe');
  if (!hasFunzioniContabiliRighe) {
    // crea tabella sc_funzioni_contabili_righe
    await knex.schema.createTable('sc_funzioni_contabili_righe', (table) => {
      // INT(11) NON UNSIGNED AUTO_INCREMENT PRIMARY KEY
      table.specificType('id', 'int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY');

      // fk verso sc_funzioni_contabili.id (INT(11))
      table.integer('id_funzione_contabile').notNullable();
      table
        .foreign('id_funzione_contabile')
        .references('id')
        .inTable('sc_funzioni_contabili')
        .onDelete('CASCADE');

      // fk verso sc_piano_dei_conti.id (INT(11))
      table.integer('id_conto').notNullable();
      table
        .foreign('id_conto')
        .references('id')
        .inTable('sc_piano_dei_conti')
        .onDelete('CASCADE');

      table.enum('tipo_movimento', ['D', 'A']).notNullable();
      table.string('descrizione_riga_predefinita', 255).nullable();
      table.boolean('is_sottoconto_modificabile').defaultTo(true);
      table.timestamps(true, true);
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  // Anche la funzione 'down' deve essere sicura
  await knex.schema.dropTableIfExists('sc_funzioni_contabili_righe');
  await knex.schema.dropTableIfExists('sc_funzioni_contabili');
};