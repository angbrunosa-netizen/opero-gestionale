# Documentazione Tecnica - Website Builder System
## Sistema Gestione Siti Web Aziendali Multi-Tenant

---

## 📋 Executive Summary

Il Website Builder è un modulo completo integrato nel sistema Opero che permette ad ogni azienda cliente di creare e gestire il proprio sito web professionale su un dominio dedicato (`nomeditta.operocloud.it`). Il sistema sfrutta l'infrastruttura esistente di Opero per garantire coerenza dei dati e efficienza operativa.

### Obiettivi Principali
- **Multi-tenancy**: Un sito web per ogni azienda cliente con isolamento completo dei dati
- **Integrazione Nativa**: Riutilizzo dei sistemi esistenti (catalogo prodotti, documentale, utenti)
- **Personalizzazione**: Template flessibili e page builder visuale per contenuti personalizzati
- **Scalabilità**: Architettura predisposta per evoluzione a e-commerce completo
- **Performance**: Ottimizzazioni caching e lazy loading per用户体验 ottimale

---

## 🏗️ Architettura del Sistema

### Stack Tecnologico
```
Frontend (React/Next.js)
├── UI Components: React + Tailwind CSS
├── State Management: React Context + useState/useEffect
├── Page Builder: Drag & Drop personalizzato
├── Image Management: AllegatiManager integration
└── Responsive Design: Mobile-first

Backend (Node.js/Express)
├── API REST: Express.js routing
├── Database: MySQL con tabelle dedicate
├── Authentication: JWT multi-livello
├── Storage: S3 (condiviso con dm_files)
└── File Upload: Middleware esistente Opero

Infrastructure
├── Web Server: Nginx reverse proxy
├── Application: Node.js application server
├── Database: MySQL cluster
├── Storage: AWS S3 compatible
└── Monitoring: Logs e analytics integrati
```

### Flusso Architetturale
```
1. User Authentication (JWT)
   ├── App.operocloud.it: Multi-company access
   └── subdomain.operocloud.it: Single-company access

2. Website Management
   ├── Dashboard Opero → Website Builder
   ├── Template selection & customization
   ├── Content creation (pages, blog, catalog)
   └── Publishing to subdomain

3. Public Access
   ├── SEO-optimized public pages
   ├── Dynamic catalog integration
   ├── Mobile-responsive design
   └── Performance caching
```

---

## 🗄️ Database Schema

### Tabelle Principali

#### 1. `siti_web_aziendali`
**Purpose**: Tabella principale che memorizza un sito per ogni azienda (1:1 con `ditte`)

```sql
CREATE TABLE siti_web_aziendali (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_ditta INT UNSIGNED NOT NULL,           -- FK verso ditte
  subdomain VARCHAR(100) UNIQUE NOT NULL,   -- nomeditta.operocloud.it
  domain_status ENUM('active','inactive','pending'),

  -- Template e personalizzazione
  template_id INT DEFAULT 1,
  theme_config JSON NULL,                    -- Colori, font, layout

  -- SEO e contenuti base
  site_title VARCHAR(255),
  site_description TEXT,
  logo_url VARCHAR(500),
  favicon_url VARCHAR(500),

  -- Social media e analytics
  google_analytics_id VARCHAR(50),
  facebook_url VARCHAR(500),
  instagram_url VARCHAR(500),
  linkedin_url VARCHAR(500),

  -- Catalogo prodotti
  enable_catalog BOOLEAN DEFAULT FALSE,
  catalog_settings JSON DEFAULT '{}',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (id_ditta) REFERENCES ditte(id) ON DELETE CASCADE
);
```

**Integrazione Chiave**:
- Relazione 1:1 con `ditte` per isolamento dati
- `subdomain` univoco per DNS routing
- `theme_config` JSON per personalizzazione template
- `catalog_settings` integra con `catalogo_prodotti` esistente

#### 2. `pagine_sito_web`
**Purpose**: Pagine statiche e dinamiche per ogni sito web

```sql
CREATE TABLE pagine_sito_web (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_sito_web INT NOT NULL,                  -- FK verso siti_web_aziendali
  slug VARCHAR(200) NOT NULL,                -- URL slug (es. "chi-siamo")
  titolo VARCHAR(255) NOT NULL,

  -- Contenuti
  contenuto_html LONGTEXT NULL,              -- HTML statico
  contenuto_json JSON NULL,                  -- Struttura page builder

  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords VARCHAR(500),

  -- Stato
  is_published BOOLEAN DEFAULT FALSE,
  menu_order INT DEFAULT 0,                  -- Ordine navigazione

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (id_sito_web) REFERENCES siti_web_aziendali(id) ON DELETE CASCADE,
  UNIQUE KEY unique_site_slug (id_sito_web, slug)
);
```

**Struttura `contenuto_json`**:
```json
{
  "sections": [
    {
      "type": "hero",
      "title": "Benvenuti nella Nostra Azienda",
      "subtitle": "Soluzioni innovative per il tuo business",
      "background_image": "/uploads/hero-bg.jpg",
      "cta_button": {
        "text": "Scopri di più",
        "link": "/chi-siamo"
      }
    },
    {
      "type": "services",
      "title": "I Nostri Servizi",
      "services": [
        {
          "icon": "consulting",
          "title": "Consulenza",
          "description": "Analisi e strategia personalizzata"
        }
      ]
    }
  ]
}
```

#### 3. `template_siti_web`
**Purpose**: Template predefiniti e personalizzabili

