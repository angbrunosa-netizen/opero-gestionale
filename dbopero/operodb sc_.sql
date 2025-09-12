-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Set 12, 2025 alle 10:03
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
-- AUTO_INCREMENT per la tabella `ditte`
--
ALTER TABLE `ditte`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

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
-- AUTO_INCREMENT per la tabella `utenti`
--
ALTER TABLE `utenti`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- Limiti per le tabelle scaricate
--

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
