-- Aggiornamento struttura database per gestione avanzata pagine e menu multilivello
-- Data: 21/12/2025
-- Descrizione: Supporto per SEO avanzato, visibilità e menu gerarchico

-- 1. Aggiornamento tabella web_pages con campi aggiuntivi
ALTER TABLE web_pages
ADD COLUMN IF NOT EXISTS descrizione_seo TEXT DEFAULT NULL COMMENT 'Meta description per SEO',
ADD COLUMN IF NOT EXISTS titolo_pagina VARCHAR(255) DEFAULT NULL COMMENT 'Titolo H1 della pagina',
ADD COLUMN IF NOT EXISTS keywords_seo TEXT DEFAULT NULL COMMENT 'Meta keywords per SEO',
ADD COLUMN IF NOT EXISTS immagine_social VARCHAR(500) DEFAULT NULL COMMENT 'URL immagine per social media (Open Graph)',
ADD COLUMN IF NOT EXISTS id_page_parent INT DEFAULT NULL COMMENT 'ID pagina parent per menu gerarchico',
ADD COLUMN IF NOT EXISTS ordine_menu INT DEFAULT 0 COMMENT 'Ordinamento nel menu',
ADD COLUMN IF NOT EXISTS livello_menu INT DEFAULT 1 COMMENT 'Livello nel menu gerarchico',
ADD COLUMN IF NOT EXISTS mostra_menu BOOLEAN DEFAULT TRUE COMMENT 'Mostra nel menu di navigazione',
ADD COLUMN IF NOT EXISTS link_esterno VARCHAR(500) DEFAULT NULL COMMENT 'Link esterno (se specificato, il link punta qui)',
ADD COLUMN IF NOT EXISTS target_link ENUM('_self', '_blank') DEFAULT '_self' COMMENT 'Target per link esterno',
ADD COLUMN IF NOT EXISTS icona_menu VARCHAR(100) DEFAULT NULL COMMENT 'Icona per menu (fontawesome o heroicons)',
ADD COLUMN IF NOT EXISTS data_pubblicazione DATETIME DEFAULT NULL COMMENT 'Data di pubblicazione programmata',
ADD COLUMN IF NOT EXISTS data_scadenza DATETIME DEFAULT NULL COMMENT 'Data di scadenza pubblicazione',
ADD COLUMN IF NOT EXISTS password_protetta VARCHAR(255) DEFAULT NULL COMMENT 'Password per protezione pagina',
ADD COLUMN IF NOT EXISTS layout_template VARCHAR(50) DEFAULT 'default' COMMENT 'Template layout specifico per pagina',
ADD COLUMN IF NOT EXISTS canonical_url VARCHAR(500) DEFAULT NULL COMMENT 'URL canonical per SEO',
ADD COLUMN IF NOT EXISTS robots_index ENUM('index', 'noindex') DEFAULT 'index' COMMENT 'Directiva robots per indicizzazione',
ADD COLUMN IF NOT EXISTS robots_follow ENUM('follow', 'nofollow') DEFAULT 'follow' COMMENT 'Directiva robots per follow';

-- 2. Aggiunta foreign key per gerarchia menu
ALTER TABLE web_pages
ADD CONSTRAINT fk_page_parent FOREIGN KEY (id_page_parent) REFERENCES web_pages(id) ON DELETE SET NULL;

-- 3. Creazione indici per performance
CREATE INDEX IF NOT EXISTS idx_web_pages_ditta_slug ON web_pages(id_ditta, slug);
CREATE INDEX IF NOT EXISTS idx_web_pages_parent ON web_pages(id_page_parent);
CREATE INDEX IF NOT EXISTS idx_web_pages_menu ON web_pages(id_ditta, mostra_menu, pubblicata, ordine_menu);
CREATE INDEX IF NOT EXISTS idx_web_pages_pubblicazione ON web_pages(pubblicata, data_pubblicazione, data_scadenza);

-- 4. Tabella per le revisioni delle pagine (versioning)
CREATE TABLE IF NOT EXISTS web_page_revisions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_page INT NOT NULL,
    id_utente INT NOT NULL,
    contenuto JSON NOT NULL COMMENT 'Snapshot completo dei componenti',
    motivo_revision VARCHAR(255) DEFAULT NULL COMMENT 'Motivo della revisione',
    data_revision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_page) REFERENCES web_pages(id) ON DELETE CASCADE,
    FOREIGN KEY (id_utente) REFERENCES utenti(id) ON DELETE CASCADE,
    INDEX idx_revision_page (id_page),
    INDEX idx_revision_data (data_revision)
);

-- 5. Tabella per i redirect delle pagine (gestione 301/302)
CREATE TABLE IF NOT EXISTS web_page_redirects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_ditta INT NOT NULL,
    slug_origine VARCHAR(255) NOT NULL COMMENT 'Slug originale che viene reindirizzato',
    slug_destinazione VARCHAR(255) NOT NULL COMMENT 'Slug di destinazione',
    tipo_redirect ENUM('301', '302') DEFAULT '301' COMMENT 'Tipo di redirect',
    attivo BOOLEAN DEFAULT TRUE,
    data_creazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_ditta) REFERENCES ditte(id) ON DELETE CASCADE,
    UNIQUE KEY unique_redirect_ditta_slug (id_ditta, slug_origine),
    INDEX idx_redirect_origine (slug_origine)
);

