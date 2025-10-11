// #####################################################################
// # Componente GestioneFunzioni - v3.5 (Fix Definitivo Dati e UI)
// # File: opero-frontend/src/components/admin/GestioneFunzioni.js
// #####################################################################

import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';

const GestioneFunzioni = () => {
    const [ditte, setDitte] = useState([]);
    const [funzioni, setFunzioni] = useState([]);
    const [selectedDittaId, setSelectedDittaId] = useState('');
    const [funzioniAssociate, setFunzioniAssociate] = useState(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                const [ditteRes, funzioniRes] = await Promise.all([
                    api.get('/admin/ditte'),
                    api.get('/admin/funzioni')
                ]);
                setDitte(ditteRes.data.ditte || []);
                const formattedFunzioni = (funzioniRes.data.funzioni || []).map(f => ({ ...f, id: Number(f.id) }));
                setFunzioni(formattedFunzioni);
            } catch (error) {
                console.error("Errore nel caricamento dati iniziali:", error);
            }
            setIsLoading(false);
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        if (!selectedDittaId) {
            setFunzioniAssociate(new Set());
            return;
        }
        const fetchAssociazioni = async () => {
            setIsLoading(true);
            try {
                const response = await api.get(`/admin/funzioni-ditta/${selectedDittaId}`);
                // ❗ FIX: Il backend restituisce un array di numeri. Lo convertiamo in un Set di numeri.
                const idSet = new Set((response.data.funzioni || []).map(Number));
                setFunzioniAssociate(idSet);
            } catch (error) {
                console.error(`Errore recupero associazioni per ditta ${selectedDittaId}:`, error);
                setFunzioniAssociate(new Set());
            }
            setIsLoading(false);
        };
        fetchAssociazioni();
    }, [selectedDittaId]);

    const groupedFunzioni = useMemo(() => {
        return funzioni.reduce((acc, f) => {
            const key = f.chiave_componente_modulo || 'Generale';
            if (!acc[key]) acc[key] = [];
            acc[key].push(f);
            return acc;
        }, {});
    }, [funzioni]);

    const sortedModuleKeys = useMemo(() => Object.keys(groupedFunzioni).sort(), [groupedFunzioni]);

    const handleCheckboxChange = (funzioneId) => {
        setFunzioniAssociate(prevSet => {
            const newSet = new Set(prevSet);
            if (newSet.has(funzioneId)) newSet.delete(funzioneId);
            else newSet.add(funzioneId);
            return newSet;
        });
    };

    const handleToggleModule = (moduleKey, select = true) => {
        const moduleFunzioniIds = groupedFunzioni[moduleKey].map(f => f.id);
        setFunzioniAssociate(prevSet => {
            const newSet = new Set(prevSet);
            if (select) moduleFunzioniIds.forEach(id => newSet.add(id));
            else moduleFunzioniIds.forEach(id => newSet.delete(id));
            return newSet;
        });
    };

    const handleSave = async () => {
        if (!selectedDittaId) {
            alert('Seleziona una ditta.');
            return;
        }
        setIsSaving(true);
        try {
            await api.post('/admin/funzioni-ditta', {
                id_ditta: selectedDittaId,
                funzioni: Array.from(funzioniAssociate)
            });
            alert('Associazioni salvate!');
        } catch (error) {
            console.error('Errore salvataggio:', error);
            alert('Errore durante il salvataggio.');
        }
        setIsSaving(false);
    };

    return (
        <div className="p-4">
            <h3 className="text-lg font-bold mb-4">Abilita Funzionalità per Ditta</h3>
            <select value={selectedDittaId} onChange={e => setSelectedDittaId(e.target.value)} className="w-full p-2 border rounded mb-6" disabled={isLoading}>
                <option value="">{isLoading ? 'Caricamento...' : 'Seleziona una ditta...'}</option>
                {ditte.map(d => <option key={d.id} value={d.id}>{d.ragione_sociale}</option>)}
            </select>
            {selectedDittaId && (
                <div>
                    {isLoading ? <p>Caricamento funzioni...</p> : (
                        <div className="space-y-6">
                            {sortedModuleKeys.map(moduleKey => (
                                <div key={moduleKey} className="border rounded-lg p-4 shadow-sm bg-white">
                                    <div className="flex justify-between items-center mb-3 border-b pb-2">
                                        <h4 className="font-bold text-md text-blue-800">{moduleKey}</h4>
                                        <div>
                                            <button onClick={() => handleToggleModule(moduleKey, true)} className="text-xs text-green-600 hover:underline mr-3">Seleziona Modulo</button>
                                            <button onClick={() => handleToggleModule(moduleKey, false)} className="text-xs text-red-600 hover:underline">Deseleziona Modulo</button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {groupedFunzioni[moduleKey].map(funzione => (
                                            <label key={funzione.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer">
                                                <input type="checkbox" className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                                                    checked={funzioniAssociate.has(funzione.id)}
                                                    onChange={() => handleCheckboxChange(funzione.id)}
                                                />
                                                <div>
                                                    <span className="font-semibold text-gray-800">{funzione.codice}</span>
                                                    <p className="text-xs text-gray-500">{funzione.descrizione}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="mt-6 text-right">
                         <button onClick={handleSave} disabled={isSaving || isLoading} className="btn-primary">
                            {isSaving ? 'Salvataggio...' : 'Salva Associazioni'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestioneFunzioni;

