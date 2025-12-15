/**
 * Migration: Aggiunta supporto AI alle tabelle esistenti
 * Data: 2025-12-13
 * Scopo: Estendere tabelle esistenti per supporto AI-generazione mantenendo retrocompatibilità
 * FIX: Resa la migrazione idempotente (non fallisce su colonne già esistenti)
 */

exports.up = function(knex) {
  const alterSitiWebAziendali = knex.schema.alterTable('siti_web_aziendali', async (table) => {
    // AI generation metadata
    if (!(await knex.schema.hasColumn('siti_web_aziendali', 'ai_generated'))) {
        table.boolean('ai_generated').defaultTo(false).after('catalog_settings').comment('Sito generato con AI');
    }
    if (!(await knex.schema.hasColumn('siti_web_aziendali', 'ai_company_context'))) {
        table.text('ai_company_context').nullable().after('ai_generated').comment('Contesto aziendale usato per AI generation');
    }
    if (!(await knex.schema.hasColumn('siti_web_aziendali', 'ai_model_version'))) {
        table.string('ai_model_version', 20).nullable().after('ai_company_context').comment('Versione modello AI usato');
    }
    if (!(await knex.schema.hasColumn('siti_web_aziendali', 'ai_generation_metadata'))) {
        table.json('ai_generation_metadata').nullable().after('ai_model_version').comment('Metadata generazione AI');
    }
    
    // AI optimization suggestions
    if (!(await knex.schema.hasColumn('siti_web_aziendali', 'ai_suggestions'))) {
        table.json('ai_suggestions').nullable().after('ai_generation_metadata').comment('Suggerimenti miglioramento AI');
    }
    if (!(await knex.schema.hasColumn('siti_web_aziendali', 'ai_seo_optimizations'))) {
        table.json('ai_seo_optimizations').nullable().after('ai_suggestions').comment('Ottimizzazioni SEO AI');
    }

    // AI enhancement flags
    if (!(await knex.schema.hasColumn('siti_web_aziendali', 'ai_enhanced_content'))) {
        table.boolean('ai_enhanced_content').defaultTo(false).after('ai_seo_optimizations').comment('Contenuti migliorati con AI');
    }
    if (!(await knex.schema.hasColumn('siti_web_aziendali', 'ai_last_analysis'))) {
        table.timestamp('ai_last_analysis').nullable().after('ai_enhanced_content').comment('Ultima analisi AI');
    }
  });

  const alterPagineSitoWeb = knex.schema.alterTable('pagine_sito_web', async (table) => {
    // AI generation metadata per pagine
    if (!(await knex.schema.hasColumn('pagine_sito_web', 'ai_generated'))) {
        table.boolean('ai_generated').defaultTo(false).after('contenuto_json').comment('Pagina generata con AI');
    }
    if (!(await knex.schema.hasColumn('pagine_sito_web', 'ai_generation_prompt'))) {
        table.text('ai_generation_prompt').nullable().after('ai_generated').comment('Prompt usato per generazione');
    }
    if (!(await knex.schema.hasColumn('pagine_sito_web', 'ai_confidence_score'))) {
        table.decimal('ai_confidence_score', 5, 2).nullable().after('ai_generation_prompt').comment('Score confidence AI (0.00-1.00)');
    }
    if (!(await knex.schema.hasColumn('pagine_sito_web', 'ai_content_sections'))) {
        table.json('ai_content_sections').nullable().after('ai_confidence_score').comment('Sezioni generate da AI');
    }

    // AI enhancement and optimization
    if (!(await knex.schema.hasColumn('pagine_sito_web', 'ai_enhancements'))) {
        table.json('ai_enhancements').nullable().after('ai_content_sections').comment('Miglioramenti AI applicati');
    }
    if (!(await knex.schema.hasColumn('pagine_sito_web', 'ai_seo_metadata'))) {
        table.json('ai_seo_metadata').nullable().after('ai_enhancements').comment('SEO metadata generato da AI');
    }
    if (!(await knex.schema.hasColumn('pagine_sito_web', 'ai_optimized_for_mobile'))) {
        table.boolean('ai_optimized_for_mobile').defaultTo(false).after('ai_seo_metadata').comment('Ottimizzato per mobile da AI');
    }

    // AI suggestions for improvement
    if (!(await knex.schema.hasColumn('pagine_sito_web', 'ai_improvement_suggestions'))) {
        table.json('ai_improvement_suggestions').nullable().after('ai_optimized_for_mobile').comment('Suggerimenti miglioramento AI');
    }
    if (!(await knex.schema.hasColumn('pagine_sito_web', 'ai_alternative_versions'))) {
        table.json('ai_alternative_versions').nullable().after('ai_improvement_suggestions').comment('Versioni alternative generate da AI');
    }
  });


  // Eseguiamo gli alterTable in parallelo e poi proseguiamo
  return Promise.all([alterSitiWebAziendali, alterPagineSitoWeb])
  .then(() => {
    // La creazione di 'ai_content_cache' è stata spostata nel file 20251212...
    // Qui creiamo solo la tabella 'ai_template_suggestions'
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
      // Tutta la logica di drop deve essere idempotente
      return knex.schema.alterTable('pagine_sito_web', async (table) => {
        const dropIfExists = async (column) => {
            if (await knex.schema.hasColumn('pagine_sito_web', column)) {
                table.dropColumn(column);
            }
        };

        await dropIfExists('ai_generated');
        await dropIfExists('ai_generation_prompt');
        await dropIfExists('ai_confidence_score');
        await dropIfExists('ai_content_sections');
        await dropIfExists('ai_enhancements');
        await dropIfExists('ai_seo_metadata');
        await dropIfExists('ai_optimized_for_mobile');
        await dropIfExists('ai_improvement_suggestions');
        await dropIfExists('ai_alternative_versions');
      });
    })
    .then(() => {
      return knex.schema.alterTable('siti_web_aziendali', async (table) => {
        const dropIfExists = async (column) => {
            if (await knex.schema.hasColumn('siti_web_aziendali', column)) {
                table.dropColumn(column);
            }
        };

        await dropIfExists('ai_generated');
        await dropIfExists('ai_company_context');
        await dropIfExists('ai_model_version');
        await dropIfExists('ai_generation_metadata');
        await dropIfExists('ai_suggestions');
        await dropIfExists('ai_seo_optimizations');
        await dropIfExists('ai_enhanced_content');
        await dropIfExists('ai_last_analysis');
      });
    });
};