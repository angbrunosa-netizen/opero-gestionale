/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {


  // --- 2. Creazione Tabella PUNTI DI CONSEGNA (dipende dall'esistenza delle ditte/clienti) ---
  await knex.schema.createTable('va_punti_consegna', function(table) {
    table.increments('id').primary();
    table.integer('id_ditta').unsigned().notNullable().references('id').inTable('ditte').onDelete('CASCADE');
    table.integer('id_cliente').unsigned().notNullable().references('id').inTable('ditte').onDelete('CASCADE');
    table.string('descrizione', 255).notNullable();
    table.string('indirizzo');
    table.string('citta');
    table.string('cap', 10);
    table.string('provincia', 5);
    table.string('referente');
    table.string('telefono');
    console.log('Tabella va_punti_consegna creata.');
  });
  
  // --- 3. Aggiunta FK per punto di consegna predefinito (dopo che la tabella va_punti_consegna è stata creata) ---
  await knex.schema.alterTable('va_clienti_anagrafica', function(table) {
      table.integer('id_punto_consegna_predefinito').unsigned().nullable().references('id').inTable('va_punti_consegna').onDelete('SET NULL');
      console.log('Aggiunta FK id_punto_consegna_predefinito a va_clienti_anagrafica.');
  });
};


/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Rimuove le tabelle in ordine inverso di creazione e di dipendenza
  await knex.schema.alterTable('va_clienti_anagrafica', function(table) {
      table.dropForeign('id_punto_consegna_predefinito');
      table.dropColumn('id_punto_consegna_predefinito');
  });
  await knex.schema.dropTableIfExists('va_punti_consegna');
  await knex.schema.dropTableIfExists('va_clienti_anagrafica');
};
