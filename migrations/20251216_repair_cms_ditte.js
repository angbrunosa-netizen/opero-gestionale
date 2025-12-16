/**
 * Nome File: 20251216_repair_cms_ditte.js
 * Descrizione: Migrazione di riparazione.
 * Assicura che la tabella 'ditte' abbia le colonne necessarie per il CMS
 * (url_slug, colori, template) che potrebbero essere state saltate.
 */

exports.up = async function(knex) {
  const table = 'ditte';
  
  // 1. Aggiungi url_slug
  if (!(await knex.schema.hasColumn(table, 'url_slug'))) {
    await knex.schema.table(table, t => {
        t.string('url_slug', 100).unique().nullable().index().comment('Slug URL per il sito web');
    });
    console.log('✅ Aggiunta colonna url_slug');
  }

  // 2. Aggiungi shop_attivo
  if (!(await knex.schema.hasColumn(table, 'shop_attivo'))) {
    await knex.schema.table(table, t => {
        t.boolean('shop_attivo').defaultTo(0);
    });
    console.log('✅ Aggiunta colonna shop_attivo');
  }

  // 3. Aggiungi colori
  if (!(await knex.schema.hasColumn(table, 'shop_colore_primario'))) {
    await knex.schema.table(table, t => {
        t.string('shop_colore_primario', 7).defaultTo('#000000');
        t.string('shop_colore_secondario', 7).defaultTo('#ffffff');
    });
    console.log('✅ Aggiunte colonne colori shop');
  }
  
  // 4. Aggiungi banner e descrizione home (opzionali ma utili)
  if (!(await knex.schema.hasColumn(table, 'shop_banner_url'))) {
    await knex.schema.table(table, t => {
        t.string('shop_banner_url', 500).nullable();
        t.text('shop_descrizione_home').nullable();
    });
    console.log('✅ Aggiunte colonne banner/descrizione');
  }

  // 5. Aggiungi Foreign Key Template (se manca la colonna)
  if (!(await knex.schema.hasColumn(table, 'id_web_template'))) {
    await knex.schema.table(table, t => {
         t.integer('id_web_template').unsigned().nullable()
          .references('id').inTable('web_templates');
    });
    console.log('✅ Aggiunta FK id_web_template');
  }
};

exports.down = async function(knex) {
  // In caso di rollback, rimuoviamo le colonne aggiunte
  await knex.schema.table('ditte', t => {
      t.dropColumn('url_slug');
      t.dropColumn('shop_attivo');
      t.dropColumn('shop_colore_primario');
      t.dropColumn('shop_colore_secondario');
      t.dropColumn('shop_banner_url');
      t.dropColumn('shop_descrizione_home');
      // Per la FK, controlliamo se esiste prima di dropparla per evitare errori
      // t.dropForeign('id_web_template'); // Spesso problematico in rollback parziali
      t.dropColumn('id_web_template');
  });
};