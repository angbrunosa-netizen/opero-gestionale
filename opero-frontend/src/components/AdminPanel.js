// #####################################################################
// # Componente AdminPanel - v4.0 (Refactoring con Context API)
// # File: opero-frontend/src/components/AdminPanel.js
// #####################################################################

import React, { useState, useEffect, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

// ====================================================================
// Sotto-componente: Associa Moduli Ditta
// ====================================================================
const DittaModuliCard = ({ ditta, tuttiIModuli }) => {
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
      await api.post('/admin/salva-associazioni', { 
        id_ditta: ditta.id, 
        moduli: moduliSelezionati 
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
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isLoading ? 'Salvataggio...' : 'Salva Modifiche'}
        </button>
        {message && <p className="text-sm text-green-600 font-medium">{message}</p>}
      </div>
    </div>
  );
};

const AssociaModuliDitta = () => {
  const [ditte, setDitte] = useState([]);
  const [moduli, setModuli] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    const fetchData = async () => {
        try {
          const { data } = await api.get('/admin/ditte-moduli');
          setDitte(data.ditte);
          setModuli(data.moduli);
        } catch (err) {
          setError('Impossibile caricare i dati. Riprova più tardi.');
          console.error('Errore nel recupero dei dati:', err);
        } finally {
          setLoading(false);
        }
    };
    fetchData();
  }, []);

  const ditteFiltrate = ditte.filter(ditta => 
    ditta.ragione_sociale.toLowerCase().includes(filtro.toLowerCase())
  );

  if (loading) return <div className="text-center p-8">Caricamento in corso...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Gestione Moduli per Ditta</h1>
        <div className="mb-6">
            <input 
                type="text"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                placeholder="Cerca per ragione sociale..."
                className="w-full max-w-lg p-2 border border-gray-300 rounded-md shadow-sm"
            />
        </div>
        <div className="space-y-6">
          {ditteFiltrate.length > 0 ? (
            ditteFiltrate.map(ditta => (
              <DittaModuliCard key={ditta.id} ditta={ditta} tuttiIModuli={moduli} />
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
function PrivacyManager() {
    const [responsabile, setResponsabile] = useState('');
    const [corpo, setCorpo] = useState('');

    useEffect(() => {
        const fetchPolicy = async () => {
            try {
                const { data } = await api.get('/admin/privacy-policy');
                if (data.success && data.data) {
                    setResponsabile(data.data.responsabile_trattamento);
                    setCorpo(data.data.corpo_lettera);
                }
            } catch (error) { console.error(error); }
        };
        fetchPolicy();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/admin/privacy-policy', { 
                responsabile_trattamento: responsabile, 
                corpo_lettera: corpo 
            });
            alert(data.message);
        } catch (error) {
            alert('Errore di connessione durante il salvataggio.');
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50">
             <h1 className="text-3xl font-bold text-gray-900 mb-6">Imposta Informativa Privacy</h1>
             <form onSubmit={handleSave} className="p-6 bg-white shadow-md rounded-lg border">
                <p className="text-sm text-slate-600 mb-4">Questo testo verrà inviato ai nuovi utenti. Usa [NOME_UTENTE] come segnaposto.</p>
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
// Componente Principale: AdminPanel
// ====================================================================
function AdminPanel() {
    const [view, setView] = useState('moduli'); // Viste: 'ditteUtenti', 'moduli', 'privacy'

    const renderContent = () => {
        switch (view) {
            case 'moduli':
                return <AssociaModuliDitta />;
            case 'privacy':
                return <PrivacyManager />;
            // Aggiungi qui altri case per le future sezioni del pannello admin
            default:
                return <p>Sezione non trovata.</p>;
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-shrink-0 bg-white border-b p-4">
                <h2 className="text-xl font-bold">Pannello Amministratore</h2>
                <div className="flex gap-2 mt-4">
                    <button onClick={() => setView('moduli')} className={`p-2 rounded-md transition-colors ${view === 'moduli' ? 'bg-blue-600 text-white' : 'bg-slate-200 hover:bg-slate-300'}`}>Associa Moduli</button>
                    <button onClick={() => setView('privacy')} className={`p-2 rounded-md transition-colors ${view === 'privacy' ? 'bg-blue-600 text-white' : 'bg-slate-200 hover:bg-slate-300'}`}>Privacy Policy</button>
                    {/* Aggiungi qui altri pulsanti per le future sezioni */}
                </div>
            </div>
            <div className="flex-grow overflow-y-auto">
                {renderContent()}
            </div>
        </div>
    );
}

export default AdminPanel;
