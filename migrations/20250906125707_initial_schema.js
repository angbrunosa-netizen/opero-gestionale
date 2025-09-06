/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  const sql = (`
    CREATE TABLE \`allegati_tracciati\` (
      \`id\` int(11) NOT NULL,
      \`id_email_inviata\` int(11) NOT NULL,
      \`nome_file_originale\` varchar(255) NOT NULL,
      \`percorso_file_salvato\` varchar(255) NOT NULL,
      \`tipo_file\` varchar(100) DEFAULT NULL,
      \`dimensione_file\` int(11) DEFAULT NULL,
      \`scaricato\` tinyint(1) DEFAULT 0,
      \`data_primo_download\` timestamp NULL DEFAULT NULL,
      \`download_id\` varchar(255) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

    CREATE TABLE \`anno_di_gestione\` (
      \`anno\` int(11) NOT NULL,
      \`descrizione\` varchar(255) DEFAULT NULL,
      \`data_inizio\` date DEFAULT NULL,
      \`data_fine\` date DEFAULT NULL,
      \`stato\` enum('Aperto','Chiuso') DEFAULT 'Aperto'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

    CREATE TABLE \`app_funzioni\` (
      \`id\` int(11) NOT NULL,
      \`codice_modulo\` int(11) NOT NULL,
      \`funzione\` varchar(100) NOT NULL,
      \`sotto_funzione\` varchar(100) NOT NULL,
      \`descrizione\` text DEFAULT NULL,
      \`livello_richiesto\` int(11) NOT NULL,
      \`icona\` varchar(50) DEFAULT NULL,
      \`percorso\` varchar(255) DEFAULT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

    CREATE TABLE \`attivita\` (
      \`id\` int(11) NOT NULL,
      \`id_ditta\` int(11) NOT NULL,
      \`id_utente\` int(11) NOT NULL,
      \`id_cliente\` int(11) DEFAULT NULL,
      \`id_procedura\` int(11) DEFAULT NULL,
      \`data_ora_inizio\` datetime NOT NULL,
      \`data_ora_fine\` datetime DEFAULT NULL,
      \`descrizione\` text DEFAULT NULL,
      \`fatturabile\` tinyint(1) DEFAULT 0,
      \`importo_fattura\` decimal(10,2) DEFAULT NULL,
      \`id_fattura\` int(11) DEFAULT NULL,
      \`stato\` varchar(50) DEFAULT 'In Corso'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

    CREATE TABLE \`clienti\` (
      \`id\` int(11) NOT NULL,
      \`id_ditta\` int(11) NOT NULL,
      \`nome\` varchar(255) NOT NULL,
      \`cognome\` varchar(255) DEFAULT NULL,
      \`codice_fiscale\` varchar(16) DEFAULT NULL,
      \`partita_iva\` varchar(11) DEFAULT NULL,
      \`indirizzo\` varchar(255) DEFAULT NULL,
      \`citta\` varchar(100) DEFAULT NULL,
      \`provincia\` varchar(2) DEFAULT NULL,
      \`cap\` varchar(5) DEFAULT NULL,
      \`email\` varchar(255) DEFAULT NULL,
      \`telefono\` varchar(20) DEFAULT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

    CREATE TABLE \`conti\` (
      \`id\` int(11) NOT NULL,
      \`id_ditta\` int(11) NOT NULL,
      \`codice\` varchar(20) NOT NULL,
      \`descrizione\` varchar(255) NOT NULL,
      \`tipo\` enum('Attività','Passività','Patrimonio Netto','Costi','Ricavi') NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

    CREATE TABLE \`ditte\` (
      \`id\` int(11) NOT NULL,
      \`ragione_sociale\` varchar(255) NOT NULL,
      \`partita_iva\` varchar(11) NOT NULL,
      \`codice_fiscale\` varchar(16) DEFAULT NULL,
      \`indirizzo\` varchar(255) DEFAULT NULL,
      \`citta\` varchar(100) DEFAULT NULL,
      \`provincia\` varchar(2) DEFAULT NULL,
      \`cap\` varchar(5) DEFAULT NULL,
      \`email\` varchar(255) DEFAULT NULL,
      \`telefono\` varchar(20) DEFAULT NULL,
      \`logo_path\` varchar(255) DEFAULT NULL,
      \`codice_univoco_sdi\` varchar(7) DEFAULT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

    CREATE TABLE \`ditta_mail_accounts\` (
      \`id\` int(11) NOT NULL,
      \`id_ditta\` int(11) NOT NULL,
      \`email_address\` varchar(255) NOT NULL,
      \`smtp_host\` varchar(255) NOT NULL,
      \`smtp_port\` int(11) NOT NULL,
      \`smtp_user\` varchar(255) NOT NULL,
      \`smtp_password\` varchar(255) NOT NULL,
      \`smtp_secure\` tinyint(1) NOT NULL DEFAULT 1,
      \`imap_host\` varchar(255) DEFAULT NULL,
      \`imap_port\` int(11) DEFAULT NULL,
      \`imap_user\` varchar(255) DEFAULT NULL,
      \`imap_password\` varchar(255) DEFAULT NULL,
      \`imap_secure\` tinyint(1) DEFAULT 1,
      \`is_default\` tinyint(1) NOT NULL DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

    CREATE TABLE \`emails_inviate\` (
      \`id\` int(11) NOT NULL,
      \`id_ditta\` int(11) NOT NULL,
      \`id_utente\` int(11) NOT NULL,
      \`id_mail_account\` int(11) NOT NULL,
      \`destinatario\` text NOT NULL,
      \`oggetto\` varchar(255) DEFAULT NULL,
      \`corpo\` text DEFAULT NULL,
      \`data_invio\` timestamp NOT NULL DEFAULT current_timestamp(),
      \`stato\` enum('Inviata','Fallita','Tracciata') DEFAULT 'Inviata',
      \`message_id\` varchar(255) DEFAULT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

    CREATE TABLE \`fatture_attive\` (
      \`id\` int(11) NOT NULL,
      \`id_ditta\` int(11) NOT NULL,
      \`id_cliente\` int(11) NOT NULL,
      \`numero_fattura\` varchar(50) NOT NULL,
      \`data_emissione\` date NOT NULL,
      \`importo_imponibile\` decimal(12,2) DEFAULT NULL,
      \`id_iva\` int(11) DEFAULT NULL,
      \`importo_totale\` decimal(12,2) DEFAULT NULL,
      \`data_scadenza\` date DEFAULT NULL,
      \`stato\` enum('Emessa','Pagata','Stornata','Scaduta') DEFAULT 'Emessa',
      \`id_utente_creazione\` int(11) DEFAULT NULL,
      \`anno\` int(11) DEFAULT NULL COMMENT 'Anno di competenza della fattura'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

    CREATE TABLE \`fatture_passive\` (
      \`id\` int(11) NOT NULL,
      \`id_ditta\` int(11) NOT NULL,
      \`id_fornitore\` int(11) NOT NULL,
      \`numero_documento\` varchar(100) NOT NULL,
      \`data_documento\` date NOT NULL,
      \`importo_imponibile\` decimal(12,2) DEFAULT NULL,
      \`id_iva\` int(11) DEFAULT NULL,
      \`importo_totale\` decimal(12,2) DEFAULT NULL,
      \`data_scadenza\` date DEFAULT NULL,
      \`stato\` enum('Da Pagare','Pagata','Contestata') DEFAULT 'Da Pagare',
      \`id_utente_registrazione\` int(11) DEFAULT NULL,
      \`anno\` int(11) DEFAULT NULL COMMENT 'Anno di competenza della fattura'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

    CREATE TABLE \`fornitori\` (
      \`id\` int(11) NOT NULL,
      \`id_ditta\` int(11) NOT NULL,
      \`ragione_sociale\` varchar(255) NOT NULL,
      \`partita_iva\` varchar(11) DEFAULT NULL,
      \`codice_fiscale\` varchar(16) DEFAULT NULL,
      \`indirizzo\` varchar(255) DEFAULT NULL,
      \`citta\` varchar(100) DEFAULT NULL,
      \`provincia\` varchar(2) DEFAULT NULL,
      \`cap\` varchar(5) DEFAULT NULL,
      \`email\` varchar(255) DEFAULT NULL,
      \`telefono\` varchar(20) DEFAULT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

    CREATE TABLE \`funzioni\` (
      \`id\` int(11) NOT NULL,
      \`nome\` varchar(255) NOT NULL,
      \`percorso\` varchar(255) NOT NULL,
      \`icona\` varchar(50) DEFAULT NULL,
      \`categoria\` varchar(100) DEFAULT 'Generale'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

    CREATE TABLE \`iva\` (
      \`id\` int(11) NOT NULL,
      \`id_ditta\` int(11) NOT NULL,
      \`codice_iva\` varchar(10) NOT NULL,
      \`descrizione\` varchar(255) DEFAULT NULL,
      \`aliquota\` decimal(5,2) NOT NULL,
      \`id_anagrafica\` int(11) DEFAULT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

    CREATE TABLE \`log_attivita\` (
      \`id\` int(11) NOT NULL,
      \`id_utente\` int(11) DEFAULT NULL,
      \`azione\` varchar(255) NOT NULL,
      \`dettagli\` text DEFAULT NULL,
      \`timestamp\` timestamp NOT NULL DEFAULT current_timestamp()
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

    CREATE TABLE \`moduli\` (
      \`codice\` int(11) NOT NULL,
      \`nome\` varchar(50) NOT NULL,
      \`descrizione\` text DEFAULT NULL,
      \`stato\` tinyint(1) NOT NULL DEFAULT 1
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

    CREATE TABLE \`piano_dei_conti\` (
      \`id\` int(11) NOT NULL,
      \`id_ditta\` int(11) NOT NULL,
      \`codice_conto\` varchar(20) NOT NULL,
      \`descrizione\` varchar(255) NOT NULL,
      \`tipo_conto\` enum('Attività','Passività','Patrimonio Netto','Costo','Ricavo') NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

    CREATE TABLE \`prima_nota\` (
      \`id\` int(11) NOT NULL,
      \`id_ditta\` int(11) NOT NULL,
      \`data_registrazione\` date NOT NULL,
      \`descrizione\` text DEFAULT NULL,
      \`id_utente\` int(11) DEFAULT NULL,
      \`anno\` int(11) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

    CREATE TABLE \`procedure_ppa\` (
      \`id\` int(11) NOT NULL,
      \`id_ditta\` int(11) NOT NULL,
      \`nome_procedura\` varchar(255) NOT NULL,
      \`descrizione\` text DEFAULT NULL,
      \`data_creazione\` timestamp NOT NULL DEFAULT current_timestamp()
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

    CREATE TABLE \`registrazioni_prima_nota\` (
      \`id\` int(11) NOT NULL,
      \`id_prima_nota\` int(11) NOT NULL,
      \`id_conto\` int(11) NOT NULL,
      \`importo_dare\` decimal(12,2) DEFAULT 0.00,
      \`importo_avere\` decimal(12,2) DEFAULT 0.00,
      \`descrizione_riga\` varchar(255) DEFAULT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

    CREATE TABLE \`ruoli\` (
      \`id\` int(11) NOT NULL,
      \`nome_ruolo\` varchar(50) NOT NULL,
      \`descrizione\` text DEFAULT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

    CREATE TABLE \`ruolo_funzioni\` (
      \`id_ruolo\` int(11) NOT NULL,
      \`id_funzione\` int(11) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

    CREATE TABLE \`rubrica_contatti\` (
      \`id\` int(11) NOT NULL,
      \`id_ditta\` int(11) NOT NULL,
      \`nome\` varchar(100) NOT NULL,
      \`cognome\` varchar(100) DEFAULT NULL,
      \`azienda\` varchar(255) DEFAULT NULL,
      \`email\` varchar(255) DEFAULT NULL,
      \`telefono\` varchar(20) DEFAULT NULL,
      \`indirizzo\` varchar(255) DEFAULT NULL,
      \`citta\` varchar(100) DEFAULT NULL,
      \`provincia\` varchar(2) DEFAULT NULL,
      \`cap\` varchar(5) DEFAULT NULL,
      \`note\` text DEFAULT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

    CREATE TABLE \`sottoconti\` (
      \`id\` int(11) NOT NULL,
      \`id_ditta\` int(11) NOT NULL,
      \`id_conto\` int(11) NOT NULL,
      \`codice_sottoconto\` varchar(20) NOT NULL,
      \`descrizione\` varchar(255) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

    CREATE TABLE \`stati_lettura\` (
      \`id\` int(11) NOT NULL,
      \`id_utente\` int(11) NOT NULL,
      \`id_email\` int(11) NOT NULL,
      \`letto\` tinyint(1) DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

    CREATE TABLE \`tipi_pagamento\` (
      \`id\` int(11) NOT NULL,
      \`id_ditta\` int(11) NOT NULL,
      \`codice\` varchar(20) NOT NULL,
      \`descrizione\` varchar(255) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

    CREATE TABLE \`tipi_utente\` (
      \`Codice\` int(11) NOT NULL,
      \`Descrizione\` varchar(50) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

    CREATE TABLE \`utente_mail_accounts\` (
      \`id\` int(11) NOT NULL,
      \`id_utente\` int(11) NOT NULL,
      \`id_mail_account\` int(11) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

    CREATE TABLE \`utente_scorciatoie\` (
      \`id\` int(11) NOT NULL,
      \`id_utente\` int(11) NOT NULL,
      \`id_funzione\` int(11) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

    CREATE TABLE \`utenti\` (
      \`id\` int(11) NOT NULL,
      \`id_ditta\` int(11) NOT NULL,
      \`id_ruolo\` int(11) DEFAULT 1,
      \`nome\` varchar(255) NOT NULL,
      \`cognome\` varchar(255) NOT NULL,
      \`email\` varchar(255) NOT NULL,
      \`password\` varchar(255) NOT NULL,
      \`Codice_Tipo_Utente\` int(11) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

    ALTER TABLE \`allegati_tracciati\`
      ADD PRIMARY KEY (\`id\`),
      ADD UNIQUE KEY \`download_id\` (\`download_id\`),
      ADD KEY \`id_email_inviata\` (\`id_email_inviata\`);

    ALTER TABLE \`anno_di_gestione\`
      ADD PRIMARY KEY (\`anno\`);

    ALTER TABLE \`app_funzioni\`
      ADD PRIMARY KEY (\`id\`),
      ADD UNIQUE KEY \`idx_codice_funzione_sottofunzione\` (\`codice_modulo\`,\`funzione\`,\`sotto_funzione\`);

    ALTER TABLE \`attivita\`
      ADD PRIMARY KEY (\`id\`),
      ADD KEY \`id_ditta\` (\`id_ditta\`),
      ADD KEY \`id_utente\` (\`id_utente\`),
      ADD KEY \`id_cliente\` (\`id_cliente\`),
      ADD KEY \`id_procedura\` (\`id_procedura\`),
      ADD KEY \`id_fattura\` (\`id_fattura\`);

    ALTER TABLE \`clienti\`
      ADD PRIMARY KEY (\`id\`),
      ADD KEY \`id_ditta\` (\`id_ditta\`);

    ALTER TABLE \`conti\`
      ADD PRIMARY KEY (\`id\`),
      ADD UNIQUE KEY \`idx_ditta_codice\` (\`id_ditta\`,\`codice\`);

    ALTER TABLE \`ditte\`
      ADD PRIMARY KEY (\`id\`),
      ADD UNIQUE KEY \`partita_iva\` (\`partita_iva\`);

    ALTER TABLE \`ditta_mail_accounts\`
      ADD PRIMARY KEY (\`id\`),
      ADD KEY \`id_ditta\` (\`id_ditta\`);

    ALTER TABLE \`emails_inviate\`
      ADD PRIMARY KEY (\`id\`),
      ADD KEY \`id_ditta\` (\`id_ditta\`),
      ADD KEY \`id_utente\` (\`id_utente\`),
      ADD KEY \`id_mail_account\` (\`id_mail_account\`);

    ALTER TABLE \`fatture_attive\`
      ADD PRIMARY KEY (\`id\`),
      ADD KEY \`id_ditta\` (\`id_ditta\`),
      ADD KEY \`id_cliente\` (\`id_cliente\`),
      ADD KEY \`id_iva\` (\`id_iva\`),
      ADD KEY \`id_utente_creazione\` (\`id_utente_creazione\`);

    ALTER TABLE \`fatture_passive\`
      ADD PRIMARY KEY (\`id\`),
      ADD KEY \`id_ditta\` (\`id_ditta\`),
      ADD KEY \`id_fornitore\` (\`id_fornitore\`),
      ADD KEY \`id_iva\` (\`id_iva\`),
      ADD KEY \`id_utente_registrazione\` (\`id_utente_registrazione\`);

    ALTER TABLE \`fornitori\`
      ADD PRIMARY KEY (\`id\`),
      ADD KEY \`id_ditta\` (\`id_ditta\`);

    ALTER TABLE \`funzioni\`
      ADD PRIMARY KEY (\`id\`),
      ADD UNIQUE KEY \`percorso\` (\`percorso\`);

    ALTER TABLE \`iva\`
      ADD PRIMARY KEY (\`id\`),
      ADD KEY \`id_ditta\` (\`id_ditta\`),
      ADD KEY \`id_anagrafica\` (\`id_anagrafica\`);

    ALTER TABLE \`log_attivita\`
      ADD PRIMARY KEY (\`id\`),
      ADD KEY \`id_utente\` (\`id_utente\`);

    ALTER TABLE \`moduli\`
      ADD PRIMARY KEY (\`codice\`);

    ALTER TABLE \`piano_dei_conti\`
      ADD PRIMARY KEY (\`id\`),
      ADD UNIQUE KEY \`idx_ditta_codice_conto\` (\`id_ditta\`,\`codice_conto\`);

    ALTER TABLE \`prima_nota\`
      ADD PRIMARY KEY (\`id\`),
      ADD KEY \`id_ditta\` (\`id_ditta\`),
      ADD KEY \`id_utente\` (\`id_utente\`);

    ALTER TABLE \`procedure_ppa\`
      ADD PRIMARY KEY (\`id\`),
      ADD KEY \`id_ditta\` (\`id_ditta\`);

    ALTER TABLE \`registrazioni_prima_nota\`
      ADD PRIMARY KEY (\`id\`),
      ADD KEY \`id_prima_nota\` (\`id_prima_nota\`),
      ADD KEY \`id_conto\` (\`id_conto\`);

    ALTER TABLE \`ruoli\`
      ADD PRIMARY KEY (\`id\`);

    ALTER TABLE \`ruolo_funzioni\`
      ADD PRIMARY KEY (\`id_ruolo\`,\`id_funzione\`),
      ADD KEY \`id_funzione\` (\`id_funzione\`);

    ALTER TABLE \`rubrica_contatti\`
      ADD PRIMARY KEY (\`id\`),
      ADD KEY \`id_ditta\` (\`id_ditta\`);

    ALTER TABLE \`sottoconti\`
      ADD PRIMARY KEY (\`id\`),
      ADD UNIQUE KEY \`idx_conto_codice_sottoconto\` (\`id_conto\`,\`codice_sottoconto\`),
      ADD KEY \`id_ditta\` (\`id_ditta\`);

    ALTER TABLE \`stati_lettura\`
      ADD PRIMARY KEY (\`id\`),
      ADD KEY \`id_utente\` (\`id_utente\`);

    ALTER TABLE \`tipi_pagamento\`
      ADD PRIMARY KEY (\`id\`),
      ADD UNIQUE KEY \`idx_ditta_codice\` (\`id_ditta\`,\`codice\`);

    ALTER TABLE \`tipi_utente\`
      ADD PRIMARY KEY (\`Codice\`);

    ALTER TABLE \`utente_mail_accounts\`
      ADD PRIMARY KEY (\`id\`),
      ADD KEY \`id_utente\` (\`id_utente\`),
      ADD KEY \`id_mail_account\` (\`id_mail_account\`);

    ALTER TABLE \`utente_scorciatoie\`
      ADD PRIMARY KEY (\`id\`),
      ADD KEY \`id_utente\` (\`id_utente\`),
      ADD KEY \`id_funzione\` (\`id_funzione\`);

    ALTER TABLE \`utenti\`
      ADD PRIMARY KEY (\`id\`),
      ADD UNIQUE KEY \`email\` (\`email\`),
      ADD KEY \`id_ditta\` (\`id_ditta\`),
      ADD KEY \`Codice_Tipo_Utente\` (\`Codice_Tipo_Utente\`),
      ADD KEY \`utenti_ibfk_2\` (\`id_ruolo\`);

    ALTER TABLE \`allegati_tracciati\`
      MODIFY \`id\` int(11) NOT NULL AUTO_INCREMENT;

    ALTER TABLE \`app_funzioni\`
      MODIFY \`id\` int(11) NOT NULL AUTO_INCREMENT;

    ALTER TABLE \`attivita\`
      MODIFY \`id\` int(11) NOT NULL AUTO_INCREMENT;

    ALTER TABLE \`clienti\`
      MODIFY \`id\` int(11) NOT NULL AUTO_INCREMENT;

    ALTER TABLE \`conti\`
      MODIFY \`id\` int(11) NOT NULL AUTO_INCREMENT;

    ALTER TABLE \`ditte\`
      MODIFY \`id\` int(11) NOT NULL AUTO_INCREMENT;

    ALTER TABLE \`ditta_mail_accounts\`
      MODIFY \`id\` int(11) NOT NULL AUTO_INCREMENT;

    ALTER TABLE \`emails_inviate\`
      MODIFY \`id\` int(11) NOT NULL AUTO_INCREMENT;

    ALTER TABLE \`fatture_attive\`
      MODIFY \`id\` int(11) NOT NULL AUTO_INCREMENT;

    ALTER TABLE \`fatture_passive\`
      MODIFY \`id\` int(11) NOT NULL AUTO_INCREMENT;

    ALTER TABLE \`fornitori\`
      MODIFY \`id\` int(11) NOT NULL AUTO_INCREMENT;

    ALTER TABLE \`funzioni\`
      MODIFY \`id\` int(11) NOT NULL AUTO_INCREMENT;

    ALTER TABLE \`iva\`
      MODIFY \`id\` int(11) NOT NULL AUTO_INCREMENT;

    ALTER TABLE \`log_attivita\`
      MODIFY \`id\` int(11) NOT NULL AUTO_INCREMENT;

    ALTER TABLE \`piano_dei_conti\`
      MODIFY \`id\` int(11) NOT NULL AUTO_INCREMENT;

    ALTER TABLE \`prima_nota\`
      MODIFY \`id\` int(11) NOT NULL AUTO_INCREMENT;

    ALTER TABLE \`procedure_ppa\`
      MODIFY \`id\` int(11) NOT NULL AUTO_INCREMENT;

    ALTER TABLE \`registrazioni_prima_nota\`
      MODIFY \`id\` int(11) NOT NULL AUTO_INCREMENT;

    ALTER TABLE \`ruoli\`
      MODIFY \`id\` int(11) NOT NULL AUTO_INCREMENT;

    ALTER TABLE \`rubrica_contatti\`
      MODIFY \`id\` int(11) NOT NULL AUTO_INCREMENT;

    ALTER TABLE \`sottoconti\`
      MODIFY \`id\` int(11) NOT NULL AUTO_INCREMENT;

    ALTER TABLE \`stati_lettura\`
      MODIFY \`id\` int(11) NOT NULL AUTO_INCREMENT;

    ALTER TABLE \`tipi_pagamento\`
      MODIFY \`id\` int(11) NOT NULL AUTO_INCREMENT;

    ALTER TABLE \`tipi_utente\`
      MODIFY \`Codice\` int(11) NOT NULL AUTO_INCREMENT;

    ALTER TABLE \`utente_mail_accounts\`
      MODIFY \`id\` int(11) NOT NULL AUTO_INCREMENT;

    ALTER TABLE \`utente_scorciatoie\`
      MODIFY \`id\` int(11) NOT NULL AUTO_INCREMENT;

    ALTER TABLE \`utenti\`
      MODIFY \`id\` int(11) NOT NULL AUTO_INCREMENT;

    ALTER TABLE \`allegati_tracciati\`
      ADD CONSTRAINT \`allegati_tracciati_ibfk_1\` FOREIGN KEY (\`id_email_inviata\`) REFERENCES \`emails_inviate\` (\`id\`) ON DELETE CASCADE;

    ALTER TABLE \`app_funzioni\`
      ADD CONSTRAINT \`app_funzioni_ibfk_1\` FOREIGN KEY (\`codice_modulo\`) REFERENCES \`moduli\` (\`codice\`);

    ALTER TABLE \`attivita\`
      ADD CONSTRAINT \`attivita_ibfk_1\` FOREIGN KEY (\`id_ditta\`) REFERENCES \`ditte\` (\`id\`) ON DELETE CASCADE,
      ADD CONSTRAINT \`attivita_ibfk_2\` FOREIGN KEY (\`id_utente\`) REFERENCES \`utenti\` (\`id\`) ON DELETE CASCADE,
      ADD CONSTRAINT \`attivita_ibfk_3\` FOREIGN KEY (\`id_cliente\`) REFERENCES \`clienti\` (\`id\`) ON DELETE SET NULL,
      ADD CONSTRAINT \`attivita_ibfk_4\` FOREIGN KEY (\`id_procedura\`) REFERENCES \`procedure_ppa\` (\`id\`) ON DELETE SET NULL,
      ADD CONSTRAINT \`attivita_ibfk_5\` FOREIGN KEY (\`id_fattura\`) REFERENCES \`fatture_attive\` (\`id\`) ON DELETE SET NULL;

    ALTER TABLE \`clienti\`
      ADD CONSTRAINT \`clienti_ibfk_1\` FOREIGN KEY (\`id_ditta\`) REFERENCES \`ditte\` (\`id\`) ON DELETE CASCADE;

    ALTER TABLE \`conti\`
      ADD CONSTRAINT \`conti_ibfk_1\` FOREIGN KEY (\`id_ditta\`) REFERENCES \`ditte\` (\`id\`) ON DELETE CASCADE;

    ALTER TABLE \`ditta_mail_accounts\`
      ADD CONSTRAINT \`ditta_mail_accounts_ibfk_1\` FOREIGN KEY (\`id_ditta\`) REFERENCES \`ditte\` (\`id\`) ON DELETE CASCADE;

    ALTER TABLE \`emails_inviate\`
      ADD CONSTRAINT \`emails_inviate_ibfk_1\` FOREIGN KEY (\`id_ditta\`) REFERENCES \`ditte\` (\`id\`) ON DELETE CASCADE,
      ADD CONSTRAINT \`emails_inviate_ibfk_2\` FOREIGN KEY (\`id_utente\`) REFERENCES \`utenti\` (\`id\`) ON DELETE CASCADE,
      ADD CONSTRAINT \`emails_inviate_ibfk_3\` FOREIGN KEY (\`id_mail_account\`) REFERENCES \`ditta_mail_accounts\` (\`id\`) ON DELETE CASCADE;

    ALTER TABLE \`fatture_attive\`
      ADD CONSTRAINT \`fatture_attive_ibfk_1\` FOREIGN KEY (\`id_ditta\`) REFERENCES \`ditte\` (\`id\`) ON DELETE CASCADE,
      ADD CONSTRAINT \`fatture_attive_ibfk_2\` FOREIGN KEY (\`id_cliente\`) REFERENCES \`clienti\` (\`id\`) ON DELETE CASCADE,
      ADD CONSTRAINT \`fatture_attive_ibfk_3\` FOREIGN KEY (\`id_iva\`) REFERENCES \`iva\` (\`id\`) ON DELETE SET NULL,
      ADD CONSTRAINT \`fatture_attive_ibfk_4\` FOREIGN KEY (\`id_utente_creazione\`) REFERENCES \`utenti\` (\`id\`) ON DELETE SET NULL;

    ALTER TABLE \`fatture_passive\`
      ADD CONSTRAINT \`fatture_passive_ibfk_1\` FOREIGN KEY (\`id_ditta\`) REFERENCES \`ditte\` (\`id\`) ON DELETE CASCADE,
      ADD CONSTRAINT \`fatture_passive_ibfk_2\` FOREIGN KEY (\`id_fornitore\`) REFERENCES \`fornitori\` (\`id\`) ON DELETE CASCADE,
      ADD CONSTRAINT \`fatture_passive_ibfk_3\` FOREIGN KEY (\`id_iva\`) REFERENCES \`iva\` (\`id\`) ON DELETE SET NULL,
      ADD CONSTRAINT \`fatture_passive_ibfk_4\` FOREIGN KEY (\`id_utente_registrazione\`) REFERENCES \`utenti\` (\`id\`) ON DELETE SET NULL;

    ALTER TABLE \`fornitori\`
      ADD CONSTRAINT \`fornitori_ibfk_1\` FOREIGN KEY (\`id_ditta\`) REFERENCES \`ditte\` (\`id\`) ON DELETE CASCADE;

    ALTER TABLE \`iva\`
      ADD CONSTRAINT \`iva_ibfk_1\` FOREIGN KEY (\`id_ditta\`) REFERENCES \`ditte\` (\`id\`) ON DELETE CASCADE,
      ADD CONSTRAINT \`iva_ibfk_2\` FOREIGN KEY (\`id_anagrafica\`) REFERENCES \`ditte\` (\`id\`) ON DELETE SET NULL;

    ALTER TABLE \`log_attivita\`
      ADD CONSTRAINT \`log_attivita_ibfk_1\` FOREIGN KEY (\`id_utente\`) REFERENCES \`utenti\` (\`id\`) ON DELETE SET NULL;

    ALTER TABLE \`piano_dei_conti\`
      ADD CONSTRAINT \`piano_dei_conti_ibfk_1\` FOREIGN KEY (\`id_ditta\`) REFERENCES \`ditte\` (\`id\`) ON DELETE CASCADE;

    ALTER TABLE \`prima_nota\`
      ADD CONSTRAINT \`prima_nota_ibfk_1\` FOREIGN KEY (\`id_ditta\`) REFERENCES \`ditte\` (\`id\`) ON DELETE CASCADE,
      ADD CONSTRAINT \`prima_nota_ibfk_2\` FOREIGN KEY (\`id_utente\`) REFERENCES \`utenti\` (\`id\`) ON DELETE SET NULL;

    ALTER TABLE \`procedure_ppa\`
      ADD CONSTRAINT \`procedure_ppa_ibfk_1\` FOREIGN KEY (\`id_ditta\`) REFERENCES \`ditte\` (\`id\`) ON DELETE CASCADE;

    ALTER TABLE \`registrazioni_prima_nota\`
      ADD CONSTRAINT \`registrazioni_prima_nota_ibfk_1\` FOREIGN KEY (\`id_prima_nota\`) REFERENCES \`prima_nota\` (\`id\`) ON DELETE CASCADE,
      ADD CONSTRAINT \`registrazioni_prima_nota_ibfk_2\` FOREIGN KEY (\`id_conto\`) REFERENCES \`piano_dei_conti\` (\`id\`);

    ALTER TABLE \`ruolo_funzioni\`
      ADD CONSTRAINT \`ruolo_funzioni_ibfk_1\` FOREIGN KEY (\`id_ruolo\`) REFERENCES \`ruoli\` (\`id\`) ON DELETE CASCADE,
      ADD CONSTRAINT \`ruolo_funzioni_ibfk_2\` FOREIGN KEY (\`id_funzione\`) REFERENCES \`funzioni\` (\`id\`) ON DELETE CASCADE;

    ALTER TABLE \`rubrica_contatti\`
      ADD CONSTRAINT \`rubrica_contatti_ibfk_1\` FOREIGN KEY (\`id_ditta\`) REFERENCES \`ditte\` (\`id\`) ON DELETE CASCADE;

    ALTER TABLE \`sottoconti\`
      ADD CONSTRAINT \`sottoconti_ibfk_1\` FOREIGN KEY (\`id_ditta\`) REFERENCES \`ditte\` (\`id\`) ON DELETE CASCADE,
      ADD CONSTRAINT \`sottoconti_ibfk_2\` FOREIGN KEY (\`id_conto\`) REFERENCES \`conti\` (\`id\`) ON DELETE CASCADE;

    ALTER TABLE \`stati_lettura\`
      ADD CONSTRAINT \`stati_lettura_ibfk_1\` FOREIGN KEY (\`id_utente\`) REFERENCES \`utenti\` (\`id\`) ON DELETE CASCADE;

    ALTER TABLE \`tipi_pagamento\`
      ADD CONSTRAINT \`tipi_pagamento_ibfk_1\` FOREIGN KEY (\`id_ditta\`) REFERENCES \`ditte\` (\`id\`) ON DELETE CASCADE;

    ALTER TABLE \`utente_mail_accounts\`
      ADD CONSTRAINT \`utente_mail_accounts_ibfk_1\` FOREIGN KEY (\`id_utente\`) REFERENCES \`utenti\` (\`id\`) ON DELETE CASCADE,
      ADD CONSTRAINT \`utente_mail_accounts_ibfk_2\` FOREIGN KEY (\`id_mail_account\`) REFERENCES \`ditta_mail_accounts\` (\`id\`) ON DELETE CASCADE;

    ALTER TABLE \`utente_scorciatoie\`
      ADD CONSTRAINT \`utente_scorciatoie_ibfk_1\` FOREIGN KEY (\`id_utente\`) REFERENCES \`utenti\` (\`id\`) ON DELETE CASCADE,
      ADD CONSTRAINT \`utente_scorciatoie_ibfk_2\` FOREIGN KEY (\`id_funzione\`) REFERENCES \`funzioni\` (\`id\`) ON DELETE CASCADE;

    ALTER TABLE \`utenti\`
      ADD CONSTRAINT \`fk_utente_tipo\` FOREIGN KEY (\`Codice_Tipo_Utente\`) REFERENCES \`tipi_utente\` (\`Codice\`),
      ADD CONSTRAINT \`utenti_ibfk_1\` FOREIGN KEY (\`id_ditta\`) REFERENCES \`ditte\` (\`id\`),
      ADD CONSTRAINT \`utenti_ibfk_2\` FOREIGN KEY (\`id_ruolo\`) REFERENCES \`ruoli\` (\`id\`);
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  // Questo comando annullerà la migrazione eliminando tutte le tabelle.
  // Da usare con cautela.
  return knex.raw(`
    DROP TABLE IF EXISTS \`allegati_tracciati\`, \`anno_di_gestione\`, \`app_funzioni\`, \`attivita\`, \`clienti\`, \`conti\`, \`ditte\`, \`ditta_mail_accounts\`, \`emails_inviate\`, \`fatture_attive\`, \`fatture_passive\`, \`fornitori\`, \`funzioni\`, \`iva\`, \`log_attivita\`, \`moduli\`, \`piano_dei_conti\`, \`prima_nota\`, \`procedure_ppa\`, \`registrazioni_prima_nota\`, \`ruoli\`, \`ruolo_funzioni\`, \`rubrica_contatti\`, \`sottoconti\`, \`stati_lettura\`, \`tipi_pagamento\`, \`tipi_utente\`, \`utente_mail_accounts\`, \`utente_scorciatoie\`, \`utenti\`;
  `);
};
