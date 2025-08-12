// #####################################################################
// # Componente SentView - v3.1 (con Interazione)
// # File: opero-frontend/src/components/SentView.js
// #####################################################################

import React, { useState, useEffect, useCallback } from 'react';

//const API_URL = 'http://localhost:3001';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
// MODIFICA: Il componente ora riceve onEmailSelect come prop
function SentView({ session, onEmailSelect }) {
    const [sentEmails, setSentEmails] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchSentEmails = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/mail/sent-emails`, {
                headers: { 'Authorization': `Bearer ${session.token}` }
            });
            const data = await response.json();
            if (data.success) {
                setSentEmails(data.sentEmails);
            }
        } catch (error) {
            console.error("Errore nel caricare la posta inviata:", error);
        }
        setIsLoading(false);
    }, [session.token]);

    useEffect(() => {
        fetchSentEmails();
    }, [fetchSentEmails]);

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-800">Posta Inviata</h2>
                <button onClick={fetchSentEmails} disabled={isLoading} className="px-4 py-2 text-sm border rounded-md hover:bg-slate-100">
                    {isLoading ? 'Aggiornamento...' : 'Aggiorna'}
                </button>
            </div>
            {isLoading && <p className="text-center">Caricamento...</p>}
            <div className="space-y-2">
                {!isLoading && sentEmails.map(email => (
                    // MODIFICA: Aggiunto onClick per chiamare la funzione del genitore
                    <div 
                        key={email.id} 
                        className="p-3 border border-slate-200 rounded-lg bg-white cursor-pointer hover:bg-slate-50"
                        onClick={() => onEmailSelect(email)}
                    >
                        <p className="font-semibold text-sm truncate">A: {email.destinatari}</p>
                        <p className="text-sm truncate text-slate-600">{email.oggetto}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 pt-2 border-t text-xs text-slate-500">
                            <span title={new Date(email.data_invio).toLocaleString()}>{new Date(email.data_invio).toLocaleDateString()}</span>
                            <span className={`font-bold ${email.aperta ? 'text-green-600' : 'text-slate-500'}`}>
                                {email.aperta ? '● Letta' : '○ Inviata'}
                            </span>
                            {email.attachments.length > 0 && (
                                <span className={`font-bold ${email.attachments.every(a => a.scaricato) ? 'text-green-600' : 'text-slate-500'}`}>
                                    {email.attachments.every(a => a.scaricato) ? '● Download completato' : '● Con allegati'}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SentView;