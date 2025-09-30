/**
 * @file opero-frontend/src/components/catalogo/StatiEntitaManager.js
 * @description Componente React per la gestione della tabella di supporto "Stati Entità".
 * @date 2025-09-30
 * @version 1.0 (stabile)
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import AdvancedDataGrid from '../../shared/AdvancedDataGrid';
import { PlusIcon, ArrowPathIcon, PencilIcon, TrashIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid';

// --- Componente Modale per Creazione/Modifica ---
const StatoFormModal = ({ item, onSave, onCancel }) => {
    const [formData, setFormData] = useState({ codice: '', descrizione: '', visibilita: '' });

    useEffect(() => {
        if (item) {
            setFormData({
                codice: item.codice || '',
                descrizione: item.descrizione || '',
                visibilita: item.visibilita || ''
            });
        } else {
            setFormData({ codice: '', descrizione: '', visibilita: '' });
        }
    }, [item]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData, item ? item.id : null);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">{item && item.id ? 'Modifica Stato' : 'Nuovo Stato'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="codice" className="block text-sm font-medium text-gray-700">Codice (max 3 caratteri)</label>
                        <input type="text" name="codice" id="codice" value={formData.codice} onChange={handleChange} required maxLength="3" disabled={!!(item && item.id)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50 focus:border-transparent sm:text-sm disabled:bg-gray-100" />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="descrizione" className="block text-sm font-medium text-gray-700">Descrizione</label>
                        <input type="text" name="descrizione" id="descrizione" value={formData.descrizione} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50 focus:border-transparent sm:text-sm" />
                    </div>
                     <div className="mb-4">
                        <label htmlFor="visibilita" className="block text-sm font-medium text-gray-700">Visibilità</label>
                        <input type="text" name="visibilita" id="visibilita" value={formData.visibilita} onChange={handleChange} placeholder="Es: PREVENTIVO, ORDINE (vuoto per sempre visibile)" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50 focus:border-transparent sm:text-sm" />
                    </div>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Annulla</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Salva</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Componente Principale ---
const StatiEntitaManager = () => {
    const { hasPermission } = useAuth();
    const [stati, setStati] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/catalogo/stati-entita');
            setStati(response.data.data || []);
            setError(null);
        } catch (err) {
            setError('Errore nel caricamento degli stati.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAdd = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };
    
    const handleEdit = (item) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (item) => {
        if (window.confirm(`Sei sicuro di voler eliminare lo stato "${item.descrizione}"?`)) {
            try {
                await api.delete(`/catalogo/stati-entita/${item.id}`);
                fetchData();
            } catch (err) {
                alert('Errore: ' + (err.response?.data?.message || err.message));
            }
        }
    };

    const handleSave = async (data, itemId) => {
        try {
            if (itemId) {
                await api.patch(`/catalogo/stati-entita/${itemId}`, data);
            } else {
                await api.post('/catalogo/stati-entita', data);
            }
            fetchData();
            setIsModalOpen(false);
            setEditingItem(null);
        } catch (err) {
            alert('Errore: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleExportCSV = () => {
        const header = "Codice;Descrizione;Visibilita\n";
        const csvContent = stati.map(row => `"${row.codice}";"${row.descrizione}";"${row.visibilita || ''}"`).join("\n");
        const blob = new Blob([`\uFEFF${header}${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "stati_entita_catalogo.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const columns = useMemo(() => [
        { header: 'Codice', accessorKey: 'codice' },
        { header: 'Descrizione', accessorKey: 'descrizione' },
        { header: 'Visibilità', accessorKey: 'visibilita' },
        {
            header: 'Azioni',
            id: 'actions',
            cell: ({ row }) => (
                <div className="flex gap-2">
                    {hasPermission('CT_STATI_MANAGE') && (
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
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold">Gestione Stati Entità Catalogo</h1>
                <div className="flex items-center gap-2">
                    <button onClick={handleExportCSV} className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"><ArrowDownTrayIcon className="h-5 w-5 mr-1"/> CSV</button>
                    {hasPermission('CT_STATI_MANAGE') && (
                        <button onClick={handleAdd} className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"><PlusIcon className="h-5 w-5 mr-1"/> Nuovo</button>
                    )}
                    <button onClick={fetchData} title="Ricarica dati" className="p-2 text-gray-500 hover:text-gray-800"><ArrowPathIcon className="h-5 w-5"/></button>
                 </div>
            </div>
            
            <AdvancedDataGrid
                columns={columns}
                data={stati}
                loading={loading}
                error={error}
            />

            {isModalOpen && (
                <StatoFormModal 
                    item={editingItem} 
                    onSave={handleSave} 
                    onCancel={handleCancel}
                />
            )}
        </div>
    );
};

export default StatiEntitaManager;

