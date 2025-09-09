// #####################################################################
// # Componente Funzionale per la Sezione di Nuova Registrazione
// # File: opero-gestionale/opero-frontend/src/components/cont-smart/NuovaRegistrazione.js
// #####################################################################

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { PlusIcon, TrashIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

const NuovaRegistrazione = () => {
    // --- STATI ---
    const [funzioni, setFunzioni] = useState([]);
    const [pdc, setPdc] = useState([]);
    const [selectedFunzione, setSelectedFunzione] = useState('');
    
    // Dati della testata
    const [testata, setTestata] = useState({
        data_registrazione: new Date().toISOString().slice(0, 10),
        descrizione: '',
    });

    // Righe della scrittura contabile
    const [righe, setRighe] = useState([]);
    
    // Stato di caricamento e messaggi
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // --- CARICAMENTO DATI INIZIALI ---
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [funzioniRes, pdcRes] = await Promise.all([
                    api.get('/contsmart/funzioni'),
                    api.get('/contsmart/pdc-flat')
                ]);
                setFunzioni(funzioniRes.data.data);
                setPdc(pdcRes.data.data.filter(c => c.tipo === 'Sottoconto'));
            } catch (err) {
                setError('Impossibile caricare i dati necessari (Funzioni e Piano dei Conti).');
                console.error(err);
            }
            setIsLoading(false);
        };
        fetchData();
    }, []);

    // --- GESTORI DI EVENTI ---

    const handleFunzioneChange = useCallback((e) => {
        const idFunzione = e.target.value;
        setSelectedFunzione(idFunzione);
        setError('');
        setSuccess('');

        if (!idFunzione) {
            setRighe([]);
            setTestata(prev => ({ ...prev, descrizione: '' }));
            return;
        }

        const funzione = funzioni.find(f => f.id.toString() === idFunzione);
        if (funzione) {
            setTestata(prev => ({ ...prev, descrizione: funzione.descrizione }));
            
            // Pre-compila le righe basate sulla funzione
            const righePrecompilate = [];
            if (funzione.conto_dare_default) {
                righePrecompilate.push({ id_conto: funzione.conto_dare_default, importo_dare: 0, importo_avere: 0, descrizione: '' });
            }
            if (funzione.conto_avere_default) {
                righePrecompilate.push({ id_conto: funzione.conto_avere_default, importo_dare: 0, importo_avere: 0, descrizione: '' });
            }
            setRighe(righePrecompilate);
        }
    }, [funzioni]);

    const handleTestataChange = (e) => {
        const { name, value } = e.target;
        setTestata(prev => ({ ...prev, [name]: value }));
    };

    const handleRigaChange = (index, field, value) => {
        const nuoveRighe = [...righe];
        nuoveRighe[index][field] = value;

        // Azzera l'altro importo per mantenere la logica Dare/Avere
        if (field === 'importo_dare' && parseFloat(value) > 0) {
            nuoveRighe[index]['importo_avere'] = 0;
        } else if (field === 'importo_avere' && parseFloat(value) > 0) {
            nuoveRighe[index]['importo_dare'] = 0;
        }

        setRighe(nuoveRighe);
    };

    const aggiungiRiga = () => {
        setRighe([...righe, { id_conto: '', importo_dare: 0, importo_avere: 0, descrizione: '' }]);
    };

    const rimuoviRiga = (index) => {
        setRighe(righe.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        // Validazione
        const totaleDare = righe.reduce((sum, r) => sum + parseFloat(r.importo_dare || 0), 0);
        const totaleAvere = righe.reduce((sum, r) => sum + parseFloat(r.importo_avere || 0), 0);

        if (Math.abs(totaleDare - totaleAvere) > 0.001) {
            setError('La registrazione non è bilanciata. Totale Dare deve essere uguale a Totale Avere.');
            setIsLoading(false);
            return;
        }
        if (totaleDare === 0) {
            setError('L\'importo della registrazione non può essere zero.');
            setIsLoading(false);
            return;
        }
        if (righe.some(r => !r.id_conto)) {
            setError('Tutte le righe devono avere un conto selezionato.');
            setIsLoading(false);
            return;
        }

        const payload = {
            testata,
            righe: righe.map(r => ({ ...r, importo_dare: parseFloat(r.importo_dare), importo_avere: parseFloat(r.importo_avere) })),
            datiDocumento: null, // Per ora non gestiamo la parte finanziaria complessa
            righeIva: []
        };
        
        try {
            await api.post('/contsmart/registrazioni-complessa', payload);
            setSuccess('Registrazione salvata con successo!');
            // Reset form
            setSelectedFunzione('');
            setTestata({ data_registrazione: new Date().toISOString().slice(0, 10), descrizione: '' });
            setRighe([]);
        } catch (err) {
            setError(err.response?.data?.message || 'Errore durante il salvataggio.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // --- CALCOLI TOTALI ---
    const totaleDare = righe.reduce((sum, r) => sum + parseFloat(r.importo_dare || 0), 0);
    const totaleAvere = righe.reduce((sum, r) => sum + parseFloat(r.importo_avere || 0), 0);
    const sbilancio = totaleDare - totaleAvere;

    return (
        <div className="p-4 bg-white shadow rounded-lg">
            <h2 className="text-xl font-semibold text-slate-700 mb-4">Nuova Registrazione Contabile</h2>

            {/* Selezione Funzione */}
            <div className="mb-6">
                <label htmlFor="funzione" className="block text-sm font-medium text-slate-700 mb-1">
                    Seleziona una Funzione Contabile (modello)
                </label>
                <select
                    id="funzione"
                    value={selectedFunzione}
                    onChange={handleFunzioneChange}
                    className="w-full max-w-lg p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                >
                    <option value="">-- Seleziona un modello --</option>
                    {funzioni.map(f => <option key={f.id} value={f.id}>{f.codice} - {f.descrizione}</option>)}
                </select>
            </div>

            {selectedFunzione && (
                <form onSubmit={handleSubmit}>
                    {/* Dati Testata */}
                    <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 border rounded-md">
                        <legend className="text-md font-semibold px-2">Dati Registrazione</legend>
                        <div>
                            <label htmlFor="data_registrazione" className="block text-sm font-medium text-slate-600">Data</label>
                            <input type="date" id="data_registrazione" name="data_registrazione" value={testata.data_registrazione} onChange={handleTestataChange} className="mt-1 w-full p-2 border rounded-md" required />
                        </div>
                        <div>
                            <label htmlFor="descrizione" className="block text-sm font-medium text-slate-600">Descrizione</label>
                            <input type="text" id="descrizione" name="descrizione" value={testata.descrizione} onChange={handleTestataChange} className="mt-1 w-full p-2 border rounded-md" required />
                        </div>
                    </fieldset>

                    {/* Righe Contabili */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-600">
                                <tr>
                                    <th className="p-2 text-left font-semibold">Conto</th>
                                    <th className="p-2 text-left font-semibold">Descrizione Riga</th>
                                    <th className="p-2 text-right font-semibold">Dare</th>
                                    <th className="p-2 text-right font-semibold">Avere</th>
                                    <th className="p-2"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {righe.map((riga, index) => (
                                    <tr key={index}>
                                        <td className="p-1" style={{minWidth: '250px'}}>
                                            <select value={riga.id_conto} onChange={(e) => handleRigaChange(index, 'id_conto', e.target.value)} className="w-full p-2 border rounded-md" required>
                                                <option value="">Seleziona conto</option>
                                                {pdc.map(c => <option key={c.id} value={c.id}>{c.codice} - {c.descrizione}</option>)}
                                            </select>
                                        </td>
                                        <td className="p-1">
                                            <input type="text" value={riga.descrizione} onChange={(e) => handleRigaChange(index, 'descrizione', e.target.value)} className="w-full p-2 border rounded-md" />
                                        </td>
                                        <td className="p-1">
                                            <input type="number" step="0.01" value={riga.importo_dare} onChange={(e) => handleRigaChange(index, 'importo_dare', e.target.value)} className="w-full p-2 border rounded-md text-right" />
                                        </td>
                                        <td className="p-1">
                                            <input type="number" step="0.01" value={riga.importo_avere} onChange={(e) => handleRigaChange(index, 'importo_avere', e.target.value)} className="w-full p-2 border rounded-md text-right" />
                                        </td>
                                        <td className="p-1 text-center">
                                            {righe.length > 2 && <button type="button" onClick={() => rimuoviRiga(index)} className="text-red-500 hover:text-red-700 p-1"><TrashIcon className="h-5 w-5"/></button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="flex justify-start mt-2">
                        <button type="button" onClick={aggiungiRiga} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium">
                            <PlusIcon className="h-4 w-4" /> Aggiungi Riga
                        </button>
                    </div>

                    {/* Totali e Sbilancio */}
                    <div className="mt-6 flex justify-end items-center gap-8 p-4 bg-slate-50 rounded-md">
                        <div className="text-right">
                            <span className="text-slate-500 text-sm">Totale Dare</span>
                            <p className="font-semibold text-lg">{totaleDare.toFixed(2)} €</p>
                        </div>
                        <div className="text-right">
                            <span className="text-slate-500 text-sm">Totale Avere</span>
                            <p className="font-semibold text-lg">{totaleAvere.toFixed(2)} €</p>
                        </div>
                        <div className="text-right">
                            <span className="text-slate-500 text-sm">Sbilancio</span>
                            <p className={`font-bold text-lg ${Math.abs(sbilancio) > 0.001 ? 'text-red-500' : 'text-green-600'}`}>
                                {sbilancio.toFixed(2)} €
                            </p>
                        </div>
                    </div>

                    {/* Messaggi e Pulsante di Salvataggio */}
                    <div className="mt-6">
                        {error && <div className="flex items-center gap-2 text-red-600 bg-red-100 p-3 rounded-md mb-4"><ExclamationTriangleIcon className="h-5 w-5"/>{error}</div>}
                        {success && <div className="flex items-center gap-2 text-green-700 bg-green-100 p-3 rounded-md mb-4"><CheckCircleIcon className="h-5 w-5"/>{success}</div>}
                        
                        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-slate-400" disabled={isLoading || Math.abs(sbilancio) > 0.001}>
                            {isLoading ? 'Salvataggio in corso...' : 'Salva Registrazione'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default NuovaRegistrazione;

