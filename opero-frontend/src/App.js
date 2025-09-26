/**
 * ======================================================================
 * File: src/App.js (v2.5 - con Struttura a Layout Robusta)
 * ======================================================================
 * @description
 * AGGIORNATO: La struttura del router ora definisce MainApp come un
 * layout esplicito per le rotte interne. Questo risolve i conflitti
 * di navigazione e garantisce che le viste come IstanzaDetailView
 * vengano renderizzate correttamente all'interno dell'interfaccia.
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

// Componente "Guardiano" per proteggere le rotte (invariato)
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
const AppLayout = () => (
  <ProtectedRoute>
    <MainApp>
      <Outlet /> {/* Outlet è il segnaposto dove React Router inserirà le rotte figlie */}
    </MainApp>
  </ProtectedRoute>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rotte pubbliche */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register/:token" element={<RegistrationPage />} />

          {/* Rotta per i moduli standalone (scorciatoie) */}
          <Route 
            path="/module/:moduleKey" 
            element={<ProtectedRoute><StandaloneModule /></ProtectedRoute>} 
          />

          {/* Rotte interne che usano MainApp come layout */}
          <Route element={<AppLayout />}>
            <Route path="/" element={null} /> {/* La root è gestita dal default di MainApp */}
            <Route path="/ppa/task/:istanzaId" element={<IstanzaDetailView />} />
            {/* Aggiungi qui altre rotte che devono apparire DENTRO MainApp */}
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
