// #####################################################################
// # Componente GestioneRuoliPermessi - v4.1 (Con Raggruppamento e Stile _MDVIEW)
// # File: opero-frontend/src/components/admin/GestioneRuoliPermessi.js
// #####################################################################

import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';

const GestioneRuoliPermessi = () => {
    const [ruoli, setRuoli] = useState([]);
    const [funzioniDisponibili, setFunzioniDisponibili] = useState([]);
    const [selectedRuoloId, setSelectedRuoloId] = useState('');

    const [permessiAssociati, setPermessiAssociati] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Carica dati iniziali (ruoli e funzioni disponibili per la ditta)
    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                const [ruoliRes, funzioniRes] = await Promise.all([
                    api.get('/admin/ruoli'),
                    api.get('/admin/ditta/funzioni')
                ]);
                setRuoli(ruoliRes.data.ruoli || []);
                const formattedFunzioni = (funzioniRes.data.funzioni || []).map(f => ({ ...f, id: Number(f.id) }));
                setFunzioniDisponibili(formattedFunzioni);
            } catch (error) {
                console.error("Errore nel caricamento dei dati iniziali:", error);
            }
            setIsLoading(false);
        };
        loadInitialData();
    }, []);

    // Carica i permessi associati quando viene selezionato un ruolo
    useEffect(() => {
        if (!selectedRuoloId) {
            setPermessiAssociati([]);
            return;
        }
        const fetchPermessi = async () => {
            setIsLoading(true);
            try {
                const response = await api.get(`/admin/ditta/permessi/${selectedRuoloId}`);
                setPermessiAssociati((response.data.permessi || []).map(Number));
            } catch (error) {
                console.error(`Errore nel recupero dei permessi per il ruolo ${selectedRuoloId}:`, error);
                setPermessiAssociati([]);
            }
            setIsLoading(false);
        };
        fetchPermessi();
    }, [selectedRuoloId]);

    // ++ MODIFICA 1: Logica di raggruppamento modificata per _MDVIEW ++
    const groupedFunzioni = useMemo(() => {
        return funzioniDisponibili.reduce((acc, f) => {
            // Controlla se il codice della funzione termina con '_MDVIEW'
            if (f.codice.endsWith('_MDVIEW')) {
                const key = '(Pannello Moduli)'; // Crea un nuovo raggruppamento
                if (!acc[key]) acc[key] = [];
                acc[key].push(f);
            } else {
                // Mantiene la logica originale per le altre funzioni
                const key = f.chiave_componente_modulo || 'Generale';
                if (!acc[key]) acc[key] = [];
                acc[key].push(f);
            }
            return acc;
        }, {});
    }, [funzioniDisponibili]);

    const sortedModuleKeys = useMemo(() => Object.keys(groupedFunzioni).sort(), [groupedFunzioni]);

    const handleCheckboxChange = (funzioneId) => {
        setPermessiAssociati(prev =>
            prev.includes(funzioneId)
                ? prev.filter(id => id !== funzioneId)
                : [...prev, funzioneId]
        );
    };

    const handleToggleModule = (moduleKey, select = true) => {
        const moduleFunzioniIds = groupedFunzioni[moduleKey].map(f => f.id);
        if (select) {
            setPermessiAssociati(prev => [...new Set([...prev, ...moduleFunzioniIds])]);
        } else {
            setPermessiAssociati(prev => prev.filter(id => !moduleFunzioniIds.includes(id)));
        }
    };

    const handleSave = async () => {
        if (!selectedRuoloId) {
            alert('Seleziona prima un ruolo.');
            return;
        }
        setIsSaving(true);
        try {
            await api.post('/admin/ditta/permessi', {
                id_ruolo: selectedRuoloId,
                permessi: permessiAssociati
            });
            alert('Permessi salvati con successo!');
        } catch (error) {
            console.error('Errore durante il salvataggio dei permessi:', error);
            alert('Si è verificato un errore durante il salvataggio.');
        }
        setIsSaving(false);
    };

    return (
        <div className="p-4">
            <h3 className="text-lg font-bold mb-4">Gestione Ruoli e Permessi della Ditta</h3>
            <select value={selectedRuoloId} onChange={e => setSelectedRuoloId(e.target.value)} className="w-full p-2 border rounded mb-6" disabled={isLoading}>
                <option value="">{isLoading ? 'Caricamento...' : 'Seleziona un ruolo da modificare...'}</option>
                {ruoli.map(r => <option key={r.id} value={r.id}>{r.ruolo}</option>)}
            </select>
            {selectedRuoloId && (
                <div>
                    {isLoading ? <p>Caricamento permessi...</p> : (
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
                                                    checked={permessiAssociati.includes(funzione.id)}
                                                    onChange={() => handleCheckboxChange(funzione.id)}
                                                />
                                                <div>
                                                    {/* ++ MODIFICA 2: Applica lo stile rosso condizionale ++ */}
                                                    <span className={`font-semibold ${funzione.codice.endsWith('_MDVIEW') ? 'text-red-600' : 'text-gray-800'}`}>
                                                        {funzione.codice}
                                                    </span>
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
                            {isSaving ? 'Salvataggio...' : 'Salva Permessi per questo Ruolo'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestioneRuoliPermessi;