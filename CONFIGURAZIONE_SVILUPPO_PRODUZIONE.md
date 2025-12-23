# Configurazione Sistema Sviluppo/Produzione - Siti Aziendali

## Data: 23/12/2025
## Autore: Claude Code
## Descrizione: Documentazione completa delle configurazioni per gestire correttamente gli URL tra sviluppo e produzione

---

## 1. Punto di Partenza: SiteBuilderModule.js ✅

**File**: `opero-frontend/src/components/SiteBuilderModule.js`
**Stato**: **GIÀ MODIFICATO** ✅

Il componente SiteBuilderModule ora determina automaticamente il dominio corretto:

```javascript
// Linee 134-145
// Determina il dominio base in base all'ambiente
const isDevelopment = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.port
);

const domain = isDevelopment
    ? 'localhost:3000'  // Ambiente di sviluppo
    : 'operocloud.it';  // Ambiente di produzione

const previewUrl = `http://${targetDitta.url_slug || 'test'}.${domain}`;
```

**Comportamento**:
- **Sviluppo**: Il pulsante "Anteprima Live" aprirà `http://mia-azienda.localhost:3000`
- **Produzione**: Il pulsante aprirà `http://mia-azienda.operocloud.it`

---

## 2. opero-shop - Middleware Multi-Tenant ✅

**File**: `opero-shop/middleware.js`
**Stato**: **GIÀ CONFIGURATO** ✅

Il middleware gestisce correttamente il routing multi-tenant usando la variabile d'ambiente `NEXT_PUBLIC_ROOT_DOMAIN`:

```javascript
// Linee 25-26
const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost";
```

### Configurazione .env Richiesta

#### Sviluppo (Locale) - `.env`
```env
PORT=3002
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_ROOT_DOMAIN=localhost
```

#### Produzione - `.env.production`
```env
PORT=3000
NEXT_PUBLIC_API_URL=https://www.operocloud.it/api
NEXT_PUBLIC_ROOT_DOMAIN=operocloud.it
NEXT_PUBLIC_BASE_URL=https://www.operocloud.it
NODE_ENV=production
```

---

## 3. opero-shop - API Endpoint in Production

**File**: `opero-shop/app/_sites/[site]/[[...slug]]/page.js`
**Stato**: **GIÀ CONFIGURATO** ✅

Le pagine usano la variabile `NEXT_PUBLIC_API_URL`:

```javascript
// Linea 21
const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/public/shop/${siteSlug}/page/${pageSlug}`;
```

**Comportamento**:
- **Sviluppo**: `http://localhost:3001/api/public/shop/...`
- **Produzione**: `https://www.operocloud.it/api/public/shop/...`

---

## 4. opero-frontend - API Backend ✅

**File**: `opero-frontend/src/services/api.js`
**Stato**: **GIÀ CONFIGURATO** ✅

```javascript
// Linee 13-16
const DEV_URL = 'http://localhost:3001/api';
const PROD_URL = 'https://www.operocloud.it/api';
const API_URL = process.env.REACT_APP_API_BASE_URL || (isProduction() ? PROD_URL : DEV_URL);
```

---

## 5. Backend API - URL e Domini

### 5.1 URL Hardcoded da Verificare ⚠️

I seguenti file contengono riferimenti hardcoded a `operocloud.it` che sono **CORRETTI** per la produzione ma potrebbero需要 verifica:

#### CDN e S3 URLs
**File**: `routes/website.js`, `routes/public.js`, `routes/archivio.js`
```javascript
const CDN_BASE_URL = 'https://cdn.operocloud.it';
```
✅ **CORRETTO** - Questi sono URL pubblici CDN, validi in entrambi gli ambienti

