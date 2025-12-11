# Documentazione Operazioni e Modifiche Database
**Data:** 11 Dicembre 2024
**Sessione:** Sviluppo e Integrazione Sistema Website Builder

## Sommario
Questa sessione ha completato l'integrazione del sistema di Website Builder con il sistema di archivio esistente, ha risolto problemi critici di persistenza delle immagini e ha implementato un completo sistema di generazione di siti statici Next.js con deployment su VPS.

---

## 1. Modifiche al Database

### 1.1 Nuova Tabella: `immagini_sito_web`
```sql
CREATE TABLE immagini_sito_web (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_sito_web INT NOT NULL,
    id_file INT NOT NULL,
    blocco_sezione VARCHAR(50), -- es. 'header', 'gallery', 'content'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_sito_web) REFERENCES siti_web_aziendali(id),
    FOREIGN KEY (id_file) REFERENCES dm_files(id),
    INDEX idx_sito_web (id_sito_web),
    INDEX idx_file (id_file)
);
```

### 1.2 Modifiche Tabella: `pagine_sito_web`
**Nuove colonne aggiunte:**
```sql
ALTER TABLE pagine_sito_web ADD COLUMN template_name VARCHAR(100) DEFAULT 'default';
ALTER TABLE pagine_sito_web ADD COLUMN contenuto_json JSON AFTER contenuto;
ALTER TABLE pagine_sito_web ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
```

### 1.3 Modifiche Tabella: `siti_web_aziendali`
**Nuove colonne per il deployment:**
```sql
ALTER TABLE siti_web_aziendali ADD COLUMN deploy_status ENUM('none', 'generating', 'generated', 'deploying', 'deployed', 'error', 'cleaned') DEFAULT 'none';
ALTER TABLE siti_web_aziendali ADD COLUMN deploy_domain VARCHAR(255);
ALTER TABLE siti_web_aziendali ADD COLUMN deploy_path VARCHAR(500);
ALTER TABLE siti_web_aziendali ADD COLUMN deployed_at TIMESTAMP NULL;
ALTER TABLE siti_web_aziendali ADD COLUMN deploy_error TEXT;
ALTER TABLE siti_web_aziendali ADD COLUMN cleaned_at TIMESTAMP NULL;
```

---

## 2. Nuovi File Creati

### 2.1 Servizi Backend
- **`services/SiteGenerator.js`** - Servizio principale per generazione siti statici Next.js
- **`services/VPSDeployer.js`** - Servizio per deployment automatico su VPS tramite SSH
- **`services/WebsiteImageService.js`** - Servizio per gestione immagini siti web

### 2.2 API Routes
- **`routes/website-generator.js`** - API endpoints per generazione e deployment siti
- **`routes/aiWebsiteBuilder.js`** - API endpoints per AI Website Builder (esistente)

### 2.3 Componenti Frontend
- **`components/WebsiteImageSelector.js`** - Selettore immagini integrato con archivio
- **`components/WebsitePreview.js`** - Anteprima siti generati (piano)

### 2.4 Database
- **`migrations/20251211000000_add_website_images_table.js`** - Migrazione tabella immagini
- **`migrations/20251211000001_update_pages_with_template.js`** - Migrazione template pagine
- **`migrations/20251212000000_add_deploy_fields_to_siti_web.js`** - Migrazione deployment

---

## 3. Modifiche File Esistenti

### 3.1 `routes/pagine.js`
- **Aggiunta rotta GET `/api/pagini/:id/immagini`** per recupero immagini pagina
- **Aggiunta rotta POST `/api/pagine/:id/immagini`** per salvare immagini pagina
- **Implementate rotte POST e PUT mancanti per salvataggio pagine**

### 3.2 `routes/aiWebsiteBuilder.js`
- **Corretto import auth:** da `hasPermission` a `checkPermission`
- **Corretto import database:** da `require('../db')` a `require('../config/db')`

### 3.3 `routes/quoteRoutes.js`
- **Corretto permesso:** da `BG_GENERATE` a `SITE_BUILDER` (riga 14)

### 3.4 `components/ImageBlock.js`
- **Integrazione con WebsiteImageSelector** per selezione immagini da archivio
- **Gestione stato per selezione e upload immagini**

### 3.5 `components/SimplePageBuilder.js`
- **Aggiunto tracking template_name** nello stato
- **Passaggio template_name a PageEditor**

### 3.6 `components/WebsiteBuilderUNIFIED.js`
- **Integrata interfaccia generazione siti** con pulsanti preview, genera, deploy
- **Modal configurazione VPS** con supporto SSH key e password
- **Stati per tracking generazione e deployment**

### 3.7 `components/TemplatePageBuilder.js`
- **Corretta parsing JSON contenuto_sezioni** per ricostruzione sezioni
- **Supporto fallback componenti mancanti**

---

## 4. Dipendenze Nuove

### 4.1 Backend (package.json)
```json
{
  "node-ssh": "^13.1.0",
  "archiver": "^6.0.1"
}
```

Installare con:
```bash
npm install node-ssh archiver
```

---

## 5. Configurazione Server

### 5.1 `server.js` - Nuove rotte registrate
```javascript
app.use('/api/website-generator', websiteGeneratorRoutes);
```

