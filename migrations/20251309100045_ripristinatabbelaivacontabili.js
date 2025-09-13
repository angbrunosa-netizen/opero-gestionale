/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  const tableExists = await knex.schema.hasTable('iva_contabili');
  if (!tableExists) {
    return knex.schema.createTable('iva_contabili', function(table) {
      table.increments('id').primary();
      // La colonna id_ditta deve essere UNSIGNED per essere compatibile con ditte.id
      table.integer('id_ditta').unsigned().notNullable();
      table.string('codice', 10).notNullable();
      table.string('descrizione', 100).notNullable();
      table.decimal('aliquota', 5, 2).notNullable();
      
      table.foreign('id_ditta').references('ditte.id').onDelete('CASCADE');
      table.unique(['id_ditta', 'codice']);
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('iva_contabili');
};
