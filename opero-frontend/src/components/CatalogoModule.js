/**
 * @file opero-frontend/src/components/CatalogoModule.js
 * @description componente "contenitore" per il modulo catalogo.
 * - gestisce la navigazione a tab tra le varie sezioni del modulo.
 * - integra il CategorieManager nella sua tab dedicata.
 * @date 2025-09-29
 * @version 1.1
 */

import React, { useState } from 'react';
import CategorieManager from './catalogo/CategorieManager'; // <-- importiamo il nuovo componente

const CatalogoModule = () => {
    // stato per tenere traccia della tab attiva
    const [activeTab, setActiveTab] = useState('anagrafica');

    // definizione delle tab del modulo
    const tabs = [
        { id: 'anagrafica', label: 'Anagrafica' },
        { id: 'compositi', label: 'Compositi' },
        { id: 'tabelle_supporto', label: 'Tabelle di Supporto' },
        { id: 'magazzino', label: 'Magazzino' },
    ];

    // funzione per renderizzare il contenuto della tab attiva
    const renderActiveTabContent = () => {
        switch (activeTab) {
            case 'anagrafica':
                return <div className="p-4">Contenuto Anagrafica Articoli (da implementare)</div>;
            case 'compositi':
                return <div className="p-4">Gestione Prodotti Compositi (da implementare)</div>;
            case 'tabelle_supporto':
                return <CategorieManager />; // <-- ecco il nostro componente!
            case 'magazzino':
                return <div className="p-4">Gestione Magazzino (da implementare)</div>;
            default:
                return null;
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Navigazione a Tab */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 px-4" aria-label="Tabs">
                    {tabs.map((tab) => (
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
                    ))}
                </nav>
            </div>

            {/* Area Contenuto Dinamico */}
            <div className="flex-grow overflow-y-auto">
                {renderActiveTabContent()}
            </div>
        </div>
    );
};

export default CatalogoModule;

