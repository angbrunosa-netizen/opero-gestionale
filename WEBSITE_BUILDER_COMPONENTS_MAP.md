# Mappa Componenti Website Builder UNIFIED
**Componente Principale:** `WebsiteBuilderUNIFIED.js`
**File:** `C:\Users\ANGELOBRUNO\Documents\app\opero\opero-frontend\src\components\WebsiteBuilderUNIFIED.js`

---

## 🏗️ Architettura Principale

### 1. Componente Root: WebsiteBuilderUNIFIED
**Descrizione:** Componente principale che orchestral'intero processo di creazione e gestione siti web
**Stati Principali:** `activeView` ('template' | 'pages' | 'builder')

---

## 📋 Menu 1: Selezione Template (`activeView: 'template'`)

### 🎨 Funzionalità
- Scelta tra template predefiniti
- Creazione template personalizzato da zero
- Anteprima sezioni incluse in ogni template
- Accesso a generazione sito e deployment VPS

### 🧩 Componenti Utilizzati

#### Componenti UI (Heroicons)
- `SparklesIcon` - Template personalizzato
- `ArrowLeftIcon` - Navigazione indietro
- `PlusIcon` - Aggiungi/Nuovo
- `EyeIcon` - Anteprima sito
- `RocketLaunchIcon` - Generazione sito
- `ServerIcon` - Deploy VPS

### 📦 Template Predefiniti (4 templates)

#### 1. Business Landing 🏢
**ID:** `business-landing`
**Sezioni incluse:**
- **Image Section** → ImageSection.js
- **Blog Section** → BlogSection.js
- **Gallery Section** → GallerySection.js
- **Maps Section** → MapsSection.js
- **Social Section** → SocialSection.js

#### 2. Portfolio Creativo 🎨
**ID:** `creative-portfolio`
**Sezioni incluse:**
- **Gallery Section** (carousel) → GallerySection.js
- **Blog Section** (masonry) → BlogSection.js
- **Social Section** (grid) → SocialSection.js

#### 3. Attività Locale 🏪
**ID:** `local-business`
**Sezioni incluse:**
- **Image Section** → ImageSection.js
- **Maps Section** → MapsSection.js
- **Gallery Section** (masonry) → GallerySection.js
- **Social Section** (vertical) → SocialSection.js

#### 4. Blog Magazine 📰
**ID:** `blog-magazine`
**Sezioni incluse:**
- **Blog Section** (list) → BlogSection.js
- **Blog Section** (categories) → BlogSection.js
- **Social Section** → SocialSection.js

### 🔌 API Endpoints Utilizzati

#### Generazione Sito
```javascript
GET  /api/website-generator/preview/:websiteId     // Anteprima sito
POST /api/website-generator/generate/:websiteId    // Generazione statica
POST /api/website-generator/deploy/:websiteId      // Deploy VPS
GET  /api/website-generator/status/:websiteId      // Stato deploy
```

#### Gestione Pagine
```javascript
GET  /api/website/:websiteId/pages                 // Carica pagine esistenti
POST /api/website/:websiteId/pages                 // Crea nuova pagina
PUT  /api/website/:websiteId/pages/:pageId         // Aggiorna pagina
```

---

## 📄 Menu 2: Gestione Pagine (`activeView: 'pages'`)

### 🎨 Funzionalità
- Elenco pagine create
- Stato pubblicazione (Pubblicata/Bozza)
- Anteprima singola pagina
- Modifica pagina esistente
- Navigazione rapida a nuova pagina

### 🧩 Componenti Utilizzati

#### Componenti UI
- `ArrowLeftIcon` - Ritorno a template
- `PlusIcon` - Nuova pagina
- `EyeIcon` - Anteprima pagina
- Icons Heroicons per indicazioni stato

### 📋 Visualizzazione Pagine
- Grid responsive (1-3 colonne)
- Badge stato pubblicazione
- Contatore sezioni per pagina
- Data ultima modifica

### 🔌 API Endpoints Utilizzati

#### Caricamento Pagine
```javascript
GET /api/website/:websiteId/pages
// Response: { success: true, pages: [...] }
```

#### Anteprima Pagina
```javascript
// Generazione HTML locale (no API)
handlePreviewPage(page) → generateHtmlFromSections()
```

---

## 🛠️ Menu 3: Page Builder (`activeView: 'builder'`)

### 🎨 Funzionalità
- Modifica sezioni pagina
- Drag & drop ordinamento sezioni
- Aggiunta/rimozione sezioni
- Preview in tempo reale
- Salvataggio automatico

### 🧩 Componenti Principali

