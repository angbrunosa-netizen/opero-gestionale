-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Set 29, 2025 alle 20:48
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
-- Struttura della tabella `log_azioni`
--

CREATE TABLE `log_azioni` (
  `id` bigint(20) NOT NULL,
  `id_utente` int(11) NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `azione` varchar(255) NOT NULL,
  `dettagli` text DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `log_azioni`
--

INSERT INTO `log_azioni` (`id`, `id_utente`, `id_ditta`, `azione`, `dettagli`, `timestamp`) VALUES
(1, 3, 1, 'Creazione Bene Strumentale', 'ID Bene: 1, Descrizione: PC OLIVETTI M 24', '2025-09-20 18:14:20'),
(2, 3, 1, 'Creazione Categoria Bene', 'ID: 9, Codice: MOB-REG', '2025-09-21 10:54:30'),
(3, 3, 1, 'Creazione Registrazione Contabile', 'ID Testata: 33, Funzione: 12', '2025-09-26 18:30:55'),
(4, 3, 1, 'Creazione Registrazione Contabile', 'ID Testata: 34, Funzione: 14', '2025-09-26 18:35:01'),
(5, 3, 1, 'aggiornamento', 'aggiornata categoria catalogo: ALIMENTARI LIQUIDI (id: 6)', '2025-09-29 18:01:23'),
(6, 3, 1, 'eliminazione', 'eliminata categoria catalogo: LISCE (id: 10)', '2025-09-29 18:01:35'),
(7, 3, 1, '', 'Creata nuova categoria catalogo: PRODOTTI-FISICI (id: 12)', '2025-09-29 18:06:12'),
(8, 3, 1, 'aggiornamento', 'aggiornata categoria catalogo: FOOD (id: 4)', '2025-09-29 18:06:18'),
(9, 3, 1, 'aggiornamento', 'aggiornata categoria catalogo: PRODOTTI-FISICI-MERCI (id: 12)', '2025-09-29 18:06:30'),
(10, 3, 1, '', 'Creata nuova categoria catalogo: SERVIZI (id: 13)', '2025-09-29 18:06:51'),
(11, 3, 1, '', 'Creata nuova categoria catalogo: LAVORAZIONI (id: 14)', '2025-09-29 18:07:19'),
(12, 3, 1, 'eliminazione', 'eliminata categoria catalogo: LAVORAZIONI (id: 14)', '2025-09-29 18:45:15'),
(13, 3, 1, 'eliminazione', 'eliminata categoria catalogo: PRODOTTI-FISICI-MERCI (id: 12)', '2025-09-29 18:45:18'),
(14, 3, 1, 'eliminazione', 'eliminata categoria catalogo: FOOD (id: 4)', '2025-09-29 18:45:22'),
(15, 3, 1, 'eliminazione', 'eliminata categoria catalogo: ALIMENTARI LIQUIDI (id: 6)', '2025-09-29 18:45:24'),
(16, 3, 1, 'eliminazione', 'eliminata categoria catalogo: ALCOLICI (id: 7)', '2025-09-29 18:45:28'),
(17, 3, 1, 'eliminazione', 'eliminata categoria catalogo: ALIMENTARI SECCHI (id: 5)', '2025-09-29 18:45:30'),
(18, 3, 1, 'eliminazione', 'eliminata categoria catalogo: BEVANDE ANALCOLICHE (id: 8)', '2025-09-29 18:45:33'),
(19, 3, 1, 'eliminazione', 'eliminata categoria catalogo: GASSATE (id: 11)', '2025-09-29 18:45:36'),
(20, 3, 1, 'eliminazione', 'eliminata categoria catalogo: SERVIZI (id: 13)', '2025-09-29 18:45:39'),
(21, 3, 1, 'eliminazione', 'eliminata categoria catalogo: SUCCHI DI FRUTTA (id: 9)', '2025-09-29 18:45:41');

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `log_azioni`
--
ALTER TABLE `log_azioni`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_utente` (`id_utente`),
  ADD KEY `id_ditta` (`id_ditta`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `log_azioni`
--
ALTER TABLE `log_azioni`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `log_azioni`
--
ALTER TABLE `log_azioni`
  ADD CONSTRAINT `fk_log_azioni_id_ditta` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`),
  ADD CONSTRAINT `log_azioni_ibfk_1` FOREIGN KEY (`id_utente`) REFERENCES `utenti` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
