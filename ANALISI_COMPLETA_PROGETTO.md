# 📋 ANALISI COMPLETA PROGETTO OPERO

## 🏗️ 1. ARCHITETTURA GENERALE

### Backend (Node.js + Express)
- **Framework**: Express.js v4.21.2
- **Database**: MySQL 2 (Knex.js v3.1.0 per query builder)
- **Autenticazione**: JWT con sistema permessi granulari
- **Storage**: S3 compatibile (Aruba Cloud Storage)
- **Linguaggio**: JavaScript ES6+

### Frontend (React)
- **Framework**: React v18.3.1 con React Router
- **Styling**: Tailwind CSS + Heroicons
- **Gestione stati**: Context API + hooks locali
- **Build**: Create React App
- **Mobile**: Capacitor per app iOS/Android

## 🗄️ 2. ARCHITETTURA DATABASE

### Tabelle Principali
- **utenti**: Gestione utenti con sistema multi-ditta
- **ditte**: Aziende con gestione licenze
- **funzioni**: Permessi granulari per modulo
- **utenti_funzioni_override**: Override permessi per utente
- **utenti_sessioni_attive**: Session tracking con heartbeat
- **emails_inviate**: Email tracciate con allegati
- **allegati_tracciati**: Tracking download allegati
- **dm_files**: Document management system

### Sistema Multi-Ditta
- Supporto utenti associati a più ditte tramite `ad_utenti_ditte`
- Login in due passaggi con selezione ditta
- Isolamento completo dati per ditta

## 🔐 3. SISTEMA AUTENTICAZIONE E PERMESSI

### JWT Token Structure
```javascript
{
  id: user_id,
  id_ditta: selected_company_id,
  id_ruolo: role_id,
  permissions: [array_of_permission_codes],
  nome: user_name,
  email: user_email
}
```

### Permessi Granulari
- **Sistema basato su codici funzione** (es. `CT_VIEW`, `CT_EDIT`)
- **Check tramite middleware** `checkPermission(codice_permesso)`
- **Override per utente**: Tabella `utenti_funzioni_override` con azioni `allow/deny`

### Sistema "Portineria"
- **Protezione brute-force**: 4 tentativi max, blocco temporaneo
- **Sessioni attive**: Max utenti concorrenti per licenza
- **Heartbeat**: Pulizia automatica sessioni scadute (20 min)
- **Log accessi**: Tracciamento completo accessi

## 📁 4. SISTEMA STORAGE S3

### Configurazione
- **Provider**: Aruba Cloud Storage (compatibile S3)
- **Bucket**: `operogo`
- **Endpoint**: `http://r3-it.storage.cloud.it`
- **SDK**: AWS SDK v3 per JavaScript

### Struttura Directory
```
mail-attachments/
├── {dittaId}/
│   ├── {userId}/
│   │   ├── {year}/
│   │   │   ├── {month}/
│   │   │   │   ├── {day}/
│   │   │   │   │   └── {uniqueFilename}
```

### Servizi S3
- **Upload sicuro** con metadati estesi
- **Download presigned URL** per accesso diretto
- **Tracking allegati** con statistiche download
- **Cleanup automatico** file temporanei

## 📎 5. GESTIONE ALLEGATI E ARCHIVIO

### Componenti Principali
1. **ArchivioPostaModule.js**: Gestione allegati email inviate
2. **ArchivioDocumentale.js**: Archivio centralizzato documenti
3. **AllegatiManager.js**: Servizio condiviso per upload/download

### Funzionalità
- **Upload multiplo** con drag & drop
- **Anteprima immagini** con lazy loading
- **Privacy control**: Download autorizzato per destinatari
- **Tracking statistiche**: Visualizzazioni e download
- **Filtri avanzati**: Per privacy, tipo entità, data

### Sistema Condivisione CDA
- File condivisi tramite token univoci
- Controllo accessi con validazione temporale
- Download diretto da S3 con URL presigned

## 🌐 6. WEBSITE BUILDER

### Architettura
- **Tabella**: `siti_web_aziendali` per metadati siti
- **Pagine**: Gestione contenuti statici
- **Integrazione catalogo**: Sincronizzazione prodotti da sistema
- **Immagini**: Utilizzo dm_files per media

