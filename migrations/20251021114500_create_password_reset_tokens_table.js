/**
 * @file migrations/20251022131500_create_password_reset_tokens_table.js
 * @description Crea la tabella per la gestione dei token di reset password.
 * @version 1.0 (Versione Standard UNSIGNED)
 * @date 2025-10-22
 *
 * @overview
 * Crea la tabella `password_reset_tokens` utilizzando `UNSIGNED` per `id_utente`,
 * ora che la tabella `utenti` è stata standardizzata.
 */

exports.up = async function(knex) {
  // Aggiunto controllo per rendere lo script eseguibile più volte senza errori (idempotente)
  if (!(await knex.schema.hasTable('password_reset_tokens'))) {
    console.log('INFO: Creazione tabella `password_reset_tokens`...');
    return knex.schema.createTable('password_reset_tokens', table => {
      table.increments('id').primary();
      
      // Ora possiamo usare .unsigned() perché utenti.id è UNSIGNED
      table.integer('id_utente').unsigned().notNullable().comment('FK all\'utente che ha richiesto il reset.');
      table.foreign('id_utente').references('id').inTable('utenti').onDelete('CASCADE');

      table.string('token').notNullable().unique().comment('HASH del token di reset inviato all\'utente.');
      table.timestamp('expires_at').notNullable().comment('Data e ora di scadenza del token.');
      table.timestamp('created_at').defaultTo(knex.fn.now());

      table.index('token');
    });
  } else {
    console.log('WARN: La tabella `password_reset_tokens` esiste già. Creazione saltata.');
  }
};

exports.down = function(knex) {
  console.log('INFO: Rimozione tabella `password_reset_tokens`...');
  return knex.schema.dropTableIfExists('password_reset_tokens');
};

