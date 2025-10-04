/**
 * @file opero-frontend/src/components/magazzino/MovimentoFormModal.js
 * @description Modale per l'inserimento di un nuovo movimento di magazzino.
 * @version 1.0
 * @date 2025-10-04
 */

import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import SearchableInput from '../../shared/SearchableInput';

const MovimentoFormModal = ({ onClose, onSaveSuccess }) => {
    const [formData, setFormData] = useState({
        id_magazzino: null,
        id_catalogo: null,
        id_causale: null,
        quantita: '',
        data_movimento: new Date().toISOString().slice(0, 16), // Formato datetime-local
        note: '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const quantitaRef = useRef(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleEntitySelect = (field, item) => {
        setFormData(prev => ({ ...prev, [field]: item ? item.id : null }));
        // Focus sulla quantità dopo aver selezionato l'articolo
        if (field === 'id_catalogo' && item) {
            quantitaRef.current?.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await api.post('/api/magazzino/movimenti', formData);
            alert("Movimento registrato con successo!");
            onSaveSuccess();
            onClose();
        } catch (error) {
            console.error("Errore nel salvataggio del movimento:", error);
            alert("Errore durante il salvataggio: " + (error.response?.data?.message || error.message));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
                <h2 className="text-2xl font-bold mb-4">Nuovo Movimento di Magazzino</h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* Articolo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Articolo</label>
                            <SearchableInput
                                searchUrl="/api/catalogo/search"
                                displayField="descrizione"
                                placeholder="Cerca articolo per codice o descrizione..."
                                onItemSelected={(item) => handleEntitySelect('id_catalogo', item)}
                            />
                        </div>
                        
                        {/* Magazzino */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Magazzino</label>
                            <SearchableInput
                                searchUrl="/api/magazzino/magazzini"
                                displayField="descrizione"
                                placeholder="Cerca magazzino..."
                                onItemSelected={(item) => handleEntitySelect('id_magazzino', item)}
                            />
                        </div>

                        {/* Causale */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Causale</label>
                            <SearchableInput
                                searchUrl="/api/magazzino/causali"
                                displayField="descrizione"
                                placeholder="Cerca causale..."
                                onItemSelected={(item) => handleEntitySelect('id_causale', item)}
                            />
                        </div>

                        {/* Quantità */}
                        <div>
                            <label htmlFor="quantita" className="block text-sm font-medium text-gray-700 mb-1">Quantità</label>
                            <input
                                ref={quantitaRef}
                                type="number"
                                step="any"
                                id="quantita"
                                name="quantita"
                                value={formData.quantita}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                required
                            />
                        </div>

                         {/* Data Movimento */}
                         <div>
                            <label htmlFor="data_movimento" className="block text-sm font-medium text-gray-700 mb-1">Data e Ora Movimento</label>
                            <input
                                type="datetime-local"
                                id="data_movimento"
                                name="data_movimento"
                                value={formData.data_movimento}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                required
                            />
                        </div>
                    </div>

                    {/* Note */}
                    <div className="mb-6">
                        <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                        <textarea
                            id="note"
                            name="note"
                            rows="3"
                            value={formData.note}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        ></textarea>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Annulla</button>
                        <button type="submit" disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                            {isSaving ? 'Salvataggio...' : 'Salva Movimento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MovimentoFormModal;

