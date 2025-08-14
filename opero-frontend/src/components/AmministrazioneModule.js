// #####################################################################
// # Componente AmministrazioneModule - v6.1 (con Gestione Anagrafiche)
// # File: opero-frontend/src/components/AmministrazioneModule.js
// #####################################################################

import React, { useState, useCallback, useEffect } from 'react';
import ReactQuill from 'react-quill';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';


// =====================================================================
// ============ COMPONENTI PER GESTIONE ANAGRAFICHE ====================
// =====================================================================

// --- Componente Modale per Form di Modifica Anagrafica ---
function AnagraficaEditModal({ anagraficaId, onSave, onCancel, session }) {
    const [formData, setFormData] = useState({});
    const [conti, setConti] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Carica i dati completi dell'anagrafica
    useEffect(() => {
        if (anagraficaId) {
            const fetchAnagrafica = async () => {
                try {
                    const response = await fetch(`${API_URL}/api/amministrazione/anagrafiche/${anagraficaId}`, { 
                        headers: { 'Authorization': `Bearer ${session.token}` } 
                    });
                    const result = await response.json();
                    if (result.success) {
                        setFormData(result.data);
                    } else {
                        alert(`Errore: ${result.message}`);
                        onCancel();
                    }
                } catch (error) {
                    alert('Errore di connessione.');
                    onCancel();
                }
            };
            fetchAnagrafica();
        } else {
            setFormData({ stato: 1, codice_relazione: 'N' });
        }
        setIsLoading(false);
    }, [anagraficaId, session.token, onCancel]);

    // Carica i conti corretti quando cambia la relazione commerciale
    useEffect(() => {
        const relazione = formData.codice_relazione;
        let mastri = '';
        if (relazione === 'C') mastri = '8';
        else if (relazione === 'F') mastri = '28';
        else if (relazione === 'P') mastri = '75';
        
        if (mastri) {
            const fetchConti = async () => {
                try {
                    const response = await fetch(`${API_URL}/api/amministrazione/conti-filtrati?mastri=${mastri}`, {
                        headers: { 'Authorization': `Bearer ${session.token}` }
                    });
                    const result = await response.json();
                    if (result.success) {
                        setConti(result.data);
                    }
                } catch (error) {
                    console.error("Errore fetch conti:", error);
                }
            };
            fetchConti();
        } else {
            setConti([]);
        }
    }, [formData.codice_relazione, session.token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newFormData = { ...formData, [name]: value };
        if (name === 'codice_relazione') {
            newFormData.id_conto_collegato = null;
        }
        setFormData(newFormData);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (isLoading) return <p>Caricamento...</p>;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <h3 className="text-xl font-semibold mb-4 text-slate-800">{anagraficaId ? 'Modifica Anagrafica' : 'Nuova Anagrafica'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-4 flex-grow">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700">Ragione Sociale</label>
                            <input name="ragione_sociale" value={formData.ragione_sociale || ''} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Stato</label>
                            <select name="stato" value={formData.stato == undefined ? '1' : formData.stato} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md">
                                <option value="1">Attivo</option>
                                <option value="0">Non Attivo</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Partita IVA</label>
                            <input name="p_iva" value={formData.p_iva || ''} onChange={handleChange} maxLength="11" className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Codice Fiscale</label>
                            <input name="codice_fiscale" value={formData.codice_fiscale || ''} onChange={handleChange} maxLength="16" className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700">Codice SDI</label>
                            <input name="sdi" value={formData.sdi || ''} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-slate-700">Indirizzo</label>
                            <input name="indirizzo" value={formData.indirizzo || ''} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Città</label>
                            <input name="citta" value={formData.citta || ''} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Provincia</label>
                            <input name="provincia" value={formData.provincia || ''} onChange={handleChange} maxLength="2" className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Telefono 1</label>
                            <input name="tel1" value={formData.tel1 || ''} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Email 1</label>
                            <input name="mail_1" type="email" value={formData.mail_1 || ''} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">PEC</label>
                            <input name="pec" type="email" value={formData.pec || ''} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Relazione Commerciale</label>
                            <select name="codice_relazione" value={formData.codice_relazione || 'N'} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md">
                                <option value="N">Nessuna</option>
                                <option value="C">Cliente</option>
                                <option value="F">Fornitore</option>
                                <option value="P">Punto Vendita</option>
                                <option value="E">Entrambe</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700">Conto Contabile Collegato</label>
                            <select name="id_conto_collegato" value={formData.id_conto_collegato || ''} onChange={handleChange} disabled={conti.length === 0} className="mt-1 block w-full p-2 border rounded-md disabled:bg-slate-100">
                                <option value="">Seleziona un conto...</option>
                                {conti.map(c => (
                                    <option key={c.id} value={c.id}>{c.codice} - {c.descrizione}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-4 border-t mt-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Annulla</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">Salva</button>
                    </div>
                </form>
            </div>
        </div>
    );
}


// =====================================================================
// ============ DEFINIZIONE DEI SOTTO-COMPONENTI =======================
// =====================================================================

// --- Componente Modale per Associare Account Email ---
function AssociateAccountsModal({ user, onSave, onCancel, session }) {
    const [allAccounts, setAllAccounts] = useState([]);
    const [associatedIds, setAssociatedIds] = useState(new Set());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const headers = { 'Authorization': `Bearer ${session.token}` };
                const accountsRes = await fetch(`${API_URL}/api/amministrazione/ditta_mail_accounts`, { headers });
                const accountsData = await accountsRes.json();
                if (accountsData.success) setAllAccounts(accountsData.data);

                const associatedRes = await fetch(`${API_URL}/api/amministrazione/utenti/${user.id}/mail_accounts`, { headers });
                const associatedData = await associatedRes.json();
                if (associatedData.success) setAssociatedIds(new Set(associatedData.data));
            } catch (error) { console.error("Errore nel caricare i dati per l'associazione", error); }
            setIsLoading(false);
        };
        fetchData();
    }, [session.token, user.id]);

    const handleCheckboxChange = (accountId) => {
        setAssociatedIds(prevIds => {
            const newIds = new Set(prevIds);
            if (newIds.has(accountId)) newIds.delete(accountId);
            else newIds.add(accountId);
            return newIds;
        });
    };

    const handleSave = () => onSave(user.id, Array.from(associatedIds));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-xl font-semibold mb-2 text-slate-800">Associa Account Email</h3>
                <p className="text-sm text-slate-600 mb-4">Seleziona gli account a cui l'utente <strong>{user.nome} {user.cognome}</strong> può accedere.</p>
                {isLoading ? <p>Caricamento...</p> : (
                    <div className="space-y-2 max-h-60 overflow-y-auto border p-3 rounded-md">
                        {allAccounts.length > 0 ? allAccounts.map(account => (
                            <label key={account.id} className="flex items-center p-2 rounded hover:bg-slate-50 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    checked={associatedIds.has(account.id)}
                                    onChange={() => handleCheckboxChange(account.id)}
                                />
                                <span className="ml-3 text-sm text-slate-700">{account.nome_account} ({account.email_address})</span>
                            </label>
                        )) : <p className="text-slate-500 text-sm">Nessun account email configurato per questa ditta.</p>}
                    </div>
                )}
                <div className="flex justify-end gap-4 pt-4 mt-4 border-t">
                    <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Annulla</button>
                    <button type="button" onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">Salva Associazioni</button>
                </div>
            </div>
        </div>
    );
}

