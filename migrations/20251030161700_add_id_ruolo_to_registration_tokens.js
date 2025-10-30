/**
 * @file migrations/YYYYMMDDHHMMSS_add_id_ruolo_to_registration_tokens.js
 * @description Aggiunge la colonna id_ruolo alla tabella registration_tokens (con controllo di esistenza).
 * @version 2.0
 */

const NOME_TABELLA = 'registration_tokens';
const NOME_COLONNA = 'id_ruolo';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  console.log(`--- ESEGUO MIGRAZIONE: Controllo e aggiunta colonna ${NOME_COLONNA} a ${NOME_TABELLA} ---`);

  // 1. Controlla se la tabella esiste
  const tabellaEsiste = await knex.schema.hasTable(NOME_TABELLA);
  if (!tabellaEsiste) {
    console.warn(`WARN: Tabella ${NOME_TABELLA} non trovata. Salto migrazione UP.`);
    return;
  }

  // 2. Controlla se la colonna esiste già
  const colonnaEsiste = await knex.schema.hasColumn(NOME_TABELLA, NOME_COLONNA);

  if (colonnaEsiste) {
    console.log(`INFO: La colonna ${NOME_COLONNA} esiste già in ${NOME_TABELLA}. Salto creazione.`);
    return; // Colonna già presente, migrazione "up" completata
  }

  // 3. Se non esiste, la aggiungiamo
  console.log(`INFO: Colonna ${NOME_COLONNA} non trovata. La aggiungo a ${NOME_TABELLA}...`);
  await knex.schema.table(NOME_TABELLA, function(table) {
    // Aggiungo la colonna id_ruolo, la imposto come nullable
    // e la collego alla tabella ruoli.
    table.integer(NOME_COLONNA).unsigned().nullable().after('id_ditta');
    
    // Opzionale: Aggiungi la chiave esterna se vuoi un vincolo di integrità
    // table.foreign(NOME_COLONNA).references('id').inTable('ruoli');
  });
  console.log(`OK: Colonna ${NOME_COLONNA} aggiunta con successo a ${NOME_TABELLA}.`);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  console.log(`--- ESEGUO ROLLBACK: Controllo e rimozione colonna ${NOME_COLONNA} da ${NOME_TABELLA} ---`);

  // 1. Controlla se la tabella esiste
  const tabellaEsiste = await knex.schema.hasTable(NOME_TABELLA);
  if (!tabellaEsiste) {
    console.warn(`WARN: Tabella ${NOME_TABELLA} non trovata. Salto migrazione DOWN.`);
    return;
  }

  // 2. Controlla se la colonna esiste
  const colonnaEsiste = await knex.schema.hasColumn(NOME_TABELLA, NOME_COLONNA);

  if (!colonnaEsiste) {
    console.log(`INFO: La colonna ${NOME_COLONNA} non esiste in ${NOME_TABELLA}. Salto rimozione.`);
    return; // Colonna già assente, migrazione "down" completata
  }

  // 3. Se esiste, la rimuoviamo
  console.log(`INFO: Colonna ${NOME_COLONNA} trovata. La rimuovo da ${NOME_TABELLA}...`);
  await knex.schema.table(NOME_TABELLA, function(table) {
    // Rimuovi prima la FK se l'hai aggiunta in UP
    // table.dropForeign(NOME_COLONNA);
    
    table.dropColumn(NOME_COLONNA);
  });
  console.log(`OK: Colonna ${NOME_COLONNA} rimossa con successo da ${NOME_TABELLA}.`);
};