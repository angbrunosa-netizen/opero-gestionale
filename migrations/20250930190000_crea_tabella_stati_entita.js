/**
 * @file migrations/20250930190000_crea_tabella_stati_entita.js
 * @description file di migrazione knex per creare la tabella ct_stati_entita.
 * @date 2025-09-30
 * @version 1.0
 */

exports.up = function(knex) {
    return knex.schema.createTable('ct_stati_entita', function(table) {
        table.increments('id').primary();
        table.string('codice', 10).notNullable().unique();
        table.string('descrizione', 100).notNullable();
        table.string('visibilita', 255).nullable().comment('Indica contesti di visibilità specifici, es. ECOMMERCE, ADMIN');
        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('ct_stati_entita');
};
