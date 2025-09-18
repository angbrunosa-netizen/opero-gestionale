// MODIFICATO: migrations/20250919000100_create_stati_lettura_table.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  // NUOVO: Crea la tabella per memorizzare lo stato di lettura delle email per ogni utente.
  return knex.schema.createTable('stati_lettura', (table) => {
    // Foreign Key verso l'utente. Corrisponde a utenti.id (SIGNED INT)
    table.integer('id_utente').notNullable();
    table.foreign('id_utente').references('id').inTable('utenti').onDelete('CASCADE');

    // L'identificativo univoco (UID) dell'email sul server IMAP.
    // Usiamo una stringa per massima compatibilità.
    table.string('email_uid', 255).notNullable();

    // Chiave primaria composta: la combinazione di utente e UID dell'email deve essere unica.
    // Questo impedisce di salvare più volte che lo stesso utente ha letto la stessa email.
    table.primary(['id_utente', 'email_uid']);

    // Timestamp per tracciare quando l'email è stata letta per la prima volta.
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // Rimuove la tabella in caso di rollback.
  return knex.schema.dropTable('stati_lettura');
};