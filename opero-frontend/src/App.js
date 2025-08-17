// #####################################################################
// # Componente App Principale - v2.2 (con Architettura a Context)
// # File: opero-frontend/src/App.js
// #####################################################################

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Percorsi corretti assumendo che App.js si trovi nella cartella 'src'
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import MainApp from './components/MainApp';
import RegistrationPage from './components/RegistrationPage'; // Aggiunto per completezza

/**
 * Componente "Wrapper" per proteggere le rotte.
 * Controlla se l'utente è autenticato. Se non lo è, lo reindirizza al login.
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Caricamento...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    // 1. AuthProvider è il componente più esterno. Fornisce il "cervello" a tutta l'app.
    <AuthProvider>
      {/* 2. BrowserRouter gestisce la navigazione. */}
      <BrowserRouter>
        <Routes>
          {/* Rotte pubbliche */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />

          {/* Rotta principale protetta */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <MainApp />
              </ProtectedRoute>
            } 
          />
          
          {/* Qualsiasi altra rotta non definita reindirizza alla pagina principale */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
