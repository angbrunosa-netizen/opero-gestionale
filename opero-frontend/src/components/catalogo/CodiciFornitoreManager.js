/**
 * @file opero-frontend/src/components/catalogo/CodiciFornitoreManager.js
 * @description Modale per la gestione dei codici fornitore, con distinzione tra Standard (ST) e Occasionale (OCC).
 * @date 2025-10-02
 * @version 2.0
 */
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/solid';

const CodiciFornitoreManager = ({ itemId, onClose }) => {
    const { hasPermission } = useAuth();
    const [codici, setCodici] = useState([]);
    const [fornitori, setFornitori] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Stato per il nuovo codice, include il tipo
    const [newCodiceData, setNewCodiceData] = useState({
        codice_articolo_fornitore: '',
        id_anagrafica_fornitore: '',
        tipo_codice: 'OCC' // Default a 'Occasionale'
    });

    const fetchCodiciEForntori = useCallback(async () => {
        if (!itemId) return;
        setLoading(true);
        try {
            const [codiciRes, fornitoriRes] = await Promise.all([
                api.get(`/catalogo/entita/${itemId}/codici-fornitore`),
                api.get('/amministrazione/fornitori')
            ]);
            setCodici(codiciRes.data || []);
            setFornitori(fornitoriRes.data || []);
            setError(null);
        } catch (err) {
            console.error("Errore nel caricamento dei dati:", err);
            setError("Impossibile caricare i dati necessari.");
        } finally {
            setLoading(false);
        }
    }, [itemId]);

    useEffect(() => {
        fetchCodiciEForntori();
    }, [fetchCodiciEForntori]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewCodiceData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddCodice = async (e) => {
        e.preventDefault();
        if (!newCodiceData.codice_articolo_fornitore.trim() || !hasPermission('CT_COD_FORN_MANAGE')) return;

        try {
            await api.post(`/catalogo/entita/${itemId}/codici-fornitore`, newCodiceData);
            setNewCodiceData({ codice_articolo_fornitore: '', id_anagrafica_fornitore: '', tipo_codice: 'OCC' });
            fetchCodiciEForntori(); // Ricarica la lista
        } catch (err) {
            console.error("Errore nell'aggiunta del codice:", err);
            // Mostra l'errore specifico inviato dal backend (es. conflitto 409)
            alert('Errore: ' + (err.response?.data?.message || "Impossibile aggiungere il codice."));
        }
    };

    const handleDeleteCodice = async (codiceId) => {
        if (!window.confirm("Sei sicuro di voler eliminare questo codice?") || !hasPermission('CT_COD_FORN_MANAGE')) return;
        try {
            await api.delete(`/catalogo/codici-fornitore/${codiceId}`);
            fetchCodiciEForntori(); // Ricarica la lista
        } catch (err) {
            console.error("Errore nell'eliminazione del codice:", err);
            alert('Errore: ' + (err.response?.data?.message || "Impossibile eliminare il codice."));
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl flex flex-col max-h-[80vh]">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-bold">Gestione Codici Fornitore</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto">
                    {loading && <p className="text-center">Caricamento...</p>}
                    {error && <p className="text-red-500 text-center">{error}</p>}
                    
                    {!loading && !error && (
                        <ul className="space-y-2">
                            {codici.map(codice => (
                                <li key={codice.id} className="flex justify-between items-center p-2 border rounded-md bg-gray-50">
                                    <div className="flex items-center gap-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            codice.tipo_codice === 'ST' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-700'
                                        }`}>
                                            {codice.tipo_codice === 'ST' ? 'Standard' : 'Occasionale'}
                                        </span>
                                        <span className="font-mono text-gray-800">{codice.codice_articolo_fornitore}</span>
                                        <span className="text-sm text-gray-600">{codice.nome_fornitore || 'Fornitore non specificato'}</span>
                                    </div>
                                    {hasPermission('CT_COD_FORN_MANAGE') && (
                                        <button onClick={() => handleDeleteCodice(codice.id)} className="p-1 text-red-500 hover:text-red-700">
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    )}
                                </li>
                            ))}
                            {codici.length === 0 && <p className="text-gray-500 text-center py-4">Nessun codice fornitore associato.</p>}
                        </ul>
                    )}
                </div>

                {hasPermission('CT_COD_FORN_MANAGE') && (
                    <form onSubmit={handleAddCodice} className="p-4 border-t bg-gray-50 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <input
                                type="text"
                                name="codice_articolo_fornitore"
                                value={newCodiceData.codice_articolo_fornitore}
                                onChange={handleInputChange}
                                placeholder="Codice Articolo del Fornitore"
                                className="p-2 border rounded-md"
                                required
                            />
                            <select name="id_anagrafica_fornitore" value={newCodiceData.id_anagrafica_fornitore} onChange={handleInputChange} className="p-2 border rounded-md bg-white">
                                <option value="">-- Fornitore (Opzionale) --</option>
                                {fornitori.map(f => <option key={f.id} value={f.id}>{f.ragione_sociale}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center gap-6">
                            <label className="font-medium">Tipo Codice:</label>
                             <div className="flex items-center gap-4">
                                <label className="flex items-center">
                                    <input type="radio" name="tipo_codice" value="OCC" checked={newCodiceData.tipo_codice === 'OCC'} onChange={handleInputChange} className="h-4 w-4"/>
                                    <span className="ml-2">Occasionale</span>
                                </label>
                                <label className="flex items-center">
                                    <input type="radio" name="tipo_codice" value="ST" checked={newCodiceData.tipo_codice === 'ST'} onChange={handleInputChange} className="h-4 w-4"/>
                                    <span className="ml-2">Standard</span>
                                </label>
                             </div>
                        </div>
                        <div>
                             <button type="submit" className="w-full flex justify-center items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                <PlusIcon className="h-5 w-5 mr-2" /> Aggiungi Codice Fornitore
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default CodiciFornitoreManager;

