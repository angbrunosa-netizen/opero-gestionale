// #####################################################################
// # Contesto di Autenticazione - v4.0 (con Portineria e Heartbeat)
// # File: opero-frontend/src/context/AuthContext.js
// #####################################################################

import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api'; // IMPORTAZIONE DEL CLIENT AXIOS

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

  // ## NOVITÀ: useRef per memorizzare l'ID dell'intervallo heartbeat ##
  const heartbeatIntervalRef = useRef(null);

  // ## NOVITÀ: Funzione per avviare l'heartbeat ##
  const startHeartbeat = () => {
    // Pulisci qualsiasi heartbeat precedente per sicurezza
    if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
    }
    // Imposta un nuovo intervallo che chiama l'endpoint /heartbeat ogni 5 minuti
    heartbeatIntervalRef.current = setInterval(() => {
        // Eseguiamo la chiamata in background senza bloccare l'UI
        api.post('/auth/heartbeat').catch(err => {
            console.error("Heartbeat fallito:", err);
            // Se l'heartbeat fallisce (es. token scaduto), forziamo il logout
            // per evitare di rimanere in uno stato inconsistente.
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
              logout();
            }
        });
    }, 300000); // 300000 ms = 5 minuti
  };

  // ## NOVITÀ: Funzione per fermare l'heartbeat ##
  const stopHeartbeat = () => {
    if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
    }
  };

  // Funzione di logout POTENZIATA per comunicare con la portineria
  const logout = useCallback(async () => {
    console.log("Eseguo logout potenziato...");

    // 1. Ferma subito l'invio di segnali di vita
    stopHeartbeat();

    try {
        // 2. Notifica il backend che la sessione sta terminando
        await api.post('/auth/logout');
    } catch (error) {
        // Logga l'errore ma non bloccare la pulizia del frontend
        console.error("Errore durante la chiamata di logout al backend:", error);
    } finally {
        // 3. Pulisci SEMPRE lo stato e lo storage del client
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setAuthState({ token: null, user: null, ditta: null, permissions: [], modules: [] });
    }
  }, []); // useCallback con array vuoto perché non dipende da props/state esterni

  const loadUserFromToken = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const { data } = await api.get('/auth/me');

      if (data && data.success === true && data.user) {
        setAuthState({
          token: token,
          user: data.user,
          ditta: data.ditta,
          permissions: data.permissions || [],
          modules: data.modules || [],
        });
        // ## NOVITÀ: Se il caricamento va a buon fine, avvia l'heartbeat ##
        startHeartbeat();
      } else {
        // Se /me risponde con success:false, il token non è più valido
        throw new Error("Token non valido o sessione scaduta.");
      }
    } catch (error) {
      console.error("Ripristino sessione fallito:", error.message);
      // Usiamo la funzione di logout centralizzata per pulire tutto
      await logout();
    } finally {
      setLoading(false);
    }
  }, [logout]); // Aggiunto logout alle dipendenze di useCallback

  useEffect(() => {
    loadUserFromToken();
    
    // ## NOVITÀ: Funzione di pulizia per fermare l'heartbeat quando il componente AuthProvider viene smontato ##
    return () => {
      stopHeartbeat();
    };
  }, [loadUserFromToken]);

  const login = async (credentials) => {
    try {
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
        // ## NOVITÀ: Dopo un login riuscito, avvia l'heartbeat ##
        startHeartbeat();
      }
    } catch (error) {
      console.error("Errore di login:", error);
      throw error; // Rilancia l'errore per gestirlo nel componente LoginPage
    }
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
    logout, // Ora è la versione potenziata
    hasPermission, 
    isAuthenticated: !!authState.token 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

