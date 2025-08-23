// #####################################################################
// # Modulo di Configurazione PPA - v2.0 (con Modifica Azioni)
// # File: opero-frontend/src/components/PPAModule.js
// #####################################################################

import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { PlusIcon, XMarkIcon, PaperAirplaneIcon, PencilIcon, TrashIcon, Cog6ToothIcon, ArchiveBoxIcon } from '@heroicons/react/24/solid';
import AssegnaProcedura from './AssegnaProcedura';
import ArchivioPPA from './ArchivioPPA'; // <-- IMPORTA IL NUOVO COMPONENTE

const ConfirmationModal = ({ title, message, onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm text-gray-600">{message}</p>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onCancel} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300">
                        Annulla
                    </button>
                    <button onClick={onConfirm} className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700">
                        Elimina
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Sotto-componente: Modale per creare una nuova PROCEDURA ---
const ProceduraFormModal = ({ onClose, onSave }) => {
    const [procedureStandard, setProcedureStandard] = useState([]);
    const [idProceduraStandard, setIdProceduraStandard] = useState('');
    const [nomePersonalizzato, setNomePersonalizzato] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProcedureStandard = async () => {
            setIsLoading(true);
            try {
                const { data } = await api.get('/ppa/procedure-standard');
                if (data.success) setProcedureStandard(data.data);
            } catch (error) {
                console.error("Errore nel caricamento delle procedure standard", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProcedureStandard();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ id_procedura_standard: idProceduraStandard, nome_personalizzato: nomePersonalizzato });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="flex justify-between items-center p-4 border-b"><h3 className="text-lg font-bold">Crea Nuova Procedura</h3><button type="button" onClick={onClose}><XMarkIcon className="h-6 w-6" /></button></div>
                    <div className="p-6 space-y-4">
                        {isLoading ? <p>Caricamento...</p> : (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Scegli un Modello</label>
                                <select value={idProceduraStandard} onChange={(e) => setIdProceduraStandard(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" required>
                                    <option value="" disabled>-- Seleziona un modello --</option>
                                    {procedureStandard.map(p => <option key={p.id} value={p.id}>{p.descrizione}</option>)}
                                </select>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Personalizzato</label>
                            <input type="text" value={nomePersonalizzato} onChange={(e) => setNomePersonalizzato(e.target.value)} placeholder="Es: Acquisizione Clienti Fiera 2025" className="w-full p-2 border border-gray-300 rounded-md" required />
                        </div>
                    </div>
                    <div className="flex justify-end items-center p-4 bg-gray-50 border-t"><button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md mr-2">Annulla</button><button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md">Salva</button></div>
                </form>
            </div>
        </div>
    );
};
// --- Sotto-componente: Modale per creare/modificare un PROCESSO ---
const ProcessoFormModal = ({ processoToEdit, onClose, onSave }) => {
    const [nomeProcesso, setNomeProcesso] = useState('');
    const isEditMode = Boolean(processoToEdit);

    useEffect(() => {
        if (isEditMode) {
            setNomeProcesso(processoToEdit.nome_processo || '');
        }
    }, [processoToEdit, isEditMode]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!nomeProcesso) {
            alert('Il nome del processo è obbligatorio.');
            return;
        }
        onSave({ nome_processo: nomeProcesso });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-bold">{isEditMode ? 'Modifica Processo' : 'Nuovo Processo'}</h3>
                    <button type="button" onClick={onClose}><XMarkIcon className="h-6 w-6" /></button>
                </div>
                <div className="p-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Processo</label>
                    <input type="text" value={nomeProcesso} onChange={(e) => setNomeProcesso(e.target.value)} placeholder="Es: Raccolta Dati" className="w-full p-2 border rounded-md" required />
                </div>
                <div className="flex justify-end items-center p-4 bg-gray-50 border-t">
                    <button type="button" onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-md mr-2">Annulla</button>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md">{isEditMode ? 'Salva Modifiche' : 'Salva Processo'}</button>
                </div>
            </form>
        </div>
    );
};
// --- Sotto-componente: Modale per creare/modificare una AZIONE ---
const AzioneFormModal = ({ azioneToEdit, onClose, onSave }) => {
    const [formData, setFormData] = useState({ nome_azione: '', descrizione: '', id_ruolo_default: '' });
    const [ruoli, setRuoli] = useState([]);
    const isEditMode = Boolean(azioneToEdit);

    useEffect(() => {
        if (isEditMode) {
            setFormData({
                nome_azione: azioneToEdit.nome_azione || '',
                descrizione: azioneToEdit.descrizione || '',
                id_ruolo_default: azioneToEdit.ID_RuoloDefault || ''
            });
        } else {
            // Assicurati di resettare il form se si apre in modalità creazione
            setFormData({ nome_azione: '', descrizione: '', id_ruolo_default: '' });
        }

        const fetchRuoli = async () => {
            try {
                const { data } = await api.get('/amministrazione/ruoli-assegnabili');
                if (data.success) setRuoli(data.data);
            } catch (error) {
                console.error("Errore nel caricamento dei ruoli", error);
            }
        };
        fetchRuoli();
    }, [azioneToEdit, isEditMode]);

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-bold">{isEditMode ? 'Modifica Azione' : 'Nuova Azione'}</h3>
                    <button type="button" onClick={onClose}><XMarkIcon className="h-6 w-6" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome Azione</label>
                        <input name="nome_azione" value={formData.nome_azione} onChange={handleChange} placeholder="Es: Verificare Partita IVA" className="w-full p-2 border rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione (Istruzioni)</label>
                        <textarea name="descrizione" value={formData.descrizione} onChange={handleChange} rows="3" className="w-full p-2 border rounded-md"></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assegna a Ruolo (Default)</label>
                        <select name="id_ruolo_default" value={formData.id_ruolo_default} onChange={handleChange} className="w-full p-2 border rounded-md">
                            <option value="">-- Nessun default --</option>
                            {ruoli.map(r => <option key={r.id} value={r.id}>{r.tipo}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex justify-end items-center p-4 bg-gray-50 border-t">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md mr-2">Annulla</button>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md">Salva Azione</button>
                </div>
            </form>
        </div>
    );
};

// --- Sotto-componente: Colonna di un Processo ---
const ProcessoColumn = ({ processo, onAddAzione, onEditProcesso, onDeleteProcesso, onEditAzione, onDeleteAzione, onRefresh }) => {
    const [azioni, setAzioni] = useState([]);
    useEffect(() => {
        const fetchAzioni = async () => {
            try {
                const { data } = await api.get(`/ppa/processes/${processo.id}/actions`);
                if (data.success) setAzioni(data.data);
            } catch (error) {
                console.error(`Errore caricamento azioni per processo ${processo.id}:`, error);
            }
        };
        fetchAzioni();
    }, [processo.id, onRefresh]);

    return (
        <div className="bg-gray-100 rounded-lg p-4 flex-shrink-0 w-72">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-800 flex-grow truncate">{processo.nome_processo}</h3>
                <div className="flex-shrink-0 flex items-center">
                    <button onClick={() => onEditProcesso(processo)} className="text-gray-400 hover:text-blue-600 p-1"><PencilIcon className="h-4 w-4" /></button>
                    <button onClick={() => onDeleteProcesso(processo.id)} className="text-gray-400 hover:text-red-600 p-1"><TrashIcon className="h-4 w-4" /></button>
                </div>
            </div>
            <div className="space-y-2">
                {azioni.map(azione => (
                    <div key={azione.id} className="bg-white p-3 rounded-md shadow-sm flex justify-between items-center">
                        <p className="truncate flex-grow">{azione.nome_azione}</p>
                        <div className="flex-shrink-0 flex items-center">
                           <button onClick={() => onEditAzione(azione)} className="text-gray-400 hover:text-blue-600 p-1"><PencilIcon className="h-4 w-4" /></button>
                           <button onClick={() => onDeleteAzione(azione.id)} className="text-gray-400 hover:text-red-600 p-1"><TrashIcon className="h-4 w-4" /></button>
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={() => onAddAzione(processo.id)} className="mt-3 w-full text-sm text-gray-500 hover:text-blue-600">+ Aggiungi Azione</button>
        </div>
    );
};


// --- Componente Principale del Modulo PPA ---
const PPAModule = () => {
    const [view, setView] = useState('configurazione');
    const [procedure, setProcedure] = useState([]);
    const [selectedProcedura, setSelectedProcedura] = useState(null);
    const [processi, setProcessi] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isProceduraModalOpen, setIsProceduraModalOpen] = useState(false);
    const [isProcessoModalOpen, setIsProcessoModalOpen] = useState(false);
    const [isAzioneModalOpen, setIsAzioneModalOpen] = useState(false);
    const [isAssegnaModalOpen, setIsAssegnaModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [editingProcesso, setEditingProcesso] = useState(null);
    const [editingAzione, setEditingAzione] = useState(null);
    const [selectedProcessoId, setSelectedProcessoId] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [deletionInfo, setDeletionInfo] = useState({ handler: null, title: '', message: '' });
    
    const fetchProcedure = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await api.get('/ppa/procedures');
            if (data.success) setProcedure(data.data);
        } catch (error) {
            alert("Impossibile caricare le procedure.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchProcessi = useCallback(async () => {
        if (!selectedProcedura) {
            setProcessi([]);
            return;
        }
        setIsLoading(true);
        try {
            const { data } = await api.get(`/ppa/procedures/${selectedProcedura.id}/processes`);
            if (data.success) setProcessi(data.data);
        } catch (error) {
            console.error("Errore nel caricamento dei processi", error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedProcedura]);

    useEffect(() => { fetchProcedure(); }, [fetchProcedure]);
    useEffect(() => { fetchProcessi(); }, [fetchProcessi, refreshTrigger]);

    const handleSaveProcedura = async (formData) => {
        try {
            const { data } = await api.post('/ppa/procedures', formData);
            if (data.success) {
                alert('Procedura salvata!');
                setIsProceduraModalOpen(false);
                fetchProcedure();
            } else {
                alert(`Errore: ${data.message}`);
            }
        } catch (error) {
            alert('Errore di connessione.');
        }
    };

    const handleOpenProcessoModal = (processo = null) => {
        setEditingProcesso(processo);
        setIsProcessoModalOpen(true);
    };

    const handleSaveProcesso = async (formData) => {
        if (!selectedProcedura && !editingProcesso) return;
        const isEditMode = Boolean(editingProcesso);
        const url = isEditMode ? `/ppa/processes/${editingProcesso.id}` : `/ppa/procedures/${selectedProcedura.id}/processes`;
        const method = isEditMode ? 'patch' : 'post';
        try {
            const { data } = await api[method](url, formData);
            if (data.success) {
                alert(`Processo ${isEditMode ? 'aggiornato' : 'salvato'}!`);
                setIsProcessoModalOpen(false);
                setEditingProcesso(null);
                setRefreshTrigger(p => p + 1);
            } else {
                alert(`Errore: ${data.message}`);
            }
        } catch (error) {
            alert('Errore di connessione.');
        }
    };
    
    const handleOpenAzioneModal = (processoId, azione = null) => {
        setSelectedProcessoId(processoId);
        setEditingAzione(azione);
        setIsAzioneModalOpen(true);
    };

    const handleSaveAzione = async (formData) => {
        const isEditMode = Boolean(editingAzione);
        const url = isEditMode ? `/ppa/actions/${editingAzione.id}` : `/ppa/processes/${selectedProcessoId}/actions`;
        const method = isEditMode ? 'patch' : 'post';
        try {
            const { data } = await api[method](url, formData);
            if (data.success) {
                alert(`Azione ${isEditMode ? 'aggiornata' : 'salvata'}!`);
                setIsAzioneModalOpen(false);
                setEditingAzione(null);
                setRefreshTrigger(p => p + 1);
            } else {
                alert(`Errore: ${data.message}`);
            }
        } catch (error) {
            alert('Errore di connessione.');
        }
    };

    const handleDeleteRequest = (handler, title, message) => {
        setDeletionInfo({ handler, title, message });
        setIsConfirmModalOpen(true);
    };
    const confirmDeletion = () => {
        if (deletionInfo.handler) deletionInfo.handler();
        setIsConfirmModalOpen(false);
    };
    const handleDeleteProcedura = async () => { /* ... */ };
    const handleDeleteProcesso = async (processoId) => { /* ... */ };
    const handleDeleteAzione = async (azioneId) => { /* ... */ };
    const handleSaveAssegnazione = async (formData) => {
    try {
        const { data } = await api.post('/ppa/assegna', formData);
        if (data.success) {
            alert(data.message); // Mostra il messaggio di successo dal backend
            setIsAssegnaModalOpen(false); // Chiude la modale
            // Potremmo voler aggiornare la vista archivio se è quella attiva
            if(view === 'archivio') {
                // Se ArchivioPPA avesse una funzione di refresh passata come prop, la chiameremmo qui.
                // Per ora, un cambio di vista forza il ri-caricamento.
                setView('configurazione');
                setTimeout(() => setView('archivio'), 100);
            }
        } else {
            // Mostra un errore specifico se il backend lo fornisce
            alert(`Errore: ${data.message}`);
        }
    } catch (error) {
        // Mostra un errore generico in caso di fallimento della chiamata
        alert(error.response?.data?.message || 'Errore di connessione durante l\'assegnazione.');
        console.error("Errore assegnazione procedura:", error);
    }
};
 const renderConfigurazioneView = () => (
        <>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Configurazione PPA</h1>
                <div className="flex gap-2">
                    <button onClick={() => setIsAssegnaModalOpen(true)} className="bg-green-600 text-white px-4 py-2 rounded-md shadow hover:bg-green-700 flex items-center"><PaperAirplaneIcon className="h-5 w-5 mr-2" />Assegna</button>
                    <button onClick={() => setIsProceduraModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 flex items-center"><PlusIcon className="h-5 w-5 mr-2" />Nuova</button>
                </div>
            </div>
            <div className="mb-6 flex items-center gap-2">
                <label className="block text-sm font-medium text-gray-700">Procedura:</label>
                <select className="flex-grow max-w-md p-2 border border-gray-300 rounded-md" value={selectedProcedura ? selectedProcedura.id : ''} onChange={(e) => { const proc = procedure.find(p => p.id === parseInt(e.target.value)); setSelectedProcedura(proc); }}>
                    <option value="" disabled>-- Scegli una procedura --</option>
                    {procedure.map(p => <option key={p.id} value={p.id}>{p.nome_personalizzato}</option>)}
                </select>
                {selectedProcedura && <button onClick={() => handleDeleteRequest(() => handleDeleteProcedura(selectedProcedura.id), 'Conferma Eliminazione', `Sei sicuro di eliminare "${selectedProcedura.nome_personalizzato}"?`)} className="p-2 text-red-500 hover:text-red-700"><TrashIcon className="h-5 w-5"/></button>}
            </div>
            <div className="flex-grow bg-gray-200 rounded-lg p-4 overflow-x-auto">
                {selectedProcedura ? (
                    <div className="flex gap-4 h-full">
                        {isLoading ? <p>Caricamento...</p> : processi.map(processo => <ProcessoColumn key={processo.id} processo={processo} onAddAzione={handleOpenAzioneModal} onEditProcesso={handleOpenProcessoModal} onDeleteProcesso={(id) => handleDeleteRequest(() => handleDeleteProcesso(id), 'Conferma Eliminazione', `Eliminare il processo "${processo.nome_processo}"?`)} onEditAzione={(azione) => handleOpenAzioneModal(processo.id, azione)} onDeleteAzione={(id) => handleDeleteRequest(() => handleDeleteAzione(id), 'Conferma Eliminazione', 'Eliminare questa azione?')} onRefresh={refreshTrigger} />)}
                        <div className="flex-shrink-0 w-72"><button onClick={() => handleOpenProcessoModal(null)} className="w-full h-full bg-gray-300/50 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-300/80"><PlusIcon className="h-6 w-6 mr-2"/> Aggiungi Processo</button></div>
                    </div>
                ) : <div className="flex items-center justify-center h-full"><p className="text-gray-500">Seleziona una procedura per iniziare.</p></div>}
            </div>
        </>
    );


    return (
        <div className="p-6 h-full flex flex-col">
            {isProceduraModalOpen && <ProceduraFormModal onClose={() => setIsProceduraModalOpen(false)} onSave={handleSaveProcedura} />}
            {isProcessoModalOpen && <ProcessoFormModal processoToEdit={editingProcesso} onClose={() => { setIsProcessoModalOpen(false); setEditingProcesso(null); }} onSave={handleSaveProcesso} />}
            {isAzioneModalOpen && <AzioneFormModal azioneToEdit={editingAzione} onClose={() => { setIsAzioneModalOpen(false); setEditingAzione(null); }} onSave={handleSaveAzione} />}
            {isAssegnaModalOpen && <AssegnaProcedura onClose={() => setIsAssegnaModalOpen(false)} onSave={handleSaveAssegnazione} />}
            {isConfirmModalOpen && <ConfirmationModal title={deletionInfo.title} message={deletionInfo.message} onConfirm={confirmDeletion} onCancel={() => setIsConfirmModalOpen(false)} />}
            
            <div className="mb-4 border-b">
                <nav className="-mb-px flex space-x-6">
                    <button onClick={() => setView('configurazione')} className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${view === 'configurazione' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}><Cog6ToothIcon className="h-5 w-5" /> Configurazione</button>
                    <button onClick={() => setView('archivio')} className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${view === 'archivio' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}><ArchiveBoxIcon className="h-5 w-5" /> Archivio</button>
                </nav>
            </div>

            {view === 'configurazione' ? renderConfigurazioneView() : <ArchivioPPA />}
        </div>
    );
};

export default PPAModule;

