-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Ott 12, 2025 alle 13:01
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

--
-- Dump dei dati per la tabella `allegati_tracciati`
--

INSERT INTO `allegati_tracciati` (`id`, `id_email_inviata`, `nome_file_originale`, `percorso_file_salvato`, `tipo_file`, `dimensione_file`, `scaricato`, `data_primo_download`, `download_id`) VALUES
(1, 1, 'palermoservizi_gruppi.pdf', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1753470784241-palermoservizi_gruppi.pdf', 'application/pdf', 113033, 0, NULL, '275d9cbe-db37-456e-a3bb-24f48297d4d9'),
(2, 3, 'surgelo_.pdf', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1753471059552-surgelo_.pdf', 'application/pdf', 212216, 1, '2025-07-25 19:18:11', '0ebed6c3-bcfe-442d-94fe-ca8a7ef96b56'),
(3, 4, '1218302039.pdf', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1753472002575-1218302039.pdf', 'application/pdf', 53626, 1, '2025-07-25 19:34:07', 'cb608327-91db-459e-b727-b1a0d656c4cd'),
(4, 5, 'surgelo_.pdf', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1753472096001-surgelo_.pdf', 'application/pdf', 212216, 1, '2025-07-25 19:37:09', '2720cf97-e22b-4322-9b8c-3048f1d5fc8b'),
(5, 9, 'MEMBRI ASSEMBLEA ELETTIVA.xlsx', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1753522372999-MEMBRI ASSEMBLEA ELETTIVA.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 18833, 0, NULL, '153e8a26-30aa-4c23-b85a-4bfaf5414d54'),
(6, 11, 'Fattura_2972377giugno2024.pdf', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1753884910505-Fattura_2972377giugno2024.pdf', 'application/pdf', 200017, 0, NULL, 'dfe94a73-557f-470b-86fd-e5b54778627a'),
(7, 11, 'Fattura_3148208lug2024.pdf', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1753884910509-Fattura_3148208lug2024.pdf', 'application/pdf', 200866, 0, NULL, '3ae7a052-c0d5-41e0-b654-8e008041f7de'),
(8, 11, 'Fattura_3336520ago2024.pdf', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1753884910512-Fattura_3336520ago2024.pdf', 'application/pdf', 201119, 0, NULL, 'd033d882-ade7-4729-b9a6-2477c6147100'),
(9, 11, 'Fattura_3511936sett2024.pdf', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1753884910514-Fattura_3511936sett2024.pdf', 'application/pdf', 227628, 0, NULL, 'c41be342-1840-4807-af32-b8da88ff3c4d'),
(10, 11, 'Fattura_3889618nov2024.pdf', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1753884910515-Fattura_3889618nov2024.pdf', 'application/pdf', 215176, 0, NULL, 'ae59e82a-72c4-4040-930c-82531581d7f7'),
(11, 11, 'Fattura_4039396dic2024.pdf', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1753884910517-Fattura_4039396dic2024.pdf', 'application/pdf', 177862, 0, NULL, 'b7c46ada-520b-4139-9a4d-36313a4eabe6'),
(12, 11, 'Fattura_4870821.pdf', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1753884910520-Fattura_4870821.pdf', 'application/pdf', 190649, 0, NULL, 'addd69da-6bf6-46de-a4e9-5dd605a757a4'),
(13, 11, 'Fattura_5080927MAGGIO.pdf', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1753884910521-Fattura_5080927MAGGIO.pdf', 'application/pdf', 178922, 0, NULL, 'f833d2af-4cce-48e2-9db7-4b38fd265204'),
(14, 11, 'Fattura_5553859LUGL.pdf', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1753884910523-Fattura_5553859LUGL.pdf', 'application/pdf', 520484, 0, NULL, '4909d0b9-2423-4348-adc8-b52dafbd30df'),
(15, 11, 'Fattura_37132450tt2024.pdf', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1753884910529-Fattura_37132450tt2024.pdf', 'application/pdf', 214678, 0, NULL, 'a7126a2a-9dcf-4032-aa72-1e33f5cf03d3'),
(16, 11, 'Fattura_422459531gen.pdf', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1753884910532-Fattura_422459531gen.pdf', 'application/pdf', 190040, 0, NULL, '5d6db57d-9c7c-4050-a6af-021eae67e7e3'),
(17, 11, 'Fattura_444766428febbr.pdf', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1753884910535-Fattura_444766428febbr.pdf', 'application/pdf', 178298, 0, NULL, '8d446803-c7a8-4fa1-95c6-130a48f8a6c7'),
(18, 11, 'Fattura_460428631marzo.pdf', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1753884910549-Fattura_460428631marzo.pdf', 'application/pdf', 178474, 0, NULL, 'e9fac1f0-9d6c-4987-ab67-d344a43d1159'),
(19, 11, 'Fattura_487082130aprile.pdf', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1753884910554-Fattura_487082130aprile.pdf', 'application/pdf', 190649, 0, NULL, '31c53d62-2f3d-4779-97ef-a469f9d7b48a'),
(20, 11, 'Fattura_530427130giu.pdf', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1753884910557-Fattura_530427130giu.pdf', 'application/pdf', 179010, 0, NULL, '54817f6c-5fe7-4b7a-9e62-f33a89f11c1b'),
(21, 11, 'Fattura_50809273005.pdf', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1753884910560-Fattura_50809273005.pdf', 'application/pdf', 178922, 0, NULL, 'bef80f5c-6f7f-44d0-a619-de9a7f1e827e'),
(22, 11, 'Riepilogo_Energia_Elettrica_maggio24_maggio25.pdf', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1753884910561-Riepilogo_Energia_Elettrica_maggio24_maggio25.pdf', 'application/pdf', 218659, 0, NULL, 'e65a1452-0a4e-4898-9aaa-bc53f8865992'),
(23, 13, 'mastri-1.xlsx', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1754414930982-mastri-1.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 11671, 0, NULL, 'e7ccdf5a-7413-4084-a144-dfaf71fb8486'),
(24, 24, 'operodb.sql', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1754649216203-operodb.sql', 'application/octet-stream', 78416, 0, NULL, '35971f8a-c5d4-433f-aef5-563f8af90999'),
(25, 25, 'operodb (1).sql', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1754649752084-operodb (1).sql', 'application/octet-stream', 78717, 0, NULL, '6cb5ebe0-79b0-470c-b651-716da0aad338'),
(26, 26, 'operodb.json', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1754649940696-operodb.json', 'application/json', 80472, 0, NULL, 'd974a39a-1a59-4f1c-b5a7-42255d4852cd'),
(27, 27, 'conti_cont.xlsx', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1754650409887-conti_cont.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 600756, 0, NULL, 'aa376dc0-7d40-4ae6-97d1-547007bb0652'),
(28, 28, 'operodb (1).sql', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1754650553031-operodb (1).sql', 'application/octet-stream', 78717, 0, NULL, 'bd0ff43b-d98a-4cc4-9c0f-18df32b2a1fb'),
(29, 30, 'conti_cont.xlsx', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1754650691645-conti_cont.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 600756, 0, NULL, '41244d4d-d345-430f-9cba-d2c5888f4952'),
(30, 31, 'conti_cont.xlsx', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1754650826973-conti_cont.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 600756, 0, NULL, '012bc5bc-7623-461a-a77d-044dce05902b'),
(31, 32, 'conti_cont (1).xlsx', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1754652354689-conti_cont (1).xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 600756, 0, NULL, '756f8325-c59e-4b3f-9977-4e8df9832a6b'),
(32, 33, 'conti_cont (1).xlsx', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1754652631573-conti_cont (1).xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 600756, 1, '2025-08-08 11:31:01', 'e1bd71b9-b92e-4fc9-8d31-51233b505123'),
(33, 34, 'moduli.pdf', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1754679234734-moduli.pdf', 'application/pdf', 103865, 0, NULL, '21175ce6-46b1-44b3-ad12-7eba47a47aa9'),
(34, 35, 'conti_cont (1) (1).xlsx', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1754679820987-conti_cont (1) (1).xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 600756, 0, NULL, '3f550d63-4556-4052-a6b7-b17aef0d7043'),
(35, 36, 'conti_cont.xlsx', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1754679871165-conti_cont.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 600756, 0, NULL, '9ca6d528-12b2-49cb-b997-c38212450d04'),
(36, 37, 'conti_cont (1) (1).xlsx', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1754680301138-conti_cont (1) (1).xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 600756, 0, NULL, 'f3d1c72b-aa88-4328-8083-90e2aa7bf4ab'),
(37, 38, 'conti_cont (3).xlsx', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1754680349490-conti_cont (3).xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 600756, 1, '2025-08-08 19:22:46', 'c5df5342-488e-4fac-ac04-1a204d713fed'),
(38, 41, 'UserForm.js', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1754755511252-UserForm.js', 'text/javascript', 3828, 0, NULL, '76a1d5c5-0938-4e3e-b7eb-f57c1804737d'),
(39, 85, 'report_procedura.pdf', 'Generato in memoria per invio email', NULL, NULL, 0, NULL, '29164a38-2e5c-4bbb-939b-e580ae6fc610');

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

--
-- Dump dei dati per la tabella `an_progressivi`
--

INSERT INTO `an_progressivi` (`id`, `id_ditta`, `codice_progressivo`, `descrizione`, `serie`, `ultimo_numero`, `data_ult`, `formato`) VALUES
(1, 1, 'PROT_CONT', 'Protocollo Registrazioni Contabili', NULL, 19, NULL, NULL);

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

--
-- Dump dei dati per la tabella `an_servizi_aziendali_mail`
--

INSERT INTO `an_servizi_aziendali_mail` (`id`, `id_ditta`, `nome_servizio`, `id_ditta_mail_account`, `created_at`, `updated_at`) VALUES
(1, 1, 'PPA_COMUNICATION', 13, '2025-09-23 19:02:54', '2025-09-23 19:02:54');

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

--
-- Dump dei dati per la tabella `app_funzioni`
--

INSERT INTO `app_funzioni` (`id`, `codice_modulo`, `funzione`, `sotto_funzione`, `descrizione`, `livello_richiesto`) VALUES
(1, 10, 'Ciclo_Attivo', 'Fatturazione_Crea', NULL, 80),
(2, 10, 'Ciclo_Attivo', 'Fatturazione_Vedi', NULL, 50);

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

--
-- Dump dei dati per la tabella `app_ruoli`
--

INSERT INTO `app_ruoli` (`id`, `id_ditta`, `codice_modulo`, `descrizione`) VALUES
(2, 1, 10, 'Fatturista Junior'),
(1, 1, 10, 'Fatturista Senior');

-- --------------------------------------------------------

--
-- Struttura della tabella `app_ruoli_funzioni`
--

CREATE TABLE `app_ruoli_funzioni` (
  `id_ruolo` int(11) NOT NULL,
  `id_funzione` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `app_ruoli_funzioni`
--

INSERT INTO `app_ruoli_funzioni` (`id_ruolo`, `id_funzione`) VALUES
(1, 1),
(1, 2),
(2, 2);

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

--
-- Dump dei dati per la tabella `bs_beni`
--

INSERT INTO `bs_beni` (`id`, `id_ditta`, `id_categoria`, `codice_bene`, `descrizione`, `matricola`, `url_foto`, `data_acquisto`, `valore_acquisto`, `id_sottoconto_costo`, `id_sottoconto_cespite`, `id_fornitore`, `riferimento_fattura`, `stato`, `ubicazione`, `data_dismissione`, `valore_dismissione`, `note`, `created_at`, `updated_at`) VALUES
(1, 1, 6, 'PC_OLIVETI-M24', 'PC OLIVETTI M 24', 'PCIT000', 'www.fk', '1980-10-10', 7500.00, 22, 4, 8, '150', 'In uso', 'UFFICIO REPERTI', NULL, NULL, 'il pc presenta segni di usura, tastiera scolorita', '2025-09-20 18:14:20', '2025-09-20 18:14:20');

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

--
-- Dump dei dati per la tabella `bs_categorie`
--

INSERT INTO `bs_categorie` (`id`, `id_ditta`, `codice`, `descrizione`, `aliquota_ammortamento`, `id_sottoconto_costi`, `id_sottoconto_ammortamenti`, `id_sottoconto_fondo`, `created_at`, `updated_at`) VALUES
(1, 1, 'IMM', 'Immobili', NULL, NULL, NULL, NULL, '2025-09-20 17:16:55', '2025-09-20 17:16:55'),
(2, 1, 'ARR', 'Arredamenti', NULL, NULL, NULL, NULL, '2025-09-20 17:16:55', '2025-09-20 17:16:55'),
(3, 1, 'ATT-IND', 'Attrezzatura Industriale', NULL, NULL, NULL, NULL, '2025-09-20 17:16:55', '2025-09-20 17:16:55'),
(4, 1, 'ATT-COM', 'Attrezzatura Commerciale', NULL, NULL, NULL, NULL, '2025-09-20 17:16:55', '2025-09-20 17:16:55'),
(5, 1, 'ATT-UFF', 'Attrezzatura Uffici', NULL, NULL, NULL, NULL, '2025-09-20 17:16:55', '2025-09-20 17:16:55'),
(6, 1, 'ELT', 'Elettronici', NULL, NULL, NULL, NULL, '2025-09-20 17:16:55', '2025-09-20 17:16:55'),
(7, 1, 'MAC-OP', 'Macchine Operatrici', NULL, NULL, NULL, NULL, '2025-09-20 17:16:55', '2025-09-20 17:16:55'),
(8, 1, 'OFF', 'Officina', NULL, NULL, NULL, NULL, '2025-09-20 17:16:55', '2025-09-20 17:16:55'),
(9, 1, 'MOB-REG', 'MOBILI REGISTRATI', NULL, NULL, NULL, NULL, '2025-09-21 10:54:30', '2025-09-21 10:54:30');

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

--
-- Dump dei dati per la tabella `bs_scadenze`
--

INSERT INTO `bs_scadenze` (`id`, `id_bene`, `id_tipo_scadenza`, `descrizione`, `data_scadenza`, `giorni_preavviso`, `id_fornitore_associato`, `importo_previsto`, `stato`, `data_completamento`, `note`, `created_at`, `updated_at`) VALUES
(2, 1, 1, NULL, '2025-10-05', 7, NULL, 25.00, 'Pianificata', NULL, 'CAMBIARE VENTOLA OGNI ANNO', '2025-10-04 15:53:07', '2025-10-04 15:53:07');

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

--
-- Dump dei dati per la tabella `bs_tipi_scadenze`
--

INSERT INTO `bs_tipi_scadenze` (`id`, `id_ditta`, `codice`, `descrizione`, `created_at`, `updated_at`) VALUES
(1, 1, '', 'SCADENZE MECCANICHE', '2025-10-04 15:52:30', '2025-10-04 15:52:30');

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

--
-- Dump dei dati per la tabella `ct_catalogo`
--

INSERT INTO `ct_catalogo` (`id`, `id_ditta`, `codice_entita`, `descrizione`, `id_categoria`, `tipo_entita`, `id_unita_misura`, `id_aliquota_iva`, `costo_base`, `gestito_a_magazzino`, `id_stato_entita`, `created_at`, `updated_at`) VALUES
(1, 1, '300411050', 'CORDON BLEU FATTORIA  KG1', 24, 'bene', 1, 3, 1.00, 1, 1, '2025-10-01 13:30:45', '2025-10-01 13:30:45'),
(2, 1, '300411054', 'AMADORI GRAN BURGER 2PZ 280GR', 24, 'bene', 1, 3, 1.98, 0, 1, '2025-10-01 13:30:45', '2025-10-01 13:30:45'),
(3, 1, '305020007', 'COTOLETTA AMADORI POLLO GR700', 24, 'bene', 1, 3, 5.00, 1, 1, '2025-10-01 13:30:45', '2025-10-01 13:30:45'),
(4, 1, '305770007', 'KEBAB AMADORI TACCHINO 700 GR', 24, 'bene', 1, 3, 6.90, 1, 1, '2025-10-01 13:30:45', '2025-10-01 13:30:45'),
(5, 1, '305770009', 'ALETTE DI POLLO PICCCANTI AMADORI 700GR', 24, 'bene', 1, 3, 5.25, 0, 1, '2025-10-01 13:30:45', '2025-10-01 13:30:45'),
(6, 1, '305000063', 'FILETTI DI MERLUZZO ALASKA  NORDICO800G', 25, 'bene', 1, 3, 4.29, 0, 1, '2025-10-01 13:30:45', '2025-10-01 13:30:45'),
(13, 1, '3004110509', 'ARTICOLO', 19, 'bene', 2, 3, 15.00, 0, 4, '2025-10-01 15:14:44', '2025-10-01 15:14:44');

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

--
-- Dump dei dati per la tabella `ct_categorie`
--

INSERT INTO `ct_categorie` (`id`, `id_ditta`, `nome_categoria`, `descrizione`, `codice_categoria`, `progressivo`, `created_at`, `updated_at`, `id_padre`) VALUES
(15, 1, 'MERCI', 'PRODOTTI FISICI DI MAGAZZINO ', NULL, NULL, '2025-09-29 19:00:38', '2025-09-29 19:00:38', NULL),
(16, 1, 'FOOD', 'PRODOTTI ALIMENTARI', NULL, NULL, '2025-09-29 19:00:53', '2025-09-29 19:00:53', 15),
(17, 1, 'NO FOOD', 'NON ALIMENTARI', NULL, NULL, '2025-09-29 19:01:14', '2025-09-29 19:01:14', 15),
(18, 1, 'DEPERIBILI', 'ALIMENTARI DEPERIBILI', NULL, NULL, '2025-09-29 19:01:34', '2025-09-29 19:01:34', 16),
(19, 1, 'SERVIZI', 'SERVIZI AZIENDALI', NULL, NULL, '2025-09-29 19:07:17', '2025-09-29 19:07:17', NULL),
(20, 1, 'LAVORAZIONI', 'LAVORAZIONI ESEGUITE', NULL, NULL, '2025-09-29 19:07:35', '2025-09-29 19:07:35', NULL),
(21, 1, 'LIQUIDI', 'PRODOTTI LIQUIDI', NULL, NULL, '2025-09-30 17:18:23', '2025-09-30 17:18:23', 16),
(22, 1, 'DISPENSA', 'PRODOTTI DIPENSA', NULL, NULL, '2025-09-30 17:18:50', '2025-09-30 17:18:50', 16),
(24, 1, 'SURGELATI', 'PRODOTTI SURGELATI', NULL, NULL, '2025-09-30 17:19:44', '2025-09-30 17:19:44', 18),
(25, 1, 'FRESCHI', 'PRODOTTI FRESCHI', NULL, NULL, '2025-09-30 17:20:38', '2025-09-30 17:20:38', 18),
(26, 1, 'IGIENE CASA', 'IGIENE CASA', NULL, NULL, '2025-09-30 17:21:11', '2025-09-30 17:21:11', 17),
(29, 1, 'IGIENE PERSONA', 'IGIENE PERSONA', NULL, NULL, '2025-09-30 17:21:51', '2025-09-30 17:21:51', 17);

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

--
-- Dump dei dati per la tabella `ct_codici_fornitore`
--

INSERT INTO `ct_codici_fornitore` (`id`, `id_ditta`, `id_catalogo`, `id_anagrafica_fornitore`, `codice_articolo_fornitore`, `created_at`, `updated_at`, `created_by`, `tipo_codice`) VALUES
(1, 1, 1, 16, '10', '2025-10-02 14:16:22', '2025-10-02 14:16:22', 3, 'OCC'),
(2, 1, 1, 12, 'trio', '2025-10-03 07:23:11', '2025-10-03 07:23:11', 3, 'ST');

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

--
-- Dump dei dati per la tabella `ct_ean`
--

INSERT INTO `ct_ean` (`id`, `id_ditta`, `id_catalogo`, `codice_ean`, `tipo_ean`, `tipo_ean_prodotto`, `created_at`, `created_by`) VALUES
(1, 1, 1, '8006473903932', 'PRODOTTO', 'PEZZO', '2025-10-02 12:58:05', 3);

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

--
-- Dump dei dati per la tabella `ct_listini`
--

INSERT INTO `ct_listini` (`id`, `id_ditta`, `id_entita_catalogo`, `nome_listino`, `data_inizio_validita`, `data_fine_validita`, `ricarico_cessione_6`, `ricarico_cessione_5`, `ricarico_cessione_4`, `ricarico_cessione_3`, `ricarico_cessione_2`, `ricarico_cessione_1`, `prezzo_cessione_1`, `prezzo_pubblico_1`, `ricarico_pubblico_1`, `prezzo_cessione_2`, `prezzo_pubblico_2`, `ricarico_pubblico_2`, `prezzo_cessione_3`, `prezzo_pubblico_3`, `ricarico_pubblico_3`, `prezzo_cessione_4`, `prezzo_pubblico_4`, `ricarico_pubblico_4`, `prezzo_cessione_5`, `prezzo_pubblico_5`, `ricarico_pubblico_5`, `prezzo_cessione_6`, `prezzo_pubblico_6`, `ricarico_pubblico_6`, `created_at`, `updated_at`) VALUES
(2, 1, 1, 'futuro', '2025-10-01', NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 1.30, 1.86, 30.00, 1.35, 2.00, 35.00, 1.34, 1.99, 35.00, 1.15, 1.52, 20.00, 1.20, 1.65, 25.00, 1.35, 1.51, 1.68, '2025-10-01 16:11:08', '2025-10-01 16:11:08'),
(3, 1, 1, 'attuale', '2025-10-08', NULL, 0.00, 0.00, 0.00, 0.00, 0.00, 15.00, 11.50, 15.18, 20.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, '2025-10-02 11:42:23', '2025-10-02 11:42:23');

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

--
-- Dump dei dati per la tabella `ct_logistica`
--

INSERT INTO `ct_logistica` (`id`, `id_ditta`, `id_catalogo`, `peso_lordo_pz`, `volume_pz`, `h_pz`, `l_pz`, `p_pz`, `s_im`, `pezzi_per_collo`, `colli_per_strato`, `strati_per_pallet`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 0.006, 0.000004, NULL, NULL, NULL, 2, 3, NULL, NULL, '2025-10-04 15:27:08', '2025-10-04 15:27:08');

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

--
-- Dump dei dati per la tabella `ct_stati_entita`
--

INSERT INTO `ct_stati_entita` (`id`, `codice`, `descrizione`, `visibilita`, `created_at`, `updated_at`) VALUES
(1, 'ATT', 'ATTIVO', '', '2025-09-30 15:33:08', '2025-09-30 15:33:08'),
(2, 'REV', 'IN REVISIONE', 'ADMIN', '2025-09-30 15:34:03', '2025-09-30 15:34:03'),
(3, 'OBS', 'OBSOLETO', 'ADMIN', '2025-09-30 15:34:25', '2025-09-30 15:34:25'),
(4, 'DEL', 'ARCHIVIATO- (ELIMINATO)', 'ADMIN', '2025-09-30 15:35:01', '2025-09-30 15:35:01');

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

--
-- Dump dei dati per la tabella `ct_unita_misura`
--

INSERT INTO `ct_unita_misura` (`id`, `id_ditta`, `sigla_um`, `descrizione`, `created_at`, `updated_at`) VALUES
(1, 1, 'PZ', 'PEZZI', '2025-09-30 14:45:41', '2025-09-30 14:45:41'),
(2, 1, 'CT', 'CARTONI', '2025-09-30 14:45:59', '2025-09-30 14:45:59'),
(3, 1, 'KG', 'Chilogrammi', '2025-09-30 17:43:33', '2025-09-30 17:43:33'),
(4, 1, 'LT', 'LITRO', '2025-09-30 17:43:45', '2025-09-30 17:43:45');

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

--
-- Dump dei dati per la tabella `ditta_mail_accounts`
--

INSERT INTO `ditta_mail_accounts` (`id`, `id_ditta`, `id_utente_creazione`, `nome_account`, `email_address`, `imap_host`, `imap_port`, `smtp_host`, `smtp_port`, `auth_user`, `auth_pass`) VALUES
(9, 3, NULL, 'DifamConsegneGmail', 'difamconsegne@gmail.com', 'imap.gmail.com', 993, 'smtp.gmail.com', 465, 'difamconsegne@gmail.com', 'd12d71b072f38f15aa9693640f02224f:24b11118a6603262259e59beecdbdce7602f6660f4a4dc89cfb10dbfebc9c9da'),
(10, 3, NULL, 'Mail Cedibef', 'opero@difam.it', 'imaps.aruba.it', 993, 'smtps.aruba.it', 465, 'opero@difam.it', '626f6ce6b770d4acce16029cd33f817b:79a53cf6cd29cc71bccffb3f5bcabb99'),
(11, 1, 9, 'MASTER OPERO', 'opero@difam.it', 'imaps.aruba.it', 993, 'smtps.aruba.it', 465, 'opero@difam.it', '627f9eb8ff5834b4683ac12affbc7e89:2b64f98bc8ba7d0284ea2f4a26bb5874'),
(13, 1, NULL, 'Opero Gestionale', 'info@difam.it', 'imaps.aruba.it', 993, 'smtps.aruba.it', 465, 'info@difam.it', '70c131b21826a05ba45b9ed4abdc53d2:0719c787229faaba1f923be416552992');

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

--
-- Dump dei dati per la tabella `ditte`
--

INSERT INTO `ditte` (`id`, `ragione_sociale`, `logo_url`, `indirizzo`, `citta`, `provincia`, `cap`, `tel1`, `tel2`, `mail_1`, `mail_2`, `pec`, `sdi`, `p_iva`, `codice_fiscale`, `stato`, `id_tipo_ditta`, `moduli_associati`, `codice_relazione`, `id_sottoconto_cliente`, `id_sottoconto_fornitore`, `id_sottoconto_puntovendita`, `id_ditta_proprietaria`, `id_sottoconto_collegato`) VALUES
(1, 'Mia Azienda S.R.L.', '/logos/logo_1.png', 'Via Roma 1', 'Milano', 'MI', NULL, NULL, NULL, 'info@mia-azienda.it', NULL, 'mia-azienda@pec.it', 'ABCDEFG', NULL, NULL, 1, 1, NULL, 'N', NULL, NULL, NULL, NULL, NULL),
(2, 'Azienda Cliente Demo SPA', NULL, 'Corso Italia 100', 'Torino u', 'TO', NULL, NULL, NULL, 'info@cliente-demo.it', NULL, 'cliente-demo@pec.it', 'HIJKLMN', NULL, NULL, 1, 2, NULL, 'C', NULL, NULL, NULL, NULL, NULL),
(3, 'ditta prova proprietaria', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'angbrunosa@gmail.com', NULL, NULL, NULL, NULL, NULL, 1, 1, NULL, 'N', NULL, NULL, NULL, NULL, NULL),
(4, 'ditta  prova inserita', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'inseri@gmail.com', NULL, NULL, NULL, NULL, NULL, 1, 2, NULL, 'F', NULL, NULL, NULL, NULL, NULL),
(5, 'La produttrice srl', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'angbrunosa@gmail.com', NULL, NULL, NULL, NULL, NULL, 1, 2, NULL, 'C', NULL, NULL, NULL, NULL, NULL),
(6, 'Prova Admin Cliente', NULL, 'Cda Soda, 4', 'Saracena', 'CS', '87010', '3356738658', NULL, 'angbrunosa@gmail.com', '', NULL, '', 'aaaaaaaaaa', 'aaaa', 1, 2, NULL, 'C', 60, NULL, NULL, 1, NULL),
(7, 'punto_vendita_prova', NULL, 'via prova', 'prova', 'pr', '89010', '0981', '0985', 'puntovendita@prova.it', NULL, NULL, '0000001', '08998989', 'ddddddddd', 1, 2, NULL, 'P', NULL, NULL, NULL, 1, 203),
(8, 'DITTA PROVA CLIENTE FORNITORE', NULL, 'VIA NOSTRA', 'NOSTRA', 'NS', '87010', '0981', '0982', 'INFO@CEDIBEF.COM', '', NULL, '0000000', '0125025693', '01205', 1, NULL, NULL, 'F', NULL, 56, NULL, 1, NULL),
(12, 'CARAMELLE SALATE cliente', NULL, 'DEI DOLCI', 'SULMONA', 'DC', '87010', '0152', '155', 'INFO@CEDIBEF.COM', '', 'cliedemo@pec.it', '0000001', '0125205269', '0122640', 1, NULL, NULL, 'E', 52, 53, NULL, 1, NULL),
(13, 'DITTA SALATI TUTTIfornitroe', NULL, 'VIA DEI SALATINI', 'SALTO', 'SS', '90878', '098198025', '093', 'INFO@CEDIBEF.COM', NULL, NULL, '', '0102512554', '0125002541', 1, NULL, NULL, 'E', 57, 58, NULL, 1, NULL),
(14, 'SALATI E DOLCI', NULL, 'DEI GUSTI', 'GUSTOSA', 'GS', '75000', '02555', '0255', 'A@LIBERO.IT', NULL, NULL, NULL, '01245454', '0213313', 1, NULL, NULL, 'C', NULL, NULL, NULL, 1, NULL),
(15, 'SARACENARE EXPORT', NULL, 'VIA MAZZINI', 'SARACENA', 'CS', '87010', '098134463', '0985233', 'TRI@TE.IT', NULL, NULL, NULL, '0102555', '02692', 1, NULL, NULL, 'F', NULL, 27, NULL, 1, NULL),
(16, 'CAROFIGLIO SPA', NULL, 'FIGLINE', 'FIGLINE VIGLIATURAO', 'FG', '87100', '02255', '02555', 'opero@difam.it', NULL, NULL, '', '55656565', '3299', 1, NULL, NULL, 'E', 54, 55, NULL, 1, NULL),
(17, 'PROVA DITTA 2 fornitore', NULL, 'prova', 'provolino', 'pr', '87410', '012', '088', 'eee@fr.it', NULL, NULL, '', '09999', '87899', 1, 2, NULL, 'F', NULL, 61, NULL, 1, NULL),
(18, 'prima prova di 3 cliente', NULL, 'entram', 'entr', 'cs', '85200', '022', '022', 'ang@opero.it', NULL, NULL, '', '021212121', '01212121', 1, 2, NULL, 'C', 59, NULL, NULL, 1, NULL);

-- --------------------------------------------------------

--
-- Struttura della tabella `ditte_moduli`
--

CREATE TABLE `ditte_moduli` (
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `codice_modulo` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `ditte_moduli`
--

INSERT INTO `ditte_moduli` (`id_ditta`, `codice_modulo`) VALUES
(1, 10),
(1, 20),
(1, 30),
(1, 40),
(1, 50),
(1, 60),
(1, 70),
(1, 80),
(1, 90),
(1, 100),
(1, 110),
(2, 10),
(2, 20),
(2, 30),
(2, 50),
(2, 70),
(3, 10),
(3, 20),
(3, 30);

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

--
-- Dump dei dati per la tabella `email_inviate`
--

INSERT INTO `email_inviate` (`id`, `id_ditta`, `id_utente_mittente`, `destinatari`, `cc`, `bcc`, `oggetto`, `corpo`, `data_invio`, `aperta`, `data_prima_apertura`, `tracking_id`) VALUES
(1, NULL, 6, 'angbrunosa@gmai.com', NULL, NULL, 'ciao', NULL, '2025-09-20 17:15:45', 0, NULL, '974c346a-4882-4b6e-94a3-a1aa09163788'),
(74, NULL, 3, 'angbrunosa@gmail.com', NULL, NULL, 'prova da locale', '<p>saluti</p>', '2025-09-20 17:15:45', 0, NULL, '46bb71fe-e807-4df7-af08-8075341d8fde'),
(75, NULL, 3, 'angbrunosa@gmail.com', '', '', 'sss', '<p>ssss</p>', '2025-09-24 15:48:06', 0, NULL, 'f84f6674-4328-4dd4-8aa6-5b62c061c445'),
(76, NULL, 3, 'amerigo.celia@gmail.com', '', '', 'file fatture', '<p>in allegato quanto in oggetto	</p><p>saluti </p><p>Angelo</p><p><br></p>', '2025-09-26 09:56:08', 0, NULL, '2f87e111-76cc-4df8-9ffa-a44d26f722f2'),
(77, NULL, 3, 'mimmaforte@gmail.com', '', '', 'saluti', '<p>saluti</p>', '2025-09-26 18:53:58', 0, NULL, '646ba121-7ce8-4cc7-8973-ae2249e02397'),
(78, NULL, 3, 'angbrunosa@gmail.com', '', '', 'fff', '<p>ffff</p>', '2025-09-26 19:07:36', 0, NULL, '8d6a311e-b726-4cd0-b4cc-0429c63a9e4d'),
(79, NULL, 3, 'angbrunosa@gmail.com', '', '', 'prova', '<p>saluti</p>', '2025-09-28 08:48:46', 0, NULL, 'be7171bb-fb3d-4051-9cb2-65b26c953774'),
(80, 1, 3, 'opero@difam.it', NULL, NULL, 'Aggiornamento di Stato: Procedura \"23\"', '<p>Gentile Cliente,</p>\n            <p>le confermiamo che per le lavorazioni richieste le è stata assegnata la procedura \"23\".</p>\n            <p>In allegato trova il report di stato aggiornato ad oggi la data prevista di completamento è \"25/09/2025\".</p>\n            <p>Per qualsiasi domanda o chiarimento, non esiti a contattarci.</p>\n            <p>Cordiali Saluti,<br/>Opero Gestionale</p>', '2025-09-29 07:15:31', 0, NULL, '<ec360bf6-3eab-400f-ecaa-51e2a0f72955@difam.it>'),
(81, 1, 3, 'opero@difam.it', NULL, NULL, 'Aggiornamento di Stato: Procedura \"23\"', '<p>Gentile Cliente,</p>\n            <p>le confermiamo che per le lavorazioni richieste le è stata assegnata la procedura \"23\".</p>\n            <p>In allegato trova il report di stato aggiornato ad oggi la data prevista di completamento è \"25/09/2025\".</p>\n            <p>Per qualsiasi domanda o chiarimento, non esiti a contattarci.</p>\n            <p>Cordiali Saluti,<br/>Opero Gestionale</p>', '2025-09-29 07:15:31', 0, NULL, '9aeba883-cea0-44a0-b745-3582becd4af7'),
(82, 1, 3, 'opero@difam.it', NULL, NULL, 'Aggiornamento di Stato: Procedura \"Lavorazioni_cliente\"', '<p>Gentile Cliente,</p>\n            <p>le confermiamo che per le lavorazioni richieste le è stata assegnata la procedura \"Lavorazioni_cliente\".</p>\n            <p>In allegato trova il report di stato aggiornato ad oggi la data prevista di completamento è \"18/10/2025\".</p>\n            <p>Per qualsiasi domanda o chiarimento, non esiti a contattarci.</p>\n            <p>Cordiali Saluti,<br/>Opero Gestionale</p>', '2025-09-29 16:11:38', 0, NULL, '<c45069f7-553b-1413-6692-6f416dba6299@difam.it>'),
(83, 1, 3, 'opero@difam.it', NULL, NULL, 'Aggiornamento di Stato: Procedura \"Lavorazioni_cliente\"', '<p>Gentile Cliente,</p>\n            <p>le confermiamo che per le lavorazioni richieste le è stata assegnata la procedura \"Lavorazioni_cliente\".</p>\n            <p>In allegato trova il report di stato aggiornato ad oggi la data prevista di completamento è \"18/10/2025\".</p>\n            <p>Per qualsiasi domanda o chiarimento, non esiti a contattarci.</p>\n            <p>Cordiali Saluti,<br/>Opero Gestionale</p>', '2025-09-29 16:11:38', 0, NULL, '6c685921-2aa4-491c-9993-f6d156640eb2'),
(84, 1, 3, 'opero@difam.it', NULL, NULL, 'Aggiornamento di Stato: Procedura \"lavorazione_sartoria\"', '<p>Gentile Cliente,</p>\n            <p>le confermiamo che per le lavorazioni richieste le è stata assegnata la procedura \"lavorazione_sartoria\".</p>\n            <p>In allegato trova il report di stato aggiornato ad oggi la data prevista di completamento è \"03/10/2025\".</p>\n            <p>Per qualsiasi domanda o chiarimento, non esiti a contattarci.</p>\n            <p>Cordiali Saluti,<br/>Opero Gestionale</p>', '2025-10-01 18:31:19', 0, NULL, '<216b4eeb-dda9-5730-a19e-a176d7ab19d3@difam.it>'),
(85, 1, 3, 'opero@difam.it', NULL, NULL, 'Aggiornamento di Stato: Procedura \"lavorazione_sartoria\"', '<p>Gentile Cliente,</p>\n            <p>le confermiamo che per le lavorazioni richieste le è stata assegnata la procedura \"lavorazione_sartoria\".</p>\n            <p>In allegato trova il report di stato aggiornato ad oggi la data prevista di completamento è \"03/10/2025\".</p>\n            <p>Per qualsiasi domanda o chiarimento, non esiti a contattarci.</p>\n            <p>Cordiali Saluti,<br/>Opero Gestionale</p>', '2025-10-01 18:31:19', 0, NULL, '271e8e26-a9ad-43e5-9db6-1e5119b9e063');

-- --------------------------------------------------------

--
-- Struttura della tabella `email_nascoste`
--

CREATE TABLE `email_nascoste` (
  `id_utente` int(11) NOT NULL,
  `email_uid` int(11) NOT NULL,
  `data_cancellazione` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `email_nascoste`
--

INSERT INTO `email_nascoste` (`id_utente`, `email_uid`, `data_cancellazione`) VALUES
(3, 6, '2025-09-20 17:15:45'),
(3, 9, '2025-09-20 17:15:45'),
(3, 12836, '2025-09-24 16:04:34');

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

--
-- Dump dei dati per la tabella `funzioni`
--

INSERT INTO `funzioni` (`id`, `codice`, `descrizione`, `Scorciatoia`, `chiave_componente_modulo`) VALUES
(1, 'ANAGRAFICHE_VIEW', 'Permette di visualizzare l\'elenco delle anagrafiche', 0, 'AMMINISTRAZIONE'),
(2, 'ANAGRAFICHE_CREATE', 'Permette di creare una nuova anagrafica', 0, 'AMMINISTRAZIONE'),
(3, 'ANAGRAFICHE_EDIT', 'Permette di modificare un\'anagrafica esistente', 0, 'AMMINISTRAZIONE'),
(4, 'ANAGRAFICHE_DELETE', 'Permette di eliminare un\'anagrafica', 0, 'AMMINISTRAZIONE'),
(5, 'UTENTI_VIEW', 'Permette di visualizzare gli utenti della propria ditta', 1, 'AMMINISTRAZIONE'),
(10, 'ADMIN_FUNZIONI_VIEW', 'Visualizza pannello gestione funzioni', 0, 'ADMIN_PANEL'),
(11, 'ADMIN_FUNZIONI_MANAGE', 'Crea/modifica/associa funzioni alle ditte', 0, 'ADMIN_PANEL'),
(13, 'ADMIN_RUOLI_VIEW', 'Visualizza pannello ruoli e permessi di ditta', 0, 'ADMIN_PANEL'),
(14, 'ADMIN_RUOLI_MANAGE', 'Crea/modifica ruoli e assegna permessi', 0, 'ADMIN_PANEL'),
(26, 'PDC_VIEW', 'Visualizzazione del Piano dei Conti', 1, 'AMMINISTRAZIONE'),
(27, 'PDC_EDIT', 'Modifica e creazione voci del Piano dei Conti', 0, 'AMMINISTRAZIONE'),
(28, 'MAIL_ACCOUNTS_VIEW', 'Visualizza gli account email della ditta', 0, 'AMMINISTRAZIONE'),
(29, 'MAIL_ACCOUNTS_EDIT', 'crea e modifica gli account ditta', 0, 'AMMINISTRAZIONE'),
(30, 'UTENTI_CREATE', 'Permette di creare nuovi utenti', 0, 'AMMINISTRAZIONE'),
(31, 'UTENTI_EDIT', 'Permette di modificare i dati degli utenti', 0, 'AMMINISTRAZIONE'),
(32, 'AddressBookManager', 'gestione della rubrica \r\ncon liste di distribuzione', 1, 'MAIL'),
(34, 'RUBRICA_VIEW', 'Visualizza la rubrica aziendale', 1, 'RUBRICA'),
(35, 'RUBRICA_MANAGE', 'Crea e modifica contatti e liste di distribuzione', 1, 'RUBRICA'),
(36, 'PPA_MODULE', 'PERMETTE DI GESTIRE LA LOGICA E LO SPVILUPPO DEL PPA PROCEDURE PROCESSI AZIONI', 1, 'AMMINISTRAZIONE'),
(37, 'PROGRESSIVI_MANAGE', 'gestione di tutti i progressivi ditta\r\nprotocollo contabile\r\nnumero doc ', 0, NULL),
(38, 'FIN_SMART', 'gestione finanze', 1, 'FIN_SMART'),
(70, 'BS_VIEW_BENI', 'Permette di visualizzare l\'elenco dei beni.\r\ndi beni strumentali', 1, 'BSSMART'),
(71, 'BS_MANAGE_CATEGORIE', 'Permette di creare e modificare le categorie. DEI BENI STRUMENTALI', 0, 'BSSMART'),
(72, 'BS_VIEW_SCADENZE', 'GESTIONE SCADENZE BS', 1, 'BSSMART'),
(73, 'BS_CREATE_BENE', 'CREA UN NUOVO BENE', 0, 'BSSMART'),
(74, 'BS_EDIT_BENE', 'MODIFICHE SUL BENE', 0, 'BSSMART'),
(75, 'BS_DELETE_BENE', 'Permette di eliminare un bene.', 0, 'BSSMART'),
(76, 'BS_MANAGE_SCADENZE', 'MANAGERE SCADENZE BENI STRUMENTALI', 0, 'BSSMART'),
(77, 'BS_MANAGE_TIPI_SCADENZE', 'gestire i tipi di scandenze', 0, 'BSSMART'),
(80, 'PPA_SIS_MODULE_VIEW', 'accesso al modulo ppa ', 0, 'PPA SIS'),
(81, 'PPA_DESIGN_PROCEDURE', 'funzione di progettazione delle ppa', 0, 'PPA SIS'),
(82, 'PPA_ASSIGN_PROCEDURE', 'assegnazione delle ppa', 0, 'PPA SIS'),
(83, 'PPA_VIEW_MY_TASKS', NULL, 1, 'PPA SIS'),
(84, 'PPA_MONITOR_ALL', 'verifica tutte le ppa aziendali', 0, 'PPA SIS'),
(90, 'CT_VIEW', 'visualizza modulo catalogo', 0, 'CT_VIEW'),
(91, 'CT_MANAGE', 'Per la creazione e modifica delle entità del catalogo (categorie, articoli).', 0, 'CT_VIEW'),
(92, 'CT_COMPOSITI_MANAGE', 'Per la gestione specifica dei prodotti compositi..', 0, 'CT_VIEW'),
(93, 'MG_GIACENZE_VIEW', ' Per la sola visualizzazione delle giacenze di magazzino.\r\n\r\n', 0, 'CT_VIEW'),
(94, 'MG_MOVIMENTI_CREATE', ' Per poter effettuare movimenti di magazzino (carico/scarico).', 1, 'CT_VIEW'),
(95, 'MG_CONFIG_MANAGE', ' Per la configurazione delle tabelle di supporto al magazzino ', 0, 'CT_VIEW'),
(96, 'CT_IVA_MANAGE', 'visualizzazione e manutenzione iva', 0, 'CT_VIEW'),
(97, 'CT_UM_MANAGE', 'GESTIONE UNTIA DI MISURA', 0, 'CT_VIEW'),
(98, 'CT_STATI_MANAGE', 'Gestione Stati Entità Catalogo', 0, 'CT_VIEW'),
(99, 'CT_IMPORT_CSV', 'Importa Entità Catalogo da CSV', 0, 'CT_VIEW'),
(100, 'CT_LISTINI_VIEW', 'visualizza listini catalogo', 0, 'CT_VIEW'),
(101, 'CT_LISTINI_MANAGE', 'Gestione (creazione/modifica/eliminazione) listini di vendita del catalogo', 0, 'CT_VIEW'),
(102, 'CT_EAN_VIEW', 'visualizza EAN', 0, 'CT_VIEW'),
(103, 'CT_EAN_MANAGE', 'gestisci EAN', 0, 'CT_VIEW'),
(104, 'CT_COD_FORN_VIEW', 'visualizza i codici entità fornitroi', 0, 'CT_VIEW'),
(105, 'CT_COD_FORN_MANAGE', 'gestire i codici entità fornitroi', 0, 'CT_VIEW'),
(106, 'MG_VIEW', 'visualizzare il modulo Magazzino nel menu.\r\n', 0, 'MG_VIEW'),
(107, 'MG_MOVIMENTI_MANAGE', 'GESTISCE I MOVIMENTI', 0, 'MG_VIEW'),
(108, 'CT_IVA_VIEW', 'visualizza tabella iva', 0, 'CT_VIEW'),
(109, 'VA_CLIENTI_VIEW', 'VISUALIZZA MODULO VENDITE', 0, 'VA_CLIENTI_VIEW'),
(110, 'VA_CLIENTI_MANAGE', 'ORGANIZZA MODULO VENDITE', 0, 'VA_CLIENTI_VIEW');

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

--
-- Dump dei dati per la tabella `funzioni_ditte`
--

INSERT INTO `funzioni_ditte` (`id`, `id_funzione`, `id_ditta`, `created_at`, `updated_at`) VALUES
(219, 32, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(220, 73, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(221, 75, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(222, 74, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(223, 71, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(224, 76, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(225, 77, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(226, 70, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(227, 72, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(228, 105, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(229, 104, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(230, 92, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(231, 103, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(232, 102, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(233, 99, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(234, 96, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(235, 108, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(236, 101, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(237, 100, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(238, 91, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(239, 98, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(240, 97, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(241, 90, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(242, 38, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(243, 95, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(244, 93, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(245, 94, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(246, 107, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(247, 106, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(248, 82, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(249, 81, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(250, 84, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(251, 80, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(252, 83, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(253, 37, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(254, 35, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(255, 110, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(256, 11, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(257, 10, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(258, 14, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(259, 13, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(260, 2, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(261, 4, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(262, 3, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(263, 1, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(264, 29, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(265, 28, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(266, 27, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(267, 26, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(268, 36, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(269, 30, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(270, 31, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(271, 5, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16'),
(272, 109, 1, '2025-10-11 18:40:16', '2025-10-11 18:40:16');

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

--
-- Dump dei dati per la tabella `iva_contabili`
--

INSERT INTO `iva_contabili` (`id`, `id_ditta`, `codice`, `descrizione`, `aliquota`) VALUES
(1, 1, '04', 'IVA al 4%', 4.00),
(2, 1, '05', 'IVA al 5%', 5.00),
(3, 1, '10', 'IVA al 10%', 10.00),
(4, 1, '22', 'IVA al 22%', 22.00),
(5, 1, '59', 'Fuori campo IVA', 0.00);

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

--
-- Dump dei dati per la tabella `knex_migrations`
--

INSERT INTO `knex_migrations` (`id`, `name`, `batch`, `migration_time`) VALUES
(1, '20250906125707_initial_schema.js', 1, '2025-09-06 14:38:10'),
(2, '20250906160546_crea_tabelle_sc_funzioni_contabili.js', 2, '2025-09-08 06:57:20'),
(3, '20250907181507_aggiungi_tipi_funzione_contabile.js', 3, '2025-09-08 07:04:10'),
(5, '20250907215521_crea_tabella_funzioni_collegate.js', 4, '2025-09-08 07:32:39'),
(6, '20250907221322_migliora_gestione_automatismi.js', 4, '2025-09-08 07:32:39'),
(7, '20250908072347_crea_tabella_sc_funzioni_collegate.js', 4, '2025-09-08 07:32:39'),
(8, '20250908105000_rollback_tipi_funzione_errati.js', 5, '2025-09-08 08:54:53'),
(9, '20250908105301_funzionietipi.js', 5, '2025-09-08 08:54:53'),
(10, '20250909155018_aggiungi_data_registrazione_a_sc_partite_aperte.js', 6, '2025-09-09 15:53:05'),
(11, '20250909155025_aggiungi_id_testata_a_sc_partite_aperte.js', 7, '2025-09-09 16:00:37'),
(12, '20250909155045_AGGIUNGITABELLERELAZIONIDITTAEMODIFICADITTA.js', NULL, '2025-09-12 18:25:14'),
(13, '20250906145045_cancellatabelleosolete.js', 8, '2025-09-12 19:25:33'),
(14, '20250906145050_cancellatabelleosolete2.js', 9, '2025-09-13 07:29:16'),
(15, '20250906145051_cancellatabelleosoletecontiemastri.js', 10, '2025-09-13 08:34:03'),
(16, '20250906155045_fixmodificaunsignedditta.js', 11, '2025-09-13 09:34:49'),
(17, '20251309100045_ripristinatabbelaivacontabili.js', 12, '2025-09-13 09:56:35'),
(19, '20251309110052_modifichetabellaregitestatanumproti.js', 14, '2025-09-13 12:46:19'),
(20, '20250913121500_aggiorna_sc_registrazioni_testata.js', 15, '2025-09-13 12:56:09'),
(21, '20250913151500_TABELLAPROGRESSIVI_AN_DITTA.js', 16, '2025-09-13 12:59:38'),
(22, '20250913161500_modificatipifunzione.js', 17, '2025-09-13 17:12:21'),
(23, '20250916100000_add_fields_to_sc_partite_aperte.js', 18, '2025-09-16 08:18:01'),
(24, '20251609170052_tipo_scrittconta.js', 19, '2025-09-16 16:15:48'),
(25, '20250917105500_add_data_ult_to_an_progressivi.js', 20, '2025-09-17 08:57:01'),
(26, '20250917150000_add_camporicercarihecontabili.js', 21, '2025-09-17 12:38:19'),
(27, '20251709160052_tipo_scrittconta.js', 22, '2025-09-17 13:01:50'),
(28, '20251809160052_TABELLAUTENTIMAIL.js', 23, '2025-09-19 07:33:01'),
(32, '20250920180000_crea_modulo_beni_strumentali.js', 25, '2025-09-20 14:13:54'),
(33, '20250920193000_add_sottoconto_costo_to_bs_beni.js', 26, '2025-09-20 17:31:30'),
(34, '20250921191000_crea_tipi_scadenza.js', 27, '2025-09-22 07:32:55'),
(35, '20250921211000_modificanometabtipiscade.js', 27, '2025-09-22 07:32:55'),
(36, '20250921211000_modificanoscadenzede.js', NULL, '2025-09-22 07:34:42'),
(39, '202502209160052_PPA_1.js', 28, '2025-09-22 08:17:46'),
(40, '202502209160052_PPA_2.js', 28, '2025-09-22 08:17:46'),
(41, '202502209160052_PPA_3.js', 28, '2025-09-22 08:17:46'),
(42, '2025021309100045_creatbellamailservizi.js', 29, '2025-09-23 19:00:59'),
(43, '2025024309100045_creatbellateamcomunicai.js', 30, '2025-09-24 13:56:24'),
(44, '20250273161500_inserimentocaponote.js', 31, '2025-09-27 09:21:06'),
(45, '20250274309100045_implementamail.js', 32, '2025-09-27 17:08:45'),
(46, '20250290309100045_TABELLECATALOGOEMAG1.js', 33, '2025-09-29 10:18:25'),
(47, '20251809230052_TABELLLETTIMAIL.js', 34, '2025-09-29 17:23:25'),
(48, '20251809235052_TABELLLETTIMigraL.js', 35, '2025-09-29 17:28:48'),
(49, '20252009160052_TABELLAUTENTIMAIL.js', 36, '2025-09-29 17:29:06'),
(50, '202529091848_modificacategorie.js', 36, '2025-09-29 17:29:06'),
(52, '20250930190000_crea_tabella_stati_entita.js', 38, '2025-09-30 15:31:36'),
(53, '20250930190200_add_stato_to_ct_catalogo.js', 39, '2025-09-30 15:35:44'),
(54, '20251001090000_rename_prezzo_base_in_ct_catalogo.js', 40, '2025-10-01 07:05:53'),
(55, '20251001090100_crea_tabella_ct_listini.js', 41, '2025-10-01 07:07:00'),
(58, '20250917150000_creazionetabellectean.js', 42, '2025-10-02 09:40:51'),
(59, '20251001180000_crea_tabella_ct_listini_avanzata.js', 42, '2025-10-02 09:40:51'),
(60, '20251001200200_rename_ricarico_fields_in_ct_listini.js', 42, '2025-10-02 09:40:51'),
(61, '20250210309100045_ct_codici_fornitore1.js', 43, '2025-10-02 13:19:59'),
(62, '20251002164000_add_tipo_codice_to_ct_codici_fornitore.js', 44, '2025-10-02 14:37:57'),
(63, '202510040309100045_TABELLECATALOGOLOG.js', 45, '2025-10-04 14:47:56'),
(64, '20251004191500_create_magazzino_tables.js', 46, '2025-10-04 17:32:28'),
(65, '202529091948_modificacategorie2.js', 46, '2025-10-04 17:32:28'),
(80, '20251005__create_diff-pag.js', 47, '2025-10-07 10:54:21'),
(81, '20251005__create_mg_giacenze_table.js', 47, '2025-10-07 10:54:21'),
(82, '20251005__create_tbva.js', 48, '2025-10-07 11:02:32'),
(83, '20251005__create_tbva.js', NULL, '2025-10-07 11:04:42'),
(84, '202507102247_creatab_doc.js', 49, '2025-10-08 07:12:19'),
(86, '20251006__create_tbcliente.js', 50, '2025-10-08 08:32:45'),
(87, 'crea_tabella_va_gruppi_clienti.js', 51, '2025-10-08 14:37:46'),
(88, '20251008223500_refactor_va_trasportatori.js.js', 52, '2025-10-09 10:59:43'),
(90, '20251010203600_create_acquisti_condizioni_tables.js', 53, '2025-10-11 09:02:32'),
(91, '20251011010500_correct_sconti_dettaglio_schema.js', 54, '2025-10-11 09:15:26'),
(92, '202510110309100045_funzioniditte.js', 55, '2025-10-11 10:34:07'),
(93, '202510111309100045_add_id_ditta_to_ruoli_table.js', 56, '2025-10-11 10:37:28');

-- --------------------------------------------------------

--
-- Struttura della tabella `knex_migrations_lock`
--

CREATE TABLE `knex_migrations_lock` (
  `index` int(10) UNSIGNED NOT NULL,
  `is_locked` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `knex_migrations_lock`
--

INSERT INTO `knex_migrations_lock` (`index`, `is_locked`) VALUES
(3, 0);

-- --------------------------------------------------------

--
-- Struttura della tabella `lista_distribuzione_ditte`
--

CREATE TABLE `lista_distribuzione_ditte` (
  `id_lista` int(11) NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `lista_distribuzione_ditte`
--

INSERT INTO `lista_distribuzione_ditte` (`id_lista`, `id_ditta`) VALUES
(3, 6),
(3, 7),
(3, 12);

-- --------------------------------------------------------

--
-- Struttura della tabella `lista_distribuzione_utenti`
--

CREATE TABLE `lista_distribuzione_utenti` (
  `id_lista` int(11) NOT NULL,
  `id_utente` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `lista_distribuzione_utenti`
--

INSERT INTO `lista_distribuzione_utenti` (`id_lista`, `id_utente`) VALUES
(1, 1),
(1, 3),
(1, 6),
(1, 9),
(2, 1),
(2, 3),
(2, 6),
(2, 9),
(2, 31),
(2, 43),
(3, 1),
(3, 3);

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

--
-- Dump dei dati per la tabella `liste_distribuzione`
--

INSERT INTO `liste_distribuzione` (`id`, `id_ditta`, `nome_lista`, `descrizione`) VALUES
(1, 1, 'Diretti', NULL),
(2, 1, 'Consulenti', NULL),
(3, 1, 'aziende', NULL);

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

--
-- Dump dei dati per la tabella `log_accessi`
--

INSERT INTO `log_accessi` (`id`, `id_utente`, `indirizzo_ip`, `data_ora_accesso`, `id_funzione_accessibile`, `dettagli_azione`) VALUES
(1, 1, '192.168.1.10', '2025-09-20 17:15:45', 5, 'Login riuscito'),
(2, 3, NULL, '2025-09-29 17:46:54', NULL, 'Creata nuova categoria catalogo: FOOD (id: 4)'),
(3, 3, NULL, '2025-09-29 17:47:49', NULL, 'Creata nuova categoria catalogo: ALIMENTARI SECCHI (id: 5)'),
(4, 3, NULL, '2025-09-29 17:48:02', NULL, 'Creata nuova categoria catalogo: LIQUIDI (id: 6)'),
(5, 3, NULL, '2025-09-29 17:48:17', NULL, 'Creata nuova categoria catalogo: ALCOLICI (id: 7)'),
(6, 3, NULL, '2025-09-29 17:48:41', NULL, 'Creata nuova categoria catalogo: BEVANDE ANALCOLICHE (id: 8)'),
(7, 3, NULL, '2025-09-29 17:48:51', NULL, 'Creata nuova categoria catalogo: SUCCHI DI FRUTTA (id: 9)'),
(8, 3, NULL, '2025-09-29 17:49:12', NULL, 'Creata nuova categoria catalogo: LISCE (id: 10)'),
(9, 3, NULL, '2025-09-29 17:49:41', NULL, 'Creata nuova categoria catalogo: GASSATE (id: 11)');

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

--
-- Dump dei dati per la tabella `log_azioni`
--

INSERT INTO `log_azioni` (`id`, `id_utente`, `id_ditta`, `azione`, `dettagli`, `timestamp`) VALUES
(1, 3, 1, 'Creazione Bene Strumentale', 'ID Bene: 1, Descrizione: PC OLIVETTI M 24', '2025-09-20 18:14:20'),
(2, 3, 1, 'Creazione Categoria Bene', 'ID: 9, Codice: MOB-REG', '2025-09-21 10:54:30'),
(3, 3, 1, 'Creazione Registrazione Contabile', 'ID Testata: 33, Funzione: 12', '2025-09-26 18:30:55'),
(4, 3, 1, 'Creazione Registrazione Contabile', 'ID Testata: 34, Funzione: 14', '2025-09-26 18:35:01'),
(5, 3, 1, 'aggiornamento', 'aggiornata categoria catalogo: ALIMENTARI LIQUIDI (id: 6)', '2025-09-29 18:01:23'),
(6, 3, 1, 'eliminazione', 'eliminata categoria catalogo: LISCE (id: 10)', '2025-09-29 18:01:35'),
(7, 3, 1, '', 'Creata nuova categoria catalogo: PRODOTTI-FISICI (id: 12)', '2025-09-29 18:06:12'),
(8, 3, 1, 'aggiornamento', 'aggiornata categoria catalogo: FOOD (id: 4)', '2025-09-29 18:06:18'),
(9, 3, 1, 'aggiornamento', 'aggiornata categoria catalogo: PRODOTTI-FISICI-MERCI (id: 12)', '2025-09-29 18:06:30'),
(10, 3, 1, '', 'Creata nuova categoria catalogo: SERVIZI (id: 13)', '2025-09-29 18:06:51'),
(11, 3, 1, '', 'Creata nuova categoria catalogo: LAVORAZIONI (id: 14)', '2025-09-29 18:07:19'),
(12, 3, 1, 'eliminazione', 'eliminata categoria catalogo: LAVORAZIONI (id: 14)', '2025-09-29 18:45:15'),
(13, 3, 1, 'eliminazione', 'eliminata categoria catalogo: PRODOTTI-FISICI-MERCI (id: 12)', '2025-09-29 18:45:18'),
(14, 3, 1, 'eliminazione', 'eliminata categoria catalogo: FOOD (id: 4)', '2025-09-29 18:45:22'),
(15, 3, 1, 'eliminazione', 'eliminata categoria catalogo: ALIMENTARI LIQUIDI (id: 6)', '2025-09-29 18:45:24'),
(16, 3, 1, 'eliminazione', 'eliminata categoria catalogo: ALCOLICI (id: 7)', '2025-09-29 18:45:28'),
(17, 3, 1, 'eliminazione', 'eliminata categoria catalogo: ALIMENTARI SECCHI (id: 5)', '2025-09-29 18:45:30'),
(18, 3, 1, 'eliminazione', 'eliminata categoria catalogo: BEVANDE ANALCOLICHE (id: 8)', '2025-09-29 18:45:33'),
(19, 3, 1, 'eliminazione', 'eliminata categoria catalogo: GASSATE (id: 11)', '2025-09-29 18:45:36'),
(20, 3, 1, 'eliminazione', 'eliminata categoria catalogo: SERVIZI (id: 13)', '2025-09-29 18:45:39'),
(21, 3, 1, 'eliminazione', 'eliminata categoria catalogo: SUCCHI DI FRUTTA (id: 9)', '2025-09-29 18:45:41'),
(22, 3, 1, 'Creazione Categoria Catalogo', 'Creata categoria: 001 - MERCI (ID: 15)', '2025-09-29 19:00:38'),
(23, 3, 1, 'Creazione Categoria Catalogo', 'Creata categoria: 001.001 - FOOD (ID: 16)', '2025-09-29 19:00:53'),
(24, 3, 1, 'Creazione Categoria Catalogo', 'Creata categoria: 001.002 - NO FOOD (ID: 17)', '2025-09-29 19:01:14'),
(25, 3, 1, 'Creazione Categoria Catalogo', 'Creata categoria: 001.001.001 - DEPERIBILI (ID: 18)', '2025-09-29 19:01:34'),
(26, 3, 1, 'Creazione Categoria Catalogo', 'Creata categoria: 002 - SERVIZI (ID: 19)', '2025-09-29 19:07:17'),
(27, 3, 1, 'Creazione Categoria Catalogo', 'Creata categoria: 003 - LAVORAZIONI (ID: 20)', '2025-09-29 19:07:35'),
(28, 3, 1, 'Creazione Aliquota IVA', 'Creata nuova aliquota: 37 - IVA 37% (37%)', '2025-09-30 13:43:00'),
(29, 3, 1, 'Eliminazione Aliquota IVA', 'Eliminata aliquota ID: 6', '2025-09-30 14:17:54'),
(30, 3, 1, 'Creazione Unità di Misura', 'Creata nuova unità di misura: PZ - PEZZI', '2025-09-30 14:45:41'),
(31, 3, 1, 'Creazione Unità di Misura', 'Creata nuova unità di misura: CT - CARTONI', '2025-09-30 14:45:59'),
(32, 3, 1, 'Creazione Categoria Catalogo', 'Creata categoria: 001.001.002 - LIQUIDI (ID: 21)', '2025-09-30 17:18:23'),
(33, 3, 1, 'Creazione Categoria Catalogo', 'Creata categoria: 001.001.003 - DISPENSA (ID: 22)', '2025-09-30 17:18:50'),
(34, 3, 1, 'Creazione Categoria Catalogo', 'Creata categoria: 001.001.004 - FRESCHI (ID: 23)', '2025-09-30 17:19:17'),
(35, 3, 1, 'Creazione Categoria Catalogo', 'Creata categoria: 001.001.001.001 - SURGELATI (ID: 24)', '2025-09-30 17:19:44'),
(36, 3, 1, 'Eliminazione Categoria Catalogo', 'Eliminata categoria: 001.001.004 - FRESCHI (id: 23)', '2025-09-30 17:20:15'),
(37, 3, 1, 'Creazione Categoria Catalogo', 'Creata categoria: 001.001.001.002 - FRESCHI (ID: 25)', '2025-09-30 17:20:38'),
(38, 3, 1, 'Creazione Categoria Catalogo', 'Creata categoria: 001.002.001 - IGIENE CASA (ID: 26)', '2025-09-30 17:21:11'),
(39, 3, 1, 'Creazione Categoria Catalogo', 'Creata categoria: 001.002.002 - IGIENE CASA (ID: 27)', '2025-09-30 17:21:12'),
(40, 3, 1, 'Creazione Categoria Catalogo', 'Creata categoria: 001.002.002 - IGIENE CASA (ID: 28)', '2025-09-30 17:21:20'),
(41, 3, 1, 'Eliminazione Categoria Catalogo', 'Eliminata categoria: 001.002.002 - IGIENE CASA (id: 28)', '2025-09-30 17:21:32'),
(42, 3, 1, 'Eliminazione Categoria Catalogo', 'Eliminata categoria: 001.002.002 - IGIENE CASA (id: 27)', '2025-09-30 17:21:35'),
(43, 3, 1, 'Creazione Categoria Catalogo', 'Creata categoria: 001.002.002 - IGIENE PERSONA (ID: 29)', '2025-09-30 17:21:51'),
(44, 3, 1, 'Creazione Unità di Misura', 'Creata nuova unità di misura: KG - Chilogrammi', '2025-09-30 17:43:33'),
(45, 3, 1, 'Creazione Unità di Misura', 'Creata nuova unità di misura: LT - LITRO', '2025-09-30 17:43:45'),
(46, 3, 1, 'Modifica Stato Entità', 'Modificato stato ID: 1', '2025-09-30 17:52:10'),
(47, 3, 1, 'Modifica Stato Entità', 'Modificato stato ID: 1', '2025-09-30 17:52:18'),
(48, 3, 1, 'Importazione CSV Catalogo', 'Importate 0 nuove entità. Errori: 6.', '2025-09-30 19:49:01'),
(49, 3, 1, 'Importazione CSV Catalogo', 'Importate 6 nuove entità. Errori: 0.', '2025-10-01 13:30:45'),
(50, 3, 1, 'Importazione CSV Catalogo', 'Create: 0, Aggiornate: 0, Ignorate: 6. Errori: 0.', '2025-10-01 13:42:55'),
(51, 3, 1, 'Importazione CSV Catalogo', 'Create: 0, Aggiornate: 0, Ignorate: 6. Errori: 0.', '2025-10-01 13:44:20'),
(52, 3, 1, 'Importazione CSV Catalogo', 'Create: 0, Aggiornate: 6, Ignorate: 0. Errori: 0.', '2025-10-01 13:57:54'),
(53, 3, 1, 'Importazione CSV Catalogo', 'Create: 0, Aggiornate: 6, Ignorate: 0. Errori: 0.', '2025-10-01 13:58:23'),
(54, 3, 1, 'Importazione CSV Catalogo', 'Create: 0, Aggiornate: 6, Ignorate: 0. Errori: 0.', '2025-10-01 13:58:52'),
(55, 3, 1, 'Importazione CSV Catalogo', 'Create: 0, Aggiornate: 0, Ignorate: 6. Errori: 0.', '2025-10-01 14:02:51'),
(56, 3, 1, 'Importazione CSV Catalogo', 'Create: 0, Aggiornate: 6, Ignorate: 0. Errori: 0.', '2025-10-01 14:03:36'),
(57, 3, 1, 'Importazione CSV Catalogo', 'Create: 0, Aggiornate: 6, Ignorate: 0. Errori: 0.', '2025-10-01 14:08:15'),
(58, 3, 1, 'Importazione CSV Catalogo', 'Create: 0, Aggiornate: 6, Ignorate: 0. Errori: 0.', '2025-10-01 14:08:58'),
(59, 3, 1, 'Importazione CSV Catalogo', 'Create: 0, Aggiornate: 6, Ignorate: 0. Errori: 0.', '2025-10-01 14:12:38'),
(60, 3, 1, 'Importazione CSV Catalogo', 'Create: 0, Aggiornate: 6, Ignorate: 0. Errori: 0.', '2025-10-01 14:13:19'),
(61, 3, 1, 'Importazione CSV Catalogo', 'Create: 0, Aggiornate: 6, Ignorate: 0. Errori: 0.', '2025-10-01 14:17:02'),
(62, 3, 1, 'Importazione CSV Catalogo', 'Create: 0, Aggiornate: 0, Ignorate: 6. Errori: 0.', '2025-10-01 14:17:13'),
(63, 3, 1, 'Importazione CSV Catalogo', 'Create: 0, Aggiornate: 0, Ignorate: 6. Errori: 0.', '2025-10-01 14:30:13'),
(64, 3, 1, 'Importazione CSV Catalogo', 'Create: 0, Aggiornate: 6, Ignorate: 0. Errori: 0.', '2025-10-01 14:30:28'),
(65, 3, 1, 'Modifica Entità Catalogo', 'Modificata entità: 300411050 (ID: 1)', '2025-10-01 14:37:56'),
(66, 3, 1, 'Modifica Entità Catalogo', 'Modificata entità: 300411050 (ID: 1)', '2025-10-01 14:38:02'),
(67, 3, 1, 'Modifica Entità Catalogo', 'Modificata entità: 305020007 (ID: 3)', '2025-10-01 14:38:10'),
(68, 3, 1, 'Modifica Entità Catalogo', 'Modificata entità: 305770007 (ID: 4)', '2025-10-01 14:38:14'),
(69, 3, 1, 'Modifica Entità Catalogo', 'Modificata entità: 305770009 (ID: 5)', '2025-10-01 14:38:18'),
(70, 3, 1, 'Modifica Entità Catalogo', 'Modificata entità: 305770009 (ID: 5)', '2025-10-01 14:38:40'),
(71, 3, 1, 'Modifica Entità Catalogo', 'Modificata entità: 300411050 (ID: 1)', '2025-10-01 14:40:47'),
(72, 3, 1, 'Modifica Entità Catalogo', 'Modificata entità: 3004110500 (ID: 1)', '2025-10-01 14:40:55'),
(73, 3, 1, 'Modifica Entità Catalogo', 'Modificata entità: 305770009 (ID: 5)', '2025-10-01 14:43:56'),
(74, 3, 1, 'Creazione Entità Catalogo', 'Creata nuova entità: 3004110509 - ARTICOLO', '2025-10-01 15:14:44'),
(75, 3, 1, 'Importazione CSV Catalogo', 'Create: 0, Aggiornate: 6, Ignorate: 0. Errori: 0.', '2025-10-01 15:53:42'),
(76, 3, 1, 'Modifica Entità Catalogo', 'Modificata entità: 3004110509 (ID: 13)', '2025-10-01 15:53:55'),
(77, 3, 1, 'Modifica Entità Catalogo', 'Modificata entità: 300411050 (ID: 1)', '2025-10-01 18:09:19'),
(78, 3, 1, 'Creazione Listino', 'Creato nuovo listino \"base\" per entità ID 1', '2025-10-01 18:09:47'),
(79, 3, 1, 'Modifica Listino', 'Modificato listino ID: 1', '2025-10-01 18:10:16'),
(80, 3, 1, 'Modifica Listino', 'Modificato listino ID: 1', '2025-10-01 18:10:26'),
(81, 3, 1, 'Creazione Listino', 'Creato nuovo listino \"futuro\" per entità ID 1', '2025-10-01 18:11:08'),
(82, 3, 1, 'Modifica Listino', 'Modificato listino ID: 2', '2025-10-02 07:31:56'),
(83, 3, 1, 'Aggiunta EAN', 'Aggiunto EAN 8006473903932 a entità ID 1', '2025-10-02 12:58:05'),
(84, 3, 1, 'Creazione Listino', 'Creato nuovo listino \"attuale\" per entità ID 1', '2025-10-02 13:42:23'),
(85, 3, 1, 'Creazione Codice Fornitore', 'Aggiunto codice \'10\' all\'articolo ID 1. Nuovo ID: 1', '2025-10-02 14:16:22'),
(86, 3, 1, 'Modifica Listino', 'Modificato listino ID: 3', '2025-10-03 07:26:25'),
(87, 3, 1, 'Eliminazione Listino', 'Eliminato listino ID: 1', '2025-10-03 07:27:06'),
(88, 3, 1, 'Creazione Tipo Scadenza Bene', 'ID: 1, Descrizione: SCADENZE MECCANICHE', '2025-10-04 15:52:30'),
(89, 3, 1, 'Creazione Scadenza Bene', 'ID Scadenza: 1, per bene ID: 1', '2025-10-04 15:53:03'),
(90, 3, 1, 'Creazione Scadenza Bene', 'ID Scadenza: 2, per bene ID: 1', '2025-10-04 15:53:07'),
(91, 3, 1, 'Eliminazione Scadenza Bene', 'ID Scadenza: 1', '2025-10-04 15:53:18'),
(92, 3, 1, 'Creazione Registrazione Contabile', 'ID Testata: 35, Funzione: 9', '2025-10-06 16:12:58');

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

--
-- Dump dei dati per la tabella `mg_causali_movimento`
--

INSERT INTO `mg_causali_movimento` (`id`, `id_ditta`, `codice`, `descrizione`, `tipo`, `created_at`, `updated_at`) VALUES
(1, 1, 'DDT', 'DOCUMENTO DI  TRASPORTO VENDITA', 'scarico', '2025-10-04 18:46:46', '2025-10-04 18:47:18'),
(2, 1, 'B_AC', 'BOLLA CONSEGNA ACQUISTI', 'carico', '2025-10-04 18:47:13', '2025-10-04 18:47:13'),
(3, 1, 'RETT_INV+', 'RETTIFICA INVENTARIALE POSITIVA', 'carico', '2025-10-04 18:47:48', '2025-10-04 18:47:48'),
(4, 1, 'RETT_INV-', 'RETTIFICA INVENTARIALE NEGAT', 'carico', '2025-10-04 18:48:18', '2025-10-04 18:48:18');

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

--
-- Dump dei dati per la tabella `mg_magazzini`
--

INSERT INTO `mg_magazzini` (`id`, `id_ditta`, `codice`, `descrizione`, `note`, `created_at`, `updated_at`) VALUES
(1, 1, 'MAG_01', 'MAGAZZINO CENTRALE', 'MAGAZZINO CENTRALE', '2025-10-04 18:45:59', '2025-10-04 18:45:59');

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

--
-- Dump dei dati per la tabella `moduli`
--

INSERT INTO `moduli` (`codice`, `descrizione`, `chiave_componente`) VALUES
(10, 'Amministrazione', 'AMMINISTRAZIONE'),
(20, 'Contabilità Smart', 'CONT_SMART'),
(30, 'Pannello Admin', 'ADMIN_PANEL'),
(40, 'Posta', 'MAIL'),
(50, 'Rubrica', 'RUBRICA'),
(60, 'Gestione Finanza', 'FIN_SMART'),
(70, 'BS SMART', 'BSSMART'),
(80, 'SISTEMA PPA', 'PPA SIS'),
(90, 'CATALOGO', 'CT_VIEW'),
(100, 'MAGAZZINO', 'MG_VIEW'),
(110, 'VENDITE', 'VA_CLIENTI_VIEW');

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

--
-- Dump dei dati per la tabella `ppa_azioni`
--

INSERT INTO `ppa_azioni` (`ID`, `ID_Processo`, `NomeAzione`, `Descrizione`, `ID_RuoloDefault`) VALUES
(1, 4, 'Verifica strutture di vendita', 'Nel corso del primo appuntamento nella sede del cliente, è essenziale verificare lo stato dei punti vendita.  Verificare qualità assortimento - adeguatezza del personale - formazione del personale- qualità e completezza delle attrezzature - ', 3),
(22, 16, 'PROA', 'PRIMA', 3),
(25, 19, '2', '2', 2),
(27, 23, 'controllare lo stato', NULL, 3),
(28, 24, 'lavorazione', 'eseguire il lavoror', 3),
(29, 25, 'consegna al cliente', 'dimostrazione al cliente delle lavorazione eseguite\ne firma ricezione capo', 3),
(30, 26, 'Prepararsi per il ritiro', 'il cliente sarà avvisato', 4),
(31, 27, 'ritiro del capo', 'verificare il capo assieme al cliente', 3),
(32, 27, 'prendere le misure', 'le misure vanno prese con attenzione', 3),
(33, 28, 'messa a modello', 'raccogliere le informazione ed eseguire i lavori', 3),
(34, 29, 'chiamare il cliente', 'telefonare per il ritiro', 3),
(35, 29, 'incasso', 'prima della consegna incassare', 2);

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

--
-- Dump dei dati per la tabella `ppa_istanzeazioni`
--

INSERT INTO `ppa_istanzeazioni` (`ID`, `ID_IstanzaProcedura`, `ID_Azione`, `ID_UtenteAssegnato`, `ID_Stato`, `DataScadenza`, `DataCompletamento`, `NoteSvolgimento`, `NoteParticolari`, `Note`) VALUES
(1, 1, 1, 31, 1, NULL, NULL, NULL, NULL, NULL),
(51, 10, 8, 6, NULL, '2025-10-30', NULL, NULL, NULL, NULL),
(53, 12, 25, 3, 1, '2025-10-05', NULL, NULL, NULL, NULL),
(54, 13, 25, 3, 1, '2025-09-24', NULL, NULL, NULL, NULL),
(55, 14, 27, 6, 1, '2025-09-19', NULL, NULL, NULL, NULL),
(56, 14, 28, 31, 1, '2025-09-26', NULL, NULL, NULL, NULL),
(57, 14, 29, 6, 1, '2025-09-13', NULL, NULL, NULL, NULL),
(58, 14, 30, 48, 1, '2025-09-26', NULL, NULL, NULL, NULL),
(59, 15, 25, 3, 1, '2025-09-17', NULL, NULL, NULL, NULL),
(60, 16, 25, 3, 1, '2025-09-25', NULL, NULL, NULL, NULL),
(61, 17, 25, 3, 1, '2025-09-18', NULL, NULL, NULL, NULL),
(62, 18, 25, 3, 1, '2025-09-26', NULL, NULL, NULL, NULL),
(63, 19, 27, 6, 1, NULL, NULL, NULL, NULL, NULL),
(64, 19, 28, 31, 1, NULL, NULL, NULL, NULL, NULL),
(65, 19, 29, 6, 1, NULL, NULL, NULL, NULL, NULL),
(66, 19, 30, 48, 1, NULL, NULL, NULL, NULL, NULL),
(67, 20, 27, 6, 1, NULL, NULL, NULL, NULL, NULL),
(68, 20, 28, 6, 1, NULL, NULL, NULL, NULL, NULL),
(69, 20, 29, 31, 1, NULL, NULL, NULL, NULL, NULL),
(70, 20, 30, 48, 1, NULL, NULL, NULL, NULL, NULL),
(71, 21, 31, 31, 1, NULL, NULL, NULL, NULL, NULL),
(72, 21, 32, 31, 1, NULL, NULL, NULL, NULL, NULL),
(73, 21, 33, 6, 1, NULL, NULL, NULL, NULL, NULL),
(74, 21, 34, 31, 1, NULL, NULL, NULL, NULL, NULL),
(75, 21, 35, 3, 3, NULL, '2025-09-27 17:25:22', NULL, NULL, 'ho telefonato il clente che porterà solo soldi in contanti'),
(76, 22, 31, 6, 1, '2025-09-27', NULL, NULL, NULL, NULL),
(77, 22, 32, 31, 1, '2025-09-27', NULL, NULL, NULL, NULL),
(78, 22, 33, 6, 1, '2025-09-27', NULL, NULL, NULL, NULL),
(79, 22, 34, 31, 1, '2025-09-30', NULL, NULL, NULL, NULL),
(80, 22, 35, 3, 3, NULL, '2025-09-27 15:31:54', NULL, NULL, 'il campo è pronto '),
(81, 23, 31, 6, 1, '2025-10-16', NULL, NULL, 'rrr', NULL),
(82, 23, 32, 6, 1, NULL, NULL, NULL, NULL, NULL),
(83, 23, 33, 31, 1, NULL, NULL, NULL, NULL, NULL),
(84, 23, 34, 1, 1, '2025-10-03', NULL, NULL, NULL, NULL),
(85, 23, 35, 3, 1, NULL, NULL, NULL, NULL, NULL);

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

--
-- Dump dei dati per la tabella `ppa_istanzeprocedure`
--

INSERT INTO `ppa_istanzeprocedure` (`ID`, `TargetEntityType`, `TargetEntityID`, `ID_ProceduraDitta`, `ID_UtenteCreatore`, `DataInizio`, `DataPrevistaFine`, `DataConclusioneEffettiva`, `Stato`, `Esito`) VALUES
(1, 'DITTA', 6, 2, 3, '2025-09-20 19:15:45', '2025-10-24', NULL, 'In Corso', NULL),
(5, 'DITTA', 7, 2, 3, '2025-09-20 19:15:45', '2025-08-30', NULL, 'In Corso', NULL),
(6, 'DITTA', 6, 1, 3, '2025-09-20 19:15:45', '2025-08-24', NULL, 'In Corso', NULL),
(7, 'DITTA', 6, 1, 3, '2025-09-20 19:15:45', '2025-08-30', NULL, 'In Corso', NULL),
(8, 'DITTA', 6, 2, 3, '2025-09-20 19:15:45', '2025-08-24', NULL, 'In Corso', NULL),
(9, 'DITTA', 6, 6, 3, '2025-09-20 19:15:45', '2025-11-29', NULL, 'In Corso', NULL),
(10, 'DITTA', 14, 2, 3, '2025-09-20 19:15:45', '2025-10-30', NULL, 'In Corso', NULL),
(12, 'DITTA', 12, 13, 3, '2025-09-23 20:16:56', '2025-09-26', NULL, 'In Corso', NULL),
(13, 'DITTA', 14, 13, 3, '2025-09-23 20:19:07', '2025-09-27', NULL, 'In Corso', NULL),
(14, 'UTENTE', 46, 7, 3, '2025-09-23 20:33:17', '2025-09-26', NULL, 'In Corso', NULL),
(15, 'UTENTE', 48, 13, 3, '2025-09-23 20:39:49', '2025-09-27', NULL, 'In Corso', NULL),
(16, 'DITTA', 12, 13, 3, '2025-09-23 20:40:25', '2025-10-05', NULL, 'In Corso', NULL),
(17, 'DITTA', 12, 13, 3, '2025-09-23 20:45:09', '2025-09-26', NULL, 'In Corso', NULL),
(18, 'DITTA', 16, 13, 3, '2025-09-24 14:49:47', '2025-09-25', NULL, 'In Corso', NULL),
(19, 'DITTA', 16, 7, 3, '2025-09-24 19:17:41', '2025-10-03', NULL, 'In Corso', NULL),
(20, 'DITTA', 16, 7, 3, '2025-09-24 19:20:35', '2025-09-26', NULL, 'In Corso', NULL),
(21, 'DITTA', 16, 14, 3, '2025-09-26 20:44:20', '2025-10-18', NULL, 'In Corso', NULL),
(22, 'UTENTE', 48, 14, 3, '2025-09-27 13:31:16', '2025-10-04', NULL, 'In Corso', NULL),
(23, 'DITTA', 14, 14, 3, '2025-10-01 20:30:41', '2025-10-25', NULL, 'In Corso', NULL);

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

--
-- Dump dei dati per la tabella `ppa_procedureditta`
--

INSERT INTO `ppa_procedureditta` (`ID`, `id_ditta`, `ID_ProceduraStandard`, `NomePersonalizzato`, `TargetEntityTypeAllowed`, `Attiva`) VALUES
(1, 1, 1, 'Gruppo G%G spa ', 'DITTA', 1),
(2, 1, 2, 'Nuovi Clienti Top', 'DITTA', 1),
(3, 1, 3, 'prodotti venduti on line', 'DITTA', 1),
(4, 1, 1, 'Verifica Documenti', 'DITTA', 1),
(5, 1, 1, 'Tagliano Auto-FuoriGaranzia', 'DITTA', 1),
(6, 1, 1, 'Gestione Cliente Associato', 'DITTA', 1),
(7, 1, 2, 'lavorazione_sartoria', 'DITTA', 1),
(12, 1, 4, 'PRIMA', 'DITTA', 1),
(13, 1, 4, '23', 'DITTA', 1),
(14, 1, 4, 'Lavorazioni_cliente', 'UTENTE', 1);

-- --------------------------------------------------------

--
-- Struttura della tabella `ppa_procedurestandard`
--

CREATE TABLE `ppa_procedurestandard` (
  `ID` int(10) UNSIGNED NOT NULL,
  `CodiceProcedura` varchar(100) NOT NULL,
  `Descrizione` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `ppa_procedurestandard`
--

INSERT INTO `ppa_procedurestandard` (`ID`, `CodiceProcedura`, `Descrizione`) VALUES
(1, 'ONBOARDING_CLIENTE', 'Flusso standard per l\'acquisizione di un nuovo cliente'),
(2, 'GESTIONE_ORDINE', 'Flusso standard per la gestione di un ordine di vendita'),
(3, 'RIPARAZIONE_PRODOTTO', 'Flusso standard per la riparazione di un prodotto in garanzia'),
(4, '', 'Procedura Personalizzata / Non Standard');

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

--
-- Dump dei dati per la tabella `ppa_processi`
--

INSERT INTO `ppa_processi` (`ID`, `ID_ProceduraDitta`, `NomeProcesso`, `OrdineSequenziale`) VALUES
(1, 3, 'Stabilire contatto con Cliente - Email- Telefonico .', 0),
(2, 3, 'Verifica Consegna', 0),
(3, 3, 'Contattare il Cliente per soluzione', 0),
(4, 2, 'Appuntamento con la Direzione ', 0),
(5, 2, 'Gestione Cliente dedicata per i primi 3 mesi', 0),
(6, 2, 'Valutazione stato ', 0),
(8, 1, 'prova 1', 0),
(9, 6, 'Gestione Assortimento', 0),
(10, 6, 'Gestione Promozioni', 0),
(11, 6, 'Amministrative', 0),
(12, 4, 'raccolta dati documeti', 0),
(16, 12, 'PRIMA', 0),
(19, 13, '2e', 0),
(23, 7, 'Ricezione_Verifica_Capo', 0),
(24, 7, 'lavorazione', 0),
(25, 7, 'consegna-capo', 0),
(26, 7, 'ritiro capo', 0),
(27, 14, 'Consegna materiale', 0),
(28, 14, 'lavorazioni', 0),
(29, 14, 'consegna del prodotto finio', 0);

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

--
-- Dump dei dati per la tabella `ppa_stati_azione`
--

INSERT INTO `ppa_stati_azione` (`ID`, `id_ditta`, `NomeStato`, `Descrizione`, `Colore`) VALUES
(1, 1, 'Assegnato', NULL, '#808080'),
(2, 1, 'Accettato', NULL, '#007bff'),
(3, 1, 'Evaso', NULL, '#28a745'),
(4, 1, 'Bloccato', NULL, '#dc3545');

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

--
-- Dump dei dati per la tabella `ppa_team`
--

INSERT INTO `ppa_team` (`ID`, `ID_IstanzaProcedura`, `NomeTeam`, `DataCreazione`) VALUES
(4, 5, 'Team Procedura #5 - 23/08/2025', '2025-09-20 17:15:45'),
(5, 6, 'Team Procedura #6 - 23/08/2025', '2025-09-20 17:15:45'),
(6, 7, 'Team Procedura #7 - 23/08/2025', '2025-09-20 17:15:45'),
(7, 8, 'Team Procedura #8 - 23/08/2025', '2025-09-20 17:15:45'),
(8, 9, 'Team Procedura #9 - 25/08/2025', '2025-09-20 17:15:45'),
(9, 10, 'Team Procedura #10 - 26/08/2025', '2025-09-20 17:15:45'),
(10, 18, 'Team per 23', '2025-09-24 12:49:47'),
(11, 19, 'Team per lavorazione_sartoria', '2025-09-24 17:17:41'),
(12, 20, 'Team per lavorazione_sartoria', '2025-09-24 17:20:35'),
(13, 21, 'Team per Lavorazioni_cliente', '2025-09-26 18:44:20'),
(14, 22, 'Team per Lavorazioni_cliente', '2025-09-27 11:31:16'),
(15, 23, 'Team per procedura 23', '2025-10-01 18:30:41');

-- --------------------------------------------------------

--
-- Struttura della tabella `ppa_teammembri`
--

CREATE TABLE `ppa_teammembri` (
  `ID_Team` int(11) NOT NULL,
  `ID_Utente` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `ppa_teammembri`
--

INSERT INTO `ppa_teammembri` (`ID_Team`, `ID_Utente`) VALUES
(4, 3),
(4, 9),
(4, 31),
(4, 43),
(5, 31),
(6, 31),
(7, 3),
(7, 31),
(7, 43),
(8, 3),
(8, 31),
(8, 43),
(9, 1),
(9, 3),
(9, 6),
(9, 31),
(9, 43),
(10, 3),
(11, 6),
(11, 31),
(11, 48),
(12, 6),
(12, 31),
(12, 48),
(13, 3),
(13, 6),
(13, 31),
(14, 3),
(14, 6),
(14, 31),
(15, 1),
(15, 3),
(15, 6),
(15, 31);

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

--
-- Dump dei dati per la tabella `ppa_team_comunicazioni`
--

INSERT INTO `ppa_team_comunicazioni` (`id`, `id_team`, `id_utente_mittente`, `messaggio`, `created_at`) VALUES
(1, 7, 3, 'eee', '2025-09-24 15:39:07'),
(2, 7, 3, 'eee', '2025-09-24 15:39:24'),
(3, 7, 3, 'proveedo', '2025-09-24 16:12:17'),
(4, 7, 3, 'saluti\n', '2025-09-24 16:26:08'),
(5, 7, 3, 'ecco', '2025-09-24 16:51:34'),
(6, 10, 3, 'iiii', '2025-09-24 16:54:15'),
(7, 7, 3, 'kkk', '2025-09-24 17:36:22'),
(8, 5, 3, 'qqq', '2025-09-26 18:03:36'),
(9, 5, 3, 'salve\n', '2025-09-26 18:10:32'),
(10, 13, 3, 'mancano le misure specifiche', '2025-09-26 18:45:13'),
(11, 13, 3, 'il lavoro è pronto\n', '2025-09-27 10:09:10'),
(12, 14, 3, 'le misure del modello sono\n30 cm larghezza\n32 cm collo', '2025-09-27 11:32:45');

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

--
-- Dump dei dati per la tabella `privacy_policies`
--

INSERT INTO `privacy_policies` (`id`, `id_ditta`, `responsabile_trattamento`, `corpo_lettera`, `data_aggiornamento`) VALUES
(1, 1, '3', '<p><br></p><p><strong>Autorizzazione al Trattamento dei Dati Personali per Finalità Commerciali e per la Comunicazione a Terzi</strong></p><p>Io sottoscritto/a,</p><p><strong>[Nome_Utente]</strong>, codice fiscale <strong>[codice fiscale]</strong>,</p><p><strong>PREMESSO CHE</strong></p><p><br></p><ul><li>ho ricevuto l\'informativa ai sensi dell’art. 13 del Regolamento (UE) 2016/679 (GDPR) relativa al trattamento dei miei dati personali da parte di <strong>[DITTA]</strong>, con sede in <strong>[indirizzo completo]</strong>,</li><li>ho compreso le finalità e le modalità del trattamento, i miei diritti e i soggetti coinvolti nel trattamento stesso,</li></ul><p><strong>AUTORIZZO</strong></p><p>il trattamento dei miei dati personali da parte di <strong>[Nome dell’Azienda]</strong> per le seguenti finalità:</p><ol><li><strong>Finalità di marketing diretto</strong>: invio di comunicazioni commerciali, promozionali e informative tramite e-mail, SMS, telefono, posta tradizionale o altri strumenti automatizzati di contatto, relative a prodotti e servizi offerti dal Titolare;</li><li><strong>Finalità di profilazione</strong>: analisi delle mie preferenze, abitudini e scelte di consumo al fine di ricevere comunicazioni personalizzate;</li><li><strong>Comunicazione a soggetti terzi</strong>: cessione e/o comunicazione dei miei dati personali a società terze, partner commerciali o altri titolari autonomi del trattamento, che potranno trattarli per proprie finalità di marketing diretto o altre attività commerciali compatibili.</li></ol><p><strong>DICHIARO</strong> inoltre di essere consapevole che:</p><p><br></p><ul><li>Il conferimento dei dati per le suddette finalità è facoltativo e l’eventuale mancato consenso non pregiudica la fruizione dei servizi principali offerti;</li><li>Posso in qualsiasi momento revocare il presente consenso, ai sensi dell’art. 7, par. 3, GDPR, scrivendo a <strong>[indirizzo email del titolare del trattamento]</strong>;</li><li>I miei diritti in merito al trattamento sono indicati negli articoli da 15 a 22 del GDPR.</li></ul><p>Luogo e data: _______________________________</p><p>Il presente documento è inviato a mezzo mail, accedendo al portale si considera accettata</p><p>non</p>', '2025-10-06 14:12:51'),
(2, 3, 'angioletto', '<p>se le informazioni le vuoi pazientarrrr</p>', '2025-09-20 17:15:45');

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

--
-- Dump dei dati per la tabella `registration_tokens`
--

INSERT INTO `registration_tokens` (`id`, `id_ditta`, `token`, `email_destinatario`, `scadenza`, `utilizzato`, `data_creazione`) VALUES
(1, 3, '7a92f40a-3995-4e19-b471-6c56d80c855c', NULL, '2025-09-20 17:15:45', 0, '2025-09-20 17:15:45'),
(27, 1, '80ce27b1-f1ac-4fa6-997d-800b8c67f0b9', NULL, '2025-09-20 17:15:45', 1, '2025-09-20 17:15:45'),
(28, 1, 'a606cbdd-ef35-40e9-992e-57b96c834565', NULL, '2025-10-13 14:43:39', 0, '2025-10-06 14:43:39');

-- --------------------------------------------------------

--
-- Struttura della tabella `relazioni_ditta`
--

CREATE TABLE `relazioni_ditta` (
  `codice` char(1) NOT NULL,
  `descrizione` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `relazioni_ditta`
--

INSERT INTO `relazioni_ditta` (`codice`, `descrizione`) VALUES
('C', 'Cliente'),
('E', 'Entrambe'),
('F', 'Fornitore'),
('N', 'Nessuna'),
('P', 'Punto Vendita');

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

--
-- Dump dei dati per la tabella `ruoli`
--

INSERT INTO `ruoli` (`id`, `tipo`, `livello`, `id_ditta`) VALUES
(1, 'Amministratore_sistema', 100, NULL),
(2, 'Amministratore_Azienda', 90, NULL),
(3, 'Utente_interno', 80, NULL),
(4, 'Utente_esterno', 50, NULL);

-- --------------------------------------------------------

--
-- Struttura della tabella `ruoli_funzioni`
--

CREATE TABLE `ruoli_funzioni` (
  `id_ruolo` int(11) NOT NULL,
  `id_funzione` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `ruoli_funzioni`
--

INSERT INTO `ruoli_funzioni` (`id_ruolo`, `id_funzione`) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(1, 5),
(1, 10),
(1, 11),
(1, 13),
(1, 14),
(1, 26),
(1, 27),
(1, 28),
(1, 29),
(1, 30),
(1, 31),
(1, 32),
(1, 34),
(1, 35),
(1, 36),
(1, 37),
(1, 38),
(1, 70),
(1, 71),
(1, 72),
(1, 73),
(1, 74),
(1, 75),
(1, 76),
(1, 77),
(1, 80),
(1, 81),
(1, 82),
(1, 83),
(1, 84),
(1, 90),
(1, 91),
(1, 92),
(1, 93),
(1, 94),
(1, 95),
(1, 96),
(1, 97),
(1, 98),
(1, 99),
(1, 100),
(1, 101),
(1, 102),
(1, 103),
(1, 104),
(1, 105),
(1, 106),
(1, 107),
(1, 108),
(1, 109),
(1, 110),
(2, 10),
(2, 11),
(2, 13),
(2, 14),
(3, 2),
(3, 3),
(3, 4),
(3, 11),
(3, 13),
(4, 1);

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

--
-- Dump dei dati per la tabella `sc_funzioni_contabili`
--

INSERT INTO `sc_funzioni_contabili` (`id`, `id_ditta`, `codice_funzione`, `nome_funzione`, `descrizione`, `categoria`, `tipo_funzione`, `gestioni_abbinate`, `attiva`, `created_at`, `updated_at`) VALUES
(9, 1, 'REG-FATT-ACQ', 'Registrazione Fattura Acquisto', 'Registra una fattura da fornitore, gestisce l\'IVA e crea la partita aperta nello scadenzario.', 'Acquisti', 'Finanziaria', 'I', 1, '2025-09-20 17:15:45', '2025-09-20 17:15:45'),
(11, 1, 'DARE_AVERE', 'DARE AVERE', 'questa funzione permette all\'utente di scegliere i conti ', 'Generale', 'Primaria', NULL, 1, '2025-09-20 17:15:45', '2025-09-20 17:15:45'),
(12, 1, 'REG-FATT-VENDITA', 'Registrazione Fattura Vendita', 'REGISTRAZIONE MANUALE FATTURA2', 'Vendite', 'Finanziaria', 'I', 1, '2025-09-20 17:15:45', '2025-09-20 17:15:45'),
(13, 1, '', 'Versamento In banca ', 'registra le operazioni di giroconto dal conto cassa al conto Banca . L\'utente sceglierà il sottoconto della banca', NULL, 'Primaria', NULL, 1, '2025-09-20 17:15:45', '2025-09-20 17:15:45'),
(14, 1, 'INC_FT', 'INCASSO FATTURA VENDITA', 'rEGISTRAZIONE INCASSI CONTANTI DAI CLIENTI', 'Pagamenti', 'Finanziaria', 'E', 1, '2025-09-26 18:34:32', '2025-09-26 18:34:32');

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

--
-- Dump dei dati per la tabella `sc_funzioni_contabili_righe`
--

INSERT INTO `sc_funzioni_contabili_righe` (`id`, `id_funzione_contabile`, `id_conto`, `tipo_movimento`, `descrizione_riga_predefinita`, `is_sottoconto_modificabile`, `is_conto_ricerca`, `created_at`, `updated_at`) VALUES
(93, 9, 20, 'D', 'Costo per acquisto merci/servizi', 1, 0, '2025-09-20 15:15:45', '2025-09-20 15:15:45'),
(94, 9, 51, 'D', 'credito erario conto iva', 1, 0, '2025-09-20 15:15:45', '2025-09-20 15:15:45'),
(95, 9, 15, 'A', 'debito verso fornitore', 1, 1, '2025-09-20 15:15:45', '2025-09-20 15:15:45'),
(112, 11, 9, 'D', NULL, 1, 0, '2025-09-20 17:15:45', '2025-09-20 17:15:45'),
(113, 11, 10, 'D', NULL, 1, 0, '2025-09-20 17:15:45', '2025-09-20 17:15:45'),
(123, 13, 9, 'D', 'versamento contnati', 1, 0, '2025-09-20 17:15:45', '2025-09-20 17:15:45'),
(124, 13, 10, 'A', 'versamento in banca', 1, 0, '2025-09-20 17:15:45', '2025-09-20 17:15:45'),
(125, 12, 17, 'A', 'Iva a Debito', 1, 0, '2025-09-20 13:15:45', '2025-09-20 13:15:45'),
(126, 12, 25, 'A', 'ricavo vendita', 1, 0, '2025-09-20 13:15:45', '2025-09-20 13:15:45'),
(127, 12, 7, 'D', 'credito verso clienti', 1, 1, '2025-09-20 13:15:45', '2025-09-20 13:15:45'),
(128, 14, 6, 'D', '', 1, 1, '2025-09-26 18:34:32', '2025-09-26 18:34:32'),
(129, 14, 8, 'A', '', 1, 0, '2025-09-26 18:34:32', '2025-09-26 18:34:32');

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

--
-- Dump dei dati per la tabella `sc_partite_aperte`
--

INSERT INTO `sc_partite_aperte` (`id`, `id_ditta_anagrafica`, `data_scadenza`, `importo`, `stato`, `created_at`, `updated_at`, `data_registrazione`, `id_registrazione_testata`, `id_ditta`, `id_anagrafica`, `numero_documento`, `data_documento`, `id_sottoconto`, `tipo_movimento`) VALUES
(1, 15, '2025-09-11', 122.00, 'APERTA', '2025-09-20 17:15:45', '2025-09-20 17:15:45', '2025-09-09', 6, 0, NULL, NULL, NULL, NULL, 'Apertura_Credito'),
(17, 14, '2025-11-25', 11.00, 'APERTA', '2025-09-20 17:15:45', '2025-09-20 17:15:45', '2025-09-13', 32, 0, NULL, NULL, NULL, NULL, 'Apertura_Credito'),
(18, 16, '2025-10-26', 1502.00, 'CHIUSA', '2025-09-26 18:30:55', '2025-09-26 18:30:55', '2025-09-26', 33, 1, 16, '15', '2025-09-26', 54, 'Apertura_Credito'),
(19, 16, '2025-09-26', 1502.00, 'CHIUSA', '2025-09-26 18:35:01', '2025-09-26 18:35:01', '2025-09-26', 34, 1, NULL, '', '0000-00-00', 54, 'Chiusura_Credito'),
(20, 13, '2025-11-02', 6600.00, 'APERTA', '2025-10-06 16:12:58', '2025-10-06 16:12:58', '2025-10-06', 35, 1, 13, '52', '2025-10-01', 58, 'Apertura_Debito');

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

--
-- Dump dei dati per la tabella `sc_piano_dei_conti`
--

INSERT INTO `sc_piano_dei_conti` (`id`, `id_ditta`, `codice`, `descrizione`, `id_padre`, `tipo`, `natura`, `bloccato`, `data_creazione`) VALUES
(1, 1, '10', 'IMMOBILIZZAZIONI', NULL, 'Mastro', 'Attività', 0, '2025-09-20 17:15:45'),
(2, 1, '10.01', 'Immobilizzazioni materiali', 1, 'Conto', 'Attività', 0, '2025-09-20 17:15:45'),
(3, 1, '10.01.001', 'Fabbricati', 2, 'Sottoconto', 'Attività', 0, '2025-09-20 17:15:45'),
(4, 1, '10.01.002', 'Impianti e macchinari', 2, 'Sottoconto', 'Attività', 0, '2025-09-20 17:15:45'),
(5, 1, '20', 'ATTIVO CIRCOLANTE', NULL, 'Mastro', 'Attività', 0, '2025-09-20 17:15:45'),
(6, 1, '20.05', 'Crediti v/Clienti', 5, 'Conto', 'Attività', 0, '2025-09-20 17:15:45'),
(7, 1, '20.05.001', 'Clienti Italia', 6, 'Sottoconto', 'Attività', 0, '2025-09-20 17:15:45'),
(8, 1, '20.15', 'Disponibilità liquide', 5, 'Conto', 'Attività', 0, '2025-09-20 17:15:45'),
(9, 1, '20.15.001', 'Banca c/c', 8, 'Sottoconto', 'Attività', 0, '2025-09-20 17:15:45'),
(10, 1, '20.15.002', 'Cassa contanti', 8, 'Sottoconto', 'Attività', 0, '2025-09-20 17:15:45'),
(11, 1, '30', 'PATRIMONIO NETTO', NULL, 'Mastro', 'Patrimonio Netto', 0, '2025-09-20 17:15:45'),
(12, 1, '30.01', 'Capitale Sociale', 11, 'Conto', 'Patrimonio Netto', 0, '2025-09-20 17:15:45'),
(13, 1, '40', 'DEBITI', NULL, 'Mastro', 'Passività', 0, '2025-09-20 17:15:45'),
(14, 1, '40.05', 'Debiti v/Fornitori', 13, 'Conto', 'Passività', 0, '2025-09-20 17:15:45'),
(15, 1, '40.05.001', 'Fornitori Italia', 14, 'Sottoconto', 'Passività', 0, '2025-09-20 17:15:45'),
(16, 1, '40.10', 'Debiti Tributari', 13, 'Conto', 'Passività', 0, '2025-09-20 17:15:45'),
(17, 1, '40.10.001', 'Erario c/IVA', 16, 'Sottoconto', 'Passività', 0, '2025-09-20 17:15:45'),
(18, 1, '60', 'COSTI DELLA PRODUZIONE', NULL, 'Mastro', 'Costo', 0, '2025-09-20 17:15:45'),
(19, 1, '60.01', 'Acquisti', 18, 'Conto', 'Costo', 0, '2025-09-20 17:15:45'),
(20, 1, '60.01.001', 'Materie prime c/acquisti', 19, 'Sottoconto', 'Costo', 0, '2025-09-20 17:15:45'),
(21, 1, '60.05', 'Servizi', 18, 'Conto', 'Costo', 0, '2025-09-20 17:15:45'),
(22, 1, '60.05.001', 'Consulenze professionali', 21, 'Sottoconto', 'Costo', 0, '2025-09-20 17:15:45'),
(23, 1, '70', 'RICAVI DELLE VENDITE', NULL, 'Mastro', 'Ricavo', 0, '2025-09-20 17:15:45'),
(24, 1, '70.01', 'Ricavi', 23, 'Conto', 'Ricavo', 0, '2025-09-20 17:15:45'),
(25, 1, '70.01.001', 'Prodotti finiti c/vendite', 24, 'Sottoconto', 'Ricavo', 0, '2025-09-20 17:15:45'),
(26, 1, '20.05.002', 'SALATI E DOLCI', 6, 'Sottoconto', 'Attività', 0, '2025-09-20 17:15:45'),
(27, 1, '40.05.002', 'SARACENARE EXPORT', 14, 'Sottoconto', 'Passività', 0, '2025-09-20 17:15:45'),
(28, 1, '20.05.003', 'linux spa', 6, 'Sottoconto', 'Attività', 0, '2025-09-20 17:15:45'),
(29, 1, '40.05.003', 'linux spa', 14, 'Sottoconto', 'Passività', 0, '2025-09-20 17:15:45'),
(50, 1, '20.20', 'Crediti Erariali', 5, 'Conto', 'Attività', 0, '2025-09-20 17:15:45'),
(51, 1, '20.20.01', 'IVA A CREDITO', 50, 'Sottoconto', 'Attività', 0, '2025-09-20 17:15:45'),
(52, 1, '20.05.0004', 'CARAMELLE SALATE cliente', 6, 'Mastro', '', 0, '2025-09-20 18:01:05'),
(53, 1, '40.05.0004', 'CARAMELLE SALATE cliente', 14, 'Mastro', '', 0, '2025-09-20 18:01:05'),
(54, 1, '20.05.0005', 'CAROFIGLIO SPA', 6, 'Mastro', '', 0, '2025-09-24 16:11:29'),
(55, 1, '40.05.0005', 'CAROFIGLIO SPA', 14, 'Mastro', '', 0, '2025-09-24 16:11:30'),
(56, 1, '40.05.0006', 'DITTA PROVA CLIENTE FORNITORE', 14, 'Mastro', '', 0, '2025-10-06 13:07:19'),
(57, 1, '20.05.0006', 'DITTA SALATI TUTTIfornitroe', 6, 'Mastro', '', 0, '2025-10-06 13:20:42'),
(58, 1, '40.05.0007', 'DITTA SALATI TUTTIfornitroe', 14, 'Mastro', '', 0, '2025-10-06 13:20:42'),
(59, 1, '20.05.0007', 'prima prova di 3 cliente', 6, 'Mastro', '', 0, '2025-10-06 13:20:58'),
(60, 1, '20.05.0008', 'Prova Admin Cliente', 6, 'Mastro', '', 0, '2025-10-06 15:27:36'),
(61, 1, '40.05.0008', 'PROVA DITTA 2 fornitore', 14, 'Mastro', '', 0, '2025-10-06 15:27:55');

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

--
-- Dump dei dati per la tabella `sc_registrazioni_righe`
--

INSERT INTO `sc_registrazioni_righe` (`id`, `id_testata`, `id_conto`, `descrizione_riga`, `importo_dare`, `importo_avere`) VALUES
(16, 6, 27, 'Fornitori Italia', 0.00, 122.00),
(72, 32, 17, 'Iva a Debito', 0.00, 1.00),
(73, 33, 54, 'Rif. doc 15 CAROFIGLIO SPA', 1502.00, 0.00),
(74, 33, 25, 'ricavo vendita', 0.00, 1259.61),
(75, 33, 17, 'Iva a Debito', 0.00, 242.39),
(76, 33, 17, 'Iva a Debito', 0.00, 220.00),
(77, 33, 17, 'Iva a Debito', 0.00, 20.00),
(78, 33, 17, 'Iva a Debito', 0.00, 2.38),
(79, 34, 54, 'Incasso/Pagamento Fatt. 15', 1502.00, 0.00),
(80, 34, 8, 'Incasso/Pagamento', 0.00, 1502.00),
(81, 35, 57, 'Rif. doc 52 DITTA SALATI TUTTIfornitroe', 0.00, 6600.00),
(82, 35, 20, 'Costo per acquisto merci/servizi', 5795.24, 0.00),
(83, 35, 51, 'credito erario conto iva', 804.76, 0.00),
(84, 35, 51, 'credito erario conto iva', 350.00, 0.00),
(85, 35, 51, 'credito erario conto iva', 440.00, 0.00),
(86, 35, 51, 'credito erario conto iva', 14.76, 0.00);

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

--
-- Dump dei dati per la tabella `sc_registrazioni_testata`
--

INSERT INTO `sc_registrazioni_testata` (`id`, `id_ditta`, `id_utente`, `data_registrazione`, `descrizione_testata`, `data_documento`, `numero_documento`, `totale_documento`, `id_ditte`, `numero_protocollo`, `stato`, `data_creazione`, `data_ultima_modifica`) VALUES
(6, 1, 3, '2025-09-09', 'Registrazione Fattura Acquisto', NULL, NULL, NULL, NULL, 1, 'Confermato', '2025-09-20 17:15:45', '2025-09-20 17:15:45'),
(32, 1, 3, '2025-09-13', 'Registrazione Fattura Vendita', '2025-10-25', '555', 11.00, 14, 19, 'Provvisorio', '2025-09-20 17:15:45', '2025-09-20 17:15:45'),
(33, 1, 3, '2025-09-26', 'Registrazione Fattura Vendita', '2025-09-26', '15', 1502.00, 16, 20, 'Provvisorio', '2025-09-26 18:30:55', '2025-09-26 18:30:55'),
(34, 1, 3, '2025-09-26', 'INCASSO FATTURA VENDITA', NULL, NULL, 1502.00, 16, 21, 'Provvisorio', '2025-09-26 18:35:01', '2025-09-26 18:35:01'),
(35, 1, 3, '2025-10-06', 'Registrazione Fattura Acquisto', '2025-10-01', '52', 6600.00, 13, 22, 'Provvisorio', '2025-10-06 16:12:58', '2025-10-06 16:12:58');

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

--
-- Dump dei dati per la tabella `sc_registri_iva`
--

INSERT INTO `sc_registri_iva` (`id`, `id_riga_registrazione`, `tipo_registro`, `data_documento`, `numero_documento`, `id_anagrafica`, `imponibile`, `aliquota_iva`, `importo_iva`) VALUES
(1, 18, 'Acquisti', '2025-09-09', '10', 15, 100.00, 22.00, 22.00),
(2, 21, 'Acquisti', '2025-09-09', '100', 15, 100.00, 10.00, 10.00),
(3, 76, 'Vendite', '2025-09-26', '15', 16, 1000.00, 22.00, 220.00),
(4, 77, 'Vendite', '2025-09-26', '15', 16, 200.00, 10.00, 20.00),
(5, 78, 'Vendite', '2025-09-26', '15', 16, 59.61, 4.00, 2.38),
(6, 84, 'Acquisti', '2025-10-01', '52', 13, 3500.00, 10.00, 350.00),
(7, 85, 'Acquisti', '2025-10-01', '52', 13, 2000.00, 22.00, 440.00),
(8, 86, 'Acquisti', '2025-10-01', '52', 13, 295.24, 5.00, 14.76);

-- --------------------------------------------------------

--
-- Struttura della tabella `stati_lettura`
--

CREATE TABLE `stati_lettura` (
  `id_utente` int(11) NOT NULL,
  `email_uid` int(11) NOT NULL,
  `data_lettura` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `stati_lettura`
--

INSERT INTO `stati_lettura` (`id_utente`, `email_uid`, `data_lettura`) VALUES
(3, 34, '2025-09-29 16:27:24'),
(3, 35, '2025-10-04 15:46:42'),
(4, 20, '2025-07-25 16:27:04'),
(4, 43, '2025-07-25 16:08:22'),
(4, 44, '2025-07-25 16:08:23'),
(4, 47, '2025-07-25 16:07:43'),
(4, 49, '2025-07-24 18:52:02'),
(4, 50, '2025-07-25 16:07:37'),
(4, 51, '2025-07-25 16:00:32'),
(4, 52, '2025-07-25 16:00:24'),
(4, 53, '2025-07-24 18:51:58'),
(4, 54, '2025-07-24 19:02:16'),
(4, 55, '2025-07-25 16:17:11'),
(4, 56, '2025-07-25 16:22:07'),
(4, 57, '2025-07-25 16:28:44'),
(4, 58, '2025-07-25 16:28:48'),
(4, 59, '2025-07-25 16:39:33'),
(4, 60, '2025-07-26 08:20:44'),
(4, 137, '2025-08-08 13:30:34'),
(4, 138, '2025-08-08 13:30:34'),
(4, 140, '2025-08-09 11:13:42'),
(5, 45, '2025-07-24 18:52:26'),
(5, 49, '2025-07-24 18:58:20'),
(5, 51, '2025-07-24 18:50:50'),
(5, 52, '2025-07-24 18:50:45'),
(5, 53, '2025-07-24 18:50:37'),
(5, 54, '2025-07-24 19:02:57'),
(6, 56, '2025-07-25 18:55:16'),
(6, 57, '2025-07-25 18:06:29'),
(6, 58, '2025-07-25 18:03:18'),
(6, 60, '2025-07-25 18:55:35'),
(9, 58, '2025-07-26 08:21:36'),
(9, 59, '2025-07-26 08:21:30'),
(9, 60, '2025-07-25 20:04:34'),
(10, 1, '2025-08-14 14:09:47'),
(10, 2, '2025-08-14 17:20:42'),
(10, 51, '2025-07-31 15:09:10'),
(10, 57, '2025-07-31 19:47:11'),
(10, 58, '2025-07-30 14:11:41'),
(10, 59, '2025-07-30 11:23:24'),
(10, 60, '2025-07-26 17:25:33'),
(10, 120, '2025-08-08 18:41:22'),
(10, 136, '2025-08-08 13:33:17'),
(10, 138, '2025-08-08 09:56:53'),
(10, 139, '2025-08-08 10:44:21'),
(10, 140, '2025-08-08 19:13:21');

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

--
-- Dump dei dati per la tabella `tipi_pagamento`
--

INSERT INTO `tipi_pagamento` (`id`, `id_ditta`, `codice`, `descrizione`, `gg_dilazione`) VALUES
(1, 3, '10', 'CONTANTI', 0),
(2, 3, '20', 'BONIFICO', 0),
(3, 3, '30', 'POS', 0),
(4, 3, '40', 'TITOLI', 0),
(5, 1, '10', 'CONTANTI', 0),
(6, 1, '20', 'BONIFICO', 0),
(7, 1, '30', 'POS', 0),
(8, 1, '40', 'TITOLI', 0);

-- --------------------------------------------------------

--
-- Struttura della tabella `tipi_utente`
--

CREATE TABLE `tipi_utente` (
  `Codice` int(11) NOT NULL,
  `Descrizione` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `tipi_utente`
--

INSERT INTO `tipi_utente` (`Codice`, `Descrizione`) VALUES
(1, 'Utente_Interno'),
(2, 'Utente_Esterno');

-- --------------------------------------------------------

--
-- Struttura della tabella `tipo_ditta`
--

CREATE TABLE `tipo_ditta` (
  `id` int(11) NOT NULL,
  `tipo` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `tipo_ditta`
--

INSERT INTO `tipo_ditta` (`id`, `tipo`) VALUES
(2, 'Cliente'),
(1, 'Proprietaria');

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

--
-- Dump dei dati per la tabella `utente_mail_accounts`
--

INSERT INTO `utente_mail_accounts` (`id_utente`, `id_mail_account`, `created_at`, `updated_at`) VALUES
(3, 11, '2025-09-20 07:35:41', '2025-09-20 07:35:41'),
(3, 13, '2025-09-20 07:35:41', '2025-09-20 07:35:41');

-- --------------------------------------------------------

--
-- Struttura della tabella `utente_scorciatoie`
--

CREATE TABLE `utente_scorciatoie` (
  `id_utente` int(11) NOT NULL,
  `id_funzione` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `utente_scorciatoie`
--

INSERT INTO `utente_scorciatoie` (`id_utente`, `id_funzione`) VALUES
(3, 5),
(3, 26),
(3, 32),
(3, 34),
(3, 36),
(3, 38),
(3, 72),
(3, 84),
(4, 32);

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
-- Dump dei dati per la tabella `utenti`
--

INSERT INTO `utenti` (`id`, `email`, `mail_contatto`, `mail_collaboratore`, `mail_pec`, `password`, `nome`, `cognome`, `codice_fiscale`, `telefono`, `indirizzo`, `citta`, `provincia`, `cap`, `id_ditta`, `id_ruolo`, `attivo`, `data_creazione`, `data_ultimo_accesso`, `note`, `firma`, `privacy`, `funzioni_attive`, `livello`, `Codice_Tipo_Utente`, `verification_token`) VALUES
(1, 'sysadmin@mia-azienda.it', 'sysadmin@mia-azienda.it', NULL, NULL, 'password_criptata_qui', 'System', 'Admin', NULL, NULL, NULL, NULL, NULL, NULL, 1, 3, 1, '2025-09-20 17:15:45', NULL, NULL, NULL, 0, NULL, 50, 1, NULL),
(2, 'mario.rossi@cliente-demo.it', 'mario.rossi@cliente-demo.it', NULL, NULL, 'password_criptata_qui', 'Mario', 'Rossi', NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 1, '2025-09-20 17:15:45', NULL, NULL, NULL, 0, NULL, 50, NULL, NULL),
(3, 'angbrunosa@gmail.com', 'angbrunosa@gmail.com', NULL, NULL, '$2b$10$JxllX3i7uL3CGpUunIoVSOdq1/zHxU9cckBYRXTPNBNbRz81lCXwC', 'Angelo ok', 'Bruno', NULL, NULL, NULL, NULL, NULL, NULL, 1, 2, 1, '2025-09-20 17:15:45', NULL, NULL, 'la mia firma', 0, NULL, 99, 1, NULL),
(4, 'info@difam.it', 'info@difam.it', NULL, NULL, '$2b$10$mDL.FXQ4GmIhthGlmLCRFOwv7FxAXCJkRqa0AqKI9GIogmP6fxmnK', 'francesco ', 'baggetta', 'brf', NULL, NULL, NULL, NULL, NULL, 3, 3, 1, '2025-09-20 17:15:45', NULL, NULL, 'dott. Francesco Baggetta Direttore Generale Confesercenti Calabria Servizi', 1, NULL, 50, NULL, NULL),
(5, 'admin@example.com', 'admin@example.com', NULL, NULL, '$2b$10$JxllX3i7uL3CGpUunIoVSOdq1/zHxU9cckBYRXTPNBNbRz81lCXwC', 'Angelo ', 'Bruno', NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, '2025-09-20 17:15:45', NULL, NULL, NULL, 0, NULL, 100, 1, NULL),
(6, 'info@example.com', 'info@example.com', NULL, NULL, '$2b$10$TE4iHRvwQ1Wgabc6gq..z.MiVOf2Ypjp4ehAHl.aJdQINjeLN5owi', 'Angelo', 'Bruno', NULL, NULL, NULL, NULL, NULL, NULL, 1, 3, 1, '2025-09-20 17:15:45', NULL, NULL, 'dott. Angelo Bruno\nww', 0, NULL, 50, NULL, NULL),
(9, 'master@opero.it', 'master@opero.it', NULL, NULL, '$2b$10$yApw9swySOyQbtFCOC8TVOhPJTmrhIH0eDuVxc5H1WAGh0eAMFq6u', 'Master', 'Admin', NULL, 'uu', NULL, NULL, NULL, NULL, 1, 1, 1, '2025-09-20 17:15:45', NULL, NULL, 'Direzione Gestionale Opero.\nwww.operomeglio.it\n', 0, NULL, 50, NULL, NULL),
(10, 'provadmin@prova.it', 'provadmin@prova.it', NULL, NULL, '$2b$10$DrytCfOdmnOgEH7ISH86X.NFCep9OVxfII5w6dCHfcoX.BYWN0fCC', 'dott. Angelo', 'Bruno -Opero-GEST', NULL, NULL, NULL, NULL, NULL, NULL, 3, 3, 1, '2025-09-20 17:15:45', NULL, NULL, 'dott. Angelo Bruno\n\nopero il gestionale che opera per te', 0, NULL, 99, NULL, NULL),
(11, 'AngProva@provino.it', 'AngProva@provino.it', NULL, NULL, '$2b$10$dLb.wC/gRYtCmuISajM...LQ12V5oLd1c6aOZYGLw.wzfRw.kMqTu', 'angeloProva', 'BrunoProva', 's', NULL, NULL, NULL, NULL, NULL, 3, 4, 1, '2025-09-20 17:15:45', NULL, NULL, NULL, 1, NULL, 50, NULL, NULL),
(13, 'provaCOM@prova.it', 'provaCOM@prova.it', NULL, NULL, '$2b$10$C26/u3pagw9zt5TYoqgCGernyCIXjt/c9xj/47mRiV1EXtYOC0T16', 'PROVACOMPLETA', 'PROVACOMPLETA', 'BRNNGL76L21C349J', '098134463', 'VIA DEL CORSO2', 'PASSOLENTO', 'CS', NULL, 3, 3, 1, '2025-09-20 17:15:45', NULL, NULL, NULL, 1, NULL, 49, NULL, NULL),
(14, 'lucaprovadmin@prova.it', 'lucaprovadmin@prova.it', NULL, NULL, '$2b$10$XJOnOO3o.s5DtorcN7JWG.3IoOTgJIPDNeJ07HcxUOmqZz3K3PlDq', 'luca proca', 'cicone prova', 'lcvvnlsosos', '098135363', 'vico fioravanti', 'saracena', 'cs', NULL, 3, 3, 1, '2025-09-20 17:15:45', NULL, NULL, NULL, 1, NULL, 10, NULL, NULL),
(15, 'difamconsegne@gmail.com', 'difamconsegne@gmail.com', NULL, NULL, '$2b$10$xw6CzU2voWK5sIEGzUflU.6BIn3cq1W4347npwYBad8ARJuzDNKJy', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 1, '2025-09-20 17:15:45', NULL, NULL, NULL, 0, NULL, 50, NULL, NULL),
(16, 'postmaster@cedibef.com', 'postmaster@cedibef.com', NULL, NULL, '$2b$10$dNnNFQx.dfTl1ofrRe0HeOk8MwMfT03tzj3o8LUm89NBiTvgS5p7a', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 1, '2025-09-20 17:15:45', NULL, NULL, NULL, 0, NULL, 50, NULL, NULL),
(31, 'befretail@gmail.com', 'befretail@gmail.com', NULL, NULL, '$2b$10$JxllX3i7uL3CGpUunIoVSOdq1/zHxU9cckBYRXTPNBNbRz81lCXwC', 'Cavolo', 'A Fiore', NULL, 'oppido', 'mamertino', NULL, 'cs', NULL, 1, 3, 1, '2025-09-20 17:15:45', NULL, NULL, NULL, 1, NULL, 50, NULL, NULL),
(32, 'opero@difam.it', 'opero@difam.it', NULL, NULL, '$2b$10$HzcHeKuF1/LE1/3UY4jxLOFHvETDChIGrIqyzAiUkNZZBN.820ggK', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 1, '2025-09-20 17:15:45', NULL, NULL, NULL, 0, NULL, 50, NULL, NULL),
(33, 'postmaster@difam.it', 'postmaster@difam.it', NULL, NULL, '$2b$10$9ti7YOjqWQKXUqbknXTtKOMLMCzTRCrBkv1YTzgpXSiGmgXnycYyK', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 1, '2025-09-20 17:15:45', NULL, NULL, NULL, 0, NULL, 50, NULL, NULL),
(34, 'provaadmin@prova.it', 'provaadmin@prova.it', NULL, NULL, '$2b$10$nu1x6jTlOh5Uv9uRUITC1OgrueRQboMJJHUy98TN6hjbz/jVoxI9q', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 1, '2025-09-20 17:15:45', NULL, NULL, NULL, 0, NULL, 50, NULL, NULL),
(35, 'befretail@gmai.com', 'befretail@gmai.com', NULL, NULL, '$2b$10$yHIhsE9kDtGZhwMC.3p82.sVZNMVR7FnfOBfabyQFLS4fWLL3k02q', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 1, '2025-09-20 17:15:45', NULL, NULL, NULL, 0, NULL, 50, NULL, NULL),
(36, 'master@oper.it', 'master@oper.it', NULL, NULL, '$2b$10$yWaTJtd1vXGdx.a1PPTnFOHfW6ct4RB0eJWmCWnDRc5oP3NpNRr4K', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 1, '2025-09-20 17:15:45', NULL, NULL, NULL, 0, NULL, 50, NULL, NULL),
(37, 'befretail@befretail.srl', 'befretail@befretail.srl', NULL, NULL, '$2b$10$hkxyH85TK4x3Nn.0OcfFX.zAkE4hCUqXWug00ZQz1egk5UgUwN03a', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 1, '2025-09-20 17:15:45', NULL, NULL, NULL, 0, NULL, 50, NULL, NULL),
(38, 'befretail@gmail.srl', 'befretail@gmail.srl', NULL, NULL, '$2b$10$i75f4L16LWzI6.UYxx7jRuhwsGmS1INZpWoaq2m7jUTr5IMAutq1q', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 1, '2025-09-20 17:15:45', NULL, NULL, NULL, 0, NULL, 50, NULL, NULL),
(39, 'befreatail@gmail.com', 'befreatail@gmail.com', NULL, NULL, '$2b$10$NM6C65gA02ffDqpb30/3xuhkTUZet9yQ9ThL/Oa7jxkYzg1b4J0Zu', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 1, '2025-09-20 17:15:45', NULL, NULL, NULL, 0, NULL, 50, NULL, NULL),
(43, 'amministrazione@difam.it', 'amministrazione@difam.it', NULL, NULL, '$2b$10$.OPBEp3K0Z2Lqw5u81/lhO21U1iBqusAh2PpAAPU4mXI5vi.ZT7la', 'Angelo-Amministrazione', 'Bruno-Amministrazione', 'profrold', '3356738658', 'Cda Soda, 4', 'Saracena', NULL, '87010', 1, 2, 1, '2025-09-20 17:15:45', NULL, 'bellissimo', NULL, 1, NULL, 93, 1, NULL),
(46, 'dantoniomaria70@gmail.com', 'dantoniomaria70@gmail.com', NULL, NULL, 'password_provvisoria', 'a', 's', NULL, '3356738658', NULL, NULL, NULL, NULL, 1, 4, 0, '2025-09-20 17:15:45', NULL, NULL, NULL, 0, NULL, 0, 2, NULL),
(47, 'carmicol@libero.it', 'carmicol@libero.it', NULL, NULL, 'password_provvisoria', 'carmine', 'colautti', NULL, '098134463', NULL, NULL, NULL, NULL, 1, 4, 0, '2025-09-20 17:15:45', NULL, NULL, NULL, 0, NULL, 0, 2, NULL),
(48, 'cicio.l@tiscali.it', NULL, NULL, NULL, '$2b$10$VxKnElUjNclmDPMaN0TKiepysi2RD6xXfW5NO6U5i/LwhwIrXwrC6', 'luca ', 'ciciole', 'clclclclc', '3400958887', 'via fioravanti', 'saracena', NULL, '87010', 1, 4, 1, '2025-09-20 17:15:45', NULL, 'cliente sartoria', NULL, 0, NULL, 1, 2, '05350912-8049-4733-a4d4-ed52bcd5fb43');

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

--
-- Dump dei dati per la tabella `va_categorie_clienti`
--

INSERT INTO `va_categorie_clienti` (`id`, `id_ditta`, `nome_categoria`, `descrizione`, `codice_categoria`, `id_padre`, `created_at`, `updated_at`) VALUES
(9, 1, 'CLIENTI ITALIA', 'CLIENTI ITALIANI', '1', NULL, '2025-10-05 19:47:48', '2025-10-05 19:47:48'),
(10, 1, 'CLIENTI ASSOCIATI', 'CLIENTI CON CONTRATTO', '02', 9, '2025-10-05 19:51:53', '2025-10-05 19:51:53'),
(11, 1, 'CLIENTI_ESTERO', 'RESIDENTI ESTERO', '10', NULL, '2025-10-05 19:52:14', '2025-10-05 19:52:14'),
(12, 1, 'CLIENTI ITALIA NON ASSOCIATI', 'CLIENTI OCCASIONALI', '03', 9, '2025-10-05 20:10:39', '2025-10-05 20:10:39');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT per la tabella `an_progressivi`
--
ALTER TABLE `an_progressivi`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT per la tabella `an_relazioni`
--
ALTER TABLE `an_relazioni`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `an_servizi_aziendali_mail`
--
ALTER TABLE `an_servizi_aziendali_mail`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT per la tabella `an_tipi_relazione`
--
ALTER TABLE `an_tipi_relazione`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `app_funzioni`
--
ALTER TABLE `app_funzioni`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT per la tabella `app_ruoli`
--
ALTER TABLE `app_ruoli`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT per la tabella `bs_attivita`
--
ALTER TABLE `bs_attivita`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `bs_beni`
--
ALTER TABLE `bs_beni`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT per la tabella `bs_categorie`
--
ALTER TABLE `bs_categorie`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

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
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT per la tabella `bs_tipi_scadenze`
--
ALTER TABLE `bs_tipi_scadenze`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT per la tabella `ct_catalogo`
--
ALTER TABLE `ct_catalogo`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT per la tabella `ct_categorie`
--
ALTER TABLE `ct_categorie`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT per la tabella `ct_codici_fornitore`
--
ALTER TABLE `ct_codici_fornitore`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT per la tabella `ct_ean`
--
ALTER TABLE `ct_ean`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT per la tabella `ct_listini`
--
ALTER TABLE `ct_listini`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT per la tabella `ct_logistica`
--
ALTER TABLE `ct_logistica`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT per la tabella `ct_stati_entita`
--
ALTER TABLE `ct_stati_entita`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT per la tabella `ct_unita_misura`
--
ALTER TABLE `ct_unita_misura`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT per la tabella `ditta_mail_accounts`
--
ALTER TABLE `ditta_mail_accounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT per la tabella `ditte`
--
ALTER TABLE `ditte`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT per la tabella `email_inviate`
--
ALTER TABLE `email_inviate`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=86;

--
-- AUTO_INCREMENT per la tabella `funzioni`
--
ALTER TABLE `funzioni`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=115;

--
-- AUTO_INCREMENT per la tabella `funzioni_ditte`
--
ALTER TABLE `funzioni_ditte`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=273;

--
-- AUTO_INCREMENT per la tabella `iva_contabili`
--
ALTER TABLE `iva_contabili`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT per la tabella `knex_migrations`
--
ALTER TABLE `knex_migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=94;

--
-- AUTO_INCREMENT per la tabella `knex_migrations_lock`
--
ALTER TABLE `knex_migrations_lock`
  MODIFY `index` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT per la tabella `liste_distribuzione`
--
ALTER TABLE `liste_distribuzione`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT per la tabella `log_accessi`
--
ALTER TABLE `log_accessi`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT per la tabella `log_azioni`
--
ALTER TABLE `log_azioni`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=95;

--
-- AUTO_INCREMENT per la tabella `mg_causali_movimento`
--
ALTER TABLE `mg_causali_movimento`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

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
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
  MODIFY `codice` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=111;

--
-- AUTO_INCREMENT per la tabella `ppa_azioni`
--
ALTER TABLE `ppa_azioni`
  MODIFY `ID` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT per la tabella `ppa_istanzeazioni`
--
ALTER TABLE `ppa_istanzeazioni`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=86;

--
-- AUTO_INCREMENT per la tabella `ppa_istanzeprocedure`
--
ALTER TABLE `ppa_istanzeprocedure`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT per la tabella `ppa_procedureditta`
--
ALTER TABLE `ppa_procedureditta`
  MODIFY `ID` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT per la tabella `ppa_procedurestandard`
--
ALTER TABLE `ppa_procedurestandard`
  MODIFY `ID` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT per la tabella `ppa_processi`
--
ALTER TABLE `ppa_processi`
  MODIFY `ID` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT per la tabella `ppa_stati_azione`
--
ALTER TABLE `ppa_stati_azione`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT per la tabella `ppa_team`
--
ALTER TABLE `ppa_team`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT per la tabella `ppa_team_comunicazioni`
--
ALTER TABLE `ppa_team_comunicazioni`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT per la tabella `privacy_policies`
--
ALTER TABLE `privacy_policies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT per la tabella `registration_tokens`
--
ALTER TABLE `registration_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT per la tabella `ruoli`
--
ALTER TABLE `ruoli`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

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
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT per la tabella `sc_funzioni_contabili_righe`
--
ALTER TABLE `sc_funzioni_contabili_righe`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=130;

--
-- AUTO_INCREMENT per la tabella `sc_movimenti_iva`
--
ALTER TABLE `sc_movimenti_iva`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `sc_partite_aperte`
--
ALTER TABLE `sc_partite_aperte`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT per la tabella `sc_piano_dei_conti`
--
ALTER TABLE `sc_piano_dei_conti`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT per la tabella `sc_registrazioni_righe`
--
ALTER TABLE `sc_registrazioni_righe`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=87;

--
-- AUTO_INCREMENT per la tabella `sc_registrazioni_testata`
--
ALTER TABLE `sc_registrazioni_testata`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT per la tabella `sc_registri_iva`
--
ALTER TABLE `sc_registri_iva`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT per la tabella `tipi_pagamento`
--
ALTER TABLE `tipi_pagamento`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT per la tabella `tipi_utente`
--
ALTER TABLE `tipi_utente`
  MODIFY `Codice` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT per la tabella `tipo_ditta`
--
ALTER TABLE `tipo_ditta`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT per la tabella `utenti`
--
ALTER TABLE `utenti`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

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
