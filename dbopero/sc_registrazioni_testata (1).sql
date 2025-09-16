-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Set 16, 2025 alle 17:35
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
-- Struttura della tabella `sc_registrazioni_testata`
--

CREATE TABLE `sc_registrazioni_testata` (
  `id` int(11) NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `id_utente` int(11) NOT NULL,
  `data_registrazione` date NOT NULL,
  `descrizione_testata` varchar(255) NOT NULL,
  `data_documento` date DEFAULT NULL,
  `numero_documento` varchar(50) DEFAULT NULL,
  `totale_documento` decimal(15,2) DEFAULT NULL,
  `id_ditte` int(10) UNSIGNED DEFAULT NULL,
  `numero_protocollo` int(10) UNSIGNED NOT NULL,
  `stato` enum('Provvisorio','Confermato','Annullato') DEFAULT 'Provvisorio',
  `data_creazione` timestamp NOT NULL DEFAULT current_timestamp(),
  `data_ultima_modifica` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `sc_registrazioni_testata`
--

INSERT INTO `sc_registrazioni_testata` (`id`, `id_ditta`, `id_utente`, `data_registrazione`, `descrizione_testata`, `data_documento`, `numero_documento`, `totale_documento`, `id_ditte`, `numero_protocollo`, `stato`, `data_creazione`, `data_ultima_modifica`) VALUES
(6, 1, 3, '2025-09-09', 'Registrazione Fattura Acquisto', NULL, NULL, NULL, NULL, 1, 'Confermato', '2025-09-09 16:38:31', '2025-09-13 12:56:09'),
(7, 1, 3, '2025-09-09', 'Registrazione Fattura Acquisto', NULL, NULL, NULL, NULL, 2, 'Confermato', '2025-09-09 16:43:12', '2025-09-13 12:56:09'),
(8, 1, 3, '2025-09-13', 'Registrazione Fattura Acquisto', NULL, NULL, NULL, 15, 3, 'Provvisorio', '2025-09-13 10:16:34', '2025-09-13 12:56:09'),
(9, 1, 3, '2025-09-13', 'Registrazione Fattura Vendita', NULL, NULL, NULL, 6, 4, 'Provvisorio', '2025-09-13 10:27:47', '2025-09-13 12:56:09'),
(10, 1, 3, '2025-09-13', 'Registrazione Fattura Vendita', NULL, NULL, NULL, 15, 5, 'Provvisorio', '2025-09-13 11:09:29', '2025-09-13 12:56:09'),
(11, 1, 3, '2025-09-13', 'DARE AVERE', NULL, NULL, NULL, NULL, 0, 'Provvisorio', '2025-09-13 13:38:33', '2025-09-13 13:38:33'),
(19, 1, 3, '2025-09-13', 'Registrazione Fattura Acquisto', '2025-09-06', '1', 11.00, 15, 6, 'Provvisorio', '2025-09-13 14:13:22', '2025-09-13 14:13:22'),
(20, 1, 3, '2025-09-13', 'Registrazione Fattura Acquisto', '2025-09-06', '1', 11.00, 15, 7, 'Provvisorio', '2025-09-13 14:13:22', '2025-09-13 14:13:22'),
(21, 1, 3, '2025-09-13', 'Registrazione Fattura Acquisto', '2025-09-06', '1', 11.00, 15, 8, 'Provvisorio', '2025-09-13 14:13:22', '2025-09-13 14:13:22'),
(22, 1, 3, '2025-09-13', 'Registrazione Fattura Acquisto', '2025-11-10', '10', 11.00, 15, 9, 'Provvisorio', '2025-09-13 14:14:19', '2025-09-13 14:14:19'),
(23, 1, 3, '2025-09-13', 'Versamento In banca ', NULL, NULL, NULL, NULL, 10, 'Provvisorio', '2025-09-13 14:15:03', '2025-09-13 14:15:03'),
(24, 1, 3, '2025-09-13', 'Versamento In banca ', NULL, NULL, NULL, NULL, 11, 'Provvisorio', '2025-09-13 14:31:33', '2025-09-13 14:31:33'),
(25, 1, 3, '2025-09-13', 'Registrazione Fattura Acquisto', '2025-09-06', '333', 33.00, 15, 12, 'Provvisorio', '2025-09-13 14:32:22', '2025-09-13 14:32:22'),
(26, 1, 3, '2025-09-13', 'Registrazione Fattura Acquisto', '2025-09-13', '10', 11.00, 15, 13, 'Provvisorio', '2025-09-13 15:19:03', '2025-09-13 15:19:03'),
(27, 1, 3, '2025-09-13', 'Registrazione Fattura Acquisto', '2025-10-10', '1500', 1100.00, 8, 14, 'Provvisorio', '2025-09-13 16:47:28', '2025-09-13 16:47:28'),
(28, 1, 3, '2025-09-13', 'Registrazione Fattura Acquisto', '2025-10-10', '1500', 1100.00, 8, 15, 'Provvisorio', '2025-09-13 16:47:28', '2025-09-13 16:47:28'),
(29, 1, 3, '2025-09-13', 'Registrazione Fattura Vendita', '2025-10-10', '185', 1100.00, 14, 16, 'Provvisorio', '2025-09-13 16:48:25', '2025-09-13 16:48:25'),
(30, 1, 3, '2025-09-13', 'Registrazione Fattura Vendita', '2025-10-10', '185', 1100.00, 14, 17, 'Provvisorio', '2025-09-13 16:48:25', '2025-09-13 16:48:25'),
(31, 1, 3, '2025-09-13', 'Registrazione Fattura Vendita', '2025-10-25', '555', 11.00, 14, 18, 'Provvisorio', '2025-09-13 18:45:02', '2025-09-13 18:45:02'),
(32, 1, 3, '2025-09-13', 'Registrazione Fattura Vendita', '2025-10-25', '555', 11.00, 14, 19, 'Provvisorio', '2025-09-13 18:45:02', '2025-09-13 18:45:02'),
(33, 1, 3, '2025-09-15', 'Registrazione Fattura Vendita', '2025-09-09', '10', 990.00, 14, 20, 'Provvisorio', '2025-09-15 09:36:12', '2025-09-15 09:36:12'),
(34, 1, 3, '2025-09-15', 'Registrazione Fattura Vendita', '2025-09-09', '10', 990.00, 14, 21, 'Provvisorio', '2025-09-15 09:36:12', '2025-09-15 09:36:12'),
(35, 1, 3, '2025-09-16', 'Registrazione Fattura Vendita', '2025-09-16', '12', 99.00, 14, 22, 'Provvisorio', '2025-09-16 08:24:53', '2025-09-16 08:24:53'),
(36, 1, 3, '2025-09-16', 'Registrazione Fattura Vendita', '2025-09-16', '12', 99.00, 14, 23, 'Provvisorio', '2025-09-16 08:24:53', '2025-09-16 08:24:53');

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `sc_registrazioni_testata`
--
ALTER TABLE `sc_registrazioni_testata`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sc_registrazioni_testata_id_ditta_numero_protocollo_unique` (`id_ditta`,`numero_protocollo`),
  ADD KEY `id_utente` (`id_utente`),
  ADD KEY `sc_registrazioni_testata_id_ditte_foreign` (`id_ditte`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `sc_registrazioni_testata`
--
ALTER TABLE `sc_registrazioni_testata`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `sc_registrazioni_testata`
--
ALTER TABLE `sc_registrazioni_testata`
  ADD CONSTRAINT `fk_sc_registrazioni_testata_id_ditta` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`),
  ADD CONSTRAINT `sc_registrazioni_testata_ibfk_2` FOREIGN KEY (`id_utente`) REFERENCES `utenti` (`id`),
  ADD CONSTRAINT `sc_registrazioni_testata_id_ditte_foreign` FOREIGN KEY (`id_ditte`) REFERENCES `ditte` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
