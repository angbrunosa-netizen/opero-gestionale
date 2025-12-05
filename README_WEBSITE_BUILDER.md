# Website Builder - Sistema Gestione Siti Web Aziendali

## 📋 Panoramica del Progetto

Il Website Builder è un modulo completo per Opero che permette ad ogni azienda di creare e gestire il proprio sito web professionale, sfruttando i dati già presenti nel sistema.

### ✅ Funzionalità Implementate

#### 1. **Gestione Contenuti Statici**
- **Home Page**: Hero section, servizi, testimonials, call-to-action
- **Chi Siamo**: Company story, missione, visione, team
- **Contatti**: Mappa, form di contatto, informazioni aziendali
- **Blog**: Articoli, categorie, SEO avanzato
- **Editor visuale**: Drag & drop page builder con sezioni modulari

#### 2. **Integrazione Documentale Esistente**
- **AllegatiManager**: Riutilizza il sistema di gestione documentale Opero
- **dm_files**: Immagini già caricate nel sistema
- **dm_allegati_link**: Collegamenti file ↔ entità
- **Storage condiviso**: Stesso storage S3 per tutti i documenti

#### 3. **Personalizzazione Template**
- **6 schemi colori predefiniti**: Professional, Corporate, Nature, Sunset, Royal, Elegant
- **10 font family**: Inter, Roboto, Open Sans, Playfair Display, etc.
- **Layout presets**: Standard, Minimal, Compact, Creative
- **Customizzazione completa**: Colori, font, spaziature, bordi, ombre

#### 4. **Catalogo Dinamico (Future E-commerce)**
- **Integrazione catalogo_prodotti**: Dati real-time da database Opero
- **Configurazione vetrina**: Layout, prezzi, carrello, disponibilità
- **Gestione categorie**: Sfrutta categorie esistenti
- **Immagini prodotti**: dm_files con collegamenti automatici

#### 5. **Multi-Tenancy & Sicurezza**
- **1 sito per azienda**: Subdomain unico per ogni cliente
- **Autenticazione dedicata**: Login specifico per sito
- **Privacy dati**: Accesso solo a dati propria azienda
- **Audit trail**: Log di tutte le modifiche

---

## 🏗️ Architettura del Sistema

### Backend (Node.js/Express)
```
routes/website.js
├── API Siti Web
│   ├── GET /:companyId
│   ├── POST /create
│   ├── PUT /:websiteId
│   └── POST /:websiteId/publish
├── API Pagine Statiche
│   ├── GET /:websiteId/pages
│   ├── POST /:websiteId/pages
│   ├── PUT /:websiteId/pages/:pageId
│   └── DELETE /:websiteId/pages/:pageId
├── API Immagini
│   ├── GET /:websiteId/images (dm_files integration)
│   └── DELETE /:websiteId/images/:imageId
├── API Catalogo
│   ├── GET /:websiteId/catalog-settings
│   └── GET /:websiteId/preview/:slug
└── Autenticazione JWT multi-level
```

### Frontend (React)
```
components/WebsiteBuilder.js
├── WebsiteOverview (dashboard stats)
├── StaticPagesManager (page builder)
├── TemplateCustomizer (visual editor)
├── ImageGalleryManager (dm_files integration)
├── CatalogManager (products integration)
└── WebsiteSettings (SEO/social)
```

### Database Schema
```
siti_web_aziendali          ← 1:1 con ditte
├── pagine_sito_web           ← N:N con sito
├── articoli_blog              ← N:N con sito
├── website_analytics          ← Opzionale stats
└── website_activity_log       ← Audit trail

Integrazione esistente:
├── dm_files                   ← Storage immagini condiviso
├── dm_allegati_link           ← Collegamenti entità
├── catalogo_prodotti          ← Dati prodotti reali
├── categorie_prodotti         ← Categorie esistenti
└── ditte                     ← Dati aziende
```

---

## 🚀 Guida Installazione

### 1. Database Migration
```sql
-- Esegui migration per creare tabelle website
mysql -u root -p opero_db < migrations/2025120501_create_website_tables.sql
```

### 2. Backend Integration
```javascript
// In server.js, aggiungi routes website
const websiteRoutes = require('./routes/website');
app.use('/api/website', websiteRoutes);
```

### 3. Frontend Integration
```jsx
// In App.js o dashboard principale
import WebsiteBuilder from './components/WebsiteBuilder';

<Route path="/website-builder" component={WebsiteBuilder} />
```

### 4. Nginx Configuration
```nginx
# Siti web clienti
server_name ~^(?<subdomain>.+)\.operocloud\.it$;
location / {
    proxy_pass http://localhost:3000;
    proxy_set_header X-Subdomain $subdomain;
}
```

---

## 📊 Flussi di Lavoro

