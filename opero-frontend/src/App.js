// #####################################################################
// # Frontend React - v3.2 con Routing
// # File: opero-frontend/src/App.js
// #####################################################################

import React, { useState, useEffect, useCallback } from 'react';

// Importiamo i componenti del router
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './components/LoginPage';
import MainApp from './components/MainApp';
import RegistrationPage from './components/RegistrationPage';

function App() {
  const [userSession, setUserSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Stato per gestire il caricamento iniziale

  useEffect(() => {
    try {
      const savedSession = localStorage.getItem('opero-session');
      if (savedSession) {
        setUserSession(JSON.parse(savedSession));
      }
    } catch (error) {
      localStorage.removeItem('opero-session');
    }
    setIsLoading(false); // Finito di caricare la sessione
  }, []);

  const handleSessionUpdate = (newSession) => {
      setUserSession(newSession);
      localStorage.setItem('opero-session', JSON.stringify(newSession));
  };

   const handleLogout = useCallback(() => {
    setUserSession(null);
    localStorage.removeItem('opero-session');
      }, []);

  // Se stiamo ancora caricando la sessione dal localStorage, non mostriamo nulla
  if (isLoading) {
    return <div>Caricamento...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<RegistrationPage />} />
        <Route 
          path="/" 
          element={
            userSession ? (
              <MainApp session={userSession} onLogout={handleLogout} onSessionUpdate={handleSessionUpdate} />
            ) : (
              <LoginPage onLoginSuccess={handleSessionUpdate} />
            )
          } 
        />
        {/* Aggiungiamo un redirect per qualsiasi altra pagina non trovata */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
  // Funzione centralizzata per le chiamate API
  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const session = JSON.parse(localStorage.getItem('opero-session'));
    const token = session?.token;

    const headers = {
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Non impostiamo Content-Type se stiamo inviando FormData (per gli allegati)
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_URL}${url}`, { ...options, headers });

    if (response.status === 401) {
      alert("La tua sessione è scaduta. Effettua nuovamente il login.");
      handleLogout();
      throw new Error("Sessione scaduta");
    }

    return response;
  }, [handleLogout]);


  useEffect(() => {
    try {
      const savedSession = localStorage.getItem('opero-session');
      if (savedSession) {
        setUserSession(JSON.parse(savedSession));
      }
    } catch (error) {
      localStorage.removeItem('opero-session');
    }
    setIsLoading(false);
  }, []);

  

  if (isLoading) {
    return <div>Caricamento...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<RegistrationPage />} />
        <Route 
          path="/" 
          element={
            userSession ? (
              <MainApp 
                session={userSession} 
                onLogout={handleLogout} 
                onSessionUpdate={handleSessionUpdate} 
                fetchWithAuth={fetchWithAuth} // Passiamo la funzione ai figli
              />
            ) : (
              <LoginPage onLoginSuccess={handleSessionUpdate} />
            )
          } 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}



export default App;
