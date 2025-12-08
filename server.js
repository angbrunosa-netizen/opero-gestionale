// #####################################################################
// # Backend Server - VERSIONE UNIVERSALE UNIFICATA v8.1
// # Progettato per funzionare sia in Sviluppo (Windows) che in Produzione (Linux)
// # Con integrazione S3 Aruba Cloud Storage
// #####################################################################
require('dotenv').config(); // Carica le variabili d'ambiente dal file .env

const express = require('express');

// Inizializza servizi di cleanup S3
const cleanupService = require('./services/cleanupService');
console.log('🧹 Cleanup service inizializzato per S3 storage management');
const ppaRoutes = require('./routes/ppa');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// --- 1. IMPORTAZIONE DELLE ROTTE E DEL "GUARDIANO" DI SICUREZZA ---
// Unifichiamo tutte le importazioni necessarie da entrambe le versioni
const { verifyToken } = require('./utils/auth');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const attivitaRoutes = require('./routes/attivita');
const amministrazioneRoutes = require('./routes/amministrazione');
const contsmartRoutes = require('./routes/contsmart');
const mailRoutes = require('./routes/mail');
const rubricaRoutes = require('./routes/rubrica');
const publicRoutes = require('./routes/public');
const trackRoutes = require('./routes/track');

const reportRoutes = require('./routes/reports');
const beniStrumentaliRoutes = require('./routes/benistrumentali');
const catalogoRoutes = require('./routes/catalogo'); // <-- NUOVA INTEGRAZIONE
const magazzinoRoutes = require('./routes/magazzino');
const venditeRoutes = require('./routes/vendite'); // <-- NUOVA INTEGRAZIONE
const anagraficaRoutes = require('./routes/anagrafica'); // <-- NUOVA INTEGRAZIONE
const listeRoutes = require('./routes/liste'); // <-- ROTTA PREZZI E LISTINI
const AcquistiRoutes = require('./routes/acquisti'); // <-- NUOVA INTEGRAZIONE
const documentiRoutes = require('./routes/documenti');
const archivioRoutes = require('./routes/archivio');
const archivioPostaRoutes = require('./routes/archivio-posta'); // <-- NUOVA ROTTA ARCHIVIO POSTA
const systemRoutes = require('./routes/system');
const adminS3Routes = require('./routes/admin-s3'); // <-- NUOVA ROTTA S3 ADMIN
const websiteRoutes = require('./routes/website'); // <-- NUOVA ROTTA WEBSITE BUILDER
const quoteRoutes = require('./routes/quoteRoutes'); // ROTTA PER IL PENSIERO MOTIVAZIONALE

// --- 2. CREAZIONE E CONFIGURAZIONE DELL'APPLICAZIONE EXPRESS ---
const app = express();

// --- 3. MIDDLEWARE ---

// Middleware per il parsing del corpo delle richieste in JSON (comune a entrambi gli ambienti)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware per il CORS, con logica condizionale
if (process.env.NODE_ENV === 'production') {
  // In produzione, una configurazione CORS più semplice è sufficiente
  // perché Nginx funge da proxy e serve tutto dallo stesso dominio.
  app.use(cors());
} else {
  // In sviluppo, abbiamo bisogno di una configurazione CORS robusta
  // per permettere la comunicazione tra il frontend (es. porta 3000) e il backend (es. porta 3001).
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
    'http://192.168.1.80',
    'http://192.168.1.80:8080',
    'http://192.168.1.80:3000',
    'http://192.168.1.80:3001',
    'http://192.168.1.80:3002'
  ];
  const corsOptions = {
    origin: (origin, callback) => {
      // Permetti richieste senza origin (es. Postman, curl)
      if (!origin) {
        return callback(null, true);
      }

      console.log(`[CORS] Request from origin: ${origin}`);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // In development, permetti tutte le origini con un warning
        if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
          console.warn(`[CORS] Allowing origin ${origin} in development mode`);
          callback(null, true);
        } else {
          console.error(`[CORS] Blocking origin ${origin} - not in allowed list`);
          callback(new Error('Not allowed by CORS'));
        }
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    credentials: true,
  };
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));
}

