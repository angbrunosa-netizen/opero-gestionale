-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Set 18, 2025 alle 11:16
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
(6, 'Prova Admin Cliente', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'prova@prova.it', NULL, NULL, NULL, NULL, NULL, 1, 2, NULL, 'C', NULL, NULL, NULL, 1, NULL),
(7, 'punto_vendita_prova', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'puntovendita@prova.it', NULL, NULL, NULL, NULL, NULL, 1, 2, NULL, 'P', NULL, NULL, NULL, 1, 203),
(8, 'DITTA PROVA CLIENTE FORNITORE', NULL, 'VIA NOSTRA', 'NOSTRA', 'NS', '87010', '0981', '0982', 'INFO@CEDIBEF.COM', '', '', '0000000', '0125025693', '01205', 1, NULL, NULL, 'F', NULL, NULL, NULL, 1, NULL),
(12, 'CARAMELLE SALATE cliente', NULL, 'DEI DOLCI', 'SULMONA', 'DC', '87010', '0152', '155', 'INFO@CEDIBEF.COM', '', 'cliedemo@pec.it', '0000001', '0125205269', '0122640', 1, 2, NULL, 'C', NULL, NULL, NULL, 1, NULL),
(13, 'DITTA SALATI TUTTIfornitroe', NULL, 'VIA DEI SALATINI', 'SALTO', 'SS', '90878', '098198025', '093', 'INFO@CEDIBEF.COM', '', NULL, '0000000', '0102512554', '0125002541', 1, NULL, NULL, 'F', NULL, NULL, NULL, 1, NULL),
(14, 'SALATI E DOLCI', NULL, 'DEI GUSTI', 'GUSTOSA', 'GS', '75000', '02555', '0255', 'A@LIBERO.IT', '', NULL, '0000000', '01245454', '0213313', 1, NULL, NULL, 'C', NULL, NULL, NULL, 1, NULL),
(15, 'SARACENARE EXPORT', NULL, 'VIA MAZZINI', 'SARACENA', 'CS', '87010', '098134463', '0985233', 'TRI@TE.IT', '', NULL, '', '0102555', '02692', 1, NULL, NULL, 'F', NULL, 27, NULL, 1, NULL),
(16, 'CAROFIGLIO SPA', NULL, 'FIGLINE', 'FIGLINE VIGLIATURAO', 'FG', '87100', '02255', '02555', 'CARMO@FIOR.IT', '', NULL, NULL, '55656565', '3299', 1, 2, NULL, 'C', NULL, NULL, NULL, 1, NULL),
(17, 'PROVA DITTA 2 fornitore', NULL, 'prova', 'provolino', 'pr', '87410', '012', '088', 'eee@fr.it', '', NULL, NULL, '09999', '87899', 1, 2, NULL, 'C', NULL, NULL, NULL, 1, NULL),
(18, 'Cliente Linux', NULL, 'entram', 'entr', 'cs', '85200', '022', '022', 'ang@opero.it', '', NULL, NULL, '021212121', '01212121', 1, 2, NULL, 'C', 28, NULL, NULL, 1, NULL);

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
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `ditte`
--
ALTER TABLE `ditte`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
