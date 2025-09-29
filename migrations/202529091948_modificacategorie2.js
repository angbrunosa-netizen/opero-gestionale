/**
 * @file opero/migrations/20250929204500_add_codice_to_ct_categorie.js
 * @description file di migrazione knex per aggiungere i campi per la codifica gerarchica alla tabella delle categorie.
 * - aggiunge 'codice_categoria' (varchar) per il codice completo.
 * - aggiunge 'progressivo' (int) per il calcolo automatico.
 * @date 2025-09-29
 * @version 1.0
 */

exports.up = function(knex) {
  return knex.schema.alterTable('ct_categorie', function(table) {
    // aggiunge il campo per il codice completo (es. '001.015.003')
    // è una stringa per flessibilità e per ricerche veloci.
    // nullable perché verrà calcolato dal backend.
    table.string('codice_categoria', 255).nullable().after('descrizione');
    
    // aggiunge il campo per il singolo progressivo del livello (es. 3)
    // questo campo è un 'helper' per semplificare e velocizzare il calcolo
    // del codice per le nuove categorie figlie.
    table.integer('progressivo').unsigned().nullable().after('codice_categoria');

    // aggiungiamo un indice sul codice per velocizzare le ricerche e gli ordinamenti
    table.index('codice_categoria');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('ct_categorie', function(table) {
    // l'operazione di 'down' rimuove le colonne nell'ordine inverso
    table.dropIndex('codice_categoria');
    table.dropColumn('progressivo');
    table.dropColumn('codice_categoria');
  });
};
