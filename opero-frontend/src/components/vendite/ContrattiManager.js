/**
 * @file opero-frontend/src/components/vendite/ContrattiManager.js
 * @description Componente per la gestione dell'anagrafica dei contratti.
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
        // Formatta le date per l'input type="date"
        const formatDateForInput = (date) => date ? new Date(date).toISOString().split('T')[0] : '';
        setFormData({
            codice_contratto: item?.codice_contratto || '',
            descrizione: item?.descrizione || '',
            data_inizio: formatDateForInput(item?.data_inizio),
            data_fine: formatDateForInput(item?.data_fine),
            id: item?.id || null,
        });
    }, [item]);

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-xl font-semibold mb-4">{item ? 'Modifica Contratto' : 'Nuovo Contratto'}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" name="codice_contratto" value={formData.codice_contratto || ''} onChange={handleChange} placeholder="Codice Contratto" className="input-style md:col-span-2" required />
                    <textarea name="descrizione" value={formData.descrizione || ''} onChange={handleChange} placeholder="Descrizione" className="input-style md:col-span-2" />
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Data Inizio</label>
                        <input type="date" name="data_inizio" value={formData.data_inizio || ''} onChange={handleChange} className="input-style" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Data Fine</label>
                        <input type="date" name="data_fine" value={formData.data_fine || ''} onChange={handleChange} className="input-style" />
                    </div>
                </div>
                <div className="flex justify-end mt-6">
                    <button type="button" onClick={onCancel} className="btn-secondary mr-2">Annulla</button>
                    <button type="submit" className="btn-primary">Salva</button>
                </div>
            </form>
        </div>
    );
};

const ContrattiManager = () => {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);
    const { hasPermission } = useAuth();

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/vendite/contratti');
            setItems(response.data);
        } catch (error) { toast.error("Errore nel recupero dei contratti."); } 
        finally { setIsLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSave = async (formData) => {
        try {
            if (formData.id) {
                await api.put(`/vendite/contratti/${formData.id}`, formData);
                toast.success('Contratto aggiornato con successo!');
            } else {
                await api.post('/vendite/contratti', formData);
                toast.success('Contratto creato con successo!');
            }
            fetchData();
        } catch (error) { toast.error("Errore durante il salvataggio del contratto."); } 
        finally { setIsModalOpen(false); setEditingItem(null); }
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await api.delete(`/vendite/contratti/${itemToDelete.id}`);
            toast.success("Contratto eliminato con successo.");
            fetchData();
        } catch (error) { toast.error("Errore durante l'eliminazione del contratto."); } 
        finally { setItemToDelete(null); }
    };
    
    const columns = useMemo(() => [
        { accessorKey: 'codice_contratto', header: 'Codice' },
        { accessorKey: 'descrizione', header: 'Descrizione' },
        { 
            accessorKey: 'data_inizio', 
            header: 'Data Inizio',
            cell: info => info.getValue() ? new Date(info.getValue()).toLocaleDateString('it-IT') : ''
        },
        { 
            accessorKey: 'data_fine', 
            header: 'Data Fine',
            cell: info => info.getValue() ? new Date(info.getValue()).toLocaleDateString('it-IT') : ''
        },
    ], []);

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Anagrafica Contratti</h3>
                {hasPermission('VA_CLIENTI_MANAGE') && (
                    <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="btn-primary">
                        <PlusIcon className="h-5 w-5 mr-2" /> Nuovo Contratto
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
                    message={`Sei sicuro di voler eliminare il contratto "${itemToDelete.codice_contratto}"?`}
                    onConfirm={confirmDelete}
                    onCancel={() => setItemToDelete(null)}
                />
            )}
        </div>
    );
};

export default ContrattiManager;
