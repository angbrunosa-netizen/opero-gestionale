/**
 * @file migrations/YYYYMMDD..._add_default_to_codice_tipo_utente.js
 * @description Aggiunge un valore di default '1' alla colonna Codice_Tipo_Utente nella tabella ad_utenti_ditte.
 * @version 1.0
 */

const NOME_TABELLA = 'ad_utenti_ditte';
const NOME_COLONNA = 'Codice_Tipo_Utente';

exports.up = async function(knex) {
  console.log(`--- ESEGUO MIGRAZIONE: Aggiunta DEFAULT 1 a ${NOME_TABELLA}.${NOME_COLONNA} ---`);
  
  // Controlliamo se la colonna esiste
  const colonnaEsiste = await knex.schema.hasColumn(NOME_TABELLA, NOME_COLONNA);
  
  if (colonnaEsiste) {
    // Modifica la colonna per aggiungere NOT NULL e un DEFAULT
    await knex.schema.alterTable(NOME_TABELLA, function(table) {
      // Imposta la colonna come NOT NULL (non nullo) e assegna un default 1
      table.integer(NOME_COLONNA).notNullable().defaultTo(1).alter();
    });
    console.log(`OK: Colonna ${NOME_COLONNA} modificata con NOT NULL e DEFAULT 1.`);
  } else {
    console.warn(`WARN: Colonna ${NOME_COLONNA} non trovata in ${NOME_TABELLA}. Salto.`);
  }
};

exports.down = async function(knex) {
  console.log(`--- ESEGUO ROLLBACK: Rimozione DEFAULT da ${NOME_TABELLA}.${NOME_COLONNA} ---`);
  
  const colonnaEsiste = await knex.schema.hasColumn(NOME_TABELLA, NOME_COLONNA);

  if (colonnaEsiste) {
    // Rimuove il default e la imposta come NOT NULL (come era prima)
    await knex.schema.alterTable(NOME_TABELLA, function(table) {
      table.integer(NOME_COLONNA).notNullable().alter();
    });
    console.log(`OK: Rollback eseguito per ${NOME_COLONNA}.`);
  }
};