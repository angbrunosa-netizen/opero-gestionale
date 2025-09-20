-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Set 20, 2025 alle 19:06
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
-- Struttura della tabella `bs_beni`
--

CREATE TABLE `bs_beni` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `id_categoria` int(10) UNSIGNED NOT NULL,
  `codice_bene` varchar(100) NOT NULL,
  `descrizione` text DEFAULT NULL,
  `matricola` varchar(255) DEFAULT NULL,
  `url_foto` varchar(500) DEFAULT NULL,
  `data_acquisto` date DEFAULT NULL,
  `valore_acquisto` decimal(15,2) DEFAULT NULL,
  `id_sottoconto_cespite` int(11) DEFAULT NULL,
  `id_fornitore` int(10) UNSIGNED DEFAULT NULL,
  `riferimento_fattura` varchar(255) DEFAULT NULL,
  `stato` enum('In uso','In manutenzione','Dismesso','In magazzino') DEFAULT 'In magazzino',
  `ubicazione` varchar(255) DEFAULT NULL,
  `data_dismissione` date DEFAULT NULL,
  `valore_dismissione` decimal(15,2) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `bs_beni`
--
ALTER TABLE `bs_beni`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `bs_beni_id_ditta_codice_bene_unique` (`id_ditta`,`codice_bene`),
  ADD KEY `bs_beni_id_categoria_foreign` (`id_categoria`),
  ADD KEY `bs_beni_id_sottoconto_cespite_foreign` (`id_sottoconto_cespite`),
  ADD KEY `bs_beni_id_fornitore_foreign` (`id_fornitore`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `bs_beni`
--
ALTER TABLE `bs_beni`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `bs_beni`
--
ALTER TABLE `bs_beni`
  ADD CONSTRAINT `bs_beni_id_categoria_foreign` FOREIGN KEY (`id_categoria`) REFERENCES `bs_categorie` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bs_beni_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bs_beni_id_fornitore_foreign` FOREIGN KEY (`id_fornitore`) REFERENCES `ditte` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `bs_beni_id_sottoconto_cespite_foreign` FOREIGN KEY (`id_sottoconto_cespite`) REFERENCES `sc_piano_dei_conti` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
