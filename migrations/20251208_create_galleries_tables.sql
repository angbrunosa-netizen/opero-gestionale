-- Migration per tabelle gallerie fotografiche
-- Creazione: 08/12/2025
-- Website Builder System - Gallery Management

-- Tabella principale per le gallerie
CREATE TABLE gallerie_sito_web (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_sito_web INT NOT NULL COMMENT 'FK verso siti_web_aziendali',
  id_pagina INT NULL COMMENT 'FK verso pagine_sito_web - NULL per gallerie globali',
  nome_galleria VARCHAR(255) NOT NULL COMMENT 'Nome identificativo galleria',
  slug VARCHAR(200) NULL COMMENT 'URL slug per gallerie pubbliche',
  descrizione TEXT NULL COMMENT 'Descrizione galleria',

  -- Layout e visualizzazione
  layout ENUM('grid-2', 'grid-3', 'grid-4', 'masonry', 'carousel') DEFAULT 'grid-3' COMMENT 'Layout visualizzazione',

  -- Impostazioni avanzate
  impostazioni JSON DEFAULT '{}' COMMENT 'Impostazioni aggiuntive (spacing, borders, effects, etc.)',

  -- Metadati SEO
  meta_title VARCHAR(255) NULL,
  meta_description TEXT NULL,

  -- Stato e ordinamento
  is_active BOOLEAN DEFAULT TRUE COMMENT 'Galleria visibile/pubblicata',
  sort_order INT DEFAULT 0 COMMENT 'Ordine visualizzazione',

  -- Timestamp
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Foreign keys
  FOREIGN KEY (id_sito_web) REFERENCES siti_web_aziendali(id) ON DELETE CASCADE,
  FOREIGN KEY (id_pagina) REFERENCES pagine_sito_web(id) ON DELETE CASCADE,

  -- Indexes
  INDEX idx_gallerie_sito (id_sito_web),
  INDEX idx_gallerie_pagina (id_pagina),
  INDEX idx_gallerie_active (is_active, sort_order),
  INDEX idx_gallerie_slug (slug, id_sito_web)
);

-- Tabella per le immagini nelle gallerie
CREATE TABLE gallerie_immagini (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_galleria INT NOT NULL COMMENT 'FK verso gallerie_sito_web',
  id_file INT NOT NULL COMMENT 'FK verso dm_files (immagine)',

  -- Metadati immagine
  caption TEXT NULL COMMENT 'Didascalia immagine',
  alt_text VARCHAR(500) NULL COMMENT 'Testo alternativo per SEO/Accessibilità',
  title_text VARCHAR(255) NULL COMMENT 'Titolo immagine (tooltip)',

  -- Posizione e ordinamento
  order_pos INT NOT NULL DEFAULT 0 COMMENT 'Posizione nella galleria',

  -- Impostazioni specifiche immagine
  impostazioni JSON DEFAULT '{}' COMMENT 'Impostazioni singola immagine (link, effetti, etc.)',

  -- Timestamp
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Foreign keys
  FOREIGN KEY (id_galleria) REFERENCES gallerie_sito_web(id) ON DELETE CASCADE,
  FOREIGN KEY (id_file) REFERENCES dm_files(id) ON DELETE CASCADE,

  -- Indexes
  INDEX idx_gallery_images (id_galleria, order_pos),
  INDEX idx_gallery_file (id_file),
  UNIQUE KEY unique_gallery_image_order (id_galleria, id_file)
);

-- Vista per facile query gallerie con immagini
CREATE VIEW v_gallerie_complete AS
SELECT
  g.*,
  COUNT(gi.id) as numero_immagini,
  MIN(gi.order_pos) as prima_posizione,
  MAX(gi.updated_at) as ultima_modifica_immagini
FROM gallerie_sito_web g
LEFT JOIN gallerie_immagini gi ON g.id = gi.id_galleria
WHERE g.is_active = 1
GROUP BY g.id;

-- Vista per immagini galleria con metadati file
CREATE VIEW v_gallerie_immagini_complete AS
SELECT
  gi.*,
  g.nome_galleria,
  g.id_sito_web,
  g.id_pagina,
  f.file_name_originale,
  f.nome_file,
  f.url_file,
  f.mime_type,
  f.file_size_bytes,
  f.preview_url
FROM gallerie_immagini gi
JOIN gallerie_sito_web g ON gi.id_galleria = g.id
JOIN dm_files f ON gi.id_file = f.id
WHERE g.is_active = 1;

-- Trigger per aggiornare slug automaticamente
DELIMITER //
CREATE TRIGGER before_gallery_insert
BEFORE INSERT ON gallerie_sito_web
FOR EACH ROW
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    SET NEW.slug = LOWER(REPLACE(REPLACE(REPLACE(NEW.nome_galleria, ' ', '-'), '/', '-'), '_', '-'));
    -- Rimuovi caratteri non validi
    SET NEW.slug = REGEXP_REPLACE(NEW.slug, '[^a-z0-9\-]', '');
    -- Assicura che finisca senza trattini multipli
    SET NEW.slug = REGEXP_REPLACE(NEW.slug, '\-+', '-');
    SET NEW.slug = TRIM(BOTH '-' FROM NEW.slug);
  END IF;
END//

CREATE TRIGGER before_gallery_update
BEFORE UPDATE ON gallerie_sito_web
FOR EACH ROW
BEGIN
  IF NEW.nome_galleria <> OLD.nome_galleria AND (NEW.slug IS NULL OR NEW.slug = '') THEN
    SET NEW.slug = LOWER(REPLACE(REPLACE(REPLACE(NEW.nome_galleria, ' ', '-'), '/', '-'), '_', '-'));
    SET NEW.slug = REGEXP_REPLACE(NEW.slug, '[^a-z0-9\-]', '');
    SET NEW.slug = REGEXP_REPLACE(NEW.slug, '\-+', '-');
    SET NEW.slug = TRIM(BOTH '-' FROM NEW.slug);
  END IF;
END//
DELIMITER ;

-- Sample data per testing
INSERT INTO gallerie_sito_web (id_sito_web, nome_galleria, descrizione, layout, impostazioni)
VALUES
(1, 'Gallery Principale', 'Galleria fotografica principale del sito', 'grid-3', '{"spacing": "medium", "border_radius": "8px"}'),
(1, 'Prodotti in Evidenza', 'I migliori prodotti del nostro catalogo', 'masonry', '{"spacing": "small", "show_captions": true}');

INSERT INTO gallerie_immagini (id_galleria, id_file, caption, alt_text, order_pos)
SELECT 1, id, 'Immagine di test', 'Immagine test galleria', ROW_NUMBER() OVER (ORDER BY id)
FROM dm_files
WHERE entita_tipo = 'WEBSITE_IMAGES'
LIMIT 6;