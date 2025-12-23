# Documentazione Tecnica Completa - Sistema Opero

## Indice
1. [Overview dell'Architettura](#1-overview-dellarchitettura)
2. [Backend Node.js](#2-backend-nodejs-opero)
3. [Frontend React (opero-frontend)](#3-frontend-react-opero-frontend)
4. [E-commerce Next.js (opero-shop)](#4-ecommerce-nextjs-opero-shop)
5. [Database MySQL](#5-database-mysql)
6. [Interazione tra i Sistemi](#6-interazione-tra-i-sistemi)
7. [Architettura Multi-Tenant](#7-architettura-multi-tenant)
8. [Sicurezza e Autenticazione](#8-sicurezza-e-autenticazione)
9. [Servizi Esterni e Integrazioni](#9-servizi-esterni-e-integrazioni)

---

## 1. Overview dell'Architettura

Il sistema **Opero** è una piattaforma ERP multi-modulo completa che combina tre applicazioni frontend con un backend centralizzato e un database MySQL condiviso.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ARCHITETTURA GENERALE OPERO                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐      │
│  │  React SPA       │    │  Next.js Shop    │    │  React Gestionale│      │
│  │  (opero-frontend)│    │  (opero-shop)    │    │  (opero-gest)    │      │
│  │  Porta: 3000     │    │  Porta: 3002     │    │  (in sviluppo)   │      │
│  └────────┬─────────┘    └────────┬─────────┘    └────────┬─────────┘      │
│           │                       │                       │                  │
│           │    API REST/HTTP      │                       │                  │
│           └───────────────────────┼───────────────────────┘                  │
│                                   ▼                                          │
│                    ┌──────────────────────────┐                               │
│                    │   Express.js Backend     │                               │
│                    │   (opero - server.js)    │                               │
│                    │   Porta: 3001            │                               │
│                    └─────────────┬────────────┘                               │
│                                  │                                           │
│                    ┌─────────────▼────────────┐                               │
│                    │   MySQL Database         │                               │
│                    │   (operodb)              │                               │
│                    └──────────────────────────┘                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Componenti Principali

| Componente | Tecnologia | Porta | Descrizione |
|------------|-----------|-------|-------------|
| **Backend** | Node.js + Express.js | 3001 | API REST centralizzata, business logic |
| **Frontend** | React 18 + Capacitor | 3000 | Applicazione gestionale aziendale |
| **Shop** | Next.js 16 + React 19 | 3002 | E-commerce multi-tenant |
| **Database** | MySQL 8.0 | 3306 | Database relazionale centralizzato |

---

## 2. Backend Node.js (opero)

### 2.1 Stack Tecnologico

Il backend è costruito su **Node.js** con framework **Express.js** e utilizza:

```json
{
  "dependencies": {
    "express": "^4.21.2",
    "mysql2": "^3.14.4",
    "knex": "^3.1.0",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1",
    "multer": "^1.4.5-lts.1",
    "@aws-sdk/client-s3": "^3.933.0",
    "nodemailer": "^6.10.1",
    "puppeteer": "^24.22.3"
  }
}
```

### 2.2 Struttura del Progetto

```
opero/
├── server.js                    # Entry point principale (righe 1-192)
├── package.json                 # Dipendenze backend
├── knexfile.js                  # Configurazione Knex migrations
├── .env                         # Variabili ambiente
├── config/
│   └── db.js                    # Configurazione database
├── routes/                      # 36 file rotte API
│   ├── auth.js                  # Autenticazione
│   ├── admin.js                 # Amministrazione
│   ├── catalogo.js              # Catalogo prodotti
│   ├── magazzino.js             # Magazzino
│   ├── vendite.js               # Vendite
│   ├── website.js               # Website builder
│   ├── admin_cms.js             # CMS avanzato
│   └── ... (30+ rotte)
├── services/                    # 10 business logic
│   ├── s3Service.js             # Storage S3 Aruba
│   ├── SiteGenerator.js         # Generazione siti
│   ├── AISiteGenerator.js       # Generazione AI siti
│   └── VPSDeployer.js           # Deploy VPS
├── utils/                       # Utility functions
│   ├── auth.js                  # JWT middleware
│   ├── mailer.js               # Email service
│   └── s3Client.js             # S3 client
├── migrations/                  # 130+ migrations
├── uploads/                     # File upload locali
├── opero-frontend/              # Frontend React
├── opero-shop/                  # E-commerce Next.js
└── opero-gestionale/            # Gestionale (WIP)
```

### 2.3 Configurazione del Server

Il file `server.js` configura Express con:

**Middleware (righe 56-62)**:
- JSON body parser con limite 50MB
- URL encoding esteso
- Header size configurabile

**CORS Dinamico (righe 65-106)**:
```javascript
if (process.env.NODE_ENV === 'production') {
  app.use(cors(); // Tutto permesso in produzione
} else {
  const allowedOrigins = [
    'http://localhost:3000',  // React frontend
    'http://localhost:3001',  // Backend stesso
    'http://localhost:3002',  // Next.js shop
    'http://192.168.1.80:3000',
    // ... altri origini sviluppo
  ];
  app.use(cors(corsOptions));
}
```

**Rotte Principali (righe 115-158)**:

```javascript
// Rotte pubbliche (senza autenticazione)
app.use('/api/public', publicRoutes);      // Dati pubblici shop
app.use('/api/auth', authRoutes);          // Login/logout
app.use('/api/track', trackRoutes);        // Tracking email

// Rotte protette (con verifyToken)
app.use('/api/admin', verifyToken, adminRoutes);
app.use('/api/user', verifyToken, userRoutes);
app.use('/api/catalogo', verifyToken, catalogoRoutes);
app.use('/api/magazzino', magazzinoRoutes);
app.use('/api/vendite', venditeRoutes);
app.use('/api/anagrafica', verifyToken, anagraficaRoutes);
app.use('/api/mail', verifyToken, mailRoutes);
app.use('/api/archivio', verifyToken, archivioRoutes);

// Website Builder & CMS
app.use('/api/website', websiteRoutes);
app.use('/api/website-generator', verifyToken, websiteGeneratorRoutes);
app.use('/api/admin/cms', verifyToken, adminCmsRoutes);
app.use('/api/admin/blog', verifyToken, adminBlogRoutes);
app.use('/api/ai-enhanced-website', verifyToken, aiEnhancedWebsiteRoutes);
```

**Avvio Server (righe 172-190)**:
- **Sviluppo**: Porta 3001 (TCP)
- **Produzione**: Unix socket (`opero.sock`)

### 2.4 Rotte API Disponibili

Il backend espone oltre **50 endpoint** organizzati in moduli:

#### Autenticazione e Utenti
- `POST /api/auth/login` - Login con email/password
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token
- `GET /api/admin/utenti` - Lista utenti
- `POST /api/admin/utenti` - Crea utente
- `PUT /api/admin/utenti/:id` - Modifica utente
- `DELETE /api/admin/utenti/:id` - Elimina utente

#### Gestione Aziendale
- `GET /api/anagrafica` - Clienti/fornitori
- `GET /api/catalogo` - Prodotti
- `POST /api/catalogo` - Crea prodotto
- `GET /api/magazzino` - Giacenze
- `POST /api/vendite` - Nuova vendita
- `GET /api/acquisti` - Ordini fornitori

#### Website Builder
- `GET /api/website` - Lista siti
- `POST /api/website` - Crea sito
- `PUT /api/website/:id` - Modifica sito
- `DELETE /api/website/:id` - Elimina sito
- `POST /api/website-generator/generate` - Genera sito
- `POST /api/ai-enhanced-website/generate` - Genera con AI

#### CMS & Blog
- `GET /api/admin/cms/pages` - Pagine CMS
- `POST /api/admin/cms/pages` - Crea pagina
- `PUT /api/admin/cms/pages/:id` - Modifica pagina
- `GET /api/admin/blog/posts` - Articoli blog
- `POST /api/admin/blog/posts` - Crea articolo

#### API Pubbliche (Shop)
- `GET /api/public/shop/:siteSlug/page/:pageSlug` - Pagina sito
- `GET /api/public/shop/:siteSlug/catalog` - Catalogo prodotti
- `GET /api/public/shop/:siteSlug/blog/posts` - Blog articoli

### 2.5 Middleware di Autenticazione

Il file `utils/auth.js` implementa:

**verifyToken** - Verifica JWT token:
```javascript
function verifyToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ error: 'Token non fornito' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token non valido' });
    }
    req.user = decoded;
    next();
  });
}
```

**isDittaAdmin** - Verifica permessi admin azienda:
```javascript
function isDittaAdmin(req, res, next) {
  if (req.user.ruolo !== 'admin_ditta' && req.user.ruolo !== 'superadmin') {
    return res.status(403).json({ error: 'Permessi insufficienti' });
  }
  next();
}
```

---

## 3. Frontend React (opero-frontend)

### 3.1 Stack Tecnologico

```json
{
  "name": "opero-frontend",
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^7.9.6",
    "axios": "^1.13.2",
    "@capacitor/core": "^7.4.4",
    "@ag-grid-community/react": "^34.1.1",
    "react-quill": "^2.0.0",
    "jspdf": "^3.0.3",
    "papaparse": "^5.5.3"
  }
}
```

### 3.2 Struttura del Progetto

```
opero-frontend/
├── package.json                 # Proxy configurato: http://localhost:3001
├── capacitor.config.ts          # Config Capacitor per mobile
├── public/                      # Asset statici
├── src/
│   ├── index.js                 # Entry point React
│   ├── App.js                   # Componente principale
│   ├── components/              # Componenti riutilizzabili
│   ├── pages/                   # Pagine dell'applicazione
│   │   ├── Dashboard.js
│   │   ├── Catalogo.js
│   │   ├── Magazzino.js
│   │   ├── Vendite.js
│   │   ├── WebsiteBuilder.js
│   │   └── ...
│   ├── services/                # API calls
│   │   ├── api.js               # Axios configuration
│   │   ├── authService.js
│   │   └── ...
│   ├── context/                 # React Context
│   │   └── AuthContext.js
│   └── utils/                   # Utility functions
├── android/                     # Build Android (Capacitor)
├── ios/                         # Build iOS (Capacitor)
└── build/                       # Production build
```

### 3.3 Configurazione Proxy

Il `package.json` configura il proxy verso il backend:

```json
{
  "proxy": "http://localhost:3001"
}
```

Questo permette di chiamare le API senza specificare l'origin:

```javascript
// Invece di: axios.get('http://localhost:3001/api/catalogo')
axios.get('/api/catalogo')
```

### 3.4 Routing

React Router gestisce la navigazione:

```javascript
<BrowserRouter>
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/catalogo" element={<ProtectedRoute><Catalogo /></ProtectedRoute>} />
    <Route path="/magazzino" element={<ProtectedRoute><Magazzino /></ProtectedRoute>} />
    <Route path="/vendite" element={<ProtectedRoute><Vendite /></ProtectedRoute>} />
    <Route path="/website-builder" element={<ProtectedRoute><WebsiteBuilder /></ProtectedRoute>} />
  </Routes>
</BrowserRouter>
```

### 3.5 Autenticazione

L'autenticazione usa un React Context:

```javascript
// AuthContext.js
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const login = async (email, password) => {
    const response = await axios.post('/api/auth/login', { email, password });
    setToken(response.data.token);
    setUser(response.data.user);
    localStorage.setItem('token', response.data.token);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### 3.6 Chiamate API con Axios

```javascript
// services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/', // Usa il proxy configurato
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor per aggiungere il token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

Esempio di utilizzo:

```javascript
// pages/Catalogo.js
import api from '../services/api';

function Catalogo() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get('/api/catalogo')
      .then(response => setProducts(response.data))
      .catch(error => console.error(error));
  }, []);

  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

---

## 4. E-commerce Next.js (opero-shop)

### 4.1 Stack Tecnologico

```json
{
  "name": "opero-shop",
  "dependencies": {
    "next": "16.0.10",
    "react": "19.2.1",
    "react-dom": "19.2.1",
    "@heroicons/react": "^2.2.0"
  },
  "devDependencies": {
    "tailwindcss": "^4",
    "@tailwindcss/postcss": "^4"
  }
}
```

### 4.2 Architettura Next.js App Router

Il progetto utilizza l'**App Router** di Next.js 16:

```
opero-shop/
├── app/
│   ├── layout.js              # Layout root
│   ├── page.js                # Homepage
│   ├── [[...slug]]/           # Catch-all route multi-tenant
│   │   └── page.js            # Pagina dinamica
│   ├── _sites/[site]/         # Route specifiche per tenant
│   │   └── page.js
│   └── blog/                  # Sezione blog
│       ├── page.js
│       └── [slug]/
│           └── page.js
├── components/
│   ├── blocks/                # Blocchi CMS dinamici
│   │   ├── HeroBlock.js
│   │   ├── CatalogBlock.js
│   │   ├── VetrinaBlock.js
│   │   ├── BlogListBlock.js
│   │   └── ...
│   └── templates/             # Layout template
│       ├── Standard/
│       │   └── Layout.js
│       ├── Fashion/
│       │   └── Layout.js
│       └── Industrial/
│           └── Layout.js
├── middleware.js              # Routing multi-tenant
├── next.config.mjs            # Configurazione Next.js
└── public/                    # Asset statici
```

### 4.3 Middleware Multi-Tenant

Il file `middleware.js` gestisce il routing per sottodomini:

```javascript
// middleware.js
import { NextResponse } from 'next/server';

export function middleware(req) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host');

  const rootDomain = 'operocloud.it'; // Dominio principale
  const subdomain = hostname.replace(`.${rootDomain}`, '');

  // Reindirizza verso la route catch-all
  url.pathname = `/_sites/${subdomain}${url.pathname}`;

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
```

### 4.4 Configurazione Proxy API

Il file `next.config.mjs` configura il proxy verso il backend:

```javascript
// next.config.mjs
export default {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },
};
```

### 4.5 Sistema a Blocchi CMS

Ogni pagina è composta da blocchi dinamici registrati nel `BlockRegistry`:

```javascript
// components/blocks/CatalogBlock.js
export default function CatalogBlock({ siteSlug, config }) {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({});

  const loadProducts = async () => {
    const params = new URLSearchParams(
      Object.entries(filters).filter(([_, v]) => v !== '' && v !== null)
    ).toString();

    const res = await fetch(`/api/public/shop/${siteSlug}/catalog?${params}`);
    const data = await res.json();

    if (data.success) {
      setProducts(data.data);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [filters]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### 4.6 Layout Template

I template definiscono la struttura visiva di base:

```javascript
// components/templates/Standard/Layout.js
export default function StandardLayout({ siteConfig, children, pageData }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50" style={{
      '--primary-color': siteConfig.theme?.primary_color || '#3B82F6',
      '--secondary-color': siteConfig.theme?.secondary_color || '#1E40AF'
    }}>
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main>{children}</main>
      <Footer siteConfig={siteConfig} />
    </div>
  );
}
```

---

## 5. Database MySQL

### 5.1 Configurazione Database

Il file `config/db.js` configura Knex.js:

```javascript
// config/db.js
const knex = require('knex')({
  client: process.env.DB_CLIENT || 'mysql2',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'operodb'
  },
  pool: { min: 2, max: 10 },
  migrations: {
    directory: './migrations'
  },
  seeds: {
    directory: './seeds'
  }
});

module.exports = knex;
```

### 5.2 Struttura Database

Il database `operodb` contiene **oltre 100 tabelle** organizzate in aree funzionali:

#### Tabelle Core
| Tabella | Descrizione |
|---------|-------------|
| `ditte` | Aziende clienti (multi-tenant) |
| `utenti` | Utenti del sistema |
| `ad_utenti_ditte` | Relazione utenti-aziende |
| `ad_ruoli` | Ruoli utenti |
| `utenti_funzioni_override` | Permessi speciali |

#### Gestione Aziendale
| Tabella | Descrizione |
|---------|-------------|
| `anagrafica` | Clienti e fornitori |
| `ct_catalogo` | Catalogo prodotti |
| `ct_listini` | Listini prezzi |
| `mg_giacenze` | Giacenze magazzino |
| `sc_partite_aperte` | Partite contabili |
| `va_clienti` | Anagrafica avanzata clienti |

#### Documenti
| Tabella | Descrizione |
|---------|-------------|
| `dm_documenti` | Documenti generici |
| `dm_files` | File allegati |
| `dm_allegati` | Allegati documenti |

#### Website Builder
| Tabella | Descrizione |
|---------|-------------|
| `siti_web_aziendali` | Siti web creati |
| `pagine_sito_web` | Pagine dei siti |
| `template_siti_web` | Template disponibili |
| `wg_gallerie` | Gallerie immagini |
| `wg_blocchi_pagina` | Blocchi delle pagine |

#### CMS & Blog
| Tabella | Descrizione |
|---------|-------------|
| `web_pagine` | Pagine CMS |
| `web_pagine_revisions` | Revisioni pagine |
| `blog_posts` | Articoli blog |
| `blog_categories` | Categorie blog |

#### Email
| Tabella | Descrizione |
|---------|-------------|
| `email_inviate` | Email inviate |
| `email_tracking` | Tracking aperture |
| `allegati_tracciati` | Allegati tracciati |

### 5.3 Esempio Struttura Tabella

```sql
-- Tabella siti_web_aziendali
CREATE TABLE `siti_web_aziendali` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_ditta` int(11) unsigned NOT NULL,
  `subdomain` varchar(100) NOT NULL UNIQUE,
  `domain_status` enum('active','inactive','pending') DEFAULT 'pending',
  `template_id` int(11) DEFAULT 1,
  `theme_config` json DEFAULT NULL,
  `site_title` varchar(255) DEFAULT NULL,
  `site_description` text DEFAULT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  `enable_catalog` tinyint(1) DEFAULT 0,
  `catalog_settings` json DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_subdomain` (`subdomain`),
  KEY `idx_ditta` (`id_ditta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabella ct_catalogo (prodotti)
CREATE TABLE `ct_catalogo` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `id_ditta` int(11) unsigned NOT NULL,
  `codice_articolo` varchar(50) NOT NULL,
  `descrizione` varchar(255) NOT NULL,
  `id_categoria` int(11) DEFAULT NULL,
  `prezzo_base` decimal(10,2) DEFAULT NULL,
  `unita_misura` varchar(20) DEFAULT 'PZ',
  `visibile_sito` tinyint(1) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_codice_ditta` (`codice_articolo`, `id_ditta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 5.4 Migrations

Il sistema utilizza **Knex.js migrations** per gestire le versioni del database:

```bash
# Creare nuova migration
npx knex migrate:make nome_migration

# Eseguire migrations
npx knex migrate:latest

# Rollback migration
npx knex migrate:rollback
```

Esempio migration:

```javascript
// migrations/20251222_0create_catalog_selezioni.js
exports.up = async function(knex) {
  await knex.schema.createTable('ct_catalogo_selezioni', (table) => {
    table.increments('id').primary();
    table.integer('id_ditta').unsigned().notNullable();
    table.string('nome', 100).notNullable();
    table.text('descrizione').nullable();
    table.json('configurazione').nullable();
    table.timestamps(true, true);
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTable('ct_catalogo_selezioni');
};
```

---

## 6. Interazione tra i Sistemi

### 6.1 Flusso di Dati Complessivo

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUSSO DATI OPERO                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. UTENTE ──► REACT FRONTEND                                   │
│     │                                                           │
│     ├── Login → POST /api/auth/login                           │
│     │                                                         │
│     ├── Dashboard → GET /api/user/dashboard                    │
│     │                                                         │
│     ├── Gestione Catalogo → CRUD /api/catalogo                 │
│     │                                                         │
│     └── Website Builder → CRUD /api/website                    │
│                                                                 │
│  2. VISITATORE ──► NEXT.JS SHOP                                │
│     │                                                           │
│     ├── Naviga sito → subdomain.operocloud.it                  │
│     │     │                                                    │
│     │     └── Middleware → estrae subdomain                    │
│     │           │                                            │
│     │           └── GET /api/public/shop/:subdomain/page/:slug│
│     │                                                         │
│     ├── Catalogo → GET /api/public/shop/:subdomain/catalog     │
│     │                                                         │
│     └── Blog → GET /api/public/shop/:subdomain/blog/posts      │
│                                                                 │
│  3. BACKEND ──► MYSQL DATABASE                                 │
│     │                                                           │
│     ├── Knex.js Query Builder                                   │
│     │                                                           │
│     ├── Connection Pool (max 10)                               │
│     │                                                           │
│     └── Transaction Management                                 │
│                                                                 │
│  4. SERVIZI ESTERNI                                            │
│     ├── S3 Aruba Cloud (storage file)                          │
│     ├── Z.ai API (generazione contenuti)                       │
│     └── SMTP/IMAP (gestione email)                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Esempio Completo: Creazione Sito Web

**Step 1: Utente crea sito dal frontend React**

```javascript
// opero-frontend/src/pages/WebsiteBuilder.js
const createSite = async () => {
  const siteData = {
    subdomain: 'mia-azienda',
    site_title: 'Mia Azienda S.r.l.',
    template_id: 1,
    theme_config: {
      primary_color: '#3B82F6',
      secondary_color: '#1E40AF'
    }
  };

  const response = await api.post('/api/website', siteData);
  return response.data;
};
```

**Step 2: Backend processa la richiesta**

```javascript
// routes/website.js
router.post('/', verifyToken, async (req, res) => {
  const { subdomain, site_title, template_id, theme_config } = req.body;

  // Verifica disponibilità subdomain
  const existing = await db('siti_web_aziendali')
    .where('subdomain', subdomain)
    .first();

  if (existing) {
    return res.status(400).json({ error: 'Subdomain già in uso' });
  }

  // Inserisci nel database
  const [siteId] = await db('siti_web_aziendali').insert({
    id_ditta: req.user.id_ditta,
    subdomain,
    site_title,
    template_id,
    theme_config: JSON.stringify(theme_config),
    domain_status: 'pending'
  });

  // Crea pagina home di default
  await db('pagine_sito_web').insert({
    id_sito: siteId,
    slug: 'home',
    titolo: 'Home',
    layout_config: JSON.stringify(defaultLayout)
  });

  res.json({ success: true, siteId });
});
```

**Step 3: Visitatore accede al sito Next.js**

```
URL: mia-azienda.operocloud.it
      │
      ▼
Middleware.js: estrae subdomain = 'mia-azienda'
      │
      ▼
[[...slug]]/page.js: fetch da /api/public/shop/mia-azienda/page/home
      │
      ▼
Backend: query siti_web_aziendali + pagine_sito_web
      │
      ▼
Response: JSON con pagina + blocchi
      │
      ▼
Render: Next.js renderizza i blocchi dinamici
```

**Step 4: Render Next.js**

```javascript
// opero-shop/app/[[...slug]]/page.js
export default async function CatchAllPage({ params, searchParams }) {
  const siteSlug = searchParams.site || 'www';
  const pageSlug = params.slug?.join('/') || 'home';

  // Fetch dati pagina dal backend
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/public/shop/${siteSlug}/page/${pageSlug}`;
  const res = await fetch(apiUrl, { cache: 'no-store' });
  const data = await res.json();

  if (!data.success) {
    return <div>Sito non trovato</div>;
  }

  const { siteConfig, page, components } = data.data;

  // Renderizza blocchi dinamici
  return (
    <html>
      <head>
        <title>{page.titulo} - {siteConfig.site_title}</title>
      </head>
      <body>
        {components.map((block, index) => {
          const BlockComponent = BlockRegistry[block.type];
          return <BlockComponent key={index} {...block.config} />;
        })}
      </body>
    </html>
  );
}
```

### 6.3 Diagramma Sequenza Login

```
Utente            React Frontend      Backend API        MySQL Database
  │                     │                   │                    │
  │  Inserisci credenziali                   │                    │
  │────────────────────►│                   │                    │
  │                     │                   │                    │
  │                     │  POST /api/auth/login                   │
  │                     │──────────────────►│                    │
  │                     │                   │                    │
  │                     │                   │  SELECT * FROM utenti│
  │                     │                   │  WHERE email = ?   │
  │                     │                   │───────────────────►│
  │                     │                   │                    │
  │                     │                   │  utente trovato    │
  │                     │                   │◄───────────────────│
  │                     │                   │                    │
  │                     │                   │  bcrypt.compare()  │
  │                     │                   │                    │
  │                     │  {token, user}    │                    │
  │                     │◄──────────────────│                    │
  │                     │                   │                    │
  │                     │  Salva token in localStorage            │
  │                     │                   │                    │
  │  Redirect Dashboard │                   │                    │
  │◄────────────────────│                   │                    │
```

---

## 7. Architettura Multi-Tenant

### 7.1 Isolamento Dati

Il sistema implementa un'architettura **multi-tenant** basata su `id_ditta`:

**Pattern di filtraggio:**
```javascript
// Tutte le query includono id_ditta
await db('ct_catalogo')
  .where('id_ditta', req.user.id_ditta)
  .select();
```

**Middleware di verifica:**
```javascript
// utils/auth.js
function verifyDittaAccess(req, res, next) {
  // Verifica che l'utente abbia accesso alla ditta
  if (req.user.id_ditta !== req.body.id_ditta) {
    return res.status(403).json({ error: 'Accesso negato a questa azienda' });
  }
  next();
}
```

### 7.2 Relazioni Utenti-Aziende

La tabella `ad_utenti_ditte` gestisce le associazioni:

```sql
CREATE TABLE `ad_utenti_ditte` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `id_utente` int(11) unsigned NOT NULL,
  `id_ditta` int(11) unsigned NOT NULL,
  `id_ruolo` int(11) NOT NULL,
  `livello` enum('viewer','editor','admin') DEFAULT 'viewer',
  `attivo` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_utente_ditta` (`id_utente`, `id_ditta`)
);
```

Query di verifica permessi:

```javascript
async function getUserDitte(userId) {
  return await db('ad_utenti_ditte as ud')
    .join('ditte as d', 'ud.id_ditta', 'd.id')
    .where('ud.id_utente', userId)
    .where('ud.attivo', 1)
    .select(
      'd.id',
      'd.ragione_sociale',
      'ud.id_ruolo',
      'ud.livello'
    );
}
```

---

## 8. Sicurezza e Autenticazione

### 8.1 JWT Authentication

**Generazione Token:**
```javascript
const token = jwt.sign(
  {
    id: user.id,
    email: user.email,
    id_ditta: user.id_ditta,
    ruolo: user.ruolo
  },
  process.env.JWT_SECRET,
  { expiresIn: '15m' }
);
```

**Refresh Token:**
```javascript
const refreshToken = jwt.sign(
  { id: user.id },
  process.env.JWT_REFRESH_SECRET,
  { expiresIn: '7d' }
);
```

### 8.2 Password Hashing

```javascript
const bcrypt = require('bcrypt');

// Hash password
const hashedPassword = await bcrypt.hash(plainPassword, 10);

// Verifica password
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

### 8.3 CORS Configuration

```javascript
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origin non permessa'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
};
```

### 8.4 Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 4, // massimo 4 tentativi
  message: 'Troppi tentativi di login, riprova più tardi'
});

app.use('/api/auth/login', loginLimiter);
```

---

## 9. Servizi Esterni e Integrazioni

### 9.1 S3 Aruba Cloud Storage

**Configurazione:**
```javascript
// services/s3Service.js
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY
  }
});

async function uploadFile(key, body, contentType) {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType
  });
  return await s3Client.send(command);
}
```

**Organizzazione file:**
```
operogo/
├── ditte/
│   ├── {id_ditta}/
│   │   ├── logo/
│   │   ├── documenti/
│   │   ├── catalogo/
│   │   └── website/
```

### 9.2 Email Service

**Invio Email:**
```javascript
// utils/mailer.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD
  }
});

async function sendEmail(to, subject, html, attachments = []) {
  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    html,
    attachments
  });
  return info;
}
```

**Email Tracking:**
```javascript
// Pixel di tracking 1x1
const trackingPixel = `
<img src="${process.env.BASE_URL}/api/track/email/${emailId}" width="1" height="1" />
`;

// Route tracking
app.get('/api/track/email/:emailId', async (req, res) => {
  await db('email_tracking').insert({
    id_email: req.params.emailId,
    evento: 'apertura',
    data_ora: new Date(),
    ip_address: req.ip,
    user_agent: req.headers['user-agent']
  });

  res.setHeader('Content-Type', 'image/gif');
  res.send(Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'));
});
```

### 9.3 AI Integration (Z.ai)

**Generazione contenuti:**
```javascript
// services/AISiteGenerator.js
async function generatePageContent(prompt, context) {
  const response = await fetch('https://api.z.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.ZAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'Sei un esperto copywriter...' },
        { role: 'user', content: prompt }
      ]
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}
```

### 9.4 Puppeteer (Web Scraping)

```javascript
const puppeteer = require('puppeteer');

async function scrapeWebsite(url) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'networkidle2' });

  const data = await page.evaluate(() => ({
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.content,
    text: document.body.innerText
  }));

  await browser.close();
  return data;
}
```

---

## Riepilogo Porte e Endpoint

### Porte di Default

| Servizio | Porta | URL |
|----------|-------|-----|
| Backend API | 3001 | http://localhost:3001 |
| React Frontend | 3000 | http://localhost:3000 |
| Next.js Shop | 3002 | http://localhost:3002 |
| MySQL | 3306 | localhost:3306 |

### Endpoint Principali

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| POST | /api/auth/login | Login utente |
| GET | /api/user/dashboard | Dashboard utente |
| GET | /api/catalogo | Lista prodotti |
| POST | /api/catalogo | Crea prodotto |
| GET | /api/public/shop/:site/page/:slug | Pagina pubblica sito |
| GET | /api/public/shop/:site/catalog | Catalogo pubblico |
| POST | /api/website | Crea sito web |
| GET | /api/admin/cms/pages | Pagine CMS |
| POST | /api/admin/blog/posts | Crea articolo blog |

---

## Comandi Utili

### Backend
```bash
# Installa dipendenze
npm install

# Avvia in sviluppo
npm start

# Esegui migrations
npx knex migrate:latest

# Rollback migration
npx knex migrate:rollback

# Seed database
npx knex seed:run
```

### React Frontend
```bash
cd opero-frontend
npm install
npm start          # Sviluppo su porta 3000
npm run build      # Build produzione
```

### Next.js Shop
```bash
cd opero-shop
npm install
npm run dev        # Sviluppo su porta 3002
npm run build      # Build produzione
npm start          # Produzione
```

### Mobile (Capacitor)
```bash
cd opero-frontend
npm run build
npx cap sync android
npx cap open android
```

---

## Variabili Ambiente (.env)

```bash
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=operodb

# JWT
JWT_SECRET=tua_chiave_segreta
JWT_REFRESH_SECRET=tua_chiave_refresh

# Server
PORT=3001
NODE_ENV=development

# Email
MAIL_HOST=smtps.aruba.it
MAIL_PORT=465
MAIL_USER=opero@difam.it
MAIL_PASSWORD=tua_password

# S3 Aruba
S3_ENDPOINT=http://r3-it.storage.cloud.it
S3_ACCESS_KEY=tua_access_key
S3_SECRET_KEY=tua_secret_key
S3_BUCKET_NAME=operogo

# AI (Z.ai)
ZAI_API_KEY=tua_zai_api_key

# Frontend URLs
FRONTEND_URL=http://localhost:3000
SHOP_URL=http://localhost:3002
```

---

## Note Finali

Questo documento fornisce una panoramica completa dell'architettura del sistema Opero. Per approfondimenti specifici, consultare:

- `DOCUMENTAZIONE_TECNICA_WEBSITE_BUILDER.md` - Website Builder dettagliato
- `INTEGRAZIONE_S3.md` - Storage S3
- `AI_INTEGRATION_COMPLETE_GUIDE.md` - Integrazione AI
- `BLOG_SYSTEM_README.md` - Sistema Blog

---

*Documento generato il 23/12/2025 - Sistema Opero v8.2*
