# Analisi del Sistema OPERO-SHOP

**Data:** 16 dicembre 2025
**Versione:** 1.0
**Autore:** Claude Sonnet 4.5

## 📋 Sommario Esecutivo

Il sistema **OPERO-SHOP** è una piattaforma e-commerce multi-tenant basata su **Next.js 16** con architettura moderna e scalabile. Il sistema supporta la creazione e gestione di siti web multipli attraverso un CMS (Content Management System) integrato, con possibilità di personalizzazione per ogni tenant.

## 🏗️ Architettura Generale

### Paradigma Multi-Tenant
- **Sottodomini dinamici**: Ogni negozio ha il proprio sottodominio (es. `azienda.localhost`)
- **Database condiviso**: Utilizzo di tabelle con foreign keys per separare i dati dei tenant
- **Routing centralizzato**: Middleware per gestire il routing multi-tenant

### Stack Tecnologico
- **Frontend**: Next.js 16 con App Router
- **Backend**: Express.js con Node.js
- **Database**: MySQL
- **Styling**: Tailwind CSS v4
- **Build Tool**: Vite/Turbopack (Next.js)

## 📁 Struttura del Progetto

### Frontend (Next.js)
```
opero-shop/
├── app/
│   ├── _sites/[site]/[[...slug]]/     # Route dinamiche per i siti multi-tenant
│   │   ├── layout.js                  # Layout per siti dinamici
│   │   └── [[...slug]]/
│   │       └── page.js               # Motore di rendering CMS
│   ├── layout.js                     # Layout principale dell'applicazione
│   ├── page.js                       # Homepage di base
│   └── globals.css                   # Stili globali
├── components/
│   ├── BlockRegistry.js              # Registro dei componenti CMS
│   ├── blocks/                       # Componenti riutilizzabili
│   │   ├── HeroBlock.js              # Sezione hero configurabile
│   │   ├── VetrinaBlock.js           # Vetrina prodotti
│   │   ├── HtmlBlock.js              # HTML personalizzato
│   │   └── MapsBlock.js              # Mappa Google Maps
│   └── templates/
│       └── Standard/
│           └── Layout.js             # Layout template standard
├── public/                           # File statici
├── middleware.js                     # Middleware routing multi-tenant
├── next.config.mjs                   # Configurazione Next.js
├── eslint.config.mjs                 # Configurazione ESLint
├── postcss.config.mjs                # Configurazione PostCSS
├── jsconfig.json                     # Configurazione JavaScript
├── setup_cms.js                      # Script di setup automatico CMS
├── setup_cms.bat                     # Script batch per Windows
└── .env.local                        # Variabili d'ambiente locali
```

### Backend (Express.js - Directory Superiore)
```
../
├── server.js                         # Server principale Express
├── routes/
│   ├── admin_cms.js                  # Rotte admin CMS
│   ├── public.js                     # Rotte pubbliche API
│   └── [altre rotte...]
├── migrations/                       # Migrazioni database
├── config/                           # File di configurazione
└── services/                         # Servizi backend
```

## 🔧 Componenti Principali

### 1. Sistema di Routing Multi-Tenant

#### Middleware (`middleware.js`)
- **Funzione**: Intercetta le richieste e le reindirizza alle route appropriate
- **Logica**: Identifica sottodomini e rewrite interni a `/_sites/[subdomain]/[path]`
- **Matcher**: Esclude API, file statici e route interne di Next.js

```javascript
// Estratto chiave dal middleware.js:31-38
if (isSubdomain) {
  const subdomain = hostname.replace(`.${rootDomain}`, "");
  return NextResponse.rewrite(
    new URL(`/_sites/${subdomain}${url.pathname}`, req.url)
  );
}
```

#### Motore di Rendering (`app/_sites/[site]/[[...slug]]/page.js`)
- **Funzione**: Recupera dati dal backend e renderizza pagine dinamiche
- **Processo**:
  1. Risolve parametri URL (site, slug)
  2. Fetch dati da API backend
  3. Seleziona template appropriato
  4. Renderizza componenti dinamici

