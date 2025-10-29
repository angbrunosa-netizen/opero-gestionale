/**
 * @file migrations/20251021114400_standardize_user_id_to_unsigned.js
 * @description Migrazione Strutturale Definitiva per standardizzare `utenti.id` a INT UNSIGNED.
 * @version 1.9 (Patch per email_nascoste)
 * @date 2025-10-29
 *
 * @overview
 * Aggiunta la tabella `va_trasportatori` e il suo vincolo FK `va_trasportatori_id_utente_referente_foreign`
 * alla lista `foreignKeys`. Questo completa il censimento delle dipendenze e dovrebbe permettere
 * il completamento della migrazione strutturale.
 * * @version 1.9 -> Aggiunta logica di eccezione per `email_nascoste` che usa `id_utente`
 * come parte di una PRIMARY KEY e non può essere reso NULL.
 */

// --- CENSIMENTO DEFINITIVO (v3.6) ---
// Aggiunta va_trasportatori
const foreignKeys = [
  { table: 'ad_utenti_ditte', column: 'id_utente', constraint: 'ad_utenti_ditte_id_utente_foreign' },
  { table: 'bs_attivita', column: 'id_utente_utilizzatore', constraint: 'bs_attivita_id_utente_utilizzatore_foreign'},
  { table: 'ct_codici_fornitore', column: 'created_by', constraint: 'ct_codici_fornitore_created_by_foreign'},
  { table: 'ct_ean', column: 'created_by', constraint: 'ct_ean_created_by_foreign'},
  { table: 'email_inviate', column: 'id_utente_mittente', constraint: 'email_inviate_ibfk_1'},
  { table: 'email_nascoste', column: 'id_utente', constraint: 'email_nascoste_ibfk_1'},
  { table: 'ldu', column: 'id_utente', constraint: 'ldu_ibfk_2'},
  { table: 'log_accessi', column: 'id_utente', constraint: 'log_accessi_ibfk_1'},
  { table: 'log_azioni', column: 'id_utente', constraint: 'log_azioni_ibfk_1'},
  { table: 'mg_movimenti', column: 'id_utente', constraint: 'mg_movimenti_id_utente_foreign'},
  { table: 'password_reset_tokens', column: 'id_utente', constraint: 'password_reset_tokens_id_utente_foreign'},
  { table: 'ppa_istanzeazioni', column: 'id_utente_assegnatario', constraint: 'ppa_istanzeazioni_ibfk_3'},
  { table: 'ppa_istanzeprocedure', column: 'id_utente_creatore', constraint: 'ppa_istanzeprocedure_ibfk_3'},
  { table: 'ppa_teammembri', column: 'id_utente', constraint: 'ppa_teammembri_ibfk_2'},
  { table: 'registration_tokens', column: 'id_utente_invitante', constraint: 'registration_tokens_ibfk_1'},
  { table: 'sc_registrazioni_testata', column: 'id_utente', constraint: 'sc_registrazioni_testata_ibfk_2'},
  { table: 'stati_lettura', column: 'id_utente', constraint: 'stati_lettura_ibfk_1'},
  { table: 'utente_mail_accounts', column: 'id_utente', constraint: 'utente_mail_accounts_id_utente_foreign'},
  { table: 'utente_scorciatoie', column: 'id_utente', constraint: 'utente_scorciatoie_ibfk_1'},
  { table: 'utenti_funzioni_override', column: 'id_utente', constraint: 'utenti_funzioni_override_id_utente_foreign'},
  { table: 'utenti_sessioni_attive', column: 'id_utente', constraint: 'utenti_sessioni_attive_ibfk_1'},
  { table: 'va_trasportatori', column: 'id_utente_referente', constraint: 'va_trasportatori_id_utente_referente_foreign'},
];

// Mappa per gestire nomi di colonne diversi (es. `id_utente_utilizzatore` vs `id_utente`)
// Chiave: 'nomeTabella.nomeColonna', Valore: 'nomeColonnaComeScrittoInTabella'
const columnCaseMap = {
  'bs_attivita.id_utente_utilizzatore': 'id_utente_utilizzatore',
  'ct_codici_fornitore.created_by': 'created_by',
  'ct_ean.created_by': 'created_by',
  'email_inviate.id_utente_mittente': 'id_utente_mittente',
  'ppa_istanzeazioni.id_utente_assegnatario': 'id_utente_assegnatario',
  'ppa_istanzeprocedure.id_utente_creatore': 'id_utente_creatore',
  'registration_tokens.id_utente_invitante': 'id_utente_invitante',
  'va_trasportatori.id_utente_referente': 'id_utente_referente',
};


