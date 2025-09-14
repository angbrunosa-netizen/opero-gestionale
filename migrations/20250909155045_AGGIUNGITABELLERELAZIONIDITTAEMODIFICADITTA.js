/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // --- 1. Tabella per i TIPI di relazione ---
  const tipiRelazioneExists = await knex.schema.hasTable('an_tipi_relazione');
  if (!tipiRelazioneExists) {
    await knex.schema.createTable('an_tipi_relazione', function(table) {
      table.increments('id').primary();
      table.string('descrizione', 100).notNullable().unique();
      table.timestamps(true, true);
    });
    // Popoliamo la tabella solo se è stata appena creata
    await knex('an_tipi_relazione').insert([
        { descrizione: 'Cliente' },
        { descrizione: 'Fornitore' },
        { descrizione: 'Punto Vendita' },
        { descrizione: 'Partner' }
    ]);
  }

  // --- 2. Tabella di MAPPING per le relazioni tra anagrafiche ---
  const anRelazioniExists = await knex.schema.hasTable('an_relazioni');
  if (!anRelazioniExists) {
    await knex.schema.createTable('an_relazioni', function(table) {
      table.increments('id').primary();
      table.integer('id_ditta_origine').unsigned().notNullable();
      table.foreign('id_ditta_origine').references('id').inTable('ditte').onDelete('CASCADE');
      table.integer('id_ditta_correlata').unsigned().notNullable();
      table.foreign('id_ditta_correlata').references('id').inTable('ditte').onDelete('CASCADE');
      table.integer('id_tipo_relazione').unsigned().notNullable();
      table.foreign('id_tipo_relazione').references('id').inTable('an_tipi_relazione').onDelete('CASCADE');
      table.timestamps(true, true);
      table.unique(['id_ditta_origine', 'id_ditta_correlata', 'id_tipo_relazione'], { indexName: 'idx_relazione_unica' });
    });
  }
  
  // --- 3. Modifica della tabella `ditte` ---
  const ditteExists = await knex.schema.hasTable('ditte');
  if (ditteExists) {
    const hasTipoAnagrafica = await knex.schema.hasColumn('ditte', 'tipo_anagrafica');
    if (!hasTipoAnagrafica) {
      await knex.schema.alterTable('ditte', function(table) {
        table.string('tipo_anagrafica', 50).defaultTo('Azienda');
      });
    }
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Rimuoviamo in ordine inverso
  await knex.schema.dropTableIfExists('an_relazioni');
  await knex.schema.dropTableIfExists('an_tipi_relazione');
  
  const ditteExists = await knex.schema.hasTable('ditte');
  if (ditteExists) {
      const hasTipoAnagrafica = await knex.schema.hasColumn('ditte', 'tipo_anagrafica');
      if (hasTipoAnagrafica) {
          await knex.schema.alterTable('ditte', function(table) {
              table.dropColumn('tipo_anagrafica');
          });
      }
  }
};
