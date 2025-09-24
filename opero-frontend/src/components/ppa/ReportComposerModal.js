/**
 * #####################################################################
 * # Compositore di Report PPA - v1.0
 * # File: opero-frontend/src/components/ppa/ReportComposerModal.js
 * #####################################################################
 *
 * @description
 * Modale che permette all'amministratore di comporre un'email di
 * stato selezionando specifiche azioni e messaggi della bacheca.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { XMarkIcon } from '@heroicons/react/24/solid';

const ReportComposerModal = ({ isOpen, onClose, istanza }) => {
    const [azioni, setAzioni] = useState([]);
    const [messaggi, setMessaggi] = useState([]);
    const [selectedAzioni, setSelectedAzioni] = useState(new Set());
    const [selectedMessaggi, setSelectedMessaggi] = useState(new Set());
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);

    // Carica i dati necessari (azioni e messaggi) all'apertura del modale
    const fetchData = useCallback(async () => {
        if (!istanza) return;
        setIsLoading(true);
        try {
            // I dati delle azioni sono già nell'oggetto istanza, i messaggi vanno caricati
            setAzioni(istanza.azioni || []);
            const messaggiRes = await api.get(`/ppa/team/${istanza.TeamID}/comunicazioni`);
            setMessaggi(messaggiRes.data.data || []);
        } catch (error) {
            console.error("Errore nel caricamento dati per il report:", error);
        } finally {
            setIsLoading(false);
        }
    }, [istanza]);

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen, fetchData]);

    // Gestori per le checkbox
    const handleAzioneToggle = (id) => {
        const newSelection = new Set(selectedAzioni);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedAzioni(newSelection);
    };
    
    const handleMessaggioToggle = (id) => {
        const newSelection = new Set(selectedMessaggi);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedMessaggi(newSelection);
    };

    // Invia il report al backend
    const handleSendReport = async () => {
        setIsSending(true);
        try {
            const payload = {
                selectedAzioni: Array.from(selectedAzioni),
                selectedMessaggi: Array.from(selectedMessaggi)
            };
            const response = await api.post(`/ppa/istanze/${istanza.ID}/invia-report-target`, payload);
            alert(response.data.message);
            onClose();
        } catch (error) {
            alert(error.response?.data?.message || "Errore durante l'invio.");
        } finally {
            setIsSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                <header className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Componi Report di Stato</h2>
                    <button onClick={onClose}><XMarkIcon className="h-6 w-6" /></button>
                </header>

                <main className="p-6 overflow-y-auto space-y-6">
                    {isLoading ? <p>Caricamento...</p> : (
                        <>
                            <div>
                                <h3 className="font-semibold mb-2">Seleziona Azioni da Includere</h3>
                                <div className="space-y-2 max-h-48 overflow-y-auto border p-2 rounded-md">
                                    {azioni.map(a => (
                                        <label key={a.ID} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                                            <input type="checkbox" onChange={() => handleAzioneToggle(a.ID)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                            <span>{a.NomeAzione} (Stato: {a.StatoDescrizione})</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2">Seleziona Messaggi da Includere</h3>
                                <div className="space-y-2 max-h-48 overflow-y-auto border p-2 rounded-md">
                                    {messaggi.map(m => (
                                        <label key={m.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                                            <input type="checkbox" onChange={() => handleMessaggioToggle(m.id)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                            <span className="text-sm">"{m.messaggio.substring(0, 50)}..." ({m.nome_mittente})</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </main>

                <footer className="p-4 border-t flex justify-end gap-3 bg-gray-50">
                    <button onClick={onClose} className="py-2 px-4 rounded-md text-gray-700 bg-white border hover:bg-gray-100">Annulla</button>
                    <button onClick={handleSendReport} disabled={isSending} className="py-2 px-4 rounded-md text-white bg-teal-600 hover:bg-teal-700 font-semibold disabled:bg-gray-400">
                        {isSending ? 'Invio...' : 'Invia Report'}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default ReportComposerModal;
