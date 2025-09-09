// #####################################################################
// # Componente Gestione Funzioni Contabili v2.0 (Logica Originale Integrata)
// # File: opero-gestionale/opero-frontend/src/components/cont-smart/FunzioniContabiliManager.js
// #####################################################################

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { PlusIcon, PencilIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

// --- Componente Modale basato sulla logica originale ---
const FunzioneEditModal = ({ funzione, onSave, onCancel, tipiFunzione, pianoConti }) => {
    const [formData, setFormData] = useState({
        nome_funzione: '',
        descrizione: '',
        id_tipo_funzione: 1,
        righe_predefinite: []
    });

    useEffect(() => {
        if (funzione) {
            setFormData({
                nome_funzione: funzione.nome_funzione || '',
                descrizione: funzione.descrizione || '',
                id_tipo_funzione: funzione.id_tipo_funzione || 1,
                righe_predefinite: funzione.righe_predefinite || []
            });
        }
    }, [funzione]);
    
    const handleMainChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRigaChange = (index, e) => {
        const { name, value } = e.target;
        const righe = [...formData.righe_predefinite];
        righe[index][name] = value;
        setFormData(prev => ({ ...prev, righe_predefinite: righe }));
    };

    const addRiga = () => {
        setFormData(prev => ({
            ...prev,
            righe_predefinite: [...prev.righe_predefinite, { id_sottoconto: '', dare_avere: 'D', descrizione_riga_predefinita: '' }]
        }));
    };

    const removeRiga = (index) => {
        const righe = formData.righe_predefinite.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, righe_predefinite: righe }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };
    
    // Filtra solo i sottoconti per la selezione
    const sottoconti = pianoConti.filter(c => c.tipo === 'Sottoconto');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
                <h3 className="text-xl font-medium leading-6 text-gray-900 mb-6">
                    {funzione?.id_funzione ? 'Modifica Funzione Contabile' : 'Nuova Funzione Contabile'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Campi principali */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="nome_funzione" className="block text-sm font-medium text-gray-700">Nome Funzione</label>
                            <input type="text" name="nome_funzione" value={formData.nome_funzione} onChange={handleMainChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                        </div>
                        <div>
                           <label htmlFor="id_tipo_funzione" className="block text-sm font-medium text-gray-700">Tipo Funzione</label>
                           <select name="id_tipo_funzione" value={formData.id_tipo_funzione} onChange={handleMainChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                               {tipiFunzione.map(tipo => <option key={tipo.id_tipo} value={tipo.id_tipo}>{tipo.nome_tipo}</option>)}
                           </select>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="descrizione" className="block text-sm font-medium text-gray-700">Descrizione</label>
                        <textarea name="descrizione" rows="2" value={formData.descrizione} onChange={handleMainChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
                    </div>

                    {/* Sezione Righe Predefinite */}
                    <fieldset className="border-t pt-4">
                        <legend className="text-lg font-medium text-gray-800 mb-2">Righe Predefinite</legend>
                        {/* Intestazioni */}
                        <div className="grid grid-cols-12 gap-2 text-sm font-semibold text-gray-600 px-2">
                           <div className="col-span-6">Sottoconto</div>
                           <div className="col-span-2">D/A</div>
                           <div className="col-span-3">Descrizione</div>
                           <div className="col-span-1"></div>
                        </div>
                        {formData.righe_predefinite.map((riga, index) => (
                             <div key={index} className="grid grid-cols-12 gap-2 items-center mt-1">
                                 <select name="id_sottoconto" value={riga.id_sottoconto} onChange={(e) => handleRigaChange(index, e)} className="col-span-6 mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm">
                                     <option value="">Seleziona un conto</option>
                                     {sottoconti.map(sc => <option key={sc.id} value={sc.id}>{sc.codice} - {sc.descrizione}</option>)}
                                 </select>
                                 <select name="dare_avere" value={riga.dare_avere} onChange={(e) => handleRigaChange(index, e)} className="col-span-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm">
                                     <option value="D">Dare</option>
                                     <option value="A">Avere</option>
                                 </select>
                                 <input type="text" name="descrizione_riga_predefinita" placeholder="Descrizione riga" value={riga.descrizione_riga_predefinita} onChange={(e) => handleRigaChange(index, e)} className="col-span-3 mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm" />
                                 <button type="button" onClick={() => removeRiga(index)} className="col-span-1 text-red-500 hover:text-red-700 justify-self-center"><TrashIcon className="h-5 w-5"/></button>
                             </div>
                         ))}
                         <button type="button" onClick={addRiga} className="mt-4 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
                             <PlusIcon className="h-4 w-4"/> Aggiungi Riga Predefinita
                        </button>
                    </fieldset>
                    
                    <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Annulla</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Salva Funzione</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Componente Principale del Gestore ---
const FunzioniContabiliManager = () => {
    const [funzioni, setFunzioni] = useState([]);
    const [tipiFunzione, setTipiFunzione] = useState([]);
    const [pianoConti, setPianoConti] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFunzione, setEditingFunzione] = useState(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [resFunzioni, resTipi, resPdc] = await Promise.all([
                api.get('/contsmart/funzioni'),
                api.get('/contsmart/tipi-funzione'),
                api.get('/contsmart/pdc')
            ]);
            setFunzioni(resFunzioni.data.data || []);
            setTipiFunzione(resTipi.data.data || []);
            setPianoConti(resPdc.data.data || []);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Errore nel caricamento dati.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAdd = () => {
        setEditingFunzione(null); // Imposto a null per indicare una nuova funzione
        setIsModalOpen(true);
    };

    const handleEdit = (funzione) => {
        setEditingFunzione(funzione);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Sei sicuro di voler eliminare questa funzione?')) {
            try {
                await api.delete(`/contsmart/funzioni/${id}`);
                fetchData();
            } catch (err) {
                alert(err.response?.data?.message || 'Errore durante l\'eliminazione.');
            }
        }
    };
    
    const handleSave = async (formData) => {
        try {
            if (editingFunzione?.id_funzione) {
                await api.put(`/contsmart/funzioni/${editingFunzione.id_funzione}`, formData);
            } else {
                await api.post('/contsmart/funzioni', formData);
            }
            fetchData();
            setIsModalOpen(false);
            setEditingFunzione(null);
        } catch (err) {
             alert(err.response?.data?.message || 'Errore durante il salvataggio.');
        }
    };

    if (isLoading) return <div className="p-4 text-center">Caricamento...</div>;
    if (error) return <div className="p-4 text-red-600 bg-red-50 rounded-md">Errore: {error}</div>;

    return (
        <div className="p-4 bg-white shadow rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-800">Gestione Funzioni Contabili</h2>
                <div>
                    <button onClick={fetchData} className="p-2 mr-2 text-slate-500 hover:text-slate-800"><ArrowPathIcon className="h-5 w-5"/></button>
                    <button onClick={handleAdd} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        <PlusIcon className="h-5 w-5 mr-2"/> Nuova Funzione
                    </button>
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-600">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nome Funzione</th>
                            <th scope="col" className="px-6 py-3">Tipo</th>
                            <th scope="col" className="px-6 py-3">Descrizione</th>
                            <th scope="col" className="px-6 py-3 text-right">Azioni</th>
                        </tr>
                    </thead>
                    <tbody>
                        {funzioni.map(f => (
                            <tr key={f.id_funzione} className="bg-white border-b hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900">{f.nome_funzione}</td>
                                <td className="px-6 py-4">{f.nome_tipo}</td>
                                <td className="px-6 py-4">{f.descrizione}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleEdit(f)} className="p-1 text-blue-600 hover:text-blue-800"><PencilIcon className="h-4 w-4"/></button>
                                    <button onClick={() => handleDelete(f.id_funzione)} className="p-1 ml-2 text-red-600 hover:text-red-800"><TrashIcon className="h-4 w-4"/></button>
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
                    tipiFunzione={tipiFunzione}
                    pianoConti={pianoConti}
                />
            )}
        </div>
    );
};

export default FunzioniContabiliManager;

