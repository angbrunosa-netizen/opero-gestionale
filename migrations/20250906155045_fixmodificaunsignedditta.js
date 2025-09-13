/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Elenco consolidato e definitivo di tutte le tabelle, colonne e relative chiavi primarie da correggere.
  const tablesToFix = [
    // Dipendenze dirette da 'ditte'
    { table: 'app_ruoli', column: 'id_ditta', references: 'ditte.id' },
    { table: 'ditte_moduli', column: 'id_ditta', references: 'ditte.id' },
    { table: 'ditta_mail_accounts', column: 'id_ditta', references: 'ditte.id' },
    { table: 'sc_aliquote_iva', column: 'id_ditta', references: 'ditte.id' },
    { table: 'sc_piano_dei_conti', column: 'id_ditta', references: 'ditte.id' },
    { table: 'sc_registrazioni_testata', column: 'id_ditta', references: 'ditte.id' },
    { table: 'an_relazioni', column: 'id_ditta_origine', references: 'ditte.id' },
    { table: 'an_relazioni', column: 'id_ditta_correlata', references: 'ditte.id' },
    { table: 'utenti', column: 'id_ditta', references: 'ditte.id' },
    { table: 'lista_distribuzione_ditte', column: 'id_ditta', references: 'ditte.id' },
    { table: 'liste_distribuzione', column: 'id_ditta', references: 'ditte.id' },
    { table: 'log_azioni', column: 'id_ditta', references: 'ditte.id' },
    { table: 'privacy_policies', column: 'id_ditta', references: 'ditte.id' },
    { table: 'registration_tokens', column: 'id_ditta', references: 'ditte.id' },
  //  { table: 'sc_registri_iva', column: 'id_ditta', references: 'ditte.id' },
    { table: 'sc_partite_aperte', column: 'id_ditta_anagrafica', references: 'ditte.id' },
    { table: 'tipi_pagamento', column: 'id_ditta', references: 'ditte.id' },
    
    // Dipendenze interne al modulo PPA
    { table: 'ppa_procedureditta', column: 'id_ditta', references: 'ditte.id' },
    { table: 'ppa_procedureditta', column: 'ID_ProceduraStandard', references: 'ppa_procedurestandard.ID' },
    { table: 'ppa_istanzeazioni', column: 'ID_Azione', references: 'ppa_azioni.ID' },
    { table: 'ppa_istanzeprocedure', column: 'ID_ProceduraDitta', references: 'ppa_procedureditta.ID' },
    { table: 'ppa_istanzeprocedure', column: 'ID_DittaTarget', references: 'ditte.id' },
    { table: 'ppa_stati_azione', column: 'id_ditta', references: 'ditte.id' },
    { table: 'ppa_processi', column: 'ID_ProceduraDitta', references: 'ppa_procedureditta.ID' },
    // <span style="color:red;">// CORREZIONE DEFINITIVA: Aggiunta la dipendenza finale che causava l'ultimo errore.</span>
    // <span style="color:green;">// La tabella `ppa_azioni` dipende da `ppa_processi` e bloccava la modifica della sua chiave primaria.</span>
    { table: 'ppa_azioni', column: 'ID_Processo', references: 'ppa_processi.ID' },
  ];

  // --- STEP 1: Rimuovi tutti i vincoli in modo dinamico ---
  for (const { table, column, references } of tablesToFix) {
      if (references) {
        const [refTable] = references.split('.');
        await dropForeignKeyIfExists(knex, table, column, refTable);
      }
  }

  // --- STEP 2: Modifica le CHIAVI PRIMARIE per renderle UNSIGNED ---
  await modifyPrimaryKey(knex, 'ditte', 'id');
  await modifyPrimaryKey(knex, 'ppa_procedurestandard', 'ID');
  await modifyPrimaryKey(knex, 'ppa_procedureditta', 'ID');
  await modifyPrimaryKey(knex, 'ppa_processi', 'ID');
  await modifyPrimaryKey(knex, 'ppa_azioni', 'ID');
  
  // --- STEP 3: Modifica le colonne delle CHIAVI ESTERNE per renderle UNSIGNED ---
  for (const { table, column } of tablesToFix) {
    await modifyForeignKeyColumn(knex, table, column, 'INT UNSIGNED');
  }
  
  // --- STEP 4: Ricrea tutti i vincoli ---
  for (const { table, column, references } of tablesToFix) {
      if (references) {
        const [refTable, refColumn] = references.split('.');
        await createForeignKey(knex, table, column, refTable, refColumn);
      }
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Per sicurezza, il rollback di una migrazione così complessa e strutturale non è supportato.
  // In caso di problemi, è più sicuro ripristinare un backup del database.
  console.log("Il rollback di questa migrazione complessa non è supportato per prevenire la corruzione dei dati.");
};

// --- Funzioni Helper per rendere lo script robusto ---

async function dropForeignKeyIfExists(knex, table, column, referencedTable) {
    const tableExists = await knex.schema.hasTable(table);
    if (!tableExists) return;

    const [constraint] = await knex.raw(
        `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? AND REFERENCED_TABLE_NAME = ?`,
        [table, column, referencedTable]
    );

    if (constraint && constraint.length > 0) {
        const constraintName = constraint[0].CONSTRAINT_NAME;
        if (constraintName !== 'PRIMARY') {
            await knex.raw(`ALTER TABLE \`${table}\` DROP FOREIGN KEY \`${constraintName}\``);
        }
    }
}

async function modifyPrimaryKey(knex, table, column) {
    const tableExists = await knex.schema.hasTable(table);
    if (!tableExists) return;
    await knex.raw(`ALTER TABLE \`${table}\` MODIFY \`${column}\` INT UNSIGNED NOT NULL AUTO_INCREMENT`);
}

async function modifyForeignKeyColumn(knex, table, column, type) {
    const tableExists = await knex.schema.hasTable(table);
    if (!tableExists) return;
    
    const isNullable = (table === 'utenti' && column === 'id_ditta');
    const nullability = isNullable ? 'NULL' : 'NOT NULL';

    await knex.raw(`ALTER TABLE \`${table}\` MODIFY \`${column}\` ${type} ${nullability}`);
}

async function createForeignKey(knex, table, column, referencedTable, referencedColumn) {
    const tableExists = await knex.schema.hasTable(table);
    if (!tableExists) return;

    await knex.schema.table(table, (tbl) => {
        tbl.foreign(column)
           .references(`${referencedTable}.${referencedColumn}`)
           .withKeyName(`fk_${table}_${column}`);
    });
}

