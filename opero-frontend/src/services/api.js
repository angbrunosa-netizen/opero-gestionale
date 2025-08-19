// #####################################################################
// # Servizio API Centralizzato - v2.0 (Stabile)
// # File: opero-frontend/src/services/api.js
// #####################################################################
import axios from 'axios';

// Creiamo un'istanza di Axios con l'URL di base del backend.
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api', 
});

// --- INTERCEPTOR ---
// Questo codice viene eseguito PRIMA di ogni chiamata API in uscita.
api.interceptors.request.use(
  (config) => {
    // Recupera il token dal localStorage.
    const token = localStorage.getItem('token');
    // Se il token esiste, lo aggiunge agli header.
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
