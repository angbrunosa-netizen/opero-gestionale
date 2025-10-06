/**
 * @file opero-frontend/src/components/vendite/MatriceScontiManager.js
 * @description Componente dedicato alla gestione completa delle Matrici Sconti.
 * @version 1.1 - Correzione Conflitto Chiavi
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { PlusIcon, TrashIcon, ArrowLeftIcon, SaveIcon } from 'lucide-react';
import AdvancedDataGrid from '../../shared/AdvancedDataGrid';
import ConfirmationModal from '../../shared/ConfirmationModal';


// Form Modale per Matrice Sconti
const MatriceFormModal = ({ item, onSave, onCancel }) => {
    const [formData, setFormData] = useState({});
    useEffect(() => { setFormData(item || { codice: '', descrizione: ''}); }, [item]);
    const handleChange = e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSubmit = e => { e.preventDefault(); onSave(formData); };

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-xl font-semibold mb-4">{item && item.id ? 'Modifica Matrice' : 'Nuova Matrice'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-4">
                        <input type="text" name="codice" value={formData.codice || ''} onChange={handleChange} placeholder="Codice" className="input-style" required />
                        <input type="text" name="descrizione" value={formData.descrizione || ''} onChange={handleChange} placeholder="Descrizione" className="input-style" required />
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


const MatriceScontiManager = () => {
    const { hasPermission } = useAuth();
    const [matrici, setMatrici] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingMatrice, setEditingMatrice] = useState(null);
    const [matriceToDelete, setMatriceToDelete] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [editingRigheMatrice, setEditingRigheMatrice] = useState(null);
    const [righe, setRighe] = useState([]);
    const [loadingRighe, setLoadingRighe] = useState(false);

    const fetchMatrici = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/vendite/matrici-sconti');
            setMatrici(res.data);
        } catch (error) { toast.error("Errore nel recupero delle matrici sconti."); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        if (!editingRigheMatrice) {
            fetchMatrici();
        }
    }, [fetchMatrici, editingRigheMatrice]);

    const handleSaveMatrice = async (formData) => {
        try {
            let result;
            if (formData.id) {
                result = await api.put(`/vendite/matrici-sconti/${formData.id}`, formData);
                toast.success('Matrice aggiornata!');
            } else {
                result = await api.post('/vendite/matrici-sconti', formData);
                toast.success('Matrice creata!');
            }
            if(result) fetchMatrici();
        } catch (error) { 
            console.error(error);
            toast.error('Errore durante il salvataggio.'); 
        }
        finally { setIsModalOpen(false); setEditingMatrice(null); }
    };

    const confirmDeleteMatrice = async () => {
        if (!matriceToDelete) return;
        try {
            await api.delete(`/vendite/matrici-sconti/${matriceToDelete.id}`);
            toast.success('Matrice eliminata con successo.');
            fetchMatrici();
        } catch (error) {
            toast.error("Errore durante l'eliminazione della matrice.");
        } finally {
            setMatriceToDelete(null);
        }
    };
    
    const handleEditRighe = useCallback(async (matrice) => {
        setEditingRigheMatrice(matrice);
        setLoadingRighe(true);
        try {
            const res = await api.get(`/vendite/matrici-sconti/${matrice.id}/righe`);
            setRighe(res.data.sort((a,b) => a.riga - b.riga));
        } catch (error) {
            toast.error("Errore nel caricamento delle righe.");
        } finally {
            setLoadingRighe(false);
        }
    }, []);

    const handleSaveRighe = async () => {
        setLoadingRighe(true);
        try {
            await api.post(`/vendite/matrici-sconti/${editingRigheMatrice.id}/righe/salva-tutto`, { righe });
            toast.success('Righe della matrice salvate con successo!');
            setEditingRigheMatrice(null);
        } catch (error) {
            toast.error("Errore nel salvataggio delle righe.");
        } finally {
            setLoadingRighe(false);
        }
    };
    
    const handleRigaChange = (index, field, value) => {
        const newRighe = [...righe];
        newRighe[index][field] = value;
        setRighe(newRighe);
    };

    const addRiga = () => {
        const maxRiga = righe.reduce((max, r) => Math.max(max, r.riga || 0), 0);
        setRighe([...righe, { riga: maxRiga + 1, sconto_1: 0, sconto_2: 0, sconto_3: 0, sconto_4: 0, sconto_5: 0 }]);
    };
    
    const removeRiga = (index) => {
        setRighe(righe.filter((_, i) => i !== index));
    };


    const columns = useMemo(() => [
        { accessorKey: 'codice', header: 'Codice' },
        { accessorKey: 'descrizione', header: 'Descrizione' },
        {
            id: 'manage_rows',
            header: 'Gestione',
            cell: ({ row }) => (
                <button onClick={() => handleEditRighe(row.original)} className="btn-primary-outline text-xs p-1">
                    Gestisci Righe
                </button>
            ),
        },
    ], [handleEditRighe]);
    
    if (editingRigheMatrice) {
        return (
            <div>
                 <button onClick={() => setEditingRigheMatrice(null)} className="flex items-center mb-4 text-blue-600 hover:underline">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Torna alla lista matrici
                </button>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Editor Righe per: {editingRigheMatrice.descrizione}</h3>
                {loadingRighe ? <p>Caricamento righe...</p> : (
                    <div className="space-y-2">
                        {righe.map((riga, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                <input type="number" placeholder="Riga" value={riga.riga || ''} onChange={(e) => handleRigaChange(index, 'riga', e.target.value)} className="input-style w-20 text-center" />
                                <input type="number" step="0.01" placeholder="Sconto 1" value={riga.sconto_1 || ''} onChange={(e) => handleRigaChange(index, 'sconto_1', e.target.value)} className="input-style w-24" />
                                <input type="number" step="0.01" placeholder="Sconto 2" value={riga.sconto_2 || ''} onChange={(e) => handleRigaChange(index, 'sconto_2', e.target.value)} className="input-style w-24" />
                                <input type="number" step="0.01" placeholder="Sconto 3" value={riga.sconto_3 || ''} onChange={(e) => handleRigaChange(index, 'sconto_3', e.target.value)} className="input-style w-24" />
                                <input type="number" step="0.01" placeholder="Sconto 4" value={riga.sconto_4 || ''} onChange={(e) => handleRigaChange(index, 'sconto_4', e.target.value)} className="input-style w-24" />
                                <input type="number" step="0.01" placeholder="Sconto 5" value={riga.sconto_5 || ''} onChange={(e) => handleRigaChange(index, 'sconto_5', e.target.value)} className="input-style w-24" />
                                <button onClick={() => removeRiga(index)} className="p-2 text-red-500 hover:text-red-700"><TrashIcon className="h-5 w-5"/></button>
                            </div>
                        ))}
                         <div className="flex justify-between mt-4">
                            <button onClick={addRiga} className="btn-secondary"><PlusIcon className="h-5 w-5 mr-2"/>Aggiungi Riga</button>
                            <button onClick={handleSaveRighe} className="btn-primary"><SaveIcon className="h-5 w-5 mr-2"/>Salva Tutte le Righe</button>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Anagrafica Matrici Sconti</h3>
                {hasPermission('VA_CLIENTI_MANAGE') && (
                    <button onClick={() => { setEditingMatrice(null); setIsModalOpen(true); }} className="btn-primary">
                        <PlusIcon className="h-5 w-5 mr-2" /> Nuova Matrice
                    </button>
                )}
            </div>
            <AdvancedDataGrid
                columns={columns}
                data={matrici}
                isLoading={loading}
                onEdit={hasPermission('VA_CLIENTI_MANAGE') ? (item) => { setEditingMatrice(item); setIsModalOpen(true); } : null}
                onDelete={hasPermission('VA_CLIENTI_MANAGE') ? (item) => { setMatriceToDelete(item); } : null}

            />
            {isModalOpen && (
                <MatriceFormModal 
                    item={editingMatrice} 
                    onSave={handleSaveMatrice} 
                    onCancel={() => { setIsModalOpen(false); setEditingMatrice(null); }} 
                />
            )}
            {matriceToDelete && (
                <ConfirmationModal 
                    message={`Sei sicuro di voler eliminare la matrice "${matriceToDelete.descrizione}"?`}
                    onConfirm={confirmDeleteMatrice}
                    onCancel={() => setMatriceToDelete(null)}
                />
            )}
        </div>
    );
};

export default MatriceScontiManager;

