# Website Builder - Documentazione di Test e Implementazione

## Overview Completo del Sistema

Questo documento descrive l'architettura completa del sistema Website Builder, dal componente principale fino alle API e sottocomponenti, per facilitare il testing e la comprensione del flusso di lavoro.

## 🏗️ Architettura del Sistema

### Componente Principale
- **WebsiteBuilderUNIFIED.js** - Componente orchestratore principale
- **Percorso**: `opero-frontend/src/components/WebsiteBuilderUNIFIED.js`

## 📋 Mappa Completa dei Componenti

### 1. **WebsiteBuilderUNIFIED.js** (Componente Principale)
**Responsabilità**: Orchestrazione completa del processo di creazione siti
**Props principali**:
- `companyInfo` - Informazioni sull'azienda
- `companyId` - ID dell'azienda
- `onSiteGenerated` - Callback per sito generato

**Stato principale**:
```javascript
{
  currentStep,           // Step corrente (1-5)
  selectedTemplate,      // Template selezionato
  generatedPages,        // Pagine generate
  websiteId,            // ID del sito creato
  globalStyles,         // Stili globali
  isGenerating,         // Stato generazione
  aiAnalysis,           // Analisi AI
  siteStructure         // Struttura del sito
}
```

**API chiamate**:
- `POST /api/ai-enhanced-website/analyze-company`
- `POST /api/ai-enhanced-website/generate-section-content`
- `POST /api/ai-enhanced-website/generate-global-styles`
- `POST /api/siti-web/create`
- `POST /api/website-generator/generate/{websiteId}`

---

### 2. **Componenti di Selezione Template**

#### **TemplateSelection.js**
**Responsabilità**: Visualizzazione e selezione template
**Props**: `onTemplateSelect`, `companyInfo`, `aiAnalysis`

**Templates disponibili**:
1. **Business Landing** (`business-landing`)
   - Sezioni: hero, services, about, contact
   - Target: Aziende professionali

2. **Local Business** (`local-business`)
   - Sezioni: hero, about, map, contact
   - Target: Attività locali

3. **Portfolio Creativo** (`portfolio`)
   - Sezioni: hero, gallery, about, contact
   - Target: Agency e creativi

---

### 3. **Componenti di Editing**

#### **TemplatePageBuilder.js**
**Responsabilità**: Editing pagine con sezioni AI-enhanced
**Props**:
- `page` - Dati pagina
- `onUpdate` - Callback aggiornamenti
- `globalStyles` - Stili globali
- `aiSuggestions` - Suggerimenti AI

**Funzionalità**:
- Editing sezioni drag & drop
- AI Assistant Button per ogni sezione
- Anteprima in tempo reale
- Applicazione stili globali

#### **CollaborativeTemplateBuilder.js**
**Responsabilità**: Building collaborativo con AI
**Props**:
- `template` - Template base
- `onUpdate` - Callback aggiornamenti
- `companyInfo` - Info azienda
- `aiAnalysis` - Analisi AI

#### **NavigationBuilder.js**
**Responsabilità**: Generazione automatica navigazione
**Props**:
- `pages` - Array pagine
- `currentPage` - Pagina corrente
- `globalStyles` - Stili globali
- `onNavigate` - Callback navigazione

---

### 4. **Componenti AI**

#### **AIAssistantButton.js**
**Responsabilità**: Trigger assistenza AI per sezioni
**Props**:
- `sectionType` - Tipo sezione
- `currentContent` - Contenuto corrente
- `onAssistance` - Callback AI

#### **SectionEditor.js**
**Responsabilità**: Editor specifico per tipi di sezione
**Tipi di sezione**:
- `hero` - Sezione principale
- `services` - Servizi
- `about` - Chi siamo
- `contact` - Contatti
- `gallery` - Galleria
- `testimonial` - Testimonianze

---

## 🔌 Mappa API Complete

### 1. **API AI Enhancement** (`/api/ai-enhanced-website/`)

#### **POST /analyze-company**
**Scopo**: Analisi AI per suggerimenti template e contenuti
**Body**:
```json
{
  "companyId": 16,
  "includeIndustryAnalysis": true,
  "includeContentSuggestions": true
}
```

