/**
 * Migration: Creazione tabelle sistema Website Builder
 * Version: 1.0
 * Date: 2025-12-05
 * Description: Tabelle per gestione siti web aziendali multi-tenant
 */

exports.up = async function(knex) {
  // Usiamo una transazione per assicurarci che tutto venga eseguito o nulla
  return knex.transaction(async (trx) => {

    // ============================================
    // 1. TABELLA SITI WEB AZIENDALI
    // ============================================
    await trx.schema.createTable('siti_web_aziendali', function(table) {
      table.increments('id').primary();
      table.integer('id_ditta').unsigned().notNullable();
      table.string('subdomain', 100).unique().notNullable().comment('Sottodominio univoco');
      table.enum('domain_status', ['active', 'inactive', 'pending']).defaultTo('pending').comment('Stato dominio');

      // Configurazione template
      table.integer('template_id').defaultTo(1).comment('ID template predefinito');
      table.json('theme_config').nullable().comment('Configurazione tema personalizzata');

      // SEO e contenuti base
      table.string('site_title', 255).nullable().comment('Titolo sito web');
      table.text('site_description').nullable().comment('Descrizione per SEO');
      table.string('logo_url', 500).nullable().comment('URL logo azienda');
      table.string('favicon_url', 500).nullable().comment('URL favicon');

      // Social media e analytics
      table.string('google_analytics_id', 50).nullable().comment('ID Google Analytics');
      table.string('facebook_url', 500).nullable().comment('URL Facebook');
      table.string('instagram_url', 500).nullable().comment('URL Instagram');
      table.string('linkedin_url', 500).nullable().comment('URL LinkedIn');

      // Impostazioni catalogo
      table.boolean('enable_catalog').defaultTo(false).comment('Abilita vetrina prodotti');
      table.json('catalog_settings').defaultTo('{}').comment('Impostazioni catalogo prodotti');

      // Timestamps (true, true crea sia created_at che updated_at con comportamento ON UPDATE)
      table.timestamps(true, true);

      // Foreign keys
      table.foreign('id_ditta').references('id').inTable('ditte').onDelete('CASCADE');

      // Indexes
      table.index('subdomain', 'idx_subdomain');
      table.index('id_ditta', 'idx_ditta');
      table.index('domain_status', 'idx_domain_status');
    });

    // ============================================
    // 2. TABELLA TEMPLATE SITI WEB
    // ============================================
    await trx.schema.createTable('template_siti_web', function(table) {
      table.increments('id').primary();
      table.string('nome_template', 100).notNullable().comment('Nome template');
      table.enum('categoria', ['basic', 'premium', 'ecommerce']).defaultTo('basic').comment('Categoria template');
      table.text('description').nullable().comment('Descrizione template');
      table.string('preview_image', 500).nullable().comment('Immagine anteprima');
      table.json('config_schema').nullable().comment('Schema configurazione template');
      table.boolean('is_active').defaultTo(true).comment('Template disponibile');
      table.integer('sort_order').defaultTo(0).comment('Ordine visualizzazione');
      table.timestamp('created_at').defaultTo(knex.fn.now());

      // Indexes
      table.index('categoria', 'idx_categoria');
      table.index('is_active', 'idx_is_active');
      table.index('sort_order', 'idx_sort_order');
    });

    // Insert template di default
    // Usiamo .onConflict().ignore() per emulare INSERT IGNORE
    await trx('template_siti_web').insert([
      {
        nome_template: 'Professional',
        categoria: 'basic',
        description: 'Template professionale pulito e moderno',
        config_schema: {
          theme: { primary_color: '#3B82F6', secondary_color: '#1E40AF', accent_color: '#60A5FA' },
          typography: { font_family: 'Inter, system-ui, sans-serif', base_font_size: '16px', h1_size: '48px' },
          layout: { max_width: '1200px', spacing: 'comfortable', border_radius: '8px' }
        }
      },
      { nome_template: 'Modern', categoria: 'basic', description: 'Template moderno con design minimalista', config_schema: { theme: { primary_color: '#10B981', secondary_color: '#047857', accent_color: '#34D399' } } },
      { nome_template: 'Creative', categoria: 'premium', description: 'Template creativo con design accattivante', config_schema: { theme: { primary_color: '#8B5CF6', secondary_color: '#7C3AED', accent_color: '#A78BFA' } } },
      { nome_template: 'Ecommerce', categoria: 'ecommerce', description: 'Template ottimizzato per vendita online', config_schema: { theme: { primary_color: '#F97316', secondary_color: '#EA580C', accent_color: '#FB923C' } } },
      { nome_template: 'Corporate', categoria: 'basic', description: 'Template corporate elegante e formale', config_schema: { theme: { primary_color: '#6B7280', secondary_color: '#374151', accent_color: '#9CA3AF' } } }
    ]).onConflict().ignore();

    // ============================================
    // 3. TABELLA PAGINE SITO WEB
    // ============================================
    await trx.schema.createTable('pagine_sito_web', function(table) {
      table.increments('id').primary();
      table.integer('id_sito_web').notNullable();
      table.string('slug', 200).notNullable().comment('Slug URL pagina');
      table.string('titolo', 255).notNullable().comment('Titolo pagina');
      table.longText('contenuto_html').nullable().comment('Contenuto HTML statico');
      table.json('contenuto_json').nullable().comment('Contenuto strutturato per page builder');

      // SEO
      table.string('meta_title', 255).nullable().comment('Meta title SEO');
      table.text('meta_description').nullable().comment('Meta description SEO');
      table.string('meta_keywords', 500).nullable().comment('Meta keywords SEO');

      // Stato
      table.boolean('is_published').defaultTo(false).comment('Pagina pubblicata');
      table.integer('menu_order').defaultTo(0).comment('Ordine menu navigazione');

      // Timestamps
      table.timestamps(true, true);

      // Foreign keys
      table.foreign('id_sito_web').references('id').inTable('siti_web_aziendali').onDelete('CASCADE');

      // Indexes
      table.unique(['id_sito_web', 'slug'], 'unique_site_slug');
      table.index('is_published', 'idx_published');
      table.index('menu_order', 'idx_menu_order');
      table.index('created_at', 'idx_created_at');
    });

    // ============================================
    // 4. TABELLA ARTICOLI BLOG
    // ============================================
    await trx.schema.createTable('articoli_blog', function(table) {
      table.increments('id').primary();
      table.integer('id_sito_web').notNullable();
      table.string('titolo', 255).notNullable().comment('Titolo articolo');
      table.string('slug', 255).notNullable().comment('Slug URL articolo');
      table.longText('contenuto').nullable().comment('Contenuto articolo');
      table.string('immagine_url', 500).nullable().comment('URL immagine copertina');
      table.string('categoria', 100).nullable().comment('Categoria articolo');
      table.string('tags', 500).nullable().comment('Tag separati da virgola');
      table.string('autore', 255).nullable().comment('Nome autore');

      // SEO
      table.string('meta_title', 255).nullable().comment('Meta title SEO');
      table.text('meta_description').nullable().comment('Meta description SEO');

      // Stato
      table.boolean('is_published').defaultTo(false).comment('Articolo pubblicato');
      table.timestamp('published_at').nullable().comment('Data pubblicazione');
      table.boolean('featured').defaultTo(false).comment('Articolo in evidenza');
      table.integer('views_count').defaultTo(0).comment('Numero visualizzazioni');

      // Timestamps
      table.timestamps(true, true);

      // Foreign keys
      table.foreign('id_sito_web').references('id').inTable('siti_web_aziendali').onDelete('CASCADE');

      // Indexes
      table.unique(['id_sito_web', 'slug'], 'unique_site_slug');
      table.index('is_published', 'idx_published');
      table.index('featured', 'idx_featured');
      table.index('categoria', 'idx_categoria');
      table.index('published_at', 'idx_published_at');
    });

    // ============================================
    // 5. TABELLA ANALYTICS SITI WEB
    // ============================================
    await trx.schema.createTable('website_analytics', function(table) {
      table.increments('id').primary();
      table.integer('id_sito_web').notNullable();
      table.date('data_giorno').notNullable();

      // Statistiche visite
      table.integer('visite_totali').defaultTo(0).comment('Visite totali giornata');
      table.integer('visite_uniche').defaultTo(0).comment('Visitatori unici');
      table.integer('visualizzazioni_pagina').defaultTo(0).comment('Visualizzazioni pagine');

      // Sorgenti traffico
      table.integer('visite_organiche').defaultTo(0).comment('Visite da motori ricerca');
      table.integer('visite_social').defaultTo(0).comment('Visite da social media');
      table.integer('visite_direct').defaultTo(0).comment('Visite dirette');
      table.integer('visite_referral').defaultTo(0).comment('Visite da referral');

      // Dispositivi
      table.integer('visite_desktop').defaultTo(0).comment('Visite da desktop');
      table.integer('visite_mobile').defaultTo(0).comment('Visite da mobile');
      table.integer('visite_tablet').defaultTo(0).comment('Visite da tablet');

      // Tempo medio
      table.integer('tempo_medio_sessione').defaultTo(0).comment('Tempo medio sessione (secondi)');
      table.decimal('frequenza_rebound', 5, 2).defaultTo(0.00).comment('Frequenza di rimbalzo (%)');

      // Timestamp
      table.timestamp('created_at').defaultTo(knex.fn.now());

      // Foreign keys
      table.foreign('id_sito_web').references('id').inTable('siti_web_aziendali').onDelete('CASCADE');

      // Indexes
      table.unique(['id_sito_web', 'data_giorno'], 'unique_site_date');
      table.index('data_giorno', 'idx_data_giorno');
      table.index('visite_totali', 'idx_visite_totali');
    });

    // ============================================
    // 6. TABELLA WEBSITE_ACTIVITY LOG
    // ============================================
    await trx.schema.createTable('website_activity_log', function(table) {
      table.bigIncrements('id').primary();
      table.integer('id_sito_web').notNullable();
      table.integer('id_utente').nullable().comment('ID utente (se applicabile)');

      // Tipo attività
      table.string('azione', 50).notNullable().comment('Tipo di attività (create, update, delete, publish, etc.)');
      table.string('tipo_oggetto', 50).notNullable().comment('Tipo oggetto (site, page, template, image, etc.)');
      table.integer('id_oggetto').nullable().comment('ID oggetto modificato');
      table.string('descrizione_oggetto', 255).nullable().comment('Descrizione oggetto (es. titolo pagina)');

      // Dati precedenti e successivi
      table.json('dati_prima').nullable().comment('Stato prima modifica');
      table.json('dati_dopo').nullable().comment('Stato dopo modifica');

      // Context
      table.string('ip_address', 45).nullable().comment('IP client');
      table.text('user_agent').nullable().comment('User agent browser');

      // Timestamp
      table.timestamp('created_at').defaultTo(knex.fn.now());

      // Foreign keys
      table.foreign('id_sito_web').references('id').inTable('siti_web_aziendali').onDelete('CASCADE');

      // Indexes
      table.index('id_sito_web', 'idx_sito_web');
      table.index('azione', 'idx_azione');
      table.index('tipo_oggetto', 'idx_tipo_oggetto');
      table.index('created_at', 'idx_created_at');
    });

    // ============================================
    // VISTE OTTIMIZZATE PER PERFORMANCE (usando knex.raw)
    // ============================================
    await trx.raw(`
      CREATE OR REPLACE VIEW vw_website_stats AS
      SELECT
          sw.id,
          sw.subdomain,
          sw.site_title,
          sw.domain_status,
          d.ragione_sociale,
          COUNT(DISTINCT ps.id) as num_pagine,
          COUNT(DISTINCT ab.id) as num_articoli,
          COUNT(DISTINCT wa.data_giorno) as giorni_con_dati,
          sw.created_at,
          sw.updated_at
      FROM siti_web_aziendali sw
      JOIN ditte d ON sw.id_ditta = d.id
      LEFT JOIN pagine_sito_web ps ON sw.id = ps.id_sito_web
      LEFT JOIN articoli_blog ab ON sw.id = ab.id_sito_web
      LEFT JOIN website_analytics wa ON sw.id = wa.id_sito_web
      GROUP BY sw.id;
    `);

    await trx.raw(`
      CREATE OR REPLACE VIEW vw_website_catalogs AS
      SELECT
          sw.id as website_id,
          sw.subdomain,
          sw.site_title,
          sw.enable_catalog,
          sw.catalog_settings,
          COUNT(cp.id) as num_prodotti,
          COUNT(DISTINCT cp.id_categoria) as num_categorie,
          SUM(CASE WHEN cp.quantita_disponita > 0 THEN 1 ELSE 0 END) as num_disponibili,
          AVG(CASE WHEN cp.prezzo_vendita IS NOT NULL THEN cp.prezzo_vendita END) as prezzo_medio
      FROM siti_web_aziendali sw
      LEFT JOIN catalogo_prodotti cp ON sw.id_ditta = cp.id_ditta AND cp.is_active = 1
      GROUP BY sw.id, sw.subdomain, sw.site_title, sw.enable_catalog, sw.catalog_settings;
    `);

    // ============================================
    // TRIGGER PER LOG ATTIVITÀ (usando knex.raw)
    // Nota: La sintassi DELIMITER non è necessaria quando si esegue tramite knex.
    // ============================================
    await trx.raw(`
      CREATE TRIGGER tr_website_after_update
      AFTER UPDATE ON siti_web_aziendali
      FOR EACH ROW
      BEGIN
          IF OLD.domain_status != NEW.domain_status THEN
              INSERT INTO website_activity_log (id_sito_web, azione, tipo_oggetto, id_oggetto, dati_prima, dati_dopo)
              VALUES (
                  NEW.id,
                  'status_change',
                  'site_status',
                  NEW.id,
                  JSON_OBJECT('domain_status', OLD.domain_status),
                  JSON_OBJECT('domain_status', NEW.domain_status)
              );
          END IF;
      END;
    `);

    await trx.raw(`
      CREATE TRIGGER tr_pagine_sito_web_after_update
      AFTER UPDATE ON pagine_sito_web
      FOR EACH ROW
      BEGIN
          IF OLD.is_published != NEW.is_published OR OLD.titolo != NEW.titolo THEN
              INSERT INTO website_activity_log (id_sito_web, azione, tipo_oggetto, id_oggetto, descrizione_oggetto, dati_prima, dati_dopo)
              VALUES (
                  NEW.id_sito_web,
                  'update',
                  'page',
                  NEW.id,
                  NEW.titolo,
                  JSON_OBJECT('is_published', OLD.is_published, 'titolo', OLD.titolo),
                  JSON_OBJECT('is_published', NEW.is_published, 'titolo', NEW.titolo)
              );
          END IF;
      END;
    `);

    // ============================================
    // COMMENTI TABELLE (usando knex.raw)
    // ============================================
    await trx.raw(`ALTER TABLE siti_web_aziendali COMMENT = 'Tabella principale siti web aziendali - 1 sito per ditta';`);
    await trx.raw(`ALTER TABLE template_siti_web COMMENT = 'Template predefiniti per siti web';`);
    await trx.raw(`ALTER TABLE pagine_sito_web COMMENT = 'Pagine statiche e dinamiche dei siti web';`);
    await trx.raw(`ALTER TABLE articoli_blog COMMENT = 'Articoli blog per siti web';`);
    await trx.raw(`ALTER TABLE website_analytics COMMENT = 'Statistiche e analytics siti web (opzionale)';`);
    await trx.raw(`ALTER TABLE website_activity_log COMMENT = 'Log attività per audit e tracciabilità modifiche';`);
  });
};

exports.down = async function(knex) {
  return knex.transaction(async (trx) => {
    // L'ordine di rollback è l'inverso esatto della creazione
    // per evitare errori di foreign key.

    // 1. Drop Triggers
    await trx.raw('DROP TRIGGER IF EXISTS tr_website_after_update');
    await trx.raw('DROP TRIGGER IF EXISTS tr_pagine_sito_web_after_update');

    // 2. Drop Views
    await trx.schema.dropViewIfExists('vw_website_stats');
    await trx.schema.dropViewIfExists('vw_website_catalogs');

    // 3. Drop Tables
    await trx.schema.dropTableIfExists('website_activity_log');
    await trx.schema.dropTableIfExists('website_analytics');
    await trx.schema.dropTableIfExists('articoli_blog');
    await trx.schema.dropTableIfExists('pagine_sito_web');
    await trx.schema.dropTableIfExists('template_siti_web');
    await trx.schema.dropTableIfExists('siti_web_aziendali');
  });
};