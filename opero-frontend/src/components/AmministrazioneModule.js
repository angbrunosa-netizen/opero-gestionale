// #####################################################################
// # Modulo Amministrazione - v9.1 (Fix Modifica e Dropdown)
// # File: opero-frontend/src/components/AmministrazioneModule.js
// #####################################################################

import React, { useState, useCallback, useEffect } from 'react';
import api from '../services/api'; 
import { useAuth } from '../context/AuthContext';
import { Cog6ToothIcon, UsersIcon, BuildingOfficeIcon, QueueListIcon, EnvelopeIcon} from '@heroicons/react/24/solid'; // Aggiunta icona per PPA
import UserForm from './UserForm'; // Esempio, potrebbero essere gestori più complessi
import PPAModule from './PPAModule'; // <-- IMPORTA IL NUOVO MODULO PPA

//const AnagraficheManager = () => <div className="p-6"><h2 className="text-2xl font-bold">Gestione Anagrafiche</h2><p>Interfaccia per la gestione di Clienti e Fornitori.</p></div>;
//const UserManager = () => <div className="p-6"><h2 className="text-2xl font-bold">Gestione Utenti</h2><p>Interfaccia per la gestione degli utenti della ditta.</p></div>;
//const PianoDeiContiManager = () => <div className="p-6"><h2 className="text-2xl font-bold">Piano dei Conti</h2><p>Interfaccia per la gestione di Mastri, Conti e Sottoconti.</p></div>;
//const MailAccountsManager = () => <div className="p-6"><h2 className="text-2xl font-bold">Gestione Account Email</h2><p>Interfaccia per la configurazione degli account email della ditta.</p></div>;
const NoPermissionMessage = () => <div className="p-6 text-center text-gray-500"><p>Non disponi delle autorizzazioni necessarie per visualizzare questa sezione.</p></div>;


