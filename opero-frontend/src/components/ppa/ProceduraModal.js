/**
 * #####################################################################
 * # Componente Modale Progettazione PPA - v1.6 (Frontend Corretto)
 * # File: opero-frontend/src/components/ppa/ProceduraModal.js
 * #####################################################################
 *
 * @description
 * AGGIORNATO: Corretta la visualizzazione nel menu a tendina dei ruoli
 * per leggere il campo `tipo` invece di `nome_ruolo`, allineando il
 * componente ai dati effettivamente restituiti dall'API.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/solid';

export const ProceduraModal = ({ isOpen, onClose, procedureData, onSave }) => {
    const [procedure, setProcedure] = useState({ NomePersonalizzato: '', processi: [] });
    const [ruoliDisponibili, setRuoliDisponibili] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchRuoli = useCallback(async () => {
        try {
            const response = await api.get('/amministrazione/ruoli-assegnabili');
            if (response.data.success) {
                setRuoliDisponibili(response.data.data || []);
            }
        } catch (error) {
            console.error("Errore nel caricamento dei ruoli:", error);
        }
    }, []);

    useEffect(() => {
        const fetchProcedureDetails = async (id) => {
            setIsLoading(true);
            try {
                const response = await api.get(`/ppa/procedure-ditta/${id}`);
                if (response.data.success) {
                    setProcedure(response.data.data);
                }
            } catch (error) {
                console.error("Errore nel caricare i dettagli della procedura", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (isOpen) {
            fetchRuoli();
            if (procedureData && procedureData.ID) {
                fetchProcedureDetails(procedureData.ID);
            } else {
                setProcedure({
                    NomePersonalizzato: '', Descrizione: '', ApplicabileA: 'DITTA',
                    processi: [{ NomeProcesso: '', azioni: [{ NomeAzione: '', Descrizione: '', ID_RuoloDefault: '' }] }]
                });
            }
        }
    }, [isOpen, procedureData, fetchRuoli]);

    if (!isOpen) return null;

    // --- Handlers (invariati) ---
    const handleProcedureChange = (field, value) => setProcedure(prev => ({ ...prev, [field]: value }));
    const handleProcessChange = (procIndex, field, value) => {
        const updatedProcessi = [...procedure.processi];
        updatedProcessi[procIndex] = { ...updatedProcessi[procIndex], [field]: value };
        setProcedure(prev => ({ ...prev, processi: updatedProcessi }));
    };
    const handleActionChange = (procIndex, actionIndex, field, value) => {
        const updatedProcessi = [...procedure.processi];
        const updatedAzioni = [...updatedProcessi[procIndex].azioni];
        updatedAzioni[actionIndex] = { ...updatedAzioni[actionIndex], [field]: value };
        updatedProcessi[procIndex].azioni = updatedAzioni;
        setProcedure(prev => ({ ...prev, processi: updatedProcessi }));
    };
    const handleAddProcess = () => setProcedure(prev => ({ ...prev, processi: [...prev.processi, { NomeProcesso: '', azioni: [{ NomeAzione: '', Descrizione: '', ID_RuoloDefault: '' }] }] }));
    const handleAddAction = (procIndex) => {
        const updatedProcessi = [...procedure.processi];
        updatedProcessi[procIndex].azioni.push({ NomeAzione: '', Descrizione: '', ID_RuoloDefault: '' });
        setProcedure(prev => ({ ...prev, processi: updatedProcessi }));
    };
    const handleRemoveAction = (procIndex, actionIndex) => {
        const updatedProcessi = [...procedure.processi];
        updatedProcessi[procIndex].azioni.splice(actionIndex, 1);
        setProcedure(prev => ({ ...prev, processi: updatedProcessi }));
    };
    const handleSaveClick = () => onSave(procedure);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
             <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh]">
                <header className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Progetta Procedura</h2>
                    <button onClick={onClose}><XMarkIcon className="h-6 w-6" /></button>
                </header>
                
                {isLoading ? (
                    <div className="p-6 text-center">Caricamento dati procedura...</div>
                ) : (
                    <main className="p-6 overflow-y-auto space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" placeholder="Nome Procedura" value={procedure.NomePersonalizzato || ''} onChange={e => handleProcedureChange('NomePersonalizzato', e.target.value)} className="w-full p-2 border rounded-md"/>
                            <select value={procedure.ApplicabileA || 'DITTA'} onChange={e => handleProcedureChange('ApplicabileA', e.target.value)} className="w-full p-2 border rounded-md bg-white">
                                <option value="DITTA">Applicabile a Ditte</option>
                                <option value="UTENTE">Applicabile a Utenti</option>
                                <option value="BENE">Applicabile a Beni</option>
                            </select>
                        </div>
                        <div className="space-y-4">
                            {procedure.processi && procedure.processi.map((processo, pIndex) => (
                                <div key={pIndex} className="bg-gray-100 p-4 rounded-lg border">
                                    <input type="text" placeholder={`Nome Processo ${pIndex + 1}`} value={processo.NomeProcesso || ''} onChange={e => handleProcessChange(pIndex, 'NomeProcesso', e.target.value)} className="w-full p-2 border rounded-md font-semibold mb-3"/>
                                    <div className="space-y-3 pl-4 border-l-2 border-gray-300">
                                        {processo.azioni && processo.azioni.map((azione, aIndex) => (
                                            <div key={azione.ID || aIndex} className="bg-white p-3 rounded-md border shadow-sm">
                                                <input type="text" placeholder={`Azione ${aIndex + 1}`} value={azione.NomeAzione || ''} onChange={e => handleActionChange(pIndex, aIndex, 'NomeAzione', e.target.value)} className="w-full p-2 border rounded-md mb-2"/>
                                                <textarea placeholder="Descrizione azione..." value={azione.Descrizione || ''} onChange={e => handleActionChange(pIndex, aIndex, 'Descrizione', e.target.value)} className="w-full p-2 border rounded-md text-sm mb-2" rows="2"></textarea>
                                                <select value={azione.ID_RuoloDefault || ''} onChange={e => handleActionChange(pIndex, aIndex, 'ID_RuoloDefault', e.target.value)} className="w-full p-2 border rounded-md bg-white text-sm">
                                                    <option value="">-- Assegna Ruolo Predefinito --</option>
                                                    {/* CORREZIONE: Utilizza il campo 'tipo' restituito dall'API per la visualizzazione */}
                                                    {ruoliDisponibili.map(ruolo => <option key={ruolo.id} value={ruolo.id}>{ruolo.tipo}</option>)}
                                                </select>
                                                <button onClick={() => handleRemoveAction(pIndex, aIndex)} className="text-red-500 hover:text-red-700 text-xs mt-2">Rimuovi Azione</button>
                                            </div>
                                        ))}
                                        <button onClick={() => handleAddAction(pIndex)} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium mt-2">
                                            <PlusIcon className="h-4 w-4" /> Aggiungi Azione
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={handleAddProcess} className="flex items-center gap-2 bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg mt-4 hover:bg-gray-300">
                            <PlusIcon className="h-5 w-5" /> Aggiungi Processo
                        </button>
                    </main>
                )}

                <footer className="p-4 border-t flex justify-end gap-3 bg-gray-50">
                    <button onClick={onClose} className="py-2 px-4 rounded-md text-gray-700 bg-white border hover:bg-gray-100">Annulla</button>
                    <button onClick={handleSaveClick} disabled={isLoading} className="py-2 px-4 rounded-md text-white bg-blue-600 hover:bg-blue-700 font-semibold disabled:bg-gray-400">Salva Procedura</button>
                </footer>
            </div>
        </div>
    );
};

export default ProceduraModal.js;