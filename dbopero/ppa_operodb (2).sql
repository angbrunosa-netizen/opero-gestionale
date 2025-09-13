-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Set 13, 2025 alle 11:11
-- Versione del server: 10.4.32-MariaDB
-- Versione PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `operodb`
--

-- --------------------------------------------------------

--
-- Struttura della tabella `an_relazioni`
--

CREATE TABLE `an_relazioni` (
  `id` int(11) UNSIGNED NOT NULL,
  `id_ditta_origine` int(10) UNSIGNED NOT NULL,
  `id_ditta_correlata` int(10) UNSIGNED NOT NULL,
  `id_tipo_relazione` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `an_tipi_relazione`
--

CREATE TABLE `an_tipi_relazione` (
  `id` int(11) UNSIGNED NOT NULL,
  `descrizione` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `app_funzioni`
--

CREATE TABLE `app_funzioni` (
  `id` int(11) NOT NULL,
  `codice_modulo` int(11) NOT NULL,
  `funzione` varchar(100) NOT NULL,
  `sotto_funzione` varchar(100) NOT NULL,
  `descrizione` text DEFAULT NULL,
  `livello_richiesto` int(11) DEFAULT 50
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `app_ruoli`
--

CREATE TABLE `app_ruoli` (
  `id` int(11) NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `codice_modulo` int(11) NOT NULL,
  `descrizione` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `app_ruoli_funzioni`
--

CREATE TABLE `app_ruoli_funzioni` (
  `id_ruolo` int(11) NOT NULL,
  `id_funzione` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `ditta_mail_accounts`
--

CREATE TABLE `ditta_mail_accounts` (
  `id` int(11) NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `id_utente_creazione` int(11) DEFAULT NULL,
  `nome_account` varchar(255) NOT NULL,
  `email_address` varchar(255) NOT NULL,
  `imap_host` varchar(255) NOT NULL,
  `imap_port` int(11) NOT NULL DEFAULT 993,
  `smtp_host` varchar(255) NOT NULL,
  `smtp_port` int(11) NOT NULL DEFAULT 465,
  `auth_user` varchar(255) NOT NULL,
  `auth_pass` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `ditte`
--

CREATE TABLE `ditte` (
  `id` int(10) UNSIGNED NOT NULL,
  `ragione_sociale` varchar(255) NOT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `indirizzo` varchar(255) DEFAULT NULL,
  `citta` varchar(100) DEFAULT NULL,
  `provincia` varchar(50) DEFAULT NULL,
  `cap` varchar(5) DEFAULT NULL,
  `tel1` varchar(30) DEFAULT NULL,
  `tel2` varchar(30) DEFAULT NULL,
  `mail_1` varchar(255) DEFAULT NULL,
  `mail_2` varchar(255) DEFAULT NULL,
  `pec` varchar(255) DEFAULT NULL,
  `sdi` varchar(7) DEFAULT NULL,
  `p_iva` varchar(11) DEFAULT NULL,
  `codice_fiscale` varchar(16) DEFAULT NULL,
  `stato` int(1) DEFAULT 1,
  `id_tipo_ditta` int(11) DEFAULT NULL,
  `moduli_associati` text DEFAULT NULL,
  `codice_relazione` char(1) NOT NULL DEFAULT 'N',
  `id_sottoconto_cliente` int(11) DEFAULT NULL,
  `id_sottoconto_fornitore` int(11) DEFAULT NULL,
  `id_sottoconto_puntovendita` int(11) DEFAULT NULL,
  `id_ditta_proprietaria` int(11) DEFAULT NULL,
  `id_sottoconto_collegato` int(11) DEFAULT NULL COMMENT 'ID del sottoconto collegato (da tabella sottoconti)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `ditte_moduli`
--

CREATE TABLE `ditte_moduli` (
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `codice_modulo` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `email_inviate`
--

CREATE TABLE `email_inviate` (
  `id` int(11) NOT NULL,
  `id_utente_mittente` int(11) NOT NULL,
  `destinatari` text NOT NULL,
  `cc` text DEFAULT NULL,
  `bcc` text DEFAULT NULL,
  `oggetto` varchar(255) DEFAULT NULL,
  `corpo` longtext DEFAULT NULL,
  `data_invio` timestamp NOT NULL DEFAULT current_timestamp(),
  `aperta` tinyint(1) DEFAULT 0,
  `data_prima_apertura` timestamp NULL DEFAULT NULL,
  `tracking_id` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `email_nascoste`
--

CREATE TABLE `email_nascoste` (
  `id_utente` int(11) NOT NULL,
  `email_uid` int(11) NOT NULL,
  `data_cancellazione` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `funzioni`
--

CREATE TABLE `funzioni` (
  `id` int(11) NOT NULL,
  `codice` varchar(100) NOT NULL,
  `descrizione` varchar(255) DEFAULT NULL,
  `Scorciatoia` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Indica se la funzione può essere usata come scorciatoia',
  `chiave_componente_modulo` varchar(50) DEFAULT NULL COMMENT 'La chiave del componente React del modulo a cui appartiene'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `knex_migrations`
--

CREATE TABLE `knex_migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `batch` int(11) DEFAULT NULL,
  `migration_time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `knex_migrations_lock`
--

CREATE TABLE `knex_migrations_lock` (
  `index` int(10) UNSIGNED NOT NULL,
  `is_locked` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `lista_distribuzione_ditte`
--

CREATE TABLE `lista_distribuzione_ditte` (
  `id_lista` int(11) NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `lista_distribuzione_utenti`
--

CREATE TABLE `lista_distribuzione_utenti` (
  `id_lista` int(11) NOT NULL,
  `id_utente` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `liste_distribuzione`
--

CREATE TABLE `liste_distribuzione` (
  `id` int(11) NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `nome_lista` varchar(255) NOT NULL,
  `descrizione` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `log_accessi`
--

CREATE TABLE `log_accessi` (
  `id` bigint(20) NOT NULL,
  `id_utente` int(11) NOT NULL,
  `indirizzo_ip` varchar(45) DEFAULT NULL,
  `data_ora_accesso` timestamp NOT NULL DEFAULT current_timestamp(),
  `id_funzione_accessibile` int(11) DEFAULT NULL,
  `dettagli_azione` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `log_azioni`
--

CREATE TABLE `log_azioni` (
  `id` bigint(20) NOT NULL,
  `id_utente` int(11) NOT NULL,
  `id_ditta` int(11) NOT NULL,
  `azione` varchar(255) NOT NULL,
  `dettagli` text DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `moduli`
--

CREATE TABLE `moduli` (
  `codice` int(11) NOT NULL,
  `descrizione` varchar(255) NOT NULL,
  `chiave_componente` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `ppa_azioni`
--

CREATE TABLE `ppa_azioni` (
  `ID` int(11) NOT NULL,
  `ID_Processo` int(11) NOT NULL,
  `NomeAzione` varchar(255) NOT NULL,
  `Descrizione` text DEFAULT NULL,
  `ID_RuoloDefault` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `ppa_istanzeazioni`
--

CREATE TABLE `ppa_istanzeazioni` (
  `ID` int(11) NOT NULL,
  `ID_IstanzaProcedura` int(11) NOT NULL,
  `ID_Azione` int(11) NOT NULL COMMENT 'Riferimento al modello dell''azione',
  `ID_UtenteAssegnato` int(11) NOT NULL,
  `ID_Stato` int(11) DEFAULT NULL,
  `DataScadenza` date DEFAULT NULL,
  `DataCompletamento` datetime DEFAULT NULL,
  `NoteSvolgimento` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `ppa_istanzeprocedure`
--

CREATE TABLE `ppa_istanzeprocedure` (
  `ID` int(11) NOT NULL,
  `ID_ProceduraDitta` int(11) NOT NULL,
  `ID_DittaTarget` int(11) NOT NULL COMMENT 'La ditta (cliente/fornitore) a cui si applica la procedura',
  `ID_UtenteCreatore` int(11) NOT NULL COMMENT 'L''utente che ha avviato la procedura',
  `DataInizio` datetime NOT NULL DEFAULT current_timestamp(),
  `DataPrevistaFine` date DEFAULT NULL,
  `DataConclusioneEffettiva` datetime DEFAULT NULL,
  `Stato` enum('In Corso','Completata','Annullata') NOT NULL DEFAULT 'In Corso',
  `Esito` text DEFAULT NULL COMMENT 'Note conclusive sulla procedura'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `ppa_procedureditta`
--

CREATE TABLE `ppa_procedureditta` (
  `ID` int(11) NOT NULL,
  `ID_Ditta` int(11) NOT NULL,
  `ID_ProceduraStandard` int(11) NOT NULL,
  `NomePersonalizzato` varchar(255) NOT NULL,
  `Attiva` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `ppa_procedurestandard`
--

CREATE TABLE `ppa_procedurestandard` (
  `ID` int(11) NOT NULL,
  `CodiceProcedura` varchar(100) NOT NULL,
  `Descrizione` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `ppa_processi`
--

CREATE TABLE `ppa_processi` (
  `ID` int(11) NOT NULL,
  `ID_ProceduraDitta` int(11) NOT NULL,
  `NomeProcesso` varchar(255) NOT NULL,
  `OrdineSequenziale` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `ppa_stati_azione`
--

CREATE TABLE `ppa_stati_azione` (
  `ID` int(11) NOT NULL,
  `id_ditta` int(11) DEFAULT NULL,
  `NomeStato` varchar(100) NOT NULL,
  `Descrizione` text DEFAULT NULL,
  `Colore` varchar(7) DEFAULT '#CCCCCC'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `ppa_team`
--

CREATE TABLE `ppa_team` (
  `ID` int(11) NOT NULL,
  `ID_IstanzaProcedura` int(11) NOT NULL,
  `NomeTeam` varchar(255) NOT NULL,
  `DataCreazione` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `ppa_teammembri`
--

CREATE TABLE `ppa_teammembri` (
  `ID_Team` int(11) NOT NULL,
  `ID_Utente` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `privacy_policies`
--

CREATE TABLE `privacy_policies` (
  `id` int(11) NOT NULL,
  `id_ditta` int(11) NOT NULL,
  `responsabile_trattamento` varchar(255) NOT NULL,
  `corpo_lettera` text NOT NULL,
  `data_aggiornamento` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `registration_tokens`
--

CREATE TABLE `registration_tokens` (
  `id` int(11) NOT NULL,
  `id_ditta` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `email_destinatario` varchar(255) DEFAULT NULL,
  `scadenza` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `utilizzato` tinyint(1) DEFAULT 0,
  `data_creazione` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `relazioni_ditta`
--

CREATE TABLE `relazioni_ditta` (
  `codice` char(1) NOT NULL,
  `descrizione` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `ruoli`
--

CREATE TABLE `ruoli` (
  `id` int(11) NOT NULL,
  `tipo` varchar(100) NOT NULL,
  `livello` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `ruoli_funzioni`
--

CREATE TABLE `ruoli_funzioni` (
  `id_ruolo` int(11) NOT NULL,
  `id_funzione` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `sc_funzioni_collegate`
--

CREATE TABLE `sc_funzioni_collegate` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_funzione_primaria` int(10) UNSIGNED NOT NULL,
  `id_funzione_secondaria` int(10) UNSIGNED NOT NULL,
  `ordine_esecuzione` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `sc_funzioni_collegate_mapping`
--

CREATE TABLE `sc_funzioni_collegate_mapping` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_funzione_collegata` int(10) UNSIGNED NOT NULL,
  `parametro_origine` varchar(50) NOT NULL,
  `tabella_destinazione` varchar(50) NOT NULL,
  `colonna_destinazione` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `sc_funzioni_contabili`
--

CREATE TABLE `sc_funzioni_contabili` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(11) NOT NULL,
  `codice_funzione` varchar(20) NOT NULL,
  `nome_funzione` varchar(100) NOT NULL,
  `descrizione` text DEFAULT NULL,
  `categoria` varchar(50) DEFAULT NULL,
  `tipo_funzione` enum('Primaria','Secondaria','Sistemistica','Finanziaria') NOT NULL DEFAULT 'Primaria' COMMENT 'Classificazione univoca della funzione contabile.',
  `attiva` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `sc_funzioni_contabili_righe`
--

CREATE TABLE `sc_funzioni_contabili_righe` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_funzione_contabile` int(10) UNSIGNED NOT NULL,
  `id_conto` int(11) NOT NULL,
  `tipo_movimento` enum('D','A') NOT NULL,
  `descrizione_riga_predefinita` varchar(255) DEFAULT NULL,
  `is_sottoconto_modificabile` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `sc_movimenti_iva`
--

CREATE TABLE `sc_movimenti_iva` (
  `id` int(10) UNSIGNED NOT NULL,
  `tipo_registro` enum('VENDITE','ACQUISTI') NOT NULL,
  `imponibile` decimal(15,2) NOT NULL,
  `aliquota` decimal(5,2) NOT NULL,
  `imposta` decimal(15,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `sc_partite_aperte`
--

CREATE TABLE `sc_partite_aperte` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta_anagrafica` int(11) NOT NULL,
  `data_scadenza` date NOT NULL,
  `importo` decimal(15,2) NOT NULL,
  `stato` enum('APERTA','CHIUSA','INSOLUTA') DEFAULT 'APERTA',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `data_registrazione` date NOT NULL,
  `id_registrazione_testata` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `sc_piano_dei_conti`
--

CREATE TABLE `sc_piano_dei_conti` (
  `id` int(11) NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `codice` varchar(20) NOT NULL,
  `descrizione` varchar(255) NOT NULL,
  `id_padre` int(11) DEFAULT NULL,
  `tipo` enum('Mastro','Conto','Sottoconto') NOT NULL,
  `natura` enum('Attività','Passività','Costo','Ricavo','Patrimonio Netto') NOT NULL,
  `bloccato` tinyint(1) DEFAULT 0,
  `data_creazione` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `sc_registrazioni_righe`
--

CREATE TABLE `sc_registrazioni_righe` (
  `id` int(11) NOT NULL,
  `id_testata` int(11) NOT NULL,
  `id_conto` int(11) NOT NULL,
  `descrizione_riga` varchar(255) DEFAULT NULL,
  `importo_dare` decimal(15,2) DEFAULT 0.00,
  `importo_avere` decimal(15,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `sc_registrazioni_testata`
--

CREATE TABLE `sc_registrazioni_testata` (
  `id` int(11) NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `id_utente` int(11) NOT NULL,
  `data_registrazione` date NOT NULL,
  `descrizione_testata` varchar(255) NOT NULL,
  `stato` enum('Provvisorio','Confermato','Annullato') DEFAULT 'Provvisorio',
  `data_creazione` timestamp NOT NULL DEFAULT current_timestamp(),
  `data_ultima_modifica` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `sc_registri_iva`
--

CREATE TABLE `sc_registri_iva` (
  `id` int(11) NOT NULL,
  `id_riga_registrazione` int(11) NOT NULL,
  `tipo_registro` enum('Acquisti','Vendite','Corrispettivi') NOT NULL,
  `data_documento` date NOT NULL,
  `numero_documento` varchar(50) NOT NULL,
  `id_anagrafica` int(11) DEFAULT NULL,
  `imponibile` decimal(15,2) NOT NULL,
  `aliquota_iva` decimal(5,2) NOT NULL,
  `importo_iva` decimal(15,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `tipi_pagamento`
--

CREATE TABLE `tipi_pagamento` (
  `id` int(11) NOT NULL,
  `id_ditta` int(11) NOT NULL,
  `codice` varchar(50) NOT NULL,
  `descrizione` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `tipi_utente`
--

CREATE TABLE `tipi_utente` (
  `Codice` int(11) NOT NULL,
  `Descrizione` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `tipo_ditta`
--

CREATE TABLE `tipo_ditta` (
  `id` int(11) NOT NULL,
  `tipo` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `utente_scorciatoie`
--

CREATE TABLE `utente_scorciatoie` (
  `id_utente` int(11) NOT NULL,
  `id_funzione` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `utenti`
--

CREATE TABLE `utenti` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `mail_contatto` varchar(255) DEFAULT NULL,
  `mail_collaboratore` varchar(255) DEFAULT NULL,
  `mail_pec` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `nome` varchar(100) DEFAULT NULL,
  `cognome` varchar(100) DEFAULT NULL,
  `codice_fiscale` varchar(16) DEFAULT NULL,
  `telefono` varchar(30) DEFAULT NULL,
  `indirizzo` varchar(255) DEFAULT NULL,
  `citta` varchar(100) DEFAULT NULL,
  `provincia` varchar(50) DEFAULT NULL,
  `cap` varchar(10) DEFAULT NULL,
  `id_ditta` int(10) UNSIGNED DEFAULT NULL,
  `id_ruolo` int(11) DEFAULT NULL,
  `attivo` tinyint(1) DEFAULT 1,
  `data_creazione` timestamp NOT NULL DEFAULT current_timestamp(),
  `data_ultimo_accesso` timestamp NULL DEFAULT NULL,
  `note` text DEFAULT NULL,
  `firma` text DEFAULT NULL,
  `privacy` tinyint(1) DEFAULT 0,
  `funzioni_attive` text DEFAULT NULL,
  `livello` int(11) DEFAULT 50,
  `Codice_Tipo_Utente` int(11) DEFAULT NULL,
  `verification_token` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `an_relazioni`
--
ALTER TABLE `an_relazioni`
  ADD PRIMARY KEY (`id`);

--
-- Indici per le tabelle `an_tipi_relazione`
--
ALTER TABLE `an_tipi_relazione`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `an_tipi_relazione_descrizione_unique` (`descrizione`);

--
-- Indici per le tabelle `app_funzioni`
--
ALTER TABLE `app_funzioni`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codice_modulo` (`codice_modulo`,`funzione`,`sotto_funzione`);

--
-- Indici per le tabelle `app_ruoli`
--
ALTER TABLE `app_ruoli`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id_ditta` (`id_ditta`,`codice_modulo`,`descrizione`),
  ADD KEY `codice_modulo` (`codice_modulo`);

--
-- Indici per le tabelle `app_ruoli_funzioni`
--
ALTER TABLE `app_ruoli_funzioni`
  ADD PRIMARY KEY (`id_ruolo`,`id_funzione`),
  ADD KEY `id_funzione` (`id_funzione`);

--
-- Indici per le tabelle `ditta_mail_accounts`
--
ALTER TABLE `ditta_mail_accounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id_ditta` (`id_ditta`,`email_address`);

--
-- Indici per le tabelle `ditte`
--
ALTER TABLE `ditte`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `pec` (`pec`),
  ADD KEY `id_tipo_ditta` (`id_tipo_ditta`),
  ADD KEY `fk_ditte_relazioni` (`codice_relazione`),
  ADD KEY `fk_ditte_sottoconto_cliente` (`id_sottoconto_cliente`),
  ADD KEY `fk_ditte_sottoconto_fornitore` (`id_sottoconto_fornitore`),
  ADD KEY `fk_ditte_sottoconto_puntovendita` (`id_sottoconto_puntovendita`);

--
-- Indici per le tabelle `ditte_moduli`
--
ALTER TABLE `ditte_moduli`
  ADD PRIMARY KEY (`id_ditta`,`codice_modulo`),
  ADD KEY `codice_modulo` (`codice_modulo`);

--
-- Indici per le tabelle `email_inviate`
--
ALTER TABLE `email_inviate`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tracking_id` (`tracking_id`),
  ADD KEY `id_utente_mittente` (`id_utente_mittente`);

--
-- Indici per le tabelle `email_nascoste`
--
ALTER TABLE `email_nascoste`
  ADD PRIMARY KEY (`id_utente`,`email_uid`);

--
-- Indici per le tabelle `funzioni`
--
ALTER TABLE `funzioni`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codice` (`codice`),
  ADD KEY `fk_funzioni_moduli` (`chiave_componente_modulo`);

--
-- Indici per le tabelle `knex_migrations`
--
ALTER TABLE `knex_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indici per le tabelle `knex_migrations_lock`
--
ALTER TABLE `knex_migrations_lock`
  ADD PRIMARY KEY (`index`);

--
-- Indici per le tabelle `lista_distribuzione_ditte`
--
ALTER TABLE `lista_distribuzione_ditte`
  ADD PRIMARY KEY (`id_lista`,`id_ditta`),
  ADD KEY `id_ditta` (`id_ditta`);

--
-- Indici per le tabelle `lista_distribuzione_utenti`
--
ALTER TABLE `lista_distribuzione_utenti`
  ADD PRIMARY KEY (`id_lista`,`id_utente`),
  ADD KEY `ldu_ibfk_2` (`id_utente`);

--
-- Indici per le tabelle `liste_distribuzione`
--
ALTER TABLE `liste_distribuzione`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_ditta` (`id_ditta`);

--
-- Indici per le tabelle `log_accessi`
--
ALTER TABLE `log_accessi`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_utente` (`id_utente`),
  ADD KEY `id_funzione_accessibile` (`id_funzione_accessibile`);

--
-- Indici per le tabelle `log_azioni`
--
ALTER TABLE `log_azioni`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_utente` (`id_utente`),
  ADD KEY `id_ditta` (`id_ditta`);

--
-- Indici per le tabelle `moduli`
--
ALTER TABLE `moduli`
  ADD PRIMARY KEY (`codice`),
  ADD UNIQUE KEY `chiave_componente_unique` (`chiave_componente`);

--
-- Indici per le tabelle `ppa_azioni`
--
ALTER TABLE `ppa_azioni`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `ID_Processo` (`ID_Processo`),
  ADD KEY `ID_RuoloDefault` (`ID_RuoloDefault`);

--
-- Indici per le tabelle `ppa_istanzeazioni`
--
ALTER TABLE `ppa_istanzeazioni`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `ID_IstanzaProcedura` (`ID_IstanzaProcedura`),
  ADD KEY `ID_Azione` (`ID_Azione`),
  ADD KEY `ID_UtenteAssegnato` (`ID_UtenteAssegnato`),
  ADD KEY `ID_Stato` (`ID_Stato`);

--
-- Indici per le tabelle `ppa_istanzeprocedure`
--
ALTER TABLE `ppa_istanzeprocedure`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `ID_ProceduraDitta` (`ID_ProceduraDitta`),
  ADD KEY `ID_DittaTarget` (`ID_DittaTarget`),
  ADD KEY `ID_UtenteCreatore` (`ID_UtenteCreatore`);

--
-- Indici per le tabelle `ppa_procedureditta`
--
ALTER TABLE `ppa_procedureditta`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `ID_Ditta` (`ID_Ditta`),
  ADD KEY `ID_ProceduraStandard` (`ID_ProceduraStandard`);

--
-- Indici per le tabelle `ppa_procedurestandard`
--
ALTER TABLE `ppa_procedurestandard`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `CodiceProcedura_unique` (`CodiceProcedura`);

--
-- Indici per le tabelle `ppa_processi`
--
ALTER TABLE `ppa_processi`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `ID_ProceduraDitta` (`ID_ProceduraDitta`);

--
-- Indici per le tabelle `ppa_stati_azione`
--
ALTER TABLE `ppa_stati_azione`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `id_ditta` (`id_ditta`);

--
-- Indici per le tabelle `ppa_team`
--
ALTER TABLE `ppa_team`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `ID_IstanzaProcedura` (`ID_IstanzaProcedura`);

--
-- Indici per le tabelle `ppa_teammembri`
--
ALTER TABLE `ppa_teammembri`
  ADD PRIMARY KEY (`ID_Team`,`ID_Utente`),
  ADD KEY `ID_Utente` (`ID_Utente`);

--
-- Indici per le tabelle `privacy_policies`
--
ALTER TABLE `privacy_policies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id_ditta` (`id_ditta`);

--
-- Indici per le tabelle `registration_tokens`
--
ALTER TABLE `registration_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `id_ditta` (`id_ditta`);

--
-- Indici per le tabelle `relazioni_ditta`
--
ALTER TABLE `relazioni_ditta`
  ADD PRIMARY KEY (`codice`);

--
-- Indici per le tabelle `ruoli`
--
ALTER TABLE `ruoli`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tipo` (`tipo`);

--
-- Indici per le tabelle `ruoli_funzioni`
--
ALTER TABLE `ruoli_funzioni`
  ADD PRIMARY KEY (`id_ruolo`,`id_funzione`),
  ADD KEY `id_funzione` (`id_funzione`);

--
-- Indici per le tabelle `sc_funzioni_collegate`
--
ALTER TABLE `sc_funzioni_collegate`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_funzioni_collegate` (`id_funzione_primaria`,`id_funzione_secondaria`),
  ADD KEY `sc_funzioni_collegate_id_funzione_secondaria_foreign` (`id_funzione_secondaria`);

--
-- Indici per le tabelle `sc_funzioni_collegate_mapping`
--
ALTER TABLE `sc_funzioni_collegate_mapping`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_mapping_funz_coll` (`id_funzione_collegata`);

--
-- Indici per le tabelle `sc_funzioni_contabili`
--
ALTER TABLE `sc_funzioni_contabili`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sc_funzioni_contabili_id_ditta_codice_funzione_unique` (`id_ditta`,`codice_funzione`);

--
-- Indici per le tabelle `sc_funzioni_contabili_righe`
--
ALTER TABLE `sc_funzioni_contabili_righe`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sc_funzioni_contabili_righe_id_funzione_contabile_foreign` (`id_funzione_contabile`);

--
-- Indici per le tabelle `sc_movimenti_iva`
--
ALTER TABLE `sc_movimenti_iva`
  ADD PRIMARY KEY (`id`);

--
-- Indici per le tabelle `sc_partite_aperte`
--
ALTER TABLE `sc_partite_aperte`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sc_partite_aperte_id_ditta_anagrafica_foreign` (`id_ditta_anagrafica`);

--
-- Indici per le tabelle `sc_piano_dei_conti`
--
ALTER TABLE `sc_piano_dei_conti`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_ditta_codice` (`id_ditta`,`codice`),
  ADD KEY `id_padre` (`id_padre`);

--
-- Indici per le tabelle `sc_registrazioni_righe`
--
ALTER TABLE `sc_registrazioni_righe`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_testata` (`id_testata`),
  ADD KEY `id_conto` (`id_conto`);

--
-- Indici per le tabelle `sc_registrazioni_testata`
--
ALTER TABLE `sc_registrazioni_testata`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_ditta` (`id_ditta`),
  ADD KEY `id_utente` (`id_utente`);

--
-- Indici per le tabelle `sc_registri_iva`
--
ALTER TABLE `sc_registri_iva`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_riga_registrazione` (`id_riga_registrazione`),
  ADD KEY `id_anagrafica` (`id_anagrafica`);

--
-- Indici per le tabelle `tipi_pagamento`
--
ALTER TABLE `tipi_pagamento`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id_ditta` (`id_ditta`,`codice`);

--
-- Indici per le tabelle `tipi_utente`
--
ALTER TABLE `tipi_utente`
  ADD PRIMARY KEY (`Codice`);

--
-- Indici per le tabelle `tipo_ditta`
--
ALTER TABLE `tipo_ditta`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tipo` (`tipo`);

--
-- Indici per le tabelle `utente_scorciatoie`
--
ALTER TABLE `utente_scorciatoie`
  ADD PRIMARY KEY (`id_utente`,`id_funzione`),
  ADD KEY `id_funzione` (`id_funzione`);

--
-- Indici per le tabelle `utenti`
--
ALTER TABLE `utenti`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `codice_fiscale` (`codice_fiscale`),
  ADD UNIQUE KEY `verification_token` (`verification_token`),
  ADD KEY `id_ditta` (`id_ditta`),
  ADD KEY `id_ruolo` (`id_ruolo`),
  ADD KEY `fk_utente_tipo` (`Codice_Tipo_Utente`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `an_relazioni`
--
ALTER TABLE `an_relazioni`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `an_tipi_relazione`
--
ALTER TABLE `an_tipi_relazione`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `app_funzioni`
--
ALTER TABLE `app_funzioni`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `app_ruoli`
--
ALTER TABLE `app_ruoli`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `ditta_mail_accounts`
--
ALTER TABLE `ditta_mail_accounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `ditte`
--
ALTER TABLE `ditte`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `email_inviate`
--
ALTER TABLE `email_inviate`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `funzioni`
--
ALTER TABLE `funzioni`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `knex_migrations`
--
ALTER TABLE `knex_migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `knex_migrations_lock`
--
ALTER TABLE `knex_migrations_lock`
  MODIFY `index` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `liste_distribuzione`
--
ALTER TABLE `liste_distribuzione`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `log_accessi`
--
ALTER TABLE `log_accessi`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `log_azioni`
--
ALTER TABLE `log_azioni`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `moduli`
--
ALTER TABLE `moduli`
  MODIFY `codice` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `ppa_azioni`
--
ALTER TABLE `ppa_azioni`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `ppa_istanzeazioni`
--
ALTER TABLE `ppa_istanzeazioni`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `ppa_istanzeprocedure`
--
ALTER TABLE `ppa_istanzeprocedure`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `ppa_procedureditta`
--
ALTER TABLE `ppa_procedureditta`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `ppa_procedurestandard`
--
ALTER TABLE `ppa_procedurestandard`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `ppa_processi`
--
ALTER TABLE `ppa_processi`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `ppa_stati_azione`
--
ALTER TABLE `ppa_stati_azione`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `ppa_team`
--
ALTER TABLE `ppa_team`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `privacy_policies`
--
ALTER TABLE `privacy_policies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `registration_tokens`
--
ALTER TABLE `registration_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `ruoli`
--
ALTER TABLE `ruoli`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `sc_funzioni_collegate`
--
ALTER TABLE `sc_funzioni_collegate`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `sc_funzioni_collegate_mapping`
--
ALTER TABLE `sc_funzioni_collegate_mapping`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `sc_funzioni_contabili`
--
ALTER TABLE `sc_funzioni_contabili`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `sc_funzioni_contabili_righe`
--
ALTER TABLE `sc_funzioni_contabili_righe`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `sc_movimenti_iva`
--
ALTER TABLE `sc_movimenti_iva`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `sc_partite_aperte`
--
ALTER TABLE `sc_partite_aperte`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `sc_piano_dei_conti`
--
ALTER TABLE `sc_piano_dei_conti`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `sc_registrazioni_righe`
--
ALTER TABLE `sc_registrazioni_righe`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `sc_registrazioni_testata`
--
ALTER TABLE `sc_registrazioni_testata`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `sc_registri_iva`
--
ALTER TABLE `sc_registri_iva`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `tipi_pagamento`
--
ALTER TABLE `tipi_pagamento`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `tipi_utente`
--
ALTER TABLE `tipi_utente`
  MODIFY `Codice` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `tipo_ditta`
--
ALTER TABLE `tipo_ditta`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `utenti`
--
ALTER TABLE `utenti`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `app_funzioni`
--
ALTER TABLE `app_funzioni`
  ADD CONSTRAINT `app_funzioni_ibfk_1` FOREIGN KEY (`codice_modulo`) REFERENCES `moduli` (`codice`);

--
-- Limiti per la tabella `app_ruoli`
--
ALTER TABLE `app_ruoli`
  ADD CONSTRAINT `app_ruoli_ibfk_2` FOREIGN KEY (`codice_modulo`) REFERENCES `moduli` (`codice`);

--
-- Limiti per la tabella `app_ruoli_funzioni`
--
ALTER TABLE `app_ruoli_funzioni`
  ADD CONSTRAINT `app_ruoli_funzioni_ibfk_1` FOREIGN KEY (`id_ruolo`) REFERENCES `app_ruoli` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `app_ruoli_funzioni_ibfk_2` FOREIGN KEY (`id_funzione`) REFERENCES `app_funzioni` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `ditte`
--
ALTER TABLE `ditte`
  ADD CONSTRAINT `ditte_ibfk_1` FOREIGN KEY (`id_tipo_ditta`) REFERENCES `tipo_ditta` (`id`),
  ADD CONSTRAINT `fk_ditte_relazioni` FOREIGN KEY (`codice_relazione`) REFERENCES `relazioni_ditta` (`codice`),
  ADD CONSTRAINT `fk_ditte_sottoconto_cliente` FOREIGN KEY (`id_sottoconto_cliente`) REFERENCES `sc_piano_dei_conti` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_ditte_sottoconto_fornitore` FOREIGN KEY (`id_sottoconto_fornitore`) REFERENCES `sc_piano_dei_conti` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_ditte_sottoconto_puntovendita` FOREIGN KEY (`id_sottoconto_puntovendita`) REFERENCES `sc_piano_dei_conti` (`id`) ON DELETE SET NULL;

--
-- Limiti per la tabella `ditte_moduli`
--
ALTER TABLE `ditte_moduli`
  ADD CONSTRAINT `ditte_moduli_ibfk_2` FOREIGN KEY (`codice_modulo`) REFERENCES `moduli` (`codice`) ON DELETE CASCADE;

--
-- Limiti per la tabella `email_inviate`
--
ALTER TABLE `email_inviate`
  ADD CONSTRAINT `email_inviate_ibfk_1` FOREIGN KEY (`id_utente_mittente`) REFERENCES `utenti` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `email_nascoste`
--
ALTER TABLE `email_nascoste`
  ADD CONSTRAINT `email_nascoste_ibfk_1` FOREIGN KEY (`id_utente`) REFERENCES `utenti` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `funzioni`
--
ALTER TABLE `funzioni`
  ADD CONSTRAINT `fk_funzioni_moduli` FOREIGN KEY (`chiave_componente_modulo`) REFERENCES `moduli` (`chiave_componente`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Limiti per la tabella `lista_distribuzione_ditte`
--
ALTER TABLE `lista_distribuzione_ditte`
  ADD CONSTRAINT `lista_distribuzione_ditte_ibfk_1` FOREIGN KEY (`id_lista`) REFERENCES `liste_distribuzione` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `lista_distribuzione_utenti`
--
ALTER TABLE `lista_distribuzione_utenti`
  ADD CONSTRAINT `ldu_ibfk_1` FOREIGN KEY (`id_lista`) REFERENCES `liste_distribuzione` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ldu_ibfk_2` FOREIGN KEY (`id_utente`) REFERENCES `utenti` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `log_accessi`
--
ALTER TABLE `log_accessi`
  ADD CONSTRAINT `log_accessi_ibfk_1` FOREIGN KEY (`id_utente`) REFERENCES `utenti` (`id`),
  ADD CONSTRAINT `log_accessi_ibfk_2` FOREIGN KEY (`id_funzione_accessibile`) REFERENCES `funzioni` (`id`);

--
-- Limiti per la tabella `log_azioni`
--
ALTER TABLE `log_azioni`
  ADD CONSTRAINT `log_azioni_ibfk_1` FOREIGN KEY (`id_utente`) REFERENCES `utenti` (`id`);

--
-- Limiti per la tabella `ppa_azioni`
--
ALTER TABLE `ppa_azioni`
  ADD CONSTRAINT `ppa_azioni_ibfk_1` FOREIGN KEY (`ID_Processo`) REFERENCES `ppa_processi` (`ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `ppa_azioni_ibfk_2` FOREIGN KEY (`ID_RuoloDefault`) REFERENCES `ruoli` (`id`) ON DELETE SET NULL;

--
-- Limiti per la tabella `ppa_istanzeazioni`
--
ALTER TABLE `ppa_istanzeazioni`
  ADD CONSTRAINT `ppa_istanzeazioni_ibfk_1` FOREIGN KEY (`ID_IstanzaProcedura`) REFERENCES `ppa_istanzeprocedure` (`ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `ppa_istanzeazioni_ibfk_3` FOREIGN KEY (`ID_UtenteAssegnato`) REFERENCES `utenti` (`id`),
  ADD CONSTRAINT `ppa_istanzeazioni_ibfk_4` FOREIGN KEY (`ID_Stato`) REFERENCES `ppa_stati_azione` (`ID`);

--
-- Limiti per la tabella `ppa_istanzeprocedure`
--
ALTER TABLE `ppa_istanzeprocedure`
  ADD CONSTRAINT `ppa_istanzeprocedure_ibfk_3` FOREIGN KEY (`ID_UtenteCreatore`) REFERENCES `utenti` (`id`);

--
-- Limiti per la tabella `ppa_procedureditta`
--
ALTER TABLE `ppa_procedureditta`
  ADD CONSTRAINT `ppa_procedureditta_ibfk_2` FOREIGN KEY (`ID_ProceduraStandard`) REFERENCES `ppa_procedurestandard` (`ID`) ON DELETE CASCADE;

--
-- Limiti per la tabella `ppa_processi`
--
ALTER TABLE `ppa_processi`
  ADD CONSTRAINT `ppa_processi_ibfk_1` FOREIGN KEY (`ID_ProceduraDitta`) REFERENCES `ppa_procedureditta` (`ID`) ON DELETE CASCADE;

--
-- Limiti per la tabella `ppa_team`
--
ALTER TABLE `ppa_team`
  ADD CONSTRAINT `ppa_team_ibfk_1` FOREIGN KEY (`ID_IstanzaProcedura`) REFERENCES `ppa_istanzeprocedure` (`ID`) ON DELETE CASCADE;

--
-- Limiti per la tabella `ppa_teammembri`
--
ALTER TABLE `ppa_teammembri`
  ADD CONSTRAINT `ppa_teammembri_ibfk_1` FOREIGN KEY (`ID_Team`) REFERENCES `ppa_team` (`ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `ppa_teammembri_ibfk_2` FOREIGN KEY (`ID_Utente`) REFERENCES `utenti` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `ruoli_funzioni`
--
ALTER TABLE `ruoli_funzioni`
  ADD CONSTRAINT `ruoli_funzioni_ibfk_1` FOREIGN KEY (`id_ruolo`) REFERENCES `ruoli` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ruoli_funzioni_ibfk_2` FOREIGN KEY (`id_funzione`) REFERENCES `funzioni` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `sc_funzioni_collegate`
--
ALTER TABLE `sc_funzioni_collegate`
  ADD CONSTRAINT `sc_funzioni_collegate_id_funzione_primaria_foreign` FOREIGN KEY (`id_funzione_primaria`) REFERENCES `sc_funzioni_contabili` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sc_funzioni_collegate_id_funzione_secondaria_foreign` FOREIGN KEY (`id_funzione_secondaria`) REFERENCES `sc_funzioni_contabili` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `sc_funzioni_collegate_mapping`
--
ALTER TABLE `sc_funzioni_collegate_mapping`
  ADD CONSTRAINT `fk_mapping_funz_coll` FOREIGN KEY (`id_funzione_collegata`) REFERENCES `sc_funzioni_collegate` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `sc_funzioni_contabili_righe`
--
ALTER TABLE `sc_funzioni_contabili_righe`
  ADD CONSTRAINT `sc_funzioni_contabili_righe_id_funzione_contabile_foreign` FOREIGN KEY (`id_funzione_contabile`) REFERENCES `sc_funzioni_contabili` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `sc_piano_dei_conti`
--
ALTER TABLE `sc_piano_dei_conti`
  ADD CONSTRAINT `sc_piano_dei_conti_ibfk_2` FOREIGN KEY (`id_padre`) REFERENCES `sc_piano_dei_conti` (`id`) ON DELETE SET NULL;

--
-- Limiti per la tabella `sc_registrazioni_righe`
--
ALTER TABLE `sc_registrazioni_righe`
  ADD CONSTRAINT `sc_registrazioni_righe_ibfk_1` FOREIGN KEY (`id_testata`) REFERENCES `sc_registrazioni_testata` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sc_registrazioni_righe_ibfk_2` FOREIGN KEY (`id_conto`) REFERENCES `sc_piano_dei_conti` (`id`);

--
-- Limiti per la tabella `sc_registrazioni_testata`
--
ALTER TABLE `sc_registrazioni_testata`
  ADD CONSTRAINT `sc_registrazioni_testata_ibfk_2` FOREIGN KEY (`id_utente`) REFERENCES `utenti` (`id`);

--
-- Limiti per la tabella `sc_registri_iva`
--
ALTER TABLE `sc_registri_iva`
  ADD CONSTRAINT `sc_registri_iva_ibfk_1` FOREIGN KEY (`id_riga_registrazione`) REFERENCES `sc_registrazioni_righe` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `utente_scorciatoie`
--
ALTER TABLE `utente_scorciatoie`
  ADD CONSTRAINT `utente_scorciatoie_ibfk_1` FOREIGN KEY (`id_utente`) REFERENCES `utenti` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `utente_scorciatoie_ibfk_2` FOREIGN KEY (`id_funzione`) REFERENCES `funzioni` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `utenti`
--
ALTER TABLE `utenti`
  ADD CONSTRAINT `fk_utente_tipo` FOREIGN KEY (`Codice_Tipo_Utente`) REFERENCES `tipi_utente` (`Codice`),
  ADD CONSTRAINT `utenti_ibfk_2` FOREIGN KEY (`id_ruolo`) REFERENCES `ruoli` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
