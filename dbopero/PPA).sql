-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Set 20, 2025 alle 10:35
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
(4, 5, 'Team Procedura #5 - 23/08/2025', '2025-08-23 15:42:43'),
(5, 6, 'Team Procedura #6 - 23/08/2025', '2025-08-23 18:05:11'),
(6, 7, 'Team Procedura #7 - 23/08/2025', '2025-08-23 18:15:12'),
(7, 8, 'Team Procedura #8 - 23/08/2025', '2025-08-23 18:27:25'),
(8, 9, 'Team Procedura #9 - 25/08/2025', '2025-08-25 08:58:39'),
(9, 10, 'Team Procedura #10 - 26/08/2025', '2025-08-26 18:11:57'),
(10, 14, 'Team Procedura #14 - 20/09/2025', '2025-09-20 07:26:58'),
(11, 15, 'Team Procedura #15 - 20/09/2025', '2025-09-20 07:27:11'),
(12, 16, 'Team Procedura #16 - 20/09/2025', '2025-09-20 07:34:07'),
(13, 17, 'Team Procedura #17 - 20/09/2025', '2025-09-20 07:35:02'),
(14, 18, 'Team Procedura #18 - 20/09/2025', '2025-09-20 07:38:38'),
(15, 19, 'Team Procedura #19 - 20/09/2025', '2025-09-20 07:39:16');

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

-- --------------------------------------------------------

--
-- Struttura della tabella `privacy_policies`
--

