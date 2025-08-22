// #####################################################################
// # Modulo Posta - v9.3 (con Gestione Rubrica Avanzata)
// # File: opero-frontend/src/components/MailModule.js
// #####################################################################

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import AddressBook from './AddressBook'; // Sostituisce il vecchio selettore

// =====================================================================
// =================== COMPONENTI SECONDARI ============================
// =====================================================================

// --- Componente: Modale di Selezione dalla Rubrica ---
const AddressBookSelectorModal = ({ onSelect, onCancel }) => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmails, setSelectedEmails] = useState(new Set());
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await api.get('/amministrazione/utenti');
                if (data.success) setUsers(data.data);
            } catch (error) {
                console.error("Errore nel caricamento della rubrica:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);
    
    const filteredUsers = useMemo(() => users.filter(user =>
        `${user.nome} ${user.cognome}`.toLowerCase().includes(searchTerm.toLowerCase())
    ), [users, searchTerm]);
    
    const handleToggleSelection = (email) => {
        const newSelection = new Set(selectedEmails);
        if (newSelection.has(email)) newSelection.delete(email);
        else newSelection.add(email);
        setSelectedEmails(newSelection);
    };
    
    const handleConfirmSelection = () => onSelect(Array.from(selectedEmails));
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
                <h3 className="text-lg font-bold mb-4">Seleziona Contatti</h3>
                <input 
                    type="text" 
                    placeholder="Cerca..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    className="w-full p-2 border rounded-md mb-4" 
                />
                <div className="flex-grow overflow-y-auto border rounded-md">
                    {loading ? (
                        <p className="p-4">Caricamento...</p>
                    ) : (
                        filteredUsers.map(user => (
                            <div key={user.id} className="flex items-center p-3 border-b last:border-b-0">
                                <input 
                                    type="checkbox" 
                                    checked={selectedEmails.has(user.email)} 
                                    onChange={() => handleToggleSelection(user.email)} 
                                    className="h-4 w-4" 
                                />
                                <div className="ml-3">
                                    <p className="font-semibold">{user.nome} {user.cognome}</p>
                                    <p className="text-sm text-slate-500">{user.email}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className="flex justify-end gap-4 pt-4 mt-4 border-t">
                    <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-md">Annulla</button>
                    <button type="button" onClick={handleConfirmSelection} className="px-4 py-2 bg-blue-600 text-white rounded-md">Aggiungi</button>
                </div>
            </div>
        </div>
    );
};

// --- Componente: Modale di Modifica Contatto ---
const ContactEditModal = ({ user, onSave, onCancel }) => {
    const [formData, setFormData] = useState({});
    const [allLists, setAllLists] = useState([]);
    const [selectedLists, setSelectedLists] = useState(new Set());
    
    useEffect(() => {
        setFormData({
            nome: user.nome,
            cognome: user.cognome,
            telefono: user.telefono || '',
            citta: user.citta || '',
            mail_contatto: user.mail_contatto || user.email,
            mail_collaboratore: user.mail_collaboratore || '',
            mail_pec: user.mail_pec || ''
        });
        
        const fetchData = async () => {
            try {
                const [listsRes, userListsRes] = await Promise.all([
                    api.get('/rubrica/liste'),
                    api.get(`/rubrica/contatti/${user.id}/liste`)
                ]);
                
                if (listsRes.data.success) setAllLists(listsRes.data.data);
                if (userListsRes.data.success) setSelectedLists(new Set(userListsRes.data.data));
            } catch (error) {
                console.error("Errore caricamento dati per modifica contatto", error);
            }
        };
        fetchData();
    }, [user]);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleListToggle = (listId) => {
        const newSelection = new Set(selectedLists);
        if (newSelection.has(listId)) newSelection.delete(listId);
        else newSelection.add(listId);
        setSelectedLists(newSelection);
    };
    
    const handleSubmit = async () => {
        try {
            await api.patch(`/rubrica/contatti/${user.id}`, formData);
            await api.post(`/rubrica/contatti/${user.id}/liste`, { listIds: Array.from(selectedLists) });
            onSave();
        } catch (error) {
            alert('Errore durante il salvataggio.');
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl flex flex-col">
                <h3 className="text-lg font-bold mb-4">Gestisci Contatto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                        name="nome" 
                        value={`${formData.nome} ${formData.cognome}`} 
                        disabled 
                        className="w-full p-2 border rounded-md bg-slate-100" 
                    />
                    <input 
                        name="mail_contatto" 
                        value={formData.mail_contatto} 
                        onChange={handleChange} 
                        placeholder="Email Contatto" 
                        className="w-full p-2 border rounded-md" 
                    />
                    <input 
                        name="mail_collaboratore" 
                        value={formData.mail_collaboratore} 
                        onChange={handleChange} 
                        placeholder="Email Collaboratore" 
                        className="w-full p-2 border rounded-md" 
                    />
                    <input 
                        name="mail_pec" 
                        value={formData.mail_pec} 
                        onChange={handleChange} 
                        placeholder="PEC" 
                        className="w-full p-2 border rounded-md" 
                    />
                    <input 
                        name="telefono" 
                        value={formData.telefono} 
                        onChange={handleChange} 
                        placeholder="Telefono" 
                        className="w-full p-2 border rounded-md" 
                    />
                    <input 
                        name="citta" 
                        value={formData.citta} 
                        onChange={handleChange} 
                        placeholder="Città" 
                        className="w-full p-2 border rounded-md" 
                    />
                </div>
                <h4 className="font-semibold mt-4 mb-2">Liste di Distribuzione</h4>
                <div className="border rounded-md p-2 h-40 overflow-y-auto">
                    {allLists.map(list => (
                        <div key={list.id} className="flex items-center">
                            <input 
                                type="checkbox" 
                                checked={selectedLists.has(list.id)} 
                                onChange={() => handleListToggle(list.id)} 
                            />
                            <span className="ml-2">{list.nome_lista}</span>
                        </div>
                    ))}
                </div>
                <div className="flex justify-end gap-4 pt-4 mt-4 border-t">
                    <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-md">Annulla</button>
                    <button type="button" onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-md">Salva</button>
                </div>
            </div>
        </div>
    );
};

// --- Componente: Gestione Rubrica ---
const AddressBookManager = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const { hasPermission } = useAuth();
    const canManage = hasPermission('RUBRICA_MANAGE');
    
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/amministrazione/utenti');
            if (data.success) setUsers(data.data);
        } catch (error) {
            console.error("Errore nel caricamento dati rubrica:", error);
        } finally {
            setLoading(false);
        }
    }, []);
    
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const handleOpenModal = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setSelectedUser(null);
        setIsModalOpen(false);
        fetchData();
    };
    
    return (
        <div className="p-6">
            {isModalOpen && <ContactEditModal user={selectedUser} onSave={handleCloseModal} onCancel={handleCloseModal} />}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Rubrica</h2>
                {canManage && (
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">+ Aggiungi Contatto</button>
                )}
            </div>
            {loading ? (
                <p>Caricamento...</p>
            ) : (
                <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="p-3 text-left text-sm font-semibold">Nome</th>
                                <th className="p-3 text-left text-sm font-semibold">Email Contatto</th>
                                {canManage && <th className="p-3 text-center text-sm font-semibold">Azioni</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="border-b hover:bg-slate-50">
                                    <td className="p-3">{user.nome} {user.cognome}</td>
                                    <td className="p-3">{user.mail_contatto || user.email}</td>
                                    {canManage && (
                                        <td className="p-3 text-center">
                                            <button 
                                                onClick={() => handleOpenModal(user)} 
                                                className="text-blue-600 hover:underline"
                                            >
                                                Gestisci
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// --- Componente: Composizione Email ---
const ComposeView = ({ accountId, emailToReply, replyType, onCancel, onSent }) => {
    const { user } = useAuth();
    const [to, setTo] = useState('');
    const [cc, setCc] = useState('');
    const [bcc, setBcc] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [isSending, setIsSending] = useState(false);
    const [isAddressBookOpen, setIsAddressBookOpen] = useState(false);
    const [addressBookTarget, setAddressBookTarget] = useState('to');
    const [showCcBcc, setShowCcBcc] = useState(false);

    useEffect(() => {
        let initialBody = `<br/><br/><hr><p>${(user?.firma || '').replace(/\n/g, '<br/>')}</p>`;
        if (emailToReply) {
            // Qui andrebbe la logica per preparare il corpo della mail in risposta/inoltro
        }
        setBody(initialBody);
    }, [emailToReply, replyType, user]);

    const openAddressBook = (target) => {
        setAddressBookTarget(target);
        setIsAddressBookOpen(true);
    };

    const handleSelectContact = (contact) => {
        const selectedEmail = contact.email;
        const updateField = (currentValue) => {
            const currentEmails = currentValue.split(';').map(e => e.trim()).filter(Boolean);
            const newEmails = new Set([...currentEmails, selectedEmail]);
            return Array.from(newEmails).join('; ');
        };
        
        if (addressBookTarget === 'to') setTo(updateField(to));
        if (addressBookTarget === 'cc') setCc(updateField(cc));
        if (addressBookTarget === 'bcc') setBcc(updateField(bcc));
        setIsAddressBookOpen(false); // Chiude la modale dopo la selezione
    };

    const handleSelectList = async (list) => {
        try {
            const { data } = await api.get(`/rubrica/liste/${list.id}/emails`);
            if (data && data.length > 0) {
                const updateField = (currentValue) => {
                    const currentEmails = currentValue.split(';').map(e => e.trim()).filter(Boolean);
                    const newEmails = new Set([...currentEmails, ...data]);
                    return Array.from(newEmails).join('; ');
                };
                
                if (addressBookTarget === 'to') setTo(updateField(to));
                if (addressBookTarget === 'cc') setCc(updateField(cc));
                if (addressBookTarget === 'bcc') setBcc(updateField(bcc));
            }
        } catch (error) {
            alert("Impossibile caricare i contatti della lista selezionata.");
        } finally {
            setIsAddressBookOpen(false); // Chiude la modale dopo la selezione
        }
    };

    const handleSend = async () => {
        if (!to && !cc && !bcc) {
            alert("Inserisci almeno un destinatario.");
            return;
        }
        setIsSending(true);
        const formData = new FormData();
        formData.append('accountId', accountId);
        formData.append('to', to);
        formData.append('cc', cc);
        formData.append('bcc', bcc);
        formData.append('subject', subject);
        formData.append('text', body);
        
        for (let i = 0; i < attachments.length; i++) {
            formData.append('attachments', attachments[i]);
        }
        
        try {
            await api.post('/mail/send-email', formData, { 
                headers: { 'Content-Type': 'multipart/form-data' } 
            });
            alert('Email inviata con successo!');
            if (onSent) onSent();
        } catch (error) {
            console.error("Errore durante l'invio dell'email:", error);
            alert('Errore durante l\'invio dell\'email.');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div>
            {isAddressBookOpen && (
                <AddressBook 
                    isModal={true}
                    onClose={() => setIsAddressBookOpen(false)} 
                    onSelectContact={handleSelectContact}
                    onSelectList={handleSelectList}
                />
            )}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Componi Email</h2>
                <button onClick={() => setShowCcBcc(!showCcBcc)} className="text-sm text-blue-600">
                    {showCcBcc ? 'Nascondi CC/CCN' : 'Mostra CC/CCN'} 
                </button>
            </div>
            <div className="space-y-4">
                 <div className="flex items-center">
                    <label className="pr-2 text-slate-600">A:</label>
                    <input type="text" value={to} onChange={e => setTo(e.target.value)} className="w-full p-2 border rounded-l-md" />
                    <button onClick={() => openAddressBook('to')} className="p-2 border-t border-b border-r rounded-r-md bg-slate-100" title="Apri Rubrica">👤</button>
                </div>
                {showCcBcc && (
                    <>
                        <div className="flex items-center">
                            <label className="pr-2 text-slate-600">CC:</label>
                            <input type="text" value={cc} onChange={e => setCc(e.target.value)} className="w-full p-2 border rounded-l-md" />
                            <button onClick={() => openAddressBook('cc')} className="p-2 border-t border-b border-r rounded-r-md bg-slate-100" title="Apri Rubrica">👤</button>
                        </div>
                        <div className="flex items-center">
                            <label className="pr-2 text-slate-600">CCN:</label>
                            <input type="text" value={bcc} onChange={e => setBcc(e.target.value)} className="w-full p-2 border rounded-l-md" />
                            <button onClick={() => openAddressBook('bcc')} className="p-2 border-t border-b border-r rounded-r-md bg-slate-100" title="Apri Rubrica">👤</button>
                        </div>
                    </>
                )}
                <input type="text" placeholder="Oggetto:" value={subject} onChange={e => setSubject(e.target.value)} className="w-full p-2 border rounded-md" />
                <ReactQuill theme="snow" value={body} onChange={setBody} style={{ height: '250px', marginBottom: '50px' }} />
                <input type="file" multiple onChange={e => setAttachments([...e.target.files])} className="block w-full text-sm" />
            </div>
            <div className="flex justify-end gap-4 mt-4">
                <button onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-md">Annulla</button>
                <button onClick={handleSend} disabled={isSending} className="px-4 py-2 bg-blue-600 text-white rounded-md">{isSending ? 'Invio...' : 'Invia'}</button>
            </div>
        </div>
    );
};
// --- Componente: Gestione della Posta (Inviata, In Arrivo, etc.) ---
const MailClientView = () => {
    const { user } = useAuth();
    const [accounts, setAccounts] = useState([]);
    const [selectedAccountId, setSelectedAccountId] = useState('');
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [view, setView] = useState('inbox');
    const [contentView, setContentView] = useState('list');
    const [replyType, setReplyType] = useState('reply');
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    
    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const { data } = await api.get('/mail/my-mail-accounts');
                if (data.success && data.data.length > 0) {
                    setAccounts(data.data);
                    setSelectedAccountId(data.data[0].id);
                }
            } catch (error) { 
                console.error("Errore nel caricare gli account:", error); 
            }
        };
        fetchAccounts();
    }, []);
    
    const handleEmailSelect = async (uidOrEmailObject) => {
        if (typeof uidOrEmailObject === 'object') {
            setSelectedEmail(uidOrEmailObject);
            setContentView('reading');
            return;
        }
        
        if (!selectedAccountId) return;
        setLoadingDetail(true);
        setContentView('reading');
        
        try {
            const { data } = await api.get(`/mail/emails/${uidOrEmailObject}?accountId=${selectedAccountId}`);
            if (data.success) setSelectedEmail(data.email);
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
        if (contentView === 'composing') {
            return <ComposeView 
                accountId={selectedAccountId}
                emailToReply={selectedEmail} 
                replyType={replyType}
                onCancel={() => { setContentView(selectedEmail ? 'reading' : 'list'); }}
                onSent={() => { setView('sent'); setContentView('list'); setSelectedEmail(null); }}
            />;
        }
        
        if (contentView === 'reading') {
            return <ReadingPane email={selectedEmail} accountId={selectedAccountId} onAction={handleAction} />;
        }
        
        return <div className="flex items-center justify-center h-full text-slate-400"><p>Seleziona un'email per leggerla.</p></div>;
    };
    
    return (
        <div className="flex w-full h-full">
            <div className="w-full md:w-1/3 lg:w-[400px] border-r border-slate-200 flex flex-col bg-white">
                <div className="p-4 border-b">
                    <select 
                        value={selectedAccountId} 
                        onChange={(e) => { 
                            setSelectedAccountId(e.target.value); 
                            setSelectedEmail(null); 
                            setContentView('list'); 
                            setView('inbox'); 
                        }} 
                        className="w-full p-2 border rounded-md mb-4" 
                        disabled={accounts.length === 0}
                    >
                        {accounts.length > 0 ? (
                            accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.nome_account}</option>)
                        ) : (
                            <option>Nessun account</option>
                        )}
                    </select>
                    
                    <button 
                        onClick={() => { 
                            setSelectedEmail(null); 
                            setReplyType(''); 
                            setContentView('composing'); 
                        }} 
                        className="w-full p-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 mb-4" 
                        disabled={!selectedAccountId}
                    >
                        + Componi
                    </button>
                    
                    <div className="flex gap-2">
                        <button 
                            onClick={() => { 
                                setView('inbox'); 
                                setContentView('list'); 
                                setSelectedEmail(null); 
                            }} 
                            className={`flex-1 p-2 rounded-md border text-sm ${view === 'inbox' ? 'bg-blue-100 text-blue-700' : ''}`}
                        >
                            In Arrivo
                        </button>
                        <button 
                            onClick={() => { 
                                setView('sent'); 
                                setContentView('list'); 
                                setSelectedEmail(null); 
                            }} 
                            className={`flex-1 p-2 rounded-md border text-sm ${view === 'sent' ? 'bg-blue-100 text-blue-700' : ''}`}
                        >
                            Inviata
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {view === 'inbox' && (
                        <InboxList 
                            accountId={selectedAccountId} 
                            onEmailSelect={handleEmailSelect} 
                            userLevel={user.livello} 
                            refreshList={refreshTrigger} 
                        />
                    )}
                    {view === 'sent' && (
                        <SentView onEmailSelect={handleEmailSelect} />
                    )}
                </div>
            </div>
            <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
                {loadingDetail ? <p>Caricamento...</p> : renderMainContent()}
            </div>
        </div>
    );
};

// --- Componente per la Posta Inviata ---
const SentView = ({ onEmailSelect }) => {
    const [sentEmails, setSentEmails] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchSentEmails = async () => {
            try {
                const { data } = await api.get('/mail/sent-emails');
                if (data.success) {
                    setSentEmails(data.sentEmails);
                }
            } catch (error) {
                console.error("Errore nel caricare la posta inviata:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSentEmails();
    }, []);
    
    if (loading) return <p className="p-4 text-center">Caricamento...</p>;
    if (sentEmails.length === 0) return <p className="p-4 text-center">Nessuna email inviata.</p>;
    
    return sentEmails.map(email => (
        <div 
            key={email.id} 
            className="p-4 border-b cursor-pointer hover:bg-slate-50 flex justify-between items-center" 
            onClick={() => onEmailSelect(email)}
        >
            <div className="min-w-0">
                <p className="font-semibold truncate">{email.destinatari}</p>
                <p className="text-sm text-slate-600 truncate">{email.oggetto}</p>
                <p className="text-xs text-slate-400 mt-1">Inviata il: {new Date(email.data_invio).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                {email.attachments && email.attachments.length > 0 && (
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-4 w-4 text-slate-400" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor" 
                        title="Contiene allegati"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                )}
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-5 w-5 ${email.aperta ? 'text-green-500' : 'text-slate-400'}`} 
                    viewBox="0 0 20 20" 
                    fill="currentColor" 
                    title={email.aperta ? 'Letta' : 'Non letta'}
                >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C3.732 4.943 9.522 3 10 3s6.268 1.943 9.542 7c-3.274 5.057-9.064 7-9.542 7S3.732 15.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
            </div>
        </div>
    ));
};

// --- Componente per le Impostazioni ---
const SettingsView = () => {
    const { user } = useAuth();
    const [firma, setFirma] = useState(user?.firma || '');
    
    const handleSaveSignature = async () => {
        try {
            const { data } = await api.patch('/user/signature', { firma });
            if (data.success) {
                alert('Firma salvata con successo!');
            }
        } catch (error) {
            alert('Errore nel salvataggio della firma.');
        }
    };
    
    return (
        <div>
            <h2 className="text-xl font-bold">Impostazioni Posta</h2>
            <div className="mt-6">
                <h3 className="font-semibold">La tua Firma</h3>
                <p className="text-sm text-slate-500 mb-2">Questa firma verrà aggiunta automaticamente a tutte le nuove email che componi.</p>
                <textarea 
                    value={firma} 
                    onChange={e => setFirma(e.target.value)}
                    rows="4"
                    className="w-full p-2 border rounded-md"
                ></textarea>
                <button onClick={handleSaveSignature} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md">Salva Firma</button>
            </div>
        </div>
    );
};

// --- Componente per la Lista della Posta in Arrivo ---
function InboxList({ accountId, onEmailSelect, userLevel, refreshList }) {
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const fetchEmails = useCallback(async () => {
        if (!accountId) {
            setLoading(false);
            setEmails([]);
            return;
        }
        
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
        e.stopPropagation();
        await actionFn(uid);
        fetchEmails();
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
        if (window.confirm("ATTENZIONE: Stai per eliminare PERMANENTEMENTE questa email dal server. L'azione è irreversibile. Procedere?")) {
            try {
                await api.delete(`/mail/emails/${uid}?accountId=${accountId}`);
            } catch (error) {
                alert(`Errore di connessione: ${error.message}`);
            }
        }
    };
    
    if (loading) return <p className="text-center p-4 text-slate-500">Caricamento...</p>;
    if (emails.length === 0) return <p className="text-center p-4 text-slate-500">Nessuna email nella casella di posta.</p>;
    
    return emails.map(email => (
        <div 
            key={email.uid} 
            className={`flex items-center border-b border-slate-200 cursor-pointer bg-white hover:bg-slate-50`} 
            onClick={() => onEmailSelect(email.uid)}
        >
            <div className={`flex-grow p-4 min-w-0 ${!email.read && 'font-semibold'}`}>
                <p className="truncate text-slate-800">{email.from}</p>
                <p className={`truncate text-sm ${email.read ? 'text-slate-500' : 'text-slate-700'}`}>{email.subject}</p>
            </div>
            <div className="flex items-center pr-2">
                <button 
                    onClick={(e) => handleAction(e, handleHideEmail, email.uid)} 
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-full" 
                    title="Nascondi email (solo per te)"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
                {userLevel > 90 && (
                    <button 
                        onClick={(e) => handleAction(e, handlePermanentDelete, email.uid)} 
                        className="p-2 text-red-500 hover:text-red-700 rounded-full" 
                        title="Elimina PERMANENTEMENTE dal server"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    ));
}

// --- Componente per il Pannello di Lettura ---
function ReadingPane({ email, accountId, onAction }) {
    if (!email) return <div className="flex items-center justify-center h-full text-slate-400"><p>Seleziona un'email per leggerla.</p></div>;
    
    if (email.uid) { // Email in arrivo
        return (
            <div>
                <div className="flex flex-wrap gap-2 items-center mb-4 pb-4 border-b">
                    <h2 className="text-xl lg:text-2xl font-bold flex-grow ">{email.subject}</h2>
                    <button onClick={() => onAction('reply')} className="px-3 py-1.5 rounded-md border bg-white hover:bg-slate-50 text-sm">Rispondi</button>
                </div>
                <p className="mb-4 text-slate-600"><strong>Da:</strong> {email.from}</p>
                <div className="text-base leading-relaxed prose max-w-none" dangerouslySetInnerHTML={{ __html: email.body }}></div>
            </div>
        );
    }
    
    // Email inviata (con Tracking)
    return (
        <div>
            <h2 className="text-xl lg:text-2xl font-bold mb-4 pb-4 border-b">{email.oggetto}</h2>
            <div className="mb-4 p-4 bg-slate-50 rounded-lg border text-sm space-y-2">
                <h3 className="font-bold text-slate-700">Riepilogo Invio</h3>
                <p><strong>Destinatari:</strong> {email.destinatari}</p>
                <p><strong>Stato:</strong> {email.aperta ? 
                    <span className="font-semibold text-green-600">Letta il {new Date(email.data_prima_apertura).toLocaleString()}</span> : 
                    <span className="font-semibold text-slate-500">Non ancora letta</span>}
                </p>
                {email.attachments && email.attachments.length > 0 && (
                    <div>
                        <p className="font-semibold">Allegati:</p>
                        <ul className="list-disc list-inside ml-4">
                            {email.attachments.map(att => (
                                <li key={att.nome_file_originale}>
                                    {att.nome_file_originale} - {att.scaricato ? 
                                        <span className="font-semibold text-green-600">Scaricato</span> : 
                                        <span className="text-slate-500">Non scaricato</span>}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold mb-2">Corpo del Messaggio Inviato:</h4>
                <div className="text-base leading-relaxed prose max-w-none p-4 border rounded-md bg-white" dangerouslySetInnerHTML={{ __html: email.corpo }}></div>
            </div>
        </div>
    );
}


// =====================================================================
// ============ COMPONENTE PRINCIPALE DEL MODULO =======================
// =====================================================================
function MailModule() {
    const [activeView, setActiveView] = useState('posta');
    const { hasPermission } = useAuth();
    
    // Funzione che decide quale componente visualizzare nell'area principale
    const renderContent = () => {
        switch (activeView) {
            case 'posta':
                return <MailClientView />;
            case 'rubrica':
                // Qui usiamo il componente AddressBook completo al posto di quello vecchio
                return hasPermission('RUBRICA_VIEW') 
                    ? <AddressBook /> 
                    : <p className="p-6">Non hai i permessi per visualizzare la rubrica.</p>;
            default:
                return <p>Seleziona una funzione</p>;
        }
    };
    
    return (
        <div className="flex w-full h-full bg-slate-50">
            {/* Menu laterale del modulo */}
            <aside className="w-56 border-r border-slate-200 p-4 bg-white">
                <h2 className="font-bold mb-4 text-slate-700">Menu Posta</h2>
                <ul className="space-y-2">
                    <li>
                        <button 
                            onClick={() => setActiveView('posta')} 
                            className={`w-full text-left p-2 rounded-md text-sm ${activeView === 'posta' ? 'bg-blue-100 text-blue-700' : ''}`}
                        >
                            Gestisci Posta
                        </button>
                    </li>
                    {/* Il pulsante "Rubrica" ora caricherà il componente AddressBook */}
                    {hasPermission('RUBRICA_VIEW') && (
                        <li>
                            <button 
                                onClick={() => setActiveView('rubrica')} 
                                className={`w-full text-left p-2 rounded-md text-sm ${activeView === 'rubrica' ? 'bg-blue-100 text-blue-700' : ''}`}
                            >
                                Rubrica
                            </button>
                        </li>
                    )}
                </ul>
            </aside>

            {/* Area principale dove viene renderizzato il contenuto attivo */}
            <main className="flex-1 overflow-y-auto">
                {renderContent()}
            </main>
        </div>
    );
}

export default MailModule;
