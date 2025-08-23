// #####################################################################
// # Componente per Assegnare una Procedura PPA - v1.1 (Stabile)
// # File: opero-frontend/src/components/AssegnaProcedura.js
// #####################################################################

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { XMarkIcon } from '@heroicons/react/24/solid';

const AssegnaProcedura = ({ onClose, onSave }) => {
    const [procedure, setProcedure] = useState([]);
    const [ditte, setDitte] = useState([]);
    const [utenti, setUtenti] = useState([]);
    const [azioni, setAzioni] = useState([]);
    
    const [selectedProceduraId, setSelectedProceduraId] = useState('');
    const [selectedDittaId, setSelectedDittaId] = useState('');
    const [dataPrevistaFine, setDataPrevistaFine] = useState('');
    const [assegnazioni, setAssegnazioni] = useState({});

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [procRes, ditteRes, utentiRes] = await Promise.all([
                    api.get('/ppa/procedures'),
                    api.get('/amministrazione/anagrafiche'),
                    api.get('/amministrazione/utenti')
                ]);
                setProcedure(procRes.data.data || []);
                setDitte(ditteRes.data.data || []);
                setUtenti(utentiRes.data.data || []);
            } catch (error) {
                alert("Impossibile caricare i dati necessari per l'assegnazione.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        const fetchAzioniForProcedura = async () => {
            if (!selectedProceduraId) {
                setAzioni([]);
                return;
            }
            try {
                const { data } = await api.get(`/ppa/procedures/${selectedProceduraId}/full-actions`);
                if (data.success) {
                    setAzioni(data.data);
                    const initialAssegnazioni = {};
                    data.data.forEach(azione => {
                        const utenteDefault = utenti.find(u => u.id_ruolo === azione.ID_RuoloDefault);
                        if (utenteDefault) {
                            initialAssegnazioni[azione.id] = utenteDefault.id;
                        }
                    });
                    setAssegnazioni(initialAssegnazioni);
                }
            } catch (error) {
                console.error("Errore nel caricare le azioni della procedura", error);
            }
        };
        fetchAzioniForProcedura();
    }, [selectedProceduraId, utenti]);

    const handleAssegnazioneChange = (azioneId, utenteId) => {
        setAssegnazioni(prev => ({ ...prev, [azioneId]: utenteId }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const tutteAssegnate = azioni.every(azione => assegnazioni[azione.id]);
        if (!selectedProceduraId || !selectedDittaId || !tutteAssegnate) {
            alert("Completa tutti i campi: Procedura, Ditta Target e assegna un utente a ogni azione.");
            return;
        }
        
        onSave({
            id_procedura_ditta: selectedProceduraId,
            id_ditta_target: selectedDittaId,
            data_prevista_fine: dataPrevistaFine,
            assegnazioni: assegnazioni
        });
    };

    if (isLoading) return <div className="p-6">Caricamento...</div>;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <form onSubmit={handleSubmit}>
                    <div className="flex justify-between items-center p-4 border-b">
                        <h3 className="text-lg font-bold">Assegna Nuova Procedura</h3>
                        <button type="button" onClick={onClose}><XMarkIcon className="h-6 w-6" /></button>
                    </div>
                    
                    <div className="p-6 space-y-4 overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">1. Scegli la Procedura</label>
                                <select value={selectedProceduraId} onChange={e => setSelectedProceduraId(e.target.value)} className="w-full p-2 border rounded-md" required>
                                    <option value="" disabled>-- Seleziona --</option>
                                    {procedure.map(p => <option key={p.id} value={p.id}>{p.nome_personalizzato}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">2. Applica a Cliente/Fornitore</label>
                                <select value={selectedDittaId} onChange={e => setSelectedDittaId(e.target.value)} className="w-full p-2 border rounded-md" required>
                                    <option value="" disabled>-- Seleziona --</option>
                                    {ditte.map(d => <option key={d.id} value={d.id}>{d.ragione_sociale}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Data Prevista di Conclusione</label>
                            <input type="date" value={dataPrevistaFine} onChange={e => setDataPrevistaFine(e.target.value)} className="w-full p-2 border rounded-md" />
                        </div>
                        <hr />
                        <h4 className="text-md font-semibold">3. Assegna Azioni agli Utenti</h4>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {azioni.length > 0 ? azioni.map(azione => (
                                <div key={azione.id} className="grid grid-cols-2 gap-4 items-center">
                                    <label className="font-medium text-sm">{azione.nome_azione}</label>
                                    <select value={assegnazioni[azione.id] || ''} onChange={e => handleAssegnazioneChange(azione.id, e.target.value)} className="w-full p-2 border rounded-md text-sm" required>
                                        <option value="" disabled>-- Assegna a... --</option>
                                        {utenti.map(u => <option key={u.id} value={u.id}>{u.nome} {u.cognome}</option>)}
                                    </select>
                                </div>
                            )) : <p className="text-sm text-gray-500">Seleziona una procedura per vedere le azioni.</p>}
                        </div>
                    </div>

                    <div className="flex justify-end items-center p-4 bg-gray-50 border-t">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md mr-2">Annulla</button>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md">Avvia Procedura</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssegnaProcedura;
