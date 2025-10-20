/**
 * @file migrations/20251019183500_create_ad_utenti_ditte_table.js
 * @description Versione corretta della migrazione per `ad_utenti_ditte`.
 * @version 1.2 (Correzione definitiva tipi UNSIGNED)
 *
 * @overview
 * La causa dell'errore "Foreign key constraint is incorrectly formed" era la
 * mancanza di `.unsigned()` sulle colonne delle chiavi esterne.
 * `table.increments('id')` crea una colonna INT UNSIGNED, quindi tutte le colonne
 * che la referenziano devono avere lo stesso tipo. Questa versione ripristina
 * la coerenza dei tipi di dato.
 */

exports.up = async function(knex) {
  const tableExists = await knex.schema.hasTable('ad_utenti_ditte');
  if (!tableExists) {
    return knex.schema.createTable('ad_utenti_ditte', (table) => {
      table.increments('id').primary();
      
      // --- CORREZIONE: .unsigned() è OBBLIGATORIO ---
      table.integer('id_utente').unsigned().notNullable(); 
      table.foreign('id_utente').references('utenti.id').onDelete('CASCADE');

      table.integer('id_ditta').unsigned().notNullable();
      table.foreign('id_ditta').references('ditte.id').onDelete('CASCADE');

      // --- CORREZIONE: .unsigned() è OBBLIGATORIO ---
      table.integer('id_ruolo').unsigned().notNullable();
      table.foreign('id_ruolo').references('ruoli.id');

      // --- CORREZIONE: .unsigned() è OBBLIGATORIO ---
      table.integer('Codice_Tipo_Utente').unsigned().notNullable();
      table.foreign('Codice_Tipo_Utente').references('tipi_utente.id');

      table.enum('stato', ['attivo', 'sospeso']).defaultTo('attivo').notNullable();
      table.boolean('is_default').defaultTo(false);

      table.timestamps(true, true);
      
      table.unique(['id_utente', 'id_ditta']); // Indice per evitare duplicati
    });
  }
};

exports.down = async function(knex) {
  return knex.schema.dropTableIfExists('ad_utenti_ditte');
};
