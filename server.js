// #####################################################################
// # Backend Server - VERSIONE UNIVERSALE UNIFICATA v8.0
// # Progettato per funzionare sia in Sviluppo (Windows) che in Produzione (Linux)
// #####################################################################
require('dotenv').config(); // Carica le variabili d'ambiente dal file .env

const express = require('express');
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
const beniStrumentaliRoutes = require('./routes/beniStrumentali');


// --- 2. CREAZIONE E CONFIGURAZIONE DELL'APPLICAZIONE EXPRESS ---
const app = express();

// --- 3. MIDDLEWARE ---

// Middleware per il parsing del corpo delle richieste in JSON (comune a entrambi gli ambienti)
app.use(express.json());

// Middleware per il CORS, con logica condizionale
if (process.env.NODE_ENV === 'production') {
  // In produzione, una configurazione CORS più semplice è sufficiente
  // perché Nginx funge da proxy e serve tutto dallo stesso dominio.
  app.use(cors());
} else {
  // In sviluppo, abbiamo bisogno di una configurazione CORS robusta
  // per permettere la comunicazione tra il frontend (es. porta 3000) e il backend (es. porta 3001).
  const allowedOrigins = ['http://localhost:3000', 'http://localhost:3003'];
  const corsOptions = {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`💻 Server Opero in SVILUPPO avviato e in ascolto sulla porta: ${PORT}`);
  });
}
