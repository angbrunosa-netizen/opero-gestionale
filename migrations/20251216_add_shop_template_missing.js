/**
 * Nome File: 20251216_add_shop_template_missing.js
 * Descrizione: Aggiunge esplicitamente la colonna 'shop_template' alla tabella 'ditte'
 * per risolvere l'errore #1054.
 */

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  const hasColumn = await knex.schema.hasColumn('ditte', 'shop_template');

  if (!hasColumn) {
    return knex.schema.table('ditte', function(table) {
      // Aggiunge la colonna shop_template
      table.string('shop_template', 50)
           .defaultTo('standard')
           .comment('Template grafico del sito (standard, fashion, industrial)');
           
      console.log('✅ Colonna shop_template aggiunta correttamente.');
    });
  } else {
      console.log('ℹ️ Colonna shop_template già presente.');
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.table('ditte', function(table) {
    table.dropColumn('shop_template');
  });
};