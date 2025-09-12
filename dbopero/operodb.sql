-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Set 12, 2025 alle 09:55
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
(11, 1, 9, 'MASTER OPERO', 'opero@difam.it', 'imaps.aruba.it', 993, 'smtps.aruba.it', 465, 'opero@difam.it', 'f81446d0c7962f09e7943e078a4b3d8e:23a954fcae2bfe75fc7cbc1c8dc64932'),
(13, 1, NULL, 'Opero Gestionale', 'info@difam.it', 'imaps.difam.it', 993, 'smtps.aruba.it', 465, 'info@difam.it', 'ed74345a3f1b04e5f5d5386b1b9f526e:4f94b009dde529557be409f55196fbf1');

-- --------------------------------------------------------

--
-- Struttura della tabella `ditte`
--

CREATE TABLE `ditte` (
  `id` int(11) NOT NULL,
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
(6, 'Prova Admin Cliente', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'prova@prova.it', NULL, NULL, NULL, NULL, NULL, 1, 2, NULL, 'C', NULL, NULL, NULL, 1, NULL),
(7, 'punto_vendita_prova', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'puntovendita@prova.it', NULL, NULL, NULL, NULL, NULL, 1, 2, NULL, 'P', NULL, NULL, NULL, 1, 203),
(8, 'DITTA PROVA CLIENTE FORNITORE', NULL, 'VIA NOSTRA', 'NOSTRA', 'NS', '87010', '0981', '0982', 'INFO@CEDIBEF.COM', '', '', '0000000', '0125025693', '01205', 1, NULL, NULL, 'E', NULL, NULL, NULL, 1, NULL),
(12, 'CARAMELLE SALATE', NULL, 'DEI DOLCI', 'SULMONA', 'DC', '87010', '0152', '155', 'INFO@CEDIBEF.COM', '', 'cliedemo@pec.it', '0000001', '0125205269', '0122640', 1, NULL, NULL, 'E', NULL, NULL, NULL, 1, NULL),
(13, 'DITTA SALATI TUTTI', NULL, 'VIA DEI SALATINI', 'SALTO', 'SS', '90878', '098198025', '093', 'INFO@CEDIBEF.COM', '', NULL, '0000000', '0102512554', '0125002541', 1, NULL, NULL, 'E', NULL, NULL, NULL, 1, NULL),
(14, 'SALATI E DOLCI', NULL, 'DEI GUSTI', 'GUSTOSA', 'GS', '75000', '02555', '0255', 'A@LIBERO.IT', '', NULL, '0000000', '01245454', '0213313', 1, NULL, NULL, 'C', NULL, NULL, NULL, 1, NULL),
(15, 'SARACENARE EXPORT', NULL, 'VIA MAZZINI', 'SARACENA', 'CS', '87010', '098134463', '0985233', 'TRI@TE.IT', '', NULL, '', '0102555', '02692', 1, NULL, NULL, 'F', NULL, 27, NULL, 1, NULL),
(16, 'CAROFIGLIO SPA', NULL, 'FIGLINE', 'FIGLINE VIGLIATURAO', 'FG', '87100', '02255', '02555', 'CARMO@FIOR.IT', '', NULL, '', '55656565', '3299', 1, NULL, NULL, 'E', NULL, NULL, NULL, 1, NULL),
(17, 'PROVA DITTA 2', NULL, 'prova', 'provolino', 'pr', '87410', '012', '088', 'eee@fr.it', '', NULL, NULL, '09999', '87899', 1, 2, NULL, 'E', NULL, NULL, NULL, 1, NULL),
(18, 'prima prova di 3', NULL, 'entram', 'entr', 'cs', '85200', '022', '022', 'ang@opero.it', '', NULL, NULL, '021212121', '01212121', 1, 2, NULL, 'E', NULL, NULL, NULL, 1, NULL);

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
(1, 50),
(2, 20),
(2, 30),
(2, 50),
(3, 10),
(3, 20),
(3, 30);

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

--
-- Dump dei dati per la tabella `email_inviate`
--

INSERT INTO `email_inviate` (`id`, `id_utente_mittente`, `destinatari`, `cc`, `bcc`, `oggetto`, `corpo`, `data_invio`, `aperta`, `data_prima_apertura`, `tracking_id`) VALUES
(1, 6, 'angbrunosa@gmai.com', NULL, NULL, 'ciao', NULL, '2025-07-25 19:13:04', 0, NULL, '974c346a-4882-4b6e-94a3-a1aa09163788'),
(2, 6, 'angbrunosa@gmail.com', NULL, NULL, 'saluti ciao', NULL, '2025-07-25 19:14:35', 0, NULL, '41785fd2-96f9-478a-b681-7fa3029e9314'),
(3, 6, 'info@difam.it', NULL, NULL, 'mail di prova con allegato', NULL, '2025-07-25 19:17:39', 1, '2025-07-25 19:18:06', 'c2649c3d-f649-4ecc-9d85-be58012cb4fa'),
(4, 6, 'angbrunosa@gmail.com', NULL, NULL, 'saluti', NULL, '2025-07-25 19:33:22', 0, NULL, '70d47b45-d95a-4f61-b5f4-d7ad47812dad'),
(5, 6, 'info@difam.it', NULL, NULL, 'saluti', NULL, '2025-07-25 19:34:56', 1, '2025-07-25 19:36:55', 'f48d8199-0fd0-4ae6-b4c9-66f6d644268e'),
(6, 6, 'info@difam.it', NULL, NULL, 'ciao senza allegati', NULL, '2025-07-25 19:36:42', 1, '2025-07-25 19:37:13', 'c1d66b26-69d1-491d-a42c-59e98d17206d'),
(7, 4, 'angbrunosa@gmail.com', NULL, NULL, 'Re: Re: controlla l\'allegato', NULL, '2025-07-26 08:26:14', 0, NULL, '48296042-da48-4fae-8aa3-0766026518a9'),
(8, 9, 'angbrunosa@gmail.com', NULL, NULL, '21', NULL, '2025-07-26 08:38:30', 0, NULL, '042ecc50-8616-4b21-a84b-a76c13256af4'),
(9, 6, 'info@difam.it', NULL, NULL, 'saluti', NULL, '2025-07-26 09:32:53', 0, NULL, '2e85f514-3703-489e-b961-f309cd32f794'),
(10, 10, 'angbrunosa@gmail.com', NULL, NULL, 'saltu', NULL, '2025-07-26 19:05:49', 0, NULL, '7e32d264-08d3-4f59-8852-b982ce0b215d'),
(11, 10, 'angbrunosa@gmail.com', NULL, NULL, 'riepilogo', NULL, '2025-07-30 14:15:10', 0, NULL, 'e019b2ce-3e9b-4347-a706-cfd0ad21a8a7'),
(12, 10, 'angbrunosa@gmail.com', NULL, NULL, 'iscrizione opero_ab', NULL, '2025-07-30 14:46:13', 0, NULL, '1f1a67ad-58c1-4376-a592-c7505c84b723'),
(13, 9, 'angbrunosa@gmail.com', NULL, NULL, 'ciao', NULL, '2025-08-05 17:28:50', 0, NULL, '92c4fdf3-edea-4d93-8a9d-28482a4a5f35'),
(15, 4, 'angbrunosa@gmail.com', NULL, NULL, 'òòò\\', NULL, '2025-08-06 15:53:08', 0, NULL, 'f067fc99-9a17-4017-be45-789f848445b2'),
(16, 10, 'angbrunosa@gmail,com', NULL, NULL, 'saluti', NULL, '2025-08-06 15:54:36', 0, NULL, '13de43d1-9707-4eb1-bb03-47d18625a6de'),
(17, 10, 'angbrunosa@gmail.com', NULL, NULL, 'saluti', NULL, '2025-08-06 15:58:54', 0, NULL, 'cd943cb1-e22b-443f-937f-6e7447769ea3'),
(18, 4, 'angbrunosa@gmail.com', NULL, NULL, 'klklkl', NULL, '2025-08-06 16:18:15', 0, NULL, 'edf1c0c0-40c7-4c4b-be68-36d880fa2790'),
(19, 4, 'angbrunosa@gmail.com', NULL, NULL, 'kp', NULL, '2025-08-06 18:15:42', 0, NULL, '79f1d8b3-894b-4726-9c2d-82107da3b0b3'),
(20, 10, 'angbrunosa@gmail.com', NULL, NULL, 'saluti d aopero', NULL, '2025-08-08 10:08:08', 0, NULL, ''),
(23, 10, 'angbrunosa@gmail.com', NULL, NULL, 'saluti', NULL, '2025-08-08 10:30:10', 0, NULL, 'c8a053f3-a605-4aa0-8ca1-51dd682ca47e'),
(24, 10, 'angbrunosa@gmail.com', NULL, NULL, 'sa', NULL, '2025-08-08 10:33:36', 0, NULL, '8c7736a1-a472-49ee-9f40-39eb0b49b350'),
(25, 10, 'angbrunosa@gmail.com', NULL, NULL, 'cisualizza', NULL, '2025-08-08 10:42:32', 1, '2025-08-08 10:44:21', '6c1d90f2-b09f-45b4-bd56-7af521bbedab'),
(26, 10, 'postmaster@cedibef.com', NULL, NULL, 'dddl', NULL, '2025-08-08 10:45:40', 1, '2025-08-08 10:46:13', 'e56c0c22-95c6-45fb-83b0-a5f6bf08e67d'),
(27, 10, 'angbrunosa@gmail.com', NULL, NULL, 'sòlal', NULL, '2025-08-08 10:53:30', 0, NULL, '0ab613a8-f1b4-470d-be9b-203f477609aa'),
(28, 10, 'postmaster@cedibef.com', NULL, NULL, 'saaa', NULL, '2025-08-08 10:55:53', 1, '2025-08-08 10:56:13', '098344cf-15b7-4446-aef1-fb1a82647fc1'),
(29, 10, 'postmaster@cedibef.com', NULL, NULL, 'dldld', NULL, '2025-08-08 10:58:01', 1, '2025-08-08 10:59:35', 'dfcae428-2cf4-4399-897e-c3f4f92ae796'),
(30, 10, 'postmaster@cedibef.com', NULL, NULL, 'dldld', NULL, '2025-08-08 10:58:11', 1, '2025-08-08 10:58:23', '2a53a043-f221-4fe7-95b8-41f3a95fb13b'),
(31, 10, 'angbrunosa@gmail.com', NULL, NULL, 'dff', NULL, '2025-08-08 11:00:26', 0, NULL, '2bec09ef-18d8-458b-b3d9-55fbc120cfa9'),
(32, 10, 'angbrunosa@gmail.com', NULL, NULL, 'saluti 1 ', NULL, '2025-08-08 11:25:54', 0, NULL, 'b5f0edbe-a8c2-4c20-9cd4-76e4fbb78524'),
(33, 10, 'angbrunosa@gmail.com', NULL, NULL, 'ciao', NULL, '2025-08-08 11:30:31', 0, NULL, '9f7dafcd-243d-4622-9041-ef2a493b3a84'),
(34, 10, 'luca.cicioce@gmail.com ', NULL, NULL, 'prova mail opero', NULL, '2025-08-08 18:53:54', 1, '2025-08-08 19:13:21', 'e60188fc-c2e5-4319-980c-831ad081a025'),
(35, 10, 'info@difam.it', NULL, NULL, 'saluti', NULL, '2025-08-08 19:03:40', 0, NULL, '042fbf1a-8fd6-40d8-80f2-ce09c0f90cae'),
(36, 10, 'info@difam.it', NULL, NULL, 'seconda prova', 'eee', '2025-08-08 19:04:31', 0, NULL, 'da3313a3-9287-4bf4-974c-a9745045bceb'),
(37, 10, 'angbrunosa@gmail.com', NULL, NULL, 'prova invio cop', NULL, '2025-08-08 19:11:41', 0, NULL, '404da3a0-cfc9-4c9e-aeb3-a68fea618979'),
(38, 10, 'angbrunosa@gmail.com', NULL, NULL, 'terzo invio', NULL, '2025-08-08 19:12:29', 0, NULL, 'ca13300f-fa2e-4979-b172-2e2eada6a503'),
(39, 10, 'angbrunosa@gmail.com', NULL, NULL, 'llld terzo', '<p><br></p><p><br></p><p>dott. Ansagelo Bruno opero il gestionale che opera per te</p>', '2025-08-08 19:14:45', 0, NULL, '2d942a62-f863-4014-aee7-792df11e0596'),
(40, 10, 'mimmaforte@gmail.com', NULL, NULL, 'saluti da Pietro', '<p>Ciao Nonna ricordati che ho fame e che tra poco salgo.</p><p>Ciao</p><p><br></p><p>PS anche zio ha Fame</p><p><br></p><p>dott. Angelo Bruno opero il gestionale che opera per te</p>', '2025-08-09 11:05:49', 0, NULL, 'f323ac4a-846b-48f9-aa7b-c3e233878306'),
(41, 10, 'angbrunosa@gmail.com', NULL, NULL, 'video', '<p><br></p><p><br></p><p>dott. Angelo Bruno opero il gestionale che opera per te</p>', '2025-08-09 16:05:11', 0, NULL, '259b91bd-990e-4604-a489-06d868ba2df2'),
(42, 3, 'angbrunosa@gmail.com', NULL, NULL, 'saluti da opero', '<p>saluti</p>', '2025-08-20 11:23:29', 0, NULL, '857ecc1a-7e91-44ad-b889-13b4519bf376'),
(43, 3, 'angbrunosa@gmail.com', NULL, NULL, 'Re: Re: saluti da opero', '<p>con molto entusiamso</p><p><br></p><p><em>Il 20/08/2025, 13:35:36, \"Angelo Bruno\"  ha scritto:</em></p><blockquote>anche a te</blockquote><blockquote>____________________________________________________________</blockquote><blockquote>Dott. Angelo Bruno</blockquote><blockquote>c.da Soda ,5</blockquote><blockquote>87010 Saracena CS</blockquote><blockquote>Cell. +39 3356738658</blockquote><blockquote>Ph. 098134463, fax 0981349501</blockquote><blockquote><br></blockquote><blockquote><br></blockquote><blockquote><img src=\"http://www.cedibef.com/csv/logo.jpg\" height=\"31\" width=\"200\"></blockquote><blockquote class=\"ql-align-justify\"><strong style=\"color: black;\">Nota di riservatezza</strong><span style=\"color: black;\">:&nbsp;il presente messaggio, allegati inclusi, è personale, ed è rivolto unicamente alla persona cui è&nbsp;indirizzato. Chiunque ricevesse questo messaggio per errore o comunque lo leggesse senza esserne legittimato è avvertito&nbsp;che&nbsp;trattenerlo, copiarlo, divulgarlo o distribuirlo a persone diverse dal destinatario è severamente&nbsp;&nbsp;proibito, sia&nbsp;ai sensi dell\'art. 616 c.p. che del Regolamento Europeo 2016/679 ed è&nbsp;pregato di&nbsp;rinviarlo immediatamente al mittente distruggendone l\'originale. Grazie.</span></blockquote><blockquote class=\"ql-align-justify\"><span style=\"color: black;\">&nbsp;</span></blockquote><blockquote class=\"ql-align-justify\"><strong style=\"color: black;\">Confidentially note</strong><span style=\"color: black;\">: this&nbsp;message, including&nbsp;all&nbsp;attachments,&nbsp;is confidential and&nbsp;is&nbsp;intended&nbsp;for&nbsp;the&nbsp;addressee (s)&nbsp;only. If&nbsp;anyone receives this message by mistake or reads it&nbsp;without&nbsp;entitlement is forewarned that keeping, copying, disseminating or distributing&nbsp;it&nbsp;to people&nbsp;other than the addressee(s) is strictly forbidden in compliance with European Personal Data Protection Code 2016/679 and is asked to transmit to the sender and to erase the original&nbsp;received.&nbsp;Thank you.</span></blockquote><blockquote class=\"ql-align-justify\"><span style=\"color: black;\">&nbsp;</span></blockquote><blockquote class=\"ql-align-justify\"><span style=\"color: black;\">Sebbene la presente E-Mail sia da ritenersi&nbsp;non infetta da virus ed altri difetti,&nbsp;è&nbsp;dovere del destinatario assicurarsi&nbsp;dell\'assenza di virus.Angelo Bruno non&nbsp;si&nbsp;assume&nbsp;pertanto alcuna responsabilità in caso di danni o perdite di dati.</span></blockquote><blockquote>&nbsp;</blockquote><blockquote><br></blockquote><blockquote><br></blockquote><blockquote>Il giorno mer 20 ago 2025 alle ore 13:23 Angelo Bruno &lt;<a href=\"mailto:opero@difam.it\" rel=\"noopener noreferrer\" target=\"_blank\">opero@difam.it</a>&gt; ha scritto:</blockquote><blockquote>saluti</blockquote><blockquote><strong>Allegati:</strong></blockquote><ul><li><a href=\"http://localhost:3001/api/track/download/c2d5c473-b3cb-432d-8b62-531bd8bf17de\" rel=\"noopener noreferrer\" target=\"_blank\">BACCALA.jfif</a></li></ul><blockquote><img src=\"http://localhost:3001/api/track/open/857ecc1a-7e91-44ad-b889-13b4519bf376\" height=\"1\" width=\"1\"></blockquote><blockquote><a href=\"http://www.avg.com/email-signature?utm_medium=email&amp;utm_source=link&amp;utm_campaign=sig-email&amp;utm_content=emailclient\" rel=\"noopener noreferrer\" target=\"_blank\"><img src=\"https://s-install.avcdn.net/ipm/preview/icons/icon-envelope-tick-green-avg-v1.png\" height=\"29\" width=\"46\"></a>Privo di virus.<a href=\"http://www.avg.com/email-signature?utm_medium=email&amp;utm_source=link&amp;utm_campaign=sig-email&amp;utm_content=emailclient\" rel=\"noopener noreferrer\" target=\"_blank\" style=\"color: rgb(68, 83, 234);\">www.avg.com</a><a href=\"#m_-2312977726257523537_DAB4FAD8-2DD7-40BB-A1B8-4E2AA1F9FDF2\" rel=\"noopener noreferrer\" target=\"_blank\"> </a></blockquote>', '2025-08-20 11:39:58', 0, NULL, 'aee761df-0229-442d-ae4a-bb0f61068f00'),
(44, 3, 'opero@difam.it', NULL, NULL, 'saluti da me stesso', '<p>me lo lasci dire</p>', '2025-08-20 11:41:11', 0, NULL, 'df17fa7c-f0f0-4d4b-80e0-11b16b2cd6ac'),
(45, 3, 'opero@difam.it', NULL, NULL, 'Re: saluti da me stesso', '<p><br></p><p>e lo dica</p><p><em>Il 20/08/2025, 13:41:11, \"Angelo Bruno\"  ha scritto:</em></p><blockquote>me lo lasci dire</blockquote><blockquote><strong>Allegati:</strong></blockquote><ul><li><a href=\"http://localhost:3001/api/track/download/012594b2-c096-48e1-a491-d5ff625f500c\" rel=\"noopener noreferrer\" target=\"_blank\">Istituto-Denza-google-maps-1.png</a></li></ul><blockquote><img src=\"http://localhost:3001/api/track/open/df17fa7c-f0f0-4d4b-80e0-11b16b2cd6ac\" height=\"1\" width=\"1\"></blockquote><blockquote><a href=\"http://www.avg.com/email-signature?utm_medium=email&amp;utm_source=link&amp;utm_campaign=sig-email&amp;utm_content=emailclient\" rel=\"noopener noreferrer\" target=\"_blank\"><img src=\"https://s-install.avcdn.net/ipm/preview/icons/icon-envelope-tick-green-avg-v1.png\" height=\"29\" width=\"46\"></a>Privo di virus.<a href=\"http://www.avg.com/email-signature?utm_medium=email&amp;utm_source=link&amp;utm_campaign=sig-email&amp;utm_content=emailclient\" rel=\"noopener noreferrer\" target=\"_blank\" style=\"color: rgb(68, 83, 234);\">www.avg.com</a><a href=\"#DAB4FAD8-2DD7-40BB-A1B8-4E2AA1F9FDF2\" rel=\"noopener noreferrer\" target=\"_blank\"> </a></blockquote>', '2025-08-20 12:31:59', 0, NULL, '8b51576f-557b-4a78-aefe-4c3cde8cf22b'),
(51, 3, 'befretail@gmail.com', '', '', 'ddd', '<p>ddd</p>', '2025-08-20 13:47:54', 0, NULL, '95f671bd-ea3b-43d4-80f6-9580aca44ad0'),
(52, 3, 'master@opero.it', '', '', 'iscrizione a ditta', '<p>ecco il link  per poterti registrare come nostro utente </p><p><br></p><p>http://localhost:3000/register/7c7ee98f-d64f-4c7b-b6c4-face72c391b6</p>', '2025-08-20 15:18:35', 0, NULL, '8a80fbfb-3aeb-4b36-bb55-32ca8ff0f9b8'),
(53, 3, 'opero@difam.it', '', '', 'iscrizione', '<p><span style=\"background-color: rgb(255, 255, 255);\">http://localhost:3000/register/7c7ee98f-d64f-4c7b-b6c4-face72c391b6</span></p>', '2025-08-20 15:24:05', 0, NULL, 'c190742c-c3e7-4bfa-aa1e-a781a9c16b55'),
(57, 3, 'befretail@gmail.com', '', '', 'sss', '<p>ss</p>', '2025-08-20 15:37:24', 0, NULL, 'b3742363-8f9b-48d8-8a2a-62154503bac1'),
(59, 3, 'amministrazione@difam.it', '', '', '54546', '<p>1654564564</p>', '2025-08-20 17:10:40', 0, NULL, '7dfaf219-ac22-4666-bbd8-cb43c18c7876'),
(61, 3, 'h; befretail@gmail.com', '', '', 'h', '<p>h</p>', '2025-08-20 18:11:58', 0, NULL, 'c2e97b31-42ed-41ae-993b-5c9930fb7620'),
(63, 3, 'befretail@gmail.com', '', '', 'ddd', '<p>ccc</p>', '2025-08-21 15:00:12', 0, NULL, '1b81de2e-26ff-495e-9770-d38ab1dbb804'),
(65, 3, 'befretail@gmail.com', 'befretail@gmail.com', '', '00', '<p>2222</p>', '2025-08-21 15:02:04', 0, NULL, '10492445-0ff4-448c-9695-1235e5eeef30'),
(66, 3, 'angbrunosa@gmail.com', '', '', 'saluti', '<p><br></p>', '2025-08-21 19:53:48', 0, NULL, 'dfe864ae-fe3a-4765-874c-ff533eec1867'),
(68, 3, 'angbrunosa@gmail.com;  befretail@gmail.com; amministrazione@difam.it', '', '', 'prova list', '<p>salutissimi</p>', '2025-08-21 19:55:08', 0, NULL, 'b474d719-b19e-426d-a9e0-6f8748183457'),
(69, 31, 'angbrunosa@gmail.com', '', 'befretail@gmail.com', 'rappresentante', '<p>vi prego di voler illustrare la vostra idea allego la mia</p>', '2025-08-22 16:12:29', 0, NULL, '0dc414b3-13ff-428f-b07d-6fc326c5cb8f'),
(71, 3, 'angbrunosa@gmail.com', '', '', 'ok', '<p>visualizza</p>', '2025-08-23 19:06:18', 0, NULL, 'e4ac6d9f-124a-4073-9381-e11a0c459671'),
(73, 3, 'angbrunosa@gmail.com; info@example.com; ', '', '', 'SALUTI', '<p>SALUTI DA OPERO</p>', '2025-08-25 09:00:37', 0, NULL, '70a73d01-0999-4ad6-a39d-37f2d70fb264'),
(74, 3, 'angbrunosa@gmail.com', '', '', 'prova da locale', '<p>saluti</p>', '2025-09-06 11:27:10', 0, NULL, '46bb71fe-e807-4df7-af08-8075341d8fde');

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
(3, 6, '2025-08-20 16:46:53'),
(3, 9, '2025-08-26 18:14:00');

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
(26, 'PDC_VIEW', 'Visualizzazione del Piano dei Conti', 0, 'AMMINISTRAZIONE'),
(27, 'PDC_EDIT', 'Modifica e creazione voci del Piano dei Conti', 0, 'AMMINISTRAZIONE'),
(28, 'MAIL_ACCOUNTS_VIEW', 'Visualizza gli account email della ditta', 0, 'AMMINISTRAZIONE'),
(29, 'MAIL_ACCOUNTS_EDIT', 'crea e modifica gli account ditta', 0, 'AMMINISTRAZIONE'),
(30, 'UTENTI_CREATE', 'Permette di creare nuovi utenti', 0, 'AMMINISTRAZIONE'),
(31, 'UTENTI_EDIT', 'Permette di modificare i dati degli utenti', 0, 'AMMINISTRAZIONE'),
(32, 'AddressBookManager', 'gestione della rubrica \r\ncon liste di distribuzione', 1, 'MAIL'),
(34, 'RUBRICA_VIEW', 'Visualizza la rubrica aziendale', 1, 'RUBRICA'),
(35, 'RUBRICA_MANAGE', 'Crea e modifica contatti e liste di distribuzione', 0, 'RUBRICA'),
(36, 'PPA_MODULE', 'PERMETTE DI GESTIRE LA LOGICA E LO SPVILUPPO DEL PPA PROCEDURE PROCESSI AZIONI', 1, 'AMMINISTRAZIONE');

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
(11, '20250909155025_aggiungi_id_testata_a_sc_partite_aperte.js', 7, '2025-09-09 16:00:37');

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
(1, 0);

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
-- Struttura della tabella `lista_distribuzione_ditte`
--

CREATE TABLE `lista_distribuzione_ditte` (
  `id_lista` int(11) NOT NULL,
  `id_ditta` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `lista_distribuzione_ditte`
--

INSERT INTO `lista_distribuzione_ditte` (`id_lista`, `id_ditta`) VALUES
(3, 6),
(3, 7);

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
(2, 43);

-- --------------------------------------------------------

--
-- Struttura della tabella `liste_distribuzione`
--

CREATE TABLE `liste_distribuzione` (
  `id` int(11) NOT NULL,
  `id_ditta` int(11) NOT NULL,
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
(40, 'Posta', 'MAIL'),
(50, 'Rubrica', 'RUBRICA');

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
-- Struttura della tabella `ppa_azioni`
--

CREATE TABLE `ppa_azioni` (
  `ID` int(11) NOT NULL,
  `ID_Processo` int(11) NOT NULL,
  `NomeAzione` varchar(255) NOT NULL,
  `Descrizione` text DEFAULT NULL,
  `ID_RuoloDefault` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `ppa_azioni`
--

INSERT INTO `ppa_azioni` (`ID`, `ID_Processo`, `NomeAzione`, `Descrizione`, `ID_RuoloDefault`) VALUES
(1, 4, 'Verifica strutture di vendita', 'Nel corso del primo appuntamento nella sede del cliente, è essenziale verificare lo stato dei punti vendita.  Verificare qualità assortimento - adeguatezza del personale - formazione del personale- qualità e completezza delle attrezzature - ', 3),
(2, 4, 'verifiche logistiche', 'Verificare i luoghi di scarico merce\ndefinire modalità e orari \nattenzione particolare alla gestione di Fresco e Resi', 3),
(3, 5, 'Ricevimento Ordini', 'Elaborare con anticipo l\'ordine e verificare con il cliente la corretta ricezione - consigliare sostituzioni con prodotti del nostro assortimento strategico', 3),
(4, 5, 'verificare Puntualità pagamenti', 'ogni settimana verificare ricezione scaduti e in caso di mancato pagamento sollecitare ricezione e bloccare consegne', 2),
(5, 1, 'Contattare il responsabile azienda', 'Inviare prima email e concordare ora della telefonata', 3),
(6, 4, 'Assortimetno', 'Composizione Attuale\nN° Referenze\nReferenze per Reparto\n', 3),
(7, 6, 'Obbietti', 'Ripetere le misurazioni di ingresso\ne valutare le variazioni\n', 3),
(8, 6, 'Verifiche', 'Assortimento\nVendute in promozione\nAnalisi Andamento', 3),
(10, 1, 'stabilire consegna', 'Trovare accordo per la logista', 3),
(11, 2, 'Informazioni Consegna', 'concordare info consega', NULL),
(12, 8, 'verifica documenti', 'partita iva\niscrizione ccia\ndurc', 2),
(13, 9, 'Verifica Assortimento Iniziale', 'Numero referenze\nDistribuzione per reparti\n% fresco\n% Freddo\n% Detergenza\n% Alimentari secco\n% Bibite', 3),
(14, 9, 'Assortimento Continuativo', 'Verifiche puntuali trimestrali sullo sviluppo e mantenimento assortimento', 3),
(15, 9, 'Stagionali', 'Comunicazione al cliente dei prodotti Stagionali\nPrevisione di inseriemento con il cliente', 3),
(16, 12, 'controllo manuale', 'controllare la validita dei documenti', 3);

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

--
-- Dump dei dati per la tabella `ppa_istanzeazioni`
--

INSERT INTO `ppa_istanzeazioni` (`ID`, `ID_IstanzaProcedura`, `ID_Azione`, `ID_UtenteAssegnato`, `ID_Stato`, `DataScadenza`, `DataCompletamento`, `NoteSvolgimento`) VALUES
(1, 1, 1, 31, 1, NULL, NULL, NULL),
(2, 1, 2, 3, 4, NULL, NULL, ''),
(3, 1, 3, 6, 1, NULL, NULL, NULL),
(4, 1, 4, 6, 1, NULL, NULL, NULL),
(26, 5, 1, 31, 1, '2025-08-30', NULL, NULL),
(27, 5, 2, 9, 1, '2025-08-30', NULL, NULL),
(28, 5, 3, 3, 1, '2025-08-30', NULL, NULL),
(29, 5, 4, 43, 1, '2025-08-30', NULL, NULL),
(30, 5, 6, 9, 1, '2025-08-30', NULL, NULL),
(31, 5, 7, 9, 1, '2025-08-30', NULL, NULL),
(32, 5, 8, 31, 1, '2025-08-30', NULL, NULL),
(33, 6, 12, 31, 1, '2025-08-24', NULL, NULL),
(34, 7, 12, 31, 1, '2025-08-30', NULL, NULL),
(35, 8, 1, 31, 1, '2025-08-24', NULL, NULL),
(36, 8, 2, 3, 3, '2025-08-24', NULL, ''),
(37, 8, 6, 43, 1, '2025-08-24', NULL, NULL),
(38, 8, 3, 3, 1, '2025-08-24', NULL, NULL),
(39, 8, 4, 3, 1, '2025-08-24', NULL, NULL),
(40, 8, 7, 31, 1, '2025-08-24', NULL, NULL),
(41, 8, 8, 3, 1, '2025-08-24', NULL, NULL),
(42, 9, 13, 31, NULL, '2025-11-29', NULL, NULL),
(43, 9, 14, 3, NULL, '2025-11-29', NULL, NULL),
(44, 9, 15, 43, NULL, '2025-11-29', NULL, NULL),
(45, 10, 1, 31, NULL, '2025-10-30', NULL, NULL),
(46, 10, 2, 6, NULL, '2025-10-30', NULL, NULL),
(47, 10, 6, 1, NULL, '2025-10-30', NULL, NULL),
(48, 10, 3, 43, NULL, '2025-10-30', NULL, NULL),
(49, 10, 4, 3, NULL, '2025-10-30', NULL, NULL),
(50, 10, 7, 43, NULL, '2025-10-30', NULL, NULL),
(51, 10, 8, 6, NULL, '2025-10-30', NULL, NULL);

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

--
-- Dump dei dati per la tabella `ppa_istanzeprocedure`
--

INSERT INTO `ppa_istanzeprocedure` (`ID`, `ID_ProceduraDitta`, `ID_DittaTarget`, `ID_UtenteCreatore`, `DataInizio`, `DataPrevistaFine`, `DataConclusioneEffettiva`, `Stato`, `Esito`) VALUES
(1, 2, 6, 3, '2025-08-23 12:38:38', '2025-10-24', NULL, 'In Corso', NULL),
(5, 2, 7, 3, '2025-08-23 17:42:43', '2025-08-30', NULL, 'In Corso', NULL),
(6, 1, 6, 3, '2025-08-23 20:05:11', '2025-08-24', NULL, 'In Corso', NULL),
(7, 1, 6, 3, '2025-08-23 20:15:12', '2025-08-30', NULL, 'In Corso', NULL),
(8, 2, 6, 3, '2025-08-23 20:27:25', '2025-08-24', NULL, 'In Corso', NULL),
(9, 6, 6, 3, '2025-08-25 10:58:38', '2025-11-29', NULL, 'In Corso', NULL),
(10, 2, 14, 3, '2025-08-26 20:11:57', '2025-10-30', NULL, 'In Corso', NULL);

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

--
-- Dump dei dati per la tabella `ppa_procedureditta`
--

INSERT INTO `ppa_procedureditta` (`ID`, `ID_Ditta`, `ID_ProceduraStandard`, `NomePersonalizzato`, `Attiva`) VALUES
(1, 1, 1, 'Gruppo G%G spa ', 1),
(2, 1, 2, 'Nuovi Clienti Top', 1),
(3, 1, 3, 'prodotti venduti on line', 1),
(4, 1, 1, 'Verifica Documenti', 1),
(5, 1, 1, 'Tagliano Auto-FuoriGaranzia', 1),
(6, 1, 1, 'Gestione Cliente Associato', 1);

-- --------------------------------------------------------

--
-- Struttura della tabella `ppa_procedurestandard`
--

CREATE TABLE `ppa_procedurestandard` (
  `ID` int(11) NOT NULL,
  `CodiceProcedura` varchar(100) NOT NULL,
  `Descrizione` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `ppa_procedurestandard`
--

INSERT INTO `ppa_procedurestandard` (`ID`, `CodiceProcedura`, `Descrizione`) VALUES
(1, 'ONBOARDING_CLIENTE', 'Flusso standard per l\'acquisizione di un nuovo cliente'),
(2, 'GESTIONE_ORDINE', 'Flusso standard per la gestione di un ordine di vendita'),
(3, 'RIPARAZIONE_PRODOTTO', 'Flusso standard per la riparazione di un prodotto in garanzia');

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

--
-- Dump dei dati per la tabella `ppa_processi`
--

INSERT INTO `ppa_processi` (`ID`, `ID_ProceduraDitta`, `NomeProcesso`, `OrdineSequenziale`) VALUES
(1, 3, 'Stabilire contatto con Cliente - Email- Telefonico .', 0),
(2, 3, 'Verifica Consegna', NULL),
(3, 3, 'Contattare il Cliente per soluzione', 0),
(4, 2, 'Appuntamento con la Direzione ', 0),
(5, 2, 'Gestione Cliente dedicata per i primi 3 mesi', 0),
(6, 2, 'Valutazione stato ', 0),
(8, 1, 'prova 1', 0),
(9, 6, 'Gestione Assortimento', 0),
(10, 6, 'Gestione Promozioni', 0),
(11, 6, 'Amministrative', 0),
(12, 4, 'raccolta dati documeti', 0);

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
(4, 5, 'Team Procedura #5 - 23/08/2025', '2025-08-23 15:42:43'),
(5, 6, 'Team Procedura #6 - 23/08/2025', '2025-08-23 18:05:11'),
(6, 7, 'Team Procedura #7 - 23/08/2025', '2025-08-23 18:15:12'),
(7, 8, 'Team Procedura #8 - 23/08/2025', '2025-08-23 18:27:25'),
(8, 9, 'Team Procedura #9 - 25/08/2025', '2025-08-25 08:58:39'),
(9, 10, 'Team Procedura #10 - 26/08/2025', '2025-08-26 18:11:57');

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
(9, 43);

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
(20, 3, '1f54acda-2478-4b20-9dfc-513349d4004a', NULL, '2025-08-14 14:10:54', 1, '2025-08-14 14:10:03'),
(21, 1, '854c0e8e-29b9-4c8d-b3a9-d7faa2a6517a', NULL, '2025-08-26 18:17:11', 0, '2025-08-19 18:17:11'),
(22, 1, 'c763de5d-2ac2-4276-a569-77698a27e7de', NULL, '2025-08-26 18:24:08', 0, '2025-08-19 18:24:08'),
(23, 1, '65b22eb5-b3b6-4ccd-ab5a-8fcdbc6b4cef', NULL, '2025-08-26 18:31:33', 0, '2025-08-19 18:31:33'),
(24, 1, '914c9081-c6a0-4710-aeef-227a74188c95', NULL, '2025-08-19 18:36:30', 1, '2025-08-19 18:35:32'),
(25, 1, '41f26b1a-8e9b-474d-983a-d6ff8e448b55', NULL, '2025-08-26 19:13:48', 0, '2025-08-19 19:13:48'),
(26, 1, '7c7ee98f-d64f-4c7b-b6c4-face72c391b6', NULL, '2025-08-27 15:17:07', 0, '2025-08-20 15:17:07');

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
(2, 26),
(2, 27),
(2, 28),
(2, 29),
(2, 30),
(2, 31),
(2, 32),
(2, 34),
(2, 35),
(2, 36),
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
  `tipo_funzione` enum('Primaria','Secondaria','Sistemistica','Finanziaria') NOT NULL DEFAULT 'Primaria' COMMENT 'Classificazione univoca della funzione contabile.',
  `attiva` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `sc_funzioni_contabili`
--

INSERT INTO `sc_funzioni_contabili` (`id`, `id_ditta`, `codice_funzione`, `nome_funzione`, `descrizione`, `categoria`, `tipo_funzione`, `attiva`, `created_at`, `updated_at`) VALUES
(9, 1, 'REG-FATT-ACQ', 'Registrazione Fattura Acquisto', 'Registra una fattura da fornitore, gestisce l\'IVA e crea la partita aperta nello scadenzario.', 'Acquisti', 'Finanziaria', 1, '2025-09-08 09:44:24', '2025-09-08 09:44:24'),
(11, 1, 'DARE_AVERE', 'DARE AVERE', 'questa funzione permette all\'utente di scegliere i conti ', 'Generale', 'Primaria', 1, '2025-09-08 14:09:00', '2025-09-08 14:09:00'),
(12, 1, 'REG-FATT-VENDITA', 'Registrazione Fattura Vendita', 'REGISTRAZIONE MANUALE FATTURA', 'Vendite', 'Finanziaria', 1, '2025-09-09 16:49:31', '2025-09-09 16:49:31'),
(13, 1, '', 'Versamento In banca ', 'registra le operazioni di giroconto dal conto cassa al conto Banca . L\'utente sceglierà il sottoconto della banca', NULL, 'Primaria', 1, '2025-09-11 08:17:51', '2025-09-11 08:17:51');

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

--
-- Dump dei dati per la tabella `sc_funzioni_contabili_righe`
--

INSERT INTO `sc_funzioni_contabili_righe` (`id`, `id_funzione_contabile`, `id_conto`, `tipo_movimento`, `descrizione_riga_predefinita`, `is_sottoconto_modificabile`, `created_at`, `updated_at`) VALUES
(69, 12, 7, 'D', '', 1, '2025-09-10 16:41:57', '2025-09-10 16:41:57'),
(70, 12, 17, 'A', '', 1, '2025-09-10 16:41:57', '2025-09-10 16:41:57'),
(71, 12, 25, 'A', '', 1, '2025-09-10 16:41:57', '2025-09-10 16:41:57'),
(91, 11, 9, 'A', '', 1, '2025-09-11 16:01:23', '2025-09-11 16:01:23'),
(92, 11, 10, 'D', '', 1, '2025-09-11 16:01:23', '2025-09-11 16:01:23'),
(93, 9, 20, 'D', 'Costo per acquisto merci/servizi', 1, '2025-09-11 16:01:45', '2025-09-11 16:01:45'),
(94, 9, 51, 'D', 'credito erario conto iva', 1, '2025-09-11 16:01:45', '2025-09-11 16:01:45'),
(95, 9, 15, 'A', 'debito verso fornitore', 1, '2025-09-11 16:01:45', '2025-09-11 16:01:45');

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

--
-- Dump dei dati per la tabella `sc_partite_aperte`
--

INSERT INTO `sc_partite_aperte` (`id`, `id_ditta_anagrafica`, `data_scadenza`, `importo`, `stato`, `created_at`, `updated_at`, `data_registrazione`, `id_registrazione_testata`) VALUES
(1, 15, '2025-09-11', 122.00, 'APERTA', '2025-09-09 16:38:31', '2025-09-09 16:38:31', '2025-09-09', 6),
(2, 15, '2025-09-10', 110.00, 'APERTA', '2025-09-09 16:43:12', '2025-09-09 16:43:12', '2025-09-09', 7);

-- --------------------------------------------------------

--
-- Struttura della tabella `sc_piano_dei_conti`
--

CREATE TABLE `sc_piano_dei_conti` (
  `id` int(11) NOT NULL,
  `id_ditta` int(11) NOT NULL,
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
(1, 1, '10', 'IMMOBILIZZAZIONI', NULL, 'Mastro', 'Attività', 0, '2025-08-25 06:40:32'),
(2, 1, '10.01', 'Immobilizzazioni materiali', 1, 'Conto', 'Attività', 0, '2025-08-25 06:40:32'),
(3, 1, '10.01.001', 'Fabbricati', 2, 'Sottoconto', 'Attività', 0, '2025-08-25 06:40:32'),
(4, 1, '10.01.002', 'Impianti e macchinari', 2, 'Sottoconto', 'Attività', 0, '2025-08-25 06:40:32'),
(5, 1, '20', 'ATTIVO CIRCOLANTE', NULL, 'Mastro', 'Attività', 0, '2025-08-25 06:40:32'),
(6, 1, '20.05', 'Crediti v/Clienti', 5, 'Conto', 'Attività', 0, '2025-08-25 06:40:32'),
(7, 1, '20.05.001', 'Clienti Italia', 6, 'Sottoconto', 'Attività', 0, '2025-08-25 06:40:32'),
(8, 1, '20.15', 'Disponibilità liquide', 5, 'Conto', 'Attività', 0, '2025-08-25 06:40:32'),
(9, 1, '20.15.001', 'Banca c/c', 8, 'Sottoconto', 'Attività', 0, '2025-08-25 06:40:32'),
(10, 1, '20.15.002', 'Cassa contanti', 8, 'Sottoconto', 'Attività', 0, '2025-08-25 06:40:32'),
(11, 1, '30', 'PATRIMONIO NETTO', NULL, 'Mastro', 'Patrimonio Netto', 0, '2025-08-25 06:40:32'),
(12, 1, '30.01', 'Capitale Sociale', 11, 'Conto', 'Patrimonio Netto', 0, '2025-08-25 06:40:32'),
(13, 1, '40', 'DEBITI', NULL, 'Mastro', 'Passività', 0, '2025-08-25 06:40:32'),
(14, 1, '40.05', 'Debiti v/Fornitori', 13, 'Conto', 'Passività', 0, '2025-08-25 06:40:32'),
(15, 1, '40.05.001', 'Fornitori Italia', 14, 'Sottoconto', 'Passività', 0, '2025-08-25 06:40:32'),
(16, 1, '40.10', 'Debiti Tributari', 13, 'Conto', 'Passività', 0, '2025-08-25 06:40:32'),
(17, 1, '40.10.001', 'Erario c/IVA', 16, 'Sottoconto', 'Passività', 0, '2025-08-25 06:40:33'),
(18, 1, '60', 'COSTI DELLA PRODUZIONE', NULL, 'Mastro', 'Costo', 0, '2025-08-25 06:40:33'),
(19, 1, '60.01', 'Acquisti', 18, 'Conto', 'Costo', 0, '2025-08-25 06:40:33'),
(20, 1, '60.01.001', 'Materie prime c/acquisti', 19, 'Sottoconto', 'Costo', 0, '2025-08-25 06:40:33'),
(21, 1, '60.05', 'Servizi', 18, 'Conto', 'Costo', 0, '2025-08-25 06:40:33'),
(22, 1, '60.05.001', 'Consulenze professionali', 21, 'Sottoconto', 'Costo', 0, '2025-08-25 06:40:33'),
(23, 1, '70', 'RICAVI DELLE VENDITE', NULL, 'Mastro', 'Ricavo', 0, '2025-08-25 06:40:33'),
(24, 1, '70.01', 'Ricavi', 23, 'Conto', 'Ricavo', 0, '2025-08-25 06:40:33'),
(25, 1, '70.01.001', 'Prodotti finiti c/vendite', 24, 'Sottoconto', 'Ricavo', 0, '2025-08-25 06:40:33'),
(26, 1, '20.05.002', 'SALATI E DOLCI', 6, 'Sottoconto', 'Attività', 0, '2025-08-25 08:41:13'),
(27, 1, '40.05.002', 'SARACENARE EXPORT', 14, 'Sottoconto', 'Passività', 0, '2025-08-25 08:45:17'),
(28, 1, '20.05.003', 'linux spa', 6, 'Sottoconto', 'Attività', 0, '2025-09-02 09:28:36'),
(29, 1, '40.05.003', 'linux spa', 14, 'Sottoconto', 'Passività', 0, '2025-09-02 09:28:36'),
(50, 1, '20.20', 'Crediti Erariali', 5, 'Conto', 'Attività', 0, '2025-09-09 15:26:57'),
(51, 1, '20.20.01', 'IVA A CREDITO', 50, 'Sottoconto', 'Attività', 0, '2025-09-09 15:27:47');

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
(17, 6, 51, 'IVA A CREDITO', 22.00, 0.00),
(18, 6, 20, 'Materie prime c/acquisti', 100.00, 0.00),
(19, 7, 27, 'Fornitori Italia', 0.00, 110.00),
(20, 7, 51, 'IVA A CREDITO', 10.00, 0.00),
(21, 7, 20, 'Materie prime c/acquisti', 100.00, 0.00);

-- --------------------------------------------------------

--
-- Struttura della tabella `sc_registrazioni_testata`
--

CREATE TABLE `sc_registrazioni_testata` (
  `id` int(11) NOT NULL,
  `id_ditta` int(11) NOT NULL,
  `id_utente` int(11) NOT NULL,
  `data_registrazione` date NOT NULL,
  `descrizione_testata` varchar(255) NOT NULL,
  `stato` enum('Provvisorio','Confermato','Annullato') DEFAULT 'Provvisorio',
  `data_creazione` timestamp NOT NULL DEFAULT current_timestamp(),
  `data_ultima_modifica` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `sc_registrazioni_testata`
--

INSERT INTO `sc_registrazioni_testata` (`id`, `id_ditta`, `id_utente`, `data_registrazione`, `descrizione_testata`, `stato`, `data_creazione`, `data_ultima_modifica`) VALUES
(6, 1, 3, '2025-09-09', 'Registrazione Fattura Acquisto', 'Confermato', '2025-09-09 16:38:31', '2025-09-09 16:38:31'),
(7, 1, 3, '2025-09-09', 'Registrazione Fattura Acquisto', 'Confermato', '2025-09-09 16:43:12', '2025-09-09 16:43:12');

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
(2, 21, 'Acquisti', '2025-09-09', '100', 15, 100.00, 10.00, 10.00);

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
(3, 32),
(3, 34),
(3, 36);

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
  `Codice_Tipo_Utente` int(11) DEFAULT NULL,
  `verification_token` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `utenti`
--

INSERT INTO `utenti` (`id`, `email`, `mail_contatto`, `mail_collaboratore`, `mail_pec`, `password`, `nome`, `cognome`, `codice_fiscale`, `telefono`, `indirizzo`, `citta`, `provincia`, `cap`, `id_ditta`, `id_ruolo`, `attivo`, `data_creazione`, `data_ultimo_accesso`, `note`, `firma`, `privacy`, `funzioni_attive`, `livello`, `Codice_Tipo_Utente`, `verification_token`) VALUES
(1, 'sysadmin@mia-azienda.it', 'sysadmin@mia-azienda.it', NULL, NULL, 'password_criptata_qui', 'System', 'Admin', NULL, NULL, NULL, NULL, NULL, NULL, 1, 3, 1, '2025-07-24 15:08:31', NULL, NULL, NULL, 0, NULL, 50, 1, NULL),
(2, 'mario.rossi@cliente-demo.it', 'mario.rossi@cliente-demo.it', NULL, NULL, 'password_criptata_qui', 'Mario', 'Rossi', NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 1, '2025-07-24 15:08:31', NULL, NULL, NULL, 0, NULL, 50, NULL, NULL),
(3, 'angbrunosa@gmail.com', 'angbrunosa@gmail.com', NULL, NULL, '$2b$10$JxllX3i7uL3CGpUunIoVSOdq1/zHxU9cckBYRXTPNBNbRz81lCXwC', 'Angelo ok', 'Bruno', NULL, NULL, NULL, NULL, NULL, NULL, 1, 2, 1, '2025-07-24 13:48:22', NULL, NULL, 'la mia firma', 0, NULL, 99, 1, NULL),
(4, 'info@difam.it', 'info@difam.it', NULL, NULL, '$2b$10$mDL.FXQ4GmIhthGlmLCRFOwv7FxAXCJkRqa0AqKI9GIogmP6fxmnK', 'francesco ', 'baggetta', 'brf', NULL, NULL, NULL, NULL, NULL, 3, 3, 1, '2025-07-24 18:34:46', NULL, NULL, 'dott. Francesco Baggetta Direttore Generale Confesercenti Calabria Servizi', 1, NULL, 50, NULL, NULL),
(5, 'admin@example.com', 'admin@example.com', NULL, NULL, '$2b$10$tbky/vlxsUxLcVHY1hY/YuJysH9mNaj7bFxxfVpFed1FYCMUMABWy', 'Angelo ', 'Bruno', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 4, 1, '2025-07-24 18:43:36', NULL, NULL, NULL, 0, NULL, 50, NULL, NULL),
(6, 'info@example.com', 'info@example.com', NULL, NULL, '$2b$10$TE4iHRvwQ1Wgabc6gq..z.MiVOf2Ypjp4ehAHl.aJdQINjeLN5owi', 'Angelo', 'Bruno', NULL, NULL, NULL, NULL, NULL, NULL, 1, 3, 1, '2025-07-25 18:03:06', NULL, NULL, 'dott. Angelo Bruno\nww', 0, NULL, 50, NULL, NULL),
(9, 'master@opero.it', 'master@opero.it', NULL, NULL, '$2b$10$yApw9swySOyQbtFCOC8TVOhPJTmrhIH0eDuVxc5H1WAGh0eAMFq6u', 'Master', 'Admin', NULL, 'uu', NULL, NULL, NULL, NULL, 1, 1, 1, '2025-07-25 19:58:14', NULL, NULL, 'Direzione Gestionale Opero.\nwww.operomeglio.it\n', 0, NULL, 50, NULL, NULL),
(10, 'provadmin@prova.it', 'provadmin@prova.it', NULL, NULL, '$2b$10$DrytCfOdmnOgEH7ISH86X.NFCep9OVxfII5w6dCHfcoX.BYWN0fCC', 'dott. Angelo', 'Bruno -Opero-GEST', NULL, NULL, NULL, NULL, NULL, NULL, 3, 3, 1, '2025-07-26 16:10:54', NULL, NULL, 'dott. Angelo Bruno\n\nopero il gestionale che opera per te', 0, NULL, 99, NULL, NULL),
(11, 'AngProva@provino.it', 'AngProva@provino.it', NULL, NULL, '$2b$10$dLb.wC/gRYtCmuISajM...LQ12V5oLd1c6aOZYGLw.wzfRw.kMqTu', 'angeloProva', 'BrunoProva', 's', NULL, NULL, NULL, NULL, NULL, 3, 4, 1, '2025-07-30 15:09:02', NULL, NULL, NULL, 1, NULL, 50, NULL, NULL),
(13, 'provaCOM@prova.it', 'provaCOM@prova.it', NULL, NULL, '$2b$10$C26/u3pagw9zt5TYoqgCGernyCIXjt/c9xj/47mRiV1EXtYOC0T16', 'PROVACOMPLETA', 'PROVACOMPLETA', 'BRNNGL76L21C349J', '098134463', 'VIA DEL CORSO2', 'PASSOLENTO', 'CS', NULL, 3, 3, 1, '2025-07-30 15:58:51', NULL, NULL, NULL, 1, NULL, 49, NULL, NULL),
(14, 'lucaprovadmin@prova.it', 'lucaprovadmin@prova.it', NULL, NULL, '$2b$10$XJOnOO3o.s5DtorcN7JWG.3IoOTgJIPDNeJ07HcxUOmqZz3K3PlDq', 'luca proca', 'cicone prova', 'lcvvnlsosos', '098135363', 'vico fioravanti', 'saracena', 'cs', NULL, 3, 3, 1, '2025-07-30 18:11:16', NULL, NULL, NULL, 1, NULL, 10, NULL, NULL),
(15, 'difamconsegne@gmail.com', 'difamconsegne@gmail.com', NULL, NULL, '$2b$10$xw6CzU2voWK5sIEGzUflU.6BIn3cq1W4347npwYBad8ARJuzDNKJy', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 1, '2025-08-07 12:22:28', NULL, NULL, NULL, 0, NULL, 50, NULL, NULL),
(16, 'postmaster@cedibef.com', 'postmaster@cedibef.com', NULL, NULL, '$2b$10$dNnNFQx.dfTl1ofrRe0HeOk8MwMfT03tzj3o8LUm89NBiTvgS5p7a', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 1, '2025-08-08 11:24:17', NULL, NULL, NULL, 0, NULL, 50, NULL, NULL),
(31, 'befretail@gmail.com', 'befretail@gmail.com', NULL, NULL, '$2b$10$JxllX3i7uL3CGpUunIoVSOdq1/zHxU9cckBYRXTPNBNbRz81lCXwC', 'Cavolo', 'A Fiore', NULL, 'oppido', 'mamertino', '', 'cs', '', 1, 3, 1, '2025-08-14 14:10:54', NULL, NULL, NULL, 1, NULL, NULL, NULL, NULL),
(32, 'opero@difam.it', 'opero@difam.it', NULL, NULL, '$2b$10$HzcHeKuF1/LE1/3UY4jxLOFHvETDChIGrIqyzAiUkNZZBN.820ggK', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 1, '2025-08-14 14:15:23', NULL, NULL, NULL, 0, NULL, 50, NULL, NULL),
(33, 'postmaster@difam.it', 'postmaster@difam.it', NULL, NULL, '$2b$10$9ti7YOjqWQKXUqbknXTtKOMLMCzTRCrBkv1YTzgpXSiGmgXnycYyK', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 1, '2025-08-14 14:58:32', NULL, NULL, NULL, 0, NULL, 50, NULL, NULL),
(34, 'provaadmin@prova.it', 'provaadmin@prova.it', NULL, NULL, '$2b$10$nu1x6jTlOh5Uv9uRUITC1OgrueRQboMJJHUy98TN6hjbz/jVoxI9q', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 1, '2025-08-15 18:54:22', NULL, NULL, NULL, 0, NULL, 50, NULL, NULL),
(35, 'befretail@gmai.com', 'befretail@gmai.com', NULL, NULL, '$2b$10$yHIhsE9kDtGZhwMC.3p82.sVZNMVR7FnfOBfabyQFLS4fWLL3k02q', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 1, '2025-08-15 20:53:29', NULL, NULL, NULL, 0, NULL, 50, NULL, NULL),
(36, 'master@oper.it', 'master@oper.it', NULL, NULL, '$2b$10$yWaTJtd1vXGdx.a1PPTnFOHfW6ct4RB0eJWmCWnDRc5oP3NpNRr4K', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 1, '2025-08-15 21:16:43', NULL, NULL, NULL, 0, NULL, 50, NULL, NULL),
(37, 'befretail@befretail.srl', 'befretail@befretail.srl', NULL, NULL, '$2b$10$hkxyH85TK4x3Nn.0OcfFX.zAkE4hCUqXWug00ZQz1egk5UgUwN03a', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 1, '2025-08-16 21:30:18', NULL, NULL, NULL, 0, NULL, 50, NULL, NULL),
(38, 'befretail@gmail.srl', 'befretail@gmail.srl', NULL, NULL, '$2b$10$i75f4L16LWzI6.UYxx7jRuhwsGmS1INZpWoaq2m7jUTr5IMAutq1q', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 1, '2025-08-16 21:31:07', NULL, NULL, NULL, 0, NULL, 50, NULL, NULL),
(39, 'befreatail@gmail.com', 'befreatail@gmail.com', NULL, NULL, '$2b$10$NM6C65gA02ffDqpb30/3xuhkTUZet9yQ9ThL/Oa7jxkYzg1b4J0Zu', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 1, '2025-08-17 18:43:52', NULL, NULL, NULL, 0, NULL, 50, NULL, NULL),
(43, 'amministrazione@difam.it', 'amministrazione@difam.it', NULL, NULL, '$2b$10$.OPBEp3K0Z2Lqw5u81/lhO21U1iBqusAh2PpAAPU4mXI5vi.ZT7la', 'Angelo-Amministrazione', 'Bruno-Amministrazione', 'profrold', '3356738658', 'Cda Soda, 4', 'Saracena', NULL, '87010', 1, 2, 1, '2025-08-19 16:36:30', NULL, 'bellissimo', NULL, 1, NULL, 93, 1, NULL),
(46, 'dantoniomaria70@gmail.com', 'dantoniomaria70@gmail.com', NULL, NULL, 'password_provvisoria', 'a', 's', NULL, '3356738658', NULL, NULL, NULL, NULL, 1, 4, 0, '2025-08-21 15:03:34', NULL, NULL, NULL, 0, NULL, 0, 2, NULL),
(47, 'carmicol@libero.it', 'carmicol@libero.it', NULL, NULL, 'password_provvisoria', 'carmine', 'colautti', NULL, '098134463', NULL, NULL, NULL, NULL, 1, 4, 0, '2025-08-21 15:12:08', NULL, NULL, NULL, 0, NULL, 0, 2, NULL);

--
-- Indici per le tabelle scaricate
--

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
  ADD UNIQUE KEY `codice` (`codice`),
  ADD KEY `fk_funzioni_moduli` (`chiave_componente_modulo`);

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
-- Indici per le tabelle `libro_giornale`
--
ALTER TABLE `libro_giornale`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_ditta` (`id_ditta`),
  ADD KEY `id_sottoconto_dare` (`id_sottoconto_dare`),
  ADD KEY `id_sottoconto_avere` (`id_sottoconto_avere`),
  ADD KEY `id_utente_inserimento` (`id_utente_inserimento`);

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
-- Indici per le tabelle `sottoconti`
--
ALTER TABLE `sottoconti`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codice` (`codice`,`id_conto`,`id_ditta`),
  ADD KEY `id_ditta` (`id_ditta`),
  ADD KEY `id_conto` (`id_conto`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT per la tabella `ditte`
--
ALTER TABLE `ditte`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT per la tabella `email_inviate`
--
ALTER TABLE `email_inviate`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=75;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

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
-- AUTO_INCREMENT per la tabella `knex_migrations`
--
ALTER TABLE `knex_migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT per la tabella `knex_migrations_lock`
--
ALTER TABLE `knex_migrations_lock`
  MODIFY `index` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT per la tabella `libro_giornale`
--
ALTER TABLE `libro_giornale`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `liste_distribuzione`
--
ALTER TABLE `liste_distribuzione`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

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
  MODIFY `codice` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT per la tabella `pagamenti`
--
ALTER TABLE `pagamenti`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `ppa_azioni`
--
ALTER TABLE `ppa_azioni`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT per la tabella `ppa_istanzeazioni`
--
ALTER TABLE `ppa_istanzeazioni`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT per la tabella `ppa_istanzeprocedure`
--
ALTER TABLE `ppa_istanzeprocedure`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT per la tabella `ppa_procedureditta`
--
ALTER TABLE `ppa_procedureditta`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT per la tabella `ppa_procedurestandard`
--
ALTER TABLE `ppa_procedurestandard`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT per la tabella `ppa_processi`
--
ALTER TABLE `ppa_processi`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT per la tabella `ppa_stati_azione`
--
ALTER TABLE `ppa_stati_azione`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT per la tabella `ppa_team`
--
ALTER TABLE `ppa_team`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

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
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT per la tabella `sc_funzioni_contabili_righe`
--
ALTER TABLE `sc_funzioni_contabili_righe`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=96;

--
-- AUTO_INCREMENT per la tabella `sc_movimenti_iva`
--
ALTER TABLE `sc_movimenti_iva`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `sc_partite_aperte`
--
ALTER TABLE `sc_partite_aperte`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT per la tabella `sc_piano_dei_conti`
--
ALTER TABLE `sc_piano_dei_conti`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT per la tabella `sc_registrazioni_righe`
--
ALTER TABLE `sc_registrazioni_righe`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT per la tabella `sc_registrazioni_testata`
--
ALTER TABLE `sc_registrazioni_testata`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT per la tabella `sc_registri_iva`
--
ALTER TABLE `sc_registri_iva`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

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
  ADD CONSTRAINT `fk_ditte_relazioni` FOREIGN KEY (`codice_relazione`) REFERENCES `relazioni_ditta` (`codice`),
  ADD CONSTRAINT `fk_ditte_sottoconto_cliente` FOREIGN KEY (`id_sottoconto_cliente`) REFERENCES `sc_piano_dei_conti` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_ditte_sottoconto_fornitore` FOREIGN KEY (`id_sottoconto_fornitore`) REFERENCES `sc_piano_dei_conti` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_ditte_sottoconto_puntovendita` FOREIGN KEY (`id_sottoconto_puntovendita`) REFERENCES `sc_piano_dei_conti` (`id`) ON DELETE SET NULL;

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
-- Limiti per la tabella `funzioni`
--
ALTER TABLE `funzioni`
  ADD CONSTRAINT `fk_funzioni_moduli` FOREIGN KEY (`chiave_componente_modulo`) REFERENCES `moduli` (`chiave_componente`) ON DELETE SET NULL ON UPDATE CASCADE;

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
-- Limiti per la tabella `lista_distribuzione_ditte`
--
ALTER TABLE `lista_distribuzione_ditte`
  ADD CONSTRAINT `lista_distribuzione_ditte_ibfk_1` FOREIGN KEY (`id_lista`) REFERENCES `liste_distribuzione` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `lista_distribuzione_ditte_ibfk_2` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE;

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
  ADD CONSTRAINT `liste_distribuzione_ibfk_1` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE;

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
  ADD CONSTRAINT `ppa_istanzeazioni_ibfk_2` FOREIGN KEY (`ID_Azione`) REFERENCES `ppa_azioni` (`ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `ppa_istanzeazioni_ibfk_3` FOREIGN KEY (`ID_UtenteAssegnato`) REFERENCES `utenti` (`id`),
  ADD CONSTRAINT `ppa_istanzeazioni_ibfk_4` FOREIGN KEY (`ID_Stato`) REFERENCES `ppa_stati_azione` (`ID`);

--
-- Limiti per la tabella `ppa_istanzeprocedure`
--
ALTER TABLE `ppa_istanzeprocedure`
  ADD CONSTRAINT `ppa_istanzeprocedure_ibfk_1` FOREIGN KEY (`ID_ProceduraDitta`) REFERENCES `ppa_procedureditta` (`ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `ppa_istanzeprocedure_ibfk_2` FOREIGN KEY (`ID_DittaTarget`) REFERENCES `ditte` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ppa_istanzeprocedure_ibfk_3` FOREIGN KEY (`ID_UtenteCreatore`) REFERENCES `utenti` (`id`);

--
-- Limiti per la tabella `ppa_procedureditta`
--
ALTER TABLE `ppa_procedureditta`
  ADD CONSTRAINT `ppa_procedureditta_ibfk_1` FOREIGN KEY (`ID_Ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ppa_procedureditta_ibfk_2` FOREIGN KEY (`ID_ProceduraStandard`) REFERENCES `ppa_procedurestandard` (`ID`) ON DELETE CASCADE;

--
-- Limiti per la tabella `ppa_processi`
--
ALTER TABLE `ppa_processi`
  ADD CONSTRAINT `ppa_processi_ibfk_1` FOREIGN KEY (`ID_ProceduraDitta`) REFERENCES `ppa_procedureditta` (`ID`) ON DELETE CASCADE;

--
-- Limiti per la tabella `ppa_stati_azione`
--
ALTER TABLE `ppa_stati_azione`
  ADD CONSTRAINT `ppa_stati_azione_ibfk_1` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE;

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
-- Limiti per la tabella `sc_funzioni_contabili`
--
ALTER TABLE `sc_funzioni_contabili`
  ADD CONSTRAINT `sc_funzioni_contabili_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `sc_funzioni_contabili_righe`
--
ALTER TABLE `sc_funzioni_contabili_righe`
  ADD CONSTRAINT `sc_funzioni_contabili_righe_id_funzione_contabile_foreign` FOREIGN KEY (`id_funzione_contabile`) REFERENCES `sc_funzioni_contabili` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `sc_partite_aperte`
--
ALTER TABLE `sc_partite_aperte`
  ADD CONSTRAINT `sc_partite_aperte_id_ditta_anagrafica_foreign` FOREIGN KEY (`id_ditta_anagrafica`) REFERENCES `ditte` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `sc_piano_dei_conti`
--
ALTER TABLE `sc_piano_dei_conti`
  ADD CONSTRAINT `sc_piano_dei_conti_ibfk_1` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE,
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
  ADD CONSTRAINT `sc_registrazioni_testata_ibfk_1` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sc_registrazioni_testata_ibfk_2` FOREIGN KEY (`id_utente`) REFERENCES `utenti` (`id`);

--
-- Limiti per la tabella `sc_registri_iva`
--
ALTER TABLE `sc_registri_iva`
  ADD CONSTRAINT `sc_registri_iva_ibfk_1` FOREIGN KEY (`id_riga_registrazione`) REFERENCES `sc_registrazioni_righe` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sc_registri_iva_ibfk_2` FOREIGN KEY (`id_anagrafica`) REFERENCES `ditte` (`id`) ON DELETE SET NULL;

--
-- Limiti per la tabella `sottoconti`
--
ALTER TABLE `sottoconti`
  ADD CONSTRAINT `sottoconti_ibfk_1` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sottoconti_ibfk_2` FOREIGN KEY (`id_conto`) REFERENCES `conti` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `tipi_pagamento`
--
ALTER TABLE `tipi_pagamento`
  ADD CONSTRAINT `tipi_pagamento_ibfk_1` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE;

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
  ADD CONSTRAINT `utenti_ibfk_1` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`),
  ADD CONSTRAINT `utenti_ibfk_2` FOREIGN KEY (`id_ruolo`) REFERENCES `ruoli` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
