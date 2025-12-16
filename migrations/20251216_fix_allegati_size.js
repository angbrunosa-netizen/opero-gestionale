/**
 * Nome File: 20251216_fix_allegati_size.js
 * Descrizione: Aggiunge la colonna dimensione_file alla tabella allegati_tracciati se mancante.
 * Risolve l'errore SQL "Unknown column 'at.dimensione_file'".
 */

exports.up = async function(knex) {
  // Controlla se la colonna esiste già per evitare errori
  const hasColumn = await knex.schema.hasColumn('allegati_tracciati', 'dimensione_file');
  
  if (!hasColumn) {
    await knex.schema.table('allegati_tracciati', table => {
      // Aggiunge la colonna mancante
      table.integer('dimensione_file').unsigned().nullable().defaultTo(0)
           .comment('Dimensione del file in bytes');
    });
    console.log('✅ Colonna dimensione_file aggiunta a allegati_tracciati');
  } else {
    console.log('ℹ️ Colonna dimensione_file già presente, skip.');
  }
};

exports.down = function(knex) {
  return knex.schema.table('allegati_tracciati', table => {
    table.dropColumn('dimensione_file');
  });
};