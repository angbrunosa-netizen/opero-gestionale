/**
 * Migration: Add usage_count field to ai_content_cache table
 * Campo per tracciare quante volte un contenuto è stato utilizzato
 */

exports.up = function(knex) {
  return knex.schema.hasTable('ai_content_cache')
    .then(exists => {
      if (!exists) {
        console.log('Tabella ai_content_cache non esistente, salto migration');
        return Promise.resolve();
      }

      return knex.schema.hasColumn('ai_content_cache', 'usage_count')
        .then(hasColumn => {
          if (hasColumn) {
            console.log('Colonna usage_count già esistente in ai_content_cache');
            return Promise.resolve();
          }

          return knex.schema.table('ai_content_cache', (table) => {
            table.integer('usage_count').defaultTo(0).comment('Numero di volte che il contenuto è stato utilizzato');
          });
        });
    });
};

exports.down = function(knex) {
  return knex.schema.hasTable('ai_content_cache')
    .then(exists => {
      if (!exists) {
        return Promise.resolve();
      }

      return knex.schema.hasColumn('ai_content_cache', 'usage_count')
        .then(hasColumn => {
          if (hasColumn) {
            return knex.schema.table('ai_content_cache', (table) => {
              table.dropColumn('usage_count');
            });
          }
        });
    });
};