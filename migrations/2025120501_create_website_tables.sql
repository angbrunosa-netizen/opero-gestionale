-- Migration: Creazione tabelle sistema Website Builder
-- Version: 1.0
-- Date: 2025-12-05
-- Description: Tabelle per gestione siti web aziendali multi-tenant

-- ============================================
-- 1. TABELLA SITI WEB AZIENDALI
-- ============================================

CREATE TABLE IF NOT EXISTS `siti_web_aziendali` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_ditta` INT UNSIGNED NOT NULL,
  `subdomain` VARCHAR(100) UNIQUE NOT NULL COMMENT 'Sottodominio univoco',
  `domain_status` ENUM('active', 'inactive', 'pending') DEFAULT 'pending' COMMENT 'Stato dominio',

  -- Configurazione template
  `template_id` INT DEFAULT 1 COMMENT 'ID template predefinito',
  `theme_config` JSON NULL COMMENT 'Configurazione tema personalizzata',

  -- SEO e contenuti base
  `site_title` VARCHAR(255) NULL COMMENT 'Titolo sito web',
  `site_description` TEXT NULL COMMENT 'Descrizione per SEO',
  `logo_url` VARCHAR(500) NULL COMMENT 'URL logo azienda',
  `favicon_url` VARCHAR(500) NULL COMMENT 'URL favicon',

  -- Social media e analytics
  `google_analytics_id` VARCHAR(50) NULL COMMENT 'ID Google Analytics',
  `facebook_url` VARCHAR(500) NULL COMMENT 'URL Facebook',
  `instagram_url` VARCHAR(500) NULL COMMENT 'URL Instagram',
  `linkedin_url` VARCHAR(500) NULL COMMENT 'URL LinkedIn',

  -- Impostazioni catalogo
  `enable_catalog` BOOLEAN DEFAULT FALSE COMMENT 'Abilita vetrina prodotti',
  `catalog_settings` JSON DEFAULT '{}' COMMENT 'Impostazioni catalogo prodotti',

  -- Timestamps
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Foreign keys
  FOREIGN KEY (`id_ditta`) REFERENCES `ditte`(`id`) ON DELETE CASCADE,

  -- Indexes
  INDEX `idx_subdomain` (`subdomain`),
  INDEX `idx_ditta` (`id_ditta`),
  INDEX `idx_domain_status` (`domain_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. TABELLA TEMPLATE SITI WEB
-- ============================================

