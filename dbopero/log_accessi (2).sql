-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Ott 17, 2025 alle 22:08
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
-- Struttura della tabella `log_accessi`
--

CREATE TABLE `log_accessi` (
  `id` bigint(20) NOT NULL,
  `id_utente` int(11) NOT NULL,
  `indirizzo_ip` varchar(45) DEFAULT NULL,
  `data_ora_accesso` timestamp NOT NULL DEFAULT current_timestamp(),
  `id_funzione_accessibile` int(11) DEFAULT NULL,
  `dettagli_azione` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `log_accessi`
--

INSERT INTO `log_accessi` (`id`, `id_utente`, `indirizzo_ip`, `data_ora_accesso`, `id_funzione_accessibile`, `dettagli_azione`) VALUES
(1, 1, '192.168.1.10', '2025-09-20 17:15:45', 5, 'Login riuscito'),
(2, 3, NULL, '2025-09-29 17:46:54', NULL, 'Creata nuova categoria catalogo: FOOD (id: 4)'),
(3, 3, NULL, '2025-09-29 17:47:49', NULL, 'Creata nuova categoria catalogo: ALIMENTARI SECCHI (id: 5)'),
(4, 3, NULL, '2025-09-29 17:48:02', NULL, 'Creata nuova categoria catalogo: LIQUIDI (id: 6)'),
(5, 3, NULL, '2025-09-29 17:48:17', NULL, 'Creata nuova categoria catalogo: ALCOLICI (id: 7)'),
(6, 3, NULL, '2025-09-29 17:48:41', NULL, 'Creata nuova categoria catalogo: BEVANDE ANALCOLICHE (id: 8)'),
(7, 3, NULL, '2025-09-29 17:48:51', NULL, 'Creata nuova categoria catalogo: SUCCHI DI FRUTTA (id: 9)'),
(8, 3, NULL, '2025-09-29 17:49:12', NULL, 'Creata nuova categoria catalogo: LISCE (id: 10)'),
(9, 3, NULL, '2025-09-29 17:49:41', NULL, 'Creata nuova categoria catalogo: GASSATE (id: 11)');

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `log_accessi`
--
ALTER TABLE `log_accessi`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_utente` (`id_utente`),
  ADD KEY `id_funzione_accessibile` (`id_funzione_accessibile`),
  ADD KEY `id_utente_2` (`id_utente`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `log_accessi`
--
ALTER TABLE `log_accessi`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `log_accessi`
--
ALTER TABLE `log_accessi`
  ADD CONSTRAINT `log_accessi_ibfk_1` FOREIGN KEY (`id_utente`) REFERENCES `utenti` (`id`),
  ADD CONSTRAINT `log_accessi_ibfk_2` FOREIGN KEY (`id_funzione_accessibile`) REFERENCES `funzioni` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
