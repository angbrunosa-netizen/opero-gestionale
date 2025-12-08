# Istruzioni Rollback Migration
**Data**: 08/12/2025
**Issue**: Migration fallita per colonne errate in dm_files

## 🔧 **PROBLEMA**

La migration `20251208100000_create_wg_galleries_tables.js` è fallita perché:
- `dm_files` non ha le colonne: `nome_file`, `url_file`, `preview_url`
- Colonne reali: `file_name_originale`, `s3_key`, `mime_type`, `file_size_bytes`

## 🚀 **SOLUZIONE**

### 1. Pulisci Database
```bash
# Esegui rollback della migration fallita
npx knex migrate:rollback

# Verifica che le tabelle wg_* siano state rimosse
mysql -u root -p opero_db -e "SHOW TABLES LIKE 'wg_%';"
```

### 2. Esegui Migration Corretta
La migration è già stata aggiornata con le colonne corrette.

```bash
# Esegui migration
npx knex migrate:latest

# Dovrebbe funzionare ora senza errori
```

### 3. Verifica Risultato
```bash
# Verifica tabelle create
mysql -u root -p opero_db -e "
  SHOW TABLES LIKE 'wg_%';
  DESCRIBE wg_galleries;
  DESCRIBE wg_gallery_images;
"

# Verifica viste
mysql -u root -p opero_db -e "
  SHOW FULL TABLES WHERE Table_type LIKE 'VIEW' AND Table_name LIKE 'wg_%';
"

# Test vista
mysql -u root -p opero_db -e "
  SELECT COUNT(*) FROM v_wg_gallery_images_complete LIMIT 1;
"
```

## ✅ **CHECKLIST**

- [ ] Migration eseguita con successo
- [ ] Tabelle wg_galleries e wg_gallery_images create
- [ ] Viste create senza errori
- [ ] Triggers creati
- [ ] Nessun errore nelle query

## 🔍 **VERIFICA MANUALE**

```sql
-- Test select dalla vista
SELECT
  gi.id,
  g.nome_galleria,
  f.file_name_originale,
  f.s3_key,
  CONCAT('https://s3.operocloud.it/', f.s3_key) as url_calcolato
FROM v_wg_gallery_images_complete gi
LIMIT 1;
```

Se la select funziona, la migration è completata con successo!