-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Set 18, 2025 alle 11:18
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
-- Struttura della tabella `an_relazioni`
--

CREATE TABLE `an_relazioni` (
  `id` int(11) UNSIGNED NOT NULL,
  `id_ditta_origine` int(10) UNSIGNED NOT NULL,
  `id_ditta_correlata` int(10) UNSIGNED NOT NULL,
  `id_tipo_relazione` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `an_relazioni`
--
ALTER TABLE `an_relazioni`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_an_relazioni_id_ditta_origine` (`id_ditta_origine`),
  ADD KEY `fk_an_relazioni_id_ditta_correlata` (`id_ditta_correlata`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `an_relazioni`
--
ALTER TABLE `an_relazioni`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `an_relazioni`
--
ALTER TABLE `an_relazioni`
  ADD CONSTRAINT `fk_an_relazioni_id_ditta_correlata` FOREIGN KEY (`id_ditta_correlata`) REFERENCES `ditte` (`id`),
  ADD CONSTRAINT `fk_an_relazioni_id_ditta_origine` FOREIGN KEY (`id_ditta_origine`) REFERENCES `ditte` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
