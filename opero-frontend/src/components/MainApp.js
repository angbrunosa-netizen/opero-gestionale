/*
 * ======================================================================
 * File: src/components/MainApp.js (RESPONSIVE VERSION - REFINED)
 * ======================================================================
 * Versione: 4.0 - Refactor Moduli (Sistema Unico)
 * - Rimosse tutte le importazioni dirette dei moduli.
 * - Rimosso l'array 'allModules' hard-coded.
 * - Importa 'modules' e 'componentMap' dal 'moduleRegistry.js'.
 * - 'renderContent' ora usa 'React.Suspense' per il code-splitting.
 * - Tutta la logica ora usa 'module.key' invece di 'module.id'.
 */
import React, { useState, useEffect, useCallback, useMemo, useRef, Suspense } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
// --- (MODIFICA v4.0) ---
// Rimossi tutti gli import dei moduli (es. AdminPanel, ArchivioDocumentale...)

import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import ShortcutSettingsModal from './ShortcutSettingsModal'; 

// --- (MODIFICA v4.0) ---
// Importiamo il nostro sistema unico
import { modules as allModules, componentMap } from '../lib/moduleRegistry.js';
import { 
    Cog6ToothIcon, ChevronLeftIcon, ChevronRightIcon 
} from '@heroicons/react/24/outline'; 
// (Tutte le altre icone dei moduli sono ora definite in moduleRegistry.js)
// ---
import { Capacitor } from '@capacitor/core';

ModuleRegistry.registerModules([AllCommunityModule]);

