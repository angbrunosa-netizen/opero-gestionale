/**
 * File: /migrations/20251104131500_add_dms_tables_and_quota.js
 *
 * Versione: 1.0.0
 *
 * Descrizione: Questa migrazione Knex implementa l'architettura database
 * per il Modulo Gestione Documentale (DMS).
 * 1. Aggiunge i campi 'max_storage_mb' e 'current_storage_bytes' alla tabella 'ditte' per la gestione dei Piani.
 * 2. Crea la tabella 'dm_files' per i metadati dei file.
 * 3. Crea la tabella 'dm_allegati_link' per collegare i file alle entità del gestionale.
 *
 * Utilizzo:
 * Eseguire questa migrazione per aggiornare lo schema del database:
 * `npx knex migrate:latest`
 */

exports.up = function(knex) {
  return knex.schema
    // 1. Aggiorna la tabella 'ditte' per aggiungere i campi per i Piani
    .alterTable('ditte', (table) => {
      // Spazio massimo (in MB) allocato alla ditta. Default 1000MB (1GB).
      table.integer('max_storage_mb').unsigned().notNullable().defaultTo(1000);
      // Contatore (in Byte) dello spazio attualmente utilizzato.
      table.bigInteger('current_storage_bytes').unsigned().notNullable().defaultTo(0);
    })
    // 2. Crea la tabella 'dm_files' (Anagrafica dei file fisici)
    .createTable('dm_files', (table) => {
      table.increments('id').primary();
      
      // Chiave esterna per la ditta proprietaria del file
      table.integer('id_ditta').unsigned().notNullable().references('id').inTable('ditte').onDelete('CASCADE');
      
      // Chiave esterna per l'utente che ha caricato il file (per audit)
      table.integer('id_utente_upload').unsigned().references('id').inTable('utenti').onDelete('SET NULL');
      
      table.string('file_name_originale', 255).notNullable();
      table.bigInteger('file_size_bytes').unsigned().notNullable().defaultTo(0);
      table.string('mime_type', 100);
      
      // La chiave univoca (path) del file su S3. Es: 'ditta_1/allegati/uuid-file.pdf'
      table.string('s3_key', 512).notNullable().unique();
      
      table.timestamps(true, true);
    })
    // 3. Crea la tabella 'dm_allegati_link' (Tabella di collegamento)
    .createTable('dm_allegati_link', (table) => {
      table.increments('id').primary();
      
      // Chiave esterna per la ditta (per segmentazione dati e sicurezza)
      table.integer('id_ditta').unsigned().notNullable().references('id').inTable('ditte').onDelete('CASCADE');
      
      // Chiave esterna per il file fisico in anagrafica
      table.integer('id_file').unsigned().notNullable().references('id').inTable('dm_files').onDelete('CASCADE');
      
      // Campi "polimorfici" per definire a cosa è collegato il file
      table.string('entita_tipo', 50).notNullable(); // Es. 'sc_registrazione', 'bs_bene'
      table.integer('entita_id').unsigned().notNullable(); // Es. 123
      
      table.timestamps(true, true);
      
      // Indice per velocizzare le ricerche (es. "trova tutti i file per il bene 123")
      table.index(['entita_tipo', 'entita_id']);
    });
};

exports.down = function(knex) {
  return knex.schema
    // Rimuove le tabelle in ordine inverso di creazione
    .dropTableIfExists('dm_allegati_link')
    .dropTableIfExists('dm_files')
    // Rimuove le colonne dalla tabella 'ditte'
    .alterTable('ditte', (table) => {
      table.dropColumn('max_storage_mb');
      table.dropColumn('current_storage_bytes');
    });
};
