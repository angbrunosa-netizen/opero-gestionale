/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  // Funzione per creare la tabella delle giacenze
  return knex.schema.createTable('mg_giacenze', (table) => {
    table.increments('id').unsigned().primary(); // ID primario auto-incrementante
    table.integer('id_ditta').unsigned().notNullable(); // Chiave esterna per la ditta
    table.integer('id_magazzino').unsigned().notNullable(); // Chiave esterna per il magazzino
    table.integer('id_catalogo').unsigned().notNullable(); // Chiave esterna per l'articolo a catalogo
    table.decimal('giacenza_attuale', 10, 3).notNullable().defaultTo(0.000); // Giacenza con 3 decimali
    table.timestamp('updated_at').defaultTo(knex.fn.now()); // Timestamp di ultimo aggiornamento

    // Definizione delle chiavi esterne per garantire l'integrità referenziale
    table.foreign('id_ditta').references('id').inTable('ditte').onDelete('CASCADE');
    table.foreign('id_magazzino').references('id').inTable('mg_magazzini').onDelete('CASCADE');
    table.foreign('id_catalogo').references('id').inTable('ct_catalogo').onDelete('CASCADE');

    // Indice univoco per assicurare una sola riga per combinazione ditta/magazzino/articolo
    table.unique(['id_ditta', 'id_magazzino', 'id_catalogo'], 'idx_giacenza_unica');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // Funzione per eliminare la tabella in caso di rollback
  return knex.schema.dropTableIfExists('mg_giacenze');
};