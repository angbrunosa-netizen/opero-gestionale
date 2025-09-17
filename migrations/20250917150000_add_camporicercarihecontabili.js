/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.table('sc_funzioni_contabili_righe', function(table) {
    // Aggiungiamo il nuovo campo booleano 'is_conto_ricerca'.
    // Questo campo indicherà se la riga del template non rappresenta un conto fisso,
    // ma un gruppo di conti da cui l'utente può scegliere (es. tutte le banche).
    // NOTA: Il vincolo che solo una riga per funzione possa avere questo flag a TRUE
    // dovrà essere gestito a livello di logica applicativa (backend/frontend)
    // per garantire la coerenza dei dati.
    table.boolean('is_conto_ricerca').notNullable().defaultTo(false).after('is_sottoconto_modificabile');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.table('sc_funzioni_contabili_righe', function(table) {
    // Rimuove la colonna in caso di rollback della migrazione.
    table.dropColumn('is_conto_ricerca');
  });
};
