/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  const tableName = 'sc_registrazioni_testata';

  // --- Procedura di aggiornamento sicura ---
  // Ogni blocco controlla se la colonna esiste prima di tentare di aggiungerla.

  if (!(await knex.schema.hasColumn(tableName, 'data_documento'))) {
    await knex.schema.table(tableName, t => t.date('data_documento').after('descrizione_testata').nullable());
  }
  if (!(await knex.schema.hasColumn(tableName, 'numero_documento'))) {
    await knex.schema.table(tableName, t => t.string('numero_documento', 50).after('data_documento').nullable());
  }
  if (!(await knex.schema.hasColumn(tableName, 'totale_documento'))) {
    await knex.schema.table(tableName, t => t.decimal('totale_documento', 15, 2).after('numero_documento').nullable());
  }
  if (!(await knex.schema.hasColumn(tableName, 'id_ditte'))) {
    await knex.schema.table(tableName, t => {
      t.integer('id_ditte').unsigned().nullable().after('totale_documento');
      t.foreign('id_ditte').references('ditte.id').onDelete('SET NULL');
    });
  }

  // <span style="color:red;">// CORREZIONE DEFINITIVA: Gestione robusta del nuovo campo 'numero_protocollo' su tabelle con dati esistenti.</span>
  if (!(await knex.schema.hasColumn(tableName, 'numero_protocollo'))) {
    // STEP 1: Aggiunge la colonna come NULLABLE per evitare che il DB inserisca '0' di default.
    await knex.schema.table(tableName, t => t.integer('numero_protocollo').unsigned().nullable().after('id_ditte'));

    // STEP 2: Popola le righe esistenti con un protocollo progressivo per ogni ditta.
    const ditteIds = await knex(tableName).distinct('id_ditta').pluck('id_ditta');
    for (const id_ditta of ditteIds) {
      const recordsToUpdate = await knex(tableName).where({ id_ditta }).select('id').orderBy('id', 'asc');
      let protocollo = 1;
      for (const record of recordsToUpdate) {
        await knex(tableName).where('id', record.id).update({ numero_protocollo: protocollo });
        protocollo++;
      }
    }

    // STEP 3: Ora che tutti i campi sono popolati, modifica la colonna per renderla NOT NULL.
    await knex.raw(`ALTER TABLE \`${tableName}\` MODIFY \`numero_protocollo\` INT UNSIGNED NOT NULL`);

    // STEP 4: Infine, aggiunge il vincolo di unicità, che ora non troverà duplicati.
    await knex.schema.table(tableName, t => t.unique(['id_ditta', 'numero_protocollo']));
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.table('sc_registrazioni_testata', function(table) {
    // La funzione di rollback rimuove tutto in modo sicuro, in ordine inverso.
    table.dropUnique(['id_ditta', 'numero_protocollo']);
    table.dropForeign('id_ditte');
    table.dropColumn('numero_protocollo');
    table.dropColumn('id_ditte');
    table.dropColumn('totale_documento');
    table.dropColumn('numero_documento');
    table.dropColumn('data_documento');
  });
};

