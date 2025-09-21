-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Set 21, 2025 alle 19:11
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
-- Struttura della tabella `bs_scadenze`
--

CREATE TABLE `bs_scadenze` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_bene` int(10) UNSIGNED NOT NULL,
  `tipo_scadenza` varchar(255) DEFAULT NULL,
  `descrizione` text DEFAULT NULL,
  `data_scadenza` date DEFAULT NULL,
  `giorni_preavviso` int(11) DEFAULT 7,
  `id_fornitore_associato` int(10) UNSIGNED DEFAULT NULL,
  `importo_previsto` decimal(15,2) DEFAULT NULL,
  `stato` enum('Pianificata','Completata','Annullata') DEFAULT 'Pianificata',
  `data_completamento` date DEFAULT NULL,
  `note` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `bs_scadenze`
--
ALTER TABLE `bs_scadenze`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bs_scadenze_id_bene_foreign` (`id_bene`),
  ADD KEY `bs_scadenze_id_fornitore_associato_foreign` (`id_fornitore_associato`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `bs_scadenze`
--
ALTER TABLE `bs_scadenze`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `bs_scadenze`
--
ALTER TABLE `bs_scadenze`
  ADD CONSTRAINT `bs_scadenze_id_bene_foreign` FOREIGN KEY (`id_bene`) REFERENCES `bs_beni` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bs_scadenze_id_fornitore_associato_foreign` FOREIGN KEY (`id_fornitore_associato`) REFERENCES `ditte` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
