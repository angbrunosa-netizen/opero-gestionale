-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Ott 03, 2025 alle 10:16
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
(15, 1, 'MERCI', 'PRODOTTI FISICI DI MAGAZZINO ', '001', 1, '2025-09-29 19:00:38', '2025-09-29 19:00:38', NULL),
(16, 1, 'FOOD', 'PRODOTTI ALIMENTARI', '001.001', 1, '2025-09-29 19:00:53', '2025-09-29 19:00:53', 15),
(17, 1, 'NO FOOD', 'NON ALIMENTARI', '001.002', 2, '2025-09-29 19:01:14', '2025-09-29 19:01:14', 15),
(18, 1, 'DEPERIBILI', 'ALIMENTARI DEPERIBILI', '001.001.001', 1, '2025-09-29 19:01:34', '2025-09-29 19:01:34', 16),
(19, 1, 'SERVIZI', 'SERVIZI AZIENDALI', '002', 2, '2025-09-29 19:07:17', '2025-09-29 19:07:17', NULL),
(20, 1, 'LAVORAZIONI', 'LAVORAZIONI ESEGUITE', '003', 3, '2025-09-29 19:07:35', '2025-09-29 19:07:35', NULL),
(21, 1, 'LIQUIDI', 'PRODOTTI LIQUIDI', '001.001.002', 2, '2025-09-30 17:18:23', '2025-09-30 17:18:23', 16),
(22, 1, 'DISPENSA', 'PRODOTTI DIPENSA', '001.001.003', 3, '2025-09-30 17:18:50', '2025-09-30 17:18:50', 16),
(24, 1, 'SURGELATI', 'PRODOTTI SURGELATI', '001.001.001.001', 1, '2025-09-30 17:19:44', '2025-09-30 17:19:44', 18),
(25, 1, 'FRESCHI', 'PRODOTTI FRESCHI', '001.001.001.002', 2, '2025-09-30 17:20:38', '2025-09-30 17:20:38', 18),
(26, 1, 'IGIENE CASA', 'IGIENE CASA', '001.002.001', 1, '2025-09-30 17:21:11', '2025-09-30 17:21:11', 17),
(29, 1, 'IGIENE PERSONA', 'IGIENE PERSONA', '001.002.002', 2, '2025-09-30 17:21:51', '2025-09-30 17:21:51', 17);

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
(6, 'Prova Admin Cliente', NULL, 'Cda Soda, 4', 'Saracena', 'CS', '87010', '3356738658', NULL, 'angbrunosa@gmail.com', '', NULL, '', 'aaaaaaaaaa', 'aaaa', 1, 2, NULL, 'C', NULL, NULL, NULL, 1, NULL),
(7, 'punto_vendita_prova', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'puntovendita@prova.it', NULL, NULL, NULL, NULL, NULL, 1, 2, NULL, 'P', NULL, NULL, NULL, 1, 203),
(8, 'DITTA PROVA CLIENTE FORNITORE', NULL, 'VIA NOSTRA', 'NOSTRA', 'NS', '87010', '0981', '0982', 'INFO@CEDIBEF.COM', '', NULL, '0000000', '0125025693', '01205', 1, NULL, NULL, 'F', NULL, NULL, NULL, 1, NULL),
(12, 'CARAMELLE SALATE cliente', NULL, 'DEI DOLCI', 'SULMONA', 'DC', '87010', '0152', '155', 'INFO@CEDIBEF.COM', '', 'cliedemo@pec.it', '0000001', '0125205269', '0122640', 1, NULL, NULL, 'E', 52, 53, NULL, 1, NULL),
(13, 'DITTA SALATI TUTTIfornitroe', NULL, 'VIA DEI SALATINI', 'SALTO', 'SS', '90878', '098198025', '093', 'INFO@CEDIBEF.COM', NULL, NULL, NULL, '0102512554', '0125002541', 1, NULL, NULL, 'F', NULL, NULL, NULL, 1, NULL),
(14, 'SALATI E DOLCI', NULL, 'DEI GUSTI', 'GUSTOSA', 'GS', '75000', '02555', '0255', 'A@LIBERO.IT', NULL, NULL, NULL, '01245454', '0213313', 1, NULL, NULL, 'C', NULL, NULL, NULL, 1, NULL),
(15, 'SARACENARE EXPORT', NULL, 'VIA MAZZINI', 'SARACENA', 'CS', '87010', '098134463', '0985233', 'TRI@TE.IT', NULL, NULL, NULL, '0102555', '02692', 1, NULL, NULL, 'F', NULL, 27, NULL, 1, NULL),
(16, 'CAROFIGLIO SPA', NULL, 'FIGLINE', 'FIGLINE VIGLIATURAO', 'FG', '87100', '02255', '02555', 'opero@difam.it', NULL, NULL, '', '55656565', '3299', 1, NULL, NULL, 'E', 54, 55, NULL, 1, NULL),
(17, 'PROVA DITTA 2 fornitore', NULL, 'prova', 'provolino', 'pr', '87410', '012', '088', 'eee@fr.it', NULL, NULL, NULL, '09999', '87899', 1, 2, NULL, 'C', NULL, NULL, NULL, 1, NULL),
(18, 'prima prova di 3 cliente', NULL, 'entram', 'entr', 'cs', '85200', '022', '022', 'ang@opero.it', NULL, NULL, NULL, '021212121', '01212121', 1, 2, NULL, 'C', NULL, NULL, NULL, 1, NULL);

--
-- Indici per le tabelle scaricate
--

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
-- AUTO_INCREMENT per le tabelle scaricate
--

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
-- AUTO_INCREMENT per la tabella `ditte`
--
ALTER TABLE `ditte`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- Limiti per le tabelle scaricate
--

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
-- Limiti per la tabella `ditte`
--
ALTER TABLE `ditte`
  ADD CONSTRAINT `ditte_ibfk_1` FOREIGN KEY (`id_tipo_ditta`) REFERENCES `tipo_ditta` (`id`),
  ADD CONSTRAINT `fk_ditte_relazioni` FOREIGN KEY (`codice_relazione`) REFERENCES `relazioni_ditta` (`codice`),
  ADD CONSTRAINT `fk_ditte_sottoconto_cliente` FOREIGN KEY (`id_sottoconto_cliente`) REFERENCES `sc_piano_dei_conti` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_ditte_sottoconto_fornitore` FOREIGN KEY (`id_sottoconto_fornitore`) REFERENCES `sc_piano_dei_conti` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_ditte_sottoconto_puntovendita` FOREIGN KEY (`id_sottoconto_puntovendita`) REFERENCES `sc_piano_dei_conti` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
