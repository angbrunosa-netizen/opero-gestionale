// #####################################################################
// # Componente Form per Scadenze v1.0
// # File: opero-frontend/src/components/beni-strumentali/ScadenzaForm.js
// #####################################################################

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

const ScadenzaForm = ({ scadenzaToEdit, onClose, onSave }) => {
    const [scadenza, setScadenza] = useState({
        id_bene: '',
        id_tipo_scadenza: '',
        data_scadenza: '',
        importo_previsto: '',
        note: '',
        stato: 'Pianificata',
    });
    
    const [beni, setBeni] = useState([]);
    const [tipiScadenza, setTipiScadenza] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDataForDropdowns = async () => {
            try {
                const [beniRes, tipiRes] = await Promise.all([
                    api.get('/beni-strumentali'),
                    api.get('/beni-strumentali/tipi-scadenze')
                ]);
                setBeni(beniRes.data.data || []);
                setTipiScadenza(tipiRes.data.data || []);
            } catch (err) {
                setError("Impossibile caricare i dati per il form.");
            }
        };
        fetchDataForDropdowns();
    }, []);

    useEffect(() => {
        if (scadenzaToEdit) {
            const formatted = {
                ...scadenzaToEdit,
                data_scadenza: scadenzaToEdit.data_scadenza ? new Date(scadenzaToEdit.data_scadenza).toISOString().split('T')[0] : '',
            };
            setScadenza(formatted);
        }
    }, [scadenzaToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setScadenza(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        try {
            if (scadenza.id) {
                await api.patch(`/beni-strumentali/scadenze/${scadenza.id}`, scadenza);
            } else {
                await api.post('/beni-strumentali/scadenze', scadenza);
            }
            onSave();
        } catch (err) {
            setError(err.response?.data?.error || 'Errore durante il salvataggio.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
                <h2 className="text-2xl font-bold mb-6">{scadenza.id ? 'Modifica Scadenza' : 'Nuova Scadenza'}</h2>
                
                {error && <p className="text-red-500 mb-4">{error}</p>}
                
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="id_bene" className="block text-sm font-medium text-gray-700">Bene Strumentale</label>
                            <select name="id_bene" value={scadenza.id_bene} onChange={handleChange} className="mt-1 block w-full input-style" required>
                                <option value="">Seleziona un bene</option>
                                {beni.map(b => <option key={b.id} value={b.id}>{b.descrizione}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="id_tipo_scadenza" className="block text-sm font-medium text-gray-700">Tipo Scadenza</label>
                            <select name="id_tipo_scadenza" value={scadenza.id_tipo_scadenza} onChange={handleChange} className="mt-1 block w-full input-style" required>
                                <option value="">Seleziona un tipo</option>
                                {tipiScadenza.map(t => <option key={t.id} value={t.id}>{t.descrizione}</option>)}
                            </select>
                        </div>
                        <div>
                             <label htmlFor="data_scadenza" className="block text-sm font-medium text-gray-700">Data Scadenza</label>
                             <input type="date" name="data_scadenza" value={scadenza.data_scadenza} onChange={handleChange} className="mt-1 block w-full input-style" required />
                        </div>
                        <div>
                             <label htmlFor="importo_previsto" className="block text-sm font-medium text-gray-700">Importo Previsto (€)</label>
                             <input type="number" step="0.01" name="importo_previsto" value={scadenza.importo_previsto || ''} onChange={handleChange} className="mt-1 block w-full input-style" />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label htmlFor="note" className="block text-sm font-medium text-gray-700">Note</label>
                        <textarea name="note" value={scadenza.note || ''} onChange={handleChange} rows="3" className="mt-1 block w-full input-style" />
                    </div>

                    <div className="flex justify-end gap-4 mt-8">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                            Annulla
                        </button>
                        <button type="submit" disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                            {isSaving ? 'Salvataggio...' : 'Salva'}
                        </button>
                    </div>
                </form>
                 <style jsx>{`
                    .input-style {
                        border-radius: 0.375rem; border: 1px solid #9CA3AF; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                        padding: 0.5rem 0.75rem; transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
                    }
                    .input-style:focus {
                        outline: 2px solid transparent; outline-offset: 2px; border-color: #2563EB;
                        box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.5);
                    }
                `}</style>
            </div>
        </div>
    );
};

export default ScadenzaForm;
