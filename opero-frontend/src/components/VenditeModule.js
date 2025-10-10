/**
 * @file opero-frontend/src/components/VenditeModule.js
 * @description Modulo principale per la sezione Vendite. Gestisce la navigazione tra Clienti e Tabelle.
 * @version 1.1
 */
import React, { useState } from 'react';
import ClientiManager from './vendite/ClientiManager';
import TabelleVenditeManager from './vendite/TabelleVenditeManager';
import CondizioniAcquistiManager from './acquisti/CondizioniAcquistiManager';
const VenditeModule = () => {
    const [currentView, setCurrentView] = useState('clienti'); // 'clienti' o 'tabelle'

    const renderContent = () => {
        switch (currentView) {
            case 'clienti':
                return <ClientiManager onNavigateToTabelle={() => setCurrentView('tabelle')} />;
            case 'tabelle':
                return <TabelleVenditeManager onBack={() => setCurrentView('clienti')} />;
        
            default:
                return <ClientiManager onNavigateToTabelle={() => setCurrentView('tabelle')} />;

        }
    };

    return (
        <div className="w-full h-full">
            {renderContent()}
        </div>
    );
};

export default VenditeModule;

