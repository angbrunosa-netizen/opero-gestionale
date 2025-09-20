/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Svuota la tabella per evitare duplicati ad ogni esecuzione del seed
  await knex('bs_categorie').del();
  
  // Inserisce le categorie standard per la ditta con id = 1
  // NOTA: Se la tua ditta principale ha un ID diverso, modificalo qui.
  await knex('bs_categorie').insert([
    {
      id_ditta: 1, 
      codice: 'IMM', 
      descrizione: 'Immobili'
    },
    {
      id_ditta: 1, 
      codice: 'ARR', 
      descrizione: 'Arredamenti'
    },
    {
      id_ditta: 1, 
      codice: 'ATT-IND', 
      descrizione: 'Attrezzatura Industriale'
    },
    {
      id_ditta: 1, 
      codice: 'ATT-COM', 
      descrizione: 'Attrezzatura Commerciale'
    },
    {
      id_ditta: 1, 
      codice: 'ATT-UFF', 
      descrizione: 'Attrezzatura Uffici'
    },
    {
      id_ditta: 1, 
      codice: 'ELT', 
      descrizione: 'Elettronici'
    },
    {
      id_ditta: 1, 
      codice: 'MAC-OP', 
      descrizione: 'Macchine Operatrici'
    },
    {
      id_ditta: 1, 
      codice: 'OFF', 
      descrizione: 'Officina'
    },
  ]);
};