```sql
CREATE TABLE template_siti_web (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome_template VARCHAR(100) NOT NULL,
  categoria ENUM('basic','premium','ecommerce'),
  description TEXT,
  preview_image VARCHAR(500),
  config_schema JSON NULL,                   -- Schema configurazione
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0
);
```

**Schema `config_schema`**:
```json
{
  "theme": {
    "primary_color": "#3B82F6",
    "secondary_color": "#1E40AF",
    "accent_color": "#60A5FA"
  },
  "typography": {
    "font_family": "Inter, system-ui, sans-serif",
    "base_font_size": "16px",
    "h1_size": "48px"
  },
  "layout": {
    "max_width": "1200px",
    "spacing": "comfortable",
    "border_radius": "8px"
  }
}
```

### Integrazione con Tabelle Esistenti

#### `dm_files` (Storage Documentale)
```sql
-- Utilizzo esistente per immagini website
SELECT * FROM dm_files
WHERE id_ditta = ?
  AND entita_tipo = 'WEBSITE_IMAGES'
  AND categoria IN ('logo', 'banner', 'gallery', 'prodotti');
```

#### `dm_allegati_link` (Collegamenti Entità)
```sql
-- Collegamenti immagini → siti web/pagine
SELECT * FROM dm_allegati_link
WHERE entita_tipo = 'WEBSITE_IMAGES'
  AND id_entita = ?; -- id_sito_web o id_pagina
```

#### `catalogo_prodotti` (Catalogo Esistente)
```sql
-- Prodotti per sito web specifico
SELECT cp.* FROM catalogo_prodotti cp
JOIN siti_web_aziendali sw ON cp.id_ditta = sw.id_ditta
WHERE sw.id = ?
  AND cp.is_active = 1
  AND cp.foto_principale IS NOT NULL;
```

---

## 🔌 API Documentation

### Authentication Headers
```javascript
// Tutte le richieste richiedono JWT token
headers: {
  'Authorization': 'Bearer <jwt_token>',
  'Content-Type': 'application/json'
}
```

### Endpoints Principali

#### 1. GET `/api/website/:companyId`
**Purpose**: Recupera informazioni sito web per azienda

```javascript
// Request
GET /api/website/123

// Response (200 OK)
{
  "success": true,
  "data": {
    "id": 45,
    "id_ditta": 123,
    "subdomain": "aziendeabc",
    "domain_status": "active",
    "site_title": "Aziende ABC - Soluzioni Innovative",
    "template_id": 1,
    "theme_config": {
      "primary_color": "#3B82F6",
      "font_family": "Inter, sans-serif"
    },
    "enable_catalog": true,
    "logo_url": "/uploads/logo-aziendeabc.png",
    "created_at": "2025-12-05T10:00:00Z"
  }
}

// Error (404 Not Found)
{
  "success": false,
  "error": "Website not found for company"
}
```

#### 2. POST `/api/website/create`
**Purpose**: Crea nuovo sito web per azienda

```javascript
// Request
POST /api/website/create
{
  "id_ditta": 123,
  "site_title": "Aziende ABC",
  "template_id": 1,
  "enable_catalog": true
}

// Response (201 Created)
{
  "success": true,
  "data": {
    "id": 46,
    "subdomain": "aziendeabc",
    "domain_status": "pending",
    "published_url": "https://aziendeabc.operocloud.it"
  }
}

// Error (409 Conflict)
{
  "success": false,
  "error": "Website already exists for this company"
}
```

#### 3. GET `/api/website/:websiteId/pages`
**Purpose**: Lista pagine sito web

```javascript
// Request
GET /api/website/45/pages

// Response
{
  "success": true,
  "data": [
    {
      "id": 101,
      "slug": "home",
      "titolo": "Home Page",
      "is_published": true,
      "menu_order": 0,
      "updated_at": "2025-12-05T14:30:00Z"
    },
    {
      "id": 102,
      "slug": "chi-siamo",
      "titolo": "Chi Siamo",
      "is_published": true,
      "menu_order": 1
    }
  ]
}
```

#### 4. POST `/api/website/:websiteId/pages`
**Purpose**: Crea nuova pagina

```javascript
// Request
POST /api/website/45/pages
{
  "slug": "contatti",
  "titolo": "Contatti",
  "contenuto_json": {
    "sections": [
      {
        "type": "contact_form",
        "title": "Contattaci",
        "fields": ["name", "email", "message"]
      }
    ]
  },
  "meta_title": "Contatti - Aziende ABC",
  "is_published": false
}

// Response (201 Created)
{
  "success": true,
  "data": {
    "id": 103,
    "slug": "contatti",
    "preview_url": "https://aziendeabc.operocloud.it/contatti?preview=true"
  }
}
```

#### 5. GET `/api/website/:websiteId/images`
**Purpose**: Immagini disponibili per il sito

```javascript
// Request
GET /api/website/45/images?categoria=banner

// Response
{
  "success": true,
  "data": [
    {
      "id": 1001,
      "nome_file": "banner-home.jpg",
      "url_file": "https://s3.operocloud.it/websites/banner-home.jpg",
      "categoria": "banner",
      "dimensione_file": 245760,
      "created_at": "2025-12-01T09:15:00Z"
    }
  ]
}
```

#### 6. GET `/api/website/:websiteId/catalog-settings`
**Purpose**: Configurazione catalogo prodotti