// --- Componente Modale per Form di Modifica/Creazione Anagrafica (AGGIORNATO CON CAMPI COMPLETI) ---
function AnagraficaEditModal({ anagraficaId, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        ragione_sociale: '',
        indirizzo: '',
        citta: '',
        provincia: '',
        cap: '',
        tel1: '',
        tel2: '',
        mail_1: '',
        mail_2: '',
        pec: '',
        sdi: '',
        p_iva: '',
        codice_fiscale: '',
        stato: 1, 
        codice_relazione: '',
    });
    const [relazioni, setRelazioni] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const relazioniRes = await api.get('/amministrazione/relazioni');
                setRelazioni(relazioniRes.data.data);

                if (anagraficaId) {
                    const anagraficaRes = await api.get(`/amministrazione/anagrafiche/${anagraficaId}`);
                    // Mappiamo i nomi dei campi dal DB allo stato del form se necessario
                    const data = anagraficaRes.data.data;
                    setFormData({
                        ...data,
                        tel1: data.tel1 || data.tel || '', // Compatibilità con vecchi nomi
                        mail_1: data.mail_1 || data.email || '',
                        sdi: data.sdi || data.codice_sdi || ''
                    });
                }
            } catch (err) {
                setError(err.message || 'Errore di connessione.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [anagraficaId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? (checked ? 1 : 0) : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (isLoading) return <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><p className="text-white">Caricamento...</p></div>;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                <h3 className="text-xl font-semibold mb-4 text-slate-800">{anagraficaId ? 'Modifica Anagrafica' : 'Nuova Anagrafica'}</h3>
                {error && <p className="text-red-500 mb-4"><strong>Errore:</strong> {error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-4 flex-grow">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Colonna 1 */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">ID</label>
                                <input value={formData.id || 'Automatico'} readOnly className="mt-1 block w-full p-2 border rounded-md bg-slate-100" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Ragione Sociale</label>
                                <input name="ragione_sociale" value={formData.ragione_sociale || ''} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Indirizzo</label>
                                <input name="indirizzo" value={formData.indirizzo || ''} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700">Città</label>
                                <input name="citta" value={formData.citta || ''} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Provincia</label>
                                <input name="provincia" value={formData.provincia || ''} onChange={handleChange} required maxLength="2" className="mt-1 block w-full p-2 border rounded-md" />
                            </div>
                            <div>
                                    <label className="block text-sm font-medium text-slate-700">CAP</label>
                                    <input name="cap" value={formData.cap || ''} onChange={handleChange} required maxLength="5" className="mt-1 block w-full p-2 border rounded-md" />
                            </div>
                        </div>

                        {/* Colonna 2 */}
                        <div className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-slate-700">Telefono 1</label>
                                <input name="tel1" value={formData.tel1 || ''} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700">Telefono 2</label>
                                <input name="tel2" value={formData.tel2 || ''} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700">Email 1</label>
                                <input type="email" name="mail_1" value={formData.mail_1 || ''} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700">Email 2</label>
                                <input type="email" name="mail_2" value={formData.mail_2 || ''} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700">PEC</label>
                                <input type="email" name="pec" value={formData.pec || ''} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" />
                            </div>
                        </div>

                        {/* Colonna 3 */}
                        <div className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-slate-700">Codice SDI</label>
                                <input name="sdi" value={formData.sdi || ''} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Partita IVA</label>
                                <input name="p_iva" value={formData.p_iva || ''} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Codice Fiscale</label>
                                <input name="codice_fiscale" value={formData.codice_fiscale || ''} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Relazione</label>
                                <select name="codice_relazione" value={formData.codice_relazione || ''} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md" disabled={!!anagraficaId}>
                                    <option value="" disabled>Seleziona...</option>
                                    {relazioni.map(rel => (
                                        <option key={rel.codice} value={rel.codice}>{rel.descrizione}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center pt-2">
                                <input type="checkbox" name="stato" id="stato" checked={!!formData.stato} onChange={handleChange} className="h-4 w-4 rounded" />
                                <label htmlFor="stato" className="ml-2 block text-sm text-slate-800">Attivo</label>
                            </div>
                        </div>
                        
                        {/* Sottoconti collegati (sola lettura) */}
                        {anagraficaId && (
                            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4 mt-2">
                                <div>
                                    <label className="block text-sm font-medium text-slate-500">ID Sottoconto Cliente</label>
                                    <input value={formData.id_sottoconto_cliente || 'N/A'} readOnly className="mt-1 block w-full p-2 border rounded-md bg-slate-100" />
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-slate-500">ID Sottoconto Fornitore</label>
                                    <input value={formData.id_sottoconto_fornitore || 'N/A'} readOnly className="mt-1 block w-full p-2 border rounded-md bg-slate-100" />
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-slate-500">ID Sottoconto P. Vendita</label>
                                    <input value={formData.id_sottoconto_puntovendita || 'N/A'} readOnly className="mt-1 block w-full p-2 border rounded-md bg-slate-100" />
                                </div>
                            </div>
                        )}
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



// --- Componente per la Gestione Utenti (Placeholder) ---
// --- Componente per la Gestione Utenti ---
// --- Componente per la Gestione Utenti ---
function UserManager() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [generatedLink, setGeneratedLink] = useState('');
    const { hasPermission } = useAuth();

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await api.get('/amministrazione/utenti');
            if (data.success) {
                setUsers(data.data);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Errore di connessione.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleGenerateLink = async () => {
        setGeneratedLink('Generazione link in corso...');
        try {
            const { data } = await api.post('/amministrazione/utenti/genera-link-registrazione');
            if (data.success) {
                setGeneratedLink(data.link);
            } else {
                setGeneratedLink(`Errore: ${data.message}`);
            }
        } catch (err) {
            setGeneratedLink('Errore di connessione durante la generazione del link.');
        }
    };

    const handleOpenModal = (userId) => {
        setSelectedUserId(userId);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedUserId(null);
        setIsModalOpen(false);
    };

    const handleSaveUser = async (userId, data) => {
        try {
            const res = await api.patch(`/amministrazione/utenti/${userId}`, data);
            alert(res.data.message);
            if (res.data.success) {
                handleCloseModal();
                fetchData(); // Ricarica la lista utenti per vedere le modifiche
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Errore nel salvataggio.');
        }
    };

    const canCreate = hasPermission('UTENTI_CREATE');
    const canEdit = hasPermission('UTENTI_EDIT');

    return (
        <div>
            {isModalOpen && <UserEditModal userId={selectedUserId} onSave={handleSaveUser} onCancel={handleCloseModal} />}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-slate-700">Gestione Utenti</h3>
                {canCreate && (
                    <div className="flex items-center gap-4">
                        <button onClick={handleGenerateLink} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700">
                            Crea Utente da Link
                        </button>
                    </div>
                )}
            </div>

            {generatedLink && (
                <div className="mb-4 p-3 bg-gray-100 rounded-md">
                    <p className="text-sm font-medium">Link di registrazione generato:</p>
                    <input type="text" readOnly value={generatedLink} className="w-full p-2 mt-1 bg-white border rounded-md" onFocus={e => e.target.select()} />
                </div>
            )}

            {isLoading && <p>Caricamento...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!isLoading && !error && (
                <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Cognome e Nome</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Ruolo</th>
                                {canEdit && <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Azioni</th>}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 font-medium">{user.cognome} {user.nome}</td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4">{user.ruolo}</td>
                                    {canEdit && <td className="px-6 py-4 text-center"><button onClick={() => handleOpenModal(user.id)} className="text-blue-600 hover:text-blue-900">Gestisci</button></td>}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}



// --- Componente per il Piano dei Conti Tabellare ---
function PianoDeiContiManager() {
    const [activeTab, setActiveTab] = useState('mastri');
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const { hasPermission } = useAuth();

    const canEdit = hasPermission('PDC_EDIT', 95);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const { data: responseData } = await api.get(`/amministrazione/${activeTab}`);
            if (responseData.success) {
                setData(responseData.data);
            } else {
                setError(responseData.message);
            }
        } catch (err) {
            setError('Errore di connessione.');
        } finally {
            setIsLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const handleOpenModal = (item = null) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
    };

    const handleSave = async (formData) => {
        const isNew = !selectedItem;
        const method = isNew ? 'post' : 'patch';
        const id = isNew ? '' : `/${selectedItem.id || selectedItem.codice}`;
        const url = `/amministrazione/${activeTab}${id}`;

        try {
            const { data: responseData } = await api[method](url, formData);
            alert(responseData.message);
            if (responseData.success) {
                handleCloseModal();
                fetchData(); // Ricarica i dati
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Errore durante il salvataggio.');
        }
    };


    const renderTable = () => {
        if (isLoading) return <p>Caricamento...</p>;
        if (error) return <p className="text-red-500">{error}</p>;
        if (data.length === 0) return <p>Nessun dato trovato.</p>;

        const headers = Object.keys(data[0]);

        return (
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            {headers.map(header => <th key={header} className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">{header.replace('_', ' ')}</th>)}
                            {canEdit && <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Azioni</th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {data.map((row, index) => (
                            <tr key={row.id || row.codice || index}>
                                {headers.map(header => <td key={header} className="px-6 py-4 whitespace-nowrap text-sm">{row[header]}</td>)}
                                {canEdit && <td className="px-6 py-4 text-center"><button onClick={() => handleOpenModal(row)} className="text-blue-600 hover:text-blue-900">Modifica</button></td>}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div>
            {isModalOpen && <PdcEditModal item={selectedItem} itemType={activeTab} onSave={handleSave} onCancel={handleCloseModal} />}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-slate-700">Piano dei Conti</h3>
                {canEdit && <button onClick={() => handleOpenModal(null)} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">+ Nuovo</button>}
            </div>
            <div className="mb-4 border-b border-slate-200">
                <nav className="-mb-px flex space-x-6">
                    <button onClick={() => setActiveTab('mastri')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'mastri' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Mastri</button>
                    <button onClick={() => setActiveTab('conti')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'conti' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Conti</button>
                    <button onClick={() => setActiveTab('sottoconti')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'sottoconti' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Sottoconti</button>
                </nav>
            </div>
            {renderTable()}
        </div>
    );
}

// --- Componente Modale per Modifica/Creazione Piano dei Conti ---
function PdcEditModal({ item, itemType, onSave, onCancel }) {
    const [formData, setFormData] = useState(item || {});
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const renderFields = () => {
        switch (itemType) {
            case 'mastri':
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Codice</label>
                            <input name="codice" value={formData.codice || ''} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md" disabled={!!item} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Descrizione</label>
                            <input name="descrizione" value={formData.descrizione || ''} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Tipo</label>
                            <input name="tipo" value={formData.tipo || ''} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Gruppo</label>
                            <input name="gruppo" value={formData.gruppo || ''} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                    </>
                );
            case 'conti':
            case 'sottoconti':
                return (
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Descrizione</label>
                        <input name="descrizione" value={formData.descrizione || ''} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md" />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h3 className="text-xl font-semibold mb-4 text-slate-800">{item ? 'Modifica' : 'Nuovo'} {itemType.slice(0, -1)}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {renderFields()}
                    <div className="flex justify-end gap-4 pt-4 border-t mt-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Annulla</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">Salva</button>
                    </div>
                </form>
            </div>
        </div>
    );
}


// --- Componente per la Gestione Anagrafiche (AGGIORNATO) ---
function AnagraficheManager() {
    const [anagrafiche, setAnagrafiche] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAnagraficaId, setSelectedAnagraficaId] = useState(null);
    const { hasPermission } = useAuth();

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await api.get('/amministrazione/anagrafiche');
            if (data.success) setAnagrafiche(data.data); else setError(data.message);
        } catch (err) { setError('Errore di connessione.'); } 
        finally { setIsLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleOpenModal = (id = null) => {
        setSelectedAnagraficaId(id);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedAnagraficaId(null);
        fetchData(); 
    };

    const handleSave = async (formData) => {
        const isNew = !formData.id;
        const url = isNew ? '/amministrazione/anagrafiche' : `/amministrazione/anagrafiche/${formData.id}`;
        const method = isNew ? 'post' : 'patch';

        try {
            const { data } = await api[method](url, formData);
            alert(data.message);
            if (data.success) {
                handleCloseModal();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Errore durante il salvataggio.');
        }
    };

    const canCreate = hasPermission('ANAGRAFICHE_CREATE');
    const canEdit = hasPermission('ANAGRAFICHE_EDIT');

    return (
        <div>
            {isModalOpen && <AnagraficaEditModal anagraficaId={selectedAnagraficaId} onSave={handleSave} onCancel={handleCloseModal} />}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-slate-700">Anagrafiche Clienti & Fornitori</h3>
                {canCreate && <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">+ Nuova Anagrafica</button>}
            </div>
             <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Ragione Sociale</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Relazione</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Sottoconti (C/F/PV)</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Stato</th>
                            {canEdit && <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Azioni</th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {anagrafiche.map(row => (
                            <tr key={row.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 text-sm font-medium text-slate-800">{row.ragione_sociale}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{row.relazione}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">
                                    {row.id_sottoconto_cliente && <span className="mr-2">C: {row.id_sottoconto_cliente}</span>}
                                    {row.id_sottoconto_fornitore && <span className="mr-2">F: {row.id_sottoconto_fornitore}</span>}
                                    {row.id_sottoconto_puntovendita && <span>PV: {row.id_sottoconto_puntovendita}</span>}
                                </td>
                                <td className="px-6 py-4 text-center text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${row.stato ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{row.stato ? 'Attivo' : 'Inattivo'}</span>
                                </td>
                                {canEdit && <td className="px-6 py-4 text-center text-sm font-medium"><button onClick={() => handleOpenModal(row.id)} className="text-blue-600 hover:text-blue-900">Modifica</button></td>}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
// --- Componente Modale per Account Email ---
function MailAccountEditModal({ account, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        nome_account: '', email_address: '', 
        imap_host: '', imap_port: 993, 
        smtp_host: '', smtp_port: 465, 
        auth_user: '', auth_pass: ''
    });
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState({ message: '', type: '' });

    useEffect(() => {
        if (account) {
            setFormData({ ...account, auth_pass: '' });
        }
    }, [account]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value, 10) : value }));
    };

    const handleTestConnection = async () => {
        setIsTesting(true);
        setTestResult({ message: 'Test in corso...', type: 'info' });
        try {
            const { data } = await api.post('/amministrazione/mail-accounts/test', {
                smtp_host: formData.smtp_host,
                smtp_port: formData.smtp_port,
                auth_user: formData.auth_user,
                auth_pass: formData.auth_pass
            });
            if (data.success) {
                setTestResult({ message: data.message, type: 'success' });
            } else {
                setTestResult({ message: data.message, type: 'error' });
            }
        } catch (err) {
            setTestResult({ message: err.response?.data?.message || 'Errore di rete durante il test.', type: 'error' });
        } finally {
            setIsTesting(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData, account ? account.id : null);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
                <h3 className="text-xl font-semibold mb-4 text-slate-800">{account ? 'Modifica Account Email' : 'Nuovo Account Email'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* ... campi del form ... */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Nome Account</label>
                            <input name="nome_account" value={formData.nome_account} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Indirizzo Email</label>
                            <input type="email" name="email_address" value={formData.email_address} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Host IMAP</label>
                            <input name="imap_host" value={formData.imap_host} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Porta IMAP</label>
                            <input type="number" name="imap_port" value={formData.imap_port} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Host SMTP</label>
                            <input name="smtp_host" value={formData.smtp_host} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Porta SMTP</label>
                            <input type="number" name="smtp_port" value={formData.smtp_port} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Utente Autenticazione</label>
                            <input name="auth_user" value={formData.auth_user} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Password</label>
                            <input type="password" name="auth_pass" value={formData.auth_pass} onChange={handleChange} required={!account} placeholder={account ? 'Lasciare vuoto per non modificare' : ''} className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                    </div>

                    {/* --- Risultato del Test --- */}
                    {testResult.message && (
                        <div className={`p-3 rounded-md text-sm ${testResult.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {testResult.message}
                        </div>
                    )}

                    <div className="flex justify-between items-center gap-4 pt-4 border-t mt-4">
                        <button 
                            type="button" 
                            onClick={handleTestConnection} 
                            disabled={isTesting}
                            className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 disabled:bg-gray-400"
                        >
                            {isTesting ? 'Testing...' : 'Testa Account'}
                        </button>
                        <div className="flex gap-4">
                            <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Annulla</button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">Salva</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}




// --- Componente per la Gestione Account Email ---
function MailAccountsManager() {
    const [accounts, setAccounts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const { hasPermission } = useAuth();

    const canEdit = hasPermission('MAIL_ACCOUNTS_EDIT', 90);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await api.get('/amministrazione/mail-accounts');
            if (data.success) {
                setAccounts(data.data);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Errore di connessione.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenModal = (account = null) => {
        setSelectedAccount(account);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedAccount(null);
    };

    const handleSave = async (formData, accountId) => {
        const isNew = !accountId;
        const method = isNew ? 'post' : 'patch';
        const url = isNew ? '/amministrazione/mail-accounts' : `/amministrazione/mail-accounts/${accountId}`;
        
        if (!isNew && !formData.auth_pass) {
            delete formData.auth_pass;
        }

        try {
            const { data } = await api[method](url, formData);
            alert(data.message);
            if (data.success) {
                handleCloseModal();
                fetchData();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Errore durante il salvataggio.');
        }
    };
    
    const handleDelete = async (accountId) => {
        if (window.confirm('Sei sicuro di voler eliminare questo account email?')) {
            try {
                const { data } = await api.delete(`/amministrazione/mail-accounts/${accountId}`);
                alert(data.message);
                if (data.success) {
                    fetchData();
                }
            } catch (err) {
                alert(err.response?.data?.message || 'Errore durante l\'eliminazione.');
            }
        }
    };

    return (
        <div>
            {isModalOpen && <MailAccountEditModal account={selectedAccount} onSave={handleSave} onCancel={handleCloseModal} />}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-slate-700">Gestione Account Email</h3>
                {canEdit && <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">+ Nuovo Account</button>}
            </div>
            {isLoading && <p>Caricamento...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!isLoading && !error && (
                <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Nome Account</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Indirizzo Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Utente</th>
                                {canEdit && <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Azioni</th>}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {accounts.map(acc => (
                                <tr key={acc.id}>
                                    <td className="px-6 py-4 font-medium">{acc.nome_account}</td>
                                    <td className="px-6 py-4">{acc.email_address}</td>
                                    <td className="px-6 py-4">{acc.auth_user}</td>
                                    {canEdit && (
                                        <td className="px-6 py-4 text-center space-x-4">
                                            <button onClick={() => handleOpenModal(acc)} className="text-blue-600 hover:text-blue-900">Modifica</button>
                                            <button onClick={() => handleDelete(acc.id)} className="text-red-600 hover:text-red-900">Elimina</button>
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



// =====================================================================
// ============ COMPONENTE PRINCIPALE DEL MODULO =======================
// =====================================================================
const AmministrazioneModule = () => {
    const { hasPermission } = useAuth();
    
    // Definiamo tutte le possibili voci di menu con la loro chiave, etichetta, icona e permesso richiesto.
    const menuItems = [
        { key: 'anagrafiche', label: 'Clienti / Fornitori', permission: 'ANAGRAFICHE_VIEW', icon: BuildingOfficeIcon },
        { key: 'utenti', label: 'Gestione Utenti', permission: 'UTENTI_VIEW', icon: UsersIcon },
        { key: 'pdc', label: 'Piano dei Conti', permission: 'PDC_VIEW', icon: Cog6ToothIcon },
        { key: 'mail_accounts', label: 'Account Email', permission: 'MAIL_ACCOUNTS_VIEW', icon: QueueListIcon},
        { key: 'ppa', label: 'Configurazione PPA', permission: 'PPA_MODULE', icon: QueueListIcon }, // <-- NUOVA VOCE
    ];

    // Filtriamo le voci di menu in base ai permessi dell'utente.
    const accessibleMenuItems = menuItems.filter(item => hasPermission(item.permission));

    // Lo stato 'activeMenu' parte dalla prima voce di menu accessibile.
    const [activeMenu, setActiveMenu] = useState(accessibleMenuItems.length > 0 ? accessibleMenuItems[0].key : null);

    const renderContent = () => {
        // Se l'utente non ha accesso a nessuna funzione, mostra un messaggio.
        if (!activeMenu) {
            return <NoPermissionMessage />;
        }

        // Controlla di nuovo il permesso prima di renderizzare, per sicurezza.
        const currentItem = menuItems.find(item => item.key === activeMenu);
        if (!currentItem || !hasPermission(currentItem.permission)) {
            return <NoPermissionMessage />;
        }
        
        // Switch per visualizzare il componente corretto.
        switch (activeMenu) {
            case 'anagrafiche': return <AnagraficheManager />;
            case 'utenti': return <UserManager />;
            case 'pdc': return <PianoDeiContiManager />;
            case 'mail_accounts': return <MailAccountsManager />;
            case 'ppa': return <PPAModule />; // <-- NUOVO CASO PER IL PPA
            default: return <p className="p-6">Seleziona una voce dal menu.</p>;
        }
    };

    return (
        <div className="flex w-full h-full bg-gray-50">
            <aside className="w-64 border-r border-slate-200 p-4 bg-white flex-shrink-0">
                <h2 className="font-bold mb-4 text-slate-700 text-lg">Menu Amministrazione</h2>
                <ul className="space-y-2">
                    {accessibleMenuItems.map(item => {
                        const Icon = item.icon;
                        return (
                            <li key={item.key}>
                                <button 
                                    onClick={() => setActiveMenu(item.key)} 
                                    className={`w-full text-left p-2 rounded-md transition-colors text-sm flex items-center gap-3 ${activeMenu === item.key ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-slate-100'}`}
                                >
                                    <Icon className="h-5 w-5 flex-shrink-0" />
                                    <span>{item.label}</span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </aside>
            <main className="flex-1 p-6 overflow-y-auto">
                {renderContent()}
            </main>
        </div>
    );
};


// --- Componente Modale per la Gestione Utente (POTENZIATO con Etichette) ---
function UserEditModal({ userId, onSave, onCancel }) {
    const [formData, setFormData] = useState({});
    const [availableAccounts, setAvailableAccounts] = useState([]);
    const [selectedAccounts, setSelectedAccounts] = useState(new Set());
    const [roles, setRoles] = useState([]);
    const [userTypes, setUserTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, accountsRes, rolesRes, typesRes] = await Promise.all([
                    api.get(`/amministrazione/utenti/${userId}`),
                    api.get('/amministrazione/mail-accounts'),
                    api.get('/amministrazione/ruoli-assegnabili'),
                    api.get('/amministrazione/tipi-utente')
                ]);

                if (userRes.data.success) {
                    setFormData(userRes.data.data.userData);
                    setSelectedAccounts(new Set(userRes.data.data.assignedMailAccountIds));
                }
                if (accountsRes.data.success) setAvailableAccounts(accountsRes.data.data);
                if (rolesRes.data.success) setRoles(rolesRes.data.data);
                if (typesRes.data.success) setUserTypes(typesRes.data.data);

            } catch (error) {
                console.error("Errore nel caricamento dati per il modale utente", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [userId]);

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? (checked ? 1 : 0) : value }));
    };

    const handleAccountToggle = (accountId) => {
        const newSelection = new Set(selectedAccounts);
        if (newSelection.has(accountId)) newSelection.delete(accountId);
        else newSelection.add(accountId);
        setSelectedAccounts(newSelection);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(userId, {
            userData: formData,
            mailAccountIds: Array.from(selectedAccounts)
        });
    };

    if (isLoading) return <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><p className="text-white">Caricamento...</p></div>;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-5xl max-h-[95vh] flex flex-col">
                <h3 className="text-xl font-semibold mb-4 text-slate-800">Gestisci Utente: {formData.nome} {formData.cognome}</h3>
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Colonna 1: Anagrafica */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-slate-600 border-b pb-2">Anagrafica</h4>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">ID Utente</label>
                            <input value={formData.id || ''} disabled className="mt-1 block w-full p-2 border rounded-md bg-slate-100" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Nome</label>
                            <input name="nome" value={formData.nome || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Cognome</label>
                            <input name="cognome" value={formData.cognome || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Codice Fiscale</label>
                            <input name="codice_fiscale" value={formData.codice_fiscale || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Telefono</label>
                            <input name="telefono" value={formData.telefono || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Indirizzo</label>
                            <input name="indirizzo" value={formData.indirizzo || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Città</label>
                            <input name="citta" value={formData.citta || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">CAP</label>
                            <input name="cap" value={formData.cap || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Note</label>
                            <textarea name="note" value={formData.note || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md h-24"></textarea>
                        </div>
                    </div>

                    {/* Colonna 2: Credenziali e Permessi */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-slate-600 border-b pb-2">Credenziali e Permessi</h4>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Email</label>
                            <input value={formData.email || ''} disabled className="mt-1 block w-full p-2 border rounded-md bg-slate-100" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Ruolo</label>
                            <select name="id_ruolo" value={formData.id_ruolo || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md">
                                <option value="">Seleziona Ruolo...</option>
                                {roles.map(role => <option key={role.id} value={role.id}>{role.tipo}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Tipo Utente</label>
                            <select name="Codice_Tipo_Utente" value={formData.Codice_Tipo_Utente || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md">
                                <option value="">Seleziona Tipo Utente...</option>
                                {userTypes.map(type => <option key={type.Codice} value={type.Codice}>{type.Descrizione}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700">Livello</label>
                            <input type="number" name="livello" value={formData.livello || 0} onChange={handleFormChange} min="0" max="100" className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        <div className="flex items-center gap-6 pt-2">
                            <div className="flex items-center"><input type="checkbox" name="attivo" id="user-active" checked={!!formData.attivo} onChange={handleFormChange} className="h-4 w-4" /><label htmlFor="user-active" className="ml-2">Attivo</label></div>
                            <div className="flex items-center"><input type="checkbox" name="privacy" id="user-privacy" checked={!!formData.privacy} onChange={handleFormChange} className="h-4 w-4" /><label htmlFor="user-privacy" className="ml-2">Privacy Accettata</label></div>
                        </div>
                    </div>

                    {/* Colonna 3: Account Email */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-slate-600 border-b pb-2">Account Email Associati</h4>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {availableAccounts.map(acc => (
                                <div key={acc.id} className="flex items-center"><input type="checkbox" id={`acc-${acc.id}`} checked={selectedAccounts.has(acc.id)} onChange={() => handleAccountToggle(acc.id)} className="h-4 w-4" /><label htmlFor={`acc-${acc.id}`} className="ml-2">{acc.nome_account}</label></div>
                            ))}
                        </div>
                    </div>

                    {/* Pulsanti di Azione */}
                    <div className="md:col-span-3 flex justify-end gap-4 pt-4 border-t mt-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-200 rounded-md">Annulla</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Salva Modifiche</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
export default AmministrazioneModule;