### 5.2 Variabili Environment Richieste
```bash
# S3 Configuration (esistenti)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET=

# JWT Secret (esistente)
JWT_SECRET=

# Database (esistente)
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
```

---

## 6. Flusso di Lavoro Implementato

### 6.1 Creazione Sito Web
1. **Creazione sito** da backend con configurazione base
2. **Creazione pagine** tramite TemplatePageBuilder
3. **Selezione template** e salvataggio con contenuto_json
4. **Gestione immagini** integrata con archivio esistente

### 6.2 Generazione Sito Statico
1. **Preview:** `GET /api/website-generator/preview/:websiteId`
2. **Generazione:** `POST /api/website-generator/generate/:websiteId`
3. **Deploy VPS:** `POST /api/website-generator/deploy/:websiteId`

### 6.3 Struttura Siti Generati
```
generated-sites/
└── {websiteId}/
    ├── package.json
    ├── next.config.js
    ├── public/
    │   └── images/ (link simbolici S3)
    ├── pages/
    │   ├── _app.js
    │   ├── index.js (homepage)
    │   └── [slug].js (altre pagine)
    ├── components/
    │   ├── Layout.js
    │   ├── Header.js
    │   └── Footer.js
    └── styles/
        └── globals.css
```

---

## 7. Correzioni Bug Critiche

### 7.1 Problema Persistenza Immagini
**Sintomo:** Le immagini scomparivano dopo refresh
**Causa:** Mancanza integrazione con sistema archivio
**Soluzione:**
- Creazione tabella `immagini_sito_web`
- Integrazione `WebsiteImageSelector` con `ArchivioDocumentale`
- Servizio `WebsiteImageService` per gestione relazioni

### 7.2 Problema Salvataggio Pagine
**Sintomo:** "Il pulsante salva cambia colore ma non si avvia alcun comando"
**Causa:** Rotte POST/PUT mancanti in `routes/pagine.js`
**Soluzione:** Implementate rotte complete per CRUD pagine

### 7.3 Problema Template non Visibile
**Sintomo:** "La scelta del template non appare dopo aver creato la pagina"
**Causa:** Mancanza tracking template nel componente
**Soluzione:** Aggiunto `template_name` a stato e database

### 7.4 Problema Permessi API
**Sintomo:** 500 Error "BG_GENERATE permission not found"
**Causa:** Permesso errato in `quoteRoutes.js`
**Soluzione:** Cambiato da `BG_GENERATE` a `SITE_BUILDER`

### 7.5 Problema Import Moduli
**Sintomo:** "Cannot find module '../db'"
**Causa:** Path errati nei nuovi servizi
**Soluzione:** Corretti tutti i percorsi di import

---

## 8. Istruzioni Deployment

### 8.1 Prerequisiti
```bash
# 1. Eseguire migrazioni database
npx knex migrate:latest

# 2. Installare dipendenze backend
npm install node-ssh archiver

# 3. Assicurarsi che S3 sia configurato
# Verificare variabili environment AWS
```

### 8.2 Avvio Servizi
```bash
# Backend (porta 3001)
npm start

# Frontend (porta 3000)
cd opero-frontend
npm start
```

### 8.3 Test Funzionalità
1. **Creare nuovo sito** da WebsiteBuilderUNIFIED
2. **Aggiungere pagine** con template e contenuti
3. **Aggiungere immagini** usando il selettore integrato
4. **Generare preview** per test generazione
5. **Effettuare deploy** su VPS configurato

---

## 9. Note Tecniche

### 9.1 Sistema Permessi
- **`SITE_BUILDER`** è il permesso richiesto per tutte le operazioni di generazione siti
- Gli utenti devono avere questo permesso assegnato per accedere alle funzionalità

### 9.2 Gestione Immagini
- Le immagini vengono **linkate simbolicamente** dai siti generati S3
- Mantenuta integrità con sistema archivio esistente
- Supporto per upload nuove e selezione da esistenti

### 9.3 VPS Deployment
- Supporto sia **SSH key** che **password**
- Deploy automatico con build e installazione dependencies
- Rollback automatico in caso di errore

### 9.4 Database Queries
- Tutte le query usano **transaction** per consistenza
- Gestione errori centralizzata con logging
- Supporto per relazioni complesse

---

## 10. Prossimi Sviluppi

### 10.1 Da Implementare
- [ ] Sistema versioning siti generati
- [ ] Integrazione CDN per assets statici
- [ ] Template personalizzabili advanced
- [ ] Preview mobile/desktop split-view
- [ ] Sistema backup/restore siti

### 10.2 Miglioramenti
- [ ] Caching generazione siti
- [ ] Ottimizzazione build Next.js
- [ ] Monitoring deployment status
- [ ] Analytics integration

---

## 11. Troubleshooting

### 11.1 Errori Comuni
1. **"Cannot find module"** - Verificare path import
2. **"Permission denied"** - Verificare permessi utente
3. **"S3 upload failed"** - Verificare credenziali AWS
4. **"SSH connection failed"** - Verificare configurazione VPS

### 11.2 Debug Tips
- Controllare console browser per errori React
- Monitorare log backend per API errors
- Verificare database con query dirette
- Testare S3 connectivity separatamente

---

**Firma:** Angelo Bruno
**Data Documentazione:** 11 Dicembre 2024