```javascript
// Request
GET /api/website/45/catalog-settings

// Response
{
  "success": true,
  "data": {
    "enable_catalog": true,
    "show_prices": true,
    "show_stock": true,
    "layout": "grid",
    "products_per_page": 12,
    "featured_categories": [1, 3, 5],
    "stats": {
      "total_products": 156,
      "available_products": 142,
      "categories_count": 8
    }
  }
}
```

### Error Response Standard
```javascript
{
  "success": false,
  "error": "Error message description",
  "code": "ERROR_CODE",
  "details": {
    "field": "validation_error_details"
  }
}
```

---

## 🎨 Frontend Architecture

### Component Structure

#### 1. `WebsiteBuilder.js` (Main Orchestrator)
```javascript
// State management con React hooks
const [websiteData, setWebsiteData] = useState(null);
const [activeTab, setActiveTab] = useState('overview');
const [autoSaveStatus, setAutoSaveStatus] = useState('saved');

// Auto-save con debounce
useEffect(() => {
  const timer = setTimeout(() => {
    if (hasChanges) {
      handleAutoSave();
    }
  }, 2000);
  return () => clearTimeout(timer);
}, [websiteData, hasChanges]);

// Tab navigation system
const tabs = [
  { id: 'overview', label: 'Panoramica', icon: 'gauge' },
  { id: 'pages', label: 'Pagine Statiche', icon: 'file-text' },
  { id: 'template', label: 'Template', icon: 'palette' },
  { id: 'images', label: 'Immagini', icon: 'image' },
  { id: 'catalog', label: 'Catalogo', icon: 'shopping-bag' },
  { id: 'settings', label: 'Impostazioni', icon: 'cog' }
];
```

**Key Features**:
- Auto-save every 2 seconds on changes
- Real-time preview functionality
- Integration with AllegatiManager for images
- Progress tracking and status indicators

#### 2. `StaticPagesManager.js` (Page Builder)
```javascript
// Page templates predefined
const pageTemplates = {
  'home': {
    name: 'Home Page',
    sections: ['hero', 'services', 'testimonials', 'cta'],
    defaultContent: {
      hero: {
        title: 'Benvenuti in {{company_name}}',
        subtitle: 'La tua soluzione di fiducia'
      }
    }
  },
  'chi-siamo': {
    name: 'Chi Siamo',
    sections: ['company_story', 'team', 'values', 'mission']
  }
};

// Drag & drop implementation
const handleSectionReorder = (dragIndex, hoverIndex) => {
  const draggedSection = sections[dragIndex];
  const newSections = [...sections];
  newSections.splice(dragIndex, 1);
  newSections.splice(hoverIndex, 0, draggedSection);
  setSections(newSections);
};
```

**Features**:
- Template-based page creation
- Drag & drop section editor
- JSON content structure
- SEO optimization tools
- Real-time preview

#### 3. `TemplateCustomizer.js` (Visual Editor)
```javascript
// Color schemes predefined
const colorSchemes = {
  professional: {
    primary: '#3B82F6',
    secondary: '#1E40AF',
    accent: '#60A5FA'
  },
  nature: {
    primary: '#10B981',
    secondary: '#047857',
    accent: '#34D399'
  }
};

// Real-time preview update
const updateThemePreview = (property, value) => {
  setThemeConfig(prev => ({
    ...prev,
    [property]: value
  }));

  // Aggiorna CSS variables per preview
  document.documentElement.style.setProperty(`--theme-${property}`, value);
};
```

**Features**:
- 6 predefined color schemes
- 10 font family options
- Custom color picker
- Live preview
- CSS variable injection

#### 4. `ImageGalleryManager.js` (Image Management)
```javascript
// AllegatiManager integration
const openAllegatiManager = () => {
  setAllegatiManagerOpen(true);
  setAllegatiManagerConfig({
    id_ditta: websiteData.id_ditta,
    entita_tipo: 'WEBSITE_IMAGES',
    categoria: 'gallery',
    maxFiles: 20,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    onSelect: handleImageSelection
  });
};

// Image categorization
const imageCategories = {
  'logo': { label: 'Logo', maxSize: 2, required: true },
  'banner': { label: 'Banner', maxSize: 5 },
  'gallery': { label: 'Galleria', maxSize: 50 },
  'prodotti': { label: 'Prodotti', maxSize: 200 }
};
```

**Features**:
- Integration with existing dm_files
- Automatic image categorization
- Size optimization and validation
- S3 storage coordination

#### 5. `CatalogManager.js` (Product Integration)
```javascript
// Real-time product sync
const syncCatalogProducts = async () => {
  const response = await api.get(`/website/${websiteId}/catalog-products`);
  const { products, categories, stats } = response.data;

  setCatalogData({
    products: products.map(p => ({
      id: p.id,
      name: p.nome_articolo,
      price: p.prezzo_vendita,
      image: p.foto_principale,
      category: p.nome_categoria,
      available: p.quantita_disponita > 0
    })),
    categories,
    stats
  });
};

// Catalog configuration
const catalogSettings = {
  show_prices: true,
  show_stock: true,
  layout: 'grid', // grid, list, masonry
  products_per_page: 12,
  featured_categories: [],
  enable_search: true,
  enable_filters: true
};
```

**Features**:
- Real-time sync with `catalogo_prodotti`
- Image integration with dm_files
- Category management
- Layout configuration

### State Management Pattern

