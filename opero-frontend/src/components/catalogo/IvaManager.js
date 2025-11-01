/**
 * @file opero-frontend/src/components/catalogo/IvaManager.js
 * @description componente react per la gestione delle aliquote iva.
 * - v1.6: Implementata la visualizzazione responsive a card per mobile.
 * @date 2024-05-21
 * @version 1.6 (responsive)
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import AdvancedDataGrid from '../../shared/AdvancedDataGrid';
import { PlusIcon, ArrowPathIcon, PencilIcon, TrashIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid';

// --- Componente Modale per Creazione/Modifica ---
// (Il codice di IvaFormModal rimane invariato)
const IvaFormModal = ({ item, onSave, onCancel }) => {
    const [formData, setFormData] = useState({ codice: '', descrizione: '', aliquota: '' });
    useEffect(() => { if (item) { setFormData({ codice: item.codice || '', descrizione: item.descrizione || '', aliquota: item.aliquota !== undefined && item.aliquota !== null ? item.aliquota : '' }); } else { setFormData({ codice: '', descrizione: '', aliquota: '' }); } }, [item]);
    const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleSubmit = (e) => { e.preventDefault(); onSave(formData, item ? item.id : null); };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">{item && item.id ? 'Modifica Aliquota IVA' : 'Nuova Aliquota IVA'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4"><label htmlFor="codice" className="block text-sm font-medium text-gray-700">Codice</label><input type="text" name="codice" id="codice" value={formData.codice} onChange={handleChange} required disabled={!!(item && item.id)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent sm:text-sm disabled:bg-gray-100 disabled:border-gray-200" /></div>
                    <div className="mb-4"><label htmlFor="descrizione" className="block text-sm font-medium text-gray-700">Descrizione</label><input type="text" name="descrizione" id="descrizione" value={formData.descrizione} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent sm:text-sm" /></div>
                    <div className="mb-4"><label htmlFor="aliquota" className="block text-sm font-medium text-gray-700">Aliquota (%)</label><input type="number" name="aliquota" id="aliquota" value={formData.aliquota} onChange={handleChange} required step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent sm:text-sm" /></div>
                    <div className="flex justify-end gap-4"><button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Annulla</button><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Salva</button></div>
                </form>
            </div>
        </div>
    );
};

// NUOVO: Componente per i pulsanti di azione nella vista Desktop
const IvaActionButtons = ({ item, hasPermission, onEdit, onDelete }) => (
    <div className="flex items-center justify-center gap-2">
        {hasPermission('CT_IVA_MANAGE') && (
            <>
                <button onClick={() => onEdit(item)} className="p-1 text-gray-500 hover:text-blue-600" title="Modifica"><PencilIcon className="h-5 w-5"/></button>
                <button onClick={() => onDelete(item)} className="p-1 text-gray-500 hover:text-red-600" title="Elimina"><TrashIcon className="h-5 w-5"/></button>
            </>
        )}
    </div>
);

// NUOVO: Componente per i pulsanti di azione nella vista Mobile
const MobileIvaActionButtons = ({ item, hasPermission, onEdit, onDelete }) => (
    <div className="flex flex-wrap gap-2 justify-end mt-4 pt-4 border-t border-gray-200">
        {hasPermission('CT_IVA_MANAGE') && (
            <>
                <button onClick={() => onEdit(item)} className="flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm font-medium" title="Modifica"><PencilIcon className="h-4 w-4" /> Modifica</button>
                <button onClick={() => onDelete(item)} className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm font-medium" title="Elimina"><TrashIcon className="h-4 w-4" /> Elimina</button>
            </>
        )}
    </div>
);


// --- Componente Principale ---
const IvaManager = () => {
    const { hasPermission } = useAuth();
    const [aliquote, setAliquote] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const fetchAliquote = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/amministrazione/iva');
            const plainData = JSON.parse(JSON.stringify(response.data.data || []));
            setAliquote(plainData);
            setError(null);
        } catch (err) {
            setError('Errore nel caricamento delle aliquote IVA.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAliquote(); }, [fetchAliquote]);

    const handleAdd = () => { setEditingItem(null); setIsModalOpen(true); };
    const handleEdit = (item) => { setEditingItem(item); setIsModalOpen(true); };
    const handleDelete = async (item) => { if (window.confirm(`Sei sicuro di voler eliminare l'aliquota "${item.descrizione}"?`)) { try { await api.delete(`/amministrazione/iva/${item.id}`); fetchAliquote(); } catch (err) { alert('Errore durante l\'eliminazione: ' + (err.response?.data?.message || err.message)); } } };
    const handleSave = async (data, itemId) => { try { if (itemId) { await api.patch(`/amministrazione/iva/${itemId}`, data); } else { await api.post('/amministrazione/iva', data); } fetchAliquote(); setIsModalOpen(false); setEditingItem(null); } catch (err) { alert('Errore durante il salvataggio: ' + (err.response?.data?.message || err.message)); } };
    const handleCancel = () => { setIsModalOpen(false); setEditingItem(null); };
    const handleExportCSV = () => { const header = "Codice;Descrizione;Aliquota\n"; const csvContent = aliquote.map(row => `"${row.codice}";"${row.descrizione}";"${parseFloat(row.aliquota).toFixed(2)}"`).join("\n"); const blob = new Blob([`\uFEFF${header}${csvContent}`], { type: 'text/csv;charset=utf-8;' }); const link = document.createElement("a"); const url = URL.createObjectURL(blob); link.setAttribute("href", url); link.setAttribute("download", "aliquote_iva.csv"); document.body.appendChild(link); link.click(); document.body.removeChild(link); };

    const columns = useMemo(() => [
        { header: 'Codice', accessorKey: 'codice' },
        { header: 'Descrizione', accessorKey: 'descrizione' },
        { header: 'Aliquota (%)', accessorKey: 'aliquota', cell: info => { const value = info.getValue(); if (value === null || value === undefined) return ''; const parsedValue = parseFloat(value); return isNaN(parsedValue) ? '' : `${parsedValue.toFixed(2)} %`; } },
        {
            header: 'Azioni', id: 'actions', cell: ({ row }) => (
                <IvaActionButtons
                    item={row.original}
                    hasPermission={hasPermission}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )
        }
    ], [hasPermission, handleEdit, handleDelete]);

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold">Gestione Aliquote IVA</h1>
                <div className="flex items-center gap-2">
                    <button onClick={handleExportCSV} className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"><ArrowDownTrayIcon className="h-5 w-5 mr-1"/> CSV</button>
                    {hasPermission('CT_IVA_MANAGE') && (<button onClick={handleAdd} className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"><PlusIcon className="h-5 w-5 mr-1"/> Nuova</button>)}
                    <button onClick={fetchAliquote} title="Ricarica dati" className="p-2 text-gray-500 hover:text-gray-800"><ArrowPathIcon className="h-5 w-5"/></button>
                </div>
            </div>
            
            {/* VISTA DESKTOP: Tabella */}
            <div className="hidden md:block">
                <AdvancedDataGrid columns={columns} data={aliquote} loading={loading} error={error} />
            </div>

            {/* NUOVO: VISTA MOBILE: Card */}
            <div className="md:hidden space-y-4">
                {loading && <div className="text-center p-4">Caricamento...</div>}
                {error && <div className="p-4 bg-red-100 text-red-700 rounded-md">{error}</div>}
                {!loading && !error && aliquote.length === 0 && <div className="text-center p-4 text-gray-500">Nessuna aliquota IVA trovata.</div>}
                {!loading && !error && aliquote.map(item => (
                    <div key={item.id} className="p-4 bg-white rounded-lg shadow border border-gray-200">
                        <div className="flex justify-between items-start">
                            <div className="flex-1 pr-2">
                                <h3 className="text-lg font-semibold text-gray-900 leading-tight">{item.descrizione}</h3>
                                <p className="text-sm text-gray-500 mt-1">Codice: {item.codice}</p>
                            </div>
                            <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full whitespace-nowrap">
                                {parseFloat(item.aliquota).toFixed(2)} %
                            </span>
                        </div>
                        <MobileIvaActionButtons
                            item={item}
                            hasPermission={hasPermission}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    </div>
                ))}
            </div>

            {isModalOpen && (<IvaFormModal item={editingItem} onSave={handleSave} onCancel={handleCancel} />)}
        </div>
    );
};

export default IvaManager;