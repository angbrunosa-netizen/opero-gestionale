// #####################################################################
// # Backend Server - v7.0 (Stabile)
// # File: opero/server.js
// #####################################################################
require('dotenv').config();


const rubricaRoutes = require('./routes/rubrica');
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const attivitaRoutes = require('./routes/attivita');
const ppaRoutes = require('./routes/ppa');


// --- 1. IMPORTAZIONE DELLE ROTTE ---
const authRoutes = require('./routes/auth');
const mailRoutes = require('./routes/mail');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const amministrazioneRoutes = require('./routes/amministrazione');
const publicRoutes = require('./routes/public');
const trackRoutes = require('./routes/track');
const contsmartRoutes = require('./routes/contsmart');

// --- 2. CONFIGURAZIONE DI EXPRESS ---
const app = express();
const PORT = process.env.PORT || 3001;

// --- 3. MIDDLEWARE ---

// Configurazione CORS robusta per permettere la comunicazione col frontend
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
  allowedHeaders: ['Content-Type', 'Authorization'], // Permette esplicitamente l'header del token
  credentials: true,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Parsing del corpo delle richieste in JSON
app.use(express.json());

// Creazione della cartella 'uploads' se non esiste
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}

// --- 4. REGISTRAZIONE DELLE ROTTE API ---
app.use('/api/auth', authRoutes);
app.use('/api/mail', mailRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/amministrazione', amministrazioneRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/track', trackRoutes);
app.use('/api/contsmart', contsmartRoutes);
app.use('/api/attivita', attivitaRoutes);
app.use('/api/rubrica', rubricaRoutes);
app.use('/api/ppa', ppaRoutes);
// --- 5. AVVIO DEL SERVER ---
app.listen(PORT, () => {
  console.log(`Backend Opero in ascolto sulla porta ${PORT}`);
});
