# Istruzioni Deployment Gallerie Fotografiche
**Data**: 08/12/2025
**Componente**: Website Builder Gallery System

## 📋 **PREREQUISITI**

### Ambiente di Sviluppo
- [x] Node.js 18+
- [x] Knex.js configurato
- [x] MySQL 8.0+
- [x] Accesso database con privilegi CREATE/DROP

### Backup
- [ ] Backup database corrente
- [ ] Backup codice sorgente

## 🚀 **DEPLOYMENT STEPS**

### 1. Database Migration
```bash
# Esegui migration Knex
npx knex migrate:latest

# Verifica tabelle create
mysql -u [user] -p [database] -e "
  SHOW TABLES LIKE 'wg_%';
  DESCRIBE wg_galleries;
  DESCRIBE wg_gallery_images;
"

# Verifica viste e triggers
mysql -u [user] -p [database] -e "
  SHOW TRIGGERS WHERE Trigger_name LIKE 'tr_wg_%';
  SHOW FULL TABLES WHERE Table_type LIKE 'VIEW';
"
```

### 2. Backend Deployment
```bash
# Riavvia server backend
pm2 restart opero-server

# Verifica endpoint API
curl http://localhost:3000/api/website/1/galleries
```

### 3. Frontend Deployment
```bash
# Build produzione
cd opero-frontend
npm run build

# Deploy build
npm run deploy

# Verifica frontend
curl http://localhost:3001/
```

## ✅ **VERIFICA POST-DEPLOYMENT**

### Database Checks
```sql
-- Verifica struttura tabelle
SELECT
  TABLE_NAME,
  COLUMN_NAME,
  DATA_TYPE,
  IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'opero_db'
  AND TABLE_NAME IN ('wg_galleries', 'wg_gallery_images')
ORDER BY TABLE_NAME, ORDINAL_POSITION;

-- Verifica foreign keys
SELECT
  CONSTRAINT_NAME,
  TABLE_NAME,
  COLUMN_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'opero_db'
  AND TABLE_NAME IN ('wg_galleries', 'wg_gallery_images')
  AND REFERENCED_TABLE_NAME IS NOT NULL;
```

### API Tests
```bash
# Test endpoints gallerie
echo "Test GET galleries..."
curl -X GET "http://localhost:3000/api/website/1/galleries"

echo -e "\n\nTest POST gallery..."
curl -X POST "http://localhost:3000/api/website/1/galleries" \
  -H "Content-Type: application/json" \
  -d '{
    "nome_galleria": "Test Deployment",
    "layout": "grid-3",
    "descrizione": "Galleria test deployment"
  }'

echo -e "\n\nTest GET gallery detail..."
curl -X GET "http://localhost:3000/api/website/1/galleries/1"
```

### Frontend Tests
1. **Accesso Website Builder**:
   - Navigare a `http://localhost:3001/website-builder`
   - Verificare caricamento componenti

2. **Test Gallerie**:
   - Creare nuova galleria
   - Test upload immagini
   - Test salvataggio

3. **Test Page Builder**:
   - Creare pagina statica
   - Aggiungere blocco galleria
   - Test preview

## 🔧 **ROLLBACK PLAN**

### Database Rollback
```bash
# Rollback migration
npx knex migrate:rollback

# Oppure rollback manuale
DROP TABLE IF EXISTS wg_gallery_images;
DROP TABLE IF EXISTS wg_galleries;
DROP VIEW IF EXISTS v_wg_galleries_complete;
DROP VIEW IF EXISTS v_wg_gallery_images_complete;
```

### Backend Rollback
```bash
# Ripristina backup routes/website.js
git checkout HEAD -- routes/website.js

# Riavvia server
pm2 restart opero-server
```

### Frontend Rollback
```bash
# Ripristina backup frontend
git checkout HEAD -- opero-frontend/src/components/website/
npm run build
```

## 📊 **MONITORING POST-DEPLOYMENT**

### Logs da Monitorare
```bash
# Backend logs
pm2 logs opero-server --lines 100

# Error logs specifici
grep -i "wg_galler" /var/log/opero/error.log

# Performance logs
grep -i "gallery" /var/log/opero/performance.log
```

### Health Checks
```bash
# Verifica API response times
curl -w "@curl-format.txt" -s -o /dev/null http://localhost:3000/api/website/1/galleries

# Database connection test
mysql -u [user] -p[password] -e "SELECT 1 as test;"
```

## 🚨 **ISSUE RESOLUTION**

### Common Problems

#### 1. Migration Fallita
```bash
# Controlla errore specifico
npx knex migrate:latest --verbose

# Controlla stato migration
npx knex migrate:status

# Force rollback se necessario
npx knex migrate:rollback --force
```

#### 2. Foreign Key Errors
```sql
-- Verifica foreign key constraints
SELECT
  CONSTRAINT_NAME,
  TABLE_NAME,
  COLUMN_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME,
  DELETE_RULE,
  UPDATE_RULE
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'opero_db'
  AND TABLE_NAME IN ('wg_galleries', 'wg_gallery_images');
```

#### 3. Frontend Component Errors
```bash
# Clear cache
rm -rf opero-frontend/node_modules/.cache
npm run build

# Check console errors
apri browser developer tools e controlla console
```

#### 4. API 500 Errors
```bash
# Check server logs
tail -f /var/log/opero/error.log

# Debug specific endpoint
curl -v http://localhost:3000/api/website/1/galleries
```

## 📞 **CONTACTS**

Per problemi durante deployment:
- **Database Admin**: dba@operocloud.it
- **Backend Team**: backend@operocloud.it
- **Frontend Team**: frontend@operocloud.it
- **DevOps**: devops@operocloud.it

## ✅ **CHECKLIST FINALE**

- [ ] Migration eseguita con successo
- [ ] Tutte le tabelle create correttamente
- [ ] Foreign keys funzionanti
- [ ] API endpoints respondono correttamente
- [ ] Frontend components caricano senza errori
- [ ] Test manuali superati
- [ ] Performance accettabile
- [ ] Logs senza errori critici
- [ ] Backup completato
- [ ] Documentazione aggiornata

---

**Status**: ✅ **PRONTO PER DEPLOYMENT**
**Priorità**: **ALTA** - Deploy ASAP dopo backup