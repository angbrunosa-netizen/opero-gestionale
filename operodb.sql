-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Dic 22, 2025 alle 17:56
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
-- Struttura della tabella `ad_utenti_ditte`
--

CREATE TABLE `ad_utenti_ditte` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_utente` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `id_ruolo` int(11) NOT NULL,
  `Codice_Tipo_Utente` int(11) NOT NULL DEFAULT 1,
  `stato` enum('attivo','sospeso') NOT NULL DEFAULT 'attivo',
  `is_default` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `livello` int(10) UNSIGNED NOT NULL DEFAULT 50 COMMENT 'Livello autorizzativo utente per questa ditta (es. 10=Lettura, 50=Standard, 90=Admin, 100=SuperAdmin)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `ai_content_cache`
--

CREATE TABLE `ai_content_cache` (
  `id` int(10) UNSIGNED NOT NULL,
  `context_hash` varchar(64) NOT NULL COMMENT 'Hash del contesto aziendale',
  `id_ditta` int(10) UNSIGNED NOT NULL COMMENT 'ID ditta associata',
  `page_type` varchar(50) NOT NULL COMMENT 'Tipo pagina generata',
  `industry` varchar(100) DEFAULT NULL COMMENT 'Settore merceologico',
  `ai_prompt` text DEFAULT NULL COMMENT 'Prompt completo usato',
  `generated_content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Contenuto generato' CHECK (json_valid(`generated_content`)),
  `ai_metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Metadata generazione' CHECK (json_valid(`ai_metadata`)),
  `ai_model` varchar(50) DEFAULT NULL COMMENT 'Modello AI usato',
  `confidence_score` decimal(5,2) DEFAULT NULL COMMENT 'Score di confidenza',
  `usage_count` int(11) DEFAULT 0 COMMENT 'Numero volte utilizzato',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL COMMENT 'Scadenza cache'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `ai_template_suggestions`
--

CREATE TABLE `ai_template_suggestions` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL COMMENT 'ID ditta',
  `template_type` varchar(100) NOT NULL COMMENT 'Tipo template suggerito',
  `recommendation_reason` varchar(500) DEFAULT NULL COMMENT 'Motivazione raccomandazione',
  `match_score` decimal(5,2) DEFAULT NULL COMMENT 'Score di match (0.00-1.00)',
  `customization_suggestions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Suggerimenti personalizzazione' CHECK (json_valid(`customization_suggestions`)),
  `ai_analysis` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Analisi AI dettagliata' CHECK (json_valid(`ai_analysis`)),
  `applied` tinyint(1) DEFAULT 0 COMMENT 'Se il suggerimento è stato applicato',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
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
  `download_id` varchar(255) NOT NULL,
  `scaricato` tinyint(1) NOT NULL DEFAULT 0,
  `data_primo_download` timestamp NULL DEFAULT NULL,
  `download_count` int(11) NOT NULL DEFAULT 0,
  `ultimo_download` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
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
-- Struttura della tabella `articoli_blog`
--

CREATE TABLE `articoli_blog` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_sito_web` int(10) UNSIGNED NOT NULL,
  `titolo` varchar(255) NOT NULL COMMENT 'Titolo articolo',
  `slug` varchar(255) NOT NULL COMMENT 'Slug URL articolo',
  `contenuto` longtext DEFAULT NULL COMMENT 'Contenuto articolo',
  `immagine_url` varchar(500) DEFAULT NULL COMMENT 'URL immagine copertina',
  `categoria` varchar(100) DEFAULT NULL COMMENT 'Categoria articolo',
  `tags` varchar(500) DEFAULT NULL COMMENT 'Tag separati da virgola',
  `autore` varchar(255) DEFAULT NULL COMMENT 'Nome autore',
  `meta_title` varchar(255) DEFAULT NULL COMMENT 'Meta title SEO',
  `meta_description` text DEFAULT NULL COMMENT 'Meta description SEO',
  `is_published` tinyint(1) DEFAULT 0 COMMENT 'Articolo pubblicato',
  `published_at` timestamp NULL DEFAULT NULL COMMENT 'Data pubblicazione',
  `featured` tinyint(1) DEFAULT 0 COMMENT 'Articolo in evidenza',
  `views_count` int(11) DEFAULT 0 COMMENT 'Numero visualizzazioni',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `bs_attivita`
--

CREATE TABLE `bs_attivita` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_bene` int(10) UNSIGNED NOT NULL,
  `id_utente_utilizzatore` int(10) UNSIGNED NOT NULL,
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
-- Struttura della tabella `catalogo_selezioni`
--

CREATE TABLE `catalogo_selezioni` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `nome` varchar(100) NOT NULL,
  `slug` varchar(120) NOT NULL,
  `descrizione` text DEFAULT NULL,
  `layout` enum('grid','list','carousel') DEFAULT 'grid',
  `prodotti_per_riga` int(10) UNSIGNED DEFAULT 4,
  `mostra_prezzo` tinyint(1) DEFAULT 1,
  `mostra_giacenza` tinyint(1) DEFAULT 1,
  `mostra_descrizione` tinyint(1) DEFAULT 1,
  `attivo` tinyint(1) DEFAULT 1,
  `ordine_visualizzazione` int(11) DEFAULT 0,
  `colore_sfondo` varchar(20) DEFAULT NULL,
  `colore_testo` varchar(20) DEFAULT NULL,
  `colore_accento` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `catalogo_selezioni_articoli`
--

CREATE TABLE `catalogo_selezioni_articoli` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_selezione` int(10) UNSIGNED NOT NULL,
  `id_articolo` int(10) UNSIGNED NOT NULL,
  `ordine` int(11) DEFAULT 0,
  `etichetta_personalizzata` varchar(50) DEFAULT NULL,
  `in_evidenza` tinyint(1) DEFAULT 0,
  `note_interne` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `cleanup_stats`
--

CREATE TABLE `cleanup_stats` (
  `id` int(11) NOT NULL,
  `cleanup_date` datetime NOT NULL DEFAULT current_timestamp(),
  `s3_files_deleted` int(11) DEFAULT 0,
  `local_files_deleted` int(11) DEFAULT 0,
  `db_records_deleted` int(11) DEFAULT 0,
  `tracking_logs_deleted` int(11) DEFAULT 0,
  `duration_ms` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `visibile_sito` tinyint(1) DEFAULT 0 COMMENT 'Visibile sul sito web aziendale',
  `id_stato_entita` int(10) UNSIGNED DEFAULT NULL,
  `created_by` int(10) UNSIGNED DEFAULT NULL COMMENT 'ID dell''utente che ha creato l''entità',
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
  `created_by` int(10) UNSIGNED NOT NULL,
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
  `created_by` int(10) UNSIGNED NOT NULL
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
  `id_sottoconto_collegato` int(11) DEFAULT NULL COMMENT 'ID del sottoconto collegato (da tabella sottoconti)',
  `max_utenti_interni` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Numero massimo di utenti interni concorrenti',
  `max_utenti_esterni` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Numero massimo di utenti esterni concorrenti',
  `max_storage_mb` int(10) UNSIGNED NOT NULL DEFAULT 1000,
  `current_storage_bytes` bigint(20) UNSIGNED NOT NULL DEFAULT 0,
  `url_slug` varchar(100) DEFAULT NULL COMMENT 'Slug URL per il sito web',
  `shop_colore_primario` varchar(7) DEFAULT '#000000',
  `shop_colore_secondario` varchar(7) DEFAULT '#ffffff',
  `shop_attivo` tinyint(1) DEFAULT 0,
  `id_web_template` int(10) UNSIGNED DEFAULT NULL,
  `shop_banner_url` varchar(500) DEFAULT NULL,
  `shop_descrizione_home` text DEFAULT NULL,
  `shop_template` varchar(50) DEFAULT 'standard' COMMENT 'Template grafico del sito (standard, fashion, industrial)',
  `catalog_listino_tipo` enum('pubblico','cessione') DEFAULT 'pubblico',
  `catalog_listino_index` int(10) UNSIGNED DEFAULT 1 COMMENT 'Indice listino 1-6 da utilizzare',
  `catalog_mostra_esauriti` tinyint(1) DEFAULT 1 COMMENT 'Mostra prodotti con giacenza 0',
  `catalog_mostra_ricerca` tinyint(1) DEFAULT 1 COMMENT 'Mostra barra di ricerca prodotti',
  `catalog_mostra_filtri` tinyint(1) DEFAULT 1 COMMENT 'Mostra filtri laterali categorie',
  `shop_colore_sfondo_blocchi` varchar(7) DEFAULT '#ffffff' COMMENT 'Colore di sfondo comune per tutti i blocchi del sito',
  `shop_colore_header_sfondo` varchar(7) DEFAULT '#ffffff',
  `shop_colore_header_testo` varchar(7) DEFAULT '#333333',
  `shop_logo_posizione` enum('left','center','right') DEFAULT 'left'
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
-- Struttura della tabella `dm_allegati_link`
--

CREATE TABLE `dm_allegati_link` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `id_file` int(10) UNSIGNED NOT NULL,
  `entita_tipo` varchar(50) NOT NULL,
  `entita_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `dm_files`
