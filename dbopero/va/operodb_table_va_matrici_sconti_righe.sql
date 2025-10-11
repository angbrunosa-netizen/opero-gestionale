
-- --------------------------------------------------------

--
-- Struttura della tabella `va_matrici_sconti_righe`
--

CREATE TABLE `va_matrici_sconti_righe` (
  `id` int(10) UNSIGNED NOT NULL,
  `id_matrice` int(10) UNSIGNED NOT NULL,
  `riga` int(11) NOT NULL,
  `sconto_1` decimal(5,2) DEFAULT 0.00,
  `sconto_2` decimal(5,2) DEFAULT 0.00,
  `sconto_3` decimal(5,2) DEFAULT 0.00,
  `sconto_4` decimal(5,2) DEFAULT 0.00,
  `sconto_5` decimal(5,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `va_matrici_sconti_righe`
--

INSERT INTO `va_matrici_sconti_righe` (`id`, `id_matrice`, `riga`, `sconto_1`, `sconto_2`, `sconto_3`, `sconto_4`, `sconto_5`) VALUES
(1, 3, 1, 5.00, 6.00, 6.00, 0.00, 0.00),
(2, 3, 2, 6.00, 7.00, 8.00, 8.00, 0.00),
(3, 4, 1, 10.00, 15.00, 15.00, 10.00, 0.00),
(4, 4, 2, 15.00, 10.00, 10.00, 10.00, 0.00);
