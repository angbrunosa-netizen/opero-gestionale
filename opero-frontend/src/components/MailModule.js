// #####################################################################
// # Componente MailModule - v3.8 (con Visualizzazione Corpo Inviata)
// # File: opero-frontend/src/components/MailModule.js
// #####################################################################

import React, { useState, useEffect, useCallback } from 'react';
import ComposeView from './ComposeView';
import SentView from './SentView';
import SettingsView from './SettingsView';

const API_URL = 'http://localhost:3001';

function MailModule({ session, onSessionUpdate }) {
  // ... (tutti gli stati e le funzioni helper come fetchAccounts, fetchEmails, etc. rimangono invariate) ...
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [view, setView] = useState('inbox');
  const [contentView, setContentView] = useState('list');
  const [replyType, setReplyType] = useState('reply');
  const [loadingList, setLoadingList] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const userLevel = session.user.livello || 0;

  const fetchAccounts = useCallback(async () => {
    try {
        const response = await fetch(`${API_URL}/api/mail/my-mail-accounts`, { headers: { 'Authorization': `Bearer ${session.token}` } });
        const data = await response.json();
        if (data.success) {
            setAccounts(data.data);
            if (data.data.length > 0 && !selectedAccountId) {
                setSelectedAccountId(data.data[0].id);
            }
        }
    } catch (error) { console.error("Errore nel caricare gli account:", error); }
  }, [session.token, selectedAccountId]);

  const fetchEmails = useCallback(async () => {
    if (!selectedAccountId) return;
    setLoadingList(true);
    try {
        const response = await fetch(`${API_URL}/api/mail/emails?accountId=${selectedAccountId}`, { headers: { 'Authorization': `Bearer ${session.token}` } });
        const data = await response.json();
        setEmails(data.success ? data.emails : []);
    } catch (error) {
        setEmails([]);
    }
    setLoadingList(false);
  }, [session.token, selectedAccountId]);

  useEffect(() => {
    if (view === 'inbox') {
        setSelectedEmail(null);
        setContentView('list');
        if (selectedAccountId) {
            fetchEmails();
        } else {
            setEmails([]);
        }
    } else {
        setEmails([]);
        setSelectedEmail(null);
    }
  }, [view, selectedAccountId, fetchEmails]);


  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);
  
  const handleEmailSelect = async (uid) => {
    if (!selectedAccountId) return;
    setLoadingDetail(true);
    setContentView('reading');
    try {
        const response = await fetch(`${API_URL}/api/mail/emails/${uid}?accountId=${selectedAccountId}`, { headers: { 'Authorization': `Bearer ${session.token}` } });
        const data = await response.json();
        if (data.success) {
            setSelectedEmail(data.email);
            setEmails(prevEmails => prevEmails.map(e => e.uid === uid ? { ...e, read: true } : e));
        } else {
            setContentView('list');
        }
    } catch (error) { 
        setContentView('list');
    }
    setLoadingDetail(false);
  };

  const handleSentEmailSelect = (email) => {
    setSelectedEmail(email);
    setContentView('reading');
  };

  const handleHideEmail = async (uid) => {
    if (window.confirm("Questa azione nasconderà l'email solo dalla tua vista. Sei sicuro?")) {
        try {
            const response = await fetch(`${API_URL}/api/mail/hide-email/${uid}`, { 
                method: 'POST', 
                headers: { 'Authorization': `Bearer ${session.token}` } 
            });
            const result = await response.json();
            if (response.ok && result.success) {
                fetchEmails();
            } else {
                alert(`Errore: ${result.message || 'Impossibile completare l\'operazione.'}`);
            }
        } catch (error) { 
            alert(`Errore di connessione: ${error.message}`); 
        }
    }
  };
  
  const handlePermanentDelete = async (uid) => {
    if (window.confirm("ATTENZIONE: Stai per eliminare PERMANENTEMENTE questa email dal server. L'azione è irreversibile. Procedere?")) {
        try {
            const response = await fetch(`${API_URL}/api/mail/emails/${uid}?accountId=${selectedAccountId}`, { 
                method: 'DELETE', 
                headers: { 'Authorization': `Bearer ${session.token}` } 
            });
            const result = await response.json();
            if (response.ok && result.success) {
                fetchEmails();
            } else {
                alert(`Errore: ${result.message || 'Impossibile completare l\'operazione.'}`);
            }
        } catch (error) { 
            alert(`Errore di connessione: ${error.message}`); 
        }
    }
  };

  const renderMainContent = () => {
    if (view === 'settings') {
        return <SettingsView session={session} onSessionUpdate={onSessionUpdate} />;
    }
    if (contentView === 'composing') {
        return <ComposeView 
            session={session} 
            accountId={selectedAccountId}
            emailToReply={selectedEmail} 
            replyType={replyType}
            onCancel={() => { setContentView(selectedEmail ? 'reading' : 'list'); }}
            onSent={() => { setView('sent'); }}
        />
    }
    if (contentView === 'reading' && selectedEmail) {
        // Se l'email ha un 'uid', è un'email in arrivo
        if (selectedEmail.uid) {
            return (
                <div>
                    <div className="flex flex-wrap gap-2 items-center mb-4 pb-4 border-b">
                        <h2 className="text-xl lg:text-2xl font-bold flex-grow ">{selectedEmail.subject}</h2>
                        <button onClick={() => { setReplyType('reply'); setContentView('composing'); }} className="px-3 py-1.5 rounded-md border bg-white hover:bg-slate-50 text-sm">Rispondi</button>
                        <button onClick={() => { setReplyType('replyAll'); setContentView('composing'); }} className="px-3 py-1.5 rounded-md border bg-white hover:bg-slate-50 text-sm">Rispondi a tutti</button>
                        <button onClick={() => { setReplyType('forward'); setContentView('composing'); }} className="px-3 py-1.5 rounded-md border bg-white hover:bg-slate-50 text-sm">Inoltra</button>
                    </div>
                    <p className="mb-4 text-slate-600"><strong>Da:</strong> {selectedEmail.from}</p>
                    {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                        <div className="mb-4 p-3 bg-slate-50 rounded-md border">
                            <h4 className="font-semibold mb-2 text-sm">Allegati:</h4>
                            {selectedEmail.attachments.map(att => (
                                <a key={att.filename} href={`${API_URL}/api/mail/emails/${selectedEmail.uid}/attachments/${encodeURIComponent(att.filename)}?token=${session.token}&accountId=${selectedAccountId}`} target="_blank" rel="noopener noreferrer" className="block text-blue-600 underline text-sm mb-1">
                                    {att.filename} ({Math.round(att.size / 1024)} KB)
                                </a>
                            ))}
                        </div>
                    )}
                    <div className="text-base leading-relaxed prose max-w-none" dangerouslySetInnerHTML={{ __html: selectedEmail.body }}></div>
                </div>
            );
        } else {
            // Altrimenti, è un'email inviata
            return (
                <div>
                    <h2 className="text-xl lg:text-2xl font-bold mb-4 pb-4 border-b">{selectedEmail.oggetto}</h2>
                    <div className="space-y-2 text-sm text-slate-700">
                        <p><strong>Destinatari:</strong> {selectedEmail.destinatari}</p>
                        <p><strong>Data Invio:</strong> {new Date(selectedEmail.data_invio).toLocaleString()}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t space-y-2 text-sm">
                        <h4 className="font-semibold">Stato Tracciamento</h4>
                        <p><strong>Stato Lettura:</strong> <span className={selectedEmail.aperta ? 'text-green-600 font-bold' : 'text-slate-500'}>{selectedEmail.aperta ? `Aperta il ${new Date(selectedEmail.data_prima_apertura).toLocaleString()}` : 'Non ancora aperta'}</span></p>
                        {selectedEmail.attachments && selectedEmail.attachments.length > 0 ? (
                            <div>
                                <h5 className="font-semibold mt-2">Allegati:</h5>
                                <ul className="list-disc pl-5">
                                    {selectedEmail.attachments.map((att, index) => (
                                        <li key={index}>
                                            {att.nome_file_originale} - <span className={att.scaricato ? 'text-green-600 font-bold' : 'text-slate-500'}>{att.scaricato ? 'Scaricato' : 'Non scaricato'}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : <p>Nessun allegato inviato.</p>}
                    </div>
                    {/* CORREZIONE: Mostra il corpo dell'email inviata e rimuove la vecchia nota */}
                    <div className="mt-6 pt-6 border-t">
                        <h4 className="font-semibold mb-2">Corpo del Messaggio Inviato:</h4>
                        <div className="text-base leading-relaxed prose max-w-none p-4 border rounded-md bg-slate-50" dangerouslySetInnerHTML={{ __html: selectedEmail.corpo }}></div>
                    </div>
                </div>
            );
        }
    }
    return <div className="flex items-center justify-center h-full text-slate-400"><p>Seleziona un'email per leggerla.</p></div>;
  };

  // ... (la parte 'return' del componente con la struttura JSX rimane invariata) ...
  return (
    <div className="flex w-full h-full bg-slate-50">
        <div className="w-full md:w-1/3 lg:w-[400px] border-r border-slate-200 flex flex-col bg-white">
            <div className="p-4 border-b border-slate-200">
                <select 
                    value={selectedAccountId} 
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className="w-full p-2 border rounded-md mb-4"
                    disabled={accounts.length === 0}
                >
                    {accounts.length > 0 ? (
                        accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.nome_account}</option>)
                    ) : (
                        <option>Nessun account a cui hai accesso</option>
                    )}
                </select>
                
                <button onClick={() => { setSelectedEmail(null); setReplyType(''); setContentView('composing'); }} className="w-full p-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors mb-4 disabled:bg-blue-300" disabled={!selectedAccountId}>
                    + Componi
                </button>
                <div className="flex gap-2">
                    <button onClick={() => setView('inbox')} className={`flex-1 p-2 rounded-md border text-sm ${view === 'inbox' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'}`}>Posta in Arrivo</button>
                    <button onClick={() => setView('sent')} className={`flex-1 p-2 rounded-md border text-sm ${view === 'sent' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'}`}>Posta Inviata</button>
                    <button onClick={() => setView('settings')} className={`flex-1 p-2 rounded-md border text-sm ${view === 'settings' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'}`}>Impostazioni</button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {view === 'inbox' && (
                loadingList ? <p className="text-center p-4 text-slate-500">Caricamento...</p> : emails.map(email => (
                    <div key={email.uid} className={`flex items-center border-b border-slate-200 cursor-pointer ${selectedEmail?.uid === email.uid ? 'bg-blue-50' : 'bg-white hover:bg-slate-50'}`} onClick={() => handleEmailSelect(email.uid)}>
                      <div className={`flex-grow p-4 min-w-0 ${!email.read && 'font-semibold'}`}>
                        <p className="truncate text-slate-800">{email.from}</p>
                        <p className={`truncate text-sm ${email.read ? 'text-slate-500' : 'text-slate-700'}`}>{email.subject}</p>
                      </div>
                      <div className="flex items-center pr-2">
                        <button onClick={(e) => { e.stopPropagation(); handleHideEmail(email.uid); }} className="p-2 text-slate-400 hover:text-slate-600 rounded-full" title="Nascondi email dalla tua vista">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                        {userLevel > 90 && (
                           <button onClick={(e) => { e.stopPropagation(); handlePermanentDelete(email.uid); }} className="p-2 text-red-500 hover:text-red-700 rounded-full" title="Elimina PERMANENTEMENTE email dal server">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                           </button>
                        )}
                      </div>
                    </div>
                ))
              )}
              {view === 'sent' && <SentView session={session} onEmailSelect={handleSentEmailSelect} />}
            </div>
        </div>

        <div className="flex-1 p-6 lg:p-8 overflow-y-auto bg-white">
            {loadingDetail ? <p className="text-center p-4 text-slate-500">Caricamento email...</p> : renderMainContent()}
        </div>
    </div>
  );
}

export default MailModule;
