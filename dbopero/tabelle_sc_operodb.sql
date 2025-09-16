-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Set 16, 2025 alle 09:48
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
-- Struttura della tabella `sc_funzioni_collegate`
--

CREATE TABLE `sc_funzioni_collegate` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_funzione_primaria` int(10) UNSIGNED NOT NULL,
  `id_funzione_secondaria` int(10) UNSIGNED NOT NULL,
  `ordine_esecuzione` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `sc_funzioni_collegate_mapping`
--

CREATE TABLE `sc_funzioni_collegate_mapping` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_funzione_collegata` int(10) UNSIGNED NOT NULL,
  `parametro_origine` varchar(50) NOT NULL,
  `tabella_destinazione` varchar(50) NOT NULL,
  `colonna_destinazione` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

-- --------------------------------------------------------

--
-- Struttura della tabella `sc_funzioni_contabili_righe`
--

CREATE TABLE `sc_funzioni_contabili_righe` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_funzione_contabile` int(10) UNSIGNED NOT NULL,
  `id_conto` int(11) NOT NULL,
  `tipo_movimento` enum('D','A') NOT NULL,
  `descrizione_riga_predefinita` varchar(255) DEFAULT NULL,
  `is_sottoconto_modificabile` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `sc_movimenti_iva`
--

CREATE TABLE `sc_movimenti_iva` (
  `id` int(10) UNSIGNED NOT NULL,
  `tipo_registro` enum('VENDITE','ACQUISTI') NOT NULL,
  `imponibile` decimal(15,2) NOT NULL,
  `aliquota` decimal(5,2) NOT NULL,
  `imposta` decimal(15,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `sc_partite_aperte`
--

CREATE TABLE `sc_partite_aperte` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta_anagrafica` int(10) UNSIGNED NOT NULL,
  `data_scadenza` date NOT NULL,
  `importo` decimal(15,2) NOT NULL,
  `stato` enum('APERTA','CHIUSA','INSOLUTA') DEFAULT 'APERTA',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `data_registrazione` date NOT NULL,
  `id_registrazione_testata` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `sc_piano_dei_conti`
--

