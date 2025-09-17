-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Set 17, 2025 alle 09:55
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
-- Struttura della tabella `sc_funzioni_contabili_righe`
--

CREATE TABLE `sc_funzioni_contabili_righe` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_funzione_contabile` int(10) UNSIGNED NOT NULL,
  `id_conto` int(11) NOT NULL,
  `tipo_movimento` enum('D','A') NOT NULL,
  `descrizione_riga_predefinita` varchar(255) DEFAULT NULL,
  `is_sottoconto_modificabile` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `sc_funzioni_contabili_righe`
--

INSERT INTO `sc_funzioni_contabili_righe` (`id`, `id_funzione_contabile`, `id_conto`, `tipo_movimento`, `descrizione_riga_predefinita`, `is_sottoconto_modificabile`, `created_at`, `updated_at`) VALUES
(93, 9, 20, 'D', 'Costo per acquisto merci/servizi', 1, '2025-09-11 16:01:45', '2025-09-11 16:01:45'),
(94, 9, 51, 'D', 'credito erario conto iva', 1, '2025-09-11 16:01:45', '2025-09-11 16:01:45'),
(95, 9, 15, 'A', 'debito verso fornitore', 1, '2025-09-11 16:01:45', '2025-09-11 16:01:45'),
(123, 13, 9, 'D', 'versamento contnati', 1, '2025-09-13 18:12:46', '2025-09-13 18:12:46'),
(124, 13, 10, 'A', 'versamento in banca', 1, '2025-09-13 18:12:46', '2025-09-13 18:12:46'),
(125, 12, 17, 'A', 'Iva a Debito', 1, '2025-09-13 18:16:58', '2025-09-13 18:16:58'),
(126, 12, 25, 'A', 'ricavo vendita', 1, '2025-09-13 18:16:58', '2025-09-13 18:16:58'),
(127, 12, 7, 'D', 'credito verso clienti', 1, '2025-09-13 18:16:58', '2025-09-13 18:16:58'),
(128, 11, 9, 'D', '', 1, '2025-09-15 13:16:06', '2025-09-15 13:16:06'),
(129, 11, 10, 'D', '', 1, '2025-09-15 13:16:06', '2025-09-15 13:16:06'),
(130, 23, 7, 'D', '', 1, '2025-09-15 13:51:32', '2025-09-15 13:51:32'),
(131, 23, 10, 'A', '', 1, '2025-09-15 13:51:32', '2025-09-15 13:51:32');

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `sc_funzioni_contabili_righe`
--
ALTER TABLE `sc_funzioni_contabili_righe`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sc_funzioni_contabili_righe_id_funzione_contabile_foreign` (`id_funzione_contabile`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `sc_funzioni_contabili_righe`
--
ALTER TABLE `sc_funzioni_contabili_righe`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=132;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `sc_funzioni_contabili_righe`
--
ALTER TABLE `sc_funzioni_contabili_righe`
  ADD CONSTRAINT `sc_funzioni_contabili_righe_id_funzione_contabile_foreign` FOREIGN KEY (`id_funzione_contabile`) REFERENCES `sc_funzioni_contabili` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
