/**
 * @file seeds/popola_funzioni_e_permessi.js
 * @description Popola le tabelle 'funzioni' e 'ruoli_funzioni' dai dati SQL.
 * Utilizza onConflict().merge() per 'funzioni' (aggiorna i dati)
 * e onConflict().ignore() per 'ruoli_funzioni' (salta i duplicati).
 * @version 1.0
 */
exports.seed = async function (knex) {
  // Dati estratti da funzioni.sql
  const funzioniData = [
    { id: 1, codice: 'ANAGRAFICHE_VIEW', descrizione: 'Permette di visualizzare l\'elenco delle anagrafiche', Scorciatoia: 0, chiave_componente_modulo: 'AMMINISTRAZIONE' },
    { id: 2, codice: 'ANAGRAFICHE_CREATE', descrizione: 'Permette di creare una nuova anagrafica', Scorciatoia: 0, chiave_componente_modulo: 'AMMINISTRAZIONE' },
    { id: 3, codice: 'ANAGRAFICHE_EDIT', descrizione: 'Permette di modificare un\'anagrafica esistente', Scorciatoia: 0, chiave_componente_modulo: 'AMMINISTRAZIONE' },
    { id: 4, codice: 'ANAGRAFICHE_DELETE', descrizione: 'Permette di eliminare un\'anagrafica', Scorciatoia: 0, chiave_componente_modulo: 'AMMINISTRAZIONE' },
    { id: 5, codice: 'UTENTI_VIEW', descrizione: 'Permette di visualizzare gli utenti della propria ditta', Scorciatoia: 1, chiave_componente_modulo: 'AMMINISTRAZIONE' },
    { id: 10, codice: 'ADMIN_FUNZIONI_VIEW', descrizione: 'Visualizza pannello gestione funzioni', Scorciatoia: 0, chiave_componente_modulo: 'ADMIN_PANEL' },
    { id: 11, codice: 'ADMIN_FUNZIONI_MANAGE', descrizione: 'Crea/modifica/associa funzioni alle ditte', Scorciatoia: 0, chiave_componente_modulo: 'ADMIN_PANEL' },
    { id: 13, codice: 'ADMIN_RUOLI_VIEW', descrizione: 'Visualizza pannello ruoli e permessi di ditta', Scorciatoia: 0, chiave_componente_modulo: 'ADMIN_PANEL' },
    { id: 14, codice: 'ADMIN_RUOLI_MANAGE', descrizione: 'Crea/modifica ruoli e assegna permessi', Scorciatoia: 0, chiave_componente_modulo: 'ADMIN_PANEL' },
    { id: 15, codice: 'FUNZIONI_MANAGE', descrizione: 'INSERIRE E GESTIRE LE FUNZIONI\r\n', Scorciatoia: 0, chiave_componente_modulo: 'ADMIN_PANEL' },
    { id: 26, codice: 'PDC_VIEW', descrizione: 'Visualizzazione del Piano dei Conti', Scorciatoia: 1, chiave_componente_modulo: 'AMMINISTRAZIONE' },
    { id: 27, codice: 'PDC_EDIT', descrizione: 'Modifica e creazione voci del Piano dei Conti', Scorciatoia: 0, chiave_componente_modulo: 'AMMINISTRAZIONE' },
    { id: 28, codice: 'MAIL_ACCOUNTS_VIEW', descrizione: 'Visualizza gli account email della ditta', Scorciatoia: 0, chiave_componente_modulo: 'AMMINISTRAZIONE' },
    { id: 29, codice: 'MAIL_ACCOUNTS_EDIT', descrizione: 'crea e modifica gli account ditta', Scorciatoia: 0, chiave_componente_modulo: 'AMMINISTRAZIONE' },
    { id: 30, codice: 'UTENTI_CREATE', descrizione: 'Permette di creare nuovi utenti', Scorciatoia: 0, chiave_componente_modulo: 'AMMINISTRAZIONE' },
    { id: 31, codice: 'UTENTI_EDIT', descrizione: 'Permette di modificare i dati degli utenti', Scorciatoia: 0, chiave_componente_modulo: 'AMMINISTRAZIONE' },
    { id: 32, codice: 'AddressBookManager', descrizione: 'gestione della rubrica \r\ncon liste di distribuzione', Scorciatoia: 1, chiave_componente_modulo: 'MAIL' },
    { id: 34, codice: 'RUBRICA_VIEW', descrizione: 'Visualizza la rubrica aziendale', Scorciatoia: 1, chiave_componente_modulo: 'RUBRICA' },
    { id: 35, codice: 'RUBRICA_MANAGE', descrizione: 'Crea e modifica contatti e liste di distribuzione', Scorciatoia: 1, chiave_componente_modulo: 'RUBRICA' },
    { id: 36, codice: 'PPA_MODULE', descrizione: 'PERMETTE DI GESTIRE LA LOGICA E LO SPVILUPPO DEL PPA PROCEDURE PROCESSI AZIONI', Scorciatoia: 1, chiave_componente_modulo: 'AMMINISTRAZIONE' },
    { id: 37, codice: 'PROGRESSIVI_MANAGE', descrizione: 'gestione di tutti i progressivi ditta\r\nprotocollo contabile\r\nnumero doc ', Scorciatoia: 0, chiave_componente_modulo: null },
    { id: 38, codice: 'FIN_SMART', descrizione: 'gestione finanze', Scorciatoia: 1, chiave_componente_modulo: 'FIN_SMART' },
    { id: 70, codice: 'BS_VIEW_BENI', descrizione: 'Permette di visualizzare l\'elenco dei beni.\r\ndi beni strumentali', Scorciatoia: 1, chiave_componente_modulo: 'BSSMART' },
    { id: 71, codice: 'BS_MANAGE_CATEGORIE', descrizione: 'Permette di creare e modificare le categorie. DEI BENI STRUMENTALI', Scorciatoia: 0, chiave_componente_modulo: 'BSSMART' },
    { id: 72, codice: 'BS_VIEW_SCADENZE', descrizione: 'GESTIONE SCADENZE BS', Scorciatoia: 1, chiave_componente_modulo: 'BSSMART' },
    { id: 73, codice: 'BS_CREATE_BENE', descrizione: 'CREA UN NUOVO BENE', Scorciatoia: 0, chiave_componente_modulo: 'BSSMART' },
    { id: 74, codice: 'BS_EDIT_BENE', descrizione: 'MODIFICHE SUL BENE', Scorciatoia: 0, chiave_componente_modulo: 'BSSMART' },
    { id: 75, codice: 'BS_DELETE_BENE', descrizione: 'Permette di eliminare un bene.', Scorciatoia: 0, chiave_componente_modulo: 'BSSMART' },
    { id: 76, codice: 'BS_MANAGE_SCADENZE', descrizione: 'MANAGERE SCADENZE BENI STRUMENTALI', Scorciatoia: 0, chiave_componente_modulo: 'BSSMART' },
    { id: 77, codice: 'BS_MANAGE_TIPI_SCADENZE', descrizione: 'gestire i tipi di scandenze', Scorciatoia: 0, chiave_componente_modulo: 'BSSMART' },
    { id: 80, codice: 'PPA_SIS_MODULE_VIEW', descrizione: 'accesso al modulo ppa ', Scorciatoia: 0, chiave_componente_modulo: 'PPA SIS' },
    { id: 81, codice: 'PPA_DESIGN_PROCEDURE', descrizione: 'funzione di progettazione delle ppa', Scorciatoia: 0, chiave_componente_modulo: 'PPA SIS' },
    { id: 82, codice: 'PPA_ASSIGN_PROCEDURE', descrizione: 'assegnazione delle ppa', Scorciatoia: 0, chiave_componente_modulo: 'PPA SIS' },
    { id: 83, codice: 'PPA_VIEW_MY_TASKS', descrizione: null, Scorciatoia: 1, chiave_componente_modulo: 'PPA SIS' },
    { id: 84, codice: 'PPA_MONITOR_ALL', descrizione: 'verifica tutte le ppa aziendali', Scorciatoia: 0, chiave_componente_modulo: 'PPA SIS' },
    { id: 90, codice: 'CT_VIEW', descrizione: 'visualizza modulo catalogo', Scorciatoia: 0, chiave_componente_modulo: 'CT_VIEW' },
    { id: 91, codice: 'CT_MANAGE', descrizione: 'Per la creazione e modifica delle entità del catalogo (categorie, articoli).', Scorciatoia: 0, chiave_componente_modulo: 'CT_VIEW' },
    { id: 92, codice: 'CT_COMPOSITI_MANAGE', descrizione: 'Per la gestione specifica dei prodotti compositi..', Scorciatoia: 0, chiave_componente_modulo: 'CT_VIEW' },
    { id: 93, codice: 'MG_GIACENZE_VIEW', descrizione: ' Per la sola visualizzazione delle giacenze di magazzino.\r\n\r\n', Scorciatoia: 0, chiave_componente_modulo: 'CT_VIEW' },
    { id: 94, codice: 'MG_MOVIMENTI_CREATE', descrizione: ' Per poter effettuare movimenti di magazzino (carico/scarico).', Scorciatoia: 1, chiave_componente_modulo: 'CT_VIEW' },
    { id: 95, codice: 'MG_CONFIG_MANAGE', descrizione: ' Per la configurazione delle tabelle di supporto al magazzino ', Scorciatoia: 0, chiave_componente_modulo: 'CT_VIEW' },
    { id: 96, codice: 'CT_IVA_MANAGE', descrizione: 'visualizzazione e manutenzione iva', Scorciatoia: 0, chiave_componente_modulo: 'CT_VIEW' },
    { id: 97, codice: 'CT_UM_MANAGE', descrizione: 'GESTIONE UNTIA DI MISURA', Scorciatoia: 0, chiave_componente_modulo: 'CT_VIEW' },
    { id: 98, codice: 'CT_STATI_MANAGE', descrizione: 'Gestione Stati Entità Catalogo', Scorciatoia: 0, chiave_componente_modulo: 'CT_VIEW' },
    { id: 99, codice: 'CT_IMPORT_CSV', descrizione: 'Importa Entità Catalogo da CSV', Scorciatoia: 0, chiave_componente_modulo: 'CT_VIEW' },
    { id: 100, codice: 'CT_LISTINI_VIEW', descrizione: 'visualizza listini catalogo', Scorciatoia: 0, chiave_componente_modulo: 'CT_VIEW' },
    { id: 101, codice: 'CT_LISTINI_MANAGE', descrizione: 'Gestione (creazione/modifica/eliminazione) listini di vendita del catalogo', Scorciatoia: 0, chiave_componente_modulo: 'CT_VIEW' },
    { id: 102, codice: 'CT_EAN_VIEW', descrizione: 'visualizza EAN', Scorciatoia: 0, chiave_componente_modulo: 'CT_VIEW' },
    { id: 103, codice: 'CT_EAN_MANAGE', descrizione: 'gestisci EAN', Scorciatoia: 0, chiave_componente_modulo: 'CT_VIEW' },
    { id: 104, codice: 'CT_COD_FORN_VIEW', descrizione: 'visualizza i codici entità fornitroi', Scorciatoia: 0, chiave_componente_modulo: 'CT_VIEW' },
    { id: 105, codice: 'CT_COD_FORN_MANAGE', descrizione: 'gestire i codici entità fornitroi', Scorciatoia: 0, chiave_componente_modulo: 'CT_VIEW' },
    { id: 106, codice: 'MG_VIEW', descrizione: 'visualizzare il modulo Magazzino nel menu.\r\n', Scorciatoia: 0, chiave_componente_modulo: 'MG_VIEW' },
    { id: 107, codice: 'MG_MOVIMENTI_MANAGE', descrizione: 'GESTISCE I MOVIMENTI', Scorciatoia: 0, chiave_componente_modulo: 'MG_VIEW' },
    { id: 108, codice: 'CT_IVA_VIEW', descrizione: 'visualizza tabella iva', Scorciatoia: 0, chiave_componente_modulo: 'CT_VIEW' },
    { id: 109, codice: 'VA_CLIENTI_VIEW', descrizione: 'VISUALIZZA MODULO VENDITE', Scorciatoia: 0, chiave_componente_modulo: 'VA_CLIENTI_VIEW' },
    { id: 110, codice: 'VA_CLIENTI_MANAGE', descrizione: 'ORGANIZZA MODULO VENDITE', Scorciatoia: 0, chiave_componente_modulo: 'VA_CLIENTI_VIEW' },
    { id: 115, codice: 'ADMIN_USER_PERMISSIONS_MANAGE', descrizione: 'Gestione permessi personalizzati per utente', Scorciatoia: 0, chiave_componente_modulo: 'ADMIN_PANEL' },
    { id: 116, codice: 'VA_TIPI_DOC_MANAGE', descrizione: 'PERMETTE DI GESTIRE I DOCUMENTI DEL MODULO VENDITE E AQUISTE CREAZIONE MODIFICA', Scorciatoia: 0, chiave_componente_modulo: 'VA_CLIENTI_VIEW' },
    { id: 117, codice: 'VA_TIPI_DOC_VIEW', descrizione: 'VISUALIZZARE I TIPI DI DOCUMENTI DI MAGAZZINO VENDITE E ACQUISTI', Scorciatoia: 0, chiave_componente_modulo: 'VA_CLIENTI_VIEW' },
    { id: 118, codice: 'ADMIN_LOGS_VIEW', descrizione: 'GESTIRE I LOG DITTA', Scorciatoia: 0, chiave_componente_modulo: 'ADMIN_PANEL' },
    { id: 119, codice: 'ADMIN_SESSIONS_VIEW', descrizione: 'GESTIRE LE CONNESSIONI UTENTE DITTA', Scorciatoia: 0, chiave_componente_modulo: 'ADMIN_PANEL' },
    { id: 120, codice: 'ADM_PWD_REC', descrizione: 'PERMETTERE L\'EMISSIONE DI UN LINK DI RECUPERO PASSWORD UTENTE', Scorciatoia: 0, chiave_componente_modulo: 'ADMIN_PANEL' },
    { id: 121, codice: 'AM_UTE_LVL', descrizione: 'GESTIRE LIVELLO UTENTE', Scorciatoia: 0, chiave_componente_modulo: 'ADMIN_PANEL' },
    { id: 122, codice: 'PRIVACY_MANAGE', descrizione: 'gestione della policy privacy', Scorciatoia: 0, chiave_componente_modulo: 'ADMIN_PANEL' },
    { id: 123, codice: 'SUPER_ADMIN', descrizione: 'ASSEGNAZIONE MODULI PER DITTA', Scorciatoia: 0, chiave_componente_modulo: 'ADMIN_PANEL' },
    { id: 124, codice: 'AM_UTENTI_EDIT', descrizione: 'MODIFICA UTENTI AMMINISTRAZIONE', Scorciatoia: 0, chiave_componente_modulo: 'AMMINISTRAZIONE' },
    { id: 127, codice: 'MAIL_ACC_EDIT', descrizione: 'GESTIRE E CREARE ACCOUNT', Scorciatoia: 0, chiave_componente_modulo: 'AMMINISTRAZIONE' }
  ];

  // Dati estratti da ruoli_funzioni.sql
  const ruoliFunzioniData = [
    { id_ruolo: 1, id_funzione: 1 }, { id_ruolo: 1, id_funzione: 2 }, { id_ruolo: 1, id_funzione: 3 }, { id_ruolo: 1, id_funzione: 4 },
    { id_ruolo: 1, id_funzione: 5 }, { id_ruolo: 1, id_funzione: 10 }, { id_ruolo: 1, id_funzione: 11 }, { id_ruolo: 1, id_funzione: 13 },
    { id_ruolo: 1, id_funzione: 14 }, { id_ruolo: 1, id_funzione: 15 }, { id_ruolo: 1, id_funzione: 26 }, { id_ruolo: 1, id_funzione: 27 },
    { id_ruolo: 1, id_funzione: 28 }, { id_ruolo: 1, id_funzione: 29 }, { id_ruolo: 1, id_funzione: 30 }, { id_ruolo: 1, id_funzione: 31 },
    { id_ruolo: 1, id_funzione: 32 }, { id_ruolo: 1, id_funzione: 34 }, { id_ruolo: 1, id_funzione: 35 }, { id_ruolo: 1, id_funzione: 36 },
    { id_ruolo: 1, id_funzione: 37 }, { id_ruolo: 1, id_funzione: 38 }, { id_ruolo: 1, id_funzione: 70 }, { id_ruolo: 1, id_funzione: 71 },
    { id_ruolo: 1, id_funzione: 72 }, { id_ruolo: 1, id_funzione: 73 }, { id_ruolo: 1, id_funzione: 74 }, { id_ruolo: 1, id_funzione: 75 },
    { id_ruolo: 1, id_funzione: 76 }, { id_ruolo: 1, id_funzione: 77 }, { id_ruolo: 1, id_funzione: 80 }, { id_ruolo: 1, id_funzione: 81 },
    { id_ruolo: 1, id_funzione: 82 }, { id_ruolo: 1, id_funzione: 83 }, { id_ruolo: 1, id_funzione: 84 }, { id_ruolo: 1, id_funzione: 90 },
    { id_ruolo: 1, id_funzione: 91 }, { id_ruolo: 1, id_funzione: 92 }, { id_ruolo: 1, id_funzione: 93 }, { id_ruolo: 1, id_funzione: 94 },
    { id_ruolo: 1, id_funzione: 95 }, { id_ruolo: 1, id_funzione: 96 }, { id_ruolo: 1, id_funzione: 97 }, { id_ruolo: 1, id_funzione: 98 },
    { id_ruolo: 1, id_funzione: 99 }, { id_ruolo: 1, id_funzione: 100 }, { id_ruolo: 1, id_funzione: 101 }, { id_ruolo: 1, id_funzione: 102 },
    { id_ruolo: 1, id_funzione: 103 }, { id_ruolo: 1, id_funzione: 104 }, { id_ruolo: 1, id_funzione: 105 }, { id_ruolo: 1, id_funzione: 106 },
    { id_ruolo: 1, id_funzione: 107 }, { id_ruolo: 1, id_funzione: 108 }, { id_ruolo: 1, id_funzione: 109 }, { id_ruolo: 1, id_funzione: 110 },
    { id_ruolo: 1, id_funzione: 115 }, { id_ruolo: 1, id_funzione: 116 }, { id_ruolo: 1, id_funzione: 117 }, { id_ruolo: 1, id_funzione: 118 },
    { id_ruolo: 1, id_funzione: 119 }, { id_ruolo: 1, id_funzione: 120 }, { id_ruolo: 1, id_funzione: 121 }, { id_ruolo: 1, id_funzione: 122 },
    { id_ruolo: 1, id_funzione: 123 }, { id_ruolo: 1, id_funzione: 124 }, { id_ruolo: 1, id_funzione: 127 }, { id_ruolo: 2, id_funzione: 1 },
    { id_ruolo: 2, id_funzione: 2 }, { id_ruolo: 2, id_funzione: 3 }, { id_ruolo: 2, id_funzione: 4 }, { id_ruolo: 2, id_funzione: 5 },
    { id_ruolo: 2, id_funzione: 10 }, { id_ruolo: 2, id_funzione: 11 }, { id_ruolo: 2, id_funzione: 13 }, { id_ruolo: 2, id_funzione: 14 },
    { id_ruolo: 2, id_funzione: 15 }, { id_ruolo: 2, id_funzione: 26 }, { id_ruolo: 2, id_funzione: 27 }, { id_ruolo: 2, id_funzione: 28 },
    { id_ruolo: 2, id_funzione: 29 }, { id_ruolo: 2, id_funzione: 30 }, { id_ruolo: 2, id_funzione: 31 }, { id_ruolo: 2, id_funzione: 32 },
    { id_ruolo: 2, id_funzione: 34 }, { id_ruolo: 2, id_funzione: 35 }, { id_ruolo: 2, id_funzione: 36 }, { id_ruolo: 2, id_funzione: 37 },
    { id_ruolo: 2, id_funzione: 38 }, { id_ruolo: 2, id_funzione: 70 }, { id_ruolo: 2, id_funzione: 71 }, { id_ruolo: 2, id_funzione: 72 },
    { id_ruolo: 2, id_funzione: 73 }, { id_ruolo: 2, id_funzione: 74 }, { id_ruolo: 2, id_funzione: 75 }, { id_ruolo: 2, id_funzione: 76 },
    { id_ruolo: 2, id_funzione: 77 }, { id_ruolo: 2, id_funzione: 80 }, { id_ruolo: 2, id_funzione: 81 }, { id_ruolo: 2, id_funzione: 82 },
    { id_ruolo: 2, id_funzione: 83 }, { id_ruolo: 2, id_funzione: 84 }, { id_ruolo: 2, id_funzione: 90 }, { id_ruolo: 2, id_funzione: 91 },
    { id_ruolo: 2, id_funzione: 92 }, { id_ruolo: 2, id_funzione: 93 }, { id_ruolo: 2, id_funzione: 94 }, { id_ruolo: 2, id_funzione: 95 },
    { id_ruolo: 2, id_funzione: 96 }, { id_ruolo: 2, id_funzione: 97 }, { id_ruolo: 2, id_funzione: 98 }, { id_ruolo: 2, id_funzione: 99 },
    { id_ruolo: 2, id_funzione: 100 }, { id_ruolo: 2, id_funzione: 101 }, { id_ruolo: 2, id_funzione: 102 }, { id_ruolo: 2, id_funzione: 103 },
    { id_ruolo: 2, id_funzione: 104 }, { id_ruolo: 2, id_funzione: 105 }, { id_ruolo: 2, id_funzione: 106 }, { id_ruolo: 2, id_funzione: 107 },
    { id_ruolo: 2, id_funzione: 108 }, { id_ruolo: 2, id_funzione: 109 }, { id_ruolo: 2, id_funzione: 110 }, { id_ruolo: 2, id_funzione: 115 },
    { id_ruolo: 2, id_funzione: 116 }, { id_ruolo: 2, id_funzione: 117 }, { id_ruolo: 2, id_funzione: 118 }, { id_ruolo: 2, id_funzione: 119 },
    { id_ruolo: 2, id_funzione: 120 }, { id_ruolo: 2, id_funzione: 121 }, { id_ruolo: 2, id_funzione: 122 }, { id_ruolo: 2, id_funzione: 124 },
    { id_ruolo: 2, id_funzione: 127 }, { id_ruolo: 3, id_funzione: 2 }, { id_ruolo: 3, id_funzione: 3 }, { id_ruolo: 3, id_funzione: 4 },
    { id_ruolo: 3, id_funzione: 11 }, { id_ruolo: 3, id_funzione: 13 }
  ];

  await knex.transaction(async (trx) => {
    console.log('--- SEEDING: Avvio inserimento/aggiornamento tabella `funzioni` ---');
    // Popola 'funzioni'
    // Usa onConflict('codice').merge()
    // Questo inserisce le nuove funzioni. Se una funzione con lo stesso 'codice' esiste già,
    // aggiorna i suoi campi (es. 'descrizione') con i valori di questo seed.
    // Usiamo 'codice' come chiave di conflitto perché è UNIQUE.
    await trx('funzioni')
      .insert(funzioniData)
      .onConflict('codice') // Conflitto basato sulla colonna 'codice' (che è UNIQUE)
      .merge([ // Specifica quali colonne aggiornare in caso di conflitto
          'id', 
          'descrizione', 
          'Scorciatoia', 
          'chiave_componente_modulo'
      ]);
    console.log(`OK: Tabella 'funzioni' popolata/aggiornata (${funzioniData.length} record processati).`);

    console.log('--- SEEDING: Avvio inserimento/ignorando duplicati per `ruoli_funzioni` ---');
    // Popola 'ruoli_funzioni'
    // Usa onConflict(['id_ruolo', 'id_funzione']).ignore()
    // Questo inserisce solo le associazioni che non esistono già.
    // Se un'associazione esiste, viene semplicemente ignorata.
    await trx('ruoli_funzioni')
      .insert(ruoliFunzioniData)
      .onConflict(['id_ruolo', 'id_funzione']) // Conflitto sulla Chiave Primaria Composta
      .ignore(); // Ignora l'inserimento se la coppia esiste già
    console.log(`OK: Tabella 'ruoli_funzioni' popolata (${ruoliFunzioniData.length} record processati, duplicati ignorati).`);
  });

  console.log('--- SEEDING: Popolamento permessi completato con successo. ---');
};