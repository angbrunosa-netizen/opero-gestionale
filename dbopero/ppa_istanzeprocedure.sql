-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Set 23, 2025 alle 19:50
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
(10, 'DITTA', 14, 2, 3, '2025-09-20 19:15:45', '2025-10-30', NULL, 'In Corso', NULL);

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `ppa_istanzeprocedure`
--
ALTER TABLE `ppa_istanzeprocedure`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `ID_UtenteCreatore` (`ID_UtenteCreatore`),
  ADD KEY `fk_ppa_istanzeprocedure_ID_ProceduraDitta` (`ID_ProceduraDitta`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `ppa_istanzeprocedure`
--
ALTER TABLE `ppa_istanzeprocedure`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `ppa_istanzeprocedure`
--
ALTER TABLE `ppa_istanzeprocedure`
  ADD CONSTRAINT `fk_ppa_istanzeprocedure_ID_ProceduraDitta` FOREIGN KEY (`ID_ProceduraDitta`) REFERENCES `ppa_procedureditta` (`ID`),
  ADD CONSTRAINT `ppa_istanzeprocedure_ibfk_3` FOREIGN KEY (`ID_UtenteCreatore`) REFERENCES `utenti` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
