/**
 * #####################################################################
 * # Componente App Principale - v2.4 (con Struttura a Layout)
 * # File: opero-frontend/src/App.js
 * #####################################################################
 *
 * @description
 * AGGIORNATO: La struttura del router è stata modificata per usare MainApp
 * come un layout persistente per tutte le rotte interne. Questo risolve
 * il problema della navigazione che "usciva" dall'interfaccia principale.
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import MainApp from './components/MainApp';
import RegistrationPage from './components/RegistrationPage';
import StandaloneModule from './components/StandaloneModule';
// Importiamo il componente che vogliamo visualizzare all'interno del layout
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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* --- Rotte Pubbliche (accessibili senza login) --- */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register/:token" element={<RegistrationPage />} />
          <Route 
            path="/module/:moduleKey" 
            element={<ProtectedRoute><StandaloneModule /></ProtectedRoute>} 
          />

          {/* ###############################################################
            ## CORREZIONE: MainApp ora funge da layout per TUTTE le rotte  ##
            ## interne, grazie all'uso del path="/*".                    ##
            ############################################################### */}
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <MainApp>
                  {/* React Router renderizzerà qui la rotta figlia che corrisponde all'URL */}
                  <Routes>
                    {/* La rotta di default '/' non fa nulla, MainApp mostrerà il suo stato di default (es. Dashboard) */}
                    <Route path="/" element={<div />} /> 
                    
                    {/* La nostra nuova rotta per lo spazio collaborativo, ora all'interno del layout */}
                    <Route path="/ppa/task/:istanzaId" element={<IstanzaDetailView />} />
                    
                    {/* Aggiungi qui altre rotte future che devono apparire DENTRO MainApp */}
                  </Routes>
                </MainApp>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

