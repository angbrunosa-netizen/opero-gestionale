-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Ott 10, 2025 alle 22:30
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
  `costo_base` decimal(10,2) DEFAULT 0.00,
  `gestito_a_magazzino` tinyint(1) DEFAULT 0,
  `id_stato_entita` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `ct_catalogo`
--

INSERT INTO `ct_catalogo` (`id`, `id_ditta`, `codice_entita`, `descrizione`, `id_categoria`, `tipo_entita`, `id_unita_misura`, `id_aliquota_iva`, `costo_base`, `gestito_a_magazzino`, `id_stato_entita`, `created_at`, `updated_at`) VALUES
(1, 1, '300411050', 'CORDON BLEU FATTORIA  KG1', 24, 'bene', 1, 3, 1.00, 1, 1, '2025-10-01 13:30:45', '2025-10-01 13:30:45'),
(2, 1, '300411054', 'AMADORI GRAN BURGER 2PZ 280GR', 24, 'bene', 1, 3, 1.98, 0, 1, '2025-10-01 13:30:45', '2025-10-01 13:30:45'),
(3, 1, '305020007', 'COTOLETTA AMADORI POLLO GR700', 24, 'bene', 1, 3, 5.00, 1, 1, '2025-10-01 13:30:45', '2025-10-01 13:30:45'),
(4, 1, '305770007', 'KEBAB AMADORI TACCHINO 700 GR', 24, 'bene', 1, 3, 6.90, 1, 1, '2025-10-01 13:30:45', '2025-10-01 13:30:45'),
(5, 1, '305770009', 'ALETTE DI POLLO PICCCANTI AMADORI 700GR', 24, 'bene', 1, 3, 5.25, 0, 1, '2025-10-01 13:30:45', '2025-10-01 13:30:45'),
(6, 1, '305000063', 'FILETTI DI MERLUZZO ALASKA  NORDICO800G', 25, 'bene', 1, 3, 4.29, 0, 1, '2025-10-01 13:30:45', '2025-10-01 13:30:45'),
(13, 1, '3004110509', 'ARTICOLO', 19, 'bene', 2, 3, 15.00, 0, 4, '2025-10-01 15:14:44', '2025-10-01 15:14:44');

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
  ADD KEY `ct_catalogo_id_aliquota_iva_foreign` (`id_aliquota_iva`),
  ADD KEY `ct_catalogo_id_stato_entita_foreign` (`id_stato_entita`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `ct_catalogo`
--
ALTER TABLE `ct_catalogo`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

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
  ADD CONSTRAINT `ct_catalogo_id_stato_entita_foreign` FOREIGN KEY (`id_stato_entita`) REFERENCES `ct_stati_entita` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `ct_catalogo_id_unita_misura_foreign` FOREIGN KEY (`id_unita_misura`) REFERENCES `ct_unita_misura` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