### 1. Creazione Sito Web
```
1. Utente accede a Website Builder in Opero
2. Sistema rileva azienda dall'utente loggato
3. Crea automaticamente sito con subdomain univoco
4. Configura template predefinito
5. Pubblica su nomeditta.operocloud.it
```

### 2. Gestione Immagini
```
1. Upload nuove immagini → dm_files (entita_tipo: WEBSITE_IMAGES)
2. Selezione da documentale esistente → AllegatiManager
3. Categorie automatiche: logo, banner, gallery, prodotti
4. Sincronizzazione S3 storage condiviso
```

### 3. Pagina Statica
```
1. Selezione template pagina (home, chi-siamo, contatti)
2. Page builder drag & drop sezioni
3. Contenuti strutturati in JSON
4. Anteprima real-time
5. Pubblicazione con SEO automatico
```

### 4. Catalogo Dinamico
```
1. Lettura prodotti da catalogo_prodotti
2. Filtri per categoria, disponibilità, featured
3. Configurazione layout e prezzi
4. Integrazione immagini dm_files esistenti
5. Pronto per evoluzione a e-commerce
```

---

## 🔧 Personalizzazione e Configurazione

### Template Personalizzati
```javascript
// Crea nuovo template
const customTemplate = {
  name: 'My Company Template',
  categoria: 'premium',
  config_schema: {
    theme: {
      primary_color: '#FF6B6B',
      secondary_color: '#4ECDC4',
      accent_color: '#45B7D1'
    },
    typography: {
      font_family: 'Poppins, sans-serif',
      base_font_size: '17px',
      h1_size: '52px'
    },
    layout: {
      max_width: '1400px',
      spacing: 'generous',
      border_radius: '12px'
    }
  }
};
```

### Page Builder Sections
```javascript
// Aggiungi nuova sezione personalizzata
const customSection = {
  type: 'custom_testimonial',
  title: 'Testimonial Personalizzato',
  fields: [
    { name: 'client_name', type: 'text', required: true },
    { name: 'client_role', type: 'text' },
    { name: 'testimonial_text', type: 'textarea' },
    { name: 'rating', type: 'number', min: 1, max: 5 },
    { name: 'client_photo', type: 'image' }
  ]
};
```

### Catalogo E-commerce
```javascript
// Evoluzione a e-commerce
const ecommerceSettings = {
  enable_cart: true,
  enable_checkout: true,
  payment_gateways: ['stripe', 'paypal'],
  shipping_options: {
    flat_rate: 10,
    free_shipping: 50
  },
  tax_settings: {
    tax_rate: 0.22,
    tax_inclusive: false
  }
};
```

---

## 📱 Gestione Mobile

Il sistema è completamente ottimizzato per dispositivi mobili:

### Frontend Responsive
- Design adaptivo per tablet e smartphone
- Touch-friendly controls e drag & drop
- Modal full-screen per editor
- Performance ottimizzata con lazy loading

### Siti Web Mobile-First
- Layout responsive automatico
- Navigation mobile-friendly
- Images optimized con WebP
- PWA ready con service worker

### Gestione Immagini Mobile
- Upload da camera/dispositivo
- Compression automatica
- Categorie mobile-friendly
- Gallery con swipe gestures

---

## 🔐 Sicurezza e Privacy

### Autenticazione Multi-Livello
```javascript
// Livello 1: Utente normale (propria ditta)
const normalUser = {
  id_ditta: 123,
  permissions: ['website_view', 'website_edit']
};

// Livello 2: Admin aziendale
const adminUser = {
  id_ditta: 123,
  permissions: ['website_view', 'website_edit', 'website_publish']
};

// Livello 3: Super Admin
const superAdmin = {
  livello: 99,
  permissions: ['website_view', 'website_edit', 'website_publish', 'website_admin']
};
```

### Privacy Dati
- **Isolamento dati**: ogni sito vede solo i dati della propria azienda
- **Audit trail**: log completo di tutte le modifiche
- **GDPR compliance**: gestione consensi e cookie
- **Data retention**: policy di conservazione automatica

### Sicurezza File
- **Upload validation**: solo immagini consentite
- **Size limits**: 10MB per file
- **Malware scan**: integrazione con sistema esistente
- **Access control**: solo immagini della propria azienda

---

## 📊 Analytics e Reporting

### Statistiche Dashboard
- **Visite totali**: monitoraggio traffico sito
- **Performance**: velocità caricamento pagine
- **Engagement**: tempo medio sessione
- **Conversioni**: form contatti compilati

### Report Automatici
- **Report settimanli**: PDF con statistiche complete
- **Alert email**: notifiche anomalie o problemi
- **Data export**: esportazione dati per analisi esterne