--

CREATE TABLE `dm_files` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `id_utente_upload` int(10) UNSIGNED DEFAULT NULL,
  `file_name_originale` varchar(255) NOT NULL,
  `file_size_bytes` bigint(20) UNSIGNED NOT NULL DEFAULT 0,
  `mime_type` varchar(100) DEFAULT NULL,
  `visibile_sito` tinyint(1) DEFAULT 0 COMMENT 'Visibile sul sito web aziendale',
  `privacy` enum('private','public') NOT NULL DEFAULT 'private',
  `s3_key` varchar(512) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `download_tracking`
--

CREATE TABLE `download_tracking` (
  `id` int(11) NOT NULL,
  `download_id` varchar(255) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `user_agent` text DEFAULT NULL,
  `timestamp` datetime NOT NULL DEFAULT current_timestamp(),
  `referer` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `email_inviate`
--

CREATE TABLE `email_inviate` (
  `id` int(11) NOT NULL,
  `id_ditta` int(10) UNSIGNED DEFAULT NULL,
  `id_utente_mittente` int(10) UNSIGNED NOT NULL,
  `destinatari` text NOT NULL,
  `cc` text DEFAULT NULL,
  `bcc` text DEFAULT NULL,
  `oggetto` varchar(255) DEFAULT NULL,
  `corpo` longtext DEFAULT NULL,
  `data_invio` timestamp NOT NULL DEFAULT current_timestamp(),
  `aperta` tinyint(1) DEFAULT 0,
  `data_prima_apertura` timestamp NULL DEFAULT NULL,
  `tracking_id` varchar(255) NOT NULL,
  `open_count` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `email_nascoste`
--

CREATE TABLE `email_nascoste` (
  `id_utente` int(10) UNSIGNED NOT NULL,
  `email_uid` int(11) NOT NULL,
  `data_cancellazione` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `email_open_tracking`
--

CREATE TABLE `email_open_tracking` (
  `id` int(11) NOT NULL,
  `tracking_id` varchar(255) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `opened_at` datetime DEFAULT NULL,
  `open_count` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
-- Struttura della tabella `immagini_sito_web`
--

CREATE TABLE `immagini_sito_web` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_sito_web` int(10) UNSIGNED NOT NULL,
  `id_file` int(10) UNSIGNED NOT NULL,
  `blocco_sezione` varchar(50) DEFAULT 'content',
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
  `id_utente` int(10) UNSIGNED NOT NULL
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
  `id_utente` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED DEFAULT NULL,
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
  `id_utente` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `azione` varchar(255) NOT NULL,
  `dettagli` text DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `modulo` varchar(255) DEFAULT NULL,
  `funzione` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `ls_liste_righe`
--

CREATE TABLE `ls_liste_righe` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_testata` int(10) UNSIGNED NOT NULL,
  `id_articolo` int(10) UNSIGNED NOT NULL,
  `quantita` decimal(12,4) NOT NULL DEFAULT 0.0000,
  `prezzo_unitario` decimal(12,4) DEFAULT NULL,
  `sconto_percentuale` decimal(5,2) DEFAULT 0.00,
  `sconto_importo` decimal(12,4) DEFAULT 0.0000,
  `prezzo_netto` decimal(12,4) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `ordine` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `ls_liste_testata`
--

CREATE TABLE `ls_liste_testata` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `codice` varchar(20) NOT NULL,
  `descrizione` varchar(255) NOT NULL,
  `id_causale_movimento` int(10) UNSIGNED NOT NULL COMMENT 'Causale di movimento che definisce il tipo di lista',
  `id_ditta_destinataria` int(10) UNSIGNED DEFAULT NULL COMMENT 'Ditta cliente/fornitore controparte del movimento',
  `id_magazzino` int(10) UNSIGNED DEFAULT NULL COMMENT 'Magazzino di riferimento per i movimenti',
  `data_riferimento` date NOT NULL,
  `stato` enum('BOZZA','PROCESSATO','ANNULLATO') NOT NULL DEFAULT 'BOZZA',
  `id_documento_generato` int(10) UNSIGNED DEFAULT NULL COMMENT 'ID del documento generato (es. ID di un movimento)',
  `tipo_documento_generato` varchar(50) DEFAULT NULL COMMENT 'Tipo di documento generato (es. mg_movimenti)',
  `meta_dati` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Dati aggiuntivi specifici (es. note interne, condizioni particolari)' CHECK (json_valid(`meta_dati`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` int(10) UNSIGNED DEFAULT NULL COMMENT 'Utente che ha creato la lista',
  `updated_by` int(10) UNSIGNED DEFAULT NULL COMMENT 'Utente che ha modificato la lista',
  `numero` int(11) DEFAULT NULL COMMENT 'Numero progressivo univoco della lista'
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
  `id_utente` int(10) UNSIGNED NOT NULL,
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
  `chiave_componente` varchar(50) DEFAULT NULL,
  `icon_name` varchar(50) DEFAULT NULL,
  `permission_required` varchar(100) DEFAULT NULL,
  `ordine` int(11) DEFAULT 0,
  `attivo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `pagine_sito_web`
--

CREATE TABLE `pagine_sito_web` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_sito_web` int(10) UNSIGNED NOT NULL,
  `slug` varchar(200) NOT NULL COMMENT 'Slug URL pagina',
  `titolo` varchar(255) NOT NULL COMMENT 'Titolo pagina',
  `contenuto_html` longtext DEFAULT NULL COMMENT 'Contenuto HTML statico',
  `contenuto_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Contenuto strutturato per page builder' CHECK (json_valid(`contenuto_json`)),
  `ai_generated` tinyint(1) DEFAULT 0 COMMENT 'Pagina generata con AI',
  `ai_generation_prompt` text DEFAULT NULL COMMENT 'Prompt usato per generazione',
  `ai_confidence_score` decimal(5,2) DEFAULT NULL COMMENT 'Score confidence AI (0.00-1.00)',
  `ai_content_sections` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Sezioni generate da AI' CHECK (json_valid(`ai_content_sections`)),
  `ai_enhancements` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Miglioramenti AI applicati' CHECK (json_valid(`ai_enhancements`)),
  `ai_seo_metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'SEO metadata generato da AI' CHECK (json_valid(`ai_seo_metadata`)),
  `ai_optimized_for_mobile` tinyint(1) DEFAULT 0 COMMENT 'Ottimizzato per mobile da AI',
  `ai_improvement_suggestions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Suggerimenti miglioramento AI' CHECK (json_valid(`ai_improvement_suggestions`)),
  `ai_alternative_versions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Versioni alternative generate da AI' CHECK (json_valid(`ai_alternative_versions`)),
  `meta_title` varchar(255) DEFAULT NULL COMMENT 'Meta title SEO',
  `meta_description` text DEFAULT NULL COMMENT 'Meta description SEO',
  `meta_keywords` varchar(500) DEFAULT NULL COMMENT 'Meta keywords SEO',
  `is_published` tinyint(1) DEFAULT 0 COMMENT 'Pagina pubblicata',
  `menu_order` int(11) DEFAULT 0 COMMENT 'Ordine menu navigazione',
  `template_name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `background_type` varchar(20) DEFAULT 'color' COMMENT 'Tipo background: color, gradient, image',
  `background_color` varchar(50) DEFAULT NULL COMMENT 'Colore background es. #ffffff',
  `background_gradient` varchar(200) DEFAULT NULL COMMENT 'Gradiente background es. linear-gradient(45deg, #667eea, #764ba2)',
  `background_image` varchar(500) DEFAULT NULL COMMENT 'URL immagine di background',
  `background_size` enum('cover','contain','auto') DEFAULT 'cover' COMMENT 'Dimensione immagine background',
  `background_position` enum('center','top','bottom','left','right') DEFAULT 'center' COMMENT 'Posizione immagine background',
  `background_repeat` enum('no-repeat','repeat','repeat-x','repeat-y') DEFAULT 'no-repeat' COMMENT 'Ripetizione immagine background',
  `background_attachment` varchar(20) DEFAULT 'scroll' COMMENT 'Background attachment: scroll, fixed',
  `font_family` varchar(100) DEFAULT 'Inter' COMMENT 'Font family principale',
  `font_size` varchar(20) DEFAULT '16' COMMENT 'Dimensione font base in px',
  `font_color` varchar(50) DEFAULT '#333333' COMMENT 'Colore testo principale',
  `heading_font` varchar(100) DEFAULT NULL COMMENT 'Font family per titoli',
  `heading_color` varchar(50) DEFAULT '#1a1a1a' COMMENT 'Colore titoli',
  `container_max_width` varchar(50) DEFAULT '1200px' COMMENT 'Larghezza massima container',
  `padding_top` varchar(20) DEFAULT '60px' COMMENT 'Padding superiore pagina',
  `padding_bottom` varchar(20) DEFAULT '60px' COMMENT 'Padding inferiore pagina',
  `custom_css` text DEFAULT NULL COMMENT 'CSS personalizzato aggiuntivo',
  `style_config` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT '{}' COMMENT 'Configurazione stili in formato JSON' CHECK (json_valid(`style_config`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_utente` int(10) UNSIGNED NOT NULL COMMENT 'FK all''utente che ha richiesto il reset.',
  `token` varchar(255) NOT NULL COMMENT 'HASH del token di reset inviato all''utente.',
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'Data e ora di scadenza del token.',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
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
  `ID_UtenteCreatore` int(10) UNSIGNED DEFAULT NULL,
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
  `ID_Utente` int(10) UNSIGNED NOT NULL
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
  `id_ruolo` int(10) UNSIGNED DEFAULT NULL,
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
  `natura` varchar(20) DEFAULT NULL,
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
  `id_utente` int(10) UNSIGNED NOT NULL,
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
-- Struttura della tabella `siti_web_aziendali`
--

CREATE TABLE `siti_web_aziendali` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `subdomain` varchar(100) NOT NULL COMMENT 'Sottodominio univoco',
  `domain_status` enum('active','inactive','pending') DEFAULT 'pending' COMMENT 'Stato dominio',
  `template_id` int(11) DEFAULT 1 COMMENT 'ID template predefinito',
  `theme_config` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Configurazione tema personalizzata' CHECK (json_valid(`theme_config`)),
  `site_title` varchar(255) DEFAULT NULL COMMENT 'Titolo sito web',
  `site_description` text DEFAULT NULL COMMENT 'Descrizione per SEO',
  `logo_url` varchar(500) DEFAULT NULL COMMENT 'URL logo azienda',
  `favicon_url` varchar(500) DEFAULT NULL COMMENT 'URL favicon',
  `google_analytics_id` varchar(50) DEFAULT NULL COMMENT 'ID Google Analytics',
  `facebook_url` varchar(500) DEFAULT NULL COMMENT 'URL Facebook',
  `instagram_url` varchar(500) DEFAULT NULL COMMENT 'URL Instagram',
  `linkedin_url` varchar(500) DEFAULT NULL COMMENT 'URL LinkedIn',
  `enable_catalog` tinyint(1) DEFAULT 0 COMMENT 'Abilita vetrina prodotti',
  `catalog_settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT '{}' COMMENT 'Impostazioni catalogo prodotti' CHECK (json_valid(`catalog_settings`)),
  `ai_generated` tinyint(1) DEFAULT 0 COMMENT 'Sito generato con AI',
  `ai_company_context` text DEFAULT NULL COMMENT 'Contesto aziendale usato per AI generation',
  `ai_model_version` varchar(20) DEFAULT NULL COMMENT 'Versione modello AI usato',
  `ai_generation_metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Metadata generazione AI' CHECK (json_valid(`ai_generation_metadata`)),
  `ai_suggestions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Suggerimenti miglioramento AI' CHECK (json_valid(`ai_suggestions`)),
  `ai_seo_optimizations` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Ottimizzazioni SEO AI' CHECK (json_valid(`ai_seo_optimizations`)),
  `ai_enhanced_content` tinyint(1) DEFAULT 0 COMMENT 'Contenuti migliorati con AI',
  `ai_last_analysis` timestamp NULL DEFAULT NULL COMMENT 'Ultima analisi AI',
  `deploy_status` varchar(20) DEFAULT 'pending',
  `deploy_domain` varchar(255) DEFAULT NULL,
  `deploy_path` varchar(500) DEFAULT NULL,
  `deployed_at` timestamp NULL DEFAULT NULL,
  `deploy_error` text DEFAULT NULL,
  `cleaned_at` timestamp NULL DEFAULT NULL,
  `vps_config` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`vps_config`)),
  `published_url` varchar(500) DEFAULT NULL,
  `total_deploys` int(11) DEFAULT 0,
  `last_deploy_success` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `global_background_type` varchar(20) DEFAULT 'color' COMMENT 'Tipo background globale: color, gradient, image',
  `global_background_color` varchar(50) DEFAULT '#ffffff' COMMENT 'Colore background globale',
  `global_background_gradient` varchar(200) DEFAULT NULL COMMENT 'Gradiente background globale',
  `global_background_image` varchar(500) DEFAULT NULL COMMENT 'URL immagine di background globale',
  `global_background_size` enum('cover','contain','auto') DEFAULT 'cover' COMMENT 'Dimensione immagine background globale',
  `global_background_position` enum('center','top','bottom','left','right') DEFAULT 'center' COMMENT 'Posizione immagine background globale',
  `global_background_repeat` enum('no-repeat','repeat','repeat-x','repeat-y') DEFAULT 'no-repeat' COMMENT 'Ripetizione immagine background globale',
  `global_background_attachment` varchar(20) DEFAULT 'scroll' COMMENT 'Background attachment globale: scroll, fixed',
  `global_font_family` varchar(100) DEFAULT 'Inter' COMMENT 'Font family principale globale',
  `global_font_size` varchar(20) DEFAULT '16' COMMENT 'Dimensione font base globale in px',
  `global_font_color` varchar(50) DEFAULT '#333333' COMMENT 'Colore testo principale globale',
  `global_heading_font` varchar(100) DEFAULT 'Inter' COMMENT 'Font family per titoli globale',
  `global_heading_color` varchar(50) DEFAULT '#1a1a1a' COMMENT 'Colore titoli globale',
  `primary_color` varchar(50) DEFAULT '#3B82F6' COMMENT 'Colore primario del sito',
  `secondary_color` varchar(50) DEFAULT '#64748B' COMMENT 'Colore secondario del sito',
  `accent_color` varchar(50) DEFAULT '#EF4444' COMMENT 'Colore d''accento del sito',
  `button_background_color` varchar(50) DEFAULT '#3B82F6' COMMENT 'Colore sfondo pulsanti',
  `button_text_color` varchar(50) DEFAULT '#ffffff' COMMENT 'Colore testo pulsanti',
  `link_color` varchar(50) DEFAULT '#2563EB' COMMENT 'Colore link',
  `global_container_max_width` varchar(50) DEFAULT '1200px' COMMENT 'Larghezza massima container globale',
  `global_padding_top` varchar(20) DEFAULT '60px' COMMENT 'Padding superiore pagina globale',
  `global_padding_bottom` varchar(20) DEFAULT '60px' COMMENT 'Padding inferiore pagina globale',
  `global_custom_css` text DEFAULT NULL COMMENT 'CSS personalizzato globale aggiuntivo',
  `global_style_config` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT '{}' COMMENT 'Configurazione stili globali in formato JSON' CHECK (json_valid(`global_style_config`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `stati_lettura`
--

CREATE TABLE `stati_lettura` (
  `id_utente` int(11) NOT NULL,
  `email_uid` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `template_siti_web`
--

CREATE TABLE `template_siti_web` (
  `id` int(10) UNSIGNED NOT NULL,
  `nome_template` varchar(100) NOT NULL COMMENT 'Nome template',
  `categoria` enum('basic','premium','ecommerce') DEFAULT 'basic' COMMENT 'Categoria template',
  `description` text DEFAULT NULL COMMENT 'Descrizione template',
  `preview_image` varchar(500) DEFAULT NULL COMMENT 'Immagine anteprima',
  `config_schema` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Schema configurazione template' CHECK (json_valid(`config_schema`)),
  `is_active` tinyint(1) DEFAULT 1 COMMENT 'Template disponibile',
  `sort_order` int(11) DEFAULT 0 COMMENT 'Ordine visualizzazione',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
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
  `id_utente` int(10) UNSIGNED NOT NULL,
  `id_funzione` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `utenti`
--

CREATE TABLE `utenti` (
  `id` int(10) UNSIGNED NOT NULL,
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
  `verification_token` varchar(255) DEFAULT NULL,
  `tentativi_falliti` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Contatore per tentativi di login falliti',
  `stato` enum('attivo','bloccato') NOT NULL DEFAULT 'attivo' COMMENT 'Stato dell''account utente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `utenti_funzioni_override`
--

CREATE TABLE `utenti_funzioni_override` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_utente` int(10) UNSIGNED NOT NULL,
  `id_funzione` int(11) NOT NULL COMMENT 'FK alla funzione specifica oggetto dell''override.',
  `azione` enum('allow','deny') NOT NULL COMMENT 'Specifica se il permesso viene concesso (allow) o revocato (deny).',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `id_ditta` int(10) UNSIGNED NOT NULL DEFAULT 1 COMMENT 'FK alla ditta a cui si applica l''override.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `utenti_sessioni_attive`
--

CREATE TABLE `utenti_sessioni_attive` (
  `id_utente` int(10) UNSIGNED NOT NULL,
  `id_ditta_attiva` int(10) UNSIGNED NOT NULL COMMENT 'Riferimento alla ditta della sessione attiva',
  `login_timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_heartbeat_timestamp` timestamp NOT NULL DEFAULT current_timestamp()
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
-- Struttura della tabella `va_clienti`
--

CREATE TABLE `va_clienti` (
  `id` int(10) UNSIGNED NOT NULL,
  `ragione_sociale` varchar(255) NOT NULL,
  `partita_iva` varchar(255) DEFAULT NULL,
  `indirizzo` varchar(255) DEFAULT NULL,
  `cap` varchar(255) DEFAULT NULL,
  `comune` varchar(255) DEFAULT NULL,
  `provincia` varchar(255) DEFAULT NULL,
  `stato` enum('Attivo','Sospeso','Bloccato') DEFAULT 'Attivo',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `va_clienti_anagrafica`
--

CREATE TABLE `va_clienti_anagrafica` (
  `id` int(10) UNSIGNED NOT NULL,
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
-- Struttura della tabella `va_contratti`
--

CREATE TABLE `va_contratti` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `codice_contratto` varchar(100) DEFAULT NULL,
  `descrizione` text DEFAULT NULL,
  `data_inizio` date DEFAULT NULL,
  `data_fine` date DEFAULT NULL,
  `file_url` varchar(255) DEFAULT NULL
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
-- Struttura della tabella `va_matrice_sconti_righe`
--

CREATE TABLE `va_matrice_sconti_righe` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_matrice` int(10) UNSIGNED NOT NULL COMMENT 'Riferimento alla matrice sconti principale',
  `riga` int(11) NOT NULL COMMENT 'Numero progressivo della riga',
  `sconto_1` decimal(5,2) DEFAULT 0.00 COMMENT 'Primo livello di sconto',
  `sconto_2` decimal(5,2) DEFAULT 0.00 COMMENT 'Secondo livello di sconto',
  `sconto_3` decimal(5,2) DEFAULT 0.00 COMMENT 'Terzo livello di sconto',
  `sconto_4` decimal(5,2) DEFAULT 0.00 COMMENT 'Quarto livello di sconto',
  `sconto_5` decimal(5,2) DEFAULT 0.00 COMMENT 'Quinto livello di sconto',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `va_matrici_sconti`
--

CREATE TABLE `va_matrici_sconti` (
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
  `id_utente_referente` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura stand-in per le viste `v_wg_galleries_complete`
-- (Vedi sotto per la vista effettiva)
--
CREATE TABLE `v_wg_galleries_complete` (
`id` int(10) unsigned
,`id_sito_web` int(10) unsigned
,`id_pagina` int(10) unsigned
,`nome_galleria` varchar(255)
,`slug` varchar(200)
,`descrizione` text
,`layout` enum('grid-2','grid-3','grid-4','masonry','carousel')
,`impostazioni` longtext
,`meta_title` varchar(255)
,`meta_description` text
,`is_active` tinyint(1)
,`sort_order` int(11)
,`created_at` timestamp
,`updated_at` timestamp
,`numero_immagini` bigint(21)
,`prima_posizione` int(11)
,`ultima_modifica_immagini` timestamp
);

-- --------------------------------------------------------

--
-- Struttura stand-in per le viste `v_wg_gallery_images_complete`
-- (Vedi sotto per la vista effettiva)
--
CREATE TABLE `v_wg_gallery_images_complete` (
`id` int(10) unsigned
,`id_galleria` int(10) unsigned
,`id_file` int(10) unsigned
,`caption` text
,`alt_text` varchar(500)
,`title_text` varchar(255)
,`order_pos` int(11)
,`impostazioni` longtext
,`created_at` timestamp
,`updated_at` timestamp
,`nome_galleria` varchar(255)
,`id_sito_web` int(10) unsigned
,`id_pagina` int(10) unsigned
,`file_name_originale` varchar(255)
,`mime_type` varchar(100)
,`file_size_bytes` bigint(20) unsigned
,`s3_key` varchar(512)
,`url_file` text
,`preview_url` text
,`file_created_at` timestamp
,`file_updated_at` timestamp
);

-- --------------------------------------------------------

--
-- Struttura della tabella `website_activity_log`
--

CREATE TABLE `website_activity_log` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_sito_web` int(10) UNSIGNED NOT NULL,
  `id_utente` int(11) DEFAULT NULL COMMENT 'ID utente (se applicabile)',
  `azione` varchar(50) NOT NULL COMMENT 'Tipo di attività (create, update, delete, publish, etc.)',
  `tipo_oggetto` varchar(50) NOT NULL COMMENT 'Tipo oggetto (site, page, template, image, etc.)',
  `id_oggetto` int(11) DEFAULT NULL COMMENT 'ID oggetto modificato',
  `descrizione_oggetto` varchar(255) DEFAULT NULL COMMENT 'Descrizione oggetto (es. titolo pagina)',
  `dati_prima` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Stato prima modifica' CHECK (json_valid(`dati_prima`)),
  `dati_dopo` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Stato dopo modifica' CHECK (json_valid(`dati_dopo`)),
  `ip_address` varchar(45) DEFAULT NULL COMMENT 'IP client',
  `user_agent` text DEFAULT NULL COMMENT 'User agent browser',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `website_analytics`
--

CREATE TABLE `website_analytics` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_sito_web` int(10) UNSIGNED NOT NULL,
  `data_giorno` date NOT NULL,
  `visite_totali` int(11) DEFAULT 0 COMMENT 'Visite totali giornata',
  `visite_uniche` int(11) DEFAULT 0 COMMENT 'Visitatori unici',
  `visualizzazioni_pagina` int(11) DEFAULT 0 COMMENT 'Visualizzazioni pagine',
  `visite_organiche` int(11) DEFAULT 0 COMMENT 'Visite da motori ricerca',
  `visite_social` int(11) DEFAULT 0 COMMENT 'Visite da social media',
  `visite_direct` int(11) DEFAULT 0 COMMENT 'Visite dirette',
  `visite_referral` int(11) DEFAULT 0 COMMENT 'Visite da referral',
  `visite_desktop` int(11) DEFAULT 0 COMMENT 'Visite da desktop',
  `visite_mobile` int(11) DEFAULT 0 COMMENT 'Visite da mobile',
  `visite_tablet` int(11) DEFAULT 0 COMMENT 'Visite da tablet',
  `tempo_medio_sessione` int(11) DEFAULT 0 COMMENT 'Tempo medio sessione (secondi)',
  `frequenza_rebound` decimal(5,2) DEFAULT 0.00 COMMENT 'Frequenza di rimbalzo (%)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `web_blog_categories`
--

CREATE TABLE `web_blog_categories` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `nome` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `colore` varchar(7) DEFAULT '#2563eb',
  `descrizione` text DEFAULT NULL,
  `ordine` int(11) DEFAULT 0,
  `attivo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `web_blog_posts`
--

CREATE TABLE `web_blog_posts` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `id_category` int(10) UNSIGNED DEFAULT NULL,
  `titolo` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `descrizione_breve` text DEFAULT NULL,
  `contenuto` longtext DEFAULT NULL,
  `autore` varchar(255) DEFAULT NULL,
  `copertina_url` varchar(500) DEFAULT NULL,
  `copertina_alt` varchar(255) DEFAULT NULL,
  `pdf_url` varchar(500) DEFAULT NULL,
  `pdf_filename` varchar(255) DEFAULT NULL,
  `pubblicato` tinyint(1) DEFAULT 0,
  `in_evidenza` tinyint(1) DEFAULT 0,
  `data_pubblicazione` datetime DEFAULT NULL,
  `data_scadenza` datetime DEFAULT NULL,
  `visualizzazioni` int(11) DEFAULT 0,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `meta_keywords` varchar(500) DEFAULT NULL,
  `seo_slug` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `pdf_downloadable` tinyint(1) NOT NULL DEFAULT 1 COMMENT '1 if PDF is downloadable, 0 if view-only'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `web_pages`
--

CREATE TABLE `web_pages` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `slug` varchar(100) NOT NULL,
  `titolo_seo` varchar(200) DEFAULT NULL,
  `descrizione_seo` varchar(250) DEFAULT NULL,
  `pubblicata` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `titolo_pagina` varchar(255) DEFAULT NULL COMMENT 'Titolo H1 della pagina',
  `keywords_seo` text DEFAULT NULL COMMENT 'Meta keywords per SEO',
  `immagine_social` varchar(500) DEFAULT NULL COMMENT 'URL immagine per social media (Open Graph)',
  `id_page_parent` int(11) DEFAULT NULL COMMENT 'ID pagina parent per menu gerarchico',
  `ordine_menu` int(11) DEFAULT 0 COMMENT 'Ordinamento nel menu',
  `livello_menu` int(11) DEFAULT 1 COMMENT 'Livello nel menu gerarchico',
  `mostra_menu` tinyint(1) DEFAULT 1 COMMENT 'Mostra nel menu di navigazione',
  `link_esterno` varchar(500) DEFAULT NULL COMMENT 'Link esterno (se specificato, il link punta qui)',
  `target_link` enum('_self','_blank') DEFAULT '_self' COMMENT 'Target per link esterno',
  `icona_menu` varchar(100) DEFAULT NULL COMMENT 'Icona per menu (fontawesome o heroicons)',
  `data_pubblicazione` datetime DEFAULT NULL COMMENT 'Data di pubblicazione programmata',
  `data_scadenza` datetime DEFAULT NULL COMMENT 'Data scadenza pubblicazione',
  `password_protetta` varchar(255) DEFAULT NULL COMMENT 'Password per protezione pagina',
  `layout_template` varchar(50) DEFAULT 'default' COMMENT 'Template layout specifico per pagina',
  `canonical_url` varchar(500) DEFAULT NULL COMMENT 'URL canonical per SEO',
  `robots_index` enum('index','noindex') DEFAULT 'index' COMMENT 'Directiva robots per indicizzazione',
  `robots_follow` enum('follow','nofollow') DEFAULT 'follow' COMMENT 'Directiva robots per follow'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `web_page_components`
--

CREATE TABLE `web_page_components` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_page` int(10) UNSIGNED NOT NULL,
  `tipo_componente` varchar(50) NOT NULL,
  `ordine` int(11) DEFAULT 0,
  `dati_config` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`dati_config`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `web_page_revisions`
--

CREATE TABLE `web_page_revisions` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_page` int(10) UNSIGNED NOT NULL,
  `id_utente` int(10) UNSIGNED NOT NULL,
  `contenuto` text NOT NULL,
  `motivo_revision` varchar(255) DEFAULT 'Aggiornamento automatico',
  `data_revision` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `web_templates`
--

CREATE TABLE `web_templates` (
  `id` int(10) UNSIGNED NOT NULL,
  `codice` varchar(50) NOT NULL,
  `nome` varchar(100) DEFAULT NULL,
  `descrizione` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `wg_galleries`
--

CREATE TABLE `wg_galleries` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_sito_web` int(10) UNSIGNED NOT NULL COMMENT 'FK verso siti_web_aziendali',
  `id_pagina` int(10) UNSIGNED DEFAULT NULL COMMENT 'FK verso pagine_sito_web - NULL per gallerie globali',
  `nome_galleria` varchar(255) NOT NULL COMMENT 'Nome identificativo galleria',
  `slug` varchar(200) DEFAULT NULL COMMENT 'URL slug per gallerie pubbliche',
  `descrizione` text DEFAULT NULL COMMENT 'Descrizione galleria',
  `layout` enum('grid-2','grid-3','grid-4','masonry','carousel') DEFAULT 'grid-3' COMMENT 'Layout visualizzazione',
  `impostazioni` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT '{}' COMMENT 'Impostazioni aggiuntive (spacing, borders, effects, etc.)' CHECK (json_valid(`impostazioni`)),
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1 COMMENT 'Galleria visibile/pubblicata',
  `sort_order` int(11) DEFAULT 0 COMMENT 'Ordine visualizzazione',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Trigger `wg_galleries`
--
DELIMITER $$
CREATE TRIGGER `tr_wg_galleries_before_insert` BEFORE INSERT ON `wg_galleries` FOR EACH ROW BEGIN
      IF NEW.slug IS NULL OR NEW.slug = '' THEN
        SET NEW.slug = LOWER(REPLACE(REPLACE(REPLACE(NEW.nome_galleria, ' ', '-'), '/', '-'), '_', '-'));
        -- Rimuovi caratteri non validi
        SET NEW.slug = REGEXP_REPLACE(NEW.slug, '[^a-z0-9-]', '');
        -- Assicura che finisca senza trattini multipli
        SET NEW.slug = REGEXP_REPLACE(NEW.slug, '-+', '-');
        SET NEW.slug = TRIM(BOTH '-' FROM NEW.slug);
      END IF;
    END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_wg_galleries_before_update` BEFORE UPDATE ON `wg_galleries` FOR EACH ROW BEGIN
      IF NEW.nome_galleria <> OLD.nome_galleria AND (NEW.slug IS NULL OR NEW.slug = '') THEN
        SET NEW.slug = LOWER(REPLACE(REPLACE(REPLACE(NEW.nome_galleria, ' ', '-'), '/', '-'), '_', '-'));
        SET NEW.slug = REGEXP_REPLACE(NEW.slug, '[^a-z0-9-]', '');
        SET NEW.slug = REGEXP_REPLACE(NEW.slug, '-+', '-');
        SET NEW.slug = TRIM(BOTH '-' FROM NEW.slug);
      END IF;
    END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Struttura della tabella `wg_gallery_images`
--

CREATE TABLE `wg_gallery_images` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_galleria` int(10) UNSIGNED NOT NULL COMMENT 'FK verso wg_galleries',
  `id_file` int(10) UNSIGNED NOT NULL COMMENT 'FK verso dm_files (immagine)',
  `caption` text DEFAULT NULL COMMENT 'Didascalia immagine',
  `alt_text` varchar(500) DEFAULT NULL COMMENT 'Testo alternativo per SEO/Accessibilità',
  `title_text` varchar(255) DEFAULT NULL COMMENT 'Titolo immagine (tooltip)',
  `order_pos` int(11) NOT NULL DEFAULT 0 COMMENT 'Posizione nella galleria',
  `impostazioni` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT '{}' COMMENT 'Impostazioni singola immagine (link, effetti, etc.)' CHECK (json_valid(`impostazioni`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura per vista `v_wg_galleries_complete`
--
DROP TABLE IF EXISTS `v_wg_galleries_complete`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_wg_galleries_complete`  AS SELECT `g`.`id` AS `id`, `g`.`id_sito_web` AS `id_sito_web`, `g`.`id_pagina` AS `id_pagina`, `g`.`nome_galleria` AS `nome_galleria`, `g`.`slug` AS `slug`, `g`.`descrizione` AS `descrizione`, `g`.`layout` AS `layout`, `g`.`impostazioni` AS `impostazioni`, `g`.`meta_title` AS `meta_title`, `g`.`meta_description` AS `meta_description`, `g`.`is_active` AS `is_active`, `g`.`sort_order` AS `sort_order`, `g`.`created_at` AS `created_at`, `g`.`updated_at` AS `updated_at`, count(`gi`.`id`) AS `numero_immagini`, min(`gi`.`order_pos`) AS `prima_posizione`, max(`gi`.`updated_at`) AS `ultima_modifica_immagini` FROM (`wg_galleries` `g` left join `wg_gallery_images` `gi` on(`g`.`id` = `gi`.`id_galleria`)) WHERE `g`.`is_active` = 1 GROUP BY `g`.`id` ;

-- --------------------------------------------------------

--
-- Struttura per vista `v_wg_gallery_images_complete`
--
DROP TABLE IF EXISTS `v_wg_gallery_images_complete`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_wg_gallery_images_complete`  AS SELECT `gi`.`id` AS `id`, `gi`.`id_galleria` AS `id_galleria`, `gi`.`id_file` AS `id_file`, `gi`.`caption` AS `caption`, `gi`.`alt_text` AS `alt_text`, `gi`.`title_text` AS `title_text`, `gi`.`order_pos` AS `order_pos`, `gi`.`impostazioni` AS `impostazioni`, `gi`.`created_at` AS `created_at`, `gi`.`updated_at` AS `updated_at`, `g`.`nome_galleria` AS `nome_galleria`, `g`.`id_sito_web` AS `id_sito_web`, `g`.`id_pagina` AS `id_pagina`, `f`.`file_name_originale` AS `file_name_originale`, `f`.`mime_type` AS `mime_type`, `f`.`file_size_bytes` AS `file_size_bytes`, `f`.`s3_key` AS `s3_key`, concat('https://s3.operocloud.it/',`f`.`s3_key`) AS `url_file`, concat('https://s3.operocloud.it/',`f`.`s3_key`) AS `preview_url`, `f`.`created_at` AS `file_created_at`, `f`.`updated_at` AS `file_updated_at` FROM ((`wg_gallery_images` `gi` join `wg_galleries` `g` on(`gi`.`id_galleria` = `g`.`id`)) join `dm_files` `f` on(`gi`.`id_file` = `f`.`id`)) WHERE `g`.`is_active` = 1 ;

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
-- Indici per le tabelle `ad_utenti_ditte`
--
ALTER TABLE `ad_utenti_ditte`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ad_utenti_ditte_id_utente_foreign` (`id_utente`),
  ADD KEY `ad_utenti_ditte_id_ditta_foreign` (`id_ditta`),
  ADD KEY `ad_utenti_ditte_id_ruolo_foreign` (`id_ruolo`);

--
-- Indici per le tabelle `ai_content_cache`
--
ALTER TABLE `ai_content_cache`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ai_content_cache_context_hash_unique` (`context_hash`),
  ADD KEY `idx_context_hash` (`context_hash`),
  ADD KEY `idx_ditta` (`id_ditta`),
  ADD KEY `idx_page_type` (`page_type`),
  ADD KEY `idx_expires_at` (`expires_at`);

--
-- Indici per le tabelle `ai_template_suggestions`
--
ALTER TABLE `ai_template_suggestions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ditta` (`id_ditta`),
  ADD KEY `idx_template_type` (`template_type`),
  ADD KEY `idx_match_score` (`match_score`),
  ADD KEY `idx_applied` (`applied`);

--
-- Indici per le tabelle `allegati_tracciati`
--
ALTER TABLE `allegati_tracciati`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `download_id_UNIQUE` (`download_id`),
  ADD KEY `id_email_inviata_idx` (`id_email_inviata`);

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
-- Indici per le tabelle `articoli_blog`
--
ALTER TABLE `articoli_blog`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_site_slug` (`id_sito_web`,`slug`),
  ADD KEY `idx_published` (`is_published`),
  ADD KEY `idx_featured` (`featured`),
  ADD KEY `idx_categoria` (`categoria`),
  ADD KEY `idx_published_at` (`published_at`);

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
-- Indici per le tabelle `catalogo_selezioni`
--
ALTER TABLE `catalogo_selezioni`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `catalogo_selezioni_slug_unique` (`slug`),
  ADD KEY `catalogo_selezioni_id_ditta_index` (`id_ditta`),
  ADD KEY `catalogo_selezioni_slug_index` (`slug`),
  ADD KEY `catalogo_selezioni_attivo_index` (`attivo`);

--
-- Indici per le tabelle `catalogo_selezioni_articoli`
--
ALTER TABLE `catalogo_selezioni_articoli`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `catalogo_selezioni_articoli_id_selezione_id_articolo_unique` (`id_selezione`,`id_articolo`),
  ADD KEY `catalogo_selezioni_articoli_id_selezione_index` (`id_selezione`),
  ADD KEY `catalogo_selezioni_articoli_id_articolo_index` (`id_articolo`),
  ADD KEY `catalogo_selezioni_articoli_ordine_index` (`ordine`);

--
-- Indici per le tabelle `cleanup_stats`
--
ALTER TABLE `cleanup_stats`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_cleanup_date` (`cleanup_date`);

--
-- Indici per le tabelle `ct_catalogo`
--
ALTER TABLE `ct_catalogo`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ct_catalogo_id_ditta_codice_entita_unique` (`id_ditta`,`codice_entita`),
  ADD KEY `ct_catalogo_id_categoria_foreign` (`id_categoria`),
  ADD KEY `ct_catalogo_id_unita_misura_foreign` (`id_unita_misura`),
  ADD KEY `ct_catalogo_id_aliquota_iva_foreign` (`id_aliquota_iva`),
  ADD KEY `ct_catalogo_id_stato_entita_foreign` (`id_stato_entita`),
  ADD KEY `idx_ct_catalogo_visibile_sito` (`visibile_sito`),
  ADD KEY `ct_catalogo_created_by_foreign` (`created_by`);

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
  ADD UNIQUE KEY `ditte_url_slug_unique` (`url_slug`),
  ADD KEY `id_tipo_ditta` (`id_tipo_ditta`),
  ADD KEY `fk_ditte_relazioni` (`codice_relazione`),
  ADD KEY `fk_ditte_sottoconto_puntovendita` (`id_sottoconto_puntovendita`),
  ADD KEY `id_sottoconto_cliente` (`id_sottoconto_cliente`),
  ADD KEY `id_sottoconto_fornitore` (`id_sottoconto_fornitore`),
  ADD KEY `id_sottoconto_fornitore_4` (`id_sottoconto_fornitore`),
  ADD KEY `ditte_url_slug_index` (`url_slug`),
  ADD KEY `ditte_id_web_template_foreign` (`id_web_template`);

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
-- Indici per le tabelle `dm_allegati_link`
--
ALTER TABLE `dm_allegati_link`
  ADD PRIMARY KEY (`id`),
  ADD KEY `dm_allegati_link_id_ditta_foreign` (`id_ditta`),
  ADD KEY `dm_allegati_link_id_file_foreign` (`id_file`),
  ADD KEY `dm_allegati_link_entita_tipo_entita_id_index` (`entita_tipo`,`entita_id`);

--
-- Indici per le tabelle `dm_files`
--
ALTER TABLE `dm_files`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `dm_files_s3_key_unique` (`s3_key`),
  ADD KEY `dm_files_id_ditta_foreign` (`id_ditta`),
  ADD KEY `dm_files_id_utente_upload_foreign` (`id_utente_upload`),
  ADD KEY `idx_dm_files_visibile_sito` (`visibile_sito`);

--
-- Indici per le tabelle `download_tracking`
--
ALTER TABLE `download_tracking`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_download_id` (`download_id`),
  ADD KEY `idx_timestamp` (`timestamp`),
  ADD KEY `idx_ip_address` (`ip_address`);

--
-- Indici per le tabelle `email_inviate`
--
ALTER TABLE `email_inviate`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tracking_id` (`tracking_id`),
  ADD KEY `id_utente_mittente` (`id_utente_mittente`),
  ADD KEY `id_ditta` (`id_ditta`),
  ADD KEY `idx_tracking_id` (`tracking_id`);

--
-- Indici per le tabelle `email_nascoste`
--
ALTER TABLE `email_nascoste`
  ADD PRIMARY KEY (`id_utente`,`email_uid`);

--
-- Indici per le tabelle `email_open_tracking`
--
ALTER TABLE `email_open_tracking`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tracking_id` (`tracking_id`),
  ADD KEY `idx_opened_at` (`opened_at`);

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
-- Indici per le tabelle `immagini_sito_web`
--
ALTER TABLE `immagini_sito_web`
  ADD PRIMARY KEY (`id`),
  ADD KEY `immagini_sito_web_id_sito_web_index` (`id_sito_web`),
  ADD KEY `immagini_sito_web_id_file_index` (`id_file`),
  ADD KEY `immagini_sito_web_id_sito_web_blocco_sezione_index` (`id_sito_web`,`blocco_sezione`);

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
  ADD KEY `id_utente_2` (`id_utente`),
  ADD KEY `log_accessi_id_ditta_foreign` (`id_ditta`);

--
-- Indici per le tabelle `log_azioni`
--
ALTER TABLE `log_azioni`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_utente` (`id_utente`),
  ADD KEY `id_ditta` (`id_ditta`),
  ADD KEY `id_utente_2` (`id_utente`);

--
-- Indici per le tabelle `ls_liste_righe`
--
ALTER TABLE `ls_liste_righe`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ls_liste_righe_id_testata_index` (`id_testata`),
  ADD KEY `ls_liste_righe_id_articolo_index` (`id_articolo`);

--
-- Indici per le tabelle `ls_liste_testata`
--
ALTER TABLE `ls_liste_testata`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ls_liste_testata_id_ditta_codice_unique` (`id_ditta`,`codice`),
  ADD UNIQUE KEY `uk_ls_liste_numero` (`id_ditta`,`numero`),
  ADD KEY `ls_liste_testata_id_ditta_index` (`id_ditta`),
  ADD KEY `ls_liste_testata_id_causale_movimento_index` (`id_causale_movimento`),
  ADD KEY `ls_liste_testata_stato_index` (`stato`),
  ADD KEY `ls_liste_testata_id_ditta_destinataria_foreign` (`id_ditta_destinataria`),
  ADD KEY `ls_liste_testata_id_magazzino_foreign` (`id_magazzino`),
  ADD KEY `ls_liste_testata_created_by_foreign` (`created_by`),
  ADD KEY `ls_liste_testata_updated_by_foreign` (`updated_by`);

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
-- Indici per le tabelle `pagine_sito_web`
--
ALTER TABLE `pagine_sito_web`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_site_slug` (`id_sito_web`,`slug`),
  ADD KEY `idx_published` (`is_published`),
  ADD KEY `idx_menu_order` (`menu_order`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `pagine_sito_web_background_type_index` (`background_type`),
  ADD KEY `pagine_sito_web_font_family_index` (`font_family`);

--
-- Indici per le tabelle `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `password_reset_tokens_token_unique` (`token`),
  ADD KEY `password_reset_tokens_id_utente_foreign` (`id_utente`),
  ADD KEY `password_reset_tokens_token_index` (`token`);

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
-- Indici per le tabelle `siti_web_aziendali`
--
ALTER TABLE `siti_web_aziendali`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `siti_web_aziendali_subdomain_unique` (`subdomain`),
  ADD KEY `idx_subdomain` (`subdomain`),
  ADD KEY `idx_ditta` (`id_ditta`),
  ADD KEY `idx_domain_status` (`domain_status`),
  ADD KEY `siti_web_aziendali_global_background_type_index` (`global_background_type`),
  ADD KEY `siti_web_aziendali_global_font_family_index` (`global_font_family`),
  ADD KEY `siti_web_aziendali_primary_color_index` (`primary_color`);

--
-- Indici per le tabelle `stati_lettura`
--
ALTER TABLE `stati_lettura`
  ADD PRIMARY KEY (`id_utente`,`email_uid`);

--
-- Indici per le tabelle `template_siti_web`
--
ALTER TABLE `template_siti_web`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_categoria` (`categoria`),
  ADD KEY `idx_is_active` (`is_active`),
  ADD KEY `idx_sort_order` (`sort_order`);

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
  ADD PRIMARY KEY (`id_utente`,`id_mail_account`);

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
  ADD KEY `utenti_funzioni_override_id_ditta_foreign` (`id_ditta`),
  ADD KEY `utenti_funzioni_override_id_funzione_foreign` (`id_funzione`);

--
-- Indici per le tabelle `utenti_sessioni_attive`
--
ALTER TABLE `utenti_sessioni_attive`
  ADD PRIMARY KEY (`id_utente`);

--
-- Indici per le tabelle `va_clienti`
--
ALTER TABLE `va_clienti`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `va_clienti_partita_iva_unique` (`partita_iva`);

--
-- Indici per le tabelle `va_clienti_anagrafica`
--
ALTER TABLE `va_clienti_anagrafica`
  ADD PRIMARY KEY (`id`),
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
-- Indici per le tabelle `va_matrice_sconti_righe`
--
ALTER TABLE `va_matrice_sconti_righe`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_va_matrice_sconti_righe_id_matrice` (`id_matrice`),
  ADD KEY `idx_va_matrice_sconti_righe_matrice_riga` (`id_matrice`,`riga`);

--
-- Indici per le tabelle `va_matrici_sconti`
--
ALTER TABLE `va_matrici_sconti`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `va_matrici_sconti_id_ditta_codice_unique` (`id_ditta`,`codice`);

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
-- Indici per le tabelle `website_activity_log`
--
ALTER TABLE `website_activity_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sito_web` (`id_sito_web`),
  ADD KEY `idx_azione` (`azione`),
  ADD KEY `idx_tipo_oggetto` (`tipo_oggetto`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indici per le tabelle `website_analytics`
--
ALTER TABLE `website_analytics`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_site_date` (`id_sito_web`,`data_giorno`),
  ADD KEY `idx_data_giorno` (`data_giorno`),
  ADD KEY `idx_visite_totali` (`visite_totali`);

--
-- Indici per le tabelle `web_blog_categories`
--
ALTER TABLE `web_blog_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `web_blog_categories_slug_unique` (`slug`),
  ADD KEY `web_blog_categories_id_ditta_attivo_index` (`id_ditta`,`attivo`),
  ADD KEY `web_blog_categories_slug_index` (`slug`);

--
-- Indici per le tabelle `web_blog_posts`
--
ALTER TABLE `web_blog_posts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `web_blog_posts_slug_unique` (`slug`),
  ADD KEY `web_blog_posts_id_ditta_pubblicato_index` (`id_ditta`,`pubblicato`),
  ADD KEY `web_blog_posts_id_category_index` (`id_category`),
  ADD KEY `web_blog_posts_slug_index` (`slug`),
  ADD KEY `web_blog_posts_data_pubblicazione_index` (`data_pubblicazione`),
  ADD KEY `web_blog_posts_in_evidenza_index` (`in_evidenza`);

--
-- Indici per le tabelle `web_pages`
--
ALTER TABLE `web_pages`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `web_pages_id_ditta_slug_unique` (`id_ditta`,`slug`),
  ADD KEY `idx_web_pages_parent_order` (`id_page_parent`,`ordine_menu`);

--
-- Indici per le tabelle `web_page_components`
--
ALTER TABLE `web_page_components`
  ADD PRIMARY KEY (`id`),
  ADD KEY `web_page_components_id_page_foreign` (`id_page`);

--
-- Indici per le tabelle `web_page_revisions`
--
ALTER TABLE `web_page_revisions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_page_revision_date` (`id_page`,`data_revision`),
  ADD KEY `idx_user_revisions` (`id_utente`);

--
-- Indici per le tabelle `web_templates`
--
ALTER TABLE `web_templates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `web_templates_codice_unique` (`codice`);

--
-- Indici per le tabelle `wg_galleries`
--
ALTER TABLE `wg_galleries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_wg_galleries_sito` (`id_sito_web`),
  ADD KEY `idx_wg_galleries_pagina` (`id_pagina`),
  ADD KEY `idx_wg_galleries_active` (`is_active`,`sort_order`),
  ADD KEY `idx_wg_galleries_slug` (`slug`,`id_sito_web`);

--
-- Indici per le tabelle `wg_gallery_images`
--
ALTER TABLE `wg_gallery_images`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_wg_gallery_images` (`id_galleria`,`id_file`),
  ADD KEY `idx_wg_gallery_images_order` (`id_galleria`,`order_pos`),
  ADD KEY `idx_wg_gallery_images_file` (`id_file`);

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
-- AUTO_INCREMENT per la tabella `ad_utenti_ditte`
--
ALTER TABLE `ad_utenti_ditte`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `ai_content_cache`
--
ALTER TABLE `ai_content_cache`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `ai_template_suggestions`
--
ALTER TABLE `ai_template_suggestions`
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
-- AUTO_INCREMENT per la tabella `articoli_blog`
--
ALTER TABLE `articoli_blog`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

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
-- AUTO_INCREMENT per la tabella `catalogo_selezioni`
--
ALTER TABLE `catalogo_selezioni`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `catalogo_selezioni_articoli`
--
ALTER TABLE `catalogo_selezioni_articoli`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `cleanup_stats`
--
ALTER TABLE `cleanup_stats`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

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
-- AUTO_INCREMENT per la tabella `dm_allegati_link`
--
ALTER TABLE `dm_allegati_link`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `dm_files`
--
ALTER TABLE `dm_files`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `download_tracking`
--
ALTER TABLE `download_tracking`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `email_inviate`
--
ALTER TABLE `email_inviate`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `email_open_tracking`
--
ALTER TABLE `email_open_tracking`
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
-- AUTO_INCREMENT per la tabella `immagini_sito_web`
--
ALTER TABLE `immagini_sito_web`
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
-- AUTO_INCREMENT per la tabella `ls_liste_righe`
--
ALTER TABLE `ls_liste_righe`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `ls_liste_testata`
--
ALTER TABLE `ls_liste_testata`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

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
-- AUTO_INCREMENT per la tabella `pagine_sito_web`
--
ALTER TABLE `pagine_sito_web`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

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
-- AUTO_INCREMENT per la tabella `siti_web_aziendali`
--
ALTER TABLE `siti_web_aziendali`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `template_siti_web`
--
ALTER TABLE `template_siti_web`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

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
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `utenti_funzioni_override`
--
ALTER TABLE `utenti_funzioni_override`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `va_clienti`
--
ALTER TABLE `va_clienti`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `va_clienti_anagrafica`
--
ALTER TABLE `va_clienti_anagrafica`
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
-- AUTO_INCREMENT per la tabella `va_matrice_sconti_righe`
--
ALTER TABLE `va_matrice_sconti_righe`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `va_matrici_sconti`
--
ALTER TABLE `va_matrici_sconti`
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
-- AUTO_INCREMENT per la tabella `website_activity_log`
--
ALTER TABLE `website_activity_log`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `website_analytics`
--
ALTER TABLE `website_analytics`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `web_blog_categories`
--
ALTER TABLE `web_blog_categories`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `web_blog_posts`
--
ALTER TABLE `web_blog_posts`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `web_pages`
--
ALTER TABLE `web_pages`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `web_page_components`
--
ALTER TABLE `web_page_components`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `web_page_revisions`
--
ALTER TABLE `web_page_revisions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `web_templates`
--
ALTER TABLE `web_templates`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `wg_galleries`
--
ALTER TABLE `wg_galleries`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `wg_gallery_images`
--
ALTER TABLE `wg_gallery_images`
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
-- Limiti per la tabella `ad_utenti_ditte`
--
ALTER TABLE `ad_utenti_ditte`
  ADD CONSTRAINT `ad_utenti_ditte_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ad_utenti_ditte_id_ruolo_foreign` FOREIGN KEY (`id_ruolo`) REFERENCES `ruoli` (`id`);

--
-- Limiti per la tabella `allegati_tracciati`
--
ALTER TABLE `allegati_tracciati`
  ADD CONSTRAINT `fk_allegati_tracciati_email_inviate` FOREIGN KEY (`id_email_inviata`) REFERENCES `email_inviate` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

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
  ADD CONSTRAINT `bs_attivita_id_bene_foreign` FOREIGN KEY (`id_bene`) REFERENCES `bs_beni` (`id`) ON DELETE CASCADE;

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
-- Limiti per la tabella `catalogo_selezioni`
--
ALTER TABLE `catalogo_selezioni`
  ADD CONSTRAINT `catalogo_selezioni_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `catalogo_selezioni_articoli`
--
ALTER TABLE `catalogo_selezioni_articoli`
  ADD CONSTRAINT `catalogo_selezioni_articoli_id_articolo_foreign` FOREIGN KEY (`id_articolo`) REFERENCES `ct_catalogo` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `catalogo_selezioni_articoli_id_selezione_foreign` FOREIGN KEY (`id_selezione`) REFERENCES `catalogo_selezioni` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `ct_catalogo`
--
ALTER TABLE `ct_catalogo`
  ADD CONSTRAINT `ct_catalogo_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `utenti` (`id`) ON DELETE SET NULL,
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
  ADD CONSTRAINT `ct_codici_fornitore_id_anagrafica_fornitore_foreign` FOREIGN KEY (`id_anagrafica_fornitore`) REFERENCES `ditte` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `ct_codici_fornitore_id_catalogo_foreign` FOREIGN KEY (`id_catalogo`) REFERENCES `ct_catalogo` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ct_codici_fornitore_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `ct_ean`
--
ALTER TABLE `ct_ean`
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
  ADD CONSTRAINT `ditte_id_web_template_foreign` FOREIGN KEY (`id_web_template`) REFERENCES `web_templates` (`id`),
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
-- Limiti per la tabella `dm_allegati_link`
--
ALTER TABLE `dm_allegati_link`
  ADD CONSTRAINT `dm_allegati_link_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `dm_allegati_link_id_file_foreign` FOREIGN KEY (`id_file`) REFERENCES `dm_files` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `dm_files`
--
ALTER TABLE `dm_files`
  ADD CONSTRAINT `dm_files_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `dm_files_id_utente_upload_foreign` FOREIGN KEY (`id_utente_upload`) REFERENCES `utenti` (`id`) ON DELETE SET NULL;

--
-- Limiti per la tabella `email_inviate`
--
ALTER TABLE `email_inviate`
  ADD CONSTRAINT `email_inviate_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE SET NULL;

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
-- Limiti per la tabella `immagini_sito_web`
--
ALTER TABLE `immagini_sito_web`
  ADD CONSTRAINT `immagini_sito_web_id_file_foreign` FOREIGN KEY (`id_file`) REFERENCES `dm_files` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `immagini_sito_web_id_sito_web_foreign` FOREIGN KEY (`id_sito_web`) REFERENCES `siti_web_aziendali` (`id`) ON DELETE CASCADE;

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
  ADD CONSTRAINT `ldu_ibfk_1` FOREIGN KEY (`id_lista`) REFERENCES `liste_distribuzione` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `liste_distribuzione`
--
ALTER TABLE `liste_distribuzione`
  ADD CONSTRAINT `fk_liste_distribuzione_id_ditta` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`);

--
-- Limiti per la tabella `log_accessi`
--
ALTER TABLE `log_accessi`
  ADD CONSTRAINT `log_accessi_ibfk_2` FOREIGN KEY (`id_funzione_accessibile`) REFERENCES `funzioni` (`id`),
  ADD CONSTRAINT `log_accessi_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Limiti per la tabella `log_azioni`
--
ALTER TABLE `log_azioni`
  ADD CONSTRAINT `fk_log_azioni_id_ditta` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`);

--
-- Limiti per la tabella `ls_liste_righe`
--
ALTER TABLE `ls_liste_righe`
  ADD CONSTRAINT `ls_liste_righe_id_articolo_foreign` FOREIGN KEY (`id_articolo`) REFERENCES `ct_catalogo` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ls_liste_righe_id_testata_foreign` FOREIGN KEY (`id_testata`) REFERENCES `ls_liste_testata` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `ls_liste_testata`
--
ALTER TABLE `ls_liste_testata`
  ADD CONSTRAINT `ls_liste_testata_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `utenti` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `ls_liste_testata_id_causale_movimento_foreign` FOREIGN KEY (`id_causale_movimento`) REFERENCES `mg_causali_movimento` (`id`),
  ADD CONSTRAINT `ls_liste_testata_id_ditta_destinataria_foreign` FOREIGN KEY (`id_ditta_destinataria`) REFERENCES `ditte` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `ls_liste_testata_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ls_liste_testata_id_magazzino_foreign` FOREIGN KEY (`id_magazzino`) REFERENCES `mg_magazzini` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `ls_liste_testata_updated_by_foreign` FOREIGN KEY (`updated_by`) REFERENCES `utenti` (`id`) ON DELETE SET NULL;

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
  ADD CONSTRAINT `mg_movimenti_id_magazzino_foreign` FOREIGN KEY (`id_magazzino`) REFERENCES `mg_magazzini` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `mg_movimenti_lotti`
--
ALTER TABLE `mg_movimenti_lotti`
  ADD CONSTRAINT `mg_movimenti_lotti_id_lotto_foreign` FOREIGN KEY (`id_lotto`) REFERENCES `mg_lotti` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mg_movimenti_lotti_id_movimento_foreign` FOREIGN KEY (`id_movimento`) REFERENCES `mg_movimenti` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD CONSTRAINT `password_reset_tokens_id_utente_foreign` FOREIGN KEY (`id_utente`) REFERENCES `utenti` (`id`) ON DELETE CASCADE;

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
  ADD CONSTRAINT `ppa_istanzeazioni_ibfk_4` FOREIGN KEY (`ID_Stato`) REFERENCES `ppa_stati_azione` (`ID`);

--
-- Limiti per la tabella `ppa_istanzeprocedure`
--
ALTER TABLE `ppa_istanzeprocedure`
  ADD CONSTRAINT `fk_ppa_istanzeprocedure_ID_ProceduraDitta` FOREIGN KEY (`ID_ProceduraDitta`) REFERENCES `ppa_procedureditta` (`ID`);

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
  ADD CONSTRAINT `sc_registrazioni_testata_id_ditte_foreign` FOREIGN KEY (`id_ditte`) REFERENCES `ditte` (`id`) ON DELETE SET NULL;

--
-- Limiti per la tabella `sc_registri_iva`
--
ALTER TABLE `sc_registri_iva`
  ADD CONSTRAINT `sc_registri_iva_ibfk_1` FOREIGN KEY (`id_riga_registrazione`) REFERENCES `sc_registrazioni_righe` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `tipi_pagamento`
--
ALTER TABLE `tipi_pagamento`
  ADD CONSTRAINT `fk_tipi_pagamento_id_ditta` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`);

--
-- Limiti per la tabella `utente_scorciatoie`
--
ALTER TABLE `utente_scorciatoie`
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
  ADD CONSTRAINT `utenti_funzioni_override_id_funzione_foreign` FOREIGN KEY (`id_funzione`) REFERENCES `funzioni` (`id`) ON DELETE CASCADE;

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
-- Limiti per la tabella `va_matrice_sconti_righe`
--
ALTER TABLE `va_matrice_sconti_righe`
  ADD CONSTRAINT `va_matrice_sconti_righe_id_matrice_foreign` FOREIGN KEY (`id_matrice`) REFERENCES `va_matrice_sconti` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `va_matrici_sconti`
--
ALTER TABLE `va_matrici_sconti`
  ADD CONSTRAINT `va_matrici_sconti_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE;

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
  ADD CONSTRAINT `va_trasportatori_id_utente_referente_foreign` FOREIGN KEY (`id_utente_referente`) REFERENCES `utenti` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `web_blog_categories`
--
ALTER TABLE `web_blog_categories`
  ADD CONSTRAINT `web_blog_categories_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `web_blog_posts`
--
ALTER TABLE `web_blog_posts`
  ADD CONSTRAINT `web_blog_posts_id_category_foreign` FOREIGN KEY (`id_category`) REFERENCES `web_blog_categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `web_blog_posts_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `web_pages`
--
ALTER TABLE `web_pages`
  ADD CONSTRAINT `web_pages_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `web_page_components`
--
ALTER TABLE `web_page_components`
  ADD CONSTRAINT `web_page_components_id_page_foreign` FOREIGN KEY (`id_page`) REFERENCES `web_pages` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `web_page_revisions`
--
ALTER TABLE `web_page_revisions`
  ADD CONSTRAINT `web_page_revisions_id_page_foreign` FOREIGN KEY (`id_page`) REFERENCES `web_pages` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `web_page_revisions_id_utente_foreign` FOREIGN KEY (`id_utente`) REFERENCES `utenti` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `wg_galleries`
--
ALTER TABLE `wg_galleries`
  ADD CONSTRAINT `wg_galleries_id_pagina_foreign` FOREIGN KEY (`id_pagina`) REFERENCES `pagine_sito_web` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `wg_galleries_id_sito_web_foreign` FOREIGN KEY (`id_sito_web`) REFERENCES `siti_web_aziendali` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `wg_gallery_images`
--
ALTER TABLE `wg_gallery_images`
  ADD CONSTRAINT `wg_gallery_images_id_file_foreign` FOREIGN KEY (`id_file`) REFERENCES `dm_files` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `wg_gallery_images_id_galleria_foreign` FOREIGN KEY (`id_galleria`) REFERENCES `wg_galleries` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
