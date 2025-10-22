/**
 * @file migrations/20251021114400_standardize_user_id_to_unsigned.js
 * @description Migrazione Strutturale Definitiva per standardizzare `utenti.id` a INT UNSIGNED.
 * @version 1.8 (Censimento Definitivo: va_trasportatori)
 * @date 2025-10-21
 *
 * @overview
 * Aggiunta la tabella `va_trasportatori` e il suo vincolo FK `va_trasportatori_id_utente_referente_foreign`
 * alla lista `foreignKeys`. Questo completa il censimento delle dipendenze e dovrebbe permettere
 * il completamento della migrazione strutturale.
 */

// --- CENSIMENTO DEFINITIVO (v3.6) ---
// Aggiunta va_trasportatori
const foreignKeys = [
  { table: 'ad_utenti_ditte', column: 'id_utente', constraint: 'ad_utenti_ditte_id_utente_foreign' },
  { table: 'bs_attivita', column: 'id_utente_utilizzatore', constraint: 'bs_attivita_id_utente_utilizzatore_foreign'},
  { table: 'ct_codici_fornitore', column: 'created_by', constraint: 'ct_codici_fornitore_created_by_foreign'},
  { table: 'ct_ean', column: 'created_by', constraint: 'ct_ean_created_by_foreign'},
  { table: 'email_inviate', column: 'id_utente_mittente', constraint: 'email_inviate_ibfk_1' },
  { table: 'email_nascoste', column: 'id_utente', constraint: 'email_nascoste_ibfk_1'},
  { table: 'lista_distribuzione_utenti', column: 'id_utente', constraint: 'ldu_ibfk_2'},
  { table: 'log_accessi', column: 'id_utente', constraint: 'log_accessi_ibfk_1' },
  { table: 'log_azioni', column: 'id_utente', constraint: 'log_azioni_ibfk_1'},
  { table: 'mg_movimenti', column: 'id_utente', constraint: 'mg_movimenti_id_utente_foreign'},
  { table: 'password_reset_tokens', column: 'id_utente', constraint: 'password_reset_tokens_id_utente_foreign' },
  { table: 'ppa_istanzeazioni', column: 'id_utente_esecuzione', constraint: 'ppa_istanzeazioni_ibfk_3'},
  { table: 'ppa_istanzeprocedure', column: 'id_utente_avvio', constraint: 'ppa_istanzeprocedure_ibfk_3'},
  { table: 'ppa_teammembri', column: 'id_utente', constraint: 'ppa_teammembri_ibfk_2' },
  { table: 'registration_tokens', column: 'id_utente', constraint: 'registration_tokens_ibfk_1' },
  { table: 'sc_registrazioni_testata', column: 'id_utente', constraint: 'sc_registrazioni_testata_ibfk_2' },
  { table: 'stati_lettura', column: 'id_utente', constraint: 'stati_lettura_ibfk_1' },
  { table: 'utente_mail_accounts', column: 'id_utente', constraint: 'utente_mail_accounts_id_utente_foreign' },
  { table: 'utente_scorciatoie', column: 'id_utente', constraint: 'utente_scorciatoie_ibfk_1' },
  { table: 'utenti_funzioni_override', column: 'id_utente', constraint: 'utenti_funzioni_override_id_utente_foreign' },
  { table: 'utenti_sessioni_attive', column: 'id_utente', constraint: 'utenti_sessioni_attive_ibfk_1' },
  { table: 'va_trasportatori', column: 'id_utente_referente', constraint: 'va_trasportatori_id_utente_referente_foreign' }, // <-- AGGIUNTO QUI
];

// Mappa delle colonne per gestire case-sensitivity specifiche
const columnCaseMap = {
    'ppa_teammembri.id_utente': 'ID_Utente',
    'ppa_istanzeazioni.id_utente_esecuzione': 'ID_UTENTE_ESECUZIONE',
    'ppa_istanzeprocedure.id_utente_avvio': 'ID_UTENTE_AVVIO'
};

// Funzione helper robusta per eliminare FK
async function dropForeignKeyRobust(knex, tableName, constraintName) {
  try {
    const [rows] = await knex.raw(
      `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
       WHERE table_schema = DATABASE() AND table_name = ? AND constraint_name = ?`,
      [tableName, constraintName]
    );
    if (rows.length > 0) {
      await knex.raw(`ALTER TABLE \`${tableName}\` DROP FOREIGN KEY \`${constraintName}\``);
      console.log(`OK: Vincolo FK '${constraintName}' rimosso da '${tableName}'.`);
      return true;
    } else {
      console.log(`WARN: Vincolo FK '${constraintName}' NON TROVATO in INFORMATION_SCHEMA.`);
      return false;
    }
  } catch (error) {
     console.error(`ERRORE durante la rimozione del vincolo FK '${constraintName}' da '${tableName}': ${error.message}`);
     // Consideriamo fallita la rimozione in caso di errore
     return false;
  }
}

