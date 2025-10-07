/**
 * @file opero-frontend/src/components/vendite/GruppiClientiManager.js
 * @description Componente per la gestione dell'anagrafica dei gruppi clienti.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../../services/api';
import AdvancedDataGrid from '../../shared/AdvancedDataGrid';
import { useAuth } from '../../context/AuthContext';
import { PlusIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';
import ConfirmationModal from '../../shared/ConfirmationModal';

// Sotto-componente per il form modale
const FormModal = ({ item, onSave, onCancel }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        setFormData(item || { codice: '', descrizione: '' });
    }, [item]);

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">{item ? 'Modifica Gruppo Cliente' : 'Nuovo Gruppo Cliente'}</h2>
                <div className="space-y-4">
                    <input type="text" name="codice" value={formData.codice || ''} onChange={handleChange} placeholder="Codice" className="input-style" required />
                    <input type="text" name="descrizione" value={formData.descrizione || ''} onChange={handleChange} placeholder="Descrizione" className="input-style" required />
                </div>
                <div className="flex justify-end mt-6">
                    <button type="button" onClick={onCancel} className="btn-secondary mr-2">Annulla</button>
                    <button type="submit" className="btn-primary">Salva</button>
                </div>
            </form>
        </div>
    );
};

const GruppiClientiManager = () => {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);
    const { hasPermission } = useAuth();

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/vendite/gruppi');
            setItems(response.data);
        } catch (error) {
            toast.error("Errore nel recupero dei gruppi clienti.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSave = async (formData) => {
        try {
            if (formData.id) {
                await api.put(`/vendite/gruppi/${formData.id}`, formData);
                toast.success('Gruppo cliente aggiornato con successo!');
            } else {
                await api.post('/vendite/gruppi', formData);
                toast.success('Gruppo cliente creato con successo!');
            }
            fetchData();
        } catch (error) {
            toast.error("Errore durante il salvataggio del gruppo cliente.");
        } finally {
            setIsModalOpen(false);
            setEditingItem(null);
        }
    };
    
    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await api.delete(`/vendite/gruppi/${itemToDelete.id}`);
            toast.success("Gruppo cliente eliminato con successo.");
            fetchData();
        } catch (error) {
            toast.error("Errore durante l'eliminazione del gruppo cliente.");
        } finally {
            setItemToDelete(null);
        }
    };

    const columns = useMemo(() => [
        { accessorKey: 'codice', header: 'Codice' },
        { accessorKey: 'descrizione', header: 'Descrizione' },
    ], []);

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Anagrafica Gruppi Clienti</h3>
                {hasPermission('VA_CLIENTI_MANAGE') && (
                    <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="btn-primary">
                        <PlusIcon className="h-5 w-5 mr-2" /> Nuovo Gruppo
                    </button>
                )}
            </div>
            <AdvancedDataGrid
                columns={columns}
                data={items}
                isLoading={isLoading}
                onEdit={hasPermission('VA_CLIENTI_MANAGE') ? (item) => { setEditingItem(item); setIsModalOpen(true); } : null}
                onDelete={hasPermission('VA_CLIENTI_MANAGE') ? setItemToDelete : null}
            />
            {isModalOpen && <FormModal item={editingItem} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />}
            {itemToDelete && (
                <ConfirmationModal
                    message={`Sei sicuro di voler eliminare il gruppo "${itemToDelete.descrizione}"?`}
                    onConfirm={confirmDelete}
                    onCancel={() => setItemToDelete(null)}
                />
            )}
        </div>
    );
};

export default GruppiClientiManager;
