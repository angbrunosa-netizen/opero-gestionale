# Template Page Builder - Documentazione Tecnica

**Data:** 10 Dicembre 2025
**Versione:** 3.0
**Autore:** Team Sviluppo Opero

---

## 📋 Panoramica del Progetto

Il **Template Page Builder** è un sistema semplificato per la creazione di pagine web da template predefiniti, completamente integrato con l'ecosistema Opero.

### Obiettivi Principali
- ✅ **Semplificazione architettura**: Da 694 a 591 linee nel componente principale
- ✅ **Focus su template generation**: Creazione pagine da template con sezioni modulari
- ✅ **Componenti specializzati**: Immagine, Blog, Maps, Social, Galleria
- ✅ **Integrazione Next.js**: Preparato per rendering statico
- ✅ **Rimozione codice non necessario**: Pulizia completa del sistema

---

## 🏗️ Architettura del Sistema

### Stack Tecnologico
```
Frontend (React/Next.js)
├── React 18+ con Hooks
├── Tailwind CSS per styling
├── Heroicons React per icone
├── File system-based routing (Next.js)
└── Static Site Generation (SSG)

Backend (Node.js/Express)
├── API REST per gestione dati
├── MySQL per persistenza
└── Integration con sistema Opero esistente

Component Architecture
├── WebsiteBuilderUNIFIED (Main entry point)
├── TemplatePageBuilder (Core builder)
├── Sections/ (Componenti modulari)
│   ├── ImageSection
│   ├── BlogSection
│   ├── MapsSection
│   ├── SocialSection
│   └── GallerySection
└── Utils (Helper functions)
```

### Flusso Architetturale
```
1. User Selection
   ├── Template predefinito selection
   └── Custom template creation

2. Page Building
   ├── Drag & drop sections
   ├── Real-time configuration
   └── Live preview

3. Data Persistence
   ├── JSON structure storage
   ├── MySQL integration
   └── API endpoint calls

4. Static Generation
   ├── Next.js SSG integration
   ├── HTML output generation
   └── SEO optimization
```

---

## 📁 Struttura File System

```
src/components/
├── WebsiteBuilderUNIFIED.js          [591 lines]
└── website/
    └── builder/
        ├── TemplatePageBuilder.js      [324 lines]
        └── sections/
            ├── ImageSection.js          [458 lines]
            ├── BlogSection.js           [567 lines]
            ├── MapsSection.js           [689 lines]
            ├── SocialSection.js         [467 lines]
            └── GallerySection.js        [834 lines]
```

### Statistiche Codice
- **File Principali**: 6 componenti
- **Linee Totali**: ~4,330 linee
- **Riduzione Dimensioni**: -14.8% vs sistema precedente
- **Componenti Specializzati**: 5 sezioni uniche

---

## 🎨 Componenti Sezioni

### 1. ImageSection - Gestione Immagini

**Funzionalità**:
- Upload immagini con drag & drop
- Layout multipli (left, right, center, background)
- Pulsanti call-to-action personalizzabili
- Effetti (parallax, zoom on hover)
- Accessibilità con alt text

**Props API**:
```javascript
{
  data: {
    imageUrl: string,
    title: string,
    subtitle: string,
    description: string,
    layout: 'left' | 'right' | 'center' | 'background',
    imageBorder: 'none' | 'rounded' | 'circle' | 'shadow',
    buttonText: string,
    buttonUrl: string,
    buttonStyle: 'primary' | 'secondary' | 'success' | 'danger',
    altText: string,
    lazyLoad: boolean,
    parallax: boolean,
    zoomOnHover: boolean
  },
  onChange: Function,
  onRemove: Function,
  onMoveUp: Function,
  onMoveDown: Function
}
```

### 2. BlogSection - Gestione Blog

**Funzionalità**:
- Layout multipli (grid, list, carousel, masonry)
- Configurazione articoli da mostrare
- Filtri per categoria e tag
- Meta informazioni (autore, data, tempo lettura)
- Integrazione API per dati real-time

