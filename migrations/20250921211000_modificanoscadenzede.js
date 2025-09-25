/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  const tableName = 'bs_scadenze';
  const columnName = 'id_tipo_scadenza';

  // Controlla se la colonna esiste già per evitare errori
  const columnExists = await knex.schema.hasColumn(tableName, columnName);

  if (!columnExists) {
    // NUOVO: Aggiunto controllo di esistenza colonna
    console.log(`La colonna ${columnName} non esiste in ${tableName}, la creo.`);
    return knex.schema.table(tableName, function(table) {
      // Aggiunge la colonna per la foreign key
      table.integer(columnName).unsigned().nullable().after('id_bene');
      
      // Aggiunge il vincolo di foreign key
      table.foreign(columnName).references('id').inTable('bs_tipi_scadenze').onDelete('SET NULL');
      
      // NOTA BENE: La vecchia colonna 'tipo_scadenza' non viene eliminata automaticamente
      // per permettere una migrazione manuale dei dati se necessario.
      // Una volta migrati i dati, si consiglia di rimuoverla con una nuova migrazione.
    });
  } else {
    console.log(`La colonna ${columnName} esiste già in ${tableName}, salto la creazione.`);
    return Promise.resolve(); // Risolve la promise senza fare nulla
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  const tableName = 'bs_scadenze';
  const columnName = 'id_tipo_scadenza';

  // Controlla se la colonna esiste prima di tentare di rimuoverla
  const columnExists = await knex.schema.hasColumn(tableName, columnName);

  if (columnExists) {
    // NUOVO: Aggiunto controllo di esistenza colonna
    console.log(`La colonna ${columnName} esiste in ${tableName}, la rimuovo.`);
    return knex.schema.table(tableName, function(table) {
      // Rimuove prima il vincolo e poi la colonna
      table.dropForeign(columnName);
      table.dropColumn(columnName);
    });
  } else {
    console.log(`La colonna ${columnName} non esiste in ${tableName}, salto la rimozione.`);
    return Promise.resolve();
  }
};