#### TemplatePageBuilder.js
**Path:** `components/website/builder/TemplatePageBuilder.js`
**Descrizione:** Core del builder per la modifica sezioni

**Stati principali:**
```javascript
const [page, setPage] = useState({
  title: '',
  slug: '',
  meta_title: '',
  meta_description: '',
  sections: []
});
```

#### Sezioni Disponibili (5 componenti)

##### 1. ImageSection.js 🖼️
**Path:** `components/website/builder/sections/ImageSection.js`
**Funzionalità:**
- Caricamento/Selezione immagini
- Layout (center/left/right)
- Testi personalizzabili
- Bottoni con URL
- Stili bordi immagini

**Sotto-componenti:**
- `WebsiteImageSelector.js` - Selezione immagini da archivio

##### 2. GallerySection.js 🎨
**Path:** `components/website/builder/sections/GallerySection.js`
**Funzionalità:**
- Layout (grid/carousel/masonry)
- Upload multiplo immagini
- Didascalie e lightbox
- Transizioni animate

##### 3. BlogSection.js 📝
**Path:** `components/website/builder/sections/BlogSection.js`
**Funzionalità:**
- Layout (grid/list/masonry)
- Filtri per categoria
- Meta dati (autore/data/tempo lettura)
- Numero articoli visualizzati

##### 4. MapsSection.js 🗺️
**Path:** `components/website/builder/sections/MapsSection.js`
**Funzionalità:**
- Integrazione Google Maps
- Markers personalizzati
- Street view e direzioni
- Stili mappa personalizzati

##### 5. SocialSection.js 📱
**Path:** `components/website/builder/sections/SocialSection.js`
**Funzionalità:**
- Piattaforme multiple (FB, IG, LI, TikTok, YouTube)
- Layout (horizontal/vertical/grid)
- Icon styles e dimensioni
- Follower counter e feed preview

### 🧩 Componenti di Supporto

#### WebsiteImageSelector.js
**Path:** `components/website/WebsiteImageSelector.js`
**Descrizione:** Modale per selezione/upload immagini integrato con archivio

**Funzionalità:**
- **Filtro:** Tutti/Immagini/Questo sito
- **Ricerca:** Full-text su filename e descrizioni
- **Upload:** Nuove immagini con archiviazione S3
- **Integrazione:** Sistema archivio documentale esistente

**API Utilizzate:**
```javascript
GET  /api/archivio/all-files           // Elenco tutti i file
POST /api/archivio/upload              // Upload nuovi file
GET  /api/pagine/:websiteId/immagini   // Immagini sito specifico
POST /api/pagine/:websiteId/immagini   // Salva immagini sito
```

#### FallbackSection.js (Internal)
**Descrizione:** Componente di fallback per sezioni non disponibili

### 🔌 API Endpoints Builder

#### Gestione Immagini
```javascript
GET  /api/archivio/all-files           // Archivio completo
GET  /api/pagine/:websiteId/immagini   // Immagini pagina
POST /api/pagine/:websiteId/immagini   // Associa immagini
```

#### Salvataggio Pagina
```javascript
POST /api/website/:websiteId/pages     // Nuova pagina
PUT  /api/website/:websiteId/pages/:id // Modifica pagina
```

---

## 🔌 API Integration Layer

### Servizio API Principale
**Path:** `src/services/api.js`
**Autenticazione:** JWT Bearer Token
**Base URL:** `http://localhost:3001/api`

### Endpoints per Category

#### 🌐 Website Generator
```javascript
GET  /website-generator/preview/:websiteId
POST /website-generator/generate/:websiteId
POST /website-generator/deploy/:websiteId
GET  /website-generator/status/:websiteId
```

#### 📄 Pagine Sito
```javascript
GET  /website/:websiteId/pages
POST /website/:websiteId/pages
PUT  /website/:websiteId/pages/:id
GET  /website/:websiteId/pages/:id/immagini
POST /website/:websiteId/pages/:id/immagini
```

#### 📁 Archivio Documentale
```javascript
GET  /archivio/all-files
POST /archivio/upload
GET  /archivio/files
POST /archivio/files/:id/link
```

---

## 🎨 Componenti UI per Stato Feedback

### Indicatori Visivi
- **Loading States:** Spinner animati con messaggi contestuali
- **Error States:** Bordo rosso con icona X e messaggio descrittivo
- **Success States:** Bordo verde con checkmark e messaggio di conferma
- **Warning States:** Bordo giallo per stati parziali

### Modal e Overlay
- **VPS Config Modal:** Form configurazione deploy con validazione
- **Progress Indicator:** Fixed bottom-right durante operazioni lunghe
- **Preview Windows:** Nuova finestra per anteprime HTML

