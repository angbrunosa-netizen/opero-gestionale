/**
 * @file migrations/20251016230000_create_portineria_security_features.js
 * @description File di migrazione Knex per implementare le fondamenta della "Portineria".
 * - Aggiunge i limiti delle licenze alla tabella 'ditte'.
 * - Aggiunge i campi per la protezione da brute-force alla tabella 'utenti'.
 * - Crea la tabella 'utenti_sessioni_attive' per il tracciamento delle sessioni.
 * @date 2025-10-16
 * @version 4.0 (Correzione Definitiva: Tipi di dato specifici per Foreign Keys)
 */

// ########## VERSIONE 4.0 (DEFINITIVA) ##########
// La funzione 'up' è stata corretta per usare `specificType` e garantire che le colonne
// per le foreign key corrispondano ESATTAMENTE al tipo delle colonne di riferimento (es. INT(10) UNSIGNED),
// risolvendo l'errore "errno: 150".
exports.up = async function(knex) {
  // 1. Modifica alla tabella 'ditte' per aggiungere i limiti delle licenze
  const ditteHasLicenze = await knex.schema.hasColumn('ditte', 'max_utenti_interni');
  if (!ditteHasLicenze) {
    console.log("Aggiungo colonne licenze a tabella ditte...");
    await knex.schema.alterTable('ditte', function(table) {
      table.integer('max_utenti_interni').unsigned().notNullable().defaultTo(0).comment('Numero massimo di utenti interni concorrenti');
      table.integer('max_utenti_esterni').unsigned().notNullable().defaultTo(0).comment('Numero massimo di utenti esterni concorrenti');
    });
  }

  // 2. Modifica alla tabella 'utenti' per la protezione da brute-force
  const utentiHasSicurezza = await knex.schema.hasColumn('utenti', 'tentativi_falliti');
  if (!utentiHasSicurezza) {
    console.log("Aggiungo colonne sicurezza a tabella utenti...");
    await knex.schema.alterTable('utenti', function(table) {
      table.integer('tentativi_falliti').unsigned().notNullable().defaultTo(0).comment('Contatore per tentativi di login falliti');
      table.enum('stato', ['attivo', 'bloccato']).notNullable().defaultTo('attivo').comment('Stato dell\'account utente');
    });
  }

  // 3. Creazione della tabella 'utenti_sessioni_attive' con i tipi di dato corretti
  const sessioniExists = await knex.schema.hasTable('utenti_sessioni_attive');
  if (!sessioniExists) {
    console.log("Creo la struttura della tabella utenti_sessioni_attive...");
    await knex.schema.createTable('utenti_sessioni_attive', function(table) {
      // CORREZIONE: Usa specificType per matchare INT(10) UNSIGNED di `utenti`.`id`
      table.specificType('id_utente', 'int(10) unsigned').primary().comment('Chiave primaria e riferimento all\'utente');
      
      // CORREZIONE: Usa specificType per matchare INT(10) UNSIGNED di `ditte`.`id`
      table.specificType('id_ditta_attiva', 'int(10) unsigned').notNullable().comment('Riferimento alla ditta della sessione attiva');
      
      table.timestamp('login_timestamp').defaultTo(knex.fn.now());
      table.timestamp('last_heartbeat_timestamp').defaultTo(knex.fn.now());
    });
    
    // 4. AGGIUNTA DEI VINCOLI (FOREIGN KEYS) - questa parte ora funzionerà
    console.log("Aggiungo i vincoli di foreign key a utenti_sessioni_attive...");
    await knex.schema.alterTable('utenti_sessioni_attive', function(table) {
        table.foreign('id_utente').references('id').inTable('utenti').onDelete('CASCADE');
        table.foreign('id_ditta_attiva').references('id').inTable('ditte').onDelete('CASCADE');
    });
  }
};


// La funzione 'down' rimane sequenziale e sicura.
exports.down = async function(knex) {
  // 1. Rimuove la tabella 'utenti_sessioni_attive'
  await knex.schema.dropTableIfExists('utenti_sessioni_attive');

  // 2. Rimuove le colonne dalla tabella 'utenti'
  const utentiHasSicurezza = await knex.schema.hasColumn('utenti', 'stato');
  if (utentiHasSicurezza) {
    console.log("Rimuovo colonne sicurezza da tabella utenti...");
    await knex.schema.alterTable('utenti', function(table) {
      table.dropColumn('stato');
      table.dropColumn('tentativi_falliti');
    });
  }

  // 3. Rimuove le colonne dalla tabella 'ditte'
  const ditteHasLicenze = await knex.schema.hasColumn('ditte', 'max_utenti_esterni');
  if (ditteHasLicenze) {
    console.log("Rimuovo colonne licenze da tabella ditte...");
    await knex.schema.alterTable('ditte', function(table) {
      table.dropColumn('max_utenti_esterni');
      table.dropColumn('max_utenti_interni');
    });
  }
};

