/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Rimuove le tabelle obsolete nell'ordine corretto per rispettare le foreign keys.
  // Prima le tabelle che referenziano altre (es. pagamenti -> fatture).
 await knex.schema.dropTableIfExists('preventivi'); 
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Questa è un'operazione distruttiva.
  // Il rollback non è supportato per evitare la perdita di dati.
  // Ricreare queste tabelle richiederebbe uno script di ripristino complesso.
  throw new Error('La rimozione di tabelle obsolete è un\'operazione distruttiva e non può essere annullata automaticamente.');
};
