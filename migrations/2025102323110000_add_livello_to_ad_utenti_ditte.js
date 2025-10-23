// File: migrations/YYYYMMDDHHMMSS_add_livello_to_ad_utenti_ditte.js
// Descrizione: Aggiunge la colonna 'livello' alla tabella ad_utenti_ditte.
//              Questo campo definisce il livello autorizzativo dell'utente
//              all'interno di una specifica ditta.
// Versione: 1.0

exports.up = function(knex) {
  return knex.schema.table('ad_utenti_ditte', function(table) {
    // Aggiunge la colonna 'livello' come intero senza segno, non nullo,
    // con un valore predefinito ragionevole (es. 50 per un utente standard).
    table.integer('livello').unsigned().notNullable().defaultTo(50).comment('Livello autorizzativo utente per questa ditta (es. 10=Lettura, 50=Standard, 90=Admin, 100=SuperAdmin)');
  });
};

exports.down = function(knex) {
  return knex.schema.table('ad_utenti_ditte', function(table) {
    table.dropColumn('livello');
  });
};