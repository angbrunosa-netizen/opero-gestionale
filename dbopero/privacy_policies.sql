-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Ott 19, 2025 alle 10:41
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
-- Database: `opero_vecchio`
--

-- --------------------------------------------------------

--
-- Struttura della tabella `privacy_policies`
--

CREATE TABLE `privacy_policies` (
  `id` int(11) NOT NULL,
  `id_ditta` int(11) NOT NULL,
  `responsabile_trattamento` varchar(255) NOT NULL,
  `corpo_lettera` text NOT NULL,
  `data_aggiornamento` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `privacy_policies`
--

INSERT INTO `privacy_policies` (`id`, `id_ditta`, `responsabile_trattamento`, `corpo_lettera`, `data_aggiornamento`) VALUES
(1, 1, 'Angelo Breuno', '<p><br></p><p><strong>Autorizzazione al Trattamento dei Dati Personali per Finalità Commerciali e per la Comunicazione a Terzi</strong></p><p>Io sottoscritto/a,</p><p> <strong>[Nome_Utente]</strong>, codice fiscale <strong>[codice fiscale]</strong>,</p><p><strong>PREMESSO CHE</strong></p><p><br></p><ul><li>ho ricevuto l\'informativa ai sensi dell’art. 13 del Regolamento (UE) 2016/679 (GDPR) relativa al trattamento dei miei dati personali da parte di <strong>[DITTA]</strong>, con sede in <strong>[indirizzo completo]</strong>,</li><li>ho compreso le finalità e le modalità del trattamento, i miei diritti e i soggetti coinvolti nel trattamento stesso,</li></ul><p><strong>AUTORIZZO</strong></p><p> il trattamento dei miei dati personali da parte di <strong>[Nome dell’Azienda]</strong> per le seguenti finalità:</p><ol><li><strong>Finalità di marketing diretto</strong>: invio di comunicazioni commerciali, promozionali e informative tramite e-mail, SMS, telefono, posta tradizionale o altri strumenti automatizzati di contatto, relative a prodotti e servizi offerti dal Titolare;</li><li><strong>Finalità di profilazione</strong>: analisi delle mie preferenze, abitudini e scelte di consumo al fine di ricevere comunicazioni personalizzate;</li><li><strong>Comunicazione a soggetti terzi</strong>: cessione e/o comunicazione dei miei dati personali a società terze, partner commerciali o altri titolari autonomi del trattamento, che potranno trattarli per proprie finalità di marketing diretto o altre attività commerciali compatibili.</li></ol><p><strong>DICHIARO</strong> inoltre di essere consapevole che:</p><p><br></p><ul><li>Il conferimento dei dati per le suddette finalità è facoltativo e l’eventuale mancato consenso non pregiudica la fruizione dei servizi principali offerti;</li><li>Posso in qualsiasi momento revocare il presente consenso, ai sensi dell’art. 7, par. 3, GDPR, scrivendo a <strong>[indirizzo email del titolare del trattamento]</strong>;</li><li>I miei diritti in merito al trattamento sono indicati negli articoli da 15 a 22 del GDPR.</li></ul><p>Luogo e data: _______________________________</p><p> Il presente documento è inviato a mezzo mail, accedendo al portale si considera accettata</p><p>non</p>', '2025-07-26 18:49:58'),
(2, 3, 'angioletto', '<p>se le informazioni le vuoi pazientarrrr</p>', '2025-08-13 10:36:33');

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `privacy_policies`
--
ALTER TABLE `privacy_policies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id_ditta` (`id_ditta`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `privacy_policies`
--
ALTER TABLE `privacy_policies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `privacy_policies`
--
ALTER TABLE `privacy_policies`
  ADD CONSTRAINT `privacy_policies_ibfk_1` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
