-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Ott 30, 2025 alle 20:54
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
(10, 'ADMIN_FUNZIONI_VIEW', 'Visualizza pannello gestione funzioni', 0, 'ADMIN_PANEL'),
(11, 'ADMIN_FUNZIONI_MANAGE', 'Crea/modifica/associa funzioni alle ditte', 0, 'ADMIN_PANEL'),
(13, 'ADMIN_RUOLI_VIEW', 'Visualizza pannello ruoli e permessi di ditta', 0, 'ADMIN_PANEL'),
(14, 'ADMIN_RUOLI_MANAGE', 'Crea/modifica ruoli e assegna permessi', 0, 'ADMIN_PANEL'),
(15, 'FUNZIONI_MANAGE', 'INSERIRE E GESTIRE LE FUNZIONI\r\n', 0, 'ADMIN_PANEL'),
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
(72, 'BS_VIEW_SCADENZE', 'GESTIONE SCADENZE BS', 1, 'BSSMART'),
(73, 'BS_CREATE_BENE', 'CREA UN NUOVO BENE', 0, 'BSSMART'),
(74, 'BS_EDIT_BENE', 'MODIFICHE SUL BENE', 0, 'BSSMART'),
(75, 'BS_DELETE_BENE', 'Permette di eliminare un bene.', 0, 'BSSMART'),
(76, 'BS_MANAGE_SCADENZE', 'MANAGERE SCADENZE BENI STRUMENTALI', 0, 'BSSMART'),
(77, 'BS_MANAGE_TIPI_SCADENZE', 'gestire i tipi di scandenze', 0, 'BSSMART'),
(80, 'PPA_SIS_MODULE_VIEW', 'accesso al modulo ppa ', 0, 'PPA SIS'),
(81, 'PPA_DESIGN_PROCEDURE', 'funzione di progettazione delle ppa', 0, 'PPA SIS'),
(82, 'PPA_ASSIGN_PROCEDURE', 'assegnazione delle ppa', 0, 'PPA SIS'),
(83, 'PPA_VIEW_MY_TASKS', NULL, 1, 'PPA SIS'),
(84, 'PPA_MONITOR_ALL', 'verifica tutte le ppa aziendali', 0, 'PPA SIS'),
(90, 'CT_VIEW', 'visualizza modulo catalogo', 0, 'CT_VIEW'),
(91, 'CT_MANAGE', 'Per la creazione e modifica delle entità del catalogo (categorie, articoli).', 0, 'CT_VIEW'),
(92, 'CT_COMPOSITI_MANAGE', 'Per la gestione specifica dei prodotti compositi..', 0, 'CT_VIEW'),
(93, 'MG_GIACENZE_VIEW', ' Per la sola visualizzazione delle giacenze di magazzino.\r\n\r\n', 0, 'CT_VIEW'),
(94, 'MG_MOVIMENTI_CREATE', ' Per poter effettuare movimenti di magazzino (carico/scarico).', 1, 'CT_VIEW'),
(95, 'MG_CONFIG_MANAGE', ' Per la configurazione delle tabelle di supporto al magazzino ', 0, 'CT_VIEW'),
(96, 'CT_IVA_MANAGE', 'visualizzazione e manutenzione iva', 0, 'CT_VIEW'),
(97, 'CT_UM_MANAGE', 'GESTIONE UNTIA DI MISURA', 0, 'CT_VIEW'),
(98, 'CT_STATI_MANAGE', 'Gestione Stati Entità Catalogo', 0, 'CT_VIEW'),
(99, 'CT_IMPORT_CSV', 'Importa Entità Catalogo da CSV', 0, 'CT_VIEW'),
(100, 'CT_LISTINI_VIEW', 'visualizza listini catalogo', 0, 'CT_VIEW'),
(101, 'CT_LISTINI_MANAGE', 'Gestione (creazione/modifica/eliminazione) listini di vendita del catalogo', 0, 'CT_VIEW'),
(102, 'CT_EAN_VIEW', 'visualizza EAN', 0, 'CT_VIEW'),
(103, 'CT_EAN_MANAGE', 'gestisci EAN', 0, 'CT_VIEW'),
(104, 'CT_COD_FORN_VIEW', 'visualizza i codici entità fornitroi', 0, 'CT_VIEW'),
(105, 'CT_COD_FORN_MANAGE', 'gestire i codici entità fornitroi', 0, 'CT_VIEW'),
(106, 'MG_VIEW', 'visualizzare il modulo Magazzino nel menu.\r\n', 0, 'MG_VIEW'),
(107, 'MG_MOVIMENTI_MANAGE', 'GESTISCE I MOVIMENTI', 0, 'MG_VIEW'),
(108, 'CT_IVA_VIEW', 'visualizza tabella iva', 0, 'CT_VIEW'),
(109, 'VA_CLIENTI_VIEW', 'VISUALIZZA MODULO VENDITE', 0, 'VA_CLIENTI_VIEW'),
(110, 'VA_CLIENTI_MANAGE', 'ORGANIZZA MODULO VENDITE', 0, 'VA_CLIENTI_VIEW'),
(115, 'ADMIN_USER_PERMISSIONS_MANAGE', 'Gestione permessi personalizzati per utente', 0, 'ADMIN_PANEL'),
(116, 'VA_TIPI_DOC_MANAGE', 'PERMETTE DI GESTIRE I DOCUMENTI DEL MODULO VENDITE E AQUISTE CREAZIONE MODIFICA', 0, 'VA_CLIENTI_VIEW'),
(117, 'VA_TIPI_DOC_VIEW', 'VISUALIZZARE I TIPI DI DOCUMENTI DI MAGAZZINO VENDITE E ACQUISTI', 0, 'VA_CLIENTI_VIEW'),
(118, 'ADMIN_LOGS_VIEW', 'GESTIRE I LOG DITTA', 0, 'ADMIN_PANEL'),
(119, 'ADMIN_SESSIONS_VIEW', 'GESTIRE LE CONNESSIONI UTENTE DITTA', 0, 'ADMIN_PANEL'),
(120, 'ADM_PWD_REC', 'PERMETTERE L\'EMISSIONE DI UN LINK DI RECUPERO PASSWORD UTENTE', 0, 'ADMIN_PANEL'),
(121, 'AM_UTE_LVL', 'GESTIRE LIVELLO UTENTE', 0, 'ADMIN_PANEL'),
(122, 'PRIVACY_MANAGE', 'gestione della policy privacy', 0, 'ADMIN_PANEL'),
(123, 'SUPER_ADMIN', 'ASSEGNAZIONE MODULI PER DITTA', 0, 'ADMIN_PANEL'),
(124, 'AM_UTENTI_EDIT', 'MODIFICA UTENTI AMMINISTRAZIONE', 0, 'AMMINISTRAZIONE'),
(127, 'MAIL_ACC_EDIT', 'GESTIRE E CREARE ACCOUNT', 0, 'AMMINISTRAZIONE');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=128;

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