```javascript
// Global state using React Context
const WebsiteContext = createContext();

export const WebsiteProvider = ({ children }) => {
  const [state, dispatch] = useReducer(websiteReducer, initialState);

  return (
    <WebsiteContext.Provider value={{ state, dispatch }}>
      {children}
    </WebsiteContext.Provider>
  );
};

// Reducer for complex state updates
const websiteReducer = (state, action) => {
  switch (action.type) {
    case 'SET_WEBSITE_DATA':
      return { ...state, websiteData: action.payload };
    case 'UPDATE_THEME_CONFIG':
      return {
        ...state,
        websiteData: {
          ...state.websiteData,
          theme_config: { ...state.websiteData.theme_config, ...action.payload }
        }
      };
    default:
      return state;
  }
};
```

---

## 🔐 Security Architecture

### Multi-Level Authentication

#### 1. App.operocloud.it (Multi-Company Access)
```javascript
// JWT token con multi-company support
const multiCompanyToken = {
  id_utente: 123,
  username: "mario.rossi",
  companies: [
    { id_ditta: 1, nome: "Azienda A", role: "admin" },
    { id_ditta: 2, nome: "Azienda B", role: "user" }
  ],
  current_company: { id_ditta: 1, role: "admin" },
  permissions: ["website_view", "website_edit", "website_publish"]
};
```

#### 2. Subdomain.operocloud.it (Single-Company Access)
```javascript
// JWT token single-company con subdomain context
const singleCompanyToken = {
  id_utente: 123,
  id_ditta: 1,
  subdomain: "aziendaabc",
  role: "admin",
  permissions: ["website_view", "website_edit", "website_publish"]
};
```

### Permission System

```javascript
const PERMISSIONS = {
  WEBSITE_VIEW: 'website_view',        // Visualizza sito web
  WEBSITE_EDIT: 'website_edit',        // Modifica contenuti
  WEBSITE_PUBLISH: 'website_publish',  // Pubblica modifiche
  WEBSITE_ADMIN: 'website_admin',      // Amministrazione completa
  CATALOG_MANAGE: 'catalog_manage',    // Gestione catalogo
  IMAGES_UPLOAD: 'images_upload'       // Upload immagini
};

// Permission checking middleware
const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user.permissions.includes(requiredPermission)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }
    next();
  };
};
```

### Data Isolation

```javascript
// Automatic data filtering by company
const companyFilter = (req, res, next) => {
  const userCompany = req.user.id_ditta;
  const requestedCompany = parseInt(req.params.companyId);

  if (userCompany !== requestedCompany) {
    return res.status(403).json({
      success: false,
      error: 'Access denied: Invalid company'
    });
  }

  // Aggiungi query filter automatico
  req.query.companyFilter = userCompany;
  next();
};

// Application in routes
router.get('/website/:companyId', companyFilter, async (req, res) => {
  const website = await knex('siti_web_aziendali')
    .where('id_ditta', req.query.companyFilter)
    .first();
  // ...
});
```

### Input Validation & Sanitization

```javascript
// Joi validation schemas
const websiteCreateSchema = Joi.object({
  id_ditta: Joi.number().integer().positive().required(),
  site_title: Joi.string().min(1).max(255).required(),
  template_id: Joi.number().integer().positive().default(1),
  enable_catalog: Joi.boolean().default(false)
});

const pageCreateSchema = Joi.object({
  slug: Joi.string().pattern(/^[a-z0-9-]+$/).required(),
  titolo: Joi.string().min(1).max(255).required(),
  contenuto_json: Joi.object().optional(),
  meta_title: Joi.string().max(255).optional(),
  is_published: Joi.boolean().default(false)
});

// Validation middleware
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    req.body = value;
    next();
  };
};
```

### File Upload Security

```javascript
// File upload validation
const fileUploadConfig = {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 20 // Max 20 files per request
  },
  fileFilter: (req, file, cb) => {
    // Allowed MIME types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  },
  storage: s3Storage // S3 configuration
};

// Virus scanning integration
const scanFile = async (file) => {
  try {
    const scanResult = await virusScanner.scan(file.path);
    if (scanResult.infected) {
      throw new Error('File infected with malware');
    }
    return scanResult.clean;
  } catch (error) {
    throw new Error(`Security scan failed: ${error.message}`);
  }
};
```

---

## 📱 Mobile Optimization

### Responsive Design Strategy

#### 1. Tailwind CSS Breakpoints
```javascript
// Breakpoint configuration
const breakpoints = {
  sm: '640px',   // Small tablets
  md: '768px',   // Tablets
  lg: '1024px',  // Small desktops
  xl: '1280px',  // Desktops
  '2xl': '1536px' // Large desktops
};

// Responsive grid systems
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Content adapts to screen size */}
</div>

// Mobile-first approach
<div className="p-4 sm:p-6 lg:p-8">
  {/* Padding increases on larger screens */}
</div>
```

#### 2. Touch-Optimized Interactions
```javascript
// Touch-friendly button sizes
<button className="min-h-[44px] min-w-[44px] px-4 py-2 active:scale-95">
  {/* 44x44px minimum touch target */}
</button>

// Swipe gestures for image galleries
const swipeHandlers = useSwipe({
  onSwipedLeft: () => nextImage(),
  onSwipedRight: () => previousImage(),
  preventDefaultTouchmoveEvent: true,
  trackMouse: true // Also works with mouse
});

// Pull-to-refresh functionality
const pullToRefresh = usePullToRefresh({
  onRefresh: async () => {
    await refreshData();
  },
  threshold: 80 // Pull down 80px to trigger refresh
});
```

