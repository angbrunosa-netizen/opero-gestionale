// #####################################################################
// # Backend Server - VERSIONE UNIVERSALE UNIFICATA v8.2
// # Fix: Correzione rotta Admin CMS (admin-cms -> admin/cms)
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
const catalogoRoutes = require('./routes/catalogo');
const magazzinoRoutes = require('./routes/magazzino');
const venditeRoutes = require('./routes/vendite');
const anagraficaRoutes = require('./routes/anagrafica');
const listeRoutes = require('./routes/liste');
const AcquistiRoutes = require('./routes/acquisti');
const documentiRoutes = require('./routes/documenti');
const archivioRoutes = require('./routes/archivio');
const archivioPostaRoutes = require('./routes/archivio-posta');
const systemRoutes = require('./routes/system');
const adminS3Routes = require('./routes/admin-s3');
const websiteRoutes = require('./routes/website');
const websiteGeneratorRoutes = require('./routes/website-generator');
const quoteRoutes = require('./routes/quoteRoutes');
const adminCmsRoutes = require('./routes/admin_cms'); // <-- NUOVA ROTTA ADMIN CMS
const adminBlogRoutes = require('./routes/admin_blog'); // <-- NUOVA ROTTA ADMIN BLOG
const adminCmsAdvancedRoutes = require('./routes/admin_cms_advanced'); // <-- ROTTA CMS AVANZATO

// --- 2. CREAZIONE E CONFIGURAZIONE DELL'APPLICAZIONE EXPRESS ---
const app = express();

app.set('trust proxy', true);

// --- 3. MIDDLEWARE ---
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb', parameterLimit: 10000 }));

app.use((req, res, next) => {
  req.headers['max-header-size'] = '64kb';
  next();
});

// Middleware per il CORS
if (process.env.NODE_ENV === 'production') {
  app.use(cors());
} else {
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
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
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

// Creazione cartella uploads
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}

// --- 4. REGISTRAZIONE DELLE ROTTE API ---
app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/track', trackRoutes);

// Rotte di test per debug (senza autenticazione)
app.use('/api/archivio-test', archivioRoutes);

// Rotte protette
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
app.use('/api/catalogo', verifyToken, catalogoRoutes);
app.use('/api/magazzino', magazzinoRoutes);
app.use('/api/vendite', venditeRoutes);
app.use('/api/anagrafica', verifyToken, anagraficaRoutes);
app.use('/api/liste', verifyToken, listeRoutes);
app.use('/api/acquisti', AcquistiRoutes);
app.use('/api/documenti', documentiRoutes);
app.use('/api/archivio', verifyToken, archivioRoutes);
app.use('/api/archivio-posta', verifyToken, archivioPostaRoutes);
app.use('/api/system', verifyToken, systemRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/admin-s3', adminS3Routes);

// --- SEZIONE WEBSITE BUILDER & CMS ---
app.use('/api/website', websiteRoutes); 
app.use('/api/website-generator', verifyToken, websiteGeneratorRoutes);
app.use('/api/ai-enhanced-website', verifyToken, require('./routes/ai-enhanced-website'));
app.use('/api/ai-collaborative-assistant', verifyToken, require('./routes/ai-collaborative-assistant'));
app.use('/api/ai-content-generator', require('./routes/ai-content-generator'));
app.use('/api/ai-website-builder', verifyToken, require('./routes/aiWebsiteBuilder'));

// *** FIX QUI: Modificato da 'admin-cms' a 'admin/cms' per matchare il frontend ***
app.use('/api/admin/cms', verifyToken, adminCmsAdvancedRoutes); // <-- ROTTA CMS AVANZATO (prima per specificity)
app.use('/api/admin/cms', verifyToken, adminCmsRoutes);
app.use('/api/admin/blog', verifyToken, adminBlogRoutes); // <-- NUOVA ROTTA ADMIN BLOG 

// --- 5. SERVE LOCAL UPLOADS (PDF, Immagini Blog) ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 6. GESTIONE DEL FRONTEND ---
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'opero-frontend', 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'opero-frontend', 'build', 'index.html'));
  });
}

// --- 6. AVVIO DEL SERVER ---
if (process.env.NODE_ENV === 'production') {
  const socketPath = path.join(__dirname, 'opero.sock');
  if (fs.existsSync(socketPath)) {
    fs.unlinkSync(socketPath);
  }
  app.listen(socketPath, () => {
    fs.chmodSync(socketPath, '666');
    console.log(`✅ Server Opero in PRODUZIONE avviato e in ascolto sul socket: ${socketPath}`);
  });
} else {
  const PORT = process.env.PORT || 3001;
  if (require.main === module) {
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`💻 Server Opero in SVILUPPO avviato e in ascolto sulla porta: ${PORT}`);
      console.log(`🔧 Header limit aumentato per risolvere errore 431`);
    });
    server.maxHeadersCount = 1000;
  }
}

module.exports = app;