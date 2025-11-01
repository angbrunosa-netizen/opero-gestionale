/**
 * @file opero-frontend/src/components/catalogo/UnitaMisuraManager.js
 * @description componente react per la gestione delle unità di misura.
 * - v1.4: Implementata la visualizzazione responsive a card per mobile.
 * @date 2024-05-21
 * @version 1.4 (responsive)
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import AdvancedDataGrid from '../../shared/AdvancedDataGrid';
import { PlusIcon, ArrowPathIcon, ArrowDownTrayIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';

// --- Componente Modale per Creazione/Modifica ---
// (Il codice di UnitaMisuraFormModal rimane invariato)
const UnitaMisuraFormModal = ({ item, onSave, onCancel }) => {
    const [formData, setFormData] = useState({ sigla: '', descrizione: '' });
    useEffect(() => { if (item) { setFormData({ sigla: item.sigla_um || '', descrizione: item.descrizione || '' }); } else { setFormData({ sigla: '', descrizione: '' }); } }, [item]);
    const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleSubmit = (e) => { e.preventDefault(); onSave(formData, item ? item.id : null); };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">{item && item.id ? 'Modifica Unità di Misura' : 'Nuova Unità di Misura'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4"><label htmlFor="sigla" className="block text-sm font-medium text-gray-700">Sigla</label><input type="text" name="sigla" id="sigla" value={formData.sigla} onChange={handleChange} required maxLength="10" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-600 sm:text-sm" /></div>
                    <div className="mb-4"><label htmlFor="descrizione" className="block text-sm font-medium text-gray-700">Descrizione</label><input type="text" name="descrizione" id="descrizione" value={formData.descrizione} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-600 sm:text-sm" /></div>
                    <div className="flex justify-end gap-4"><button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Annulla</button><button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Salva</button></div>
                </form>
            </div>
        </div>
    );
};

// NUOVO: Componente per i pulsanti di azione nella vista Desktop
const UnitaMisuraActionButtons = ({ item, hasPermission, onEdit, onDelete }) => (
    <div className="flex gap-2">
        {hasPermission('CT_UM_MANAGE') && (
            <>
                <button onClick={() => onEdit(item)} className="p-1 text-blue-600 hover:text-blue-800" title="Modifica"><PencilIcon className="h-5 w-5"/></button>
                <button onClick={() => onDelete(item)} className="p-1 text-red-600 hover:text-red-800" title="Elimina"><TrashIcon className="h-5 w-5"/></button>
            </>
        )}
    </div>
);

// NUOVO: Componente per i pulsanti di azione nella vista Mobile
const MobileUnitaMisuraActionButtons = ({ item, hasPermission, onEdit, onDelete }) => (
    <div className="flex flex-wrap gap-2 justify-end mt-4 pt-4 border-t border-gray-200">
        {hasPermission('CT_UM_MANAGE') && (
            <>
                <button onClick={() => onEdit(item)} className="flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm font-medium" title="Modifica"><PencilIcon className="h-4 w-4" /> Modifica</button>
                <button onClick={() => onDelete(item)} className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm font-medium" title="Elimina"><TrashIcon className="h-4 w-4" /> Elimina</button>
            </>
        )}
    </div>
);


// --- Componente Principale ---
const UnitaMisuraManager = () => {
    const { hasPermission } = useAuth();
    const [unitaMisure, setUnitaMisure] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const fetchUnitaMisure = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/catalogo/unita-misura');
            setUnitaMisure(response.data.data || []);
            setError(null);
        } catch (err) {
            setError('Errore nel caricamento delle unità di misura.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchUnitaMisure(); }, [fetchUnitaMisure]);

    const handleAdd = () => { setEditingItem(null); setIsModalOpen(true); };
    const handleEdit = (item) => { setEditingItem(item); setIsModalOpen(true); };
    const handleDelete = async (item) => { if (window.confirm(`Sei sicuro di voler eliminare l'unità di misura "${item.sigla_um}"?`)) { try { await api.delete(`/catalogo/unita-misura/${item.id}`); fetchUnitaMisure(); } catch (err) { alert('Errore durante l\'eliminazione: ' + (err.response?.data?.message || err.message)); } } };
    const handleSave = async (data, itemId) => { try { if (itemId) { await api.patch(`/catalogo/unita-misura/${itemId}`, data); } else { await api.post('/catalogo/unita-misura', data); } fetchUnitaMisure(); setIsModalOpen(false); setEditingItem(null); } catch (err) { alert('Errore durante il salvataggio: ' + (err.response?.data?.message || err.message)); } };
    const handleCancel = () => { setIsModalOpen(false); setEditingItem(null); };
    const handleExportCSV = () => { const header = "Sigla;Descrizione\n"; const csvContent = unitaMisure.map(row => `"${row.sigla_um}";"${row.descrizione}"`).join("\n"); const blob = new Blob([`\uFEFF${header}${csvContent}`], { type: 'text/csv;charset=utf-8;' }); const link = document.createElement("a"); const url = URL.createObjectURL(blob); link.setAttribute("href", url); link.setAttribute("download", "unita_di_misura.csv"); document.body.appendChild(link); link.click(); document.body.removeChild(link); };

    const columns = useMemo(() => [
        { header: 'Sigla', accessorKey: 'sigla_um' },
        { header: 'Descrizione', accessorKey: 'descrizione' },
        {
            header: 'Azioni', id: 'actions', cell: ({ row }) => (
                <UnitaMisuraActionButtons
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
                <h1 className="text-xl font-bold">Gestione Unità di Misura</h1>
                <div className="flex items-center gap-2">
                     <button onClick={handleExportCSV} className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"><ArrowDownTrayIcon className="h-5 w-5 mr-1"/> CSV</button>
                    {hasPermission('CT_UM_MANAGE') && (<button onClick={handleAdd} className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"><PlusIcon className="h-5 w-5 mr-1"/> Nuova</button>)}
                    <button onClick={fetchUnitaMisure} title="Ricarica dati" className="p-2 text-gray-500 hover:text-gray-800"><ArrowPathIcon className="h-5 w-5"/></button>
                </div>
            </div>
            
            {/* VISTA DESKTOP: Tabella */}
            <div className="hidden md:block">
                <AdvancedDataGrid columns={columns} data={unitaMisure} loading={loading} error={error} />
            </div>

            {/* NUOVO: VISTA MOBILE: Card */}
            <div className="md:hidden space-y-4">
                {loading && <div className="text-center p-4">Caricamento...</div>}
                {error && <div className="p-4 bg-red-100 text-red-700 rounded-md">{error}</div>}
                {!loading && !error && unitaMisure.length === 0 && <div className="text-center p-4 text-gray-500">Nessuna unità di misura trovata.</div>}
                {!loading && !error && unitaMisure.map(item => (
                    <div key={item.id} className="p-4 bg-white rounded-lg shadow border border-gray-200">
                        <div className="flex justify-between items-start">
                            <div className="flex-1 pr-2">
                                <h3 className="text-lg font-semibold text-gray-900 leading-tight">{item.descrizione}</h3>
                                <p className="text-sm text-gray-500 mt-1">Sigla: {item.sigla_um}</p>
                            </div>
                        </div>
                        <MobileUnitaMisuraActionButtons
                            item={item}
                            hasPermission={hasPermission}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    </div>
                ))}
            </div>

            {isModalOpen && (<UnitaMisuraFormModal item={editingItem} onSave={handleSave} onCancel={handleCancel} />)}
        </div>
    );
};

export default UnitaMisuraManager;