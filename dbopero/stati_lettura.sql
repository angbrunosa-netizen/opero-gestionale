-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Set 29, 2025 alle 18:24
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
-- Database: `opero_vecchio`
--

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
(10, 140, '2025-08-08 19:13:21');

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `stati_lettura`
--
ALTER TABLE `stati_lettura`
  ADD PRIMARY KEY (`id_utente`,`email_uid`);

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `stati_lettura`
--
ALTER TABLE `stati_lettura`
  ADD CONSTRAINT `stati_lettura_ibfk_1` FOREIGN KEY (`id_utente`) REFERENCES `utenti` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
