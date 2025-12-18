/**
 * Migration per la creazione delle tabelle del sistema blog multi-tenant
 * Data: 18/12/2025
 * Descrizione: Crea le tabelle web_blog_categories e web_blog_posts
 */

exports.up = async function(knex) {
    // Tabella Categorie Blog
    await knex.schema.createTable('web_blog_categories', function(table) {
        table.increments('id').primary();
        table.integer('id_ditta').unsigned().notNullable();
        table.string('nome', 255).notNullable();
        table.string('slug', 255).notNullable().unique();
        table.string('colore', 7).default('#2563eb'); // Colore esadecimale
        table.text('descrizione').nullable();
        table.integer('ordine').default(0);
        table.boolean('attivo').default(1);
        table.timestamps(true, true);

        // Indici
        table.index(['id_ditta', 'attivo']);
        table.index(['slug']);
        table.foreign('id_ditta').references('id').inTable('ditte').onDelete('CASCADE');
    });

    // Tabella Post Blog
    await knex.schema.createTable('web_blog_posts', function(table) {
        table.increments('id').primary();
        table.integer('id_ditta').unsigned().notNullable();
        table.integer('id_category').unsigned().nullable();
        table.string('titolo', 255).notNullable();
        table.string('slug', 255).notNullable().unique();
        table.text('descrizione_breve').nullable();
        table.longText('contenuto').nullable();
        table.string('autore', 255).nullable();
        table.string('copertina_url', 500).nullable();
        table.string('copertina_alt', 255).nullable();
        table.string('pdf_url', 500).nullable(); // Per allegati PDF
        table.string('pdf_filename', 255).nullable();
        table.boolean('pubblicato').default(0);
        table.boolean('in_evidenza').default(0);
        table.datetime('data_pubblicazione').nullable();
        table.datetime('data_scadenza').nullable();
        table.integer('visualizzazioni').default(0);
        table.string('meta_title', 255).nullable();
        table.text('meta_description').nullable();
        table.string('meta_keywords', 500).nullable();
        table.string('seo_slug', 255).nullable();
        table.timestamps(true, true);

        // Indici
        table.index(['id_ditta', 'pubblicato']);
        table.index(['id_category']);
        table.index(['slug']);
        table.index(['data_pubblicazione']);
        table.index(['in_evidenza']);
        table.foreign('id_ditta').references('id').inTable('ditte').onDelete('CASCADE');
        table.foreign('id_category').references('id').inTable('web_blog_categories').onDelete('SET NULL');
    });
};

exports.down = async function(knex) {
    await knex.schema.dropTableIfExists('web_blog_posts');
    await knex.schema.dropTableIfExists('web_blog_categories');
};