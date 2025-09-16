/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  // Utilizziamo knex.raw perché la modifica di un ENUM è un'operazione specifica del DB.
  // Questo comando è specifico per MySQL/MariaDB.
  return knex.raw(`
    ALTER TABLE sc_partite_aperte
    MODIFY COLUMN tipo_movimento ENUM(
      'Apertura_Credito', 
      'Apertura_Debito', 
      'Chiusura', 
      'Chiusura_Credito', 
      'Chiusura_Debito',
      'Storno_Apertura_Credito',
      'Storno_Apertura_Debito'
    ) NOT NULL
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // Il down rollback ripristina l'ENUM ai valori precedenti.
  return knex.raw(`
    ALTER TABLE sc_partite_aperte
    MODIFY COLUMN tipo_movimento ENUM(
      'Apertura_Credito', 
      'Apertura_Debito', 
      'Chiusura'
    ) NOT NULL
  `);
};
