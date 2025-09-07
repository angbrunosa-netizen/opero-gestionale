/**
 * @param {import("knex").Knex} knex
 */
exports.seed = async function(knex) {
  // Cancella i dati esistenti per evitare duplicati
  await knex('sc_tipi_funzione_contabile').del();
  
  // Inserisce i nuovi tipi di funzione
  await knex('sc_tipi_funzione_contabile').insert([
    {
      id: 1,
      codice: 'PRIMARIA',
      nome: 'Funzione Primaria (Manuale)',
      descrizione: 'Funzioni standard che possono essere avviate manualmente dall\'utente per l\'inserimento dati.'
    },
    {
      id: 2,
      codice: 'AUTOMATICA',
      nome: 'Funzione Automatica (Sistema)',
      descrizione: 'Funzioni richiamate da altri moduli o processi automatici (es. importazione fatture SDI, contabilizzazione da modulo vendite).'
    },
    {
      id: 3,
      codice: 'PROCEDURALE',
      nome: 'Funzione Procedurale (Speciali)',
      descrizione: 'Funzioni speciali per operazioni di apertura, chiusura, e assestamento contabile.'
    },
    {
      id: 4,
      codice: 'SECONDARIA',
      nome: 'Funzione Secondaria (Collegata)',
      descrizione: 'Funzioni che possono essere richiamate da altre funzioni primarie (es. gestione partite aperte).'
    }
  ]);
};
