-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Set 25, 2025 alle 19:31
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
-- Struttura della tabella `funzioni`
--

CREATE TABLE `funzioni` (
  `id` int(11) NOT NULL,
  `codice` varchar(100) NOT NULL,
  `descrizione` varchar(255) DEFAULT NULL,
  `Scorciatoia` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Indica se la funzione può essere usata come scorciatoia',
  `chiave_componente_modulo` varchar(50) DEFAULT NULL COMMENT 'La chiave del componente React del modulo a cui appartiene'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `funzioni`
--

INSERT INTO `funzioni` (`id`, `codice`, `descrizione`, `Scorciatoia`, `chiave_componente_modulo`) VALUES
(1, 'ANAGRAFICHE_VIEW', 'Permette di visualizzare l\'elenco delle anagrafiche', 0, 'AMMINISTRAZIONE'),
(2, 'ANAGRAFICHE_CREATE', 'Permette di creare una nuova anagrafica', 0, 'AMMINISTRAZIONE'),
(3, 'ANAGRAFICHE_EDIT', 'Permette di modificare un\'anagrafica esistente', 0, 'AMMINISTRAZIONE'),
(4, 'ANAGRAFICHE_DELETE', 'Permette di eliminare un\'anagrafica', 0, 'AMMINISTRAZIONE'),
(5, 'UTENTI_VIEW', 'Permette di visualizzare gli utenti della propria ditta', 1, 'AMMINISTRAZIONE'),
(26, 'PDC_VIEW', 'Visualizzazione del Piano dei Conti', 1, 'AMMINISTRAZIONE'),
(27, 'PDC_EDIT', 'Modifica e creazione voci del Piano dei Conti', 0, 'AMMINISTRAZIONE'),
(28, 'MAIL_ACCOUNTS_VIEW', 'Visualizza gli account email della ditta', 0, 'AMMINISTRAZIONE'),
(29, 'MAIL_ACCOUNTS_EDIT', 'crea e modifica gli account ditta', 0, 'AMMINISTRAZIONE'),
(30, 'UTENTI_CREATE', 'Permette di creare nuovi utenti', 0, 'AMMINISTRAZIONE'),
(31, 'UTENTI_EDIT', 'Permette di modificare i dati degli utenti', 0, 'AMMINISTRAZIONE'),
(32, 'AddressBookManager', 'gestione della rubrica \r\ncon liste di distribuzione', 1, 'MAIL'),
(34, 'RUBRICA_VIEW', 'Visualizza la rubrica aziendale', 1, 'RUBRICA'),
(35, 'RUBRICA_MANAGE', 'Crea e modifica contatti e liste di distribuzione', 1, 'RUBRICA'),
(36, 'PPA_MODULE', 'PERMETTE DI GESTIRE LA LOGICA E LO SPVILUPPO DEL PPA PROCEDURE PROCESSI AZIONI', 1, 'AMMINISTRAZIONE'),
(37, 'PROGRESSIVI_MANAGE', 'gestione di tutti i progressivi ditta\r\nprotocollo contabile\r\nnumero doc ', 0, NULL),
(38, 'FIN_SMART', 'gestione finanze', 1, 'FIN_SMART'),
(70, 'BS_VIEW_BENI', 'Permette di visualizzare l\'elenco dei beni.\r\ndi beni strumentali', 1, 'BSSMART'),
(71, 'BS_MANAGE_CATEGORIE', 'Permette di creare e modificare le categorie. DEI BENI STRUMENTALI', 0, 'BSSMART'),
(72, 'BS_VIEW_SCADENZE', 'GESTIONE SCADENZE BS', 0, 'BSSMART'),
(73, 'BS_CREATE_BENE', 'CREA UN NUOVO BENE', 0, 'BSSMART'),
(74, 'BS_EDIT_BENE', 'MODIFICHE SUL BENE', 0, 'BSSMART'),
(75, 'BS_DELETE_BENE', 'Permette di eliminare un bene.', 0, 'BSSMART'),
(80, 'PPA_SIS_MODULE_VIEW', 'accesso al modulo ppa ', 0, 'PPA SIS'),
(81, 'PPA_DESIGN_PROCEDURE', 'funzione di progettazione delle ppa', 0, 'PPA SIS'),
(82, 'PPA_ASSIGN_PROCEDURE', 'assegnazione delle ppa', 0, 'PPA SIS'),
(83, 'PPA_VIEW_MY_TASKS', NULL, 1, 'PPA SIS'),
(84, 'PPA_MONITOR_ALL', 'verifica tutte le ppa aziendali', 0, 'PPA SIS');

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `funzioni`
--
ALTER TABLE `funzioni`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codice` (`codice`),
  ADD KEY `fk_funzioni_moduli` (`chiave_componente_modulo`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `funzioni`
--
ALTER TABLE `funzioni`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=85;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `funzioni`
--
ALTER TABLE `funzioni`
  ADD CONSTRAINT `fk_funzioni_moduli` FOREIGN KEY (`chiave_componente_modulo`) REFERENCES `moduli` (`chiave_componente`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
