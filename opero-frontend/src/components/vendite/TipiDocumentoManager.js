/**
 * @file opero-frontend/src/components/vendite/TipiDocumentoManager.js
 * @description Componente per la gestione dell'anagrafica dei tipi di documento.
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
        setFormData(item || { 
            codice_doc: '', 
            nome_documento: '',
            tipo: 'Ordine',
            gen_mov: 'N',
            tipo_movimento: null,
            ditta_rif: 'Clienti'
        });
    }, [item]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newState = { ...prev, [name]: value };
            // Se non genera movimenti, il tipo movimento deve essere nullo
            if (name === 'gen_mov' && value === 'N') {
                newState.tipo_movimento = null;
            }
            return newState;
        });
    };

    const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
                <h2 className="text-xl font-semibold mb-4">{item ? 'Modifica Tipo Documento' : 'Nuovo Tipo Documento'}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" name="codice_doc" value={formData.codice_doc || ''} onChange={handleChange} placeholder="Codice Documento (es. ODC)" className="input-style" required />
                    <input type="text" name="nome_documento" value={formData.nome_documento || ''} onChange={handleChange} placeholder="Nome Documento (es. Ordine Cliente)" className="input-style" required />
                    
                    <select name="tipo" value={formData.tipo || ''} onChange={handleChange} className="input-style">
                        <option value="Documento Accompagnatorio">Documento Accompagnatorio</option>
                        <option value="Documento Interno">Documento Interno</option>
                        <option value="Preventivo">Preventivo</option>
                        <option value="Ordine">Ordine</option>
                    </select>

                    <select name="ditta_rif" value={formData.ditta_rif || ''} onChange={handleChange} className="input-style">
                        <option value="Clienti">Riferimento: Clienti</option>
                        <option value="Fornitori">Riferimento: Fornitori</option>
                        <option value="PuntoVendita">Riferimento: Punto Vendita</option>
                    </select>

                    <div className="flex items-center space-x-4">
                        <label>Genera Mov. Magazzino?</label>
                        <select name="gen_mov" value={formData.gen_mov || 'N'} onChange={handleChange} className="input-style">
                            <option value="S">Sì</option>
                            <option value="N">No</option>
                        </select>
                    </div>

                    <select name="tipo_movimento" value={formData.tipo_movimento || ''} onChange={handleChange} className="input-style" disabled={formData.gen_mov === 'N'}>
                        <option value="">{formData.gen_mov === 'N' ? 'Nessun movimento' : 'Seleziona tipo movimento'}</option>
                        <option value="Carico">Carico</option>
                        <option value="Scarico">Scarico</option>
                    </select>
                </div>
                <div className="flex justify-end mt-6">
                    <button type="button" onClick={onCancel} className="btn-secondary mr-2">Annulla</button>
                    <button type="submit" className="btn-primary">Salva</button>
                </div>
            </form>
        </div>
    );
};

const TipiDocumentoManager = () => {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);
    const { hasPermission } = useAuth();

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/vendite/tipi-documento');
            setItems(response.data);
        } catch (error) { toast.error("Errore nel recupero dei tipi documento."); } 
        finally { setIsLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSave = async (formData) => {
        try {
            if (formData.id) {
                await api.put(`/vendite/tipi-documento/${formData.id}`, formData);
                toast.success('Tipo documento aggiornato con successo!');
            } else {
                await api.post('/vendite/tipi-documento', formData);
                toast.success('Tipo documento creato con successo!');
            }
            fetchData();
        } catch (error) { toast.error("Errore durante il salvataggio del tipo documento."); } 
        finally { setIsModalOpen(false); setEditingItem(null); }
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await api.delete(`/vendite/tipi-documento/${itemToDelete.id}`);
            toast.success("Tipo documento eliminato con successo.");
            fetchData();
        } catch (error) { toast.error("Errore durante l'eliminazione del tipo documento."); } 
        finally { setItemToDelete(null); }
    };
    
    const columns = useMemo(() => [
        { accessorKey: 'codice_doc', header: 'Codice' },
        { accessorKey: 'nome_documento', header: 'Nome Documento' },
        { accessorKey: 'tipo', header: 'Tipo' },
        { accessorKey: 'gen_mov', header: 'Gen. Mov.' },
        { accessorKey: 'tipo_movimento', header: 'Tipo Movimento' },
        { accessorKey: 'ditta_rif', header: 'Riferimento' },
    ], []);

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Anagrafica Tipi Documento</h3>
                {hasPermission('VA_TIPI_DOC_MANAGE') && (
                    <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="btn-primary">
                        <PlusIcon className="h-5 w-5 mr-2" /> Nuovo Tipo Documento
                    </button>
                )}
            </div>
            <AdvancedDataGrid
                columns={columns}
                data={items}
                isLoading={isLoading}
                onEdit={hasPermission('VA_TIPI_DOC_MANAGE') ? (item) => { setEditingItem(item); setIsModalOpen(true); } : null}
                onDelete={hasPermission('VA_TIPI_DOC_MANAGE') ? setItemToDelete : null}
            />
            {isModalOpen && <FormModal item={editingItem} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />}
            {itemToDelete && (
                <ConfirmationModal
                    message={`Sei sicuro di voler eliminare il tipo documento "${itemToDelete.nome_documento}"?`}
                    onConfirm={confirmDelete}
                    onCancel={() => setItemToDelete(null)}
                />
            )}
        </div>
    );
};

export default TipiDocumentoManager;