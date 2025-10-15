/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  // Controlla se la tabella esiste già prima di tentare di crearla
  return knex.schema.hasTable('va_matrici_sconti').then(function(exists) {
    if (!exists) {
      return knex.schema.createTable('va_matrici_sconti', function(table) {
        // Struttura della tabella tradotta dal file .sql
        table.increments('id').primary();
        table.integer('id_ditta').unsigned().notNullable();
        table.string('codice', 50).notNullable();
        table.string('descrizione', 255);
        table.timestamps(true, true);

        // Definizione delle chiavi e degli indici
        table.foreign('id_ditta').references('ditte.id').onDelete('CASCADE');
        table.unique(['id_ditta', 'codice']);
      });
    }
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // Il comando dropTableIfExists è sicuro e non dà errore se la tabella non esiste
  return knex.schema.dropTableIfExists('va_matrici_sconti');
};
