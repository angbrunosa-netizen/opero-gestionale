/**
 * File di migrazione Knex
 * Aggiunge la colonna 'privacy' alla tabella 'dm_files'
 * per distinguere i file pubblici (catalogo) da quelli privati.
 */

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.table('dm_files', (table) => {
    // Aggiunge la colonna 'privacy'
    // ENUM('private', 'public') - Accetta solo questi due valori
    // NOT NULLABLE - Deve avere un valore
    // DEFAULT 'private' - Valore predefinito per tutti i file esistenti e futuri
    // AFTER 'mime_type' - La posiziona dopo 'mime_type' come da SQL
    table.enum('privacy', ['private', 'public'])
         .notNullable()
         .defaultTo('private')
         .after('mime_type');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // La funzione 'down' fa il contrario: rimuove la colonna
  return knex.schema.table('dm_files', (table) => {
    table.dropColumn('privacy');
  });
};