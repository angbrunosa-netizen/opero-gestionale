// #####################################################################
// # Componente Gestione Funzioni Contabili v3.0 (con Tabella, Ricerca e Ordinamento)
// # File: opero-frontend/src/components/cont-smart/FunzioniContabiliManager.js
// #####################################################################

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../../services/api';
import { PlusIcon, PencilIcon, TrashIcon, ArrowPathIcon, ArrowsUpDownIcon } from '@heroicons/react/24/solid';

const FunzioniContabiliManager = () => {
    const [funzioni, setFunzioni] = useState([]);
    const [pianoConti, setPianoConti] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedFunzione, setSelectedFunzione] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // <span style="color:green;">// NUOVO: Stati per la gestione della ricerca e dell'ordinamento</span>
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'nome_funzione', direction: 'ascending' });

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [funzioniRes, pdcRes] = await Promise.all([
                api.get('/contsmart/funzioni-contabili'),
                api.get('/contsmart/pdc-tree'),
            ]);
            
            setFunzioni(funzioniRes.data.data || []);

            const flattenPdc = (nodes) => {
                let flat = [];
                nodes.forEach(node => {
                    flat.push({ id: node.id, descrizione: node.descrizione, isSelectable: node.tipo === 'Sottoconto' });
                    if (node.children) flat = flat.concat(flattenPdc(node.children));
                });
                return flat;
            };
            setPianoConti(flattenPdc(pdcRes.data.data || []));

        } catch (err) {
            setError('Impossibile caricare i dati.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // <span style="color:green;">// NUOVO: Logica di filtraggio e ordinamento</span>
    const sortedAndFilteredFunzioni = useMemo(() => {
        let filtered = [...funzioni];
        if (searchTerm) {
            filtered = filtered.filter(funzione =>
                (funzione.nome_funzione || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (funzione.descrizione || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (funzione.tipo_funzione || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (funzione.categoria || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (sortConfig.key) {
            filtered.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return filtered;
    }, [funzioni, searchTerm, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleOpenModal = (funzione = null) => {
        setSelectedFunzione(funzione);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedFunzione(null);
    };

    const handleSave = async (funzioneData) => {
        try {
            if (selectedFunzione && selectedFunzione.id) {
                await api.patch(`/contsmart/funzioni-contabili/${selectedFunzione.id}`, funzioneData);
            } else {
                await api.post('/contsmart/funzioni-contabili', funzioneData);
            }
            fetchData();
            handleCloseModal();
        } catch (error) {
            alert("Salvataggio fallito.");
        }
    };

    if (isLoading) return <div><ArrowPathIcon className="h-6 w-6 animate-spin mx-auto" /></div>;
    if (error) return <div className="text-red-500">{error}</div>;

    const SortableHeader = ({ field, label }) => (
        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => requestSort(field)}>
            <div className="flex items-center">
                {label}
                {sortConfig.key === field && <span className="ml-1">{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>}
            </div>
        </th>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Gestione Funzioni Contabili</h2>
                <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2 shadow-sm hover:bg-blue-700">
                    <PlusIcon className="h-5 w-5" /> Nuova Funzione
                </button>
            </div>
            
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Cerca per nome, tipo, categoria..."
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <SortableHeader field="nome_funzione" label="Nome Funzione" />
                            <SortableHeader field="tipo_funzione" label="Tipo" />
                            <SortableHeader field="categoria" label="Categoria" />
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Modifica</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedAndFilteredFunzioni.map(funzione => (
                            <tr key={funzione.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{funzione.nome_funzione}</div>
                                    <div className="text-sm text-gray-500">{funzione.descrizione}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                        {funzione.tipo_funzione}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {funzione.categoria}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleOpenModal(funzione)} className="text-blue-600 hover:text-blue-900">
                                        <PencilIcon className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <FunzioneModal
                    funzione={selectedFunzione}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    pianoConti={pianoConti}
                />
            )}
        </div>
    );
};

const FunzioneModal = ({ funzione, onClose, onSave, pianoConti }) => {
    const [testata, setTestata] = useState({
        nome_funzione: '', descrizione: '', tipo_funzione: 'Primaria', categoria: '', gestioni_abbinate: []
    });
    const [righe, setRighe] = useState([]);

    useEffect(() => {
        if (funzione) {
            setTestata({
                nome_funzione: funzione.nome_funzione || '',
                descrizione: funzione.descrizione || '',
                tipo_funzione: funzione.tipo_funzione || 'Primaria',
                categoria: funzione.categoria || '',
                gestioni_abbinate: funzione.gestioni_abbinate || []
            });
            setRighe(funzione.righe_predefinite.map(r => ({...r, uniqueId: Math.random()})));
        }
    }, [funzione]);
    
    const handleTestataChange = (e) => {
        setTestata({ ...testata, [e.target.name]: e.target.value });
    };
    
    const handleGestioneAbbinataChange = (e) => {
        const { value, checked } = e.target;
        setTestata(prev => {
            const gestioni = new Set(prev.gestioni_abbinate);
            if (checked) gestioni.add(value);
            else gestioni.delete(value);
            return { ...prev, gestioni_abbinate: Array.from(gestioni) };
        });
    };

    const handleRigaChange = (uniqueId, field, value) => {
        let newRighe = righe.map(r => r.uniqueId === uniqueId ? { ...r, [field]: value } : r);
        
        if (field === 'is_conto_ricerca' && value === true) {
            newRighe = newRighe.map(r => r.uniqueId !== uniqueId ? { ...r, is_conto_ricerca: false } : r);
        }
        
        setRighe(newRighe);
    };

    const addRiga = () => {
        setRighe([...righe, { uniqueId: Math.random(), id_conto: '', tipo_movimento: 'D', is_sottoconto_modificabile: true, is_conto_ricerca: false, descrizione_riga_predefinita: '' }]);
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ testata, righe: righe.map(({uniqueId, ...rest}) => rest) });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
             <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-bold mb-6">{funzione ? 'Modifica' : 'Crea'} Funzione Contabile</h3>
                <form onSubmit={handleSubmit}>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-4">
                        <div className="relative">
                            <label htmlFor="nome_funzione" className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-bold text-gray-900">Nome Funzione</label>
                            <input type="text" name="nome_funzione" id="nome_funzione" value={testata.nome_funzione} onChange={handleTestataChange} required className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600"/>
                        </div>
                        <div className="relative">
                            <label htmlFor="categoria" className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-bold text-gray-900">Categoria</label>
                            <input type="text" name="categoria" id="categoria" value={testata.categoria} onChange={handleTestataChange} className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600"/>
                        </div>
                        <div className="relative md:col-span-2">
                             <label htmlFor="descrizione" className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-bold text-gray-900">Descrizione</label>
                             <textarea name="descrizione" id="descrizione" rows="2" value={testata.descrizione} onChange={handleTestataChange} className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600"/>
                        </div>
                         <div className="relative">
                            <label htmlFor="tipo_funzione" className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-bold text-gray-900">Tipo Funzione</label>
                            <select name="tipo_funzione" id="tipo_funzione" value={testata.tipo_funzione} onChange={handleTestataChange} className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600">
                                <option>Primaria</option>
                                <option>Finanziaria</option>
                                <option>Secondaria</option>
                                <option>Sistema</option>
                            </select>
                        </div>
                    </div>

                    <div className="mb-4 border p-3 rounded-md">
                        <p className="font-semibold text-sm mb-2">Gestioni Abbinate</p>
                        <div className="flex flex-wrap gap-x-6 gap-y-2">
                            <label className="inline-flex items-center">
                                <input type="checkbox" value="I" checked={testata.gestioni_abbinate.includes('I')} onChange={handleGestioneAbbinataChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                                <span className="ml-2 text-sm">Gestione IVA</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input type="checkbox" value="C" checked={testata.gestioni_abbinate.includes('C')} onChange={handleGestioneAbbinataChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                                <span className="ml-2 text-sm">Centri di Costo</span>
                            </label>
                             <label className="inline-flex items-center">
                                <input type="checkbox" value="E" checked={testata.gestioni_abbinate.includes('E')} onChange={handleGestioneAbbinataChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                                <span className="ml-2 text-sm">Elenchi</span>
                            </label>
                        </div>
                    </div>

                    <h4 className="font-semibold mb-2 mt-6">Righe Predefinite</h4>
                    <div className="space-y-3 mb-4">
                        {righe.map(riga => (
                            <div key={riga.uniqueId} className="grid grid-cols-12 gap-2 items-center p-2 border rounded-md">
                                <select value={riga.id_conto} onChange={e => handleRigaChange(riga.uniqueId, 'id_conto', e.target.value)} className="col-span-12 md:col-span-5 p-2 border rounded text-sm">
                                    <option value="">Seleziona Conto</option>
                                    {pianoConti.map(c => <option key={c.id} value={c.id} disabled={!c.isSelectable}>{c.descrizione}</option>)}
                                </select>
                                <select value={riga.tipo_movimento} onChange={e => handleRigaChange(riga.uniqueId, 'tipo_movimento', e.target.value)} className="col-span-6 md:col-span-2 p-2 border rounded text-sm">
                                    <option value="D">DARE</option>
                                    <option value="A">AVERE</option>
                                </select>
                                <label className="col-span-6 md:col-span-4 flex items-center text-sm select-none">
                                    <input type="checkbox" checked={riga.is_conto_ricerca} onChange={e => handleRigaChange(riga.uniqueId, 'is_conto_ricerca', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                                    <span className="ml-2">Conto di Ricerca</span>
                                </label>
                                <button type="button" onClick={() => setRighe(righe.filter(r => r.uniqueId !== riga.uniqueId))} className="col-span-12 md:col-span-1 p-2 text-red-500 hover:bg-red-100 rounded-full flex justify-center">
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addRiga} className="text-sm text-blue-600 mb-6 flex items-center gap-1"><PlusIcon className="h-4 w-4"/> Aggiungi Riga</button>

                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Annulla</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Salva</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export default FunzioniContabiliManager;

