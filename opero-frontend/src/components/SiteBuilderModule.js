/**
 * Nome File: SiteBuilderModule.js
 * Posizione: src/components/SiteBuilderModule.js
 * Data: 16/12/2025
 * Descrizione: Modulo principale CMS con logica di selezione Multi-Tenant.
 * - System Admin: Seleziona la ditta target (Tipo 1) da gestire.
 * - Ditta Admin: Gestisce direttamente la propria ditta.
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api'; // Import con graffe corretto
import SiteConfig from './cms/SiteConfig';
import PageManager from './cms/PageManager';
import BlogManager from './cms/BlogManager';
import PageConfigManager from './cms/PageConfigManager';
import CatalogManager from './cms/CatalogManager';
import {
    GlobeAltIcon, Cog6ToothIcon, DocumentDuplicateIcon,
    BuildingOfficeIcon, ArrowLeftOnRectangleIcon, NewspaperIcon,
    ShoppingBagIcon
} from '@heroicons/react/24/outline';

const SiteBuilderModule = () => {
    const { user, ditta: currentSessionDitta } = useAuth();
    
    // Stato per la ditta che stiamo effettivamente gestendo (Target)
    const [targetDitta, setTargetDitta] = useState(null);
    
    // Lista ditte (solo per System Admin)
    const [availableCompanies, setAvailableCompanies] = useState([]);
    const [isLoadingList, setIsLoadingList] = useState(false);
    
    const [activeTab, setActiveTab] = useState('config');
    const [showPageConfigManager, setShowPageConfigManager] = useState(false);

    // 1. Determina i permessi
    const isSystemAdmin = user?.id_ruolo === 1;
    
    // 2. All'avvio: Se NON è System Admin, il target è la ditta della sessione corrente.
    // Se è System Admin, carichiamo la lista per fargli scegliere.
    useEffect(() => {
        if (!isSystemAdmin) {
            // Utente normale: gestisce solo la sua ditta
            if (currentSessionDitta?.id_tipo_ditta === 1) {
                setTargetDitta(currentSessionDitta);
            }
        } else {
            // System Admin: Carica lista ditte
            loadCompanies();
        }
    }, [isSystemAdmin, currentSessionDitta]);

    const loadCompanies = async () => {
        setIsLoadingList(true);
        try {
            const res = await api.get('/admin/cms/companies');
            setAvailableCompanies(res.data);
        } catch (error) {
            console.error("Errore caricamento ditte:", error);
            alert("Impossibile caricare la lista delle ditte.");
        } finally {
            setIsLoadingList(false);
        }
    };

    // --- VISTA 1: SELETTORE DITTA (Solo System Admin e nessun target selezionato) ---
    if (isSystemAdmin && !targetDitta) {
        return (
            <div className="p-8 bg-gray-50 h-full overflow-auto">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Gestione Siti Web Ditte</h1>
                        <p className="text-gray-600 mt-2">Selezio1na una Ditta Proprietaria (Tipo 1) per creare o modificare il suo sito web.</p>
                    </div>

                    {isLoadingList ? (
                        <div className="text-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-500">Caricamento aziende...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {availableCompanies.map(company => (
                                <div 
                                    key={company.id} 
                                    onClick={() => setTargetDitta(company)}
                                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="p-3 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <BuildingOfficeIcon className="h-8 w-8" />
                                        </div>
                                        {company.shop_attivo ? (
                                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">Online</span>
                                        ) : (
                                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">Non attivo</span>
                                        )}
                                    </div>
                                    <h3 className="mt-4 text-lg font-bold text-gray-900 group-hover:text-blue-600">{company.ragione_sociale}</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {company.url_slug ? (
                                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                                {company.url_slug}.operocloud.it
                                            </span>
                                        ) : (
                                            "Sito non ancora configurato"
                                        )}
                                    </p>
                                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-sm text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                        Gestisci Sito →
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Caso: Utente non autorizzato (es. Ditta non tipo 1)
    if (!targetDitta) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-10 text-center bg-gray-50">
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-gray-900">Funzione non disponibile</h2>
                    <p className="text-gray-600 mt-2">La tua ditta non è abilitata alla gestione di un sito web proprietario.</p>
                </div>
            </div>
        );
    }

    // --- VISTA 2: EDITOR DEL SITO (Configurazione e Pagine) ---
    const previewUrl = `http://${targetDitta.url_slug || 'test'}.localhost:3000`;

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Header con contesto Ditta */}
            <div className="bg-white border-b px-8 py-4 shadow-sm flex justify-between items-center">
                <div className="flex items-center gap-4">
                    {/* Pulsante Indietro (Solo per System Admin) */}
                    {isSystemAdmin && (
                        <button 
                            onClick={() => { setTargetDitta(null); setActiveTab('config'); }}
                            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition"
                            title="Torna alla lista ditte"
                        >
                            <ArrowLeftOnRectangleIcon className="h-6 w-6" />
                        </button>
                    )}
                    
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <GlobeAltIcon className="h-6 w-6 text-blue-600" />
                            Costruttore Siti
                        </h1>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                            Gestione per: <span className="font-bold text-gray-800 bg-yellow-100 px-2 rounded">{targetDitta.ragione_sociale}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {targetDitta.url_slug && (
                        <a 
                            href={previewUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition flex items-center gap-2"
                        >
                            <GlobeAltIcon className="h-4 w-4" />
                            Anteprima Live
                        </a>
                    )}
                </div>
            </div>

            {/* Navigazione Tabs */}
            <div className="bg-white border-b px-8">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('config')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition ${
                            activeTab === 'config'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <Cog6ToothIcon className="h-5 w-5" />
                        Configurazione & Tema
                    </button>
                    <button
                        onClick={() => setActiveTab('pages')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition ${
                            activeTab === 'pages'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <DocumentDuplicateIcon className="h-5 w-5" />
                        Pagine & Contenuti
                    </button>
                    <button
                        onClick={() => setShowPageConfigManager(true)}
                        className="py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 relative group"
                    >
                        <Cog6ToothIcon className="h-5 w-5" />
                        Configurazione SEO
                        <span className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Gestione avanzata SEO, menu e visibilità pagine
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('blog')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition ${
                            activeTab === 'blog'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <NewspaperIcon className="h-5 w-5" />
                        Blog & News
                    </button>
                    <button
                        onClick={() => setActiveTab('catalog')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition ${
                            activeTab === 'catalog'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <ShoppingBagIcon className="h-5 w-5" />
                        Catalogo Prodotti
                    </button>
                </nav>
            </div>

            {/* Area Contenuto - Passiamo l'ID della ditta target, NON quella di sessione */}
            <div className="flex-1 overflow-auto p-8">
                {activeTab === 'config' && <SiteConfig dittaId={targetDitta.id} key={`conf-${targetDitta.id}`} />}
                {activeTab === 'pages' && <PageManager dittaId={targetDitta.id} key={`pages-${targetDitta.id}`} />}
                {activeTab === 'blog' && <BlogManager dittaId={targetDitta.id} key={`blog-${targetDitta.id}`} />}
                {activeTab === 'catalog' && <CatalogManager dittaId={targetDitta.id} key={`catalog-${targetDitta.id}`} />}
            </div>

            {/* PageConfigManager Modal */}
            {showPageConfigManager && (
                <PageConfigManager
                    dittaId={targetDitta.id}
                    onClose={() => setShowPageConfigManager(false)}
                />
            )}
        </div>
    );
};

export default SiteBuilderModule;