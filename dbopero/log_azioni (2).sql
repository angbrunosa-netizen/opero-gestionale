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
(21, 3, 1, 'eliminazione', 'eliminata categoria catalogo: SUCCHI DI FRUTTA (id: 9)', '2025-09-29 18:45:41'),
(22, 3, 1, 'Creazione Categoria Catalogo', 'Creata categoria: 001 - MERCI (ID: 15)', '2025-09-29 19:00:38'),
(23, 3, 1, 'Creazione Categoria Catalogo', 'Creata categoria: 001.001 - FOOD (ID: 16)', '2025-09-29 19:00:53'),
(24, 3, 1, 'Creazione Categoria Catalogo', 'Creata categoria: 001.002 - NO FOOD (ID: 17)', '2025-09-29 19:01:14'),
(25, 3, 1, 'Creazione Categoria Catalogo', 'Creata categoria: 001.001.001 - DEPERIBILI (ID: 18)', '2025-09-29 19:01:34'),
(26, 3, 1, 'Creazione Categoria Catalogo', 'Creata categoria: 002 - SERVIZI (ID: 19)', '2025-09-29 19:07:17'),
(27, 3, 1, 'Creazione Categoria Catalogo', 'Creata categoria: 003 - LAVORAZIONI (ID: 20)', '2025-09-29 19:07:35'),
(28, 3, 1, 'Creazione Aliquota IVA', 'Creata nuova aliquota: 37 - IVA 37% (37%)', '2025-09-30 13:43:00'),
(29, 3, 1, 'Eliminazione Aliquota IVA', 'Eliminata aliquota ID: 6', '2025-09-30 14:17:54'),
(30, 3, 1, 'Creazione Unità di Misura', 'Creata nuova unità di misura: PZ - PEZZI', '2025-09-30 14:45:41'),
(31, 3, 1, 'Creazione Unità di Misura', 'Creata nuova unità di misura: CT - CARTONI', '2025-09-30 14:45:59'),
(32, 3, 1, 'Creazione Categoria Catalogo', 'Creata categoria: 001.001.002 - LIQUIDI (ID: 21)', '2025-09-30 17:18:23'),
(33, 3, 1, 'Creazione Categoria Catalogo', 'Creata categoria: 001.001.003 - DISPENSA (ID: 22)', '2025-09-30 17:18:50'),
(34, 3, 1, 'Creazione Categoria Catalogo', 'Creata categoria: 001.001.004 - FRESCHI (ID: 23)', '2025-09-30 17:19:17'),
(35, 3, 1, 'Creazione Categoria Catalogo', 'Creata categoria: 001.001.001.001 - SURGELATI (ID: 24)', '2025-09-30 17:19:44'),
(36, 3, 1, 'Eliminazione Categoria Catalogo', 'Eliminata categoria: 001.001.004 - FRESCHI (id: 23)', '2025-09-30 17:20:15'),
(37, 3, 1, 'Creazione Categoria Catalogo', 'Creata categoria: 001.001.001.002 - FRESCHI (ID: 25)', '2025-09-30 17:20:38'),
(38, 3, 1, 'Creazione Categoria Catalogo', 'Creata categoria: 001.002.001 - IGIENE CASA (ID: 26)', '2025-09-30 17:21:11'),
(39, 3, 1, 'Creazione Categoria Catalogo', 'Creata categoria: 001.002.002 - IGIENE CASA (ID: 27)', '2025-09-30 17:21:12'),
(40, 3, 1, 'Creazione Categoria Catalogo', 'Creata categoria: 001.002.002 - IGIENE CASA (ID: 28)', '2025-09-30 17:21:20'),
(41, 3, 1, 'Eliminazione Categoria Catalogo', 'Eliminata categoria: 001.002.002 - IGIENE CASA (id: 28)', '2025-09-30 17:21:32'),
(42, 3, 1, 'Eliminazione Categoria Catalogo', 'Eliminata categoria: 001.002.002 - IGIENE CASA (id: 27)', '2025-09-30 17:21:35'),
(43, 3, 1, 'Creazione Categoria Catalogo', 'Creata categoria: 001.002.002 - IGIENE PERSONA (ID: 29)', '2025-09-30 17:21:51'),
(44, 3, 1, 'Creazione Unità di Misura', 'Creata nuova unità di misura: KG - Chilogrammi', '2025-09-30 17:43:33'),
(45, 3, 1, 'Creazione Unità di Misura', 'Creata nuova unità di misura: LT - LITRO', '2025-09-30 17:43:45'),
(46, 3, 1, 'Modifica Stato Entità', 'Modificato stato ID: 1', '2025-09-30 17:52:10'),
(47, 3, 1, 'Modifica Stato Entità', 'Modificato stato ID: 1', '2025-09-30 17:52:18'),
(48, 3, 1, 'Importazione CSV Catalogo', 'Importate 0 nuove entità. Errori: 6.', '2025-09-30 19:49:01'),
(49, 3, 1, 'Importazione CSV Catalogo', 'Importate 6 nuove entità. Errori: 0.', '2025-10-01 13:30:45'),
(50, 3, 1, 'Importazione CSV Catalogo', 'Create: 0, Aggiornate: 0, Ignorate: 6. Errori: 0.', '2025-10-01 13:42:55'),
(51, 3, 1, 'Importazione CSV Catalogo', 'Create: 0, Aggiornate: 0, Ignorate: 6. Errori: 0.', '2025-10-01 13:44:20'),
(52, 3, 1, 'Importazione CSV Catalogo', 'Create: 0, Aggiornate: 6, Ignorate: 0. Errori: 0.', '2025-10-01 13:57:54'),
(53, 3, 1, 'Importazione CSV Catalogo', 'Create: 0, Aggiornate: 6, Ignorate: 0. Errori: 0.', '2025-10-01 13:58:23'),
(54, 3, 1, 'Importazione CSV Catalogo', 'Create: 0, Aggiornate: 6, Ignorate: 0. Errori: 0.', '2025-10-01 13:58:52'),
(55, 3, 1, 'Importazione CSV Catalogo', 'Create: 0, Aggiornate: 0, Ignorate: 6. Errori: 0.', '2025-10-01 14:02:51'),
(56, 3, 1, 'Importazione CSV Catalogo', 'Create: 0, Aggiornate: 6, Ignorate: 0. Errori: 0.', '2025-10-01 14:03:36'),
(57, 3, 1, 'Importazione CSV Catalogo', 'Create: 0, Aggiornate: 6, Ignorate: 0. Errori: 0.', '2025-10-01 14:08:15'),
(58, 3, 1, 'Importazione CSV Catalogo', 'Create: 0, Aggiornate: 6, Ignorate: 0. Errori: 0.', '2025-10-01 14:08:58'),
(59, 3, 1, 'Importazione CSV Catalogo', 'Create: 0, Aggiornate: 6, Ignorate: 0. Errori: 0.', '2025-10-01 14:12:38'),
(60, 3, 1, 'Importazione CSV Catalogo', 'Create: 0, Aggiornate: 6, Ignorate: 0. Errori: 0.', '2025-10-01 14:13:19'),
(61, 3, 1, 'Importazione CSV Catalogo', 'Create: 0, Aggiornate: 6, Ignorate: 0. Errori: 0.', '2025-10-01 14:17:02'),
(62, 3, 1, 'Importazione CSV Catalogo', 'Create: 0, Aggiornate: 0, Ignorate: 6. Errori: 0.', '2025-10-01 14:17:13'),
(63, 3, 1, 'Importazione CSV Catalogo', 'Create: 0, Aggiornate: 0, Ignorate: 6. Errori: 0.', '2025-10-01 14:30:13'),
(64, 3, 1, 'Importazione CSV Catalogo', 'Create: 0, Aggiornate: 6, Ignorate: 0. Errori: 0.', '2025-10-01 14:30:28'),
(65, 3, 1, 'Modifica Entità Catalogo', 'Modificata entità: 300411050 (ID: 1)', '2025-10-01 14:37:56'),
(66, 3, 1, 'Modifica Entità Catalogo', 'Modificata entità: 300411050 (ID: 1)', '2025-10-01 14:38:02'),
(67, 3, 1, 'Modifica Entità Catalogo', 'Modificata entità: 305020007 (ID: 3)', '2025-10-01 14:38:10'),
(68, 3, 1, 'Modifica Entità Catalogo', 'Modificata entità: 305770007 (ID: 4)', '2025-10-01 14:38:14'),
(69, 3, 1, 'Modifica Entità Catalogo', 'Modificata entità: 305770009 (ID: 5)', '2025-10-01 14:38:18'),
(70, 3, 1, 'Modifica Entità Catalogo', 'Modificata entità: 305770009 (ID: 5)', '2025-10-01 14:38:40'),
(71, 3, 1, 'Modifica Entità Catalogo', 'Modificata entità: 300411050 (ID: 1)', '2025-10-01 14:40:47'),
(72, 3, 1, 'Modifica Entità Catalogo', 'Modificata entità: 3004110500 (ID: 1)', '2025-10-01 14:40:55'),
(73, 3, 1, 'Modifica Entità Catalogo', 'Modificata entità: 305770009 (ID: 5)', '2025-10-01 14:43:56'),
(74, 3, 1, 'Creazione Entità Catalogo', 'Creata nuova entità: 3004110509 - ARTICOLO', '2025-10-01 15:14:44'),
(75, 3, 1, 'Importazione CSV Catalogo', 'Create: 0, Aggiornate: 6, Ignorate: 0. Errori: 0.', '2025-10-01 15:53:42'),
(76, 3, 1, 'Modifica Entità Catalogo', 'Modificata entità: 3004110509 (ID: 13)', '2025-10-01 15:53:55'),
(77, 3, 1, 'Modifica Entità Catalogo', 'Modificata entità: 300411050 (ID: 1)', '2025-10-01 18:09:19'),
(78, 3, 1, 'Creazione Listino', 'Creato nuovo listino \"base\" per entità ID 1', '2025-10-01 18:09:47'),
(79, 3, 1, 'Modifica Listino', 'Modificato listino ID: 1', '2025-10-01 18:10:16'),
(80, 3, 1, 'Modifica Listino', 'Modificato listino ID: 1', '2025-10-01 18:10:26'),
(81, 3, 1, 'Creazione Listino', 'Creato nuovo listino \"futuro\" per entità ID 1', '2025-10-01 18:11:08'),
(82, 3, 1, 'Modifica Listino', 'Modificato listino ID: 2', '2025-10-02 07:31:56'),
(83, 3, 1, 'Aggiunta EAN', 'Aggiunto EAN 8006473903932 a entità ID 1', '2025-10-02 12:58:05'),
(84, 3, 1, 'Creazione Listino', 'Creato nuovo listino \"attuale\" per entità ID 1', '2025-10-02 13:42:23'),
(85, 3, 1, 'Creazione Codice Fornitore', 'Aggiunto codice \'10\' all\'articolo ID 1. Nuovo ID: 1', '2025-10-02 14:16:22'),
(86, 3, 1, 'Modifica Listino', 'Modificato listino ID: 3', '2025-10-03 07:26:25'),
(87, 3, 1, 'Eliminazione Listino', 'Eliminato listino ID: 1', '2025-10-03 07:27:06'),
(88, 3, 1, 'Creazione Tipo Scadenza Bene', 'ID: 1, Descrizione: SCADENZE MECCANICHE', '2025-10-04 15:52:30'),
(89, 3, 1, 'Creazione Scadenza Bene', 'ID Scadenza: 1, per bene ID: 1', '2025-10-04 15:53:03'),
(90, 3, 1, 'Creazione Scadenza Bene', 'ID Scadenza: 2, per bene ID: 1', '2025-10-04 15:53:07'),
(91, 3, 1, 'Eliminazione Scadenza Bene', 'ID Scadenza: 1', '2025-10-04 15:53:18'),
(92, 3, 1, 'Creazione Registrazione Contabile', 'ID Testata: 35, Funzione: 9', '2025-10-06 16:12:58'),
(95, 5, 1, 'Creazione Elemento PDC', 'Tipo: Sottoconto, Codice: 10.01.003, Desc: AUTOCARRI TARGATI', '2025-10-15 21:05:09'),
(96, 5, 1, 'Creazione Elemento PDC', 'Tipo: Sottoconto, Codice: 60.01.002, Desc: materiale da imballo', '2025-10-15 21:09:43'),
(97, 3, 1, 'SBLOCCO_UTENTE', 'L\'utente 3 ha sbloccato l\'account ID: 31', '2025-10-16 22:49:10'),
(98, 3, 1, 'SBLOCCO_UTENTE', 'L\'utente 3 ha sbloccato l\'account ID: 9', '2025-10-16 22:49:20');

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `log_azioni`
--
ALTER TABLE `log_azioni`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_utente` (`id_utente`),
  ADD KEY `id_ditta` (`id_ditta`),
  ADD KEY `id_utente_2` (`id_utente`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `log_azioni`
--
ALTER TABLE `log_azioni`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=99;

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