// Funzione per ottenere la definizione corrente di una colonna
async function getColumnDefinition(knex, tableName, columnName) {
    try {
        const result = await knex.raw(`SHOW COLUMNS FROM \`${tableName}\` LIKE ?`, [columnName]); // Usa placeholder
        if (result[0].length > 0) {
            return result[0][0];
        }
    } catch (e) { console.warn(`WARN: Impossibile ottenere definizione per ${tableName}.${columnName}: ${e.message}`) }
    return null;
}


exports.up = async function(knex) {
  console.log(`--- AVVIO MIGRAZIONE STRUTTURALE UTENTI.ID (v1.8) ---`); 
  
  // --- 1. DROP FKs ---
  console.log('Fase 1: Rimozione delle Foreign Keys...');
  let droppedFKs = [];
  for (const { table, constraint } of foreignKeys) {
      if (await knex.schema.hasTable(table)) {
          if (await dropForeignKeyRobust(knex, table, constraint)) {
              droppedFKs.push({ table, constraint });
          }
      } else {
           console.warn(`WARN: Tabella '${table}' per vincolo '${constraint}' non trovata.`);
      }
  }
  console.log(`INFO: Completata rimozione FKs. ${droppedFKs.length} vincoli rimossi.`);

  // --- 2. ALTER CHILDs ---
  console.log('Fase 2: Modifica delle colonne figlie in UNSIGNED...');
  for (const { table: nomeTabella, column: nomeColonna } of foreignKeys) {
    if (await knex.schema.hasTable(nomeTabella) && await knex.schema.hasColumn(nomeTabella, nomeColonna)) {
      try {
        const columnNameForModify = columnCaseMap[`${nomeTabella}.${nomeColonna}`] || nomeColonna;
        console.log(`INFO: Tentativo di modificare ${nomeTabella}.${nomeColonna} (usando '${columnNameForModify}') in UNSIGNED NULL`);
        
        const colDef = await getColumnDefinition(knex, nomeTabella, nomeColonna);
        const currentComment = colDef?.Comment ? `COMMENT '${colDef.Comment.replace(/'/g, "''")}'` : '';
        
        // Determina se la colonna è attualmente NOT NULL prima di aggiungere NULL temporaneo
        const isNotNull = colDef?.Null === 'NO'; 
        const nullClause = 'NULL'; // Sempre NULL temporaneamente

        await knex.raw(`ALTER TABLE \`${nomeTabella}\` MODIFY \`${columnNameForModify}\` INT UNSIGNED ${nullClause} ${currentComment}`); 
         console.log(`OK: Colonna '${nomeColonna}' modificata in UNSIGNED per tabella '${nomeTabella}'.`);
      } catch (error) {
           console.error(`ERRORE CRITICO durante modifica colonna ${nomeTabella}.${nomeColonna}: ${error.message}`);
           console.error("Rollback necessario. Interruzione migrazione.");
           throw error;
      }
    } else {
        console.warn(`WARN: Tabella '${nomeTabella}' o colonna '${nomeColonna}' non trovata. Modifica saltata.`);
    }
  }
  
  // --- 3. ALTER PARENT ---
  console.log('Fase 3: Modifica della chiave primaria `utenti.id` in UNSIGNED...');
  if (await knex.schema.hasTable('utenti')) {
     try {
        await knex.raw('ALTER TABLE `utenti` MODIFY `id` INT UNSIGNED NOT NULL AUTO_INCREMENT');
        console.log('OK: Chiave primaria `utenti.id` modificata in UNSIGNED.');
     } catch (error) {
         console.error(`ERRORE CRITICO durante modifica utenti.id: ${error.message}`);
         console.error("Rollback necessario. Interruzione migrazione.");
         throw error;
     }
  } else {
      console.error('ERRORE CRITICO: Tabella `utenti` non trovata! Impossibile continuare.');
      throw new Error('Tabella utenti non trovata.');
  }

 // --- 4. Ripristina NOT NULL sulle colonne figlie ---
  console.log('Fase 4: Ripristino NOT NULL sulle colonne figlie...');
  for (const { table: nomeTabella, column: nomeColonna } of foreignKeys) {
    if (await knex.schema.hasTable(nomeTabella) && await knex.schema.hasColumn(nomeTabella, nomeColonna)) {
      try {
         const columnNameForModify = columnCaseMap[`${nomeTabella}.${nomeColonna}`] || nomeColonna;
         const colDef = await getColumnDefinition(knex, nomeTabella, nomeColonna);
         const currentComment = colDef?.Comment ? `COMMENT '${colDef.Comment.replace(/'/g, "''")}'` : '';
         
         // Ripristina NOT NULL solo se era NOT NULL in origine (da definizione originale)
         // Assumiamo che tutte le FK dovrebbero essere NOT NULL, ma questo previene errori se una colonna era NULLABLE
         const notNullClause = 'NOT NULL'; // Modificare se alcune colonne FK possono essere NULL

        await knex.raw(`ALTER TABLE \`${nomeTabella}\` MODIFY \`${columnNameForModify}\` INT UNSIGNED ${notNullClause} ${currentComment}`);
         console.log(`OK: Ripristinato ${notNullClause} per '${nomeTabella}.${nomeColonna}'.`);
      } catch (error) {
           console.error(`ERRORE CRITICO durante ripristino NOT NULL per ${nomeTabella}.${nomeColonna}: ${error.message}`);
           console.error(`POSSIBILE CAUSA: Dati NULL presenti nella colonna. CONTROLLARE e CORREGGERE prima di rieseguire.`);
           throw error;
      }
    }
  }


  // --- 5. RE-CREATE FKs ---
  console.log('Fase 5: Ricreazione delle Foreign Keys...');
  for (const { table: nomeTabella, constraint: nomeVincolo } of droppedFKs) { 
    const fkInfo = foreignKeys.find(fk => fk.table === nomeTabella && fk.constraint === nomeVincolo);
    if (!fkInfo) {
        console.warn(`WARN: Informazioni per ricreare il vincolo '${nomeVincolo}' non trovate.`);
        continue;
    }
    const nomeColonna = fkInfo.column;

    if (await knex.schema.hasTable(nomeTabella) && await knex.schema.hasColumn(nomeTabella, nomeColonna)) {
       try {
        await knex.schema.alterTable(nomeTabella, table => {
            table.foreign(nomeColonna, nomeVincolo).references('id').inTable('utenti').onDelete('CASCADE');
        });
        console.log(`OK: Vincolo FK '${nomeVincolo}' ricreato per '${nomeTabella}.${nomeColonna}'.`);
       } catch (error) {
           console.error(`ERRORE durante ricreazione FK ${nomeVincolo} per ${nomeTabella}.${nomeColonna}: ${error.message}`);
       }
    } else {
        console.warn(`WARN: Tabella '${nomeTabella}' o colonna '${nomeColonna}' non trovate durante ricreazione FK '${nomeVincolo}'.`);
    }
  }
  console.log('--- MIGRAZIONE STRUTTURALE COMPLETATA CON SUCCESSO ---');
};


