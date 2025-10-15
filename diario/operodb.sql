-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Ott 14, 2025 alle 12:35
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
-- Struttura della tabella `ac_condizioni_righe`
--

CREATE TABLE `ac_condizioni_righe` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_testata` int(10) UNSIGNED NOT NULL,
  `id_articolo` int(10) UNSIGNED NOT NULL,
  `prezzo_listino` decimal(10,4) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `ac_condizioni_testata`
--

CREATE TABLE `ac_condizioni_testata` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `id_fornitore` int(10) UNSIGNED NOT NULL,
  `descrizione` varchar(255) NOT NULL,
  `data_inizio_validita` date NOT NULL,
  `data_fine_validita` date DEFAULT NULL,
  `attiva` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `ac_sconti_dettaglio`
--

CREATE TABLE `ac_sconti_dettaglio` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_riga` int(10) UNSIGNED NOT NULL,
  `ordine_applicazione` int(11) NOT NULL,
  `tipo_sconto` enum('percentuale','importo') NOT NULL,
  `valore_sconto` decimal(10,4) NOT NULL,
  `tipo_esigibilita` enum('immediata','differita') NOT NULL,
  `note` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `allegati_tracciati`
--

CREATE TABLE `allegati_tracciati` (
  `id` int(11) NOT NULL,
  `id_email_inviata` int(11) NOT NULL,
  `nome_file_originale` varchar(255) NOT NULL,
  `percorso_file_salvato` varchar(255) NOT NULL,
  `tipo_file` varchar(100) DEFAULT NULL,
  `dimensione_file` int(11) DEFAULT NULL,
  `scaricato` tinyint(1) DEFAULT 0,
  `data_primo_download` timestamp NULL DEFAULT NULL,
  `download_id` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `an_progressivi`
--

CREATE TABLE `an_progressivi` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `codice_progressivo` varchar(50) NOT NULL,
  `descrizione` varchar(255) DEFAULT NULL,
  `serie` varchar(10) DEFAULT NULL,
  `ultimo_numero` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `data_ult` date DEFAULT NULL,
  `formato` varchar(100) DEFAULT NULL COMMENT 'Es. {ANNO}/{SERIE}/{NUMERO}'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
-- Struttura della tabella `an_servizi_aziendali_mail`
--

CREATE TABLE `an_servizi_aziendali_mail` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `nome_servizio` varchar(100) NOT NULL COMMENT 'Es: ''PPA_COMMUNICATION'', ''FATTURAZIONE''',
  `id_ditta_mail_account` int(11) NOT NULL,
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
-- Struttura della tabella `bs_attivita`
--

CREATE TABLE `bs_attivita` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_bene` int(10) UNSIGNED NOT NULL,
  `id_utente_utilizzatore` int(11) DEFAULT NULL,
  `data_inizio` datetime DEFAULT NULL,
  `data_fine` datetime DEFAULT NULL,
  `ore_utilizzo` decimal(10,2) DEFAULT NULL,
  `unita_prodotte` decimal(15,2) DEFAULT NULL,
  `valore_contatore` decimal(15,2) DEFAULT NULL,
  `descrizione_attivita` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `bs_beni`
--

CREATE TABLE `bs_beni` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `id_categoria` int(10) UNSIGNED NOT NULL,
  `codice_bene` varchar(100) NOT NULL,
  `descrizione` text DEFAULT NULL,
  `matricola` varchar(255) DEFAULT NULL,
  `url_foto` varchar(500) DEFAULT NULL,
  `data_acquisto` date DEFAULT NULL,
  `valore_acquisto` decimal(15,2) DEFAULT NULL,
  `id_sottoconto_costo` int(11) DEFAULT NULL,
  `id_sottoconto_cespite` int(11) DEFAULT NULL,
  `id_fornitore` int(10) UNSIGNED DEFAULT NULL,
  `riferimento_fattura` varchar(255) DEFAULT NULL,
  `stato` enum('In uso','In manutenzione','Dismesso','In magazzino') DEFAULT 'In magazzino',
  `ubicazione` varchar(255) DEFAULT NULL,
  `data_dismissione` date DEFAULT NULL,
  `valore_dismissione` decimal(15,2) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `bs_categorie`
--

CREATE TABLE `bs_categorie` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `codice` varchar(50) DEFAULT NULL,
  `descrizione` varchar(255) DEFAULT NULL,
  `aliquota_ammortamento` decimal(5,2) DEFAULT NULL,
  `id_sottoconto_costi` int(11) DEFAULT NULL,
  `id_sottoconto_ammortamenti` int(11) DEFAULT NULL,
  `id_sottoconto_fondo` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `bs_costi`
--

CREATE TABLE `bs_costi` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_bene` int(10) UNSIGNED NOT NULL,
  `data_costo` date DEFAULT NULL,
  `descrizione_costo` varchar(255) DEFAULT NULL,
  `importo` decimal(15,2) DEFAULT NULL,
  `id_sottoconto_contabile` int(11) DEFAULT NULL,
  `documento_riferimento` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `bs_manutenzioni`
--

CREATE TABLE `bs_manutenzioni` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_bene` int(10) UNSIGNED NOT NULL,
  `data_intervento` date DEFAULT NULL,
  `tipo_intervento` enum('Ordinaria','Straordinaria','Programmata') DEFAULT NULL,
  `descrizione_intervento` text DEFAULT NULL,
  `id_fornitore_manutenzione` int(10) UNSIGNED DEFAULT NULL,
  `costo_intervento` decimal(15,2) DEFAULT NULL,
  `id_sottoconto_contabile` int(11) DEFAULT NULL,
  `documento_riferimento` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `bs_scadenze`
--

CREATE TABLE `bs_scadenze` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_bene` int(10) UNSIGNED NOT NULL,
  `id_tipo_scadenza` int(10) UNSIGNED DEFAULT NULL,
  `descrizione` text DEFAULT NULL,
  `data_scadenza` date DEFAULT NULL,
  `giorni_preavviso` int(11) DEFAULT 7,
  `id_fornitore_associato` int(10) UNSIGNED DEFAULT NULL,
  `importo_previsto` decimal(15,2) DEFAULT NULL,
  `stato` enum('Pianificata','Completata','Annullata') DEFAULT 'Pianificata',
  `data_completamento` date DEFAULT NULL,
  `note` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `bs_tipi_scadenze`
--

CREATE TABLE `bs_tipi_scadenze` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `codice` varchar(50) NOT NULL,
  `descrizione` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `ct_catalogo`
--

CREATE TABLE `ct_catalogo` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `codice_entita` varchar(50) NOT NULL,
  `descrizione` varchar(255) NOT NULL,
  `id_categoria` int(10) UNSIGNED DEFAULT NULL,
  `tipo_entita` enum('bene','servizio','composito') NOT NULL,
  `id_unita_misura` int(10) UNSIGNED DEFAULT NULL,
  `id_aliquota_iva` int(10) UNSIGNED DEFAULT NULL,
  `costo_base` decimal(10,2) DEFAULT 0.00,
  `gestito_a_magazzino` tinyint(1) DEFAULT 0,
  `id_stato_entita` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `ct_catalogo_compositi`
--

CREATE TABLE `ct_catalogo_compositi` (
  `id_catalogo_padre` int(10) UNSIGNED NOT NULL,
  `id_catalogo_componente` int(10) UNSIGNED NOT NULL,
  `quantita_componente` decimal(10,3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `ct_catalogo_dati_beni`
--

CREATE TABLE `ct_catalogo_dati_beni` (
  `id_catalogo` int(10) UNSIGNED NOT NULL,
  `peso` decimal(10,3) DEFAULT NULL,
  `volume` decimal(10,3) DEFAULT NULL,
  `dimensioni` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `ct_catalogo_dati_servizi`
--

CREATE TABLE `ct_catalogo_dati_servizi` (
  `id_catalogo` int(10) UNSIGNED NOT NULL,
  `durata_stimata` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `ct_categorie`
--

CREATE TABLE `ct_categorie` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `nome_categoria` varchar(100) NOT NULL,
  `descrizione` text DEFAULT NULL,
  `codice_categoria` varchar(255) DEFAULT NULL,
  `progressivo` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `id_padre` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `ct_codici_fornitore`
--

CREATE TABLE `ct_codici_fornitore` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `id_catalogo` int(10) UNSIGNED NOT NULL,
  `id_anagrafica_fornitore` int(10) UNSIGNED DEFAULT NULL,
  `codice_articolo_fornitore` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `tipo_codice` enum('ST','OCC') NOT NULL DEFAULT 'OCC'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `ct_ean`
--

CREATE TABLE `ct_ean` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `id_catalogo` int(10) UNSIGNED NOT NULL,
  `codice_ean` varchar(13) NOT NULL,
  `tipo_ean` enum('PRODOTTO','CONFEZIONE') NOT NULL,
  `tipo_ean_prodotto` enum('PEZZO','PESO','PREZZO') DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `ct_listini`
--

CREATE TABLE `ct_listini` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `id_entita_catalogo` int(10) UNSIGNED NOT NULL,
  `nome_listino` varchar(255) NOT NULL,
  `data_inizio_validita` date NOT NULL,
  `data_fine_validita` date DEFAULT NULL,
  `ricarico_cessione_6` decimal(8,2) DEFAULT 0.00,
  `ricarico_cessione_5` decimal(8,2) DEFAULT 0.00,
  `ricarico_cessione_4` decimal(8,2) DEFAULT 0.00,
  `ricarico_cessione_3` decimal(8,2) DEFAULT 0.00,
  `ricarico_cessione_2` decimal(8,2) DEFAULT 0.00,
  `ricarico_cessione_1` decimal(8,2) DEFAULT 0.00,
  `prezzo_cessione_1` decimal(10,2) DEFAULT 0.00,
  `prezzo_pubblico_1` decimal(10,2) DEFAULT 0.00,
  `ricarico_pubblico_1` decimal(5,2) DEFAULT 0.00,
  `prezzo_cessione_2` decimal(10,2) DEFAULT 0.00,
  `prezzo_pubblico_2` decimal(10,2) DEFAULT 0.00,
  `ricarico_pubblico_2` decimal(5,2) DEFAULT 0.00,
  `prezzo_cessione_3` decimal(10,2) DEFAULT 0.00,
  `prezzo_pubblico_3` decimal(10,2) DEFAULT 0.00,
  `ricarico_pubblico_3` decimal(5,2) DEFAULT 0.00,
  `prezzo_cessione_4` decimal(10,2) DEFAULT 0.00,
  `prezzo_pubblico_4` decimal(10,2) DEFAULT 0.00,
  `ricarico_pubblico_4` decimal(5,2) DEFAULT 0.00,
  `prezzo_cessione_5` decimal(10,2) DEFAULT 0.00,
  `prezzo_pubblico_5` decimal(10,2) DEFAULT 0.00,
  `ricarico_pubblico_5` decimal(5,2) DEFAULT 0.00,
  `prezzo_cessione_6` decimal(10,2) DEFAULT 0.00,
  `prezzo_pubblico_6` decimal(10,2) DEFAULT 0.00,
  `ricarico_pubblico_6` decimal(5,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `ct_logistica`
--

CREATE TABLE `ct_logistica` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `id_catalogo` int(10) UNSIGNED NOT NULL,
  `peso_lordo_pz` decimal(10,3) DEFAULT 0.000,
  `volume_pz` decimal(10,6) DEFAULT 0.000000,
  `h_pz` decimal(10,2) DEFAULT 0.00,
  `l_pz` decimal(10,2) DEFAULT 0.00,
  `p_pz` decimal(10,2) DEFAULT 0.00,
  `s_im` int(11) DEFAULT 0,
  `pezzi_per_collo` int(11) DEFAULT 0,
  `colli_per_strato` int(11) DEFAULT 0,
  `strati_per_pallet` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `ct_stati_entita`
--

CREATE TABLE `ct_stati_entita` (
  `id` int(10) UNSIGNED NOT NULL,
  `codice` varchar(10) NOT NULL,
  `descrizione` varchar(100) NOT NULL,
  `visibilita` varchar(255) DEFAULT NULL COMMENT 'Indica contesti di visibilità specifici, es. ECOMMERCE, ADMIN',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `ct_unita_misura`
--

CREATE TABLE `ct_unita_misura` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `sigla_um` varchar(10) NOT NULL,
  `descrizione` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
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
  `id_ditta` int(10) UNSIGNED DEFAULT NULL,
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
-- Struttura della tabella `funzioni_ditte`
--

CREATE TABLE `funzioni_ditte` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_funzione` int(11) NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `iva_contabili`
--

CREATE TABLE `iva_contabili` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `codice` varchar(10) NOT NULL,
  `descrizione` varchar(100) NOT NULL,
  `aliquota` decimal(5,2) NOT NULL
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
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `azione` varchar(255) NOT NULL,
  `dettagli` text DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `mg_causali_movimento`
--

CREATE TABLE `mg_causali_movimento` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `codice` varchar(20) NOT NULL,
  `descrizione` varchar(100) NOT NULL,
  `tipo` enum('carico','scarico') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `mg_giacenze`
--

CREATE TABLE `mg_giacenze` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `id_magazzino` int(10) UNSIGNED NOT NULL,
  `id_catalogo` int(10) UNSIGNED NOT NULL,
  `giacenza_attuale` decimal(10,3) NOT NULL DEFAULT 0.000,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `mg_lotti`
--

CREATE TABLE `mg_lotti` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `id_catalogo` int(10) UNSIGNED NOT NULL,
  `codice_lotto` varchar(50) NOT NULL,
  `data_scadenza` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `mg_magazzini`
--

CREATE TABLE `mg_magazzini` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `codice` varchar(20) NOT NULL,
  `descrizione` varchar(100) NOT NULL,
  `note` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `mg_movimenti`
--

CREATE TABLE `mg_movimenti` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `id_magazzino` int(10) UNSIGNED NOT NULL,
  `id_catalogo` int(10) UNSIGNED NOT NULL,
  `id_causale` int(10) UNSIGNED NOT NULL,
  `id_utente` int(11) DEFAULT NULL,
  `data_movimento` timestamp NOT NULL DEFAULT current_timestamp(),
  `quantita` decimal(12,4) NOT NULL,
  `valore_unitario` decimal(12,4) DEFAULT NULL,
  `riferimento_doc` varchar(100) DEFAULT NULL,
  `id_riferimento_doc` int(10) UNSIGNED DEFAULT NULL,
  `note` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `mg_movimenti_lotti`
--

CREATE TABLE `mg_movimenti_lotti` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_movimento` int(10) UNSIGNED NOT NULL,
  `id_lotto` int(10) UNSIGNED NOT NULL,
  `quantita` decimal(12,4) NOT NULL
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
  `ID` int(10) UNSIGNED NOT NULL,
  `ID_Processo` int(10) UNSIGNED NOT NULL,
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
  `ID_Azione` int(10) UNSIGNED NOT NULL,
  `ID_UtenteAssegnato` int(11) NOT NULL,
  `ID_Stato` int(11) DEFAULT NULL,
  `DataScadenza` date DEFAULT NULL,
  `DataCompletamento` datetime DEFAULT NULL,
  `NoteSvolgimento` text DEFAULT NULL,
  `NoteParticolari` text DEFAULT NULL,
  `Note` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `ppa_istanzeprocedure`
--

CREATE TABLE `ppa_istanzeprocedure` (
  `ID` int(11) NOT NULL,
  `TargetEntityType` varchar(20) NOT NULL,
  `TargetEntityID` int(10) UNSIGNED NOT NULL,
  `ID_ProceduraDitta` int(10) UNSIGNED NOT NULL,
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
  `ID` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `ID_ProceduraStandard` int(10) UNSIGNED NOT NULL,
  `NomePersonalizzato` varchar(255) NOT NULL,
  `TargetEntityTypeAllowed` varchar(20) NOT NULL DEFAULT 'DITTA',
  `Attiva` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `ppa_procedurestandard`
--

CREATE TABLE `ppa_procedurestandard` (
  `ID` int(10) UNSIGNED NOT NULL,
  `CodiceProcedura` varchar(100) NOT NULL,
  `Descrizione` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `ppa_processi`
--

CREATE TABLE `ppa_processi` (
  `ID` int(10) UNSIGNED NOT NULL,
  `ID_ProceduraDitta` int(10) UNSIGNED NOT NULL,
  `NomeProcesso` varchar(255) NOT NULL,
  `OrdineSequenziale` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `ppa_stati_azione`
--

CREATE TABLE `ppa_stati_azione` (
  `ID` int(11) NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
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
-- Struttura della tabella `ppa_team_comunicazioni`
--

CREATE TABLE `ppa_team_comunicazioni` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_team` int(11) NOT NULL,
  `id_utente_mittente` int(11) NOT NULL,
  `messaggio` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `privacy_policies`
--

CREATE TABLE `privacy_policies` (
  `id` int(11) NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
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
  `id_ditta` int(10) UNSIGNED NOT NULL,
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
  `livello` int(11) NOT NULL,
  `id_ditta` int(10) UNSIGNED DEFAULT NULL
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
  `tipo_funzione` enum('Primaria','Secondaria','Finanziaria','Sistema') NOT NULL DEFAULT 'Primaria',
  `gestioni_abbinate` set('I','C','E') DEFAULT NULL,
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
  `is_conto_ricerca` tinyint(1) NOT NULL DEFAULT 0,
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
  `id_ditta_anagrafica` int(10) UNSIGNED NOT NULL,
  `data_scadenza` date NOT NULL,
  `importo` decimal(15,2) NOT NULL,
  `stato` enum('APERTA','CHIUSA','INSOLUTA') DEFAULT 'APERTA',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `data_registrazione` date NOT NULL,
  `id_registrazione_testata` int(11) NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `id_anagrafica` int(10) UNSIGNED DEFAULT NULL,
  `numero_documento` varchar(50) DEFAULT NULL,
  `data_documento` date DEFAULT NULL,
  `id_sottoconto` int(10) UNSIGNED DEFAULT NULL,
  `tipo_movimento` enum('Apertura_Credito','Apertura_Debito','Chiusura','Chiusura_Credito','Chiusura_Debito','Storno_Apertura_Credito','Storno_Apertura_Debito') NOT NULL
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
  `data_documento` date DEFAULT NULL,
  `numero_documento` varchar(50) DEFAULT NULL,
  `totale_documento` decimal(15,2) DEFAULT NULL,
  `id_ditte` int(10) UNSIGNED DEFAULT NULL,
  `numero_protocollo` int(10) UNSIGNED NOT NULL,
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
-- Struttura della tabella `stati_lettura`
--

CREATE TABLE `stati_lettura` (
  `id_utente` int(11) NOT NULL,
  `email_uid` int(11) NOT NULL,
  `data_lettura` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `tipi_pagamento`
--

CREATE TABLE `tipi_pagamento` (
  `id` int(11) NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `codice` varchar(50) NOT NULL,
  `descrizione` varchar(255) NOT NULL,
  `gg_dilazione` int(11) DEFAULT 0 COMMENT 'Giorni di dilazione del pagamento.'
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
-- Struttura della tabella `utente_mail_accounts`
--

CREATE TABLE `utente_mail_accounts` (
  `id_utente` int(11) NOT NULL,
  `id_mail_account` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
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

-- --------------------------------------------------------

--
-- Struttura della tabella `utenti_funzioni_override`
--

CREATE TABLE `utenti_funzioni_override` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_utente` int(11) NOT NULL COMMENT 'FK all''utente a cui si applica l''override.',
  `id_funzione` int(11) NOT NULL COMMENT 'FK alla funzione specifica oggetto dell''override.',
  `azione` enum('allow','deny') NOT NULL COMMENT 'Specifica se il permesso viene concesso (allow) o revocato (deny).',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `va_categorie_clienti`
--

CREATE TABLE `va_categorie_clienti` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `nome_categoria` varchar(100) NOT NULL,
  `descrizione` text DEFAULT NULL,
  `codice_categoria` varchar(50) DEFAULT NULL,
  `id_padre` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `va_clienti_anagrafica`
--

CREATE TABLE `va_clienti_anagrafica` (
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `listino_cessione` int(11) DEFAULT NULL COMMENT 'Indica quale colonna prezzo_cessione_X usare da ct_listini',
  `listino_pubblico` int(11) DEFAULT NULL COMMENT 'Indica quale colonna prezzo_pubblico_X usare da ct_listini',
  `id_categoria_cliente` int(10) UNSIGNED DEFAULT NULL,
  `id_gruppo_cliente` int(10) UNSIGNED DEFAULT NULL,
  `id_referente` int(10) UNSIGNED DEFAULT NULL,
  `id_referente_allert` int(10) UNSIGNED DEFAULT NULL,
  `id_referente_ppa` int(10) UNSIGNED DEFAULT NULL,
  `id_agente` int(10) UNSIGNED DEFAULT NULL,
  `giorno_di_consegna` enum('Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato','Domenica') DEFAULT NULL,
  `giro_consegna` varchar(100) DEFAULT NULL,
  `id_trasportatore_assegnato` int(10) UNSIGNED DEFAULT NULL,
  `metodo_di_consegna` varchar(255) DEFAULT NULL,
  `allestimento_logistico` text DEFAULT NULL,
  `tipo_fatturazione` enum('Immediata','Fine Mese','A Consegna') DEFAULT NULL,
  `id_tipo_pagamento` int(11) DEFAULT NULL,
  `stato` enum('Attivo','Sospeso','Bloccato') DEFAULT 'Attivo',
  `sito_web` varchar(255) DEFAULT NULL,
  `pagina_facebook` varchar(255) DEFAULT NULL,
  `pagina_instagram` varchar(255) DEFAULT NULL,
  `url_link` varchar(255) DEFAULT NULL COMMENT 'Link generico, es. per portali',
  `google_maps` text DEFAULT NULL,
  `concorrenti` text DEFAULT NULL,
  `foto_url` varchar(255) DEFAULT NULL,
  `fatturato_anno_pr` decimal(15,2) DEFAULT NULL COMMENT 'Fatturato anno precedente',
  `fatturato_anno_cr` decimal(15,2) DEFAULT NULL COMMENT 'Fatturato anno corrente',
  `id_contratto` int(10) UNSIGNED DEFAULT NULL,
  `id_punto_consegna_predefinito` int(10) UNSIGNED DEFAULT NULL,
  `id_matrice_sconti` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `va_gruppi_clienti`
--

CREATE TABLE `va_gruppi_clienti` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `codice` varchar(50) NOT NULL,
  `descrizione` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `va_matrice_sconti`
--

CREATE TABLE `va_matrice_sconti` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `codice` varchar(50) NOT NULL,
  `descrizione` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `va_punti_consegna`
--

CREATE TABLE `va_punti_consegna` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `id_cliente` int(10) UNSIGNED NOT NULL,
  `descrizione` varchar(255) NOT NULL,
  `indirizzo` varchar(255) DEFAULT NULL,
  `citta` varchar(255) DEFAULT NULL,
  `cap` varchar(10) DEFAULT NULL,
  `provincia` varchar(5) DEFAULT NULL,
  `referente` varchar(255) DEFAULT NULL,
  `telefono` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `va_tipi_documento`
--

CREATE TABLE `va_tipi_documento` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `codice_doc` varchar(255) NOT NULL,
  `nome_documento` varchar(255) NOT NULL,
  `tipo` enum('Documento Accompagnatorio','Documento Interno','Preventivo','Ordine') NOT NULL,
  `gen_mov` enum('S','N') NOT NULL COMMENT 'Indica se il documento genera movimenti di magazzino',
  `tipo_movimento` enum('Carico','Scarico') DEFAULT NULL COMMENT 'Tipo di movimento generato, se gen_mov = S',
  `ditta_rif` enum('Clienti','Fornitori','PuntoVendita') NOT NULL COMMENT 'A quale tipo di anagrafica si riferisce il documento',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `va_trasportatori`
--

CREATE TABLE `va_trasportatori` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta_proprietaria` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `id_utente_referente` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `ac_condizioni_righe`
--
ALTER TABLE `ac_condizioni_righe`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ac_condizioni_righe_id_articolo_foreign` (`id_articolo`),
  ADD KEY `ac_condizioni_righe_id_testata_id_articolo_index` (`id_testata`,`id_articolo`);

--
-- Indici per le tabelle `ac_condizioni_testata`
--
ALTER TABLE `ac_condizioni_testata`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ac_condizioni_testata_id_fornitore_foreign` (`id_fornitore`),
  ADD KEY `ac_condizioni_testata_id_ditta_id_fornitore_index` (`id_ditta`,`id_fornitore`);

--
-- Indici per le tabelle `ac_sconti_dettaglio`
--
ALTER TABLE `ac_sconti_dettaglio`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ac_sconti_dettaglio_id_riga_index` (`id_riga`);

--
-- Indici per le tabelle `allegati_tracciati`
--
ALTER TABLE `allegati_tracciati`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `download_id` (`download_id`),
  ADD KEY `id_email_inviata` (`id_email_inviata`),
  ADD KEY `id_email_inviata_2` (`id_email_inviata`),
  ADD KEY `id_email_inviata_3` (`id_email_inviata`),
  ADD KEY `id_email_inviata_4` (`id_email_inviata`),
  ADD KEY `id_email_inviata_5` (`id_email_inviata`),
  ADD KEY `id_email_inviata_6` (`id_email_inviata`),
  ADD KEY `id_email_inviata_7` (`id_email_inviata`),
  ADD KEY `id_email_inviata_8` (`id_email_inviata`),
  ADD KEY `id_email_inviata_9` (`id_email_inviata`),
  ADD KEY `id_email_inviata_10` (`id_email_inviata`),
  ADD KEY `id_email_inviata_11` (`id_email_inviata`);

--
-- Indici per le tabelle `an_progressivi`
--
ALTER TABLE `an_progressivi`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_progressivo_ditta_codice_serie` (`id_ditta`,`codice_progressivo`,`serie`),
  ADD KEY `id_ditta` (`id_ditta`),
  ADD KEY `id_ditta_2` (`id_ditta`),
  ADD KEY `id_ditta_3` (`id_ditta`),
  ADD KEY `id_ditta_4` (`id_ditta`),
  ADD KEY `id_ditta_5` (`id_ditta`),
  ADD KEY `id_ditta_6` (`id_ditta`),
  ADD KEY `id_ditta_7` (`id_ditta`),
  ADD KEY `id_ditta_8` (`id_ditta`),
  ADD KEY `id_ditta_9` (`id_ditta`);

--
-- Indici per le tabelle `an_relazioni`
--
ALTER TABLE `an_relazioni`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_an_relazioni_id_ditta_origine` (`id_ditta_origine`),
  ADD KEY `fk_an_relazioni_id_ditta_correlata` (`id_ditta_correlata`);

--
-- Indici per le tabelle `an_servizi_aziendali_mail`
--
ALTER TABLE `an_servizi_aziendali_mail`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `an_servizi_aziendali_mail_id_ditta_nome_servizio_unique` (`id_ditta`,`nome_servizio`),
  ADD KEY `an_servizi_aziendali_mail_id_ditta_mail_account_foreign` (`id_ditta_mail_account`);

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
  ADD UNIQUE KEY `codice_modulo` (`codice_modulo`,`funzione`,`sotto_funzione`),
  ADD KEY `codice_modulo_2` (`codice_modulo`),
  ADD KEY `codice_modulo_3` (`codice_modulo`),
  ADD KEY `codice_modulo_4` (`codice_modulo`),
  ADD KEY `codice_modulo_5` (`codice_modulo`),
  ADD KEY `codice_modulo_6` (`codice_modulo`),
  ADD KEY `codice_modulo_7` (`codice_modulo`),
  ADD KEY `codice_modulo_8` (`codice_modulo`),
  ADD KEY `codice_modulo_9` (`codice_modulo`),
  ADD KEY `codice_modulo_10` (`codice_modulo`);

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
-- Indici per le tabelle `bs_attivita`
--
ALTER TABLE `bs_attivita`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bs_attivita_id_bene_foreign` (`id_bene`),
  ADD KEY `bs_attivita_id_utente_utilizzatore_foreign` (`id_utente_utilizzatore`);

--
-- Indici per le tabelle `bs_beni`
--
ALTER TABLE `bs_beni`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `bs_beni_id_ditta_codice_bene_unique` (`id_ditta`,`codice_bene`),
  ADD KEY `bs_beni_id_categoria_foreign` (`id_categoria`),
  ADD KEY `bs_beni_id_sottoconto_cespite_foreign` (`id_sottoconto_cespite`),
  ADD KEY `bs_beni_id_fornitore_foreign` (`id_fornitore`),
  ADD KEY `bs_beni_id_sottoconto_costo_foreign` (`id_sottoconto_costo`);

--
-- Indici per le tabelle `bs_categorie`
--
ALTER TABLE `bs_categorie`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bs_categorie_id_ditta_foreign` (`id_ditta`),
  ADD KEY `bs_categorie_id_sottoconto_costi_foreign` (`id_sottoconto_costi`),
  ADD KEY `bs_categorie_id_sottoconto_ammortamenti_foreign` (`id_sottoconto_ammortamenti`),
  ADD KEY `bs_categorie_id_sottoconto_fondo_foreign` (`id_sottoconto_fondo`);

--
-- Indici per le tabelle `bs_costi`
--
ALTER TABLE `bs_costi`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bs_costi_id_bene_foreign` (`id_bene`),
  ADD KEY `bs_costi_id_sottoconto_contabile_foreign` (`id_sottoconto_contabile`);

--
-- Indici per le tabelle `bs_manutenzioni`
--
ALTER TABLE `bs_manutenzioni`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bs_manutenzioni_id_bene_foreign` (`id_bene`),
  ADD KEY `bs_manutenzioni_id_fornitore_manutenzione_foreign` (`id_fornitore_manutenzione`),
  ADD KEY `bs_manutenzioni_id_sottoconto_contabile_foreign` (`id_sottoconto_contabile`);

--
-- Indici per le tabelle `bs_scadenze`
--
ALTER TABLE `bs_scadenze`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bs_scadenze_id_bene_foreign` (`id_bene`),
  ADD KEY `bs_scadenze_id_fornitore_associato_foreign` (`id_fornitore_associato`),
  ADD KEY `bs_scadenze_id_tipo_scadenza_foreign` (`id_tipo_scadenza`);

--
-- Indici per le tabelle `bs_tipi_scadenze`
--
ALTER TABLE `bs_tipi_scadenze`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `bs_tipi_scadenza_id_ditta_codice_unique` (`id_ditta`,`codice`);

--
-- Indici per le tabelle `ct_catalogo`
--
ALTER TABLE `ct_catalogo`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ct_catalogo_id_ditta_codice_entita_unique` (`id_ditta`,`codice_entita`),
  ADD KEY `ct_catalogo_id_categoria_foreign` (`id_categoria`),
  ADD KEY `ct_catalogo_id_unita_misura_foreign` (`id_unita_misura`),
  ADD KEY `ct_catalogo_id_aliquota_iva_foreign` (`id_aliquota_iva`),
  ADD KEY `ct_catalogo_id_stato_entita_foreign` (`id_stato_entita`);

--
-- Indici per le tabelle `ct_catalogo_compositi`
--
ALTER TABLE `ct_catalogo_compositi`
  ADD PRIMARY KEY (`id_catalogo_padre`,`id_catalogo_componente`),
  ADD KEY `ct_catalogo_compositi_id_catalogo_componente_foreign` (`id_catalogo_componente`);

--
-- Indici per le tabelle `ct_catalogo_dati_beni`
--
ALTER TABLE `ct_catalogo_dati_beni`
  ADD PRIMARY KEY (`id_catalogo`);

--
-- Indici per le tabelle `ct_catalogo_dati_servizi`
--
ALTER TABLE `ct_catalogo_dati_servizi`
  ADD PRIMARY KEY (`id_catalogo`);

--
-- Indici per le tabelle `ct_categorie`
--
ALTER TABLE `ct_categorie`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ct_categorie_id_ditta_foreign` (`id_ditta`),
  ADD KEY `ct_categorie_id_padre_foreign` (`id_padre`),
  ADD KEY `ct_categorie_codice_categoria_index` (`codice_categoria`);

--
-- Indici per le tabelle `ct_codici_fornitore`
--
ALTER TABLE `ct_codici_fornitore`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ct_codici_fornitore_id_catalogo_foreign` (`id_catalogo`),
  ADD KEY `ct_codici_fornitore_id_anagrafica_fornitore_foreign` (`id_anagrafica_fornitore`),
  ADD KEY `ct_codici_fornitore_created_by_foreign` (`created_by`),
  ADD KEY `ct_codici_fornitore_id_ditta_id_catalogo_index` (`id_ditta`,`id_catalogo`),
  ADD KEY `ct_codici_fornitore_id_ditta_codice_articolo_fornitore_index` (`id_ditta`,`codice_articolo_fornitore`);

--
-- Indici per le tabelle `ct_ean`
--
ALTER TABLE `ct_ean`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ct_ean_id_catalogo_codice_ean_unique` (`id_catalogo`,`codice_ean`),
  ADD KEY `ct_ean_id_ditta_foreign` (`id_ditta`),
  ADD KEY `ct_ean_created_by_foreign` (`created_by`);

--
-- Indici per le tabelle `ct_listini`
--
ALTER TABLE `ct_listini`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ct_listini_id_ditta_foreign` (`id_ditta`),
  ADD KEY `ct_listini_id_entita_catalogo_foreign` (`id_entita_catalogo`);

--
-- Indici per le tabelle `ct_logistica`
--
ALTER TABLE `ct_logistica`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ct_logistica_id_catalogo_unique` (`id_catalogo`),
  ADD KEY `ct_logistica_id_ditta_foreign` (`id_ditta`);

--
-- Indici per le tabelle `ct_stati_entita`
--
ALTER TABLE `ct_stati_entita`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ct_stati_entita_codice_unique` (`codice`);

--
-- Indici per le tabelle `ct_unita_misura`
--
ALTER TABLE `ct_unita_misura`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ct_unita_misura_id_ditta_foreign` (`id_ditta`);

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
  ADD KEY `fk_ditte_sottoconto_puntovendita` (`id_sottoconto_puntovendita`),
  ADD KEY `id_sottoconto_cliente` (`id_sottoconto_cliente`),
  ADD KEY `id_sottoconto_fornitore` (`id_sottoconto_fornitore`),
  ADD KEY `id_sottoconto_fornitore_4` (`id_sottoconto_fornitore`);

--
-- Indici per le tabelle `ditte_moduli`
--
ALTER TABLE `ditte_moduli`
  ADD PRIMARY KEY (`id_ditta`,`codice_modulo`),
  ADD KEY `codice_modulo` (`codice_modulo`),
  ADD KEY `id_ditta` (`id_ditta`),
  ADD KEY `id_ditta_2` (`id_ditta`),
  ADD KEY `codice_modulo_2` (`codice_modulo`),
  ADD KEY `id_ditta_3` (`id_ditta`),
  ADD KEY `codice_modulo_3` (`codice_modulo`),
  ADD KEY `id_ditta_4` (`id_ditta`),
  ADD KEY `codice_modulo_4` (`codice_modulo`);

--
-- Indici per le tabelle `email_inviate`
--
ALTER TABLE `email_inviate`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tracking_id` (`tracking_id`),
  ADD KEY `id_utente_mittente` (`id_utente_mittente`),
  ADD KEY `id_ditta` (`id_ditta`);

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
-- Indici per le tabelle `funzioni_ditte`
--
ALTER TABLE `funzioni_ditte`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `funzioni_ditte_id_funzione_id_ditta_unique` (`id_funzione`,`id_ditta`),
  ADD KEY `funzioni_ditte_id_ditta_foreign` (`id_ditta`);

--
-- Indici per le tabelle `iva_contabili`
--
ALTER TABLE `iva_contabili`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `iva_contabili_id_ditta_codice_unique` (`id_ditta`,`codice`),
  ADD KEY `id_ditta` (`id_ditta`);

--
-- Indici per le tabelle `knex_migrations`
--
ALTER TABLE `knex_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indici per le tabelle `knex_migrations_lock`
--
ALTER TABLE `knex_migrations_lock`
  ADD PRIMARY KEY (`index`),
  ADD KEY `is_locked` (`is_locked`);

--
-- Indici per le tabelle `lista_distribuzione_ditte`
--
ALTER TABLE `lista_distribuzione_ditte`
  ADD PRIMARY KEY (`id_lista`,`id_ditta`),
  ADD KEY `fk_lista_distribuzione_ditte_id_ditta` (`id_ditta`);

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
  ADD KEY `id_funzione_accessibile` (`id_funzione_accessibile`),
  ADD KEY `id_utente_2` (`id_utente`);

--
-- Indici per le tabelle `log_azioni`
--
ALTER TABLE `log_azioni`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_utente` (`id_utente`),
  ADD KEY `id_ditta` (`id_ditta`),
  ADD KEY `id_utente_2` (`id_utente`);

--
-- Indici per le tabelle `mg_causali_movimento`
--
ALTER TABLE `mg_causali_movimento`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `mg_causali_movimento_id_ditta_codice_unique` (`id_ditta`,`codice`);

--
-- Indici per le tabelle `mg_giacenze`
--
ALTER TABLE `mg_giacenze`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_giacenza_unica` (`id_ditta`,`id_magazzino`,`id_catalogo`),
  ADD KEY `mg_giacenze_id_magazzino_foreign` (`id_magazzino`),
  ADD KEY `mg_giacenze_id_catalogo_foreign` (`id_catalogo`);

--
-- Indici per le tabelle `mg_lotti`
--
ALTER TABLE `mg_lotti`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `mg_lotti_id_ditta_id_catalogo_codice_lotto_unique` (`id_ditta`,`id_catalogo`,`codice_lotto`),
  ADD KEY `mg_lotti_id_catalogo_foreign` (`id_catalogo`);

--
-- Indici per le tabelle `mg_magazzini`
--
ALTER TABLE `mg_magazzini`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `mg_magazzini_id_ditta_codice_unique` (`id_ditta`,`codice`);

--
-- Indici per le tabelle `mg_movimenti`
--
ALTER TABLE `mg_movimenti`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mg_movimenti_id_ditta_foreign` (`id_ditta`),
  ADD KEY `mg_movimenti_id_magazzino_foreign` (`id_magazzino`),
  ADD KEY `mg_movimenti_id_catalogo_foreign` (`id_catalogo`),
  ADD KEY `mg_movimenti_id_causale_foreign` (`id_causale`),
  ADD KEY `mg_movimenti_id_utente_foreign` (`id_utente`);

--
-- Indici per le tabelle `mg_movimenti_lotti`
--
ALTER TABLE `mg_movimenti_lotti`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mg_movimenti_lotti_id_movimento_foreign` (`id_movimento`),
  ADD KEY `mg_movimenti_lotti_id_lotto_foreign` (`id_lotto`);

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
  ADD KEY `ID_RuoloDefault` (`ID_RuoloDefault`),
  ADD KEY `fk_ppa_azioni_ID_Processo` (`ID_Processo`);

--
-- Indici per le tabelle `ppa_istanzeazioni`
--
ALTER TABLE `ppa_istanzeazioni`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `ID_IstanzaProcedura` (`ID_IstanzaProcedura`),
  ADD KEY `ID_UtenteAssegnato` (`ID_UtenteAssegnato`),
  ADD KEY `ID_Stato` (`ID_Stato`),
  ADD KEY `fk_ppa_istanzeazioni_ID_Azione` (`ID_Azione`);

--
-- Indici per le tabelle `ppa_istanzeprocedure`
--
ALTER TABLE `ppa_istanzeprocedure`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `ID_UtenteCreatore` (`ID_UtenteCreatore`),
  ADD KEY `fk_ppa_istanzeprocedure_ID_ProceduraDitta` (`ID_ProceduraDitta`);

--
-- Indici per le tabelle `ppa_procedureditta`
--
ALTER TABLE `ppa_procedureditta`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `fk_ppa_procedureditta_id_ditta` (`id_ditta`),
  ADD KEY `fk_ppa_procedureditta_ID_ProceduraStandard` (`ID_ProceduraStandard`);

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
  ADD KEY `fk_ppa_processi_ID_ProceduraDitta` (`ID_ProceduraDitta`);

--
-- Indici per le tabelle `ppa_stati_azione`
--
ALTER TABLE `ppa_stati_azione`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `fk_ppa_stati_azione_id_ditta` (`id_ditta`);

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
-- Indici per le tabelle `ppa_team_comunicazioni`
--
ALTER TABLE `ppa_team_comunicazioni`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ppa_team_comunicazioni_id_team_foreign` (`id_team`);

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
  ADD UNIQUE KEY `tipo` (`tipo`),
  ADD KEY `ruoli_id_ditta_foreign` (`id_ditta`);

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
  ADD KEY `fk_sc_partite_aperte_id_ditta_anagrafica` (`id_ditta_anagrafica`);

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
  ADD UNIQUE KEY `sc_registrazioni_testata_id_ditta_numero_protocollo_unique` (`id_ditta`,`numero_protocollo`),
  ADD KEY `id_utente` (`id_utente`),
  ADD KEY `sc_registrazioni_testata_id_ditte_foreign` (`id_ditte`);

--
-- Indici per le tabelle `sc_registri_iva`
--
ALTER TABLE `sc_registri_iva`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_riga_registrazione` (`id_riga_registrazione`),
  ADD KEY `id_anagrafica` (`id_anagrafica`);

--
-- Indici per le tabelle `stati_lettura`
--
ALTER TABLE `stati_lettura`
  ADD PRIMARY KEY (`id_utente`,`email_uid`);

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
-- Indici per le tabelle `utente_mail_accounts`
--
ALTER TABLE `utente_mail_accounts`
  ADD PRIMARY KEY (`id_utente`,`id_mail_account`),
  ADD KEY `utente_mail_accounts_id_mail_account_foreign` (`id_mail_account`);

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
-- Indici per le tabelle `utenti_funzioni_override`
--
ALTER TABLE `utenti_funzioni_override`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `utenti_funzioni_override_id_utente_id_funzione_unique` (`id_utente`,`id_funzione`),
  ADD KEY `utenti_funzioni_override_id_funzione_foreign` (`id_funzione`);

--
-- Indici per le tabelle `va_clienti_anagrafica`
--
ALTER TABLE `va_clienti_anagrafica`
  ADD PRIMARY KEY (`id_ditta`),
  ADD KEY `va_clienti_anagrafica_id_punto_consegna_predefinito_foreign` (`id_punto_consegna_predefinito`),
  ADD KEY `va_clienti_anagrafica_id_matrice_sconti_foreign` (`id_matrice_sconti`);

--
-- Indici per le tabelle `va_gruppi_clienti`
--
ALTER TABLE `va_gruppi_clienti`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `va_gruppi_clienti_id_ditta_codice_unique` (`id_ditta`,`codice`);

--
-- Indici per le tabelle `va_matrice_sconti`
--
ALTER TABLE `va_matrice_sconti`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `va_matrice_sconti_id_ditta_codice_unique` (`id_ditta`,`codice`);

--
-- Indici per le tabelle `va_punti_consegna`
--
ALTER TABLE `va_punti_consegna`
  ADD PRIMARY KEY (`id`),
  ADD KEY `va_punti_consegna_id_ditta_foreign` (`id_ditta`),
  ADD KEY `va_punti_consegna_id_cliente_foreign` (`id_cliente`);

--
-- Indici per le tabelle `va_tipi_documento`
--
ALTER TABLE `va_tipi_documento`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `va_tipi_documento_id_ditta_codice_doc_unique` (`id_ditta`,`codice_doc`);

--
-- Indici per le tabelle `va_trasportatori`
--
ALTER TABLE `va_trasportatori`
  ADD KEY `va_trasportatori_id_ditta_proprietaria_foreign` (`id_ditta_proprietaria`),
  ADD KEY `va_trasportatori_id_utente_referente_foreign` (`id_utente_referente`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `ac_condizioni_righe`
--
ALTER TABLE `ac_condizioni_righe`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `ac_condizioni_testata`
--
ALTER TABLE `ac_condizioni_testata`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `ac_sconti_dettaglio`
--
ALTER TABLE `ac_sconti_dettaglio`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `allegati_tracciati`
--
ALTER TABLE `allegati_tracciati`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `an_progressivi`
--
ALTER TABLE `an_progressivi`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `an_relazioni`
--
ALTER TABLE `an_relazioni`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `an_servizi_aziendali_mail`
--
ALTER TABLE `an_servizi_aziendali_mail`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

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
-- AUTO_INCREMENT per la tabella `bs_attivita`
--
ALTER TABLE `bs_attivita`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `bs_beni`
--
ALTER TABLE `bs_beni`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `bs_categorie`
--
ALTER TABLE `bs_categorie`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `bs_costi`
--
ALTER TABLE `bs_costi`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `bs_manutenzioni`
--
ALTER TABLE `bs_manutenzioni`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `bs_scadenze`
--
ALTER TABLE `bs_scadenze`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `bs_tipi_scadenze`
--
ALTER TABLE `bs_tipi_scadenze`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `ct_catalogo`
--
ALTER TABLE `ct_catalogo`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `ct_categorie`
--
ALTER TABLE `ct_categorie`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `ct_codici_fornitore`
--
ALTER TABLE `ct_codici_fornitore`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `ct_ean`
--
ALTER TABLE `ct_ean`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `ct_listini`
--
ALTER TABLE `ct_listini`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `ct_logistica`
--
ALTER TABLE `ct_logistica`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `ct_stati_entita`
--
ALTER TABLE `ct_stati_entita`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `ct_unita_misura`
--
ALTER TABLE `ct_unita_misura`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

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
-- AUTO_INCREMENT per la tabella `funzioni_ditte`
--
ALTER TABLE `funzioni_ditte`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `iva_contabili`
--
ALTER TABLE `iva_contabili`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

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
-- AUTO_INCREMENT per la tabella `mg_causali_movimento`
--
ALTER TABLE `mg_causali_movimento`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `mg_giacenze`
--
ALTER TABLE `mg_giacenze`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `mg_lotti`
--
ALTER TABLE `mg_lotti`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `mg_magazzini`
--
ALTER TABLE `mg_magazzini`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `mg_movimenti`
--
ALTER TABLE `mg_movimenti`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `mg_movimenti_lotti`
--
ALTER TABLE `mg_movimenti_lotti`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `moduli`
--
ALTER TABLE `moduli`
  MODIFY `codice` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `ppa_azioni`
--
ALTER TABLE `ppa_azioni`
  MODIFY `ID` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

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
  MODIFY `ID` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `ppa_procedurestandard`
--
ALTER TABLE `ppa_procedurestandard`
  MODIFY `ID` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `ppa_processi`
--
ALTER TABLE `ppa_processi`
  MODIFY `ID` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

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
-- AUTO_INCREMENT per la tabella `ppa_team_comunicazioni`
--
ALTER TABLE `ppa_team_comunicazioni`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

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
-- AUTO_INCREMENT per la tabella `utenti_funzioni_override`
--
ALTER TABLE `utenti_funzioni_override`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `va_gruppi_clienti`
--
ALTER TABLE `va_gruppi_clienti`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `va_matrice_sconti`
--
ALTER TABLE `va_matrice_sconti`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `va_punti_consegna`
--
ALTER TABLE `va_punti_consegna`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `va_tipi_documento`
--
ALTER TABLE `va_tipi_documento`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `ac_condizioni_righe`
--
ALTER TABLE `ac_condizioni_righe`
  ADD CONSTRAINT `ac_condizioni_righe_id_articolo_foreign` FOREIGN KEY (`id_articolo`) REFERENCES `ct_catalogo` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ac_condizioni_righe_id_testata_foreign` FOREIGN KEY (`id_testata`) REFERENCES `ac_condizioni_testata` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `ac_condizioni_testata`
--
ALTER TABLE `ac_condizioni_testata`
  ADD CONSTRAINT `ac_condizioni_testata_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ac_condizioni_testata_id_fornitore_foreign` FOREIGN KEY (`id_fornitore`) REFERENCES `ditte` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `ac_sconti_dettaglio`
--
ALTER TABLE `ac_sconti_dettaglio`
  ADD CONSTRAINT `ac_sconti_dettaglio_id_riga_foreign` FOREIGN KEY (`id_riga`) REFERENCES `ac_condizioni_righe` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `an_progressivi`
--
ALTER TABLE `an_progressivi`
  ADD CONSTRAINT `an_progressivi_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `an_relazioni`
--
ALTER TABLE `an_relazioni`
  ADD CONSTRAINT `fk_an_relazioni_id_ditta_correlata` FOREIGN KEY (`id_ditta_correlata`) REFERENCES `ditte` (`id`),
  ADD CONSTRAINT `fk_an_relazioni_id_ditta_origine` FOREIGN KEY (`id_ditta_origine`) REFERENCES `ditte` (`id`);

--
-- Limiti per la tabella `an_servizi_aziendali_mail`
--
ALTER TABLE `an_servizi_aziendali_mail`
  ADD CONSTRAINT `an_servizi_aziendali_mail_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `an_servizi_aziendali_mail_id_ditta_mail_account_foreign` FOREIGN KEY (`id_ditta_mail_account`) REFERENCES `ditta_mail_accounts` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `app_funzioni`
--
ALTER TABLE `app_funzioni`
  ADD CONSTRAINT `app_funzioni_ibfk_1` FOREIGN KEY (`codice_modulo`) REFERENCES `moduli` (`codice`);

--
-- Limiti per la tabella `app_ruoli`
--
ALTER TABLE `app_ruoli`
  ADD CONSTRAINT `app_ruoli_ibfk_2` FOREIGN KEY (`codice_modulo`) REFERENCES `moduli` (`codice`),
  ADD CONSTRAINT `fk_app_ruoli_id_ditta` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`);

--
-- Limiti per la tabella `app_ruoli_funzioni`
--
ALTER TABLE `app_ruoli_funzioni`
  ADD CONSTRAINT `app_ruoli_funzioni_ibfk_1` FOREIGN KEY (`id_ruolo`) REFERENCES `app_ruoli` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `app_ruoli_funzioni_ibfk_2` FOREIGN KEY (`id_funzione`) REFERENCES `app_funzioni` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `bs_attivita`
--
ALTER TABLE `bs_attivita`
  ADD CONSTRAINT `bs_attivita_id_bene_foreign` FOREIGN KEY (`id_bene`) REFERENCES `bs_beni` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bs_attivita_id_utente_utilizzatore_foreign` FOREIGN KEY (`id_utente_utilizzatore`) REFERENCES `utenti` (`id`) ON DELETE SET NULL;

--
-- Limiti per la tabella `bs_beni`
--
ALTER TABLE `bs_beni`
  ADD CONSTRAINT `bs_beni_id_categoria_foreign` FOREIGN KEY (`id_categoria`) REFERENCES `bs_categorie` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bs_beni_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bs_beni_id_fornitore_foreign` FOREIGN KEY (`id_fornitore`) REFERENCES `ditte` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `bs_beni_id_sottoconto_cespite_foreign` FOREIGN KEY (`id_sottoconto_cespite`) REFERENCES `sc_piano_dei_conti` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `bs_beni_id_sottoconto_costo_foreign` FOREIGN KEY (`id_sottoconto_costo`) REFERENCES `sc_piano_dei_conti` (`id`) ON DELETE SET NULL;

--
-- Limiti per la tabella `bs_categorie`
--
ALTER TABLE `bs_categorie`
  ADD CONSTRAINT `bs_categorie_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bs_categorie_id_sottoconto_ammortamenti_foreign` FOREIGN KEY (`id_sottoconto_ammortamenti`) REFERENCES `sc_piano_dei_conti` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `bs_categorie_id_sottoconto_costi_foreign` FOREIGN KEY (`id_sottoconto_costi`) REFERENCES `sc_piano_dei_conti` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `bs_categorie_id_sottoconto_fondo_foreign` FOREIGN KEY (`id_sottoconto_fondo`) REFERENCES `sc_piano_dei_conti` (`id`) ON DELETE SET NULL;

--
-- Limiti per la tabella `bs_costi`
--
ALTER TABLE `bs_costi`
  ADD CONSTRAINT `bs_costi_id_bene_foreign` FOREIGN KEY (`id_bene`) REFERENCES `bs_beni` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bs_costi_id_sottoconto_contabile_foreign` FOREIGN KEY (`id_sottoconto_contabile`) REFERENCES `sc_piano_dei_conti` (`id`) ON DELETE SET NULL;

--
-- Limiti per la tabella `bs_manutenzioni`
--
ALTER TABLE `bs_manutenzioni`
  ADD CONSTRAINT `bs_manutenzioni_id_bene_foreign` FOREIGN KEY (`id_bene`) REFERENCES `bs_beni` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bs_manutenzioni_id_fornitore_manutenzione_foreign` FOREIGN KEY (`id_fornitore_manutenzione`) REFERENCES `ditte` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `bs_manutenzioni_id_sottoconto_contabile_foreign` FOREIGN KEY (`id_sottoconto_contabile`) REFERENCES `sc_piano_dei_conti` (`id`) ON DELETE SET NULL;

--
-- Limiti per la tabella `bs_scadenze`
--
ALTER TABLE `bs_scadenze`
  ADD CONSTRAINT `bs_scadenze_id_bene_foreign` FOREIGN KEY (`id_bene`) REFERENCES `bs_beni` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bs_scadenze_id_fornitore_associato_foreign` FOREIGN KEY (`id_fornitore_associato`) REFERENCES `ditte` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `bs_scadenze_id_tipo_scadenza_foreign` FOREIGN KEY (`id_tipo_scadenza`) REFERENCES `bs_tipi_scadenze` (`id`) ON DELETE SET NULL;

--
-- Limiti per la tabella `bs_tipi_scadenze`
--
ALTER TABLE `bs_tipi_scadenze`
  ADD CONSTRAINT `bs_tipi_scadenza_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `ct_catalogo`
--
ALTER TABLE `ct_catalogo`
  ADD CONSTRAINT `ct_catalogo_id_aliquota_iva_foreign` FOREIGN KEY (`id_aliquota_iva`) REFERENCES `iva_contabili` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `ct_catalogo_id_categoria_foreign` FOREIGN KEY (`id_categoria`) REFERENCES `ct_categorie` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `ct_catalogo_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ct_catalogo_id_stato_entita_foreign` FOREIGN KEY (`id_stato_entita`) REFERENCES `ct_stati_entita` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `ct_catalogo_id_unita_misura_foreign` FOREIGN KEY (`id_unita_misura`) REFERENCES `ct_unita_misura` (`id`) ON DELETE SET NULL;

--
-- Limiti per la tabella `ct_catalogo_compositi`
--
ALTER TABLE `ct_catalogo_compositi`
  ADD CONSTRAINT `ct_catalogo_compositi_id_catalogo_componente_foreign` FOREIGN KEY (`id_catalogo_componente`) REFERENCES `ct_catalogo` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ct_catalogo_compositi_id_catalogo_padre_foreign` FOREIGN KEY (`id_catalogo_padre`) REFERENCES `ct_catalogo` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `ct_catalogo_dati_beni`
--
ALTER TABLE `ct_catalogo_dati_beni`
  ADD CONSTRAINT `ct_catalogo_dati_beni_id_catalogo_foreign` FOREIGN KEY (`id_catalogo`) REFERENCES `ct_catalogo` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `ct_catalogo_dati_servizi`
--
ALTER TABLE `ct_catalogo_dati_servizi`
  ADD CONSTRAINT `ct_catalogo_dati_servizi_id_catalogo_foreign` FOREIGN KEY (`id_catalogo`) REFERENCES `ct_catalogo` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `ct_categorie`
--
ALTER TABLE `ct_categorie`
  ADD CONSTRAINT `ct_categorie_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ct_categorie_id_padre_foreign` FOREIGN KEY (`id_padre`) REFERENCES `ct_categorie` (`id`) ON DELETE SET NULL;

--
-- Limiti per la tabella `ct_codici_fornitore`
--
ALTER TABLE `ct_codici_fornitore`
  ADD CONSTRAINT `ct_codici_fornitore_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `utenti` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `ct_codici_fornitore_id_anagrafica_fornitore_foreign` FOREIGN KEY (`id_anagrafica_fornitore`) REFERENCES `ditte` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `ct_codici_fornitore_id_catalogo_foreign` FOREIGN KEY (`id_catalogo`) REFERENCES `ct_catalogo` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ct_codici_fornitore_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `ct_ean`
--
ALTER TABLE `ct_ean`
  ADD CONSTRAINT `ct_ean_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `utenti` (`id`),
  ADD CONSTRAINT `ct_ean_id_catalogo_foreign` FOREIGN KEY (`id_catalogo`) REFERENCES `ct_catalogo` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ct_ean_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`);

--
-- Limiti per la tabella `ct_listini`
--
ALTER TABLE `ct_listini`
  ADD CONSTRAINT `ct_listini_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ct_listini_id_entita_catalogo_foreign` FOREIGN KEY (`id_entita_catalogo`) REFERENCES `ct_catalogo` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `ct_logistica`
--
ALTER TABLE `ct_logistica`
  ADD CONSTRAINT `ct_logistica_id_catalogo_foreign` FOREIGN KEY (`id_catalogo`) REFERENCES `ct_catalogo` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ct_logistica_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`);

--
-- Limiti per la tabella `ct_unita_misura`
--
ALTER TABLE `ct_unita_misura`
  ADD CONSTRAINT `ct_unita_misura_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `ditta_mail_accounts`
--
ALTER TABLE `ditta_mail_accounts`
  ADD CONSTRAINT `fk_ditta_mail_accounts_id_ditta` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`);

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
  ADD CONSTRAINT `ditte_moduli_ibfk_2` FOREIGN KEY (`codice_modulo`) REFERENCES `moduli` (`codice`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ditte_moduli_id_ditta` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`);

--
-- Limiti per la tabella `email_inviate`
--
ALTER TABLE `email_inviate`
  ADD CONSTRAINT `email_inviate_ibfk_1` FOREIGN KEY (`id_utente_mittente`) REFERENCES `utenti` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `email_inviate_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE SET NULL;

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
-- Limiti per la tabella `funzioni_ditte`
--
ALTER TABLE `funzioni_ditte`
  ADD CONSTRAINT `funzioni_ditte_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `funzioni_ditte_id_funzione_foreign` FOREIGN KEY (`id_funzione`) REFERENCES `funzioni` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `iva_contabili`
--
ALTER TABLE `iva_contabili`
  ADD CONSTRAINT `iva_contabili_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `lista_distribuzione_ditte`
--
ALTER TABLE `lista_distribuzione_ditte`
  ADD CONSTRAINT `fk_lista_distribuzione_ditte_id_ditta` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`),
  ADD CONSTRAINT `lista_distribuzione_ditte_ibfk_1` FOREIGN KEY (`id_lista`) REFERENCES `liste_distribuzione` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `lista_distribuzione_utenti`
--
ALTER TABLE `lista_distribuzione_utenti`
  ADD CONSTRAINT `ldu_ibfk_1` FOREIGN KEY (`id_lista`) REFERENCES `liste_distribuzione` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ldu_ibfk_2` FOREIGN KEY (`id_utente`) REFERENCES `utenti` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `liste_distribuzione`
--
ALTER TABLE `liste_distribuzione`
  ADD CONSTRAINT `fk_liste_distribuzione_id_ditta` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`);

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
  ADD CONSTRAINT `fk_log_azioni_id_ditta` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`),
  ADD CONSTRAINT `log_azioni_ibfk_1` FOREIGN KEY (`id_utente`) REFERENCES `utenti` (`id`);

--
-- Limiti per la tabella `mg_causali_movimento`
--
ALTER TABLE `mg_causali_movimento`
  ADD CONSTRAINT `mg_causali_movimento_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `mg_giacenze`
--
ALTER TABLE `mg_giacenze`
  ADD CONSTRAINT `mg_giacenze_id_catalogo_foreign` FOREIGN KEY (`id_catalogo`) REFERENCES `ct_catalogo` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mg_giacenze_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mg_giacenze_id_magazzino_foreign` FOREIGN KEY (`id_magazzino`) REFERENCES `mg_magazzini` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `mg_lotti`
--
ALTER TABLE `mg_lotti`
  ADD CONSTRAINT `mg_lotti_id_catalogo_foreign` FOREIGN KEY (`id_catalogo`) REFERENCES `ct_catalogo` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mg_lotti_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `mg_magazzini`
--
ALTER TABLE `mg_magazzini`
  ADD CONSTRAINT `mg_magazzini_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `mg_movimenti`
--
ALTER TABLE `mg_movimenti`
  ADD CONSTRAINT `mg_movimenti_id_catalogo_foreign` FOREIGN KEY (`id_catalogo`) REFERENCES `ct_catalogo` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mg_movimenti_id_causale_foreign` FOREIGN KEY (`id_causale`) REFERENCES `mg_causali_movimento` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mg_movimenti_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mg_movimenti_id_magazzino_foreign` FOREIGN KEY (`id_magazzino`) REFERENCES `mg_magazzini` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mg_movimenti_id_utente_foreign` FOREIGN KEY (`id_utente`) REFERENCES `utenti` (`id`) ON DELETE SET NULL;

--
-- Limiti per la tabella `mg_movimenti_lotti`
--
ALTER TABLE `mg_movimenti_lotti`
  ADD CONSTRAINT `mg_movimenti_lotti_id_lotto_foreign` FOREIGN KEY (`id_lotto`) REFERENCES `mg_lotti` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mg_movimenti_lotti_id_movimento_foreign` FOREIGN KEY (`id_movimento`) REFERENCES `mg_movimenti` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `ppa_azioni`
--
ALTER TABLE `ppa_azioni`
  ADD CONSTRAINT `fk_ppa_azioni_ID_Processo` FOREIGN KEY (`ID_Processo`) REFERENCES `ppa_processi` (`ID`),
  ADD CONSTRAINT `ppa_azioni_ibfk_2` FOREIGN KEY (`ID_RuoloDefault`) REFERENCES `ruoli` (`id`) ON DELETE SET NULL;

--
-- Limiti per la tabella `ppa_istanzeazioni`
--
ALTER TABLE `ppa_istanzeazioni`
  ADD CONSTRAINT `fk_ppa_istanzeazioni_ID_Azione` FOREIGN KEY (`ID_Azione`) REFERENCES `ppa_azioni` (`ID`),
  ADD CONSTRAINT `ppa_istanzeazioni_ibfk_1` FOREIGN KEY (`ID_IstanzaProcedura`) REFERENCES `ppa_istanzeprocedure` (`ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `ppa_istanzeazioni_ibfk_3` FOREIGN KEY (`ID_UtenteAssegnato`) REFERENCES `utenti` (`id`),
  ADD CONSTRAINT `ppa_istanzeazioni_ibfk_4` FOREIGN KEY (`ID_Stato`) REFERENCES `ppa_stati_azione` (`ID`);

--
-- Limiti per la tabella `ppa_istanzeprocedure`
--
ALTER TABLE `ppa_istanzeprocedure`
  ADD CONSTRAINT `fk_ppa_istanzeprocedure_ID_ProceduraDitta` FOREIGN KEY (`ID_ProceduraDitta`) REFERENCES `ppa_procedureditta` (`ID`),
  ADD CONSTRAINT `ppa_istanzeprocedure_ibfk_3` FOREIGN KEY (`ID_UtenteCreatore`) REFERENCES `utenti` (`id`);

--
-- Limiti per la tabella `ppa_procedureditta`
--
ALTER TABLE `ppa_procedureditta`
  ADD CONSTRAINT `fk_ppa_procedureditta_ID_ProceduraStandard` FOREIGN KEY (`ID_ProceduraStandard`) REFERENCES `ppa_procedurestandard` (`ID`),
  ADD CONSTRAINT `fk_ppa_procedureditta_id_ditta` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`);

--
-- Limiti per la tabella `ppa_processi`
--
ALTER TABLE `ppa_processi`
  ADD CONSTRAINT `fk_ppa_processi_ID_ProceduraDitta` FOREIGN KEY (`ID_ProceduraDitta`) REFERENCES `ppa_procedureditta` (`ID`);

--
-- Limiti per la tabella `ppa_stati_azione`
--
ALTER TABLE `ppa_stati_azione`
  ADD CONSTRAINT `fk_ppa_stati_azione_id_ditta` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`);

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
-- Limiti per la tabella `ppa_team_comunicazioni`
--
ALTER TABLE `ppa_team_comunicazioni`
  ADD CONSTRAINT `ppa_team_comunicazioni_id_team_foreign` FOREIGN KEY (`id_team`) REFERENCES `ppa_team` (`ID`) ON DELETE CASCADE;

--
-- Limiti per la tabella `privacy_policies`
--
ALTER TABLE `privacy_policies`
  ADD CONSTRAINT `fk_privacy_policies_id_ditta` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`);

--
-- Limiti per la tabella `registration_tokens`
--
ALTER TABLE `registration_tokens`
  ADD CONSTRAINT `fk_registration_tokens_id_ditta` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`);

--
-- Limiti per la tabella `ruoli`
--
ALTER TABLE `ruoli`
  ADD CONSTRAINT `ruoli_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE SET NULL;

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
-- Limiti per la tabella `sc_partite_aperte`
--
ALTER TABLE `sc_partite_aperte`
  ADD CONSTRAINT `fk_sc_partite_aperte_id_ditta_anagrafica` FOREIGN KEY (`id_ditta_anagrafica`) REFERENCES `ditte` (`id`);

--
-- Limiti per la tabella `sc_piano_dei_conti`
--
ALTER TABLE `sc_piano_dei_conti`
  ADD CONSTRAINT `fk_sc_piano_dei_conti_id_ditta` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`),
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
  ADD CONSTRAINT `fk_sc_registrazioni_testata_id_ditta` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`),
  ADD CONSTRAINT `sc_registrazioni_testata_ibfk_2` FOREIGN KEY (`id_utente`) REFERENCES `utenti` (`id`),
  ADD CONSTRAINT `sc_registrazioni_testata_id_ditte_foreign` FOREIGN KEY (`id_ditte`) REFERENCES `ditte` (`id`) ON DELETE SET NULL;

--
-- Limiti per la tabella `sc_registri_iva`
--
ALTER TABLE `sc_registri_iva`
  ADD CONSTRAINT `sc_registri_iva_ibfk_1` FOREIGN KEY (`id_riga_registrazione`) REFERENCES `sc_registrazioni_righe` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `stati_lettura`
--
ALTER TABLE `stati_lettura`
  ADD CONSTRAINT `stati_lettura_ibfk_1` FOREIGN KEY (`id_utente`) REFERENCES `utenti` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `tipi_pagamento`
--
ALTER TABLE `tipi_pagamento`
  ADD CONSTRAINT `fk_tipi_pagamento_id_ditta` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`);

--
-- Limiti per la tabella `utente_mail_accounts`
--
ALTER TABLE `utente_mail_accounts`
  ADD CONSTRAINT `utente_mail_accounts_id_mail_account_foreign` FOREIGN KEY (`id_mail_account`) REFERENCES `ditta_mail_accounts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `utente_mail_accounts_id_utente_foreign` FOREIGN KEY (`id_utente`) REFERENCES `utenti` (`id`) ON DELETE CASCADE;

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
  ADD CONSTRAINT `fk_utenti_id_ditta` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`),
  ADD CONSTRAINT `utenti_ibfk_2` FOREIGN KEY (`id_ruolo`) REFERENCES `ruoli` (`id`);

--
-- Limiti per la tabella `utenti_funzioni_override`
--
ALTER TABLE `utenti_funzioni_override`
  ADD CONSTRAINT `utenti_funzioni_override_id_funzione_foreign` FOREIGN KEY (`id_funzione`) REFERENCES `funzioni` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `utenti_funzioni_override_id_utente_foreign` FOREIGN KEY (`id_utente`) REFERENCES `utenti` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `va_clienti_anagrafica`
--
ALTER TABLE `va_clienti_anagrafica`
  ADD CONSTRAINT `va_clienti_anagrafica_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `va_clienti_anagrafica_id_matrice_sconti_foreign` FOREIGN KEY (`id_matrice_sconti`) REFERENCES `va_matrice_sconti` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `va_clienti_anagrafica_id_punto_consegna_predefinito_foreign` FOREIGN KEY (`id_punto_consegna_predefinito`) REFERENCES `va_punti_consegna` (`id`) ON DELETE SET NULL;

--
-- Limiti per la tabella `va_gruppi_clienti`
--
ALTER TABLE `va_gruppi_clienti`
  ADD CONSTRAINT `va_gruppi_clienti_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `va_matrice_sconti`
--
ALTER TABLE `va_matrice_sconti`
  ADD CONSTRAINT `va_matrice_sconti_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `va_punti_consegna`
--
ALTER TABLE `va_punti_consegna`
  ADD CONSTRAINT `va_punti_consegna_id_cliente_foreign` FOREIGN KEY (`id_cliente`) REFERENCES `ditte` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `va_punti_consegna_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `va_tipi_documento`
--
ALTER TABLE `va_tipi_documento`
  ADD CONSTRAINT `va_tipi_documento_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `va_trasportatori`
--
ALTER TABLE `va_trasportatori`
  ADD CONSTRAINT `va_trasportatori_id_ditta_proprietaria_foreign` FOREIGN KEY (`id_ditta_proprietaria`) REFERENCES `ditte` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `va_trasportatori_id_utente_referente_foreign` FOREIGN KEY (`id_utente_referente`) REFERENCES `utenti` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
