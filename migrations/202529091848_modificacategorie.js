/**
 * @file opero/migrations/20250929184500_add_parent_id_to_ct_categorie.js
 * @description file di migrazione knex per aggiungere la gerarchia alla tabella ct_categorie.
 * - aggiunge la colonna id_padre per creare una relazione auto-referenziante.
 * - imposta il vincolo di foreign key con ondelete('set null').
 * @date 2025-09-29
 * @version 1.0
 */

exports.up = function(knex) {
  return knex.schema.table('ct_categorie', function(table) {
    // aggiunge la colonna per l'id della categoria genitore.
    // deve essere nullable perché le categorie di primo livello non hanno un padre.
    table.integer('id_padre').unsigned().nullable();

    // crea la relazione di foreign key sulla stessa tabella.
    // se una categoria padre viene eliminata, i suoi figli diventano categorie di primo livello.
    table.foreign('id_padre')
         .references('id')
         .inTable('ct_categorie')
         .onDelete('SET NULL');
  });
};

exports.down = function(knex) {
  return knex.schema.table('ct_categorie', function(table) {
    // per rimuovere la colonna, dobbiamo prima rimuovere il vincolo di foreign key.
    table.dropForeign('id_padre');
    
    // infine, rimuoviamo la colonna.
    table.dropColumn('id_padre');
  });
};
