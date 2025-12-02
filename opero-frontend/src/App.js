/**
 * ======================================================================
 * File: src/App.js (v2.7 - Fix Contesto Autenticazione)
 * ======================================================================
 * @description
 * CORRETTO: La logica che dipende da `useAuth` è stata spostata all'interno
 * di `AuthProvider` per rispettare le regole di React Context.
 * Questo risolve il problema per cui `AllegatiManager` riceveva `undefined`.
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
import BeneForm from './components/beni-strumentali/BeneForm';

// Import del ListComposer per le rotte liste
import ListComposerWrapper from './components/liste/ListComposerWrapper';

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
const AppLayout = () => (
  <ProtectedRoute>
    <MainApp>
      <Outlet />
    </MainApp>
  </ProtectedRoute>
);


// --- NUOVO COMPONENTE INTERNO ---
// Questo componente contiene tutta la logica che dipende dal contesto.
// Viene renderizzato DENTRO AuthProvider, quindi può usare `useAuth` in sicurezza.
function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  // DEBUG: Logga lo stato di autenticazione ad ogni render
  console.log(`[AppRoutes.js] Render. Loading: ${loading}, IsAuthenticated: ${isAuthenticated}`);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Caricamento in corso...</div>;
  }
  
  return (
    // Il QuickComposeProvider è inserito qui per essere disponibile in tutta l'applicazione autenticata
    <QuickComposeProvider>
      <BrowserRouter>
        <Routes>
          {/* Rotte pubbliche (accessibili senza login) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register/:token" element={<RegistrationPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          {/* Rotta per i moduli standalone */}
          <Route 
            path="/module/:moduleKey" 
            element={
              <ProtectedRoute>
                <StandaloneModule />
              </ProtectedRoute>
            } 
          />

          {/* Rotte interne che usano MainApp come layout */}
          <Route element={<AppLayout />}>
            <Route path="/" element={null} />
            <Route path="/ppa/task/:istanzaId" element={<IstanzaDetailView />} />
            {/* Rotte per le liste */}
            <Route path="/liste/*" element={<ListComposerWrapper />} />
            {/* Aggiungi qui altre rotte interne, inclusa quella per il BeneForm se necessario */}
            {/* Esempio: <Route path="/beni/:id/edit" element={<BeneForm />} /> */}
          </Route>

          {/* Rotta di fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QuickComposeProvider>
  );
}


// Componente App principale, ora molto più pulito
// Il suo unico scopo è fornire l'AuthProvider
function App() {
  return (
    // L'AuthProvider fornisce lo stato di autenticazione a tutta l'app
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;