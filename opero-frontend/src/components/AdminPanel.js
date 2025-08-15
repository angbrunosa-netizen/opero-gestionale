// #####################################################################
// # Componente AdminPanel - v3.3 con Chiamate API Robuste
// # File: opero-frontend/src/components/AdminPanel.js
// #####################################################################

import React, { useState, useEffect, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Importa lo stile per ReactQuill
import axios from 'axios';

//const API_URL = 'http://localhost:3001';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// ====================================================================
// Sotto-componente: Associa Moduli Ditta
// ====================================================================
const DittaModuliCard = ({ ditta, tuttiIModuli, session }) => {
  const [moduliSelezionati, setModuliSelezionati] = useState(ditta.moduli || []);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleCheckboxChange = (codice_modulo) => {
    setModuliSelezionati(prev =>
      prev.includes(codice_modulo)
        ? prev.filter(m => m !== codice_modulo)
        : [...prev, codice_modulo]
    );
  };

  const handleSalvaAssociazioni = async () => {
    setIsLoading(true);
    setMessage('');
    try {
      await axios.post(`${API_URL}/api/admin/salva-associazioni`, { 
        id_ditta: ditta.id, 
        moduli: moduliSelezionati 
      }, {
        headers: { 'Authorization': `Bearer ${session.token}` }
      });
      setMessage('Associazioni salvate con successo!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error("Errore nel salvataggio delle associazioni:", error);
      setMessage('Errore durante il salvataggio.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800 mb-4">{ditta.ragione_sociale}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {tuttiIModuli.map(modulo => (
          <div key={modulo.codice} className="flex items-center">
            <input
              type="checkbox"
              id={`ditta-${ditta.id}-modulo-${modulo.codice}`}
              checked={moduliSelezionati.includes(modulo.codice)}
              onChange={() => handleCheckboxChange(modulo.codice)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            {/* --- MODIFICA QUI: Aggiunto il codice del modulo --- */}
            <label htmlFor={`ditta-${ditta.id}-modulo-${modulo.codice}`} className="ml-2 text-gray-700 select-none">
              <span className="font-mono text-xs text-gray-500">({modulo.codice})</span> {modulo.descrizione}
            </label>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={handleSalvaAssociazioni}
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
        >
          {isLoading ? 'Salvataggio...' : 'Salva Modifiche'}
        </button>
        {message && <p className="text-sm text-green-600 font-medium">{message}</p>}
      </div>
    </div>
  );
};

const AssociaModuliDitta = ({ session }) => {
  const [ditte, setDitte] = useState([]);
  const [moduli, setModuli] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // --- MODIFICA QUI: Aggiunto stato per il filtro ---
  const [filtro, setFiltro] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/ditte-moduli`, {
        headers: { 'Authorization': `Bearer ${session.token}` }
      });
      setDitte(response.data.ditte);
      setModuli(response.data.moduli);
    } catch (err) {
      setError('Impossibile caricare i dati. Riprova più tardi.');
      console.error('Errore nel recupero dei dati:', err);
    } finally {
      setLoading(false);
    }
  }, [session.token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- MODIFICA QUI: Logica per filtrare le ditte ---
  const ditteFiltrate = ditte.filter(ditta => 
    ditta.ragione_sociale.toLowerCase().includes(filtro.toLowerCase())
  );

  if (loading) return <div className="text-center p-8">Caricamento in corso...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Gestione Moduli per Ditta</h1>
        
        {/* --- MODIFICA QUI: Aggiunto campo di input per il filtro --- */}
        <div className="mb-6">
            <input 
                type="text"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                placeholder="Cerca per ragione sociale..."
                className="w-full max-w-lg p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
        </div>
        
        <div className="space-y-6">
          {/* --- MODIFICA QUI: Mappa sulle ditte filtrate --- */}
          {ditteFiltrate.length > 0 ? (
            ditteFiltrate.map(ditta => (
              <DittaModuliCard key={ditta.id} ditta={ditta} tuttiIModuli={moduli} session={session} />
            ))
          ) : (
            <p className="text-center text-gray-500">Nessuna ditta trovata.</p>
          )}
        </div>
    </div>
  );
};
// ====================================================================
// Sotto-componente: Gestione Privacy
// ====================================================================
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
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50">
             <h1 className="text-3xl font-bold text-gray-900 mb-6">Imposta Informativa Privacy</h1>
             <form onSubmit={handleSave} className="p-6 bg-white shadow-md rounded-lg border border-gray-200">
                <p className="text-sm text-slate-600 mb-4">Questo testo verrà inviato automaticamente ai nuovi utenti. Usa [NOME_UTENTE] come segnaposto per il nome.</p>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700">Responsabile del Trattamento:</label>
                    <input value={responsabile} onChange={e => setResponsabile(e.target.value)} required className="mt-1 p-2 w-full border rounded-md" />
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700">Corpo della Lettera:</label>
                    <div className="mt-1 bg-white">
                        <ReactQuill theme="snow" value={corpo} onChange={setCorpo} style={{ height: '250px' }} />
                    </div>
                </div>
                <button type="submit" className="mt-8 px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">Salva Policy</button>
            </form>
        </div>
    );
}

// ====================================================================
// Sotto-componente: Gestione Ditte e Utenti
// ====================================================================
function DitteUtentiManager({ session }) {
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
            if (ditteData.success) setDitte(ditteData.ditte); else setError(ditteData.message);

            const utentiData = await utentiRes.json();
            if (utentiData.success) setUtenti(utentiData.utenti); else setError(utentiData.message);

            const tipiDittaData = await tipiDittaRes.json();
            if (tipiDittaData.success) setTipiDitta(tipiDittaData.tipi_ditta);
            
            const relazioniData = await relazioniRes.json();
            if (relazioniData.success) setRelazioni(relazioniData.relazioni);

            const ruoliData = await ruoliRes.json();
            if (ruoliData.success) setRuoli(ruoliData.ruoli);

        } catch (err) { setError('Errore di connessione'); }
        setIsLoading(false);
    }, [session.token]);

    useEffect(() => { fetchData(); }, [fetchData]);
    useEffect(() => { setSelectedItem(null); }, [view]);
    useEffect(() => { setFormData(selectedItem || {}); }, [selectedItem]);

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
        } catch (err) { alert('Errore di connessione'); }
    };

    const renderFormFields = () => {
        if (!selectedItem) return <p className="text-slate-500">Seleziona un elemento dalla lista o creane uno nuovo.</p>;
        if (view === 'ditte') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Campi del form per le ditte */}
                    <div><label htmlFor="ragione_sociale" className="block text-sm font-medium text-slate-700">Ragione Sociale</label><input id="ragione_sociale" name="ragione_sociale" value={formData.ragione_sociale || ''} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" /></div>
                    <div><label htmlFor="mail_1" className="block text-sm font-medium text-slate-700">Email</label><input id="mail_1" name="mail_1" type="email" value={formData.mail_1 || ''} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" /></div>
                    <div><label htmlFor="p_iva" className="block text-sm font-medium text-slate-700">Partita IVA</label><input id="p_iva" name="p_iva" value={formData.p_iva || ''} onChange={handleChange} maxLength="11" className="mt-1 p-2 w-full border rounded-md" /></div>
                    <div><label htmlFor="codice_fiscale" className="block text-sm font-medium text-slate-700">Codice Fiscale</label><input id="codice_fiscale" name="codice_fiscale" value={formData.codice_fiscale || ''} onChange={handleChange} maxLength="16" className="mt-1 p-2 w-full border rounded-md" /></div>
                    <div><label htmlFor="pec" className="block text-sm font-medium text-slate-700">PEC</label><input id="pec" name="pec" value={formData.pec || ''} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" /></div>
                    <div><label htmlFor="sdi" className="block text-sm font-medium text-slate-700">Codice SDI</label><input id="sdi" name="sdi" value={formData.sdi || ''} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" /></div>
                    <div className="md:col-span-2"><label htmlFor="indirizzo" className="block text-sm font-medium text-slate-700">Indirizzo</label><input id="indirizzo" name="indirizzo" value={formData.indirizzo || ''} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" /></div>
                    <div><label htmlFor="citta" className="block text-sm font-medium text-slate-700">Città</label><input id="citta" name="citta" value={formData.citta || ''} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" /></div>
                    <div><label htmlFor="provincia" className="block text-sm font-medium text-slate-700">Provincia</label><input id="provincia" name="provincia" value={formData.provincia || ''} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" /></div>
                    <div><label htmlFor="tel1" className="block text-sm font-medium text-slate-700">Telefono 1</label><input id="tel1" name="tel1" value={formData.tel1 || ''} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" /></div>
                    <div><label htmlFor="id_tipo_ditta" className="block text-sm font-medium text-slate-700">Tipo Ditta</label><select id="id_tipo_ditta" name="id_tipo_ditta" value={formData.id_tipo_ditta || ''} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md"><option value="">Seleziona...</option>{tipiDitta.map(t => <option key={t.id} value={t.id}>{t.tipo}</option>)}</select></div>
                    <div><label htmlFor="codice_relazione" className="block text-sm font-medium text-slate-700">Relazione Commerciale</label><select id="codice_relazione" name="codice_relazione" value={formData.codice_relazione || ''} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md"><option value="">Seleziona...</option>{relazioni.map(r => <option key={r.codice} value={r.codice}>{r.descrizione}</option>)}</select></div>
                    <div><label htmlFor="stato" className="block text-sm font-medium text-slate-700">Stato</label><select id="stato" name="stato" value={formData.stato == undefined ? '1' : formData.stato} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md"><option value="1">Attivo</option><option value="0">Non Attivo</option></select></div>
                </div>
            );
        }
        if (view === 'utenti') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Campi del form per gli utenti */}
                    <div><label htmlFor="nome" className="block text-sm font-medium text-slate-700">Nome</label><input id="nome" name="nome" value={formData.nome || ''} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" /></div>
                    <div><label htmlFor="cognome" className="block text-sm font-medium text-slate-700">Cognome</label><input id="cognome" name="cognome" value={formData.cognome || ''} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" /></div>
                    <div><label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label><input id="email" name="email" type="email" value={formData.email || ''} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" disabled={!selectedItem.isNew} /></div>
                    {selectedItem.isNew && <div><label htmlFor="password" className="block text-sm font-medium text-slate-700">Password Iniziale</label><input id="password" name="password" value={formData.password || ''} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md" /></div>}
                    <div><label htmlFor="id_ditta" className="block text-sm font-medium text-slate-700">Ditta di Appartenenza</label><select id="id_ditta" name="id_ditta" value={formData.id_ditta || ''} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md"><option value="">Seleziona...</option>{ditte.map(d => <option key={d.id} value={d.id}>{d.ragione_sociale}</option>)}</select></div>
                    <div><label htmlFor="id_ruolo" className="block text-sm font-medium text-slate-700">Ruolo</label><select id="id_ruolo" name="id_ruolo" value={formData.id_ruolo || ''} onChange={handleChange} className="mt-1 p-2 w-full border rounded-md"><option value="">Seleziona...</option>{ruoli.map(r => <option key={r.id} value={r.id}>{r.tipo}</option>)}</select></div>
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
                            <p className="text-sm text-slate-600">{item.mail_1 || item.email}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div className="w-2/3 p-8 overflow-y-auto">
                <form onSubmit={handleSave}>
                    <div className="space-y-4">{renderFormFields()}</div>
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

// ====================================================================
// Componente Principale: AdminPanel
// ====================================================================
function AdminPanel({ session }) {
    const [view, setView] = useState('ditteUtenti'); // Viste: 'ditteUtenti', 'moduli', 'privacy'

    const renderContent = () => {
        switch (view) {
            case 'moduli':
                return <AssociaModuliDitta session={session} />;
            case 'privacy':
                return <PrivacyManager session={session} />;
            case 'ditteUtenti':
            default:
                return <DitteUtentiManager session={session} />;
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <div className="flex-shrink-0 bg-white border-b p-4">
                <h2 className="text-xl font-bold">Pannello Amministratore</h2>
                <div className="flex gap-2 mt-4">
                    <button onClick={() => setView('ditteUtenti')} className={`flex-1 p-2 rounded-md transition-colors ${view === 'ditteUtenti' ? 'bg-blue-600 text-white' : 'bg-slate-200 hover:bg-slate-300'}`}>Gestione Ditte/Utenti</button>
                    <button onClick={() => setView('moduli')} className={`flex-1 p-2 rounded-md transition-colors ${view === 'moduli' ? 'bg-blue-600 text-white' : 'bg-slate-200 hover:bg-slate-300'}`}>Associa Moduli</button>
                    <button onClick={() => setView('privacy')} className={`flex-1 p-2 rounded-md transition-colors ${view === 'privacy' ? 'bg-blue-600 text-white' : 'bg-slate-200 hover:bg-slate-300'}`}>Privacy Policy</button>
                </div>
            </div>
            <div className="flex-grow overflow-y-auto">
                {renderContent()}
            </div>
        </div>
    );
}

export default AdminPanel;
