/**
 * @file opero-frontend/src/components/vendite/TrasportatoriManager.js
 * @description Componente per la gestione dei trasportatori (Versione Refactored).
 * Utilizza un approccio a selezione da anagrafiche esistenti.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../../services/api';
import AdvancedDataGrid from '../../shared/AdvancedDataGrid';
import { useAuth } from '../../context/AuthContext';
import { PlusIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';
import ConfirmationModal from '../../shared/ConfirmationModal';

// #####################################################################
// # NUOVO: FormModal completamente riscritto per la selezione guidata
// #####################################################################
const FormModal = ({ item, onSave, onCancel }) => {
    // Stato per i dati del form (ora contiene solo gli ID)
    const [formData, setFormData] = useState({ id_ditta: '', id_utente_referente: '' });
    
    // Stati per caricare le opzioni dei menu a discesa
    const [fornitori, setFornitori] = useState([]);
    const [referenti, setReferenti] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Carica i dati per i menu a discesa all'apertura del modale
    useEffect(() => {
        const fetchDataForSelects = async () => {
            setIsLoading(true);
            try {
                // Eseguo le chiamate in parallelo per efficienza
                const [fornitoriRes, referentiRes] = await Promise.all([
                    api.get('/vendite/fornitori-selezionabili'),
                    api.get('/amministrazione/utenti-esterni')
                ]);
                setFornitori(fornitoriRes.data);
                setReferenti(referentiRes.data);
            } catch (error) {
                toast.error("Errore nel caricamento dei dati per il form.");
                console.error("Errore API:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDataForSelects();
    }, []);

    // Imposta i dati iniziali del form quando l'item in modifica cambia
    useEffect(() => {
        if (item) {
            setFormData({
                id: item.id, // ID della riga in va_trasportatori
                id_ditta: item.id_ditta,
                id_utente_referente: item.id_utente_referente || '' 
            });
        } else {
            setFormData({ id_ditta: '', id_utente_referente: '' });
        }
    }, [item]);

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">{item ? 'Modifica Referente Trasportatore' : 'Nuovo Trasportatore'}</h2>
                
                {isLoading ? <p>Caricamento...</p> : (
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="id_ditta" className="block text-sm font-medium text-gray-700">Trasportatore (da anagrafica fornitori)</label>
                            <select
                                id="id_ditta"
                                name="id_ditta"
                                value={formData.id_ditta}
                                onChange={handleChange}
                                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
                                required
                                disabled={!!item} // Il trasportatore non si può cambiare dopo la creazione
                            >
                                <option value="">-- Seleziona un fornitore --</option>
                                {fornitori.map(f => (
                                    <option key={f.id} value={f.id}>{f.ragione_sociale}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="id_utente_referente" className="block text-sm font-medium text-gray-700">Referente (opzionale)</label>
                            <select
                                id="id_utente_referente"
                                name="id_utente_referente"
                                value={formData.id_utente_referente}
                                onChange={handleChange}
                                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                <option value="">-- Nessun referente --</option>
                                {referenti.map(r => (
                                    <option key={r.id} value={r.id}>{r.nome} {r.cognome}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                <div className="mt-6 flex justify-end space-x-3">
                    <button type="button" onClick={onCancel} className="btn-secondary">Annulla</button>
                    <button type="submit" disabled={isLoading} className="btn-primary">Salva</button>
                </div>
            </form>
        </div>
    );
};


// #####################################################################
// # COMPONENTE PRINCIPALE: Aggiornato per usare la nuova logica
// #####################################################################
const TrasportatoriManager = () => {
    const { hasPermission } = useAuth();
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);

    const fetchItems = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/vendite/trasportatori');
            setItems(response.data);
        } catch (error) {
            toast.error('Errore nel caricamento dei trasportatori.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const handleSave = async (formData) => {
        const payload = {
            id_ditta: formData.id_ditta,
            // Invia null se la stringa è vuota
            id_utente_referente: formData.id_utente_referente || null 
        };
        
        try {
            if (formData.id) { // MODIFICA: aggiorno solo il referente
                await api.put(`/vendite/trasportatori/${formData.id}`, { id_utente_referente: payload.id_utente_referente });
                toast.success('Trasportatore aggiornato con successo!');
            } else { // CREAZIONE
                await api.post('/vendite/trasportatori', payload);
                toast.success('Trasportatore creato con successo!');
            }
            setIsModalOpen(false);
            fetchItems();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Si è verificato un errore.');
            console.error(error);
        }
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await api.delete(`/vendite/trasportatori/${itemToDelete.id}`);
            toast.success('Trasportatore eliminato con successo!');
            setItemToDelete(null);
            fetchItems();
        } catch (error) {
            toast.error('Errore nell\'eliminazione del trasportatore.');
            console.error(error);
        }
    };
    
    // MODIFICATO: Le colonne ora riflettono i dati ottenuti con le JOIN
    const columns = useMemo(() => [
        { accessorKey: 'ragione_sociale', header: 'Ragione Sociale' },
        { accessorKey: 'referente_nome_cognome', header: 'Referente', Cell: ({ cell }) => cell.getValue() || 'N/D' },
        { accessorKey: 'telefono', header: 'Telefono', Cell: ({ cell }) => cell.getValue() || 'N/D' },
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
                    message={`Sei sicuro di voler eliminare il trasportatore "${itemToDelete.ragione_sociale}"? L'anagrafica del fornitore non verrà cancellata.`}
                    onConfirm={confirmDelete}
                    onCancel={() => setItemToDelete(null)}
                />
            )}
        </div>
    );
};

export default TrasportatoriManager;