// Creazione della cartella 'uploads' se non esiste (utile in entrambi gli ambienti)
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}

// --- 4. REGISTRAZIONE DELLE ROTTE API ---
// Usiamo la struttura più sicura della versione di produzione, che protegge le rotte con il "guardiano" verifyToken
app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/track', trackRoutes);
// Le seguenti rotte richiedono un token di autenticazione valido
app.use('/api/mail', verifyToken, mailRoutes);
app.use('/api/admin', verifyToken, adminRoutes);
app.use('/api/user', verifyToken, userRoutes);
app.use('/api/amministrazione', verifyToken, amministrazioneRoutes);
app.use('/api/contsmart', verifyToken, contsmartRoutes);
app.use('/api/rubrica', verifyToken, rubricaRoutes);
app.use('/api/attivita', verifyToken, attivitaRoutes);
app.use('/api/ppa', verifyToken, ppaRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/beni-strumentali', verifyToken, beniStrumentaliRoutes);
app.use('/api/benistrumentali', verifyToken, beniStrumentaliRoutes);
app.use('/api/catalogo', verifyToken, catalogoRoutes); // <-- NUOVA INTEGRAZIONE
app.use('/api/magazzino', magazzinoRoutes); // <-- NUOVA RIGA DA AGGIUNGERE
app.use('/api/vendite', venditeRoutes); // <-- AGGIUNGI QUESTA RIGA
app.use('/api/anagrafica', verifyToken, anagraficaRoutes); // <-- NUOVA ROTTA AGGIUNTA
app.use('/api/liste', verifyToken, listeRoutes); // <-- ROTTA PREZZI E LISTINI
app.use('/api/acquisti', AcquistiRoutes); // <-- AGGIUNGI QUESTA RIGA
app.use('/api/documenti', documentiRoutes);
app.use('/api/archivio', verifyToken, archivioRoutes);
app.use('/api/archivio-posta', verifyToken, archivioPostaRoutes); // <-- NUOVA ROTTA ARCHIVIO POSTA
app.use('/api/system', verifyToken, systemRoutes);
app.use('/api/quotes', quoteRoutes); // ROTTA PER IL PENSIERO MOTIVAZIONALE
app.use('/api/admin-s3', adminS3Routes); // <-- NUOVA ROTTA AMMINISTRAZIONE S3
// TODO: Riattivare verifyToken quando il debug è completato
app.use('/api/website', websiteRoutes); // <-- NUOVA ROTTA WEBSITE BUILDER SENZA AUTH PER DEBUG

// --- 5. GESTIONE DEL FRONTEND (SOLO IN AMBIENTE DI PRODUZIONE) ---
if (process.env.NODE_ENV === 'production') {
  // Serve i file statici della build di React
  app.use(express.static(path.join(__dirname, 'opero-frontend', 'build')));

  // Rotta "catch-all" che rimanda a index.html per gestire il routing lato client di React
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'opero-frontend', 'build', 'index.html'));
  });
}

// --- 6. AVVIO DEL SERVER (LOGICA CONDIZIONALE) ---
if (process.env.NODE_ENV === 'production') {
  // --- AVVIO IN PRODUZIONE SU SOCKET ---
  const socketPath = path.join(__dirname, 'opero.sock');
  if (fs.existsSync(socketPath)) {
    fs.unlinkSync(socketPath);
  }
  app.listen(socketPath, () => {
    fs.chmodSync(socketPath, '666'); // Permessi per Nginx
    console.log(`✅ Server Opero in PRODUZIONE avviato e in ascolto sul socket: ${socketPath}`);
  });
} else {
  // --- AVVIO IN SVILUPPO SU PORTA DI RETE ---
  const PORT = process.env.PORT || 3000;
 if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`💻 Server Opero in SVILUPPO avviato e in ascolto sulla porta: ${PORT}`);
  });
}
}
module.exports = app;
