# Integrazione Sistema Multi-Site con Architettura Opero Esistente

## Analisi Convivenza con Architettura Attuale

Il progetto multi-site si **integra perfettamente** con l'architettura Opero esistente, sfruttando tutti gli asset attuali senza compromettere le funzionalità esistenti.

---

## 🏗️ Architettura Fisica Attuale vs Futura

### **Situazione Attuale (Opero Core)**

```
┌─────────────────────────────────────────────────────────────────┐
│                        SERVER OPERO                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  BACKEND NODE.js (Port 3002)                            │    │
│  │  ├── Express Server                                      │    │
│  │  ├── API Routes (/api/*)                               │    │
│  │  ├── Database Connection (MySQL)                        │    │
│  │  ├── S3 Storage Integration                            │    │
│  │  └── Authentication (JWT)                               │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  FRONTEND REACT (Port 3001)                             │    │
│  │  ├── MailModule                                        │    │
│  │  ├── ArchivioPostaModule                               │    │
│  │  ├── CRM Components                                     │    │
│  │  └── Dashboard Opero                                   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  DATABASE MySQL                                          │    │
│  │  ├── ditte                                             │    │
│  │  ├── utenti                                            │    │
│  │  ├── ditta_mail_accounts                              │    │
│  │  ├── email_inviate                                     │    │
│  │  ├── allegati_tracciati                               │    │
│  │  └── dm_* (document management)                        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  STORAGE ARUBA S3                                       │    │
│  │  ├── uploads/ (allegati email)                         │    │
│  │  ├── dm-files/ (document management)                   │    │
│  │  └── backup/                                           │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### **Architettura Integrata (Opero + Multi-Site)**

```
┌─────────────────────────────────────────────────────────────────┐
│                    OPERO CLOUD INFRASTRUCTURE                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────────────────────────┐    │
│  │  OPERO CORE     │    │      WEBSITES MODULE              │    │
│  │  (Esistente)    │    │        (Nuovo)                      │    │
│  │                 │    │                                     │    │
│  │ • Port 3002     │    │ • Port 3000                        │    │
│  │ • Backend APIs  │    │ • Next.js App                      │    │
│  │ • Admin Panel   │    │ • Public Websites                 │    │
│  │ • Email Module  │    │ • Multi-tenant Routing             │    │
│  └─────────────────┘    └─────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    SHARED INFRASTRUCTURE                     │    │
│  │                                                                 │    │
│  │  ┌─────────────────────────────────────────────────────┐     │    │
│  │  │  MySQL Database (Esteso)                           │     │    │
│  │  │  ├── Tabelle Esistenti                              │     │    │
│  │  │  │   ├── ditte                                       │     │    │
│  │  │  │   ├── utenti                                      │     │    │
│  │  │  │   ├── ditta_mail_accounts                        │     │    │
│  │  │  │   └── dm_* (document system)                     │     │    │
│  │  │  └── Tabelle Nuove (Website System)                 │     │    │
│  │  │      ├── siti_web_aziendali                         │     │    │
│  │  │      ├── pagine_sito_web                            │     │    │
│  │  │      ├── articoli_blog                              │     │    │
│  │  │      └── catalogo_prodotti                          │     │    │
│  │  └─────────────────────────────────────────────────────┘     │    │
│  │                                                                 │    │
│  │  ┌─────────────────────────────────────────────────────┐     │    │
│  │  │  Aruba S3 Storage (Esteso)                         │     │    │
│  │  │  ├── uploads/ (allegati email)                     │     │    │
│  │  │  ├── dm-files/ (documenti opero)                  │     │    │
│  │  │  ├── company-websites/ (immagini siti)             │     │    │
│  │  │  └── company-catalogs/ (immagini prodotti)         │     │    │
│  │  └─────────────────────────────────────────────────────┐     │    │
│  │                                                                 │    │
│  │  ┌─────────────────────────────────────────────────────┐     │    │
│  │  │  Autenticazione e Security                         │     │    │
│  │  │  ├── JWT Tokens (condiviso)                         │     │    │
│  │  │  ├── Ruoli Utenti (esteso)                         │     │    │
│  │  │  └── API Keys (per websites)                       │     │    │
│  │  └─────────────────────────────────────────────────────┐     │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                      EXTERNAL ACCESS                          │    │
│  │                                                                 │    │
│  │  app.operocloud.it → React Dashboard (Clienti)                │    │
│  │  ├── Modulo "Website Builder" (nuovo)                         │    │
│  │  ├── Gestione contenuti siti                                 │    │
│  │  ├── Catalogo prodotti                                       │    │
│  │  └── Analytics e statistiche                                  │    │
│  │                                                                 │    │
│  │  *.operocloud.it → Next.js Multi-Site (Pubblico)              │    │
│  │  ├── nomeditta.operocloud.it → Sito aziendale                 │    │
│  │  ├── Auto-routing basato su subdomain                        │    │
│  │  └── Dati real-time da database Opero                         │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔗 Punti di Integrazione

