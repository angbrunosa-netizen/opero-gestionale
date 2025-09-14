// #####################################################################
// # Modulo Finanze - v2.0 (Struttura Completa)
// # File: opero-gestionale/opero-frontend/src/components/FinanzeModule.js
// #####################################################################

import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { PartiteAperteManager } from './finanze/PartiteAperteManager';
import { DocumentMagnifyingGlassIcon } from '@heroicons/react/24/solid';

/**
 * Modulo Finanze, strutturato per essere estensibile.
 * Replica la logica di ContSmartModule per gestire diverse sezioni interne
 * basate sui permessi dell'utente.
 */
const FinanzeModule = () => {
    // Stato per tenere traccia della sezione attiva all'interno del modulo
    const [activeSection, setActiveSection] = useState('partite_aperte');
    const { hasPermission } = useAuth();

    // Definisce tutte le possibili sezioni del modulo Finanze.
    // Per ora ce n'è solo una, ma la struttura è pronta per aggiungerne altre.
    const sections = [
        {
            key: 'partite_aperte',
            label: 'Partite Aperte',
            icon: DocumentMagnifyingGlassIcon,
            component: PartiteAperteManager,
            permission: 'FIN_SMART' // Permesso necessario per questa sezione
        },
        // Esempio di come aggiungere una nuova sezione in futuro:
        // {
        //     key: 'cash_flow',
        //     label: 'Cash Flow',
        //     icon: ChartPieIcon,
        //     component: CashFlowManager,
        //     permission: 'CASH_FLOW_VIEW'
        // },
    ];

    // Filtra le sezioni per mostrare solo quelle a cui l'utente ha accesso
    const accessibleSections = useMemo(() => 
        sections.filter(sec => hasPermission(sec.permission)),
    [hasPermission]);
    
    // Funzione che decide quale componente renderizzare in base alla sezione attiva
    const renderContent = () => {
        const activeComponentData = accessibleSections.find(sec => sec.key === activeSection);
        if (activeComponentData) {
            const ComponentToRender = activeComponentData.component;
            return <ComponentToRender />;
        }
        return <div className="p-4">Sezione non trovata o permessi insufficienti.</div>;
    };

    return (
        <div className="p-4 sm:p-6 w-full h-full flex flex-col">
            <header className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Modulo Finanze</h1>
                <p className="text-slate-600 mt-1">Analisi e gestione dello scadenziario e dei flussi finanziari.</p>
            </header>
            
            <div className="border-b border-slate-200 mb-6">
                <nav className="-mb-px flex space-x-6 overflow-x-auto">
                    {accessibleSections.map(sec => (
                        <button 
                            key={sec.key}
                            onClick={() => setActiveSection(sec.key)}
                            className={`flex-shrink-0 flex items-center gap-2 py-3 px-2 border-b-2 font-medium text-sm transition-colors ${
                                activeSection === sec.key 
                                ? 'border-blue-500 text-blue-600' 
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                        >
                            <sec.icon className="h-5 w-5" />
                            <span>{sec.label}</span>
                        </button>
                    ))}
                </nav>
            </div>
            <main className="flex-1 bg-slate-50 p-4 rounded-lg">
                {renderContent()}
            </main>
        </div>
    );
};

export default FinanzeModule;

