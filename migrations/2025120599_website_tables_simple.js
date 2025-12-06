/**
 * Migration: Creazione tabelle website (Versione Semplice)
 * Date: 2025-12-05
 * Description: Tabelle per gestione siti web aziendali senza foreign key
 */

exports.up = async function(knex) {
  console.log('🚀 Creazione tabelle website semplice...');

  // 1. TABELLA SITI WEB AZIENDALI
  const sitiWebExists = await knex.schema.hasTable('siti_web_aziendali');
  if (!sitiWebExists) {
    await knex.schema.createTable('siti_web_aziendali', (table) => {
      table.increments('id').primary();
      table.integer('id_ditta').unsigned().notNullable();
      table.string('subdomain', 100).unique().notNullable().comment('Sottodominio univoco');
      table.enum('domain_status', ['active', 'inactive', 'pending']).defaultTo('pending').comment('Stato dominio');
      table.integer('template_id').defaultTo(1).comment('ID template predefinito');
      table.json('theme_config').nullable().comment('Configurazione tema personalizzata');
      table.string('site_title', 255).nullable().comment('Titolo sito web');
      table.text('site_description').nullable().comment('Descrizione per SEO');
      table.string('logo_url', 500).nullable().comment('URL logo azienda');
      table.string('favicon_url', 500).nullable().comment('URL favicon');
      table.string('google_analytics_id', 50).nullable().comment('ID Google Analytics');
      table.string('facebook_url', 500).nullable().comment('URL Facebook');
      table.string('instagram_url', 500).nullable().comment('URL Instagram');
      table.string('linkedin_url', 500).nullable().comment('URL LinkedIn');
      table.boolean('enable_catalog').defaultTo(false).comment('Abilita vetrina prodotti');
      table.json('catalog_settings').defaultTo('{}').comment('Impostazioni catalogo prodotti');
      table.timestamps(true, true);

      // Indexes
      table.index('subdomain', 'idx_subdomain');
      table.index('id_ditta', 'idx_ditta');
      table.index('domain_status', 'idx_domain_status');
    });
    console.log('✅ Tabella siti_web_aziendali creata');
  }

  // 2. TABELLA TEMPLATE SITI WEB
  const templateExists = await knex.schema.hasTable('template_siti_web');
  if (!templateExists) {
    await knex.schema.createTable('template_siti_web', (table) => {
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
    console.log('✅ Tabella template_siti_web creata');

    // Insert template di default
    await knex('template_siti_web').insert([
      {
        nome_template: 'Professional',
        categoria: 'basic',
        description: 'Template professionale pulito e moderno',
        config_schema: JSON.stringify({
          theme: { primary_color: '#3B82F6', secondary_color: '#1E40AF', accent_color: '#60A5FA' },
          typography: { font_family: 'Inter, system-ui, sans-serif', base_font_size: '16px', h1_size: '48px' },
          layout: { max_width: '1200px', spacing: 'comfortable', border_radius: '8px' }
        })
      },
      {
        nome_template: 'Modern',
        categoria: 'basic',
        description: 'Template moderno con design minimalista',
        config_schema: JSON.stringify({ theme: { primary_color: '#10B981', secondary_color: '#047857', accent_color: '#34D399' } })
      },
      {
        nome_template: 'Creative',
        categoria: 'premium',
        description: 'Template creativo con design accattivante',
        config_schema: JSON.stringify({ theme: { primary_color: '#8B5CF6', secondary_color: '#7C3AED', accent_color: '#A78BFA' } })
      },
      {
        nome_template: 'Ecommerce',
        categoria: 'ecommerce',
        description: 'Template ottimizzato per vendita online',
        config_schema: JSON.stringify({ theme: { primary_color: '#F97316', secondary_color: '#EA580C', accent_color: '#FB923C' } })
      }
    ]);
    console.log('✅ Template di default inseriti');
  }

  // 3. TABELLA PAGINE SITO WEB
  const pagesExists = await knex.schema.hasTable('pagine_sito_web');
  if (!pagesExists) {
    await knex.schema.createTable('pagine_sito_web', (table) => {
      table.increments('id').primary();
      table.integer('id_sito_web').unsigned().notNullable();
      table.string('slug', 200).notNullable().comment('Slug URL pagina');
      table.string('titolo', 255).notNullable().comment('Titolo pagina');
      table.longText('contenuto_html').nullable().comment('Contenuto HTML statico');
      table.json('contenuto_json').nullable().comment('Contenuto strutturato per page builder');
      table.string('meta_title', 255).nullable().comment('Meta title SEO');
      table.text('meta_description').nullable().comment('Meta description SEO');
      table.string('meta_keywords', 500).nullable().comment('Meta keywords SEO');
      table.boolean('is_published').defaultTo(false).comment('Pagina pubblicata');
      table.integer('menu_order').defaultTo(0).comment('Ordine menu navigazione');
      table.timestamps(true, true);

      // Indexes (unici senza foreign key)
      table.unique(['id_sito_web', 'slug'], 'unique_site_slug');
      table.index('is_published', 'idx_published');
      table.index('menu_order', 'idx_menu_order');
      table.index('created_at', 'idx_created_at');
    });
    console.log('✅ Tabella pagine_sito_web creata');
  }

  // 4. TABELLA ARTICOLI BLOG
  const blogExists = await knex.schema.hasTable('articoli_blog');
  if (!blogExists) {
    await knex.schema.createTable('articoli_blog', (table) => {
      table.increments('id').primary();
      table.integer('id_sito_web').unsigned().notNullable();
      table.string('titolo', 255).notNullable().comment('Titolo articolo');
      table.string('slug', 255).notNullable().comment('Slug URL articolo');
      table.longText('contenuto').nullable().comment('Contenuto articolo');
      table.string('immagine_url', 500).nullable().comment('URL immagine copertina');
      table.string('categoria', 100).nullable().comment('Categoria articolo');
      table.string('tags', 500).nullable().comment('Tag separati da virgola');
      table.string('autore', 255).nullable().comment('Nome autore');
      table.string('meta_title', 255).nullable().comment('Meta title SEO');
      table.text('meta_description').nullable().comment('Meta description SEO');
      table.boolean('is_published').defaultTo(false).comment('Articolo pubblicato');
      table.timestamp('published_at').nullable().comment('Data pubblicazione');
      table.boolean('featured').defaultTo(false).comment('Articolo in evidenza');
      table.integer('views_count').defaultTo(0).comment('Numero visualizzazioni');
      table.timestamps(true, true);

      // Indexes (unici senza foreign key)
      table.unique(['id_sito_web', 'slug'], 'unique_site_slug');
      table.index('is_published', 'idx_published');
      table.index('featured', 'idx_featured');
      table.index('categoria', 'idx_categoria');
      table.index('published_at', 'idx_published_at');
    });
    console.log('✅ Tabella articoli_blog creata');
  }

  // 5. TABELLA WEBSITE ANALYTICS
  const analyticsExists = await knex.schema.hasTable('website_analytics');
  if (!analyticsExists) {
    await knex.schema.createTable('website_analytics', (table) => {
      table.increments('id').primary();
      table.integer('id_sito_web').unsigned().notNullable();
      table.date('data_giorno').notNullable();
      table.integer('visite_totali').defaultTo(0).comment('Visite totali giornata');
      table.integer('visite_uniche').defaultTo(0).comment('Visitatori unici');
      table.integer('visualizzazioni_pagina').defaultTo(0).comment('Visualizzazioni pagine');
      table.integer('visite_organiche').defaultTo(0).comment('Visite da motori ricerca');
      table.integer('visite_social').defaultTo(0).comment('Visite da social media');
      table.integer('visite_direct').defaultTo(0).comment('Visite dirette');
      table.integer('visite_referral').defaultTo(0).comment('Visite da referral');
      table.integer('visite_desktop').defaultTo(0).comment('Visite da desktop');
      table.integer('visite_mobile').defaultTo(0).comment('Visite da mobile');
      table.integer('visite_tablet').defaultTo(0).comment('Visite da tablet');
      table.integer('tempo_medio_sessione').defaultTo(0).comment('Tempo medio sessione (secondi)');
      table.decimal('frequenza_rebound', 5, 2).defaultTo(0.00).comment('Frequenza di rimbalzo (%)');
      table.timestamp('created_at').defaultTo(knex.fn.now());

      // Indexes (unici senza foreign key)
      table.unique(['id_sito_web', 'data_giorno'], 'unique_site_date');
      table.index('data_giorno', 'idx_data_giorno');
      table.index('visite_totali', 'idx_visite_totali');
    });
    console.log('✅ Tabella website_analytics creata');
  }

  // 6. TABELLA WEBSITE ACTIVITY LOG
  const logExists = await knex.schema.hasTable('website_activity_log');
  if (!logExists) {
    await knex.schema.createTable('website_activity_log', (table) => {
      table.bigIncrements('id').primary();
      table.integer('id_sito_web').unsigned().notNullable();
      table.integer('id_utente').nullable().comment('ID utente (se applicabile)');
      table.string('azione', 50).notNullable().comment('Tipo di attività (create, update, delete, publish, etc.)');
      table.string('tipo_oggetto', 50).notNullable().comment('Tipo oggetto (site, page, template, image, etc.)');
      table.integer('id_oggetto').nullable().comment('ID oggetto modificato');
      table.string('descrizione_oggetto', 255).nullable().comment('Descrizione oggetto (es. titolo pagina)');
      table.json('dati_prima').nullable().comment('Stato prima modifica');
      table.json('dati_dopo').nullable().comment('Stato dopo modifica');
      table.string('ip_address', 45).nullable().comment('IP client');
      table.text('user_agent').nullable().comment('User agent browser');
      table.timestamp('created_at').defaultTo(knex.fn.now());

      // Indexes (senza foreign key)
      table.index('id_sito_web', 'idx_sito_web');
      table.index('azione', 'idx_azione');
      table.index('tipo_oggetto', 'idx_tipo_oggetto');
      table.index('created_at', 'idx_created_at');
    });
    console.log('✅ Tabella website_activity_log creata');
  }

  console.log('🎉 Tutte le tabelle website create con successo!');
};

exports.down = async function(knex) {
  console.log('🔄 Rollback tabelle website...');

  await knex.schema.dropTableIfExists('website_activity_log');
  await knex.schema.dropTableIfExists('website_analytics');
  await knex.schema.dropTableIfExists('articoli_blog');
  await knex.schema.dropTableIfExists('pagine_sito_web');
  await knex.schema.dropTableIfExists('template_siti_web');
  await knex.schema.dropTableIfExists('siti_web_aziendali');

  console.log('🎉 Rollback completato!');
};