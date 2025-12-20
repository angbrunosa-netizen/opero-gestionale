# 🐛 Debug Guide: Header Personalizzazione Issues

## 📋 Panoramica del Problema

Quando l'header personalizzato tramite CMS non viene visualizzato correttamente, segui questa guida step-by-step per identificare e risolvere il problema.

## 🔍 Fase 1: Verifica Base

### Console Debug Messages
Dovresti vedere i seguenti messaggi di debug nella console del browser quando visiti la pagina con l'header personalizzato:

```javascript
🎨🎨🎨 StandardLayout CALLED - siteConfig.colors: {headerBackground: '#...', ...}
🎨🎨🎨 Header Background: '#...'
🎨🎨🎨 Header Text: '#...'
🎨🎨🎨 Logo Position: '...'
```

### Se NON vedi questi messaggi:
- Il problema è che la pagina non sta usando `StandardLayout` correttamente
- Verifica quale route sta gestendo l'URL
- Vai alla sezione "Fase 2"

### Se VEDI questi messaggi MA l'header è ancora bianco:
- I dati vengono passati correttamente a `StandardLayout`
- Il problema è nel CSS (conflitto Tailwind vs inline styles)
- Vai alla sezione "Fase 3"

## 🔧 Fase 2: Identificare la Route Corretta

### Verifica quale route gestisce l'URL

1. **Apri Developer Tools** (F12)
2. Vai alla tab **Network**
3. Ricarica la pagina problematica
4. Cerca la richiesta che carica i dati

### Route Expected per `/ARTICOLI`:
```
GET /api/public/shop/mia-azienda/page/articoli
```

### Se vedi una route diversa:
- La pagina sta usando un sistema di routing diverso
- Verifica se esistono alias o middleware
- Controlla `next.config.js` per routing personalizzato

### Route Alternative Comuni:
- `app/[...slug]/page.js` - Catch-all generico
- Middleware di routing personalizzato
- Pagine statiche pre-renderizzate

## 🎨 Fase 3: Risolvere Conflitti CSS

### Problema 1: Specificità Tailwind vs Inline Styles

Le classi Tailwind hanno spesso priorità sugli stili inline. Soluzioni:

#### Aumenta specificità con `!important` (temporaneo per test):
```javascript
<nav className="sticky top-0 z-50 shadow-sm border-b border-gray-200" style={{
    backgroundColor: 'var(--header-background-color) !important',
    color: 'var(--header-text-color) !important'
}}>
```

#### Oppure usa classi CSS dinamiche:
```javascript
const headerClasses = `sticky top-0 z-50 shadow-sm border-b border-gray-200`;
const headerStyle = {
  backgroundColor: 'var(--header-background-color)',
  color: 'var(--header-text-color)'
};

<nav className={headerClasses} style={headerStyle}>
```

### Problema 2: Classi Tailwind Che Sovrascrivono

Controlla se ci sono classi che forzano colori specifici:

```javascript
// Prova a rimuovere classi che potrebbero causare conflitti
<nav className={someClasses} style={headerStyle}>
```

Le classi comuni che causano problemi:
- `bg-white`, `bg-gray-50` - forzano sfondi
- `text-gray-900` - forzano testo
- `border-*` - forzano bordi

### Problema 3: Contesto CSS Errato

Le variabili CSS potrebbero non essere definite nel contesto corretto:

```javascript
// Verifica il contesto
useEffect(() => {
    const root = document.documentElement;
    console.log('Root CSS vars:', getComputedStyle(root).getPropertyValue('--header-background-color'));
}, []);
```

## 📊 Fase 4: Test e Validazione

### Checklist di Validazione:

1. ✅ **Backend**: I dati dell'header vengono passati correttamente?
2. ✅ **Frontend**: StandardLayout riceve i dati corretti?
3. ✅ **CSS**: Gli stili inline vengono applicati?
4. ✅ **Visual**: L'header appare con i colori corretti?

### Strumenti di Debug Avanzati:

#### Chrome DevTools:
1. **Inspector**: Seleziona l'elemento `<nav>`
2. **Styles**: Verifica computed styles
3. **Console**: Controlla messaggi di debug

#### Browser Console:
```javascript
// Test diretto delle variabili CSS
console.log('CSS Variables:', {
    headerBg: getComputedStyle(document.documentElement).getPropertyValue('--header-background-color'),
    headerText: getComputedStyle(document.documentElement).getPropertyValue('--header-text-color'),
    logoPosition: getComputedStyle(document.documentElement).getPropertyValue('--logo-position')
});

// Test dell'elemento nav
const nav = document.querySelector('nav');
console.log('Nav styles:', {
    bg: getComputedStyle(nav).backgroundColor,
    color: getComputedStyle(nav).color
});
```

## 🚀 Soluzioni Comuni

### ✅ Soluzione A: Forzare Specificità CSS (IMPLEMENTATA)
```javascript
<nav
  className="sticky top-0 z-50 shadow-sm border-b border-gray-200"
  style={{
    backgroundColor: 'var(--header-background-color) !important',
    color: 'var(--header-text-color) !important'
  }}
>
```

**Questa soluzione è stata implementata con successo!** Il problema dei conflitti Tailwind è stato risolto usando `!important` forzare la specificità degli stili inline.

### Soluzione B: Classi CSS Dinamiche
```javascript
const getHeaderStyles = (headerBackground, headerText) => ({
  backgroundColor: headerBackground,
  color: headerText,
  // Forza override di classi Tailwind se necessario
});

<nav className="sticky top-0 z-50 shadow-sm border-b border-gray-200" style={getHeaderStyles(headerBackground, headerText)}>
```

### Soluzione C: CSS-in-JS con Higher Specificity
```javascript
const headerStyle = {
  backgroundColor: 'var(--header-background-color)',
  color: 'var(--header-text-color)',
  '&&': { // Aumenta specificità
    backgroundColor: 'var(--header-background-color) !important',
    color: 'var(--header-text-color) !important'
  }
};
```

## 📋 Template di Debug

### Aggiungi Debug Stabile:

```javascript
// In StandardLayout.js o componente simile
const DEBUG_MODE = process.env.NODE_ENV === 'development';

const debugLog = (message, data) => {
  if (DEBUG_MODE) {
    console.log(`🔍 [DEBUG] ${message}:`, data);
  }
};

// Uso
debugLog('Header Background', siteConfig?.colors?.headerBackground);
debugLog('Header Text', siteConfig?.colors?.headerText);
debugLog('Logo Position', siteConfig?.colors?.logoPosition);
```

## 📚 Strumenti Utili

1. **React Developer Tools** - Component tree e props
2. **Chrome DevTools** - Inspector e Styles
3. **Next.js DevTools** - Informazioni su routing e rendering
4. **Postman/Insomnia** - Test API endpoints
5. **Database Client** - Verifica dati salvati

## 🔄 Processo Iterativo

1. **Identifica** il problema con i debug
2. **Isola** la causa (dati, routing, CSS)
3. **Applica** la soluzione corretta
4. **Testa** il risultato
5. **Itera** se necessario

---

**Ricorda**: Rimuovi tutti i messaggi di debug e i test temporanei prima di andare in produzione! 🧹