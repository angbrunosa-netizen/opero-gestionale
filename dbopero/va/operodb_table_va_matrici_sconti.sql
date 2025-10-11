
-- --------------------------------------------------------

--
-- Struttura della tabella `va_matrici_sconti`
--

CREATE TABLE `va_matrici_sconti` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_ditta` int(10) UNSIGNED NOT NULL,
  `codice` varchar(50) DEFAULT NULL,
  `descrizione` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `va_matrici_sconti`
--

INSERT INTO `va_matrici_sconti` (`id`, `id_ditta`, `codice`, `descrizione`) VALUES
(3, 1, '10', 'sconti standard'),
(4, 1, '20', 'Sconti TOP');
