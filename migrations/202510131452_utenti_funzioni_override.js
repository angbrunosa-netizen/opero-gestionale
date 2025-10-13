/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('utenti_funzioni_override', (table) => {
        table.increments('id').primary();
        
        // ❗ FIX DEFINITIVO: Tipo di dato allineato a INT (signed) come in utenti.id
        table.integer('id_utente').notNullable()
             .comment('FK all\'utente a cui si applica l\'override.');
        table.foreign('id_utente').references('id').inTable('utenti').onDelete('CASCADE');

        // ❗ FIX DEFINITIVO: Tipo di dato allineato a INT (signed) come in funzioni.id
        table.integer('id_funzione').notNullable()
             .comment('FK alla funzione specifica oggetto dell\'override.');
        table.foreign('id_funzione').references('id').inTable('funzioni').onDelete('CASCADE');

        table.enum('azione', ['allow', 'deny']).notNullable()
             .comment('Specifica se il permesso viene concesso (allow) o revocato (deny).');

        table.unique(['id_utente', 'id_funzione']);

        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('utenti_funzioni_override');
};
