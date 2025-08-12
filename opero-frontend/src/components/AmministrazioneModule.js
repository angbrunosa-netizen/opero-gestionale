// #####################################################################
// # Componente AmministrazioneModule - v4.3 (Versione Completa e Stabile)
// # File: opero-frontend/src/components/AmministrazioneModule.js
// #####################################################################

import React, { useState, useCallback, useEffect } from 'react';
import ReactQuill from 'react-quill';

const API_URL = 'http://localhost:3001';

// =====================================================================
// ============ DEFINIZIONE DEI SOTTO-COMPONENTI (ESTERNA) =============
// =====================================================================

// --- Componente Modale per Form di Inserimento/Modifica ---
function CrudModal({ item, columns, onSave, onCancel, title, selectOptions = {} }) {
    const [formData, setFormData] = useState(item);

    useEffect(() => { setFormData(item); }, [item]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

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
            const response = await fetch(`${API_URL}/api/amministrazione/${endpoint}`, { headers: { 'Authorization': `Bearer ${session.token}` } });
            const result = await response.json();
            if (result.success) setData(result.data);
            else setError(result.message || 'Errore sconosciuto.');
        } catch (err) { setError('Errore di connessione al server.'); }
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
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.token}` },
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
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.token}` },
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
                <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors">
                    + Aggiungi
                </button>
            </div>
            {isLoading && <p>Caricamento...</p>}
            {error && <p className="text-red-500">Errore: {error}</p>}
            {!isLoading && !error && (
                <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                {columns.map(col => <th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{col.label}</th>)}
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Azioni</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {data.map(row => (
                                <tr key={row[idKey]} className="hover:bg-slate-50">
                                    {columns.map(col => <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{row[col.key]}</td>)}
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
                onBack(); // Torna alla lista dopo il salvataggio
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

// --- Componente specifico per anagrafiche Clienti/Fornitori ---
function AnagraficheManager({ session }) {
    const [anagrafiche, setAnagrafiche] = useState([]);
    const [sottoconti, setSottoconti] = useState({ clienti: [], fornitori: [], puntiVendita: [] });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const anagraficheRes = await fetch(`${API_URL}/api/amministrazione/anagrafiche`, { headers: { 'Authorization': `Bearer ${session.token}` } });
            const anagraficheData = await anagraficheRes.json();
            if (anagraficheData.success) setAnagrafiche(anagraficheData.data);
            else setError(anagraficheData.message || 'Errore');

            const clientiRes = await fetch(`${API_URL}/api/amministrazione/sottoconti-filtrati?mastri=8`, { headers: { 'Authorization': `Bearer ${session.token}` } });
            const clientiData = await clientiRes.json();
            if (clientiData.success) setSottoconti(prev => ({ ...prev, clienti: clientiData.data }));
            
            const fornitoriRes = await fetch(`${API_URL}/api/amministrazione/sottoconti-filtrati?mastri=28`, { headers: { 'Authorization': `Bearer ${session.token}` } });
            const fornitoriData = await fornitoriRes.json();
            if (fornitoriData.success) setSottoconti(prev => ({ ...prev, fornitori: fornitoriData.data }));

            const pvRes = await fetch(`${API_URL}/api/amministrazione/sottoconti-filtrati?mastri=75`, { headers: { 'Authorization': `Bearer ${session.token}` } });
            const pvData = await pvRes.json();
            if (pvData.success) setSottoconti(prev => ({ ...prev, puntiVendita: pvData.data }));

        } catch (err) { setError('Errore di connessione al server.'); }
        setIsLoading(false);
    }, [session.token]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleRelazioneChange = async (id, nuovaRelazione) => {
        await handleContoChange(id, null); 
        try {
            const response = await fetch(`${API_URL}/api/amministrazione/anagrafiche/${id}/relazione`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.token}` },
                body: JSON.stringify({ codice_relazione: nuovaRelazione })
            });
            const result = await response.json();
            if (result.success) {
                setAnagrafiche(prev => prev.map(a => a.id === id ? { ...a, codice_relazione: nuovaRelazione, id_sottoconto_collegato: null, sottoconto_collegato_desc: null } : a));
            } else { alert(`Errore: ${result.message}`); }
        } catch (error) { alert('Errore di connessione'); }
    };
    
    const handleContoChange = async (id, nuovoContoId) => {
        try {
            const response = await fetch(`${API_URL}/api/amministrazione/anagrafiche/${id}/collegamento`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.token}` },
                body: JSON.stringify({ id_sottoconto_collegato: nuovoContoId })
            });
            const result = await response.json();
            if (result.success) {
               fetchData();
            } else { alert(`Errore: ${result.message}`); }
        } catch (error) { alert('Errore di connessione'); }
    };

    const getSottocontiOptions = (relazione) => {
        switch(relazione) {
            case 'C': return sottoconti.clienti;
            case 'F': return sottoconti.fornitori;
            case 'P': return sottoconti.puntiVendita;
            default: return [];
        }
    };

    return (
        <div>
            <h3 className="text-xl font-semibold text-slate-700 mb-4">Anagrafiche Clienti & Fornitori</h3>
            {isLoading && <p>Caricamento...</p>}
            {error && <p className="text-red-500">Errore: {error}</p>}
            {!isLoading && !error && (
                <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ragione Sociale</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Relazione</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Conto Contabile Collegato</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {anagrafiche.map(row => (
                                <tr key={row.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{row.ragione_sociale}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                        <select value={row.codice_relazione} onChange={(e) => handleRelazioneChange(row.id, e.target.value)} className="p-1 border rounded-md">
                                            <option value="N">Nessuna</option>
                                            <option value="C">Cliente</option>
                                            <option value="F">Fornitore</option>
                                            <option value="E">Entrambe</option>
                                            <option value="P">Punto Vendita</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                        <select 
                                            value={row.id_sottoconto_collegato || ''} 
                                            onChange={(e) => handleContoChange(row.id, e.target.value || null)}
                                            disabled={!['C', 'F', 'P'].includes(row.codice_relazione)}
                                            className="p-1 border rounded-md w-full"
                                        >
                                            <option value="">Seleziona un conto...</option>
                                            {getSottocontiOptions(row.codice_relazione).map(sc => (
                                                <option key={sc.id} value={sc.id}>{sc.codice} - {sc.descrizione}</option>
                                            ))}
                                        </select>
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
            const anagraficheRes = await fetch(`${API_URL}/api/amministrazione/anagrafiche`, { headers: { 'Authorization': `Bearer ${session.token}` } });
            const anagraficheData = await anagraficheRes.json();
            if (anagraficheData.success) {
                setClienti(anagraficheData.data.filter(d => d.codice_relazione === 'C' || d.codice_relazione === 'E'));
            }

            const ivaRes = await fetch(`${API_URL}/api/amministrazione/iva_contabili`, { headers: { 'Authorization': `Bearer ${session.token}` } });
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

// --- Componente per la Gestione Utenti (per Admin Ditta) ---
function UserManager({ session }) {
    const [utenti, setUtenti] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAssociationModalOpen, setIsAssociationModalOpen] = useState(false);
    const [selectedUserForAssociation, setSelectedUserForAssociation] = useState(null);

    const fetchUtenti = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/amministrazione/utenti`, { headers: { 'Authorization': `Bearer ${session.token}` } });
            const data = await response.json();
            if (data.success) setUtenti(data.utenti);
        } catch (error) { console.error(error); }
        setIsLoading(false);
    }, [session.token]);

    useEffect(() => {
       fetchUtenti();
    }, [fetchUtenti]);

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
            {isAssociationModalOpen && 
                <AssociateAccountsModal 
                    session={session} 
                    user={selectedUserForAssociation} 
                    onSave={handleSaveAssociation} 
                    onCancel={() => setIsAssociationModalOpen(false)} 
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
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Azioni</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {utenti && utenti.map(u => (
                                <tr key={u.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{u.nome} {u.cognome}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{u.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{u.ruolo}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <div className="flex justify-center items-center gap-x-4">
                                            <button onClick={() => handleOpenAssociationModal(u)} className="text-green-600 hover:text-green-900">Account</button>
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

// --- Componente Modale per Associazione Account ---
function AssociateAccountsModal({ session, user, onSave, onCancel }) {
    const [allAccounts, setAllAccounts] = useState([]);
    const [associatedIds, setAssociatedIds] = useState(new Set());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const accountsRes = await fetch(`${API_URL}/api/amministrazione/ditta_mail_accounts`, { headers: { 'Authorization': `Bearer ${session.token}` } });
                const accountsData = await accountsRes.json();
                if (accountsData.success) setAllAccounts(accountsData.data);

                const associatedRes = await fetch(`${API_URL}/api/amministrazione/utenti/${user.id}/mail_accounts`, { headers: { 'Authorization': `Bearer ${session.token}` } });
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

// =====================================================================
// ============ DEFINIZIONE DEL COMPONENTE PRINCIPALE ==================
// =====================================================================
function AmministrazioneModule({ session }) {
    const [activeMenu, setActiveMenu] = useState('anagrafiche');
    const [editingFunzione, setEditingFunzione] = useState(null);

    const menuItems = [
        { key: 'anagrafiche', label: 'Clienti / Fornitori' },
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
