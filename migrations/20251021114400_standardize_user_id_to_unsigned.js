/**
 * @file migrations/20251021114400_standardize_user_id_to_unsigned.js
 * @description Migrazione Strutturale Definitiva per standardizzare `utenti.id` a INT UNSIGNED.
 * @version 2.9 (Correzione Case-Sensitivity)
 * @date 2025-10-21
 *
 * @overview
 * Versione corretta che risolve il problema di case-sensitivity sulla colonna 'id_utente_esecuzione'.
 * Il nome della colonna in `ppa_istanzeazioni` è stato corretto da 'ID_UTENTE_ESECUZIONE' a 'id_utente_esecuzione'.
 */

// --- CENSIMENTO DEFINITIVO (v3.1) ---
const foreignKeys = [
  { table: 'ad_utenti_ditte', column: 'id_utente', constraint: 'ad_utenti_ditte_id_utente_foreign' },
  { table: 'bs_attivita', column: 'id_utente_utilizzatore', constraint: 'bs_attivita_id_utente_utilizzatore_foreign' },
  { table: 'ct_codici_fornitore', column: 'created_by', constraint: 'ct_codici_fornitore_created_by_foreign' },
  { table: 'ct_ean', column: 'created_by', constraint: 'ct_ean_created_by_foreign' },
  { table: 'email_inviate', column: 'id_utente_mittente', constraint: 'email_inviate_ibfk_1' }, 
  { table: 'email_nascoste', column: 'id_utente', constraint: 'email_nascoste_ibfk_1' },
  { table: 'lista_distribuzione_utenti', column: 'id_utente', constraint: 'ldu_ibfk_2' },
  { table: 'log_accessi', column: 'id_utente', constraint: 'log_accessi_ibfk_1' },
  { table: 'log_azioni', column: 'id_utente', constraint: 'log_azioni_ibfk_1' },
  { table: 'mg_movimenti', column: 'id_utente', constraint: 'mg_movimenti_id_utente_foreign' },
  // --- CORREZIONE ---
  { table: 'ppa_istanzeazioni', column: 'id_utente_esecuzione', constraint: 'ppa_istanzeazioni_ibfk_3'},
  { table: 'ppa_istanzeprocedure', column: 'ID_UtenteCreatore', constraint: 'ppa_istanzeprocedure_ibfk_3' },
  { table: 'ppa_teammembri', column: 'id_utente', constraint: 'ppa_teammembri_ibfk_1' },
  { table: 'registration_tokens', column: 'id_utente', constraint: 'registration_tokens_ibfk_1' },
  { table: 'utente_mail_accounts', column: 'id_utente', constraint: 'utente_mail_accounts_ibfk_1' },
  { table: 'utente_scorciatoie', column: 'id_utente', constraint: 'utente_scorciatoie_id_utente_foreign' },
  { table: 'utenti_funzioni_override', column: 'id_utente', constraint: 'utenti_funzioni_override_id_utente_foreign' },
  { table: 'utenti_sessioni_attive', column: 'id_utente', constraint: 'utenti_sessioni_attive_ibfk_1' },
];

const allChildColumns = foreignKeys.map(fk => ({ nomeTabella: fk.table, nomeColonna: fk.column }));

exports.up = async function(knex) {
  console.log('--- AVVIO MIGRAZIONE STRUTTURALE UTENTI.ID (v2.9) ---');

  console.log('Fase 1: Rimozione delle Foreign Keys...');
  for (const { table, constraint } of foreignKeys) {
    if (await knex.schema.hasTable(table)) {
      try {
        await knex.raw(`ALTER TABLE \`${table}\` DROP FOREIGN KEY \`${constraint}\``);
        console.log(`OK: Vincolo FK '${constraint}' rimosso da '${table}'.`);
      } catch (e) {
        if (e.code === 'ER_CANT_DROP_FIELD_OR_KEY') { console.log(`WARN: Vincolo FK '${constraint}' non trovato o già rimosso.`); } 
        else { throw e; }
      }
    }
  }

  console.log('Fase 2: Modifica delle colonne figlie in UNSIGNED...');
  for (const { nomeTabella, nomeColonna } of allChildColumns) {
    if (await knex.schema.hasTable(nomeTabella) && await knex.schema.hasColumn(nomeTabella, nomeColonna)) {
        await knex.raw(`ALTER TABLE \`${nomeTabella}\` MODIFY \`${nomeColonna}\` INT UNSIGNED NULL`);
    }
  }
  
  console.log('Fase 3: Modifica della chiave primaria `utenti.id` in UNSIGNED...');
  await knex.raw('ALTER TABLE `utenti` MODIFY `id` INT UNSIGNED NOT NULL AUTO_INCREMENT');

  console.log('Fase 4: Ricreazione delle Foreign Keys...');
  for (const { table, column, constraint } of foreignKeys) {
    if (await knex.schema.hasTable(table) && await knex.schema.hasColumn(table, column)) {
        await knex.raw(`ALTER TABLE \`${table}\` ADD CONSTRAINT \`${constraint}\` FOREIGN KEY (\`${column}\`) REFERENCES \`utenti\`(\`id\`) ON DELETE CASCADE`);
    }
  }
  console.log('--- MIGRAZIONE STRUTTURALE COMPLETATA CON SUCCESSO ---');
};

exports.down = async function(knex) {
    console.log('--- AVVIO ROLLBACK MIGRAZIONE STRUTTURALE ---');
    
    // Fase 1 [DOWN]: Rimuovi le nuove FK
    for (const { table, constraint } of foreignKeys) {
        if (await knex.schema.hasTable(table)) {
          try {
            await knex.raw(`ALTER TABLE \`${table}\` DROP FOREIGN KEY \`${constraint}\``);
          } catch (e) {
            // Ignora errori se il vincolo non esiste
          }
        }
    }

    // Fase 2 [DOWN]: Ripristina utenti.id a SIGNED
    await knex.raw('ALTER TABLE `utenti` MODIFY `id` INT(11) NOT NULL AUTO_INCREMENT');

    // Fase 3 [DOWN]: Ripristina le colonne figlie a SIGNED
    for (const { nomeTabella, nomeColonna } of allChildColumns) {
        if (await knex.schema.hasTable(nomeTabella) && await knex.schema.hasColumn(nomeTabella, nomeColonna)) {
            await knex.raw(`ALTER TABLE \`${nomeTabella}\` MODIFY \`${nomeColonna}\` INT(11) NULL`);
        }
    }

    // Fase 4 [DOWN]: Ricrea le FK originali
    for (const { table, column, constraint } of foreignKeys) {
        if (await knex.schema.hasTable(table) && await knex.schema.hasColumn(table, column)) {
            await knex.raw(`ALTER TABLE \`${table}\` ADD CONSTRAINT \`${constraint}\` FOREIGN KEY (\`${column}\`) REFERENCES \`utenti\`(\`id\`) ON DELETE CASCADE`);
        }
    }
    console.log('--- ROLLBACK COMPLETATO ---');
};
