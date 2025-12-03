# ⚙️ Setup Integrazione S3 Aruba - Configurazione Attuale

## 🎯 **Configurazione Pre-Setup**

Il tuo file `.env` contiene già la maggior parte delle configurazioni necessarie. Verifichiamo e integriamo solo quanto manca.

## 📋 **Verifica File .env Attuale**

Assicurati che il tuo file `.env` contenga le seguenti variabili (dovrebbero esserci già):

```bash
# ✅ Già configurate nel tuo .env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=operodb
DB_PORT=3306

JWT_SECRET=una_chiave_segreta_locale_qualsiasi
ENCRYPTION_SECRET=xxxxxxxxxxxxxxL4eK

MAIL_FROM_ADDRESS="opero@difam.it"
MAIL_FROM_NAME="Gestionale Opero"
MAIL_HOST=smtps.aruba.it
MAIL_PORT=465
MAIL_USER="opero@xxxdifam.it"
MAIL_PASS="Operoxxxx!"

# ✅ Configurazione S3 Aruba (già presente)
S3_BUCKET_NAME=operogo
S3_ENDPOINT=http://r3-it.storage.cloud.it
S3_ACCESS_KEY=xxxxxx
S3_SECRET_KEY=xxxx
```

## ➕ **Variabili da Aggiungere**

Aggiungi queste variabili mancanti al tuo `.env`:

```bash
# Aggiungi al tuo .env:
PUBLIC_API_URL=http://localhost:3001
S3_REGION=it-mil-1
```

## 🚀 **Procedura di Setup Completa**

### 1. **Verifica Variabili Environment**

```bash
# Verifica che le variabili S3 siano configurate
node -e "
console.log('S3_BUCKET_NAME:', process.env.S3_BUCKET_NAME);
console.log('S3_ENDPOINT:', process.env.S3_ENDPOINT);
console.log('S3_ACCESS_KEY:', process.env.S3_ACCESS_KEY ? '***CONFIGURATO***' : 'MANCANTE');
console.log('S3_SECRET_KEY:', process.env.S3_SECRET_KEY ? '***CONFIGURATO***' : 'MANCANTE');
"
```

### 2. **Esegui Migrazione Database**

```bash
npx knex migrate:latest
```

### 3. **Test Integrazione S3**

```bash
node test-s3-integration.js
```

### 4. **Avvia Server**

```bash
npm start
```

## 🔍 **Verifica Funzionamento**

Una volta avviato il server, dovresti vedere nel log:

```
S3 Service configurato con bucket: operogo, endpoint: http://r3-it.storage.cloud.it
🧹 Cleanup service inizializzato per S3 storage management
💻 Server Opero in SVILUPPO avviato e in ascolto sulla porta: 3001
```

## 📧 **Test Modulo Posta**

1. Accedi all'applicazione React (`http://localhost:3000`)
2. Vai al modulo **Mail**
3. Componi una nuova email
4. Aggiungi qualche allegato (test con file piccoli)
5. Invia l'email

Dovresti vedere nel server log simili a:
```
S3 Download tracked: documento.pdf by 192.168.1.100
Upload completato: etag-"abc123..."
```

## 🛠️ **Dashboard Amministrazione S3**

Una volta loggato come admin, puoi accedere a:

- `GET /api/admin-s3/status` - Stato sistema S3
- `GET /api/admin-s3/files` - Lista file su S3
- `GET /api/admin-s3/storage-analytics` - Analytics storage
- `POST /api/admin-s3/cleanup` - Pulizia manuale

## ⚠️ **Note Specifiche Configurazione**

### Endpoint S3
Il tuo sistema usa `http://r3-it.storage.cloud.it` che è l'endpoint corretto per Aruba S3.

### Bucket Name
`operogo` è il nome del tuo bucket S3.

### Sicurezza
- Il sistema usa **URL firmati temporanei** per download sicuri
- **Crittografia AES-256** lato server per tutti i file
- **Tracking completo** di ogni download

### Performance
- **Upload diretto** su S3 senza intermediari
- **Download da CDN Aruba** ottimizzato
- **Fallback automatico** su storage locale se S3 non disponibile

## 🧪 **Test Rapido Semplificato**

Se vuoi un test rapido senza installare nulla:

```bash
# Test connessione S3
curl -X GET "http://r3-it.storage.cloud.it" \
  -H "Authorization: AWS4-HMAC-SHA256 Credential=${S3_ACCESS_KEY}" \
  -v
```

## 📞 **Supporto Configurazione**

Se riscontri problemi:

1. **Verifica credenziali S3** nel pannello Aruba Cloud
2. **Controlla permessi bucket** (deve permettere PUT/GET/DELETE)
3. **Verifica firewall** permetta connessioni verso `r3-it.storage.cloud.it`
4. **Controlla logs applicazione** per errori dettagliati

La configurazione dovrebbe essere funzionante con le credenziali S3 già presenti nel tuo ambiente! 🚀