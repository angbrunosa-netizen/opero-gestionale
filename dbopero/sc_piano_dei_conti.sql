-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Set 29, 2025 alle 18:40
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
(55, 1, '40.05.0005', 'CAROFIGLIO SPA', 14, 'Mastro', '', 0, '2025-09-24 16:11:30');

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `sc_piano_dei_conti`
--
ALTER TABLE `sc_piano_dei_conti`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_ditta_codice` (`id_ditta`,`codice`),
  ADD KEY `id_padre` (`id_padre`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `sc_piano_dei_conti`
--
ALTER TABLE `sc_piano_dei_conti`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `sc_piano_dei_conti`
--
ALTER TABLE `sc_piano_dei_conti`
  ADD CONSTRAINT `fk_sc_piano_dei_conti_id_ditta` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`),
  ADD CONSTRAINT `sc_piano_dei_conti_ibfk_2` FOREIGN KEY (`id_padre`) REFERENCES `sc_piano_dei_conti` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
