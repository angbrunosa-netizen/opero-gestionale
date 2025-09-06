// #####################################################################
// # Servizio API Centralizzato - v2.0 (con Interceptor per Auth)
// # File: opero-frontend/src/services/api.js da server
// ###########################################d##########################
import axios from 'axios';

// Creiamo un'unica istanza di axios per tutta l'applicazione.
const api = axios.create({
  // Questa è la modifica chiave:
  // Usa la variabile d'ambiente per la produzione,
  // altrimenti usa un percorso relativo per lo sviluppo,
  // che funzionerà grazie al proxy di Nginx.
  baseURL: '/api',
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