CREATE TABLE `privacy_policies` (
  `id` int(11) NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `responsabile_trattamento` varchar(255) NOT NULL,
  `corpo_lettera` text NOT NULL,
  `data_aggiornamento` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `privacy_policies`
--

INSERT INTO `privacy_policies` (`id`, `id_ditta`, `responsabile_trattamento`, `corpo_lettera`, `data_aggiornamento`) VALUES
(1, 1, 'Angelo Breuno', '<p><br></p><p><strong>Autorizzazione al Trattamento dei Dati Personali per Finalità Commerciali e per la Comunicazione a Terzi</strong></p><p>Io sottoscritto/a,</p><p><strong>[Nome_Utente]</strong>, codice fiscale <strong>[codice fiscale]</strong>,</p><p><strong>PREMESSO CHE</strong></p><p><br></p><ul><li>ho ricevuto l\'informativa ai sensi dell’art. 13 del Regolamento (UE) 2016/679 (GDPR) relativa al trattamento dei miei dati personali da parte di <strong>[DITTA]</strong>, con sede in <strong>[indirizzo completo]</strong>,</li><li>ho compreso le finalità e le modalità del trattamento, i miei diritti e i soggetti coinvolti nel trattamento stesso,</li></ul><p><strong>AUTORIZZO</strong></p><p>il trattamento dei miei dati personali da parte di <strong>[Nome dell’Azienda]</strong> per le seguenti finalità:</p><ol><li><strong>Finalità di marketing diretto</strong>: invio di comunicazioni commerciali, promozionali e informative tramite e-mail, SMS, telefono, posta tradizionale o altri strumenti automatizzati di contatto, relative a prodotti e servizi offerti dal Titolare;</li><li><strong>Finalità di profilazione</strong>: analisi delle mie preferenze, abitudini e scelte di consumo al fine di ricevere comunicazioni personalizzate;</li><li><strong>Comunicazione a soggetti terzi</strong>: cessione e/o comunicazione dei miei dati personali a società terze, partner commerciali o altri titolari autonomi del trattamento, che potranno trattarli per proprie finalità di marketing diretto o altre attività commerciali compatibili.</li></ol><p><strong>DICHIARO</strong> inoltre di essere consapevole che:</p><p><br></p><ul><li>Il conferimento dei dati per le suddette finalità è facoltativo e l’eventuale mancato consenso non pregiudica la fruizione dei servizi principali offerti;</li><li>Posso in qualsiasi momento revocare il presente consenso, ai sensi dell’art. 7, par. 3, GDPR, scrivendo a <strong>[indirizzo email del titolare del trattamento]</strong>;</li><li>I miei diritti in merito al trattamento sono indicati negli articoli da 15 a 22 del GDPR.</li></ul><p>Luogo e data: _______________________________</p><p>Il presente documento è inviato a mezzo mail, accedendo al portale si considera accettata</p><p>non</p>', '2025-08-15 20:42:37'),
(2, 3, 'angioletto', '<p>se le informazioni le vuoi pazientarrrr</p>', '2025-08-13 10:36:33');

-- --------------------------------------------------------

--
-- Struttura della tabella `registration_tokens`
--

CREATE TABLE `registration_tokens` (
  `id` int(11) NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `token` varchar(255) NOT NULL,
  `email_destinatario` varchar(255) DEFAULT NULL,
  `scadenza` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `utilizzato` tinyint(1) DEFAULT 0,
  `data_creazione` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `registration_tokens`
--

INSERT INTO `registration_tokens` (`id`, `id_ditta`, `token`, `email_destinatario`, `scadenza`, `utilizzato`, `data_creazione`) VALUES
(1, 3, '7a92f40a-3995-4e19-b471-6c56d80c855c', NULL, '2025-08-06 14:45:35', 0, '2025-07-30 14:45:35'),
(2, 3, '0cbb7efb-2c43-4f08-a825-c40b4fef55cf', NULL, '2025-08-06 15:01:47', 0, '2025-07-30 15:01:47'),
(3, 3, '28e0cc1e-de38-42b1-be85-0996e0a27df6', NULL, '2025-08-06 15:03:16', 0, '2025-07-30 15:03:16'),
(4, 3, 'db830a35-1f34-4146-b144-f21409cd109c', NULL, '2025-07-30 15:09:02', 1, '2025-07-30 15:05:35'),
(5, 3, 'b9da1260-001e-42cc-9756-867efea4575f', NULL, '2025-07-30 15:58:51', 1, '2025-07-30 15:57:01'),
(6, 3, '67285bd9-bc67-4102-9de0-76fd478b0abc', NULL, '2025-08-06 17:37:37', 0, '2025-07-30 17:37:37'),
(7, 3, 'c790891f-fb9b-4511-b440-1788adb7cdde', NULL, '2025-07-30 18:11:16', 1, '2025-07-30 18:10:21'),
(8, 3, 'e1fdf689-ac96-43d6-9941-8a36b2b78644', NULL, '2025-08-06 18:30:16', 0, '2025-07-30 18:30:16'),
(9, 3, '2aad2d3f-6098-417c-aaf4-59d15f38b1df', NULL, '2025-08-07 17:58:58', 0, '2025-07-31 17:58:58'),
(10, 3, 'ad34591b-8ac7-4d1e-905e-c19c8d4e4716', NULL, '2025-08-16 11:14:37', 0, '2025-08-09 11:14:37'),
(11, 3, '287f815a-ce9a-4412-9a25-ba2031d850c8', NULL, '2025-08-20 10:17:40', 0, '2025-08-13 10:17:40'),
(12, 3, 'b6b13347-e535-4f9b-beb2-a621264a2859', NULL, '2025-08-20 10:22:37', 0, '2025-08-13 10:22:37'),
(13, 3, '7b95f9ba-9f57-4298-a6c9-52f027e917c4', NULL, '2025-08-20 10:24:23', 0, '2025-08-13 10:24:23'),
(14, 3, '7fe41e5c-dea0-422a-97f4-19292ef48060', NULL, '2025-08-20 10:34:18', 0, '2025-08-13 10:34:18'),
(15, 3, '94581e21-a76a-48e6-85d9-7224d5a6941a', NULL, '2025-08-20 10:36:38', 0, '2025-08-13 10:36:38'),
(16, 3, '5600c7e6-2802-410e-a954-a8f00e9286d7', NULL, '2025-08-20 10:42:04', 0, '2025-08-13 10:42:04'),
(17, 3, '30dd7f76-9881-473f-be92-3c0ec3c097be', NULL, '2025-08-20 10:42:13', 0, '2025-08-13 10:42:13'),
(18, 3, '01f371f1-3ee6-4e6d-8828-c6981019e72d', NULL, '2025-08-21 13:46:04', 0, '2025-08-14 13:46:04'),
(19, 3, 'dc7e499c-0934-4535-bb67-2831f8fd55f9', NULL, '2025-08-21 13:55:04', 0, '2025-08-14 13:55:04'),
(20, 3, '1f54acda-2478-4b20-9dfc-513349d4004a', NULL, '2025-08-14 14:10:54', 1, '2025-08-14 14:10:03'),
(21, 1, '854c0e8e-29b9-4c8d-b3a9-d7faa2a6517a', NULL, '2025-08-26 18:17:11', 0, '2025-08-19 18:17:11'),
(22, 1, 'c763de5d-2ac2-4276-a569-77698a27e7de', NULL, '2025-08-26 18:24:08', 0, '2025-08-19 18:24:08'),
(23, 1, '65b22eb5-b3b6-4ccd-ab5a-8fcdbc6b4cef', NULL, '2025-08-26 18:31:33', 0, '2025-08-19 18:31:33'),
(24, 1, '914c9081-c6a0-4710-aeef-227a74188c95', NULL, '2025-08-19 18:36:30', 1, '2025-08-19 18:35:32'),
(25, 1, '41f26b1a-8e9b-474d-983a-d6ff8e448b55', NULL, '2025-08-26 19:13:48', 0, '2025-08-19 19:13:48'),
(26, 1, '7c7ee98f-d64f-4c7b-b6c4-face72c391b6', NULL, '2025-08-27 15:17:07', 0, '2025-08-20 15:17:07'),
(27, 1, '80ce27b1-f1ac-4fa6-997d-800b8c67f0b9', NULL, '2025-09-13 11:02:59', 1, '2025-09-13 11:00:52');

-- --------------------------------------------------------

--
-- Struttura della tabella `relazioni_ditta`
--

CREATE TABLE `relazioni_ditta` (
  `codice` char(1) NOT NULL,
  `descrizione` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `relazioni_ditta`
--

INSERT INTO `relazioni_ditta` (`codice`, `descrizione`) VALUES
('C', 'Cliente'),
('E', 'Entrambe'),
('F', 'Fornitore'),
('N', 'Nessuna'),
('P', 'Punto Vendita');

--
-- Indici per le tabelle scaricate
--

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
-- Indici per le tabelle `privacy_policies`
--
ALTER TABLE `privacy_policies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id_ditta` (`id_ditta`);

--
-- Indici per le tabelle `registration_tokens`
--
ALTER TABLE `registration_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `id_ditta` (`id_ditta`);

--
-- Indici per le tabelle `relazioni_ditta`
--
ALTER TABLE `relazioni_ditta`
  ADD PRIMARY KEY (`codice`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `ppa_stati_azione`
--
ALTER TABLE `ppa_stati_azione`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT per la tabella `ppa_team`
--
ALTER TABLE `ppa_team`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT per la tabella `privacy_policies`
--
ALTER TABLE `privacy_policies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT per la tabella `registration_tokens`
--
ALTER TABLE `registration_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- Limiti per le tabelle scaricate
--

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

--
-- Limiti per la tabella `privacy_policies`
--
ALTER TABLE `privacy_policies`
  ADD CONSTRAINT `fk_privacy_policies_id_ditta` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`);

--
-- Limiti per la tabella `registration_tokens`
--
ALTER TABLE `registration_tokens`
  ADD CONSTRAINT `fk_registration_tokens_id_ditta` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
