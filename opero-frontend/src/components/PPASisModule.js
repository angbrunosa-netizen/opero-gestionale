/**
 * #####################################################################
 * # Componente Principale del Modulo PPA SIS - v3.6 (Fix Click Mobile)
 * # File: opero-frontend/src/components/PPASisModule.js
 * #####################################################################
 * @description
 * Implementa una navigazione laterale su desktop e un menu a tendina (hamburger)
 * su mobile. Risolto il bug che impediva i click sul menu mobile.
 */
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

// Import dei componenti che rappresentano le viste principali
import AssegnaProceduraForm from './ppa/AssegnaProceduraForm';
import ProgettazionePPA from './ppa/ProgettazionePPA';
import MonitorView from './ppa/MonitorView';

// Import delle icone per il menu
import { FingerPrintIcon, Cog8ToothIcon, EyeIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const PPASisModule = () => {
    const { hasPermission } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const mobileMenuRef = useRef(null);

    const availableViewKeys = useMemo(() => {
        const keys = [];
        if (hasPermission('PPA_MONITOR_ALL') || hasPermission('PPA_VIEW_MY_TASKS')) {
            keys.push('monitor');
        }
        if (hasPermission('PPA_ASSIGN_PROCEDURE')) {
            keys.push('assegnazione');
        }
        if (hasPermission('PPA_DESIGN_PROCEDURE')) {
            keys.push('progettazione');
        }
        return keys;
    }, [hasPermission]);

    const [activeView, setActiveView] = useState(() => {
        return availableViewKeys[0] || '';
    });

    const menuItems = useMemo(() => {
        const itemsMap = {
            monitor: { key: 'monitor', label: 'Monitor', icon: EyeIcon },
            assegnazione: { key: 'assegnazione', label: 'Assegna Procedura', icon: FingerPrintIcon },
            progettazione: { key: 'progettazione', label: 'Progettazione', icon: Cog8ToothIcon },
        };
        return availableViewKeys.map(key => itemsMap[key]).filter(Boolean);
    }, [availableViewKeys]);

    const activeViewLabel = useMemo(() => {
        const activeItem = menuItems.find(item => item.key === activeView);
        return activeItem ? activeItem.label : 'PPA SIS';
    }, [activeView, menuItems]);

    // Effetto per chiudere il menu al click esterno
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Ora questo check funzionerà correttamente perché il ref copre l'intero menu
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
                setIsMobileMenuOpen(false);
            }
        };

        if (isMobileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMobileMenuOpen]);

    const renderActiveView = () => {
        switch (activeView) {
            case 'monitor':
                return <MonitorView />;
            case 'assegnazione':
                return <AssegnaProceduraForm onClose={() => console.log("Chiusura non implementata dal modulo.")}/>;
            case 'progettazione':
                return <ProgettazionePPA />;
            default:
                return (
                    <div className="flex items-center justify-center h-full bg-white rounded-lg shadow">
                        <div className="text-center p-8">
                            <h2 className="text-xl font-semibold text-gray-700">Benvenuto nel modulo PPA SIS</h2>
                            <p className="text-gray-500 mt-2">Seleziona una voce dal menu per iniziare a lavorare.</p>
                        </div>
                    </div>
                );
        }
    };
    
    const handleMobileMenuClick = (key) => {
        setActiveView(key);
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="flex flex-col h-full bg-gray-50" style={{ height: 'calc(100vh - 4rem)' }}>
            {/* Header Mobile: visibile solo su schermi piccoli */}
            <header className="bg-white border-b border-gray-200 md:hidden">
                {/* CORREZIONE: Il ref è stato spostato qui per coprire sia l'header che il menu a tendina */}
                <div ref={mobileMenuRef}>
                    <div className="flex justify-between items-center p-4">
                        <span className="text-lg font-semibold text-gray-700">{activeViewLabel}</span>
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                        >
                            {isMobileMenuOpen ? (
                                <XMarkIcon className="h-6 w-6" />
                            ) : (
                                <Bars3Icon className="h-6 w-6" />
                            )}
                        </button>
                    </div>

                    {/* Pannello del menu a tendina mobile */}
                    {isMobileMenuOpen && (
                        <nav className="px-2 pb-3 space-y-1 bg-white shadow-lg">
                            {menuItems.map(({ key, label, icon: Icon }) => (
                                <button
                                    key={key}
                                    onClick={() => handleMobileMenuClick(key)}
                                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                        activeView === key
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                                >
                                    <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                                    <span>{label}</span>
                                </button>
                            ))}
                        </nav>
                    )}
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Menu Verticale Sinistro: visibile solo su schermi medi e grandi */}
                <aside className="hidden md:flex w-60 bg-white p-4 flex-shrink-0 flex-col border-r">
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
                <main className="flex-1 p-6 overflow-y-auto">
                    {renderActiveView()}
                </main>
            </div>
        </div>
    );
};

export default PPASisModule;