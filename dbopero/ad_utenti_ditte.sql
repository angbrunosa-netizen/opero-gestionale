-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Ott 20, 2025 alle 12:44
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
-- Struttura della tabella `ad_utenti_ditte`
--

CREATE TABLE `ad_utenti_ditte` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_utente` int(11) NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `id_ruolo` int(11) NOT NULL,
  `Codice_Tipo_Utente` int(11) NOT NULL,
  `stato` enum('attivo','sospeso') NOT NULL DEFAULT 'attivo',
  `is_default` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `ad_utenti_ditte`
--

INSERT INTO `ad_utenti_ditte` (`id`, `id_utente`, `id_ditta`, `id_ruolo`, `Codice_Tipo_Utente`, `stato`, `is_default`, `created_at`, `updated_at`) VALUES
(1, 3, 3, 3, 1, 'attivo', 0, '2025-10-20 09:11:15', '2025-10-20 09:11:15'),
(2, 3, 1, 2, 1, 'attivo', 0, '2025-10-20 09:13:16', '2025-10-20 09:13:16');

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `ad_utenti_ditte`
--
ALTER TABLE `ad_utenti_ditte`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ad_utenti_ditte_id_utente_foreign` (`id_utente`),
  ADD KEY `ad_utenti_ditte_id_ditta_foreign` (`id_ditta`),
  ADD KEY `ad_utenti_ditte_id_ruolo_foreign` (`id_ruolo`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `ad_utenti_ditte`
--
ALTER TABLE `ad_utenti_ditte`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `ad_utenti_ditte`
--
ALTER TABLE `ad_utenti_ditte`
  ADD CONSTRAINT `ad_utenti_ditte_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ad_utenti_ditte_id_ruolo_foreign` FOREIGN KEY (`id_ruolo`) REFERENCES `ruoli` (`id`),
  ADD CONSTRAINT `ad_utenti_ditte_id_utente_foreign` FOREIGN KEY (`id_utente`) REFERENCES `utenti` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
