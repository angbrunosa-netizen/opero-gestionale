// #####################################################################
// # Frontend React - v3.3 Corretto e Pulito
// # File: opero-frontend/src/App.js
// #####################################################################

import React, { useState, useEffect, useCallback } from 'react';

// Importiamo i componenti del router
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './components/LoginPage';
import MainApp from './components/MainApp';
import RegistrationPage from './components/RegistrationPage';

// Dichiarazione della variabile d'ambiente per l'URL dell'API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function App() {
  const [userSession, setUserSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Questo useEffect viene eseguito solo una volta all'avvio
  // per caricare la sessione salvata
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem('opero-session');
      if (savedSession) {
        setUserSession(JSON.parse(savedSession));
      }
    } catch (error) {
      console.error("Errore nel caricare la sessione:", error);
      localStorage.removeItem('opero-session');
    }
    setIsLoading(false); // Finito di caricare
  }, []); // L'array vuoto [] assicura che venga eseguito solo una volta

  const handleSessionUpdate = (newSession) => {
    setUserSession(newSession);
    localStorage.setItem('opero-session', JSON.stringify(newSession));
  };

  const handleLogout = useCallback(() => {
    setUserSession(null);
    localStorage.removeItem('opero-session');
  }, []);

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
    
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    // Usiamo l'API_URL definito all'inizio del file
    const response = await fetch(`${API_URL}${url}`, { ...options, headers });

    if (response.status === 401) {
      alert("La tua sessione è scaduta. Effettua nuovamente il login.");
      handleLogout();
      throw new Error("Sessione scaduta");
    }

    return response;
  }, [handleLogout]);


  // Mostra un messaggio di caricamento finché non abbiamo controllato il localStorage
  if (isLoading) {
    return <div>Caricamento...</div>;
  }

  // Qui inizia la parte JSX che viene visualizzata
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
        {/* Redirect per qualsiasi altra pagina */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;