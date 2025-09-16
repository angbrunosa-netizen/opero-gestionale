-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Set 16, 2025 alle 17:35
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
(21, 7, 20, 'Materie prime c/acquisti', 100.00, 0.00),
(22, 8, 27, 'Ns. Rif. 10 SARACENARE EXPORT', 0.00, 990.00),
(23, 8, 20, 'Costo per acquisto merci/servizi', 900.00, 0.00),
(24, 8, 51, 'credito erario conto iva', 90.00, 0.00),
(25, 9, 7, 'Vs. Rif. 1 Prova Admin Cliente', 104.00, 0.00),
(26, 9, 17, 'credito erario', 0.00, 100.00),
(27, 9, 25, 'ricavo vendita', 0.00, 4.00),
(28, 10, 7, 'Vs. Rif. 10 SARACENARE EXPORT', 990.00, 0.00),
(29, 10, 17, 'credito erario', 0.00, 900.00),
(30, 10, 25, 'ricavo vendita', 0.00, 90.00),
(31, 11, 9, '', 0.00, 1.00),
(32, 11, 10, '', 1.00, 0.00),
(33, 19, 27, 'Ns. Rif. 1 SARACENARE EXPORT', 0.00, 11.00),
(34, 19, 20, 'Costo per acquisto merci/servizi', 10.00, 0.00),
(35, 19, 51, 'credito erario conto iva', 1.00, 0.00),
(36, 20, 27, 'Ns. Rif. 1 SARACENARE EXPORT', 0.00, 11.00),
(37, 20, 20, 'Costo per acquisto merci/servizi', 10.00, 0.00),
(38, 20, 51, 'credito erario conto iva', 1.00, 0.00),
(39, 21, 27, 'Ns. Rif. 1 SARACENARE EXPORT', 0.00, 11.00),
(40, 21, 20, 'Costo per acquisto merci/servizi', 10.00, 0.00),
(41, 21, 51, 'credito erario conto iva', 1.00, 0.00),
(42, 22, 27, 'Ns. Rif. 10 SARACENARE EXPORT', 0.00, 11.00),
(43, 22, 20, 'Costo per acquisto merci/servizi', 10.00, 0.00),
(44, 22, 51, 'credito erario conto iva', 1.00, 0.00),
(45, 23, 28, '', 1.00, 0.00),
(46, 23, 15, '', 0.00, 1.00),
(47, 24, 9, 'versamento contnati', 0.00, 1.00),
(48, 24, 10, 'versamento in banca', 1.00, 0.00),
(49, 25, 27, 'Ns. Rif. 333 SARACENARE EXPORT', 0.00, 33.00),
(50, 25, 20, 'Costo per acquisto merci/servizi', 30.00, 0.00),
(51, 25, 51, 'credito erario conto iva', 3.00, 0.00),
(52, 26, 27, 'Ns. Rif. 10 SARACENARE EXPORT', 0.00, 11.00),
(53, 26, 20, 'Costo per acquisto merci/servizi', 10.00, 0.00),
(54, 26, 51, 'credito erario conto iva', 1.00, 0.00),
(55, 27, 15, 'Ns. Rif. 1500 DITTA PROVA CLIENTE FORNITORE', 0.00, 1100.00),
(56, 27, 20, 'Costo per acquisto merci/servizi', 1000.00, 0.00),
(57, 27, 51, 'credito erario conto iva', 100.00, 0.00),
(58, 28, 15, 'Ns. Rif. 1500 DITTA PROVA CLIENTE FORNITORE', 0.00, 1100.00),
(59, 28, 20, 'Costo per acquisto merci/servizi', 1000.00, 0.00),
(60, 28, 51, 'credito erario conto iva', 100.00, 0.00),
(61, 29, 7, 'Vs. Rif. 185 SALATI E DOLCI', 1100.00, 0.00),
(62, 29, 17, 'credito erario', 0.00, 1000.00),
(63, 29, 25, 'ricavo vendita', 0.00, 100.00),
(64, 30, 7, 'Vs. Rif. 185 SALATI E DOLCI', 1100.00, 0.00),
(65, 30, 17, 'credito erario', 0.00, 1000.00),
(66, 30, 25, 'ricavo vendita', 0.00, 100.00),
(67, 31, 7, 'Vs. Rif. 555 SALATI E DOLCI', 11.00, 0.00),
(68, 31, 25, 'ricavo vendita', 0.00, 10.00),
(69, 31, 17, 'Iva a Debito', 0.00, 1.00),
(70, 32, 7, 'Vs. Rif. 555 SALATI E DOLCI', 11.00, 0.00),
(71, 32, 25, 'ricavo vendita', 0.00, 10.00),
(72, 32, 17, 'Iva a Debito', 0.00, 1.00),
(73, 33, 7, 'Vs. Rif. 10 SALATI E DOLCI', 990.00, 0.00),
(74, 33, 25, 'ricavo vendita', 0.00, 900.00),
(75, 33, 17, 'Iva a Debito', 0.00, 90.00),
(76, 34, 7, 'Vs. Rif. 10 SALATI E DOLCI', 990.00, 0.00),
(77, 34, 25, 'ricavo vendita', 0.00, 900.00),
(78, 34, 17, 'Iva a Debito', 0.00, 90.00),
(79, 35, 7, 'Vs. Rif. 12 SALATI E DOLCI', 99.00, 0.00),
(80, 35, 25, 'ricavo vendita', 0.00, 90.00),
(81, 35, 17, 'Iva a Debito', 0.00, 9.00),
(82, 36, 7, 'Vs. Rif. 12 SALATI E DOLCI', 99.00, 0.00),
(83, 36, 25, 'ricavo vendita', 0.00, 90.00),
(84, 36, 17, 'Iva a Debito', 0.00, 9.00);

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `sc_registrazioni_righe`
--
ALTER TABLE `sc_registrazioni_righe`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_testata` (`id_testata`),
  ADD KEY `id_conto` (`id_conto`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `sc_registrazioni_righe`
--
ALTER TABLE `sc_registrazioni_righe`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=85;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `sc_registrazioni_righe`
--
ALTER TABLE `sc_registrazioni_righe`
  ADD CONSTRAINT `sc_registrazioni_righe_ibfk_1` FOREIGN KEY (`id_testata`) REFERENCES `sc_registrazioni_testata` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sc_registrazioni_righe_ibfk_2` FOREIGN KEY (`id_conto`) REFERENCES `sc_piano_dei_conti` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
