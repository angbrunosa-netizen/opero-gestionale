/**
 * Migration: Aggiunta supporto AI alle tabelle esistenti
 * Data: 2025-12-13
 * Scopo: Estendere tabelle esistenti per supporto AI-generazione mantenendo retrocompatibilità
 */

exports.up = function(knex) {
  return knex.schema.alterTable('siti_web_aziendali', (table) => {
    // AI generation metadata
    table.boolean('ai_generated').defaultTo(false).after('catalog_settings').comment('Sito generato con AI');
    table.text('ai_company_context').nullable().after('ai_generated').comment('Contesto aziendale usato per AI generation');
    table.string('ai_model_version', 20).nullable().after('ai_company_context').comment('Versione modello AI usato');
    table.json('ai_generation_metadata').nullable().after('ai_model_version').comment('Metadata generazione AI');

    // AI optimization suggestions
    table.json('ai_suggestions').nullable().after('ai_generation_metadata').comment('Suggerimenti miglioramento AI');
    table.json('ai_seo_optimizations').nullable().after('ai_suggestions').comment('Ottimizzazioni SEO AI');

    // AI enhancement flags
    table.boolean('ai_enhanced_content').defaultTo(false).after('ai_seo_optimizations').comment('Contenuti migliorati con AI');
    table.timestamp('ai_last_analysis').nullable().after('ai_enhanced_content').comment('Ultima analisi AI');
  })
  .then(() => {
    return knex.schema.alterTable('pagine_sito_web', (table) => {
      // AI generation metadata per pagine
      table.boolean('ai_generated').defaultTo(false).after('contenuto_json').comment('Pagina generata con AI');
      table.text('ai_generation_prompt').nullable().after('ai_generated').comment('Prompt usato per generazione');
      table.decimal('ai_confidence_score', 5, 2).nullable().after('ai_generation_prompt').comment('Score confidence AI (0.00-1.00)');
      table.json('ai_content_sections').nullable().after('ai_confidence_score').comment('Sezioni generate da AI');

      // AI enhancement and optimization
      table.json('ai_enhancements').nullable().after('ai_content_sections').comment('Miglioramenti AI applicati');
      table.json('ai_seo_metadata').nullable().after('ai_enhancements').comment('SEO metadata generato da AI');
      table.boolean('ai_optimized_for_mobile').defaultTo(false).after('ai_seo_metadata').comment('Ottimizzato per mobile da AI');

      // AI suggestions for improvement
      table.json('ai_improvement_suggestions').nullable().after('ai_optimized_for_mobile').comment('Suggerimenti miglioramento AI');
      table.json('ai_alternative_versions').nullable().after('ai_improvement_suggestions').comment('Versioni alternative generate da AI');
    });
  })
  .then(() => {
    return knex.schema.createTable('ai_content_cache', (table) => {
      table.increments('id').primary();
      table.string('context_hash', 64).unique().notNullable().comment('Hash del contesto aziendale');
      table.integer('id_ditta').unsigned().notNullable().comment('ID ditta associata');
      table.string('page_type', 50).notNullable().comment('Tipo pagina generata');
      table.string('industry', 100).nullable().comment('Settore merceologico');
      table.text('ai_prompt').nullable().comment('Prompt completo usato');
      table.json('generated_content').nullable().comment('Contenuto generato');
      table.json('ai_metadata').nullable().comment('Metadata generazione');
      table.string('ai_model', 50).nullable().comment('Modello AI usato');
      table.decimal('confidence_score', 5, 2).nullable().comment('Score di confidenza');
      table.integer('usage_count').defaultTo(0).comment('Numero volte utilizzato');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('expires_at').nullable().comment('Scadenza cache');

      // Indexes
      table.index('context_hash', 'idx_context_hash');
      table.index('id_ditta', 'idx_ditta');
      table.index('page_type', 'idx_page_type');
      table.index('expires_at', 'idx_expires_at');
    });
  })
  .then(() => {
    return knex.schema.createTable('ai_template_suggestions', (table) => {
      table.increments('id').primary();
      table.integer('id_ditta').unsigned().notNullable().comment('ID ditta');
      table.string('template_type', 100).notNullable().comment('Tipo template suggerito');
      table.string('recommendation_reason', 500).nullable().comment('Motivazione raccomandazione');
      table.decimal('match_score', 5, 2).nullable().comment('Score di match (0.00-1.00)');
      table.json('customization_suggestions').nullable().comment('Suggerimenti personalizzazione');
      table.json('ai_analysis').nullable().comment('Analisi AI dettagliata');
      table.boolean('applied').defaultTo(false).comment('Se il suggerimento è stato applicato');
      table.timestamp('created_at').defaultTo(knex.fn.now());

      // Indexes
      table.index('id_ditta', 'idx_ditta');
      table.index('template_type', 'idx_template_type');
      table.index('match_score', 'idx_match_score');
      table.index('applied', 'idx_applied');
    });
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('ai_template_suggestions')
    .then(() => {
      return knex.schema.dropTableIfExists('ai_content_cache');
    })
    .then(() => {
      return knex.schema.alterTable('pagine_sito_web', (table) => {
        table.dropColumn('ai_generated');
        table.dropColumn('ai_generation_prompt');
        table.dropColumn('ai_confidence_score');
        table.dropColumn('ai_content_sections');
        table.dropColumn('ai_enhancements');
        table.dropColumn('ai_seo_metadata');
        table.dropColumn('ai_optimized_for_mobile');
        table.dropColumn('ai_improvement_suggestions');
        table.dropColumn('ai_alternative_versions');
      });
    })
    .then(() => {
      return knex.schema.alterTable('siti_web_aziendali', (table) => {
        table.dropColumn('ai_generated');
        table.dropColumn('ai_company_context');
        table.dropColumn('ai_model_version');
        table.dropColumn('ai_generation_metadata');
        table.dropColumn('ai_suggestions');
        table.dropColumn('ai_seo_optimizations');
        table.dropColumn('ai_enhanced_content');
        table.dropColumn('ai_last_analysis');
      });
    });
};