// #####################################################################
// # Modulo Beni Strumentali - v2.1 (con Gestione Scadenze Attiva)
// # File: opero-frontend/src/components/BeniStrumentaliModule.js
// #####################################################################

import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArchiveBoxIcon, TagIcon, CalendarDaysIcon, CogIcon,PencilSquareIcon } from '@heroicons/react/24/solid';
import BeniManager from './beni-strumentali/BeniManager';
import CategorieManager from './beni-strumentali/CategorieManager';
import TipiScadenzeManager from './beni-strumentali/TipiScadenzeManager';
// <span style="color:green;">// NUOVO: Importazione del componente ScadenzeView reale</span>
import ScadenzeView from './beni-strumentali/ScadenzeView';
import ScadenzaForm from './beni-strumentali/ScadenzaForm';


// <span style="color:orange;">// RIMOSSO: Il componente placeholder non è più necessario</span>
// const ScadenzeView = () => <div className="p-6">...</div>;

const BeniStrumentaliModule = () => {
    const [activeMenu, setActiveMenu] = useState('elenco_beni');
    const auth = useAuth();

    const menuItems = [
        { key: 'elenco_beni', label: 'ElenFco Beni', icon: ArchiveBoxIcon, requiredPermission: 'BS_VIEW_BENI' },
        { key: 'categorie', label: 'Categorie', icon: TagIcon, requiredPermission: 'BS_MANAGE_CATEGORIE' },
       { key: 'scadenze', label: 'Scadenze', icon: CalendarDaysIcon, requiredPermission: 'BS_VIEW_SCADENZE' },
        { key: 'tipi_scadenze', label: 'Tipi Scadenze', icon: CogIcon, requiredPermission: 'BS_MANAGE_TIPI_SCADENZE' },
        { key: 'elenco_scadenze', label: 'Elenco Scadenze', icon: CalendarDaysIcon, requiredPermission: 'BS_VIEW_SCADENZE' },
        { key: 'gestione_scadenze', label: 'Gestione Scadenze', icon: PencilSquareIcon, requiredPermission: 'BS_MANAGE_SCADENZE' } // <span style="color:green;">// NUOVO: Voce di menu per la gestione delle scadenze</span>
    ];
    

    const accessibleMenuItems = useMemo(() => {
        return menuItems.filter(item => auth.hasPermission(item.requiredPermission));
    }, [auth]);

    const renderContent = () => {
        switch (activeMenu) {
            case 'elenco_beni':
                return <BeniManager />;
            case 'categorie':
                return <CategorieManager />;
            // <span style="color:orange;">// MODIFICATO: Ora viene renderizzato il componente ScadenzeView corretto</span>
            case 'tipi_scadenze':
                return <TipiScadenzeManager />;
            case 'elenco_scadenze':
                return <ScadenzeView />;
            case 'gestione_scadenze': // <span style="color:green;">// NUOVO: Case per renderizzare il form delle scadenze</span>
                return <ScadenzaForm onClose={() => setActiveMenu('elenco_scadenze')} />;
            default:
                 if (accessibleMenuItems.length > 0 && !accessibleMenuItems.find(i => i.key === activeMenu)) {
                    setActiveMenu(accessibleMenuItems[0].key);
                 }
                return <p className="p-6">Seleziona una voce dal menu.</p>;
        }
    };
    
    return (
        <div className="p-6 bg-gray-50 h-full w-full">
            <div className="flex items-center border-b border-slate-200">
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
            </div>
            
            <div className="mt-6">
                {renderContent()}
            </div>
        </div>
    );
};

export default BeniStrumentaliModule;