#### SiteGenerator.js
**File**: `services/SiteGenerator.js`
```javascript
url: img.s3_key ? `https://s3.operocloud.it/${img.s3_key}` : null
```
✅ **CORRETTO** - Endpoint S3 pubblico

---

## 6. Configurazioni Nginx per Produzione 🚨

### Nginx Multi-Site Configuration

```nginx
# Siti aziendali multi-tenant
server {
    listen 80;
    server_name *.operocloud.it;

    location / {
        proxy_pass http://localhost:3000;  # Next.js opero-shop
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Dashboard CMS (opero-frontend)
server {
    listen 80;
    server_name app.operocloud.it;

    location / {
        proxy_pass http://localhost:3002;  # React Dashboard
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# API Backend
server {
    listen 80;
    server_name api.operocloud.it www.operocloud.it;

    location /api/ {
        proxy_pass http://localhost:3001;  # Express API
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 7. Checklist Deploy Produzione

### Prerequisiti
- [ ] Server Linux con Node.js 18+ installato
- [ ] Nginx configurato e running
- [ ] Database MySQL accessibile
- [ ] Bucket S3 configurato

### Passaggi

1. **Configura Variabili Ambiente**
   ```bash
   cd /path/to/opero
   cp .env.production .env
   # Modifica .env con le credenziali produzione
   ```

2. **Configura opero-shop**
   ```bash
   cd opero-shop
   cp .env.production.example .env.production
   # Modifica .env.production con:
   # NEXT_PUBLIC_ROOT_DOMAIN=operocloud.it
   # NEXT_PUBLIC_API_URL=https://www.operocloud.it/api
   ```

3. **Configura opero-frontend**
   ```bash
   cd opero-frontend
   cp .env.production .env
   # Modifica .env con:
   # REACT_APP_API_BASE_URL=https://www.operocloud.it/api
   ```

4. **Build Applicazioni**
   ```bash
   # Backend
   npm install
   # (no build necessario per Express)

   # opero-shop
   cd ../opero-shop
   npm install
   npm run build

   # opero-frontend
   cd ../opero-frontend
   npm install
   npm run build
   ```

5. **Configura PM2 per Process Management**
   ```bash
   pm2 start server.js --name "opero-api"
   pm2 start ../opero-shop/node_modules/.bin/next --name "opero-shop" -- start --prefix ../opero-shop
   pm2 start ../opero-frontend/build --name "opero-frontend" --serve --spa
   pm2 save
   ```

6. **Configura Nginx**
   - Copia la configurazione sopra in `/etc/nginx/sites-available/opero`
   - Crea symlink: `ln -s /etc/nginx/sites-available/opero /etc/nginx/sites-enabled/`
   - Test: `nginx -t`
   - Reload: `systemctl reload nginx`

7. **Test DNS**
   ```bash
   nslookup mia-azienda.operocloud.it
   # Deve puntare all'IP del server
   ```

8. **Test Funzionalità**
   - [ ] Dashboard: `https://app.operocloud.it`
   - [ ] API: `https://api.operocloud.it/api/health`
   - [ ] Sito aziendale: `https://mia-azienda.operocloud.it`
   - [ ] Anteprima Live dal CMS

---

## 8. Troubleshooting

### Problema: Anteprima Live punta a localhost in produzione
**Causa**: `SiteBuilderModule.js` non rileva correttamente l'ambiente
**Soluzione**: Verifica che `window.location.hostname` sia `app.operocloud.it` e non `localhost`

### Problema: Siti aziendali restituiscono 404
**Causa**: `NEXT_PUBLIC_ROOT_DOMAIN` non configurato correttamente
**Soluzione**:
```bash
# In opero-shop/.env.production
NEXT_PUBLIC_ROOT_DOMAIN=operocloud.it
```

### Problema: API calls falliscono in produzione
**Causa**: `NEXT_PUBLIC_API_URL` punta a localhost
**Soluzione**: Verifica che `.env.production` sia caricato correttamente

---

## 9. File Monitorati per hardcoded URLs

| File | Pattern | Stato |
|------|---------|-------|
| `opero-frontend/src/components/SiteBuilderModule.js` | `previewUrl` | ✅ Modificato |
| `opero-frontend/src/components/cms/SiteConfig.js` | `.operocloud.it` | ⚠️ Solo visualizzazione |
| `opero-frontend/src/components/cms/SEOPreview.js` | `operocloud.it` | ⚠️ Solo preview |
| `opero-shop/middleware.js` | `rootDomain` | ✅ Usa env var |
| `opero-shop/app/_sites/[site]/[[...slug]]/page.js` | `NEXT_PUBLIC_API_URL` | ✅ Usa env var |
| `routes/website.js` | `CDN_BASE_URL` | ✅ Costante pubblica corretta |

---

## 10. Variabili Ambiente - Riepilogo

### Backend (Express)
```env
NODE_ENV=production
PORT=3001
DB_HOST=localhost
CDN_BASE_URL=https://cdn.operocloud.it
S3_ENDPOINT=http://r3-it.storage.cloud.it
FRONTEND_URL=https://app.operocloud.it
```

### opero-shop (Next.js)
```env
PORT=3000
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://www.operocloud.it/api
NEXT_PUBLIC_ROOT_DOMAIN=operocloud.it
```

### opero-frontend (React)
```env
PORT=3002
NODE_ENV=production
REACT_APP_API_BASE_URL=https://www.operocloud.it/api
```

---

## Documentazione correlata
- `ARCHITETTURA_CORRETTA_MULTI-SITE.md` - Architettura completa
- `GUIDA_USO_MULTI-SITE.md` - Guida utente
- `PROGETTO_MULTI-SITE_WEBSITES.md` - Specifiche tecniche
