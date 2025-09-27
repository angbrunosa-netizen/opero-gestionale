-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Set 27, 2025 alle 17:58
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
-- Struttura della tabella `an_servizi_aziendali_mail`
--

CREATE TABLE `an_servizi_aziendali_mail` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `nome_servizio` varchar(100) NOT NULL COMMENT 'Es: ''PPA_COMMUNICATION'', ''FATTURAZIONE''',
  `id_ditta_mail_account` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `an_servizi_aziendali_mail`
--

INSERT INTO `an_servizi_aziendali_mail` (`id`, `id_ditta`, `nome_servizio`, `id_ditta_mail_account`, `created_at`, `updated_at`) VALUES
(1, 1, 'PPA_COMUNICATION', 13, '2025-09-23 19:02:54', '2025-09-23 19:02:54');

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `an_servizi_aziendali_mail`
--
ALTER TABLE `an_servizi_aziendali_mail`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `an_servizi_aziendali_mail_id_ditta_nome_servizio_unique` (`id_ditta`,`nome_servizio`),
  ADD KEY `an_servizi_aziendali_mail_id_ditta_mail_account_foreign` (`id_ditta_mail_account`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `an_servizi_aziendali_mail`
--
ALTER TABLE `an_servizi_aziendali_mail`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `an_servizi_aziendali_mail`
--
ALTER TABLE `an_servizi_aziendali_mail`
  ADD CONSTRAINT `an_servizi_aziendali_mail_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `an_servizi_aziendali_mail_id_ditta_mail_account_foreign` FOREIGN KEY (`id_ditta_mail_account`) REFERENCES `ditta_mail_accounts` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
