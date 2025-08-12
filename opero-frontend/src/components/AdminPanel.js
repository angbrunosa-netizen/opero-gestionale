// #####################################################################
// # Componente AdminPanel - v3.1 con Form Unico Completo
// # File: opero-frontend/src/components/AdminPanel.js
// #####################################################################

import React, { useState, useEffect, useCallback } from 'react';
import ReactQuill from 'react-quill';

//const API_URL = 'http://localhost:3001';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    
// --- Sotto-componente per la Gestione Privacy ---
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
             <form onSubmit={handleSave} style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>Imposta Informativa Privacy</h3>
                <p style={{fontSize: '12px', color: '#64748b', marginBottom: '12px'}}>Questo testo verr� inviato automaticamente ai nuovi utenti. Usa [NOME_UTENTE] come segnaposto per il nome.</p>
                <label>Responsabile del Trattamento:</label>
                <input value={responsabile} onChange={e => setResponsabile(e.target.value)} required style={{ width: '100%', padding: '8px', margin: '8px 0', boxSizing: 'border-box' }} />
                <label>Corpo della Lettera:</label>
                <div style={{ height: '250px', marginBottom: '40px', backgroundColor: 'white' }}>
                    <ReactQuill theme="snow" value={corpo} onChange={setCorpo} style={{ height: '100%' }} />
                </div>
                <button type="submit" style={{ padding: '8px 16px', border: 'none', backgroundColor: '#2563eb', color: 'white', borderRadius: '6px', cursor: 'pointer' }}>Salva Policy</button>
            </form>
        </div>
    );
}


