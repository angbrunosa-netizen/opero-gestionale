/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Questo file di migrazione è un'azione correttiva per risolvere una discrepanza nello schema del DB.
  // L'errore "Unknown column 'id_riga'" indica che la tabella `ac_sconti_dettaglio`
  // non ha la struttura corretta richiesta dall'applicazione.
  // Questo script assicura che la tabella abbia la colonna `id_riga` e rimuove quella obsoleta.

  const tableName = 'ac_sconti_dettaglio';

  // Verifica se la colonna corretta 'id_riga' esiste già.
  const hasRigaColumn = await knex.schema.hasColumn(tableName, 'id_riga');
  
  if (hasRigaColumn) {
    // Se la colonna esiste già, lo schema potrebbe essere corretto. Non facciamo nulla.
    console.log(`La colonna 'id_riga' esiste già in '${tableName}'. Nessuna azione richiesta.`);
    return;
  }

  // Se siamo qui, 'id_riga' manca. La aggiungiamo.
  console.log(`Aggiunta della colonna 'id_riga' a '${tableName}'...`);
  await knex.schema.alterTable(tableName, (table) => {
    table.integer('id_riga').unsigned().notNullable().references('id').inTable('ac_condizioni_righe').onDelete('CASCADE');
  });

  // Ora, procediamo con la pulizia della vecchia e incorretta colonna 'id_condizione', se esiste.
  const hasCondizioneColumn = await knex.schema.hasColumn(tableName, 'id_condizione');
  if (hasCondizioneColumn) {
    console.log(`Rimozione della colonna obsoleta 'id_condizione' da '${tableName}'...`);
    await knex.schema.alterTable(tableName, (table) => {
      // Questo tenterà di eliminare la colonna. Potrebbe fallire se esiste una foreign key con un nome non standard.
      // Data la migrazione di refactoring precedente, questa colonna non dovrebbe più avere una FK valida.
      table.dropColumn('id_condizione');
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Questa migrazione 'down' annulla la correzione.
  const tableName = 'ac_sconti_dettaglio';
  
  await knex.schema.alterTable(tableName, (table) => {
    table.dropColumn('id_riga');
  });

  await knex.schema.alterTable(tableName, (table) => {
    table.integer('id_condizione').unsigned();
  });
};