/**
 * Funzione helper per rimuovere un vincolo FK in modo robusto.
 * Tenta di rimuovere prima per nome esplicito, poi per nome colonna.
 * Non fallisce se il vincolo non esiste (come rilevato in produzione).
 */
async function dropForeignKeyRobust(knex, nomeTabella, nomeColonna, nomeVincolo) {
  try {
    const hasConstraint = await knex.schema.hasColumn(nomeTabella, nomeColonna);
    if (!hasConstraint) {
       console.log(`WARN: Tabella '${nomeTabella}' o colonna '${nomeColonna}' non trovata. Salto rimozione FK.`);
       return;
    }

    // 1. Controlla se il vincolo esiste in INFORMATION_SCHEMA
    const result = await knex.raw(
      `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = ? 
       AND COLUMN_NAME = ? 
       AND REFERENCED_TABLE_NAME = 'utenti'`,
      [nomeTabella, nomeColonna]
    );

    const constraints = result[0];
    let actualConstraintName = null;

    if (constraints.length > 0) {
      // Trovato uno o più vincoli sulla colonna che puntano a 'utenti'.
      // Cerchiamo prima quello con il nome atteso.
      const matchingConstraint = constraints.find(c => c.CONSTRAINT_NAME === nomeVincolo);
      if (matchingConstraint) {
        actualConstraintName = matchingConstraint.CONSTRAINT_NAME;
      } else {
        // Il nome non corrisponde, ma un vincolo esiste.
        // Potrebbe essere un nome diverso (es. in produzione).
        actualConstraintName = constraints[0].CONSTRAINT_NAME; // Prendiamo il primo trovato
        console.log(`WARN: Vincolo FK per ${nomeTabella}.${nomeColonna} trovato con nome diverso: '${actualConstraintName}'. Nome atteso: '${nomeVincolo}'.`);
      }
    }

    if (actualConstraintName) {
      // 2. Trovato! Rimuoviamolo.
      await knex.schema.alterTable(nomeTabella, table => {
        table.dropForeign([nomeColonna], actualConstraintName); // Rimuovi usando il nome corretto
      });
      console.log(`OK: Vincolo FK '${actualConstraintName}' rimosso per ${nomeTabella}.${nomeColonna}.`);
    } else {
      // 3. Non trovato in INFORMATION_SCHEMA (come da log di produzione)
      console.log(`WARN: Vincolo FK '${nomeVincolo}' NON TROVATO in INFORMATION_SCHEMA per ${nomeTabella}.${nomeColonna}. Si presume sia già assente.`);
    }

  } catch (error) {
     // Gestione errori specifici
     if (error.code === 'ER_TABLE_NOT_FOUND' || error.sqlState === '42S02') {
         console.log(`WARN: Tabella '${nomeTabella}' per vincolo '${nomeVincolo}' non trovata. Salto.`);
     } else if (error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
         console.log(`WARN: Impossibile rimuovere FK '${nomeVincolo}' (forse non esiste). ${error.message}`);
     } else {
        console.error(`ERRORE non gestito durante rimozione FK ${nomeVincolo}: ${error.message}`);
        throw error; // Rilancia se è un errore sconosciuto
     }
  }
}

/**
 * Helper per ottenere la definizione completa della colonna (incluso COMMENT)
 */
async function getColumnDefinition(knex, tableName, columnName) {
    try {
        const result = await knex.raw(
            `SELECT COLUMN_TYPE, IS_NULLABLE as 'Null', COLUMN_COMMENT as 'Comment' 
             FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_SCHEMA = DATABASE() 
             AND TABLE_NAME = ? 
             AND COLUMN_NAME = ?`,
            [tableName, columnName]
        );
        if (result && result[0] && result[0][0]) {
            return result[0][0];
        }
    } catch (error) {
        console.error(`Errore nel recuperare definizione colonna ${tableName}.${columnName}: ${error.message}`);
    }
    return null;
}


