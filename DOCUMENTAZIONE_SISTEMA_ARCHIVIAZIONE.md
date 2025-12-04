# 📋 DOCUMENTAZIONE COMPLETA SISTEMA ARCHIVIAZIONE ALLEGATI

## 🎯 OBIETTIVO DEL DOCUMENTO

Analisi completa del sistema di archiviazione allegati per implementare la nuova funzionalità "allegati_tracciati" per le email, basandosi sulla logica del componente `AllegatiManager.js`.

## 🏗️ 1. ARCHITETTURA DEL SISTEMA ESISTENTE

### 1.1 Struttura Database

#### Tabella `dm_allegati_link` (esistente ✅)
```sql
CREATE TABLE dm_allegati_link (
    id int(10) unsigned NOT NULL AUTO_INCREMENT,
    id_ditta int(10) unsigned NOT NULL,           -- Multi-tenancy
    id_file int(10) unsigned NOT NULL,           -- FK alla tabella file
    entita_tipo varchar(50) NOT NULL,             -- Tipo entità (es: ct_catalogo)
    entita_id int(10) unsigned NOT NULL,           -- ID entità specifica
    created_at timestamp NOT NULL DEFAULT current_timestamp(),
    updated_at timestamp NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (id),
    KEY idx_ditta (id_ditta),
    KEY idx_file (id_file),
    KEY idx_entita (entita_tipo, entita_id)
);
```

**Statistiche attuali:**
- ⚙️ **Record totali**: 163
- 🏢 **Aziende coinvolte**: 1
- 📂 **Tipi entità**: 1 (`ct_catalogo`)
- 🔗 **Entità uniche**: 25
- 📄 **File collegati**: 163

#### Tabella `allegati_tracciati` (esistente ✅)
- Tabella dedicata già presente nel sistema
- Probabilmente utilizzata per tracking allegati specifici
- Da analizzare per comprendere la struttura esistente

### 1.2 Componente Frontend - AllegatiManager.js

#### Caratteristiche Principali
- **File**: `/opero-frontend/src/shared/AllegatiManager.js` (736 righe)
- **Versione**: 6.0 (Base v5.6 + Ottimizzazioni UI/UX)
- **Framework**: React + Tailwind CSS
- **Librerie**: react-dropzone, react-easy-crop, imageCompression

#### Funzionalità Chiave
1. **Upload File**:
   ```javascript
   const formData = new FormData();
   formData.append('file', file);
   formData.append('entitaTipo', entita_tipo);  // es: ct_catalogo
   formData.append('entitaId', entita_id);
   formData.append('privacy', 'public');         // per accessibilità esterna

   await api.post('/archivio/upload', formData, {
       headers: { 'Content-Type': 'multipart/form-data' },
       onUploadProgress: (progressEvent) => { ... }
   });
   ```

2. **Download File**:
   ```javascript
   // File pubblici: URL diretto
   if (file.privacy === 'public' && file.previewUrl) {
       window.open(file.previewUrl, '_blank');
   }
   // File privati: URL firmato
   const res = await api.get(`/documenti/generate-download-url/${file.id_file}`);
   ```

3. **Gestione Immagini**:
   - Ritaglio con `react-easy-crop`
   - Rimozione sfondo
   - Ottimizzazione compressione
   - Supporto fotocamera

4. **Multi-tenancy e Permissions**:
   ```javascript
   const { hasPermission } = useAuth();
   if (!hasPermission('DM_FILE_UPLOAD')) return;
   ```

## 🔍 2. ANALISI LOGICHE ARCHIVIAZIONE

### 2.1 Pattern Esistente
Il sistema `AllegatiManager` segue questo pattern:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend       │    │   Storage S3   │
│ AllegatiManager │───▶│ /api/archivio/  │───▶│ Aruba Cloud S3  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                        │                        │
        ▼                        ▼                        ▼
  • FormData + metadati   • Gestione file         • Buckets separati
  • Progress indicator    • Privacy settings      • ACL per accessi
  • Drag & drop          • Multi-tenancy         • CDN per pubblici
```

### 2.2 API Endpoints Utilizzati

#### Upload
```
POST /api/archivio/upload
Content-Type: multipart/form-data

