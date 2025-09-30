/**
 * @file migrations/20250930190200_add_stato_to_ct_catalogo.js
 * @description file di migrazione knex per aggiungere id_stato_entita a ct_catalogo.
 * @date 2025-09-30
 * @version 1.0
 */

exports.up = function(knex) {
    return knex.schema.table('ct_catalogo', function(table) {
        table.integer('id_stato_entita').unsigned().nullable().after('gestito_a_magazzino');
        table.foreign('id_stato_entita').references('id').inTable('ct_stati_entita').onDelete('SET NULL');
    });
};

exports.down = function(knex) {
    return knex.schema.table('ct_catalogo', function(table) {
        table.dropForeign('id_stato_entita');
        table.dropColumn('id_stato_entita');
    });
};
