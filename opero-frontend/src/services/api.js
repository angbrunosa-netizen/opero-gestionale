// #####################################################################
// # Servizio API Centralizzato - v2.1 (con Debug)
// # File: opero-frontend/src/services/api.js
// #####################################################################
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api', 
});

api.interceptors.request.use(
  (config) => {
    // 1. Leggiamo il token
    const token = localStorage.getItem('token');
    
    // --- LOG DI DEBUG ---
    console.log('[DEBUG Frontend] Sto per inviare una richiesta API.');
    
    if (token) {
      // 2. Se lo troviamo, lo aggiungiamo
      console.log('[DEBUG Frontend] Token trovato nel localStorage. Lo allego agli header.');
      config.headers['Authorization'] = `Bearer ${token}`;
    } else {
      // 3. Se NON lo troviamo, lo segnaliamo
      console.log('[DEBUG Frontend] ATTENZIONE: Nessun token trovato nel localStorage.');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
