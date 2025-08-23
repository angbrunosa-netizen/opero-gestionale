// #####################################################################
// # Servizio API Centralizzato - v2.0 (con Interceptor per Auth)
// # File: opero-frontend/src/services/api.js
// #####################################################################
import axios from 'axios';

// Creiamo un'istanza di axios che useremo in tutta l'applicazione.
// Assicurati che l'URL del backend sia corretto.
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
});

// === LA PARTE FONDAMENTALE: L'INTERCETTORE ===
// Questo codice viene eseguito PRIMA di ogni singola richiesta API.
api.interceptors.request.use(
  (config) => {
    // 1. Prende il token dal localStorage.
    const token = localStorage.getItem('token');
    
    // 2. Se il token esiste, lo aggiunge all'header 'Authorization'.
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // 3. Fa partire la richiesta, ora completa di token.
    return config;
  },
  (error) => {
    // Gestisce eventuali errori durante la preparazione della richiesta.
    return Promise.reject(error);
  }
);

export default api;