```javascript
// Estratto chiave dalla pagina:13-25
async function getPageData(siteSlug, slugArray) {
  const pageSlug = slugArray ? slugArray.join('/') : 'home';
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/public/shop/${siteSlug}/page/${pageSlug}`;
  // ... fetch e return dati
}
```

### 2. CMS Page Builder

#### Registro Componenti (`BlockRegistry.js`)
- **Funzione**: Mappa codici del database ai componenti React
- **Loading**: Dinamico per ottimizzazione performance
- **Componenti disponibili**:
  - `HERO`: Sezione hero con immagine, titolo e CTA
  - `VETRINA`: Vetrina prodotti (placeholder)
  - `HTML`: Blocco HTML personalizzato
  - `MAPS`: Mappa Google Maps (placeholder)

```javascript
// Estratto dal BlockRegistry.js:15-20
export const BLOCK_REGISTRY = {
  'HERO': HeroBlock,
  'VETRINA': VetrinaBlock,
  'HTML': HtmlBlock,
  'MAPS': MapsBlock,
};
```

#### Sistema di Template
- **Template Standard**: Layout base con navigazione e footer
- **Personalizzazioni**: Colori primario/secondario per ogni sito
- **Estensibilità**: Architettura per aggiungere nuovi template

### 3. API Backend

#### Endpoint Pubblici (`routes/public.js`)
- **Endpoint principale**: `/api/public/shop/:slug/page/:pageSlug?`
- **Middleware `resolveTenant`**: Identifica il tenant dallo slug
- **Dati restituiti**:
  - Configurazione sito (nome, logo, colori, template)
  - Metadati pagina (title, description)
  - Componenti ordinati per il rendering

```javascript
// Estratto da routes/public.js:179-229
router.get('/shop/:slug/page/:pageSlug?', resolveTenant, async (req, res) => {
  // 1. Recupera metadati pagina
  // 2. Recupera componenti ordinati
  // 3. Restituisce struttura completa per il frontend
});
```

## 🎨 Componenti Frontend Dettagliati

### HeroBlock
- **Props**: `config` con `{ titolo, sottotitolo, immagine_url, allineamento, cta_text }`
- **Funzionalità**: Sezione hero con immagine di sfondo, titolo e call-to-action
- **Responsive**: Design responsive con allineamento configurabile

### VetrinaBlock
- **Stato**: Placeholder in attesa di implementazione
- **Scopo**: Mostrare prodotti in vetrina

### HtmlBlock
- **Funzionalità**: Renderizza HTML personalizzato tramite `dangerouslySetInnerHTML`
- **Uso**: Per contenuti personalizzati o integrazioni esterne

### MapsBlock
- **Stato**: Placeholder in attesa di implementazione
- **Scopo**: Integrazione Google Maps

## 📊 Schema Database

### Tabelle Principali
- **`ditte`**: Informazioni sui tenant
  - `shop_attivo`: Flag per attivazione shop
  - `shop_colore_primario/secondario`: Colori personalizzati
  - `url_slug`: Slug per URL del sito
  - `id_web_template`: Template associato

- **`web_pages`**: Pagine dei siti
  - `id_ditta`: Foreign key al tenant
  - `slug`: URL slug della pagina
  - `titolo_seo/descrizione_seo`: Metadata SEO
  - `pubblicata`: Flag pubblicazione

- **`web_page_components`**: Componenti delle pagine
  - `id_page`: Foreign key alla pagina
  - `tipo_componente`: Tipo di componente (es. 'HERO')
  - `dati_config`: JSON con configurazione componente
  - `ordine`: Ordinamento visualizzazione

- **`web_templates`**: Template disponibili
  - `codice`: Codice identificativo template

## 🚀 Funzionalità Chiave

### 1. Multi-Tenancy
- **Isolamento dati**: Ogni tenant ha i propri dati separati
- **Personalizzazione**: Colori, logo e template per sito
- **Routing automatico**: Basato su sottodomini

### 2. CMS Integrato
- **Page Builder**: Creazione pagine tramite componenti
- **Template System**: Layout riutilizzabili
- **SEO Optimization**: Metadati gestiti dinamicamente

### 3. Componenti Dinamici
- **Architettura modulare**: Componenti indipendenti e riutilizzabili
- **Configurazione JSON**: Dati salvati in formato JSON
- **Lazy Loading**: Caricamento dinamico dei componenti

### 4. Performance
- **SSR/SSG**: Next.js con rendering server-side
- **Code Splitting**: Dynamic imports per componenti
- **Caching**: Ottimizzazioni di caching integrate

## 🔌 Integrazioni Esterne

### API Backend
- **Endpoint**: `http://localhost:3001` (configurabile via env)
- **Autenticazione**: Sistema di token per rotte protette
- **CORS**: Configurazione per richieste cross-origin

