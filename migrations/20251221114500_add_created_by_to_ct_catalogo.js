/**
 * Nome file: migrations/20251221114500_add_created_by_to_ct_catalogo.js
 * Descrizione: Aggiunge la colonna 'created_by' alla tabella 'ct_catalogo' per tracciare l'utente creatore.
 * Risolve l'errore di inserimento "Unknown column 'created_by'".
 */

exports.up = function(knex) {
  return knex.schema.table('ct_catalogo', function(table) {
    // Aggiunta colonna created_by
    // Posizionata dopo 'id_stato_entita' per ordine logico (prima dei timestamp)
    table.integer('created_by').unsigned().nullable().after('id_stato_entita')
      .comment('ID dell\'utente che ha creato l\'entità');

    // Definizione della chiave esterna verso la tabella utenti
    // ON DELETE SET NULL: Se l'utente viene cancellato, il riferimento diventa NULL (non cancelliamo l'articolo)
    table.foreign('created_by').references('id').inTable('utenti').onDelete('SET NULL');
  });
};

exports.down = function(knex) {
  return knex.schema.table('ct_catalogo', function(table) {
    // Rimozione foreign key (è buona norma specificare il nome se knex lo ha generato, 
    // ma dropForeign con nome colonna funziona nella maggior parte dei casi standard)
    table.dropForeign(['created_by']);
    
    // Rimozione colonna
    table.dropColumn('created_by');
  });
};