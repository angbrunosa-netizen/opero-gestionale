/**
 * @file 20251208100000_create_wg_galleries_tables.js
 * @description Knex migration per tabelle gallerie fotografiche Website Builder
 * @author Website Builder Team
 * @date 08/12/2025
 * Modifica: Rimosso defaultTo da colonne JSON per compatibilità MySQL 8.0
 * Modifica 2: Rimossi i TRIGGERS per evitare l'errore SUPER privilege
 */

exports.up = async function(knex) {
  // Tabella principale per le gallerie (wg = Website Gallery)
  await knex.schema.createTable('wg_galleries', function(table) {
    table.increments('id').primary();

    // Foreign keys
    table.integer('id_sito_web').unsigned().notNullable()
      .comment('FK verso siti_web_aziendali');
    table.integer('id_pagina').unsigned().nullable()
      .comment('FK verso pagine_sito_web - NULL per gallerie globali');

    // Campi principali
    table.string('nome_galleria', 255).notNullable()
      .comment('Nome identificativo galleria');
    table.string('slug', 200).nullable()
      .comment('URL slug per gallerie pubbliche');
    table.text('descrizione').nullable()
      .comment('Descrizione galleria');

    // Layout e visualizzazione
    table.enum('layout', ['grid-2', 'grid-3', 'grid-4', 'masonry', 'carousel'])
      .defaultTo('grid-3')
      .comment('Layout visualizzazione');

    // Impostazioni avanzate (JSON)
    // --- FIX: Rimosso defaultTo('{}') per compatibilità MySQL 8.0 ---
    table.json('impostazioni').nullable() 
      .comment('Impostazioni aggiuntive (spacing, borders, effects, etc.)');

    // Metadati SEO
    table.string('meta_title', 255).nullable();
    table.text('meta_description').nullable();

    // Stato e ordinamento
    table.boolean('is_active').defaultTo(true)
      .comment('Galleria visibile/pubblicata');
    table.integer('sort_order').defaultTo(0)
      .comment('Ordine visualizzazione');

    // Timestamps
    table.timestamps(true, true);

    // Foreign keys constraints
    table.foreign('id_sito_web')
      .references('id')
      .inTable('siti_web_aziendali')
      .onDelete('CASCADE');

    table.foreign('id_pagina')
      .references('id')
      .inTable('pagine_sito_web')
      .onDelete('CASCADE');

    // Indexes
    table.index(['id_sito_web'], 'idx_wg_galleries_sito');
    table.index(['id_pagina'], 'idx_wg_galleries_pagina');
    table.index(['is_active', 'sort_order'], 'idx_wg_galleries_active');
    table.index(['slug', 'id_sito_web'], 'idx_wg_galleries_slug');
  });

  // Tabella per le immagini nelle gallerie
  await knex.schema.createTable('wg_gallery_images', function(table) {
    table.increments('id').primary();

    // Foreign keys
    table.integer('id_galleria').unsigned().notNullable()
      .comment('FK verso wg_galleries');
    table.integer('id_file').unsigned().notNullable()
      .comment('FK verso dm_files (immagine)');

    // Metadati immagine
    table.text('caption').nullable()
      .comment('Didascalia immagine');
    table.string('alt_text', 500).nullable()
      .comment('Testo alternativo per SEO/Accessibilità');
    table.string('title_text', 255).nullable()
      .comment('Titolo immagine (tooltip)');

    // Posizione e ordinamento
    table.integer('order_pos').notNullable().defaultTo(0)
      .comment('Posizione nella galleria');

    // Impostazioni specifiche immagine (JSON)
    // --- FIX: Rimosso defaultTo('{}') per compatibilità MySQL 8.0 ---
    table.json('impostazioni').nullable() 
      .comment('Impostazioni singola immagine (link, effetti, etc.)');

    // Timestamps
    table.timestamps(true, true);

    // Foreign keys constraints
    table.foreign('id_galleria')
      .references('id')
      .inTable('wg_galleries')
      .onDelete('CASCADE');

    table.foreign('id_file')
      .references('id')
      .inTable('dm_files')
      .onDelete('CASCADE');

    // Indexes
    table.index(['id_galleria', 'order_pos'], 'idx_wg_gallery_images_order');
    table.index(['id_file'], 'idx_wg_gallery_images_file');

    // Unique constraint
    table.unique(['id_galleria', 'id_file'], 'uq_wg_gallery_images');
  });

  // Vista per facile query gallerie con conteggio immagini
  await knex.raw(`
    CREATE VIEW v_wg_galleries_complete AS
    SELECT
      g.*,
      COUNT(gi.id) as numero_immagini,
      MIN(gi.order_pos) as prima_posizione,
      MAX(gi.updated_at) as ultima_modifica_immagini
    FROM wg_galleries g
    LEFT JOIN wg_gallery_images gi ON g.id = gi.id_galleria
    WHERE g.is_active = 1
    GROUP BY g.id
  `);

  // Vista per immagini galleria con metadati file
  await knex.raw(`
    CREATE VIEW v_wg_gallery_images_complete AS
    SELECT
      gi.*,
      g.nome_galleria,
      g.id_sito_web,
      g.id_pagina,
      f.file_name_originale,
      f.mime_type,
      f.file_size_bytes,
      f.s3_key,
      CONCAT('https://s3.operocloud.it/', f.s3_key) as url_file,
      CONCAT('https://s3.operocloud.it/', f.s3_key) as preview_url,
      f.created_at as file_created_at,
      f.updated_at as file_updated_at
    FROM wg_gallery_images gi
    JOIN wg_galleries g ON gi.id_galleria = g.id
    JOIN dm_files f ON gi.id_file = f.id
    WHERE g.is_active = 1
  `);
  
  // --- MODIFICA: Rimossi i TRIGGERS Raw SQL ---
  // I triggers causano l'errore "SUPER privilege" in produzione.
  // La generazione dello slug sarà gestita a livello di codice applicativo (server Express).
  // --- FINE MODIFICA ---
};

exports.down = async function(knex) {
  // Drop triggers (sono stati rimossi nell'UP, ma per pulizia li manteniamo qui)
  await knex.raw('DROP TRIGGER IF EXISTS tr_wg_galleries_before_insert');
  await knex.raw('DROP TRIGGER IF EXISTS tr_wg_galleries_before_update');

  // Drop views
  await knex.raw('DROP VIEW IF EXISTS v_wg_gallery_images_complete');
  await knex.raw('DROP VIEW IF EXISTS v_wg_galleries_complete');

  // Drop tables
  await knex.schema.dropTableIfExists('wg_gallery_images');
  await knex.schema.dropTableIfExists('wg_galleries');
};