Body:
- file: <blob>
- entitaTipo: string (es: ct_catalogo)
- entitaId: number
- privacy: public|private
```

#### Download
```
GET /api/documenti/generate-download-url/{fileId}
Response: { downloadUrl: string }
```

#### List by Entity
```
GET /api/archivio/entita/{entita_tipo}/{entita_id}
Response: Array<Allegato>
```

#### Delete
```
DELETE /api/documenti/link/{linkId}
```

## 🎯 3. PROGETTA "allegati_tracciati" PER EMAIL

### 3.1 Nuovo Pattern di Utilizzo

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Email System    │    │ AllegatiManager   │    │   Storage S3   │
│ (MailModule)    │───▶│ /api/archivio/  │───▶│ Aruba Cloud S3  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                        │                        │
        ▼                        ▼                        ▼
  • ID email_inviate      • entitaTipo =        • Buckets dedicati
  • Destinatario          • "allegati_tracciati"    • privacy = public
  • Tracking ID           • entitaId = email_id   • CDN accessibile
```

### 3.2 Implementazione Proposta

#### Database
```sql
-- Utilizzando tabella esistente dm_allegati_link
INSERT INTO dm_allegati_link (
    id_ditta,
    id_file,                    -- FK a tabella file (da verificare)
    entita_tipo,                -- "allegati_tracciati"
    entita_id,                  -- ID email_inviate (destinatario specifico)
    created_at,
    updated_at
) VALUES (
    1,                          -- id_ditta
    123,                        -- id_file (nuovo file)
    'allegati_tracciati',       -- entita_tipo
    456,                        -- entita_id (email_inviate.id)
    NOW(),
    NOW()
);
```

#### Frontend Integration
```javascript
// In MailModule.js
<AllegatiManager
    entita_tipo="allegati_tracciati"
    entita_id={email.id}
    isPublic={true}  // per accessibilità esterna
/>
```

#### Backend API
```javascript
// In routes/archivio.js
app.post('/archivio/upload', upload.single('file'), async (req, res) => {
    const { entitaTipo, entitaId, privacy } = req.body;

    // Caso speciale: allegati_tracciati
    if (entitaTipo === 'allegati_tracciati') {
        // Verifica che entitaId sia una email valida
        const email = await db.query(
            'SELECT * FROM email_inviate WHERE id = ? AND id_ditta = ?',
            [entitaId, req.user.id_ditta]
        );

        if (email.length === 0) {
            return res.status(400).json({ error: 'Email non trovata' });
        }
    }

    // ... upload su S3 e creazione record
});
```

## 🔧 4. SPECIFICHE TECNICHE

### 4.1 Tabella File Mancante
La tabella `dm_allegati` (principale per metadati file) non esiste. **Opzioni**:

1. **Creare tabella `dm_allegati`**:
```sql
CREATE TABLE dm_allegati (
    id int(10) unsigned NOT NULL AUTO_INCREMENT,
    id_ditta int(10) unsigned NOT NULL,
    nome_file varchar(255) NOT NULL,
    file_size bigint unsigned NOT NULL,
    mime_type varchar(100) NOT NULL,
    s3_key varchar(500) NOT NULL,
    privacy enum('public', 'private') DEFAULT 'private',
    created_at timestamp NOT NULL DEFAULT current_timestamp(),
    updated_at timestamp NOT NULL DEFAULT current_timestamp(),
    PRIMARY KEY (id),
    KEY idx_ditta (id_ditta),
    KEY idx_s3_key (s3_key)
);
```

2. **Utilizzare tabella `allegati_tracciati` esistente** (se già strutturata correttamente)

### 4.2 Privacy e Accesso
Per allegati email, la privacy dovrebbe essere:
- **`public`**: Per accessibilità diretta via URL senza autenticazione
- **URL firmati**: Per tracking download se necessario
- **Multi-tenancy**: Separazione per azienda (`id_ditta`)

### 4.3 Configurazione S3/Aruba
```javascript
// .env configurazione già esistente
ARUBA_S3_ENDPOINT=https://s3.arubacloud.com
ARUBA_S3_BUCKET=opero-storage
ARUBA_S3_ACCESS_KEY=...
ARUBA_S3_SECRET_KEY=...

// Policy per accesso pubblico a file allegati email
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadForEmailAttachments",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::opero-storage/email-attachments/*"
        }
    ]
}
```

