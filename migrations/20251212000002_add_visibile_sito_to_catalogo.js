/**
 * Migration: Add visibile_sito field to catalogo table
 * Campo per mostrare/nascondere prodotti nel sito web
 */

exports.up = function(knex) {
  return knex.schema.hasTable('ct_catalogo')
    .then(exists => {
      if (!exists) {
        console.log('Tabella ct_catalogo non esistente, salto migration');
        return Promise.resolve();
      }

      return knex.schema.hasColumn('ct_catalogo', 'visibile_sito')
        .then(hasColumn => {
          if (hasColumn) {
            console.log('Colonna visibile_sito già esistente in ct_catalogo');
            return Promise.resolve();
          }

          return knex.schema.table('ct_catalogo', (table) => {
            table.boolean('visibile_sito').defaultTo(false).comment('Visibile nel sito web');
          });
        });
    });
};

exports.down = function(knex) {
  return knex.schema.hasTable('ct_catalogo')
    .then(exists => {
      if (!exists) {
        return Promise.resolve();
      }

      return knex.schema.hasColumn('ct_catalogo', 'visibile_sito')
        .then(hasColumn => {
          if (hasColumn) {
            return knex.schema.table('ct_catalogo', (table) => {
              table.dropColumn('visibile_sito');
            });
          }
        });
    });
};