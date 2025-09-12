/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Questo array contiene l'elenco COMPLETO di tutte le tabelle che si collegano a 'ditte.id'
  const referencingTables = [
    { table: 'app_ruoli', column: 'id_ditta' },
    { table: 'ditte_moduli', column: 'id_ditta' },
    { table: 'ditta_mail_accounts', column: 'id_ditta' },
    { table: 'sc_aliquote_iva', column: 'id_ditta' },
    { table: 'sc_piano_dei_conti', column: 'id_ditta' },
    { table: 'sc_registrazioni_testata', column: 'id_ditta' },
    { table: 'an_relazioni', column: 'id_ditta_origine' },
    { table: 'an_relazioni', column: 'id_ditta_destinazione' },
    { table: 'utenti', column: 'id_ditta' },
    { table: 'conti', column: 'id_ditta' },
        // CORREZIONE: Inclusione di lista_distribuzione_ditte, che causava l'ultimo errore
    { table: 'lista_distribuzione_ditte', column: 'id_ditta' },
   { table: 'liste_distribuzione', column: 'id_ditta' },
       { table: 'log_azioni', column: 'id_ditta' } // Ultima tabella scoperta

  ];

  // 1. Rimuove dinamicamente tutte le foreign keys
  for (const { table, column } of referencingTables) {
    const tableExists = await knex.schema.hasTable(table);
    if (tableExists) {
        const [constraint] = await knex.raw(
            `SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? AND REFERENCED_TABLE_NAME = 'ditte'`,
            [table, column]
        );

        if (constraint && constraint.length > 0) {
            const constraintName = constraint[0].CONSTRAINT_NAME;
            await knex.raw(`ALTER TABLE \`${table}\` DROP FOREIGN KEY \`${constraintName}\``);
        }
    }
  }

  // 2. Modifica la colonna PK in 'ditte'
  await knex.raw('ALTER TABLE `ditte` MODIFY `id` INT UNSIGNED NOT NULL AUTO_INCREMENT');

  // 3. Modifica tutte le colonne FK per renderle UNSIGNED
  for (const { table, column } of referencingTables) {
    const tableExists = await knex.schema.hasTable(table);
    if (tableExists) {
      const isNullable = (table === 'utenti' && column === 'id_ditta');
      const nullability = isNullable ? 'NULL' : 'NOT NULL';
      await knex.raw(`ALTER TABLE \`${table}\` MODIFY \`${column}\` INT UNSIGNED ${nullability}`);
    }
  }
  
  // 4. Aggiunge di nuovo tutte le foreign keys con un nome standard
  for (const { table, column } of referencingTables) {
     const tableExists = await knex.schema.hasTable(table);
     if (tableExists) {
       await knex.schema.table(table, (tbl) => {
         tbl.foreign(column).references('ditte.id').withKeyName(`fk_${table}_${column}`);
       });
     }
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Funzione di rollback
  const referencingTables = [
    { table: 'app_ruoli', column: 'id_ditta' },
    { table: 'ditte_moduli', column: 'id_ditta' },
    { table: 'ditta_mail_accounts', column: 'id_ditta' },
    { table: 'sc_aliquote_iva', column: 'id_ditta' },
    { table: 'sc_piano_dei_conti', column: 'id_ditta' },
    { table: 'sc_registrazioni_testata', column: 'id_ditta' },
    { table: 'an_relazioni', column: 'id_ditta_origine' },
    { table: 'an_relazioni', column: 'id_ditta_destinazione' },
    { table: 'utenti', column: 'id_ditta' },
    { table: 'conti', column: 'id_ditta' },
    { table: 'sc_funzioni_contabili', column: 'id_ditta' },
    { table: 'lista_distribuzione_ditte', column: 'id_ditta' },
 { table: 'liste_distribuzione', column: 'id_ditta' },
     { table: 'log_azioni', column: 'id_ditta' } // Ultima tabella scoperta

  ];

  for (const { table, column } of referencingTables) {
    const tableExists = await knex.schema.hasTable(table);
    if (tableExists) {
        await knex.schema.table(table, (tbl) => {
            tbl.dropForeign(column, `fk_${table}_${column}`);
        });
    }
  }

  await knex.raw('ALTER TABLE `ditte` MODIFY `id` INT(11) NOT NULL AUTO_INCREMENT');
  
  for (const { table, column } of referencingTables) {
    const tableExists = await knex.schema.hasTable(table);
    if (tableExists) {
      const isNullable = table === 'utenti' && column === 'id_ditta';
      const nullability = isNullable ? 'NULL' : 'NOT NULL';
      await knex.raw(`ALTER TABLE \`${table}\` MODIFY \`${column}\` INT(11) ${nullability}`);
      await knex.schema.table(table, (tbl) => {
        tbl.foreign(column).references('ditte.id');
      });
    }
  }
};

