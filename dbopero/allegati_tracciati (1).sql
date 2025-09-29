-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Creato il: Set 29, 2025 alle 18:28
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
-- Struttura della tabella `allegati_tracciati`
--

CREATE TABLE `allegati_tracciati` (
  `id` int(11) NOT NULL,
  `id_email_inviata` int(11) NOT NULL,
  `nome_file_originale` varchar(255) NOT NULL,
  `percorso_file_salvato` varchar(255) NOT NULL,
  `tipo_file` varchar(100) DEFAULT NULL,
  `dimensione_file` int(11) DEFAULT NULL,
  `scaricato` tinyint(1) DEFAULT 0,
  `data_primo_download` timestamp NULL DEFAULT NULL,
  `download_id` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dump dei dati per la tabella `allegati_tracciati`
--

INSERT INTO `allegati_tracciati` (`id`, `id_email_inviata`, `nome_file_originale`, `percorso_file_salvato`, `tipo_file`, `dimensione_file`, `scaricato`, `data_primo_download`, `download_id`) VALUES
(1, 1, 'palermoservizi_gruppi.pdf', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1753470784241-palermoservizi_gruppi.pdf', 'application/pdf', 113033, 0, NULL, '275d9cbe-db37-456e-a3bb-24f48297d4d9'),
(2, 3, 'surgelo_.pdf', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1753471059552-surgelo_.pdf', 'application/pdf', 212216, 1, '2025-07-25 19:18:11', '0ebed6c3-bcfe-442d-94fe-ca8a7ef96b56'),
(3, 4, '1218302039.pdf', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1753472002575-1218302039.pdf', 'application/pdf', 53626, 1, '2025-07-25 19:34:07', 'cb608327-91db-459e-b727-b1a0d656c4cd'),
(4, 5, 'surgelo_.pdf', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1753472096001-surgelo_.pdf', 'application/pdf', 212216, 1, '2025-07-25 19:37:09', '2720cf97-e22b-4322-9b8c-3048f1d5fc8b'),
(5, 9, 'MEMBRI ASSEMBLEA ELETTIVA.xlsx', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1753522372999-MEMBRI ASSEMBLEA ELETTIVA.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 18833, 0, NULL, '153e8a26-30aa-4c23-b85a-4bfaf5414d54'),
(6, 11, 'Fattura_2972377giugno2024.pdf', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1753884910505-Fattura_2972377giugno2024.pdf', 'application/pdf', 200017, 0, NULL, 'dfe94a73-557f-470b-86fd-e5b54778627a'),
(7, 11, 'Fattura_3148208lug2024.pdf', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1753884910509-Fattura_3148208lug2024.pdf', 'application/pdf', 200866, 0, NULL, '3ae7a052-c0d5-41e0-b654-8e008041f7de'),
(8, 11, 'Fattura_3336520ago2024.pdf', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1753884910512-Fattura_3336520ago2024.pdf', 'application/pdf', 201119, 0, NULL, 'd033d882-ade7-4729-b9a6-2477c6147100'),
(9, 11, 'Fattura_3511936sett2024.pdf', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1753884910514-Fattura_3511936sett2024.pdf', 'application/pdf', 227628, 0, NULL, 'c41be342-1840-4807-af32-b8da88ff3c4d'),
(10, 11, 'Fattura_3889618nov2024.pdf', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1753884910515-Fattura_3889618nov2024.pdf', 'application/pdf', 215176, 0, NULL, 'ae59e82a-72c4-4040-930c-82531581d7f7'),
(11, 11, 'Fattura_4039396dic2024.pdf', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1753884910517-Fattura_4039396dic2024.pdf', 'application/pdf', 177862, 0, NULL, 'b7c46ada-520b-4139-9a4d-36313a4eabe6'),
(12, 11, 'Fattura_4870821.pdf', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1753884910520-Fattura_4870821.pdf', 'application/pdf', 190649, 0, NULL, 'addd69da-6bf6-46de-a4e9-5dd605a757a4'),
(13, 11, 'Fattura_5080927MAGGIO.pdf', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1753884910521-Fattura_5080927MAGGIO.pdf', 'application/pdf', 178922, 0, NULL, 'f833d2af-4cce-48e2-9db7-4b38fd265204'),
(14, 11, 'Fattura_5553859LUGL.pdf', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1753884910523-Fattura_5553859LUGL.pdf', 'application/pdf', 520484, 0, NULL, '4909d0b9-2423-4348-adc8-b52dafbd30df'),
(15, 11, 'Fattura_37132450tt2024.pdf', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1753884910529-Fattura_37132450tt2024.pdf', 'application/pdf', 214678, 0, NULL, 'a7126a2a-9dcf-4032-aa72-1e33f5cf03d3'),
(16, 11, 'Fattura_422459531gen.pdf', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1753884910532-Fattura_422459531gen.pdf', 'application/pdf', 190040, 0, NULL, '5d6db57d-9c7c-4050-a6af-021eae67e7e3'),
(17, 11, 'Fattura_444766428febbr.pdf', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1753884910535-Fattura_444766428febbr.pdf', 'application/pdf', 178298, 0, NULL, '8d446803-c7a8-4fa1-95c6-130a48f8a6c7'),
(18, 11, 'Fattura_460428631marzo.pdf', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1753884910549-Fattura_460428631marzo.pdf', 'application/pdf', 178474, 0, NULL, 'e9fac1f0-9d6c-4987-ab67-d344a43d1159'),
(19, 11, 'Fattura_487082130aprile.pdf', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1753884910554-Fattura_487082130aprile.pdf', 'application/pdf', 190649, 0, NULL, '31c53d62-2f3d-4779-97ef-a469f9d7b48a'),
(20, 11, 'Fattura_530427130giu.pdf', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1753884910557-Fattura_530427130giu.pdf', 'application/pdf', 179010, 0, NULL, '54817f6c-5fe7-4b7a-9e62-f33a89f11c1b'),
(21, 11, 'Fattura_50809273005.pdf', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1753884910560-Fattura_50809273005.pdf', 'application/pdf', 178922, 0, NULL, 'bef80f5c-6f7f-44d0-a619-de9a7f1e827e'),
(22, 11, 'Riepilogo_Energia_Elettrica_maggio24_maggio25.pdf', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1753884910561-Riepilogo_Energia_Elettrica_maggio24_maggio25.pdf', 'application/pdf', 218659, 0, NULL, 'e65a1452-0a4e-4898-9aaa-bc53f8865992'),
(23, 13, 'mastri-1.xlsx', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1754414930982-mastri-1.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 11671, 0, NULL, 'e7ccdf5a-7413-4084-a144-dfaf71fb8486'),
(24, 24, 'operodb.sql', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1754649216203-operodb.sql', 'application/octet-stream', 78416, 0, NULL, '35971f8a-c5d4-433f-aef5-563f8af90999'),
(25, 25, 'operodb (1).sql', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1754649752084-operodb (1).sql', 'application/octet-stream', 78717, 0, NULL, '6cb5ebe0-79b0-470c-b651-716da0aad338'),
(26, 26, 'operodb.json', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1754649940696-operodb.json', 'application/json', 80472, 0, NULL, 'd974a39a-1a59-4f1c-b5a7-42255d4852cd'),
(27, 27, 'conti_cont.xlsx', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1754650409887-conti_cont.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 600756, 0, NULL, 'aa376dc0-7d40-4ae6-97d1-547007bb0652'),
(28, 28, 'operodb (1).sql', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1754650553031-operodb (1).sql', 'application/octet-stream', 78717, 0, NULL, 'bd0ff43b-d98a-4cc4-9c0f-18df32b2a1fb'),
(29, 30, 'conti_cont.xlsx', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1754650691645-conti_cont.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 600756, 0, NULL, '41244d4d-d345-430f-9cba-d2c5888f4952'),
(30, 31, 'conti_cont.xlsx', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1754650826973-conti_cont.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 600756, 0, NULL, '012bc5bc-7623-461a-a77d-044dce05902b'),
(31, 32, 'conti_cont (1).xlsx', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1754652354689-conti_cont (1).xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 600756, 0, NULL, '756f8325-c59e-4b3f-9977-4e8df9832a6b'),
(32, 33, 'conti_cont (1).xlsx', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1754652631573-conti_cont (1).xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 600756, 1, '2025-08-08 11:31:01', 'e1bd71b9-b92e-4fc9-8d31-51233b505123'),
(33, 34, 'moduli.pdf', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1754679234734-moduli.pdf', 'application/pdf', 103865, 0, NULL, '21175ce6-46b1-44b3-ad12-7eba47a47aa9'),
(34, 35, 'conti_cont (1) (1).xlsx', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1754679820987-conti_cont (1) (1).xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 600756, 0, NULL, '3f550d63-4556-4052-a6b7-b17aef0d7043'),
(35, 36, 'conti_cont.xlsx', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1754679871165-conti_cont.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 600756, 0, NULL, '9ca6d528-12b2-49cb-b997-c38212450d04'),
(36, 37, 'conti_cont (1) (1).xlsx', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1754680301138-conti_cont (1) (1).xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 600756, 0, NULL, 'f3d1c72b-aa88-4328-8083-90e2aa7bf4ab'),
(37, 38, 'conti_cont (3).xlsx', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1754680349490-conti_cont (3).xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 600756, 1, '2025-08-08 19:22:46', 'c5df5342-488e-4fac-ac04-1a204d713fed'),
(38, 41, 'UserForm.js', 'C:\\Users\\ANGELOBRUNO\\Documents\\app\\opero\\uploads\\1754755511252-UserForm.js', 'text/javascript', 3828, 0, NULL, '76a1d5c5-0938-4e3e-b7eb-f57c1804737d');

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `allegati_tracciati`
--
ALTER TABLE `allegati_tracciati`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `download_id` (`download_id`),
  ADD KEY `id_email_inviata` (`id_email_inviata`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `allegati_tracciati`
--
ALTER TABLE `allegati_tracciati`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `allegati_tracciati`
--
ALTER TABLE `allegati_tracciati`
  ADD CONSTRAINT `allegati_tracciati_ibfk_1` FOREIGN KEY (`id_email_inviata`) REFERENCES `email_inviate` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
