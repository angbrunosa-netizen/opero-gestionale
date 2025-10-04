/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('ct_logistica', function(table) {
        table.increments('id').primary();
        table.integer('id_ditta').unsigned().notNullable().references('id').inTable('ditte');
        
        // Relazione uno-a-uno con il catalogo.
        // UNIQUE garantisce che ogni articolo possa avere una sola riga di dati logistici.
        table.integer('id_catalogo').unsigned().notNullable().unique().references('id').inTable('ct_catalogo').onDelete('CASCADE');

        table.decimal('peso_lordo_pz', 10, 3).defaultTo(0.000);
        table.decimal('volume_pz', 10, 6).defaultTo(0.000000);
        table.decimal('h_pz', 10, 2).defaultTo(0.00);
        table.decimal('l_pz', 10, 2).defaultTo(0.00);
        table.decimal('p_pz', 10, 2).defaultTo(0.00);
        table.integer('s_im').defaultTo(0); // Pezzi per sotto-imballo

        // --- NUOVI CAMPI PER LA GESTIONE PALLET ---
        table.integer('pezzi_per_collo').defaultTo(0);
        table.integer('colli_per_strato').defaultTo(0);
        table.integer('strati_per_pallet').defaultTo(0);
        
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('ct_logistica');
};

