// #####################################################################
// # Servizio API Centralizzato - v3.0 (Logica per Sviluppo, Web e Mobile)
// # File: opero-frontend/src/services/api.js
// #####################################################################
import axios from 'axios';

// URL per lo sviluppo locale (quando lanci 'npm start')
const DEV_API_URL = 'http://localhost:3001/api';

// URL del server di PRODUZIONE (Ubuntu) - Indirizzo IP Assoluto
// Questo URL verrà usato sia dall'app mobile (Capacitor)
// sia dal sito web di produzione (quando fai 'npm run build').
const PROD_API_URL = 'http://185.250.145.129:8080/api';

// Determina l'URL corretto:
// - Se siamo in 'development' (npm start), usa l'URL di sviluppo.
// - In *tutti* gli altri casi (npm run build), usa l'URL di produzione.
const baseURL = process.env.NODE_ENV === 'development'
  ? DEV_API_URL
  : PROD_API_URL;

// Creiamo l'istanza di axios
const api = axios.create({
  baseURL: baseURL,
});

// === INTERCETTORE (già corretto) ===
// Questo codice viene eseguito PRIMA di ogni singola richiesta API.
api.interceptors.request.use(
  (config) => {
    // 1. Prende il token dal localStorage.
    const token = localStorage.getItem('token');
    
    // 2. Se il token esiste, lo aggiunge all'header 'Authorization'.
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // 3. Fa partire la richiesta.
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export { api };


