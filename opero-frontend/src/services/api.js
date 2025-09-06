// #####################################################################
// # Servizio API Centralizzato - v2.0 (con Interceptor per Auth)
// # File: opero-frontend/src/services/api.js da server
// ###########################################d##########################
import axios from 'axios';
/* questa versione fuziona su server ubunto 
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

 fino a questo punto ripristinare per UBUNTO */

 // Determina l'URL di base a seconda se siamo in produzione o in sviluppo

 const baseURL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:3001/api';

const api = axios.create({
  baseURL: baseURL,
});

// Aggiungiamo un "interceptor" per inserire il token di autenticazione
// in ogni richiesta, se disponibile.
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



export { api };


