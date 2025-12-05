# Progetto Multi-Site Websites - Sistema Sottodomini Aziendali

## Panoramica del Progetto

Creazione di un sistema di siti web aziendali automatici su sottodomini personalizzati per ogni cliente Opero, con integrazione dati dal database esistente.

## Fattibilità Tecnica ✅

Il progetto è **completamente fattibile** con l'architettura attuale. Vantaggi chiave:
- **Database esistente**: Già strutturato per multi-tenancy (id_ditta)
- **Storage S3 disponibile**: Gestione immagini centralizzata
- **Sistema API mature**: Ready per integrazione esterna
- **Framework React**: Skill team già presenti (Next.js)

---

## Architettura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                    OPERO CLOUD INFRASTRUCTURE                   │
├─────────────────────────────────────────────────────────────────┤
│  www.nomeditta.operocloud.it (Next.js Multi-Site App)           │
│  ├── Dynamic Routing basato su sottodominio                       │
│  ├── Auto-detect company da database                             │
│  └── Template personalizzati                                    │
├─────────────────────────────────────────────────────────────────┤
│  app.operocloud.it (Dashboard Gestione Siti)                    │
│  ├── Modulo "Website Builder"                                   │
│  ├── Gestione contenuti                                         │
│  ├── Template customization                                      │
│  └── E-commerce catalogo                                        │
├─────────────────────────────────────────────────────────────────┤
│  API Backend (esistente + nuove rotte)                          │
│  ├── /api/website/* - Content Management                        │
│  ├── /api/ecommerce/* - Catalogo prodotti                      │
│  └── /api/storage/* - Media management                          │
├─────────────────────────────────────────────────────────────────┤
│  Storage Aruba S3                                                │
│  ├── company-websites/ (immagini siti web)                      │
│  ├── company-catalogs/ (immagini prodotti)                      │
│  └── templates/ (asset template)                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schema Estensione

### Nuove Tabelle Principali

#### 1. `siti_web_aziendali`
```sql
CREATE TABLE siti_web_aziendali (
  id INT PRIMARY KEY AUTO_INCREMENT,
  id_ditta INT NOT NULL,
  subdomain VARCHAR(100) UNIQUE NOT NULL,
  domain_status ENUM('active', 'inactive', 'pending') DEFAULT 'pending',
  template_id INT,
  site_title VARCHAR(255),
  site_description TEXT,
  logo_url VARCHAR(500),
  favicon_url VARCHAR(500),
  primary_color VARCHAR(7),
  secondary_color VARCHAR(7),
  font_family VARCHAR(100) DEFAULT 'Inter',
  google_analytics_id VARCHAR(50),
  facebook_url VARCHAR(500),
  instagram_url VARCHAR(500),
  linkedin_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_ditta) REFERENCES ditte(id),
  INDEX idx_subdomain (subdomain),
  INDEX idx_ditta (id_ditta)
);
```

#### 2. `template_siti_web`
```sql
CREATE TABLE template_siti_web (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome_template VARCHAR(100) NOT NULL,
  categoria ENUM('basic', 'premium', 'ecommerce') DEFAULT 'basic',
  description TEXT,
  preview_image VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  config_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. `pagine_sito_web`
```sql
CREATE TABLE pagine_sito_web (
  id INT PRIMARY KEY AUTO_INCREMENT,
  id_sito_web INT NOT NULL,
  slug VARCHAR(200) NOT NULL,
  titolo VARCHAR(255) NOT NULL,
  contenuto_html LONGTEXT,
  contenuto_json JSON, -- Per page builder
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords VARCHAR(500),
  is_published BOOLEAN DEFAULT FALSE,
  menu_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_sito_web) REFERENCES siti_web_aziendali(id),
  UNIQUE KEY unique_site_slug (id_sito_web, slug),
  INDEX idx_published (is_published)
);
```

#### 4. `articoli_blog`
```sql
CREATE TABLE articoli_blog (
  id INT PRIMARY KEY AUTO_INCREMENT,
  id_sito_web INT NOT NULL,
  titolo VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  contenuto LONGTEXT,
  immagine_url VARCHAR(500),
  meta_title VARCHAR(255),
  meta_description TEXT,
  categoria VARCHAR(100),
  tags VARCHAR(500),
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_sito_web) REFERENCES siti_web_aziendali(id),
  UNIQUE KEY unique_site_slug (id_sito_web, slug)
);
```

#### 5. `catalogo_prodotti` (E-commerce)
```sql
CREATE TABLE catalogo_prodotti (
  id INT PRIMARY KEY AUTO_INCREMENT,
  id_ditta INT NOT NULL,
  id_categoria INT,
  codice_prodotto VARCHAR(100) UNIQUE,
  nome_prodotto VARCHAR(255) NOT NULL,
  descrizione_breve TEXT,
  descrizione_dettagliata LONGTEXT,
  prezzo_vendita DECIMAL(10,2),
  prezzo_offerta DECIMAL(10,2),
  prezzo_listino DECIMAL(10,2),
  sku VARCHAR(100),
  quantita_disponibile INT DEFAULT 0,
  unita_misura VARCHAR(50) DEFAULT 'pz',
  immagini_urls JSON,
  specifiche JSON,
  meta_title VARCHAR(255),
  meta_description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_ditta) REFERENCES ditte(id)
);
```

#### 6. `categorie_prodotti`
```sql
CREATE TABLE categorie_prodotti (
  id INT PRIMARY KEY AUTO_INCREMENT,
  id_ditta INT NOT NULL,
  id_categoria_padre INT NULL,
  nome_categoria VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  descrizione TEXT,
  immagine_url VARCHAR(500),
  ordine_visualizzazione INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_ditta) REFERENCES ditte(id),
  FOREIGN KEY (id_categoria_padre) REFERENCES categorie_prodotti(id)
);
```

---

## Piano di Implementazione

### Fase 1: Infrastruttura Base (2-3 settimane)

#### 1.1 Setup Next.js Multi-Site
```bash
# Progetto Next.js principale
npx create-next-app@latest opero-websites
cd opero-websites

# Struttura directories
mkdir -p components/{templates,common,blocks}
mkdir -p pages/api/{website,ecommerce,storage}
mkdir -p lib/{database,storage,utils}
mkdir -p styles/{templates,global}
```

#### 1.2 Configurazione Multi-Tenant
```javascript
// lib/middleware.js (Next.js 13+)
import { NextResponse } from 'next/server';

export function middleware(request) {
  const hostname = request.headers.get('host');
  const subdomain = hostname.split('.')[0];

  // Salta operocloud.it principale
  if (hostname.includes('operocloud.it') && !subdomain) {
    return NextResponse.next();
  }

  // Header per routing dinamico
  const response = NextResponse.next();
  response.headers.set('x-subdomain', subdomain);
  response.headers.set('x-original-host', hostname);

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

#### 1.3 Database Connection
```javascript
// lib/database.js
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
```

### Fase 2: Template System (2 settimane)

#### 2.1 Struttura Template Component
```jsx
// components/templates/BaseTemplate.jsx
import { useState, useEffect } from 'react';
import Header from './blocks/Header';
import Footer from './blocks/Footer';
import DynamicPage from './DynamicPage';

export default function BaseTemplate({ siteData, pageData, children }) {
  const [siteConfig, setSiteConfig] = useState(siteData);

  // Apply CSS variables for dynamic theming
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', siteConfig.primary_color);
    root.style.setProperty('--secondary-color', siteConfig.secondary_color);
    root.style.setProperty('--font-family', siteConfig.font_family);
  }, [siteConfig]);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: siteConfig.font_family }}>
      <Header siteData={siteData} />
      <DynamicPage pageData={pageData} />
      <Footer siteData={siteData} />
    </div>
  );
}
```

#### 2.2 Page Builder Components
```jsx
// components/blocks/Hero.jsx
export default function Hero({ data }) {
  return (
    <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">{data.title}</h1>
          <p className="text-xl mb-8">{data.subtitle}</p>
          {data.cta_button && (
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              {data.cta_text}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
```

#### 2.3 Template Standard Pages
1. **Home Page**: Hero + Services + Testimonials + CTA
2. **Chi Siamo**: Company story + Team + Values
3. **Social Aggregator**: Feed social integrati
4. **Mappa**: Location + Contact form
5. **Blog**: Articles grid + Categories

### Fase 3: Storage Integration (1 settimana)

#### 3.1 Storage Service
```javascript
// lib/storage.js
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  endpoint: process.env.AWS_S3_ENDPOINT
});

class StorageService {
  static async uploadWebsiteImage(companyId, file, folder = 'general') {
    const key = `company-websites/${companyId}/${folder}/${Date.now()}-${file.name}`;

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    };

    await s3.upload(params).promise();
    return `${process.env.AWS_S3_PUBLIC_URL}/${key}`;
  }

  static async uploadProductImage(companyId, productId, file) {
    return this.uploadWebsiteImage(companyId, file, `products/${productId}`);
  }
}

module.exports = StorageService;
```

### Fase 4: API Development (2-3 settimane)

#### 4.1 Website Management API
```javascript
// pages/api/website/[subdomain]/pages.js
import { NextResponse } from 'next/server';
import { pool } from '@/lib/database';

export async function GET(request, { params }) {
  const { subdomain } = params;

  try {
    // Get site data
    const [siteRows] = await pool.execute(`
      SELECT sw.*, d.ragione_sociale, d.p_iva, d.indirizzo, d.citta, d.provincia, d.cap
      FROM siti_web_aziendali sw
      JOIN ditte d ON sw.id_ditta = d.id
      WHERE sw.subdomain = ? AND sw.domain_status = 'active'
    `, [subdomain]);

    if (siteRows.length === 0) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    const siteData = siteRows[0];

    // Get published pages
    const [pagesRows] = await pool.execute(`
      SELECT slug, titolo, meta_title, meta_description
      FROM pagine_sito_web
      WHERE id_sito_web = ? AND is_published = 1
      ORDER BY menu_order
    `, [siteData.id]);

    return NextResponse.json({
      site: siteData,
      pages: pagesRows
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

#### 4.2 E-commerce API
```javascript
// pages/api/website/[subdomain]/catalog.js
export async function GET(request, { params }) {
  const { subdomain } = params;
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const featured = searchParams.get('featured');

  try {
    let query = `
      SELECT p.*, c.nome_categoria, c.slug as categoria_slug
      FROM catalogo_prodotti p
      LEFT JOIN categorie_prodotti c ON p.id_categoria = c.id
      JOIN siti_web_aziendali sw ON p.id_ditta = sw.id_ditta
      WHERE sw.subdomain = ? AND p.is_active = 1
    `;

    const queryParams = [subdomain];

    if (category) {
      query += ' AND c.slug = ?';
      queryParams.push(category);
    }

    if (featured === 'true') {
      query += ' AND p.is_featured = 1';
    }

    query += ' ORDER BY p.nome_prodotto';

    const [products] = await pool.execute(query, queryParams);

    return NextResponse.json({ products });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### Fase 5: Gestione Backoffice (2 settimane)

#### 5.1 Website Builder Component
```jsx
// opero-frontend/src/components/WebsiteBuilder.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function WebsiteBuilder() {
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const [activeTab, setActiveTab] = useState('content');

  // Load user websites
  useEffect(() => {
    loadWebsites();
  }, []);

  const loadWebsites = async () => {
    try {
      const response = await api.get('/website/my-sites');
      setSites(response.data.sites);
    } catch (error) {
      console.error('Error loading sites:', error);
    }
  };

  const createNewSite = async () => {
    try {
      const response = await api.post('/website/create', {
        subdomain: `company${Date.now()}`,
        template_id: 1,
        site_title: 'Nuovo Sito Web'
      });

      setSites([...sites, response.data.site]);
      setSelectedSite(response.data.site);
    } catch (error) {
      console.error('Error creating site:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Website Builder</h1>

        {/* Site Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">I Tuoi Siti Web</h2>
            <button
              onClick={createNewSite}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Nuovo Sito
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sites.map(site => (
              <div
                key={site.id}
                onClick={() => setSelectedSite(site)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedSite?.id === site.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-semibold">{site.site_title}</h3>
                <p className="text-sm text-gray-600">{site.subdomain}.operocloud.it</p>
                <p className="text-xs text-gray-500 mt-2">
                  Status: <span className={`font-medium ${
                    site.domain_status === 'active' ? 'text-green-600' : 'text-yellow-600'
                  }`}>{site.domain_status}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Site Editor */}
        {selectedSite && (
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {['content', 'design', 'catalog', 'settings'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'content' && <ContentEditor site={selectedSite} />}
              {activeTab === 'design' && <DesignEditor site={selectedSite} />}
              {activeTab === 'catalog' && <CatalogManager site={selectedSite} />}
              {activeTab === 'settings' && <SiteSettings site={selectedSite} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Configurazione DNS e Deployment

### 1. Configurazione Wildcard DNS
```bash
# CNAME record su operocloud.it
*.operocloud.it. CNAME servers.operocloud.it.
```

### 2. Nginx Configuration
```nginx
# /etc/nginx/sites-available/opero-multi-site
server {
    listen 80;
    server_name .operocloud.it;

    # Route to Next.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Pass subdomain to app
        proxy_set_header X-Subdomain $host;
    }

    # Static files caching
    location /_next/static/ {
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV NODE_ENV=production
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  websites:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
      - DB_USER=opero
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_NAME=opero_db
    depends_on:
      - mysql
    restart: unless-stopped
```

---

## Timeline di Implementazione

### **Mese 1: Foundation**
- Set up Next.js multi-site
- Database schema implementation
- Basic template system
- Storage integration

### **Mese 2: Templates & API**
- 5 template pages completion
- Full API development
- Page builder basic functionality
- Social aggregator integration

### **Mese 3: E-commerce & Backoffice**
- Product catalog system
- Website builder interface in Opero
- Template customization tools
- Testing & optimization

### **Mese 4: Launch & Optimization**
- Beta testing con clienti selezionati
- Performance optimization
- SEO tools implementation
- Documentation & training

---

## Costi e Risorse

### Sviluppo
- **Team**: 1 Senior Full Stack + 1 Frontend + 1 UI/UX
- **Timeline**: 3-4 mesi
- **Costo sviluppo**: €25.000-35.000

### Infrastruttura
- **Hosting**: già disponibile
- **Storage extra**: €50/mese (500GB)
- **CDN**: €20/mese (Cloudflare)
- **Costo totale**: ~€100/mese

### Ricavi Potenziali
- **Basic Plan**: €29/mese (website + blog)
- **Premium Plan**: €79/mese (+ e-commerce catalog)
- **E-commerce Plan**: €149/mese (+ full ecommerce)
- **Break-even**: 50 clienti basic plan

---

## Vantaggi Competitivi

1. **Integrazione Dati**: Siti auto-alimentati da database Opero
2. **Multi-tenancy nativo**: Architettura già pronta
3. **Template Professional**: Design moderno e responsive
4. **SEO Optimized**: Struttura pensata per motori di ricerca
5. **E-commerce Ready**: Evoluzione naturale a vetrina prodotti
6. **Gestione Centralizzata**: Dashboard Opero integrata

---

## Prossimi Passi

1. **Validazione**: Survey clienti per conferma interesse
2. **MVP Development**: Iniziare con template base
3. **Beta Program**: Test con 10 clienti selezionati
4. **Marketing**: Preparazione campagne lancio
5. **Scale**: Espansione feature e template

Il progetto è fattibile e potrebbe rappresentare una significativa nuova revenue stream per Opero, sfruttando l'infrastruttura e le competenze già esistenti.