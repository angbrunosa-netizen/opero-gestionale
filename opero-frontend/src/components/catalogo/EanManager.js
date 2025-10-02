/**
 * @file opero-frontend/src/components/catalogo/EanManager.js
 * @description Modale per la gestione dei codici EAN di un articolo.
 * - v2.0: Versione stabile e robusta con gestione caricamento/errori.
 * Utilizza uno z-index elevato per garantire la visibilità.
 * @date 2025-10-02
 * @version 2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/solid';

const EanManager = ({ itemId, onClose }) => {
    const { hasPermission } = useAuth();
    const [eans, setEans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newEanData, setNewEanData] = useState({
        codice_ean: '',
        tipo_ean: 'PRODOTTO',
        tipo_ean_prodotto: 'PEZZO'
    });

    const fetchEans = useCallback(async () => {
        if (!itemId) return;
        setLoading(true);
        try {
            const response = await api.get(`/catalogo/entita/${itemId}/ean`);
            setEans(response.data || []);
            setError(null);
        } catch (err) {
            console.error("Errore nel caricamento dei codici EAN:", err);
            setError("Impossibile caricare i codici EAN.");
        } finally {
            setLoading(false);
        }
    }, [itemId]);

    useEffect(() => {
        fetchEans();
    }, [fetchEans]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewEanData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddEan = async (e) => {
        e.preventDefault();
        if (!newEanData.codice_ean.trim() || !hasPermission('CT_EAN_MANAGE')) return;

        try {
            await api.post(`/catalogo/entita/${itemId}/ean`, newEanData);
            setNewEanData({ codice_ean: '', tipo_ean: 'PRODOTTO', tipo_ean_prodotto: 'PEZZO' });
            fetchEans(); // Ricarica la lista
        } catch (err) {
            console.error("Errore nell'aggiunta del codice EAN:", err);
            alert('Errore: ' + (err.response?.data?.message || "Impossibile aggiungere il codice EAN."));
        }
    };

    const handleDeleteEan = async (eanId) => {
        if (!window.confirm("Sei sicuro di voler eliminare questo codice EAN?") || !hasPermission('CT_EAN_MANAGE')) return;
        try {
            await api.delete(`/catalogo/ean/${eanId}`);
            fetchEans(); // Ricarica la lista
        } catch (err) {
            console.error("Errore nell'eliminazione del codice EAN:", err);
            alert('Errore: ' + (err.response?.data?.message || "Impossibile eliminare il codice EAN."));
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[999]">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl flex flex-col max-h-[80vh]">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-bold">Gestione Codici EAN</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto">
                    {loading && <p>Caricamento...</p>}
                    {error && <p className="text-red-500">{error}</p>}
                    
                    {!loading && !error && (
                        <ul className="space-y-2">
                            {eans.map(ean => (
                                <li key={ean.id} className="flex justify-between items-center p-2 border rounded-md">
                                    <div>
                                        <span className="font-mono text-gray-800">{ean.codice_ean}</span>
                                        <span className="ml-4 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                            {ean.tipo_ean} {ean.tipo_ean_prodotto ? `(${ean.tipo_ean_prodotto})` : ''}
                                        </span>
                                    </div>
                                    {hasPermission('CT_EAN_MANAGE') && (
                                        <button onClick={() => handleDeleteEan(ean.id)} className="p-1 text-red-500 hover:text-red-700">
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    )}
                                </li>
                            ))}
                            {eans.length === 0 && <p className="text-gray-500 text-center py-4">Nessun codice EAN associato a questo articolo.</p>}
                        </ul>
                    )}
                </div>

                {hasPermission('CT_EAN_MANAGE') && (
                    <form onSubmit={handleAddEan} className="p-4 border-t bg-gray-50">
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                             <input
                                type="text"
                                name="codice_ean"
                                value={newEanData.codice_ean}
                                onChange={handleInputChange}
                                placeholder="Nuovo codice EAN"
                                className="md:col-span-2 p-2 border rounded-md"
                                required
                            />
                             <button type="submit" className="flex justify-center items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                <PlusIcon className="h-5 w-5 mr-1" /> Aggiungi
                            </button>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                            <select name="tipo_ean" value={newEanData.tipo_ean} onChange={handleInputChange} className="p-2 border rounded-md bg-white">
                                <option value="PRODOTTO">Prodotto</option>
                                <option value="CONFEZIONE">Confezione</option>
                            </select>
                            {newEanData.tipo_ean === 'PRODOTTO' && (
                                <select name="tipo_ean_prodotto" value={newEanData.tipo_ean_prodotto} onChange={handleInputChange} className="p-2 border rounded-md bg-white">
                                    <option value="PEZZO">Pezzo</option>
                                    <option value="PESO">Peso</option>
                                    <option value="PREZZO">Prezzo</option>
                                </select>
                            )}
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EanManager;