**Props API**:
```javascript
{
  data: {
    title: string,
    layout: 'grid' | 'list' | 'carousel' | 'masonry',
    postsToShow: number,
    columns: number,
    sortBy: 'recent' | 'popular' | 'comments' | 'alphabetical',
    category: string,
    tags: string,
    showAuthor: boolean,
    showDate: boolean,
    showReadTime: boolean,
    showMeta: boolean,
    showReadMore: boolean,
    apiEndpoint: string
  }
}
```

### 3. MapsSection - Mappe Interattive

**Funzionalità**:
- Google Maps integration
- Geocoding automatico
- Multiple map styles
- Custom markers
- Controls configuration
- Directions e Street View

**Props API**:
```javascript
{
  data: {
    apiKey: string,
    address: string,
    latitude: number,
    longitude: number,
    zoom: number,
    mapStyle: 'default' | 'satellite' | 'hybrid' | 'terrain',
    height: string,
    markerTitle: string,
    markerDescription: string,
    markerColor: string,
    showInfoWindow: boolean,
    showDirections: boolean,
    showStreetView: boolean,
    clustering: boolean
  }
}
```

### 4. SocialSection - Integrazione Social

**Funzionalità**:
- Piattaforme multiple (Facebook, Instagram, LinkedIn, etc.)
- Layout configurabili (horizontal, vertical, grid)
- Follower count real-time
- Feed integration
- API keys configuration

**Props API**:
```javascript
{
  data: {
    platforms: string[],
    layout: 'horizontal' | 'vertical' | 'grid',
    iconStyle: 'rounded' | 'square' | 'circle' | 'outline',
    iconSize: 'small' | 'medium' | 'large' | 'xlarge',
    showFollowers: boolean,
    showFeed: boolean,
    showLikes: boolean,
    openInNewTab: boolean,
    platformConfigs: Object,
    apiKeys: Object
  }
}
```

### 5. GallerySection - Gallerie Fotografiche

**Funzionalità**:
- Layout multipli (grid, masonry, carousel)
- Effetti transizione avanzati
- Carosello con autoplay
- Lightbox integration
- Drag & drop immagini
- Lazy loading

**Props API**:
```javascript
{
  data: {
    images: Array<{
      id: string,
      url: string,
      name: string,
      caption: string,
      alt: string
    }>,
    layout: 'grid' | 'masonry' | 'carousel',
    columns: number,
    gap: 'none' | 'small' | 'medium' | 'large',
    showCaptions: boolean,
    enableLightbox: boolean,
    transition: 'fade' | 'slide' | 'zoom' | 'flip',
    autoplay: boolean,
    interval: number,
    showNavigation: boolean,
    lazyLoad: boolean
  }
}
```

---

## 🎯 Template Predefiniti

### 1. Business Landing
- **Icona**: 🏢
- **Target**: Aziende e professionisti
- **Sezioni**: 5 (Hero, Servizi, Galleria, Contatti, Social)
- **Focus**: Presentazione aziendale professionale

### 2. Portfolio Creativo
- **Icona**: 🎨
- **Target**: Designer, artisti, creativi
- **Sezioni**: 3 (Gallery Carousel, Portfolio Masonry, Social)
- **Focus**: Showcase visivo e social media

### 3. Attività Locale
- **Icona**: 🏪
- **Target**: Negozi e attività locali
- **Sezioni**: 4 (Hero, Mappa, Gallery, Social)
- **Focus**: Localizzazione e contatti

### 4. Blog Magazine
- **Icona**: 📰
- **Target**: Editori e blogger
- **Sezioni**: 3 (Articoli Recenti, Categorie, Social)
- **Focus**: Content management e engagement

---

## 🔄 Integrazione Next.js

### Generazione HTML Statico