#### 3. Mobile Performance Optimizations
```javascript
// Lazy loading for images
const LazyImage = ({ src, alt, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className="relative">
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          {...props}
        />
      )}
    </div>
  );
};

// Optimized bundle loading
const loadMobileComponents = () => {
  if (window.innerWidth < 768) {
    import('./components/MobileOptimized')
      .then(module => {
        // Load mobile-specific components
      });
  }
};
```

---

## 🚀 Performance Optimization

### Database Optimization

#### 1. Indexing Strategy
```sql
-- Primary indexes for performance
CREATE INDEX idx_siti_web_ditta ON siti_web_aziendali(id_ditta);
CREATE INDEX idx_pagine_sito_web_published ON pagine_sito_web(is_published, id_sito_web);
CREATE INDEX idx_dm_files_entita ON dm_files(entita_tipo, id_ditta, categoria);

-- Composite indexes for common queries
CREATE INDEX idx_catalogo_prodotti_active_categoria
ON catalogo_prodotti(id_ditta, is_active, id_categoria);

-- Full-text search for content
CREATE FULLTEXT INDEX ft_articoli_blog_contenuto
ON articoli_blog(titolo, contenuto);
```

#### 2. Query Optimization
```javascript
// Optimized website data loading
const getWebsiteWithData = async (websiteId) => {
  // Use JOIN instead of multiple queries
  const website = await knex('siti_web_aziendali AS sw')
    .select([
      'sw.*',
      'd.ragione_sociale',
      't.nome_template',
      't.config_schema'
    ])
    .leftJoin('ditte AS d', 'sw.id_ditta', 'd.id')
    .leftJoin('template_siti_web AS t', 'sw.template_id', 't.id')
    .where('sw.id', websiteId)
    .first();

  // Parallel loading of related data
  const [pagesCount, articlesCount, stats] = await Promise.all([
    knex('pagine_sito_web').where('id_sito_web', websiteId).count('* as count'),
    knex('articoli_blog').where('id_sito_web', websiteId).count('* as count'),
    getWebsiteStats(websiteId)
  ]);

  return {
    ...website,
    stats: {
      pages: parseInt(pagesCount[0].count),
      articles: parseInt(articlesCount[0].count),
      ...stats
    }
  };
};

// Efficient product catalog loading
const getCatalogProducts = async (websiteId, options = {}) => {
  const { page = 1, limit = 12, category = null } = options;
  const offset = (page - 1) * limit;

  let query = knex('catalogo_prodotti AS cp')
    .select([
      'cp.id',
      'cp.nome_articolo',
      'cp.prezzo_vendita',
      'cp.quantita_disponita',
      'cp.descrizione_breve',
      'df.url_file AS foto_principale'
    ])
    .join('siti_web_aziendali AS sw', 'cp.id_ditta', 'sw.id_ditta')
    .leftJoin('dm_files AS df', 'cp.foto_principale', 'df.id')
    .where('sw.id', websiteId)
    .where('cp.is_active', 1);

  if (category) {
    query = query.where('cp.id_categoria', category);
  }

  return query
    .orderBy('cp.created_at', 'desc')
    .limit(limit)
    .offset(offset);
};
```

### Caching Strategy

#### 1. Redis Caching Layer
```javascript
// Cache configuration
const cacheConfig = {
  website_data: { ttl: 3600 },      // 1 hour
  pages_content: { ttl: 7200 },     // 2 hours
  catalog_products: { ttl: 1800 },  // 30 minutes
  images_metadata: { ttl: 86400 }   // 24 hours
};

// Cache middleware
const cacheMiddleware = (keyPrefix, ttl = 3600) => {
  return async (req, res, next) => {
    const cacheKey = `${keyPrefix}:${JSON.stringify(req.params)}:${JSON.stringify(req.query)}`;

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }

      // Override res.json to cache response
      const originalJson = res.json;
      res.json = function(data) {
        redis.setex(cacheKey, ttl, JSON.stringify(data));
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache error:', error);
      next();
    }
  };
};

// Application in routes
router.get('/website/:websiteId',
  cacheMiddleware('website_data', 3600),
  getWebsiteHandler
);
```

#### 2. CDN Integration
```javascript
// CDN configuration for static assets
const cdnConfig = {
  baseUrl: 'https://cdn.operocloud.it',
  assetPaths: {
    images: '/websites/images',
    css: '/websites/css',
    js: '/websites/js'
  }
};

// Automatic CDN URL generation
const getCdnUrl = (path, type = 'images') => {
  return `${cdnConfig.baseUrl}${cdnConfig.assetPaths[type]}${path}`;
};

// Image optimization with CDN
const optimizeImage = (imageUrl, options = {}) => {
  const { width, height, quality = 80, format = 'auto' } = options;
  const url = new URL(imageUrl);

  url.searchParams.set('w', width);
  url.searchParams.set('h', height);
  url.searchParams.set('q', quality);
  url.searchParams.set('f', format);

  return url.toString();
};
```

### Frontend Performance

