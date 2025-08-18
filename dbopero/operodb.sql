-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Ago 18, 2025 alle 01:40
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
(38, 41, 'UserForm.js', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1754755511252-UserForm.js', 'text/javascript', 3828, 0, NULL, '76a1d5c5-0938-4e3e-b7eb-f57c1804737d');

-- --------------------------------------------------------

--
-- Struttura della tabella `anno_di_gestione`
--

CREATE TABLE `anno_di_gestione` (
  `anno` int(11) NOT NULL,
  `descrizione` varchar(255) DEFAULT NULL,
  `data_inizio` date DEFAULT NULL,
  `data_fine` date DEFAULT NULL,
  `stato` enum('Aperto','Chiuso') DEFAULT 'Aperto'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `anno_di_gestione`
--

INSERT INTO `anno_di_gestione` (`anno`, `descrizione`, `data_inizio`, `data_fine`, `stato`) VALUES
(2025, 'Esercizio Fiscale 2025', '2025-01-01', '2025-12-31', 'Aperto');

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
  `id_ditta` int(11) NOT NULL,
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
-- Struttura della tabella `conti`
--

CREATE TABLE `conti` (
  `id` int(11) NOT NULL,
  `codice` varchar(20) NOT NULL,
  `id_ditta` int(11) NOT NULL,
  `descrizione` varchar(255) NOT NULL,
  `codice_mastro` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `conti`
--

INSERT INTO `conti` (`id`, `codice`, `id_ditta`, `descrizione`, `codice_mastro`) VALUES
(1, '1', 1, 'COSTI DI IMPIANTO E DI AMPLIAMENTO', '3'),
(2, '2', 1, 'COSTI DI RICERCA, SVILUPPO E DI PUBBLICITA\'', '3'),
(3, '3', 1, 'DIRITTI BREV.INDUSTR.E UTILIZZO OPERE INGEGNO', '3'),
(4, '4', 1, 'CONCESSIONI, LICENZE, MARCHI E DIRITTI SIMILI', '3'),
(5, '5', 1, 'AVVIAMENTO', '3'),
(6, '6', 1, 'IMMOBILIZZAZIONI IN CORSO E ACCONTI', '3'),
(7, '7', 1, 'ALTRE IMMOBILIZZAZIONI IMMATERIALI', '3'),
(8, '1', 1, 'TERRENI E FABBRICATI', '4'),
(9, '2', 1, 'IMPIANTI', '4'),
(10, '3', 1, 'MACCHINARI', '4'),
(11, '4', 1, 'ATTREZZTURE INDUSTRIALI E COMMERCIALI', '4'),
(12, '5', 1, 'MOBILI E ARREDI', '4'),
(13, '6', 1, 'MACCHINE UFFICIO', '4'),
(14, '7', 1, 'MEZZI DI TRASPORTO', '4'),
(15, '8', 1, 'IMMOBILIZZAZIONI MATERIALI IN CORSO E ACCONTI', '4'),
(16, '9', 1, 'ALTRE IMMOBILIZZAZIONI MATERIALI', '4'),
(17, '1', 1, 'PARTECIPAZIONI', '5'),
(18, '2', 1, 'CREDITI', '5'),
(19, '3', 1, 'ALTRI TITOLI', '5'),
(20, '4', 1, 'AZIONI PROPRIE', '5'),
(21, '1', 1, 'RIMANENZE MERCI', '7'),
(22, '2', 1, 'RIMANENZE IMBALLAGGI', '7'),
(23, '3', 1, 'RIMANENZE MATERIE DI CONSUMO', '7'),
(24, '4', 1, 'ACCONTI', '7'),
(25, '1', 1, 'CLIENTI ITALIA', '8'),
(26, '2', 1, 'CLIENTI ESTERO', '8'),
(27, '1', 1, 'CREDITI TRIBUTARI', '10'),
(28, '2', 1, 'CREDITI V/ISTITUTI PREVIDENZIALI', '10'),
(29, '3', 1, 'CREDITI DIVERSI', '10'),
(30, '1', 1, 'CASSA', '13'),
(31, '1', 1, 'BANCA C/C', '14'),
(32, '2', 1, 'POSTA C/C', '14'),
(33, '1', 1, 'EFFETTI ATTIVI', '15'),
(34, '2', 1, 'EFFETTI ALL\'INCASSO', '15'),
(35, '3', 1, 'EFFETTI INSOLUTI', '15'),
(36, '1', 1, 'FORNITORI ITALIA', '28'),
(37, '2', 1, 'FORNITORI ESTERO', '28'),
(38, '1', 1, 'DEBITI DIVERSI', '30'),
(39, '1', 1, 'DEBITI TRIBUTARI', '32'),
(40, '1', 1, 'DEBITI V/ISTITUTI PREVIDENZIALI', '33'),
(41, '1', 1, 'DEBITI V/BANCHE', '35'),
(42, '1', 1, 'MERCI C/ACQUISTI ITALIA', '53'),
(43, '2', 1, 'MERCI C/ACQUISTI ESTERO', '53'),
(44, '3', 1, 'IMBALLAGGI C/ACQUISTI', '53'),
(45, '4', 1, 'MATERIALE DI CONSUMO C/ACQUISTI', '53'),
(46, '1', 1, 'COSTI PER SERVIZI', '54'),
(47, '1', 1, 'CANONI DI LEASING', '55'),
(48, '2', 1, 'FITTI PASSIVI', '55'),
(49, '1', 1, 'RETRIBUZIONI', '57'),
(50, '2', 1, 'ONERI SOCIALI', '57'),
(51, '3', 1, 'T.F.R.', '57'),
(52, '1', 1, 'AMMORTAMENTO COSTI IMPIANTO E AMPLIAMENTO', '58'),
(53, '2', 1, 'AMMORTAMENTO COSTI RICERCA E SVILUPPO', '58'),
(54, '3', 1, 'AMMORTAMENTO DIRITTI DI BREVETTO', '58'),
(55, '4', 1, 'AMMORTAMENTO CONCESSIONI E MARCHI', '58'),
(56, '5', 1, 'AMMORTAMENTO AVVIAMENTO', '58'),
(57, '9', 1, 'AMMORTAMENTO ALTRE IMMOBILIZZAZIONI IMMATER.', '58'),
(58, '1', 1, 'AMMORTAMENTO FABBRICATI', '59'),
(59, '2', 1, 'AMMORTAMENTO IMPIANTI', '59'),
(60, '3', 1, 'AMMORTAMENTO MACCHINARI', '59'),
(61, '4', 1, 'AMMORTAMENTO ATTREZZATURE INDUSTRIALI, COMM.', '59'),
(62, '5', 1, 'AMMORTAMENTO MOBILI E ARREDI', '59'),
(63, '6', 1, 'AMMORTAMENTO MACCHINE UFFICIO', '59'),
(64, '7', 1, 'AMMORTAMENTO MEZZI TRASPORTO', '59'),
(65, '9', 1, 'AMMORTAMENTO ALTRE IMMOBILIZZAZIONI MATERIALI', '59'),
(66, '1', 1, 'MERCI C/ESISTENZE INIZIALI', '61'),
(67, '2', 1, 'IMBALLAGGI C/ESISTENZE INIZIALI', '61'),
(68, '3', 1, 'MATERIALE DI CONSUMO C/ESISTENZE INIZIALI', '61'),
(69, '5', 1, 'MERCI C/RIMANENZE FINALI', '61'),
(70, '6', 1, 'IMBALLAGGI C/RIMANENZE FINALI', '61'),
(71, '7', 1, 'MATERIALE DI CONSUMO C/RIMANENZE FINALI', '61'),
(72, '1', 1, 'ALTRE SVALUTAZIONI IMMOBILIZZAZIONI', '63'),
(73, '2', 1, 'SVALUT. CREDITI ATTIVO CIRC.,DISPONIB.LIQUIDE', '63'),
(74, '1', 1, 'ONERI FINANZIARI V/IMPRESE', '67'),
(75, '2', 1, 'ALTRI ONERI FINANZIARI', '67'),
(76, '1', 1, 'VENDITE DI MERCI ITALIA', '75'),
(77, '15', 1, 'VENDITE DI MERCI ESTERO', '75'),
(78, '2', 1, 'VENDITE DI PRODOTTI FINITI', '75'),
(79, '1', 3, 'COSTI DI IMPIANTO E DI AMPLIAMENTO', '3'),
(80, '2', 3, 'COSTI DI RICERCA, SVILUPPO E DI PUBBLICITA\'', '3'),
(81, '3', 3, 'DIRITTI BREV.INDUSTR.E UTILIZZO OPERE INGEGNO', '3'),
(82, '4', 3, 'CONCESSIONI, LICENZE, MARCHI E DIRITTI SIMILI', '3'),
(83, '5', 3, 'AVVIAMENTO', '3'),
(84, '6', 3, 'IMMOBILIZZAZIONI IN CORSO E ACCONTI', '3'),
(85, '7', 3, 'ALTRE IMMOBILIZZAZIONI IMMATERIALI', '3'),
(86, '1', 3, 'TERRENI E FABBRICATI', '4'),
(87, '2', 3, 'IMPIANTI', '4'),
(88, '3', 3, 'MACCHINARI', '4'),
(89, '4', 3, 'ATTREZZTURE INDUSTRIALI E COMMERCIALI', '4'),
(90, '5', 3, 'MOBILI E ARREDI', '4'),
(91, '6', 3, 'MACCHINE UFFICIO', '4'),
(92, '7', 3, 'MEZZI DI TRASPORTO', '4'),
(93, '8', 3, 'IMMOBILIZZAZIONI MATERIALI IN CORSO E ACCONTI', '4'),
(94, '9', 3, 'ALTRE IMMOBILIZZAZIONI MATERIALI', '4'),
(95, '1', 3, 'PARTECIPAZIONI', '5'),
(96, '2', 3, 'CREDITI', '5'),
(97, '3', 3, 'ALTRI TITOLI', '5'),
(98, '4', 3, 'AZIONI PROPRIE', '5'),
(99, '1', 3, 'RIMANENZE MERCI', '7'),
(100, '2', 3, 'RIMANENZE IMBALLAGGI', '7'),
(101, '3', 3, 'RIMANENZE MATERIE DI CONSUMO', '7'),
(102, '4', 3, 'ACCONTI', '7'),
(103, '1', 3, 'CLIENTI ITALIA', '8'),
(104, '2', 3, 'CLIENTI ESTERO', '8'),
(105, '1', 3, 'CREDITI TRIBUTARI', '10'),
(106, '2', 3, 'CREDITI V/ISTITUTI PREVIDENZIALI', '10'),
(107, '3', 3, 'CREDITI DIVERSI', '10'),
(108, '1', 3, 'CASSA', '13'),
(109, '1', 3, 'BANCA C/C', '14'),
(110, '2', 3, 'POSTA C/C', '14'),
(111, '1', 3, 'EFFETTI ATTIVI', '15'),
(112, '2', 3, 'EFFETTI ALL\'INCASSO', '15'),
(113, '3', 3, 'EFFETTI INSOLUTI', '15'),
(114, '1', 3, 'FORNITORI ITALIA', '28'),
(115, '2', 3, 'FORNITORI ESTERO', '28'),
(116, '1', 3, 'DEBITI DIVERSI', '30'),
(117, '1', 3, 'DEBITI TRIBUTARI', '32'),
(118, '1', 3, 'DEBITI V/ISTITUTI PREVIDENZIALI', '33'),
(119, '1', 3, 'DEBITI V/BANCHE', '35'),
(120, '1', 3, 'MERCI C/ACQUISTI ITALIA', '53'),
(121, '2', 3, 'MERCI C/ACQUISTI ESTERO', '53'),
(122, '3', 3, 'IMBALLAGGI C/ACQUISTI', '53'),
(123, '4', 3, 'MATERIALE DI CONSUMO C/ACQUISTI', '53'),
(124, '1', 3, 'COSTI PER SERVIZI', '54'),
(125, '1', 3, 'CANONI DI LEASING', '55'),
(126, '2', 3, 'FITTI PASSIVI', '55'),
(127, '1', 3, 'RETRIBUZIONI', '57'),
(128, '2', 3, 'ONERI SOCIALI', '57'),
(129, '3', 3, 'T.F.R.', '57'),
(130, '1', 3, 'AMMORTAMENTO COSTI IMPIANTO E AMPLIAMENTO', '58'),
(131, '2', 3, 'AMMORTAMENTO COSTI RICERCA E SVILUPPO', '58'),
(132, '3', 3, 'AMMORTAMENTO DIRITTI DI BREVETTO', '58'),
(133, '4', 3, 'AMMORTAMENTO CONCESSIONI E MARCHI', '58'),
(134, '5', 3, 'AMMORTAMENTO AVVIAMENTO', '58'),
(135, '9', 3, 'AMMORTAMENTO ALTRE IMMOBILIZZAZIONI IMMATER.', '58'),
(136, '1', 3, 'AMMORTAMENTO FABBRICATI', '59'),
(137, '2', 3, 'AMMORTAMENTO IMPIANTI', '59'),
(138, '3', 3, 'AMMORTAMENTO MACCHINARI', '59'),
(139, '4', 3, 'AMMORTAMENTO ATTREZZATURE INDUSTRIALI, COMM.', '59'),
(140, '5', 3, 'AMMORTAMENTO MOBILI E ARREDI', '59'),
(141, '6', 3, 'AMMORTAMENTO MACCHINE UFFICIO', '59'),
(142, '7', 3, 'AMMORTAMENTO MEZZI TRASPORTO', '59'),
(143, '9', 3, 'AMMORTAMENTO ALTRE IMMOBILIZZAZIONI MATERIALI', '59'),
(144, '1', 3, 'MERCI C/ESISTENZE INIZIALI', '61'),
(145, '2', 3, 'IMBALLAGGI C/ESISTENZE INIZIALI', '61'),
(146, '3', 3, 'MATERIALE DI CONSUMO C/ESISTENZE INIZIALI', '61'),
(147, '5', 3, 'MERCI C/RIMANENZE FINALI', '61'),
(148, '6', 3, 'IMBALLAGGI C/RIMANENZE FINALI', '61'),
(149, '7', 3, 'MATERIALE DI CONSUMO C/RIMANENZE FINALI', '61'),
(150, '1', 3, 'ALTRE SVALUTAZIONI IMMOBILIZZAZIONI', '63'),
(151, '2', 3, 'SVALUT. CREDITI ATTIVO CIRC.,DISPONIB.LIQUIDE', '63'),
(152, '1', 3, 'ONERI FINANZIARI V/IMPRESE', '67'),
(153, '2', 3, 'ALTRI ONERI FINANZIARI', '67'),
(154, '1', 3, 'VENDITE DI MERCI ITALIA', '75'),
(155, '15', 3, 'VENDITE DI MERCI ESTERO', '75'),
(156, '2', 3, 'VENDITE DI PRODOTTI FINITI', '75');

-- --------------------------------------------------------

--
-- Struttura della tabella `ditta_mail_accounts`
--

CREATE TABLE `ditta_mail_accounts` (
  `id` int(11) NOT NULL,
  `id_ditta` int(11) NOT NULL,
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
(11, 1, 9, 'MASTER OPERO', 'opero@difam.it', 'imaps.aruba.it', 993, 'smtps.aruba.it', 465, 'opero@difam.it', '54d4c9848b2063b974bc4d4ae69082ae:d8a02193c14af5db057e6d451cc1564f');

-- --------------------------------------------------------

--
-- Struttura della tabella `ditte`
--

CREATE TABLE `ditte` (
  `id` int(11) NOT NULL,
  `ragione_sociale` varchar(255) NOT NULL,
  `indirizzo` varchar(255) DEFAULT NULL,
  `citta` varchar(100) DEFAULT NULL,
  `provincia` varchar(50) DEFAULT NULL,
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
  `id_conto_collegato` int(11) DEFAULT NULL COMMENT 'ID del sottoconto collegato (da tabella sottoconti)',
  `id_ditta_proprietaria` int(11) DEFAULT NULL,
  `id_sottoconto_collegato` int(11) DEFAULT NULL COMMENT 'ID del sottoconto collegato (da tabella sottoconti)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `ditte`
--

INSERT INTO `ditte` (`id`, `ragione_sociale`, `indirizzo`, `citta`, `provincia`, `tel1`, `tel2`, `mail_1`, `mail_2`, `pec`, `sdi`, `p_iva`, `codice_fiscale`, `stato`, `id_tipo_ditta`, `moduli_associati`, `codice_relazione`, `id_conto_collegato`, `id_ditta_proprietaria`, `id_sottoconto_collegato`) VALUES
(1, 'Mia Azienda S.R.L.', 'Via Roma 1', 'Milano', 'MI', NULL, NULL, 'info@mia-azienda.it', NULL, 'mia-azienda@pec.it', 'ABCDEFG', NULL, NULL, 1, 1, NULL, 'N', NULL, NULL, NULL),
(2, 'Azienda Cliente Demo SPA', 'Corso Italia 100', 'Torino u', 'TO', NULL, NULL, 'info@cliente-demo.it', NULL, 'cliente-demo@pec.it', 'HIJKLMN', NULL, NULL, 1, 2, NULL, 'C', NULL, NULL, NULL),
(3, 'ditta prova proprietaria', NULL, NULL, NULL, NULL, NULL, 'angbrunosa@gmail.com', NULL, NULL, NULL, NULL, NULL, 1, 1, NULL, 'N', NULL, NULL, NULL),
(4, 'ditta  prova inserita', NULL, NULL, NULL, NULL, NULL, 'inseri@gmail.com', NULL, NULL, NULL, NULL, NULL, 1, 2, NULL, 'F', NULL, NULL, NULL),
(5, 'La produttrice srl', NULL, NULL, NULL, NULL, NULL, 'angbrunosa@gmail.com', NULL, NULL, NULL, NULL, NULL, 1, 2, NULL, 'C', NULL, NULL, NULL),
(6, 'Prova Admin Cliente', NULL, NULL, NULL, NULL, NULL, 'prova@prova.it', NULL, NULL, NULL, NULL, NULL, 1, 2, NULL, 'C', NULL, NULL, NULL),
(7, 'punto_vendita_prova', NULL, NULL, NULL, NULL, NULL, 'puntovendita@prova.it', NULL, NULL, NULL, NULL, NULL, 1, 2, NULL, 'P', 156, 3, 203);

-- --------------------------------------------------------

--
-- Struttura della tabella `ditte_moduli`
--

CREATE TABLE `ditte_moduli` (
  `id_ditta` int(11) NOT NULL,
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
(2, 20),
(2, 30);

-- --------------------------------------------------------

--
-- Struttura della tabella `email_inviate`
--

CREATE TABLE `email_inviate` (
  `id` int(11) NOT NULL,
  `id_utente_mittente` int(11) NOT NULL,
  `destinatari` text NOT NULL,
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

INSERT INTO `email_inviate` (`id`, `id_utente_mittente`, `destinatari`, `oggetto`, `corpo`, `data_invio`, `aperta`, `data_prima_apertura`, `tracking_id`) VALUES
(1, 6, 'angbrunosa@gmai.com', 'ciao', NULL, '2025-07-25 19:13:04', 0, NULL, '974c346a-4882-4b6e-94a3-a1aa09163788'),
(2, 6, 'angbrunosa@gmail.com', 'saluti ciao', NULL, '2025-07-25 19:14:35', 0, NULL, '41785fd2-96f9-478a-b681-7fa3029e9314'),
(3, 6, 'info@difam.it', 'mail di prova con allegato', NULL, '2025-07-25 19:17:39', 1, '2025-07-25 19:18:06', 'c2649c3d-f649-4ecc-9d85-be58012cb4fa'),
(4, 6, 'angbrunosa@gmail.com', 'saluti', NULL, '2025-07-25 19:33:22', 0, NULL, '70d47b45-d95a-4f61-b5f4-d7ad47812dad'),
(5, 6, 'info@difam.it', 'saluti', NULL, '2025-07-25 19:34:56', 1, '2025-07-25 19:36:55', 'f48d8199-0fd0-4ae6-b4c9-66f6d644268e'),
(6, 6, 'info@difam.it', 'ciao senza allegati', NULL, '2025-07-25 19:36:42', 1, '2025-07-25 19:37:13', 'c1d66b26-69d1-491d-a42c-59e98d17206d'),
(7, 4, 'angbrunosa@gmail.com', 'Re: Re: controlla l\'allegato', NULL, '2025-07-26 08:26:14', 0, NULL, '48296042-da48-4fae-8aa3-0766026518a9'),
(8, 9, 'angbrunosa@gmail.com', '21', NULL, '2025-07-26 08:38:30', 0, NULL, '042ecc50-8616-4b21-a84b-a76c13256af4'),
(9, 6, 'info@difam.it', 'saluti', NULL, '2025-07-26 09:32:53', 0, NULL, '2e85f514-3703-489e-b961-f309cd32f794'),
(10, 10, 'angbrunosa@gmail.com', 'saltu', NULL, '2025-07-26 19:05:49', 0, NULL, '7e32d264-08d3-4f59-8852-b982ce0b215d'),
(11, 10, 'angbrunosa@gmail.com', 'riepilogo', NULL, '2025-07-30 14:15:10', 0, NULL, 'e019b2ce-3e9b-4347-a706-cfd0ad21a8a7'),
(12, 10, 'angbrunosa@gmail.com', 'iscrizione opero_ab', NULL, '2025-07-30 14:46:13', 0, NULL, '1f1a67ad-58c1-4376-a592-c7505c84b723'),
(13, 9, 'angbrunosa@gmail.com', 'ciao', NULL, '2025-08-05 17:28:50', 0, NULL, '92c4fdf3-edea-4d93-8a9d-28482a4a5f35'),
(15, 4, 'angbrunosa@gmail.com', 'òòò\\', NULL, '2025-08-06 15:53:08', 0, NULL, 'f067fc99-9a17-4017-be45-789f848445b2'),
(16, 10, 'angbrunosa@gmail,com', 'saluti', NULL, '2025-08-06 15:54:36', 0, NULL, '13de43d1-9707-4eb1-bb03-47d18625a6de'),
(17, 10, 'angbrunosa@gmail.com', 'saluti', NULL, '2025-08-06 15:58:54', 0, NULL, 'cd943cb1-e22b-443f-937f-6e7447769ea3'),
(18, 4, 'angbrunosa@gmail.com', 'klklkl', NULL, '2025-08-06 16:18:15', 0, NULL, 'edf1c0c0-40c7-4c4b-be68-36d880fa2790'),
(19, 4, 'angbrunosa@gmail.com', 'kp', NULL, '2025-08-06 18:15:42', 0, NULL, '79f1d8b3-894b-4726-9c2d-82107da3b0b3'),
(20, 10, 'angbrunosa@gmail.com', 'saluti d aopero', NULL, '2025-08-08 10:08:08', 0, NULL, ''),
(23, 10, 'angbrunosa@gmail.com', 'saluti', NULL, '2025-08-08 10:30:10', 0, NULL, 'c8a053f3-a605-4aa0-8ca1-51dd682ca47e'),
(24, 10, 'angbrunosa@gmail.com', 'sa', NULL, '2025-08-08 10:33:36', 0, NULL, '8c7736a1-a472-49ee-9f40-39eb0b49b350'),
(25, 10, 'angbrunosa@gmail.com', 'cisualizza', NULL, '2025-08-08 10:42:32', 1, '2025-08-08 10:44:21', '6c1d90f2-b09f-45b4-bd56-7af521bbedab'),
(26, 10, 'postmaster@cedibef.com', 'dddl', NULL, '2025-08-08 10:45:40', 1, '2025-08-08 10:46:13', 'e56c0c22-95c6-45fb-83b0-a5f6bf08e67d'),
(27, 10, 'angbrunosa@gmail.com', 'sòlal', NULL, '2025-08-08 10:53:30', 0, NULL, '0ab613a8-f1b4-470d-be9b-203f477609aa'),
(28, 10, 'postmaster@cedibef.com', 'saaa', NULL, '2025-08-08 10:55:53', 1, '2025-08-08 10:56:13', '098344cf-15b7-4446-aef1-fb1a82647fc1'),
(29, 10, 'postmaster@cedibef.com', 'dldld', NULL, '2025-08-08 10:58:01', 1, '2025-08-08 10:59:35', 'dfcae428-2cf4-4399-897e-c3f4f92ae796'),
(30, 10, 'postmaster@cedibef.com', 'dldld', NULL, '2025-08-08 10:58:11', 1, '2025-08-08 10:58:23', '2a53a043-f221-4fe7-95b8-41f3a95fb13b'),
(31, 10, 'angbrunosa@gmail.com', 'dff', NULL, '2025-08-08 11:00:26', 0, NULL, '2bec09ef-18d8-458b-b3d9-55fbc120cfa9'),
(32, 10, 'angbrunosa@gmail.com', 'saluti 1 ', NULL, '2025-08-08 11:25:54', 0, NULL, 'b5f0edbe-a8c2-4c20-9cd4-76e4fbb78524'),
(33, 10, 'angbrunosa@gmail.com', 'ciao', NULL, '2025-08-08 11:30:31', 0, NULL, '9f7dafcd-243d-4622-9041-ef2a493b3a84'),
(34, 10, 'luca.cicioce@gmail.com ', 'prova mail opero', NULL, '2025-08-08 18:53:54', 1, '2025-08-08 19:13:21', 'e60188fc-c2e5-4319-980c-831ad081a025'),
(35, 10, 'info@difam.it', 'saluti', NULL, '2025-08-08 19:03:40', 0, NULL, '042fbf1a-8fd6-40d8-80f2-ce09c0f90cae'),
(36, 10, 'info@difam.it', 'seconda prova', 'eee', '2025-08-08 19:04:31', 0, NULL, 'da3313a3-9287-4bf4-974c-a9745045bceb'),
(37, 10, 'angbrunosa@gmail.com', 'prova invio cop', NULL, '2025-08-08 19:11:41', 0, NULL, '404da3a0-cfc9-4c9e-aeb3-a68fea618979'),
(38, 10, 'angbrunosa@gmail.com', 'terzo invio', NULL, '2025-08-08 19:12:29', 0, NULL, 'ca13300f-fa2e-4979-b172-2e2eada6a503'),
(39, 10, 'angbrunosa@gmail.com', 'llld terzo', '<p><br></p><p><br></p><p>dott. Ansagelo Bruno opero il gestionale che opera per te</p>', '2025-08-08 19:14:45', 0, NULL, '2d942a62-f863-4014-aee7-792df11e0596'),
(40, 10, 'mimmaforte@gmail.com', 'saluti da Pietro', '<p>Ciao Nonna ricordati che ho fame e che tra poco salgo.</p><p>Ciao</p><p><br></p><p>PS anche zio ha Fame</p><p><br></p><p>dott. Angelo Bruno opero il gestionale che opera per te</p>', '2025-08-09 11:05:49', 0, NULL, 'f323ac4a-846b-48f9-aa7b-c3e233878306'),
(41, 10, 'angbrunosa@gmail.com', 'video', '<p><br></p><p><br></p><p>dott. Angelo Bruno opero il gestionale che opera per te</p>', '2025-08-09 16:05:11', 0, NULL, '259b91bd-990e-4604-a489-06d868ba2df2');

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
(4, 41, '2025-07-24 18:58:56'),
(4, 45, '2025-07-24 19:00:08'),
(4, 46, '2025-07-24 18:58:47'),
(4, 48, '2025-07-24 18:59:46'),
(4, 49, '2025-07-24 18:59:08'),
(4, 50, '2025-07-25 16:07:40'),
(4, 54, '2025-07-24 19:02:20'),
(4, 56, '2025-07-25 17:50:09'),
(4, 57, '2025-07-25 17:30:23'),
(4, 58, '2025-07-25 17:08:01'),
(4, 59, '2025-07-25 17:07:57'),
(4, 131, '2025-08-08 13:30:59'),
(4, 134, '2025-08-08 14:12:40'),
(4, 135, '2025-08-08 14:04:22'),
(4, 136, '2025-08-08 14:04:12'),
(4, 137, '2025-08-08 13:30:48'),
(4, 138, '2025-08-08 13:30:41'),
(4, 139, '2025-08-08 13:23:45'),
(5, 50, '2025-07-24 18:58:14'),
(5, 51, '2025-07-24 18:58:10'),
(5, 52, '2025-07-24 18:58:05'),
(5, 53, '2025-07-24 18:58:02'),
(6, 59, '2025-07-25 18:03:14'),
(6, 60, '2025-07-26 09:27:08'),
(9, 60, '2025-07-25 20:04:37'),
(10, 58, '2025-07-31 15:09:06'),
(10, 59, '2025-07-31 15:09:03'),
(10, 60, '2025-07-31 15:09:00'),
(10, 119, '2025-08-08 13:36:59'),
(10, 122, '2025-08-08 18:23:17'),
(10, 125, '2025-08-08 14:31:23'),
(10, 126, '2025-08-08 14:31:13'),
(10, 127, '2025-08-08 14:20:58'),
(10, 128, '2025-08-08 14:20:49'),
(10, 129, '2025-08-08 13:46:10'),
(10, 130, '2025-08-07 18:08:30'),
(10, 131, '2025-08-08 14:04:51'),
(10, 132, '2025-08-08 13:46:24'),
(10, 133, '2025-08-08 13:45:43'),
(10, 134, '2025-08-08 13:45:35'),
(10, 135, '2025-08-08 13:45:24'),
(10, 136, '2025-08-08 13:33:33'),
(10, 137, '2025-08-08 13:31:37'),
(10, 138, '2025-08-07 18:08:20'),
(10, 139, '2025-08-08 13:22:57');

-- --------------------------------------------------------

--
-- Struttura della tabella `fatture_attive`
--

CREATE TABLE `fatture_attive` (
  `id` int(11) NOT NULL,
  `id_ditta` int(11) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `numero_fattura` varchar(50) NOT NULL,
  `data_emissione` date NOT NULL,
  `importo_imponibile` decimal(12,2) DEFAULT NULL,
  `id_iva` int(11) DEFAULT NULL,
  `importo_totale` decimal(12,2) DEFAULT NULL,
  `data_scadenza` date DEFAULT NULL,
  `stato` enum('Emessa','Pagata','Stornata','Scaduta') DEFAULT 'Emessa',
  `id_utente_creazione` int(11) DEFAULT NULL,
  `anno` int(11) DEFAULT NULL COMMENT 'Anno di competenza della fattura'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `fatture_passive`
--

CREATE TABLE `fatture_passive` (
  `id` int(11) NOT NULL,
  `id_ditta` int(11) NOT NULL,
  `id_fornitore` int(11) NOT NULL,
  `numero_documento` varchar(100) NOT NULL,
  `data_documento` date NOT NULL,
  `importo_imponibile` decimal(12,2) DEFAULT NULL,
  `id_iva` int(11) DEFAULT NULL,
  `importo_totale` decimal(12,2) DEFAULT NULL,
  `data_scadenza` date DEFAULT NULL,
  `stato` enum('Da Pagare','Pagata','Contestata') DEFAULT 'Da Pagare',
  `id_utente_registrazione` int(11) DEFAULT NULL,
  `anno` int(11) DEFAULT NULL COMMENT 'Anno di competenza della fattura'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `funzioni`
--

CREATE TABLE `funzioni` (
  `id` int(11) NOT NULL,
  `codice` varchar(100) NOT NULL,
  `descrizione` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `funzioni`
--

INSERT INTO `funzioni` (`id`, `codice`, `descrizione`) VALUES
(1, 'ANAGRAFICHE_VIEW', 'Permette di visualizzare l\'elenco delle anagrafiche'),
(2, 'ANAGRAFICHE_CREATE', 'Permette di creare una nuova anagrafica'),
(3, 'ANAGRAFICHE_EDIT', 'Permette di modificare un\'anagrafica esistente'),
(4, 'ANAGRAFICHE_DELETE', 'Permette di eliminare un\'anagrafica'),
(5, 'UTENTI_VIEW', 'Permette di visualizzare gli utenti della propria ditta'),
(6, 'FATTURE_VIEW', 'Permette di visualizzare le fatture');

-- --------------------------------------------------------

--
-- Struttura della tabella `funzioni_contabili`
--

CREATE TABLE `funzioni_contabili` (
  `id` int(11) NOT NULL,
  `id_ditta` int(11) NOT NULL,
  `codice_funzione` varchar(100) NOT NULL,
  `descrizione` varchar(255) NOT NULL,
  `livello_richiesto` int(11) NOT NULL DEFAULT 50
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `funzioni_contabili`
--

INSERT INTO `funzioni_contabili` (`id`, `id_ditta`, `codice_funzione`, `descrizione`, `livello_richiesto`) VALUES
(1, 1, 'FATT_ATTIVA_CREA', 'Creazione Fatture di Vendita', 80),
(2, 1, 'FATT_ATTIVA_VEDI', 'Visualizzazione Fatture di Vendita', 50),
(3, 1, 'FATT_PASSIVA_CREA', 'Registrazione Fatture di Acquisto', 70),
(4, 1, 'FATT_PASSIVA_VEDI', 'Visualizzazione Fatture di Acquisto', 50),
(5, 1, 'INCASSI_REGISTRA', 'Registrazione Incassi', 60),
(6, 1, 'PAGAMENTI_REGISTRA', 'Registrazione Pagamenti', 60),
(7, 3, 'FATT_ATTIVA_CREA', 'Creazione Fatture di Vendita', 80),
(8, 3, 'FATT_ATTIVA_VEDI', 'Visualizzazione Fatture di Vendita', 50),
(9, 3, 'FATT_PASSIVA_CREA', 'Registrazione Fatture di Acquisto', 70),
(10, 3, 'FATT_PASSIVA_VEDI', 'Visualizzazione Fatture di Acquisto', 50),
(11, 3, 'INCASSI_REGISTRA', 'Registrazione Incassi', 60),
(12, 3, 'PAGAMENTI_REGISTRA', 'Registrazione Pagamenti', 60);

-- --------------------------------------------------------

--
-- Struttura della tabella `funzioni_contabili_automatiche`
--

CREATE TABLE `funzioni_contabili_automatiche` (
  `codice_funzione` int(11) NOT NULL,
  `rilancio_1_dare` varchar(255) DEFAULT NULL,
  `rilancio_2_dare` varchar(255) DEFAULT NULL,
  `rilancio_3_dare` varchar(255) DEFAULT NULL,
  `rilancio_4_dare` varchar(255) DEFAULT NULL,
  `rilancio_5_dare` varchar(255) DEFAULT NULL,
  `rilancio_1_avere` varchar(255) DEFAULT NULL,
  `rilancio_2_avere` varchar(255) DEFAULT NULL,
  `rilancio_3_avere` varchar(255) DEFAULT NULL,
  `rilancio_4_avere` varchar(255) DEFAULT NULL,
  `rilancio_5_avere` varchar(255) DEFAULT NULL,
  `descrizione_operazione` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `funzioni_contabili_automatiche`
--

INSERT INTO `funzioni_contabili_automatiche` (`codice_funzione`, `rilancio_1_dare`, `rilancio_2_dare`, `rilancio_3_dare`, `rilancio_4_dare`, `rilancio_5_dare`, `rilancio_1_avere`, `rilancio_2_avere`, `rilancio_3_avere`, `rilancio_4_avere`, `rilancio_5_avere`, `descrizione_operazione`) VALUES
(7, '112', NULL, NULL, NULL, NULL, '12', NULL, NULL, NULL, NULL, '222');

-- --------------------------------------------------------

--
-- Struttura della tabella `incassi`
--

CREATE TABLE `incassi` (
  `id` int(11) NOT NULL,
  `id_fattura_attiva` int(11) NOT NULL,
  `data_incasso` date NOT NULL,
  `importo_incassato` decimal(12,2) NOT NULL,
  `id_tipo_pagamento` int(11) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `id_utente_registrazione` int(11) DEFAULT NULL,
  `anno` int(11) DEFAULT NULL COMMENT 'Anno di competenza dell incasso'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `iva_contabili`
--

CREATE TABLE `iva_contabili` (
  `id` int(11) NOT NULL,
  `id_ditta` int(11) NOT NULL,
  `codice` varchar(50) NOT NULL,
  `descrizione` varchar(255) DEFAULT NULL,
  `aliquota` decimal(5,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `iva_contabili`
--

INSERT INTO `iva_contabili` (`id`, `id_ditta`, `codice`, `descrizione`, `aliquota`) VALUES
(1, 3, '5', NULL, 5.00),
(2, 3, '10', NULL, 10.00),
(3, 3, '22', NULL, 22.00),
(4, 1, '5', NULL, 5.00),
(5, 1, '10', NULL, 10.00),
(6, 1, '22', NULL, 22.00);

-- --------------------------------------------------------

--
-- Struttura della tabella `libro_giornale`
--

CREATE TABLE `libro_giornale` (
  `id` bigint(20) NOT NULL,
  `id_ditta` int(11) NOT NULL,
  `anno` int(11) DEFAULT NULL,
  `data` date NOT NULL,
  `id_sottoconto_dare` int(11) NOT NULL,
  `vuoto` decimal(12,2) NOT NULL,
  `id_sottoconto_avere` int(11) NOT NULL,
  `importo` decimal(12,2) NOT NULL,
  `descrizione_movimento` text DEFAULT NULL,
  `id_utente_inserimento` int(11) DEFAULT NULL,
  `data_inserimento` timestamp NOT NULL DEFAULT current_timestamp()
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

--
-- Dump dei dati per la tabella `log_accessi`
--

INSERT INTO `log_accessi` (`id`, `id_utente`, `indirizzo_ip`, `data_ora_accesso`, `id_funzione_accessibile`, `dettagli_azione`) VALUES
(1, 1, '192.168.1.10', '2025-07-24 15:08:31', 5, 'Login riuscito');

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
-- Struttura della tabella `mastri`
--

CREATE TABLE `mastri` (
  `codice` varchar(20) NOT NULL,
  `id_ditta` int(11) NOT NULL,
  `tipo` varchar(50) DEFAULT NULL,
  `descrizione` varchar(255) NOT NULL,
  `gruppo` varchar(100) DEFAULT NULL COMMENT 'Gruppo di appartenenza del mastro (es. Attività, Passività)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `mastri`
--

INSERT INTO `mastri` (`codice`, `id_ditta`, `tipo`, `descrizione`, `gruppo`) VALUES
('1', 1, 'G', 'CREDITI V/SOCI PER VERSAMENTI ANCORA DOVUTI', 'Crediti v/ soci per vers. anco'),
('1', 3, 'G', 'CREDITI V/SOCI PER VERSAMENTI ANCORA DOVUTI', 'Crediti v/ soci per vers. anco'),
('10', 1, 'G', 'CREDITI DIVERSI', 'Crediti verso altri'),
('10', 3, 'G', 'CREDITI DIVERSI', 'Crediti verso altri'),
('11', 1, 'G', 'CREDITI V/IMPRESE', 'Crediti verso imprese'),
('11', 3, 'G', 'CREDITI V/IMPRESE', 'Crediti verso imprese'),
('12', 1, 'G', 'ATTIVITA\' FINANZ. CHE NON COSTIT. IMMOBILIZZ.', 'Partecipazioni'),
('12', 3, 'G', 'ATTIVITA\' FINANZ. CHE NON COSTIT. IMMOBILIZZ.', 'Partecipazioni'),
('13', 1, 'G', 'CASSA', 'Disponibilita  liquide'),
('13', 3, 'G', 'CASSA', 'Disponibilita  liquide'),
('14', 1, 'G', 'DEPOSITI BANCARI E POSTALI', 'Disponibilita  liquide'),
('14', 3, 'G', 'DEPOSITI BANCARI E POSTALI', 'Disponibilita  liquide'),
('15', 1, 'G', 'ISTITUTI C/PORTAFOGLIO EFFETTI', 'Disponibilita  liquide'),
('15', 3, 'G', 'ISTITUTI C/PORTAFOGLIO EFFETTI', 'Disponibilita  liquide'),
('16', 1, 'G', 'RATEI E RISCONTI ATTIVI', 'Ratei e risconti'),
('16', 3, 'G', 'RATEI E RISCONTI ATTIVI', 'Ratei e risconti'),
('20', 1, 'G', 'CAPITALE SOCIALE', 'Patrimonio netto'),
('20', 3, 'G', 'CAPITALE SOCIALE', 'Patrimonio netto'),
('21', 1, 'G', 'RISERVE', 'Patrimonio netto'),
('21', 3, 'G', 'RISERVE', 'Patrimonio netto'),
('22', 1, 'G', 'UTILI (PERDITE) PORTATI A NUOVO', 'Patrimonio netto'),
('22', 3, 'G', 'UTILI (PERDITE) PORTATI A NUOVO', 'Patrimonio netto'),
('23', 1, 'G', 'UTILE (PERDITA) DELL\'ESERCIZIO', 'Patrimonio netto'),
('23', 3, 'G', 'UTILE (PERDITA) DELL\'ESERCIZIO', 'Patrimonio netto'),
('25', 1, 'G', 'FONDI PER RISCHI ED ONERI', 'Fondi per rischi e oneri'),
('25', 3, 'G', 'FONDI PER RISCHI ED ONERI', 'Fondi per rischi e oneri'),
('26', 1, 'G', 'T.F.R.', 'Trattamento di fine rapporto'),
('26', 3, 'G', 'T.F.R.', 'Trattamento di fine rapporto'),
('28', 1, 'F', 'FORNITORI', 'Debiti verso fornitori'),
('28', 3, 'F', 'FORNITORI', 'Debiti verso fornitori'),
('29', 1, 'G', 'ALTRI DEBITI COMMERCIALI', 'Debiti verso fornitori'),
('29', 3, 'G', 'ALTRI DEBITI COMMERCIALI', 'Debiti verso fornitori'),
('3', 1, 'G', 'IMMOBILIZZAZIONI IMMATERIALI', 'Immobilizzazioni immateriali'),
('3', 3, 'G', 'IMMOBILIZZAZIONI IMMATERIALI', 'Immobilizzazioni immateriali'),
('30', 1, 'G', 'DEBITI DIVERSI', 'Altri debiti'),
('30', 3, 'G', 'DEBITI DIVERSI', 'Altri debiti'),
('31', 1, 'G', 'DEBITI V/IMPRESE', 'Debiti verso imprese'),
('31', 3, 'G', 'DEBITI V/IMPRESE', 'Debiti verso imprese'),
('32', 1, 'G', 'DEBITI TRIBUTARI', 'Debiti tributari'),
('32', 3, 'G', 'DEBITI TRIBUTARI', 'Debiti tributari'),
('33', 1, 'G', 'DEBITI V/ISTITUTI PREVIDENZIALI', 'Debiti v/istituti di previd.'),
('33', 3, 'G', 'DEBITI V/ISTITUTI PREVIDENZIALI', 'Debiti v/istituti di previd.'),
('34', 1, 'G', 'DEBITI V/SOCI', 'Debiti v/soci per finanziame'),
('34', 3, 'G', 'DEBITI V/SOCI', 'Debiti v/soci per finanziame'),
('35', 1, 'G', 'DEBITI V/BANCHE', 'Debiti verso banche'),
('35', 3, 'G', 'DEBITI V/BANCHE', 'Debiti verso banche'),
('36', 1, 'G', 'RATEI E RISCONTI PASSIVI', 'Ratei e risconti'),
('36', 3, 'G', 'RATEI E RISCONTI PASSIVI', 'Ratei e risconti'),
('4', 1, 'G', 'IMMOBILIZZAZIONI MATERIALI', 'Immobilizzazioni materiali'),
('4', 3, 'G', 'IMMOBILIZZAZIONI MATERIALI', 'Immobilizzazioni materiali'),
('5', 1, 'G', 'IMMOBILIZZAZIONI FINANZIARIE', 'Immobilizzazioni finanziarie'),
('5', 3, 'G', 'IMMOBILIZZAZIONI FINANZIARIE', 'Immobilizzazioni finanziarie'),
('50', 1, 'G', 'MERCI C/VENDITE', 'Ricavi delle vendite e delle'),
('50', 3, 'G', 'MERCI C/VENDITE', 'Ricavi delle vendite e delle'),
('51', 1, 'G', 'VARIAZIONI RIMANENZE PRODOTTI', 'Variaz. d/riman. di prodotti'),
('51', 3, 'G', 'VARIAZIONI RIMANENZE PRODOTTI', 'Variaz. d/riman. di prodotti'),
('52', 1, 'G', 'ALTRI RICAVI E PROVENTI', 'Altri ricavi e proventi'),
('52', 3, 'G', 'ALTRI RICAVI E PROVENTI', 'Altri ricavi e proventi'),
('53', 1, 'G', 'MERCI C/ACQUISTI', 'Costi per mat. prime sussid.,'),
('53', 3, 'G', 'MERCI C/ACQUISTI', 'Costi per mat. prime sussid.,'),
('54', 1, 'G', 'COSTI PER SERVIZI', 'Costi per servizi'),
('54', 3, 'G', 'COSTI PER SERVIZI', 'Costi per servizi'),
('55', 1, 'G', 'COSTI PER GODIMENTO BENI DI TERZI', 'Costi per godimento di beni di'),
('55', 3, 'G', 'COSTI PER GODIMENTO BENI DI TERZI', 'Costi per godimento di beni di'),
('57', 1, 'G', 'COSTI PER IL PERSONALE', 'Costi per il personale'),
('57', 3, 'G', 'COSTI PER IL PERSONALE', 'Costi per il personale'),
('58', 1, 'G', 'AMMORTAMENTO IMMOBILIZZAZIONI IMMATERIALI', 'Ammortam. immobilizzazioni imm'),
('58', 3, 'G', 'AMMORTAMENTO IMMOBILIZZAZIONI IMMATERIALI', 'Ammortam. immobilizzazioni imm'),
('59', 1, 'G', 'AMMORTAMENTO IMMOBILIZZAZIONI MATERIALI', 'Ammortamento delle immobilizz.'),
('59', 3, 'G', 'AMMORTAMENTO IMMOBILIZZAZIONI MATERIALI', 'Ammortamento delle immobilizz.'),
('60', 1, 'G', 'AMMORTAMENTO ANTICIPATO IMMOBILIZZAZIONI', 'Ammortamento delle immobilizz.'),
('60', 3, 'G', 'AMMORTAMENTO ANTICIPATO IMMOBILIZZAZIONI', 'Ammortamento delle immobilizz.'),
('61', 1, 'G', 'VARIAZIONI RIMANENZE MATERIE CONSUMO E MERCI', 'Variaz. d/riman. di materie pr'),
('61', 3, 'G', 'VARIAZIONI RIMANENZE MATERIE CONSUMO E MERCI', 'Variaz. d/riman. di materie pr'),
('63', 1, 'G', 'SVALUTAZIONI', 'Svalut. d/immob.,dei crediti n'),
('63', 3, 'G', 'SVALUTAZIONI', 'Svalut. d/immob.,dei crediti n'),
('64', 1, 'G', 'ACCANTONAMENTI PER RISCHI', 'Accantonam. per rischi ed altr'),
('64', 3, 'G', 'ACCANTONAMENTI PER RISCHI', 'Accantonam. per rischi ed altr'),
('65', 1, 'G', 'ONERI DIVERSI DI GESTIONE', 'Oneri diversi di gestione'),
('65', 3, 'G', 'ONERI DIVERSI DI GESTIONE', 'Oneri diversi di gestione'),
('67', 1, 'G', 'ONERI FINANZIARI', 'Oneri finanziari'),
('67', 3, 'G', 'ONERI FINANZIARI', 'Oneri finanziari'),
('7', 1, 'G', 'RIMANENZE', 'Rimanenze'),
('7', 3, 'G', 'RIMANENZE', 'Rimanenze'),
('72', 1, 'G', 'ONERI STRAORDINARI', 'Oneri straordinari'),
('72', 3, 'G', 'ONERI STRAORDINARI', 'Oneri straordinari'),
('75', 1, 'G', 'RICAVI DELLE VENDITE', 'Ricavi delle vendite e delle'),
('75', 3, 'G', 'RICAVI DELLE VENDITE', 'Ricavi delle vendite e delle'),
('8', 1, 'C', 'CLIENTI', 'Crediti verso clienti'),
('8', 3, 'C', 'CLIENTI', 'Crediti verso clienti'),
('9', 1, 'G', 'ALTRI CREDITI COMMERCIALI', 'Crediti verso clienti'),
('9', 3, 'G', 'ALTRI CREDITI COMMERCIALI', 'Crediti verso clienti');

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
(40, 'Posta', 'MAIL');

-- --------------------------------------------------------

--
-- Struttura della tabella `pagamenti`
--

CREATE TABLE `pagamenti` (
  `id` int(11) NOT NULL,
  `id_fattura_passiva` int(11) NOT NULL,
  `data_pagamento` date NOT NULL,
  `importo_pagato` decimal(12,2) NOT NULL,
  `id_tipo_pagamento` int(11) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `id_utente_registrazione` int(11) DEFAULT NULL,
  `anno` int(11) DEFAULT NULL COMMENT 'Anno di competenza del pagamento'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `preventivi`
--

CREATE TABLE `preventivi` (
  `id` int(11) NOT NULL,
  `id_ditta` int(11) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `numero_preventivo` varchar(50) NOT NULL,
  `data_emissione` date NOT NULL,
  `oggetto` text DEFAULT NULL,
  `importo_imponibile` decimal(12,2) DEFAULT NULL,
  `aliquota_iva` decimal(5,2) DEFAULT NULL,
  `importo_totale` decimal(12,2) DEFAULT NULL,
  `stato` enum('Bozza','Inviato','Accettato','Rifiutato') DEFAULT 'Bozza',
  `data_scadenza` date DEFAULT NULL,
  `id_utente_creazione` int(11) DEFAULT NULL,
  `anno` int(11) DEFAULT NULL COMMENT 'Anno di competenza del preventivo'
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

--
-- Dump dei dati per la tabella `privacy_policies`
--

INSERT INTO `privacy_policies` (`id`, `id_ditta`, `responsabile_trattamento`, `corpo_lettera`, `data_aggiornamento`) VALUES
(1, 1, 'Angelo Breuno', '<p><br></p><p><strong>Autorizzazione al Trattamento dei Dati Personali per Finalità Commerciali e per la Comunicazione a Terzi</strong></p><p>Io sottoscritto/a,</p><p><strong>[Nome_Utente]</strong>, codice fiscale <strong>[codice fiscale]</strong>,</p><p><strong>PREMESSO CHE</strong></p><p><br></p><ul><li>ho ricevuto l\'informativa ai sensi dell’art. 13 del Regolamento (UE) 2016/679 (GDPR) relativa al trattamento dei miei dati personali da parte di <strong>[DITTA]</strong>, con sede in <strong>[indirizzo completo]</strong>,</li><li>ho compreso le finalità e le modalità del trattamento, i miei diritti e i soggetti coinvolti nel trattamento stesso,</li></ul><p><strong>AUTORIZZO</strong></p><p>il trattamento dei miei dati personali da parte di <strong>[Nome dell’Azienda]</strong> per le seguenti finalità:</p><ol><li><strong>Finalità di marketing diretto</strong>: invio di comunicazioni commerciali, promozionali e informative tramite e-mail, SMS, telefono, posta tradizionale o altri strumenti automatizzati di contatto, relative a prodotti e servizi offerti dal Titolare;</li><li><strong>Finalità di profilazione</strong>: analisi delle mie preferenze, abitudini e scelte di consumo al fine di ricevere comunicazioni personalizzate;</li><li><strong>Comunicazione a soggetti terzi</strong>: cessione e/o comunicazione dei miei dati personali a società terze, partner commerciali o altri titolari autonomi del trattamento, che potranno trattarli per proprie finalità di marketing diretto o altre attività commerciali compatibili.</li></ol><p><strong>DICHIARO</strong> inoltre di essere consapevole che:</p><p><br></p><ul><li>Il conferimento dei dati per le suddette finalità è facoltativo e l’eventuale mancato consenso non pregiudica la fruizione dei servizi principali offerti;</li><li>Posso in qualsiasi momento revocare il presente consenso, ai sensi dell’art. 7, par. 3, GDPR, scrivendo a <strong>[indirizzo email del titolare del trattamento]</strong>;</li><li>I miei diritti in merito al trattamento sono indicati negli articoli da 15 a 22 del GDPR.</li></ul><p>Luogo e data: _______________________________</p><p>Il presente documento è inviato a mezzo mail, accedendo al portale si considera accettata</p><p>non</p>', '2025-08-15 20:42:37'),
(2, 3, 'angioletto', '<p>se le informazioni le vuoi pazientarrrr</p>', '2025-08-13 10:36:33');

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

--
-- Dump dei dati per la tabella `registration_tokens`
--

INSERT INTO `registration_tokens` (`id`, `id_ditta`, `token`, `email_destinatario`, `scadenza`, `utilizzato`, `data_creazione`) VALUES
(1, 3, '7a92f40a-3995-4e19-b471-6c56d80c855c', NULL, '2025-08-06 14:45:35', 0, '2025-07-30 14:45:35'),
(2, 3, '0cbb7efb-2c43-4f08-a825-c40b4fef55cf', NULL, '2025-08-06 15:01:47', 0, '2025-07-30 15:01:47'),
(3, 3, '28e0cc1e-de38-42b1-be85-0996e0a27df6', NULL, '2025-08-06 15:03:16', 0, '2025-07-30 15:03:16'),
(4, 3, 'db830a35-1f34-4146-b144-f21409cd109c', NULL, '2025-07-30 15:09:02', 1, '2025-07-30 15:05:35'),
(5, 3, 'b9da1260-001e-42cc-9756-867efea4575f', NULL, '2025-07-30 15:58:51', 1, '2025-07-30 15:57:01'),
(6, 3, '67285bd9-bc67-4102-9de0-76fd478b0abc', NULL, '2025-08-06 17:37:37', 0, '2025-07-30 17:37:37'),
(7, 3, 'c790891f-fb9b-4511-b440-1788adb7cdde', NULL, '2025-07-30 18:11:16', 1, '2025-07-30 18:10:21'),
(8, 3, 'e1fdf689-ac96-43d6-9941-8a36b2b78644', NULL, '2025-08-06 18:30:16', 0, '2025-07-30 18:30:16'),
(9, 3, '2aad2d3f-6098-417c-aaf4-59d15f38b1df', NULL, '2025-08-07 17:58:58', 0, '2025-07-31 17:58:58'),
(10, 3, 'ad34591b-8ac7-4d1e-905e-c19c8d4e4716', NULL, '2025-08-16 11:14:37', 0, '2025-08-09 11:14:37'),
(11, 3, '287f815a-ce9a-4412-9a25-ba2031d850c8', NULL, '2025-08-20 10:17:40', 0, '2025-08-13 10:17:40'),
(12, 3, 'b6b13347-e535-4f9b-beb2-a621264a2859', NULL, '2025-08-20 10:22:37', 0, '2025-08-13 10:22:37'),
(13, 3, '7b95f9ba-9f57-4298-a6c9-52f027e917c4', NULL, '2025-08-20 10:24:23', 0, '2025-08-13 10:24:23'),
(14, 3, '7fe41e5c-dea0-422a-97f4-19292ef48060', NULL, '2025-08-20 10:34:18', 0, '2025-08-13 10:34:18'),
(15, 3, '94581e21-a76a-48e6-85d9-7224d5a6941a', NULL, '2025-08-20 10:36:38', 0, '2025-08-13 10:36:38'),
(16, 3, '5600c7e6-2802-410e-a954-a8f00e9286d7', NULL, '2025-08-20 10:42:04', 0, '2025-08-13 10:42:04'),
(17, 3, '30dd7f76-9881-473f-be92-3c0ec3c097be', NULL, '2025-08-20 10:42:13', 0, '2025-08-13 10:42:13'),
(18, 3, '01f371f1-3ee6-4e6d-8828-c6981019e72d', NULL, '2025-08-21 13:46:04', 0, '2025-08-14 13:46:04'),
(19, 3, 'dc7e499c-0934-4535-bb67-2831f8fd55f9', NULL, '2025-08-21 13:55:04', 0, '2025-08-14 13:55:04'),
(20, 3, '1f54acda-2478-4b20-9dfc-513349d4004a', NULL, '2025-08-14 14:10:54', 1, '2025-08-14 14:10:03');

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
  `livello` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `ruoli`
--

INSERT INTO `ruoli` (`id`, `tipo`, `livello`) VALUES
(1, 'Amministratore_sistema', 100),
(2, 'Amministratore_Azienda', 90),
(3, 'Utente_interno', 80),
(4, 'Utente_esterno', 50);

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
(2, 1),
(2, 2),
(2, 3),
(2, 5),
(2, 6),
(4, 1),
(4, 6);

-- --------------------------------------------------------

--
-- Struttura della tabella `sottoconti`
--

CREATE TABLE `sottoconti` (
  `id` int(11) NOT NULL,
  `codice` varchar(20) NOT NULL,
  `id_ditta` int(11) NOT NULL,
  `descrizione` varchar(255) NOT NULL,
  `id_conto` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `sottoconti`
--

INSERT INTO `sottoconti` (`id`, `codice`, `id_ditta`, `descrizione`, `id_conto`) VALUES
(1, '03.1', 1, 'COSTI DI IMPIANTO E DI AMPLIAMENTO', 1),
(2, '03.2', 1, 'COSTI DI RICERCA, SVILUPPO E DI PUBBLICITA\'', 2),
(3, '03.3', 1, 'DIRITTI BREV.INDUSTR.E UTILIZZO OPERE INGEGNO', 3),
(4, '03.4', 1, 'CONCESSIONI, LICENZE, MARCHI E DIRITTI SIMILI', 4),
(5, '03.5', 1, 'AVVIAMENTO', 5),
(6, '03.6', 1, 'IMMOBILIZZAZIONI IN CORSO E ACCONTI', 6),
(7, '03.7', 1, 'ALTRE IMMOBILIZZAZIONI IMMATERIALI', 7),
(8, '04.1', 1, 'TERRENI E FABBRICATI', 8),
(9, '04.2', 1, 'IMPIANTI', 9),
(10, '04.3', 1, 'MACCHINARI', 10),
(11, '04.4', 1, 'ATTREZZTURE INDUSTRIALI E COMMERCIALI', 11),
(12, '04.5', 1, 'MOBILI E ARREDI', 12),
(13, '04.6', 1, 'MACCHINE UFFICIO', 13),
(14, '04.7', 1, 'MEZZI DI TRASPORTO', 14),
(15, '04.8', 1, 'IMMOBILIZZAZIONI MATERIALI IN CORSO E ACCONTI', 15),
(16, '04.9', 1, 'ALTRE IMMOBILIZZAZIONI MATERIALI', 16),
(17, '05.1', 1, 'PARTECIPAZIONI', 17),
(18, '05.2', 1, 'CREDITI', 18),
(19, '05.3', 1, 'ALTRI TITOLI', 19),
(20, '05.4', 1, 'AZIONI PROPRIE', 20),
(21, '07.1', 1, 'RIMANENZE MERCI', 21),
(22, '07.2', 1, 'RIMANENZE IMBALLAGGI', 22),
(23, '07.3', 1, 'RIMANENZE MATERIE DI CONSUMO', 23),
(24, '07.4', 1, 'ACCONTI', 24),
(25, '08.1', 1, 'CLIENTI ITALIA', 25),
(26, '08.2', 1, 'CLIENTI ESTERO', 26),
(27, '10.1', 1, 'CREDITI TRIBUTARI', 27),
(28, '10.2', 1, 'CREDITI V/ISTITUTI PREVIDENZIALI', 28),
(29, '10.3', 1, 'CREDITI DIVERSI', 29),
(30, '13.1', 1, 'CASSA', 30),
(31, '14.1', 1, 'BANCA C/C', 31),
(32, '14.2', 1, 'POSTA C/C', 32),
(33, '15.1', 1, 'EFFETTI ATTIVI', 33),
(34, '15.2', 1, 'EFFETTI ALL\'INCASSO', 34),
(35, '15.3', 1, 'EFFETTI INSOLUTI', 35),
(36, '28.1', 1, 'FORNITORI ITALIA', 36),
(37, '28.2', 1, 'FORNITORI ESTERO', 37),
(38, '30.1', 1, 'DEBITI DIVERSI', 38),
(39, '32.1', 1, 'DEBITI TRIBUTARI', 39),
(40, '33.1', 1, 'DEBITI V/ISTITUTI PREVIDENZIALI', 40),
(41, '35.1', 1, 'DEBITI V/BANCHE', 41),
(42, '53.1', 1, 'MERCI C/ACQUISTI ITALIA', 42),
(43, '53.2', 1, 'MERCI C/ACQUISTI ESTERO', 43),
(44, '53.3', 1, 'IMBALLAGGI C/ACQUISTI', 44),
(45, '53.4', 1, 'MATERIALE DI CONSUMO C/ACQUISTI', 45),
(46, '54.1', 1, 'COSTI PER SERVIZI', 46),
(47, '55.1', 1, 'CANONI DI LEASING', 47),
(48, '55.2', 1, 'FITTI PASSIVI', 48),
(49, '57.1', 1, 'RETRIBUZIONI', 49),
(50, '57.2', 1, 'ONERI SOCIALI', 50),
(51, '57.3', 1, 'T.F.R.', 51),
(52, '58.1', 1, 'AMMORTAMENTO COSTI IMPIANTO E AMPLIAMENTO', 52),
(53, '58.2', 1, 'AMMORTAMENTO COSTI RICERCA E SVILUPPO', 53),
(54, '58.3', 1, 'AMMORTAMENTO DIRITTI DI BREVETTO', 54),
(55, '58.4', 1, 'AMMORTAMENTO CONCESSIONI E MARCHI', 55),
(56, '58.5', 1, 'AMMORTAMENTO AVVIAMENTO', 56),
(57, '58.9', 1, 'AMMORTAMENTO ALTRE IMMOBILIZZAZIONI IMMATER.', 57),
(58, '59.1', 1, 'AMMORTAMENTO FABBRICATI', 58),
(59, '59.2', 1, 'AMMORTAMENTO IMPIANTI', 59),
(60, '59.3', 1, 'AMMORTAMENTO MACCHINARI', 60),
(61, '59.4', 1, 'AMMORTAMENTO ATTREZZATURE INDUSTRIALI, COMM.', 61),
(62, '59.5', 1, 'AMMORTAMENTO MOBILI E ARREDI', 62),
(63, '59.6', 1, 'AMMORTAMENTO MACCHINE UFFICIO', 63),
(64, '59.7', 1, 'AMMORTAMENTO MEZZI TRASPORTO', 64),
(65, '59.9', 1, 'AMMORTAMENTO ALTRE IMMOBILIZZAZIONI MATERIALI', 65),
(66, '61.1', 1, 'MERCI C/ESISTENZE INIZIALI', 66),
(67, '61.2', 1, 'IMBALLAGGI C/ESISTENZE INIZIALI', 67),
(68, '61.3', 1, 'MATERIALE DI CONSUMO C/ESISTENZE INIZIALI', 68),
(69, '61.5', 1, 'MERCI C/RIMANENZE FINALI', 69),
(70, '61.6', 1, 'IMBALLAGGI C/RIMANENZE FINALI', 70),
(71, '61.7', 1, 'MATERIALE DI CONSUMO C/RIMANENZE FINALI', 71),
(72, '63.1', 1, 'ALTRE SVALUTAZIONI IMMOBILIZZAZIONI', 72),
(73, '63.2', 1, 'SVALUT. CREDITI ATTIVO CIRC.,DISPONIB.LIQUIDE', 73),
(74, '67.1', 1, 'ONERI FINANZIARI V/IMPRESE', 74),
(75, '67.2', 1, 'ALTRI ONERI FINANZIARI', 75),
(76, '75.1', 1, 'VENDITE DI MERCI ITALIA', 76),
(77, '75.15', 1, 'VENDITE DI MERCI ESTERO', 77),
(78, '75.2', 1, 'VENDITE DI PRODOTTI FINITI', 78),
(128, '03.1', 3, 'COSTI DI IMPIANTO E DI AMPLIAMENTO', 79),
(129, '03.2', 3, 'COSTI DI RICERCA, SVILUPPO E DI PUBBLICITA\'', 80),
(130, '03.3', 3, 'DIRITTI BREV.INDUSTR.E UTILIZZO OPERE INGEGNO', 81),
(131, '03.4', 3, 'CONCESSIONI, LICENZE, MARCHI E DIRITTI SIMILI', 82),
(132, '03.5', 3, 'AVVIAMENTO', 83),
(133, '03.6', 3, 'IMMOBILIZZAZIONI IN CORSO E ACCONTI', 84),
(134, '03.7', 3, 'ALTRE IMMOBILIZZAZIONI IMMATERIALI', 85),
(135, '04.1', 3, 'TERRENI E FABBRICATI', 86),
(136, '04.2', 3, 'IMPIANTI', 87),
(137, '04.3', 3, 'MACCHINARI', 88),
(138, '04.4', 3, 'ATTREZZTURE INDUSTRIALI E COMMERCIALI', 89),
(139, '04.5', 3, 'MOBILI E ARREDI', 90),
(140, '04.6', 3, 'MACCHINE UFFICIO', 91),
(141, '04.7', 3, 'MEZZI DI TRASPORTO', 92),
(142, '04.8', 3, 'IMMOBILIZZAZIONI MATERIALI IN CORSO E ACCONTI', 93),
(143, '04.9', 3, 'ALTRE IMMOBILIZZAZIONI MATERIALI', 94),
(144, '05.1', 3, 'PARTECIPAZIONI', 95),
(145, '05.2', 3, 'CREDITI', 96),
(146, '05.3', 3, 'ALTRI TITOLI', 97),
(147, '05.4', 3, 'AZIONI PROPRIE', 98),
(148, '07.1', 3, 'RIMANENZE MERCI', 99),
(149, '07.2', 3, 'RIMANENZE IMBALLAGGI', 100),
(150, '07.3', 3, 'RIMANENZE MATERIE DI CONSUMO', 101),
(151, '07.4', 3, 'ACCONTI', 102),
(152, '08.1', 3, 'CLIENTI ITALIA', 103),
(153, '08.2', 3, 'CLIENTI ESTERO', 104),
(154, '10.1', 3, 'CREDITI TRIBUTARI', 105),
(155, '10.2', 3, 'CREDITI V/ISTITUTI PREVIDENZIALI', 106),
(156, '10.3', 3, 'CREDITI DIVERSI', 107),
(157, '13.1', 3, 'CASSA', 108),
(158, '14.1', 3, 'BANCA C/C', 109),
(159, '14.2', 3, 'POSTA C/C', 110),
(160, '15.1', 3, 'EFFETTI ATTIVI', 111),
(161, '15.2', 3, 'EFFETTI ALL\'INCASSO', 112),
(162, '15.3', 3, 'EFFETTI INSOLUTI', 113),
(163, '28.1', 3, 'FORNITORI ITALIA', 114),
(164, '28.2', 3, 'FORNITORI ESTERO', 115),
(165, '30.1', 3, 'DEBITI DIVERSI', 116),
(166, '32.1', 3, 'DEBITI TRIBUTARI', 117),
(167, '33.1', 3, 'DEBITI V/ISTITUTI PREVIDENZIALI', 118),
(168, '35.1', 3, 'DEBITI V/BANCHE', 119),
(169, '53.1', 3, 'MERCI C/ACQUISTI ITALIA', 120),
(170, '53.2', 3, 'MERCI C/ACQUISTI ESTERO', 121),
(171, '53.3', 3, 'IMBALLAGGI C/ACQUISTI', 122),
(172, '53.4', 3, 'MATERIALE DI CONSUMO C/ACQUISTI', 123),
(173, '54.1', 3, 'COSTI PER SERVIZI', 124),
(174, '55.1', 3, 'CANONI DI LEASING', 125),
(175, '55.2', 3, 'FITTI PASSIVI', 126),
(176, '57.1', 3, 'RETRIBUZIONI', 127),
(177, '57.2', 3, 'ONERI SOCIALI', 128),
(178, '57.3', 3, 'T.F.R.', 129),
(179, '58.1', 3, 'AMMORTAMENTO COSTI IMPIANTO E AMPLIAMENTO', 130),
(180, '58.2', 3, 'AMMORTAMENTO COSTI RICERCA E SVILUPPO', 131),
(181, '58.3', 3, 'AMMORTAMENTO DIRITTI DI BREVETTO', 132),
(182, '58.4', 3, 'AMMORTAMENTO CONCESSIONI E MARCHI', 133),
(183, '58.5', 3, 'AMMORTAMENTO AVVIAMENTO', 134),
(184, '58.9', 3, 'AMMORTAMENTO ALTRE IMMOBILIZZAZIONI IMMATER.', 135),
(185, '59.1', 3, 'AMMORTAMENTO FABBRICATI', 136),
(186, '59.2', 3, 'AMMORTAMENTO IMPIANTI', 137),
(187, '59.3', 3, 'AMMORTAMENTO MACCHINARI', 138),
(188, '59.4', 3, 'AMMORTAMENTO ATTREZZATURE INDUSTRIALI, COMM.', 139),
(189, '59.5', 3, 'AMMORTAMENTO MOBILI E ARREDI', 140),
(190, '59.6', 3, 'AMMORTAMENTO MACCHINE UFFICIO', 141),
(191, '59.7', 3, 'AMMORTAMENTO MEZZI TRASPORTO', 142),
(192, '59.9', 3, 'AMMORTAMENTO ALTRE IMMOBILIZZAZIONI MATERIALI', 143),
(193, '61.1', 3, 'MERCI C/ESISTENZE INIZIALI', 144),
(194, '61.2', 3, 'IMBALLAGGI C/ESISTENZE INIZIALI', 145),
(195, '61.3', 3, 'MATERIALE DI CONSUMO C/ESISTENZE INIZIALI', 146),
(196, '61.5', 3, 'MERCI C/RIMANENZE FINALI', 147),
(197, '61.6', 3, 'IMBALLAGGI C/RIMANENZE FINALI', 148),
(198, '61.7', 3, 'MATERIALE DI CONSUMO C/RIMANENZE FINALI', 149),
(199, '63.1', 3, 'ALTRE SVALUTAZIONI IMMOBILIZZAZIONI', 150),
(200, '63.2', 3, 'SVALUT. CREDITI ATTIVO CIRC.,DISPONIB.LIQUIDE', 151),
(201, '67.1', 3, 'ONERI FINANZIARI V/IMPRESE', 152),
(202, '67.2', 3, 'ALTRI ONERI FINANZIARI', 153),
(203, '75.1', 3, 'VENDITE DI MERCI ITALIA', 154),
(204, '75.15', 3, 'VENDITE DI MERCI ESTERO', 155),
(205, '75.2', 3, 'VENDITE DI PRODOTTI FINITI', 156);

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
(10, 140, '2025-08-08 19:13:21'),
(10, 142, '2025-08-17 18:45:30');

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

--
-- Dump dei dati per la tabella `tipi_pagamento`
--

INSERT INTO `tipi_pagamento` (`id`, `id_ditta`, `codice`, `descrizione`) VALUES
(1, 3, '10', 'CONTANTI'),
(2, 3, '20', 'BONIFICO'),
(3, 3, '30', 'POS'),
(4, 3, '40', 'TITOLI'),
(5, 1, '10', 'CONTANTI'),
(6, 1, '20', 'BONIFICO'),
(7, 1, '30', 'POS'),
(8, 1, '40', 'TITOLI');

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
  `id_mail_account` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `utente_mail_accounts`
--

INSERT INTO `utente_mail_accounts` (`id_utente`, `id_mail_account`) VALUES
(4, 9),
(4, 10),
(6, 11),
(9, 11),
(10, 9),
(10, 10),
(31, 10);

-- --------------------------------------------------------

--
-- Struttura della tabella `utenti`
--

CREATE TABLE `utenti` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nome` varchar(100) DEFAULT NULL,
  `cognome` varchar(100) DEFAULT NULL,
  `codice_fiscale` varchar(16) DEFAULT NULL,
  `telefono` varchar(30) DEFAULT NULL,
  `indirizzo` varchar(255) DEFAULT NULL,
  `citta` varchar(100) DEFAULT NULL,
  `provincia` varchar(50) DEFAULT NULL,
  `cap` varchar(10) DEFAULT NULL,
  `id_ditta` int(11) DEFAULT NULL,
  `id_ruolo` int(11) DEFAULT NULL,
  `attivo` tinyint(1) DEFAULT 1,
  `data_creazione` timestamp NOT NULL DEFAULT current_timestamp(),
  `data_ultimo_accesso` timestamp NULL DEFAULT NULL,
  `note` text DEFAULT NULL,
  `firma` text DEFAULT NULL,
  `privacy` tinyint(1) DEFAULT 0,
  `funzioni_attive` text DEFAULT NULL,
  `livello` int(11) DEFAULT 50,
  `Codice_Tipo_Utente` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `utenti`
--

INSERT INTO `utenti` (`id`, `email`, `password`, `nome`, `cognome`, `codice_fiscale`, `telefono`, `indirizzo`, `citta`, `provincia`, `cap`, `id_ditta`, `id_ruolo`, `attivo`, `data_creazione`, `data_ultimo_accesso`, `note`, `firma`, `privacy`, `funzioni_attive`, `livello`, `Codice_Tipo_Utente`) VALUES
(1, 'sysadmin@mia-azienda.it', 'password_criptata_qui', 'System', 'Admin', NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, '2025-07-24 15:08:31', NULL, NULL, NULL, 0, NULL, 50, NULL),
(2, 'mario.rossi@cliente-demo.it', 'password_criptata_qui', 'Mario', 'Rossi', NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 1, '2025-07-24 15:08:31', NULL, NULL, NULL, 0, NULL, 50, NULL),
(3, 'angbrunosa@gmail.com', '$2b$10$JxllX3i7uL3CGpUunIoVSOdq1/zHxU9cckBYRXTPNBNbRz81lCXwC', 'Angelo ', 'Bruno', NULL, NULL, NULL, NULL, NULL, NULL, 1, 2, 1, '2025-07-24 15:48:22', NULL, NULL, NULL, 0, NULL, 99, 1),
(4, 'info@difam.it', '$2b$10$mDL.FXQ4GmIhthGlmLCRFOwv7FxAXCJkRqa0AqKI9GIogmP6fxmnK', 'francesco ', 'baggetta', 'brf', NULL, NULL, NULL, NULL, NULL, 3, 3, 1, '2025-07-24 18:34:46', NULL, NULL, 'dott. Francesco Baggetta Direttore Generale Confesercenti Calabria Servizi', 1, NULL, 50, NULL),
(5, 'admin@example.com', '$2b$10$tbky/vlxsUxLcVHY1hY/YuJysH9mNaj7bFxxfVpFed1FYCMUMABWy', 'Angelo ', 'Bruno', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 4, 1, '2025-07-24 18:43:36', NULL, NULL, NULL, 0, NULL, 50, NULL),
(6, 'info@example.com', '$2b$10$TE4iHRvwQ1Wgabc6gq..z.MiVOf2Ypjp4ehAHl.aJdQINjeLN5owi', 'Angelo', 'Bruno', NULL, NULL, NULL, NULL, NULL, NULL, 1, 3, 1, '2025-07-25 18:03:06', NULL, NULL, 'dott. Angelo Bruno\nww', 0, NULL, 50, NULL),
(9, 'master@opero.it', '$2b$10$yApw9swySOyQbtFCOC8TVOhPJTmrhIH0eDuVxc5H1WAGh0eAMFq6u', 'Master', 'Admin', NULL, 'uu', NULL, NULL, NULL, NULL, 1, 1, 1, '2025-07-25 19:58:14', NULL, NULL, 'Direzione Gestionale Opero.\nwww.operomeglio.it\n', 0, NULL, 50, NULL),
(10, 'provadmin@prova.it', '$2b$10$DrytCfOdmnOgEH7ISH86X.NFCep9OVxfII5w6dCHfcoX.BYWN0fCC', 'dott. Angelo', 'Bruno -Opero-GEST', NULL, NULL, NULL, NULL, NULL, NULL, 3, 3, 1, '2025-07-26 16:10:54', NULL, NULL, 'dott. Angelo Bruno\n\nopero il gestionale che opera per te', 0, NULL, 99, NULL),
(11, 'AngProva@provino.it', '$2b$10$dLb.wC/gRYtCmuISajM...LQ12V5oLd1c6aOZYGLw.wzfRw.kMqTu', 'angeloProva', 'BrunoProva', 's', NULL, NULL, NULL, NULL, NULL, 3, 4, 1, '2025-07-30 15:09:02', NULL, NULL, NULL, 1, NULL, 50, NULL),
(13, 'provaCOM@prova.it', '$2b$10$C26/u3pagw9zt5TYoqgCGernyCIXjt/c9xj/47mRiV1EXtYOC0T16', 'PROVACOMPLETA', 'PROVACOMPLETA', 'BRNNGL76L21C349J', '098134463', 'VIA DEL CORSO2', 'PASSOLENTO', 'CS', NULL, 3, 3, 1, '2025-07-30 15:58:51', NULL, NULL, NULL, 1, NULL, 49, NULL),
(14, 'lucaprovadmin@prova.it', '$2b$10$XJOnOO3o.s5DtorcN7JWG.3IoOTgJIPDNeJ07HcxUOmqZz3K3PlDq', 'luca proca', 'cicone prova', 'lcvvnlsosos', '098135363', 'vico fioravanti', 'saracena', 'cs', NULL, 3, 3, 1, '2025-07-30 18:11:16', NULL, NULL, NULL, 1, NULL, 10, NULL),
(15, 'difamconsegne@gmail.com', '$2b$10$xw6CzU2voWK5sIEGzUflU.6BIn3cq1W4347npwYBad8ARJuzDNKJy', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 1, '2025-08-07 12:22:28', NULL, NULL, NULL, 0, NULL, 50, NULL),
(16, 'postmaster@cedibef.com', '$2b$10$dNnNFQx.dfTl1ofrRe0HeOk8MwMfT03tzj3o8LUm89NBiTvgS5p7a', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 1, '2025-08-08 11:24:17', NULL, NULL, NULL, 0, NULL, 50, NULL),
(31, 'befretail@gmail.com', '$2b$10$JxllX3i7uL3CGpUunIoVSOdq1/zHxU9cckBYRXTPNBNbRz81lCXwC', 'Cavolo', 'A Fiore', '02714170780', 'oppido', 'mamertino', 'regio', 'cs', NULL, 1, 1, 1, '2025-08-14 14:10:54', NULL, NULL, 'cavolo a fiore', 1, NULL, 100, NULL),
(32, 'opero@difam.it', '$2b$10$HzcHeKuF1/LE1/3UY4jxLOFHvETDChIGrIqyzAiUkNZZBN.820ggK', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 1, '2025-08-14 14:15:23', NULL, NULL, NULL, 0, NULL, 50, NULL),
(33, 'postmaster@difam.it', '$2b$10$9ti7YOjqWQKXUqbknXTtKOMLMCzTRCrBkv1YTzgpXSiGmgXnycYyK', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 1, '2025-08-14 14:58:32', NULL, NULL, NULL, 0, NULL, 50, NULL),
(34, 'provaadmin@prova.it', '$2b$10$nu1x6jTlOh5Uv9uRUITC1OgrueRQboMJJHUy98TN6hjbz/jVoxI9q', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 1, '2025-08-15 18:54:22', NULL, NULL, NULL, 0, NULL, 50, NULL),
(35, 'befretail@gmai.com', '$2b$10$yHIhsE9kDtGZhwMC.3p82.sVZNMVR7FnfOBfabyQFLS4fWLL3k02q', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 1, '2025-08-15 20:53:29', NULL, NULL, NULL, 0, NULL, 50, NULL),
(36, 'master@oper.it', '$2b$10$yWaTJtd1vXGdx.a1PPTnFOHfW6ct4RB0eJWmCWnDRc5oP3NpNRr4K', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 1, '2025-08-15 21:16:43', NULL, NULL, NULL, 0, NULL, 50, NULL),
(37, 'befretail@befretail.srl', '$2b$10$hkxyH85TK4x3Nn.0OcfFX.zAkE4hCUqXWug00ZQz1egk5UgUwN03a', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 1, '2025-08-16 21:30:18', NULL, NULL, NULL, 0, NULL, 50, NULL),
(38, 'befretail@gmail.srl', '$2b$10$i75f4L16LWzI6.UYxx7jRuhwsGmS1INZpWoaq2m7jUTr5IMAutq1q', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 1, '2025-08-16 21:31:07', NULL, NULL, NULL, 0, NULL, 50, NULL),
(39, 'befreatail@gmail.com', '$2b$10$NM6C65gA02ffDqpb30/3xuhkTUZet9yQ9ThL/Oa7jxkYzg1b4J0Zu', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 1, '2025-08-17 18:43:52', NULL, NULL, NULL, 0, NULL, 50, NULL);

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `allegati_tracciati`
--
ALTER TABLE `allegati_tracciati`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `download_id` (`download_id`),
  ADD KEY `id_email_inviata` (`id_email_inviata`);

--
-- Indici per le tabelle `anno_di_gestione`
--
ALTER TABLE `anno_di_gestione`
  ADD PRIMARY KEY (`anno`);

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
-- Indici per le tabelle `conti`
--
ALTER TABLE `conti`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codice` (`codice`,`codice_mastro`,`id_ditta`),
  ADD KEY `id_ditta` (`id_ditta`),
  ADD KEY `codice_mastro` (`codice_mastro`,`id_ditta`);

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
  ADD UNIQUE KEY `sdi` (`sdi`),
  ADD KEY `id_tipo_ditta` (`id_tipo_ditta`),
  ADD KEY `fk_ditte_relazioni` (`codice_relazione`),
  ADD KEY `fk_ditte_sottoconti` (`id_conto_collegato`);

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
-- Indici per le tabelle `fatture_attive`
--
ALTER TABLE `fatture_attive`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id_ditta` (`id_ditta`,`numero_fattura`),
  ADD KEY `id_cliente` (`id_cliente`),
  ADD KEY `id_iva` (`id_iva`);

--
-- Indici per le tabelle `fatture_passive`
--
ALTER TABLE `fatture_passive`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_ditta` (`id_ditta`),
  ADD KEY `id_fornitore` (`id_fornitore`),
  ADD KEY `id_iva` (`id_iva`);

--
-- Indici per le tabelle `funzioni`
--
ALTER TABLE `funzioni`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codice` (`codice`);

--
-- Indici per le tabelle `funzioni_contabili`
--
ALTER TABLE `funzioni_contabili`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id_ditta` (`id_ditta`,`codice_funzione`);

--
-- Indici per le tabelle `funzioni_contabili_automatiche`
--
ALTER TABLE `funzioni_contabili_automatiche`
  ADD PRIMARY KEY (`codice_funzione`);

--
-- Indici per le tabelle `incassi`
--
ALTER TABLE `incassi`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_fattura_attiva` (`id_fattura_attiva`),
  ADD KEY `id_tipo_pagamento` (`id_tipo_pagamento`);

--
-- Indici per le tabelle `iva_contabili`
--
ALTER TABLE `iva_contabili`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id_ditta` (`id_ditta`,`codice`);

--
-- Indici per le tabelle `libro_giornale`
--
ALTER TABLE `libro_giornale`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_ditta` (`id_ditta`),
  ADD KEY `id_sottoconto_dare` (`id_sottoconto_dare`),
  ADD KEY `id_sottoconto_avere` (`id_sottoconto_avere`),
  ADD KEY `id_utente_inserimento` (`id_utente_inserimento`);

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
-- Indici per le tabelle `mastri`
--
ALTER TABLE `mastri`
  ADD PRIMARY KEY (`codice`,`id_ditta`),
  ADD KEY `id_ditta` (`id_ditta`);

--
-- Indici per le tabelle `moduli`
--
ALTER TABLE `moduli`
  ADD PRIMARY KEY (`codice`),
  ADD UNIQUE KEY `chiave_componente_unique` (`chiave_componente`);

--
-- Indici per le tabelle `pagamenti`
--
ALTER TABLE `pagamenti`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_fattura_passiva` (`id_fattura_passiva`),
  ADD KEY `id_tipo_pagamento` (`id_tipo_pagamento`);

--
-- Indici per le tabelle `preventivi`
--
ALTER TABLE `preventivi`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id_ditta` (`id_ditta`,`numero_preventivo`),
  ADD KEY `id_cliente` (`id_cliente`),
  ADD KEY `id_utente_creazione` (`id_utente_creazione`);

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
-- Indici per le tabelle `sottoconti`
--
ALTER TABLE `sottoconti`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codice` (`codice`,`id_conto`,`id_ditta`),
  ADD KEY `id_ditta` (`id_ditta`),
  ADD KEY `id_conto` (`id_conto`);

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
  ADD KEY `id_mail_account` (`id_mail_account`);

--
-- Indici per le tabelle `utenti`
--
ALTER TABLE `utenti`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `codice_fiscale` (`codice_fiscale`),
  ADD KEY `id_ditta` (`id_ditta`),
  ADD KEY `id_ruolo` (`id_ruolo`),
  ADD KEY `fk_utente_tipo` (`Codice_Tipo_Utente`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `allegati_tracciati`
--
ALTER TABLE `allegati_tracciati`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

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
-- AUTO_INCREMENT per la tabella `conti`
--
ALTER TABLE `conti`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=157;

--
-- AUTO_INCREMENT per la tabella `ditta_mail_accounts`
--
ALTER TABLE `ditta_mail_accounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT per la tabella `ditte`
--
ALTER TABLE `ditte`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT per la tabella `email_inviate`
--
ALTER TABLE `email_inviate`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT per la tabella `fatture_attive`
--
ALTER TABLE `fatture_attive`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `fatture_passive`
--
ALTER TABLE `fatture_passive`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `funzioni`
--
ALTER TABLE `funzioni`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT per la tabella `funzioni_contabili`
--
ALTER TABLE `funzioni_contabili`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT per la tabella `incassi`
--
ALTER TABLE `incassi`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `iva_contabili`
--
ALTER TABLE `iva_contabili`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT per la tabella `libro_giornale`
--
ALTER TABLE `libro_giornale`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `log_accessi`
--
ALTER TABLE `log_accessi`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT per la tabella `log_azioni`
--
ALTER TABLE `log_azioni`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `moduli`
--
ALTER TABLE `moduli`
  MODIFY `codice` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT per la tabella `pagamenti`
--
ALTER TABLE `pagamenti`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `preventivi`
--
ALTER TABLE `preventivi`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `privacy_policies`
--
ALTER TABLE `privacy_policies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT per la tabella `registration_tokens`
--
ALTER TABLE `registration_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT per la tabella `ruoli`
--
ALTER TABLE `ruoli`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT per la tabella `sottoconti`
--
ALTER TABLE `sottoconti`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=206;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `allegati_tracciati`
--
ALTER TABLE `allegati_tracciati`
  ADD CONSTRAINT `allegati_tracciati_ibfk_1` FOREIGN KEY (`id_email_inviata`) REFERENCES `email_inviate` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `app_funzioni`
--
ALTER TABLE `app_funzioni`
  ADD CONSTRAINT `app_funzioni_ibfk_1` FOREIGN KEY (`codice_modulo`) REFERENCES `moduli` (`codice`);

--
-- Limiti per la tabella `app_ruoli`
--
ALTER TABLE `app_ruoli`
  ADD CONSTRAINT `app_ruoli_ibfk_1` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `app_ruoli_ibfk_2` FOREIGN KEY (`codice_modulo`) REFERENCES `moduli` (`codice`);

--
-- Limiti per la tabella `app_ruoli_funzioni`
--
ALTER TABLE `app_ruoli_funzioni`
  ADD CONSTRAINT `app_ruoli_funzioni_ibfk_1` FOREIGN KEY (`id_ruolo`) REFERENCES `app_ruoli` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `app_ruoli_funzioni_ibfk_2` FOREIGN KEY (`id_funzione`) REFERENCES `app_funzioni` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `conti`
--
ALTER TABLE `conti`
  ADD CONSTRAINT `conti_ibfk_1` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `conti_ibfk_2` FOREIGN KEY (`codice_mastro`,`id_ditta`) REFERENCES `mastri` (`codice`, `id_ditta`);

--
-- Limiti per la tabella `ditta_mail_accounts`
--
ALTER TABLE `ditta_mail_accounts`
  ADD CONSTRAINT `ditta_mail_accounts_ibfk_1` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `ditte`
--
ALTER TABLE `ditte`
  ADD CONSTRAINT `ditte_ibfk_1` FOREIGN KEY (`id_tipo_ditta`) REFERENCES `tipo_ditta` (`id`),
  ADD CONSTRAINT `fk_ditte_relazioni` FOREIGN KEY (`codice_relazione`) REFERENCES `relazioni_ditta` (`codice`);

--
-- Limiti per la tabella `ditte_moduli`
--
ALTER TABLE `ditte_moduli`
  ADD CONSTRAINT `ditte_moduli_ibfk_1` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE,
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
-- Limiti per la tabella `fatture_attive`
--
ALTER TABLE `fatture_attive`
  ADD CONSTRAINT `fatture_attive_ibfk_1` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fatture_attive_ibfk_2` FOREIGN KEY (`id_cliente`) REFERENCES `ditte` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fatture_attive_ibfk_3` FOREIGN KEY (`id_iva`) REFERENCES `iva_contabili` (`id`);

--
-- Limiti per la tabella `fatture_passive`
--
ALTER TABLE `fatture_passive`
  ADD CONSTRAINT `fatture_passive_ibfk_1` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fatture_passive_ibfk_2` FOREIGN KEY (`id_fornitore`) REFERENCES `ditte` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fatture_passive_ibfk_3` FOREIGN KEY (`id_iva`) REFERENCES `iva_contabili` (`id`);

--
-- Limiti per la tabella `funzioni_contabili`
--
ALTER TABLE `funzioni_contabili`
  ADD CONSTRAINT `funzioni_contabili_ibfk_1` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `funzioni_contabili_automatiche`
--
ALTER TABLE `funzioni_contabili_automatiche`
  ADD CONSTRAINT `fk_funzioni_contabili_automatiche_funzioni` FOREIGN KEY (`codice_funzione`) REFERENCES `funzioni_contabili` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Limiti per la tabella `incassi`
--
ALTER TABLE `incassi`
  ADD CONSTRAINT `incassi_ibfk_1` FOREIGN KEY (`id_fattura_attiva`) REFERENCES `fatture_attive` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `incassi_ibfk_2` FOREIGN KEY (`id_tipo_pagamento`) REFERENCES `tipi_pagamento` (`id`);

--
-- Limiti per la tabella `iva_contabili`
--
ALTER TABLE `iva_contabili`
  ADD CONSTRAINT `iva_contabili_ibfk_1` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `libro_giornale`
--
ALTER TABLE `libro_giornale`
  ADD CONSTRAINT `libro_giornale_ibfk_1` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `libro_giornale_ibfk_2` FOREIGN KEY (`id_sottoconto_dare`) REFERENCES `sottoconti` (`id`),
  ADD CONSTRAINT `libro_giornale_ibfk_3` FOREIGN KEY (`id_sottoconto_avere`) REFERENCES `sottoconti` (`id`),
  ADD CONSTRAINT `libro_giornale_ibfk_4` FOREIGN KEY (`id_utente_inserimento`) REFERENCES `utenti` (`id`);

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
  ADD CONSTRAINT `log_azioni_ibfk_1` FOREIGN KEY (`id_utente`) REFERENCES `utenti` (`id`),
  ADD CONSTRAINT `log_azioni_ibfk_2` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `mastri`
--
ALTER TABLE `mastri`
  ADD CONSTRAINT `mastri_ibfk_1` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `pagamenti`
--
ALTER TABLE `pagamenti`
  ADD CONSTRAINT `pagamenti_ibfk_1` FOREIGN KEY (`id_fattura_passiva`) REFERENCES `fatture_passive` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pagamenti_ibfk_2` FOREIGN KEY (`id_tipo_pagamento`) REFERENCES `tipi_pagamento` (`id`);

--
-- Limiti per la tabella `preventivi`
--
ALTER TABLE `preventivi`
  ADD CONSTRAINT `preventivi_ibfk_1` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `preventivi_ibfk_2` FOREIGN KEY (`id_cliente`) REFERENCES `ditte` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `preventivi_ibfk_3` FOREIGN KEY (`id_utente_creazione`) REFERENCES `utenti` (`id`);

--
-- Limiti per la tabella `privacy_policies`
--
ALTER TABLE `privacy_policies`
  ADD CONSTRAINT `privacy_policies_ibfk_1` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `registration_tokens`
--
ALTER TABLE `registration_tokens`
  ADD CONSTRAINT `registration_tokens_ibfk_1` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `ruoli_funzioni`
--
ALTER TABLE `ruoli_funzioni`
  ADD CONSTRAINT `ruoli_funzioni_ibfk_1` FOREIGN KEY (`id_ruolo`) REFERENCES `ruoli` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ruoli_funzioni_ibfk_2` FOREIGN KEY (`id_funzione`) REFERENCES `funzioni` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `sottoconti`
--
ALTER TABLE `sottoconti`
  ADD CONSTRAINT `sottoconti_ibfk_1` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sottoconti_ibfk_2` FOREIGN KEY (`id_conto`) REFERENCES `conti` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `stati_lettura`
--
ALTER TABLE `stati_lettura`
  ADD CONSTRAINT `stati_lettura_ibfk_1` FOREIGN KEY (`id_utente`) REFERENCES `utenti` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `tipi_pagamento`
--
ALTER TABLE `tipi_pagamento`
  ADD CONSTRAINT `tipi_pagamento_ibfk_1` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `utente_mail_accounts`
--
ALTER TABLE `utente_mail_accounts`
  ADD CONSTRAINT `utente_mail_accounts_ibfk_1` FOREIGN KEY (`id_utente`) REFERENCES `utenti` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `utente_mail_accounts_ibfk_2` FOREIGN KEY (`id_mail_account`) REFERENCES `ditta_mail_accounts` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `utenti`
--
ALTER TABLE `utenti`
  ADD CONSTRAINT `fk_utente_tipo` FOREIGN KEY (`Codice_Tipo_Utente`) REFERENCES `tipi_utente` (`Codice`),
  ADD CONSTRAINT `utenti_ibfk_1` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`),
  ADD CONSTRAINT `utenti_ibfk_2` FOREIGN KEY (`id_ruolo`) REFERENCES `ruoli` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
