-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Ott 13, 2025 alle 15:03
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
-- Struttura della tabella `utenti`
--

CREATE TABLE `utenti` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `mail_contatto` varchar(255) DEFAULT NULL,
  `mail_collaboratore` varchar(255) DEFAULT NULL,
  `mail_pec` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `nome` varchar(100) DEFAULT NULL,
  `cognome` varchar(100) DEFAULT NULL,
  `codice_fiscale` varchar(16) DEFAULT NULL,
  `telefono` varchar(30) DEFAULT NULL,
  `indirizzo` varchar(255) DEFAULT NULL,
  `citta` varchar(100) DEFAULT NULL,
  `provincia` varchar(50) DEFAULT NULL,
  `cap` varchar(10) DEFAULT NULL,
  `id_ditta` int(10) UNSIGNED DEFAULT NULL,
  `id_ruolo` int(11) DEFAULT NULL,
  `attivo` tinyint(1) DEFAULT 1,
  `data_creazione` timestamp NOT NULL DEFAULT current_timestamp(),
  `data_ultimo_accesso` timestamp NULL DEFAULT NULL,
  `note` text DEFAULT NULL,
  `firma` text DEFAULT NULL,
  `privacy` tinyint(1) DEFAULT 0,
  `funzioni_attive` text DEFAULT NULL,
  `livello` int(11) DEFAULT 50,
  `Codice_Tipo_Utente` int(11) DEFAULT NULL,
  `verification_token` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `utenti`
--

