/**
 * @file opero-frontend/src/components/catalogo/IvaManager.js
 * @description componente react per la gestione delle aliquote iva.
 * - v1.5: aggiunta funzionalità di export in csv.
 * @date 2025-09-30
 * @version 1.5
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import AdvancedDataGrid from '../../shared/AdvancedDataGrid';
// ## AGGIORNAMENTO: Aggiunta icona per export ##
import { PlusIcon, ArrowPathIcon, PencilIcon, TrashIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid';

// --- Componente Modale per Creazione/Modifica (invariato) ---
const IvaFormModal = ({ item, onSave, onCancel }) => {
    const [formData, setFormData] = useState({ codice: '', descrizione: '', aliquota: '' });

    useEffect(() => {
        if (item) {
            setFormData({
                codice: item.codice || '',
                descrizione: item.descrizione || '',
                aliquota: item.aliquota !== undefined && item.aliquota !== null ? item.aliquota : ''
            });
        } else {
            setFormData({ codice: '', descrizione: '', aliquota: '' });
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
                <h2 className="text-xl font-bold mb-4">{item && item.id ? 'Modifica Aliquota IVA' : 'Nuova Aliquota IVA'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="codice" className="block text-sm font-medium text-gray-700">Codice</label>
                        <input type="text" name="codice" id="codice" value={formData.codice} onChange={handleChange} required disabled={!!(item && item.id)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent sm:text-sm disabled:bg-gray-100 disabled:border-gray-200" />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="descrizione" className="block text-sm font-medium text-gray-700">Descrizione</label>
                        <input type="text" name="descrizione" id="descrizione" value={formData.descrizione} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent sm:text-sm" />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="aliquota" className="block text-sm font-medium text-gray-700">Aliquota (%)</label>
                        <input type="number" name="aliquota" id="aliquota" value={formData.aliquota} onChange={handleChange} required step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent sm:text-sm" />
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

    useEffect(() => {
        fetchAliquote();
    }, [fetchAliquote]);

    const handleAdd = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };
    
    const handleEdit = (item) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (item) => {
        if (window.confirm(`Sei sicuro di voler eliminare l'aliquota "${item.descrizione}"?`)) {
            try {
                await api.delete(`/amministrazione/iva/${item.id}`);
                fetchAliquote();
            } catch (err) {
                alert('Errore durante l\'eliminazione: ' + (err.response?.data?.message || err.message));
            }
        }
    };

    const handleSave = async (data, itemId) => {
        try {
            if (itemId) {
                await api.patch(`/amministrazione/iva/${itemId}`, data);
            } else {
                await api.post('/amministrazione/iva', data);
            }
            fetchAliquote();
            setIsModalOpen(false);
            setEditingItem(null);
        } catch (err) {
            alert('Errore durante il salvataggio: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };
    
    // #####################################################################
    // ## NUOVA FUNZIONE: Logica per l'esportazione in formato CSV.
    // #####################################################################
    const handleExportCSV = () => {
        const header = "Codice;Descrizione;Aliquota\n";
        const csvContent = aliquote.map(row => 
            `"${row.codice}";"${row.descrizione}";"${parseFloat(row.aliquota).toFixed(2)}"`
        ).join("\n");

        const blob = new Blob([`\uFEFF${header}${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "aliquote_iva.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const columns = useMemo(() => [
        { header: 'Codice', accessorKey: 'codice' },
        { header: 'Descrizione', accessorKey: 'descrizione' },
        {
            header: 'Aliquota (%)',
            accessorKey: 'aliquota',
            cell: info => {
                const value = info.getValue();
                if (value === null || value === undefined) return '';
                const parsedValue = parseFloat(value);
                return isNaN(parsedValue) ? '' : `${parsedValue.toFixed(2)} %`;
            }
        },
        {
            header: 'Azioni',
            id: 'actions',
            cell: ({ row }) => (
                <div className="flex items-center justify-center gap-2">
                    {hasPermission('CT_IVA_MANAGE') && (
                        <>
                            <button onClick={() => handleEdit(row.original)} className="p-1 text-gray-500 hover:text-blue-600" title="Modifica">
                                <PencilIcon className="h-5 w-5"/>
                            </button>
                            <button onClick={() => handleDelete(row.original)} className="p-1 text-gray-500 hover:text-red-600" title="Elimina">
                                <TrashIcon className="h-5 w-5"/>
                            </button>
                        </>
                    )}
                </div>
            )
        }
    ], [hasPermission, aliquote]); // Aggiunto aliquote alle dipendenze per l'export

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold">Gestione Aliquote IVA</h1>
                <div className="flex items-center gap-2">
                    {/* ## NUOVO PULSANTE: Pulsante per avviare l'export CSV ## */}
                    <button onClick={handleExportCSV} className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">
                        <ArrowDownTrayIcon className="h-5 w-5 mr-1"/> CSV
                    </button>
                    {hasPermission('CT_IVA_MANAGE') && (
                        <button onClick={handleAdd} className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"><PlusIcon className="h-5 w-5 mr-1"/> Nuova</button>
                    )}
                    <button onClick={fetchAliquote} title="Ricarica dati" className="p-2 text-gray-500 hover:text-gray-800"><ArrowPathIcon className="h-5 w-5"/></button>
                 </div>
            </div>
            
            <AdvancedDataGrid
                columns={columns}
                data={aliquote}
                loading={loading}
                error={error}
            />

            {isModalOpen && (
                <IvaFormModal 
                    item={editingItem} 
                    onSave={handleSave} 
                    onCancel={handleCancel}
                />
            )}
        </div>
    );
};

export default IvaManager;

