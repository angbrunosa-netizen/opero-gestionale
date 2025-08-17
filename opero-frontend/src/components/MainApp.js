// #####################################################################
// # Componente Principale dell'Applicazione - v2.1 (con Moduli Oggetto)
// # File: opero-frontend/src/components/MainApp.js
// #####################################################################

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ModuleLoader from './ModuleLoader';
import SettingsView from './SettingsView';
import Dashboard from './Dashboard'; // Assumendo che la Dashboard sia in un file separato

const MainApp = () => {
  const { user, ditta, modules, logout } = useAuth();
  
  // Nello stato salviamo l'intero oggetto del modulo attivo, non solo il codice.
  const [activeView, setActiveView] = useState('dashboard');

  // Funzione per determinare lo stile del pulsante attivo
  const getButtonStyle = (viewKey) => {
    const currentViewKey = typeof activeView === 'object' ? activeView.chiave_componente : activeView;
    return `w-full text-left p-3 my-1 text-sm rounded transition-colors duration-200 ${
        currentViewKey === viewKey 
          ? 'bg-blue-600 text-white font-semibold' 
          : 'hover:bg-gray-700 text-gray-300'
      }`;
  };

  const renderContent = () => {
    if (typeof activeView === 'string') {
        if (activeView === 'dashboard') return <Dashboard user={user} ditta={ditta} />;
        if (activeView === 'settings') return <SettingsView />;
    }
    
    if (typeof activeView === 'object' && activeView.chiave_componente) {
        return <ModuleLoader moduleKey={activeView.chiave_componente} />;
    }

    return (
        <div className="text-center p-8 bg-white shadow rounded">
            <h2 className="text-xl font-semibold">Benvenuto in Opero!</h2>
            <p className="mt-2 text-gray-600">
              Nessun modulo risulta abilitato per la tua ditta. Contatta l'amministratore di sistema.
            </p>
        </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <aside className="w-60 bg-gray-800 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold text-white">Opero</h1>
          <span className="text-sm text-gray-400">{ditta.ragione_sociale}</span>
        </div>
        
        <nav className="flex-1 p-2 overflow-y-auto">
          <p className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase">Menu</p>
          <ul>
            <li><button onClick={() => setActiveView('dashboard')} className={getButtonStyle('dashboard')}>Dashboard</button></li>
          </ul>

          {modules.length > 0 && (
            <>
                <p className="px-2 py-1 mt-4 text-xs font-semibold text-gray-400 uppercase">Moduli</p>
                <ul>
                    {modules.map(module => (
                    <li key={module.codice}>
                        <button onClick={() => setActiveView(module)} className={getButtonStyle(module.chiave_componente)}>
                        {module.descrizione}
                        </button>
                    </li>
                    ))}
                </ul>
            </>
          )}
        </nav>
        
        <div className="p-4 border-t border-gray-700">
            <div className="mb-4">
                <p className="text-sm font-semibold">{user.nome} {user.cognome}</p>
                <p className="text-xs text-gray-400">{user.ruolo}</p>
            </div>
            <button onClick={() => setActiveView('settings')} className="w-full text-left text-sm p-2 mb-2 text-gray-300 hover:bg-gray-700 rounded">Impostazioni</button>
            <button onClick={logout} className="w-full p-2 text-sm bg-red-600 hover:bg-red-700 rounded transition-colors duration-200">
                Logout
            </button>
        </div>
      </aside>

      <main className="flex-1 p-6 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default MainApp;
