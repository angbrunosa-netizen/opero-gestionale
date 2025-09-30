-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Set 30, 2025 alle 17:11
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
-- Struttura della tabella `ct_catalogo`
--

CREATE TABLE `ct_catalogo` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `codice_entita` varchar(50) NOT NULL,
  `descrizione` varchar(255) NOT NULL,
  `id_categoria` int(10) UNSIGNED DEFAULT NULL,
  `tipo_entita` enum('bene','servizio','composito') NOT NULL,
  `id_unita_misura` int(10) UNSIGNED DEFAULT NULL,
  `id_aliquota_iva` int(10) UNSIGNED DEFAULT NULL,
  `prezzo_base` decimal(10,2) DEFAULT 0.00,
  `gestito_a_magazzino` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `ct_catalogo`
--
ALTER TABLE `ct_catalogo`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ct_catalogo_id_ditta_codice_entita_unique` (`id_ditta`,`codice_entita`),
  ADD KEY `ct_catalogo_id_categoria_foreign` (`id_categoria`),
  ADD KEY `ct_catalogo_id_unita_misura_foreign` (`id_unita_misura`),
  ADD KEY `ct_catalogo_id_aliquota_iva_foreign` (`id_aliquota_iva`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `ct_catalogo`
--
ALTER TABLE `ct_catalogo`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `ct_catalogo`
--
ALTER TABLE `ct_catalogo`
  ADD CONSTRAINT `ct_catalogo_id_aliquota_iva_foreign` FOREIGN KEY (`id_aliquota_iva`) REFERENCES `iva_contabili` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `ct_catalogo_id_categoria_foreign` FOREIGN KEY (`id_categoria`) REFERENCES `ct_categorie` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `ct_catalogo_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ct_catalogo_id_unita_misura_foreign` FOREIGN KEY (`id_unita_misura`) REFERENCES `ct_unita_misura` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
