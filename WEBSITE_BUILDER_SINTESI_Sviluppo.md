# 📋 SINTESI SVILUPPO WEBSITE BUILDER OPERO
*Data: 9 Dicembre 2025*
*Stato: Lavori in corso - Problemi identificati e soluzioni parziali*

---

## 🎯 OBIETTIVO PRINCIPALE

Risolvere i problemi del sistema Website Builder:
1. ✅ Anteprima pagine statiche (risolto)
2. ❌ Caricamento immagini dallo storage (in corso)
3. ✅ Errore `gallery_layout` in GalleryAdvancedCustomizer (risolto)

---

## 🏗️ ARCHITETTURA COMPONENTI

### Flusso Principale
```
URL: http://localhost:3000/
↓
App.js
↓
MainApp.js (debug URL attivo)
↓
WebsiteBuilderModule.js
↓
WebsiteBuilderUNIFIED.js
↓
ImageGalleryManager.js (problema immagini)
```

### Componenti Modificati
- ✅ `StaticPagesManager.js` - Anteprima pagine funzionante
- ✅ `GalleryAdvancedCustomizer_SIMPLE.js` - Errori risolti
- ✅ `StandaloneModule.js` - Aggiunto case 'WEBSITE'
- ✅ `ImageGalleryManager.js` - Debug aggiunto
- ✅ `WebsiteBuilderUNIFIED.js` - Debug immagini aggiunto

---

## 🔥 PROBLEMI IDENTIFICATI

### 1. CARICAMENTO IMMAGINI ❌
**Sintomo:** ImageGalleryManager mostra `imagesCount: 0`

**Flusso:**
1. `WebsiteBuilderUNIFIED` chiama: `api.get('/website/${siteId}/images')`
2. Backend risponde con `{success: true, images: []}`
3. `ImageGalleryManager` riceve array vuoto

**Backend Endpoint:** `routes/website.js:2139`
```javascript
router.get('/:websiteId/images', async (req, res) => {
  // Query SQL che cerca immagini in dm_files
  WHERE df.id_ditta = ?
    AND (dal.entita_tipo = 'WEBSITE_IMAGES' OR dal.entita_tipo = 'website' OR dal.entita_tipo IS NULL)
    AND df.mime_type LIKE 'image/%'
})
```

**Debug Attivo:**
- Frontend: `🔥 WebsiteBuilderUNIFIED - Risposta images`
- Backend: `🔍 [IMAGES] Trovate X immagini nel database`

### 2. ANTEPRIMA PAGINE ✅
**Soluzione Implementata:**
- Modificato `StaticPagesManager.js`
- Aggiunto fallback per HTTP 431
- Usa sia API service che fetch diretto

**Endpoint:** `/api/website/${websiteId}/preview/${pageSlug}`

### 3. GALLERY ADVANCED CUSTOMIZER ✅
**Problema:** Mismatch props tra TemplateCustomizer e componente
**Soluzione:**
- Supporta entrambi i formati: `{config}` e `{gallery}`
- Gestito parsing JSON delle impostazioni
- Aggiunto valori default robusti

---

## 🔧 MODIFICHE CODICE APPLICATE

### File modificati con debug:

#### 1. MainApp.js
```javascript
// DEBUG: Mostra URL corrente all'avvio del componente
console.log('🌐 MainApp - URL CORRENTE:', window.location.href);
console.log('📋 MainApp - PATHNAME:', window.location.pathname);
```

#### 2. StaticPagesManager.js (riga 622)
```javascript
// Carica anteprima HTML dal backend
fetch(`/api/website/${websiteId}/preview/${page.slug}`)
  .then(response => response.text())
  .then(html => setContent(html));
```

#### 3. ImageGalleryManager.js (riga 28)
```javascript
console.log('🔥🔥 ImageGalleryManager MONTATO!', {
  imagesCount: images?.length || 0,
  hasImages: !!images,
  imagesPreview: images?.slice(0, 3).map(img => ({ name: img.file_name_originale, url: img.preview_url }))
});
```

#### 4. WebsiteBuilderUNIFIED.js (riga 133)
```javascript
console.log('🔥 WebsiteBuilderUNIFIED: Caricamento immagini per sito', siteId);
const [websiteRes, pagesRes, imagesRes, catalogRes] = await Promise.all([...]);
console.log('🔥 WebsiteBuilderUNIFIED - Risposta images:', imagesRes.data);
```

---

## 🚨 PROBLEMI DA RISOLVERE

