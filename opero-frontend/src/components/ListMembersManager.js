import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { XMarkIcon as XIcon } from '@heroicons/react/24/solid';

/**
 * Modale per gestire l'associazione degli utenti a una specifica lista di distribuzione.
 */
const ListMembersManager = ({ list, onClose }) => {
    const [allContacts, setAllContacts] = useState([]);
    const [memberIds, setMemberIds] = useState(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Carica tutti i contatti e i membri attuali della lista
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [contactsRes, membersRes] = await Promise.all([
                api.get('/rubrica/contatti'),
                api.get(`/rubrica/liste/${list.id}/utenti`)
            ]);
            setAllContacts(contactsRes.data);
            setMemberIds(new Set(membersRes.data.map(member => member.id_utente)));
            setError(null);
        } catch (err) {
            setError("Impossibile caricare i dati.");
            console.error("Errore fetch dati per ListMembersManager:", err);
        } finally {
            setIsLoading(false);
        }
    }, [list.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleToggleMember = (contactId) => {
        const newMemberIds = new Set(memberIds);
        if (newMemberIds.has(contactId)) {
            newMemberIds.delete(contactId);
        } else {
            newMemberIds.add(contactId);
        }
        setMemberIds(newMemberIds);
    };

    const handleSave = async () => {
        try {
            await api.post(`/rubrica/liste/${list.id}/utenti`, {
                userIds: Array.from(memberIds)
            });
            onClose(); // Chiude il modale dopo il salvataggio
        } catch (err) {
            setError("Errore durante il salvataggio.");
            console.error("Errore salvataggio membri lista:", err);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-bold">Gestisci Membri per: "{list.nome_lista}"</h3>
                    <button type="button" onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 flex-grow overflow-y-auto">
                    {isLoading && <p>Caricamento...</p>}
                    {error && <p className="text-red-500">{error}</p>}
                    {!isLoading && !error && (
                        <div className="space-y-2">
                            {allContacts.map(contact => (
                                <div key={contact.id} className="flex items-center p-2 rounded hover:bg-gray-50">
                                    <input
                                        type="checkbox"
                                        id={`contact-${contact.id}`}
                                        checked={memberIds.has(contact.id)}
                                        onChange={() => handleToggleMember(contact.id)}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor={`contact-${contact.id}`} className="ml-3 text-sm">
                                        {contact.nome} {contact.cognome} ({contact.email})
                                    </label>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end items-center p-4 bg-gray-50 border-t">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md mr-2 hover:bg-gray-300">Annulla</button>
                    <button type="button" onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Salva Modifiche</button>
                </div>
            </div>
        </div>
    );
};

export default ListMembersManager;
