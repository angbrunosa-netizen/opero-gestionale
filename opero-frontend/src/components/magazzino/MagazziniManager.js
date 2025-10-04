/**
 * @file opero-frontend/src/components/magazzino/MagazziniManager.js
 * @description Componente per la gestione dell'anagrafica dei magazzini (depositi).
 * @version 1.0
 * @date 2025-10-04
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../../services/api';
import AdvancedDataGrid from '../../shared/AdvancedDataGrid';
import { useAuth } from '../../context/AuthContext';
import { PlusIcon } from '@heroicons/react/24/solid';

// Sotto-componente per il form modale
const MagazzinoFormModal = ({ item, onSave, onCancel }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        setFormData(item || { codice: '', descrizione: '', note: '' });
    }, [item]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">{item ? 'Modifica Magazzino' : 'Nuovo Magazzino'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Codice</label>
                        <input type="text" name="codice" value={formData.codice || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Descrizione</label>
                        <input type="text" name="descrizione" value={formData.descrizione || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Note</label>
                        <textarea name="note" value={formData.note || ''} onChange={handleChange} rows="3" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"></textarea>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400">Annulla</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Salva</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const MagazziniManager = () => {
    const { hasPermission } = useAuth();
    const [magazzini, setMagazzini] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingItem, setEditingItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/magazzino/magazzini');
            setMagazzini(response.data);
        } catch (error) {
            console.error("Errore caricamento magazzini", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSave = async (itemData) => {
        try {
            if (itemData.id) {
                await api.patch(`/magazzino/magazzini/${itemData.id}`, itemData);
            } else {
                await api.post('/magazzino/magazzini', itemData);
            }
            fetchData();
        } catch (error) {
            console.error("Errore salvataggio magazzino", error);
        } finally {
            setIsModalOpen(false);
            setEditingItem(null);
        }
    };

    const columns = useMemo(() => [
        { accessorKey: 'codice', header: 'Codice' },
        { accessorKey: 'descrizione', header: 'Descrizione' },
        { accessorKey: 'note', header: 'Note' },
    ], []);

    return (
        <div>
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Anagrafica Magazzini</h3>
                {hasPermission('MG_CONFIG_MANAGE') && (
                    <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Nuovo Magazzino
                    </button>
                )}
            </div>
            <AdvancedDataGrid
                columns={columns}
                data={magazzini}
                isLoading={isLoading}
                onEdit={hasPermission('MG_CONFIG_MANAGE') ? (item) => { setEditingItem(item); setIsModalOpen(true); } : null}
            />
            {isModalOpen && <MagazzinoFormModal item={editingItem} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />}
        </div>
    );
};

export default MagazziniManager;