function AdminPanel({ session }) {
    const [view, setView] = useState('ditte');
    const [ditte, setDitte] = useState([]);
    const [utenti, setUtenti] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [formData, setFormData] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [tipiDitta, setTipiDitta] = useState([]);
    const [relazioni, setRelazioni] = useState([]);
    const [ruoli, setRuoli] = useState([]);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const [ditteRes, utentiRes, tipiDittaRes, relazioniRes, ruoliRes] = await Promise.all([
                fetch(`${API_URL}/api/admin/ditte`, { headers: { 'Authorization': `Bearer ${session.token}` } }),
                fetch(`${API_URL}/api/admin/utenti`, { headers: { 'Authorization': `Bearer ${session.token}` } }),
                fetch(`${API_URL}/api/admin/tipi-ditta`, { headers: { 'Authorization': `Bearer ${session.token}` } }),
                fetch(`${API_URL}/api/admin/relazioni`, { headers: { 'Authorization': `Bearer ${session.token}` } }),
                fetch(`${API_URL}/api/admin/ruoli`, { headers: { 'Authorization': `Bearer ${session.token}` } })
            ]);
            
            const ditteData = await ditteRes.json();
            if (ditteData.success) setDitte(ditteData.ditte);
            else setError(ditteData.message);

            const utentiData = await utentiRes.json();
            if (utentiData.success) setUtenti(utentiData.utenti);
            else setError(utentiData.message);

            const tipiDittaData = await tipiDittaRes.json();
            if (tipiDittaData.success) setTipiDitta(tipiDittaData.tipi_ditta);
            
            const relazioniData = await relazioniRes.json();
            if (relazioniData.success) setRelazioni(relazioniData.relazioni);

            const ruoliData = await ruoliRes.json();
            if (ruoliData.success) setRuoli(ruoliData.ruoli);

        } catch (err) { setError('Errore di connessione'); }
        setIsLoading(false);
    }, [session.token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        setSelectedItem(null);
    }, [view]);

    useEffect(() => {
        setFormData(selectedItem || {});
    }, [selectedItem]);

    const handleSelect = (item) => setSelectedItem(item);
    const handleNew = () => setSelectedItem({ isNew: true });
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSave = async (e) => {
        e.preventDefault();
        const isNew = !formData.id;
        const url = isNew ? `${API_URL}/api/admin/${view}` : `${API_URL}/api/admin/${view}/${formData.id}`;
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
                setSelectedItem(null);
                fetchData();
            }
        } catch (err) {
            alert('Errore di connessione');
        }
    };

    const renderFormFields = () => {
        if (!selectedItem) return <p className="text-slate-500">Seleziona un elemento dalla lista o creane uno nuovo.</p>;

        if (view === 'ditte') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="ragione_sociale" className="block text-sm font-medium text-slate-700">Ragione Sociale</label>
                        <input id="ragione_sociale" name="ragione_sociale" value={formData.ragione_sociale || ''} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="mail_1" className="block text-sm font-medium text-slate-700">Email</label>
                        <input id="mail_1" name="mail_1" type="email" value={formData.mail_1 || ''} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="pec" className="block text-sm font-medium text-slate-700">PEC</label>
                        <input id="pec" name="pec" value={formData.pec || ''} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="sdi" className="block text-sm font-medium text-slate-700">Codice SDI</label>
                        <input id="sdi" name="sdi" value={formData.sdi || ''} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="indirizzo" className="block text-sm font-medium text-slate-700">Indirizzo</label>
                        <input id="indirizzo" name="indirizzo" value={formData.indirizzo || ''} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="citta" className="block text-sm font-medium text-slate-700">Città</label>
                        <input id="citta" name="citta" value={formData.citta || ''} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="provincia" className="block text-sm font-medium text-slate-700">Provincia</label>
                        <input id="provincia" name="provincia" value={formData.provincia || ''} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="tel1" className="block text-sm font-medium text-slate-700">Telefono 1</label>
                        <input id="tel1" name="tel1" value={formData.tel1 || ''} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="id_tipo_ditta" className="block text-sm font-medium text-slate-700">Tipo Ditta</label>
                        <select id="id_tipo_ditta" name="id_tipo_ditta" value={formData.id_tipo_ditta || ''} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md">
                            <option value="">Seleziona...</option>
                            {tipiDitta.map(t => <option key={t.id} value={t.id}>{t.tipo}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="codice_relazione" className="block text-sm font-medium text-slate-700">Relazione Commerciale</label>
                        <select id="codice_relazione" name="codice_relazione" value={formData.codice_relazione || ''} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md">
                            <option value="">Seleziona...</option>
                            {relazioni.map(r => <option key={r.codice} value={r.codice}>{r.descrizione}</option>)}
                        </select>
                    </div>
                </div>
            );
        }

        if (view === 'utenti') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="nome" className="block text-sm font-medium text-slate-700">Nome</label>
                        <input id="nome" name="nome" value={formData.nome || ''} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="cognome" className="block text-sm font-medium text-slate-700">Cognome</label>
                        <input id="cognome" name="cognome" value={formData.cognome || ''} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
                        <input id="email" name="email" type="email" value={formData.email || ''} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" disabled={!selectedItem.isNew} />
                    </div>
                    {selectedItem.isNew && 
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password Iniziale</label>
                            <input id="password" name="password" value={formData.password || ''} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" />
                        </div>
                    }
                    <div>
                        <label htmlFor="codice_fiscale" className="block text-sm font-medium text-slate-700">Codice Fiscale</label>
                        <input id="codice_fiscale" name="codice_fiscale" value={formData.codice_fiscale || ''} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="telefono" className="block text-sm font-medium text-slate-700">Telefono</label>
                        <input id="telefono" name="telefono" value={formData.telefono || ''} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="indirizzo" className="block text-sm font-medium text-slate-700">Indirizzo</label>
                        <input id="indirizzo" name="indirizzo" value={formData.indirizzo || ''} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="citta" className="block text-sm font-medium text-slate-700">Città</label>
                        <input id="citta" name="citta" value={formData.citta || ''} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="provincia" className="block text-sm font-medium text-slate-700">Provincia</label>
                        <input id="provincia" name="provincia" value={formData.provincia || ''} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="cap" className="block text-sm font-medium text-slate-700">CAP</label>
                        <input id="cap" name="cap" value={formData.cap || ''} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="livello" className="block text-sm font-medium text-slate-700">Livello</label>
                        <input id="livello" name="livello" type="number" value={formData.livello || ''} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="id_ditta" className="block text-sm font-medium text-slate-700">Ditta di Appartenenza</label>
                        <select id="id_ditta" name="id_ditta" value={formData.id_ditta || ''} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md">
                            <option value="">Seleziona...</option>
                            {ditte.map(d => <option key={d.id} value={d.id}>{d.ragione_sociale}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="id_ruolo" className="block text-sm font-medium text-slate-700">Ruolo</label>
                        <select id="id_ruolo" name="id_ruolo" value={formData.id_ruolo || ''} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md">
                            <option value="">Seleziona...</option>
                            {ruoli.map(r => <option key={r.id} value={r.id}>{r.tipo}</option>)}
                        </select>
                    </div>
                </div>
            );
        }
        return null;
    };
    
    const itemList = view === 'ditte' ? ditte : utenti;

    return (
        <div className="flex w-full h-full bg-slate-50">
            <div className="w-1/3 border-r border-slate-200 p-4 flex flex-col bg-white">
                <div className="flex gap-2 mb-4">
                    <button onClick={() => setView('ditte')} className={`flex-1 p-2 rounded-md transition-colors ${view === 'ditte' ? 'bg-blue-600 text-white' : 'bg-slate-200 hover:bg-slate-300'}`}>Gestione Ditte</button>
                    <button onClick={() => setView('utenti')} className={`flex-1 p-2 rounded-md transition-colors ${view === 'utenti' ? 'bg-blue-600 text-white' : 'bg-slate-200 hover:bg-slate-300'}`}>Gestione Utenti</button>
                </div>
                <button onClick={handleNew} className="w-full p-2 bg-green-500 text-white rounded-md mb-4 hover:bg-green-600 transition-colors">Nuova {view === 'ditte' ? 'Ditta' : 'Utente'}</button>
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? <p>Caricamento...</p> : itemList.map(item => (
                        <div key={item.id} onClick={() => handleSelect(item)} className={`p-2 my-1 rounded-md cursor-pointer ${selectedItem?.id === item.id ? 'bg-blue-100' : 'hover:bg-slate-100'}`}>
                            <p className="font-semibold text-slate-800">{view === 'ditte' ? item.ragione_sociale : `${item.nome || ''} ${item.cognome || ''}`.trim()}</p>
                            <p className="text-sm text-slate-600">{item.email}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div className="w-2/3 p-8 overflow-y-auto">
                <form onSubmit={handleSave}>
                    <div className="space-y-4">
                        {renderFormFields()}
                    </div>
                    {selectedItem && (
                        <div className="flex gap-4 mt-6 pt-4 border-t">
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">Salva</button>
                            <button type="button" onClick={() => setSelectedItem(null)} className="px-4 py-2 bg-slate-200 rounded-md hover:bg-slate-300">Annulla</button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}



export default AdminPanel;
