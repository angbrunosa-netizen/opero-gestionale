/**
 * Nome File: 20251222_add_advanced_seo_fields_to_web_pages.js
 * Percorso: migrations/20251222_add_advanced_seo_fields_to_web_pages.js
 * Data: 22/12/2025
 * Descrizione: Aggiunge campi SEO avanzati e gestione menu multilivello alla tabella web_pages
 */

exports.up = async function(knex) {
    console.log('🔧 Aggiunta campi SEO avanzati e menu multilivello alla tabella web_pages...');

    const hasTitoloPagina = await knex.schema.hasColumn('web_pages', 'titolo_pagina');
    const hasKeywordsSeo = await knex.schema.hasColumn('web_pages', 'keywords_seo');
    const hasImmagineSocial = await knex.schema.hasColumn('web_pages', 'immagine_social');
    const hasIdPageParent = await knex.schema.hasColumn('web_pages', 'id_page_parent');
    const hasOrdineMenu = await knex.schema.hasColumn('web_pages', 'ordine_menu');
    const hasLivelloMenu = await knex.schema.hasColumn('web_pages', 'livello_menu');
    const hasMostraMenu = await knex.schema.hasColumn('web_pages', 'mostra_menu');
    const hasLinkEsterno = await knex.schema.hasColumn('web_pages', 'link_esterno');
    const hasTargetLink = await knex.schema.hasColumn('web_pages', 'target_link');
    const hasIconaMenu = await knex.schema.hasColumn('web_pages', 'icona_menu');
    const hasDataPubblicazione = await knex.schema.hasColumn('web_pages', 'data_pubblicazione');
    const hasDataScadenza = await knex.schema.hasColumn('web_pages', 'data_scadenza');
    const hasPasswordProtetta = await knex.schema.hasColumn('web_pages', 'password_protetta');
    const hasLayoutTemplate = await knex.schema.hasColumn('web_pages', 'layout_template');
    const hasCanonicalUrl = await knex.schema.hasColumn('web_pages', 'canonical_url');
    const hasRobotsIndex = await knex.schema.hasColumn('web_pages', 'robots_index');
    const hasRobotsFollow = await knex.schema.hasColumn('web_pages', 'robots_follow');

    await knex.schema.table('web_pages', function(table) {
        // Campi SEO avanzati
        if (!hasTitoloPagina) {
            table.string('titolo_pagina', 200).comment('Titolo personalizzato della pagina');
        }
        if (!hasKeywordsSeo) {
            table.text('keywords_seo').comment('Keywords SEO separate da virgola');
        }
        if (!hasImmagineSocial) {
            table.string('immagine_social', 500).comment('URL immagine per social media (OG:image)');
        }

        // Campi gestione menu multilivello
        if (!hasIdPageParent) {
            table.integer('id_page_parent').unsigned().nullable()
                .references('id').inTable('web_pages').onDelete('SET NULL')
                .comment('Riferimento alla pagina parent per menu gerarchico');
        }
        if (!hasOrdineMenu) {
            table.integer('ordine_menu').defaultTo(0).comment('Ordine nel menu');
        }
        if (!hasLivelloMenu) {
            table.integer('livello_menu').defaultTo(1).comment('Livello di profondità nel menu (1-3)');
        }
        if (!hasMostraMenu) {
            table.boolean('mostra_menu').defaultTo(true).comment('Mostra/nascondi nel menu');
        }

        // Campi link e navigazione
        if (!hasLinkEsterno) {
            table.string('link_esterno', 500).nullable().comment('URL esterno per link nel menu');
        }
        if (!hasTargetLink) {
            table.string('target_link', 20).defaultTo('_self').comment('Target per link esterno (_self, _blank)');
        }
        if (!hasIconaMenu) {
            table.string('icona_menu', 100).nullable().comment('Icona per il menu (emoji o nome icona)');
        }

        // Campi pubblicazione programmata
        if (!hasDataPubblicazione) {
            table.datetime('data_pubblicazione').nullable().comment('Data pubblicazione programmata');
        }
        if (!hasDataScadenza) {
            table.datetime('data_scadenza').nullable().comment('Data scadenza pubblicazione');
        }

        // Campi protezione e layout
        if (!hasPasswordProtetta) {
            table.string('password_protetta', 255).nullable().comment('Password per proteggere la pagina');
        }
        if (!hasLayoutTemplate) {
            table.string('layout_template', 50).defaultTo('default').comment('Template layout della pagina');
        }

        // Campi SEO tecnici
        if (!hasCanonicalUrl) {
            table.string('canonical_url', 500).nullable().comment('URL canonical per SEO');
        }
        if (!hasRobotsIndex) {
            table.enum('robots_index', ['index', 'noindex']).defaultTo('index').comment('Directiva robots per indicizzazione');
        }
        if (!hasRobotsFollow) {
            table.enum('robots_follow', ['follow', 'nofollow']).defaultTo('follow').comment('Directiva robots per follow link');
        }
    });

    // Aggiungo indici per performance
    // MODIFICA: Utilizziamo try/catch e sintassi nativa Knex invece di raw SQL
    // per evitare errori su versioni MySQL che non supportano "CREATE INDEX IF NOT EXISTS"
    try {
        await knex.schema.table('web_pages', function(table) {
             table.index(['id_page_parent', 'ordine_menu'], 'idx_web_pages_parent_order');
        });
        console.log('✅ Indice idx_web_pages_parent_order creato.');
    } catch (error) {
        // Ignoriamo l'errore se l'indice esiste già (codice errore comune per duplicate key/index)
        console.log('⚡ Nota: L\'indice esiste già o non può essere creato (skipping).');
    }

    console.log('✅ Campi SEO avanzati aggiunti con successo!');
};

exports.down = async function(knex) {
    console.log('⏪ Rimozione campi SEO avanzati dalla tabella web_pages...');

    await knex.schema.table('web_pages', function(table) {
        // Rimuovo indici se esistono
        table.dropIndexIfExists(['id_page_parent', 'ordine_menu']);

        // Rimuovo le colonne aggiunte
        table.dropColumnIfExists('titolo_pagina');
        table.dropColumnIfExists('keywords_seo');
        table.dropColumnIfExists('immagine_social');
        table.dropColumnIfExists('id_page_parent');
        table.dropColumnIfExists('ordine_menu');
        table.dropColumnIfExists('livello_menu');
        table.dropColumnIfExists('mostra_menu');
        table.dropColumnIfExists('link_esterno');
        table.dropColumnIfExists('target_link');
        table.dropColumnIfExists('icona_menu');
        table.dropColumnIfExists('data_pubblicazione');
        table.dropColumnIfExists('data_scadenza');
        table.dropColumnIfExists('password_protetta');
        table.dropColumnIfExists('layout_template');
        table.dropColumnIfExists('canonical_url');
        table.dropColumnIfExists('robots_index');
        table.dropColumnIfExists('robots_follow');
    });

    console.log('✅ Campi SEO avanzati rimossi con successo!');
};