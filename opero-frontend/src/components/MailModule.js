/**
 * ======================================================================
 * File: src/components/MailModule.js (v11.0 - COMPLETO E CORRETTO)
 * ======================================================================
 * @description
 * Modulo per la gestione della posta elettronica.
 * - Supporta la composizione, lettura, invio e gestione delle email.
 * - Integrato con QuickComposeContext per permettere la composizione rapida
 *   di email da altri moduli (es. condivisione PDF).
 * - Responsive design per desktop e mobile.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useQuickCompose } from '../context/QuickComposeContext';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import AddressBook from './AddressBook';
import { 
    Bars3Icon, 
    XMarkIcon, 
    ChevronLeftIcon,
    PaperClipIcon,
    EyeIcon,
    TrashIcon
} from '@heroicons/react/24/outline';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

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
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
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
                                    <p className="font-semibold text-sm">{user.nome} {user.cognome}</p>
                                    <p className="text-xs text-slate-500">{user.email}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className="flex justify-end gap-2 md:gap-4 pt-4 mt-4 border-t">
                    <button type="button" onClick={onCancel} className="px-3 md:px-4 py-2 bg-gray-200 rounded-md text-sm">Annulla</button>
                    <button type="button" onClick={handleConfirmSelection} className="px-3 md:px-4 py-2 bg-blue-600 text-white rounded-md text-sm">Aggiungi</button>
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
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-bold mb-4">Gestisci Contatto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                        name="nome" 
                        value={`${formData.nome} ${formData.cognome}`} 
                        disabled 
                        className="w-full p-2 border rounded-md bg-slate-100 text-sm" 
                    />
                    <input 
                        name="mail_contatto" 
                        value={formData.mail_contatto} 
                        onChange={handleChange} 
                        placeholder="Email Contatto" 
                        className="w-full p-2 border rounded-md text-sm" 
                    />
                    <input 
                        name="mail_collaboratore" 
                        value={formData.mail_collaboratore} 
                        onChange={handleChange} 
                        placeholder="Email Collaboratore" 
                        className="w-full p-2 border rounded-md text-sm" 
                    />
                    <input 
                        name="mail_pec" 
                        value={formData.mail_pec} 
                        onChange={handleChange} 
                        placeholder="PEC" 
                        className="w-full p-2 border rounded-md text-sm" 
                    />
                    <input 
                        name="telefono" 
                        value={formData.telefono} 
                        onChange={handleChange} 
                        placeholder="Telefono" 
                        className="w-full p-2 border rounded-md text-sm" 
                    />
                    <input 
                        name="citta" 
                        value={formData.citta} 
                        onChange={handleChange} 
                        placeholder="Città" 
                        className="w-full p-2 border rounded-md text-sm" 
                    />
                </div>
                <h4 className="font-semibold mt-4 mb-2 text-sm">Liste di Distribuzione</h4>
                <div className="border rounded-md p-2 h-40 overflow-y-auto">
                    {allLists.map(list => (
                        <div key={list.id} className="flex items-center text-sm">
                            <input 
                                type="checkbox" 
                                checked={selectedLists.has(list.id)} 
                                onChange={() => handleListToggle(list.id)} 
                            />
                            <span className="ml-2">{list.nome_lista}</span>
                        </div>
                    ))}
                </div>
                <div className="flex justify-end gap-2 md:gap-4 pt-4 mt-4 border-t">
                    <button type="button" onClick={onCancel} className="px-3 md:px-4 py-2 bg-gray-200 rounded-md text-sm">Annulla</button>
                    <button type="button" onClick={handleSubmit} className="px-3 md:px-4 py-2 bg-blue-600 text-white rounded-md text-sm">Salva</button>
                </div>
            </div>
        </div>
    );
};

// --- Componente: Composizione Email ---
const ComposeView = ({ 
    accountId, 
    emailToReply, 
    replyType, 
    onCancel, 
    onSent,
    initialComposeData, 
    onResetQuickCompose 
}) => {
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
        if (initialComposeData) {
            setSubject(initialComposeData.subject || '');
            setBody(initialComposeData.body || '');
            
            if (Capacitor.isNativePlatform() && initialComposeData.attachments) {
                const processAttachments = async () => {
                    const newAttachments = [];
                    for (const att of initialComposeData.attachments) {
                        try {
                            const fileName = att.uri.split('/').pop();
                            const file = await Filesystem.readFile({
                                path: fileName,
                                directory: Directory.Cache,
                            });
                            
                            const base64Response = await fetch(`data:${att.type};base64,${file.data}`);
                            const blob = await base64Response.blob();
                            const fileObject = new File([blob], att.name, { type: att.type });
                            newAttachments.push(fileObject);
                        } catch (error) {
                            console.error("Errore nella lettura dell'allegato dall'URI:", error);
                        }
                    }
                    setAttachments(prev => [...prev, ...newAttachments]);
                };
                processAttachments();
            }
        }
    }, [initialComposeData]);

    useEffect(() => {
        let initialBody = `<br/><br/><hr><p>${(user?.firma || '').replace(/\n/g, '<br/>')}</p>`;
        if (emailToReply) {
            // Logica per risposta/inoltro
        }
        if (!initialComposeData?.body) {
            setBody(initialBody);
        }
    }, [emailToReply, replyType, user, initialComposeData]);
    
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
        setIsAddressBookOpen(false);
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
            setIsAddressBookOpen(false);
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
            
            if (initialComposeData && onResetQuickCompose) {
                onResetQuickCompose();
            }

            if (onSent) onSent();
        } catch (error) {
            console.error("Errore durante l'invio dell'email:", error);
            alert('Errore durante l\'invio dell\'email.');
        } finally {
            setIsSending(false);
        }
    };

    const handleCancelClick = () => {
        if (initialComposeData && onResetQuickCompose) {
            onResetQuickCompose();
        }
        onCancel();
    };

    return (
        <div className="p-4 md:p-6">
            {isAddressBookOpen && (
                <AddressBook 
                    isModal={true}
                    onClose={() => setIsAddressBookOpen(false)} 
                    onSelectContact={handleSelectContact}
                    onSelectList={handleSelectList}
                />
            )}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
                <h2 className="text-lg md:text-xl font-bold">Componi Email</h2>
                <button onClick={() => setShowCcBcc(!showCcBcc)} className="text-sm text-blue-600 self-start md:self-auto">
                    {showCcBcc ? 'Nascondi CC/CCN' : 'Mostra CC/CCN'} 
                </button>
            </div>
            <div className="space-y-3 md:space-y-4">
                <div className="flex items-center">
                    <label className="pr-2 text-slate-600 text-sm min-w-[30px]">A:</label>
                    <input type="text" value={to} onChange={e => setTo(e.target.value)} className="w-full p-2 border rounded-l-md text-sm" />
                    <button onClick={() => openAddressBook('to')} className="p-2 border-t border-b border-r rounded-r-md bg-slate-100" title="Apri Rubrica">👤</button>
                </div>
                {showCcBcc && (
                    <>
                        <div className="flex items-center">
                            <label className="pr-2 text-slate-600 text-sm min-w-[30px]">CC:</label>
                            <input type="text" value={cc} onChange={e => setCc(e.target.value)} className="w-full p-2 border rounded-l-md text-sm" />
                            <button onClick={() => openAddressBook('cc')} className="p-2 border-t border-b border-r rounded-r-md bg-slate-100" title="Apri Rubrica">👤</button>
                        </div>
                        <div className="flex items-center">
                            <label className="pr-2 text-slate-600 text-sm min-w-[30px]">CCN:</label>
                            <input type="text" value={bcc} onChange={e => setBcc(e.target.value)} className="w-full p-2 border rounded-l-md text-sm" />
                            <button onClick={() => openAddressBook('bcc')} className="p-2 border-t border-b border-r rounded-r-md bg-slate-100" title="Apri Rubrica">👤</button>
                        </div>
                    </>
                )}
                <input type="text" placeholder="Oggetto:" value={subject} onChange={e => setSubject(e.target.value)} className="w-full p-2 border rounded-md text-sm" />
                <div className="h-48 md:h-64">
                    <ReactQuill theme="snow" value={body} onChange={setBody} style={{ height: '150px', marginBottom: '50px' }} />
                </div>
                <input type="file" multiple onChange={e => setAttachments([...e.target.files])} className="block w-full text-sm" />
            </div>
            <div className="flex justify-end gap-2 md:gap-4 mt-4">
                <button onClick={handleCancelClick} className="px-3 md:px-4 py-2 bg-gray-200 rounded-md text-sm">Annulla</button>
                <button onClick={handleSend} disabled={isSending} className="px-3 md:px-4 py-2 bg-blue-600 text-white rounded-md text-sm">{isSending ? 'Invio...' : 'Invia'}</button>
            </div>
        </div>
    );
};

// --- Componente: Gestione della Posta ---
const MailClientView = ({ 
    quickComposeTrigger, 
    onResetQuickCompose 
}) => {
    const { user } = useAuth();
    const [accounts, setAccounts] = useState([]);
    const [selectedAccountId, setSelectedAccountId] = useState('');
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [view, setView] = useState('inbox');
    const [contentView, setContentView] = useState('list');
    const [replyType, setReplyType] = useState('reply');
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [showMobileList, setShowMobileList] = useState(true);

    const fetchAccounts = useCallback(async () => {
        try {
            const { data } = await api.get('/mail/my-mail-accounts');
            if (data.success && data.data.length > 0) {
                setAccounts(data.data);
                if (!selectedAccountId) {
                    setSelectedAccountId(data.data[0].id);
                }
            }
        } catch (error) { 
            console.error("Errore nel caricare gli account:", error); 
        }
    }, [selectedAccountId]);

    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    useEffect(() => {
        if (quickComposeTrigger) {
            console.log('MailClientView: Ricevuto trigger di composizione rapida.', quickComposeTrigger);
            setContentView('composing');
            setSelectedEmail(null);
            setShowMobileList(false);
        }
    }, [quickComposeTrigger]);
    
    const handleEmailSelect = async (uidOrEmailObject) => {
        setShowMobileList(false);
        
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
            setShowMobileList(true);
        } finally {
            setLoadingDetail(false);
        }
    };
    
    const handleAction = (type) => {
        setReplyType(type);
        setContentView('composing');
    };

    const handleBackToList = () => {
        setShowMobileList(true);
        setContentView('list');
        setSelectedEmail(null);
    };
    
    const renderMainContent = () => {
        if (contentView === 'composing') {
            return <ComposeView 
                accountId={selectedAccountId}
                emailToReply={selectedEmail} 
                replyType={replyType}
                onCancel={() => { 
                    setContentView(selectedEmail ? 'reading' : 'list'); 
                    if (!selectedEmail) setShowMobileList(true);
                }}
                onSent={() => { 
                    setView('sent'); 
                    setContentView('list'); 
                    setSelectedEmail(null); 
                    setShowMobileList(true);
                }}
                initialComposeData={quickComposeTrigger}
                onResetQuickCompose={onResetQuickCompose}
            />;
        }
        
        if (contentView === 'reading') {
            return <ReadingPane email={selectedEmail} accountId={selectedAccountId} onAction={handleAction} onBack={handleBackToList} />;
        }
        
        return <div className="flex items-center justify-center h-full text-slate-400 p-4"><p className="text-center">Seleziona un'email per leggerla.</p></div>;
    };
    
    return (
        <div className="flex w-full h-full">
            <div className={`${showMobileList ? 'block' : 'hidden'} md:block w-full md:w-1/3 lg:w-[400px] border-r border-slate-200 flex flex-col bg-white`}>
                <div className="p-3 md:p-4 border-b">
                    <select 
                        value={selectedAccountId} 
                        onChange={(e) => { 
                            setSelectedAccountId(e.target.value); 
                            setSelectedEmail(null); 
                            setContentView('list'); 
                            setView('inbox');
                            setShowMobileList(true);
                        }} 
                        className="w-full p-2 border rounded-md mb-3 md:mb-4 text-sm" 
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
                            setShowMobileList(false);
                        }} 
                        className="w-full p-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 mb-3 md:mb-4 text-sm" 
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
                                setShowMobileList(true);
                            }} 
                            className={`flex-1 p-2 rounded-md border text-xs md:text-sm ${view === 'inbox' ? 'bg-blue-100 text-blue-700' : ''}`}
                        >
                            In Arrivo
                        </button>
                        <button 
                            onClick={() => { 
                                setView('sent'); 
                                setContentView('list'); 
                                setSelectedEmail(null);
                                setShowMobileList(true);
                            }} 
                            className={`flex-1 p-2 rounded-md border text-xs md:text-sm ${view === 'sent' ? 'bg-blue-100 text-blue-700' : ''}`}
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

            <div className={`${!showMobileList ? 'block' : 'hidden'} md:block flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto`}>
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
    
    if (loading) return <p className="p-4 text-center text-sm">Caricamento...</p>;
    if (sentEmails.length === 0) return <p className="p-4 text-center text-sm">Nessuna email inviata.</p>;
    
    return sentEmails.map(email => (
        <div 
            key={email.id} 
            className="p-3 md:p-4 border-b cursor-pointer hover:bg-slate-50 flex justify-between items-center" 
            onClick={() => onEmailSelect(email)}
        >
            <div className="min-w-0 flex-1">
                <p className="font-semibold truncate text-sm">{email.destinatari}</p>
                <p className="text-xs md:text-sm text-slate-600 truncate">{email.oggetto}</p>
                <p className="text-xs text-slate-400 mt-1">Inviata il: {new Date(email.data_invio).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                {email.attachments && email.attachments.length > 0 && (
                    <PaperClipIcon className="h-4 w-4 text-slate-400" title="Contiene allegati" />
                )}
                <EyeIcon className={`h-4 w-4 md:h-5 md:w-5 ${email.aperta ? 'text-green-500' : 'text-slate-400'}`} title={email.aperta ? 'Letta' : 'Non letta'} />
            </div>
        </div>
    ));
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
    
    if (loading) return <p className="text-center p-4 text-slate-500 text-sm">Caricamento...</p>;
    if (emails.length === 0) return <p className="text-center p-4 text-slate-500 text-sm">Nessuna email nella casella di posta.</p>;
    
    return emails.map(email => (
        <div 
            key={email.uid} 
            className={`flex items-center border-b border-slate-200 cursor-pointer bg-white hover:bg-slate-50`} 
            onClick={() => onEmailSelect(email.uid)}
        >
            <div className={`flex-grow p-3 md:p-4 min-w-0 ${!email.read && 'font-semibold'}`}>
                <p className="truncate text-slate-800 text-sm">{email.from}</p>
                <p className={`truncate text-xs md:text-sm ${email.read ? 'text-slate-500' : 'text-slate-700'}`}>{email.subject}</p>
            </div>
            <div className="flex items-center pr-2 gap-1">
                <button 
                    onClick={(e) => handleAction(e, handleHideEmail, email.uid)} 
                    className="p-1.5 md:p-2 text-slate-400 hover:text-slate-600 rounded-full" 
                    title="Nascondi email (solo per te)"
                >
                    <TrashIcon className="h-4 w-4 md:h-5 md:w-5" />
                </button>
                {userLevel > 90 && (
                    <button 
                        onClick={(e) => handleAction(e, handlePermanentDelete, email.uid)} 
                        className="p-1.5 md:p-2 text-red-500 hover:text-red-700 rounded-full" 
                        title="Elimina PERMANENTEMENTE dal server"
                    >
                        <TrashIcon className="h-4 w-4 md:h-5 md:w-5" />
                    </button>
                )}
            </div>
        </div>
    ));
}

// --- Componente per Visualizzazione Tracking Multi-Apertura ---
const EmailTrackingVisualization = ({ trackingId, emailAddress }) => {
    const [trackingData, setTrackingData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        if (trackingId) {
            fetchTrackingData();
        }
    }, [trackingId]);

    const fetchTrackingData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/api/track/email/tracking-details/${trackingId}`);
            if (response.data && response.data.data) {
                setTrackingData(response.data.data);
            }
        } catch (err) {
            setError('Impossibile caricare i dati di tracking');
            console.error('Errore tracking:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-700 text-sm">📊 Caricamento dati tracking...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-red-700 text-sm">⚠️ {error}</p>
            </div>
        );
    }

    if (!trackingData) {
        return (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-600 text-sm">📧 Nessun dato di tracking disponibile</p>
            </div>
        );
    }

    const { statistics, opens, email } = trackingData;

    return (
        <div className="space-y-4">
            {/* Riepilogo Tracking */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-blue-900">📊 Statistiche Tracking</h4>
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                        {showDetails ? 'Nascondi dettagli' : 'Mostra dettagli'}
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center p-2 bg-white rounded border">
                        <div className="text-xl font-bold text-blue-600">{statistics.total_opens}</div>
                        <div className="text-xs text-gray-600">Aperture Totali</div>
                    </div>
                    <div className="text-center p-2 bg-white rounded border">
                        <div className="text-xl font-bold text-green-600">{statistics.unique_ips}</div>
                        <div className="text-xs text-gray-600">IP Unici</div>
                    </div>
                    <div className="text-center p-2 bg-white rounded border">
                        <div className="text-xl font-bold text-purple-600">{opens.length}</div>
                        <div className="text-xs text-gray-600">Record Dettagliati</div>
                    </div>
                    <div className="text-center p-2 bg-white rounded border">
                        <div className="text-sm font-bold text-orange-600">{statistics.duration || 'N/A'}</div>
                        <div className="text-xs text-gray-600">Durata Totale</div>
                    </div>
                </div>

                {/* Prima e Ultima Apertura */}
                {statistics.first_open && statistics.last_open && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                            <div>
                                <span className="font-semibold text-gray-700">Prima apertura:</span>
                                <span className="ml-2 text-blue-700">
                                    {new Date(statistics.first_open).toLocaleString('it-IT')}
                                </span>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-700">Ultima apertura:</span>
                                <span className="ml-2 text-green-700">
                                    {new Date(statistics.last_open).toLocaleString('it-IT')}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Dettagli Aperture */}
            {showDetails && opens.length > 0 && (
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <h4 className="font-bold text-gray-900 mb-3">🔍 Dettaglio Aperture</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {opens.map((open, index) => (
                            <div
                                key={index}
                                className={`flex items-center p-3 rounded-lg border ${
                                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                                }`}
                            >
                                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                                    {open.open_count}
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-sm text-gray-900">
                                        Apertura #{open.open_count}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                        {new Date(open.opened_at).toLocaleString('it-IT')}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        IP: {open.ip_address || 'Sconosciuto'}
                                    </div>
                                </div>
                                <div className="text-green-500">
                                    <EyeIcon className="h-5 w-5" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Componente per il Pannello di Lettura ---
function ReadingPane({ email, accountId, onAction, onBack }) {
    if (!email) return <div className="flex items-center justify-center h-full text-slate-400 p-4"><p className="text-center">Seleziona un'email per leggerla.</p></div>;

    if (email.uid) { // Email in arrivo
        return (
            <div>
                <button
                    onClick={onBack}
                    className="md:hidden flex items-center text-blue-600 mb-4 text-sm"
                >
                    <ChevronLeftIcon className="h-5 w-5 mr-1" />
                    Torna alla lista
                </button>

                <div className="flex flex-col md:flex-row md:flex-wrap gap-2 md:items-center mb-4 pb-4 border-b">
                    <h2 className="text-lg md:text-xl lg:text-2xl font-bold flex-grow">{email.subject}</h2>
                    <button onClick={() => onAction('reply')} className="px-3 py-1.5 rounded-md border bg-white hover:bg-slate-50 text-sm self-start md:self-auto">Rispondi</button>
                </div>
                <p className="mb-4 text-slate-600 text-sm md:text-base"><strong>Da:</strong> {email.from}</p>
                <div className="text-sm md:text-base leading-relaxed prose max-w-none" dangerouslySetInnerHTML={{ __html: email.body }}></div>
            </div>
        );
    }

    // Email inviata (con Tracking Multi-Apertura)
    return (
        <div>
            <button
                onClick={onBack}
                className="md:hidden flex items-center text-blue-600 mb-4 text-sm"
            >
                <ChevronLeftIcon className="h-5 w-5 mr-1" />
                Torna alla lista
            </button>

            <h2 className="text-lg md:text-xl lg:text-2xl font-bold mb-4 pb-4 border-b">{email.oggetto}</h2>

            {/* Riepilogo Invio Base */}
            <div className="mb-4 p-3 md:p-4 bg-slate-50 rounded-lg border text-xs md:text-sm space-y-2">
                <h3 className="font-bold text-slate-700">📧 Riepilogo Invio</h3>
                <p><strong>Destinatari:</strong> {email.destinatari}</p>
                <p><strong>Data Invio:</strong> {new Date(email.data_invio).toLocaleString('it-IT')}</p>
                <p><strong>Stato:</strong> {email.aperta ?
                    <span className="font-semibold text-green-600">✅ Letta il {new Date(email.data_prima_apertura).toLocaleString()}</span> :
                    <span className="font-semibold text-slate-500">❌ Non ancora letta</span>}
                </p>
                {email.open_count && email.open_count > 1 && (
                    <p className="font-semibold text-blue-600">
                        📊 Email aperta {email.open_count} volte
                    </p>
                )}
                {email.attachments && email.attachments.length > 0 && (
                    <div>
                        <p className="font-semibold">📎 Allegati:</p>
                        <ul className="list-disc list-inside ml-4">
                            {email.attachments.map(att => (
                                <li key={att.nome_file_originale} className="text-xs md:text-sm">
                                    {att.nome_file_originale} - {att.scaricato ?
                                        <span className="font-semibold text-green-600">✅ Scaricato</span> :
                                        <span className="text-slate-500">❌ Non scaricato</span>}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Visualizzazione Tracking Multi-Apertura */}
            {email.tracking_id && (
                <div className="mb-4">
                    <EmailTrackingVisualization
                        trackingId={email.tracking_id}
                        emailAddress={email.destinatari}
                    />
                </div>
            )}

            {/* Corpo del Messaggio */}
            <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold mb-2 text-sm md:text-base">📝 Corpo del Messaggio Inviato:</h4>
                <div className="text-sm md:text-base leading-relaxed prose max-w-none p-3 md:p-4 border rounded-md bg-white" dangerouslySetInnerHTML={{ __html: email.corpo }}></div>
            </div>
        </div>
    );
}

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
        <div className="p-4 md:p-6">
            {isModalOpen && <ContactEditModal user={selectedUser} onSave={handleCloseModal} onCancel={handleCloseModal} />}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
                <h2 className="text-lg md:text-xl font-bold">Rubrica</h2>
                {canManage && (
                    <button className="px-3 md:px-4 py-2 bg-blue-600 text-white rounded-md text-sm self-start md:self-auto">+ Aggiungi Contatto</button>
                )}
            </div>
            {loading ? (
                <p>Caricamento...</p>
            ) : (
                <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="p-2 md:p-3 text-left text-xs md:text-sm font-semibold">Nome</th>
                                <th className="p-2 md:p-3 text-left text-xs md:text-sm font-semibold">Email Contatto</th>
                                {canManage && <th className="p-2 md:p-3 text-center text-xs md:text-sm font-semibold">Azioni</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="border-b hover:bg-slate-50">
                                    <td className="p-2 md:p-3 text-xs md:text-sm">{user.nome} {user.cognome}</td>
                                    <td className="p-2 md:p-3 text-xs md:text-sm">{user.mail_contatto || user.email}</td>
                                    {canManage && (
                                        <td className="p-2 md:p-3 text-center">
                                            <button 
                                                onClick={() => handleOpenModal(user)} 
                                                className="text-blue-600 hover:underline text-xs md:text-sm"
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
        <div className="p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold">Impostazioni Posta</h2>
            <div className="mt-6">
                <h3 className="font-semibold text-sm md:text-base">La tua Firma</h3>
                <p className="text-xs md:text-sm text-slate-500 mb-2">Questa firma verrà aggiunta automaticamente a tutte le nuove email che componi.</p>
                <textarea 
                    value={firma} 
                    onChange={e => setFirma(e.target.value)}
                    rows="4"
                    className="w-full p-2 border rounded-md text-sm"
                ></textarea>
                <button onClick={handleSaveSignature} className="mt-2 px-3 md:px-4 py-2 bg-blue-600 text-white rounded-md text-sm">Salva Firma</button>
            </div>
        </div>
    );
};

// =====================================================================
// ============ COMPONENTE PRINCIPALE DEL MODULO =======================
// =====================================================================
function MailModule() {
    const [activeView, setActiveView] = useState('posta');
    const { hasPermission } = useAuth();
    const { isQuickComposing, composeData, resetQuickCompose } = useQuickCompose();

    useEffect(() => {
        if (isQuickComposing && composeData) {
            console.log('MailModule: Ricevuto trigger di composizione rapida. Attivazione vista posta.');
            setActiveView('posta');
        }
    }, [isQuickComposing, composeData, setActiveView]);

    const renderContent = () => {
        switch (activeView) {
            case 'posta':
                return <MailClientView 
                    quickComposeTrigger={isQuickComposing ? composeData : null}
                    onResetQuickCompose={resetQuickCompose}
                />;
            case 'rubrica':
                return hasPermission('RUBRICA_VIEW') 
                    ? <AddressBook /> 
                    : <p className="p-4 md:p-6">Non hai i permessi per visualizzare la rubrica.</p>;
            default:
                return <p>Seleziona una funzione</p>;
        }
    };
    
    return (
        <div className="flex flex-col lg:flex-row w-full h-full bg-slate-50">
            <div className="lg:hidden bg-white border-b border-slate-200">
                <div className="flex">
                    <button
                        onClick={() => setActiveView('posta')}
                        className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                            activeView === 'posta' 
                                ? 'border-blue-600 text-blue-600 bg-blue-50' 
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        📧 Posta
                    </button>
                    {hasPermission('RUBRICA_VIEW') && (
                        <button
                            onClick={() => setActiveView('rubrica')}
                            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                                activeView === 'rubrica' 
                                    ? 'border-blue-600 text-blue-600 bg-blue-50' 
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            📖 Rubrica
                        </button>
                    )}
                </div>
            </div>

            <aside className="hidden lg:block w-56 border-r border-slate-200 p-4 bg-white">
                <h2 className="font-bold mb-4 text-slate-700">Menu Posta</h2>
                <ul className="space-y-2">
                    <li>
                        <button 
                            onClick={() => setActiveView('posta')} 
                            className={`w-full text-left p-2 rounded-md text-sm ${activeView === 'posta' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-50'}`}
                        >
                            Gestisci Posta
                        </button>
                    </li>
                    {hasPermission('RUBRICA_VIEW') && (
                        <li>
                            <button 
                                onClick={() => setActiveView('rubrica')} 
                                className={`w-full text-left p-2 rounded-md text-sm ${activeView === 'rubrica' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-50'}`}
                            >
                                Rubrica
                            </button>
                        </li>
                    )}
                </ul>
            </aside>

            <main className="flex-1 overflow-y-auto">
                {renderContent()}
            </main>
        </div>
    );
}

export default MailModule;