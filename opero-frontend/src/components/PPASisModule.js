/**
 * #####################################################################
 * # Componente Principale del Modulo PPA SIS - v3.0 (Layout Verticale)
 * # File: opero-frontend/src/components/PPASisModule.js
 * #####################################################################
 * @description
 * Sostituisce il vecchio PPAModule. Implementa una navigazione verticale
 * persistente a sinistra e un'area di contenuto dinamica a destra.
 * Le voci di menu vengono mostrate in base ai permessi dell'utente.
 */
import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

// Import dei componenti che rappresentano le viste principali
import AssegnaProceduraForm from './ppa/AssegnaProceduraForm';
import ProgettazionePPA from './ppa/ProgettazionePPA';
import MonitorView from './ppa/MonitorView'; // Nuovo componente per i tab di monitoraggio

// Import delle icone per il menu
import { FingerPrintIcon, Cog8ToothIcon, EyeIcon } from '@heroicons/react/24/outline';

const PPASisModule = () => {
    const { hasPermission } = useAuth();
    // Stato per gestire quale vista è attualmente attiva
    const [activeView, setActiveView] = useState('');

    // Memorizza e calcola le voci di menu disponibili in base ai permessi
    const menuItems = useMemo(() => {
        const items = [];
        // La voce "Monitor" è la più importante e viene mostrata per prima
        if (hasPermission('PPA_MONITOR_ALL') || hasPermission('PPA_VIEW_MY_TASKS')) {
            items.push({ key: 'monitor', label: 'Monitor', icon: EyeIcon });
        }
        if (hasPermission('PPA_ASSIGN_PROCEDURE')) {
            items.push({ key: 'assegnazione', label: 'Assegna Procedura', icon: FingerPrintIcon });
        }
        if (hasPermission('PPA_DESIGN_PROCEDURE')) {
            items.push({ key: 'progettazione', label: 'Progettazione', icon: Cog8ToothIcon });
        }
        return items;
    }, [hasPermission]);

    // Effetto per impostare la prima voce di menu disponibile come vista di default
    useEffect(() => {
        if (menuItems.length > 0) {
            setActiveView(menuItems[0].key);
        }
    }, [menuItems]);

    // Funzione che decide quale componente renderizzare nell'area principale
    const renderActiveView = () => {
        switch (activeView) {
            case 'monitor':
                return <MonitorView />;
            case 'assegnazione':
                // Passiamo una funzione onClose fittizia se non necessaria o gestirla diversamente
                return <AssegnaProceduraForm onClose={() => console.log("Chiusura non implementata dal modulo.")}/>;
            case 'progettazione':
                return <ProgettazionePPA />;
            default:
                return (
                    <div className="flex items-center justify-center h-full bg-white rounded-lg shadow">
                        <div className="text-center p-8">
                            <h2 className="text-xl font-semibold text-gray-700">Benvenuto nel modulo PPA SIS</h2>
                            <p className="text-gray-500 mt-2">Seleziona una voce dal menu a sinistra per iniziare a lavorare.</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="flex h-full" style={{ height: 'calc(100vh - 4rem)' }}> {/* Calcola l'altezza meno l'header */}
            {/* Menu Verticale Sinistro */}
            <aside className="w-60 bg-white p-4 flex-shrink-0 flex flex-col border-r">
                <h2 className="text-lg font-bold text-gray-800 mb-6 border-b pb-3">PPA SIS Menu</h2>
                <nav className="flex flex-col space-y-2">
                    {menuItems.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setActiveView(key)}
                            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 text-left ${
                                activeView === key
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                            <span>{label}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Area Contenuto Principale */}
            <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
                {renderActiveView()}
            </main>
        </div>
    );
};

export default PPASisModule;
