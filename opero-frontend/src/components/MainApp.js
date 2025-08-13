// #####################################################################
// # Componente MainApp - v3.2 (con Gestione Dati Incompleti)
// # File: opero-frontend/src/components/MainApp.js
// #####################################################################

import React, { useState } from 'react';
import AdminPanel from './AdminPanel';
import MailModule from './MailModule';
import SettingsView from './SettingsView';
import AmministrazioneModule from './AmministrazioneModule';

// --- Componente Dashboard (MODIFICATO) ---
// Ho aggiunto dei controlli per evitare crash se i dati non sono completi.
function Dashboard({ session }) {
    // Usiamo l'optional chaining (?.) per accedere alle proprietà in modo sicuro.
    // Se 'user' o 'ditta' non esistono, il valore sarà 'undefined' invece di causare un errore.
    // Forniamo anche un valore di fallback (es. 'N/D') per la visualizzazione.
    const user = session?.user || {};
    const ditta = session?.ditta || {};

    return (
        <div className="p-8 w-full">
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Bentornato, {user.nome || user.email || 'Utente'}!</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Riquadro Dati Utente */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-slate-700 border-b pb-2 mb-4">Dati Utente</h2>
                    <div className="space-y-3 text-sm">
                        <p><strong className="w-24 inline-block">Codice:</strong> {user.id || 'N/D'}</p>
                        <p><strong className="w-24 inline-block">Nome:</strong> {`${user.nome || ''} ${user.cognome || ''}`.trim() || 'N/D'}</p>
                        <p><strong className="w-24 inline-block">Ruolo:</strong> {user.ruolo || 'N/D'}</p>
                        <p><strong className="w-24 inline-block">Livello:</strong> {user.livello || 'N/D'}</p>
                    </div>
                </div>

                {/* Riquadro Dati Ditta */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-slate-700 border-b pb-2 mb-4">Dati Ditta</h2>
                    <div className="space-y-3 text-sm">
                        <p><strong className="w-24 inline-block">Codice:</strong> {ditta.id || 'N/D'}</p>
                        <p><strong className="w-24 inline-block">Rag. Sociale:</strong> {ditta.ragione_sociale || 'N/D'}</p>
                        <p><strong className="w-24 inline-block">Tipo:</strong> {ditta.tipo_ditta || 'N/D'}</p>
                    </div>
                </div>

            </div>
        </div>
    );
}


function MainApp({ session, onLogout, onSessionUpdate, fetchWithAuth }) {
  const [mainView, setMainView] = useState('dashboard');
  
  const userPermissions = session?.user?.permissions || [];

  const buttonStyle = (viewName) => {
    const isActive = mainView === viewName;
    return `w-full p-2 rounded-md text-left transition-colors ${
      isActive
        ? 'bg-blue-100 text-blue-700 font-semibold'
        : 'hover:bg-slate-100'
    }`;
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <aside className="w-64 bg-white p-6 border-r border-slate-200 flex flex-col">
        <h2 className="text-2xl font-bold text-slate-800">Opero</h2>
        
        <nav className="mt-8 flex flex-col gap-2">
            <button onClick={() => setMainView('dashboard')} className={buttonStyle('dashboard')}>Dashboard</button>
            {userPermissions.includes('APP_IMPIEGATO') && <button onClick={() => setMainView('mail')} className={buttonStyle('mail')}>Posta</button>}
            {userPermissions.includes('MODULO_AMMINISTRAZIONE') && <button onClick={() => setMainView('amministrazione')} className={buttonStyle('amministrazione')}>Amministrazione</button>}
            {userPermissions.includes('SISTEMA_ADMIN') && <button onClick={() => setMainView('admin')} className={buttonStyle('admin')}>Pannello Admin</button>}
            <button onClick={() => setMainView('settings')} className={buttonStyle('settings')}>Impostazioni</button>
        </nav>

        <div className="mt-auto">
          <p className="font-medium text-slate-700 truncate">{session?.user?.nome || session?.user?.email || 'Nessun utente'}</p>
          <p className="text-sm text-slate-500">{session?.user?.ruolo || ''}</p>
          <button 
            onClick={onLogout} 
            className="w-full mt-4 p-2 rounded-md border border-slate-200 hover:bg-slate-100 transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>
      
      <main className="flex-1 flex overflow-hidden">
        {mainView === 'dashboard' && <Dashboard session={session} />}
        {mainView === 'mail' && userPermissions.includes('APP_IMPIEGATO') && <MailModule session={session} onSessionUpdate={onSessionUpdate} />}
        {mainView === 'amministrazione' && userPermissions.includes('MODULO_AMMINISTRAZIONE') && <AmministrazioneModule session={session} />}
        {mainView === 'admin' && userPermissions.includes('SISTEMA_ADMIN') && <div className="p-8 w-full overflow-y-auto"><AdminPanel session={session} /></div>}
        {mainView === 'settings' && <div className="p-8 w-full overflow-y-auto"><SettingsView session={session} onSessionUpdate={onSessionUpdate} /></div>}
      </main>
    </div>
  );
}

export default MainApp;
