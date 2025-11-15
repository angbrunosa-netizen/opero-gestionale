/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('log_accessi', function(table) {
        // Aggiunge la colonna 'id_ditta' di tipo INT(10) UNSIGNED
        // Imposta il valore di default a NULL per i record esistenti
        // Posiziona la colonna dopo 'id_utente' per una migliore organizzazione
        table.integer('id_ditta', 10).unsigned().nullable().after('id_utente');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    // In caso di rollback, rimuove la colonna 'id_ditta'
    return knex.schema.alterTable('log_accessi', function(table) {
        table.dropColumn('id_ditta');
    });
};