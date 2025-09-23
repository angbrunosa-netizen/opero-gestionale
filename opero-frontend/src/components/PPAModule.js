// #####################################################################
// # Modulo di Configurazione PPA - v2.0 (con Modifica Azioni)
// # File: opero-frontend/src/components/PPAModule.js
// #####################################################################

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ArchivioPPA from './ArchivioPPA';
import AttivitaPPA from './AttivitaPPA';
// NUOVO: Importazione del nuovo componente form e dell'icona
import AssegnaProceduraForm from './ppa/AssegnaProceduraForm';
import { PlusIcon } from '@heroicons/react/24/solid';

const PPAModule = () => {
    const { user } = useAuth();
    const [view, setView] = useState('attivita'); // 'attivita' o 'archivio'
    
    // NUOVO: Stato per gestire la visibilità della modale di assegnazione
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    
    // NUOVO: Stato per forzare l'aggiornamento dei componenti figli
    const [refreshKey, setRefreshKey] = useState(0);

    // NUOVO: Funzione per chiudere la modale e opzionalmente ricaricare i dati
    const handleCloseAssignModal = (shouldRefresh) => {
        setIsAssignModalOpen(false);
        if (shouldRefresh) {
            // Incrementa la chiave per forzare il re-render del componente attivo
            setRefreshKey(prevKey => prevKey + 1);
        }
    };

    const renderContent = () => {
        // Passiamo la refreshKey come prop ai componenti figli
        switch (view) {
            case 'attivita':
                return <AttivitaPPA key={`attivita-${refreshKey}`} />;
            case 'archivio':
                return <ArchivioPPA key={`archivio-${refreshKey}`} />;
            default:
                return <AttivitaPPA key={`attivita-${refreshKey}`} />;
        }
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <div className="flex justify-between items-center border-b pb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Modulo PPA</h1>
                        <p className="text-sm text-slate-500">Pianificazione e Progresso Attività</p>
                    </div>
                    {/* NUOVO: Pulsante per aprire la modale di assegnazione */}
                    <div>
                        <button
                            onClick={() => setIsAssignModalOpen(true)}
                            className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            <PlusIcon className="h-5 w-5" />
                            <span>Assegna Nuova Procedura</span>
                        </button>
                    </div>
                </div>
                <div className="flex mt-4">
                    <button 
                        onClick={() => setView('attivita')}
                        className={`px-4 py-2 text-sm font-medium rounded-l-md ${view === 'attivita' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                    >
                        Attività in Corso
                    </button>
                    <button 
                        onClick={() => setView('archivio')}
                        className={`px-4 py-2 text-sm font-medium rounded-r-md ${view === 'archivio' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                    >
                        Archivio
                    </button>
                </div>
            </div>
            
            <div>
                {renderContent()}
            </div>

            {/* NUOVO: Logica di rendering per la modale */}
            {isAssignModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-start pt-16 overflow-y-auto">
                    <div className="bg-slate-50 rounded-lg shadow-xl w-full max-w-4xl transform transition-all">
                        <AssegnaProceduraForm onClose={handleCloseAssignModal} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default PPAModule;
