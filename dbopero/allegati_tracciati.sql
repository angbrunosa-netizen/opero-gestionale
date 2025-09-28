-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Set 28, 2025 alle 23:01
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
-- Struttura della tabella `allegati_tracciati`
--

CREATE TABLE `allegati_tracciati` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_email_inviata` int(11) NOT NULL,
  `nome_file_originale` varchar(255) NOT NULL,
  `percorso_file_salvato` varchar(255) NOT NULL,
  `download_id` varchar(36) NOT NULL,
  `scaricato` tinyint(1) NOT NULL DEFAULT 0,
  `data_primo_scaricamento` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `allegati_tracciati`
--

INSERT INTO `allegati_tracciati` (`id`, `id_email_inviata`, `nome_file_originale`, `percorso_file_salvato`, `download_id`, `scaricato`, `data_primo_scaricamento`, `created_at`, `updated_at`) VALUES
(1, 76, 'fatture2015-2019.zip', 'C:\\Users\\ANGELOBRUNO\\Documents\\APP\\opero\\uploads\\1758880568013-fatture2015-2019.zip', '966d4ee0-b90d-4f13-bbf6-c17edacb8444', 0, NULL, '2025-09-26 09:56:08', '2025-09-26 09:56:08'),
(2, 79, 'aldo originale.png', 'C:\\Users\\Utente\\Documents\\app\\opero\\uploads\\1759064294318-aldo originale.png', 'a054a175-0f70-4940-91ba-2f9e1931d085', 0, NULL, '2025-09-28 12:58:14', '2025-09-28 12:58:14');

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `allegati_tracciati`
--
ALTER TABLE `allegati_tracciati`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `allegati_tracciati_download_id_unique` (`download_id`),
  ADD KEY `allegati_tracciati_id_email_inviata_foreign` (`id_email_inviata`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `allegati_tracciati`
--
ALTER TABLE `allegati_tracciati`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `allegati_tracciati`
--
ALTER TABLE `allegati_tracciati`
  ADD CONSTRAINT `allegati_tracciati_id_email_inviata_foreign` FOREIGN KEY (`id_email_inviata`) REFERENCES `email_inviate` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