**Response**:
```json
{
  "success": true,
  "analysis": {
    "industry": "Settore specifico",
    "recommendedPages": ["Home", "Chi Siamo", "Contatti"],
    "contentStyle": "Professionale|Moderno|Creativo",
    "primaryColor": "#hexcode",
    "targetAudience": "B2B|B2C|Mixed",
    "keyDifferentiators": ["punto1", "punto2"],
    "seoKeywords": ["keyword1", "keyword2"]
  },
  "companyContext": {...},
  "templateSuggestions": [...]
}
```

#### **POST /generate-section-content**
**Scopo**: Genera contenuto AI per sezione specifica
**Body**:
```json
{
  "sectionType": "hero",
  "companyId": 16,
  "customPrompt": "Richiesta personalizzata",
  "companyContext": {...}
}
```

**Response**:
```json
{
  "success": true,
  "content": {
    "title": "Titolo sezione",
    "subtitle": "Sottotitolo",
    "content": "Contenuto HTML",
    "seo": {
      "title": "SEO title",
      "description": "SEO description",
      "keywords": ["keyword1", "keyword2"]
    },
    "images": {
      "suggestions": ["descrizione immagine 1"],
      "altTexts": ["alt text 1"]
    }
  },
  "suggestions": ["suggerimento1", "suggerimento2"]
}
```

#### **POST /generate-global-styles**
**Scopo**: Genera stili globali AI
**Body**:
```json
{
  "templateId": "business-landing",
  "templateName": "Business Landing",
  "templateDescription": "Template per aziende",
  "companyId": 16,
  "industry": "Tecnologia"
}
```

**Response**:
```json
{
  "success": true,
  "styles": {
    "background": {
      "type": "color|gradient|image",
      "color": "#hexcode",
      "gradient": "linear-gradient(...)"
    },
    "typography": {
      "fontFamily": "Inter|Roboto|Montserrat",
      "fontSize": "16",
      "fontColor": "#hexcode"
    },
    "colors": {
      "primary": "#hexcode",
      "secondary": "#hexcode",
      "accent": "#hexcode"
    },
    "layout": {
      "containerMaxWidth": "1200px",
      "paddingTop": "60px",
      "paddingBottom": "60px"
    }
  }
}
```

---

### 2. **AI Collaborative Assistant** (`/api/ai-collaborative-assistant/`)

#### **POST /section-assist**
**Scopo**: Assistenza AI per modifiche sezioni
**Body**:
```json
{
  "sectionType": "services",
  "currentContent": {...},
  "request": "Migliora questo testo",
  "context": {
    "theme": "professional",
    "globalStyles": {...}
  }
}
```

#### **POST /generate-variations**
**Scopo**: Genera variazioni di contenuto
**Body**:
```json
{
  "sectionType": "hero",
  "baseContent": {...},
  "variationType": "style|tone|structure",
  "count": 3,
  "preserveStructure": true
}
```

#### **POST /seo-suggestions**
**Scopo**: Suggerimenti SEO
**Body**:
```json
{
  "content": "Testo da analizzare",
  "keywords": ["keyword1", "keyword2"],
  "targetAudience": "B2B"
}
```

#### **POST /evaluate-content**
**Scopo**: Valuta qualità contenuto
**Body**:
```json
{
  "content": "Testo da valutare",
  "sectionType": "about",
  "targetAudience": "Professionisti"
}
```

---

### 3. **API Siti Web** (`/api/siti-web/`)

#### **POST /create**
**Scopo**: Creazione nuovo sito web
**Body**:
```json
{
  "nome_sito": "Nome Sito",
  "id_ditta": 16,
  "template": "business-landing",
  "configurazione": {
    "globalStyles": {...},
    "aiAnalysis": {...}
  }
}
```

**Response**:
```json
{
  "success": true,
  "websiteId": 123,
  "message": "Sito creato con successo"
}
```

#### **GET /pages/{siteId}**
**Scopo**: Recupera pagine sito
**Response**:
```json
{
  "success": true,
  "pages": [
    {
      "id": 1,
      "titolo": "Home",
      "slug": "home",
      "contenuto_json": {...},
      "seo": {...}
    }
  ]
}
```