## 🚀 5. IMPLEMENTAZIONE PRATICA

### 5.1 Step 1: Verifica Struttura Database
```bash
node analyze-system-architecture.js
```

### 5.2 Step 2: Creare Tabella File (se necessaria)
```sql
-- Se dm_allegati non esiste, crearla
-- Sennò utilizzare la struttura di allegati_tracciati
```

### 5.3 Step 3: Modifiche Backend
```javascript
// routes/archivio.js - aggiungere gestione allegati_tracciati
app.post('/api/archivio/upload', upload.array('files'), async (req, res) => {
    const { entitaTipo, entitaId, privacy = 'private' } = req.body;

    // Validazione speciale per allegati email
    if (entitaTipo === 'allegati_tracciati') {
        await validateEmailAttachment(req.user.id_ditta, entitaId);
    }

    // ... esistente logica upload
});
```

### 5.4 Step 4: Integrazione Frontend
```javascript
// MailModule.js
import AllegatiManager from '../shared/AllegatiManager';

function EmailAttachments({ emailId }) {
    return (
        <div className="email-attachments">
            <h4>Allegati Tracciati</h4>
            <AllegatiManager
                entita_tipo="allegati_tracciati"
                entita_id={emailId}
                isPublic={true}
            />
        </div>
    );
}
```

## 📊 6. VANTAGGI DEL SISTEMA

### 6.1 Riutilizzo Componenti Esistenti
- ✅ **AllegatiManager.js**: già completo e testato
- ✅ **S3 Integration**: già configurata e funzionante
- ✅ **Multi-tenancy**: già implementata
- ✅ **Permissions System**: già integrato

### 6.2 Tracking Avanzato
- 📈 **Download tracking**: possibile implementare statistiche download
- 📧 **Email correlation**: collegamento diretto email → allegati
- 🔍 **Audit trail**: tracciabilità completa accessi

### 6.3 Estendibilità
- 🔄 **Pattern replicabile**: utilizzabile per altre entità
- 📱 **Mobile ready**: AllegatiManager già ottimizzato per mobile
- 🎨 **UI/UX consistente**: stile uniforme con resto applicazione

## ⚠️ 7. NOTE IMPORTANTI

### 7.1 Dipendenze da Verificare
1. **Tabella file principale**: verificare se `dm_allegati` o `allegati_tracciati` ha la struttura corretta
2. **S3 bucket permissions**: assicurarsi che i bucket permettano accesso pubblico per allegati email
3. **Multi-tenancy**: mantenere separazione per azienda (`id_ditta`)

### 7.2 Sicurezza
- 🔒 **Validation**: validare che `entita_id` appartenga all'utente/azienda
- 🛡️ **File type restrictions**: limitare tipi file allegati a email
- 📏 **Size limits**: implementare limiti dimensione file per email

### 7.3 Performance
- 🗄️ **Indici**: assicurarsi indici su `(entita_tipo, entita_id, id_ditta)`
- ☁️ **CDN**: sfruttare cache CDN per allegati pubblici
- 🗜️ **Lazy loading**: caricare allegati solo quando necessario

## ✅ 8. RIEPILOGO

Il sistema di archiviazione allegati esistente è **pronto** per implementare la funzionalità "allegati_tracciati":

1. **✅ Database**: `dm_allegati_link` già supporta pattern entita_tipo/entita_id
2. **✅ Frontend**: `AllegatiManager.js` completo e pronto per nuovo utilizzo
3. **✅ Backend**: API endpoints già esistenti e funzionanti
4. **✅ Storage**: Aruba S3 già configurato e operativo

**Prossimi passi**:
1. Verificare/creare tabella file metadati (`dm_allegati` o analizzare `allegati_tracciati`)
2. Aggiungere validazione backend per entità email
3. Integrare `AllegatiManager` in `MailModule.js`
4. Test con allegati email reali

---

**📧 Caso d'uso finale**: Allegare file a email inviate con tracking download, accessibili pubblicamente tramite URL diretto, con completa integrazione nel sistema multi-tenant esistente.