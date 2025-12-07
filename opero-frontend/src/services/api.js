// #####################################################################
// # Servizio API Centralizzato - v6.2 (Force Production on App)
// # File: opero-frontend/src/services/api.js
// #####################################################################
import axios from 'axios';
import { Capacitor } from '@capacitor/core'; // Importiamo Capacitor per un controllo sicuro

// ---------------------------------------------------------------------
// CONFIGURAZIONE URL
// ---------------------------------------------------------------------

// URL del tuo server di PRODUZIONE (HTTPS)
const PROD_URL = 'https://www.operocloud.it/api';

// URL per lo sviluppo locale (PC)
const DEV_URL = 'http://localhost:3000/api';

// ---------------------------------------------------------------------
// LOGICA DI SELEZIONE (SMART)
// ---------------------------------------------------------------------

let baseURL;

// 1. Se siamo su un dispositivo nativo (Android/iOS), USIAMO SEMPRE LA PRODUZIONE.
// Questo risolve definitivamente il problema di "localhost" sul telefono.
if (Capacitor.isNativePlatform()) {
  console.log('[API Config] Rilevata App Nativa: Forzo URL Produzione');
  baseURL = PROD_URL;
} 
// 2. Se siamo in sviluppo sul PC (npm start), usiamo localhost.
else if (process.env.NODE_ENV === 'development') {
  console.log('[API Config] Rilevato Sviluppo Web: Uso Localhost');
  baseURL = DEV_URL;
} 
// 3. Se siamo in produzione sul Web (Browser), usiamo percorso relativo.
else {
  console.log('[API Config] Rilevato Web Produzione: Uso percorso relativo');
  baseURL = '/api';
}

console.log(`[Opero API] Base URL impostato su: ${baseURL}`);

// Creazione istanza Axios
const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---------------------------------------------------------------------
// INTERCETTORI
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
    if (error.response && error.response.status === 401) {
      console.warn('[API] Token scaduto o non valido.');
    }
    return Promise.reject(error);
  }
);

export { api };