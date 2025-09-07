/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Pulisce le tabelle prima di inserire nuovi dati per evitare duplicati
  await knex('sc_funzioni_contabili_righe').del();
  await knex('sc_funzioni_contabili').del();

  console.log('Inserimento funzioni contabili di base...');

  // --- 1. FUNZIONE: Registrazione Fattura di Acquisto ---
  const [fattAcq] = await knex('sc_funzioni_contabili').insert({
    id_ditta: 1, // IMPORTANTE: Modificare con un id_ditta valido nel proprio DB
    codice_funzione: 'FATT_ACQ',
    nome_funzione: 'Registrazione Fattura Acquisto',
    descrizione: 'Registra una fattura ricevuta da un fornitore.',
    categoria: 'Acquisti',
    attiva: true,
  });
  
  
  // Le righe per la fattura di acquisto
  // IMPORTANTE: Gli id_conto sono indicativi. Devono corrispondere a conti REALI nel vostro Piano dei Conti.
  await knex('sc_funzioni_contabili_righe').insert([
    { 
      id_funzione_contabile: fattAcq, 
      id_conto: 20, // Esempio: ID per 'Merci c/acquisti'
      tipo_movimento: 'D', 
      descrizione_riga_predefinita: 'Costo per acquisto beni/servizi',
      is_sottoconto_modificabile: true,
    },
    { 
      id_funzione_contabile: fattAcq, 
      id_conto: 29, // Esempio: ID per 'IVA ns/credito'
      tipo_movimento: 'D', 
      descrizione_riga_predefinita: 'IVA su acquisti',
      is_sottoconto_modificabile: false,
    },
    { 
      id_funzione_contabile: fattAcq, 
      id_conto: 14, // Esempio: ID per 'Debiti v/fornitori'
      tipo_movimento: 'A', 
      descrizione_riga_predefinita: 'Debito verso fornitore',
      is_sottoconto_modificabile: true,
    },
  ]);

  // --- 2. FUNZIONE: Registrazione Fattura di Vendita ---
  const [fattVend] = await knex('sc_funzioni_contabili').insert({
    id_ditta: 1, // Stesso id_ditta
    codice_funzione: 'FATT_VEND',
    nome_funzione: 'Emissione Fattura Vendita',
    descrizione: 'Emette una fattura per un cliente.',
    categoria: 'Vendite',
    attiva: true,
  });

  await knex('sc_funzioni_contabili_righe').insert([
    { 
      id_funzione_contabile: fattVend, 
      id_conto: 7, // Esempio: ID per 'Crediti v/clienti'
      tipo_movimento: 'D', 
      descrizione_riga_predefinita: 'Credito verso cliente',
      is_sottoconto_modificabile: true,
    },
    { 
      id_funzione_contabile: fattVend, 
      id_conto: 25, // Esempio: ID per 'Merci c/vendite'
      tipo_movimento: 'A', 
      descrizione_riga_predefinita: 'Ricavo per vendita beni/servizi',
      is_sottoconto_modificabile: true,
    },
     { 
      id_funzione_contabile: fattVend, 
      id_conto: 17, // Esempio: ID per 'IVA ns/debito'
      tipo_movimento: 'A', 
      descrizione_riga_predefinita: 'IVA su vendite',
      is_sottoconto_modificabile: false,
    },
  ]);
  
  console.log('Seed delle funzioni contabili completato.');
};
