/**
 * @file migrations/20251020163000_add_id_ditta_to_utenti_funzioni_override.js
 * @description Migrazione Knex per aggiornare la tabella utenti_funzioni_override.
 * @version 1.5 (Correzione Race Condition Asincrona)
 *
 * @overview
 * Risolve un errore di "race condition" separando l'aggiunta della colonna dalla
 * creazione dei vincoli in due blocchi `await` sequenziali. Questo garantisce
 * che la colonna `id_ditta` esista sicuramente prima che si tenti di applicare
 * la Foreign Key su di essa.
 */

// Funzione helper per verificare ed eliminare una Foreign Key
async function dropForeignKeyIfExists(knex, tableName, constraintName) {
  const [rows] = await knex.raw(
    `SELECT * FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
     WHERE table_schema = DATABASE() AND table_name = ? AND constraint_name = ?`,
    [tableName, constraintName]
  );
  if (rows.length > 0) {
    await knex.schema.alterTable(tableName, (table) => {
      table.dropForeign(rows[0].COLUMN_NAME, constraintName);
    });
    console.log(`Dropped foreign key: ${constraintName}`);
  }
}

// Funzione helper per verificare ed eliminare un Indice
async function dropUniqueIndexIfExists(knex, tableName, indexName) {
    const [rows] = await knex.raw(
      `SHOW INDEX FROM ?? WHERE Key_name = ?`,
      [tableName, indexName]
    );
    if (rows.length > 0) {
      await knex.schema.alterTable(tableName, (table) => {
        table.dropUnique(rows.map(r => r.Column_name), indexName);
      });
      console.log(`Dropped unique index: ${indexName}`);
    }
}


exports.up = async function(knex) {
  if (await knex.schema.hasTable('utenti_funzioni_override')) {
    // 1. Rimuoviamo in sicurezza le vecchie Foreign Keys se esistono
    await dropForeignKeyIfExists(knex, 'utenti_funzioni_override', 'utenti_funzioni_override_id_utente_foreign');
    await dropForeignKeyIfExists(knex, 'utenti_funzioni_override', 'utenti_funzioni_override_id_funzione_foreign');

    // 2. Rimuoviamo in sicurezza il vecchio indice univoco se esiste
    await dropUniqueIndexIfExists(knex, 'utenti_funzioni_override', 'utenti_funzioni_override_id_utente_id_funzione_unique');

    // --- CORREZIONE ASYNC ---
    // 3. PRIMO BLOCCO: Aggiungiamo la colonna `id_ditta` solo se non esiste già.
    const hasDittaColumn = await knex.schema.hasColumn('utenti_funzioni_override', 'id_ditta');
    if (!hasDittaColumn) {
        await knex.schema.alterTable('utenti_funzioni_override', (table) => {
            table.integer('id_ditta').unsigned().defaultTo(1).notNullable().comment('FK alla ditta a cui si applica l\'override.');
        });
        console.log("Colonna 'id_ditta' aggiunta con successo.");
    }

    // 4. SECONDO BLOCCO: Applichiamo i nuovi vincoli. Questo blocco viene eseguito solo DOPO il completamento del precedente.
    await knex.schema.alterTable('utenti_funzioni_override', (table) => {
        table.foreign('id_ditta').references('id').inTable('ditte').onDelete('CASCADE');
        table.foreign('id_utente').references('id').inTable('utenti').onDelete('CASCADE');
        table.foreign('id_funzione').references('id').inTable('funzioni').onDelete('CASCADE');
        table.unique(['id_utente', 'id_funzione', 'id_ditta']);
    });
    console.log("Nuovi vincoli e indici applicati con successo.");

  } else {
    console.log("Tabella 'utenti_funzioni_override' non trovata. Migrazione saltata.");
  }
};

exports.down = async function(knex) {
    if (await knex.schema.hasTable('utenti_funzioni_override')) {
        // La funzione down può essere più semplice perché non ha problemi di race condition in questo scenario
        await knex.schema.alterTable('utenti_funzioni_override', (table) => {
            table.dropUnique(['id_utente', 'id_funzione', 'id_ditta']);
            table.dropForeign('id_ditta');
            table.dropForeign('id_utente');
            table.dropForeign('id_funzione');
            table.dropColumn('id_ditta');
            table.unique(['id_utente', 'id_funzione'], 'utenti_funzioni_override_id_utente_id_funzione_unique');
            table.foreign('id_utente').references('id').inTable('utenti').onDelete('CASCADE');
            table.foreign('id_funzione').references('id').inTable('funzioni').onDelete('CASCADE');
        });
    } else {
        console.log("Tabella 'utenti_funzioni_override' non trovata. Rollback saltato.");
    }
};