// #####################################################################
// # Servizio API Centralizzato con Axios - v1.1 (Corretto)
// # File: opero-frontend/src/services/api.js
// #####################################################################

import axios from 'axios';

// 1. Creiamo un'istanza di Axios con una configurazione di base.
const api = axios.create({
  // L'URL di base di tutte le nostre chiamate API.
  // Assicurati che la porta 5000 sia quella corretta per il tuo backend.
  baseURL: 'http://localhost:3001/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 2. INTERCETTORE DI RICHIESTE (Request Interceptor)
 * Questa funzione viene eseguita PRIMA di ogni richiesta.
 * Controlla se abbiamo un token nel localStorage e, se c'è, 
 * lo aggiunge agli header della richiesta.
 */
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

export default api;
