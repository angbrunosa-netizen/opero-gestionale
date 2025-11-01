/**
 * @file opero-frontend/src/components/vendite/TabelleVenditeManager.js
 * @description Componente per la gestione delle tabelle vendite.
 * - v2.4: Implementata la navigazione responsive con menu a tendina per mobile.
 * @version 2.4 (responsive)
 */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import CategorieClientiManager from './CategorieClientiManager';
import MatriceScontiManager from './MatriceScontiManager';
import TipiPagamentoManager from '../amministrazione/TipiPagamentoManager';
import GruppiClientiManager from './GruppiClientiManager';
import TrasportatoriManager from './TrasportatoriManager';
import ContrattiManager from './ContrattiManager';
import TipiDocumentoManager from './TipiDocumentoManager';
import { ArrowLeftIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../context/AuthContext';
import CondizioniAcquistiManager from '../acquisti/CondizioniAcquistiManager';

// --- Componente Principale con Tabs ---
const TabelleVenditeManager = ({ onBack }) => {
    const { hasPermission } = useAuth();
    const [activeTab, setActiveTab] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const mobileMenuRef = useRef(null);

    const allTabs = [
        { id: 'categorie', label: 'Categorie Clienti' },
        { id: 'gruppi', label: 'Gruppi Clienti'},
        { id: 'matriciSconti', label: 'Matrici Sconti' },
        { id: 'tipiPagamento', label: 'Tipi Pagamento' },
        { id: 'trasportatori', label: 'Trasportatori', permission: 'VA_TRASPORTATORI_VIEW' },
        { id: 'contratti', label: 'Contratti' },
        { id: 'documenti', label: 'Tipi Documento' },
        { id: 'condizioni', label: 'Condizioni Acquisti', permission: 'AC_VIEW' }
    ];

    const availableTabs = useMemo(() => {
        return allTabs.filter(tab => !tab.permission || hasPermission(tab.permission));
    }, [allTabs, hasPermission]);

    const activeTabLabel = useMemo(() => {
        const activeItem = availableTabs.find(tab => tab.id === activeTab);
        return activeItem ? activeItem.label : 'Tabelle';
    }, [activeTab, availableTabs]);

    useEffect(() => {
        if (availableTabs.length > 0 && activeTab === '') {
            setActiveTab(availableTabs[0].id);
        }
    }, [availableTabs, activeTab]);

    useEffect(() => {
        const handleClickOutside = (event) => {
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

    const handleMobileMenuClick = (tabId) => {
        setActiveTab(tabId);
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="bg-white p-4 md:p-6 shadow rounded-lg h-full flex flex-col">
            {/* Header con navigazione responsive */}
            <header className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <button onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-gray-200">
                        <ArrowLeftIcon className="h-6 w-6 text-gray-700" />
                    </button>
                    {/* Titolo dinamico visibile solo su mobile */}
                    <h2 className="md:hidden text-xl font-bold text-gray-800">{activeTabLabel}</h2>
                    {/* Titolo statico visibile solo su desktop */}
                    <h2 className="hidden md:block text-xl font-bold text-gray-800">Tabelle Vendite</h2>
                </div>

                {/* Menu Desktop: visibile solo su schermi medi e grandi */}
                <nav className="hidden md:flex -mb-px" aria-label="Tabs">
                    {availableTabs.map((tab) => (
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

                {/* Menu Mobile: visibile solo su schermi piccoli */}
                <div ref={mobileMenuRef} className="md:hidden relative">
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

                    {isMobileMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                            <div className="py-1">
                                {availableTabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleMobileMenuClick(tab.id)}
                                        className={`block w-full text-left px-4 py-2 text-sm font-medium transition-colors ${
                                            activeTab === tab.id
                                                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </header>
            
            {/* Area del contenuto */}
            <div className="flex-1 overflow-y-auto">
                {/* NOTA: I componenti figli (es. CategorieClientiManager) dovrebbero avere la loro logica responsive per le tabelle. */}
                {activeTab === 'categorie' && <CategorieClientiManager />}
                {activeTab === 'gruppi' && <GruppiClientiManager />}
                {activeTab === 'matriciSconti' && <MatriceScontiManager />}
                {activeTab === 'tipiPagamento' && <TipiPagamentoManager />} 
                {activeTab === 'trasportatori' && <TrasportatoriManager />}
                {activeTab === 'contratti' && <ContrattiManager />}
                {activeTab === 'documenti' && <TipiDocumentoManager />}
                {activeTab === 'condizioni' && <CondizioniAcquistiManager />}
            </div>
        </div>
    );
};

export default TabelleVenditeManager;