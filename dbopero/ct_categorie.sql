-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Ott 05, 2025 alle 20:57
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
-- Struttura della tabella `ct_categorie`
--

CREATE TABLE `ct_categorie` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `nome_categoria` varchar(100) NOT NULL,
  `descrizione` text DEFAULT NULL,
  `codice_categoria` varchar(255) DEFAULT NULL,
  `progressivo` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `id_padre` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `ct_categorie`
--

INSERT INTO `ct_categorie` (`id`, `id_ditta`, `nome_categoria`, `descrizione`, `codice_categoria`, `progressivo`, `created_at`, `updated_at`, `id_padre`) VALUES
(15, 1, 'MERCI', 'PRODOTTI FISICI DI MAGAZZINO ', NULL, NULL, '2025-09-29 19:00:38', '2025-09-29 19:00:38', NULL),
(16, 1, 'FOOD', 'PRODOTTI ALIMENTARI', NULL, NULL, '2025-09-29 19:00:53', '2025-09-29 19:00:53', 15),
(17, 1, 'NO FOOD', 'NON ALIMENTARI', NULL, NULL, '2025-09-29 19:01:14', '2025-09-29 19:01:14', 15),
(18, 1, 'DEPERIBILI', 'ALIMENTARI DEPERIBILI', NULL, NULL, '2025-09-29 19:01:34', '2025-09-29 19:01:34', 16),
(19, 1, 'SERVIZI', 'SERVIZI AZIENDALI', NULL, NULL, '2025-09-29 19:07:17', '2025-09-29 19:07:17', NULL),
(20, 1, 'LAVORAZIONI', 'LAVORAZIONI ESEGUITE', NULL, NULL, '2025-09-29 19:07:35', '2025-09-29 19:07:35', NULL),
(21, 1, 'LIQUIDI', 'PRODOTTI LIQUIDI', NULL, NULL, '2025-09-30 17:18:23', '2025-09-30 17:18:23', 16),
(22, 1, 'DISPENSA', 'PRODOTTI DIPENSA', NULL, NULL, '2025-09-30 17:18:50', '2025-09-30 17:18:50', 16),
(24, 1, 'SURGELATI', 'PRODOTTI SURGELATI', NULL, NULL, '2025-09-30 17:19:44', '2025-09-30 17:19:44', 18),
(25, 1, 'FRESCHI', 'PRODOTTI FRESCHI', NULL, NULL, '2025-09-30 17:20:38', '2025-09-30 17:20:38', 18),
(26, 1, 'IGIENE CASA', 'IGIENE CASA', NULL, NULL, '2025-09-30 17:21:11', '2025-09-30 17:21:11', 17),
(29, 1, 'IGIENE PERSONA', 'IGIENE PERSONA', NULL, NULL, '2025-09-30 17:21:51', '2025-09-30 17:21:51', 17);

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `ct_categorie`
--
ALTER TABLE `ct_categorie`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ct_categorie_id_ditta_foreign` (`id_ditta`),
  ADD KEY `ct_categorie_id_padre_foreign` (`id_padre`),
  ADD KEY `ct_categorie_codice_categoria_index` (`codice_categoria`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `ct_categorie`
--
ALTER TABLE `ct_categorie`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `ct_categorie`
--
ALTER TABLE `ct_categorie`
  ADD CONSTRAINT `ct_categorie_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ct_categorie_id_padre_foreign` FOREIGN KEY (`id_padre`) REFERENCES `ct_categorie` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
