/**
 * @file opero-frontend/src/components/amministrazione/TipiPagamentoManager.js
 * @description Componente per la gestione dell'anagrafica dei Tipi di Pagamento.
 * @version 1.0
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { PlusIcon } from 'lucide-react';
import AdvancedDataGrid from '../../shared/AdvancedDataGrid';
import ConfirmationModal from '../../shared/ConfirmationModal';

// Form Modale
const TipiPagamentoFormModal = ({ item, onSave, onCancel }) => {
    const [formData, setFormData] = useState({});
    useEffect(() => {
        setFormData(item || { codice: '', descrizione: '', gg_dilazione: 0 });
    }, [item]);

    const handleChange = e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSubmit = e => { e.preventDefault(); onSave(formData); };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-xl font-semibold mb-4">{item && item.id ? 'Modifica Tipo Pagamento' : 'Nuovo Tipo Pagamento'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-4">
                        <input type="text" name="codice" value={formData.codice || ''} onChange={handleChange} placeholder="Codice" className="input-style" required />
                        <input type="text" name="descrizione" value={formData.descrizione || ''} onChange={handleChange} placeholder="Descrizione" className="input-style" required />
                        <input type="number" name="gg_dilazione" value={formData.gg_dilazione || 0} onChange={handleChange} placeholder="Giorni Dilazione" className="input-style" />
                    </div>
                    <div className="flex justify-end mt-6">
                        <button type="button" onClick={onCancel} className="btn-secondary mr-2">Annulla</button>
                        <button type="submit" className="btn-primary">Salva</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const TipiPagamentoManager = () => {
    const { hasPermission } = useAuth();
    const [tipiPagamento, setTipiPagamento] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/amministrazione/tipi-pagamento');
            setTipiPagamento(res.data);
        } catch (error) {
            toast.error("Errore nel recupero dei tipi di pagamento.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSave = async (formData) => {
        try {
            if (formData.id) {
                await api.put(`/amministrazione/tipi-pagamento/${formData.id}`, formData);
                toast.success('Tipo pagamento aggiornato!');
            } else {
                await api.post('/amministrazione/tipi-pagamento', formData);
                toast.success('Tipo pagamento creato!');
            }
            fetchData();
        } catch (error) {
            toast.error('Errore durante il salvataggio.');
        } finally {
            setIsModalOpen(false);
            setEditingItem(null);
        }
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await api.delete(`/amministrazione/tipi-pagamento/${itemToDelete.id}`);
            toast.success('Tipo pagamento eliminato.');
            fetchData();
        } catch (error) {
            toast.error("Errore durante l'eliminazione.");
        } finally {
            setItemToDelete(null);
        }
    };

    const columns = useMemo(() => [
        { accessorKey: 'codice', header: 'Codice' },
        { accessorKey: 'descrizione', header: 'Descrizione' },
        { accessorKey: 'gg_dilazione', header: 'GG Dilazione' },
    ], []);

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Anagrafica Tipi di Pagamento</h3>
                {hasPermission('ANAGRAFICHE_MANAGE') && (
                    <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="btn-primary">
                        <PlusIcon className="h-5 w-5 mr-2" /> Nuovo
                    </button>
                )}
            </div>
            <AdvancedDataGrid
                columns={columns}
                data={tipiPagamento}
                isLoading={loading}
                onEdit={hasPermission('ANAGRAFICHE_MANAGE') ? (item) => { setEditingItem(item); setIsModalOpen(true); } : null}
                onDelete={hasPermission('ANAGRAFICHE_MANAGE') ? (item) => setItemToDelete(item) : null}
            />
            {isModalOpen && (
                <TipiPagamentoFormModal
                    item={editingItem}
                    onSave={handleSave}
                    onCancel={() => { setIsModalOpen(false); setEditingItem(null); }}
                />
            )}
            {itemToDelete && (
                <ConfirmationModal
                    message={`Sei sicuro di voler eliminare "${itemToDelete.descrizione}"?`}
                    onConfirm={confirmDelete}
                    onCancel={() => setItemToDelete(null)}
                />
            )}
        </div>
    );
};

export default TipiPagamentoManager;
