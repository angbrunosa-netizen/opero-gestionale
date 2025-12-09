# Mappa Componenti Website Builder UNIFIED

## 📋 Documento di Analisi del Sistema Website Builder

**Componente Principale**: `WebsiteBuilderUNIFIED.js`
**Versione**: 2.0
**Ultimo Aggiornamento**: 2025-12-09

---

## 🏗️ STRUTTURA COMPONENTI PRINCIPALI

### 1. WebsiteBuilderUNIFIED (Componente Radice)

| Proprietà | Tipo | Descrizione |
|-----------|------|-------------|
| `site` | Object | Dati iniziali del sito web |
| `onSave` | Function | Callback al salvataggio |
| `onCancel` | Function | Callback all'annullamento |
| `mode` | String | Modalità: 'edit' | 'create' |

**Stati Principali**:
- `site` - Dati completi del sito
- `activeTab` - Tab attivo (overview, pages, template, images, catalog, seo, settings)
- `loading` - Stato di caricamento
- `templateConfig` - Configurazione template
- `pages` - Elenco pagine
- `images` - Elenco immagini
- `catalogSettings` - Impostazioni catalogo

---

## 📑 SOTTOCOMPONENTI DIRETTI

### 1. TemplateCustomizer
- **Percorso**: `./website/TemplateCustomizer.js`
- **Props**: `config`, `onConfigChange`
- **Funzionalità**:
  - Colori e branding
  - Font family e tipografia
  - Layout e spaziature
  - Header e footer customization
  - Preview real-time
- **Sottocomponenti**: `GalleryAdvancedCustomizer_SIMPLE`

### 2. StaticPagesManager
- **Percorso**: `./website/StaticPagesManager.js`
- **Props**: `websiteId`, `pages`, `onPagesChange`, `onSave`
- **Funzionalità**:
  - Gestione pagine statiche
  - WYSIWYG editor (ReactQuill)
  - Template predefiniti (Home, Chi Siamo, Contatti, Blog)
  - Meta tag SEO
- **API Utilizzate**:
  - `GET /api/website/:websiteId/pages`
  - `POST /api/website/:websiteId/pages`
  - `PUT /api/website/:websiteId/pages/:pageId`
  - `DELETE /api/website/:websiteId/pages/:pageId`

### 3. ImageGalleryManager
- **Percorso**: `./website/ImageGalleryManager.js`
- **Props**: `images`, `onUpload`, `onDelete`, `onOpenAllegatiManager`
- **Funzionalità**:
  - Upload multiplo drag & drop
  - Categorie immagini (logo, banner, gallery, prodotti)
  - Preview e organizzazione
  - Integrazione con AllegatiManager
- **Sottocomponenti**: `AllegatiManager`

---

## 🧩 COMPONENTI SECONDARI (Sito web blocks)

### 1. HeroBlock
- **Percorso**: `./website/blocks/HeroBlock.js`
- **Funzionalità**: Hero section principale

### 2. TextBlock
- **Percorso**: `./website/blocks/TextBlock.js`
- **Funzionalità**: Blocchi di testo WYSIWYG

### 3. ImageBlock
- **Percorso**: `./website/blocks/ImageBlock.js`
- **Funzionalità**: Blocchi immagini

### 4. ProductsBlock
- **Percorso**: `./website/blocks/ProductsBlock.js`
- **Funzionalità**: Sezione prodotti/servizi

### 5. ContactBlock
- **Percorso**: `./website/blocks/ContactBlock.js`
- **Funzionalità**: Modulo di contatto

### 6. GalleryBlock
- **Percorso**: `./website/blocks/GalleryBlock.js`
- **Funzionalità**: Galleria fotografica

---

## 🔧 COMPONENTI UTILITÀ

### 1. GalleryAdvancedCustomizer_SIMPLE
- **Percorso**: `./website/GalleryAdvancedCustomizer_SIMPLE.js`
- **Funzionalità**: Customizzazione avanzata gallerie
  - Layout selection (grid, masonry, carousel)
  - Hover effects
  - Lightbox settings

### 2. PageEditor
- **Percorso**: `./website/PageEditor.js`
- **Funzionalità**: Editor pagine completo

### 3. WebsiteEditor
- **Percorso**: `./website/WebsiteEditor.js`
- **Funzionalità**: Editor sito web

### 4. WebsiteImageSelector
- **Percorso**: `./website/components/WebsiteImageSelector.js`
- **Funzionalità**: Selettore immagini

### 5. SitePreview
- **Percorso**: `./website/components/SitePreview.js`
- **Funzionalità**: Anteprima sito

---

## 🌐 API ENDPOINTS UTILIZZATI