### 1. IMMAGINI NON VENGONO CARICATE
**Analisi:**
- Backend: Endpoint `/website/3/images` esiste e funziona
- Frontend: Riceve risposta ma con array vuoto
- Causa probabile: Query SQL non trova immagini nel database

**Query SQL problematica:**
```sql
WHERE df.id_ditta = ?
  AND (dal.entita_tipo = 'WEBSITE_IMAGES' OR dal.entita_tipo = 'website' OR dal.entita_tipo IS NULL)
  AND df.mime_type LIKE 'image/%'
```

**Soluzioni da testare:**
1. Verificare che esistano immagini in `dm_files` per `id_ditta` corretto
2. Verificare collegamenti in `dm_allegati_link`
3. Aggiungere immagini di test nel database
4. Modificare query per essere più permissiva

---

## 🔄 AZIONI DA ESEGUIRE

### Immediate:
1. **Controllare log backend** quando si carica la pagina
2. **Verificare query SQL** con ditta_id corretto
3. **Testare endpoint diretto:** `GET /api/website/3/images`

### Successive:
1. **Popolare database** con immagini di test
2. **Modificare query** se necessario
3. **Testare upload nuove immagini**

---

## 📊 STATO COMPONENTI

| Componente | Stato | Note |
|-------------|-------|------|
| MainApp | ✅ OK | Debug URL attivo |
| StandaloneModule | ✅ OK | Case 'WEBSITE' aggiunto |
| WebsiteBuilderModule | ✅ OK | Funzionante |
| WebsiteBuilderUNIFIED | ✅ OK | Debug immagini attivo |
| ImageGalleryManager | ⚠️ Problema | Riceve 0 immagini |
| StaticPagesManager | ✅ OK | Anteprima funzionante |
| GalleryAdvancedCustomizer | ✅ OK | Errori risolti |

---

## 🛠️ STRUMENTI DEBUG ATTIVI

### Console Frontend (F12)
- `🌐 MainApp - URL CORRENTE` - Mostra URL corrente
- `🔥🔥 ImageGalleryManager MONTATO!` - Stato componenti
- `🔥 WebsiteBuilderUNIFIED - Risposta images` - Risposta API immagini
- `🔥 StaticPagesManager: caricamento preview` - Anteprima pagine

### Backend (Console Server)
- `🔍 [IMAGES] Recupero immagini per sito X`
- `🔍 [IMAGES] Trovate X immagini nel database`
- `🔍 [IMAGES] Formattate X immagini per il frontend`

---

## 📋 CHECKLIST PER NUOVO AMBIENTE

### Setup Base:
- [ ] Node.js v16+
- [ ] MySQL database
- [ ] npm install
- [ ] Configurazione .env

### Verifiche:
- [ ] Database esiste con tabelle necessarie
- [ ] Endpoint `/api/website/3/images` raggiungibile
- [ ] Immagini presenti in `dm_files`
- [ ] Collegamenti `dm_allegati_link` corretti

### Test:
- [ ] Accesso a `http://localhost:3000/`
- [ ] Login e caricamento sito
- [ ] Gestione immagini mostra conteggio > 0
- [ ] Anteprima pagine statiche funzionante
- [ ] Gallery advanced customizer senza errori

---

## 📝 NOTE TECNICHE

### Importanti:
- Il sistema usa **React lazy loading** per i componenti
- Le immagini vengono gestite tramite **S3 storage**
- Il template system è basato su **JSON sections**
- L'antprima pagine usa **iframe** per sicurezza

### File Chiave:
- `routes/website.js` - API endpoints backend
- `services/api.js` - Configurazione API frontend
- `components/website/` - Componenti UI
- `src/shared/AllegatiManager.js` - Gestione file funzionante

---

## ⚡ AZIONI RAPIDE

1. **VERIFICARE DATABASE:**
   ```sql
   SELECT COUNT(*) FROM dm_files WHERE mime_type LIKE 'image/%';
   ```

2. **TESTARE ENDPOINT:**
   ```bash
   curl http://localhost:3001/api/website/3/images
   ```

3. **POPOLARE CON IMMAGINI:**
   Inserire immagini in `dm_files` con `mime_type = 'image/jpeg'`

---

## 🎯 PROSSIMI PASSI

1. **Risolvere caricamento immagini** (priorità alta)
2. **Testare upload nuove immagini**
3. **Verificare integrazione gallerie complete**
4. **Testing completo sistema website builder**

---

*Ultimo aggiornamento: 9 Dicembre 2025 - 16:45*