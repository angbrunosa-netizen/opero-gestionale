/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.table('ppa_procedureditta', function(table) {
    // Aggiunge la colonna per specificare il tipo di entità target consentito.
    // Il default 'DITTA' assicura la retrocompatibilità con le procedure esistenti.
    table.string('TargetEntityTypeAllowed', 20).notNullable().defaultTo('DITTA').after('NomePersonalizzato');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.table('ppa_procedureditta', function(table) {
    table.dropColumn('TargetEntityTypeAllowed');
  });
};
