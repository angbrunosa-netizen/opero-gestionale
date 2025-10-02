/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('ct_codici_fornitore', (table) => {
        table.increments('id').primary();
        table.integer('id_ditta').unsigned().notNullable().references('id').inTable('ditte').onDelete('CASCADE');
        table.integer('id_catalogo').unsigned().notNullable().references('id').inTable('ct_catalogo').onDelete('CASCADE');
        table.integer('id_anagrafica_fornitore').unsigned().nullable().references('id').inTable('ditte').onDelete('SET NULL');
        table.string('codice_articolo_fornitore').notNullable();
        table.timestamps(true, true);
        table.integer('created_by').references('id').inTable('utenti').onDelete('SET NULL');

        // Aggiunge un indice per migliorare le performance delle ricerche
        table.index(['id_ditta', 'id_catalogo']);
        table.index(['id_ditta', 'codice_articolo_fornitore']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('ct_codici_fornitore');
};
