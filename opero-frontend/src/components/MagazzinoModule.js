/**
 * @file opero-frontend/src/components/MagazzinoModule.js
 * @description Componente principale per il modulo Magazzino, con navigazione a schede.
 * @version 1.0
 * @date 2025-10-04
 */

import React, { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import CatalogoManager from './catalogo/CatalogoManager';
import GiacenzeManager from './magazzino/GiacenzeManager';
import ConfigurazioneView from './magazzino/ConfigurazioneView';
import MovimentiManager from './magazzino/MovimentiManager';
const TabelleVenditeManager = React.lazy(() => import('./vendite/TabelleVenditeManager'));

const MagazzinoModule = () => {
    const [activeTab, setActiveTab] = useState('giacenze');
    const { hasPermission } = useAuth();
    
    // Stato per forzare l'aggiornamento della griglia giacenze
    const [refreshGiacenzeKey, setRefreshGiacenzeKey] = useState(0);
    const forceRefreshGiacenze = useCallback(() => {
        setRefreshGiacenzeKey(oldKey => oldKey + 1);
    }, []);


    const tabs = [
        { id: 'giacenze', label: 'Giacenze', permission: 'MG_GIACENZE_VIEW' },
        { id: 'movimenti', label: 'Movimenti', permission: 'MG_MOVIMENTI_MANAGE' },
        { id: 'anagrafica', label: 'Anagrafica Articoli', permission: 'CT_VIEW' },
        { id: 'configurazione', label: 'Configurazione Magazzino', permission: 'MG_CONFIG_MANAGE' },
         { id: 'tabelle_vendite', label: 'Tabelle_Vendite', permission: 'VA_CLIENTI_VIEW' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'giacenze':
                return <GiacenzeManager key={refreshGiacenzeKey} />;
            case 'movimenti':
                return <MovimentiManager forceRefreshGiacenze={forceRefreshGiacenze} />;
            case 'anagrafica':
                return <CatalogoManager />;
            case 'configurazione':
                return <ConfigurazioneView />;
            default:
                return <div>Seleziona una scheda</div>;
            case 'tabelle_vendite':
                return (
                    <React.Suspense fallback={<div>Caricamento...</div>}>
                        <TabelleVenditeManager />
                    </React.Suspense>
                );
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Modulo Magazzino</h1>
            
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map(tab => (
                         hasPermission(tab.permission) && (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                {tab.label}
                            </button>
                        )
                    ))}
                </nav>
            </div>

            <div className="mt-6">
                {renderContent()}
            </div>
        </div>
    );
};

export default MagazzinoModule;

