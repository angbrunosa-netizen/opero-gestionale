// #####################################################################
// # Servizio API Centralizzato - v6.0 (Smart Fallback)
// # File: opero-frontend/src/services/api.js
// #####################################################################
import axios from 'axios';

// ---------------------------------------------------------------------
// CONFIGURAZIONE DINAMICA (SMART)
// ---------------------------------------------------------------------
// La logica segue una priorità a cascata per garantire che funzioni sempre,
// sia che tu abbia configurato il file .env, sia che tu te ne sia dimenticato.

// 1. Recupera la variabile d'ambiente (da .env.development o .env)
const envBaseUrl = process.env.REACT_APP_API_BASE_URL;

// 2. Determina in che modalità sta girando React
const isDev = process.env.NODE_ENV === 'development';

// 3. Definisci i comportamenti di default (Paracadute)
// - In Sviluppo (npm start): Punta a localhost:5000 se non specificato altro.
// - In Produzione (npm run build): Usa il percorso relativo '/api' per sfruttare Nginx.
const devFallback = 'http://localhost:5000/api';
const prodFallback = '/api';

// 4. Calcola l'URL Finale
const baseURL = envBaseUrl || (isDev ? devFallback : prodFallback);

// Log di debug visibile nella Console del Browser (F12) per diagnosi immediata
console.log(`[Opero Config] Environment: ${process.env.NODE_ENV}`);
console.log(`[Opero Config] API Target: ${baseURL}`);

// Creazione istanza Axios
const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---------------------------------------------------------------------
// INTERCETTORI (Gestione Token e Errori)
// ---------------------------------------------------------------------

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gestione intelligente errore 401 (Token scaduto o non valido)
    if (error.response && error.response.status === 401) {
      // Opzionale: logica di logout automatico o redirect
      // window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export { api };