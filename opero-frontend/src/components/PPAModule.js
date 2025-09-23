/**
 * #####################################################################
 * # Componente Principale del Modulo PPA (v2.2 - Percorsi Corretti)
 * # File: opero-frontend/src/components/PPAModule.js
 * #####################################################################
 * @description
 * Gestisce la navigazione a schede per le diverse funzionalità del modulo PPA.
 * Utilizza il contesto di autenticazione (`useAuth`) per mostrare dinamicamente
 * le sezioni in base ai permessi specifici dell'utente.
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

// --- Importazione dei componenti per le singole schede ---
// I percorsi ora puntano correttamente alla sottocartella './ppa/'.
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
    }, [hasPermission, availableTabs]); // Aggiunta dipendenza per robustezza


            // ##################################################################
        // ## NUOVA FUNZIONE: Gestisce la chiusura del form di assegnazione ##
        // ##################################################################
   // Funzione per gestire la chiusura del form di assegnazione
    const handleCloseForm = () => {
        // Torna alla scheda di default (o a una specifica come 'leMieAttivita')
        const defaultTab = availableTabs.find(tab => hasPermission(tab.permission));
        setActiveTab(defaultTab ? defaultTab.key : '');
    };


   const renderContent = () => {
        switch (activeTab) {
            case 'leMieAttivita':
                return hasPermission('PPA_VIEW_MY_TASKS') ? <LeMieAttivitaPPA /> : null;
            case 'assegnazione':
                // CORREZIONE: Passiamo la prop 'onClose' al componente figlio per permettergli di chiudersi
                return hasPermission('PPA_ASSIGN_PROCEDURE') ? <AssegnaProceduraForm onClose={handleCloseForm} /> : null;
            case 'progettazione':
                return hasPermission('PPA_DESIGN_PROCEDURE') ? <ProgettazionePPA /> : null;
            case 'monitor':
                return hasPermission('PPA_MONITOR_ALL') ? <MonitorPPAAzienda /> : null;
            default:
                return <div className="p-4 text-center text-gray-500">Nessuna sezione disponibile o selezionata.</div>;
        }
    };


    return (
        <div className="p-4 bg-gray-100 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Modulo Procedure e Attività (PPA)</h1>

                <div className="flex border-b border-gray-300 mb-4 bg-white rounded-t-lg shadow">
                    {accessibleSections.map(key => (
                         <button
                            key={key}
                            className={`py-2 px-6 font-medium text-sm ${activeTab === key ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab(key)}
                        >
                            {allSections[key].label}
                        </button>
                    ))}
                </div>

                <div className="p-6 bg-white rounded-b-lg shadow">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default PPAModule;

