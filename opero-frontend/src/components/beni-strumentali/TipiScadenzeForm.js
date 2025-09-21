// #####################################################################
// # Componente Form per Tipi Scadenze v1.0
// # File: opero-frontend/src/components/beni-strumentali/TipiScadenzeForm.js
// #####################################################################

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

const TipiScadenzeForm = ({ tipoToEdit, onClose, onSave }) => {
    const [tipo, setTipo] = useState({ codice: '', descrizione: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (tipoToEdit) {
            setTipo(tipoToEdit);
        }
    }, [tipoToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTipo(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        try {
            if (tipo.id) {
                await api.patch(`/beni-strumentali/tipi-scadenze/${tipo.id}`, { descrizione: tipo.descrizione });
            } else {
                await api.post('/beni-strumentali/tipi-scadenze', tipo);
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
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6">{tipo.id ? 'Modifica Tipo Scadenza' : 'Nuovo Tipo Scadenza'}</h2>
                
                {error && <p className="text-red-500 mb-4">{error}</p>}
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="codice" className="block text-sm font-medium text-gray-700">Codice</label>
                        <input
                            type="text"
                            name="codice"
                            value={tipo.codice}
                            onChange={handleChange}
                            className="mt-1 block w-full input-style"
                            required
                            disabled={Boolean(tipo.id)} // Il codice non è modificabile
                        />
                         {tipo.id && <p className="text-xs text-slate-500 mt-1">Il codice non può essere modificato dopo la creazione.</p>}
                    </div>
                     <div className="mb-4">
                        <label htmlFor="descrizione" className="block text-sm font-medium text-gray-700">Descrizione</label>
                        <input
                            type="text"
                            name="descrizione"
                            value={tipo.descrizione}
                            onChange={handleChange}
                            className="mt-1 block w-full input-style"
                            required
                        />
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
                    .input-style:disabled { background-color: #F3F4F6; cursor: not-allowed; }
                `}</style>
            </div>
        </div>
    );
};

export default TipiScadenzeForm;