---

## 🔄 Flow di Navigazione Completo

```
1. WebsiteBuilderUNIFIED (mount)
   ↓
2. Template Selection (activeView: 'template')
   ├─→ Scelta template → Builder
   ├─→ Pages List → Edit Page → Builder
   └─→ Site Generation/Deploy
```

```
3. TemplatePageBuilder (activeView: 'builder')
   ├─→ Edit Sections → Save → Pages List
   ├─→ Preview → New Window
   └─→ Cancel → Template Selection
```

```
4. Pages Management (activeView: 'pages')
   ├─→ Edit Page → Builder
   ├─→ Preview Page → HTML Window
   └─→ New Page → Template Selection
```

---

## 📊 Dati e State Management

### Stati Principali WebsiteBuilderUNIFIED
```javascript
// Navigazione
activeView: 'template' | 'pages' | 'builder'

// Template
selectedTemplate: Template | null
currentBuilderTemplate: Template | null

// Pagine
pages: Page[]
editingPage: Page | null

// Site Generation
isGenerating: boolean
isDeploying: boolean
deployStatus: string
vpsConfig: VPSConfig

// UI State
loading: boolean
saving: boolean
error: string | null
success: string | null
```

### Struttura Dati Template
```javascript
interface Template {
  id: string
  name: string
  description: string
  icon: string
  sections: Section[]
}

interface Section {
  id: string
  type: 'image' | 'blog' | 'maps' | 'social' | 'gallery'
  data: SectionData
}
```

### Struttura Dati Pagina
```javascript
interface Page {
  id: number
  titolo: string
  slug: string
  contenuto_json: string
  meta_title: string
  meta_description: string
  is_published: boolean
  template_name: string
  updated_at: string
}
```

---

## 🔒 Gestione Permessi

### Permesso Richiesto: `SITE_BUILDER`
**Middleware:** `checkPermission('SITE_BUILDER')`
**Endpoints protetti:** Tutti gli endpoint di website-generator

### Validazioni
- **JWT Token:** Richiesto per tutte le chiamate API
- **Ownership:** Verifica proprietà sito web
- **Rate Limiting:** Protezione endpoint generazione

---

## 🎯 Focus Cases d'Uso

### 1. Azienda (Business Landing)
- **Need:** Landing page professionale
- **Sections:** Hero, Services, Gallery, Contact, Social
- **Features:** Google Maps, Portfolio, Social Links

### 2. Creative (Portfolio)
- **Need:** Mostrare lavori creativi
- **Sections:** Carousel Gallery, Masonry Blog, Social Feed
- **Features:** Immagini multiple, Layout creativi

### 3. Negozio Locale (Local Business)
- **Need:** Presenza online per attività fisica
- **Sections:** Hero with Image, Interactive Maps, Product Gallery
- **Features:** Street View, Directions, Customer Photos

### 4. Publisher (Blog Magazine)
- **Need:** Content publishing platform
- **Sections:** Blog List, Categories, Social Integration
- **Features:** Article metadata, Author profiles

---

## 🚀 Next.js Site Generation Output

### Struttura Files Generati
```
generated-sites/{websiteId}/
├── package.json
├── next.config.js
├── pages/
│   ├── _app.js
│   ├── index.js (homepage)
│   └── [slug].js (dynamic pages)
├── components/
│   ├── Layout.js
│   ├── Header.js
│   └── Footer.js
└── styles/
    └── globals.css
```

### Features Sito Generato
- **Static Site Generation:** Build-time rendering
- **SEO Optimized:** Meta tags, sitemap.xml
- **Responsive Design:** Mobile-first approach
- **Performance:** Lazy loading, optimized images
- **Deployment Ready:** Production-ready configuration

---

## 📝 Riepilogo Componenti

| Menu | Componenti | API Endpoints | Features Principali |
|------|------------|---------------|-------------------|
| **Template Selection** | WebsiteBuilderUNIFIED, Heroicons | website-generator/*, website/* | Scelta template, generazione sito, deploy VPS |
| **Pages Management** | WebsiteBuilderUNIFIED, Grid UI | website/:id/pages | Lista pagine, edit, preview, stato pubblicazione |
| **Page Builder** | TemplatePageBuilder, 5 Section Components, WebsiteImageSelector | website/*, archivio/* | Drag&drop sezioni, editing contenuti, gestione immagini |

**Totale Componenti:** 15+ componenti specializzati
**Totali API Endpoints:** 12+ endpoint RESTful
**Templates Predefiniti:** 4 templates completi
**Tipi Sezione:** 5 tipi di sezione personalizzabili