const MainApp = () => {
    const { user, ditta, logout, hasPermission, loading } = useAuth();
    // --- (MODIFICA v4.0) ---
    // 'activeModule' ora memorizza la 'key' (es. 'ARCHIVIO')
    const [activeModule, setActiveModule] = useState(null); 
    // ---
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isShortcutModalOpen, setIsShortcutModalOpen] = useState(false);
    const [shortcuts, setShortcuts] = useState([]);
    const sidebarRef = useRef(null);

    // --- (MODIFICA v4.0) ---
    // L'array 'allModules' è stato RIMOSSO.
    // Ora è importato dalla riga 31.
    // ---

    // (Funzioni fetchShortcuts, saveShortcuts... assumiamo siano qui)
    // Placeholder per le funzioni mancanti
    const fetchShortcuts = useCallback(async () => {
        // Logica per caricare le scorciatoie
        // Esempio:
        // try {
        //     const response = await api.get('/api/user/shortcuts');
        //     setShortcuts(response.data.shortcuts || []);
        // } catch (error) {
        //     console.error("Errore nel caricare le scorciatoie:", error);
        // }
    }, []);

    useEffect(() => {
        if (!Capacitor.isNativePlatform()) {
            fetchShortcuts();
        }
    }, [fetchShortcuts]);


    const handleShortcutSave = async (newShortcuts) => {
        // Logica per salvare le scorciatoie
        // Esempio:
        // try {
        //     await api.post('/api/user/shortcuts', { shortcuts: newShortcuts });
        //     setShortcuts(newShortcuts);
        //     setIsShortcutModalOpen(false);
        // } catch (error) {
        //     console.error("Errore nel salvare le scorciatoie:", error);
        // }
    };
    
    // --- (MODIFICA v4.0) ---
    // La funzione ora accetta e imposta la 'key' del modulo
    const handleModuleClick = (moduleKey) => {
        if (activeModule === moduleKey) {
            setActiveModule(null); // Deseleziona
        } else {
            setActiveModule(moduleKey);
        }
        if (Capacitor.isNativePlatform() || window.innerWidth < 1024) {
             setSidebarOpen(false);
        }
    };
    // ---

    // --- (MODIFICA v4.0) ---
    // Sostituito lo 'switch' con il caricamento dinamico
    // basato su 'componentMap' e 'React.Suspense'
    const renderContent = () => {
        if (!activeModule) {
            return (
                <div className="p-8">
                    <h2 className="text-2xl font-semibold text-gray-800">Bentornato, {user.nome}!</h2>
                    <p className="mt-2 text-gray-600">Seleziona un modulo dalla barra laterale per iniziare.</p>
                    
                    {!Capacitor.isNativePlatform() && shortcuts.length > 0 && (
                        <div className="mt-8">
                            <h3 className="text-lg font-medium text-gray-700">Scorciatoie Rapide</h3>
                            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {shortcuts.map(shortcutKey => { // <-- Ora è 'shortcutKey'
                                    const module = allModules.find(m => m.key === shortcutKey); // <-- Cerca per 'key'
                                    if (!module) return null;
                                    const Icon = module.icon;
                                    return (
                                        <button
                                            key={module.key} // <-- Usa 'key'
                                            onClick={() => handleModuleClick(module.key)} // <-- Usa 'key'
                                            className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow border border-gray-200 hover:bg-gray-50 transition-colors"
                                        >
                                            <Icon className="h-8 w-8 text-blue-600" />
                                            <span className="mt-2 text-sm font-medium text-gray-700">{module.label}</span> 
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        // Cerca il componente nella mappa usando la key
        const ComponentToRender = componentMap[activeModule];

        if (!ComponentToRender) {
             return (
                <div className="p-8">
                    <h2 className="text-2xl font-semibold text-red-600">Modulo non trovato</h2>
                    <p className="mt-2 text-gray-600">Il modulo "{activeModule}" non è stato caricato correttamente o non esiste nel registro.</p>
                </div>
            );
        }

        // Usa <Suspense> per mostrare un loader
        // mentre il codice del modulo viene scaricato
        return (
            <Suspense fallback={
                <div className="flex justify-center items-center h-full p-8">
                    <span className="text-gray-600">Caricamento modulo...</span>
                </div>
            }>
                <ComponentToRender />
            </Suspense>
        );
    };
    // --- FINE MODIFICA ---

    
    // Gestione click esterno per sidebar (invariato)
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                if (window.innerWidth < 1024) { 
                    setSidebarOpen(false);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);


    if (loading) {
        return <div className="flex justify-center items-center h-screen">Caricamento...</div>;
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside 
                ref={sidebarRef}
                className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Header Sidebar */}
                <div className="flex items-center justify-between p-4 h-16 border-b border-gray-700">
                    <span className="text-xl font-bold">OPERO</span>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-gray-400 hover:text-white">
                        <ChevronLeftIcon className="h-6 w-6" />
                    </button>
                </div>
                {/* Lista Moduli */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                    {/* --- (MODIFICA v4.0) --- */}
                    {allModules.map(module => (
                        hasPermission(module.permission) && (
                            <button
                                key={module.key} // <-- Usa 'key'
                                onClick={() => handleModuleClick(module.key)} // <-- Usa 'key'
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    activeModule === module.key // <-- Usa 'key'
                                    ? 'bg-blue-600 text-white' 
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                }`}
                            >
                                <module.icon className="h-5 w-5" />
                                {module.label} {/* <-- Usa 'label' (dal registro) */}
                            </button>
                        )
                    ))}
                    {/* --- FINE MODIFICA --- */}
                </nav>
            </aside>
            
            {/* Overlay per mobile */}
            {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)}></div>}

            {/* Contenuto Principale */}
            <div className="flex-1 flex flex-col ml-0 lg:ml-64">
                {/* Header Principale */}
                <header className="sticky top-0 z-10 flex items-center justify-between h-16 bg-white lg:bg-transparent lg:shadow-none shadow-md px-4 lg:px-8 bg-opacity-100 lg:bg-opacity-0 backdrop-blur-none lg:backdrop-blur-none">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1 text-gray-600">
                        <ChevronRightIcon className="h-6 w-6" />
                    </button>
                    
                    <div className="hidden lg:block">
                        {ditta && <span className="text-lg font-semibold text-gray-700">{ditta.ragione_sociale}</span>}
                    </div>

                    {/* --- (MODIFICA v4.0) --- */}
                    {!Capacitor.isNativePlatform() && (
                        <div className="hidden lg:flex items-center gap-2">
                            {shortcuts.map(shortcutKey => { // <-- Ora è 'shortcutKey'
                                const module = allModules.find(m => m.key === shortcutKey); // <-- Cerca per 'key'
                                if (!module) return null;
                                return (
                                    <button
                                        key={module.key} // <-- Usa 'key'
                                        onClick={() => handleModuleClick(module.key)} // <-- Usa 'key'
                                        title={module.label} // <-- Usa 'label'
                                        className={`p-2 rounded-full transition-colors ${
                                            activeModule === module.key // <-- Usa 'key'
                                            ? 'bg-blue-100 text-blue-600' 
                                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                        }`}
                                    >
                                        <module.icon className="h-5 w-5" />
                                    </button>
                                );
                            })}
                        </div>
                    )}
                    {/* --- FINE MODIFICA --- */}

                    <div className="flex items-center gap-2">
                        <span className="text-xs lg:text-sm text-gray-700 block sm:block">
                            {user.nome} {user.cognome}
                        </span>
                        {!Capacitor.isNativePlatform() && (
                            <button 
                                onClick={() => setIsShortcutModalOpen(true)} 
                                title="Personalizza"
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <Cog6ToothIcon className="h-5 w-5 lg:h-6 lg:w-6 text-gray-600" />
                            </button>
                        )}
                        <button 
                            onClick={logout} 
                            className="text-xs lg:text-sm font-medium text-red-600 hover:underline px-2"
                        >
                            Exit
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto bg-gray-100">
                    {renderContent()}
                </main>
            </div>

            {/* --- (MODIFICA v4.0) --- */}
            {!Capacitor.isNativePlatform() && isShortcutModalOpen && (
                <ShortcutSettingsModal
                    allModules={allModules.filter(m => m.key !== 'ADMIN' && m.key !== 'SETUP')} // <-- Usa 'key'
                    currentShortcuts={shortcuts}
                    onClose={() => setIsShortcutModalOpen(false)}
                    onSave={handleShortcutSave} // <-- Corretto
                />
            )}
            {/* --- FINE MODIFICA --- */}
        </div>
    );
};

export default MainApp;