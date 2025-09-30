/**
 * @file opero-frontend/src/components/CatalogoModule.js
 * @description Modulo principale per il Catalogo, con navigazione interna per le tabelle di supporto.
 * - v2.1: Corretti i percorsi di importazione dei componenti manager.
 * @date 2025-09-30
 * @version 2.1 (stabile)
 */

import { useState} from 'react';
import { useAuth } from '../context/AuthContext';
import { BuildingStorefrontIcon, TagIcon, CircleStackIcon, ScaleIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';

// #####################################################################
// ## CORREZIONE: Assicuriamo che tutti i percorsi di import siano corretti ##
// #####################################################################
import CategorieManager from './catalogo/CategorieManager';
import IvaManager from './catalogo/IvaManager';
import UnitaMisuraManager from './catalogo/UnitaMisuraManager';
import StatiEntitaManager from './catalogo/StatiEntitaManager';
import CatalogoManager from './catalogo/CatalogoManager';


// --- Sotto-componente per la vista "Tabelle di Supporto" ---
const TabelleSupportoView = () => {
    const [activeSubTab, setActiveSubTab] = useState('categorie');
    const { hasPermission } = useAuth();

    const menuItems = [
        { key: 'categorie', label: 'Categorie', component: CategorieManager, permission: 'CT_VIEW' },
        { key: 'iva', label: 'Aliquote IVA', component: IvaManager, permission: 'CT_IVA_VIEW' }, // Anche se non usiamo il view, lo teniamo per coerenza
        { key: 'um', label: 'Unità di Misura', component: UnitaMisuraManager, permission: 'CT_VIEW' }, // Simile, la vista è libera
        { key: 'stati', label: 'Stati Entità', component: StatiEntitaManager, permission: 'CT_VIEW' },
    ];

    const renderContent = () => {
        const activeItem = menuItems.find(item => item.key === activeSubTab);
        if (activeItem && hasPermission(activeItem.permission)) {
            const ComponentToRender = activeItem.component;
            return <ComponentToRender />;
        }
        return <div className="p-4">Seleziona una tabella dal menu a sinistra.</div>;
    };

    return (
        <div className="flex h-full">
            <aside className="w-64 bg-gray-50 border-r border-gray-200 p-4">
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
    );
};


// --- Componente Principale del Modulo Catalogo ---
const CatalogoModule = () => {
    const [activeTab, setActiveTab] = useState('anagrafica');
    const tabs = [
        { key: 'anagrafica', label: 'Anagrafica', icon: BuildingStorefrontIcon },
        { key: 'compositi', label: 'Compositi', icon: CircleStackIcon },
        { key: 'tabelle_supporto', label: 'Tabelle di Supporto', icon: TagIcon },
        { key: 'magazzino', label: 'Magazzino', icon: CheckBadgeIcon },
    ];

    const renderActiveTabContent = () => {
        switch (activeTab) {
            case 'anagrafica':
                return <CatalogoManager />;
            case 'compositi':
                return <div className="p-4">Gestione Prodotti Compositi (da implementare)</div>;
            case 'tabelle_supporto':
                return <TabelleSupportoView />;
            case 'magazzino':
                return <div className="p-4">Gestione Magazzino (da implementare)</div>;
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="border-b border-gray-200">
                <nav className="flex -mb-px px-4" aria-label="Tabs">
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
            </div>
            <div className="flex-1 overflow-y-auto">
                {renderActiveTabContent()}
            </div>
        </div>
    );
};

export default CatalogoModule;

