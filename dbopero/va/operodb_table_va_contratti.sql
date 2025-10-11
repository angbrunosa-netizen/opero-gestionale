
-- --------------------------------------------------------

--
-- Struttura della tabella `va_contratti`
--

CREATE TABLE `va_contratti` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `codice_contratto` varchar(100) DEFAULT NULL,
  `descrizione` text DEFAULT NULL,
  `data_inizio` date DEFAULT NULL,
  `data_fine` date DEFAULT NULL,
  `file_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