---

### 4. **API Website Generator** (`/api/website-generator/`)

#### **POST /generate/{websiteId}**
**Scopo**: Genera sito statico completo
**Response**:
```json
{
  "success": true,
  "message": "Sito generato con successo",
  "path": "/generated-sites/nome-sito",
  "pagesGenerated": 4,
  "assetsCopied": true
}
```

#### **POST /preview/{websiteId}**
**Scopo**: Genera anteprima sito
**Response**:
```json
{
  "success": true,
  "previewUrl": "/preview/xyz123",
  "expiresIn": 3600
}
```

---

## 🔄 Flusso di Lavoro Completo

### Step 1: Analisi Aziendale
```
WebsiteBuilderUNIFIED.js
  ↓
POST /api/ai-enhanced-website/analyze-company
  ↓
AI Analysis (industry, style, suggestions)
  ↓
Template Selection
```

### Step 2: Selezione Template
```
TemplateSelection.js
  ↓
Template Selection (business, local, portfolio)
  ↓
POST /api/siti-web/create
  ↓
Website ID creation
```

### Step 3: Generazione Contenuti
```
TemplatePageBuilder.js
  ↓
Per ogni sezione:
  POST /api/ai-enhanced-website/generate-section-content
  ↓
Content Generation (title, text, SEO, images)
  ↓
Section Editor con AI assistance
```

### Step 4: Stili Globali
```
POST /api/ai-enhanced-website/generate-global-styles
  ↓
Global Styles (colors, typography, layout)
  ↓
Application to NavigationBuilder e TemplatePageBuilder
```

### Step 5: Anteprima e Generazione
```
WebsiteBuilderUNIFIED.js
  ↓
POST /api/website-generator/generate/{websiteId}
  ↓
Static Site Generation
  ↓
Preview e Download
```

---

## 🧪 Casi di Test

### Test Componenti

#### **WebsiteBuilderUNIFIED.js**
```javascript
// Test 1: Inizializzazione componente
const wrapper = mount(<WebsiteBuilderUNIFIED companyId={16} />);
expect(wrapper.state('currentStep')).toBe(1);

// Test 2: Selezione template
wrapper.instance().handleTemplateSelect('business-landing');
expect(wrapper.state('selectedTemplate')).toBe('business-landing');

// Test 3: Generazione sito
await wrapper.instance().handleGenerateSite();
expect(wrapper.state('websiteId')).toBeDefined();
```

#### **TemplatePageBuilder.js**
```javascript
// Test 1: Rendering sezioni
const page = { sections: [{type: 'hero', content: {...}}] };
const wrapper = mount(<TemplatePageBuilder page={page} />);
expect(wrapper.find('Section').length).toBe(1);

// Test 2: AI assistance
wrapper.instance().handleAIAssistance(0, 'hero');
await waitFor(() => {
  expect(wrapper.state('aiSuggestions')).toBeDefined();
});
```

### Test API

#### **Test 1: Analisi Aziendale**
```javascript
// Request
POST /api/ai-enhanced-website/analyze-company
{
  "companyId": 16,
  "includeIndustryAnalysis": true
}

// Expected Response
{
  "success": true,
  "analysis": {
    "industry": "Tecnologia",
    "recommendedPages": ["Home", "Servizi", "Contatti"],
    "contentStyle": "Moderno"
  }
}
```

#### **Test 2: Generazione Contenuto**
```javascript
// Request
POST /api/ai-enhanced-website/generate-section-content
{
  "sectionType": "hero",
  "companyId": 16,
  "customPrompt": "Tecnologia innovativa"
}

// Expected Response
{
  "success": true,
  "content": {
    "title": "Tecnologia che Trasforma",
    "subtitle": "Soluzioni innovative per il tuo business",
    "content": "<p>Contenuto hero...</p>"
  }
}
```

---

## 🚀 Performance Testing

### Test Carico API
```bash
# Test analisi azienda (concurrenti)
ab -n 100 -c 10 http://localhost:3001/api/ai-enhanced-website/analyze-company

# Test generazione contenuti
ab -n 50 -c 5 http://localhost:3001/api/ai-enhanced-website/generate-section-content

# Test generazione sito
ab -n 20 -c 2 http://localhost:3001/api/website-generator/generate/123
```