### Storage
- **S3 Integration**: Per file e immagini (menzionato nel backend)
- **Upload Handler**: Sistema di upload file

### Tracking
- **Email Tracking**: Sistema di monitoraggio aperture email
- **Analytics**: Potenziale integrazione analytics

## 🛠️ Setup e Configurazione

### Setup Automatico
- **Script**: `setup_cms.js` e `setup_cms.bat`
- **Creazione**: Struttura automatica directory e file
- **Configurazione**: Base per il sistema CMS

### Variabili d'Ambiente
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_ROOT_DOMAIN=localhost
```

### Comandi NPM
- `npm run dev`: Server sviluppo
- `npm run build`: Build produzione
- `npm start`: Server produzione
- `npm run lint`: Analisi codice

## 🔒 Sicurezza

### Protezioni
- **XSS Prevention**: Sanitizzazione input dove necessario
- **SQL Injection**: Uso di prepared statements
- **CORS**: Configurazione appropriata
- **Environment Variables**: Separazione configurazione sensibile

### Best Practices
- **Code Review**: Configurazione ESLint rigorosa
- **Dependency Updates**: Dipendenze mantenute aggiornate
- **Input Validation**: Validazione lato server e client

## 📈 Performance e Scalabilità

### Ottimizzazioni
- **Dynamic Imports**: Lazy loading componenti
- **Image Optimization**: Next.js Image component
- **Font Optimization**: Next.js font con Inter
- **Build Optimization**: Configurazione Tailwind per purge CSS

### Scalabilità
- **Horizontal Scaling**: Architettura stateless
- **Database Scaling**: Query ottimizzate con indici
- **CDN Ready**: Asset statici servibili da CDN

## 🔮 Sviluppi Futuri

### Potenziali Miglioramenti
1. **Componenti Avanzati**:
   - Vetrina prodotti completa
   - Carrello e checkout
   - Sistema di pagamento

2. **Template Additionali**:
   - Template industry-specific
   - Dark mode support

3. **CMS Features**:
   - Drag-and-drop editor
   - Preview mode
   - A/B testing

4. **Performance**:
   - ISR (Incremental Static Regeneration)
   - Edge caching
   - CDN integration

## 📝 Conclusioni

Il sistema OPERO-SHOP rappresenta un'architettura moderna e ben progettata per piattaforme e-commerce multi-tenant. L'utilizzo di Next.js 16 con App Router fornisce una base solida e performante, mentre il sistema di CMS integrato offre flessibilità nella gestione dei contenuti.

### Punti di Forza
- ✅ Architettura multi-tenant robusta
- ✅ Sistema CMS modulare ed estensibile
- ✅ Performance ottimizzate con Next.js
- ✅ Code splitting e lazy loading
- ✅ Separazione chiara frontend/backend

### Aree di Miglioramento
- ⚠️ Alcuni componenti sono ancora placeholder
- ⚠️ Sistema di autenticazione da espandere
- ⚠️ Documentazione tecnica dettagliata
- ⚠️ Test coverage da implementare

Il sistema è pronto per ulteriori sviluppi e può supportare la crescita di una piattaforma e-commerce completa con funzionalità avanzate.