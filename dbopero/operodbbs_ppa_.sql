-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Set 23, 2025 alle 09:15
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
-- Struttura della tabella `ppa_azioni`
--

CREATE TABLE `ppa_azioni` (
  `ID` int(10) UNSIGNED NOT NULL,
  `ID_Processo` int(10) UNSIGNED NOT NULL,
  `NomeAzione` varchar(255) NOT NULL,
  `Descrizione` text DEFAULT NULL,
  `ID_RuoloDefault` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `ppa_azioni`
--

INSERT INTO `ppa_azioni` (`ID`, `ID_Processo`, `NomeAzione`, `Descrizione`, `ID_RuoloDefault`) VALUES
(1, 4, 'Verifica strutture di vendita', 'Nel corso del primo appuntamento nella sede del cliente, è essenziale verificare lo stato dei punti vendita.  Verificare qualità assortimento - adeguatezza del personale - formazione del personale- qualità e completezza delle attrezzature - ', 3),
(21, 15, 'consegna al cliente', 'dimostrazione al cliente delle lavorazione eseguite\ne firma ricezione capo', 3);

-- --------------------------------------------------------

--
-- Struttura della tabella `ppa_istanzeazioni`
--

CREATE TABLE `ppa_istanzeazioni` (
  `ID` int(11) NOT NULL,
  `ID_IstanzaProcedura` int(11) NOT NULL,
  `ID_Azione` int(10) UNSIGNED NOT NULL,
  `ID_UtenteAssegnato` int(11) NOT NULL,
  `ID_Stato` int(11) DEFAULT NULL,
  `DataScadenza` date DEFAULT NULL,
  `DataCompletamento` datetime DEFAULT NULL,
  `NoteSvolgimento` text DEFAULT NULL,
  `NoteParticolari` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `ppa_istanzeazioni`
--

INSERT INTO `ppa_istanzeazioni` (`ID`, `ID_IstanzaProcedura`, `ID_Azione`, `ID_UtenteAssegnato`, `ID_Stato`, `DataScadenza`, `DataCompletamento`, `NoteSvolgimento`, `NoteParticolari`) VALUES
(1, 1, 1, 31, 1, NULL, NULL, NULL, NULL),
(51, 10, 8, 6, NULL, '2025-10-30', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Struttura della tabella `ppa_istanzeprocedure`
--

CREATE TABLE `ppa_istanzeprocedure` (
  `ID` int(11) NOT NULL,
  `TargetEntityType` varchar(20) NOT NULL,
  `TargetEntityID` int(10) UNSIGNED NOT NULL,
  `ID_ProceduraDitta` int(10) UNSIGNED NOT NULL,
  `ID_UtenteCreatore` int(11) NOT NULL COMMENT 'L''utente che ha avviato la procedura',
  `DataInizio` datetime NOT NULL DEFAULT current_timestamp(),
  `DataPrevistaFine` date DEFAULT NULL,
  `DataConclusioneEffettiva` datetime DEFAULT NULL,
  `Stato` enum('In Corso','Completata','Annullata') NOT NULL DEFAULT 'In Corso',
  `Esito` text DEFAULT NULL COMMENT 'Note conclusive sulla procedura'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `ppa_istanzeprocedure`
--

INSERT INTO `ppa_istanzeprocedure` (`ID`, `TargetEntityType`, `TargetEntityID`, `ID_ProceduraDitta`, `ID_UtenteCreatore`, `DataInizio`, `DataPrevistaFine`, `DataConclusioneEffettiva`, `Stato`, `Esito`) VALUES
(1, 'DITTA', 6, 2, 3, '2025-09-20 19:15:45', '2025-10-24', NULL, 'In Corso', NULL),
(5, 'DITTA', 7, 2, 3, '2025-09-20 19:15:45', '2025-08-30', NULL, 'In Corso', NULL),
(6, 'DITTA', 6, 1, 3, '2025-09-20 19:15:45', '2025-08-24', NULL, 'In Corso', NULL),
(7, 'DITTA', 6, 1, 3, '2025-09-20 19:15:45', '2025-08-30', NULL, 'In Corso', NULL),
(8, 'DITTA', 6, 2, 3, '2025-09-20 19:15:45', '2025-08-24', NULL, 'In Corso', NULL),
(9, 'DITTA', 6, 6, 3, '2025-09-20 19:15:45', '2025-11-29', NULL, 'In Corso', NULL),
(10, 'DITTA', 14, 2, 3, '2025-09-20 19:15:45', '2025-10-30', NULL, 'In Corso', NULL);

-- --------------------------------------------------------

--
-- Struttura della tabella `ppa_procedureditta`
--

CREATE TABLE `ppa_procedureditta` (
  `ID` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `ID_ProceduraStandard` int(10) UNSIGNED NOT NULL,
  `NomePersonalizzato` varchar(255) NOT NULL,
  `TargetEntityTypeAllowed` varchar(20) NOT NULL DEFAULT 'DITTA',
  `Attiva` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `ppa_procedureditta`
--

INSERT INTO `ppa_procedureditta` (`ID`, `id_ditta`, `ID_ProceduraStandard`, `NomePersonalizzato`, `TargetEntityTypeAllowed`, `Attiva`) VALUES
(1, 1, 1, 'Gruppo G%G spa ', 'DITTA', 1),
(2, 1, 2, 'Nuovi Clienti Top', 'DITTA', 1),
(3, 1, 3, 'prodotti venduti on line', 'DITTA', 1),
(4, 1, 1, 'Verifica Documenti', 'DITTA', 1),
(5, 1, 1, 'Tagliano Auto-FuoriGaranzia', 'DITTA', 1),
(6, 1, 1, 'Gestione Cliente Associato', 'DITTA', 1),
(7, 1, 2, 'lavorazione_sartoria', 'DITTA', 1);

-- --------------------------------------------------------

--
-- Struttura della tabella `ppa_procedurestandard`
--

CREATE TABLE `ppa_procedurestandard` (
  `ID` int(10) UNSIGNED NOT NULL,
  `CodiceProcedura` varchar(100) NOT NULL,
  `Descrizione` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `ppa_procedurestandard`
--

INSERT INTO `ppa_procedurestandard` (`ID`, `CodiceProcedura`, `Descrizione`) VALUES
(1, 'ONBOARDING_CLIENTE', 'Flusso standard per l\'acquisizione di un nuovo cliente'),
(2, 'GESTIONE_ORDINE', 'Flusso standard per la gestione di un ordine di vendita'),
(3, 'RIPARAZIONE_PRODOTTO', 'Flusso standard per la riparazione di un prodotto in garanzia');

-- --------------------------------------------------------

--
-- Struttura della tabella `ppa_processi`
--

CREATE TABLE `ppa_processi` (
  `ID` int(10) UNSIGNED NOT NULL,
  `ID_ProceduraDitta` int(10) UNSIGNED NOT NULL,
  `NomeProcesso` varchar(255) NOT NULL,
  `OrdineSequenziale` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `ppa_processi`
--

INSERT INTO `ppa_processi` (`ID`, `ID_ProceduraDitta`, `NomeProcesso`, `OrdineSequenziale`) VALUES
(1, 3, 'Stabilire contatto con Cliente - Email- Telefonico .', 0),
(2, 3, 'Verifica Consegna', 0),
(3, 3, 'Contattare il Cliente per soluzione', 0),
(4, 2, 'Appuntamento con la Direzione ', 0),
(5, 2, 'Gestione Cliente dedicata per i primi 3 mesi', 0),
(6, 2, 'Valutazione stato ', 0),
(8, 1, 'prova 1', 0),
(9, 6, 'Gestione Assortimento', 0),
(10, 6, 'Gestione Promozioni', 0),
(11, 6, 'Amministrative', 0),
(12, 4, 'raccolta dati documeti', 0),
(13, 7, 'Ricezione_Verifica_Capo', 0),
(14, 7, 'lavorazione', 0),
(15, 7, 'consegna-capo', 0);

-- --------------------------------------------------------

--
-- Struttura della tabella `ppa_stati_azione`
--

CREATE TABLE `ppa_stati_azione` (
  `ID` int(11) NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `NomeStato` varchar(100) NOT NULL,
  `Descrizione` text DEFAULT NULL,
  `Colore` varchar(7) DEFAULT '#CCCCCC'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `ppa_stati_azione`
--

INSERT INTO `ppa_stati_azione` (`ID`, `id_ditta`, `NomeStato`, `Descrizione`, `Colore`) VALUES
(1, 1, 'Assegnato', NULL, '#808080'),
(2, 1, 'Accettato', NULL, '#007bff'),
(3, 1, 'Evaso', NULL, '#28a745'),
(4, 1, 'Bloccato', NULL, '#dc3545');

-- --------------------------------------------------------

--
-- Struttura della tabella `ppa_team`
--

CREATE TABLE `ppa_team` (
  `ID` int(11) NOT NULL,
  `ID_IstanzaProcedura` int(11) NOT NULL,
  `NomeTeam` varchar(255) NOT NULL,
  `DataCreazione` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `ppa_team`
--

INSERT INTO `ppa_team` (`ID`, `ID_IstanzaProcedura`, `NomeTeam`, `DataCreazione`) VALUES
(4, 5, 'Team Procedura #5 - 23/08/2025', '2025-09-20 17:15:45'),
(5, 6, 'Team Procedura #6 - 23/08/2025', '2025-09-20 17:15:45'),
(6, 7, 'Team Procedura #7 - 23/08/2025', '2025-09-20 17:15:45'),
(7, 8, 'Team Procedura #8 - 23/08/2025', '2025-09-20 17:15:45'),
(8, 9, 'Team Procedura #9 - 25/08/2025', '2025-09-20 17:15:45'),
(9, 10, 'Team Procedura #10 - 26/08/2025', '2025-09-20 17:15:45');

-- --------------------------------------------------------

--
-- Struttura della tabella `ppa_teammembri`
--

CREATE TABLE `ppa_teammembri` (
  `ID_Team` int(11) NOT NULL,
  `ID_Utente` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `ppa_teammembri`
--

INSERT INTO `ppa_teammembri` (`ID_Team`, `ID_Utente`) VALUES
(4, 3),
(4, 9),
(4, 31),
(4, 43),
(5, 31),
(6, 31),
(7, 3),
(7, 31),
(7, 43),
(8, 3),
(8, 31),
(8, 43),
(9, 1),
(9, 3),
(9, 6),
(9, 31),
(9, 43);

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `ppa_azioni`
--
ALTER TABLE `ppa_azioni`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `ID_RuoloDefault` (`ID_RuoloDefault`),
  ADD KEY `fk_ppa_azioni_ID_Processo` (`ID_Processo`);

--
-- Indici per le tabelle `ppa_istanzeazioni`
--
ALTER TABLE `ppa_istanzeazioni`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `ID_IstanzaProcedura` (`ID_IstanzaProcedura`),
  ADD KEY `ID_UtenteAssegnato` (`ID_UtenteAssegnato`),
  ADD KEY `ID_Stato` (`ID_Stato`),
  ADD KEY `fk_ppa_istanzeazioni_ID_Azione` (`ID_Azione`);

--
-- Indici per le tabelle `ppa_istanzeprocedure`
--
ALTER TABLE `ppa_istanzeprocedure`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `ID_UtenteCreatore` (`ID_UtenteCreatore`),
  ADD KEY `fk_ppa_istanzeprocedure_ID_ProceduraDitta` (`ID_ProceduraDitta`);

--
-- Indici per le tabelle `ppa_procedureditta`
--
ALTER TABLE `ppa_procedureditta`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `fk_ppa_procedureditta_id_ditta` (`id_ditta`),
  ADD KEY `fk_ppa_procedureditta_ID_ProceduraStandard` (`ID_ProceduraStandard`);

--
-- Indici per le tabelle `ppa_procedurestandard`
--
ALTER TABLE `ppa_procedurestandard`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `CodiceProcedura_unique` (`CodiceProcedura`);

--
-- Indici per le tabelle `ppa_processi`
--
ALTER TABLE `ppa_processi`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `fk_ppa_processi_ID_ProceduraDitta` (`ID_ProceduraDitta`);

--
-- Indici per le tabelle `ppa_stati_azione`
--
ALTER TABLE `ppa_stati_azione`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `fk_ppa_stati_azione_id_ditta` (`id_ditta`);

--
-- Indici per le tabelle `ppa_team`
--
ALTER TABLE `ppa_team`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `ID_IstanzaProcedura` (`ID_IstanzaProcedura`);

--
-- Indici per le tabelle `ppa_teammembri`
--
ALTER TABLE `ppa_teammembri`
  ADD PRIMARY KEY (`ID_Team`,`ID_Utente`),
  ADD KEY `ID_Utente` (`ID_Utente`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `ppa_azioni`
--
ALTER TABLE `ppa_azioni`
  MODIFY `ID` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT per la tabella `ppa_istanzeazioni`
--
ALTER TABLE `ppa_istanzeazioni`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT per la tabella `ppa_istanzeprocedure`
--
ALTER TABLE `ppa_istanzeprocedure`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT per la tabella `ppa_procedureditta`
--
ALTER TABLE `ppa_procedureditta`
  MODIFY `ID` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT per la tabella `ppa_procedurestandard`
--
ALTER TABLE `ppa_procedurestandard`
  MODIFY `ID` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT per la tabella `ppa_processi`
--
ALTER TABLE `ppa_processi`
  MODIFY `ID` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT per la tabella `ppa_stati_azione`
--
ALTER TABLE `ppa_stati_azione`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT per la tabella `ppa_team`
--
ALTER TABLE `ppa_team`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `ppa_azioni`
--
ALTER TABLE `ppa_azioni`
  ADD CONSTRAINT `fk_ppa_azioni_ID_Processo` FOREIGN KEY (`ID_Processo`) REFERENCES `ppa_processi` (`ID`),
  ADD CONSTRAINT `ppa_azioni_ibfk_2` FOREIGN KEY (`ID_RuoloDefault`) REFERENCES `ruoli` (`id`) ON DELETE SET NULL;

--
-- Limiti per la tabella `ppa_istanzeazioni`
--
ALTER TABLE `ppa_istanzeazioni`
  ADD CONSTRAINT `fk_ppa_istanzeazioni_ID_Azione` FOREIGN KEY (`ID_Azione`) REFERENCES `ppa_azioni` (`ID`),
  ADD CONSTRAINT `ppa_istanzeazioni_ibfk_1` FOREIGN KEY (`ID_IstanzaProcedura`) REFERENCES `ppa_istanzeprocedure` (`ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `ppa_istanzeazioni_ibfk_3` FOREIGN KEY (`ID_UtenteAssegnato`) REFERENCES `utenti` (`id`),
  ADD CONSTRAINT `ppa_istanzeazioni_ibfk_4` FOREIGN KEY (`ID_Stato`) REFERENCES `ppa_stati_azione` (`ID`);

--
-- Limiti per la tabella `ppa_istanzeprocedure`
--
ALTER TABLE `ppa_istanzeprocedure`
  ADD CONSTRAINT `fk_ppa_istanzeprocedure_ID_ProceduraDitta` FOREIGN KEY (`ID_ProceduraDitta`) REFERENCES `ppa_procedureditta` (`ID`),
  ADD CONSTRAINT `ppa_istanzeprocedure_ibfk_3` FOREIGN KEY (`ID_UtenteCreatore`) REFERENCES `utenti` (`id`);

--
-- Limiti per la tabella `ppa_procedureditta`
--
ALTER TABLE `ppa_procedureditta`
  ADD CONSTRAINT `fk_ppa_procedureditta_ID_ProceduraStandard` FOREIGN KEY (`ID_ProceduraStandard`) REFERENCES `ppa_procedurestandard` (`ID`),
  ADD CONSTRAINT `fk_ppa_procedureditta_id_ditta` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`);

--
-- Limiti per la tabella `ppa_processi`
--
ALTER TABLE `ppa_processi`
  ADD CONSTRAINT `fk_ppa_processi_ID_ProceduraDitta` FOREIGN KEY (`ID_ProceduraDitta`) REFERENCES `ppa_procedureditta` (`ID`);

--
-- Limiti per la tabella `ppa_stati_azione`
--
ALTER TABLE `ppa_stati_azione`
  ADD CONSTRAINT `fk_ppa_stati_azione_id_ditta` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`);

--
-- Limiti per la tabella `ppa_team`
--
ALTER TABLE `ppa_team`
  ADD CONSTRAINT `ppa_team_ibfk_1` FOREIGN KEY (`ID_IstanzaProcedura`) REFERENCES `ppa_istanzeprocedure` (`ID`) ON DELETE CASCADE;

--
-- Limiti per la tabella `ppa_teammembri`
--
ALTER TABLE `ppa_teammembri`
  ADD CONSTRAINT `ppa_teammembri_ibfk_1` FOREIGN KEY (`ID_Team`) REFERENCES `ppa_team` (`ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `ppa_teammembri_ibfk_2` FOREIGN KEY (`ID_Utente`) REFERENCES `utenti` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