```javascript
// TemplatePageBuilder.js - generateStaticHTML function
const generateStaticHTML = async (pageData) => {
  try {
    const response = await api.post(`/website/${websiteId}/generate-html`, pageData);
    return response.data.html;
  } catch (error) {
    console.error('Errore generazione HTML:', error);
    return null;
  }
};
```

### Struttura Pagine Next.js
```javascript
// pages/[slug].js
export async function getStaticPaths() {
  // Recupera tutte le pagine dal database
  const pages = await api.get('/website/published-pages');

  return {
    paths: pages.map(page => ({
      params: { slug: page.slug }
    })),
    fallback: false
  };
}

export async function getStaticProps({ params }) {
  // Recupera dati pagina specifica
  const page = await api.get(`/website/pages/${params.slug}`);

  return {
    props: {
      page: page.data
    }
  };
}
```

### SEO Optimization
- Meta tags dinamici
- Structured data per Google
- Sitemap automatico
- Performance con Next.js Image optimization

---

## 🔧 API Endpoints

### Pagina Management

#### GET `/api/website/:websiteId/pages`
**Recupera tutte le pagine del sito**

```javascript
// Request
GET /api/website/123/pages

// Response
{
  "success": true,
  "data": {
    "pages": [
      {
        "id": 1,
        "titolo": "Chi Siamo",
        "slug": "chi-siamo",
        "contenuto_json": "{\"sections\":[...]}",
        "is_published": true,
        "created_at": "2024-12-10T10:00:00Z"
      }
    ]
  }
}
```

#### POST `/api/website/:websiteId/pages`
**Crea nuova pagina da template**

```javascript
// Request
POST /api/website/123/pages
{
  "titolo": "Nuova Pagina",
  "slug": "nuova-pagina",
  "contenuto_json": {
    "sections": [
      {
        "id": "section-1",
        "type": "image",
        "data": { ... }
      }
    ]
  },
  "meta_title": "Nuova Pagina",
  "meta_description": "Descrizione SEO",
  "is_published": false
}

// Response
{
  "success": true,
  "data": {
    "page": {
      "id": 456,
      "slug": "nuova-pagina",
      "url": "/nuova-pagina"
    }
  }
}
```

#### POST `/api/website/:websiteId/generate-html`
**Genera HTML statico per Next.js**

```javascript
// Request
POST /api/website/123/generate-html
{
  "sections": [...],
  "metadata": {
    "title": "Pagina Esempio",
    "description": "Descrizione SEO"
  }
}

// Response
{
  "success": true,
  "data": {
    "html": "<!DOCTYPE html>...",
    "components": [...],
    "css": "..."
  }
}
```

---

## 🎛️ Stato Componenti e Props

### WebsiteBuilderUNIFIED.js

**Props**:
```javascript
{
  site: Object,           // Dati sito
  websiteId: string,      // ID sito
  onSave: Function,       // Callback salvataggio
  onCancel: Function,     // Callback annullamento
  mode: 'create' | 'edit' // Modalità
}
```

**Stati**:
```javascript
{
  site: Object,
  activeView: 'template' | 'pages',
  loading: boolean,
  saving: boolean,
  error: string | null,
  success: string | null,
  pages: Array,
  selectedTemplate: Object | null
}
```

### TemplatePageBuilder.js

**Props**:
```javascript
{
  initialTemplate: Object,     // Template iniziale
  websiteId: string,           // ID sito
  site: Object,                // Dati sito
  onSave: Function,             // Callback salvataggio
  onCancel: Function           // Callback annullamento
}
```

---

## 🚀 Performance e Ottimizzazioni

### Code Splitting
- Lazy loading dei componenti sezione
- Bundle dinamici per features
- Tree shaking per codice non utilizzato

### Lazy Loading
- Immagini con Intersection Observer
- Componenti sotto-the-fold
- API responses paginate

### Memorizzazione
- React.memo per componenti puri
- useCallback per funzioni callback
- useMemo per calcoli computazionali

