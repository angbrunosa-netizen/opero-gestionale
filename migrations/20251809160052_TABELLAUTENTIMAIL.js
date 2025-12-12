// MODIFICATO: migrations/20251809160052_TABELLAUTENTIMAIL.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.hasTable('utente_mail_accounts')
    .then(exists => {
      if (exists) {
        console.log('Tabella utente_mail_accounts già esistente, salto creazione');
        return Promise.resolve();
      }

      return knex.schema.createTable('utente_mail_accounts', (table) => {
        // Corretto: Rimosso .unsigned() per farlo corrispondere a 'utenti.id'
        table.integer('id_utente').notNullable();
        table.foreign('id_utente').references('id').inTable('utenti').onDelete('CASCADE');

        // Corretto: Rimosso .unsigned() anche da questa colonna per farlo corrispondere a 'ditta_mail_accounts.id'
        table.integer('id_mail_account').notNullable();
        table.foreign('id_mail_account').references('id').inTable('ditta_mail_accounts').onDelete('CASCADE');

        table.primary(['id_utente', 'id_mail_account']);
        table.timestamps(true, true);
      });
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('utente_mail_accounts');
};