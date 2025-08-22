// # componente liste di distribuzione
// # File: opero-frontend/src/components/ListForm.js
// #####################################################################



import React, {useState, useEffect } from 'react';
import api from '../services/api';
import { XMarkIcon as XIcon } from '@heroicons/react/24/solid';

/**
 * Form modale per la creazione e la modifica di una lista di distribuzione.
 *
 * @param {object | null} listToEdit - L'oggetto della lista da modificare. Se null, il form è in modalità creazione.
 * @param {function} onClose - Funzione per chiudere il form modale.
 * @param {function} onSave - Callback chiamata dopo un salvataggio riuscito. Riceve la lista nuova/modificata.
 */
const ListForm = ({ listToEdit, onClose, onSave }) => {
    const initialState = {
        nome_lista: '',
        descrizione: '',
    };

    const [formData, setFormData] = useState(initialState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const isEditMode = Boolean(listToEdit);

    useEffect(() => {
        if (isEditMode) {
            setFormData({
                nome_lista: listToEdit.nome_lista || '',
                descrizione: listToEdit.descrizione || '',
            });
        } else {
            setFormData(initialState);
        }
    }, [listToEdit, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.nome_lista) {
            setError('Il nome della lista è obbligatorio.');
            return;
        }

        setIsSubmitting(true);
        try {
            let response;
            if (isEditMode) {
                // TODO: Implementare la rotta PUT nel backend
                response = await api.put(`/rubrica/liste/${listToEdit.id}`, formData);
            } else {
                response = await api.post('/rubrica/liste', formData);
            }

            if (response.data && response.data.lista) {
                onSave(response.data.lista);
                onClose();
            } else {
                throw new Error("La risposta del server non conteneva i dati della lista.");
            }

        } catch (err) {
            setError(err.response?.data?.message || 'Si è verificato un errore durante il salvataggio.');
            console.error("Errore salvataggio lista:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="flex justify-between items-center p-4 border-b">
                        <h3 className="text-lg font-bold">
                            {isEditMode ? 'Modifica Lista' : 'Nuova Lista di Distribuzione'}
                        </h3>
                        <button type="button" onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200">
                            <XIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="p-6 space-y-4">
                        {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}
                        
                        <div>
                            <label htmlFor="nome_lista" className="block text-sm font-medium text-gray-700">Nome Lista</label>
                            <input type="text" name="nome_lista" id="nome_lista" value={formData.nome_lista} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label htmlFor="descrizione" className="block text-sm font-medium text-gray-700">Descrizione</label>
                            <textarea name="descrizione" id="descrizione" value={formData.descrizione} onChange={handleChange} rows="3" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                    </div>

                    <div className="flex justify-end items-center p-4 bg-gray-50 border-t">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md mr-2 hover:bg-gray-300">
                            Annulla
                        </button>
                        <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                            {isSubmitting ? 'Salvataggio...' : 'Salva Lista'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ListForm;
