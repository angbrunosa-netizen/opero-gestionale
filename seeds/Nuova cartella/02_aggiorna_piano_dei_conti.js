/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // 1. Svuota la tabella esistente per evitare dati inconsistenti
  await knex('sc_piano_dei_conti').del();

  // 2. Inserisce i nuovi dati dal file pianodeiconti.sql
  await knex('sc_piano_dei_conti').insert([
    {id: 1, id_ditta: 1, codice: '10', descrizione: 'IMMOBILIZZAZIONI', id_padre: null, tipo: 'Mastro', natura: 'Attività', bloccato: 0, data_creazione: '2025-08-25 08:40:32'},
    {id: 2, id_ditta: 1, codice: '10.01', descrizione: 'Immobilizzazioni materiali', id_padre: 1, tipo: 'Conto', natura: 'Attività', bloccato: 0, data_creazione: '2025-08-25 08:40:32'},
    {id: 3, id_ditta: 1, codice: '10.01.001', descrizione: 'Fabbricati', id_padre: 2, tipo: 'Sottoconto', natura: 'Attività', bloccato: 0, data_creazione: '2025-08-25 08:40:32'},
    {id: 4, id_ditta: 1, codice: '10.01.002', descrizione: 'Impianti e macchinari', id_padre: 2, tipo: 'Sottoconto', natura: 'Attività', bloccato: 0, data_creazione: '2025-08-25 08:40:32'},
    {id: 5, id_ditta: 1, codice: '20', descrizione: 'ATTIVO CIRCOLANTE', id_padre: null, tipo: 'Mastro', natura: 'Attività', bloccato: 0, data_creazione: '2025-08-25 08:40:32'},
    {id: 6, id_ditta: 1, codice: '20.05', descrizione: 'Crediti v/Clienti', id_padre: 5, tipo: 'Conto', natura: 'Attività', bloccato: 0, data_creazione: '2025-08-25 08:40:32'},
    {id: 7, id_ditta: 1, codice: '20.05.001', descrizione: 'Clienti Italia', id_padre: 6, tipo: 'Sottoconto', natura: 'Attività', bloccato: 0, data_creazione: '2025-08-25 08:40:32'},
    {id: 8, id_ditta: 1, codice: '20.15', descrizione: 'Disponibilità liquide', id_padre: 5, tipo: 'Conto', natura: 'Attività', bloccato: 0, data_creazione: '2025-08-25 08:40:32'},
    {id: 9, id_ditta: 1, codice: '20.15.001', descrizione: 'Banca c/c', id_padre: 8, tipo: 'Sottoconto', natura: 'Attività', bloccato: 0, data_creazione: '2025-08-25 08:40:32'},
    {id: 10, id_ditta: 1, codice: '20.15.002', descrizione: 'Cassa contanti', id_padre: 8, tipo: 'Sottoconto', natura: 'Attività', bloccato: 0, data_creazione: '2025-08-25 08:40:32'},
    {id: 11, id_ditta: 1, codice: '30', descrizione: 'PATRIMONIO NETTO', id_padre: null, tipo: 'Mastro', natura: 'Patrimonio Netto', bloccato: 0, data_creazione: '2025-08-25 08:40:32'},
    {id: 12, id_ditta: 1, codice: '30.01', descrizione: 'Capitale Sociale', id_padre: 11, tipo: 'Conto', natura: 'Patrimonio Netto', bloccato: 0, data_creazione: '2025-08-25 08:40:32'},
    {id: 13, id_ditta: 1, codice: '40', descrizione: 'DEBITI', id_padre: null, tipo: 'Mastro', natura: 'Passività', bloccato: 0, data_creazione: '2025-08-25 08:40:32'},
    {id: 14, id_ditta: 1, codice: '40.05', descrizione: 'Debiti v/Fornitori', id_padre: 13, tipo: 'Conto', natura: 'Passività', bloccato: 0, data_creazione: '2025-08-25 08:40:32'},
    {id: 15, id_ditta: 1, codice: '40.05.001', descrizione: 'Fornitori Italia', id_padre: 14, tipo: 'Sottoconto', natura: 'Passività', bloccato: 0, data_creazione: '2025-08-25 08:40:32'},
    {id: 16, id_ditta: 1, codice: '40.10', descrizione: 'Debiti Tributari', id_padre: 13, tipo: 'Conto', natura: 'Passività', bloccato: 0, data_creazione: '2025-08-25 08:40:32'},
    {id: 17, id_ditta: 1, codice: '40.10.001', descrizione: 'Erario c/IVA', id_padre: 16, tipo: 'Sottoconto', natura: 'Passività', bloccato: 0, data_creazione: '2025-08-25 08:40:33'},
    {id: 18, id_ditta: 1, codice: '60', descrizione: 'COSTI DELLA PRODUZIONE', id_padre: null, tipo: 'Mastro', natura: 'Costo', bloccato: 0, data_creazione: '2025-08-25 08:40:33'},
    {id: 19, id_ditta: 1, codice: '60.01', descrizione: 'Acquisti', id_padre: 18, tipo: 'Conto', natura: 'Costo', bloccato: 0, data_creazione: '2025-08-25 08:40:33'},
    {id: 20, id_ditta: 1, codice: '60.01.001', descrizione: 'Materie prime c/acquisti', id_padre: 19, tipo: 'Sottoconto', natura: 'Costo', bloccato: 0, data_creazione: '2025-08-25 08:40:33'},
    {id: 21, id_ditta: 1, codice: '60.05', descrizione: 'Servizi', id_padre: 18, tipo: 'Conto', natura: 'Costo', bloccato: 0, data_creazione: '2025-08-25 08:40:33'},
    {id: 22, id_ditta: 1, codice: '60.05.001', descrizione: 'Consulenze professionali', id_padre: 21, tipo: 'Sottoconto', natura: 'Costo', bloccato: 0, data_creazione: '2025-08-25 08:40:33'},
    {id: 23, id_ditta: 1, codice: '70', descrizione: 'RICAVI DELLE VENDITE', id_padre: null, tipo: 'Mastro', natura: 'Ricavo', bloccato: 0, data_creazione: '2025-08-25 08:40:33'},
    {id: 24, id_ditta: 1, codice: '70.01', descrizione: 'Ricavi', id_padre: 23, tipo: 'Conto', natura: 'Ricavo', bloccato: 0, data_creazione: '2025-08-25 08:40:33'},
    {id: 25, id_ditta: 1, codice: '70.01.001', descrizione: 'Prodotti finiti c/vendite', id_padre: 24, tipo: 'Sottoconto', natura: 'Ricavo', bloccato: 0, data_creazione: '2025-08-25 08:40:33'},
    {id: 26, id_ditta: 1, codice: '20.05.002', descrizione: 'SALATI E DOLCI', id_padre: 6, tipo: 'Sottoconto', natura: 'Attività', bloccato: 0, data_creazione: '2025-08-25 10:41:13'},
    {id: 27, id_ditta: 1, codice: '40.05.002', descrizione: 'SARACENARE EXPORT', id_padre: 14, tipo: 'Sottoconto', natura: 'Passività', bloccato: 0, data_creazione: '2025-08-25 10:45:17'},
    {id: 28, id_ditta: 1, codice: '20.05.003', descrizione: 'linux spa', id_padre: 6, tipo: 'Sottoconto', natura: 'Attività', bloccato: 0, data_creazione: '2025-09-02 11:28:36'},
    {id: 29, id_ditta: 1, codice: '40.05.003', descrizione: 'linux spa', id_padre: 14, tipo: 'Sottoconto', natura: 'Passività', bloccato: 0, data_creazione: '2025-09-02 11:28:36'}
  ]);
};