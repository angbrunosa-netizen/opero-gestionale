// #####################################################################
// # Contesto di Autenticazione - v1.0 
// # File: opero-frontend/src/context/AuthContext.js
// #####################################################################

import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api'; // Un'istanza di axios pre-configurata

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [ditta, setDitta] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true); // Stato per gestire il caricamento iniziale

  // Effetto per controllare se esiste un token al mount dell'app
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Se c'è un token, potremmo voler validare e recuperare i dati utente
      // Per ora, lo lasciamo in attesa del login manuale
      // In un'app di produzione, qui si farebbe una chiamata a /api/user/me
    }
    setLoading(false);
  }, []);

  /**
   * Gestisce il processo di login.
   * @param {object} credentials - { email, password }
   */
  const login = async (credentials) => {
    const { data } = await api.post('/auth/authenticate', credentials);
    if (data.success) {
      localStorage.setItem('token', data.token);
      api.defaults.headers.Authorization = `Bearer ${data.token}`; // Imposta il token per le chiamate future

      setUser(data.user);
      setDitta(data.ditta);
      setPermissions(data.permissions);
      setModules(data.modules);
    }
    return data; // Ritorna la risposta per gestire eventuali errori nel componente LoginPage
  };

  /**
   * Gestisce il processo di logout.
   */
  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.Authorization;
    setUser(null);
    setDitta(null);
    setPermissions([]);
    setModules([]);
  };

  /**
   * Funzione helper per verificare se l'utente ha una specifica funzione e un livello minimo.
   * @param {string} requiredFunctionCode - Il codice della funzione richiesta (es. 'FATTURE_VISUALIZZA').
   * @param {number} [requiredLevel=0] - Il livello minimo richiesto per questa operazione.
   * @returns {boolean}
   */
  const hasPermission = (requiredFunctionCode, requiredLevel = 0) => {
    if (!user) return false;
    if (user.livello < requiredLevel) return false;
    return permissions.includes(requiredFunctionCode);
  };

  const value = {
    user,
    ditta,
    permissions,
    modules,
    loading,
    login,
    logout,
    hasPermission,
    isAuthenticated: !!user, // Un booleano utile per la navigazione
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook custom per accedere facilmente al contesto di autenticazione.
 */
export const useAuth = () => {
  return useContext(AuthContext);
};