// --- Componente Modale per Form di Modifica Utente ---
function UserEditModal({ user, onSave, onCancel, session }) {
    const [formData, setFormData] = useState({});
    const [ruoli, setRuoli] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const ruoliRes = await fetch(`${API_URL}/api/amministrazione/ruoli-ditta`, { 
                    headers: { 'Authorization': `Bearer ${session.token}` } 
                });
                const ruoliData = await ruoliRes.json();
                if (ruoliData.success) setRuoli(ruoliData.ruoli);

                const userRes = await fetch(`${API_URL}/api/amministrazione/utenti/${user.id}`, { 
                    headers: { 'Authorization': `Bearer ${session.token}` } 
                });
                const userData = await userRes.json();
                if (userData.success) {
                    setFormData(userData.utente);
                } else {
                    alert(`Errore: ${userData.message}`);
                    onCancel();
                }
            } catch (error) {
                alert('Errore di connessione.');
                onCancel();
            }
        };
        fetchData();
    }, [user.id, session.token, onCancel]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const finalValue = type === 'checkbox' ? (checked ? 1 : 0) : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const formFields = [
        { key: 'nome', label: 'Nome' }, { key: 'cognome', label: 'Cognome' },
        { key: 'codice_fiscale', label: 'Codice Fiscale' }, { key: 'telefono', label: 'Telefono' },
        { key: 'indirizzo', label: 'Indirizzo' }, { key: 'citta', label: 'Città' },
        { key: 'provincia', label: 'Provincia' }, { key: 'cap', label: 'CAP' },
        { key: 'livello', label: 'Livello', type: 'number' },
        { key: 'note', label: 'Note', type: 'textarea' },
        { key: 'firma', label: 'Firma Email', type: 'textarea' },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <h3 className="text-xl font-semibold mb-4 text-slate-800">Modifica Utente: {formData.nome} {formData.cognome}</h3>
                <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-4 flex-grow">
                    <div className="text-sm bg-slate-50 p-3 rounded-md">
                        <p><strong>Email:</strong> {formData.email}</p>
                        <p><strong>Data Creazione:</strong> {new Date(formData.data_creazione).toLocaleString()}</p>
                        <p><strong>Ultimo Accesso:</strong> {formData.data_ultimo_accesso ? new Date(formData.data_ultimo_accesso).toLocaleString() : 'Mai'}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {formFields.map(col => (
                            <div key={col.key} className={col.type === 'textarea' ? 'md:col-span-2' : ''}>
                                <label className="block text-sm font-medium text-slate-700">{col.label}</label>
                                {col.type === 'textarea' ? (
                                     <textarea name={col.key} value={formData[col.key] || ''} onChange={handleChange} rows="3" className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" />
                                ) : (
                                    <input type={col.type || 'text'} name={col.key} value={formData[col.key] || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" />
                                )}
                            </div>
                        ))}
                         <div>
                            <label className="block text-sm font-medium text-slate-700">Ruolo</label>
                            <select name="id_ruolo" value={formData.id_ruolo || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm">
                                {ruoli.map(r => <option key={r.id} value={r.id}>{r.tipo}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center gap-8 pt-2">
                        <label className="flex items-center">
                            <input type="checkbox" name="attivo" checked={formData.attivo == 1} onChange={handleChange} className="h-4 w-4 rounded border-gray-300" />
                            <span className="ml-2 text-sm text-slate-700">Utente Attivo</span>
                        </label>
                        <label className="flex items-center">
                            <input type="checkbox" name="privacy" checked={!!formData.privacy} onChange={handleChange} className="h-4 w-4 rounded border-gray-300" />
                            <span className="ml-2 text-sm text-slate-700">Privacy Accettata</span>
                        </label>
                    </div>
                    <div className="flex justify-end gap-4 pt-4 border-t mt-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Annulla</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">Salva Modifiche</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// --- Componente per la Gestione Utenti (per Admin Ditta) ---
function UserManager({ session }) {
    const [utenti, setUtenti] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isAssociationModalOpen, setIsAssociationModalOpen] = useState(false);
    const [selectedUserForAssociation, setSelectedUserForAssociation] = useState(null);

    const fetchUtenti = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/amministrazione/utenti`, { headers: { 'Authorization': `Bearer ${session.token}` } });
            const data = await response.json();
            if (data.success) {
                // --- ISTRUZIONE DI DEBUG ---
                // Questo comando stamperà i dati degli utenti nella console del browser.
                console.log("Dati utenti ricevuti dal server:", data.utenti); 
                // -------------------------
                setUtenti(data.utenti);
            }
        } catch (error) { console.error(error); }
        setIsLoading(false);
    }, [session.token]);

    useEffect(() => {
       fetchUtenti();
    }, [fetchUtenti]);

    const handleSaveUser = async (userData) => {
        try {
            const response = await fetch(`${API_URL}/api/amministrazione/utenti/${userData.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.token}` },
                body: JSON.stringify(userData)
            });
            const result = await response.json();
            alert(result.message);
            if (result.success) {
                setSelectedUser(null);
                fetchUtenti();
            }
        } catch (error) {
            alert("Errore di connessione durante il salvataggio.");
        }
    };

    const handleSaveAssociation = async (userId, accountIds) => {
        try {
            const response = await fetch(`${API_URL}/api/amministrazione/utenti/${userId}/mail_accounts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.token}` },
                body: JSON.stringify({ accountIds })
            });
            const result = await response.json();
            alert(result.message);
            if (result.success) {
                setIsAssociationModalOpen(false);
                setSelectedUserForAssociation(null);
            }
        } catch (error) { alert("Errore di connessione durante il salvataggio."); }
    };
    
    const handleOpenAssociationModal = (user) => {
        setSelectedUserForAssociation(user);
        setIsAssociationModalOpen(true);
    };

    return (
        <div>
            {selectedUser && 
                <UserEditModal 
                    user={selectedUser} 
                    onSave={handleSaveUser} 
                    onCancel={() => setSelectedUser(null)} 
                    session={session}
                />
            }
            {isAssociationModalOpen && 
                <AssociateAccountsModal 
                    user={selectedUserForAssociation} 
                    onSave={handleSaveAssociation} 
                    onCancel={() => setIsAssociationModalOpen(false)} 
                    session={session}
                />
            }
            <h3 className="text-xl font-semibold text-slate-700 mb-4">Elenco Utenti della Ditta</h3>
            {isLoading ? <p>Caricamento...</p> : (
                 <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nome Cognome</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ruolo</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Stato</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Azioni</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {utenti && utenti.map(u => (
                                <tr key={u.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{u.nome} {u.cognome}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{u.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{u.ruolo}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.attivo == 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {u.attivo == 1 ? 'Attivo' : 'Non Attivo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <div className="flex justify-center items-center gap-x-4">
                                            <button onClick={() => setSelectedUser(u)} className="text-blue-600 hover:text-blue-900">
                                                Modifica
                                            </button>
                                            <button onClick={() => handleOpenAssociationModal(u)} className="text-green-600 hover:text-green-900">
                                                Account
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// --- Componente Modale generico per Form di Inserimento/Modifica ---
function CrudModal({ item, columns, onSave, onCancel, title, selectOptions = {} }) {
    const [formData, setFormData] = useState(item);
    useEffect(() => { setFormData(item); }, [item]);
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h3 className="text-xl font-semibold mb-4 text-slate-800">{title}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {columns.filter(c => !c.isAction).map(col => (
                        <div key={col.key}>
                            <label className="block text-sm font-medium text-slate-700">{col.label}</label>
                            {col.type === 'select' ? (
                                <select name={col.key} value={formData[col.key] || ''} onChange={handleChange} required={col.required} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                    <option value="">Seleziona...</option>
                                    {selectOptions[col.key] && selectOptions[col.key].map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            ) : (
                                <input type={col.type || 'text'} name={col.key} value={formData[col.key] || ''} onChange={handleChange} required={col.required} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                            )}
                            {col.description && <p className="mt-1 text-xs text-slate-500">{col.description}</p>}
                        </div>
                    ))}
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Annulla</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">Salva</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// --- Componente generico per gestire tabelle ---
function TableManager({ title, endpoint, columns, session, selectOptions = {}, idKey = 'id', canEditDelete = true, customActions = [] }) {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const headers = { 'Authorization': `Bearer ${session.token}` };
            const response = await fetch(`${API_URL}/api/amministrazione/${endpoint}`, { headers });
            
            if (response.status === 401) {
                throw new Error('Sessione non valida o scaduta. Prova a fare di nuovo il login.');
            }

            const result = await response.json();
            if (result.success) {
                setData(result.data);
            } else {
                setError(result.message || 'Errore sconosciuto.');
            }
        } catch (err) {
            setError(err.message || 'Errore di connessione al server.');
        }
        setIsLoading(false);
    }, [endpoint, session.token]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSave = async (item) => {
        const isEditing = item.originalId || item[idKey];
        const url = isEditing ? `${API_URL}/api/amministrazione/${endpoint}/${item[idKey]}` : `${API_URL}/api/amministrazione/${endpoint}`;
        const method = isEditing ? 'PATCH' : 'POST';
        
        const payload = { ...item };
        delete payload.originalId;

        if (isEditing && canEditDelete) {
            const password = prompt("Per conferma, inserisci la tua password di amministratore:");
            if (!password) return;
            payload.password = password;
        }

        try {
            const response = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.token}`
                },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            alert(result.message);
            if (result.success) {
                setIsModalOpen(false);
                setCurrentItem(null);
                fetchData();
            }
        } catch (error) { alert('Errore di connessione'); }
    };

    const handleDelete = async (itemId) => {
        if (window.confirm('Sei sicuro di voler eliminare questo record?')) {
            let password = '';
            if (canEditDelete) {
                password = prompt("Per conferma, inserisci la tua password di amministratore:");
                if (!password) return;
            }
            
            try {
                const response = await fetch(`${API_URL}/api/amministrazione/${endpoint}/${itemId}`, {
                    method: 'DELETE',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.token}`
                    },
                    body: JSON.stringify({ password })
                });
                const result = await response.json();
                alert(result.message);
                if (result.success) fetchData();
            } catch (error) { alert('Errore di connessione'); }
        }
    };

    const handleOpenModal = (item = {}) => {
        const initialItem = columns.filter(c => !c.isAction).reduce((acc, col) => ({...acc, [col.key]: ''}), {});
        const finalItem = item[idKey] ? { ...item, originalId: item[idKey] } : initialItem;
        setCurrentItem(finalItem);
        setIsModalOpen(true);
    };

    return (
        <div>
            {isModalOpen && <CrudModal item={currentItem} columns={columns} onSave={handleSave} onCancel={() => setIsModalOpen(false)} title={currentItem.originalId ? `Modifica ${title}` : `Nuovo ${title}`} selectOptions={selectOptions} />}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-slate-700">{title}</h3>
                {canEditDelete && (
                    <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors">
                        + Aggiungi
                    </button>
                )}
            </div>
            {isLoading && <p>Caricamento...</p>}
            {error && <p className="text-red-500">Errore: {error}</p>}
            {!isLoading && !error && (
                <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                {columns.map(col => <th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{col.label}</th>)}
                                {(canEditDelete || customActions.length > 0) && <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Azioni</th>}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {data.map(row => (
                                <tr key={row[idKey]} className="hover:bg-slate-50">
                                    {columns.map(col => <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{row[col.key]}</td>)}
                                    {(canEditDelete || customActions.length > 0) && (
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <div className="flex items-center justify-center gap-x-4">
                                                {customActions.map(action => (
                                                    <button key={action.label} onClick={() => action.handler(row)} className={action.className}>
                                                        {action.label}
                                                    </button>
                                                ))}
                                                {canEditDelete && (
                                                    <>
                                                        <button onClick={() => handleOpenModal(row)} className="text-blue-600 hover:text-blue-900">Modifica</button> 
                                                        <button onClick={() => handleDelete(row[idKey])} className="text-red-600 hover:text-red-900">Elimina</button>
                                                    </>
                                                )}
                                            </div>
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
}

// --- Componente per la gestione degli automatismi ---
function FunzioneAutomaticaManager({ funzione, onBack, session }) {
    const [formData, setFormData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const configRes = await fetch(`${API_URL}/api/amministrazione/funzioni_contabili_automatiche/${funzione.id}`, { headers: { 'Authorization': `Bearer ${session.token}` } });
            const configData = await configRes.json();
            if (configData.success && configData.data) {
                setFormData(configData.data);
            }
        } catch (err) {
            setError('Errore di connessione');
        }
        setIsLoading(false);
    }, [funzione.id, session.token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/api/amministrazione/funzioni_contabili_automatiche`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.token}` },
                body: JSON.stringify({ ...formData, codice_funzione: funzione.id })
            });
            const result = await response.json();
            alert(result.message);
            if (result.success) {
                onBack();
            }
        } catch (err) {
            alert('Errore durante il salvataggio.');
        }
    };

    if (isLoading) return <p>Caricamento configurazione...</p>;
    if (error) return <p className="text-red-500">Errore: {error}</p>;

    return (
        <div className="p-4 bg-white shadow-md rounded-lg">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Configura Automatismi</h2>
                    <p className="text-sm text-slate-600">Stai configurando la funzione: <strong>{funzione.codice_funzione} - {funzione.descrizione}</strong></p>
                </div>
                <button onClick={onBack} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">
                    &larr; Torna alla lista
                </button>
            </div>
            <form onSubmit={handleSave}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-slate-700 border-b pb-1">Rilanci in DARE</h3>
                        <input name="rilancio_1_dare" value={formData.rilancio_1_dare || ''} onChange={handleChange} placeholder="1. Sottoconto DARE (es. 08.1.1)" className="w-full p-2 border rounded-md" />
                        <input name="rilancio_2_dare" value={formData.rilancio_2_dare || ''} onChange={handleChange} placeholder="2. Sottoconto DARE" className="w-full p-2 border rounded-md" />
                        <input name="rilancio_3_dare" value={formData.rilancio_3_dare || ''} onChange={handleChange} placeholder="3. Sottoconto DARE" className="w-full p-2 border rounded-md" />
                        <input name="rilancio_4_dare" value={formData.rilancio_4_dare || ''} onChange={handleChange} placeholder="4. Sottoconto DARE" className="w-full p-2 border rounded-md" />
                        <input name="rilancio_5_dare" value={formData.rilancio_5_dare || ''} onChange={handleChange} placeholder="5. Sottoconto DARE" className="w-full p-2 border rounded-md" />
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-slate-700 border-b pb-1">Rilanci in AVERE</h3>
                        <input name="rilancio_1_avere" value={formData.rilancio_1_avere || ''} onChange={handleChange} placeholder="1. Sottoconto AVERE (es. 28.1.1)" className="w-full p-2 border rounded-md" />
                        <input name="rilancio_2_avere" value={formData.rilancio_2_avere || ''} onChange={handleChange} placeholder="2. Sottoconto AVERE" className="w-full p-2 border rounded-md" />
                        <input name="rilancio_3_avere" value={formData.rilancio_3_avere || ''} onChange={handleChange} placeholder="3. Sottoconto AVERE" className="w-full p-2 border rounded-md" />
                        <input name="rilancio_4_avere" value={formData.rilancio_4_avere || ''} onChange={handleChange} placeholder="4. Sottoconto AVERE" className="w-full p-2 border rounded-md" />
                        <input name="rilancio_5_avere" value={formData.rilancio_5_avere || ''} onChange={handleChange} placeholder="5. Sottoconto AVERE" className="w-full p-2 border rounded-md" />
                    </div>
                </div>
                <div className="mt-6">
                    <h3 className="text-lg font-semibold text-slate-700">Descrizione Operazione</h3>
                    <textarea name="descrizione_operazione" value={formData.descrizione_operazione || ''} onChange={handleChange} rows="3" placeholder="Descrivi a cosa serve questa configurazione..." className="w-full p-2 border rounded-md mt-1"></textarea>
                </div>
                <div className="mt-6 text-right">
                    <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">Salva Configurazione</button>
                </div>
            </form>
        </div>
    );
}

// --- Componente per la Gestione Anagrafiche ---
function AnagraficheManager({ session }) {
    const [anagrafiche, setAnagrafiche] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedAnagraficaId, setSelectedAnagraficaId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_URL}/api/amministrazione/anagrafiche`, { 
                headers: { 'Authorization': `Bearer ${session.token}` } 
            });
            const result = await response.json();
            if (result.success) {
                setAnagrafiche(result.data);
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('Errore di connessione.');
        }
        setIsLoading(false);
    }, [session.token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenModal = (id = null) => {
        setSelectedAnagraficaId(id);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedAnagraficaId(null);
    };

    const handleSave = async (formData) => {
        const isNew = !formData.id;
        const url = isNew ? `${API_URL}/api/amministrazione/anagrafiche` : `${API_URL}/api/amministrazione/anagrafiche/${formData.id}`;
        const method = isNew ? 'POST' : 'PATCH';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.token}` },
                body: JSON.stringify(formData)
            });
            const result = await response.json();
            alert(result.message);
            if (result.success) {
                handleCloseModal();
                fetchData();
            }
        } catch (error) {
            alert('Errore di connessione durante il salvataggio.');
        }
    };

    return (
        <div>
            {isModalOpen && (
                <AnagraficaEditModal 
                    anagraficaId={selectedAnagraficaId}
                    onSave={handleSave}
                    onCancel={handleCloseModal}
                    session={session}
                />
            )}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-slate-700">Anagrafiche Clienti & Fornitori</h3>
                <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">
                    + Nuova Anagrafica
                </button>
            </div>
            {isLoading && <p>Caricamento...</p>}
            {error && <p className="text-red-500">Errore: {error}</p>}
            {!isLoading && !error && (
                <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ragione Sociale</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">P.IVA / C.F.</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Relazione</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Stato</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Azioni</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {anagrafiche.map(row => (
                                <tr key={row.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{row.ragione_sociale}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{row.p_iva || row.codice_fiscale}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{row.relazione}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${row.stato == 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {row.stato == 1 ? 'Attivo' : 'Non Attivo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <button onClick={() => handleOpenModal(row.id)} className="text-blue-600 hover:text-blue-900">
                                            Modifica
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}


// --- Componente per il Piano dei Conti ---
function PianoDeiContiManager({ session }) {
    const [view, setView] = useState('mastri');
    const [mastri, setMastri] = useState([]);
    const [conti, setConti] = useState([]);

    const fetchMastri = useCallback(async () => {
        const response = await fetch(`${API_URL}/api/amministrazione/mastri`, { headers: { 'Authorization': `Bearer ${session.token}` } });
        const result = await response.json();
        if (result.success) setMastri(result.data);
    }, [session.token]);

    const fetchConti = useCallback(async () => {
        const response = await fetch(`${API_URL}/api/amministrazione/conti`, { headers: { 'Authorization': `Bearer ${session.token}` } });
        const result = await response.json();
        if (result.success) setConti(result.data);
    }, [session.token]);

    useEffect(() => {
        fetchMastri();
        fetchConti();
    }, [fetchMastri, fetchConti]);

    const mastroOptions = { codice_mastro: mastri.map(m => ({ value: m.codice, label: `${m.codice} - ${m.descrizione}` })) };
    const contoOptions = { codice_conto: conti.map(c => ({ value: c.codice, label: `${c.codice} - ${c.descrizione}` })) };

    const tabStyle = (tabName) => `px-4 py-2 rounded-t-lg cursor-pointer ${view === tabName ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:bg-slate-100'}`;

    return (
        <div>
            <h3 className="text-xl font-semibold text-slate-700 mb-4">Piano dei Conti</h3>
            <div className="flex border-b border-slate-200 mb-4">
                <button onClick={() => setView('mastri')} className={tabStyle('mastri')}>Mastri</button>
                <button onClick={() => setView('conti')} className={tabStyle('conti')}>Conti</button>
                <button onClick={() => setView('sottoconti')} className={tabStyle('sottoconti')}>Sottoconti</button>
            </div>
            {view === 'mastri' && <TableManager title="Mastri" endpoint="mastri" columns={[{key: 'codice', label: 'Codice'}, {key: 'descrizione', label: 'Descrizione'}]} session={session} idKey="codice" />}
            {view === 'conti' && <TableManager title="Conti" endpoint="conti" columns={[{key: 'codice', label: 'Codice'}, {key: 'descrizione', label: 'Descrizione'}, {key: 'codice_mastro', label: 'Mastro', type: 'select'}]} session={session} selectOptions={mastroOptions} idKey="codice" />}
            {view === 'sottoconti' && <TableManager title="Sottoconti" endpoint="sottoconti" columns={[{key: 'codice', label: 'Codice'}, {key: 'descrizione', label: 'Descrizione'}, {key: 'codice_conto', label: 'Conto', type: 'select'}]} session={session} selectOptions={contoOptions} idKey="codice" />}
        </div>
    );
}

// --- Componente per Fatture di Vendita ---
function FattureAttiveManager({ session }) {
    const [clienti, setClienti] = useState([]);
    const [iva, setIva] = useState([]);

    const fetchDropdownData = useCallback(async () => {
        try {
            const headers = { 'Authorization': `Bearer ${session.token}` };
            const anagraficheRes = await fetch(`${API_URL}/api/amministrazione/anagrafiche`, { headers });
            const anagraficheData = await anagraficheRes.json();
            if (anagraficheData.success) {
                setClienti(anagraficheData.data.filter(d => d.codice_relazione === 'C' || d.codice_relazione === 'E'));
            }

            const ivaRes = await fetch(`${API_URL}/api/amministrazione/iva_contabili`, { headers });
            const ivaData = await ivaRes.json();
            if (ivaData.success) setIva(ivaData.data);

        } catch (error) {
            console.error("Errore nel caricamento dei dati per i menu a tendina", error);
        }
    }, [session.token]);

    useEffect(() => {
        fetchDropdownData();
    }, [fetchDropdownData]);

    const columns = [
        { key: 'id_cliente', label: 'Cliente', type: 'select', required: true },
        { key: 'numero_fattura', label: 'Numero Fattura', required: true },
        { key: 'data_emissione', label: 'Data Emissione', type: 'date', required: true },
        { key: 'importo_imponibile', label: 'Imponibile', type: 'number' },
        { key: 'id_iva', label: 'Aliquota IVA', type: 'select' },
        { key: 'importo_totale', label: 'Totale', type: 'number' },
        { key: 'data_scadenza', label: 'Data Scadenza', type: 'date' },
        { key: 'stato', label: 'Stato', type: 'select' },
    ];

    const displayColumns = [ { key: 'nome_cliente', label: 'Cliente' }, ...columns.filter(c => c.key !== 'id_cliente')];

    const selectOptions = {
        id_cliente: clienti.map(c => ({ value: c.id, label: c.ragione_sociale })),
        id_iva: iva.map(i => ({ value: i.id, label: `${i.codice} - ${i.aliquota}%` })),
        stato: [
            { value: 'Emessa', label: 'Emessa' },
            { value: 'Pagata', label: 'Pagata' },
            { value: 'Stornata', label: 'Stornata' },
            { value: 'Scaduta', label: 'Scaduta' },
        ]
    };

    return <TableManager title="Fatture di Vendita" endpoint="fatture_attive" columns={displayColumns} session={session} selectOptions={selectOptions} canEditDelete={true} />;
}

// --- Componente per generare il link di registrazione ---
function RegistrationLinkGenerator({ session }) {
    const [link, setLink] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const generateLink = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/admin/generate-registration-link`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${session.token}` }
            });
            const data = await response.json();
            if (data.success) {
                setLink(data.link);
            } else {
                alert(`Errore: ${data.message}`);
            }
        } catch (error) {
            alert('Errore di connessione');
        }
        setIsLoading(false);
    };

    return (
        <div className="p-4 border rounded-lg bg-slate-50">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Invita Nuovo Utente</h3>
            <p className="text-sm text-slate-600 mb-4">Crea un link di invito da inviare ai nuovi utenti. Il link sarà valido per 7 giorni.</p>
            <button onClick={generateLink} disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors">
                {isLoading ? 'Generazione...' : 'Genera Link'}
            </button>
            {link && (
                <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-700">Copia e invia questo link:</label>
                    <input type="text" readOnly value={link} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" />
                </div>
            )}
        </div>
    );
}

