/**
 * @file migrations/20251021114500_create_password_reset_tokens_table.js
 * @description Migrazione Knex per creare la tabella `password_reset_tokens`.
 * @version 1.0
 * @date 2025-10-21
 *
 * @overview
 * Questa tabella è essenziale per il sistema di recupero password.
 * Memorizza in modo sicuro e temporaneo i token generati per le richieste di reset.
 *
 * Colonne create:
 * - id: Chiave primaria.
 * - id_utente: FK verso l'utente che ha richiesto il reset.
 * - token: Memorizza l'HASH del token di reset, non il token in chiaro, per massima sicurezza.
 * - expires_at: Timestamp di scadenza del token (es. 1 ora).
 */

exports.up = function(knex) {
  return knex.schema.createTable('password_reset_tokens', (table) => {
    table.increments('id').primary();
    
    table.integer('id_utente').unsigned().notNullable()
         .comment('FK all\'utente che ha richiesto il reset.');
    table.foreign('id_utente').references('id').inTable('utenti').onDelete('CASCADE');

    table.string('token').notNullable().unique()
         .comment('HASH del token di reset inviato all\'utente.');
    
    table.timestamp('expires_at').notNullable()
         .comment('Data e ora di scadenza del token.');
         
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Aggiungiamo un indice sulla colonna token per velocizzare le ricerche.
    table.index('token');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('password_reset_tokens');
};
