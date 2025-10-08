/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Controlla se la tabella esiste già per rendere lo script rieseguibile
  const tableExists = await knex.schema.hasTable('va_gruppi_clienti');

  if (!tableExists) {
    await knex.schema.createTable('va_gruppi_clienti', function(table) {
      // --- Campi Standard ---
      table.increments('id').primary();
      
      // --- Foreign Key per Multi-tenancy ---
      // Assicura che ogni gruppo appartenga a una ditta specifica
      table.integer('id_ditta').unsigned().notNullable();
      table.foreign('id_ditta').references('id').inTable('ditte').onDelete('CASCADE');
      
      // --- Dati Specifici del Gruppo ---
      table.string('codice', 50).notNullable();
      table.string('descrizione', 255).notNullable();
      
      // --- Timestamps Automatici ---
      table.timestamps(true, true);
      
      // --- Vincoli e Indici ---
      // Assicura che il codice del gruppo sia unico per ogni ditta
      table.unique(['id_ditta', 'codice']);
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // Il comando dropTableIfExists è sicuro e non darà errori se la tabella è già stata rimossa
  return knex.schema.dropTableIfExists('va_gruppi_clienti');
};
