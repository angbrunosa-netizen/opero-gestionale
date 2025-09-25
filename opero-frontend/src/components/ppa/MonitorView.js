/**
 * #####################################################################
 * # Componente Vista Monitor PPA - v1.0 
 * # File: opero-frontend/src/components/ppa/MonitorView.js
 * #####################################################################
 * @description
 * Componente interno al modulo PPA SIS. Gestisce la navigazione a tab
 * tra "Le Mie Attività" e "Monitoraggio Azienda", mostrando il contenuto
 * appropriato in base alla selezione e ai permessi dell'utente.
 */
import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

// Import dei componenti da visualizzare nei tab
import LeMieAttivitaPPA from './LeMieAttivitaPPA';
import MonitorPPAAzienda from './MonitorPPAAzienda';

const MonitorView = () => {
    const { hasPermission } = useAuth();
    const [activeTab, setActiveTab] = useState('');

    // Definisce le tab disponibili basandosi sui permessi
    const availableTabs = useMemo(() => {
        const tabs = [];
        if (hasPermission('PPA_VIEW_MY_TASKS')) {
            tabs.push({ key: 'leMieAttivita', label: 'Le Mie Attività' });
        }
        if (hasPermission('PPA_MONITOR_ALL')) {
            tabs.push({ key: 'monitorAzienda', label: 'Monitoraggio Azienda' });
        }
        return tabs;
    }, [hasPermission]);

    // Imposta il primo tab disponibile come attivo all'avvio
    useEffect(() => {
        if (availableTabs.length > 0) {
            setActiveTab(availableTabs[0].key);
        }
    }, [availableTabs]);
    
    // Funzione per renderizzare il componente corretto in base al tab attivo
    const renderTabContent = () => {
        switch (activeTab) {
            case 'leMieAttivita':
                return <LeMieAttivitaPPA />;
            case 'monitorAzienda':
                return <MonitorPPAAzienda />;
            default:
                return <div className="p-4 text-center text-gray-500">Nessuna vista di monitoraggio disponibile.</div>;
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Monitor</h1>
            
            {/* Navigazione a Tab Orizzontale */}
            <div className="flex border-b border-gray-200 mb-4">
                {availableTabs.map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`py-2 px-5 font-medium text-sm transition-colors duration-200 outline-none focus:outline-none ${
                            activeTab === key
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Contenuto del Tab Attivo */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default MonitorView;
