/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.table('sc_funzioni_contabili', function(table) {
    // Aggiungiamo un campo SET per gestire le logiche abbinate.
    // Questo ci permette di associare più gestioni a una singola funzione (es. IVA e Centri di Costo).
    // 'I' = Gestione IVA
    // 'C' = Gestione Centri di Costo (per il futuro)
    // 'E' = Gestione Elenchi (per il futuro)
    table.specificType('gestioni_abbinate', "SET('I', 'C', 'E')").nullable().after('tipo_funzione');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.table('sc_funzioni_contabili', function(table) {
    table.dropColumn('gestioni_abbinate');
  });
};
