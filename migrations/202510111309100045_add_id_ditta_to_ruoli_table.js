/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  // Aggiunge la colonna 'id_ditta' alla tabella 'ruoli'
  return knex.schema.table('ruoli', (table) => {
    // La colonna è un intero senza segno e può essere NULL.
    // Sarà NULL per i ruoli di sistema (es. Amministratore_sistema)
    // Conterrà un id per i ruoli creati da un Amministratore di Ditta.
    table.integer('id_ditta').unsigned().nullable();

    // Creazione della chiave esterna che collega a 'ditte.id'
    // onDelete('SET NULL') significa che se una ditta viene eliminata, i suoi ruoli personalizzati non vengono eliminati ma il loro campo id_ditta diventa NULL.
    table.foreign('id_ditta').references('ditte.id').onDelete('SET NULL');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // Logica per annullare la migrazione
  return knex.schema.table('ruoli', (table) => {
    // Rimuove prima la chiave esterna e poi la colonna
    table.dropForeign('id_ditta');
    table.dropColumn('id_ditta');
  });
};
