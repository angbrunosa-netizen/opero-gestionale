
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
-- Dump dei dati per la tabella `va_clienti_anagrafica`
--

INSERT INTO `va_clienti_anagrafica` (`id_ditta`, `listino_cessione`, `listino_pubblico`, `id_matrice_sconti`, `riga_matrice_sconti`, `id_categoria_cliente`, `id_gruppo_cliente`, `id_referente`, `id_referente_allert`, `id_referente_ppa`, `id_agente`, `giorno_di_consegna`, `giro_consegna`, `id_trasportatore_assegnato`, `metodo_di_consegna`, `allestimento_logistico`, `tipo_fatturazione`, `id_tipo_pagamento`, `stato`, `sito_web`, `pagina_facebook`, `pagina_instagram`, `url_link`, `google_maps`, `concorrenti`, `foto_url`, `fatturato_anno_pr`, `fatturato_anno_cr`, `id_contratto`, `id_punto_consegna_predefinito`) VALUES
(6, 2, 2, 3, NULL, 9, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 6, 'Sospeso', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(12, 1, 1, 3, NULL, 10, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 5, 'Attivo', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(14, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Attivo', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(16, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Bloccato', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(17, 1, 1, 3, NULL, 12, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
