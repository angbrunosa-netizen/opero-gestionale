/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // --- 1. Creazione Tabella va_matrice_sconti ---
  const matriceExists = await knex.schema.hasTable('va_matrice_sconti');
  if (!matriceExists) {
    await knex.schema.createTable('va_matrice_sconti', function(table) {
      table.increments('id').primary();
      table.integer('id_ditta').unsigned().notNullable();
      table.foreign('id_ditta').references('id').inTable('ditte').onDelete('CASCADE');
      table.string('codice', 50).notNullable();
      table.string('descrizione', 255);
      table.timestamps(true, true);
      table.unique(['id_ditta', 'codice']);
    });
  }

  // --- 2. Creazione Tabella va_clienti_anagrafica ---
  const clientiExists = await knex.schema.hasTable('va_clienti_anagrafica');
  if (!clientiExists) {
    await knex.schema.createTable('va_clienti_anagrafica', function(table) {
        table.increments('id').primary();
        table.integer('id_ditta_anagrafica').unsigned().notNullable();
        table.foreign('id_ditta_anagrafica').references('id').inTable('ditte').onDelete('CASCADE');
        // Aggiungere qui le altre colonne della tabella anagrafica...
        table.timestamps(true, true);
    });
  }

  // --- 3. Modifica della tabella va_clienti_anagrafica (con controllo) ---
  const hasColumn = await knex.schema.hasColumn('va_clienti_anagrafica', 'id_matrice_sconti');
  if (!hasColumn) {
    await knex.schema.alterTable('va_clienti_anagrafica', function(table) {
      table.integer('id_matrice_sconti').unsigned().nullable();
      table.foreign('id_matrice_sconti').references('id').inTable('va_matrice_sconti').onDelete('SET NULL');
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Rimuoviamo in ordine inverso e in sicurezza
  const clientiExists = await knex.schema.hasTable('va_clienti_anagrafica');
  if (clientiExists) {
    const hasColumn = await knex.schema.hasColumn('va_clienti_anagrafica', 'id_matrice_sconti');
    if (hasColumn) {
      await knex.schema.alterTable('va_clienti_anagrafica', function(table) {
        // È necessario rimuovere prima il vincolo di foreign key
        table.dropForeign('id_matrice_sconti');
        table.dropColumn('id_matrice_sconti');
      });
    }
  }
  
  await knex.schema.dropTableIfExists('va_matrice_sconti');
  // Se la tabella va_clienti_anagrafica è stata creata qui, andrebbe rimossa.
  // Se esiste già da prima, non va rimossa. Assumiamo che venga creata qui.
  await knex.schema.dropTableIfExists('va_clienti_anagrafica');
};