/**
 * @file opero-frontend/src/components/catalogo/UnitaMisuraManager.js
 * @description componente react per la gestione delle unità di misura.
 * - v1.3 (stabile): allineato al backend, usa 'sigla_um' per la lettura e 'sigla' per la scrittura.
 * @date 2025-09-30
 * @version 1.3
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import AdvancedDataGrid from '../../shared/AdvancedDataGrid';
import { PlusIcon, ArrowPathIcon, ArrowDownTrayIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';

// --- Componente Modale per Creazione/Modifica ---
const UnitaMisuraFormModal = ({ item, onSave, onCancel }) => {
    // Lo stato interno usa 'sigla' per coerenza con il form
    const [formData, setFormData] = useState({ sigla: '', descrizione: '' });

    useEffect(() => {
        if (item) {
            // Quando riceve un 'item' per la modifica, legge 'sigla_um' e lo mappa in 'sigla'
            setFormData({
                sigla: item.sigla_um || '',
                descrizione: item.descrizione || ''
            });
        } else {
            // Reset per un nuovo elemento
            setFormData({ sigla: '', descrizione: '' });
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
                <h2 className="text-xl font-bold mb-4">{item && item.id ? 'Modifica Unità di Misura' : 'Nuova Unità di Misura'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="sigla" className="block text-sm font-medium text-gray-700">Sigla</label>
                        <input type="text" name="sigla" id="sigla" value={formData.sigla} onChange={handleChange} required maxLength="10" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-600 sm:text-sm" />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="descrizione" className="block text-sm font-medium text-gray-700">Descrizione</label>
                        <input type="text" name="descrizione" id="descrizione" value={formData.descrizione} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-600 sm:text-sm" />
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
            console.log("Dati Unità di Misura ricevuti:", response.data.data);
            setUnitaMisure(response.data.data || []);
            setError(null);
        } catch (err) {
            setError('Errore nel caricamento delle unità di misura.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUnitaMisure();
    }, [fetchUnitaMisure]);

    const handleAdd = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };
    
    const handleEdit = (item) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (item) => {
        if (window.confirm(`Sei sicuro di voler eliminare l'unità di misura "${item.sigla_um}"?`)) {
            try {
                await api.delete(`/catalogo/unita-misura/${item.id}`);
                fetchUnitaMisure();
            } catch (err) {
                alert('Errore durante l\'eliminazione: ' + (err.response?.data?.message || err.message));
            }
        }
    };

    const handleSave = async (data, itemId) => {
        // I dati dal form arrivano con 'sigla', che è ciò che l'API si aspetta per POST/PATCH
        try {
            if (itemId) {
                await api.patch(`/catalogo/unita-misura/${itemId}`, data);
            } else {
                await api.post('/catalogo/unita-misura', data);
            }
            fetchUnitaMisure();
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
    
    const handleExportCSV = () => {
        const header = "Sigla;Descrizione\n";
        // Leggiamo 'sigla_um' dai dati per l'export
        const csvContent = unitaMisure.map(row => `"${row.sigla_um}";"${row.descrizione}"`).join("\n");
        const blob = new Blob([`\uFEFF${header}${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "unita_di_misura.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const columns = useMemo(() => [
        // La griglia legge 'sigla_um' dai dati ricevuti
        { header: 'Sigla', accessorKey: 'sigla_um' },
        { header: 'Descrizione', accessorKey: 'descrizione' },
        {
            header: 'Azioni',
            id: 'actions',
            cell: ({ row }) => (
                <div className="flex gap-2">
                    {hasPermission('CT_UM_MANAGE') && (
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
                <h1 className="text-xl font-bold">Gestione Unità di Misura</h1>
                <div className="flex items-center gap-2">
                     <button onClick={handleExportCSV} className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"><ArrowDownTrayIcon className="h-5 w-5 mr-1"/> CSV</button>
                    {hasPermission('CT_UM_MANAGE') && (
                        <button onClick={handleAdd} className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"><PlusIcon className="h-5 w-5 mr-1"/> Nuova</button>
                    )}
                    <button onClick={fetchUnitaMisure} title="Ricarica dati" className="p-2 text-gray-500 hover:text-gray-800"><ArrowPathIcon className="h-5 w-5"/></button>
                 </div>
            </div>
            
            <AdvancedDataGrid
                columns={columns}
                data={unitaMisure}
                loading={loading}
                error={error}
            />

            {isModalOpen && (
                <UnitaMisuraFormModal 
                    item={editingItem} 
                    onSave={handleSave} 
                    onCancel={handleCancel}
                />
            )}
        </div>
    );
};

export default UnitaMisuraManager;

