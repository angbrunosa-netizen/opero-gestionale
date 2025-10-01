/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.table('ct_listini', function(table) {
    // Rinomina le colonne da ricarico_? a ricarico_pubblico_?
    table.renameColumn('ricarico_1', 'ricarico_pubblico_1');
    table.renameColumn('ricarico_2', 'ricarico_pubblico_2');
    table.renameColumn('ricarico_3', 'ricarico_pubblico_3');
    table.renameColumn('ricarico_4', 'ricarico_pubblico_4');
    table.renameColumn('ricarico_5', 'ricarico_pubblico_5');
    table.renameColumn('ricarico_6', 'ricarico_pubblico_6');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.table('ct_listini', function(table) {
    // Ripristina i nomi originali delle colonne in caso di rollback
    table.renameColumn('ricarico_pubblico_1', 'ricarico_1');
    table.renameColumn('ricarico_pubblico_2', 'ricarico_2');
    table.renameColumn('ricarico_pubblico_3', 'ricarico_3');
    table.renameColumn('ricarico_pubblico_4', 'ricarico_4');
    table.renameColumn('ricarico_pubblico_5', 'ricarico_5');
    table.renameColumn('ricarico_pubblico_6', 'ricarico_6');
  });
};