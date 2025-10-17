-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Ott 17, 2025 alle 22:07
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
-- Struttura della tabella `utenti_sessioni_attive`
--

CREATE TABLE `utenti_sessioni_attive` (
  `id_utente` int(10) UNSIGNED NOT NULL COMMENT 'Chiave primaria e riferimento all''utente',
  `id_ditta_attiva` int(10) UNSIGNED NOT NULL COMMENT 'Riferimento alla ditta della sessione attiva',
  `login_timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_heartbeat_timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `utenti_sessioni_attive`
--

INSERT INTO `utenti_sessioni_attive` (`id_utente`, `id_ditta_attiva`, `login_timestamp`, `last_heartbeat_timestamp`) VALUES
(3, 1, '2025-10-16 22:46:50', '2025-10-16 22:48:54');

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `utenti_sessioni_attive`
--
ALTER TABLE `utenti_sessioni_attive`
  ADD PRIMARY KEY (`id_utente`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