### Bundle Optimization
- Webpack optimization
- Image optimization
- CSS-in-JS efficiente

---

## 🔒 Sicurezza

### Input Validation
- XSS prevention con content sanitization
- SQL injection prevention
- File upload security

### API Security
- JWT authentication
- Rate limiting
- CORS configuration

### Data Protection
- PII encryption
- GDPR compliance
- Data retention policies

---

## 📱 Mobile Optimization

### Responsive Design
- Mobile-first approach
- Touch-optimized interactions
- Viewport-based layouts

### Performance Mobile
- Lazy loading immagini
- Optimized bundle size
- Fast initial paint

---

## 🧪 Testing Strategy

### Unit Testing
- Jest + React Testing Library
- Component testing isolato
- Prop testing con mock data

### Integration Testing
- API endpoint testing
- Database integration
- Cross-component communication

### E2E Testing
- Cypress end-to-end
- User flow testing
- Performance monitoring

---

## 📚 Dipendenze del Progetto

### React Ecosystem
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-scripts": "^5.0.1"
}
```

### Styling
```json
{
  "tailwindcss": "^3.3.0",
  "@tailwindcss/typography": "^0.5.0"
}
```

### Icons
```json
{
  "@heroicons/react": "^2.0.0"
}
```

### Utilities
```json
{
  "axios": "^1.5.0",
  "date-fns": "^2.30.0",
  "classnames": "^2.3.0"
}
```

---

## 🚀 Deploy e Produzione

### Build Process
```bash
# Development
npm start

# Production build
npm run build

# Export static files
npm run export
```

### Environment Variables
```bash
# API Configuration
REACT_APP_API_URL=https://api.operocloud.it
REACT_APP_WEBSITE_API_KEY=your_api_key

# Google Maps
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_key

# Social Media APIs
REACT_APP_FACEBOOK_API_KEY=your_facebook_key
REACT_APP_TWITTER_API_KEY=your_twitter_key
```

### Server Configuration
- Nginx reverse proxy
- SSL/TLS termination
- CDN integration
- Caching strategies

---

## 🔧 Troubleshooting

### Problemi Comuni

#### 1. Immagini non caricate
- Verificare permessi upload
- Controllare limiti dimensione file
- Testare endpoint storage

#### 2. Google Maps non funziona
- Verificare API key valida
- Controllare abilitazioni API Google Cloud
- Testare endpoint geocoding

#### 3. Social feed non mostra dati
- Verificare API keys piattaforme
- Controllare rate limits
- Testare endpoint APIs

#### 4. Performance lenta
- Controllare bundle size
- Verificare lazy loading
- Ottimizzare immagini

---

## 📋 TODO Future Releases

### Versione 3.1
- [ ] Componente Video Section
- [ ] Testo animato con typing effects
- [ ] Forms avanzati con validazione
- [ ] E-commerce integration base

### Versione 3.2
- [ ] A/B testing templates
- [ ] Analytics integration
- [ ] Personalizzazione avanzata temi
- [ ] Multi-language support

### Versione 3.3
- [ ] Template marketplace
- [ ] Advanced animations
- ] Real-time collaboration
- ] Version control pagine

---

## 📞 Supporto e Contatti

### Documentazione
- Repository GitHub: `docs/`
- API Documentation: `/api/docs`
- Component Examples: `/examples/`

### Supporto Tecnico
- Email: `dev@operocloud.it`
- Slack: `#website-builder`
- Issues: [GitHub Issues](https://github.com/your-repo/issues)

### Community
- Forum: `community.operocloud.it`
- Discord: `Website Builder Discord`
- Stack Overflow: `[website-builder]`

---

## 📄 Licenza

Questo progetto è distribuito sotto licenza MIT. Vedi file `LICENSE` per dettagli completi.

---

**Documento Generato**: 10 Dicembre 2025
**Versione**: 3.0.0
**Team**: Sviluppo Opero