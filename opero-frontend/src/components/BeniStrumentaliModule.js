// #####################################################################
// # Modulo Beni Strumentali - v2.4 (con Titolo Mobile Dinamico)
// # File: opero-frontend/src/components/BeniStrumentaliModule.js
// #####################################################################

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
    ArchiveBoxIcon, 
    TagIcon, 
    CalendarDaysIcon, 
    CogIcon,
    PencilSquareIcon,
    Bars3Icon,
    XMarkIcon 
} from '@heroicons/react/24/solid';
import BeniManager from './beni-strumentali/BeniManager';
import CategorieManager from './beni-strumentali/CategorieManager';
import TipiScadenzeManager from './beni-strumentali/TipiScadenzeManager';
import ScadenzeView from './beni-strumentali/ScadenzeView';
import ScadenzaForm from './beni-strumentali/ScadenzaForm';


const BeniStrumentaliModule = () => {
    const [activeMenu, setActiveMenu] = useState('elenco_beni');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const mobileMenuRef = useRef(null);
    const auth = useAuth();

    const menuItems = [
        { key: 'elenco_beni', label: 'ElenFco Beni', icon: ArchiveBoxIcon, requiredPermission: 'BS_VIEW_BENI' },
        { key: 'categorie', label: 'Categorie', icon: TagIcon, requiredPermission: 'BS_MANAGE_CATEGORIE' },
       { key: 'scadenze', label: 'Scadenze', icon: CalendarDaysIcon, requiredPermission: 'BS_VIEW_SCADENZE' },
        { key: 'tipi_scadenze', label: 'Tipi Scadenze', icon: CogIcon, requiredPermission: 'BS_MANAGE_TIPI_SCADENZE' },
        { key: 'elenco_scadenze', label: 'Elenco Scadenze', icon: CalendarDaysIcon, requiredPermission: 'BS_VIEW_SCADENZE' },
        { key: 'gestione_scadenze', label: 'Gestione Scadenze', icon: PencilSquareIcon, requiredPermission: 'BS_MANAGE_SCADENZE' }
    ];
    

    const accessibleMenuItems = useMemo(() => {
        return menuItems.filter(item => auth.hasPermission(item.requiredPermission));
    }, [auth]);

    // MODIFICATO: Calcola dinamicamente l'etichetta del menu attivo per il titolo mobile
    const activeMenuLabel = accessibleMenuItems.find(item => item.key === activeMenu)?.label || 'Beni Strumentali';

    const renderContent = () => {
        switch (activeMenu) {
            case 'elenco_beni':
                return <BeniManager />;
            case 'categorie':
                return <CategorieManager />;
            case 'tipi_scadenze':
                return <TipiScadenzeManager />;
            case 'elenco_scadenze':
                return <ScadenzeView />;
            case 'gestione_scadenze':
                return <ScadenzaForm onClose={() => setActiveMenu('elenco_scadenze')} />;
            default:
                 if (accessibleMenuItems.length > 0 && !accessibleMenuItems.find(i => i.key === activeMenu)) {
                    setActiveMenu(accessibleMenuItems[0].key);
                 }
                return <p className="p-6">Seleziona una voce dal menu.</p>;
        }
    };

    const handleMobileMenuClick = (key) => {
        setActiveMenu(key);
        setIsMobileMenuOpen(false);
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
    
    return (
        <div className="p-6 bg-gray-50 h-full w-full relative">
            <header className="border-b border-slate-200">
                <nav className="hidden md:flex items-center">
                    {accessibleMenuItems.map(item => {
                        const Icon = item.icon;
                        return (
                            <button 
                                key={item.key}
                                onClick={() => setActiveMenu(item.key)} 
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                                    activeMenu === item.key 
                                    ? 'border-blue-600 text-blue-600' 
                                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                                }`}
                            >
                                <Icon className="h-5 w-5" />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div ref={mobileMenuRef} className="relative md:hidden">
                    <div className="flex justify-between items-center py-3">
                        {/* MODIFICATO: Usa il titolo dinamico invece di uno statico */}
                        <span className="text-lg font-semibold text-gray-700">{activeMenuLabel}</span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsMobileMenuOpen(!isMobileMenuOpen);
                            }}
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
                        <div className="absolute left-0 right-0 z-50 mt-1 bg-white shadow-lg rounded-md border border-gray-200">
                            <div className="py-1">
                                {accessibleMenuItems.map(item => {
                                    const Icon = item.icon;
                                    return (
                                        <button
                                            key={item.key}
                                            onClick={() => handleMobileMenuClick(item.key)}
                                            className={`w-full flex items-center gap-3 px-4 py-2 text-base font-medium transition-colors ${
                                                activeMenu === item.key
                                                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                                                : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            <Icon className="h-5 w-5" />
                                            <span>{item.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </header>
            
            <div className="mt-6">
                {renderContent()}
            </div>
        </div>
    );
};

export default BeniStrumentaliModule;