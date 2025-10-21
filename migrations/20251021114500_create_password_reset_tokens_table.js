/**
 * @file migrations/20251021114500_create_password_reset_tokens_table.js
 * @description Crea la tabella per la gestione dei token di reset password.
 * @version 1.1 (Idempotente)
 * @date 2025-10-21
 *
 * @overview
 * Questa migrazione crea la tabella `password_reset_tokens`.
 * v1.1: Aggiunto controllo `hasTable` per rendere lo script eseguibile più volte senza errori.
 */

exports.up = async function(knex) {
  if (!(await knex.schema.hasTable('password_reset_tokens'))) {
    console.log('INFO: Creazione tabella `password_reset_tokens`...');
    return knex.schema.createTable('password_reset_tokens', table => {
      table.increments('id').primary();
      table.integer('id_utente').unsigned().notNullable().comment('FK all\'utente che ha richiesto il reset.');
      table.string('token').notNullable().comment('HASH del token di reset inviato all\'utente.');
      table.timestamp('expires_at').notNullable().comment('Data e ora di scadenza del token.');
      table.timestamp('created_at').defaultTo(knex.fn.now());

      // Aggiungo la Foreign Key per integrità referenziale
      table.foreign('id_utente').references('id').inTable('utenti').onDelete('CASCADE');
    });
  } else {
    console.log('WARN: La tabella `password_reset_tokens` esiste già. Creazione saltata.');
  }
};

exports.down = function(knex) {
  console.log('INFO: Rimozione tabella `password_reset_tokens`...');
  return knex.schema.dropTableIfExists('password_reset_tokens');
};
