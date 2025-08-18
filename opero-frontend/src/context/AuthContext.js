// #####################################################################
// # Contesto di Autenticazione - v2.0 (Stabile e con Session Persistence)
// # File: opero-frontend/src/context/AuthContext.js
// #####################################################################

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api'; // Importiamo il nostro servizio API

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: localStorage.getItem('token'),
    user: null,
    ditta: null,
    permissions: [],
    modules: [],
  });
  const [loading, setLoading] = useState(true);

  // Funzione per caricare i dati dell'utente se esiste un token
  const loadUserFromToken = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Usa la nuova rotta '/auth/me' per recuperare i dati
        const { data } = await api.get('/auth/me'); 
        if (data.success) {
          setAuthState({
            token: token,
            user: data.user,
            ditta: data.ditta,
            permissions: data.permissions,
            modules: data.modules,
          });
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error("Sessione non valida, effettuare il login.");
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  // Esegui al primo caricamento dell'app per ripristinare la sessione
  useEffect(() => {
    loadUserFromToken();
  }, [loadUserFromToken]);

  // Funzione di LOGIN
  const login = async (credentials) => {
    try {
      const { data } = await api.post('/auth/authenticate', credentials);
      if (data.success) {
        localStorage.setItem('token', data.token);
        setAuthState({
          token: data.token,
          user: data.user,
          ditta: data.ditta,
          permissions: data.permissions,
          modules: data.modules,
        });
      }
    } catch (error) {
      throw error;
    }
  };

  // Funzione di LOGOUT
  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({
      token: null, user: null, ditta: null, permissions: [], modules: [],
    });
  };

  const hasPermission = (requiredFunctionCode, requiredLevel = 0) => {
    if (!authState.user) return false;
    if (authState.user.livello < requiredLevel) return false;
    return authState.permissions.includes(requiredFunctionCode);
  };

  const value = {
    ...authState,
    loading,
    login,
    logout,
    hasPermission,
    isAuthenticated: !!authState.token,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