CREATE TABLE IF NOT EXISTS `template_siti_web` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nome_template` VARCHAR(100) NOT NULL COMMENT 'Nome template',
  `categoria` ENUM('basic', 'premium', 'ecommerce') DEFAULT 'basic' COMMENT 'Categoria template',
  `description` TEXT NULL COMMENT 'Descrizione template',
  `preview_image` VARCHAR(500) NULL COMMENT 'Immagine anteprima',
  `config_schema` JSON NULL COMMENT 'Schema configurazione template',
  `is_active` BOOLEAN DEFAULT TRUE COMMENT 'Template disponibile',
  `sort_order` INT DEFAULT 0 COMMENT 'Ordine visualizzazione',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Indexes
  INDEX `idx_categoria` (`categoria`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert template di default
INSERT IGNORE INTO `template_siti_web` (`nome_template`, `categoria`, `description`, `config_schema`) VALUES
('Professional', 'basic', 'Template professionale pulito e moderno', JSON_OBJECT(
  'theme', JSON_OBJECT(
    'primary_color', '#3B82F6',
    'secondary_color', '#1E40AF',
    'accent_color', '#60A5FA'
  ),
  'typography', JSON_OBJECT(
    'font_family', 'Inter, system-ui, sans-serif',
    'base_font_size', '16px',
    'h1_size', '48px'
  ),
  'layout', JSON_OBJECT(
    'max_width', '1200px',
    'spacing', 'comfortable',
    'border_radius', '8px'
  )
)),
('Modern', 'basic', 'Template moderno con design minimalista', JSON_OBJECT(
  'theme', JSON_OBJECT(
    'primary_color', '#10B981',
    'secondary_color', '#047857',
    'accent_color', '#34D399'
  )
)),
('Creative', 'premium', 'Template creativo con design accattivante', JSON_OBJECT(
  'theme', JSON_OBJECT(
    'primary_color', '#8B5CF6',
    'secondary_color', '#7C3AED',
    'accent_color', '#A78BFA'
  )
)),
('Ecommerce', 'ecommerce', 'Template ottimizzato per vendita online', JSON_OBJECT(
  'theme', JSON_OBJECT(
    'primary_color', '#F97316',
    'secondary_color', '#EA580C',
    'accent_color', '#FB923C'
  )
)),
('Corporate', 'basic', 'Template corporate elegante e formale', JSON_OBJECT(
  'theme', JSON_OBJECT(
    'primary_color', '#6B7280',
    'secondary_color', '#374151',
    'accent_color', '#9CA3AF'
  )
));

-- ============================================
-- 3. TABELLA PAGINE SITO WEB
-- ============================================

CREATE TABLE IF NOT EXISTS `pagine_sito_web` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_sito_web` INT NOT NULL,
  `slug` VARCHAR(200) NOT NULL COMMENT 'Slug URL pagina',
  `titolo` VARCHAR(255) NOT NULL COMMENT 'Titolo pagina',
  `contenuto_html` LONGTEXT NULL COMMENT 'Contenuto HTML statico',
  `contenuto_json` JSON NULL COMMENT 'Contenuto strutturato per page builder',

  -- SEO
  `meta_title` VARCHAR(255) NULL COMMENT 'Meta title SEO',
  `meta_description` TEXT NULL COMMENT 'Meta description SEO',
  `meta_keywords` VARCHAR(500) NULL COMMENT 'Meta keywords SEO',

  -- Stato
  `is_published` BOOLEAN DEFAULT FALSE COMMENT 'Pagina pubblicata',
  `menu_order` INT DEFAULT 0 COMMENT 'Ordine menu navigazione',

  -- Timestamps
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Foreign keys
  FOREIGN KEY (`id_sito_web`) REFERENCES `siti_web_aziendali`(`id`) ON DELETE CASCADE,

  -- Indexes
  UNIQUE KEY `unique_site_slug` (`id_sito_web`, `slug`),
  INDEX `idx_published` (`is_published`),
  INDEX `idx_menu_order` (`menu_order`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. TABELLA ARTICOLI BLOG
-- ============================================

CREATE TABLE IF NOT EXISTS `articoli_blog` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_sito_web` INT NOT NULL,
  `titolo` VARCHAR(255) NOT NULL COMMENT 'Titolo articolo',
  `slug` VARCHAR(255) NOT NULL COMMENT 'Slug URL articolo',
  `contenuto` LONGTEXT NULL COMMENT 'Contenuto articolo',
  `immagine_url` VARCHAR(500) NULL COMMENT 'URL immagine copertina',
  `categoria` VARCHAR(100) NULL COMMENT 'Categoria articolo',
  `tags` VARCHAR(500) NULL COMMENT 'Tag separati da virgola',
  `autore` VARCHAR(255) NULL COMMENT 'Nome autore',

  -- SEO
  `meta_title` VARCHAR(255) NULL COMMENT 'Meta title SEO',
  `meta_description` TEXT NULL COMMENT 'Meta description SEO',

  -- Stato
  `is_published` BOOLEAN DEFAULT FALSE COMMENT 'Articolo pubblicato',
  `published_at` TIMESTAMP NULL COMMENT 'Data pubblicazione',
  `featured` BOOLEAN DEFAULT FALSE COMMENT 'Articolo in evidenza',
  `views_count` INT DEFAULT 0 COMMENT 'Numero visualizzazioni',

  -- Timestamps
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Foreign keys
  FOREIGN KEY (`id_sito_web`) REFERENCES `siti_web_aziendali`(`id`) ON DELETE CASCADE,

  -- Indexes
  UNIQUE KEY `unique_site_slug` (`id_sito_web`, `slug`),
  INDEX `idx_published` (`is_published`),
  INDEX `idx_featured` (`featured`),
  INDEX `idx_categoria` (`categoria`),
  INDEX `idx_published_at` (`published_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. TABELLA ANALYTICS SITI WEB (Opzionale per future implementazioni)
-- ============================================

CREATE TABLE IF NOT EXISTS `website_analytics` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_sito_web` INT NOT NULL,
  `data_giorno` DATE NOT NULL,

  -- Statistiche visite
  `visite_totali` INT DEFAULT 0 COMMENT 'Visite totali giornata',
  `visite_uniche` INT DEFAULT 0 COMMENT 'Visitatori unici',
  `visualizzazioni_pagina` INT DEFAULT 0 COMMENT 'Visualizzazioni pagine',

  -- Sorgenti traffico
  `visite_organiche` INT DEFAULT 0 COMMENT 'Visite da motori ricerca',
  `visite_social` INT DEFAULT 0 COMMENT 'Visite da social media',
  `visite_direct` INT DEFAULT 0 COMMENT 'Visite dirette',
  `visite_referral` INT DEFAULT 0 COMMENT 'Visite da referral',

  -- Dispositivi
  `visite_desktop` INT DEFAULT 0 COMMENT 'Visite da desktop',
  `visite_mobile` INT DEFAULT 0 COMMENT 'Visite da mobile',
  `visite_tablet` INT DEFAULT 0 COMMENT 'Visite da tablet',

  -- Tempo medio
  `tempo_medio_sessione` INT DEFAULT 0 COMMENT 'Tempo medio sessione (secondi)',
  `frequenza_rebound` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Frequenza di rimbalzo (%)',

  -- Timestamp
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Foreign keys
  FOREIGN KEY (`id_sito_web`) REFERENCES `siti_web_aziendali`(`id`) ON DELETE CASCADE,

  -- Indexes
  UNIQUE KEY `unique_site_date` (`id_sito_web`, `data_giorno`),
  INDEX `idx_data_giorno` (`data_giorno`),
  INDEX `idx_visite_totali` (`visite_totali`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. TABELLA WEBSITE_ACTIVITY LOG
-- ============================================

CREATE TABLE IF NOT EXISTS `website_activity_log` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `id_sito_web` INT NOT NULL,
  `id_utente` INT NULL COMMENT 'ID utente (se applicabile)',

  -- Tipo attività
  `azione` VARCHAR(50) NOT NULL COMMENT 'Tipo di attività (create, update, delete, publish, etc.)',
  `tipo_oggetto` VARCHAR(50) NOT NULL COMMENT 'Tipo oggetto (site, page, template, image, etc.)',
  `id_oggetto` INT NULL COMMENT 'ID oggetto modificato',
  `descrizione_oggetto` VARCHAR(255) NULL COMMENT 'Descrizione oggetto (es. titolo pagina)',

  -- Dati precedenti e successivi
  `dati_prima` JSON NULL COMMENT 'Stato prima modifica',
  `dati_dopo` JSON NULL COMMENT 'Stato dopo modifica',

  -- Context
  `ip_address` VARCHAR(45) NULL COMMENT 'IP client',
  `user_agent` TEXT NULL COMMENT 'User agent browser',

  -- Timestamp
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Foreign keys
  FOREIGN KEY (`id_sito_web`) REFERENCES `siti_web_aziendali`(`id`) ON DELETE CASCADE,

  -- Indexes
  INDEX `idx_sito_web` (`id_sito_web`),
  INDEX `idx_azione` (`azione`),
  INDEX `idx_tipo_oggetto` (`tipo_oggetto`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- VISTE OTTIMIZZATE PER PERFORMANCE
-- ============================================

-- Vista per statistiche siti web
CREATE OR REPLACE VIEW `vw_website_stats` AS
SELECT
    sw.id,
    sw.subdomain,
    sw.site_title,
    sw.domain_status,
    d.ragione_sociale,
    COUNT(DISTINCT ps.id) as num_pagine,
    COUNT(DISTINCT ab.id) as num_articoli,
    COUNT(DISTINCT wa.data_giorno) as giorni_con_dati,
    sw.created_at,
    sw.updated_at
FROM siti_web_aziendali sw
JOIN ditte d ON sw.id_ditta = d.id
LEFT JOIN pagine_sito_web ps ON sw.id = ps.id_sito_web
LEFT JOIN articoli_blog ab ON sw.id = ab.id_sito_web
LEFT JOIN website_analytics wa ON sw.id = wa.id_sito_web
GROUP BY sw.id;

-- Vista per cataloghi prodotti nei siti web
CREATE OR REPLACE VIEW `vw_website_catalogs` AS
SELECT
    sw.id as website_id,
    sw.subdomain,
    sw.site_title,
    sw.enable_catalog,
    sw.catalog_settings,
    COUNT(cp.id) as num_prodotti,
    COUNT(DISTINCT cp.id_categoria) as num_categorie,
    SUM(CASE WHEN cp.quantita_disponita > 0 THEN 1 ELSE 0 END) as num_disponibili,
    AVG(CASE WHEN cp.prezzo_vendita IS NOT NULL THEN cp.prezzo_vendita END) as prezzo_medio
FROM siti_web_aziendali sw
LEFT JOIN catalogo_prodotti cp ON sw.id_ditta = cp.id_ditta AND cp.is_active = 1
GROUP BY sw.id, sw.subdomain, sw.site_title, sw.enable_catalog, sw.catalog_settings;

-- ============================================
-- TRIGGER PER LOG ATTIVITÀ
-- ============================================

DELIMITER //

-- Trigger per log modifiche siti web
CREATE TRIGGER `tr_website_after_update`
AFTER UPDATE ON `siti_web_aziendali`
FOR EACH ROW
BEGIN
    IF OLD.domain_status != NEW.domain_status THEN
        INSERT INTO website_activity_log (id_sito_web, azione, tipo_oggetto, id_oggetto, dati_prima, dati_dopo)
        VALUES (
            NEW.id,
            'status_change',
            'site_status',
            NEW.id,
            JSON_OBJECT('domain_status', OLD.domain_status),
            JSON_OBJECT('domain_status', NEW.domain_status)
        );
    ENDIF;
END//

-- Trigger per log modifiche pagine
CREATE TRIGGER `tr_pagine_sito_web_after_update`
AFTER UPDATE ON `pagine_sito_web`
FOR EACH ROW
BEGIN
    IF OLD.is_published != NEW.is_published OR OLD.titolo != NEW.titolo THEN
        INSERT INTO website_activity_log (id_sito_web, azione, tipo_oggetto, id_oggetto, descrizione_oggetto, dati_prima, dati_dopo)
        VALUES (
            NEW.id_sito_web,
            'update',
            'page',
            NEW.id,
            NEW.titolo,
            JSON_OBJECT('is_published', OLD.is_published, 'titolo', OLD.titolo),
            JSON_OBJECT('is_published', NEW.is_published, 'titolo', NEW.titolo)
        );
    ENDIF;
END//

DELIMITER ;

-- ============================================
-- COMMENTI TABELLE
-- ============================================

ALTER TABLE `siti_web_aziendali`
  COMMENT = 'Tabella principale siti web aziendali - 1 sito per ditta';

ALTER TABLE `template_siti_web`
  COMMENT = 'Template predefiniti per siti web';

ALTER TABLE `pagine_sito_web`
  COMMENT = 'Pagine statiche e dinamiche dei siti web';

ALTER TABLE `articoli_blog`
  COMMENT = 'Articoli blog per siti web';

ALTER TABLE `website_analytics`
  COMMENT = 'Statistiche e analytics siti web (opzionale)';

ALTER TABLE `website_activity_log`
  COMMENT = 'Log attività per audit e tracciabilità modifiche';

-- ============================================
-- MIGRATION COMPLETATA
-- ============================================

SELECT 'Migration completata con successo' as status,
       'Tabelle website create' as message,
       NOW() as completed_at;