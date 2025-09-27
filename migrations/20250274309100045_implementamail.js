/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.table('email_inviate', function(table) {
    // Aggiungiamo i campi per il contesto aziendale.
    // Sono nullable per mantenere la compatibilità con le email vecchie.
    table.integer('id_ditta').unsigned().nullable().after('id');
    table.foreign('id_ditta').references('id').inTable('ditte').onDelete('SET NULL');
    
    // ## CORREZIONE: Rimosso .unsigned() per allineare il tipo di dato ##
    // La colonna 'id' in 'ditta_mail_accounts' è un INT standard, non UNSIGNED.
    table.integer('id_mail_account').nullable().after('id_utente_mittente');
    table.foreign('id_mail_account').references('id').inTable('ditta_mail_accounts').onDelete('SET NULL');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.table('email_inviate', function(table) {
    // Le operazioni di rollback devono corrispondere
    table.dropForeign('id_ditta');
    table.dropForeign('id_mail_account');
    table.dropColumn('id_ditta');
    table.dropColumn('id_mail_account');
  });
};