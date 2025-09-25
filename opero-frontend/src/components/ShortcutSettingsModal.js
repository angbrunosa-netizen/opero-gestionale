import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
// RIMOSSO: Non usiamo più il registro statico per le opzioni
// import { modules } from '../lib/moduleRegistry'; 

const ShortcutSettingsModal = ({ isOpen, onClose }) => {
    //const { user } = useAuth();
    const [shortcuts, setShortcuts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
     const { user, hasPermission } = useAuth();

    // NUOVO: Stato per contenere le funzioni disponibili caricate dal backend
    const [availableFunctions, setAvailableFunctions] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            if (isOpen && user) {
                setIsLoading(true);
                try {
                    // Eseguiamo due chiamate in parallelo per velocità
                    const [shortcutsRes, availableFuncsRes] = await Promise.all([
                        api.get(`/user/shortcuts`),
                        api.get(`/user/available-shortcuts`) // Chiamiamo il nostro nuovo endpoint
                    ]);

                    // Gestiamo le scorciatoie dell'utente (come prima)
                    if (shortcutsRes.data && Array.isArray(shortcutsRes.data.data)) {
                        const userShortcuts = shortcutsRes.data.data.map(sc => sc.codice);
                        setShortcuts(userShortcuts);
                    }

                    // Gestiamo la lista delle opzioni disponibili
                    if (availableFuncsRes.data && Array.isArray(availableFuncsRes.data.data)) {
                        setAvailableFunctions(availableFuncsRes.data.data);
                    }

                } catch (error) {
                    console.error("Errore nel caricamento dei dati per il modale scorciatoie:", error);
                    setAvailableFunctions([]); // In caso di errore, la lista sarà vuota
                } finally {
                    setIsLoading(false);
                }
            }
        };
        fetchData();
    }, [isOpen, user]);

    const handleCheckboxChange = (moduleKey) => {
        setShortcuts(prev => 
            prev.includes(moduleKey) 
                ? prev.filter(sc => sc !== moduleKey)
                : [...prev, moduleKey]
        );
    };

    const handleSave = async () => {
        try {
            // La logica di salvataggio non cambia, invia sempre i codici
            await api.post('/user/shortcuts', { shortcuts });
            onClose(true); 
        } catch (error) {
            console.error("Errore nel salvataggio delle scorciatoie:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold">Personalizza Scorciatoie</h2>
                </div>
                <div className="p-6">
                    {isLoading ? (
                        <p>Caricamento...</p>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-sm text-gray-600">Seleziona le funzioni da mostrare come scorciatoie.</p>
                            {/* Mappiamo la nuova lista dinamica */}
                            {availableFunctions.map(func => (
                                <label key={func.id} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-100">
                                    <input
                                        type="checkbox"
                                        checked={shortcuts.includes(func.codice)}
                                        onChange={() => handleCheckboxChange(func.codice)}
                                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    {/* Usiamo la descrizione dal DB */}
                                    <span className="font-medium">{func.descrizione}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
                <div className="p-4 bg-gray-50 border-t flex justify-end space-x-3">
                    <button onClick={() => onClose(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                        Annulla
                    </button>
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        Salva
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShortcutSettingsModal;

