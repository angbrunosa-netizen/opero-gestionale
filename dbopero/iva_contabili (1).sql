-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Set 29, 2025 alle 11:56
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
-- Struttura della tabella `iva_contabili`
--

CREATE TABLE `iva_contabili` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `codice` varchar(10) NOT NULL,
  `descrizione` varchar(100) NOT NULL,
  `aliquota` decimal(5,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `iva_contabili`
--

INSERT INTO `iva_contabili` (`id`, `id_ditta`, `codice`, `descrizione`, `aliquota`) VALUES
(1, 1, '04', 'IVA al 4%', 4.00),
(2, 1, '05', 'IVA al 5%', 5.00),
(3, 1, '10', 'IVA al 10%', 10.00),
(4, 1, '22', 'IVA al 22%', 22.00),
(5, 1, '59', 'Fuori campo IVA', 0.00);

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `iva_contabili`
--
ALTER TABLE `iva_contabili`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `iva_contabili_id_ditta_codice_unique` (`id_ditta`,`codice`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `iva_contabili`
--
ALTER TABLE `iva_contabili`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `iva_contabili`
--
ALTER TABLE `iva_contabili`
  ADD CONSTRAINT `iva_contabili_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