### **1. Database Condiviso**

#### **Sfruttamento Tabelle Esistenti:**
```sql
-- Tabella ditte (esistente)
-- Si aggiungono solo campi website-specific
ALTER TABLE ditte ADD COLUMN website_id INT NULL;
ALTER TABLE ditte ADD COLUMN website_enabled BOOLEAN DEFAULT FALSE;

-- Tutte le query website useranno id_ditta esistente
SELECT * FROM siti_web_aziendali sw
JOIN ditte d ON sw.id_ditta = d.id
WHERE d.id = ?;
```

#### **Migrazione Dati Esistenti:**
```sql
-- Popolazione automatica siti web da ditte esistenti
INSERT INTO siti_web_aziendali (id_ditta, subdomain, site_title, domain_status)
SELECT
  id,
  LOWER(REPLACE(REPLACE(ragione_sociale, ' ', ''), '.', '')),
  ragione_sociale,
  'pending'
FROM ditte
WHERE id NOT IN (SELECT id_ditta FROM siti_web_aziendali);
```

### **2. API Integration Layer**

#### **Nuove Routes in Backend Esistente:**
```javascript
// routes/website.js (nuovo file)
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/auth');

// Middleware che sfrutta autenticazione esistente
router.use(verifyToken);

// API che integrano con database esistente
router.get('/my-sites', async (req, res) => {
  const { id_ditta, id } = req.user;

  // Usa connessione database esistente
  const [sites] = await dbPool.execute(`
    SELECT sw.*, d.ragione_sociale, d.p_iva, d.logo_url
    FROM siti_web_aziendali sw
    JOIN ditte d ON sw.id_ditta = d.id
    WHERE sw.id_ditta = ?
  `, [id_ditta]);

  res.json({ success: true, sites });
});

// Integrazione con sistema documentale esistente
router.post('/upload-image', upload.single('file'), async (req, res) => {
  const { id_ditta } = req.user;

  // Usa servizio storage esistente
  const s3Key = `company-websites/${id_ditta}/${Date.now()}-${req.file.originalname}`;
  const uploadResult = await s3Service.uploadFile(req.file.buffer, s3Key);

  res.json({ success: true, url: uploadResult.url });
});

module.exports = router;
```

### **3. Autenticazione Condivisa**

#### **JWT Token Estensione:**
```javascript
// utils/auth.js (estensione file esistente)
const generateToken = (user, expiresIn = '24h') => {
  // Dati esistenti
  const payload = {
    id: user.id,
    id_ditta: user.id_ditta,
    email: user.email,
    livello: user.livello,

    // Nuovi campi per website
    website_permissions: {
      can_create_site: user.livello >= 50,
      can_manage_templates: user.livello >= 90,
      max_sites: user.livello >= 90 ? -1 : 1
    }
  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};
```

### **4. Storage Integration**

