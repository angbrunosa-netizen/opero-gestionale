-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Ott 30, 2025 alle 21:02
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
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(1, 5),
(1, 10),
(1, 11),
(1, 13),
(1, 14),
(1, 15),
(1, 26),
(1, 27),
(1, 28),
(1, 29),
(1, 30),
(1, 31),
(1, 32),
(1, 34),
(1, 35),
(1, 36),
(1, 37),
(1, 38),
(1, 70),
(1, 71),
(1, 72),
(1, 73),
(1, 74),
(1, 75),
(1, 76),
(1, 77),
(1, 80),
(1, 81),
(1, 82),
(1, 83),
(1, 84),
(1, 90),
(1, 91),
(1, 92),
(1, 93),
(1, 94),
(1, 95),
(1, 96),
(1, 97),
(1, 98),
(1, 99),
(1, 100),
(1, 101),
(1, 102),
(1, 103),
(1, 104),
(1, 105),
(1, 106),
(1, 107),
(1, 108),
(1, 109),
(1, 110),
(1, 115),
(1, 116),
(1, 117),
(1, 118),
(1, 119),
(1, 120),
(1, 121),
(1, 122),
(1, 123),
(1, 124),
(1, 127),
(2, 1),
(2, 2),
(2, 3),
(2, 4),
(2, 5),
(2, 10),
(2, 11),
(2, 13),
(2, 14),
(2, 15),
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
(2, 37),
(2, 38),
(2, 70),
(2, 71),
(2, 72),
(2, 73),
(2, 74),
(2, 75),
(2, 76),
(2, 77),
(2, 80),
(2, 81),
(2, 82),
(2, 83),
(2, 84),
(2, 90),
(2, 91),
(2, 92),
(2, 93),
(2, 94),
(2, 95),
(2, 96),
(2, 97),
(2, 98),
(2, 99),
(2, 100),
(2, 101),
(2, 102),
(2, 103),
(2, 104),
(2, 105),
(2, 106),
(2, 107),
(2, 108),
(2, 109),
(2, 110),
(2, 115),
(2, 116),
(2, 117),
(2, 118),
(2, 119),
(2, 120),
(2, 121),
(2, 122),
(2, 124),
(2, 127),
(3, 2),
(3, 3),
(3, 4),
(3, 11),
(3, 13);

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `ruoli_funzioni`
--
ALTER TABLE `ruoli_funzioni`
  ADD PRIMARY KEY (`id_ruolo`,`id_funzione`),
  ADD KEY `id_funzione` (`id_funzione`);

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `ruoli_funzioni`
--
ALTER TABLE `ruoli_funzioni`
  ADD CONSTRAINT `ruoli_funzioni_ibfk_1` FOREIGN KEY (`id_ruolo`) REFERENCES `ruoli` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ruoli_funzioni_ibfk_2` FOREIGN KEY (`id_funzione`) REFERENCES `funzioni` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