#### 1. Code Splitting
```javascript
// Dynamic imports for large components
const WebsiteBuilder = lazy(() => import('./components/WebsiteBuilder'));
const TemplateCustomizer = lazy(() => import('./components/website/TemplateCustomizer'));
const CatalogManager = lazy(() => import('./components/website/CatalogManager'));

// Route-based code splitting
const routes = [
  {
    path: '/website-builder',
    component: lazy(() => import('./pages/WebsiteBuilder'))
  },
  {
    path: '/website-builder/:id',
    component: lazy(() => import('./pages/WebsiteEditor'))
  }
];

// Component lazy loading with Suspense
const App = () => (
  <Suspense fallback={<div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
  </div>}>
    <Router>
      <Routes>
        {routes.map(route => (
          <Route key={route.path} path={route.path} element={<route.component />} />
        ))}
      </Routes>
    </Router>
  </Suspense>
);
```

#### 2. Bundle Optimization
```javascript
// Webpack configuration for optimization
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          enforce: true
        },
        website: {
          test: /[\\/]src[\\/]components[\\/]website[\\/]/,
          name: 'website',
          chunks: 'all'
        }
      }
    }
  },

  // Tree shaking for unused code
  mode: 'production',
  devtool: 'source-map',

  // Image optimization
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|webp)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'images',
              name: '[name].[contenthash].[ext]'
            }
          },
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: { quality: 80 },
              pngquant: { quality: [0.65, 0.8] },
              webp: { quality: 80 }
            }
          }
        ]
      }
    ]
  }
};
```

---

## 🔧 Development Workflow

### Setup Instructions

#### 1. Database Setup
```bash
# Esegui migration database
mysql -u root -p opero_db < migrations/2025120501_create_website_tables.sql

# Verifica tabelle create
mysql -u root -p opero_db -e "SHOW TABLES LIKE '%website%';"
```

#### 2. Backend Setup
```bash
# Installa dipendenze backend
cd server
npm install express cors helmet morgan knex mysql2 redis multer

# Configura variabili ambiente
cp .env.example .env
# Edit .env con configurazioni database e redis

# Avvia server in development
npm run dev
```

#### 3. Frontend Setup
```bash
# Installa dipendenze frontend
cd opero-frontend
npm install @tailwindcss/typography react-beautiful-dnd react-helmet-async

# Configura Tailwind CSS
npx tailwindcss init -p

# Avvia development server
npm start
```

### Git Workflow

#### 1. Branch Strategy
```bash
# Feature branch per nuova funzionalità
git checkout -b feature/website-builder-template-customizer

# Development commits
git add .
git commit -m "feat: add template customizer with color schemes"

# Push e pull request
git push origin feature/website-builder-template-customizer
# Crea PR su GitHub/GitLab
```

#### 2. Commit Convention
```bash
# Format: type(scope): description
# Types: feat, fix, docs, style, refactor, test, chore

feat(website): add drag-and-drop page builder
fix(api): resolve website creation validation error
docs(readme): update installation instructions
style(css): improve mobile responsiveness
refactor(db): optimize catalog products query
test(website): add unit tests for template customizer
chore(deps): update react-beautiful-dnd to latest version
```

### Testing Strategy

#### 1. Backend Testing
```javascript
// Jest + Supertest per API testing
const request = require('supertest');
const app = require('../server');

describe('Website API', () => {
  describe('GET /api/website/:companyId', () => {
    it('should return website data for valid company', async () => {
      const response = await request(app)
        .get('/api/website/123')
        .set('Authorization', 'Bearer valid_jwt_token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('subdomain');
    });

    it('should return 404 for non-existent website', async () => {
      const response = await request(app)
        .get('/api/website/999')
        .set('Authorization', 'Bearer valid_jwt_token')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
```

#### 2. Frontend Testing
```javascript
// React Testing Library per component testing
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WebsiteBuilder from '../WebsiteBuilder';

describe('WebsiteBuilder', () => {
  it('should render website overview tabs', () => {
    render(<WebsiteBuilder />);

    expect(screen.getByText('Panoramica')).toBeInTheDocument();
    expect(screen.getByText('Pagine Statiche')).toBeInTheDocument();
    expect(screen.getByText('Template')).toBeInTheDocument();
  });

  it('should switch tabs when clicked', async () => {
    render(<WebsiteBuilder />);

    const templateTab = screen.getByText('Template');
    fireEvent.click(templateTab);

    await waitFor(() => {
      expect(screen.getByText('Personalizza Template')).toBeInTheDocument();
    });
  });
});
```

#### 3. E2E Testing
```javascript
// Cypress per end-to-end testing
describe('Website Builder E2E', () => {
  beforeEach(() => {
    cy.login('test@operocloud.it', 'password');
    cy.visit('/website-builder');
  });

  it('should create new website', () => {
    cy.get('[data-testid="create-website-btn"]').click();
    cy.get('[data-testid="website-title-input"]').type('Test Website');
    cy.get('[data-testid="template-select"]').select('Professional');
    cy.get('[data-testid="create-submit-btn"]').click();

    cy.get('[data-testid="success-message"]').should('be.visible');
    cy.url().should('include', '/website-builder/');
  });

  it('should customize theme colors', () => {
    cy.get('[data-testid="template-tab"]').click();
    cy.get('[data-testid="color-scheme-nature"]').click();

    cy.get('[data-testid="preview-section"]')
      .should('have.css', 'background-color', 'rgb(16, 185, 129)');
  });
});
```

### Deployment Process

#### 1. Production Deployment
```bash
# 1. Build frontend
cd opero-frontend
npm run build

# 2. Database migration (in production)
mysql -u root -p opero_production < migrations/2025120501_create_website_tables.sql

# 3. Deploy backend
cd ../server
npm ci --production
pm2 reload opero-server

# 4. Update nginx configuration
sudo nginx -t
sudo nginx -s reload
```

