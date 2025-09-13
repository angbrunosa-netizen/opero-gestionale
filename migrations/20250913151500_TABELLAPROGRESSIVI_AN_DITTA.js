/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('an_progressivi', function(table) {
    table.increments('id').primary();
    table.integer('id_ditta').unsigned().notNullable();
    table.string('codice_progressivo', 50).notNullable();
    table.string('descrizione', 255).nullable();
    table.string('serie', 10).nullable();
    table.integer('ultimo_numero').unsigned().notNullable().defaultTo(0);
    table.string('formato', 100).nullable().comment('Es. {ANNO}/{SERIE}/{NUMERO}');
    
    // Vincoli
    table.foreign('id_ditta').references('ditte.id').onDelete('CASCADE');
    // Un progressivo è unico per ditta, codice e serie. 
    // La serie può essere nulla, quindi gestiamo il vincolo in modo specifico.
    table.unique(['id_ditta', 'codice_progressivo', 'serie'], { indexName: 'uq_progressivo_ditta_codice_serie' });
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('an_progressivi');
};
