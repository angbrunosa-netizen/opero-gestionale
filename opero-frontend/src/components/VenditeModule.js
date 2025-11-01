/**
 * @file opero-frontend/src/components/VenditeModule.js
 * @description Modulo principale per la sezione Vendite. Gestisce la navigazione tra Clienti e Tabelle.
 * - v1.2: Migliorato il layout e aggiunto un'intestazione per dare contesto sulla vista attiva.
 * @version 1.2
 */

import React, { useState } from 'react';
import ClientiManager from './vendite/ClientiManager';
import TabelleVenditeManager from './vendite/TabelleVenditeManager';
// Rimosso: CondizioniAcquistiManager (non utilizzato in questo file)

const VenditeModule = () => {
    const [currentView, setCurrentView] = useState('clienti'); // 'clienti' o 'tabelle'

    // Funzione per ottenere il titolo della vista corrente
    const getViewTitle = () => {
        switch (currentView) {
            case 'clienti':
                return 'Gestione Clienti';
            case 'tabelle':
                return 'Tabelle Vendite';
            default:
                return 'Gestione Clienti';
        }
    };

    const renderContent = () => {
        switch (currentView) {
            case 'clienti':
                // NOTA: Il componente ClientiManager dovrebbe avere la sua logica responsive (tabella -> card)
                return <ClientiManager onNavigateToTabelle={() => setCurrentView('tabelle')} />;
            case 'tabelle':
                // NOTA: Anche TabelleVenditeManager dovrebbe essere ottimizzato per mobile
                return <TabelleVenditeManager onBack={() => setCurrentView('clienti')} />;
            default:
                return <ClientiManager onNavigateToTabelle={() => setCurrentView('tabelle')} />;
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* NUOVO: Header che mostra il titolo della sezione corrente */}
            <header className="bg-white p-4 border-b border-gray-200 shadow-sm">
                <h1 className="text-xl font-bold text-gray-800">{getViewTitle()}</h1>
            </header>
            
            {/* Area del contenuto principale, scrollabile */}
            <main className="flex-1 overflow-y-auto">
                {renderContent()}
            </main>
        </div>
    );
};

export default VenditeModule;