### Monitoring Proattivo
- **Uptime monitoring**: controllo stato siti web
- **Performance alerts**: problemi di caricamento
- **Security monitoring**: tentativi accesso anomali
- **Storage alerts**: spazio disco esaurimento

---

## 🔄 Integrazione con Sistemi Esistenti

### Catalogo Prodotti
```javascript
// Integrazione completa con sistema esistente
const productIntegration = {
  // Dati real-time da catalogo_prodotti
  realTimeSync: true,
  // Usa categorie esistenti
  useExistingCategories: true,
  // Immagini da dm_files
  useExistingImages: true,
  // Gestione scorte
  inventoryManagement: true
};
```

### Sistema Documentale
```javascript
// AllegatiManager integration
const documentalIntegration = {
  // Riutilizzo dm_files esistente
  reuseExistingFiles: true,
  // Categorie automatiche per siti web
  autoCategorize: true,
  // Storage S3 condiviso
  sharedStorage: true,
  // Backup automatico
  autoBackup: true
};
```

### Email Marketing
```javascript
// Integrazione con sistema email esistente
const emailIntegration = {
  // Usa account email configurati in Opero
  useExistingAccounts: true,
  // Tracking aperture e click
  emailTracking: true,
  // Template email personalizzabili
  customTemplates: true
};
```

---

## 🚀 Evoluzione Futura (Roadmap)

### Phase 1: Foundation (Completato ✅)
- [x] Gestione siti web base
- [x] Template personalizzati
- [x] Integrazione documentale
- [x] Catalogo prodotti dinamico

### Phase 2: Advanced Features
- [ ] E-commerce completo
  - Carrello avanzato
  - Gateway pagamenti
  - Gestione ordini
  - Calcolo spedizioni
- [] Blog avanzato
  - Commenti utenti
  - Social sharing
  - SEO avanzato
- [] Forms personalizzati
  - Form builder drag & drop
  - Integrazione CRM
  - Auto-responders

### Phase 3: Enterprise Features
- [ ] Multi-language
  - Siti multilingua
  - Traduzione automatica
  - SEO multilingua
- [] Advanced Analytics
  - User behavior tracking
  - Heatmaps
  - Conversion funnels
- [] Integration Platform
  - API REST completa
  - Webhooks
  - Third-party integrations

### Phase 4: AI & Automation
- [ ] AI-powered content
  - Generazione testi automatica
  - SEO optimization
  - Image generation
- [ ] Marketing Automation
  - Email marketing
  - Lead nurturing
  - Campaign management

---

## 🛠️ Troubleshooting

### Problemi Comuni

#### 1. Sito web non compare
```bash
# Verifica stato dominio
SELECT domain_status FROM siti_web_aziendali WHERE subdomain = 'azienda';

# Controlla configurazione nginx
nginx -t && nginx -s reload

# Verifica log errori
tail -f /var/log/nginx/error.log
```

#### 2. Immagini non caricano
```bash
# Verifica permessi storage
SELECT COUNT(*) FROM dm_files WHERE id_ditta = 123;

# Controlla collegamenti website
SELECT COUNT(*) FROM dm_allegati_link WHERE entita_tipo = 'WEBSITE_IMAGES';
```

#### 3. Performance lenta
```javascript
// Ottimizza caricamento immagini
const imageOptimization = {
  lazyLoading: true,
  imageCompression: true,
  webpFormat: true,
  cdnIntegration: true
};
```

### Debug Mode
```javascript
// Abilita debug mode in development
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Website Builder Debug Mode Enabled');
  console.log('Config:', config);
  console.log('User:', req.user);
}
```

---

## 📞 Supporto e Contatti

### Documentazione API
- API Reference: `/api/documentation/website-builder`
- Database Schema: `migrations/2025120501_create_website_tables.sql`
- Code Examples: `examples/website-builder-examples/`

### Team Sviluppo
- **Backend Development**: API endpoints e database schema
- **Frontend Development**: Componenti React e stato applicativo
- **UI/UX Design**: Design templates e user experience
- **DevOps**: Deployment e infrastruttura

### Training e Documentazione
- **User Manual**: Guida utente completa
- **Developer Guide**: Documentazione tecnica
- **Video Tutorial**: Screencast delle funzionalità
- **Best Practices**: Guide personalizzazione e ottimizzazione

---

## 📄 Versionamento e Changelog

### Versione 1.0.0 (Current)
- ✅ Core website management
- ✅ Static pages with page builder
- ✅ Template customization
- ✅ Documentale integration
- ✅ Catalog products integration
- ✅ Multi-tenant security

### Future Releases
- **v1.1.0**: E-commerce features
- **v1.2.0**: Advanced blog
- **v1.3.0**: Multi-language support
- **v2.0.0**: AI-powered features

---

**Status**: ✅ Production Ready
**Maintenance**: 🔧 Attivo
**Support**: 📋 Documentazione completa