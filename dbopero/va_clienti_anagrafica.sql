-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Ott 07, 2025 alle 23:13
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
-- Struttura della tabella `va_clienti_anagrafica`
--

CREATE TABLE `va_clienti_anagrafica` (
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `listino_cessione` int(11) DEFAULT NULL COMMENT 'Indica quale colonna prezzo_cessione_X usare da ct_listini',
  `listino_pubblico` int(11) DEFAULT NULL COMMENT 'Indica quale colonna prezzo_pubblico_X usare da ct_listini',
  `id_matrice_sconti` int(10) UNSIGNED DEFAULT NULL,
  `riga_matrice_sconti` int(11) DEFAULT NULL COMMENT 'Indica la riga da usare nella matrice sconti associata',
  `id_categoria_cliente` int(10) UNSIGNED DEFAULT NULL,
  `id_gruppo_cliente` int(10) UNSIGNED DEFAULT NULL,
  `id_referente` int(11) DEFAULT NULL,
  `id_referente_allert` int(11) DEFAULT NULL,
  `id_referente_ppa` int(11) DEFAULT NULL,
  `id_agente` int(11) DEFAULT NULL,
  `giorno_di_consegna` enum('Lunedì','Martedì','Mercoledì','Giovedì','Venerdì','Sabato','Domenica') DEFAULT NULL,
  `giro_consegna` varchar(100) DEFAULT NULL,
  `id_trasportatore_assegnato` int(10) UNSIGNED DEFAULT NULL,
  `metodo_di_consegna` varchar(255) DEFAULT NULL,
  `allestimento_logistico` text DEFAULT NULL,
  `tipo_fatturazione` enum('Immediata','Fine Mese','A Consegna') DEFAULT NULL,
  `id_tipo_pagamento` int(11) DEFAULT NULL,
  `stato` enum('Attivo','Sospeso','Bloccato') DEFAULT 'Attivo',
  `sito_web` varchar(255) DEFAULT NULL,
  `pagina_facebook` varchar(255) DEFAULT NULL,
  `pagina_instagram` varchar(255) DEFAULT NULL,
  `url_link` varchar(255) DEFAULT NULL COMMENT 'Link generico, es. per portali',
  `google_maps` text DEFAULT NULL,
  `concorrenti` text DEFAULT NULL,
  `foto_url` varchar(255) DEFAULT NULL,
  `fatturato_anno_pr` decimal(15,2) DEFAULT NULL COMMENT 'Fatturato anno precedente',
  `fatturato_anno_cr` decimal(15,2) DEFAULT NULL COMMENT 'Fatturato anno corrente',
  `id_contratto` int(10) UNSIGNED DEFAULT NULL,
  `id_punto_consegna_predefinito` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `va_clienti_anagrafica`
--
ALTER TABLE `va_clienti_anagrafica`
  ADD PRIMARY KEY (`id_ditta`),
  ADD KEY `va_clienti_anagrafica_id_matrice_sconti_foreign` (`id_matrice_sconti`),
  ADD KEY `va_clienti_anagrafica_id_categoria_cliente_foreign` (`id_categoria_cliente`),
  ADD KEY `va_clienti_anagrafica_id_gruppo_cliente_foreign` (`id_gruppo_cliente`),
  ADD KEY `va_clienti_anagrafica_id_referente_foreign` (`id_referente`),
  ADD KEY `va_clienti_anagrafica_id_referente_allert_foreign` (`id_referente_allert`),
  ADD KEY `va_clienti_anagrafica_id_referente_ppa_foreign` (`id_referente_ppa`),
  ADD KEY `va_clienti_anagrafica_id_agente_foreign` (`id_agente`),
  ADD KEY `va_clienti_anagrafica_id_trasportatore_assegnato_foreign` (`id_trasportatore_assegnato`),
  ADD KEY `va_clienti_anagrafica_id_tipo_pagamento_foreign` (`id_tipo_pagamento`),
  ADD KEY `va_clienti_anagrafica_id_contratto_foreign` (`id_contratto`),
  ADD KEY `va_clienti_anagrafica_id_punto_consegna_predefinito_foreign` (`id_punto_consegna_predefinito`);

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `va_clienti_anagrafica`
--
ALTER TABLE `va_clienti_anagrafica`
  ADD CONSTRAINT `va_clienti_anagrafica_id_agente_foreign` FOREIGN KEY (`id_agente`) REFERENCES `utenti` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `va_clienti_anagrafica_id_categoria_cliente_foreign` FOREIGN KEY (`id_categoria_cliente`) REFERENCES `va_categorie_clienti` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `va_clienti_anagrafica_id_contratto_foreign` FOREIGN KEY (`id_contratto`) REFERENCES `va_contratti` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `va_clienti_anagrafica_id_ditta_foreign` FOREIGN KEY (`id_ditta`) REFERENCES `ditte` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `va_clienti_anagrafica_id_gruppo_cliente_foreign` FOREIGN KEY (`id_gruppo_cliente`) REFERENCES `va_gruppi_clienti` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `va_clienti_anagrafica_id_matrice_sconti_foreign` FOREIGN KEY (`id_matrice_sconti`) REFERENCES `va_matrici_sconti` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `va_clienti_anagrafica_id_punto_consegna_predefinito_foreign` FOREIGN KEY (`id_punto_consegna_predefinito`) REFERENCES `va_punti_consegna` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `va_clienti_anagrafica_id_referente_allert_foreign` FOREIGN KEY (`id_referente_allert`) REFERENCES `utenti` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `va_clienti_anagrafica_id_referente_foreign` FOREIGN KEY (`id_referente`) REFERENCES `utenti` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `va_clienti_anagrafica_id_referente_ppa_foreign` FOREIGN KEY (`id_referente_ppa`) REFERENCES `utenti` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `va_clienti_anagrafica_id_tipo_pagamento_foreign` FOREIGN KEY (`id_tipo_pagamento`) REFERENCES `tipi_pagamento` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `va_clienti_anagrafica_id_trasportatore_assegnato_foreign` FOREIGN KEY (`id_trasportatore_assegnato`) REFERENCES `va_trasportatori` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
