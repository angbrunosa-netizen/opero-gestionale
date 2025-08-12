// #####################################################################
// # Backend Server - v6.2 (Verificato e Commentato)
// # File: opero/server.js
// #####################################################################

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// --- 1. IMPORTAZIONE DI TUTTE LE ROTTE DELL'APPLICAZIONE ---
// Ogni file in 'routes' gestisce una sezione specifica dell'API.
const authRoutes = require('./routes/auth');
const mailRoutes = require('./routes/mail');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const amministrazioneRoutes = require('./routes/amministrazione');
const publicRoutes = require('./routes/public');
const trackRoutes = require('./routes/track'); // Rotte per il tracciamento email

// --- 2. CONFIGURAZIONE INIZIALE DI EXPRESS ---
const app = express();
const PORT = 3001;

// Rotta di benvenuto o di stato per testare se il server è online
app.get('/', (req, res) => {
  res.json({ 
    status: 'online', 
    message: 'Benvenuto nell\'API di Opero!' 
  });
});

// Creazione della cartella 'uploads' se non esiste, per gli allegati
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}

// --- 3. MIDDLEWARE ---
// Abilita CORS per permettere al frontend (su un'altra porta) di comunicare con il backend.
app.use(cors());
// Permette al server di leggere e interpretare i dati in formato JSON inviati dal frontend.
app.use(express.json());

// --- 4. REGISTRAZIONE DELLE ROTTE API ---
// Associa ogni gruppo di rotte a un prefisso URL.
// Esempio: le rotte in 'auth.js' saranno accessibili tramite '/api/...'
app.use('/api', authRoutes);
app.use('/api/mail', mailRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/amministrazione', amministrazioneRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/track', trackRoutes); // Le rotte di tracciamento saranno su '/api/track/...'

// --- 5. AVVIO DEL SERVER ---
// Mette il server in ascolto sulla porta specificata e stampa un messaggio di conferma.
app.listen(PORT, () => {
    console.log(`Server backend in ascolto sulla porta ${PORT}`);
});
