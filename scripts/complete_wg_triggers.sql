-- Script per completare setup tabelle wg_galleries
-- Eseguire manualmente: mysql -u root -p opero_db < scripts/complete_wg_triggers.sql

-- Triggers per aggiornare slug automaticamente
DELIMITER //

CREATE TRIGGER tr_wg_galleries_before_insert
BEFORE INSERT ON wg_galleries
FOR EACH ROW
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    SET NEW.slug = LOWER(REPLACE(REPLACE(REPLACE(NEW.nome_galleria, ' ', '-'), '/', '-'), '_', '-'));
    SET NEW.slug = REGEXP_REPLACE(NEW.slug, '[^a-z0-9\-]', '');
    SET NEW.slug = REGEXP_REPLACE(NEW.slug, '\-+', '-');
    SET NEW.slug = TRIM(BOTH '-' FROM NEW.slug);
  END IF;
END//

CREATE TRIGGER tr_wg_galleries_before_update
BEFORE UPDATE ON wg_galleries
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