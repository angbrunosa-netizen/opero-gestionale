    // #####################################################################
    // # Componente Gestione Funzioni Contabili v9.0 (Fix Definitivo D/A)
    // # File: opero-gestionale/opero-frontend/src/components/cont-smart/FunzioniContabiliManager.js
    // #####################################################################

    import React, { useState, useEffect, useCallback } from 'react';
    import { api } from '../../services/api';
    import { PlusIcon, PencilIcon, TrashIcon, ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

    // --- Sotto-componente: Modale per Creazione/Modifica ---
   const FunzioneEditModal = ({ funzione, onSave, onCancel, pianoConti }) => {
    
    const createInitialFormData = (func) => {
        if (!func) {
            return {
                nome_funzione: '',
                descrizione: '',
                tipo_funzione: 'Primaria',
                categoria: '',
                righe_predefinite: []
            };
        }

        // <span style="color:red;">// CORREZIONE: Ora legge il campo 'tipo_movimento' dal backend.</span>
        const righeNormalizzate = (func.righe_predefinite || []).map(rigaBackend => {
            // Traduce 'D'/'A' in 'DARE'/'AVERE' solo per la visualizzazione nel form
            const segnoPerFrontend = rigaBackend.tipo_movimento === 'A' ? 'AVERE' : 'DARE';
            return {
                id_conto: rigaBackend.id_conto,
                dare_avere: segnoPerFrontend, // Questo nome è usato solo nello stato del form
                descrizione_riga_predefinita: rigaBackend.descrizione_riga_predefinita || ''
            };
        });
        
        return {
            nome_funzione: func.nome_funzione || '',
            descrizione: func.descrizione || '',
            tipo_funzione: func.tipo_funzione || 'Primaria',
            categoria: func.categoria || '',
            righe_predefinite: righeNormalizzate
        };
    };

    const [formData, setFormData] = useState(() => createInitialFormData(funzione));

    useEffect(() => {
        setFormData(createInitialFormData(funzione));
    }, [funzione]);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRigaChange = (index, field, value) => {
        const newRighe = [...formData.righe_predefinite];
        newRighe[index][field] = value;
        setFormData(prev => ({ ...prev, righe_predefinite: newRighe }));
    };

    const addRiga = () => {
        setFormData(prev => ({
            ...prev,
            righe_predefinite: [...prev.righe_predefinite, { id_conto: '', dare_avere: 'DARE', descrizione_riga_predefinita: '' }]
        }));
    };

    const removeRiga = (index) => {
        setFormData(prev => ({
            ...prev,
            righe_predefinite: prev.righe_predefinite.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                    {funzione ? 'Modifica Funzione Contabile' : 'Crea Nuova Funzione Contabile'}
                </h3>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <div className="space-y-4 pr-2">
                        <input type="text" name="nome_funzione" value={formData.nome_funzione} onChange={handleInputChange} placeholder="Nome Funzione" className="w-full rounded-md border-slate-300" required />
                        <textarea name="descrizione" value={formData.descrizione} onChange={handleInputChange} placeholder="Descrizione" className="w-full rounded-md border-slate-300" rows="2"></textarea>
                        
                        <select name="tipo_funzione" value={formData.tipo_funzione} onChange={handleInputChange} className="w-full rounded-md border-slate-300">
                            <option value="Primaria">Primaria</option>
                            <option value="Secondaria">Secondaria</option>
                            <option value="Finanziaria">Finanziaria</option>
                            <option value="Sistema">Sistema</option>
                        </select>

                        <input type="text" name="categoria" value={formData.categoria} onChange={handleInputChange} placeholder="Categoria (es. Acquisti, Vendite)" className="w-full rounded-md border-slate-300" />
                        
                        <fieldset className="border p-2 rounded">
                            <legend className="px-1 text-sm">Righe Predefinite</legend>
                            {formData.righe_predefinite.map((riga, index) => (
                                <div key={index} className="flex items-center gap-2 mb-2">
                                    <select value={riga.id_conto} onChange={(e) => handleRigaChange(index, 'id_conto', e.target.value)} className="flex-grow rounded-md border-slate-300 text-sm">
                                        <option value="">Seleziona Conto...</option>
                                        {pianoConti.map(c => <option key={c.id} value={c.id}>{c.codice} - {c.descrizione}</option>)}
                                    </select>
                                    <select value={riga.dare_avere} onChange={(e) => handleRigaChange(index, 'dare_avere', e.target.value)} className="w-1/4 rounded-md border-slate-300 text-sm">
                                        <option value="DARE">DARE</option>
                                        <option value="AVERE">AVERE</option>
                                    </select>
                                    <input type="text" value={riga.descrizione_riga_predefinita} onChange={(e) => handleRigaChange(index, 'descrizione_riga_predefinita', e.target.value)} placeholder="Descrizione riga (opz.)" className="flex-grow rounded-md border-slate-300 text-sm"/>
                                    <button type="button" onClick={() => removeRiga(index)} className="text-red-500"><TrashIcon className="h-5 w-5"/></button>
                                </div>
                            ))}
                            <button type="button" onClick={addRiga} className="text-sm text-blue-600 flex items-center gap-1 mt-2"><PlusIcon className="h-4 w-4"/> Aggiungi riga</button>
                        </fieldset>
                    </div>
                    <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Annulla</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Salva</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

    // --- Componente Principale ---
    const FunzioniContabiliManager = () => {
        const [funzioni, setFunzioni] = useState([]);
        const [pianoConti, setPianoConti] = useState([]);
        const [isLoading, setIsLoading] = useState(true);
        const [error, setError] = useState('');
        const [isModalOpen, setIsModalOpen] = useState(false);
        const [editingFunzione, setEditingFunzione] = useState(null);
        const [confirmDelete, setConfirmDelete] = useState(null);

        const fetchData = useCallback(async () => {
            setIsLoading(true);
            setError('');
            try {
                const [funzioniRes, pdcRes] = await Promise.all([
                    api.get('/contsmart/funzioni'),
                    api.get('/contsmart/pdc-tree') 
                ]);

                const flattenPdc = (nodes) => {
                    let list = [];
                    if (!Array.isArray(nodes)) return [];
                    nodes.forEach(node => {
                        list.push({ id: node.id, codice: node.codice, descrizione: node.descrizione });
                        if (node.children) list = list.concat(flattenPdc(node.children));
                    });
                    return list;
                };
                
                setFunzioni(funzioniRes.data);
                const pianoContiData = pdcRes.data.data || pdcRes.data;
                setPianoConti(flattenPdc(pianoContiData));

            } catch (err) {
                setError('Errore nel caricamento dei dati. Riprova.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }, []);

        useEffect(() => {
            fetchData();
        }, [fetchData]);

        const handleCreate = () => {
            setEditingFunzione(null);
            setIsModalOpen(true);
        };

        const handleEdit = (funzione) => {
            setEditingFunzione(funzione);
            setIsModalOpen(true);
        };
        
      const handleSave = async (formData) => {
        // <span style="color:red;">// CORREZIONE DEFINITIVA: Sostituita la logica di mapping con una più esplicita e sicura.</span>
        // <span style="color:green;">// Questo approccio previene errori dovuti a proprietà inattese e garantisce
        // <span style="color:green;">// che il campo 'tipo_movimento' sia sempre valorizzato correttamente.</span>
        const payload = {
            ...formData,
            righe_predefinite: formData.righe_predefinite.map(riga => ({
                id_conto: riga.id_conto,
                descrizione_riga_predefinita: riga.descrizione_riga_predefinita,
                tipo_movimento: riga.dare_avere === 'AVERE' ? 'A' : 'D'
            }))
        };
        
        try {
            if (editingFunzione) {
                await api.put(`/contsmart/funzioni/${editingFunzione.id}`, payload);
            } else {
                await api.post('/contsmart/funzioni', payload);
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error("Errore salvataggio funzione:", error);
            setError("Errore durante il salvataggio della funzione.");
        }
    };
    
        
        const handleDeleteRequest = (funzione) => {
            setConfirmDelete(funzione);
        };

        const executeDelete = async () => {
            if (!confirmDelete) return;
            try {
                await api.delete(`/contsmart/funzioni/${confirmDelete.id}`);
                setConfirmDelete(null);
                fetchData();
            } catch (error) {
                console.error("Errore eliminazione funzione:", error);
                setError("Errore durante l'eliminazione della funzione.");
                setConfirmDelete(null);
            }
        };
        
        if (isLoading) return <div className="flex justify-center p-4"><ArrowPathIcon className="h-6 w-6 animate-spin text-slate-500" /></div>;
        if (error) return <div className="bg-red-100 text-red-700 p-3 rounded-md" role="alert">{error}</div>;

        return (
            <div className="p-1">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-slate-700">Gestione Funzioni Contabili</h2>
                    <button onClick={handleCreate} className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                        <PlusIcon className="h-5 w-5 mr-1"/> Nuova Funzione
                    </button>
                </div>

                <div className="bg-white shadow rounded-lg overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Nome Funzione</th>
                                <th scope="col" className="px-6 py-3">Tipo</th>
                                 <th scope="col" className="px-6 py-3">Categoria</th>
                                <th scope="col" className="px-6 py-3">Descrizione</th>
                                <th scope="col" className="px-6 py-3 text-right">Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {funzioni.map(f => (
                                <tr key={f.id} className="bg-white border-b hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900">{f.nome_funzione}</td>
                                    <td className="px-6 py-4">{f.tipo_funzione}</td>
                                     <td className="px-6 py-4">{f.categoria || '-'}</td>
                                    <td className="px-6 py-4">{f.descrizione}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleEdit(f)} className="p-1 text-blue-600 hover:text-blue-800"><PencilIcon className="h-4 w-4"/></button>
                                        <button onClick={() => handleDeleteRequest(f)} className="p-1 ml-2 text-red-600 hover:text-red-800"><TrashIcon className="h-4 w-4"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {isModalOpen && (
                    <FunzioneEditModal 
                        funzione={editingFunzione}
                        onSave={handleSave}
                        onCancel={() => setIsModalOpen(false)}
                        pianoConti={pianoConti}
                    />
                )}
                
                {confirmDelete && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
                            <div className="flex items-start">
                                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                                </div>
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                    <h3 className="text-lg font-medium text-gray-900">Elimina Funzione</h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">Sei sicuro di voler eliminare la funzione "{confirmDelete.nome_funzione}"? Questa azione è irreversibile.</p>
                                    </div>
                                </div>  
                            </div>
                            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                <button type="button" onClick={executeDelete} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm">
                                    Elimina
                                </button>
                                <button type="button" onClick={() => setConfirmDelete(null)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm">
                                    Annulla
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    export default FunzioniContabiliManager;

