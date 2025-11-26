// #####################################################################
// # Componente per il Modulo ContSmart v2.0 (Responsive)
// # File: opero-gestionale-main/opero-frontend/src/components/ContSmartModule.js
// #####################################################################

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
    FolderIcon, PencilSquareIcon, ChartBarIcon, ChevronRightIcon, PlusIcon, ArrowPathIcon, 
    PencilIcon, WrenchScrewdriverIcon, TrashIcon, ExclamationTriangleIcon, DocumentTextIcon, 
    ChartPieIcon, Cog6ToothIcon, Bars3Icon, XMarkIcon 
} from '@heroicons/react/24/solid';
import ReportView from './cont-smart/ReportView';
import PianoContiManager from './cont-smart/PianoContiManager';
import NuovaRegistrazione from './cont-smart/NuovaRegistrazione'; 
import FunzioniContabiliManager from './cont-smart/FunzioniContabiliManager';

// Componente Modale per Creazione/Modifica Piano dei Conti (responsive)
const PdcEditModal = ({ item, onSave, onCancel, pdcTree }) => {
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    // Hook per rilevare le dimensioni della finestra
    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Determina se è mobile basandosi sulla larghezza della finestra
    const isMobile = windowSize.width < 768;

    const [formData, setFormData] = useState({
        codice: '',
        descrizione: '',
        id_padre: null,
        tipo: 'Sottoconto',
        natura: 'Costo',
    });

    useEffect(() => {
        if (item) {
            setFormData({
                codice: item.codice || '',
                descrizione: item.descrizione || '',
                id_padre: item.id_padre || null,
                tipo: item.tipo || 'Sottoconto',
                natura: item.natura || 'Costo',
            });
        } else {
            setFormData({
                codice: '',
                descrizione: '',
                id_padre: null,
                tipo: 'Sottoconto',
                natura: 'Costo',
            });
        }
    }, [item]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData, item ? item.id : null);
    };
    
    // Funzione ricorsiva per generare le opzioni del select
    const renderOptions = (nodes, level = 0) => {
        let options = [];
        nodes.forEach(node => {
            if (node.tipo !== 'Sottoconto') {
                 options.push(
                    <option key={node.id} value={node.id}>
                        {'\u00A0'.repeat(level * 4)} {node.codice} - {node.descrizione}
                    </option>
                );
                if (node.figli && node.figli.length > 0) {
                    options = options.concat(renderOptions(node.figli, level + 1));
                }
            }
        });
        return options;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className={`bg-white p-4 md:p-6 rounded-lg shadow-xl w-full ${isMobile ? 'max-w-full' : 'max-w-md'} max-h-[90vh] overflow-y-auto`}>
                <h2 className="text-xl font-bold mb-4">{item ? 'Modifica Conto' : 'Nuovo Conto'}</h2>
                <form onSubmit={handleSubmit}>
                   <div className="space-y-4">
                        <div>
                            <label htmlFor="codice" className="block text-sm font-medium text-gray-700">Codice</label>
                            <input type="text" name="codice" id="codice" value={formData.codice} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                        </div>
                        <div>
                            <label htmlFor="descrizione" className="block text-sm font-medium text-gray-700">Descrizione</label>
                            <input type="text" name="descrizione" id="descrizione" value={formData.descrizione} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                        </div>
                        <div>
                            <label htmlFor="id_padre" className="block text-sm font-medium text-gray-700">Conto Padre</label>
                            <select name="id_padre" id="id_padre" value={formData.id_padre || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                                <option value="">Nessun Padre (Mastro)</option>
                                {renderOptions(pdcTree)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">Tipo</label>
                            <select name="tipo" id="tipo" value={formData.tipo} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                                <option>Mastro</option>
                                <option>Conto</option>
                                <option>Sottoconto</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="natura" className="block text-sm font-medium text-gray-700">Natura</label>
                            <select name="natura" id="natura" value={formData.natura} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                                <option>Costo</option>
                                <option>Passività</option>
                                <option>Ricavo</option>
                                <option>Attività</option>
                                <option>Patrimoniale</option>
                            </select>
                        </div>
                    </div>
                   <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'justify-end gap-4'} mt-6`}>
                        <button type="button" onClick={onCancel} className={`px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 ${isMobile ? 'w-full' : ''}`}>Annulla</button>
                        <button type="submit" className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${isMobile ? 'w-full' : ''}`}>Salva</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Componente Modale per la conferma di eliminazione (responsive)
const DeleteConfirmationModal = ({ onConfirm, onCancel, message }) => {
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    // Hook per rilevare le dimensioni della finestra
    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Determina se è mobile basandosi sulla larghezza della finestra
    const isMobile = windowSize.width < 768;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className={`bg-white p-4 md:p-6 rounded-lg shadow-xl w-full ${isMobile ? 'max-w-full' : 'max-w-sm'}`}>
                <div className="flex items-start">
                    <div className={`mx-auto ${isMobile ? 'mb-4' : 'flex-shrink-0 flex items-center justify-center'} h-12 w-12 rounded-full bg-red-100 ${isMobile ? '' : 'sm:mx-0 sm:h-10 sm:w-10'}`}>
                        <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className={`${isMobile ? 'text-center' : 'mt-3 sm:mt-0 sm:ml-4'} ${isMobile ? '' : 'sm:text-left'}`}>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Conferma Eliminazione
                        </h3>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500">
                                {message}
                            </p>
                        </div>
                    </div>
                </div>
                <div className={`mt-5 ${isMobile ? 'space-y-3' : 'sm:mt-4 sm:flex sm:flex-row-reverse'}`}>
                    <button
                        type="button"
                        className={`w-full ${isMobile ? '' : 'inline-flex justify-center'} rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 ${isMobile ? '' : 'sm:ml-3 sm:w-auto sm:text-sm'}`}
                        onClick={onConfirm}
                    >
                        Elimina
                    </button>
                    <button
                        type="button"
                        className={`mt-3 ${isMobile ? '' : 'sm:mt-0'} w-full ${isMobile ? '' : 'inline-flex justify-center'} rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 ${isMobile ? '' : 'sm:w-auto sm:text-sm'}`}
                        onClick={onCancel}
                    >
                        Annulla
                    </button>
                </div>
            </div>
        </div>
    );
};

