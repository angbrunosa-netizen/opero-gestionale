// #####################################################################
// # Modulo Amministrazione - v9.1 (Fix Modifica e Dropdown)
// # File: opero-frontend/src/components/AmministrazioneModule.js
// #####################################################################

import React, { useState, useCallback, useEffect } from 'react';
import api from '../services/api'; 
import { useAuth } from '../context/AuthContext';

// --- Componente Modale per Form di Modifica/Creazione Anagrafica ---
function AnagraficaEditModal({ anagraficaId, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        ragione_sociale: '', p_iva: '', codice_fiscale: '', indirizzo: '', cap: '', citta: '', provincia: '',
        tel: '', email: '', pec: '', codice_sdi: '', stato: 1, 
        codice_relazione: '', // Relazione scelta (es. 'C')
        id_conto: '',         // ID del CONTO PADRE scelto (es. 123)
        id_conto_collegato: ''// ID del SOTTOCONTO finale (sola lettura)
    });
    const [relazioni, setRelazioni] = useState([]);
    const [conti, setConti] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingConti, setIsLoadingConti] = useState(false);
    const [error, setError] = useState('');

    // --- Caricamento dati iniziali (Relazioni e dati anagrafica se in modifica) ---
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const relazioniRes = await api.get('/amministrazione/relazioni');
                if (relazioniRes.data.success) {
                    setRelazioni(relazioniRes.data.data);
                } else {
                    throw new Error('Impossibile caricare le relazioni.');
                }

                if (anagraficaId) {
                    const anagraficaRes = await api.get(`/amministrazione/anagrafiche/${anagraficaId}`);
                    if (anagraficaRes.data.success) {
                        const anagrafica = anagraficaRes.data.data;
                        setFormData({
                            ...anagrafica,
                            id_conto: anagrafica.id_conto || '' // Assicuriamoci che id_conto sia presente
                        });
                    } else {
                        throw new Error(anagraficaRes.data.message);
                    }
                }
            } catch (err) {
                setError(err.message || 'Errore di connessione.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [anagraficaId]);

    // --- Caricamento dinamico dei CONTI quando cambia la RELAZIONE ---
    useEffect(() => {
        const fetchConti = async () => {
            if (!formData.codice_relazione) {
                setConti([]);
                return;
            }
            
            const mastroMap = { 'C': '08', 'F': '28', 'P': '75' };
            const mastro = mastroMap[formData.codice_relazione];

            if (mastro) {
                setIsLoadingConti(true);
                try {
                    const res = await api.get(`/amministrazione/conti/${mastro}`);
                    if (res.data.success) {
                        setConti(res.data.data);
                    }
                } catch (error) {
                    console.error("Errore nel caricare i conti", error);
                } finally {
                    setIsLoadingConti(false);
                }
            }
        };

        fetchConti();
    }, [formData.codice_relazione]);


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? (checked ? 1 : 0) : value;

        if (name === 'codice_relazione') {
            setFormData(prev => ({ ...prev, id_conto: '', [name]: newValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: newValue }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (isLoading) return <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><p className="text-white">Caricamento...</p></div>;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <h3 className="text-xl font-semibold mb-4 text-slate-800">{anagraficaId ? 'Modifica Anagrafica' : 'Nuova Anagrafica'}</h3>
                {error && <p className="text-red-500 mb-4"><strong>Errore:</strong> {error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-4 flex-grow">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-slate-700">Ragione Sociale</label>
                            <input name="ragione_sociale" value={formData.ragione_sociale || ''} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        
                        {/* --- DOPPIO DROPDOWN --- */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700">1. Seleziona Relazione</label>
                            {/* ## FIX: Rimosso 'disabled' ## */}
                            <select name="codice_relazione" value={formData.codice_relazione || ''} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md">
                                <option value="" disabled>Seleziona...</option>
                                {relazioni.map(rel => (
                                    <option key={rel.codice} value={rel.codice}>{rel.descrizione}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">2. Seleziona Conto</label>
                            {/* ## FIX: Rimosso 'disabled' ## */}
                            <select name="id_conto" value={formData.id_conto || ''} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md" disabled={!formData.codice_relazione || isLoadingConti}>
                                <option value="" disabled>{isLoadingConti ? 'Caricamento...' : 'Seleziona...'}</option>
                                {conti.map(conto => (
                                    <option key={conto.id} value={conto.id}>{conto.codice} - {conto.descrizione}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">ID Sottoconto Collegato</label>
                            <input name="id_conto_collegato" value={formData.id_conto_collegato || ''} className="mt-1 block w-full p-2 border rounded-md bg-gray-100" readOnly />
                        </div>

                        {/* --- ALTRI CAMPI --- */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Partita IVA</label>
                            <input name="p_iva" value={formData.p_iva || ''} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Codice Fiscale</label>
                            <input name="codice_fiscale" value={formData.codice_fiscale || ''} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-slate-700">Indirizzo</label>
                            <input name="indirizzo" value={formData.indirizzo || ''} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">CAP</label>
                            <input name="cap" value={formData.cap || ''} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" />
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
                            <label className="block text-sm font-medium text-slate-700">Email</label>
                            <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">PEC</label>
                            <input type="email" name="pec" value={formData.pec || ''} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700">Telefono</label>
                            <input name="tel" value={formData.tel || ''} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Codice SDI</label>
                            <input name="codice_sdi" value={formData.codice_sdi || ''} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" name="stato" checked={!!formData.stato} onChange={handleChange} className="h-4 w-4 rounded" />
                            <label className="ml-2 block text-sm text-slate-800">Attivo</label>
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

// --- Componente per la Gestione Utenti (Placeholder) ---
function UserManager() {
    return (
        <div>
            <h3 className="text-xl font-semibold text-slate-700">Gestione Utenti</h3>
            <p className="mt-4">Questa sezione è in costruzione.</p>
        </div>
    );
}

// --- Componente per la Gestione Anagrafiche ---
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">ID Sottoconto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Relazione</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Stato</th>
                                {canEdit && <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Azioni</th>}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {anagrafiche.length > 0 ? (
                                anagrafiche.map(row => (
                                    <tr key={row.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-800">{row.ragione_sociale}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{row.id_conto_collegato}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{row.relazione}</td>
                                        <td className="px-6 py-4 text-center text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${row.stato === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{row.stato === 1 ? 'Attivo' : 'Non Attivo'}</span>
                                        </td>
                                        {canEdit && <td className="px-6 py-4 text-center text-sm font-medium"><button onClick={() => handleOpenModal(row.id)} className="text-blue-600 hover:text-blue-900">Modifica</button></td>}
                                    </tr>
                                ))
                            ) : ( <tr><td colSpan={canEdit ? 5 : 4} className="text-center py-10 text-slate-500">Nessun dato trovato.</td></tr> )}
                        </tbody>
                    </table>
                </div>
        </div>
    );
}

// --- Componente Principale del Modulo ---
const AmministrazioneModule = () => {
    const [activeMenu, setActiveMenu] = useState('anagrafiche');
    const { hasPermission } = useAuth();
    const menuItems = [
        { key: 'anagrafiche', label: 'Clienti / Fornitori', permission: 'ANAGRAFICHE_VIEW' },
        { key: 'utenti', label: 'Gestione Utenti', permission: 'UTENTI_VIEW' },
    ];
    const renderContent = () => {
        switch (activeMenu) {
            case 'anagrafiche':
                return hasPermission('ANAGRAFICHE_VIEW') ? <AnagraficheManager /> : <p>Non hai i permessi.</p>;
            case 'utenti':
                return hasPermission('UTENTI_VIEW') ? <UserManager /> : <p>Non hai i permessi per visualizzare gli utenti.</p>;
            default:
                return <p>Seleziona una voce.</p>;
        }
    };
    return (
        <div className="flex w-full h-full bg-gray-50">
            <aside className="w-56 border-r border-slate-200 p-4 bg-white">
                <h2 className="font-bold mb-4 text-slate-700">Menu Amministrazione</h2>
                <ul className="space-y-2">
                    {menuItems.filter(item => hasPermission(item.permission)).map(item => (
                        <li key={item.key}><button onClick={() => setActiveMenu(item.key)} className={`w-full text-left p-2 rounded-md text-sm ${activeMenu === item.key ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-slate-100'}`}>{item.label}</button></li>
                    ))}
                </ul>
            </aside>
            <main className="flex-1 p-6 overflow-y-auto">{renderContent()}</main>
        </div>
    );
}

export default AmministrazioneModule;
