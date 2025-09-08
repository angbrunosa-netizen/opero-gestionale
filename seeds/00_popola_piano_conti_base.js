/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  const ID_DITTA_TARGET = 1;

  await knex.transaction(async (trx) => {
    console.log(`Inizio seeding Piano dei Conti base per ditta ID: ${ID_DITTA_TARGET}`);

    // Pulisce i dati esistenti SOLO per la ditta target per rendere il seed ri-eseguibile
    await trx('sc_piano_dei_conti').where('id_ditta', ID_DITTA_TARGET).del();

    // Inserisce i Mastri e recupera i loro ID in modo compatibile con MySQL
    const [mastroAttivitaResult] = await trx('sc_piano_dei_conti').insert({ id_ditta: ID_DITTA_TARGET, codice: '1', descrizione: 'ATTIVITA\'', tipo: 'Mastro', natura: 'Attività' });
    const mastroAttivitaId = mastroAttivitaResult.insertId || mastroAttivitaResult;

    const [mastroPassivitaResult] = await trx('sc_piano_dei_conti').insert({ id_ditta: ID_DITTA_TARGET, codice: '2', descrizione: 'PASSIVITA\'', tipo: 'Mastro', natura: 'Passività' });
    const mastroPassivitaId = mastroPassivitaResult.insertId || mastroPassivitaResult;

    const [mastroCostiResult] = await trx('sc_piano_dei_conti').insert({ id_ditta: ID_DITTA_TARGET, codice: '3', descrizione: 'COSTI', tipo: 'Mastro', natura: 'Costo' });
    const mastroCostiId = mastroCostiResult.insertId || mastroCostiResult;
    
    // Inserisce Conti sotto i Mastri
    const [contoCreditiResult] = await trx('sc_piano_dei_conti').insert({ id_ditta: ID_DITTA_TARGET, codice: '111', descrizione: 'Crediti', tipo: 'Conto', natura: 'Attività', id_padre: mastroAttivitaId });
    const contoCreditiId = contoCreditiResult.insertId || contoCreditiResult;

    const [contoDebitiResult] = await trx('sc_piano_dei_conti').insert({ id_ditta: ID_DITTA_TARGET, codice: '201', descrizione: 'Debiti', tipo: 'Conto', natura: 'Passività', id_padre: mastroPassivitaId });
    const contoDebitiId = contoDebitiResult.insertId || contoDebitiResult;

    const [contoCostiAcquistoResult] = await trx('sc_piano_dei_conti').insert({ id_ditta: ID_DITTA_TARGET, codice: '301', descrizione: 'Costi per Acquisti', tipo: 'Conto', natura: 'Costo', id_padre: mastroCostiId });
    const contoCostiAcquistoId = contoCostiAcquistoResult.insertId || contoCostiAcquistoResult;

    // Inserisce i Sottoconti (inclusi quelli necessari per la funzione Fattura Acquisto)
    await trx('sc_piano_dei_conti').insert([
      // Sottoconti necessari per la funzione
      { id_ditta: ID_DITTA_TARGET, codice: '201010', descrizione: 'Fornitori', tipo: 'Sottoconto', natura: 'Passività', id_padre: contoDebitiId },
      { id_ditta: ID_DITTA_TARGET, codice: '111020', descrizione: 'IVA ns/Credito', tipo: 'Sottoconto', natura: 'Attività', id_padre: contoCreditiId },
      { id_ditta: ID_DITTA_TARGET, codice: '301010', descrizione: 'Merci c/acquisti', tipo: 'Sottoconto', natura: 'Costo', id_padre: contoCostiAcquistoId },
      
      // Altri sottoconti utili
      { id_ditta: ID_DITTA_TARGET, codice: '111010', descrizione: 'Clienti', tipo: 'Sottoconto', natura: 'Attività', id_padre: contoCreditiId },
    ]);

    console.log('Piano dei Conti base inserito con successo.');
  });
};

    
