-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Ott 01, 2025 alle 19:59
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
-- Struttura della tabella `ct_listini`
--

CREATE TABLE `ct_listini` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `id_entita_catalogo` int(10) UNSIGNED NOT NULL,
  `nome_listino` varchar(255) NOT NULL,
  `data_inizio_validita` date NOT NULL,
  `data_fine_validita` date DEFAULT NULL,
  `ricarico_cessione_6` decimal(8,2) DEFAULT 0.00,
  `ricarico_cessione_5` decimal(8,2) DEFAULT 0.00,
  `ricarico_cessione_4` decimal(8,2) DEFAULT 0.00,
  `ricarico_cessione_3` decimal(8,2) DEFAULT 0.00,
  `ricarico_cessione_2` decimal(8,2) DEFAULT 0.00,
  `ricarico_cessione_1` decimal(8,2) DEFAULT 0.00,
  `prezzo_cessione_1` decimal(10,2) DEFAULT 0.00,
  `prezzo_pubblico_1` decimal(10,2) DEFAULT 0.00,
  `ricarico_1` decimal(5,2) DEFAULT 0.00,
  `prezzo_cessione_2` decimal(10,2) DEFAULT 0.00,
  `prezzo_pubblico_2` decimal(10,2) DEFAULT 0.00,
  `ricarico_2` decimal(5,2) DEFAULT 0.00,
  `prezzo_cessione_3` decimal(10,2) DEFAULT 0.00,
  `prezzo_pubblico_3` decimal(10,2) DEFAULT 0.00,
  `ricarico_3` decimal(5,2) DEFAULT 0.00,
  `prezzo_cessione_4` decimal(10,2) DEFAULT 0.00,
  `prezzo_pubblico_4` decimal(10,2) DEFAULT 0.00,
  `ricarico_4` decimal(5,2) DEFAULT 0.00,
  `prezzo_cessione_5` decimal(10,2) DEFAULT 0.00,
  `prezzo_pubblico_5` decimal(10,2) DEFAULT 0.00,
  `ricarico_5` decimal(5,2) DEFAULT 0.00,
  `prezzo_cessione_6` decimal(10,2) DEFAULT 0.00,
  `prezzo_pubblico_6` decimal(10,2) DEFAULT 0.00,
  `ricarico_6` decimal(5,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `ct_listini`
--
ALTER TABLE `ct_listini`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ct_listini_id_ditta_foreign` (`id_ditta`),
  ADD KEY `ct_listini_id_entita_catalogo_foreign` (`id_entita_catalogo`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `ct_listini`
--
ALTER TABLE `ct_listini`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `ct_listini`
--
ALTER TABLE `ct_listini`
  ADD CONSTRAINT `ct_listini_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ct_listini_id_entita_catalogo_foreign` FOREIGN KEY (`id_entita_catalogo`) REFERENCES `ct_catalogo` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
