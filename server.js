// #####################################################################
// # Backend Server - v6.3 (con Routing Esplicito e CORS corretto)
// # File: opero/server.js
// #####################################################################
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// --- 1. IMPORTAZIONE DELLE ROTTE ---
const authRoutes = require('./routes/auth');
const mailRoutes = require('./routes/mail');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const amministrazioneRoutes = require('./routes/amministrazione');
const publicRoutes = require('./routes/public');
const trackRoutes = require('./routes/track');
const contsmartRoutes = require('./routes/contsmart'); // Aggiunta rotta mancante

// --- 2. CONFIGURAZIONE DI EXPRESS ---
const app = express();
const PORT = process.env.PORT || 3001; // Manteniamo la porta 3001

// --- 3. MIDDLEWARE ---

// Configurazione CORS per accettare richieste solo dal nostro frontend
const corsOptions = {
  origin: 'http://localhost:3000', // L'indirizzo del tuo frontend React
  optionsSuccessStatus: 200 
};
app.use(cors(corsOptions));

// Parsing del corpo delle richieste in JSON
app.use(express.json());

// Creazione della cartella 'uploads' se non esiste
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}

// --- 4. REGISTRAZIONE SPECIFICA DELLE ROTTE API ---
// Ora ogni modulo ha il suo prefisso, rendendo l'URL corretto: /api/auth/authenticate
app.use('/api/auth', authRoutes);
app.use('/api/mail', mailRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/amministrazione', amministrazioneRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/track', trackRoutes);
app.use('/api/contsmart', contsmartRoutes); // Aggiunta rotta mancante

// --- 5. AVVIO DEL SERVER ---
app.listen(PORT, () => {
    console.log(`Server backend in ascolto sulla porta ${PORT}`);
});
