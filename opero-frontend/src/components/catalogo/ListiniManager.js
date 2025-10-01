/**
 * @file opero-frontend/src/components/catalogo/ListiniManager.js
 * @description Componente modale per la gestione avanzata dei listini di un'entità.
 * - v2.2: Aggiunta la visualizzazione del costo base nel form per un contesto immediato.
 * @date 2025-10-02
 * @version 2.2
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import AdvancedDataGrid from '../../shared/AdvancedDataGrid';
import { PlusIcon, ArrowPathIcon, XMarkIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';

// --- Sotto-Componente: Form di Creazione/Modifica Listino ---
const ListinoFormModal = ({ listino, onSave, onCancel, entita, aliquotaIva }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        const initialState = { nome_listino: '', data_inizio_validita: new Date().toISOString().slice(0, 10), data_fine_validita: null };
        for (let i = 1; i <= 6; i++) {
            initialState[`ricarico_cessione_${i}`] = 0;
            initialState[`prezzo_cessione_${i}`] = 0;
            initialState[`ricarico_pubblico_${i}`] = 0;
            initialState[`prezzo_pubblico_${i}`] = 0;
        }
        setFormData(listino ? { ...initialState, ...listino } : initialState);
    }, [listino]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value === '' ? null : value }));
    };

    const handlePriceChange = (index, type, value) => {
        const numericValue = parseFloat(value) || 0;
        let newFormData = { ...formData };
        
        const costoBase = parseFloat(entita.costo_base) || 0;
        const ivaRate = 1 + (aliquotaIva / 100);

        const ricaricoCessKey = `ricarico_cessione_${index}`;
        const cessioneKey = `prezzo_cessione_${index}`;
        const ricaricoPubblKey = `ricarico_pubblico_${index}`;
        const pubblicoKey = `prezzo_pubblico_${index}`;

        if (type === 'ricarico_cessione') {
            newFormData[ricaricoCessKey] = numericValue;
            const prezzoCessione = costoBase * (1 + numericValue / 100);
            newFormData[cessioneKey] = prezzoCessione.toFixed(2);
            
            const ricaricoPubblico = parseFloat(newFormData[ricaricoPubblKey]) || 0;
            const prezzoSenzaIva = prezzoCessione * (1 + ricaricoPubblico / 100);
            newFormData[pubblicoKey] = (prezzoSenzaIva * ivaRate).toFixed(2);
        } else if (type === 'cessione') {
            newFormData[cessioneKey] = numericValue;
            if (costoBase > 0) {
                newFormData[ricaricoCessKey] = (((numericValue / costoBase) - 1) * 100).toFixed(2);
            } else {
                newFormData[ricaricoCessKey] = 0;
            }
            const ricaricoPubblico = parseFloat(newFormData[ricaricoPubblKey]) || 0;
            const prezzoSenzaIva = numericValue * (1 + ricaricoPubblico / 100);
            newFormData[pubblicoKey] = (prezzoSenzaIva * ivaRate).toFixed(2);
        } else if (type === 'ricarico_pubblico') {
            newFormData[ricaricoPubblKey] = numericValue;
            const prezzoCessione = parseFloat(newFormData[cessioneKey]) || 0;
            const prezzoSenzaIva = prezzoCessione * (1 + numericValue / 100);
            newFormData[pubblicoKey] = (prezzoSenzaIva * ivaRate).toFixed(2);
        } else { // 'pubblico'
            newFormData[pubblicoKey] = numericValue;
            const prezzoCessione = parseFloat(newFormData[cessioneKey]) || 0;
            if (prezzoCessione > 0) {
                const prezzoSenzaIva = numericValue / ivaRate;
                newFormData[ricaricoPubblKey] = (((prezzoSenzaIva / prezzoCessione) - 1) * 100).toFixed(2);
            } else {
                newFormData[ricaricoPubblKey] = 0;
            }
        }
        setFormData(newFormData);
    };

    const handleSubmit = (e) => { e.preventDefault(); onSave(formData, listino ? listino.id : null); };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[60]">
             <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                <h2 className="text-xl font-bold mb-4">{listino ? 'Modifica Listino' : 'Nuovo Listino'}</h2>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pb-4 border-b">
                        <div>
                            <label className="text-sm font-medium">Nome Listino</label>
                            <input type="text" name="nome_listino" value={formData.nome_listino || ''} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Inizio Validità</label>
                            <input type="date" name="data_inizio_validita" value={formData.data_inizio_validita ? new Date(formData.data_inizio_validita).toISOString().slice(0,10) : ''} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Fine Validità (opzionale)</label>
                            <input type="date" name="data_fine_validita" value={formData.data_fine_validita ? new Date(formData.data_fine_validita).toISOString().slice(0,10) : ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
                        </div>
                    </div>

                    {/* ############################################################### */}
                    {/* ## NUOVA IMPLEMENTAZIONE: Visualizzazione del Costo Base       ## */}
                    {/* ############################################################### */}
                    <div className="mb-6 p-3 bg-indigo-50 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-medium text-indigo-800">Costo Base di Riferimento:</span>
                        <span className="ml-2 text-lg font-bold text-indigo-900">€ {parseFloat(entita.costo_base || 0).toFixed(2)}</span>
                    </div>

                    <div className="space-y-3">
                        {[...Array(6)].map((_, i) => {
                            const index = i + 1;
                            return (
                                <div key={index} className="grid grid-cols-5 gap-3 items-center p-3 border rounded-lg bg-gray-50">
                                    <div className="font-bold text-gray-700">Listino {index}</div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500">Ric. Cessione %</label>
                                        <input type="number" step="0.01" value={formData[`ricarico_cessione_${index}`] || 0} onChange={(e) => handlePriceChange(index, 'ricarico_cessione', e.target.value)} className="mt-1 block w-full text-sm rounded-md border-gray-300"/>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500">P. Cessione</label>
                                        <input type="number" step="0.01" value={formData[`prezzo_cessione_${index}`] || 0} onChange={(e) => handlePriceChange(index, 'cessione', e.target.value)} className="mt-1 block w-full text-sm rounded-md border-gray-300"/>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500">Ric. Pubblico %</label>
                                        <input type="number" step="0.01" value={formData[`ricarico_pubblico_${index}`] || 0} onChange={(e) => handlePriceChange(index, 'ricarico_pubblico', e.target.value)} className="mt-1 block w-full text-sm rounded-md border-gray-300"/>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500">P. Pubblico (IVA incl.)</label>
                                        <input type="number" step="0.01" value={formData[`prezzo_pubblico_${index}`] || 0} onChange={(e) => handlePriceChange(index, 'pubblico', e.target.value)} className="mt-1 block w-full text-sm rounded-md border-gray-300"/>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-6 pt-4 border-t flex justify-end gap-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-md">Annulla</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Salva</button>
                    </div>
                </form>
             </div>
        </div>
    );
};


// --- Componente Principale: Gestore Listini ---
const ListiniManager = ({ entita, onClose, aliquoteIva }) => {
    const { hasPermission } = useAuth();
    const [listini, setListini] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingListino, setEditingListino] = useState(null);

    const aliquotaCorrente = useMemo(() => {
        if (!entita || !aliquoteIva) return 0;
        const iva = aliquoteIva.find(i => i.id === entita.id_aliquota_iva);
        return iva ? parseFloat(iva.aliquota) : 0;
    }, [entita, aliquoteIva]);

    const fetchListini = useCallback(async () => {
        if (!entita?.id) return;
        setLoading(true);
        try {
            const response = await api.get(`/catalogo/entita/${entita.id}/listini`);
            setListini(response.data.data || []);
            setError(null);
        } catch (err) {
            setError('Errore nel caricamento dei listini.');
        } finally {
            setLoading(false);
        }
    }, [entita]);

    useEffect(() => { fetchListini(); }, [fetchListini]);

    const handleSave = async (data, listinoId) => {
        try {
            if (listinoId) {
                await api.patch(`/catalogo/listini/${listinoId}`, data);
            } else {
                await api.post(`/catalogo/entita/${entita.id}/listini`, data);
            }
            fetchListini();
            setIsFormOpen(false);
        } catch (err) {
            alert('Errore durante il salvataggio del listino: ' + (err.response?.data?.message || err.message));
        }
    };
    
    const handleAdd = () => { setEditingListino(null); setIsFormOpen(true); };
    const handleEdit = (listino) => { setEditingListino(listino); setIsFormOpen(true); };
    const handleDelete = async (listino) => {
        if (window.confirm(`Sei sicuro di voler eliminare il listino "${listino.nome_listino}"?`)) {
            try {
                await api.delete(`/catalogo/listini/${listino.id}`);
                fetchListini();
            } catch (err) {
                alert('Errore durante l\'eliminazione: ' + (err.response?.data?.message || err.message));
            }
        }
    };

    const columns = useMemo(() => [
        { header: 'Nome', accessorKey: 'nome_listino' },
        { header: 'Inizio Validità', accessorKey: 'data_inizio_validita', cell: info => new Date(info.getValue()).toLocaleDateString('it-IT') },
        { header: 'Fine Validità', accessorKey: 'data_fine_validita', cell: info => info.getValue() ? new Date(info.getValue()).toLocaleDateString('it-IT') : 'Senza Scadenza' },
        { header: 'P. Cessione 1', accessorKey: 'prezzo_cessione_1', cell: info => `€ ${parseFloat(info.getValue() || 0).toFixed(2)}` },
        {
            header: 'Azioni', id: 'actions', cell: ({row}) => (
                <div className="flex gap-2">
                    {hasPermission('CT_LISTINI_MANAGE') && (
                        <>
                            <button onClick={() => handleEdit(row.original)} className="p-1 text-blue-600 hover:text-blue-800" title="Modifica"><PencilIcon className="h-5 w-5"/></button>
                            <button onClick={() => handleDelete(row.original)} className="p-1 text-red-600 hover:text-red-800" title="Elimina"><TrashIcon className="h-5 w-5"/></button>
                        </>
                    )}
                </div>
            )
        }
    ], [hasPermission]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-slate-50 rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
                <header className="flex justify-between items-center p-4 border-b">
                    <div>
                        <h2 className="text-xl font-bold">Gestione Listini</h2>
                        <p className="text-sm text-gray-600">{entita.codice_entita} - {entita.descrizione}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800"><XMarkIcon className="h-6 w-6"/></button>
                </header>
                <main className="flex-1 p-4 overflow-y-auto">
                    <div className="flex justify-end mb-4 items-center gap-2">
                        {hasPermission('CT_LISTINI_MANAGE') && <button onClick={handleAdd} className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md text-sm"><PlusIcon className="h-5 w-5 mr-1"/> Nuovo Listino</button>}
                         <button onClick={fetchListini} title="Ricarica Dati" className="p-2 text-gray-500 hover:text-gray-800"><ArrowPathIcon className="h-5 w-5"/></button>
                    </div>
                    <AdvancedDataGrid columns={columns} data={listini} loading={loading} error={error} />
                </main>

                {isFormOpen && (
                    <ListinoFormModal 
                        listino={editingListino}
                        onSave={handleSave}
                        onCancel={() => setIsFormOpen(false)}
                        entita={entita}
                        aliquotaIva={aliquotaCorrente}
                    />
                )}
            </div>
        </div>
    );
};

export default ListiniManager;

