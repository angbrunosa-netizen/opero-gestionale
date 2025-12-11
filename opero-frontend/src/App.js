/**
 * ======================================================================
 * File: src/App.js (v2.8 - Ottimizzato e Corretto)
 * ======================================================================
 * @description
 * Versione ottimizzata con pulizia condizionale dei cookie, logging di debug
 * condizionale e struttura del routing semplificata.
 */
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Import dei contesti
import { AuthProvider, useAuth } from './context/AuthContext';
import { QuickComposeProvider } from './context/QuickComposeContext';

// Import dei componenti principali
import LoginPage from './components/LoginPage';
import MainApp from './components/MainApp';
import RegistrationPage from './components/RegistrationPage';
import StandaloneModule from './components/StandaloneModule';
import IstanzaDetailView from './components/ppa/IstanzaDetailView';
import ResetPasswordPage from './components/ResetPasswordPage';
import BeneForm from './components/beni-strumentali/BeneForm';

// Import del ListComposer per le rotte liste
import ListComposerWrapper from './components/liste/ListComposerWrapper';


// ---------------------------------------------------------------------
// FUNZIONI DI UTILITÀ
// ---------------------------------------------------------------------

// Pulizia cookie solo in sviluppo per risolvere l'errore 431
const clearAllCookies = () => {
  console.log('🧹 Pulizia completa cookie per risolvere errore 431...');

  // Pulisce tutti i cookie possibili
  const domains = ['localhost', '127.0.0.1', 'localhost:3000', 'localhost:3001'];

  domains.forEach(domain => {
    document.cookie.split(";").forEach(function(c) {
      const cookieName = c.split("=")[0].trim();
      if (cookieName) {
        // Pulisce cookie per diversi path e domini
        document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=${domain}`;
        document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
        document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=.${domain}`;
      }
    });
  });

  // Pulisce localStorage e sessionStorage
  const keysToKeep = ['theme', 'language']; // Mantieni solo settings non critici
  const allKeys = Object.keys(localStorage);

  allKeys.forEach(key => {
    if (!keysToKeep.includes(key)) {
      localStorage.removeItem(key);
    }
  });

  sessionStorage.clear();

  console.log('✅ Pulizia completata');
};

// ---------------------------------------------------------------------
// COMPONENTI
// ---------------------------------------------------------------------

// Componente "Guardiano" per proteggere le rotte
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Componente Layout per le rotte protette
const AppLayout = () => (
  <ProtectedRoute>
    <MainApp>
      <Outlet />
    </MainApp>
  </ProtectedRoute>
);

// Componente che contiene la logica che dipende dal contesto
function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  // Logging di debug solo in sviluppo
  if (process.env.NODE_ENV === 'development') {
    console.log(`[AppRoutes.js] Render. Loading: ${loading}, IsAuthenticated: ${isAuthenticated}`);
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Caricamento in corso...</div>;
  }
  
  return (
    <QuickComposeProvider>
      <BrowserRouter>
        <Routes>
          {/* Rotte pubbliche */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register/:token" element={<RegistrationPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          {/* Rotte protette */}
          <Route element={<AppLayout />}>
            <Route path="/" element={null} />
            <Route path="/ppa/task/:istanzaId" element={<IstanzaDetailView />} />
            <Route path="/liste/*" element={<ListComposerWrapper />} />
            <Route path="/module/:moduleKey" element={<StandaloneModule />} />
            {/* Aggiungi qui altre rotte interne */}
          </Route>

          {/* Rotta di fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QuickComposeProvider>
  );
}

// Componente App principale
function App() {
  // Pulizia cookie all'avvio solo in sviluppo
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      clearAllCookies();
    }
  }, []);

  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App; 