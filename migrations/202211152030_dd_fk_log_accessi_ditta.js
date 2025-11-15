/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('log_accessi', function(table) {
        // Aggiunge un vincolo di chiave esterna (foreign key)
        // Collega 'log_accessi.id_ditta' a 'ditte.id'
        table.foreign('id_ditta')
             .references('ditte.id')
             .onDelete('SET NULL') // Se una ditta viene cancellata, imposta id_ditta a NULL nei log
             .onUpdate('CASCADE'); // Se l'ID di una ditta cambia, aggiorna anche nei log
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    // In caso di rollback, rimuove il vincolo di chiave esterna
    // Il nome del vincolo è generato da Knex e segue il pattern: tablename_columnname_foreign
    return knex.schema.alterTable('log_accessi', function(table) {
        table.dropForeign('id_ditta');
    });
};