INSERT INTO `utenti` (`id`, `email`, `mail_contatto`, `mail_collaboratore`, `mail_pec`, `password`, `nome`, `cognome`, `codice_fiscale`, `telefono`, `indirizzo`, `citta`, `provincia`, `cap`, `id_ditta`, `id_ruolo`, `attivo`, `data_creazione`, `data_ultimo_accesso`, `note`, `firma`, `privacy`, `funzioni_attive`, `livello`, `Codice_Tipo_Utente`, `verification_token`) VALUES
(1, 'sysadmin@mia-azienda.it', 'sysadmin@mia-azienda.it', NULL, NULL, 'password_criptata_qui', 'System', 'Admin', NULL, NULL, NULL, NULL, NULL, NULL, 1, 3, 1, '2025-09-20 17:15:45', NULL, NULL, NULL, 0, NULL, 50, 1, NULL),
(2, 'mario.rossi@cliente-demo.it', 'mario.rossi@cliente-demo.it', NULL, NULL, 'password_criptata_qui', 'Mario', 'Rossi', NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 1, '2025-09-20 17:15:45', NULL, NULL, NULL, 0, NULL, 50, NULL, NULL),
(3, 'angbrunosa@gmail.com', 'angbrunosa@gmail.com', NULL, NULL, '$2b$10$JxllX3i7uL3CGpUunIoVSOdq1/zHxU9cckBYRXTPNBNbRz81lCXwC', 'Angelo ok', 'Bruno', NULL, NULL, NULL, NULL, NULL, NULL, 1, 2, 1, '2025-09-20 17:15:45', NULL, NULL, 'la mia firma', 0, NULL, 99, 1, NULL),
(4, 'info@difam.it', 'info@difam.it', NULL, NULL, '$2b$10$mDL.FXQ4GmIhthGlmLCRFOwv7FxAXCJkRqa0AqKI9GIogmP6fxmnK', 'francesco ', 'baggetta', 'brf', NULL, NULL, NULL, NULL, NULL, 3, 3, 1, '2025-09-20 17:15:45', NULL, NULL, 'dott. Francesco Baggetta Direttore Generale Confesercenti Calabria Servizi', 1, NULL, 50, NULL, NULL),
(5, 'admin@example.com', 'admin@example.com', NULL, NULL, '$2b$10$JxllX3i7uL3CGpUunIoVSOdq1/zHxU9cckBYRXTPNBNbRz81lCXwC', 'Angelo ', 'Bruno', NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, 1, '2025-09-20 17:15:45', NULL, NULL, NULL, 0, NULL, 100, 1, NULL),
(6, 'info@example.com', 'info@example.com', NULL, NULL, '$2b$10$TE4iHRvwQ1Wgabc6gq..z.MiVOf2Ypjp4ehAHl.aJdQINjeLN5owi', 'Angelo', 'Bruno', NULL, NULL, NULL, NULL, NULL, NULL, 1, 3, 1, '2025-09-20 17:15:45', NULL, NULL, 'dott. Angelo Bruno\nww', 0, NULL, 50, NULL, NULL),
(9, 'master@opero.it', 'master@opero.it', NULL, NULL, '$2b$10$yApw9swySOyQbtFCOC8TVOhPJTmrhIH0eDuVxc5H1WAGh0eAMFq6u', 'Master', 'Admin', NULL, 'uu', NULL, NULL, NULL, NULL, 1, 1, 1, '2025-09-20 17:15:45', NULL, NULL, 'Direzione Gestionale Opero.\nwww.operomeglio.it\n', 0, NULL, 50, NULL, NULL),
(10, 'provadmin@prova.it', 'provadmin@prova.it', NULL, NULL, '$2b$10$DrytCfOdmnOgEH7ISH86X.NFCep9OVxfII5w6dCHfcoX.BYWN0fCC', 'dott. Angelo', 'Bruno -Opero-GEST', NULL, NULL, NULL, NULL, NULL, NULL, 3, 3, 1, '2025-09-20 17:15:45', NULL, NULL, 'dott. Angelo Bruno\n\nopero il gestionale che opera per te', 0, NULL, 99, NULL, NULL),
(11, 'AngProva@provino.it', 'AngProva@provino.it', NULL, NULL, '$2b$10$dLb.wC/gRYtCmuISajM...LQ12V5oLd1c6aOZYGLw.wzfRw.kMqTu', 'angeloProva', 'BrunoProva', 's', NULL, NULL, NULL, NULL, NULL, 3, 4, 1, '2025-09-20 17:15:45', NULL, NULL, NULL, 1, NULL, 50, NULL, NULL),
(13, 'provaCOM@prova.it', 'provaCOM@prova.it', NULL, NULL, '$2b$10$C26/u3pagw9zt5TYoqgCGernyCIXjt/c9xj/47mRiV1EXtYOC0T16', 'PROVACOMPLETA', 'PROVACOMPLETA', 'BRNNGL76L21C349J', '098134463', 'VIA DEL CORSO2', 'PASSOLENTO', 'CS', NULL, 3, 3, 1, '2025-09-20 17:15:45', NULL, NULL, NULL, 1, NULL, 49, NULL, NULL),
(14, 'lucaprovadmin@prova.it', 'lucaprovadmin@prova.it', NULL, NULL, '$2b$10$XJOnOO3o.s5DtorcN7JWG.3IoOTgJIPDNeJ07HcxUOmqZz3K3PlDq', 'luca proca', 'cicone prova', 'lcvvnlsosos', '098135363', 'vico fioravanti', 'saracena', 'cs', NULL, 3, 3, 1, '2025-09-20 17:15:45', NULL, NULL, NULL, 1, NULL, 10, NULL, NULL),
(15, 'difamconsegne@gmail.com', 'difamconsegne@gmail.com', NULL, NULL, '$2b$10$xw6CzU2voWK5sIEGzUflU.6BIn3cq1W4347npwYBad8ARJuzDNKJy', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 1, '2025-09-20 17:15:45', NULL, NULL, NULL, 0, NULL, 50, NULL, NULL),
(16, 'postmaster@cedibef.com', 'postmaster@cedibef.com', NULL, NULL, '$2b$10$dNnNFQx.dfTl1ofrRe0HeOk8MwMfT03tzj3o8LUm89NBiTvgS5p7a', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 1, '2025-09-20 17:15:45', NULL, NULL, NULL, 0, NULL, 50, NULL, NULL),
(31, 'befretail@gmail.com', 'befretail@gmail.com', NULL, NULL, '$2b$10$JxllX3i7uL3CGpUunIoVSOdq1/zHxU9cckBYRXTPNBNbRz81lCXwC', 'Cavolo', 'A Fiore', NULL, 'oppido', 'mamertino', NULL, 'cs', NULL, 1, 3, 1, '2025-09-20 17:15:45', NULL, NULL, NULL, 1, NULL, 50, NULL, NULL),
(32, 'opero@difam.it', 'opero@difam.it', NULL, NULL, '$2b$10$HzcHeKuF1/LE1/3UY4jxLOFHvETDChIGrIqyzAiUkNZZBN.820ggK', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 1, '2025-09-20 17:15:45', NULL, NULL, NULL, 0, NULL, 50, NULL, NULL),
(33, 'postmaster@difam.it', 'postmaster@difam.it', NULL, NULL, '$2b$10$9ti7YOjqWQKXUqbknXTtKOMLMCzTRCrBkv1YTzgpXSiGmgXnycYyK', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 1, '2025-09-20 17:15:45', NULL, NULL, NULL, 0, NULL, 50, NULL, NULL),
(34, 'provaadmin@prova.it', 'provaadmin@prova.it', NULL, NULL, '$2b$10$nu1x6jTlOh5Uv9uRUITC1OgrueRQboMJJHUy98TN6hjbz/jVoxI9q', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 1, '2025-09-20 17:15:45', NULL, NULL, NULL, 0, NULL, 50, NULL, NULL),
(35, 'befretail@gmai.com', 'befretail@gmai.com', NULL, NULL, '$2b$10$yHIhsE9kDtGZhwMC.3p82.sVZNMVR7FnfOBfabyQFLS4fWLL3k02q', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 1, '2025-09-20 17:15:45', NULL, NULL, NULL, 0, NULL, 50, NULL, NULL),
(36, 'master@oper.it', 'master@oper.it', NULL, NULL, '$2b$10$yWaTJtd1vXGdx.a1PPTnFOHfW6ct4RB0eJWmCWnDRc5oP3NpNRr4K', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 1, '2025-09-20 17:15:45', NULL, NULL, NULL, 0, NULL, 50, NULL, NULL),
(37, 'befretail@befretail.srl', 'befretail@befretail.srl', NULL, NULL, '$2b$10$hkxyH85TK4x3Nn.0OcfFX.zAkE4hCUqXWug00ZQz1egk5UgUwN03a', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 1, '2025-09-20 17:15:45', NULL, NULL, NULL, 0, NULL, 50, NULL, NULL),
(38, 'befretail@gmail.srl', 'befretail@gmail.srl', NULL, NULL, '$2b$10$i75f4L16LWzI6.UYxx7jRuhwsGmS1INZpWoaq2m7jUTr5IMAutq1q', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 1, '2025-09-20 17:15:45', NULL, NULL, NULL, 0, NULL, 50, NULL, NULL),
(39, 'befreatail@gmail.com', 'befreatail@gmail.com', NULL, NULL, '$2b$10$NM6C65gA02ffDqpb30/3xuhkTUZet9yQ9ThL/Oa7jxkYzg1b4J0Zu', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, 4, 1, '2025-09-20 17:15:45', NULL, NULL, NULL, 0, NULL, 50, NULL, NULL),
(43, 'amministrazione@difam.it', 'amministrazione@difam.it', NULL, NULL, '$2b$10$.OPBEp3K0Z2Lqw5u81/lhO21U1iBqusAh2PpAAPU4mXI5vi.ZT7la', 'Angelo-Amministrazione', 'Bruno-Amministrazione', 'profrold', '3356738658', 'Cda Soda, 4', 'Saracena', NULL, '87010', 1, 2, 1, '2025-09-20 17:15:45', NULL, 'bellissimo', NULL, 1, NULL, 93, 1, NULL),
(46, 'dantoniomaria70@gmail.com', 'dantoniomaria70@gmail.com', NULL, NULL, 'password_provvisoria', 'a', 's', NULL, '3356738658', NULL, NULL, NULL, NULL, 1, 4, 0, '2025-09-20 17:15:45', NULL, NULL, NULL, 0, NULL, 0, 2, NULL),
(47, 'carmicol@libero.it', 'carmicol@libero.it', NULL, NULL, 'password_provvisoria', 'carmine', 'colautti', NULL, '098134463', NULL, NULL, NULL, NULL, 1, 4, 0, '2025-09-20 17:15:45', NULL, NULL, NULL, 0, NULL, 0, 2, NULL),
(48, 'cicio.l@tiscali.it', NULL, NULL, NULL, '$2b$10$VxKnElUjNclmDPMaN0TKiepysi2RD6xXfW5NO6U5i/LwhwIrXwrC6', 'luca ', 'ciciole', 'clclclclc', '3400958887', 'via fioravanti', 'saracena', NULL, '87010', 1, 4, 1, '2025-09-20 17:15:45', NULL, 'cliente sartoria', NULL, 0, NULL, 1, 2, '05350912-8049-4733-a4d4-ed52bcd5fb43');

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `utenti`
--
ALTER TABLE `utenti`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `codice_fiscale` (`codice_fiscale`),
  ADD UNIQUE KEY `verification_token` (`verification_token`),
  ADD KEY `id_ditta` (`id_ditta`),
  ADD KEY `id_ruolo` (`id_ruolo`),
  ADD KEY `fk_utente_tipo` (`Codice_Tipo_Utente`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `utenti`
--
ALTER TABLE `utenti`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `utenti`
--
ALTER TABLE `utenti`
  ADD CONSTRAINT `fk_utente_tipo` FOREIGN KEY (`Codice_Tipo_Utente`) REFERENCES `tipi_utente` (`Codice`),
  ADD CONSTRAINT `fk_utenti_id_ditta` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`),
  ADD CONSTRAINT `utenti_ibfk_2` FOREIGN KEY (`id_ruolo`) REFERENCES `ruoli` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
