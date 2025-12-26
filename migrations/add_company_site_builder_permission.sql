-- ============================================================================
-- MIGRATION: Aggiunta permesso COMPANY_SITE_BUILDER
-- Data: 24/12/2025
-- Descrizione: Aggiunge un nuovo permesso per permettere agli amministratori
--              azienda di gestire il proprio sito web (ma non modificare l'URL slug)
-- ============================================================================

-- 1. Inserisci il nuovo permesso COMPANY_SITE_BUILDER
INSERT INTO permessi (codice, nome, descrizione, modulo_app, creato_il)
VALUES (
    'COMPANY_SITE_BUILDER',
    'Gestione Sito Web Azienda',
    'Permette agli amministratori azienda di gestire il sito web della propria azienda. Non permette la modifica del sottodominio.',
    'SITE_BUILDER',
    NOW()
)
ON DUPLICATE KEY UPDATE nome = 'Gestione Sito Web Azienda';

-- 2. Assegna questo permesso al ruolo "Amministratore Azienda" (id_ruolo = 2)
INSERT INTO ruolo_permessi (id_ruolo, id_permesso)
SELECT 2, id FROM permessi WHERE codice = 'COMPANY_SITE_BUILDER'
ON DUPLICATE KEY UPDATE id_ruolo = id_ruolo;

-- 3. Assicura che il ruolo System Admin (id_ruolo = 1) abbia il permesso SITE_BUILDER
-- Verifica prima se esiste
SET @site_builder_id = (SELECT id FROM permessi WHERE codice = 'SITE_BUILDER');

-- Se non esiste, crealo
INSERT INTO permessi (codice, nome, descrizione, modulo_app, creato_il)
VALUES (
    'SITE_BUILDER',
    'Gestione Siti Web',
    'Permette ai System Admin di gestire TUTTI i siti web delle ditte.',
    'SITE_BUILDER',
    NOW()
)
ON DUPLICATE KEY UPDATE nome = 'Gestione Siti Web';

SET @site_builder_id = (SELECT id FROM permessi WHERE codice = 'SITE_BUILDER');

-- Assegna SITE_BUILDER al System Admin (id_ruolo = 1)
INSERT IGNORE INTO ruolo_permessi (id_ruolo, id_permesso)
VALUES (1, @site_builder_id);

-- 4. VERIFICA: mostra i permessi per entrambi i ruoli
SELECT
    rp.id_ruolo,
    r.nome as ruolo_nome,
    p.codice,
    p.nome as permesso_nome,
    p.descrizione
FROM ruolo_permessi rp
INNER JOIN permessi p ON p.id = rp.id_permesso
INNER JOIN ruoli r ON r.id = rp.id_ruolo
WHERE rp.id_ruolo IN (1, 2)
  AND p.codice IN ('SITE_BUILDER', 'COMPANY_SITE_BUILDER')
ORDER BY rp.id_ruolo, p.codice;

-- Output atteso:
-- id_ruolo | ruolo_nome           | codice                 | permesso_nome
-- 1        | Amministratore Sistema | SITE_BUILDER          | Gestione Siti Web
-- 2        | Amministratore Azienda | COMPANY_SITE_BUILDER  | Gestione Sito Web Azienda
