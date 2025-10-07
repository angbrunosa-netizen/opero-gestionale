/**
 * @file opero-frontend/src/components/vendite/TrasportatoriManager.js
 * @description Componente per la gestione dell'anagrafica dei trasportatori.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../../services/api';
import AdvancedDataGrid from '../../shared/AdvancedDataGrid';
import { useAuth } from '../../context/AuthContext';
import { PlusIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';
import ConfirmationModal from '../../shared/ConfirmationModal';

const FormModal = ({ item, onSave, onCancel }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        setFormData(item || { ragione_sociale: '', referente: '', telefono: '' });
    }, [item]);

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">{item ? 'Modifica Trasportatore' : 'Nuovo Trasportatore'}</h2>
                <div className="space-y-4">
                    <input type="text" name="ragione_sociale" value={formData.ragione_sociale || ''} onChange={handleChange} placeholder="Ragione Sociale" className="input-style" required />
                    <input type="text" name="referente" value={formData.referente || ''} onChange={handleChange} placeholder="Referente" className="input-style" />
                    <input type="text" name="telefono" value={formData.telefono || ''} onChange={handleChange} placeholder="Telefono" className="input-style" />
                </div>
                <div className="flex justify-end mt-6">
                    <button type="button" onClick={onCancel} className="btn-secondary mr-2">Annulla</button>
                    <button type="submit" className="btn-primary">Salva</button>
                </div>
            </form>
        </div>
    );
};

const TrasportatoriManager = () => {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);
    const { hasPermission } = useAuth();

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/vendite/trasportatori');
            setItems(response.data);
        } catch (error) { toast.error("Errore nel recupero dei trasportatori."); } 
        finally { setIsLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSave = async (formData) => {
        try {
            if (formData.id) {
                await api.put(`/vendite/trasportatori/${formData.id}`, formData);
                toast.success('Trasportatore aggiornato con successo!');
            } else {
                await api.post('/vendite/trasportatori', formData);
                toast.success('Trasportatore creato con successo!');
            }
            fetchData();
        } catch (error) { toast.error("Errore durante il salvataggio del trasportatore."); } 
        finally { setIsModalOpen(false); setEditingItem(null); }
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await api.delete(`/vendite/trasportatori/${itemToDelete.id}`);
            toast.success("Trasportatore eliminato con successo.");
            fetchData();
        } catch (error) { toast.error("Errore durante l'eliminazione del trasportatore."); } 
        finally { setItemToDelete(null); }
    };
    
    const columns = useMemo(() => [
        { accessorKey: 'ragione_sociale', header: 'Ragione Sociale' },
        { accessorKey: 'referente', header: 'Referente' },
        { accessorKey: 'telefono', header: 'Telefono' },
    ], []);

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Anagrafica Trasportatori</h3>
                {hasPermission('VA_CLIENTI_MANAGE') && (
                    <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="btn-primary">
                        <PlusIcon className="h-5 w-5 mr-2" /> Nuovo Trasportatore
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
                    message={`Sei sicuro di voler eliminare il trasportatore "${itemToDelete.ragione_sociale}"?`}
                    onConfirm={confirmDelete}
                    onCancel={() => setItemToDelete(null)}
                />
            )}
        </div>
    );
};

export default TrasportatoriManager;
