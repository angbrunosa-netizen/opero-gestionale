import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { XMarkIcon } from '@heroicons/react/24/solid';

const ShortcutSettingsModal = ({ currentShortcuts, onClose, onSave }) => {
    const [allFunctions, setAllFunctions] = useState([]);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Inizializza i checkbox con le scorciatoie attuali
        setSelectedIds(new Set(currentShortcuts.map(s => s.id)));

        // Carica tutte le funzioni a cui l'utente ha accesso
        const fetchFunctions = async () => {
            setIsLoading(true);
            try {
                const { data } = await api.get('/user/all-pinnable-functions');
                if (data.success) {
                    setAllFunctions(data.data);
                }
            } catch (error) {
                console.error("Errore nel caricare le funzioni disponibili", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFunctions();
    }, [currentShortcuts]);

    const handleToggle = (functionId) => {
        const newSelection = new Set(selectedIds);
        if (newSelection.has(functionId)) {
            newSelection.delete(functionId);
        } else {
            newSelection.add(functionId);
        }
        setSelectedIds(newSelection);
    };

    const handleSaveClick = async () => {
        try {
            await api.post('/user/shortcuts', { funzioniIds: Array.from(selectedIds) });
            onSave(); // Questa funzione ricaricherà le scorciatoie nel MainApp
        } catch (error) {
            alert("Errore durante il salvataggio delle preferenze.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-bold">Personalizza Scorciatoie</h3>
                    <button onClick={onClose}><XMarkIcon className="h-6 w-6" /></button>
                </div>
                <div className="p-6 flex-grow overflow-y-auto">
                    <p className="text-sm text-gray-600 mb-4">Seleziona le funzioni che vuoi visualizzare nella barra in alto per un accesso rapido.</p>
                    {isLoading ? <p>Caricamento...</p> : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {allFunctions.map(func => (
                                <div key={func.id} className="flex items-center p-2 rounded-md hover:bg-gray-100">
                                    <input
                                        type="checkbox"
                                        id={`func-${func.id}`}
                                        checked={selectedIds.has(func.id)}
                                        onChange={() => handleToggle(func.id)}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor={`func-${func.id}`} className="ml-3 text-sm font-medium text-gray-800">
                                        {func.descrizione}
                                    </label>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex justify-end p-4 bg-gray-50 border-t">
                    <button onClick={onClose} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md mr-2">Annulla</button>
                    <button onClick={handleSaveClick} className="bg-blue-600 text-white px-4 py-2 rounded-md">Salva Preferenze</button>
                </div>
            </div>
        </div>
    );
};

export default ShortcutSettingsModal;