#### 2. Docker Deployment
```dockerfile
# Dockerfile for backend
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --production

COPY . .
EXPOSE 3000

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
      - REDIS_HOST=redis
    depends_on:
      - mysql
      - redis

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: opero_production
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  mysql_data:
  redis_data:
```

---

## 📊 Monitoring & Analytics

### Application Monitoring

#### 1. Error Tracking
```javascript
// Sentry integration for error tracking
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: 'https://your-sentry-dsn',
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1
});

// Error handling middleware
app.use((err, req, res, next) => {
  Sentry.captureException(err);

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal Server Error'
    : err.message;

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});
```

#### 2. Performance Monitoring
```javascript
// APM integration (New Relic/DataDog)
const apm = require('elastic-apm-node').start({
  serviceName: 'opero-website-builder',
  secretToken: process.env.APM_SECRET_TOKEN,
  serverUrl: process.env.APM_SERVER_URL,
  environment: process.env.NODE_ENV
});

// Custom metrics tracking
const trackMetric = (name, value, tags = {}) => {
  apm.setCustomContext({
    website_builder: {
      [name]: value,
      ...tags
    }
  });
};

// Usage in API endpoints
router.post('/website/create', async (req, res) => {
  const start = Date.now();

  try {
    const website = await createWebsite(req.body);
    trackMetric('website_creation_time', Date.now() - start, { success: true });
    res.json({ success: true, data: website });
  } catch (error) {
    trackMetric('website_creation_time', Date.now() - start, { success: false });
    throw error;
  }
});
```

#### 3. Website Analytics
```javascript
// Website visitor tracking
const trackWebsiteVisit = async (websiteId, visitData) => {
  const { ip, userAgent, referrer, page } = visitData;

  // Increment daily stats
  await knex('website_analytics')
    .insert({
      id_sito_web: websiteId,
      data_giorno: new Date().toISOString().split('T')[0],
      visite_totali: 1,
      visite_uniche: 1,
      visualizzazioni_pagina: 1
    })
    .onConflict(['id_sito_web', 'data_giorno'])
    .merge({
      visite_totali: knex.raw('visite_totali + 1'),
      visualizzazioni_pagina: knex.raw('visualizzazioni_pagina + 1')
    });

  // Log visit details
  await knex('website_activity_log').insert({
    id_sito_web: websiteId,
    azione: 'visit',
    tipo_oggetto: 'page',
    descrizione_oggetto: page,
    ip_address: ip,
    user_agent: userAgent,
    dati_dopo: JSON.stringify({ referrer, timestamp: new Date() })
  });
};
```

---

## 🚀 Future Enhancements

### Phase 2: E-commerce Integration
```javascript
// Shopping cart functionality
const cartManager = {
  addToCart: (productId, quantity) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '{}');
    cart[productId] = (cart[productId] || 0) + quantity;
    localStorage.setItem('cart', JSON.stringify(cart));
  },

  getCart: () => {
    return JSON.parse(localStorage.getItem('cart') || '{}');
  },

  clearCart: () => {
    localStorage.removeItem('cart');
  }
};

// Payment gateway integration
const paymentProcessors = {
  stripe: require('./payments/stripe'),
  paypal: require('./payments/paypal'),
  credit_card: require('./payments/credit-card')
};

// Order management
const createOrder = async (websiteId, orderData) => {
  const { items, customer, shipping, payment } = orderData;

  const order = await knex('ordini').insert({
    id_sito_web: websiteId,
    id_ditta: orderData.companyId,
    stato_ordine: 'pending',
    totale_ordine: calculateTotal(items),
    dati_cliente: JSON.stringify(customer),
    dati_spedizione: JSON.stringify(shipping),
    dati_pagamento: JSON.stringify(payment)
  });

  return order;
};
```

### Phase 3: Multi-language Support
```javascript
// Multi-language system
const i18nConfig = {
  defaultLanguage: 'it',
  supportedLanguages: ['it', 'en', 'de', 'fr'],
  fallbackLanguage: 'en'
};

// Database schema for multi-language
const multilingualTables = `
CREATE TABLE pagine_sito_web_traduzioni (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_pagina INT NOT NULL,
  lingua VARCHAR(5) NOT NULL,
  titolo VARCHAR(255) NOT NULL,
  contenuto JSON NULL,
  meta_title VARCHAR(255),
  meta_description TEXT,

  FOREIGN KEY (id_pagina) REFERENCES pagine_sito_web(id) ON DELETE CASCADE,
  UNIQUE KEY unique_page_language (id_pagina, lingua)
);

CREATE TABLE articoli_blog_traduzioni (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_articolo INT NOT NULL,
  lingua VARCHAR(5) NOT NULL,
  titolo VARCHAR(255) NOT NULL,
  contenuto LONGTEXT NULL,
  meta_title VARCHAR(255),
  meta_description TEXT,

  FOREIGN KEY (id_articolo) REFERENCES articoli_blog(id) ON DELETE CASCADE,
  UNIQUE KEY unique_article_language (id_articolo, lingua)
);
`;
```

