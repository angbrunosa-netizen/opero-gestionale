/**
 * @file opero-frontend/src/components/CatalogoModule.js
 * @description Modulo principale per il Catalogo, con navigazione interna per le tabelle di supporto.
 * - v2.4: Aggiunta sezione Gestione Import separata
 * @date 2025-11-17
 * @version 2.4 (con Gestione Import)
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
    BuildingStorefrontIcon, 
    TagIcon, 
    CircleStackIcon, 
    CheckBadgeIcon,
    DocumentArrowUpIcon,
    Bars3Icon,
    XMarkIcon 
} from '@heroicons/react/24/outline';

import CategorieManager from './catalogo/CategorieManager';
import IvaManager from './catalogo/IvaManager';
import UnitaMisuraManager from './catalogo/UnitaMisuraManager';
import StatiEntitaManager from './catalogo/StatiEntitaManager';
import CatalogoManager from './catalogo/CatalogoManager';
import MagazzinoModule from './MagazzinoModule';
import GestioneImport from './catalogo/GestioneImport';


// --- Sotto-componente per la vista "Tabelle di Supporto" ---
const TabelleSupportoView = () => {
    const [activeSubTab, setActiveSubTab] = useState('categorie');
    const { hasPermission } = useAuth();

    const menuItems = [
        { key: 'categorie', label: 'Categorie', component: CategorieManager, permission: 'CT_VIEW' },
        { key: 'iva', label: 'Aliquote IVA', component: IvaManager, permission: 'CT_IVA_VIEW' },
        { key: 'um', label: 'Unità di Misura', component: UnitaMisuraManager, permission: 'CT_VIEW' },
        { key: 'stati', label: 'Stati Entità', component: StatiEntitaManager, permission: 'CT_VIEW' },
    ];

    const renderContent = () => {
        const activeItem = menuItems.find(item => item.key === activeSubTab);
        if (activeItem && hasPermission(activeItem.permission)) {
            const ComponentToRender = activeItem.component;
            return <ComponentToRender />;
        }
        return <div className="p-4">Seleziona una tabella dal menu.</div>;
    };

    return (
        <div className="h-full flex flex-col">
            <div className="hidden md:flex h-full">
                <aside className="w-64 bg-gray-50 border-r border-gray-200 p-4 flex-shrink-0">
                    <nav className="flex flex-col gap-2">
                        {menuItems.map(item => (
                            hasPermission(item.permission) && (
                                <button
                                    key={item.key}
                                    onClick={() => setActiveSubTab(item.key)}
                                    className={`px-4 py-2 text-left rounded-md text-sm font-medium transition-colors ${
                                        activeSubTab === item.key
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            )
                        ))}
                    </nav>
                </aside>
                <main className="flex-1 overflow-y-auto">
                    {renderContent()}
                </main>
            </div>
            <div className="md:hidden h-full flex flex-col">
                <nav className="flex-shrink-0 border-b border-gray-200">
                    <div className="flex -mb-px px-4" aria-label="Tabs">
                        {menuItems.map(item => (
                            hasPermission(item.permission) && (
                                <button
                                    key={item.key}
                                    onClick={() => setActiveSubTab(item.key)}
                                    className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-xs transition-colors ${
                                        activeSubTab === item.key
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            )
                        ))}
                    </div>
                </nav>
                <main className="flex-1 overflow-y-auto">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};


// --- Componente Principale del Modulo Catalogo ---
const CatalogoModule = () => {
    const [activeTab, setActiveTab] = useState('anagrafica');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const mobileMenuRef = useRef(null);

    const tabs = [
        { key: 'anagrafica', label: 'Anagrafica', icon: BuildingStorefrontIcon },
        { key: 'compositi', label: 'Compositi', icon: CircleStackIcon },
        { key: 'tabelle_supporto', label: 'Tabelle di Supporto', icon: TagIcon },
        { key: 'gestione_import', label: 'Gestione Import', icon: DocumentArrowUpIcon },
        { key: 'magazzino', label: 'Magazzino', icon: CheckBadgeIcon },
    ];

    // Calcola dinamicamente l'etichetta del tab attivo per il titolo mobile
    const activeTabLabel = tabs.find(tab => tab.key === activeTab)?.label || 'Catalogo';

    const renderActiveTabContent = () => {
        switch (activeTab) {
            case 'anagrafica':
                return <CatalogoManager />;
            case 'compositi':
                return <div className="p-4">Gestione Prodotti Compositi (da implementare)</div>;
            case 'tabelle_supporto':
                return <TabelleSupportoView />;
            case 'gestione_import':
                return <GestioneImport />;
            case 'magazzino':
                return <MagazzinoModule />;
            default:
                return null;
        }
    };

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

    const handleMobileMenuClick = (key) => {
        setActiveTab(key);
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="flex flex-col h-full bg-gray-50">
            <header className="bg-white border-b border-gray-200 relative">
                <nav className="hidden md:flex -mb-px px-4" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === tab.key
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <tab.icon className="h-5 w-5 mr-2" />
                            {tab.label}
                        </button>
                    ))}
                </nav>

                <div ref={mobileMenuRef} className="md:hidden">
                    <div className="flex justify-between items-center py-3 px-4">
                        {/* Usa il titolo dinamico invece di uno statico */}
                        <span className="text-lg font-semibold text-gray-700">{activeTabLabel}</span>
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

                    {isMobileMenuOpen && (
                        <div className="absolute left-0 right-0 z-50 bg-white shadow-lg border-b border-gray-200">
                            <div className="py-1">
                                {tabs.map(tab => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.key}
                                            onClick={() => handleMobileMenuClick(tab.key)}
                                            className={`w-full flex items-center gap-3 px-4 py-2 text-base font-medium transition-colors ${
                                                activeTab === tab.key
                                                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            <Icon className="h-5 w-5" />
                                            <span>{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </header>

            <div className="flex-1 overflow-y-auto">
                {renderActiveTabContent()}
            </div>
        </div>
    );
};

export default CatalogoModule;