/**
 * Nome File: 20251217_create_blog_tables.js
 * Percorso: opero-gestionale/migrations/20251217_create_blog_tables.js
 * Data: 18/12/2025
 * Descrizione: Migrazione per creare le tabelle del sistema blog multi-tenant
 */

exports.up = function(knex) {
  return knex.schema
    // Tabella Categorie Blog
    .createTable('web_blog_categories', table => {
      table.increments('id').primary();
      table.integer('id_ditta').unsigned().notNullable().references('id').inTable('ditte').onDelete('CASCADE');
      table.string('nome', 100).notNullable();
      table.string('slug', 100).notNullable();
      table.string('colore', 7).default('#2563eb'); // Colore categoria per UI
      table.text('descrizione').nullable();
      table.integer('ordine').default(0); // Ordinamento personalizzato
      table.boolean('attivo').defaultTo(1);

      // Indici
      table.unique(['id_ditta', 'slug']);
      table.index(['id_ditta', 'ordine']);
      table.timestamps(true, true);
    })

    // Tabella Post Blog
    .createTable('web_blog_posts', table => {
      table.increments('id').primary();
      table.integer('id_ditta').unsigned().notNullable().references('id').inTable('ditte').onDelete('CASCADE');
      table.integer('id_category').unsigned().nullable().references('id').inTable('web_blog_categories').onDelete('SET NULL');
      table.string('titolo', 255).notNullable();
      table.string('slug', 255).notNullable();
      table.text('contenuto_html').nullable();     // Per articoli standard
      table.text('descrizione_breve').nullable(); // Abstract per preview
      table.string('copertina_url', 500).nullable(); // Immagine preview
      table.string('pdf_url', 500).nullable();       // URL S3 del PDF (se presente, sovrascrive html)
      table.string('pdf_filename', 255).nullable();  // Nome originale file PDF
      table.boolean('pubblicato').defaultTo(0);
      table.boolean('in_evidenza').defaultTo(0);     // Per articoli featured
      table.timestamp('data_pubblicazione').defaultTo(knex.fn.now());
      table.string('autore', 100).nullable();        // Autore articolo
      table.integer('visualizzazioni').defaultTo(0); // Contatore visite
      table.string('meta_titolo', 255).nullable();   // SEO
      table.text('meta_descrizione').nullable();     // SEO

      // Indici
      table.unique(['id_ditta', 'slug']);
      table.index(['id_ditta', 'pubblicato', 'data_pubblicazione']);
      table.index(['id_ditta', 'in_evidenza', 'pubblicato']);
      table.index(['id_category']);
      table.timestamps(true, true);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('web_blog_posts')
    .dropTableIfExists('web_blog_categories');
};