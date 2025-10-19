/**
 * File: 20251019183500_create_ad_utenti_ditte_table.js
 * Percorso: /migrations/
 * Versione: 1.1
 * Descrizione: Questo file di migrazione Knex crea la tabella 'ad_utenti_ditte'.
 * Questa tabella è fondamentale per implementare la funzionalità multi-ditta.
 * Versione 1.1: Corregge il tipo di dato delle foreign keys per combaciare con le tabelle referenziate
 * e aggiunge un controllo sull'esistenza della tabella per maggiore robustezza.
 */

exports.up = async function(knex) {
  // La funzione 'up' viene eseguita quando applichiamo la migrazione.
  // Prima controlla se la tabella esiste già per evitare errori.
  const tableExists = await knex.schema.hasTable('ad_utenti_ditte');
  if (!tableExists) {
    return knex.schema.createTable('ad_utenti_ditte', (table) => {
      table.increments('id').primary(); // Chiave primaria auto-incrementante
      
      // Foreign Key per l'utente (rimosso .unsigned() per compatibilità con utenti.id)
      table.integer('id_utente').notNullable(); 
      table.foreign('id_utente').references('utenti.id').onDelete('CASCADE');

      // Foreign Key per la ditta (mantenuto .unsigned() perché ditte.id è unsigned)
      table.integer('id_ditta').unsigned().notNullable();
      table.foreign('id_ditta').references('ditte.id').onDelete('CASCADE');

      // Foreign Key per il ruolo (rimosso .unsigned() per compatibilità con ruoli.id)
      table.integer('id_ruolo').notNullable();
      table.foreign('id_ruolo').references('ruoli.id');

      // Foreign Key per il tipo utente (rimosso .unsigned() per compatibilità con tipi_utente.id)
      table.integer('Codice_Tipo_Utente').notNullable();
      table.foreign('Codice_Tipo_Utente').references('tipi_utente.id');

      table.enum('stato', ['attivo', 'sospeso']).defaultTo('attivo').notNullable();
      table.boolean('is_default').defaultTo(false);

      table.timestamps(true, true);
      
      table.index(['id_utente', 'id_ditta']);
    });
  }
};

exports.down = async function(knex) {
  // La funzione 'down' viene eseguita quando annulliamo la migrazione (rollback).
  // Controlla se la tabella esiste prima di tentare di eliminarla.
  const tableExists = await knex.schema.hasTable('ad_utenti_ditte');
  if (tableExists) {
    return knex.schema.dropTable('ad_utenti_ditte');
  }
};