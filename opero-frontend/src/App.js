/**
 * ======================================================================
 * File: src/App.js (v2.6 - con QuickComposeContext Integrato)
 * ======================================================================
 * @description
 * AGGIORNATO: Integrato QuickComposeProvider per abilitare la composizione
 * rapida di email da qualsiasi punto dell'applicazione (es. condivisione PDF).
 * La struttura del router definisce MainApp come un layout esplicito per le
 * rotte interne, garantendo coerenza e risolvendo conflitti di navigazione.
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import dei componenti principali
import LoginPage from './components/LoginPage';
import MainApp from './components/MainApp';
import RegistrationPage from './components/RegistrationPage';
import StandaloneModule from './components/StandaloneModule';
import IstanzaDetailView from './components/ppa/IstanzaDetailView';
import ResetPasswordPage from './components/ResetPasswordPage';

// Import del Provider per la composizione rapida
import { QuickComposeProvider } from './context/QuickComposeContext';

// Componente "Guardiano" per proteggere le rotte
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

// Componente Layout per le rotte protette
// MainApp funge da layout principale e Outlet renderizza le rotte figlie al suo interno
const AppLayout = () => (
  <ProtectedRoute>
    <MainApp>
      <Outlet />
    </MainApp>
  </ProtectedRoute>
);

function App() {
  const { isAuthenticated, loading } = useAuth();

  // DEBUG: Logga lo stato di autenticazione ad ogni render
  // Utile in fase di sviluppo, può essere rimosso in produzione
  console.log(`[App.js] Render. Loading: ${loading}, IsAuthenticated: ${isAuthenticated}`);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Caricamento in corso...</div>;
  }
  
  return (
    // L'AuthProvider fornisce lo stato di autenticazione a tutta l'app
    <AuthProvider>
      {/* Il QuickComposeProvider è inserito qui per essere disponibile in tutta l'applicazione autenticata */}
      <QuickComposeProvider>
        <BrowserRouter>
          <Routes>
            {/* Rotte pubbliche (accessibili senza login) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register/:token" element={<RegistrationPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            
            {/* Rotta per i moduli standalone (accessibili tramite scorciatoia diretta) */}
            <Route 
              path="/module/:moduleKey" 
              element={
                <ProtectedRoute>
                  <StandaloneModule />
                </ProtectedRoute>
              } 
            />

            {/* Rotte interne che usano MainApp come layout */}
            {/* Tutte le rotte definite qui verranno renderizzate DENTRO il componente MainApp */}
            <Route element={<AppLayout />}>
              {/* La rotta '/' è gestita dal default di MainApp, quindi la mappiamo a null */}
              <Route path="/" element={null} /> 
              {/* Esempio di rotta interna per un dettaglio */}
              <Route path="/ppa/task/:istanzaId" element={<IstanzaDetailView />} />
              {/* Aggiungi qui altre rotte che devono apparire DENTRO l'interfaccia di MainApp */}
            </Route>

            {/* Rotta di fallback per percorsi non trovati */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </QuickComposeProvider>
    </AuthProvider>
  );
}

export default App;
