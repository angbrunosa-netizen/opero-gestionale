-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Set 27, 2025 alle 21:52
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
-- Struttura della tabella `ditta_mail_accounts`
--

CREATE TABLE `ditta_mail_accounts` (
  `id` int(11) NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `id_utente_creazione` int(11) DEFAULT NULL,
  `nome_account` varchar(255) NOT NULL,
  `email_address` varchar(255) NOT NULL,
  `imap_host` varchar(255) NOT NULL,
  `imap_port` int(11) NOT NULL DEFAULT 993,
  `smtp_host` varchar(255) NOT NULL,
  `smtp_port` int(11) NOT NULL DEFAULT 465,
  `auth_user` varchar(255) NOT NULL,
  `auth_pass` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `ditta_mail_accounts`
--

INSERT INTO `ditta_mail_accounts` (`id`, `id_ditta`, `id_utente_creazione`, `nome_account`, `email_address`, `imap_host`, `imap_port`, `smtp_host`, `smtp_port`, `auth_user`, `auth_pass`) VALUES
(9, 3, NULL, 'DifamConsegneGmail', 'difamconsegne@gmail.com', 'imap.gmail.com', 993, 'smtp.gmail.com', 465, 'difamconsegne@gmail.com', 'd12d71b072f38f15aa9693640f02224f:24b11118a6603262259e59beecdbdce7602f6660f4a4dc89cfb10dbfebc9c9da'),
(10, 3, NULL, 'Mail Cedibef', 'opero@difam.it', 'imaps.aruba.it', 993, 'smtps.aruba.it', 465, 'opero@difam.it', '626f6ce6b770d4acce16029cd33f817b:79a53cf6cd29cc71bccffb3f5bcabb99'),
(11, 1, 9, 'MASTER OPERO', 'opero@difam.it', 'imaps.aruba.it', 993, 'smtps.aruba.it', 465, 'opero@difam.it', '1b6622c1617dafdddbf644896cccf9fc:a48333991689f1bb7f3a7fe72d855664'),
(13, 1, NULL, 'Opero Gestionale', 'info@difam.it', 'imaps.aruba.it', 993, 'smtps.aruba.it', 465, 'info@difam.it', '4327ead53f24d37d54810cfcc71e66b4:e75dc1e3489ac06dc88c596ad82b25bd');

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `ditta_mail_accounts`
--
ALTER TABLE `ditta_mail_accounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id_ditta` (`id_ditta`,`email_address`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `ditta_mail_accounts`
--
ALTER TABLE `ditta_mail_accounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `ditta_mail_accounts`
--
ALTER TABLE `ditta_mail_accounts`
  ADD CONSTRAINT `fk_ditta_mail_accounts_id_ditta` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
