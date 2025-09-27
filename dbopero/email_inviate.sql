-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Set 27, 2025 alle 18:00
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
-- Struttura della tabella `email_inviate`
--

CREATE TABLE `email_inviate` (
  `id` int(11) NOT NULL,
  `id_utente_mittente` int(11) NOT NULL,
  `destinatari` text NOT NULL,
  `cc` text DEFAULT NULL,
  `bcc` text DEFAULT NULL,
  `oggetto` varchar(255) DEFAULT NULL,
  `corpo` longtext DEFAULT NULL,
  `data_invio` timestamp NOT NULL DEFAULT current_timestamp(),
  `aperta` tinyint(1) DEFAULT 0,
  `data_prima_apertura` timestamp NULL DEFAULT NULL,
  `tracking_id` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `email_inviate`
--

INSERT INTO `email_inviate` (`id`, `id_utente_mittente`, `destinatari`, `cc`, `bcc`, `oggetto`, `corpo`, `data_invio`, `aperta`, `data_prima_apertura`, `tracking_id`) VALUES
(1, 6, 'angbrunosa@gmai.com', NULL, NULL, 'ciao', NULL, '2025-09-20 17:15:45', 0, NULL, '974c346a-4882-4b6e-94a3-a1aa09163788'),
(74, 3, 'angbrunosa@gmail.com', NULL, NULL, 'prova da locale', '<p>saluti</p>', '2025-09-20 17:15:45', 0, NULL, '46bb71fe-e807-4df7-af08-8075341d8fde'),
(75, 3, 'angbrunosa@gmail.com', '', '', 'sss', '<p>ssss</p>', '2025-09-24 15:48:06', 0, NULL, 'f84f6674-4328-4dd4-8aa6-5b62c061c445'),
(76, 3, 'amerigo.celia@gmail.com', '', '', 'file fatture', '<p>in allegato quanto in oggetto	</p><p>saluti </p><p>Angelo</p><p><br></p>', '2025-09-26 09:56:08', 0, NULL, '2f87e111-76cc-4df8-9ffa-a44d26f722f2'),
(77, 3, 'mimmaforte@gmail.com', '', '', 'saluti', '<p>saluti</p>', '2025-09-26 18:53:58', 0, NULL, '646ba121-7ce8-4cc7-8973-ae2249e02397'),
(78, 3, 'angbrunosa@gmail.com', '', '', 'fff', '<p>ffff</p>', '2025-09-26 19:07:36', 0, NULL, '8d6a311e-b726-4cd0-b4cc-0429c63a9e4d');

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `email_inviate`
--
ALTER TABLE `email_inviate`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tracking_id` (`tracking_id`),
  ADD KEY `id_utente_mittente` (`id_utente_mittente`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `email_inviate`
--
ALTER TABLE `email_inviate`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=79;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `email_inviate`
--
ALTER TABLE `email_inviate`
  ADD CONSTRAINT `email_inviate_ibfk_1` FOREIGN KEY (`id_utente_mittente`) REFERENCES `utenti` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
