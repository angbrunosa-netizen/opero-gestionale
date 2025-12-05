# Documentazione Tecnica - Modulo Gestione Posta Elettronica

## Indice
1. [Panoramica del Sistema](#panoramica-del-sistema)
2. [Architettura del Sistema](#architettura-del-sistema)
3. [Componenti Frontend](#componenti-frontend)
4. [API Endpoints](#api-endpoints)
5. [Schema Database](#schema-database)
6. [Integrazioni Esterne](#integrazioni-esterne)
7. [Flussi di Lavoro](#flussi-di-lavoro)
8. [Sicurezza e Privacy](#sicurezza-e-privacy)
9. [Suggerimenti per Sviluppi Futuri](#suggerimenti-per-sviluppi-futuri)
10. [Troubleshooting e Manutenzione](#troubleshooting-e-manutenzione)

---

## Panoramica del Sistema

Il sistema di gestione della posta elettronica di Opero è una soluzione completa che integra:

- **Gestione Email**: Invio, ricezione, lettura e archiviazione
- **Archivio Documentale**: Gestione sicura degli allegati con tracking
- **Email Marketing**: Tracciamento avanzato delle aperture (specialmente Gmail)
- **Rubrica Contatti**: Integrazione con il sistema utenti

### Moduli Principali
1. **MailModule.js** - Interfaccia principale per la gestione email
2. **ArchivioPostaModule.js** - Gestione archivio allegati con privacy privata
3. **routes/mail.js** - API per operazioni email
4. **routes/archivio-posta.js** - API per gestione allegati

---

## Architettura del Sistema

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API    │    │  Database       │
│                 │    │                  │    │                 │
│ MailModule.js   │◄──►│  routes/mail.js  │◄──►│  ditta_mail_    │
│ ArchivioPosta   │    │  routes/         │    │  accounts       │
│ Module.js       │    │  archivio-posta  │    │  email_inviate  │
│                 │    │  .js             │    │  allegati_      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
          │                       │                       │
          ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ React Components│    │  Node.js         │    │  MySQL          │
│ Context API     │    │  Express         │    │  Tables         │
│ Responsive UI   │    │  Nodemailer      │    │  Relations      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                    ┌──────────────────┐
                    │  S3 Storage      │
                    │  File Tracking   │
                    │  Download URLs   │
                    └──────────────────┘
```

### Stack Tecnologico
- **Frontend**: React, React Quill, Heroicons, Tailwind CSS
- **Backend**: Node.js, Express, Knex.js
- **Email**: Nodemailer, IMAP, Mailparser
- **Storage**: AWS S3 (o compatibile)
- **Database**: MySQL
- **Autenticazione**: JWT

---

## Componenti Frontend

### MailModule.js
**Responsabilità**: Interfaccia principale per la composizione e gestione email

#### Funzionalità Principali
- **Composizione Email**: Editor rich text con React Quill
- **Gestione Allegati**: Upload multipli con tracking
- **Rubrica Integrata**: Selezione contatti da sistema
- **Quick Compose**: Integrazione con altri moduli
- **Responsive Design**: Ottimizzato per mobile e desktop

#### Stati Principali
```javascript
{
  currentView: 'compose' | 'inbox' | 'sent',
  selectedAccountId: number,
  emailList: Array,
  selectedEmail: Object,
  attachments: Array,
  isMobile: boolean,
  sidebarOpen: boolean
}
```

#### Hook Personalizzati
- `useQuickCompose()` - Composizione rapida da altri moduli
- `useAuth()` - Contesto autenticazione

### ArchivioPostaModule.js
**Responsabilità**: Gestione archivio allegati con privacy e tracking

#### Funzionalità Principali
- **Archivio Centralizzato**: Tutti gli allegati inviati
- **Privacy Privata**: Accesso controllato per utente/azienda
- **Download Tracciato**: Logging accessi e statistiche
- **Gestione S3**: Integrazione storage cloud
- **Mobile Optimized**: UI responsive per mobile

#### Filtri e Ricerca
- Nome file, destinatario, oggetto
- Stato download (scaricati/non scaricati)
- Ordinamento per data, dimensione, nome

---

## API Endpoints

### Mail API (`/api/mail`)

#### Account Email
```
GET  /api/mail/my-mail-accounts     - Account dell'utente
GET  /api/mail/mail-accounts        - Account azienda
```

#### Gestione Email
```
GET    /api/mail/emails             - Lista email ricevute
GET    /api/mail/emails/:uid        - Dettaglio singola email
POST   /api/mail/send-email         - Invia nuova email
POST   /api/mail/send-reminder      - Invia sollecito pagamento
GET    /api/mail/sent-emails        - Email inviate
POST   /api/mail/hide-email/:uid    - Nascondi email
DELETE /api/mail/emails/:uid        - Elimina email (admin)
```

#### Tracciamento Email
```
GET /api/track/open/:trackingId     - Pixel tracking aperture
GET /api/track/download/:downloadId - Download allegati tracciati
```

### Archivio Posta API (`/api/archivio-posta`)

#### Gestione Allegati
```
GET    /api/archivio-posta/allegati          - Lista allegati
GET    /api/archivio-posta/allegato/:id      - Dettaglio allegato
GET    /api/archivio-posta/statistiche       - Statistiche allegati
GET    /api/archivio-posta/download/:id      - Download sicuro
DELETE /api/archivio-posta/allegato/:id      - Elimina allegato
```

---

## Schema Database

### Tabelle Principali

#### `ditta_mail_accounts`
Account email configurati per azienda
```sql
CREATE TABLE ditta_mail_accounts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  id_ditta INT NOT NULL,
  nome_account VARCHAR(255),
  email_address VARCHAR(255),
  imap_host VARCHAR(255),
  imap_port INT,
  smtp_host VARCHAR(255),
  smtp_port INT,
  auth_user VARCHAR(255),
  auth_pass TEXT, -- Encrypted
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `utente_mail_accounts`
Associazione utenti-account email
```sql
CREATE TABLE utente_mail_accounts (
  id_utente INT NOT NULL,
  id_mail_account INT NOT NULL,
  PRIMARY KEY (id_utente, id_mail_account)
);
```

#### `email_inviate`
Email inviate con tracking
```sql
CREATE TABLE email_inviate (
  id INT PRIMARY KEY AUTO_INCREMENT,
  id_ditta INT,
  id_utente_mittente INT,
  destinatari TEXT NOT NULL,
  cc TEXT,
  bcc TEXT,
  oggetto VARCHAR(255),
  corpo LONGTEXT,
  tracking_id VARCHAR(255) UNIQUE,
  data_invio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  aperta BOOLEAN DEFAULT FALSE,
  data_prima_apertura TIMESTAMP,
  tracking_count INT DEFAULT 0
);
```

#### `allegati_tracciati`
Allegati con download tracking
```sql
CREATE TABLE allegati_tracciati (
  id INT PRIMARY KEY AUTO_INCREMENT,
  id_email_inviata INT NOT NULL,
  nome_file_originale VARCHAR(255),
  percorso_file_salvato VARCHAR(255),
  tipo_file VARCHAR(100),
  dimensione_file INT,
  scaricato BOOLEAN DEFAULT FALSE,
  data_primo_download TIMESTAMP,
  download_id VARCHAR(255) UNIQUE,
  download_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `stati_lettura`
Stati lettura email ricevute
```sql
CREATE TABLE stati_lettura (
  id INT PRIMARY KEY AUTO_INCREMENT,
  id_utente INT NOT NULL,
  email_uid VARCHAR(255),
  data_lettura TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `email_nascoste`
Email nascoste dall'utente
```sql
CREATE TABLE email_nascoste (
  id INT PRIMARY KEY AUTO_INCREMENT,
  id_utente INT NOT NULL,
  email_uid VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Integrazioni Esterne

### 1. Storage S3 (o compatibile)
- **Upload Allegati**: Archiviazione sicura con metadati
- **Download Tracking**: URL firmate temporanee
- **Fallback Local**: Backup se S3 non disponibile

### 2. Servizi Email (IMAP/SMTP)
- **Gmail Support**: Configurazione specializzata per Gmail
- **Microsoft 365**: Supporto Exchange/Office 365
- **Provider Standard**: Configurazione generica SMTP/IMAP

### 3. Email Tracking
- **Pixel Tracking**: Multi-strategy per Gmail
- **Gmail Optimized**: Tecniche anti-block
- **Fallback Link**: Tracking alternativo

---

## Flussi di Lavoro

### 1. Invio Email con Allegati
```
1. Utente compone email + seleziona allegati
2. Upload allegati su S3 con metadati
3. Salvataggio in email_inviate con tracking_id
4. Salvataggio allegati in allegati_tracciati
5. Generazione HTML con tracking pixel
6. Invio tramite Nodemailer
7. Logging operazione completata
```

### 2. Download Allegato Sicuro
```
1. Utente clicca download allegato
2. Sistema decrittografa download_id
3. Verifica autorizzazioni utente
4. Genera URL S3 firmata (5 minuti)
5. Registra download nel database
6. Redirect a S3 per download
```

### 3. Email Tracking Aperture
```
1. Destinatario apre email
2. Client email carica pixel tracking
3. Sistema registra apertura + timestamp
4. Aggiorna contatori in database
5. Log statisthe per reportistica
```

---

## Sicurezza e Privacy

### 1. Crittografia
- **Password Account**: AES-256-CBC
- **Download URLs**: Crittografia temporale
- **Database**: Sensitive data encrypted

### 2. Access Control
- **Autenticazione JWT**: Verifica token
- **Permessi RUOLO**: Livelli accesso
- **Privacy Allegati**: Accesso solo mittente/admin azienda

### 3. Validazioni
- **File Upload**: Controllo estensioni pericolose
- **Input Sanitization**: XSS prevention
- **SQL Injection**: Prepared statements

### 4. Tracking Privacy
- **GDPR Compliance**: Informativa tracking
- **Opt-out Possibility**: Disabilitazione tracking
- **Data Minimization**: Solo dati necessari

---

## Suggerimenti per Sviluppi Futuri

### 1. Funzionalità Avanzate

#### Email Templates
- **Template Library**: Salvataggio template riutilizzabili
- **Dynamic Variables**: Merge tags personalizzati
- **Template Builder**: Editor drag-and-drop

#### Email Marketing
- **Campaign Management**: Invio massivo email
- **A/B Testing**: Test subject e contenuti
- **Automation Rules**: Trigger basati su eventi

#### Analytics Dashboard
- **Open Rate Tracking**: Statistiche aperture
- **Click Tracking**: Link tracking avanzato
- **Performance Metrics**: Report dettagliati

### 2. Integrazioni

#### CRM Integration
- **Contact Sync**: Sincronizzazione rubrica CRM
- **Deal Tracking**: Email associate a opportunità
- **Lead Scoring**: Punteggio basato interazioni

#### Calendar Integration
- **Meeting Scheduler**: Pianificazione incontri
- **Event Reminders**: Notifiche automatiche
- **Availability Sharing**: Condivisione disponibilità

#### Document Management
- **Document Generation**: Generazione PDF automatici
- **Version Control**: Versioning documenti
- **Collaboration**: Commenti e approvazioni

### 3. Mobile Enhancements

#### Push Notifications
- **New Email Alerts**: Notifiche real-time
- **Important Emails**: Prioritizzazione messaggi
- **Do Not Disturb**: Gestione silenziamento

#### Offline Mode
- **Draft Saving**: Salvataggio locale bozze
- **Offline Queue**: Coda invio offline
- **Sync Mechanism**: Sincronizzazione quando online

### 4. AI & Automation

#### Smart Compose
- **Predictive Text**: Suggerimenti testo
- **Smart Replies**: Risposte rapide
- **Tone Analysis**: Analisi tono messaggio

#### Email Categorization
- **Automatic Folders**: Categorizzazione intelligente
- **Priority Detection**: Identificazione importante
- **Spam Enhancement**: Miglioramento filtro spam

#### Workflow Automation
- **Rule Engine**: Automatizzazione processi
- **Webhook Integration**: Trigger esterni
- **Custom Actions**: Azioni personalizzate

### 5. Performance & Scalability

#### Email Queue System
- **Background Processing**: Elaborazione asincrona
- **Retry Logic**: Gestione tentativi falliti
- **Rate Limiting**: Controllo frequenza invio

#### Caching Layer
- **Redis Cache**: Cache dati frequenti
- **CDN Integration**: Ottimizzazione asset
- **Database Optimization**: Query tuning

#### Microservices Architecture
- **Email Service**: Servizio dedicato email
- **File Service**: Servizio gestione file
- **Notification Service**: Servizio notifiche

---

## Troubleshooting e Manutenzione

### Problemi Comuni

#### 1. Gmail Tracking non Funziona
**Sintomi**: Email inviate ma non tracciate aperture
**Soluzioni**:
- Verificare configurazione multi-strategy pixel
- Controllare block immagini da client Gmail
- Usare fallback link tracking

#### 2. Upload Allegati Fallisce
**Sintomi**: Errore upload S3 o salvataggio locale
**Soluzioni**:
- Verificare credenziali S3
- Controllare spazio disco disponibile
- Validare limiti dimensione file

#### 3. IMAP Connection Error
**Sintomi**: Impossibile recuperare email ricevute
**Soluzioni**:
- Verificare configurazione IMAP provider
- Controllare credenziali account
- Testare connettività firewall

### Manutenzione Programmata

#### Daily
- Monitoraggio code email inviate
- Verifica errori upload S3
- Pulizia logs temporanei

#### Weekly
- Analisi statistiche tracking
- Pulizia allegati scaduti
- Backup database email

#### Monthly
- Aggiornamento template email
- Manutenzione indici database
- Revisione policy sicurezza

### Monitoring & Alerting

#### Metriche Importanti
- Email delivery rate
- Tracking open rate
- Storage utilization
- API response times

#### Alert Configuration
- Email delivery failures
- S3 storage errors
- High error rates
- Performance degradation

---

## Contatti Team Sviluppo

Per supporto tecnico o richieste di sviluppo:
- **Backend Development**: API e integrazioni
- **Frontend Development**: UI/UX e componenti
- **DevOps**: Infrastructure e deployment
- **QA & Testing**: Test automatici e manuali

---

*Documento generato il 5 Dicembre 2025 - Versione 1.0*