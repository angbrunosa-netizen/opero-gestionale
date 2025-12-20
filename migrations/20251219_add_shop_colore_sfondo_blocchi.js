/**
 * Nome File: 20251219_add_shop_colore_sfondo_blocchi.js
 * Data: 19/12/2025
 * Versione: 1.0.0
 * Descrizione: Aggiunge il campo shop_colore_sfondo_blocchi alla tabella ditte per gestire il colore di sfondo comune dei blocchi.
 */

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Verifica se la colonna esiste già
  const hasColumn = await knex.schema.hasColumn('ditte', 'shop_colore_sfondo_blocchi');

  if (!hasColumn) {
    await knex.schema.table('ditte', table => {
      table.string('shop_colore_sfondo_blocchi', 7)
        .defaultTo('#ffffff')
        .comment('Colore di sfondo comune per tutti i blocchi del sito');
    });

    console.log('✅ Colonna shop_colore_sfondo_blocchi aggiunta alla tabella ditte');
  } else {
    console.log('ℹ️  La colonna shop_colore_sfondo_blocchi esiste già nella tabella ditte');
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  const hasColumn = await knex.schema.hasColumn('ditte', 'shop_colore_sfondo_blocchi');

  if (hasColumn) {
    await knex.schema.table('ditte', table => {
      table.dropColumn('shop_colore_sfondo_blocchi');
    });

    console.log('❌ Colonna shop_colore_sfondo_blocchi rimossa dalla tabella ditte');
  } else {
    console.log('ℹ️  La colonna shop_colore_sfondo_blocchi non esiste nella tabella ditte');
  }
};