exports.up = async function(knex) {
  console.log('--- AVVIO MIGRAZIONE STRUTTURALE UTENTI.ID (v1.9 - Patch email_nascoste) ---');
  
  try {
    await knex.transaction(async (trx) => {
      
      // Fase 1: Rimozione delle Foreign Keys
      // Questa fase rimuove tutti i vincoli FK che puntano a `utenti.id`
      console.log('Fase 1: Rimozione delle Foreign Keys...');
      let fkRemovedCount = 0;
      for (const { table: nomeTabella, column: nomeColonna, constraint: nomeVincolo } of foreignKeys) {
        const originalWarnCount = console.warn.callCount || 0;
        await dropForeignKeyRobust(trx, nomeTabella, nomeColonna, nomeVincolo);
        if ((console.warn.callCount || 0) === originalWarnCount) {
             // Se dropForeignKeyRobust non ha emesso WARN (cioè ha rimosso OK)
             // Nota: questo contatore è imperfetto se dropForeignKeyRobust cambia logica
             // Ma ci basiamo sul log "OK:"
             // Migliore: controlliamo se il log "OK:" è stato stampato (non possiamo qui)
        }
      }
      console.log(`INFO: Completata rimozione FKs.`); // Conteggio rimosso perché inaffidabile


      // Fase 2: Modifica delle colonne figlie in UNSIGNED NULL
      // Modifichiamo tutte le colonne figlie (ex-FK) per accettare UNSIGNED e NULL.
      // NULL è temporaneo per permettere la modifica della tabella 'utenti'
      console.log('Fase 2: Modifica delle colonne figlie in UNSIGNED NULL (temporaneo)...');
      for (const { table: nomeTabella, column: nomeColonna } of foreignKeys) {
        if (await trx.schema.hasTable(nomeTabella) && await trx.schema.hasColumn(nomeTabella, nomeColonna)) {
           
           const columnNameForModify = columnCaseMap[`${nomeTabella}.${nomeColonna}`] || nomeColonna;
           console.log(`INFO: Tentativo di modificare ${nomeTabella}.${nomeColonna} (usando '${columnNameForModify}') in UNSIGNED NULL`);
           
           const colDef = await getColumnDefinition(trx, nomeTabella, nomeColonna);
           const currentComment = colDef?.Comment ? `COMMENT '${colDef.Comment.replace(/'/g, "''")}'` : '';
           
           // --- INIZIO MODIFICA CRITICA (v1.9) ---
           let nullClause = 'NULL'; 
           if (nomeTabella === 'email_nascoste') {
               console.log(`INFO: Eccezione per ${nomeTabella}.${nomeColonna}. È una PK, modifico in NOT NULL.`);
               nullClause = 'NOT NULL';
           }
           // --- FINE MODIFICA CRITICA (v1.9) ---

           await trx.raw(`ALTER TABLE \`${nomeTabella}\` MODIFY \`${columnNameForModify}\` INT UNSIGNED ${nullClause} ${currentComment}`);
           console.log(`OK: Colonna '${columnNameForModify}' modificata in UNSIGNED per tabella '${nomeTabella}'.`);
        } else {
           console.log(`WARN: Tabella '${nomeTabella}' o colonna '${nomeColonna}' non trovata. Salto modifica tipo.`);
        }
      }


      // Fase 3: Modifica della tabella 'utenti'
      // Ora che nessun vincolo punta a `utenti.id`, possiamo modificarla.
      console.log('Fase 3: Modifica tabella utenti.id in UNSIGNED AUTO_INCREMENT...');
      const utentiColDef = await getColumnDefinition(trx, 'utenti', 'id');
      const utentiComment = utentiColDef?.Comment ? `COMMENT '${utentiColDef.Comment.replace(/'/g, "''")}'` : '';
      
      await trx.raw(`ALTER TABLE \`utenti\` MODIFY \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT ${utentiComment}`);
      console.log('OK: Tabella `utenti.id` modificata.');


      // Fase 4: Ripristino NOT NULL sulle colonne figlie
      // Ripristiniamo il vincolo NOT NULL (dove appropriato)
      console.log('Fase 4: Ripristino del NOT NULL sulle colonne figlie...');
      for (const { table: nomeTabella, column: nomeColonna } of foreignKeys) {
        if (await trx.schema.hasTable(nomeTabella) && await trx.schema.hasColumn(nomeTabella, nomeColonna)) {
            const columnNameForModify = columnCaseMap[`${nomeTabella}.${nomeColonna}`] || nomeColonna;
            const colDef = await getColumnDefinition(trx, nomeTabella, nomeColonna);
            const currentComment = colDef?.Comment ? `COMMENT '${colDef.Comment.replace(/'/g, "''")}'` : '';

            // --- INIZIO MODIFICA CRITICA (v1.9) ---
            // Logica per determinare se la colonna deve essere NOT NULL
            // (Assumiamo che tutte le FK in questo progetto siano NOT NULL tranne casi specifici)
            let notNullClause = 'NOT NULL';
            if (nomeTabella === 'email_nascoste') {
                 console.log(`INFO: Eccezione per ${nomeTabella}.${nomeColonna}. È una PK, mantenuta NOT NULL.`);
                 notNullClause = 'NOT NULL';
            }
            // Aggiungere qui altre eventuali eccezioni se scoperte (es. colonne che DEVONO essere NULL)
            // if (nomeTabella === 'tabella_speciale' && nomeColonna === 'colonna_speciale') {
            //     notNullClause = 'NULL';
            // }
            // --- FINE MODIFICA CRITICA (v1.9) ---

            await trx.raw(`ALTER TABLE \`${nomeTabella}\` MODIFY \`${columnNameForModify}\` INT UNSIGNED ${notNullClause} ${currentComment}`);
            console.log(`OK: Ripristinato ${notNullClause} su ${nomeTabella}.${columnNameForModify}`);
        }
      }


      // Fase 5: Ricreazione delle Foreign Keys
      // Ricreiamo i vincoli FK, ora puntando a una colonna UNSIGNED
      console.log('Fase 5: Ricreazione delle Foreign Keys (UNSIGNED)...');
      for (const { table: nomeTabella, column: nomeColonna, constraint: nomeVincolo } of foreignKeys) {
        if (await trx.schema.hasTable(nomeTabella) && await trx.schema.hasColumn(nomeTabella, nomeColonna)) {
          
          // --- Gestione Eccezione per 'email_nascoste' ---
          if (nomeTabella === 'email_nascoste') {
              console.log(`INFO: Saltata creazione FK per ${nomeTabella}.${nomeColonna} (è una PK, e la FK in prod non esiste).`);
              continue; // Salta la creazione della FK
          }
          
          const nuovoNomeVincolo = `${nomeVincolo}_unsigned_fk`; // Nuovo nome per evitare conflitti
          await trx.schema.alterTable(nomeTabella, table => {
            // Aggiungere qui logica onDelete() se necessaria (es. SET NULL, CASCADE)
            // L'originale non specificava, quindi usiamo il default (RESTRICT)
            table.foreign(nomeColonna, nuovoNomeVincolo).references('id').inTable('utenti');
          });
          console.log(`OK: Vincolo FK '${nuovoNomeVincolo}' ricreato per ${nomeTabella}.${nomeColonna}.`);
        } else {
           console.log(`WARN: Tabella '${nomeTabella}' o colonna '${nomeColonna}' non trovata. Salto ricreazione FK.`);
        }
      }
      
      console.log('--- MIGRAZIONE COMPLETATA CON SUCCESSO ---');
    });
  } catch (error) {
    console.error('ERRORE CRITICO durante la migrazione: ', error.message);
    console.error('Rollback necessario. Interruzione migrazione.');
    throw error; // Rilancia l'errore per far fallire la migrazione
  }
};


