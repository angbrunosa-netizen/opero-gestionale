# Guida Test - Verifica URL Anteprima

## Problema: In ambiente di sviluppo apre sempre localhost

## File da Verificare

### 1. SiteBuilderModule.js ✅ (GIÀ CORRETTO)
**Percorso**: `opero-frontend/src/components/SiteBuilderModule.js`
**Linee**: 133-147

La logica corretta deve essere:
```javascript
const isDevelopment = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('localhost') ||
    window.location.hostname === '192.168.1.19' || // IP locale
    window.location.port && !window.location.hostname.includes('operocloud.it')
);
```

## Come Testare

### Test 1: Ambiente di Sviluppo (Locale)
1. Apri il browser su `http://localhost:3002` (React Dashboard)
2. Accedi al SiteBuilderModule
3. Seleziona una ditta
4. Clicca su "Anteprima Live"
5. **URL Atteso**: `http://mia-azienda.localhost:3000`
6. **Azione**: Verifica che il browser apra l'URL corretto

### Test 2: Debug in Console
Apri la console del browser (F12) ed esegui:

```javascript
// Verifica hostname
console.log('Hostname:', window.location.hostname);
console.log('Port:', window.location.port);
console.log('Include operocloud.it:', window.location.hostname.includes('operocloud.it'));

// Simula la logica
const isDev = (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('localhost') ||
    window.location.port && !window.location.hostname.includes('operocloud.it')
);

console.log('Is Development:', isDev);
console.log('Domain:', isDev ? 'localhost:3000' : 'operocloud.it');
```

## Cause Comuni del Problema

### Problema 1: React non ricarica il codice
**Soluzione**:
```bash
# Ferma il server (CTRL+C)
# Rimuovi la cache
rm -rf node_modules/.cache
# Riavvia
npm start
```

### Problema 2: Browser cache
**Soluzione**:
- Premi `CTRL + SHIFT + R` (hard refresh)
- Oppure apri in incognito/private

### Problema 3: Build vecchia caricata
**Soluzione**:
```bash
cd opero-frontend
npm run build
npm start
```

## Verifica File Compilato

Dopo la build, verifica che il codice compilato contenga la logica corretta:

```bash
cd opero-frontend/build/static/js
# Cerca nei file .js la stringa "operocloud.it"
grep -r "operocloud.it" .
```

Dovresti trovare qualcosa come:
```javascript
isDevelopment?i="localhost:3000":i="operocloud.it"
```

## Checklist

- [ ] Verificato che `SiteBuilderModule.js` abbia il codice corretto
- [ ] Riavviato il server React dopo la modifica
- [ ] Fatto hard refresh del browser (CTRL+SHIFT+R)
- [ ] Testato con console.log per verificare `window.location`
- [ ] Verificato che la build contenga le modifiche

## Se il problema persiste

Aggiungi un console.log temporaneo in SiteBuilderModule.js:

```javascript
const isDevelopment = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('localhost') ||
    window.location.hostname === '192.168.1.19' ||
    window.location.port && !window.location.hostname.includes('operocloud.it')
);

// DEBUG
console.log('[SiteBuilderModule] Debug URL:', {
    hostname: window.location?.hostname,
    port: window.location?.port,
    isDevelopment,
    domain: isDevelopment ? 'localhost:3000' : 'operocloud.it',
    previewUrl
});
```

Questo ti mostrerà nella console del browser esattamente cosa viene calcolato.
