/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('va_tipi_documento', (table) => {
        table.increments('id').primary();
        table.integer('id_ditta').unsigned().notNullable().references('id').inTable('ditte').onDelete('CASCADE');
        table.string('codice_doc').notNullable();
        table.string('nome_documento').notNullable();
        table.enum('tipo', ['Documento Accompagnatorio', 'Documento Interno', 'Preventivo', 'Ordine']).notNullable();
        table.enum('gen_mov', ['S', 'N']).notNullable().comment('Indica se il documento genera movimenti di magazzino');
        table.enum('tipo_movimento', ['Carico', 'Scarico']).nullable().comment('Tipo di movimento generato, se gen_mov = S');
        table.enum('ditta_rif', ['Clienti', 'Fornitori', 'PuntoVendita']).notNullable().comment('A quale tipo di anagrafica si riferisce il documento');
        
        table.unique(['id_ditta', 'codice_doc']);
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('va_tipi_documento');
};