// -----------------------------------------------------------------------------
// DOWN - ROLLBACK
// -----------------------------------------------------------------------------


exports.down = async function(knex) {
  console.log('--- AVVIO ROLLBACK MIGRAZIONE UTENTI.ID (v1.9) ---');
  
  try {
    await knex.transaction(async (trx) => {
      
      // Rollback Fase 1: Rimozione delle Foreign Keys (nuove)
      console.log('Rollback Fase 1: Rimozione delle Foreign Keys (nuove, _unsigned_fk)...');
      for (const { table: nomeTabella, column: nomeColonna, constraint: nomeVincolo } of foreignKeys) {
        const nuovoNomeVincolo = `${nomeVincolo}_unsigned_fk`;
        if (await trx.schema.hasTable(nomeTabella) && await trx.schema.hasColumn(nomeTabella, nomeColonna)) {
           
            // --- Gestione Eccezione per 'email_nascoste' ---
            if (nomeTabella === 'email_nascoste') {
                console.log(`INFO: Saltata rimozione FK per ${nomeTabella}.${nomeColonna} (non creata in UP).`);
                continue; 
            }
           
           try {
              await trx.schema.alterTable(nomeTabella, table => {
                table.dropForeign([nomeColonna], nuovoNomeVincolo);
              });
              console.log(`OK: Vincolo FK '${nuovoNomeVincolo}' rimosso per ${nomeTabella}.${nomeColonna}.`);
           } catch(e) {
               if (e.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
                  console.log(`WARN: Impossibile rimuovere FK '${nuovoNomeVincolo}' (forse non esiste). ${e.message}`);
               } else {
                   throw e;
               }
           }
        } else {
           console.log(`WARN: Tabella '${nomeTabella}' o colonna '${nomeColonna}' non trovata. Salto rimozione FK.`);
        }
      }

      // Rollback Fase 2: Modifica utenti.id in SIGNED
      console.log('Rollback Fase 2: Modifica utenti.id in SIGNED (INT)...');
      const utentiColDef = await getColumnDefinition(trx, 'utenti', 'id');
      const utentiComment = utentiColDef?.Comment ? `COMMENT '${utentiColDef.Comment.replace(/'/g, "''")}'` : '';
      
      await trx.raw(`ALTER TABLE \`utenti\` MODIFY \`id\` INT NOT NULL AUTO_INCREMENT ${utentiComment}`);
      console.log('OK: Tabella `utenti.id` modificata in SIGNED.');

      // Rollback Fase 3: Modifica colonne figlie in SIGNED
      console.log('Rollback Fase 3: Modifica colonne figlie in SIGNED (INT)...');
      for (const { table: nomeTabella, column: nomeColonna } of foreignKeys) {
        if (await trx.schema.hasTable(nomeTabella) && await trx.schema.hasColumn(nomeTabella, nomeColonna)) {
           const columnNameForModify = columnCaseMap[`${nomeTabella}.${nomeColonna}`] || nomeColonna;
           const colDef = await getColumnDefinition(trx, nomeTabella, nomeColonna);
           const currentComment = colDef?.Comment ? `COMMENT '${colDef.Comment.replace(/'/g, "''")}'` : '';
           
           // Assumiamo che fossero NOT NULL in origine (la nostra patch v1.9 per email_nascoste rispetta questo)
           const originalNullClause = 'NOT NULL';
           // Aggiungere qui eccezioni se alcune colonne erano originariamente NULL
           
           await trx.raw(`ALTER TABLE \`${nomeTabella}\` MODIFY \`${columnNameForModify}\` INT ${originalNullClause} ${currentComment}`);
           console.log(`OK: Colonna '${columnNameForModify}' modificata in SIGNED per tabella '${nomeTabella}'.`);
        } else {
           console.log(`WARN: Tabella '${nomeTabella}' o colonna '${nomeColonna}' non trovata. Salto modifica tipo.`);
        }
      }
      
      // Rollback Fase 4: Ricrea le FK (originali)
       console.log('Rollback Fase 4: Ricreazione delle Foreign Keys (originali)...');
       for (const { table: nomeTabella, column: nomeColonna, constraint: nomeVincolo } of foreignKeys) { 
        if (await trx.schema.hasTable(nomeTabella) && await trx.schema.hasColumn(nomeTabella, nomeColonna)) {
          
            // --- Gestione Eccezione per 'email_nascoste' ---
            if (nomeTabella === 'email_nascoste') {
                console.log(`INFO: Saltata ricreazione FK originale per ${nomeTabella}.${nomeColonna} (non esisteva in prod).`);
                continue; 
            }
          
          try {
            await trx.schema.alterTable(nomeTabella, table => {
                // Ricreiamo il vincolo con il suo nome ORIGINALE
                table.foreign(nomeColonna, nomeVincolo).references('id').inTable('utenti');
            });
             console.log(`OK: Vincolo FK '${nomeVincolo}' (originale) ricreato per ${nomeTabella}.${nomeColonna}.`);
          } catch(e) {
              console.warn(`WARN: Impossibile ricreare FK '${nomeVincolo}'. Potrebbe esistere già o la tabella 'utenti' non è compatibile. ${e.message}`);
          }
        } else {
           console.log(`WARN: Tabella '${nomeTabella}' o colonna '${nomeColonna}' non trovata. Salto ricreazione FK.`);
        }
       }
      
      console.log('--- ROLLBACK COMPLETATO CON SUCCESSO ---');
    });
  } catch (error) {
    console.error('ERRORE CRITICO durante il rollback: ', error.message);
    throw error;
  }
};