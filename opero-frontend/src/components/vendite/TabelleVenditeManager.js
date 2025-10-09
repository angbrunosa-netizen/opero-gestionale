/**
 * @file opero-frontend/src/components/vendite/TabelleVenditeManager.js
 * @description Componente per la gestione delle tabelle vendite. Corretto l'uso dell'hook useAuth e migliorata la logica dei permessi sui tab.
 * @version 2.3
 */
import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CategorieClientiManager from './CategorieClientiManager';
import MatriceScontiManager from './MatriceScontiManager';
import TipiPagamentoManager from '../amministrazione/TipiPagamentoManager';
import GruppiClientiManager from './GruppiClientiManager';
import TrasportatoriManager from './TrasportatoriManager';
import ContrattiManager from './ContrattiManager';
import TipiDocumentoManager from './TipiDocumentoManager';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../context/AuthContext';

// --- Componente Principale con Tabs ---
const TabelleVenditeManager = ({ onBack }) => {
    // CORREZIONE: L'hook useAuth() va chiamato DENTRO il corpo del componente React.
    const { hasPermission } = useAuth();

    const allTabs = [
        { id: 'categorie', label: 'Categorie Clienti' },
        { id: 'gruppi', label: 'Gruppi Clienti'},
        { id: 'matriciSconti', label: 'Matrici Sconti' },
        { id: 'tipiPagamento', label: 'Tipi Pagamento' },
        // MIGLIORAMENTO: Aggiungo il permesso richiesto direttamente nell'oggetto del tab
        { id: 'trasportatori', label: 'Trasportatori', permission: 'VA_TRASPORTATORI_VIEW' },
        { id: 'contratti', label: 'Contratti' },
        { id: 'documenti', label: 'Tipi Documento' },
    ];

    // Filtra i tab in base ai permessi dell'utente
    const availableTabs = allTabs.filter(tab => !tab.permission || hasPermission(tab.permission));

    const [activeTab, setActiveTab] = useState(availableTabs.length > 0 ? availableTabs[0].id : '');

    return (
        <div>
            <ToastContainer />
            <div className="bg-white p-6 shadow rounded-lg">
                <div className="flex items-center mb-4">
                    <button onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-gray-200">
                        <ArrowLeftIcon className="h-6 w-6 text-gray-700" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800">Tabelle Vendite</h2>
                </div>
                
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
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
                </div>

                <div className="pt-6">
                    {activeTab === 'categorie' && <CategorieClientiManager />}
                    {activeTab === 'gruppi' && <GruppiClientiManager />}
                    {activeTab === 'matriciSconti' && <MatriceScontiManager />}
                    {activeTab === 'tipiPagamento' && <TipiPagamentoManager />} 
                    {/* Ora il rendering è più pulito, basato solo sul tab attivo */}
                    {activeTab === 'trasportatori' && <TrasportatoriManager />}
                    {activeTab === 'contratti' && <ContrattiManager />}
                    {activeTab === 'documenti' && <TipiDocumentoManager />}
                </div>
            </div>
        </div>
    );
};

export default TabelleVenditeManager;
