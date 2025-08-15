// #####################################################################
// # Componente ContSmart - v1.0
// # File: opero-frontend/src/components/ContSmartModule.js
// #####################################################################

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// --- Icone SVG per il UI ---
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// --- Sotto-componente per la Gestione Anagrafiche ---
const AnagraficheManager = ({ session }) => {
    const [anagrafiche, setAnagrafiche] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchAnagrafiche = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/contsmart/anagrafiche`, {
                headers: { 'Authorization': `Bearer ${session.token}` }
            });
            if (response.data.success) {
                setAnagrafiche(response.data.data);
            }
        } catch (err) {
            setError('Impossibile caricare le anagrafiche.');
        } finally {
            setLoading(false);
        }
    }, [session.token]);

    useEffect(() => {
        fetchAnagrafiche();
    }, [fetchAnagrafiche]);

    return (
        <div className="p-4 sm:p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Anagrafiche Clienti e Fornitori</h2>
            {loading && <p>Caricamento...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && (
                <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ragione Sociale</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P. IVA / C.F.</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {anagrafiche.map(item => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.ragione_sociale}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.p_iva || item.codice_fiscale}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.mail_1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.codice_relazione === 'C' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                            {item.codice_relazione === 'C' ? 'Cliente' : 'Fornitore'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};


// --- Componente Principale del Modulo ---
const ContSmartModule = ({ session }) => {
    const [activeView, setActiveView] = useState('anagrafiche');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const menuItems = [
        { id: 'anagrafiche', label: 'Anagrafiche C/F' },
        { id: 'registrazioni', label: 'Registrazioni Contabili' },
        { id: 'report', label: 'Gestione Report' },
        { id: 'interrogazioni', label: 'Interrogazioni Contabili' },
        { id: 'iva', label: 'Gestione IVA' },
    ];

    const renderView = () => {
        switch (activeView) {
            case 'anagrafiche':
                return <AnagraficheManager session={session} />;
            // Aggiungi qui i case per le altre viste
            default:
                return <div className="p-6"><h2 className="text-xl">Funzionalità non ancora implementata.</h2></div>;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar per schermi grandi */}
            <aside className="hidden md:flex md:flex-shrink-0">
                <div className="flex flex-col w-64 bg-white border-r">
                    <div className="h-16 flex items-center justify-center border-b">
                        <h1 className="text-2xl font-bold text-blue-600">ContSmart</h1>
                    </div>
                    <nav className="flex-1 px-2 py-4 space-y-1">
                        {menuItems.map(item => (
                            <a
                                key={item.id}
                                href="#"
                                onClick={(e) => { e.preventDefault(); setActiveView(item.id); }}
                                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${activeView === item.id ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>
                </div>
            </aside>

            {/* Menu mobile (hamburger) */}
            {isMenuOpen && (
                <div className="md:hidden fixed inset-0 flex z-40">
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMenuOpen(false)}></div>
                    <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
                        <div className="absolute top-0 right-0 -mr-12 pt-2">
                            <button onClick={() => setIsMenuOpen(false)} className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="h-16 flex items-center justify-center border-b">
                           <h1 className="text-2xl font-bold text-blue-600">ContSmart</h1>
                        </div>
                        <nav className="mt-5 flex-1 px-2 space-y-1">
                            {menuItems.map(item => (
                                <a
                                    key={item.id}
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); setActiveView(item.id); setIsMenuOpen(false); }}
                                    className={`flex items-center px-4 py-2 text-base font-medium rounded-md ${activeView === item.id ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                                >
                                    {item.label}
                                </a>
                            ))}
                        </nav>
                    </div>
                </div>
            )}

            {/* Contenuto Principale */}
            <div className="flex flex-col flex-1 w-0 overflow-hidden">
                <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
                    <button onClick={() => setIsMenuOpen(true)} className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                        <MenuIcon />
                    </button>
                </div>
                <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
                    {renderView()}
                </main>
            </div>
        </div>
    );
};

export default ContSmartModule;
