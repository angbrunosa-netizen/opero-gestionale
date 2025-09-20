import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArchiveBoxIcon, TagIcon, CalendarDaysIcon } from '@heroicons/react/24/solid';
import BeniManager from './beni-strumentali/BeniManager';

// Placeholder per gli altri componenti
const CategorieManager = () => <div className="p-6"><h2 className="text-2xl font-bold">Gestione Categorie</h2><p>Interfaccia per la gestione delle categorie dei beni strumentali.</p></div>;
const ScadenzeView = () => <div className="p-6"><h2 className="text-2xl font-bold">Scadenze Beni</h2><p>Interfaccia per visualizzare le scadenze imminenti.</p></div>;

const BeniStrumentaliModule = () => {
    const [activeMenu, setActiveMenu] = useState('elenco_beni');
    const auth = useAuth();

    // Menu INTERNO al modulo
    const menuItems = [
        { key: 'elenco_beni', label: 'Elenco Beni', icon: ArchiveBoxIcon, requiredPermission: 'BS_VIEW_BENI' },
        { key: 'categorie', label: 'Categorie', icon: TagIcon, requiredPermission: 'BS_MANAGE_CATEGORIE' },
        { key: 'scadenze', label: 'Scadenze', icon: CalendarDaysIcon, requiredPermission: 'BS_VIEW_SCADENZE' }
    ];

    // Filtra il menu interno in base ai permessi dell'utente
    const accessibleMenuItems = useMemo(() => {
        return menuItems.filter(item => auth.hasPermission(item.requiredPermission));
    }, [auth]);

    const renderContent = () => {
        switch (activeMenu) {
            case 'elenco_beni':
                return <BeniManager />;
            case 'categorie':
                return <CategorieManager />;
            case 'scadenze':
                return <ScadenzeView />;
            default:
                 if (accessibleMenuItems.length > 0 && !accessibleMenuItems.find(i => i.key === activeMenu)) {
                    setActiveMenu(accessibleMenuItems[0].key);
                 }
                return <p className="p-6">Seleziona una voce dal menu.</p>;
        }
    };
    
    // <span style="color:orange;">// MODIFICATO: Rimossa la struttura flex con aside e main per una disposizione verticale.</span>
    return (
        <div className="p-6 bg-gray-50 h-full w-full">
            {/* <span style="color:green;">// NUOVO: Barra del menu in stile "tabs" in alto</span> */}
            <div className="flex items-center border-b border-slate-200">
                {accessibleMenuItems.map(item => {
                    const Icon = item.icon;
                    return (
                        <button 
                            key={item.key}
                            onClick={() => setActiveMenu(item.key)} 
                            // <span style="color:orange;">// MODIFICATO: Classi per lo stile a schede verticali</span>
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
            
            {/* <span style="color:green;">// NUOVO: Contenitore per il componente attivo</span> */}
            <div className="mt-6">
                {renderContent()}
            </div>
        </div>
    );
};

export default BeniStrumentaliModule;

