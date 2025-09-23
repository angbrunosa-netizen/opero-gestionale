/**
 * File: opero-frontend/src/components/ppa/TeamCommunicationModal.js
 * Descrizione: Componente React per la modale di comunicazione con il team di una procedura PPA.
 * Fase: 4.2 - Creazione del Componente Frontend
 */
import React, { useState } from 'react';
import { api } from '../../services/api';

const TeamCommunicationModal = ({ isOpen, onClose, istanzaId, nomeProcedura }) => {
    const [messaggio, setMessaggio] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) {
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!messaggio.trim()) {
            setError("Il messaggio non può essere vuoto.");
            return;
        }
        
        setIsSending(true);
        setError(null);

        try {
            await api.post(`/ppa/istanze/${istanzaId}/comunica-team`, { messaggio });
            alert("Messaggio inviato con successo al team!"); // Da sostituire con un sistema di notifiche migliore
            onClose();
        } catch (err) {
            console.error("Errore nell'invio del messaggio:", err);
            setError(err.response?.data?.message || "Si è verificato un errore durante l'invio.");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-800">Invia Comunicazione al Team</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Procedura: <span className="font-semibold">{nomeProcedura}</span>
                        </p>
                        
                        {error && <div className="bg-red-100 text-red-700 p-3 rounded-md my-4">{error}</div>}

                        <div className="mt-4">
                            <label htmlFor="messaggio-team" className="sr-only">Messaggio</label>
                            <textarea
                                id="messaggio-team"
                                rows="6"
                                value={messaggio}
                                onChange={(e) => setMessaggio(e.target.value)}
                                placeholder="Scrivi qui il tuo messaggio..."
                                className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="bg-gray-50 px-6 py-4 flex justify-end gap-4 rounded-b-lg">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                        >
                            Annulla
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSending} 
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                        >
                            {isSending ? 'Invio in corso...' : 'Invia Messaggio'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TeamCommunicationModal;
