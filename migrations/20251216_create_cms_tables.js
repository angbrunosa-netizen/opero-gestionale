/**
 * Nome File: 20251216_create_cms_tables.js
 * Data: 16/12/2025
 * Versione: 1.1.0 (FIXED)
 * Descrizione: Creazione tabelle CMS e aggiornamento Ditte.
 * FIX: Risolto bug su hasColumn che impediva la creazione di url_slug.
 */

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // 1. Creazione Tabelle Nuove
  // Usiamo await per assicurarci che vengano create prima di modificarle
  const hasTemplates = await knex.schema.hasTable('web_templates');
  if (!hasTemplates) {
      await knex.schema.createTable('web_templates', table => {
        table.increments('id');
        table.string('codice', 50).unique().notNullable(); 
        table.string('nome', 100);
        table.text('descrizione');
      });
  }

  const hasPages = await knex.schema.hasTable('web_pages');
  if (!hasPages) {
      await knex.schema.createTable('web_pages', table => {
        table.increments('id');
        table.integer('id_ditta').unsigned().notNullable()
             .references('id').inTable('ditte').onDelete('CASCADE');
        table.string('slug', 100).notNullable(); 
        table.string('titolo_seo', 200); 
        table.string('descrizione_seo', 250);
        table.boolean('pubblicata').defaultTo(true);
        table.unique(['id_ditta', 'slug']);
        table.timestamps(true, true);
      });
  }

  const hasComponents = await knex.schema.hasTable('web_page_components');
  if (!hasComponents) {
      await knex.schema.createTable('web_page_components', table => {
        table.increments('id');
        table.integer('id_page').unsigned().notNullable()
             .references('id').inTable('web_pages').onDelete('CASCADE');
        table.string('tipo_componente', 50).notNullable(); 
        table.integer('ordine').defaultTo(0);
        table.json('dati_config').nullable();
      });
  }

  // 2. Aggiornamento Tabella Ditte
  // Controlliamo le colonne PRIMA di entrare nel builder della tabella
  const hasUrlSlug = await knex.schema.hasColumn('ditte', 'url_slug');
  const hasIdTemplate = await knex.schema.hasColumn('ditte', 'id_web_template');

  await knex.schema.table('ditte', table => {
       if (!hasUrlSlug) {
           table.string('url_slug', 100).unique().index().comment('Slug URL per il sito web');
           table.string('shop_colore_primario', 7).defaultTo('#000000');
           table.string('shop_colore_secondario', 7).defaultTo('#ffffff');
           table.boolean('shop_attivo').defaultTo(0);
       }
       if (!hasIdTemplate) {
           table.integer('id_web_template').unsigned().references('id').inTable('web_templates');
       }
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Rimuovi FK e colonne da ditte
  const hasIdTemplate = await knex.schema.hasColumn('ditte', 'id_web_template');
  if (hasIdTemplate) {
      await knex.schema.table('ditte', t => {
          t.dropForeign('id_web_template');
          t.dropColumn('id_web_template');
          // Nota: non rimuoviamo url_slug e altri campi per evitare perdita dati accidentale in dev
          // t.dropColumn('url_slug'); 
      });
  }

  // Droppa tabelle
  await knex.schema.dropTableIfExists('web_page_components');
  await knex.schema.dropTableIfExists('web_pages');
  await knex.schema.dropTableIfExists('web_templates');
};