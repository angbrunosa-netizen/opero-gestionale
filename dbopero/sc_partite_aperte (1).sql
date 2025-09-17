-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Set 17, 2025 alle 19:34
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
-- Struttura della tabella `sc_partite_aperte`
--

CREATE TABLE `sc_partite_aperte` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta_anagrafica` int(10) UNSIGNED NOT NULL,
  `data_scadenza` date NOT NULL,
  `importo` decimal(15,2) NOT NULL,
  `stato` enum('APERTA','CHIUSA','INSOLUTA') DEFAULT 'APERTA',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `data_registrazione` date NOT NULL,
  `id_registrazione_testata` int(11) NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `id_anagrafica` int(10) UNSIGNED DEFAULT NULL,
  `numero_documento` varchar(50) DEFAULT NULL,
  `data_documento` date DEFAULT NULL,
  `id_sottoconto` int(10) UNSIGNED DEFAULT NULL,
  `tipo_movimento` enum('Apertura_Credito','Apertura_Debito','Chiusura','Chiusura_Credito','Chiusura_Debito','Storno_Apertura_Credito','Storno_Apertura_Debito') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `sc_partite_aperte`
--

INSERT INTO `sc_partite_aperte` (`id`, `id_ditta_anagrafica`, `data_scadenza`, `importo`, `stato`, `created_at`, `updated_at`, `data_registrazione`, `id_registrazione_testata`, `id_ditta`, `id_anagrafica`, `numero_documento`, `data_documento`, `id_sottoconto`, `tipo_movimento`) VALUES
(1, 15, '2025-09-11', 122.00, 'APERTA', '2025-09-09 16:38:31', '2025-09-09 16:38:31', '2025-09-09', 6, 0, NULL, NULL, NULL, NULL, 'Apertura_Debito'),
(2, 15, '2025-09-10', 110.00, 'APERTA', '2025-09-09 16:43:12', '2025-09-09 16:43:12', '2025-09-09', 7, 0, NULL, NULL, NULL, NULL, 'Apertura_Debito'),
(3, 15, '2025-09-19', 990.00, 'APERTA', '2025-09-13 10:16:34', '2025-09-13 10:16:34', '2025-09-13', 8, 0, NULL, NULL, NULL, NULL, 'Apertura_Debito'),
(4, 6, '2025-09-12', 104.00, 'APERTA', '2025-09-13 10:27:48', '2025-09-13 10:27:48', '2025-09-13', 9, 0, NULL, NULL, NULL, NULL, 'Apertura_Debito'),
(5, 15, '2025-09-20', 990.00, 'APERTA', '2025-09-13 11:09:29', '2025-09-13 11:09:29', '2025-09-13', 10, 0, NULL, NULL, NULL, NULL, 'Apertura_Debito'),
(6, 15, '2025-09-19', 11.00, 'APERTA', '2025-09-13 14:13:22', '2025-09-13 14:13:22', '2025-09-13', 19, 0, NULL, NULL, NULL, NULL, 'Apertura_Debito'),
(7, 15, '2025-09-19', 11.00, 'APERTA', '2025-09-13 14:13:22', '2025-09-13 14:13:22', '2025-09-13', 20, 0, NULL, NULL, NULL, NULL, 'Apertura_Debito'),
(8, 15, '2025-09-19', 11.00, 'APERTA', '2025-09-13 14:13:22', '2025-09-13 14:13:22', '2025-09-13', 21, 0, NULL, NULL, NULL, NULL, 'Apertura_Debito'),
(9, 15, '2026-02-10', 11.00, 'APERTA', '2025-09-13 14:14:19', '2025-09-13 14:14:19', '2025-09-13', 22, 0, NULL, NULL, NULL, NULL, 'Apertura_Debito'),
(10, 15, '2025-09-27', 33.00, 'APERTA', '2025-09-13 14:32:22', '2025-09-13 14:32:22', '2025-09-13', 25, 0, NULL, NULL, NULL, NULL, 'Apertura_Debito'),
(11, 15, '2025-09-13', 11.00, 'APERTA', '2025-09-13 15:19:03', '2025-09-13 15:19:03', '2025-09-13', 26, 0, NULL, NULL, NULL, NULL, 'Apertura_Debito'),
(12, 8, '2025-09-15', 1100.00, 'APERTA', '2025-09-13 16:47:28', '2025-09-13 16:47:28', '2025-09-13', 27, 0, NULL, NULL, NULL, NULL, 'Apertura_Debito'),
(13, 8, '2025-09-15', 1100.00, 'APERTA', '2025-09-13 16:47:28', '2025-09-13 16:47:28', '2025-09-13', 28, 0, NULL, NULL, NULL, NULL, 'Apertura_Debito'),
(14, 14, '2025-09-15', 1100.00, 'APERTA', '2025-09-13 16:48:25', '2025-09-13 16:48:25', '2025-09-13', 29, 0, NULL, NULL, NULL, NULL, 'Apertura_Debito'),
(15, 14, '2025-09-15', 1100.00, 'APERTA', '2025-09-13 16:48:25', '2025-09-13 16:48:25', '2025-09-13', 30, 0, NULL, NULL, NULL, NULL, 'Apertura_Debito'),
(16, 14, '2025-11-25', 11.00, 'APERTA', '2025-09-13 18:45:02', '2025-09-13 18:45:02', '2025-09-13', 31, 0, NULL, NULL, NULL, NULL, 'Apertura_Debito'),
(17, 14, '2025-11-25', 11.00, 'APERTA', '2025-09-13 18:45:02', '2025-09-13 18:45:02', '2025-09-13', 32, 0, NULL, NULL, NULL, NULL, 'Apertura_Debito'),
(18, 14, '2025-09-26', 990.00, 'APERTA', '2025-09-15 09:36:12', '2025-09-15 09:36:12', '2025-09-15', 33, 0, NULL, NULL, NULL, NULL, 'Apertura_Debito'),
(19, 14, '2025-09-26', 990.00, 'APERTA', '2025-09-15 09:36:12', '2025-09-15 09:36:12', '2025-09-15', 34, 0, NULL, NULL, NULL, NULL, 'Apertura_Debito'),
(20, 14, '2025-09-24', 99.00, 'APERTA', '2025-09-16 08:24:53', '2025-09-16 08:24:53', '2025-09-16', 35, 0, NULL, NULL, NULL, NULL, 'Apertura_Debito'),
(21, 14, '2025-09-24', 99.00, 'APERTA', '2025-09-16 08:24:53', '2025-09-16 08:24:53', '2025-09-16', 36, 0, NULL, NULL, NULL, NULL, 'Apertura_Debito'),
(31, 15, '2025-09-24', 1100.00, 'APERTA', '2025-09-17 08:18:21', '2025-09-17 08:18:21', '2025-09-16', 55, 1, 15, NULL, '2025-09-15', 15, 'Apertura_Debito'),
(32, 15, '2025-09-24', 660.00, 'APERTA', '2025-09-17 08:19:35', '2025-09-17 08:19:35', '2025-09-17', 56, 1, 15, NULL, '2025-09-24', 15, 'Apertura_Debito'),
(33, 18, '2025-10-07', 1100.00, 'APERTA', '2025-09-17 08:32:04', '2025-09-17 08:32:04', '2025-09-17', 57, 1, 18, NULL, '2025-09-15', 18, 'Apertura_Credito'),
(34, 18, '2025-10-07', 1100.00, 'APERTA', '2025-09-17 08:40:42', '2025-09-17 08:40:42', '2025-09-17', 58, 1, 18, NULL, '2025-09-15', 18, 'Apertura_Credito'),
(35, 18, '2025-09-18', 1560.00, 'APERTA', '2025-09-17 08:42:11', '2025-09-17 08:42:11', '2025-09-17', 59, 1, 18, NULL, '2025-09-17', 18, 'Apertura_Credito'),
(36, 18, '2025-09-27', 1100.00, 'APERTA', '2025-09-17 09:49:18', '2025-09-17 09:49:18', '2025-09-17', 60, 1, 18, NULL, '2025-09-16', 18, 'Apertura_Credito'),
(37, 15, '2026-08-20', 1100.00, 'APERTA', '2025-09-17 15:37:42', '2025-09-17 15:37:42', '2025-09-17', 61, 1, 15, '100', '2025-09-11', 15, 'Apertura_Debito'),
(38, 15, '2025-09-25', 1100.00, 'APERTA', '2025-09-17 17:13:12', '2025-09-17 17:13:12', '2025-09-17', 62, 1, 15, '5', '2025-09-16', 15, 'Apertura_Debito');

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `sc_partite_aperte`
--
ALTER TABLE `sc_partite_aperte`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_sc_partite_aperte_id_ditta_anagrafica` (`id_ditta_anagrafica`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `sc_partite_aperte`
--
ALTER TABLE `sc_partite_aperte`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `sc_partite_aperte`
--
ALTER TABLE `sc_partite_aperte`
  ADD CONSTRAINT `fk_sc_partite_aperte_id_ditta_anagrafica` FOREIGN KEY (`id_ditta_anagrafica`) REFERENCES `ditte` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
