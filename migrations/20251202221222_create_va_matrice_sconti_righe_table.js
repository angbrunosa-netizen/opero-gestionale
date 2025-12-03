/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Creazione tabella va_matrice_sconti_righe
  await knex.schema.createTable('va_matrice_sconti_righe', function(table) {
    table.increments('id').primary();
    table.integer('id_matrice').unsigned().notNullable()
      .references('id').inTable('va_matrice_sconti').onDelete('CASCADE')
      .comment('Riferimento alla matrice sconti principale');

    // Numero sequenziale della riga all\'interno della matrice
    table.integer('riga').notNullable().comment('Numero progressivo della riga');

    // Campi per i diversi livelli di sconto (fino a 5 livelli come nel frontend)
    table.decimal('sconto_1', 5, 2).defaultTo(0).comment('Primo livello di sconto');
    table.decimal('sconto_2', 5, 2).defaultTo(0).comment('Secondo livello di sconto');
    table.decimal('sconto_3', 5, 2).defaultTo(0).comment('Terzo livello di sconto');
    table.decimal('sconto_4', 5, 2).defaultTo(0).comment('Quarto livello di sconto');
    table.decimal('sconto_5', 5, 2).defaultTo(0).comment('Quinto livello di sconto');

    // Timestamp per gestione CRUD
    table.timestamps(true, true);

    // Indice per performance su query delle righe di una matrice
    table.index(['id_matrice'], 'idx_va_matrice_sconti_righe_id_matrice');
    table.index(['id_matrice', 'riga'], 'idx_va_matrice_sconti_righe_matrice_riga');
  });

  console.log('Tabella va_matrice_sconti_righe creata con successo.');
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('va_matrice_sconti_righe');
  console.log('Tabella va_matrice_sconti_righe eliminata con successo.');
};
