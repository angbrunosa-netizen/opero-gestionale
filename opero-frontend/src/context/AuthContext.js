// #####################################################################
// # Contesto di Autenticazione - v3.0 (Stabile e con Session Persistence)
// # File: opero-frontend/src/context/AuthContext.js
// #####################################################################

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import  {api}  from '../services/api'; // IMPORTAZIONE DEL CLIENT AXIOS

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

  const loadUserFromToken = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Imposta l'header Authorization per la verifica
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // 🔹 CORRETTO: chiamata all'endpoint backend giusto
      const { data } = await api.get('/auth/me');

      if (data && data.success === true && data.user) {
        setAuthState({
          token: token,
          user: data.user,
          ditta: data.ditta,
          permissions: data.permissions || [],
          modules: data.modules || [],
        });
      } else {
        throw new Error("Token non valido o sessione scaduta.");
      }
    } catch (error) {
      console.error("Ripristino sessione fallito:", error.message);
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setAuthState({ token: null, user: null, ditta: null, permissions: [], modules: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserFromToken();
  }, [loadUserFromToken]);

  const login = async (credentials) => {
    try {
      // 🔹 CORRETTO: il backend espone /api/auth/login
      const { data } = await api.post('/auth/login', credentials);
      if (data.success) {
        localStorage.setItem('token', data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        setAuthState({
          token: data.token,
          user: data.user,
          ditta: data.ditta,
          permissions: data.permissions || [],
          modules: data.modules || [],
        });
      }
    } catch (error) {
      console.error("Errore di login:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setAuthState({ token: null, user: null, ditta: null, permissions: [], modules: [] });
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
    isAuthenticated: !!authState.token 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
