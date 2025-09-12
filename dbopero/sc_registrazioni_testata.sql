-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Set 12, 2025 alle 19:57
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

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `sc_registrazioni_testata`
--
ALTER TABLE `sc_registrazioni_testata`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_ditta` (`id_ditta`),
  ADD KEY `id_utente` (`id_utente`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `sc_registrazioni_testata`
--
ALTER TABLE `sc_registrazioni_testata`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `sc_registrazioni_testata`
--
ALTER TABLE `sc_registrazioni_testata`
  ADD CONSTRAINT `sc_registrazioni_testata_ibfk_1` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sc_registrazioni_testata_ibfk_2` FOREIGN KEY (`id_utente`) REFERENCES `utenti` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
