// #####################################################################
// # Modulo di Configurazione PPA - v1.2 (Salvataggio e Dati Reali)
// # File: opero-frontend/src/components/PPAModule.js
// #####################################################################

import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/solid';

// --- Sotto-componente: Modale per creare una nuova procedura ---
const ProceduraFormModal = ({ onClose, onSave }) => {
    const [procedureStandard, setProcedureStandard] = useState([]);
    const [idProceduraStandard, setIdProceduraStandard] = useState('');
    const [nomePersonalizzato, setNomePersonalizzato] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProcedureStandard = async () => {
            setIsLoading(true);
            try {
                // FIX: Chiamata API reale per i modelli di procedura
                const { data } = await api.get('/ppa/procedure-standard'); // Assicurati che questa rotta esista nel backend
                if (data.success) {
                    setProcedureStandard(data.data);
                }
            } catch (error) {
                console.error("Errore nel caricamento delle procedure standard", error);
                alert("Impossibile caricare i modelli di procedura.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProcedureStandard();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!idProceduraStandard || !nomePersonalizzato) {
            alert('Per favore, compila tutti i campi.');
            return;
        }
        onSave({
            id_procedura_standard: idProceduraStandard,
            nome_personalizzato: nomePersonalizzato,
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="flex justify-between items-center p-4 border-b">
                        <h3 className="text-lg font-bold">Crea Nuova Procedura</h3>
                        <button type="button" onClick={onClose}><XMarkIcon className="h-6 w-6" /></button>
                    </div>
                    <div className="p-6 space-y-4">
                        {isLoading ? <p>Caricamento modelli...</p> : (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Scegli un Modello di Procedura</label>
                                <select 
                                    value={idProceduraStandard} 
                                    onChange={(e) => setIdProceduraStandard(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    required
                                >
                                    <option value="" disabled>-- Seleziona un modello --</option>
                                    {procedureStandard.map(p => (
                                        <option key={p.id} value={p.id}>{p.descrizione}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Personalizzato per la Procedura</label>
                            <input 
                                type="text"
                                value={nomePersonalizzato}
                                onChange={(e) => setNomePersonalizzato(e.target.value)}
                                placeholder="Es: Acquisizione Clienti Fiera 2025"
                                className="w-full p-2 border border-gray-300 rounded-md"
                                required
                            />
                        </div>
                    </div>
                    <div className="flex justify-end items-center p-4 bg-gray-50 border-t">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md mr-2">Annulla</button>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md">Salva Procedura</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Sotto-componente: Colonna di un Processo ---
const ProcessoColumn = ({ processo }) => {
    const [azioni, setAzioni] = useState([]);
    useEffect(() => {
        // TODO: Sostituire con chiamata API reale a /ppa/processes/:processId/actions
        setAzioni([ { id: 1, nome_azione: 'Azione 1.1' }, { id: 2, nome_azione: 'Azione 1.2' } ]);
    }, [processo.id]);

    return (
        <div className="bg-gray-100 rounded-lg p-4 flex-shrink-0 w-72">
            <h3 className="font-bold text-gray-800 mb-3">{processo.nome_processo}</h3>
            <div className="space-y-2">
                {azioni.map(azione => (
                    <div key={azione.id} className="bg-white p-3 rounded-md shadow-sm"><p>{azione.nome_azione}</p></div>
                ))}
            </div>
            <button className="mt-3 w-full text-sm text-gray-500 hover:text-blue-600">+ Aggiungi Azione</button>
        </div>
    );
};

// --- Componente Principale del Modulo PPA ---
const PPAModule = () => {
    const [procedure, setProcedure] = useState([]);
    const [selectedProcedura, setSelectedProcedura] = useState(null);
    const [processi, setProcessi] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // NUOVO: Funzione per caricare le procedure
    const fetchProcedure = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await api.get('/ppa/procedures');
            if(data.success) {
                setProcedure(data.data);
            }
        } catch (error) {
            console.error("Errore nel caricamento delle procedure", error);
            alert("Impossibile caricare le procedure.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProcedure();
    }, [fetchProcedure]);

    useEffect(() => {
        if (selectedProcedura) {
            const fetchProcessi = async () => {
                setIsLoading(true);
                try {
                    const { data } = await api.get(`/ppa/procedures/${selectedProcedura.id}/processes`);
                    if(data.success) {
                        setProcessi(data.data);
                    }
                } catch (error) {
                    console.error("Errore nel caricamento dei processi", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchProcessi();
        } else {
            setProcessi([]);
        }
    }, [selectedProcedura]);

    // FIX: Implementazione del salvataggio reale
    const handleSaveProcedura = async (formData) => {
        try {
            const { data } = await api.post('/ppa/procedures', formData);
            if (data.success) {
                alert('Procedura salvata con successo!');
                setIsModalOpen(false);
                fetchProcedure(); // Ricarica la lista delle procedure
            } else {
                alert(`Errore: ${data.message}`);
            }
        } catch (error) {
            alert('Errore di connessione durante il salvataggio.');
            console.error(error);
        }
    };

    return (
        <div className="p-6 h-full flex flex-col">
            {isModalOpen && <ProceduraFormModal onClose={() => setIsModalOpen(false)} onSave={handleSaveProcedura} />}
            
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Configurazione PPA</h1>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 flex items-center"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Nuova Procedura
                </button>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Seleziona una Procedura da configurare:</label>
                <select 
                    className="w-full max-w-md p-2 border border-gray-300 rounded-md"
                    value={selectedProcedura ? selectedProcedura.id : ''}
                    onChange={(e) => {
                        const procId = parseInt(e.target.value);
                        const proc = procedure.find(p => p.id === procId);
                        setSelectedProcedura(proc);
                    }}
                >
                    <option value="" disabled>-- Scegli una procedura --</option>
                    {procedure.map(p => (
                        <option key={p.id} value={p.id}>{p.nome_personalizzato}</option>
                    ))}
                </select>
            </div>

            <div className="flex-grow bg-gray-200 rounded-lg p-4 overflow-x-auto">
                {selectedProcedura && (
                    <div className="flex gap-4 h-full">
                        {isLoading ? <p>Caricamento...</p> : processi.map(processo => <ProcessoColumn key={processo.id} processo={processo} />)}
                         <div className="flex-shrink-0 w-72">
                             <button className="w-full h-full bg-gray-300/50 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-300/80">
                                <PlusIcon className="h-6 w-6 mr-2"/> Aggiungi Processo
                             </button>
                         </div>
                    </div>
                )}
                 {!selectedProcedura && (
                     <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">Seleziona una procedura per iniziare.</p>
                     </div>
                 )}
            </div>
        </div>
    );
};

export default PPAModule;
