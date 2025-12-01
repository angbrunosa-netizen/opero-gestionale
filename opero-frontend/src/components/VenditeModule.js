/**
 * @file opero-frontend/src/components/VenditeModule.js
 * @description Modulo principale per la sezione Vendite. Gestisce la navigazione tra Clienti, Tabelle e Liste.
 * - v2.0: Aggiunta integrazione con ListComposer per la gestione delle liste di articoli
 * - v1.2: Migliorato il layout e aggiunto un'intestazione per dare contesto sulla vista attiva.
 * @version 2.0
 */

import React, { useState } from 'react';
import ClientiManager from './vendite/ClientiManager';
import TabelleVenditeManager from './vendite/TabelleVenditeManager';
import ListComposer from './liste/ListComposer'; // Aggiunto import del ListComposer

const VenditeModule = () => {
    const [currentView, setCurrentView] = useState('clienti'); // 'clienti', 'tabelle' o 'liste'

    // Funzione per ottenere il titolo della vista corrente
    const getViewTitle = () => {
        switch (currentView) {
            case 'clienti':
                return 'Gestione Clienti';
            case 'tabelle':
                return 'Tabelle Vendite';
            case 'liste':
                return 'Liste Articoli';
            default:
                return 'Gestione Clienti';
        }
    };

    const renderContent = () => {
        switch (currentView) {
            case 'clienti':
                return <ClientiManager 
                    onNavigateToTabelle={() => setCurrentView('tabelle')} 
                    onNavigateToListe={() => setCurrentView('liste')} // Aggiunto navigazione verso le liste
                />;
            case 'tabelle':
                return <TabelleVenditeManager onBack={() => setCurrentView('clienti')} />;
            case 'liste':
                return <ListComposer onBack={() => setCurrentView('clienti')} />; // Aggiunto render del ListComposer
            default:
                return <ClientiManager 
                    onNavigateToTabelle={() => setCurrentView('tabelle')} 
                    onNavigateToListe={() => setCurrentView('liste')}
                />;
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Header che mostra il titolo della sezione corrente */}
            <header className="bg-white p-4 border-b border-gray-200 shadow-sm">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-800">{getViewTitle()}</h1>
                    
                    {/* Navigazione rapida tra le sezioni */}
                    <nav className="flex space-x-2">
                        <button
                            onClick={() => setCurrentView('clienti')}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${
                                currentView === 'clienti' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            Clienti
                        </button>
                        <button
                            onClick={() => setCurrentView('tabelle')}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${
                                currentView === 'tabelle' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            Tabelle
                        </button>
                        <button
                            onClick={() => setCurrentView('liste')}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${
                                currentView === 'liste' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            Liste
                        </button>
                    </nav>
                </div>
            </header>
            
            {/* Area del contenuto principale, scrollabile */}
            <main className="flex-1 overflow-y-auto">
                {renderContent()}
            </main>
        </div>
    );
};

export default VenditeModule;