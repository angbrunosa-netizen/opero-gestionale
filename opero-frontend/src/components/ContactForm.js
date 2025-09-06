import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { XMarkIcon as XIcon } from '@heroicons/react/24/solid';

const ContactForm = ({ contactToEdit, onClose, onSave }) => {
    const initialState = {
        nome: '', cognome: '', email: '', telefono: '', azienda: '',
        indirizzo: '', citta: '', provincia: '', cap: '',
        attivo: true, privacy: false,
    };
    const [formData, setFormData] = useState(initialState);
    const [allLists, setAllLists] = useState([]);
    const [selectedListIds, setSelectedListIds] = useState(new Set());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const isEditMode = Boolean(contactToEdit);

    useEffect(() => {
        const fetchAllDataForForm = async () => {
            try {
                // Se non siamo in modalità modifica, non fare nulla
                if (!isEditMode) {
                    setFormData(initialState);
                    return;
                }

                // Carica in parallelo i dettagli del contatto, tutte le liste e le liste dell'utente
                const [contactDetailsRes, allListsRes, userListsRes] = await Promise.all([
                    api.get(`/rubrica/contatti/${contactToEdit.id}`), // Chiamata per i dettagli completi
                    api.get('/rubrica/liste'),
                    api.get(`/rubrica/contatti/${contactToEdit.id}/liste`)
                ]);

                const contactDetails = contactDetailsRes.data;

                // Popola il form con tutti i dati recuperati
                setFormData({
                    nome: contactDetails.nome || '',
                    cognome: contactDetails.cognome || '',
                    email: contactDetails.email || '',
                    telefono: contactDetails.telefono || '',
                    indirizzo: contactDetails.indirizzo || '',
                    citta: contactDetails.citta || '',
                    provincia: contactDetails.provincia || '',
                    cap: contactDetails.cap || '',
                    attivo: contactDetails.attivo === 1,
                    privacy: contactDetails.privacy === 1,
                });

                setAllLists(allListsRes.data);
                setSelectedListIds(new Set(userListsRes.data));

            } catch (err) {
                console.error("Errore nel caricare i dati per il form", err);
                setError("Non è stato possibile caricare i dati del contatto.");
            }
        };

        fetchAllDataForForm();
    }, [contactToEdit, isEditMode]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleListToggle = (listId) => {
        const newSelection = new Set(selectedListIds);
        if (newSelection.has(listId)) {
            newSelection.delete(listId);
        } else {
            newSelection.add(listId);
        }
        setSelectedListIds(newSelection);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nome || !formData.email) {
            setError('Nome ed Email sono campi obbligatori.');
            return;
        }
        setIsSubmitting(true);
        try {
            const dataToSend = {
                ...formData,
                attivo: formData.attivo ? 1 : 0,
                privacy: formData.privacy ? 1 : 0,
            };

            let response;
            if (isEditMode) {
                response = await api.put(`/rubrica/contatti/${contactToEdit.id}`, dataToSend);
                await api.post(`/rubrica/contatti/${contactToEdit.id}/liste`, {
                    listIds: Array.from(selectedListIds)
                });
            } else {
                response = await api.post('/rubrica/contatti', dataToSend);
            }
            onSave(response.data.contatto);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Si è verificato un errore.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <div className="flex justify-between items-center p-4 border-b">
                        <h3 className="text-lg font-bold">{isEditMode ? 'Modifica Contatto' : 'Nuovo Contatto'}</h3>
                        <button type="button" onClick={onClose}><XIcon className="h-6 w-6" /></button>
                    </div>

                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="text-sm font-medium text-gray-700">Nome</label><input type="text" name="nome" value={formData.nome} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></div>
                            <div><label className="text-sm font-medium text-gray-700">Cognome</label><input type="text" name="cognome" value={formData.cognome} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></div>
                        </div>
                        <div><label className="text-sm font-medium text-gray-700">Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></div>
                        <div><label className="text-sm font-medium text-gray-700">Telefono</label><input type="text" name="telefono" value={formData.telefono} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></div>
                        <div><label className="text-sm font-medium text-gray-700">Indirizzo</label><input type="text" name="indirizzo" value={formData.indirizzo} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div><label>Città</label><input type="text" name="citta" value={formData.citta} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" /></div>
                            <div><label>Provincia</label><input type="text" name="provincia" value={formData.provincia} onChange={handleChange} maxLength="2" className="mt-1 block w-full border rounded-md p-2" /></div>
                            <div><label>CAP</label><input type="text" name="cap" value={formData.cap} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" /></div>
                        </div>
                         <div className="flex items-center gap-6 pt-4 border-t">
                            <div className="flex items-center"><input type="checkbox" name="attivo" checked={formData.attivo} onChange={handleChange} className="h-4 w-4 rounded" /><label className="ml-2">Attivo</label></div>
                            <div className="flex items-center"><input type="checkbox" name="privacy" checked={formData.privacy} onChange={handleChange} className="h-4 w-4 rounded" /><label className="ml-2">Privacy Accettata</label></div>
                        </div>
                        {isEditMode && allLists.length > 0 && (
                            <div className="pt-4 mt-4 border-t">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Appartenenza Liste</h4>
                                <div className="p-3 border rounded-md max-h-40 overflow-y-auto space-y-2">
                                    {allLists.map(list => (
                                        <div key={list.id} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`list-${list.id}`}
                                                checked={selectedListIds.has(list.id)}
                                                onChange={() => handleListToggle(list.id)}
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <label htmlFor={`list-${list.id}`} className="ml-2 text-sm">{list.nome_lista}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end items-center p-4 bg-gray-50 border-t">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md mr-2">Annulla</button>
                        <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-4 py-2 rounded-md">{isSubmitting ? 'Salvataggio...' : 'Salva'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ContactForm;
