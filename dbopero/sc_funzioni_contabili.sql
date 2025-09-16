-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Set 16, 2025 alle 20:25
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
-- Struttura della tabella `sc_funzioni_contabili`
--

CREATE TABLE `sc_funzioni_contabili` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(11) NOT NULL,
  `codice_funzione` varchar(20) NOT NULL,
  `nome_funzione` varchar(100) NOT NULL,
  `descrizione` text DEFAULT NULL,
  `categoria` varchar(50) DEFAULT NULL,
  `tipo_funzione` enum('Primaria','Secondaria','Finanziaria','Sistema') NOT NULL DEFAULT 'Primaria',
  `attiva` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `sc_funzioni_contabili`
--

INSERT INTO `sc_funzioni_contabili` (`id`, `id_ditta`, `codice_funzione`, `nome_funzione`, `descrizione`, `categoria`, `tipo_funzione`, `attiva`, `created_at`, `updated_at`) VALUES
(9, 1, 'REG-FATT-ACQ', 'Registrazione Fattura Acquisto', 'Registra una fattura da fornitore, gestisce l\'IVA e crea la partita aperta nello scadenzario.', 'Acquisti', 'Finanziaria', 1, '2025-09-08 09:44:24', '2025-09-08 09:44:24'),
(11, 1, 'DARE_AVERE', 'DARE AVERE', 'questa funzione permette all\'utente di scegliere i conti ', 'Generale', 'Primaria', 1, '2025-09-08 14:09:00', '2025-09-08 14:09:00'),
(12, 1, 'REG-FATT-VENDITA', 'Registrazione Fattura Vendita', 'REGISTRAZIONE MANUALE FATTURA2', 'Vendite', 'Finanziaria', 1, '2025-09-09 16:49:31', '2025-09-09 16:49:31'),
(13, 1, '', 'Versamento In banca ', 'registra le operazioni di giroconto dal conto cassa al conto Banca . L\'utente sceglierà il sottoconto della banca', '', 'Primaria', 1, '2025-09-11 08:17:51', '2025-09-11 08:17:51'),
(23, 1, '1', 'INCASSO FATTURA VENDITA', 'Incasso da cliente ', 'Pagamenti', 'Finanziaria', 1, '2025-09-15 13:51:32', '2025-09-15 13:51:32');

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `sc_funzioni_contabili`
--
ALTER TABLE `sc_funzioni_contabili`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sc_funzioni_contabili_id_ditta_codice_funzione_unique` (`id_ditta`,`codice_funzione`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `sc_funzioni_contabili`
--
ALTER TABLE `sc_funzioni_contabili`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