#### **Estensione Servizio S3 Esistente:**
```javascript
// services/s3Service.js (estensione file esistente)

class S3Service {
  // Metodi esistenti mantengono stessa logica
  static async uploadFile(buffer, key, metadata = {}) { /* esistente */ }

  // Nuovi metodi per website images
  static async uploadWebsiteImage(companyId, file, type = 'general') {
    const folderMap = {
      'logo': 'logos',
      'banner': 'banners',
      'product': 'products',
      'blog': 'blog-images',
      'general': 'general'
    };

    const key = `company-websites/${companyId}/${folderMap[type]}/${Date.now()}-${file.originalname}`;

    // Usa metodo esistente con ACL pubblico per siti
    return await this.uploadFile(file.buffer, key, {
      contentType: file.mimetype,
      ACL: 'public-read' // Immagini siti web sono pubbliche
    });
  }

  // Metodo per generare URL firmati (per file privati esistenti)
  static async getSignedUrl(key, expiresIn = 3600) { /* esistente */ }
}
```

---

## 🗂️ Organizzazione Fisica Progetto

### **Repository Structure:**

```
C:\Users\Utente\Documents\app\opero\
├── 📁 backend/                           # Sistema Opero esistente
│   ├── routes/
│   │   ├── mail.js                      # Esistente
│   │   ├── archivio-posta.js            # Esistente
│   │   └── website.js                   # NUOVO - API gestione siti
│   ├── services/
│   │   ├── s3Service.js                 # Esistente (da estendere)
│   │   ├── emailTrackingService.js     # Esistente
│   │   └── websiteService.js            # NUOVO - Logica siti web
│   ├── utils/
│   │   ├── auth.js                      # Esistente (da estendere)
│   │   └── websiteUtils.js              # NUOVO - Helper siti
│   └── server.js                        # Esistente (aggiungere nuove routes)
│
├── 📁 frontend/                         # Opero Dashboard esistente
│   ├── src/
│   │   ├── components/
│   │   │   ├── MailModule.js            # Esistente
│   │   │   ├── ArchivioPostaModule.js   # Esistente
│   │   │   └── WebsiteBuilder.js        # NUOVO - Builder siti
│   │   ├── pages/
│   │   │   ├── Dashboard.js             # Esistente
│   │   │   └── WebsiteManager.js        # NUOVO - Gestione siti
│   │   └── services/
│   │       ├── api.js                   # Esistente
│   │       └── websiteApi.js            # NUOVO - API siti web
│
├── 📁 websites/                          # NUOVO - Progetto Next.js multi-site
│   ├── package.json                     # Nuovo progetto
│   ├── next.config.js                   # Configurazione Next.js
│   ├── pages/
│   │   ├── api/                         # API per template
│   │   │   └── website/[[...subdomain]]/
│   │   └── [slug]/                      # Pagine dinamiche siti
│   ├── components/
│   │   ├── templates/                   # Template siti web
│   │   │   ├── BasicTemplate.jsx
│   │   │   ├── PremiumTemplate.jsx
│   │   │   └── EcommerceTemplate.jsx
│   │   └── blocks/                      # Blocchi pagina
│   │       ├── Hero.jsx
│   │       ├── Services.jsx
│   │       └── Contact.jsx
│   └── lib/
│       ├── database.js                  # Connessione DB condivisa
│       ├── storage.js                   # Storage service condiviso
│       └── middleware.js                # Routing sottodomini
│
├── 📁 migrations/                       # Database migrations
│   ├── 2025010101_create_website_tables.sql    # NUOVO
│   ├── 2025010102_add_website_permissions.sql  # NUOVO
│   └── 2025010103_migrate_existing_data.sql   # NUOVO
│
├── 📁 docker/                           # Container configuration
│   ├── docker-compose.yml               # Esteso per 3 servizi
│   │   ├── backend (opero-core)         # Esistente
│   │   ├── frontend (opero-dashboard)   # Esistente
│   │   └── websites (multi-site)        # NUOVO
│   └── nginx/
│       ├── opero.conf                   # Esistente
│       └── websites.conf                # NUOVO - Multi-domain
│
└── 📄 documentazione/                    # Documentazione progetto
    ├── API_WEBSITES.md                  # NUOVO
    └── GUIDE_WEBSITE_BUILDER.md         # NUOVO
```

---

## 🚀 Deployment e Infrastruttura

### **Server Architecture (Physical):**

