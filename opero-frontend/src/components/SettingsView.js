// #####################################################################
// # Componente SettingsView
// # File: opero-frontend/src/components/SettingsView.js
// #####################################################################

//import React, { useState } from 'react';
import React, { useState, useEffect, useCallback } from 'react';

const API_URL = 'http://localhost:3001';

function SettingsView({ session, onSessionUpdate }) {
    const [nome, setNome] = useState(session.user.nome || '');
    const [cognome, setCognome] = useState(session.user.cognome || '');
    const [firma, setFirma] = useState(session.user.firma || '');

    const handleProfileSave = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/api/user/profile`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.token}` },
                body: JSON.stringify({ nome, cognome })
            });
            const data = await response.json();
            if (data.success) {
                alert('Profilo aggiornato!');
                const updatedUser = { ...session.user, nome, cognome };
                onSessionUpdate({ ...session, user: updatedUser });
            } else {
                alert(`Errore: ${data.message}`);
            }
        } catch (error) {
            alert(`Errore di connessione: ${error.message}`);
        }
    };

    const handleSignatureSave = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/api/user/signature`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.token}` },
                body: JSON.stringify({ firma })
            });
            const data = await response.json();
            if (data.success) {
                alert('Firma salvata!');
                const updatedUser = { ...session.user, firma };
                onSessionUpdate({ ...session, user: updatedUser });
            } else {
                alert(`Errore: ${data.message}`);
            }
        } catch (error) {
            alert(`Errore di connessione: ${error.message}`);
        }
    };

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

    return (
        <div>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '24px' }}>Impostazioni Profilo</h2>
            
            <form onSubmit={handleProfileSave} style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '24px', backgroundColor: '#f9f9f9' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>Dati Personali</h3>
                <label>Nome:</label>
                <input value={nome} onChange={e => setNome(e.target.value)} required style={{ width: '100%', padding: '8px', margin: '8px 0', boxSizing: 'border-box' }} />
                <label>Cognome:</label>
                <input value={cognome} onChange={e => setCognome(e.target.value)} required style={{ width: '100%', padding: '8px', margin: '8px 0', boxSizing: 'border-box' }} />
                <button type="submit" style={{ padding: '8px 16px', border: 'none', backgroundColor: '#2563eb', color: 'white', borderRadius: '6px', cursor: 'pointer' }}>Salva Dati</button>
            </form>

            <form onSubmit={handleSignatureSave} style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>Firma Email</h3>
                <textarea value={firma} onChange={e => setFirma(e.target.value)} rows="5" style={{ width: '100%', padding: '8px', margin: '8px 0', boxSizing: 'border-box' }}></textarea>
                <button type="submit" style={{ padding: '8px 16px', border: 'none', backgroundColor: '#2563eb', color: 'white', borderRadius: '6px', cursor: 'pointer' }}>Salva Firma</button>
            </form>
        </div>
    );
}

export default SettingsView;
