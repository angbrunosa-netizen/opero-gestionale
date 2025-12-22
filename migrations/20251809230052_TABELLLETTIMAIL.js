/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Controlla se la tabella esiste prima di crearla
  const tableExists = await knex.schema.hasTable('stati_lettura');
  if (!tableExists) {
    return knex.schema.createTable('stati_lettura', (table) => {
      table.integer('id_utente').notNullable();
      table.foreign('id_utente').references('id').inTable('utenti').onDelete('CASCADE');
      table.string('email_uid', 255).notNullable();
      table.primary(['id_utente', 'email_uid']);
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
  }
  return Promise.resolve();
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('stati_lettura');
};