### Phase 4: AI-Powered Features
```javascript
// AI content generation
const generateContent = async (type, params) => {
  switch (type) {
    case 'blog_post':
      return await aiService.generateBlogPost({
        topic: params.topic,
        tone: params.tone,
        length: params.length,
        keywords: params.keywords
      });

    case 'product_description':
      return await aiService.generateProductDescription({
        product: params.product,
        features: params.features,
        targetAudience: params.targetAudience
      });

    case 'seo_meta':
      return await aiService.generateSEOMeta({
        content: params.content,
        targetKeywords: params.keywords
      });
  }
};

// Automated SEO optimization
const optimizeSEO = async (pageData) => {
  const suggestions = await aiService.analyzeSEO({
    title: pageData.title,
    content: pageData.content,
    currentMeta: pageData.metaTags
  });

  return {
    optimizedTitle: suggestions.title,
    optimizedDescription: suggestions.description,
    keywordDensity: suggestions.keywordDensity,
    readabilityScore: suggestions.readabilityScore,
    recommendations: suggestions.recommendations
  };
};
```

---

## 📞 Support & Troubleshooting

### Common Issues

#### 1. Website Not Loading
```bash
# Check website status
SELECT subdomain, domain_status FROM siti_web_aziendali WHERE id = ?;

# Check nginx configuration
nginx -t
sudo nginx -s reload

# Check application logs
tail -f /var/log/opero/website-builder.log
```

#### 2. Images Not Displaying
```bash
# Check dm_files permissions
SELECT COUNT(*) FROM dm_files
WHERE id_ditta = ? AND entita_tipo = 'WEBSITE_IMAGES';

# Verify S3 connectivity
aws s3 ls s3://operocloud-websites/

# Check CDN configuration
curl -I https://cdn.operocloud.it/websites/images/test.jpg
```

#### 3. Performance Issues
```sql
-- Check slow queries
SELECT * FROM mysql.slow_log WHERE start_time > DATE_SUB(NOW(), INTERVAL 1 HOUR);

-- Analyze query performance
EXPLAIN SELECT * FROM catalogo_prodotti
WHERE id_ditta = ? AND is_active = 1
ORDER BY created_at DESC LIMIT 20;
```

### Debug Mode
```javascript
// Enable debug mode
const DEBUG = process.env.NODE_ENV === 'development' || process.env.DEBUG_WEBSITE === 'true';

if (DEBUG) {
  console.log('Website Builder Debug Mode Enabled');
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Database:', process.env.DB_HOST);
  console.log('Redis:', process.env.REDIS_HOST);

  // Enable verbose logging
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`, {
      query: req.query,
      body: req.body,
      headers: req.headers
    });
    next();
  });
}
```

### Health Check Endpoints
```javascript
// Application health check
router.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0',

    checks: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      storage: await checkStorage()
    }
  };

  const isHealthy = Object.values(health.checks).every(check => check.status === 'ok');
  const statusCode = isHealthy ? 200 : 503;

  res.status(statusCode).json(health);
});

const checkDatabase = async () => {
  try {
    await knex.raw('SELECT 1');
    return { status: 'ok', responseTime: Date.now() - start };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
};
```

---

## 📚 Team Guidelines

### Code Review Process

#### 1. Pull Request Template
```markdown
## Description
Breve descrizione delle modifiche implementate

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Performance impact considered
```

#### 2. Review Guidelines
```javascript
// Code quality checklist
const reviewChecklist = {
  security: [
    'Input validation implemented',
    'SQL injection prevention',
    'XSS prevention',
    'Authentication/authorization checks'
  ],

  performance: [
    'Database queries optimized',
    'Indexing strategy implemented',
    'Caching considered',
    'Bundle size impact analyzed'
  ],

  maintainability: [
    'Code is readable and documented',
    'Components are reusable',
    'Error handling implemented',
    'Logging added where appropriate'
  ]
};
```

### Development Standards

#### 1. Code Style (ESLint Configuration)
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'react-app',
    'react-app/jest'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error'
  }
};
```

#### 2. Naming Conventions
```javascript
// Files: kebab-case
// - website-builder.js
// - static-pages-manager.js
// - template-customizer.js

// Components: PascalCase
// - WebsiteBuilder
// - StaticPagesManager
// - TemplateCustomizer

// Functions: camelCase
// - getWebsiteData()
// - updateThemeConfig()
// - handleImageUpload()

// Constants: UPPER_SNAKE_CASE
// - API_ENDPOINTS
// - DEFAULT_TEMPLATE_ID
// - MAX_FILE_SIZE

// Database: snake_case
// - siti_web_aziendali
// - pagine_sito_web
// - template_siti_web
```

---

## 🎯 Conclusion

Il Website Builder System rappresenta un'evoluzione significativa per la piattaforma Opero, consentendo ad ogni azienda cliente di avere una presenza web professionale e completamente integrata con i sistemi esistenti.

### Success Metrics
- **Adoption Rate**: Percentuale di aziende che attivano il sito web
- **Customization Level**: Grado di personalizzazione dei template
- **Performance Index**: Velocità di caricamento e uptime
- **Integration Success**: Correttezza integrazione con catalogo prodotti

### Next Steps
1. **Phase 1**: Roll-out completo con template e pagine statiche
2. **Phase 2**: Implementazione e-commerce completo
3. **Phase 3**: Multi-language support
4. **Phase 4**: AI-powered content generation

Questo sistema posiziona Opero come leader nel mercato dei gestionali integrati, offrendo valore aggiunto attraverso soluzioni web innovative e scalabili.

---

**Documento Version**: 1.0
**Data**: 2025-12-05
**Team**: Sviluppo Opero
**Contact**: tech@operocloud.it