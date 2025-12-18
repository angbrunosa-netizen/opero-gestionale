# Sistema Blog - Integrazione AllegatiManager

## 🎯 **Panoramica della Soluzione**

Il sistema blog ora utilizza l'**AllegatiManager** per il caricamento dei file PDF su storage S3, sostituendo il sistema di upload locale precedente.

## 🏗️ **Architettura Integrata**

### Frontend (Next.js)
```
opero-frontend/src/components/cms/BlogManager.js
├── AllegatiManager importato e integrato
├── Upload PDF gestito da AllegatiManager
└── File caricati su S3 con entita_tipo="Blog"
```

### Backend (Node.js/Express)
```
/opero/routes/admin_blog.js
├── Rimozione upload diretto file
├── Focus su salvataggio dati post
└── PDF URL gestito tramite AllegatiManager

/opero/routes/archivio.js
├── Endpoint /archivio/upload (gestisce S3)
├── Entità "Blog" con privacy "public"
└── File accessibili pubblicamente
```

### Storage S3
```
s3://bucket/archivio/blog/{postId}/{filename}
├── PDF accessibili via URL pubblico
├── Cache ottimizzata
└── ACL pubblica per frontend
```

## 🔄 **Flusso di Upload PDF**

### 1. Utente seleziona PDF
- **Componente**: `AllegatiManager` in `BlogManager`
- **Entità**: `entita_tipo="Blog"`
- **ID Entità**: `entita_id={postId}`

### 2. Upload su S3
- **Endpoint**: `POST /archivio/upload`
- **Privacy**: `privacy="public"`
- **Storage**: File caricato su bucket S3

### 3. Recupero File
- **API**: `GET /archivio/entita/Blog/{postId}`
- **URL Pubblico**: `previewUrl` accessibile dal frontend

## 📝 **Modifiche Applicate**

### BlogManager.js
```javascript
// Import dell'AllegatiManager
import AllegatiManager from '../../shared/AllegatiManager';

// Sostituzione input file PDF
{editingPost ? (
  <AllegatiManager
    entita_tipo="Blog"
    entita_id={editingPost.id}
    isPublic={true}
    onFilesUploaded={() => loadPostAllegati(editingPost.id)}
  />
) : (
  <div className="text-center text-gray-500">
    Salva prima il post per caricare allegati PDF
  </div>
)}

// Funzione per caricare allegati del post
const loadPostAllegati = async (postId) => {
  const res = await api.get(`/archivio/entita/Blog/${postId}`);
  if (res.data) {
    const pdfAllegato = res.data.find(a =>
      a.file_name_originale.toLowerCase().endsWith('.pdf')
    );
    if (pdfAllegato) {
      setPostForm(prev => ({
        ...prev,
        pdf_url: pdfAllegato.previewUrl,
        pdf_filename: pdfAllegato.file_name_originale
      }));
    }
  }
};
```

### Backend semplificato
```javascript
// Rimozione gestione upload diretto
// Il PDF viene gestito completamente da AllegatiManager
// Il backend salva solo i metadati del post
```

## 🚀 **Vantaggi della Soluzione**

### ✅ **Storage S3 Ottimizzato**
- File PDF caricati direttamente su S3
- Cache CDN automatica
- Accesso pubblico senza proxy

### ✅ **Upload Robusto**
- Sistema upload già testato e affidabile
- Gestione errori e retry automatici
- Supporto drag & drop

### ✅ **Multi-tenant Isolato**
- File organizzati per entità Blog
- Isolamento per postId
- ACL pubblica per accesso frontend

### ✅ **Integrazione Semplice**
- Componente AllegatiManager drop-in
- API archivio esistente e stabile
- Nessuna modifica backend complessa

## 📋 **Istruzioni per l'Uso**

### Per gli Sviluppatori
1. **Nuovo Post**: Salva prima il post per ottenere ID
2. **Carica PDF**: Usa AllegatiManager per upload S3
3. **Accesso**: File disponibili immediatamente su frontend

### Per gli Utenti Finali
1. Crea articolo blog normale
2. Salva l'articolo
3. Usa la sezione "Carica Documento PDF"
4. Il PDF sarà subito visibile nell'articolo

## 🔍 **Testing e Debug**

### Test Upload
```javascript
// Verifica upload completato
const res = await api.get('/archivio/entita/Blog/123');
console.log('Allegati:', res.data);
```

### Test Accesso PDF
```javascript
// Verifica URL PDF accessibile
const pdfUrl = post.pdf_url; // Da API blog posts
window.open(pdfUrl, '_blank');
```

## 🎉 **Stato Sistema**

- ✅ **Upload S3**: Funzionante
- ✅ **Frontend**: Integrato
- ✅ **Backend**: Ottimizzato
- ✅ **Database**: Compatibile
- ✅ **PDF Viewer**: Funzionante

Il sistema blog è ora **completamente integrato** con l'AllegatiManager per gestire i file PDF su storage S3! 🚀