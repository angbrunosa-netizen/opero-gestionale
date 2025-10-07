/**
 * @file opero-frontend/src/components/vendite/TabelleVenditeManager.js
 * @description Componente per la gestione delle tabelle vendite. Aggiunto pulsante Indietro.
 * @version 2.2
 */
import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CategorieClientiManager from './CategorieClientiManager'; // Componente estratto
import MatriceScontiManager from './MatriceScontiManager';
import TipiPagamentoManager from '../amministrazione/TipiPagamentoManager';
import GruppiClientiManager from './GruppiClientiManager';
import TrasportatoriManager from './TrasportatoriManager';
import ContrattiManager from './ContrattiManager';
import TipiDocumentoManager from './TipiDocumentoManager';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';


// --- Componente Principale con Tabs ---
const TabelleVenditeManager = ({ onBack }) => { // <-- Riceve la prop onBack
    const [activeTab, setActiveTab] = useState('categorie');

    const tabs = [
        { id: 'categorie', label: 'Categorie Clienti' },
        { id: 'gruppi', label: 'Gruppi Clienti'},
        { id: 'matriciSconti', label: 'Matrice Sconti' },
        { id: 'tipiPagamento', label: 'Tipi Pagamento' },
        { id: 'trasportatori', label: 'Trasportatori' },
        { id: 'contratti', label: 'Contratti' },
        { id: 'documenti', label: 'Tipi Documento' },
    ];

    return (
        <div className="p-6 bg-gray-100 min-h-full">
            <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar />
            
            <div className="flex items-center gap-4 mb-4">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200">
                    <ArrowLeftIcon className="h-6 w-6 text-gray-700" />
                </button>
                <h1 className="text-2xl font-bold text-gray-800">Gestione Tabelle Vendite</h1>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                        {tabs.map((tab) => (
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
                    {activeTab === 'trasportatori' && <TrasportatoriManager />}
                    {activeTab === 'contratti' && <ContrattiManager />}
                    {activeTab === 'documenti' && <TipiDocumentoManager />}
                </div>
            </div>
        </div>
    );
};


export default TabelleVenditeManager;

