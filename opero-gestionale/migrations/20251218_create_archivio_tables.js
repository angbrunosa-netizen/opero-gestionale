/**
 * Nome File: 20251218_create_archivio_tables.js
 * Percorso: opero-gestionale/migrations/
 * Data: 18/12/2025
 * Descrizione: Creazione tabelle per il sistema archivio documentale (AllegatiManager)
 */

exports.up = function(knex) {
  return knex.schema
    // Tabella principale per i file documentali
    .createTable('dm_files', function(table) {
      table.increments('id').primary();
      table.integer('id_ditta').notNullable().index();
      table.string('file_name_originale', 255).notNullable();
      table.string('file_name_salvato', 255).notNullable();
      table.string('file_path', 500).notNullable();
      table.string('file_type', 100).notNullable();
      table.string('file_mime_type', 100).notNullable();
      table.integer('file_size').notNullable();
      table.string('file_hash', 64).notNullable(); // SHA-256
      table.text('file_descrizione').nullable();
      table.string('privacy', 20).defaultTo('private').notNullable(); // private, public, internal
      table.integer('id_utente_upload').notNullable().index();
      table.timestamps(true, true);

      // Indici
      table.index(['id_ditta', 'privacy']);
      table.index(['file_type']);
      table.unique(['file_name_salvato']);
    })

    // Tabella per collegare file a entità
    .createTable('dm_allegati_link', function(table) {
      table.increments('id').primary();
      table.integer('id_ditta').notNullable().index();
      table.integer('id_file').notNullable().references('id').inTable('dm_files').onDelete('CASCADE');
      table.string('entita_tipo', 50).notNullable(); // Blog, Documento, Utente, etc.
      table.integer('entita_id').notNullable();
      table.string('folder_path', 255).nullable(); // Percorso cartella virtuale
      table.text('note').nullable();
      table.integer('id_utente').notNullable();
      table.timestamps(true, true);

      // Indici
      table.index(['id_ditta', 'entita_tipo', 'entita_id']);
      table.index(['entita_tipo', 'entita_id']);
      table.unique(['id_file', 'entita_tipo', 'entita_id'], 'uk_file_entita');
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('dm_allegati_link')
    .dropTableIfExists('dm_files');
};