### GET Endpoints
| Endpoint | Utilizzo | Componente |
|----------|----------|------------|
| `/api/website/:siteId` | Carica dati completi sito | WebsiteBuilderUNIFIED |
| `/api/website/:siteId/pages` | Carica pagine sito | StaticPagesManager |
| `/api/website/:siteId/images` | Carica immagini sito | ImageGalleryManager |
| `/api/website/:siteId/catalog-settings` | Carica impostazioni catalogo | WebsiteBuilderUNIFIED |

### PUT Endpoints
| Endpoint | Utilizzo | Componente |
|----------|----------|------------|
| `/api/website/:siteId` | Auto-save configurazione sito | WebsiteBuilderUNIFIED |

### POST Endpoints
| Endpoint | Utilizzo | Componente |
|----------|----------|------------|
| `/api/website/:siteId/upload` | Upload immagini | ImageGalleryManager |
| `/api/website/:siteId/pages` | Crea nuova pagina | StaticPagesManager |

### DELETE Endpoints
| Endpoint | Utilizzo | Componente |
|----------|----------|------------|
| `/api/website/:siteId/images/:imageId` | Elimina immagine | ImageGalleryManager |
| `/api/website/:siteId/pages/:pageId` | Elimina pagina | StaticPagesManager |

---

## 📊 STATISTICHE E DATI

### Overview Tab
- **Numero pagine**: `pages.length`
- **Numero immagini**: `images.length`
- **Stato catalogo**: `siteConfig.enable_catalog`

### Auto-save
- **Debounce**: 2 secondi
- **Metodo**: `PUT /api/website/:siteId`
- **Sezioni salvate**: `site_config`, `template_config`

---

## 🎯 FUNZIONALITÀ PER TAB

### 1. Overview
- Info generali sito
- Statistiche pagine/immagini/catalogo
- Stato dominio

### 2. Pagine Statiche
- Gestione completa pagine
- Editor WYSIWYG
- Template predefiniti
- SEO meta tag

### 3. Aspetto (Template)
- Personalizzazione colori
- Font e tipografia
- Layout e spaziature
- Header/footer

### 4. Media (Immagini)
- Upload multiplo
- Categorie immagini
- Preview e organizzazione
- Gestione gallerie

### 5. Catalogo
- Abilita/disabilita catalogo
- Mostra/nascondi prezzi
- Impostazioni prodotti

### 6. SEO & Analytics
- Google Analytics ID
- Meta tag
- Ottimizzazione ricerca

### 7. Impostazioni
- Social media links
- Logo/favicon
- Impostazioni avanzate

---

## 🔗 FLUSSO DATI

```
1. mount WebsiteBuilderUNIFIED
2. loadSiteData() → Promise.all API calls
3. set stati (site, pages, images, etc.)
4. render tab content based on activeTab
5. user interaction → state change
6. autoSave() → API call (debounced 2s)
7. update UI con feedback
```

---

## 📁 STRUTTURA FILE

```
src/components/
├── WebsiteBuilderUNIFIED.js (Componente principale)
├── website/
│   ├── TemplateCustomizer.js
│   ├── StaticPagesManager.js
│   ├── ImageGalleryManager.js
│   ├── GalleryAdvancedCustomizer_SIMPLE.js
│   ├── blocks/
│   │   ├── HeroBlock.js
│   │   ├── TextBlock.js
│   │   ├── ImageBlock.js
│   │   ├── ProductsBlock.js
│   │   ├── ContactBlock.js
│   │   └── GalleryBlock.js
│   └── components/
│       ├── WebsiteImageSelector.js
│       ├── SitePreview.js
│       └── ...
└── shared/
    └── AllegatiManager.js
```

---

## ⚡ PERFORMANCE E OTTIMIZZAZIONE

### Caricamento
- **Parallel API calls**: `Promise.all()`
- **Debounce auto-save**: 2 secondi
- **Memory cleanup**: `URL.revokeObjectURL()`

### Lazy Loading
- Componenti caricati on-demand
- Preview generation lazy

### Error Handling
- Try/catch su tutte le API calls
- Feedback UI per errori
- Recovery automatico

---

## 🛠️ MANUTENZIONE

### Punti Critici
1. **Auto-save debounce**: Controllare performance con siti grandi
2. **Memory management**: Object URLs nelle immagini
3. **API error handling**: Robustezza delle chiamate
4. **State management**: Sincronizzazione tra componenti

### Estensibilità
- Nuovi template in TemplateCustomizer
- Nuovi blocchi pagina in blocks/
- Nuove categorie immagini in ImageGalleryManager
- Nuove integrazioni API

---

*Documento generato automaticamente - Data: 2025-12-09*