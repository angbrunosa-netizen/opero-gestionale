/**
 * #####################################################################
 * # Componente Bacheca del Team PPA
 * # File: opero-frontend/src/components/ppa/TeamBacheca.js
 * #####################################################################
 *
 * @description
 * Gestisce la visualizzazione dei messaggi di un team e l'invio
 * di nuovi messaggi alla bacheca, utilizzando le API dedicate.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const TeamBacheca = ({ teamId }) => {
    const [messaggi, setMessaggi] = useState([]);
    const [newMessaggio, setNewMessaggio] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    const fetchMessaggi = useCallback(async () => {
        if(!teamId) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const response = await api.get(`/ppa/team/${teamId}/comunicazioni`);
            setMessaggi(response.data.data || []);
        } catch (error) {
            console.error("Errore nel caricare i messaggi del team:", error);
        } finally {
            setIsLoading(false);
        }
    }, [teamId]);

    useEffect(() => {
        fetchMessaggi();
    }, [fetchMessaggi]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessaggio.trim()) return;
        
        try {
            await api.post(`/ppa/team/${teamId}/comunicazioni`, { messaggio: newMessaggio });
            setNewMessaggio('');
            fetchMessaggi(); // Ricarica i messaggi dopo l'invio
        } catch (error) {
            alert("Impossibile inviare il messaggio.");
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4" style={{maxHeight: '400px'}}>
                {isLoading ? <p className="text-sm text-center">Caricamento messaggi...</p> : 
                 messaggi.length > 0 ? messaggi.map(msg => (
                    <div key={msg.id} className={`p-2 rounded-lg ${msg.id_utente_mittente === user.id ? 'bg-blue-100 text-blue-900' : 'bg-gray-100'}`}>
                        <p className="text-xs font-bold">{msg.nome_mittente} {msg.cognome_mittente}</p>
                        <p className="text-sm break-words">{msg.messaggio}</p>
                        <p className="text-right text-xs text-gray-500 mt-1">{new Date(msg.created_at).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                )) : 
                <p className="text-sm text-center text-gray-500 pt-4">Nessun messaggio sulla bacheca.</p>}
            </div>

            <form onSubmit={handleSendMessage} className="border-t pt-3">
                <textarea
                    value={newMessaggio}
                    onChange={(e) => setNewMessaggio(e.target.value)}
                    placeholder="Scrivi un aggiornamento per il team..."
                    rows="3"
                    className="w-full p-2 border rounded-md text-sm"
                ></textarea>
                <button type="submit" className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700">
                    Invia
                </button>
            </form>
        </div>
    );
};

export default TeamBacheca;

