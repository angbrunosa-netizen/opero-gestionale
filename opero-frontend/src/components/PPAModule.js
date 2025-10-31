/**
 * #####################################################################
 * # Componente Principale del Modulo PPA (v3.0 - Responsive Corretto)
 * # File: opero-frontend/src/components/PPAModule.js
 * #####################################################################
 * @description
 * Gestisce la navigazione a schede per le diverse funzionalità del modulo PPA.
 * Utilizza il contesto di autenticazione (`useAuth`) per mostrare dinamicamente
 * le sezioni in base ai permessi specifici dell'utente.
 * Versione responsive con menu a tendina per dispositivi mobili.
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChevronDownIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

// --- Importazione dei componenti per le singole schede ---
import LeMieAttivitaPPA from './ppa/LeMieAttivitaPPA';
import AssegnaProceduraForm from './ppa/AssegnaProceduraForm';
import ProgettazionePPA from './ppa/ProgettazionePPA';
import MonitorPPAAzienda from './ppa/MonitorPPAAzienda';

// Array di tutte le possibili schede con i relativi permessi
const availableTabs = [
    { key: 'leMieAttivita', label: 'Le Mie Attività', permission: 'PPA_VIEW_MY_TASKS' },
    { key: 'assegnazione', label: 'Assegna Procedura', permission: 'PPA_ASSIGN_PROCEDURE' },
    { key: 'progettazione', label: 'Progettazione', permission: 'PPA_DESIGN_PROCEDURE' },
    { key: 'monitor', label: 'Monitoraggio Azienda', permission: 'PPA_MONITOR_ALL' },
];

const PPAModule = () => {
    const { hasPermission } = useAuth();
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // Hook per rilevare le dimensioni della finestra
    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Determina se è mobile basandosi sulla larghezza della finestra
    const isMobile = windowSize.width < 768;
    
    // Definiamo tutte le sezioni possibili del modulo
    const allSections = {
        leMieAttivita: { component: LeMieAttivitaPPA, label: "Le Mie Attività", permission: 'PPA_VIEW_MY_TASKS' },
        assegnazione: { component: AssegnaProceduraForm, label: "Assegna Procedura", permission: 'PPA_ASSIGN_PROCEDURE' },
        progettazione: { component: ProgettazionePPA, label: "Progettazione", permission: 'PPA_DESIGN_PROCEDURE' },
        monitor: { component: MonitorPPAAzienda, label: "Monitoraggio Azienda", permission: 'PPA_MONITOR_ALL' }
    };

    // Filtriamo le sezioni accessibili in base ai permessi dell'utente
    const accessibleSections = Object.keys(allSections).filter(key => hasPermission(allSections[key].permission));
    
    // Stato per la scheda attiva. Impostiamo la prima scheda accessibile come default.
    const [activeTab, setActiveTab] = useState(accessibleSections[0] || null);

    // Determina la scheda di default in base ai permessi dell'utente
    useEffect(() => {
        const defaultTab = availableTabs.find(tab => hasPermission(tab.permission));
        if (defaultTab) {
            setActiveTab(defaultTab.key);
        }
    }, [hasPermission, availableTabs]);

    // Funzione per gestire la chiusura del form di assegnazione
    const handleCloseForm = () => {
        // Torna alla scheda di default (o a una specifica come 'leMieAttivita')
        const defaultTab = availableTabs.find(tab => hasPermission(tab.permission));
        setActiveTab(defaultTab ? defaultTab.key : '');
    };

    // Funzione per gestire il cambio di scheda
    const handleTabChange = (tabKey) => {
        setActiveTab(tabKey);
        // Chiudi il menu mobile se aperto
        if (isMobile) {
            setIsMobileMenuOpen(false);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'leMieAttivita':
                return hasPermission('PPA_VIEW_MY_TASKS') ? <LeMieAttivitaPPA /> : null;
            case 'assegnazione':
                return hasPermission('PPA_ASSIGN_PROCEDURE') ? <AssegnaProceduraForm onClose={handleCloseForm} /> : null;
            case 'progettazione':
                return hasPermission('PPA_DESIGN_PROCEDURE') ? <ProgettazionePPA /> : null;
            case 'monitor':
                return hasPermission('PPA_MONITOR_ALL') ? <MonitorPPAAzienda /> : null;
            default:
                return <div className="p-4 text-center text-gray-500">Nessuna sezione disponibile o selezionata.</div>;
        }
    };

    // Ottieni l'etichetta della scheda attiva
    const getActiveTabLabel = () => {
        const activeSection = allSections[activeTab];
        return activeSection ? activeSection.label : 'Seleziona una sezione';
    };

    return (
        <div className="p-2 md:p-4 bg-gray-100 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800">Modulo Procedure e Attività (PPA)</h1>
                </div>

                {/* Menu Desktop */}
                {!isMobile && (
                    <div className="flex border-b border-gray-300 mb-4 bg-white rounded-t-lg shadow">
                        {accessibleSections.map(key => (
                            <button
                                key={key}
                                className={`py-2 px-4 md:px-6 font-medium text-sm ${activeTab === key ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => handleTabChange(key)}
                            >
                                {allSections[key].label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Menu Mobile */}
                {isMobile && (
                    <div className="mb-4 bg-white rounded-lg shadow">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">
                                {getActiveTabLabel()}
                            </h2>
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                            >
                                {isMobileMenuOpen ? (
                                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                ) : (
                                    <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                                )}
                                <span className="sr-only">Menu</span>
                            </button>
                        </div>
                        
                        {isMobileMenuOpen && (
                            <div className="py-2">
                                {accessibleSections.map(key => (
                                    <button
                                        key={key}
                                        className={`block w-full text-left px-4 py-3 text-base font-medium ${
                                            activeTab === key
                                                ? 'bg-blue-50 border-l-4 border-blue-600 text-blue-700'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                                        }`}
                                        onClick={() => handleTabChange(key)}
                                    >
                                        {allSections[key].label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Contenuto */}
                <div className="p-4 md:p-6 bg-white rounded-b-lg shadow">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default PPAModule;