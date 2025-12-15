/**
 * Migration: Creazione tabella ai_content_cache
 * Tabella per caching dei contenuti generati dall'AI
 * Fix: Rimosso defaultTo da colonne JSON per compatibilità MySQL 8.0
 * Fix 2: Rimossa la creazione del TRIGGER che richiede privilegi SUPER.
 */

exports.up = function(knex) {
  return knex.schema.hasTable('ai_content_cache')
    .then(exists => {
      if (exists) {
        console.log('Tabella ai_content_cache già esistente, salto creazione');
        return Promise.resolve();
      }

      return knex.schema.createTable('ai_content_cache', (table) => {
        // Primary key
        table.string('context_hash', 64).primary().comment('Hash MD5 del contesto per identificazione univoca');

        // Chiave esterna
        table.integer('id_ditta').unsigned().notNullable().comment('ID azienda proprietaria del contenuto');

        // Dati del contenuto
        table.string('page_type', 50).notNullable().comment('Tipo di pagina: home, about, services, global_styles, etc.');
        table.text('ai_prompt').comment('Prompt completo inviato all\'AI');
        table.json('generated_content').notNullable().comment('Contenuto generato dall\'AI in formato JSON');
        
        // --- FIX: Rimosso defaultTo('{}') per risolvere l'errore MySQL ---
        table.json('ai_metadata').nullable().comment('Metadati della generazione AI');

        // Campi di controllo
        table.string('industry', 100).nullable().comment('Settore merceologico per categorizzazione');
        table.decimal('confidence_score', 3, 2).defaultTo(0.85).comment('Punteggio di confidenza della generazione (0.00-1.00)');
        table.boolean('is_fallback').defaultTo(false).comment('Indica se è un contenuto di fallback');

        // Timestamp
        // Knex gestisce correttamente l'aggiornamento di questi campi lato MySQL 8.0 senza trigger esterni
        table.timestamp('created_at').defaultTo(knex.fn.now()); 
        table.timestamp('updated_at').defaultTo(knex.fn.now());
        table.timestamp('expires_at').notNullable().comment('Data di scadenza del cache');

        // Indici
        table.index(['id_ditta']);
        table.index(['page_type']);
        table.index(['industry']);
        table.index(['expires_at']);
        table.index(['created_at']);

        // Foreign key constraint
        table.foreign('id_ditta').references('id').inTable('ditte').onDelete('CASCADE');
      });
    })
    // --- MODIFICA: Rimossa intera sezione che crea il TRIGGER ---
    // .then(() => { ... })
    // .then(([result]) => { ... })
    .then(() => {
        console.log('✅ Tabella ai_content_cache creata. Creazione trigger saltata per privilegi SQL.');
        return Promise.resolve();
    });
};

exports.down = function(knex) {
  // Elimina il trigger se esiste (per pulizia, ma non dovrebbe essere stato creato)
  return knex.raw('DROP TRIGGER IF EXISTS ai_content_cache_updated_at')
    .then(() => {
        return knex.schema
          .dropTableIfExists('ai_content_cache');
    });
};