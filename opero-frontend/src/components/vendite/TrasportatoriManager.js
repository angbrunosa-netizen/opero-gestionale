/**
 * @file opero-frontend/src/components/vendite/TrasportatoriManager.js
 * @description Componente per la gestione dei trasportatori. Corretta la mappatura dei dati per il caricamento delle ditte.
 * @version 1.3
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../../services/api';
import AdvancedDataGrid from '../../shared/AdvancedDataGrid';
import { useAuth } from '../../context/AuthContext';
import { PlusIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';
import ConfirmationModal from '../../shared/ConfirmationModal';

// --- FormModal per Creazione/Modifica ---
const FormModal = ({ item, onSave, onCancel }) => {
    const [formData, setFormData] = useState({ id_ditta: '', id_utente_referente: '' });
    const [fornitori, setFornitori] = useState([]);
    const [referenti, setReferenti] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchDataForSelects = async () => {
            setIsLoading(true);
            try {
                const [fornitoriRes, referentiRes] = await Promise.all([
                    api.get('/vendite/fornitori-selezionabili'),
                    api.get('/amministrazione/utenti-esterni')
                ]);

                // ##########################################################################
                // ### CORREZIONE DEFINITIVA: Traduciamo 'ragione_sociale' in 'name'      ###
                // ##########################################################################
                const formattedFornitori = fornitoriRes.data.map(ditta => ({
                    id: ditta.id,
                    name: ditta.ragione_sociale 
                }));
                setFornitori(formattedFornitori);

                // La formattazione per i referenti è già corretta
                const formattedReferenti = referentiRes.data.map(user => ({
                    id: user.id,
                    name: `${user.nome} ${user.cognome}`.trim()
                }));
                setReferenti(formattedReferenti);
                
                if (item) {
                    setFormData({
                        id_ditta: item.id_ditta || '',
                        id_utente_referente: item.id_utente_referente || ''
                    });
                }
            } catch (error) {
                toast.error("Impossibile caricare i dati per il form.");
                console.error("Errore nel caricamento dati per i select", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDataForSelects();
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
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6">{item ? 'Modifica Trasportatore' : 'Nuovo Trasportatore'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="id_ditta" className="block text-sm font-medium text-gray-700">Anagrafica (Fornitore)</label>
                        <select
                            id="id_ditta"
                            name="id_ditta"
                            value={formData.id_ditta}
                            onChange={handleChange}
                            disabled={!!item || isLoading}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            required
                        >
                            <option value="">{isLoading ? 'Caricamento...' : 'Seleziona un fornitore'}</option>
                            {fornitori.map(f => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                        </select>
                         {item && <p className="text-xs text-gray-500 mt-1">L'anagrafica non può essere modificata dopo la creazione.</p>}
                    </div>

                    <div className="mb-6">
                        <label htmlFor="id_utente_referente" className="block text-sm font-medium text-gray-700">Referente Interno (Opzionale)</label>
                        <select
                            id="id_utente_referente"
                            name="id_utente_referente"
                            value={formData.id_utente_referente}
                            onChange={handleChange}
                            disabled={isLoading}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                            <option value="">{isLoading ? 'Caricamento...' : 'Nessun referente'}</option>
                            {referenti.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onCancel} className="btn-secondary">Annulla</button>
                        <button type="submit" className="btn-primary">Salva</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Componente Principale ---
const TrasportatoriManager = () => {
    const { hasPermission } = useAuth();
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/vendite/trasportatori');
            setItems(response.data);
        } catch (error) {
            toast.error('Errore nel caricamento dei trasportatori.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSave = async (formData) => {
        try {
            if (editingItem) {
                await api.put(`/vendite/trasportatori/${editingItem.id}`, { id_utente_referente: formData.id_utente_referente });
                toast.success('Trasportatore aggiornato con successo!');
            } else {
                await api.post('/vendite/trasportatori', { id_ditta: formData.id_ditta, id_utente_referente: formData.id_utente_referente });
                toast.success('Trasportatore creato con successo!');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Si è verificato un errore.');
        }
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await api.delete(`/vendite/trasportatori/${itemToDelete.id}`);
            toast.success('Trasportatore eliminato con successo!');
            setItemToDelete(null);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Errore durante l\'eliminazione.');
        }
    };

    const columns = useMemo(() => [
        { header: 'Ragione Sociale', accessorKey: 'ragione_sociale' },
        { header: 'Telefono', accessorKey: 'telefono', cell: ({ row }) => row.original.telefono || 'N/D' },
        { header: 'Referente Interno', accessorKey: 'referente', cell: ({ row }) => row.original.referente || 'N/D' },
    ], []);

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Anagrafica Trasportatori</h3>
                {hasPermission('VA_TRASPORTATORI_MANAGE') && (
                    <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="btn-primary">
                        <PlusIcon className="h-5 w-5 mr-2" /> Nuovo Trasportatore
                    </button>
                )}
            </div>
            <AdvancedDataGrid
                columns={columns}
                data={items}
                isLoading={isLoading}
                onEdit={hasPermission('VA_TRASPORTATORI_MANAGE') ? (item) => { setEditingItem(item); setIsModalOpen(true); } : null}
                onDelete={hasPermission('VA_TRASPORTATORI_MANAGE') ? setItemToDelete : null}
            />
            {isModalOpen && <FormModal item={editingItem} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />}
            {itemToDelete && (
                <ConfirmationModal
                    message={`Sei sicuro di voler eliminare il trasportatore "${itemToDelete.ragione_sociale}"? L'anagrafica del fornitore non verrà cancellata.`}
                    onConfirm={confirmDelete}
                    onCancel={() => setItemToDelete(null)}
                />
            )}
        </div>
    );
};

export default TrasportatoriManager;

