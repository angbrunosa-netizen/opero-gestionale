// #####################################################################
// # Componente Dashboard - v1.0
// # File: opero-frontend/src/components/Dashboard.js
// #####################################################################

import React from 'react';

const Dashboard = ({ user, ditta }) => {
  // Aggiungiamo un controllo per assicurarci che user e ditta esistano prima di provare a leggerli
  if (!user || !ditta) {
    return <div>Caricamento dati...</div>;
  }

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
};

export default Dashboard;