### Funzionalità
- **Template personalizzabili** per diversi tipi sito
- **Content management** con editor WYSIWYG
- **Multi-site support**: Gestione più siti per ditta
- **SEO optimization**: Meta tags e URL structure

## 🔑 7. PERMESSI BACKEND PER MODULO

### Catalogo (CT)
- `CT_VIEW` - Visualizzazione catalogo
- `CT_EDIT` - Modifica prodotti
- `CT_DELETE` - Eliminazione prodotti
- `CT_LISTINI` - Gestione listini

### Archivio (AR)
- `AR_VIEW` - Visualizzazione documenti
- `AR_UPLOAD` - Upload documenti
- `AR_DOWNLOAD` - Download documenti
- `AR_DELETE` - Cancellazione documenti

### Posta (ML)
- `ML_SEND` - Invio email
- `ML_VIEW_SENT` - Visualizza email inviate
- `ML_TEMPLATES` - Gestione template

### Website (WS)
- `WS_VIEW` - Visualizzazione siti
- `WS_EDIT` - Modifica contenuti
- `WS_PUBLISH` - Pubblicazione sito

## 📊 8. ANALISI CONFIGURAZIONI .ENV

### Database Locale
- ✅ MySQL su localhost:3306
- ✅ Database: `operodb`
- ✅ Utente: `root` (sviluppo)

### Email System
- ✅ SMTP Aruba: smtps.aruba.it:465
- ✅ Account: opero@difam.it
- ✅ Mittente: "Gestionale Opero"

### Storage S3
- ✅ Aruba Cloud Storage configurato
- ✅ Access key e secret key impostate
- ✅ Bucket operogo disponibile

### Sicurezza
- ⚠️ JWT_SECRET: chiave di sviluppo da cambiare in produzione
- ✅ FRONTEND_URL: http://localhost:3000
- ⚠️ ENCRYPTION_SECRET: da migliorare per produzione

## 🔧 9. MODULI PRINCIPALI

### 1. Gestione Contabile (contsmart)
- Prima nota, bilancio, partite aperte
- Scritture automatiche e semi-automatiche

### 2. Catalogo/Magazzino
- Gestione prodotti, giacenze, listini
- Integrazione acquisti/vendite

### 3. Archivio Documentale
- Upload, categorizzazione, ricerca documenti
- Integrazione S3 per storage

### 4. Posta Elettronica
- Invio email con tracking
- Gestione allegati e template

### 5. Website Builder
- Creazione siti web aziendali
- Integrazione catalogo prodotti

## 🚀 10. TECNOLOGIE UTILIZZATE

### Backend Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL + Knex.js
- **Autenticazione**: JWT + bcrypt
- **Storage**: AWS S3 SDK
- **Email**: Nodemailer

### Frontend Stack
- **Framework**: React 18
- **Routing**: React Router v7
- **Styling**: Tailwind CSS
- **Icons**: Heroicons, Lucide React
- **HTTP Client**: Axios
- **Mobile**: Capacitor

### Integration & Tools
- **PDF Generation**: PDFKit, jsPDF
- **CSV Handling**: PapaParse
- **Image Processing**: Background removal AI
- **QR/Barcode Scanner**: ZXing
- **Table Components**: AG-Grid

## 📝 NOTE AGGIUNTIVE

### Implementazione Archivio in Altri Moduli
Per implementare il sistema di archiviazione in nuovi moduli:

1. **Utilizzare il servizio S3Service** per upload/download
2. **Seguire la struttura directory** standard per coerenza
3. **Implementare il tracking** con allegati_tracciati
4. **Gestire permessi** tramite codici funzione dedicati
5. **Utilizzare AllegatiManager** per UI consistency

### Props Necessarie per Componenti Archivio
```javascript
const props = {
  id_ditta: companyId,
  id_utente: userId,
  tipoEntita: 'catalogo', // o altro tipo
  idEntita: entityId,
  permissions: ['AR_UPLOAD', 'AR_DOWNLOAD'],
  onUploadComplete: callbackFunction,
  existingFiles: filesArray
};
```

Il sistema è progettato per essere modulare, scalabile e multi-tenant, con un focus particolare sulla sicurezza dei dati e sulla gestione dei permessi granulari. L'architettura S3 garantisce storage illimitato e accesso rapido ai file, mentre il sistema di permessi_override permette personalizzazioni flessibili per singoli utenti.