// #####################################################################
// # Frontend React - v3.4 DEFINITIVO
// # File: opero-frontend/src/App.js
// #####################################################################

import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './components/LoginPage';
import MainApp from './components/MainApp';
import RegistrationPage from './components/RegistrationPage';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function App() {
  const [userSession, setUserSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
    setIsLoading(false);
  }, []);

  const handleSessionUpdate = (newSession) => {
    setUserSession(newSession);
    localStorage.setItem('opero-session', JSON.stringify(newSession));
  };

  const handleLogout = useCallback(() => {
    setUserSession(null);
    localStorage.removeItem('opero-session');
  }, []);

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const session = JSON.parse(localStorage.getItem('opero-session'));
    const token = session?.token;
    const headers = { ...options.headers };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
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
                fetchWithAuth={fetchWithAuth}
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