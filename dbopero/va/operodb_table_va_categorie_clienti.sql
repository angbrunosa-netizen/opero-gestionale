
-- --------------------------------------------------------

--
-- Struttura della tabella `va_categorie_clienti`
--

CREATE TABLE `va_categorie_clienti` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `nome_categoria` varchar(100) NOT NULL,
  `descrizione` text DEFAULT NULL,
  `codice_categoria` varchar(50) DEFAULT NULL,
  `id_padre` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `va_categorie_clienti`
--

INSERT INTO `va_categorie_clienti` (`id`, `id_ditta`, `nome_categoria`, `descrizione`, `codice_categoria`, `id_padre`, `created_at`, `updated_at`) VALUES
(9, 1, 'CLIENTI ITALIA', 'CLIENTI ITALIANI', '1', NULL, '2025-10-05 21:47:48', '2025-10-05 21:47:48'),
(10, 1, 'CLIENTI ASSOCIATI', 'CLIENTI CON CONTRATTO', '02', 9, '2025-10-05 21:51:53', '2025-10-05 21:51:53'),
(11, 1, 'CLIENTI_ESTERO', 'RESIDENTI ESTERO', '10', NULL, '2025-10-05 21:52:14', '2025-10-05 21:52:14'),
(12, 1, 'CLIENTI ITALIA NON ASSOCIATI', 'CLIENTI OCCASIONALI', '03', 9, '2025-10-05 22:10:39', '2025-10-05 22:10:39');