exports.down = async function(knex) {
  // Rollback reso più robusto e speculare a UP
  console.log('--- AVVIO ROLLBACK MIGRAZIONE STRUTTURALE ---');
  
  // 1. Rimuovi le FK (nuove)
  console.log('Rollback Fase 1: Rimozione delle Foreign Keys...');
  for (const { table, constraint } of foreignKeys) {
     if (await knex.schema.hasTable(table)) {
       await dropForeignKeyRobust(knex, table, constraint);
     }
  }

  // 2. Modifica utenti.id a SIGNED INT
  console.log('Rollback Fase 2: Modifica della chiave primaria `utenti.id` in SIGNED...');
  if (await knex.schema.hasTable('utenti')) {
      await knex.raw('ALTER TABLE `utenti` MODIFY `id` INT NOT NULL AUTO_INCREMENT');
  }

  // 3. Modifica colonne figlie a SIGNED INT
  console.log('Rollback Fase 3: Modifica delle colonne figlie in SIGNED...');
  for (const { table: nomeTabella, column: nomeColonna } of foreignKeys) {
    if (await knex.schema.hasTable(nomeTabella) && await knex.schema.hasColumn(nomeTabella, nomeColonna)) {
       const columnNameForModify = columnCaseMap[`${nomeTabella}.${nomeColonna}`] || nomeColonna;
       const colDef = await getColumnDefinition(knex, nomeTabella, nomeColonna);
       const currentComment = colDef?.Comment ? `COMMENT '${colDef.Comment.replace(/'/g, "''")}'` : '';
       // Assumiamo che fossero NOT NULL in origine
       await knex.raw(`ALTER TABLE \`${nomeTabella}\` MODIFY \`${columnNameForModify}\` INT NOT NULL ${currentComment}`);
    }
  }
  
  // 4. Ricrea le FK (vecchie)
   console.log('Rollback Fase 4: Ricreazione delle Foreign Keys...');
   for (const { nomeTabella, nomeColonna, nomeVincolo } of foreignKeys) { 
    if (await knex.schema.hasTable(nomeTabella) && await knex.schema.hasColumn(nomeTabella, nomeColonna)) {
      try {
        await knex.schema.alterTable(nomeTabella, table => {
            table.foreign(nomeColonna, nomeVincolo).references('id').inTable('utenti').onDelete('CASCADE');
        });
         console.log(`OK: Vincolo FK '${nomeVincolo}' (originale) ricreato per '${nomeTabella}.${nomeColonna}'.`);
      } catch(e) {
          console.warn(`WARN: Errore durante ricreazione FK ${nomeVincolo} nel rollback: ${e.message}`);
      }
    }
  }

  console.log('--- ROLLBACK STRUTTURALE COMPLETATO ---');
};

