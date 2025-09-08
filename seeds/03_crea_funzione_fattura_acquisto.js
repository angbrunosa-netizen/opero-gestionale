/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Imposta l'ID della ditta per cui vuoi creare la funzione.
  // Assicurati che questo ID esista nella tua tabella 'ditte'.
  const ID_DITTA_TARGET = 1;
  const CODICE_FUNZIONE = 'REG-FATT-ACQ';

  // Codici dei conti da cercare nel piano dei conti.
  // IMPORTANTE: Verifica che questi codici esistano nel tuo 'sc_piano_dei_conti' per la ditta target.
  const CODICE_CONTO_FORNITORI = '201010'; // Es. Conto generico Fornitori
  const CODICE_CONTO_IVA_ACQUISTI = '111020'; // Es. Conto IVA ns/Credito
  const CODICE_CONTO_COSTI = '301010'; // Es. Conto Merci c/acquisti

  await knex.transaction(async (trx) => {
    console.log(`Inizio seeding funzione '${CODICE_FUNZIONE}' per ditta ID: ${ID_DITTA_TARGET}`);

    // 1. Cerca gli ID dei conti necessari dal piano dei conti
    const fornitoreConto = await trx('sc_piano_dei_conti').where({ codice: CODICE_CONTO_FORNITORI, id_ditta: ID_DITTA_TARGET }).first();
    const ivaConto = await trx('sc_piano_dei_conti').where({ codice: CODICE_CONTO_IVA_ACQUISTI, id_ditta: ID_DITTA_TARGET }).first();
    const costoConto = await trx('sc_piano_dei_conti').where({ codice: CODICE_CONTO_COSTI, id_ditta: ID_DITTA_TARGET }).first();

    if (!fornitoreConto || !ivaConto || !costoConto) {
      throw new Error(`Impossibile creare la funzione. Almeno uno dei conti (${CODICE_CONTO_FORNITORI}, ${CODICE_CONTO_IVA_ACQUISTI}, ${CODICE_CONTO_COSTI}) non è stato trovato per la ditta ${ID_DITTA_TARGET}.`);
    }

    // 2. Pulisce eventuali funzioni esistenti con lo stesso codice per rendere il seed ri-eseguibile
    await trx('sc_funzioni_contabili').where({ codice_funzione: CODICE_FUNZIONE, id_ditta: ID_DITTA_TARGET }).del();
    
    // 3. Inserisce la testata della nuova funzione contabile
    const [insertedFunzione] = await trx('sc_funzioni_contabili').insert({
      id_ditta: ID_DITTA_TARGET,
      codice_funzione: CODICE_FUNZIONE,
      nome_funzione: 'Registrazione Fattura Acquisto',
      descrizione: 'Registra una fattura da fornitore, gestisce l\'IVA e crea la partita aperta nello scadenzario.',
      categoria: 'Acquisti',
      tipo_funzione: 'Finanziaria', // Fondamentale per attivare la logica complessa
      attiva: true,
    }).returning('id');

    const idFunzioneCreata = insertedFunzione.id || insertedFunzione;
    console.log(`Funzione '${CODICE_FUNZIONE}' creata con ID: ${idFunzioneCreata}`);

    // 4. Inserisce le righe collegate che fungeranno da modello per la scrittura
    await trx('sc_funzioni_contabili_righe').insert([
      {
        id_funzione_contabile: idFunzioneCreata,
        id_conto: costoConto.id,
        tipo_movimento: 'D', // DARE
        descrizione_riga_predefinita: 'Costo per acquisto merci/servizi',
        is_sottoconto_modificabile: true,
      },
      {
        id_funzione_contabile: idFunzioneCreata,
        id_conto: ivaConto.id,
        tipo_movimento: 'D', // DARE
        descrizione_riga_predefinita: 'IVA a credito su acquisti',
        is_sottoconto_modificabile: false,
      },
      {
        id_funzione_contabile: idFunzioneCreata,
        id_conto: fornitoreConto.id,
        tipo_movimento: 'A', // AVERE
        descrizione_riga_predefinita: 'Debito verso fornitore',
        is_sottoconto_modificabile: true,
      },
    ]);
    console.log(`Righe per la funzione '${CODICE_FUNZIONE}' inserite correttamente.`);
  });
};