CREATE TABLE `sc_piano_dei_conti` (
  `id` int(11) NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `codice` varchar(20) NOT NULL,
  `descrizione` varchar(255) NOT NULL,
  `id_padre` int(11) DEFAULT NULL,
  `tipo` enum('Mastro','Conto','Sottoconto') NOT NULL,
  `natura` enum('Attività','Passività','Costo','Ricavo','Patrimonio Netto') NOT NULL,
  `bloccato` tinyint(1) DEFAULT 0,
  `data_creazione` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `sc_registrazioni_righe`
--

CREATE TABLE `sc_registrazioni_righe` (
  `id` int(11) NOT NULL,
  `id_testata` int(11) NOT NULL,
  `id_conto` int(11) NOT NULL,
  `descrizione_riga` varchar(255) DEFAULT NULL,
  `importo_dare` decimal(15,2) DEFAULT 0.00,
  `importo_avere` decimal(15,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `sc_registrazioni_testata`
--

CREATE TABLE `sc_registrazioni_testata` (
  `id` int(11) NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `id_utente` int(11) NOT NULL,
  `data_registrazione` date NOT NULL,
  `descrizione_testata` varchar(255) NOT NULL,
  `data_documento` date DEFAULT NULL,
  `numero_documento` varchar(50) DEFAULT NULL,
  `totale_documento` decimal(15,2) DEFAULT NULL,
  `id_ditte` int(10) UNSIGNED DEFAULT NULL,
  `numero_protocollo` int(10) UNSIGNED NOT NULL,
  `stato` enum('Provvisorio','Confermato','Annullato') DEFAULT 'Provvisorio',
  `data_creazione` timestamp NOT NULL DEFAULT current_timestamp(),
  `data_ultima_modifica` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `sc_registri_iva`
--

CREATE TABLE `sc_registri_iva` (
  `id` int(11) NOT NULL,
  `id_riga_registrazione` int(11) NOT NULL,
  `tipo_registro` enum('Acquisti','Vendite','Corrispettivi') NOT NULL,
  `data_documento` date NOT NULL,
  `numero_documento` varchar(50) NOT NULL,
  `id_anagrafica` int(11) DEFAULT NULL,
  `imponibile` decimal(15,2) NOT NULL,
  `aliquota_iva` decimal(5,2) NOT NULL,
  `importo_iva` decimal(15,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `sc_funzioni_collegate`
--
ALTER TABLE `sc_funzioni_collegate`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_funzioni_collegate` (`id_funzione_primaria`,`id_funzione_secondaria`),
  ADD KEY `sc_funzioni_collegate_id_funzione_secondaria_foreign` (`id_funzione_secondaria`);

--
-- Indici per le tabelle `sc_funzioni_collegate_mapping`
--
ALTER TABLE `sc_funzioni_collegate_mapping`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_mapping_funz_coll` (`id_funzione_collegata`);

--
-- Indici per le tabelle `sc_funzioni_contabili`
--
ALTER TABLE `sc_funzioni_contabili`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sc_funzioni_contabili_id_ditta_codice_funzione_unique` (`id_ditta`,`codice_funzione`);

--
-- Indici per le tabelle `sc_funzioni_contabili_righe`
--
ALTER TABLE `sc_funzioni_contabili_righe`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sc_funzioni_contabili_righe_id_funzione_contabile_foreign` (`id_funzione_contabile`);

--
-- Indici per le tabelle `sc_movimenti_iva`
--
ALTER TABLE `sc_movimenti_iva`
  ADD PRIMARY KEY (`id`);

--
-- Indici per le tabelle `sc_partite_aperte`
--
ALTER TABLE `sc_partite_aperte`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_sc_partite_aperte_id_ditta_anagrafica` (`id_ditta_anagrafica`);

--
-- Indici per le tabelle `sc_piano_dei_conti`
--
ALTER TABLE `sc_piano_dei_conti`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_ditta_codice` (`id_ditta`,`codice`),
  ADD KEY `id_padre` (`id_padre`);

--
-- Indici per le tabelle `sc_registrazioni_righe`
--
ALTER TABLE `sc_registrazioni_righe`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_testata` (`id_testata`),
  ADD KEY `id_conto` (`id_conto`);

--
-- Indici per le tabelle `sc_registrazioni_testata`
--
ALTER TABLE `sc_registrazioni_testata`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sc_registrazioni_testata_id_ditta_numero_protocollo_unique` (`id_ditta`,`numero_protocollo`),
  ADD KEY `id_utente` (`id_utente`),
  ADD KEY `sc_registrazioni_testata_id_ditte_foreign` (`id_ditte`);

--
-- Indici per le tabelle `sc_registri_iva`
--
ALTER TABLE `sc_registri_iva`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_riga_registrazione` (`id_riga_registrazione`),
  ADD KEY `id_anagrafica` (`id_anagrafica`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `sc_funzioni_collegate`
--
ALTER TABLE `sc_funzioni_collegate`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `sc_funzioni_collegate_mapping`
--
ALTER TABLE `sc_funzioni_collegate_mapping`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `sc_funzioni_contabili`
--
ALTER TABLE `sc_funzioni_contabili`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `sc_funzioni_contabili_righe`
--
ALTER TABLE `sc_funzioni_contabili_righe`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `sc_movimenti_iva`
--
ALTER TABLE `sc_movimenti_iva`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `sc_partite_aperte`
--
ALTER TABLE `sc_partite_aperte`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `sc_piano_dei_conti`
--
ALTER TABLE `sc_piano_dei_conti`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `sc_registrazioni_righe`
--
ALTER TABLE `sc_registrazioni_righe`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `sc_registrazioni_testata`
--
ALTER TABLE `sc_registrazioni_testata`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `sc_registri_iva`
--
ALTER TABLE `sc_registri_iva`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `sc_funzioni_collegate`
--
ALTER TABLE `sc_funzioni_collegate`
  ADD CONSTRAINT `sc_funzioni_collegate_id_funzione_primaria_foreign` FOREIGN KEY (`id_funzione_primaria`) REFERENCES `sc_funzioni_contabili` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sc_funzioni_collegate_id_funzione_secondaria_foreign` FOREIGN KEY (`id_funzione_secondaria`) REFERENCES `sc_funzioni_contabili` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `sc_funzioni_collegate_mapping`
--
ALTER TABLE `sc_funzioni_collegate_mapping`
  ADD CONSTRAINT `fk_mapping_funz_coll` FOREIGN KEY (`id_funzione_collegata`) REFERENCES `sc_funzioni_collegate` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `sc_funzioni_contabili_righe`
--
ALTER TABLE `sc_funzioni_contabili_righe`
  ADD CONSTRAINT `sc_funzioni_contabili_righe_id_funzione_contabile_foreign` FOREIGN KEY (`id_funzione_contabile`) REFERENCES `sc_funzioni_contabili` (`id`) ON DELETE CASCADE;

--
-- Limiti per la tabella `sc_partite_aperte`
--
ALTER TABLE `sc_partite_aperte`
  ADD CONSTRAINT `fk_sc_partite_aperte_id_ditta_anagrafica` FOREIGN KEY (`id_ditta_anagrafica`) REFERENCES `ditte` (`id`);

--
-- Limiti per la tabella `sc_piano_dei_conti`
--
ALTER TABLE `sc_piano_dei_conti`
  ADD CONSTRAINT `fk_sc_piano_dei_conti_id_ditta` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`),
  ADD CONSTRAINT `sc_piano_dei_conti_ibfk_2` FOREIGN KEY (`id_padre`) REFERENCES `sc_piano_dei_conti` (`id`) ON DELETE SET NULL;

--
-- Limiti per la tabella `sc_registrazioni_righe`
--
ALTER TABLE `sc_registrazioni_righe`
  ADD CONSTRAINT `sc_registrazioni_righe_ibfk_1` FOREIGN KEY (`id_testata`) REFERENCES `sc_registrazioni_testata` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sc_registrazioni_righe_ibfk_2` FOREIGN KEY (`id_conto`) REFERENCES `sc_piano_dei_conti` (`id`);

--
-- Limiti per la tabella `sc_registrazioni_testata`
--
ALTER TABLE `sc_registrazioni_testata`
  ADD CONSTRAINT `fk_sc_registrazioni_testata_id_ditta` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`),
  ADD CONSTRAINT `sc_registrazioni_testata_ibfk_2` FOREIGN KEY (`id_utente`) REFERENCES `utenti` (`id`),
  ADD CONSTRAINT `sc_registrazioni_testata_id_ditte_foreign` FOREIGN KEY (`id_ditte`) REFERENCES `ditte` (`id`) ON DELETE SET NULL;

--
-- Limiti per la tabella `sc_registri_iva`
--
ALTER TABLE `sc_registri_iva`
  ADD CONSTRAINT `sc_registri_iva_ibfk_1` FOREIGN KEY (`id_riga_registrazione`) REFERENCES `sc_registrazioni_righe` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
