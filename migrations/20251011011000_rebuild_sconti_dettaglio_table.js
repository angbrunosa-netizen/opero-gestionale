/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  // SOLUZIONE DEFINITIVA: Ricostruiamo la tabella da zero per eliminare
  // qualsiasi vincolo (constraint) obsoleto o con nomi errati che causa
  // l'errore di foreign key, come 'ac_sconti_dettaglio_id_riga_condizione_foreign'.
  return knex.schema.dropTableIfExists('ac_sconti_dettaglio')
    .then(() => {
      return knex.schema.createTable('ac_sconti_dettaglio', function(table) {
        table.increments('id').primary();
        
        // La colonna corretta con la sua foreign key
        table.integer('id_riga').unsigned().notNullable().references('id').inTable('ac_condizioni_righe').onDelete('CASCADE');
        
        // Tutti gli altri campi necessari
        table.integer('ordine_applicazione').notNullable();
        table.enum('tipo_sconto', ['percentuale', 'importo']).notNullable();
        table.decimal('valore_sconto', 10, 4).notNullable();
        table.enum('tipo_esigibilita', ['immediata', 'differita']).notNullable();
        table.text('note').nullable();

        table.index('id_riga');
      });
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // Il down semplicemente elimina la tabella ricreata.
  return knex.schema.dropTableIfExists('ac_sconti_dettaglio');
};