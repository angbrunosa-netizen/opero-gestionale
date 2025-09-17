-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Set 17, 2025 alle 10:53
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
-- Struttura della tabella `an_progressivi`
--

CREATE TABLE `an_progressivi` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `codice_progressivo` varchar(50) NOT NULL,
  `descrizione` varchar(255) DEFAULT NULL,
  `serie` varchar(10) DEFAULT NULL,
  `ultimo_numero` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `formato` varchar(100) DEFAULT NULL COMMENT 'Es. {ANNO}/{SERIE}/{NUMERO}'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `an_progressivi`
--

INSERT INTO `an_progressivi` (`id`, `id_ditta`, `codice_progressivo`, `descrizione`, `serie`, `ultimo_numero`, `formato`) VALUES
(1, 1, 'PROT_CONT', 'Protocollo Registrazioni Contabili', NULL, 23, NULL);

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `an_progressivi`
--
ALTER TABLE `an_progressivi`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_progressivo_ditta_codice_serie` (`id_ditta`,`codice_progressivo`,`serie`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `an_progressivi`
--
ALTER TABLE `an_progressivi`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `an_progressivi`
--
ALTER TABLE `an_progressivi`
  ADD CONSTRAINT `an_progressivi_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