// --- Componente per la Gestione Privacy ---
function PrivacyManager({ session }) {
    const [responsabile, setResponsabile] = useState('');
    const [corpo, setCorpo] = useState('');

    useEffect(() => {
        const fetchPolicy = async () => {
            try {
                const response = await fetch(`${API_URL}/api/admin/privacy-policy`, { headers: { 'Authorization': `Bearer ${session.token}` } });
                const result = await response.json();
                if (result.success && result.data) {
                    setResponsabile(result.data.responsabile_trattamento);
                    setCorpo(result.data.corpo_lettera);
                }
            } catch (error) { console.error(error); }
        };
        fetchPolicy();
    }, [session.token]);

    const handleSave = async (e) => {
        e.preventDefault();
        const response = await fetch(`${API_URL}/api/admin/privacy-policy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.token}` },
            body: JSON.stringify({ responsabile_trattamento: responsabile, corpo_lettera: corpo })
        });
        const data = await response.json();
        alert(data.message);
    };

    return (
        <div>
             <form onSubmit={handleSave} className="p-4 border rounded-lg bg-slate-50">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Imposta Informativa Privacy</h3>
                <p className="text-sm text-slate-600 mb-4">Questo testo verrà inviato automaticamente ai nuovi utenti. Usa [NOME_UTENTE] come segnaposto per il nome.</p>
                <label className="block text-sm font-medium text-slate-700">Responsabile del Trattamento:</label>
                <input value={responsabile} onChange={e => setResponsabile(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" />
                <label className="block text-sm font-medium text-slate-700 mt-4">Corpo della Lettera:</label>
                <div className="mt-1 h-64 mb-10 bg-white">
                    <ReactQuill theme="snow" value={corpo} onChange={setCorpo} className="h-full" />
                </div>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 mt-4">Salva Policy</button>
            </form>
        </div>
    );
}

// =====================================================================
// ============ DEFINIZIONE DEL COMPONENTE PRINCIPALE ==================
// =====================================================================
function AmministrazioneModule({ session }) {
    const [activeMenu, setActiveMenu] = useState('utenti');
    const [editingFunzione, setEditingFunzione] = useState(null);

    const menuItems = [
        { key: 'anagrafiche', label: 'Clienti / ornitori' },
        { key: 'utenti', label: 'Gestione Utenti' },
        { key: 'invita_utenti', label: 'Invita Utenti' },
        { key: 'account_email', label: 'Account Email' },
        { key: 'piano_dei_conti', label: 'Piano dei Conti' },
        { key: 'fatture_attive', label: 'Fatture Vendita' },
        { key: 'fatture_passive', label: 'Fatture Acquisto' },
        { key: 'tipi_pagamento', label: 'Tipi Pagamento' },
        { key: 'iva_contabili', label: 'IVA Contabili' },
        { key: 'funzioni_contabili', label: 'Funzioni Contabili' },
        { key: 'privacy', label: 'Gestione Privacy' }
    ];

    const handleBackToList = () => {
        setEditingFunzione(null);
    };
   
    const handleTestEmailConnection = async (accountId) => {
        alert(`Avvio test per l'account ID: ${accountId}...`);
        try {
            const response = await fetch(`${API_URL}/api/amministrazione/test-mail-account/${accountId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${session.token}` }
            });
            const result = await response.json();
            alert(result.success ? `✅ Successo: ${result.message}` : `❌ Fallimento: ${result.message}\n\nDettagli: ${result.error}`);
        } catch (err) {
            alert(`❌ Errore di connessione: Impossibile raggiungere il server.`);
        }
    };

    const renderContent = () => {
        if (editingFunzione) {
            return <FunzioneAutomaticaManager 
                        funzione={editingFunzione} 
                        onBack={handleBackToList} 
                        session={session} 
                    />;
        }
        
        switch (activeMenu) {
            case 'anagrafiche':
                return <AnagraficheManager session={session} />;
            case 'utenti':
                return <UserManager session={session} />;
            case 'invita_utenti':
                return <RegistrationLinkGenerator session={session} />;
            case 'account_email':
                return <TableManager 
                    title="Account Email" 
                    endpoint="ditta_mail_accounts" 
                    columns={[
                        { key: 'nome_account', label: 'Nome Account', required: true },
                        { key: 'email_address', label: 'Indirizzo Email', type: 'email', required: true },
                        { key: 'auth_user', label: 'Nome Utente (auth)', required: true, description: "Spesso coincide con l'indirizzo email completo." },
                        { key: 'auth_pass', label: 'Password', type: 'password', required: true },
                        { key: 'imap_host', label: 'Host IMAP', required: true },
                        { key: 'imap_port', label: 'Porta IMAP', type: 'number', required: true, defaultValue: 993 },
                        { key: 'smtp_host', label: 'Host SMTP', required: true },
                        { key: 'smtp_port', label: 'Porta SMTP', type: 'number', required: true, defaultValue: 465 },
                    ]} 
                    session={session}
                    customActions={[
                        { label: 'Testa', handler: (row) => handleTestEmailConnection(row.id), className: "text-purple-600 hover:text-purple-900" }
                    ]}
                />;
            case 'piano_dei_conti':
                return <PianoDeiContiManager session={session} />;
            case 'fatture_attive':
                 return <FattureAttiveManager session={session} />;
            case 'tipi_pagamento':
                return <TableManager title="Tipi di Pagamento" endpoint="tipi_pagamento" columns={[{key: 'codice', label: 'Codice', required: true}, {key: 'descrizione', label: 'Descrizione', required: true}]} session={session} />;
            case 'iva_contabili':
                 return <TableManager title="Aliquote IVA" endpoint="iva_contabili" columns={[{key: 'codice', label: 'Codice', required: true}, {key: 'aliquota', label: 'Aliquota %', type: 'number', required: true}]} session={session} />;
            case 'funzioni_contabili': {
                 return <TableManager 
                            title="Funzioni Contabili" 
                            endpoint="funzioni_contabili" 
                            columns={[
                                { key: 'codice_funzione', label: 'Codice Funzione' }, 
                                { key: 'descrizione', label: 'Descrizione' }, 
                                { key: 'livello_richiesto', label: 'Livello Richiesto' }
                            ]}
                            session={session} 
                            idKey="id"
                            customActions={[
                                { 
                                    label: 'Configura', 
                                    handler: (row) => setEditingFunzione(row),
                                    className: "px-3 py-1 bg-teal-500 text-white text-xs font-semibold rounded-md hover:bg-teal-600"
                                }
                            ]}
                        />;
            }
            case 'fatture_passive':
                 return <div>Componente per la gestione delle Fatture di Acquisto (in costruzione).</div>;
            case 'privacy':
                return <PrivacyManager session={session} />;
            default:
                return <p>Seleziona una voce dal menu.</p>;
        }
    };

    return (
        <div className="flex w-full h-full">
            <div className="w-56 border-r border-slate-200 p-4 bg-white">
                <h2 className="font-bold mb-4 text-slate-700">Menu Amministrazione</h2>
                <ul className="space-y-2">
                    {menuItems.map(item => (
                        <li key={item.key}>
                            <button onClick={() => setActiveMenu(item.key)} className={`w-full text-left p-2 rounded-md transition-colors ${activeMenu === item.key ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-slate-100'}`}>
                                {item.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex-1 p-8 overflow-y-auto">
                {renderContent()}
            </div>
        </div>
    );
}

export default AmministrazioneModule;