```
┌─────────────────────────────────────────────────────────────────┐
│                      SERVER DEDICATO                            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  SERVER CORE (Hardware: 8CPU, 16GB RAM, 500GB SSD)       │    │
│  │                                                             │    │
│  │  ├── 🐳 Docker Container 1: opero-backend              │    │
│  │  │     • Node.js + Express                             │    │
│  │  │     • Port: 3002                                    │    │
│  │  │     • Database + Storage APIs                      │    │
│  │  │     • RAM: 2GB                                       │    │
│  │  │     │                                                 │    │
│  │  ├── 🐳 Docker Container 2: opero-frontend             │    │
│  │  │     • React Dashboard                               │    │
│  │  │     • Port: 3001                                    │    │
│  │  │     • Client-facing application                     │    │
│  │  │     • RAM: 1GB                                       │    │
│  │  │     │                                                 │    │
│  │  ├── 🐳 Docker Container 3: opero-websites             │    │
│  │  │     • Next.js Multi-Site                            │    │
│  │  │     • Port: 3000                                    │    │
│  │  │     • Public websites                               │    │
│  │  │     • RAM: 3GB                                       │    │
│  │  │     │                                                 │    │
│  │  ├── 🐳 Docker Container 4: mysql-database             │    │
│  │  │     • MySQL 8.0                                      │    │
│  │  │     • Port: 3306                                    │    │
│  │  │     • Shared database                               │    │
│  │  │     • RAM: 4GB                                       │    │
│  │  │     │                                                 │    │
│  │  ├── 🐳 Docker Container 5: nginx-reverse-proxy        │    │
│  │  │     • Load Balancer                                  │    │
│  │  │     • SSL Termination                               │    │
│  │  │     • Static File Serving                           │    │
│  │  │     • RAM: 512MB                                     │    │
│  │  │     │                                                 │    │
│  │  └── 📁 Shared Volume: /app/storage                    │    │
│  │      • Uploads temporanei                              │    │
│  │      • Logs applicativi                               │    │
│  │      • Cache files                                    │    │
│  │      │                                                 │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  EXTERNAL INFRASTRUCTURE                                │    │
│  │                                                             │    │
│  │  ├── ☁️  Aruba S3 Storage                                │    │
│  │  │     • Backup database                                 │    │
│  │  │     • File storage permanente                         │    │
│  │  │     • CDN per immagini                               │    │
│  │  │     │                                                 │    │
│  │  ├── 📧  Email Services                                  │    │
│  │  │     • SMTP/IMAP providers                           │    │
│  │  │     • Email tracking                                 │    │
│  │  │     │                                                 │    │
│  │  └── 🔒  SSL Certificate                                 │    │
│  │      • Wildcard *.operocloud.it                         │    │
│  │      • Auto-renewal                                     │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Workflow Sviluppo Integrato

### **Git Branch Strategy:**

```
main (produzione)
├── develop (sviluppo)
│   ├── feature/website-builder
│   ├── feature/ecommerce-catalog
│   ├── feature/website-templates
│   └── hotfix/security-updates
└── release/v2.0 (nuovo modulo websites)
```

### **Development Workflow:**

#### **1. Setup Ambiente Locale:**
```bash
# Clone repository esistente
git clone <opero-repo>
cd opero

# Setup submodule per websites
git submodule add <websites-repo> websites
git submodule update --init --recursive

# Avvio sviluppo
docker-compose -f docker-compose.dev.yml up
```

#### **2. Docker Compose Development:**
```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  backend:
    build: ./backend
    ports: ["3002:3002"]
    environment:
      - NODE_ENV=development
      - DB_HOST=mysql
    volumes: ["./backend:/app"]
    depends_on: [mysql]

  frontend:
    build: ./frontend
    ports: ["3001:3001"]
    environment:
      - REACT_APP_API_URL=http://localhost:3002
    volumes: ["./frontend/src:/app/src"]

  websites:
    build: ./websites
    ports: ["3000:3000"]
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_API_URL=http://localhost:3002
    volumes: ["./websites:/app"]

  mysql:
    image: mysql:8.0
    ports: ["3306:3306"]
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: opero_dev
    volumes: ["mysql_data:/var/lib/mysql"]

  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes: ["./nginx/dev.conf:/etc/nginx/nginx.conf"]
    depends_on: [backend, frontend, websites]
