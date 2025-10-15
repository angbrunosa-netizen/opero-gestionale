/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('sc_piano_dei_conti', function(table) {
    // Allarga la colonna 'natura' da VARCHAR(10) a VARCHAR(20)
    // per accomodare valori più lunghi come "Patrimoniale" ed "Economico".
    table.string('natura', 20).alter();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('sc_piano_dei_conti', function(table) {
    // Ripristina la dimensione originale della colonna
    table.string('natura', 10).alter();
  });
};
