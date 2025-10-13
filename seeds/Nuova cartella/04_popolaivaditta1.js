/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Dati delle aliquote IVA standard da inserire per la ditta 1
  const aliquoteDaInserire = [
    { id_ditta: 1, codice: '04', descrizione: 'IVA al 4%', aliquota: 4.00 },
    { id_ditta: 1, codice: '05', descrizione: 'IVA al 5%', aliquota: 5.00 },
    { id_ditta: 1, codice: '10', descrizione: 'IVA al 10%', aliquota: 10.00 },
    { id_ditta: 1, codice: '22', descrizione: 'IVA al 22%', aliquota: 22.00 },
    { id_ditta: 1, codice: '59', descrizione: 'Fuori campo IVA', aliquota: 0.00 }
  ];

  // Prima cancella i dati esistenti per la ditta 1 per evitare duplicati
  await knex('iva_contabili').where('id_ditta', 1).del();
  
  // Poi inserisce i nuovi dati
  await knex('iva_contabili').insert(aliquoteDaInserire);
};