```

---

## 📊 Performance e Scalabilità

### **Resource Allocation:**

#### **Phase 1: Launch (0-100 siti)**
- **CPU**: 2 core (25% utilization)
- **RAM**: 6GB (37% utilization)
- **Storage**: 50GB S3 (immagini siti)
- **Bandwidth**: 100GB/mese

#### **Phase 2: Growth (100-500 siti)**
- **CPU**: 4 core (50% utilization)
- **RAM**: 8GB (50% utilization)
- **Storage**: 200GB S3
- **Bandwidth**: 500GB/mese

#### **Phase 3: Scale (500+ siti)**
- **CPU**: 8 core (75% utilization)
- **RAM**: 12GB (75% utilization)
- **Storage**: 500GB S3 + CDN
- **Bandwidth**: 2TB/mese

### **Caching Strategy:**

```
🏷️ Multi-Layer Caching:
├── Browser Cache (1-7 giorni)
│   ├── Static assets (CSS, JS, images)
│   └── Page templates
├── CDN Cache (Cloudflare)
│   ├── Immagini website
│   └── Static content
├── Application Cache (Redis)
│   ├── Database queries
│   ├── API responses
│   └── Session data
└── Database Cache
    ├── Query results
    └── Index optimization
```

---

## 💰 Cost-Benefit Analysis

### **Investimento Iniziale:**
- **Sviluppo**: €25.000-35.000
- **Infrastructure upgrade**: €2.000 (one-time)
- **SSL Certificate**: €150/anno
- **Developer training**: €5.000

### **Costi Operativi Mensili:**
- **Server upgrade**: +€100/mese
- **S3 Storage extra**: +€50/mese (primo anno)
- **CDN**: +€20/mese
- **Monitoring**: +€30/mese
- **Totale**: ~€200/mese aggiuntivi

### **ROI Proiezione:**
```
Anno 1: 50 clienti × €29/mese = €17.400 revenue
Costi: €2.400 (infrastruttura) + €30.000 (sviluppo) = €32.400
Break-even: Mese 22

Anno 2: 150 clienti × €49/mese = €88.200 revenue
Costi: €2.400 (infrastruttura) + €6.000 (manutenzione) = €8.400
Profit: €79.800

Anno 3: 300 clienti × €69/mese = €248.400 revenue
Costi: €3.600 (infrastruttura) + €12.000 (sviluppo) = €15.600
Profit: €232.800
```

---

## ✅ Vantaggi dell'Approccio Integrato

### **1. Zero Disruption Opero Core**
- Sistema esistente rimane invariato
- Aggiunte solo nuove funzionalità
- Database condiviso ma isolato logicamente

### **2. Sfruttamento Asset Esistenti**
- Utenti e ditte già configurati
- Storage S3 già attivo
- Team con competenze React/Node.js
- Processi di deployment già stabiliti

### **3. Economie di Scala**
- Server condiviso tra tutti i servizi
- Database single instance
- Team di sviluppo consolidato
- Processi di supporto unificati

### **4. Customer Experience Ottimale**
- Single Sign-On tra Opero e sito web
- Dati sincronizzati in real-time
- Dashboard unificata per gestione
- Supporto tecnico integrato

---

## 🎯 Prossimi Passi Implementazione

### **Sprint 1 (2 settimane) - Foundation**
1. Estensione database con tabelle website
2. Setup progetto Next.js basic
3. Integrazione autenticazione condivisa
4. Template home page base

### **Sprint 2 (2 settimane) - Templates**
1. 5 template pages complete
2. Page builder components
3. Storage integration per immagini
4. Testing template system

### **Sprint 3 (2 settimane) - Integration**
1. API backend complete
2. Dashboard builder in Opero
3. Dynamic subdomain routing
4. SEO optimization base

### **Sprint 4 (2 settimane) - Launch**
1. Beta testing con 10 clienti
2. Performance optimization
3. Documentation completa
4. Go-live ufficiale

Questo approccio garantisce un'integrazione perfetta con l'architettura esistente, sfruttando tutti gli investimenti già fatti e posizionando Opero per una significativa espansione del modello di business.