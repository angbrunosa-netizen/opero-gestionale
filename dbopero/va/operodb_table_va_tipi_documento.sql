
-- --------------------------------------------------------

--
-- Struttura della tabella `va_tipi_documento`
--

CREATE TABLE `va_tipi_documento` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `codice_doc` varchar(255) NOT NULL,
  `nome_documento` varchar(255) NOT NULL,
  `tipo` enum('Documento Accompagnatorio','Documento Interno','Preventivo','Ordine') NOT NULL,
  `gen_mov` enum('S','N') NOT NULL COMMENT 'Indica se il documento genera movimenti di magazzino',
  `tipo_movimento` enum('Carico','Scarico') DEFAULT NULL COMMENT 'Tipo di movimento generato, se gen_mov = S',
  `ditta_rif` enum('Clienti','Fornitori','PuntoVendita') NOT NULL COMMENT 'A quale tipo di anagrafica si riferisce il documento',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `va_tipi_documento`
--

INSERT INTO `va_tipi_documento` (`id`, `id_ditta`, `codice_doc`, `nome_documento`, `tipo`, `gen_mov`, `tipo_movimento`, `ditta_rif`, `created_at`, `updated_at`) VALUES
(1, 1, 'FTV', 'FATTURA DI VENDITA', 'Documento Accompagnatorio', 'S', 'Scarico', 'Clienti', '2025-10-07 21:05:00', '2025-10-07 21:05:00');
