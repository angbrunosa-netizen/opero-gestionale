// #####################################################################
// # Modulo Posta - v4.0 (Refactoring con Context API)
// # File: opero-frontend/src/components/MailModule.js
// #####################################################################

import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

import ComposeView from './ComposeView';
import SentView from './SentView';
import SettingsView from './SettingsView';

// --- Sotto-componente per la Lista delle Email in Arrivo ---
function InboxList({ accountId, onEmailSelect, userLevel, refreshList }) {
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchEmails = useCallback(async () => {
        if (!accountId) return;
        setLoading(true);
        try {
            const { data } = await api.get(`/mail/emails?accountId=${accountId}`);
            setEmails(data.success ? data.emails : []);
        } catch (error) {
            console.error("Errore nel caricare le email:", error);
            setEmails([]);
        } finally {
            setLoading(false);
        }
    }, [accountId]);

    useEffect(() => {
        fetchEmails();
    }, [fetchEmails, refreshList]);

    const handleAction = async (e, actionFn, uid) => {
        e.stopPropagation(); // Impedisce che venga selezionata l'email
        await actionFn(uid);
        fetchEmails(); // Ricarica la lista dopo l'azione
    };

    const handleHideEmail = async (uid) => {
        if (window.confirm("Questa azione nasconderà l'email solo dalla tua vista. Sei sicuro?")) {
            try {
                await api.post(`/mail/hide-email/${uid}`);
            } catch (error) {
                alert(`Errore di connessione: ${error.message}`);
            }
        }
    };

    const handlePermanentDelete = async (uid) => {
        if (window.confirm("ATTENZIONE: Stai per eliminare PERMANENTEMENTE questa email. L'azione è irreversibile. Procedere?")) {
            try {
                await api.delete(`/mail/emails/${uid}?accountId=${accountId}`);
            } catch (error) {
                alert(`Errore di connessione: ${error.message}`);
            }
        }
    };

    if (loading) return <p className="text-center p-4 text-slate-500">Caricamento...</p>;

    return emails.map(email => (
        <div key={email.uid} className={`flex items-center border-b border-slate-200 cursor-pointer bg-white hover:bg-slate-50`} onClick={() => onEmailSelect(email.uid)}>
            <div className={`flex-grow p-4 min-w-0 ${!email.read && 'font-semibold'}`}>
                <p className="truncate text-slate-800">{email.from}</p>
                <p className={`truncate text-sm ${email.read ? 'text-slate-500' : 'text-slate-700'}`}>{email.subject}</p>
            </div>
            <div className="flex items-center pr-2">
                <button onClick={(e) => handleAction(e, handleHideEmail, email.uid)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full" title="Nascondi email">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
                {userLevel > 90 && (
                    <button onClick={(e) => handleAction(e, handlePermanentDelete, email.uid)} className="p-2 text-red-500 hover:text-red-700 rounded-full" title="Elimina PERMANENTEMENTE">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                    </button>
                )}
            </div>
        </div>
    ));
}

// --- Sotto-componente per la Visualizzazione di una singola Email ---
function ReadingPane({ email, accountId, onAction }) {
    if (!email) return <div className="flex items-center justify-center h-full text-slate-400"><p>Seleziona un'email per leggerla.</p></div>;

    // Email in arrivo
    if (email.uid) {
        return (
            <div>
                <div className="flex flex-wrap gap-2 items-center mb-4 pb-4 border-b">
                    <h2 className="text-xl lg:text-2xl font-bold flex-grow ">{email.subject}</h2>
                    <button onClick={() => onAction('reply')} className="px-3 py-1.5 rounded-md border bg-white hover:bg-slate-50 text-sm">Rispondi</button>
                    <button onClick={() => onAction('replyAll')} className="px-3 py-1.5 rounded-md border bg-white hover:bg-slate-50 text-sm">Rispondi a tutti</button>
                    <button onClick={() => onAction('forward')} className="px-3 py-1.5 rounded-md border bg-white hover:bg-slate-50 text-sm">Inoltra</button>
                </div>
                <p className="mb-4 text-slate-600"><strong>Da:</strong> {email.from}</p>
                {email.attachments && email.attachments.length > 0 && (
                    <div className="mb-4 p-3 bg-slate-50 rounded-md border">
                        <h4 className="font-semibold mb-2 text-sm">Allegati:</h4>
                        {email.attachments.map(att => (
                            <a key={att.filename} href={`${api.defaults.baseURL}/mail/emails/${email.uid}/attachments/${encodeURIComponent(att.filename)}?accountId=${accountId}`} target="_blank" rel="noopener noreferrer" className="block text-blue-600 underline text-sm mb-1">
                                {att.filename} ({Math.round(att.size / 1024)} KB)
                            </a>
                        ))}
                    </div>
                )}
                <div className="text-base leading-relaxed prose max-w-none" dangerouslySetInnerHTML={{ __html: email.body }}></div>
            </div>
        );
    }

    // Email inviata
    return (
        <div>
            <h2 className="text-xl lg:text-2xl font-bold mb-4 pb-4 border-b">{email.oggetto}</h2>
            {/* ... resto della logica per email inviata ... */}
            <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold mb-2">Corpo del Messaggio Inviato:</h4>
                <div className="text-base leading-relaxed prose max-w-none p-4 border rounded-md bg-slate-50" dangerouslySetInnerHTML={{ __html: email.corpo }}></div>
            </div>
        </div>
    );
}


// --- Componente Principale del Modulo Posta ---
function MailModule() {
    const { user } = useAuth();
    const [accounts, setAccounts] = useState([]);
    const [selectedAccountId, setSelectedAccountId] = useState('');
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [view, setView] = useState('inbox'); // inbox, sent, settings
    const [contentView, setContentView] = useState('list'); // list, reading, composing
    const [replyType, setReplyType] = useState('reply');
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0); // Stato per forzare il refresh della lista

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const { data } = await api.get('/mail/my-mail-accounts');
                if (data.success && data.data.length > 0) {
                    setAccounts(data.data);
                    setSelectedAccountId(data.data[0].id);
                }
            } catch (error) { console.error("Errore nel caricare gli account:", error); }
        };
        fetchAccounts();
    }, []);

    const handleEmailSelect = async (uid) => {
        if (!selectedAccountId) return;
        setLoadingDetail(true);
        setContentView('reading');
        try {
            const { data } = await api.get(`/mail/emails/${uid}?accountId=${selectedAccountId}`);
            if (data.success) {
                setSelectedEmail(data.email);
            }
        } catch (error) {
            console.error("Errore nel caricare il dettaglio email:", error);
            setContentView('list');
        } finally {
            setLoadingDetail(false);
        }
    };
    
    const handleAction = (type) => {
        setReplyType(type);
        setContentView('composing');
    };

    const renderMainContent = () => {
        if (view === 'settings') return <SettingsView />;
        
        if (contentView === 'composing') {
            return <ComposeView 
                accountId={selectedAccountId}
                emailToReply={selectedEmail} 
                replyType={replyType}
                onCancel={() => setContentView(selectedEmail ? 'reading' : 'list')}
                onSent={() => { setView('sent'); setContentView('list'); setSelectedEmail(null); }}
            />;
        }

        if (contentView === 'reading') {
            return <ReadingPane email={selectedEmail} accountId={selectedAccountId} onAction={handleAction} />;
        }
        
        // Se siamo in 'list' ma non in 'inbox', non mostriamo nulla (gestito da SentView)
        if (view !== 'inbox') return null;

        return <div className="flex items-center justify-center h-full text-slate-400"><p>Seleziona un'email per leggerla.</p></div>;
    };

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
                            <option>Nessun account configurato</option>
                        )}
                    </select>
                    
                    <button onClick={() => { setSelectedEmail(null); setReplyType(''); setContentView('composing'); }} className="w-full p-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors mb-4 disabled:bg-blue-300" disabled={!selectedAccountId}>
                        + Componi
                    </button>
                    <div className="flex gap-2">
                        <button onClick={() => { setView('inbox'); setContentView('list'); setSelectedEmail(null); }} className={`flex-1 p-2 rounded-md border text-sm ${view === 'inbox' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'}`}>Posta in Arrivo</button>
                        <button onClick={() => { setView('sent'); setContentView('list'); setSelectedEmail(null); }} className={`flex-1 p-2 rounded-md border text-sm ${view === 'sent' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'}`}>Posta Inviata</button>
                        <button onClick={() => setView('settings')} className={`flex-1 p-2 rounded-md border text-sm ${view === 'settings' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100'}`}>Impostazioni</button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {view === 'inbox' && <InboxList accountId={selectedAccountId} onEmailSelect={handleEmailSelect} userLevel={user.livello} refreshList={refreshTrigger} />}
                    {view === 'sent' && <SentView onEmailSelect={(email) => { setSelectedEmail(email); setContentView('reading'); }} />}
                </div>
            </div>

            <div className="flex-1 p-6 lg:p-8 overflow-y-auto bg-white">
                {loadingDetail ? <p className="text-center p-4 text-slate-500">Caricamento email...</p> : renderMainContent()}
            </div>
        </div>
    );
}

export default MailModule;