-- 6. Tabella per le configurazioni globali del menu
CREATE TABLE IF NOT EXISTS web_menu_configs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_ditta INT NOT NULL,
    nome_menu VARCHAR(100) DEFAULT 'main' COMMENT 'Nome del menu (main, footer, etc.)',
    configurazione JSON COMMENT 'Configurazioni del menu (stili, comportamenti)',
    data_creazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_aggiornamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_ditta) REFERENCES ditte(id) ON DELETE CASCADE,
    UNIQUE KEY unique_menu_ditta (id_ditta, nome_menu)
);

-- 7. Inserimento configurazione di default per tutte le ditte esistenti
INSERT IGNORE INTO web_menu_configs (id_ditta, nome_menu, configurazione)
SELECT id, 'main', JSON_OBJECT(
    'style', 'horizontal',
    'showSubmenuOn', 'hover',
    'mobileStyle', 'slide',
    'maxDepth', 3,
    'showHome', true
) FROM ditte WHERE id_tipo_ditta = 1;

-- 8. Trigger per validare gerarchia menu
DELIMITER //
CREATE TRIGGER IF NOT EXISTS validate_page_hierarchy
BEFORE INSERT ON web_pages
FOR EACH ROW
BEGIN
    DECLARE parent_level INT DEFAULT 0;
    DECLARE max_depth INT DEFAULT 3;

    -- Controlla che la gerarchia non superi il limite massimo
    IF NEW.id_page_parent IS NOT NULL THEN
        SELECT COALESCE(livello_menu, 0) INTO parent_level
        FROM web_pages
        WHERE id = NEW.id_page_parent;

        IF parent_level >= max_depth THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = CONCAT('La gerarchia del menu non può superare il livello ', max_depth);
        END IF;

        SET NEW.livello_menu = parent_level + 1;
    END IF;
END//
DELIMITER ;

-- 9. Funzione per generare albero menu ricorsivo
DELIMITER //
CREATE FUNCTION IF NOT EXISTS generate_menu_tree(ditta_id_param INT, menu_name VARCHAR(50))
RETURNS JSON
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE json_result JSON;

    SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
            'id', p.id,
            'slug', p.slug,
            'titolo_seo', p.titolo_seo,
            'titolo_pagina', COALESCE(p.titolo_pagina, p.titolo_seo),
            'link_esterno', p.link_esterno,
            'target_link', p.target_link,
            'icona_menu', p.icona_menu,
            'livello', p.livello_menu,
            'ordine', p.ordine_menu,
            'children',
                CASE WHEN EXISTS (
                    SELECT 1 FROM web_pages child
                    WHERE child.id_page_parent = p.id
                    AND child.mostra_menu = TRUE
                    AND child.pubblicata = TRUE
                ) THEN (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id', c.id,
                            'slug', c.slug,
                            'titolo_seo', c.titolo_seo,
                            'titolo_pagina', COALESCE(c.titolo_pagina, c.titolo_seo),
                            'link_esterno', c.link_esterno,
                            'target_link', c.target_link,
                            'livello', c.livello_menu,
                            'ordine', c.ordine_menu
                        )
                    ) FROM web_pages c
                    WHERE c.id_page_parent = p.id
                    AND c.mostra_menu = TRUE
                    AND c.pubblicata = TRUE
                    ORDER BY c.ordine_menu ASC, c.slug ASC
                ) ELSE JSON_ARRAY() END
        )
    )
    FROM web_pages p
    WHERE p.id_ditta = ditta_id_param
    AND p.mostra_menu = TRUE
    AND p.pubblicata = TRUE
    AND p.id_page_parent IS NULL
    ORDER BY p.ordine_menu ASC, p.slug ASC
    INTO json_result;

    RETURN COALESCE(json_result, JSON_ARRAY());
END//
DELIMITER ;

-- 10. View per pagine pubblicate con metadati SEO
CREATE OR REPLACE VIEW vw_pagine_pubblicate AS
SELECT
    p.*,
    d.ragione_sociale as nome_ditta,
    d.url_slug as slug_ditta,
    CASE
        WHEN p.password_protetta IS NOT NULL THEN 'protetta'
        WHEN p.data_pubblicazione > NOW() THEN 'programmata'
        WHEN p.data_scadenza IS NOT NULL AND p.data_scadenza < NOW() THEN 'scaduta'
        ELSE 'pubblicata'
    END as stato_pubblicazione
FROM web_pages p
JOIN ditte d ON p.id_ditta = d.id
WHERE p.pubblicata = TRUE
AND (p.data_pubblicazione IS NULL OR p.data_pubblicazione <= NOW())
AND (p.data_scadenza IS NULL OR p.data_scadenza >= NOW());

-- 11. Stored procedure per riordinamento menu
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS riordina_menu(IN ditta_id_param INT, IN page_ids JSON)
BEGIN
    DECLARE i INT DEFAULT 0;
    DECLARE page_count INT;
    DECLARE current_id INT;

    SET page_count = JSON_LENGTH(page_ids);

    WHILE i < page_count DO
        SET current_id = JSON_UNQUOTE(JSON_EXTRACT(page_ids, CONCAT('$[', i, ']')));

        UPDATE web_pages
        SET ordine_menu = i + 1
        WHERE id = current_id AND id_ditta = ditta_id_param;

        SET i = i + 1;
    END WHILE;
END//
DELIMITER ;