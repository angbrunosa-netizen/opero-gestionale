-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Ott 20, 2025 alle 15:53
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
-- Struttura della tabella `utenti_funzioni_override`
--

CREATE TABLE `utenti_funzioni_override` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_utente` int(11) NOT NULL COMMENT 'FK all''utente a cui si applica l''override.',
  `id_funzione` int(11) NOT NULL COMMENT 'FK alla funzione specifica oggetto dell''override.',
  `azione` enum('allow','deny') NOT NULL COMMENT 'Specifica se il permesso viene concesso (allow) o revocato (deny).',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `utenti_funzioni_override`
--

INSERT INTO `utenti_funzioni_override` (`id`, `id_utente`, `id_funzione`, `azione`, `created_at`, `updated_at`) VALUES
(1, 49, 10, 'allow', '2025-10-13 17:18:15', '2025-10-13 17:18:15'),
(2, 49, 11, 'allow', '2025-10-13 17:18:15', '2025-10-13 17:18:15'),
(3, 49, 13, 'allow', '2025-10-13 17:18:15', '2025-10-13 17:18:15'),
(4, 49, 14, 'allow', '2025-10-13 17:18:15', '2025-10-13 17:18:15'),
(5, 49, 15, 'allow', '2025-10-13 17:18:15', '2025-10-13 17:18:15'),
(6, 49, 28, 'allow', '2025-10-13 17:18:15', '2025-10-13 17:18:15'),
(7, 49, 29, 'allow', '2025-10-13 17:18:15', '2025-10-13 17:18:15'),
(8, 49, 70, 'allow', '2025-10-13 17:18:15', '2025-10-13 17:18:15'),
(9, 49, 90, 'allow', '2025-10-13 17:18:15', '2025-10-13 17:18:15'),
(10, 49, 91, 'allow', '2025-10-13 17:18:15', '2025-10-13 17:18:15'),
(11, 49, 93, 'allow', '2025-10-13 17:18:15', '2025-10-13 17:18:15'),
(12, 49, 94, 'allow', '2025-10-13 17:18:15', '2025-10-13 17:18:15'),
(13, 49, 115, 'allow', '2025-10-13 17:18:15', '2025-10-13 17:18:15'),
(14, 1, 115, 'allow', '2025-10-13 17:34:14', '2025-10-13 17:34:14'),
(15, 48, 70, 'deny', '2025-10-18 17:45:58', '2025-10-18 17:45:58');

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `utenti_funzioni_override`
--
ALTER TABLE `utenti_funzioni_override`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `utenti_funzioni_override_id_utente_id_funzione_unique` (`id_utente`,`id_funzione`),
  ADD KEY `utenti_funzioni_override_id_funzione_foreign` (`id_funzione`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `utenti_funzioni_override`
--
ALTER TABLE `utenti_funzioni_override`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `utenti_funzioni_override`
--
ALTER TABLE `utenti_funzioni_override`
  ADD CONSTRAINT `utenti_funzioni_override_id_funzione_foreign` FOREIGN KEY (`id_funzione`) REFERENCES `funzioni` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `utenti_funzioni_override_id_utente_foreign` FOREIGN KEY (`id_utente`) REFERENCES `utenti` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
