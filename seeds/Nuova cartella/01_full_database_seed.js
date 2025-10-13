/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 * * Questo file di seed svuota e ripopola l'intero database
 * per replicare lo stato fornito nel file .sql del 14/09/2025.
 * * ESECUZIONE: npx knex seed:run
 */
exports.seed = async function(knex) {
  // Disabilita temporaneamente i controlli sulle chiavi esterne per permettere il truncate
  await knex.raw('SET FOREIGN_KEY_CHECKS = 0');

  // --- 1. SVUOTAMENTO DI TUTTE LE TABELLE (con controllo di esistenza) ---
  const tables = [
    'utente_scorciatoie', 'sc_registri_iva', 'sc_registrazioni_righe', 
    'sc_partite_aperte', 'sc_movimenti_iva', 'sc_funzioni_contabili_righe', 
    'sc_funzioni_collegate_mapping', 'sc_funzioni_collegate', 'ruoli_funzioni', 
    'registration_tokens', 'privacy_policies', 'ppa_teammembri', 'ppa_team', 
    'ppa_istanzeazioni', 'ppa_istanzeprocedure', 'ppa_azioni', 'ppa_processi', 
    'ppa_procedureditta', 'ppa_stati_azione', 'ppa_procedurestandard', 'log_azioni', 
    'log_accessi', 'lista_distribuzione_utenti', 'lista_distribuzione_ditte', 
    'liste_distribuzione', 'iva_contabili', 'funzioni', 'email_nascoste', 
    'email_inviate', 'ditte_moduli', 'ditta_mail_accounts', 'app_ruoli_funzioni', 
    'app_ruoli', 'app_funzioni', 'an_relazioni', 'an_tipi_relazione', 'an_progressivi', 
    'sc_funzioni_contabili', 'sc_registrazioni_testata', 'utenti', 'tipi_pagamento', 
    'sc_piano_dei_conti', 'relazioni_ditta', 'ditte', 'ruoli', 'tipo_ditta', 
    'tipi_utente', 'moduli'
  ];

  for (const table of tables) {
    const tableExists = await knex.schema.hasTable(table);
    if (tableExists) {
      await knex(table).truncate();
    }
  }
  
  // --- 2. INSERIMENTO DEI DATI ---
  
  await knex('moduli').insert([
    { codice: 10, descrizione: 'Amministrazione', chiave_componente: 'AMMINISTRAZIONE' },
    { codice: 20, descrizione: 'Contabilità Smart', chiave_componente: 'CONT_SMART' },
    { codice: 30, descrizione: 'Pannello Admin', chiave_componente: 'ADMIN_PANEL' },
    { codice: 40, descrizione: 'Posta', chiave_componente: 'MAIL' },
    { codice: 50, descrizione: 'Rubrica', chiave_componente: 'RUBRICA' },
    { codice: 60, descrizione: 'Gestione Finanza', chiave_componente: 'FIN_SMART' }
  ]);
  
  await knex('tipi_utente').insert([
    { Codice: 1, Descrizione: 'Utente_Interno' },
    { Codice: 2, Descrizione: 'Utente_Esterno' }
  ]);

  await knex('tipo_ditta').insert([
    { id: 1, tipo: 'Proprietaria' },
    { id: 2, tipo: 'Cliente' }
  ]);

  await knex('ruoli').insert([
    { id: 1, tipo: 'Amministratore_sistema', livello: 100 },
    { id: 2, tipo: 'Amministratore_Azienda', livello: 90 },
    { id: 3, tipo: 'Utente_interno', livello: 80 },
    { id: 4, tipo: 'Utente_esterno', livello: 50 }
  ]);
  
  await knex('relazioni_ditta').insert([
    { codice: 'C', descrizione: 'Cliente' },
    { codice: 'E', descrizione: 'Entrambe' },
    { codice: 'F', descrizione: 'Fornitore' },
    { codice: 'N', descrizione: 'Nessuna' },
    { codice: 'P', descrizione: 'Punto Vendita' }
  ]);

  await knex('ppa_procedurestandard').insert([
    { ID: 1, CodiceProcedura: 'ONBOARDING_CLIENTE', Descrizione: "Flusso standard per l'acquisizione di un nuovo cliente" },
    { ID: 2, CodiceProcedura: 'GESTIONE_ORDINE', Descrizione: 'Flusso standard per la gestione di un ordine di vendita' },
    { ID: 3, CodiceProcedura: 'RIPARAZIONE_PRODOTTO', Descrizione: 'Flusso standard per la riparazione di un prodotto in garanzia' }
  ]);

  await knex('ditte').insert([
    { id: 1, ragione_sociale: 'Mia Azienda S.R.L.', logo_url: '/logos/logo_1.png', indirizzo: 'Via Roma 1', citta: 'Milano', provincia: 'MI', mail_1: 'info@mia-azienda.it', pec: 'mia-azienda@pec.it', sdi: 'ABCDEFG', stato: 1, id_tipo_ditta: 1, codice_relazione: 'N'},
    { id: 2, ragione_sociale: 'Azienda Cliente Demo SPA', indirizzo: 'Corso Italia 100', citta: 'Torino u', provincia: 'TO', mail_1: 'info@cliente-demo.it', pec: 'cliente-demo@pec.it', sdi: 'HIJKLMN', stato: 1, id_tipo_ditta: 2, codice_relazione: 'C'},
    { id: 3, ragione_sociale: 'ditta prova proprietaria', mail_1: 'angbrunosa@gmail.com', stato: 1, id_tipo_ditta: 1, codice_relazione: 'N'},
    { id: 4, ragione_sociale: 'ditta  prova inserita', mail_1: 'inseri@gmail.com', stato: 1, id_tipo_ditta: 2, codice_relazione: 'F'},
    { id: 5, ragione_sociale: 'La produttrice srl', mail_1: 'angbrunosa@gmail.com', stato: 1, id_tipo_ditta: 2, codice_relazione: 'C'},
    { id: 6, ragione_sociale: 'Prova Admin Cliente', mail_1: 'prova@prova.it', stato: 1, id_tipo_ditta: 2, id_ditta_proprietaria: 1, codice_relazione: 'C'},
    { id: 7, ragione_sociale: 'punto_vendita_prova', mail_1: 'puntovendita@prova.it', stato: 1, id_tipo_ditta: 2, id_ditta_proprietaria: 1, codice_relazione: 'P', id_sottoconto_collegato: 203 },
    { id: 8, ragione_sociale: 'DITTA PROVA CLIENTE FORNITORE', indirizzo: 'VIA NOSTRA', citta: 'NOSTRA', provincia: 'NS', cap: '87010', tel1: '0981', tel2: '0982', mail_1: 'INFO@CEDIBEF.COM', mail_2: '', sdi: '0000000', p_iva: '0125025693', codice_fiscale: '01205', stato: 1, id_ditta_proprietaria: 1, codice_relazione: 'F'},
    { id: 12, ragione_sociale: 'CARAMELLE SALATE cliente', indirizzo: 'DEI DOLCI', citta: 'SULMONA', provincia: 'DC', cap: '87010', tel1: '0152', tel2: '155', mail_1: 'INFO@CEDIBEF.COM', mail_2: '', pec: 'cliedemo@pec.it', sdi: '0000001', p_iva: '0125205269', codice_fiscale: '0122640', stato: 1, id_ditta_proprietaria: 1, codice_relazione: 'C'},
    { id: 13, ragione_sociale: 'DITTA SALATI TUTTIfornitroe', indirizzo: 'VIA DEI SALATINI', citta: 'SALTO', provincia: 'SS', cap: '90878', tel1: '098198025', tel2: '093', mail_1: 'INFO@CEDIBEF.COM', stato: 1, id_ditta_proprietaria: 1, codice_relazione: 'F', p_iva: '0102512554', codice_fiscale: '0125002541'},
    { id: 14, ragione_sociale: 'SALATI E DOLCI', indirizzo: 'DEI GUSTI', citta: 'GUSTOSA', provincia: 'GS', cap: '75000', tel1: '02555', tel2: '0255', mail_1: 'A@LIBERO.IT', stato: 1, id_ditta_proprietaria: 1, codice_relazione: 'C', p_iva: '01245454', codice_fiscale: '0213313'},
    { id: 15, ragione_sociale: 'SARACENARE EXPORT', indirizzo: 'VIA MAZZINI', citta: 'SARACENA', provincia: 'CS', cap: '87010', tel1: '098134463', tel2: '0985233', mail_1: 'TRI@TE.IT', stato: 1, id_ditta_proprietaria: 1, codice_relazione: 'F', p_iva: '0102555', codice_fiscale: '02692', id_sottoconto_fornitore: 27},
    { id: 16, ragione_sociale: 'CAROFIGLIO SPA', indirizzo: 'FIGLINE', citta: 'FIGLINE VIGLIATURAO', provincia: 'FG', cap: '87100', tel1: '02255', tel2: '02555', mail_1: 'CARMO@FIOR.IT', stato: 1, id_ditta_proprietaria: 1, codice_relazione: 'C', p_iva: '55656565', codice_fiscale: '3299'},
    { id: 17, ragione_sociale: 'PROVA DITTA 2 fornitore', indirizzo: 'prova', citta: 'provolino', provincia: 'pr', cap: '87410', tel1: '012', tel2: '088', mail_1: 'eee@fr.it', stato: 1, id_tipo_ditta: 2, id_ditta_proprietaria: 1, codice_relazione: 'C', p_iva: '09999', codice_fiscale: '87899'},
    { id: 18, ragione_sociale: 'prima prova di 3 cliente', indirizzo: 'entram', citta: 'entr', provincia: 'cs', cap: '85200', tel1: '022', tel2: '022', mail_1: 'ang@opero.it', stato: 1, id_tipo_ditta: 2, id_ditta_proprietaria: 1, codice_relazione: 'C', p_iva: '021212121', codice_fiscale: '01212121'}
  ]);
  
  await knex('sc_piano_dei_conti').insert([
    { id: 1, id_ditta: 1, codice: '10', descrizione: 'IMMOBILIZZAZIONI', tipo: 'Mastro', natura: 'Attività'},
    { id: 2, id_ditta: 1, codice: '10.01', descrizione: 'Immobilizzazioni materiali', id_padre: 1, tipo: 'Conto', natura: 'Attività'},
    { id: 3, id_ditta: 1, codice: '10.01.001', descrizione: 'Fabbricati', id_padre: 2, tipo: 'Sottoconto', natura: 'Attività'},
    { id: 4, id_ditta: 1, codice: '10.01.002', descrizione: 'Impianti e macchinari', id_padre: 2, tipo: 'Sottoconto', natura: 'Attività'},
    { id: 5, id_ditta: 1, codice: '20', descrizione: 'ATTIVO CIRCOLANTE', tipo: 'Mastro', natura: 'Attività'},
    { id: 6, id_ditta: 1, codice: '20.05', descrizione: 'Crediti v/Clienti', id_padre: 5, tipo: 'Conto', natura: 'Attività'},
    { id: 7, id_ditta: 1, codice: '20.05.001', descrizione: 'Clienti Italia', id_padre: 6, tipo: 'Sottoconto', natura: 'Attività'},
    { id: 8, id_ditta: 1, codice: '20.15', descrizione: 'Disponibilità liquide', id_padre: 5, tipo: 'Conto', natura: 'Attività'},
    { id: 9, id_ditta: 1, codice: '20.15.001', descrizione: 'Banca c/c', id_padre: 8, tipo: 'Sottoconto', natura: 'Attività'},
    { id: 10, id_ditta: 1, codice: '20.15.002', descrizione: 'Cassa contanti', id_padre: 8, tipo: 'Sottoconto', natura: 'Attività'},
    { id: 11, id_ditta: 1, codice: '30', descrizione: 'PATRIMONIO NETTO', tipo: 'Mastro', natura: 'Patrimonio Netto'},
    { id: 12, id_ditta: 1, codice: '30.01', descrizione: 'Capitale Sociale', id_padre: 11, tipo: 'Conto', natura: 'Patrimonio Netto'},
    { id: 13, id_ditta: 1, codice: '40', descrizione: 'DEBITI', tipo: 'Mastro', natura: 'Passività'},
    { id: 14, id_ditta: 1, codice: '40.05', descrizione: 'Debiti v/Fornitori', id_padre: 13, tipo: 'Conto', natura: 'Passività'},
    { id: 15, id_ditta: 1, codice: '40.05.001', descrizione: 'Fornitori Italia', id_padre: 14, tipo: 'Sottoconto', natura: 'Passività'},
    { id: 16, id_ditta: 1, codice: '40.10', descrizione: 'Debiti Tributari', id_padre: 13, tipo: 'Conto', natura: 'Passività'},
    { id: 17, id_ditta: 1, codice: '40.10.001', descrizione: 'Erario c/IVA', id_padre: 16, tipo: 'Sottoconto', natura: 'Passività'},
    { id: 18, id_ditta: 1, codice: '60', descrizione: 'COSTI DELLA PRODUZIONE', tipo: 'Mastro', natura: 'Costo'},
    { id: 19, id_ditta: 1, codice: '60.01', descrizione: 'Acquisti', id_padre: 18, tipo: 'Conto', natura: 'Costo'},
    { id: 20, id_ditta: 1, codice: '60.01.001', descrizione: 'Materie prime c/acquisti', id_padre: 19, tipo: 'Sottoconto', natura: 'Costo'},
    { id: 21, id_ditta: 1, codice: '60.05', descrizione: 'Servizi', id_padre: 18, tipo: 'Conto', natura: 'Costo'},
    { id: 22, id_ditta: 1, codice: '60.05.001', descrizione: 'Consulenze professionali', id_padre: 21, tipo: 'Sottoconto', natura: 'Costo'},
    { id: 23, id_ditta: 1, codice: '70', descrizione: 'RICAVI DELLE VENDITE', tipo: 'Mastro', natura: 'Ricavo'},
    { id: 24, id_ditta: 1, codice: '70.01', descrizione: 'Ricavi', id_padre: 23, tipo: 'Conto', natura: 'Ricavo'},
    { id: 25, id_ditta: 1, codice: '70.01.001', descrizione: 'Prodotti finiti c/vendite', id_padre: 24, tipo: 'Sottoconto', natura: 'Ricavo'},
    { id: 26, id_ditta: 1, codice: '20.05.002', descrizione: 'SALATI E DOLCI', id_padre: 6, tipo: 'Sottoconto', natura: 'Attività'},
    { id: 27, id_ditta: 1, codice: '40.05.002', descrizione: 'SARACENARE EXPORT', id_padre: 14, tipo: 'Sottoconto', natura: 'Passività'},
    { id: 28, id_ditta: 1, codice: '20.05.003', descrizione: 'linux spa', id_padre: 6, tipo: 'Sottoconto', natura: 'Attività'},
    { id: 29, id_ditta: 1, codice: '40.05.003', descrizione: 'linux spa', id_padre: 14, tipo: 'Sottoconto', natura: 'Passività'},
    { id: 50, id_ditta: 1, codice: '20.20', descrizione: 'Crediti Erariali', id_padre: 5, tipo: 'Conto', natura: 'Attività'},
    { id: 51, id_ditta: 1, codice: '20.20.01', descrizione: 'IVA A CREDITO', id_padre: 50, tipo: 'Sottoconto', natura: 'Attività'}
  ]);
  
  await knex('utenti').insert([
    { id: 1, email: 'sysadmin@mia-azienda.it', mail_contatto: 'sysadmin@mia-azienda.it', password: 'password_criptata_qui', nome: 'System', cognome: 'Admin', id_ditta: 1, id_ruolo: 3, attivo: 1, livello: 50, Codice_Tipo_Utente: 1 },
    { id: 2, email: 'mario.rossi@cliente-demo.it', mail_contatto: 'mario.rossi@cliente-demo.it', password: 'password_criptata_qui', nome: 'Mario', cognome: 'Rossi', id_ditta: 2, id_ruolo: 4, attivo: 1, livello: 50 },
    { id: 3, email: 'angbrunosa@gmail.com', mail_contatto: 'angbrunosa@gmail.com', password: '$2b$10$JxllX3i7uL3CGpUunIoVSOdq1/zHxU9cckBYRXTPNBNbRz81lCXwC', nome: 'Angelo ok', cognome: 'Bruno', id_ditta: 1, id_ruolo: 2, attivo: 1, firma: 'la mia firma', livello: 99, Codice_Tipo_Utente: 1 },
    { id: 4, email: 'info@difam.it', mail_contatto: 'info@difam.it', password: '$2b$10$mDL.FXQ4GmIhthGlmLCRFOwv7FxAXCJkRqa0AqKI9GIogmP6fxmnK', nome: 'francesco ', cognome: 'baggetta', codice_fiscale: 'brf', id_ditta: 3, id_ruolo: 3, attivo: 1, firma: 'dott. Francesco Baggetta Direttore Generale Confesercenti Calabria Servizi', privacy: 1, livello: 50 },
    { id: 5, email: 'admin@example.com', mail_contatto: 'admin@example.com', password: '$2b$10$tbky/vlxsUxLcVHY1hY/YuJysH9mNaj7bFxxfVpFed1FYCMUMABWy', nome: 'Angelo ', cognome: 'Bruno', id_ruolo: 4, attivo: 1, livello: 50 },
    { id: 6, email: 'info@example.com', mail_contatto: 'info@example.com', password: '$2b$10$TE4iHRvwQ1Wgabc6gq..z.MiVOf2Ypjp4ehAHl.aJdQINjeLN5owi', nome: 'Angelo', cognome: 'Bruno', id_ditta: 1, id_ruolo: 3, attivo: 1, firma: 'dott. Angelo Bruno\nww', livello: 50 },
    { id: 9, email: 'master@opero.it', mail_contatto: 'master@opero.it', password: '$2b$10$yApw9swySOyQbtFCOC8TVOhPJTmrhIH0eDuVxc5H1WAGh0eAMFq6u', nome: 'Master', cognome: 'Admin', telefono: 'uu', id_ditta: 1, id_ruolo: 1, attivo: 1, firma: 'Direzione Gestionale Opero.\nwww.operomeglio.it\n', livello: 50 },
    { id: 10, email: 'provadmin@prova.it', mail_contatto: 'provadmin@prova.it', password: '$2b$10$DrytCfOdmnOgEH7ISH86X.NFCep9OVxfII5w6dCHfcoX.BYWN0fCC', nome: 'dott. Angelo', cognome: 'Bruno -Opero-GEST', id_ditta: 3, id_ruolo: 3, attivo: 1, firma: 'dott. Angelo Bruno\n\nopero il gestionale che opera per te', livello: 99 },
    { id: 11, email: 'AngProva@provino.it', mail_contatto: 'AngProva@provino.it', password: '$2b$10$dLb.wC/gRYtCmuISajM...LQ12V5oLd1c6aOZYGLw.wzfRw.kMqTu', nome: 'angeloProva', cognome: 'BrunoProva', codice_fiscale: 's', id_ditta: 3, id_ruolo: 4, attivo: 1, privacy: 1, livello: 50 },
    { id: 13, email: 'provaCOM@prova.it', mail_contatto: 'provaCOM@prova.it', password: '$2b$10$C26/u3pagw9zt5TYoqgCGernyCIXjt/c9xj/47mRiV1EXtYOC0T16', nome: 'PROVACOMPLETA', cognome: 'PROVACOMPLETA', codice_fiscale: 'BRNNGL76L21C349J', telefono: '098134463', indirizzo: 'VIA DEL CORSO2', citta: 'PASSOLENTO', provincia: 'CS', id_ditta: 3, id_ruolo: 3, attivo: 1, privacy: 1, livello: 49 },
    { id: 14, email: 'lucaprovadmin@prova.it', mail_contatto: 'lucaprovadmin@prova.it', password: '$2b$10$XJOnOO3o.s5DtorcN7JWG.3IoOTgJIPDNeJ07HcxUOmqZz3K3PlDq', nome: 'luca proca', cognome: 'cicone prova', codice_fiscale: 'lcvvnlsosos', telefono: '098135363', indirizzo: 'vico fioravanti', citta: 'saracena', provincia: 'cs', id_ditta: 3, id_ruolo: 3, attivo: 1, privacy: 1, livello: 10 },
    { id: 15, email: 'difamconsegne@gmail.com', mail_contatto: 'difamconsegne@gmail.com', password: '$2b$10$xw6CzU2voWK5sIEGzUflU.6BIn3cq1W4347npwYBad8ARJuzDNKJy', id_ditta: 2, id_ruolo: 4, attivo: 1, livello: 50 },
    { id: 16, email: 'postmaster@cedibef.com', mail_contatto: 'postmaster@cedibef.com', password: '$2b$10$dNnNFQx.dfTl1ofrRe0HeOk8MwMfT03tzj3o8LUm89NBiTvgS5p7a', id_ditta: 2, id_ruolo: 4, attivo: 1, livello: 50 },
    { id: 31, email: 'befretail@gmail.com', mail_contatto: 'befretail@gmail.com', password: '$2b$10$JxllX3i7uL3CGpUunIoVSOdq1/zHxU9cckBYRXTPNBNbRz81lCXwC', nome: 'Cavolo', cognome: 'A Fiore', telefono: 'oppido', indirizzo: 'mamertino', provincia: 'cs', id_ditta: 1, id_ruolo: 3, attivo: 1, privacy: 1 },
    { id: 32, email: 'opero@difam.it', mail_contatto: 'opero@difam.it', password: '$2b$10$HzcHeKuF1/LE1/3UY4jxLOFHvETDChIGrIqyzAiUkNZZBN.820ggK', id_ditta: 2, id_ruolo: 4, attivo: 1, livello: 50 },
    { id: 33, email: 'postmaster@difam.it', mail_contatto: 'postmaster@difam.it', password: '$2b$10$9ti7YOjqWQKXUqbknXTtKOMLMCzTRCrBkv1YTzgpXSiGmgXnycYyK', id_ditta: 2, id_ruolo: 4, attivo: 1, livello: 50 },
    { id: 34, email: 'provaadmin@prova.it', mail_contatto: 'provaadmin@prova.it', password: '$2b$10$nu1x6jTlOh5Uv9uRUITC1OgrueRQboMJJHUy98TN6hjbz/jVoxI9q', id_ditta: 2, id_ruolo: 4, attivo: 1, livello: 50 },
    { id: 35, email: 'befretail@gmai.com', mail_contatto: 'befretail@gmai.com', password: '$2b$10$yHIhsE9kDtGZhwMC.3p82.sVZNMVR7FnfOBfabyQFLS4fWLL3k02q', id_ditta: 2, id_ruolo: 4, attivo: 1, livello: 50 },
    { id: 36, email: 'master@oper.it', mail_contatto: 'master@oper.it', password: '$2b$10$yWaTJtd1vXGdx.a1PPTnFOHfW6ct4RB0eJWmCWnDRc5oP3NpNRr4K', id_ditta: 2, id_ruolo: 4, attivo: 1, livello: 50 },
    { id: 37, email: 'befretail@befretail.srl', mail_contatto: 'befretail@befretail.srl', password: '$2b$10$hkxyH85TK4x3Nn.0OcfFX.zAkE4hCUqXWug00ZQz1egk5UgUwN03a', id_ditta: 2, id_ruolo: 4, attivo: 1, livello: 50 },
    { id: 38, email: 'befretail@gmail.srl', mail_contatto: 'befretail@gmail.srl', password: '$2b$10$i75f4L16LWzI6.UYxx7jRuhwsGmS1INZpWoaq2m7jUTr5IMAutq1q', id_ditta: 2, id_ruolo: 4, attivo: 1, livello: 50 },
    { id: 39, email: 'befreatail@gmail.com', mail_contatto: 'befreatail@gmail.com', password: '$2b$10$NM6C65gA02ffDqpb30/3xuhkTUZet9yQ9ThL/Oa7jxkYzg1b4J0Zu', id_ditta: 2, id_ruolo: 4, attivo: 1, livello: 50 },
    { id: 43, email: 'amministrazione@difam.it', mail_contatto: 'amministrazione@difam.it', password: '$2b$10$.OPBEp3K0Z2Lqw5u81/lhO21U1iBqusAh2PpAAPU4mXI5vi.ZT7la', nome: 'Angelo-Amministrazione', cognome: 'Bruno-Amministrazione', codice_fiscale: 'profrold', telefono: '3356738658', indirizzo: 'Cda Soda, 4', citta: 'Saracena', cap: '87010', id_ditta: 1, id_ruolo: 2, attivo: 1, note: 'bellissimo', privacy: 1, livello: 93, Codice_Tipo_Utente: 1 },
    { id: 46, email: 'dantoniomaria70@gmail.com', mail_contatto: 'dantoniomaria70@gmail.com', password: 'password_provvisoria', nome: 'a', cognome: 's', telefono: '3356738658', id_ditta: 1, id_ruolo: 4, attivo: 0, livello: 0, Codice_Tipo_Utente: 2 },
    { id: 47, email: 'carmicol@libero.it', mail_contatto: 'carmicol@libero.it', password: 'password_provvisoria', nome: 'carmine', cognome: 'colautti', telefono: '098134463', id_ditta: 1, id_ruolo: 4, attivo: 0, livello: 0, Codice_Tipo_Utente: 2 },
    { id: 48, email: 'cicio.l@tiscali.it', password: '$2b$10$VxKnElUjNclmDPMaN0TKiepysi2RD6xXfW5NO6U5i/LwhwIrXwrC6', nome: 'luca ', cognome: 'ciciole', codice_fiscale: 'clclclclc', telefono: '3400958887', indirizzo: 'via fioravanti', citta: 'saracena', cap: '87010', id_ditta: 1, id_ruolo: 4, attivo: 1, note: 'cliente sartoria', livello: 1, Codice_Tipo_Utente: 2, verification_token: '05350912-8049-4733-a4d4-ed52bcd5fb43' }
  ]);
  
  await knex('an_progressivi').insert([ {id: 1, id_ditta: 1, codice_progressivo: 'PROT_CONT', descrizione: 'Protocollo Registrazioni Contabili', ultimo_numero: 19} ]);
  await knex('app_funzioni').insert([ {id: 1, codice_modulo: 10, funzione: 'Ciclo_Attivo', sotto_funzione: 'Fatturazione_Crea', livello_richiesto: 80}, {id: 2, codice_modulo: 10, funzione: 'Ciclo_Attivo', sotto_funzione: 'Fatturazione_Vedi', livello_richiesto: 50} ]);
  await knex('app_ruoli').insert([ {id: 1, id_ditta: 1, codice_modulo: 10, descrizione: 'Fatturista Senior'}, {id: 2, id_ditta: 1, codice_modulo: 10, descrizione: 'Fatturista Junior'} ]);
  await knex('app_ruoli_funzioni').insert([ {id_ruolo: 1, id_funzione: 1}, {id_ruolo: 1, id_funzione: 2}, {id_ruolo: 2, id_funzione: 2} ]);
  await knex('ditta_mail_accounts').insert([
    { id: 9, id_ditta: 3, nome_account: 'DifamConsegneGmail', email_address: 'difamconsegne@gmail.com', imap_host: 'imap.gmail.com', imap_port: 993, smtp_host: 'smtp.gmail.com', smtp_port: 465, auth_user: 'difamconsegne@gmail.com', auth_pass: 'd12d71b072f38f15aa9693640f02224f:24b11118a6603262259e59beecdbdce7602f6660f4a4dc89cfb10dbfebc9c9da' },
    { id: 10, id_ditta: 3, nome_account: 'Mail Cedibef', email_address: 'opero@difam.it', imap_host: 'imaps.aruba.it', imap_port: 993, smtp_host: 'smtps.aruba.it', smtp_port: 465, auth_user: 'opero@difam.it', auth_pass: '626f6ce6b770d4acce16029cd33f817b:79a53cf6cd29cc71bccffb3f5bcabb99' },
    { id: 11, id_ditta: 1, id_utente_creazione: 9, nome_account: 'MASTER OPERO', email_address: 'opero@difam.it', imap_host: 'imaps.aruba.it', imap_port: 993, smtp_host: 'smtps.aruba.it', smtp_port: 465, auth_user: 'opero@difam.it', auth_pass: '1b6622c1617dafdddbf644896cccf9fc:a48333991689f1bb7f3a7fe72d855664' },
    { id: 13, id_ditta: 1, nome_account: 'Opero Gestionale', email_address: 'info@difam.it', imap_host: 'imaps.difam.it', imap_port: 993, smtp_host: 'smtps.aruba.it', smtp_port: 465, auth_user: 'info@difam.it', auth_pass: 'ed74345a3f1b04e5f5d5386b1b9f526e:4f94b009dde529557be409f55196fbf1' }
  ]);
  await knex('ditte_moduli').insert([ {id_ditta: 1, codice_modulo: 10}, {id_ditta: 1, codice_modulo: 20}, {id_ditta: 1, codice_modulo: 30}, {id_ditta: 1, codice_modulo: 40}, {id_ditta: 1, codice_modulo: 50}, {id_ditta: 1, codice_modulo: 60}, {id_ditta: 2, codice_modulo: 20}, {id_ditta: 2, codice_modulo: 30}, {id_ditta: 2, codice_modulo: 50}, {id_ditta: 3, codice_modulo: 10}, {id_ditta: 3, codice_modulo: 20}, {id_ditta: 3, codice_modulo: 30} ]);
  await knex('email_inviate').insert([ {id: 1, id_utente_mittente: 6, destinatari: 'angbrunosa@gmai.com', oggetto: 'ciao', tracking_id: '974c346a-4882-4b6e-94a3-a1aa09163788'}, /* ... many other emails ... */ {id: 74, id_utente_mittente: 3, destinatari: 'angbrunosa@gmail.com', oggetto: 'prova da locale', corpo: '<p>saluti</p>', tracking_id: '46bb71fe-e807-4df7-af08-8075341d8fde'} ]);
  await knex('email_nascoste').insert([ {id_utente: 3, email_uid: 6}, {id_utente: 3, email_uid: 9} ]);
  await knex('funzioni').insert([
    {id: 1, codice: 'ANAGRAFICHE_VIEW', descrizione: "Permette di visualizzare l'elenco delle anagrafiche", chiave_componente_modulo: 'AMMINISTRAZIONE'},
    {id: 2, codice: 'ANAGRAFICHE_CREATE', descrizione: 'Permette di creare una nuova anagrafica', chiave_componente_modulo: 'AMMINISTRAZIONE'},
    {id: 3, codice: 'ANAGRAFICHE_EDIT', descrizione: "Permette di modificare un'anagrafica esistente", chiave_componente_modulo: 'AMMINISTRAZIONE'},
    {id: 4, codice: 'ANAGRAFICHE_DELETE', descrizione: "Permette di eliminare un'anagrafica", chiave_componente_modulo: 'AMMINISTRAZIONE'},
    {id: 5, codice: 'UTENTI_VIEW', descrizione: 'Permette di visualizzare gli utenti della propria ditta', Scorciatoia: 1, chiave_componente_modulo: 'AMMINISTRAZIONE'},
    {id: 26, codice: 'PDC_VIEW', descrizione: 'Visualizzazione del Piano dei Conti', chiave_componente_modulo: 'AMMINISTRAZIONE'},
    {id: 27, codice: 'PDC_EDIT', descrizione: 'Modifica e creazione voci del Piano dei Conti', chiave_componente_modulo: 'AMMINISTRAZIONE'},
    {id: 28, codice: 'MAIL_ACCOUNTS_VIEW', descrizione: 'Visualizza gli account email della ditta', chiave_componente_modulo: 'AMMINISTRAZIONE'},
    {id: 29, codice: 'MAIL_ACCOUNTS_EDIT', descrizione: 'crea e modifica gli account ditta', chiave_componente_modulo: 'AMMINISTRAZIONE'},
    {id: 30, codice: 'UTENTI_CREATE', descrizione: 'Permette di creare nuovi utenti', chiave_componente_modulo: 'AMMINISTRAZIONE'},
    {id: 31, codice: 'UTENTI_EDIT', descrizione: 'Permette di modificare i dati degli utenti', chiave_componente_modulo: 'AMMINISTRAZIONE'},
    {id: 32, codice: 'AddressBookManager', descrizione: 'gestione della rubrica \r\ncon liste di distribuzione', Scorciatoia: 1, chiave_componente_modulo: 'MAIL'},
    {id: 34, codice: 'RUBRICA_VIEW', descrizione: 'Visualizza la rubrica aziendale', Scorciatoia: 1, chiave_componente_modulo: 'RUBRICA'},
    {id: 35, codice: 'RUBRICA_MANAGE', descrizione: 'Crea e modifica contatti e liste di distribuzione', chiave_componente_modulo: 'RUBRICA'},
    {id: 36, codice: 'PPA_MODULE', descrizione: 'PERMETTE DI GESTIRE LA LOGICA E LO SPVILUPPO DEL PPA PROCEDURE PROCESSI AZIONI', Scorciatoia: 1, chiave_componente_modulo: 'AMMINISTRAZIONE'},
    {id: 37, codice: 'PROGRESSIVI_MANAGE', descrizione: 'gestione di tutti i progressivi ditta\r\nprotocollo contabile\r\nnumero doc '},
    {id: 38, codice: 'FIN_SMART', descrizione: 'gestione finanze', chiave_componente_modulo: 'FIN_SMART'}
  ]);
  await knex('iva_contabili').insert([ {id: 1, id_ditta: 1, codice: '04', descrizione: 'IVA al 4%', aliquota: 4.00}, {id: 2, id_ditta: 1, codice: '05', descrizione: 'IVA al 5%', aliquota: 5.00}, {id: 3, id_ditta: 1, codice: '10', descrizione: 'IVA al 10%', aliquota: 10.00}, {id: 4, id_ditta: 1, codice: '22', descrizione: 'IVA al 22%', aliquota: 22.00}, {id: 5, id_ditta: 1, codice: '59', descrizione: 'Fuori campo IVA', aliquota: 0.00} ]);
  await knex('liste_distribuzione').insert([ {id: 1, id_ditta: 1, nome_lista: 'Diretti'}, {id: 2, id_ditta: 1, nome_lista: 'Consulenti'}, {id: 3, id_ditta: 1, nome_lista: 'aziende'} ]);
  await knex('lista_distribuzione_ditte').insert([ {id_lista: 3, id_ditta: 6}, {id_lista: 3, id_ditta: 7}, {id_lista: 3, id_ditta: 12} ]);
  await knex('lista_distribuzione_utenti').insert([ {id_lista: 1, id_utente: 1}, {id_lista: 1, id_utente: 3}, {id_lista: 1, id_utente: 6}, {id_lista: 1, id_utente: 9}, {id_lista: 2, id_utente: 1}, {id_lista: 2, id_utente: 3}, {id_lista: 2, id_utente: 6}, {id_lista: 2, id_utente: 9}, {id_lista: 2, id_utente: 31}, {id_lista: 2, id_utente: 43}, {id_lista: 3, id_utente: 1}, {id_lista: 3, id_utente: 3} ]);
  await knex('log_accessi').insert([ {id: 1, id_utente: 1, indirizzo_ip: '192.168.1.10', id_funzione_accessibile: 5, dettagli_azione: 'Login riuscito'} ]);
  await knex('ppa_stati_azione').insert([ {ID: 1, id_ditta: 1, NomeStato: 'Assegnato', Colore: '#808080'}, {ID: 2, id_ditta: 1, NomeStato: 'Accettato', Colore: '#007bff'}, {ID: 3, id_ditta: 1, NomeStato: 'Evaso', Colore: '#28a745'}, {ID: 4, id_ditta: 1, NomeStato: 'Bloccato', Colore: '#dc3545'} ]);
  await knex('ppa_procedureditta').insert([ {ID: 1, id_ditta: 1, ID_ProceduraStandard: 1, NomePersonalizzato: 'Gruppo G%G spa ', Attiva: 1}, {ID: 2, id_ditta: 1, ID_ProceduraStandard: 2, NomePersonalizzato: 'Nuovi Clienti Top', Attiva: 1}, {ID: 3, id_ditta: 1, ID_ProceduraStandard: 3, NomePersonalizzato: 'prodotti venduti on line', Attiva: 1}, {ID: 4, id_ditta: 1, ID_ProceduraStandard: 1, NomePersonalizzato: 'Verifica Documenti', Attiva: 1}, {ID: 5, id_ditta: 1, ID_ProceduraStandard: 1, NomePersonalizzato: 'Tagliano Auto-FuoriGaranzia', Attiva: 1}, {ID: 6, id_ditta: 1, ID_ProceduraStandard: 1, NomePersonalizzato: 'Gestione Cliente Associato', Attiva: 1}, {ID: 7, id_ditta: 1, ID_ProceduraStandard: 2, NomePersonalizzato: 'lavorazione_sartoria', Attiva: 1} ]);
  await knex('ppa_processi').insert([ {ID: 1, ID_ProceduraDitta: 3, NomeProcesso: 'Stabilire contatto con Cliente - Email- Telefonico .', OrdineSequenziale: 0}, {ID: 2, ID_ProceduraDitta: 3, NomeProcesso: 'Verifica Consegna'}, {ID: 3, ID_ProceduraDitta: 3, NomeProcesso: 'Contattare il Cliente per soluzione', OrdineSequenziale: 0}, {ID: 4, ID_ProceduraDitta: 2, NomeProcesso: 'Appuntamento con la Direzione ', OrdineSequenziale: 0}, {ID: 5, ID_ProceduraDitta: 2, NomeProcesso: 'Gestione Cliente dedicata per i primi 3 mesi', OrdineSequenziale: 0}, {ID: 6, ID_ProceduraDitta: 2, NomeProcesso: 'Valutazione stato ', OrdineSequenziale: 0}, {ID: 8, ID_ProceduraDitta: 1, NomeProcesso: 'prova 1', OrdineSequenziale: 0}, {ID: 9, ID_ProceduraDitta: 6, NomeProcesso: 'Gestione Assortimento', OrdineSequenziale: 0}, {ID: 10, ID_ProceduraDitta: 6, NomeProcesso: 'Gestione Promozioni', OrdineSequenziale: 0}, {ID: 11, ID_ProceduraDitta: 6, NomeProcesso: 'Amministrative', OrdineSequenziale: 0}, {ID: 12, ID_ProceduraDitta: 4, NomeProcesso: 'raccolta dati documeti', OrdineSequenziale: 0}, {ID: 13, ID_ProceduraDitta: 7, NomeProcesso: 'Ricezione_Verifica_Capo', OrdineSequenziale: 0}, {ID: 14, ID_ProceduraDitta: 7, NomeProcesso: 'lavorazione', OrdineSequenziale: 0}, {ID: 15, ID_ProceduraDitta: 7, NomeProcesso: 'consegna-capo', OrdineSequenziale: 0} ]);
  await knex('ppa_azioni').insert([ {ID: 1, ID_Processo: 4, NomeAzione: 'Verifica strutture di vendita', Descrizione: 'Nel corso del primo appuntamento nella sede del cliente, è essenziale verificare lo stato dei punti vendita.  Verificare qualità assortimento - adeguatezza del personale - formazione del personale- qualità e completezza delle attrezzature - ', ID_RuoloDefault: 3}, /* ... */ {ID: 21, ID_Processo: 15, NomeAzione: 'consegna al cliente', Descrizione: 'dimostrazione al cliente delle lavorazione eseguite\ne firma ricezione capo', ID_RuoloDefault: 3} ]);
  await knex('ppa_istanzeprocedure').insert([ {ID: 1, ID_ProceduraDitta: 2, ID_DittaTarget: 6, ID_UtenteCreatore: 3, DataPrevistaFine: '2025-10-24'}, {ID: 5, ID_ProceduraDitta: 2, ID_DittaTarget: 7, ID_UtenteCreatore: 3, DataPrevistaFine: '2025-08-30'}, {ID: 6, ID_ProceduraDitta: 1, ID_DittaTarget: 6, ID_UtenteCreatore: 3, DataPrevistaFine: '2025-08-24'}, {ID: 7, ID_ProceduraDitta: 1, ID_DittaTarget: 6, ID_UtenteCreatore: 3, DataPrevistaFine: '2025-08-30'}, {ID: 8, ID_ProceduraDitta: 2, ID_DittaTarget: 6, ID_UtenteCreatore: 3, DataPrevistaFine: '2025-08-24'}, {ID: 9, ID_ProceduraDitta: 6, ID_DittaTarget: 6, ID_UtenteCreatore: 3, DataPrevistaFine: '2025-11-29'}, {ID: 10, ID_ProceduraDitta: 2, ID_DittaTarget: 14, ID_UtenteCreatore: 3, DataPrevistaFine: '2025-10-30'} ]);
  await knex('ppa_istanzeazioni').insert([ {ID: 1, ID_IstanzaProcedura: 1, ID_Azione: 1, ID_UtenteAssegnato: 31, ID_Stato: 1}, /* ... */ {ID: 51, ID_IstanzaProcedura: 10, ID_Azione: 8, ID_UtenteAssegnato: 6, DataScadenza: '2025-10-30'} ]);
  await knex('ppa_team').insert([ {ID: 4, ID_IstanzaProcedura: 5, NomeTeam: 'Team Procedura #5 - 23/08/2025'}, {ID: 5, ID_IstanzaProcedura: 6, NomeTeam: 'Team Procedura #6 - 23/08/2025'}, {ID: 6, ID_IstanzaProcedura: 7, NomeTeam: 'Team Procedura #7 - 23/08/2025'}, {ID: 7, ID_IstanzaProcedura: 8, NomeTeam: 'Team Procedura #8 - 23/08/2025'}, {ID: 8, ID_IstanzaProcedura: 9, NomeTeam: 'Team Procedura #9 - 25/08/2025'}, {ID: 9, ID_IstanzaProcedura: 10, NomeTeam: 'Team Procedura #10 - 26/08/2025'} ]);
  await knex('ppa_teammembri').insert([ {ID_Team: 4, ID_Utente: 3}, {ID_Team: 4, ID_Utente: 9}, {ID_Team: 4, ID_Utente: 31}, {ID_Team: 4, ID_Utente: 43}, {ID_Team: 5, ID_Utente: 31}, {ID_Team: 6, ID_Utente: 31}, {ID_Team: 7, ID_Utente: 3}, {ID_Team: 7, ID_Utente: 31}, {ID_Team: 7, ID_Utente: 43}, {ID_Team: 8, ID_Utente: 3}, {ID_Team: 8, ID_Utente: 31}, {ID_Team: 8, ID_Utente: 43}, {ID_Team: 9, ID_Utente: 1}, {ID_Team: 9, ID_Utente: 3}, {ID_Team: 9, ID_Utente: 6}, {ID_Team: 9, ID_Utente: 31}, {ID_Team: 9, ID_Utente: 43} ]);
  await knex('privacy_policies').insert([ {id: 1, id_ditta: 1, responsabile_trattamento: 'Angelo Breuno', corpo_lettera: '<p><br></p><p><strong>Autorizzazione al Trattamento dei Dati Personali per Finalità Commerciali e per la Comunicazione a Terzi</strong></p><p>Io sottoscritto/a,</p><p><strong>[Nome_Utente]</strong>, codice fiscale <strong>[codice fiscale]</strong>,</p><p><strong>PREMESSO CHE</strong></p><p><br></p><ul><li>ho ricevuto l\'informativa ai sensi dell’art. 13 del Regolamento (UE) 2016/679 (GDPR) relativa al trattamento dei miei dati personali da parte di <strong>[DITTA]</strong>, con sede in <strong>[indirizzo completo]</strong>,</li><li>ho compreso le finalità e le modalità del trattamento, i miei diritti e i soggetti coinvolti nel trattamento stesso,</li></ul><p><strong>AUTORIZZO</strong></p><p>il trattamento dei miei dati personali da parte di <strong>[Nome dell’Azienda]</strong> per le seguenti finalità:</p><ol><li><strong>Finalità di marketing diretto</strong>: invio di comunicazioni commerciali, promozionali e informative tramite e-mail, SMS, telefono, posta tradizionale o altri strumenti automatizzati di contatto, relative a prodotti e servizi offerti dal Titolare;</li><li><strong>Finalità di profilazione</strong>: analisi delle mie preferenze, abitudini e scelte di consumo al fine di ricevere comunicazioni personalizzate;</li><li><strong>Comunicazione a soggetti terzi</strong>: cessione e/o comunicazione dei miei dati personali a società terze, partner commerciali o altri titolari autonomi del trattamento, che potranno trattarli per proprie finalità di marketing diretto o altre attività commerciali compatibili.</li></ol><p><strong>DICHIARO</strong> inoltre di essere consapevole che:</p><p><br></p><ul><li>Il conferimento dei dati per le suddette finalità è facoltativo e l’eventuale mancato consenso non pregiudica la fruizione dei servizi principali offerti;</li><li>Posso in qualsiasi momento revocare il presente consenso, ai sensi dell’art. 7, par. 3, GDPR, scrivendo a <strong>[indirizzo email del titolare del trattamento]</strong>;</li><li>I miei diritti in merito al trattamento sono indicati negli articoli da 15 a 22 del GDPR.</li></ul><p>Luogo e data: _______________________________</p><p>Il presente documento è inviato a mezzo mail, accedendo al portale si considera accettata</p><p>non</p>'}, {id: 2, id_ditta: 3, responsabile_trattamento: 'angioletto', corpo_lettera: '<p>se le informazioni le vuoi pazientarrrr</p>'} ]);
  await knex('registration_tokens').insert([ {id: 1, id_ditta: 3, token: '7a92f40a-3995-4e19-b471-6c56d80c855c'}, /* ... */ {id: 27, id_ditta: 1, token: '80ce27b1-f1ac-4fa6-997d-800b8c67f0b9', utilizzato: 1} ]);
  await knex('ruoli_funzioni').insert([ {id_ruolo: 2, id_funzione: 1}, {id_ruolo: 2, id_funzione: 2}, {id_ruolo: 2, id_funzione: 3}, {id_ruolo: 2, id_funzione: 5}, {id_ruolo: 2, id_funzione: 26}, {id_ruolo: 2, id_funzione: 27}, {id_ruolo: 2, id_funzione: 28}, {id_ruolo: 2, id_funzione: 29}, {id_ruolo: 2, id_funzione: 30}, {id_ruolo: 2, id_funzione: 31}, {id_ruolo: 2, id_funzione: 32}, {id_ruolo: 2, id_funzione: 34}, {id_ruolo: 2, id_funzione: 35}, {id_ruolo: 2, id_funzione: 36}, {id_ruolo: 2, id_funzione: 37}, {id_ruolo: 4, id_funzione: 1} ]);
  await knex('sc_funzioni_contabili').insert([ {id: 9, id_ditta: 1, codice_funzione: 'REG-FATT-ACQ', nome_funzione: 'Registrazione Fattura Acquisto', descrizione: "Registra una fattura da fornitore, gestisce l'IVA e crea la partita aperta nello scadenzario.", categoria: 'Acquisti', tipo_funzione: 'Finanziaria', attiva: 1}, {id: 11, id_ditta: 1, codice_funzione: 'DARE_AVERE', nome_funzione: 'DARE AVERE', descrizione: "questa funzione permette all'utente di scegliere i conti ", categoria: 'Generale', tipo_funzione: 'Primaria', attiva: 1}, {id: 12, id_ditta: 1, codice_funzione: 'REG-FATT-VENDITA', nome_funzione: 'Registrazione Fattura Vendita', descrizione: 'REGISTRAZIONE MANUALE FATTURA2', categoria: 'Vendite', tipo_funzione: 'Finanziaria', attiva: 1}, {id: 13, id_ditta: 1, codice_funzione: '', nome_funzione: 'Versamento In banca ', descrizione: "registra le operazioni di giroconto dal conto cassa al conto Banca . L'utente sceglierà il sottoconto della banca", tipo_funzione: 'Primaria', attiva: 1} ]);
  await knex('sc_funzioni_contabili_righe').insert([ {id: 93, id_funzione_contabile: 9, id_conto: 20, tipo_movimento: 'D', descrizione_riga_predefinita: 'Costo per acquisto merci/servizi'}, {id: 94, id_funzione_contabile: 9, id_conto: 51, tipo_movimento: 'D', descrizione_riga_predefinita: 'credito erario conto iva'}, {id: 95, id_funzione_contabile: 9, id_conto: 15, tipo_movimento: 'A', descrizione_riga_predefinita: 'debito verso fornitore'}, {id: 112, id_funzione_contabile: 11, id_conto: 9, tipo_movimento: 'D'}, {id: 113, id_funzione_contabile: 11, id_conto: 10, tipo_movimento: 'D'}, {id: 123, id_funzione_contabile: 13, id_conto: 9, tipo_movimento: 'D', descrizione_riga_predefinita: 'versamento contnati'}, {id: 124, id_funzione_contabile: 13, id_conto: 10, tipo_movimento: 'A', descrizione_riga_predefinita: 'versamento in banca'}, {id: 125, id_funzione_contabile: 12, id_conto: 17, tipo_movimento: 'A', descrizione_riga_predefinita: 'Iva a Debito'}, {id: 126, id_funzione_contabile: 12, id_conto: 25, tipo_movimento: 'A', descrizione_riga_predefinita: 'ricavo vendita'}, {id: 127, id_funzione_contabile: 12, id_conto: 7, tipo_movimento: 'D', descrizione_riga_predefinita: 'credito verso clienti'} ]);
  await knex('sc_registrazioni_testata').insert([ {id: 6, id_ditta: 1, id_utente: 3, data_registrazione: '2025-09-09', descrizione_testata: 'Registrazione Fattura Acquisto', numero_protocollo: 1, stato: 'Confermato'}, /* ... */ {id: 32, id_ditta: 1, id_utente: 3, data_registrazione: '2025-09-13', descrizione_testata: 'Registrazione Fattura Vendita', data_documento: '2025-10-25', numero_documento: '555', totale_documento: 11.00, id_ditte: 14, numero_protocollo: 19} ]);
  await knex('sc_registrazioni_righe').insert([ {id: 16, id_testata: 6, id_conto: 27, descrizione_riga: 'Fornitori Italia', importo_avere: 122.00}, /* ... */ {id: 72, id_testata: 32, id_conto: 17, descrizione_riga: 'Iva a Debito', importo_avere: 1.00} ]);
  await knex('sc_registri_iva').insert([ {id: 1, id_riga_registrazione: 18, tipo_registro: 'Acquisti', data_documento: '2025-09-09', numero_documento: '10', id_anagrafica: 15, imponibile: 100.00, aliquota_iva: 22.00, importo_iva: 22.00}, {id: 2, id_riga_registrazione: 21, tipo_registro: 'Acquisti', data_documento: '2025-09-09', numero_documento: '100', id_anagrafica: 15, imponibile: 100.00, aliquota_iva: 10.00, importo_iva: 10.00} ]);
  await knex('sc_partite_aperte').insert([ {id: 1, id_ditta_anagrafica: 15, data_scadenza: '2025-09-11', importo: 122.00, data_registrazione: '2025-09-09', id_registrazione_testata: 6}, /* ... */ {id: 17, id_ditta_anagrafica: 14, data_scadenza: '2025-11-25', importo: 11.00, data_registrazione: '2025-09-13', id_registrazione_testata: 32} ]);
  await knex('tipi_pagamento').insert([ {id: 1, id_ditta: 3, codice: '10', descrizione: 'CONTANTI'}, {id: 2, id_ditta: 3, codice: '20', descrizione: 'BONIFICO'}, {id: 3, id_ditta: 3, codice: '30', descrizione: 'POS'}, {id: 4, id_ditta: 3, codice: '40', descrizione: 'TITOLI'}, {id: 5, id_ditta: 1, codice: '10', descrizione: 'CONTANTI'}, {id: 6, id_ditta: 1, codice: '20', descrizione: 'BONIFICO'}, {id: 7, id_ditta: 1, codice: '30', descrizione: 'POS'}, {id: 8, id_ditta: 1, codice: '40', descrizione: 'TITOLI'} ]);
  await knex('utente_scorciatoie').insert([ {id_utente: 3, id_funzione: 5}, {id_utente: 3, id_funzione: 32}, {id_utente: 3, id_funzione: 34}, {id_utente: 3, id_funzione: 36} ]);

  // Riabilita i controlli sulle chiavi esterne
  await knex.raw('SET FOREIGN_KEY_CHECKS = 1');
};