### Test Frontend
```javascript
// Test rendering performance
const start = performance.now();
mount(<WebsiteBuilderUNIFIED companyId={16} />);
const end = performance.now();
console.log(`Render time: ${end - start}ms`);

// Test AI response time
const aiStart = performance.now();
await aiService.generateSection('hero', companyId);
const aiEnd = performance.now();
console.log(`AI generation time: ${aiEnd - aiStart}ms`);
```

---

## 🔐 Testing Sicurezza

### Test Permessi
```javascript
// Test senza permessi SITE_BUILDER
const response = await axios.post('/api/ai-enhanced-website/analyze-company', data, {
  headers: { Authorization: 'invalid-token' }
});
expect(response.status).toBe(401);

// Test con permessi validi
const validResponse = await axios.post('/api/ai-enhanced-website/analyze-company', data, {
  headers: { Authorization: 'valid-token' }
});
expect(validResponse.status).toBe(200);
```

### Test Input Validation
```javascript
// Test SQL injection
const maliciousInput = "'; DROP TABLE ditte; --";
const response = await axios.post('/api/siti-web/create', {
  nome_sito: maliciousInput,
  id_ditta: 16
});
// Should not affect database integrity

// Test XSS prevention
const xssInput = "<script>alert('xss')</script>";
const response = await axios.post('/api/ai-enhanced-website/generate-section-content', {
  content: xssInput
});
// Should sanitize input
```

---

## 📊 Monitoring e Debugging

### Logging Strategy
```javascript
// Frontend logging
console.log('WebsiteBuilder: Step', currentStep);
console.log('AI Service: Generating section', sectionType);
console.log('Template: Selected', selectedTemplate);

// Backend logging
logger.info('AI Analysis', { companyId, analysis });
logger.error('Generation failed', { error, context });
logger.warn('Cache miss', { cacheKey, fallback });
```

### Error Handling
```javascript
// Frontend error boundaries
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    logger.error('WebsiteBuilder Error', { error, errorInfo });
    this.setState({ hasError: true });
  }
}

// Backend error handling
try {
  const result = await aiService.generate(...);
  return result;
} catch (error) {
  logger.error('AI Service Error', { error, context });
  return fallbackContent;
}
```

---

## 🎯 Checklist Test Completa

### Funzionalità Base
- [ ] Creazione nuovo sito
- [ ] Selezione template
- [ ] Generazione contenuti AI
- [ ] Applicazione stili globali
- [ ] Anteprima sito
- [ ] Download sito statico

### Funzionalità AI
- [ ] Analisi aziendale AI
- [ ] Generazione sezioni
- [ ] Suggerimenti contenuti
- [ ] Variazioni testi
- [ ] Ottimizzazione SEO
- [ ] Valutazione qualità

### Funzionalità UX
- [ ] Navigazione intuitiva
- [ ] Drag & drop sezioni
- [ ] Preview in tempo reale
- [ ] Salvataggio automatico
- [ ] Gestione errori

### Performance
- [ ] Tempo caricamento < 3s
- [ ] AI response < 10s
- [ ] Generazione sito < 30s
- [ ] Memory usage < 512MB

### Sicurezza
- [ ] Autenticazione utente
- [ ] Validazione input
- [ ] Sanitizzazione output
- [ ] Rate limiting API
- [ ] CORS configuration

---

## 📝 Note per i Testers

1. **Test Environment**: Utilizzare database di test separato
2. **AI Services**: Mockare risposte AI per test deterministici
3. **File Upload**: Testare con vari formati e dimensioni
4. **Browser Compatibility**: Testare su Chrome, Firefox, Safari, Edge
5. **Mobile**: Testare responsive design su dispositivi mobili
6. **Network**: Testare con connessioni lente
7. **Accessibility**: Verificare WCAG 2.1 compliance

---

**Ultimo aggiornamento**: 14 Dicembre 2024
**Versione sistema**: v2.0 - AI Enhanced Website Builder
**Responsabile**: Development Team