// Componente Principale Responsive
const ContSmartModule = () => {
    const { user } = useAuth();
    const [activeSection, setActiveSection] = useState('registrazioni');
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Hook per rilevare le dimensioni della finestra
    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Determina se è mobile basandosi sulla larghezza della finestra
    const isMobile = windowSize.width < 768;

    const sections = [
        { key: 'registrazioni', label: 'Registrazioni', icon: PencilSquareIcon, minLevel: 50, component: NuovaRegistrazione },
        { key: 'report', label: 'Report', icon: ChartBarIcon, minLevel: 30, component: ReportView },
        { key: 'pdc', label: 'Manutenzione PDC', icon: WrenchScrewdriverIcon, minLevel: 80, component: PianoContiManager },
        { key: 'funzioni', label: 'Funzioni Contabili', icon: Cog6ToothIcon, minLevel: 80, component: FunzioniContabiliManager },
    ];

    const accessibleSections = sections.filter(sec => user.livello > sec.minLevel);

    // Funzione per gestire il cambio di sezione
    const handleSectionChange = (sectionKey) => {
        setActiveSection(sectionKey);
        // Chiudi il menu mobile se aperto
        if (isMobile) {
            setIsMobileMenuOpen(false);
        }
    };

    const renderContent = () => {
        const section = accessibleSections.find(sec => sec.key === activeSection);
        if (section) {
            const Component = section.component;
            return <Component />;
        }
        return <div className="text-slate-500">Seleziona una sezione.</div>;
    };

    // Ottieni l'etichetta della sezione attiva
    const getActiveSectionLabel = () => {
        const activeSectionData = accessibleSections.find(sec => sec.key === activeSection);
        return activeSectionData ? activeSectionData.label : 'Seleziona una sezione';
    };

    return (
        <div className="p-2 md:p-4 lg:p-8 h-full flex flex-col bg-gray-100 min-h-screen">
            <header className="mb-4 md:mb-6">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-800">Modulo Contabilità Smart</h1>
                <p className="text-slate-600 mt-1">Gestione completa delle operazioni contabili.</p>
            </header>
            
            {/* Menu Desktop */}
            {!isMobile && (
                <div className="border-b border-slate-200 mb-4 md:mb-6">
                    <nav className="-mb-px flex space-x-6 overflow-x-auto">
                        {accessibleSections.map(sec => (
                            <button 
                                key={sec.key}
                                onClick={() => handleSectionChange(sec.key)}
                                className={`flex-shrink-0 flex items-center gap-2 py-3 px-2 border-b-2 font-medium text-sm transition-colors ${
                                    activeSection === sec.key 
                                    ? 'border-blue-500 text-blue-600' 
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }`}
                            >
                                <sec.icon className="h-5 w-5" />
                                <span>{sec.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            )}

            {/* Menu Mobile */}
            {isMobile && (
                <div className="mb-4 md:mb-6 bg-white rounded-lg shadow">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900">
                            {getActiveSectionLabel()}
                        </h2>
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                        >
                            {isMobileMenuOpen ? (
                                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                            )}
                            <span className="sr-only">Menu</span>
                        </button>
                    </div>
                    
                    {isMobileMenuOpen && (
                        <div className="py-2">
                            {accessibleSections.map(sec => (
                                <button
                                    key={sec.key}
                                    onClick={() => handleSectionChange(sec.key)}
                                    className={`block w-full text-left px-4 py-3 text-base font-medium ${
                                        activeSection === sec.key
                                            ? 'bg-blue-50 border-l-4 border-blue-600 text-blue-700'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <sec.icon className="h-5 w-5" />
                                        <span>{sec.label}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
            
            <main className="flex-1 bg-slate-50 p-4 rounded-lg overflow-auto">
                {renderContent()}
            </main>
        </div>
    );
};

export default ContSmartModule;