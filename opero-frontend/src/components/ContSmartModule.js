// #####################################################################
// # Componente per il Modulo ContSmart v1.1 (con Manutenzione PDC)
// # File: opero-gestionale-main/opero-frontend/src/components/ContSmartModule.js
// #####################################################################

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { FolderIcon, PencilSquareIcon, ChartBarIcon, ChevronRightIcon, PlusIcon, PencilIcon,WrenchScrewdriverIcon,TrashIcon,ExclamationTriangleIcon } from '@heroicons/react/24/solid';

// --- Componente Modale per Creazione/Modifica Piano dei Conti ---
const PdcEditModal = ({ item, onSave, onCancel, pdcTree }) => {
    const [formData, setFormData] = useState({
        codice: '',
        descrizione: '',
        id_padre: null,
        tipo: 'Sottoconto',
        natura: 'Costo',
    });

    useEffect(() => {
        if (item) {
            setFormData({
                codice: item.codice || '',
                descrizione: item.descrizione || '',
                id_padre: item.id_padre || null,
                tipo: item.tipo || 'Sottoconto',
                natura: item.natura || 'Costo',
            });
        } else {
            setFormData({
                codice: '',
                descrizione: '',
                id_padre: null,
                tipo: 'Sottoconto',
                natura: 'Costo',
            });
        }
    }, [item]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData, item ? item.id : null);
    };
    
    // Funzione ricorsiva per generare le opzioni del select
    const renderOptions = (nodes, level = 0) => {
        let options = [];
        nodes.forEach(node => {
            if (node.tipo !== 'Sottoconto') {
                 options.push(
                    <option key={node.id} value={node.id}>
                        {'\u00A0'.repeat(level * 4)} {node.codice} - {node.descrizione}
                    </option>
                );
                if (node.figli && node.figli.length > 0) {
                    options = options.concat(renderOptions(node.figli, level + 1));
                }
            }
        });
        return options;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">{item ? 'Modifica Conto' : 'Nuovo Conto'}</h2>
                <form onSubmit={handleSubmit}>
                   <div className="space-y-4">
                        <div>
                            <label htmlFor="codice" className="block text-sm font-medium text-gray-700">Codice</label>
                            <input type="text" name="codice" id="codice" value={formData.codice} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                        </div>
                        <div>
                            <label htmlFor="descrizione" className="block text-sm font-medium text-gray-700">Descrizione</label>
                            <input type="text" name="descrizione" id="descrizione" value={formData.descrizione} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" required />
                        </div>
                        <div>
                            <label htmlFor="id_padre" className="block text-sm font-medium text-gray-700">Conto Padre</label>
                            <select name="id_padre" id="id_padre" value={formData.id_padre || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                                <option value="">Nessun Padre (Mastro)</option>
                                {renderOptions(pdcTree)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">Tipo</label>
                            <select name="tipo" id="tipo" value={formData.tipo} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                                <option>Mastro</option>
                                <option>Conto</option>
                                <option>Sottoconto</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="natura" className="block text-sm font-medium text-gray-700">Natura</label>
                            <select name="natura" id="natura" value={formData.natura} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                                <option>Costo</option>
                                <option>Passività</option>
                                <option>Ricavo</option>
                                <option>Attività</option>
                                <option>Patrimoniale</option>
                            </select>
                        </div>
                    </div>
                   <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Annulla</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Salva</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Componenti di Sezione (MODIFICATO) ---

// 1. GESTIONE PIANO DEI CONTI
const PianoDeiContiManager = () => {
    const [pdc, setPdc] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const { hasPermission } = useAuth();
    const canEdit = hasPermission('PDC_EDIT', 90);

    const fetchPdc = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await api.get('/contsmart/piano-dei-conti');
            if (data.success) setPdc(data.data);
        } catch (error) {
            console.error("Errore fetch piano dei conti:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPdc();
    }, [fetchPdc]);

    const handleOpenModal = (item = null) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingItem(null);
        setIsModalOpen(false);
    };

    const handleSave = async (formData, itemId) => {
        try {
            let response;
            if (itemId) {
                // Logica di modifica (PATCH) - da implementare nel backend
                // response = await api.patch(`/contsmart/piano-dei-conti/${itemId}`, formData);
                alert("Funzione di modifica non ancora implementata nel backend.");
            } else {
                // Logica di creazione (POST)
                response = await api.post('/contsmart/piano-dei-conti', formData);
            }
            
            if (response && response.data.success) {
                alert(response.data.message);
                handleCloseModal();
                fetchPdc(); // Ricarica i dati
            } else if (response) {
                 alert(`Errore: ${response.data.message}`);
            }
        } catch (error) {
            alert(`Errore di rete: ${error.response?.data?.message || error.message}`);
        }
    };

    // Componente ricorsivo per renderizzare l'albero del piano dei conti
    const ContoNode = ({ conto, level }) => {
        const [isOpen, setIsOpen] = useState(level < 2);
        const hasChildren = conto.figli && conto.figli.length > 0;

        return (
            <div style={{ marginLeft: `${level * 20}px` }}>
                <div className="flex items-center justify-between p-2 hover:bg-slate-100 rounded-md group">
                    <div className="flex items-center gap-2">
                        {hasChildren ? (
                            <ChevronRightIcon className={`h-4 w-4 cursor-pointer transition-transform ${isOpen ? 'rotate-90' : ''}`} onClick={() => setIsOpen(!isOpen)} />
                        ) : <div className="w-4 h-4"></div>}
                        <FolderIcon className={`h-5 w-5 flex-shrink-0 ${conto.tipo === 'Mastro' ? 'text-yellow-600' : 'text-blue-600'}`} />
                        <span className="font-medium text-sm">{conto.codice} - {conto.descrizione}</span>
                        <span className="text-xs text-gray-500 px-2 py-1 bg-gray-200 rounded-full">{conto.tipo}</span>
                    </div>
                    {canEdit && (
                        <button onClick={() => handleOpenModal(conto)} className="text-blue-600 text-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            <PencilIcon className="h-4 w-4" /> Modifica
                        </button>
                    )}
                </div>
                {isOpen && hasChildren && (
                    <div>
                        {conto.figli.map(figlio => <ContoNode key={figlio.id} conto={figlio} level={level + 1} />)}
                    </div>
                )}
            </div>
        );
    };

    if (isLoading) return <p>Caricamento Piano dei Conti...</p>;

    return (
        <div>
            {isModalOpen && <PdcEditModal item={editingItem} onSave={handleSave} onCancel={handleCloseModal} pdcTree={pdc} />}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-slate-700">Struttura Piano dei Conti</h3>
                {canEdit && (
                    <button onClick={() => handleOpenModal(null)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">
                        <PlusIcon className="h-5 w-5" /> Nuovo Conto
                    </button>
                )}
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md max-h-[60vh] overflow-y-auto">
                {pdc.map(mastro => <ContoNode key={mastro.id} conto={mastro} level={0} />)}
            </div>
        </div>
    );
};

// 2. GESTIONE REGISTRAZIONI CONTABILI (invariato)
const RegistrazioniManager = () => {
    const { hasPermission } = useAuth();
    const [registrazioni, setRegistrazioni] = useState([]);
    const canCreate = hasPermission('CONTABILITA_CREATE', 50);

    useEffect(() => {
        const fetchRegistrazioni = async () => {
            try {
                const { data } = await api.get('/contsmart/registrazioni');
                if (data.success) setRegistrazioni(data.data);
            } catch (error) {
                console.error("Errore fetch registrazioni:", error);
            }
        };
        fetchRegistrazioni();
    }, []);

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-slate-700">Ultime Registrazioni</h3>
                {canCreate && (
                    <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700">
                        <PlusIcon className="h-5 w-5" /> Nuova Registrazione
                    </button>
                )}
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Data</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Descrizione</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Stato</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Utente</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Azioni</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {registrazioni.map(reg => (
                            <tr key={reg.id}>
                                <td className="px-6 py-4">{new Date(reg.data_registrazione).toLocaleDateString()}</td>
                                <td className="px-6 py-4 font-medium">{reg.descrizione_testata}</td>
                                <td className="px-6 py-4">
                                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                         reg.stato === 'Confermato' ? 'bg-green-100 text-green-800' :
                                         reg.stato === 'Annullato' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                     }`}>{reg.stato}</span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">{reg.nome} {reg.cognome}</td>
                                <td className="px-6 py-4 text-center">
                                    <button className="text-blue-600 hover:text-blue-900 text-sm">Visualizza</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// 3. REPORT E INTERROGAZIONI (invariato)
const ReportManager = () => {
    return (
        <div>
            <h3 className="text-xl font-semibold text-slate-700 mb-4">Report e Interrogazioni</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                    <h4 className="font-bold text-slate-800">Bilancio di Verifica</h4>
                    <p className="text-sm text-slate-600 mt-1">Controlla la quadratura dei conti in un dato periodo.</p>
                </div>
                 <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                    <h4 className="font-bold text-slate-800">Partitari Contabili</h4>
                    <p className="text-sm text-slate-600 mt-1">Visualizza i movimenti di un singolo conto.</p>
                </div>
                 <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                    <h4 className="font-bold text-slate-800">Liquidazione IVA</h4>
                    <p className="text-sm text-slate-600 mt-1">Prepara i dati per la liquidazione periodica dell'IVA.</p>
                </div>
            </div>
        </div>
    );
};


// --- NUOVI: Componenti Segnaposto per Sezioni Future ---
const PlaceholderView = ({ title }) => (
    <div className="p-6 text-center text-slate-500">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="mt-2">Questa sezione è in fase di sviluppo.</p>
    </div>
);
// --- Componente Vista per Piano dei Conti ---
const PianoDeiContiView = ({ user }) => {
  // spostati all'interno DEL COMPONENTE PRINCIPALE
    const [pdcTree, setPdcTree] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [selectedItem, setSelectedItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // NUOVO: Stato per tenere traccia dei nodi espansi (usiamo un Set per efficienza)
    const [expandedNodes, setExpandedNodes] = useState(new Set());

    const fetchPdc = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/contsmart/piano-dei-conti');
            if (response.data && Array.isArray(response.data.data)) {
                setPdcTree(response.data.data);
            } else {
                console.warn("La struttura dati dell'API non è quella attesa.", response.data);
                setPdcTree([]);
            }
        } catch (err) {
            setError('Errore nel caricamento del piano dei conti.');
            setPdcTree([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPdc();
    }, [fetchPdc]);

    // NUOVO: Funzione per gestire l'apertura/chiusura di un nodo
    const toggleNode = (nodeId) => {
        setExpandedNodes(prevExpanded => {
            const newExpanded = new Set(prevExpanded);
            if (newExpanded.has(nodeId)) {
                newExpanded.delete(nodeId);
            } else {
                newExpanded.add(nodeId);
            }
            return newExpanded;
        });
    };
    
    const handleSave = async (data, id) => {
       try {
            if (id) {
                await api.patch(`/contsmart/piano-dei-conti/${id}`, data);
            } else {
                await api.post('/contsmart/piano-dei-conti', data);
            }
            fetchPdc();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Errore nel salvataggio:", error);
            alert("Si è verificato un errore durante il salvataggio.");
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
    };

    const handleNewItem = (parentId = null) => {
        setSelectedItem({ id_padre: parentId });
        setIsModalOpen(true);
    };
    
    const handleEditItem = (item) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };
    
    // NUOVO: Funzione ricorsiva per costruire la lista dei nodi visibili
    const buildVisibleNodes = (nodes, level = 0) => {
        let visible = [];
        nodes.forEach(node => {
            visible.push({ ...node, level });
            // Se il nodo è espanso e ha figli, aggiungi ricorsivamente anche loro
            if (expandedNodes.has(node.id) && node.figli && node.figli.length > 0) {
                visible = visible.concat(buildVisibleNodes(node.figli, level + 1));
            }
        });
        return visible;
    };

    if (loading) return <div>Caricamento...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    // Costruiamo la lista dei nodi da visualizzare ad ogni render
    const visibleNodes = buildVisibleNodes(pdcTree);

    return (
        <div>
             {isModalOpen && <PdcEditModal item={selectedItem} onSave={handleSave} onCancel={handleCancel} pdcTree={pdcTree} />}
            <div className="flex justify-end mb-4">
                 <button onClick={() => handleNewItem(null)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow">
                     <PlusIcon className="h-5 w-5" /> Nuovo Mastro/Conto
                 </button>
            </div>
            
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-3 text-sm font-semibold text-slate-600">Codice e Descrizione</th>
                                                        <th className="p-3 text-sm font-semibold text-slate-600">Tipo</th>
                            <th className="p-3 text-sm font-semibold text-slate-600">Natura</th>
                            <th className="p-3 text-sm font-semibold text-slate-600">Azioni</th>
                            <th className="p-3 text-sm font-semibold text-slate-600">Progressivo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!loading && visibleNodes.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="p-6 text-center text-slate-500">
                                    <FolderIcon className="mx-auto h-12 w-12 text-slate-400" />
                                    <h3 className="mt-2 text-sm font-medium text-slate-900">Nessun dato nel Piano dei Conti</h3>
                                    <p className="mt-1 text-sm text-slate-500">Inizia creando il primo mastro o conto.</p>
                                </td>
                            </tr>
                        ) : (
                            visibleNodes.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50">
                                    <td className="p-3 border-b border-slate-200">
                                        <div style={{ paddingLeft: `${item.level * 24}px` }} className="flex items-center gap-2">
                                            {item.tipo !== 'Sottoconto' ? (
                                                <button onClick={() => toggleNode(item.id)} className="flex items-center gap-2 cursor-pointer">
                                                    <ChevronRightIcon className={`h-4 w-4 transition-transform ${expandedNodes.has(item.id) ? 'rotate-90' : ''}`} />
                                                    <FolderIcon className="h-5 w-5 text-amber-500"/>
                                                    <span>{item.codice} - <strong>{item.descrizione}</strong></span>
                                                </button>
                                            ) : (
                                                <span className="flex items-center gap-2 pl-6">
                                                    {item.codice} - {item.descrizione}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-3 border-b border-slate-200">{item.tipo}</td>
                                    <td className="p-3 border-b border-slate-200">{item.natura}</td>
                                    <td className="p-3 border-b border-slate-200">
                                        <button onClick={() => handleEditItem(item)} className="text-blue-600 hover:text-blue-800 mr-2"><PencilIcon className="h-5 w-5"/></button>
                                        {item.tipo !== 'Sottoconto' && <button onClick={() => handleNewItem(item.id)} className="text-green-600 hover:text-green-800"><PlusIcon className="h-5 w-5"/></button>}
                                   </td>
                                   <td className="p-3 border-b border-slate-200">{item.id}</td>
                                    
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


const GestioneFunzioniView = ({ pdcTree }) => {
    const [funzioni, setFunzioni] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFunzione, setSelectedFunzione] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    // Stato per il modale di eliminazione
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [funzioneToDelete, setFunzioneToDelete] = useState(null);

    useEffect(() => {
        const loadFunzioni = async () => {
            try {
                setLoading(true);
                const response = await api.get('/contsmart/funzioni');
                const dati = response.data?.data || [];
                setFunzioni(dati);
            } catch (err) {
                setError('Errore nel caricamento delle funzioni contabili.');
            } finally {
                setLoading(false);
            }
        };
        loadFunzioni();
    }, [refreshKey]);
    
    // Handler per Modifica/Creazione
    const handleNewFunzione = () => { /*...*/ };
    const handleEditFunzione = (funzione) => { /*...*/ };
    const handleSaveFunzione = async (data, id) => { /*...*/ };
    const handleCancelFunzione = () => { /*...*/ };
    
    // Handler per Eliminazione
    const handleDeleteFunzione = (funzione) => {
        setFunzioneToDelete(funzione);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!funzioneToDelete) return;
        try {
            await api.delete(`/contsmart/funzioni/${funzioneToDelete.id}`);
            setShowDeleteModal(false);
            setFunzioneToDelete(null);
            setRefreshKey(oldKey => oldKey + 1); // Forza l'aggiornamento
        } catch (error) {
            console.error("Errore durante l'eliminazione:", error);
            alert("Si è verificato un errore durante l'eliminazione.");
            setShowDeleteModal(false);
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setFunzioneToDelete(null);
    };


    if (loading) return <div className="p-4">Caricamento in corso...</div>;
    if (error) return <div className="p-4 text-red-500">{error}</div>;
    
    return (
        <div>
            {isModalOpen && <FunzioneContabileEditModal item={selectedFunzione} onSave={handleSaveFunzione} onCancel={handleCancelFunzione} pdcTree={pdcTree} />}
            {showDeleteModal && (
                <DeleteConfirmationModal
                    onConfirm={confirmDelete}
                    onCancel={cancelDelete}
                    message={`Sei sicuro di voler eliminare la funzione "${funzioneToDelete?.nome_funzione}"? L'operazione non è reversibile.`}
                />
            )}

            <div className="flex justify-end mb-4">
                {/* Pulsante Nuova Funzione */}
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="w-full text-left">
                     {/* Thead */}
                    <tbody>
                        {funzioni.length > 0 ? (
                            funzioni.map(funzione => (
                            <tr key={funzione.id} className="border-b border-slate-200 hover:bg-slate-50">
                                {/* ... td per codice, nome, etc ... */}
                                <td className="p-3">
                                    <button onClick={() => handleEditFunzione(funzione)} className="text-blue-600 hover:text-blue-800 mr-3">
                                        <PencilIcon className="h-5 w-5" />
                                    </button>
                                    <button onClick={() => handleDeleteFunzione(funzione)} className="text-red-500 hover:text-red-700">
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                            ))
                        ) : (
                            <tr><td colSpan="6" className="p-4 text-center text-slate-500">Nessuna funzione contabile trovata.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// #####################################################################
// # NUOVO: Componente Modale per Creazione/Modifica Funzioni Contabili
// #####################################################################
const FunzioneContabileEditModal = ({ item, onSave, onCancel, pdcTree }) => {
    const [formData, setFormData] = useState({
        codice_funzione: '',
        nome_funzione: '',
        descrizione: '',
        categoria: 'Generale',
        attiva: true,
        righe: []
    });

    useEffect(() => {
        if (item) {
            setFormData({
                codice_funzione: item.codice_funzione || '',
                nome_funzione: item.nome_funzione || '',
                descrizione: item.descrizione || '',
                categoria: item.categoria || 'Generale',
                attiva: item.attiva !== undefined ? item.attiva : true,
                righe: item.righe || []
            });
        } else {
             setFormData({
                codice_funzione: '',
                nome_funzione: '',
                descrizione: '',
                categoria: 'Generale',
                attiva: true,
                righe: [{ id_conto: '', tipo_movimento: 'D', descrizione_riga_predefinita: '', is_sottoconto_modificabile: true }]
            });
        }
    }, [item]);
    
    const renderPdcOptions = (nodes, level = 0) => {
        return nodes.flatMap(node => [
            <option key={node.id} value={node.id}>
                {'\u00A0'.repeat(level * 4)} {node.codice} - {node.descrizione}
            </option>,
            ...(node.figli && node.figli.length > 0 ? renderPdcOptions(node.figli, level + 1) : [])
        ]);
    };

    const handleHeaderChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleRigaChange = (index, e) => {
        const { name, value, type, checked } = e.target;
        const newRighe = [...formData.righe];
        newRighe[index] = { ...newRighe[index], [name]: type === 'checkbox' ? checked : value };
        setFormData(prev => ({ ...prev, righe: newRighe }));
    };
    
    const addRiga = () => {
        const newRiga = { id_conto: '', tipo_movimento: 'D', descrizione_riga_predefinita: '', is_sottoconto_modificabile: true };
        setFormData(prev => ({ ...prev, righe: [...prev.righe, newRiga] }));
    };

    const removeRiga = (index) => {
        const newRighe = formData.righe.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, righe: newRighe }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData, item ? item.id : null);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <h2 className="text-xl font-bold mb-4">{item ? 'Modifica Funzione' : 'Nuova Funzione Contabile'}</h2>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2 space-y-6">
                    <fieldset className="border p-4 rounded-md space-y-4">
                        <legend className="text-lg font-medium px-2">Dati Principali</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="codice_funzione" className="block text-sm font-medium text-gray-700">Codice Funzione</label>
                                <input type="text" name="codice_funzione" value={formData.codice_funzione} onChange={handleHeaderChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                            </div>
                            <div>
                                <label htmlFor="nome_funzione" className="block text-sm font-medium text-gray-700">Nome Funzione</label>
                                <input type="text" name="nome_funzione" value={formData.nome_funzione} onChange={handleHeaderChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                            </div>
                             <div>
                                <label htmlFor="categoria" className="block text-sm font-medium text-gray-700">Categoria</label>
                                <input type="text" name="categoria" value={formData.categoria} onChange={handleHeaderChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                            </div>
                            <div className="flex items-center">
                                <input type="checkbox" name="attiva" checked={formData.attiva} onChange={handleHeaderChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                <label htmlFor="attiva" className="ml-2 block text-sm text-gray-900">Attiva</label>
                            </div>
                        </div>
                         <div>
                            <label htmlFor="descrizione" className="block text-sm font-medium text-gray-700">Descrizione</label>
                            <textarea name="descrizione" value={formData.descrizione} onChange={handleHeaderChange} rows="2" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
                        </div>
                    </fieldset>
                    
                    <fieldset className="border p-4 rounded-md mt-6">
                        <legend className="text-lg font-medium px-2">Righe Partita Doppia</legend>
                        <div className="space-y-2">
                            {formData.righe.map((riga, index) => (
                                <div key={index} className="grid grid-cols-12 gap-2 items-center border-b py-2">
                                    <select name="id_conto" value={riga.id_conto} onChange={(e) => handleRigaChange(index, e)} className="col-span-5 mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm">
                                        <option value="">Seleziona un conto...</option>
                                        {renderPdcOptions(pdcTree)}
                                    </select>
                                    <select name="tipo_movimento" value={riga.tipo_movimento} onChange={(e) => handleRigaChange(index, e)} className="col-span-2 mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm">
                                        <option value="D">Dare</option>
                                        <option value="A">Avere</option>
                                    </select>
                                    <input type="text" name="descrizione_riga_predefinita" placeholder="Descrizione" value={riga.descrizione_riga_predefinita} onChange={(e) => handleRigaChange(index, e)} className="col-span-4 mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm" />
                                    <button type="button" onClick={() => removeRiga(index)} className="col-span-1 text-red-500 hover:text-red-700 justify-self-center"><TrashIcon className="h-5 w-5"/></button>
                                </div>
                            ))}
                        </div>
                         <button type="button" onClick={addRiga} className="mt-4 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
                             <PlusIcon className="h-4 w-4"/> Aggiungi Riga
                        </button>
                    </fieldset>
                </form>
                 <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                    <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Annulla</button>
                    <button type="button" onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Salva Funzione</button>
                </div>
            </div>
        </div>
    );
};


// #####################################################################
// # Componente Principale: ContSmartModule (Aggiornato e Allineato)
// #####################################################################
const ContSmartModule = () => {
    const { user } = useAuth();
    const [activeSection, setActiveSection] = useState('pdc');

    // Stato del Piano dei Conti spostato qui per essere condiviso

    const [pdcTree, setPdcTree] = useState([]);
     
    const [pdcLoading, setPdcLoading] = useState(true);
    const [pdcError, setPdcError] = useState('');


    const accessibleSections = [
        { key: 'pdc', label: 'Piano dei Conti', icon: FolderIcon, minLevel: 10 },
        { key: 'funzioni', label: 'Gestione Funzioni', icon: WrenchScrewdriverIcon, minLevel: 90 },
        { key: 'registrazioni', label: 'Registrazioni', icon: PencilSquareIcon, minLevel: 50 },
        { key: 'report', label: 'Reportistica', icon: ChartBarIcon, minLevel: 50 },
    ].filter(sec => user && user.livello >= sec.minLevel);
    
    const fetchPdc = useCallback(async () => {
        try {
            setPdcLoading(true);
            const response = await api.get('/contsmart/piano-dei-conti');
            if (response.data && Array.isArray(response.data.data)) {
                setPdcTree(response.data.data);
            } else {
                setPdcTree([]);
            }
        } catch (err) {
            setPdcError('Errore nel caricamento del piano dei conti.');
        } finally {
            setPdcLoading(false);
        }
    }, []);
    
    useEffect(() => {
        fetchPdc();
    }, [fetchPdc]);

    const renderContent = () => {
        switch (activeSection) {
            case 'pdc':
                return <PianoDeiContiView user={user} />;
            case 'funzioni':
                return <GestioneFunzioniView pdcTree={pdcTree} />;
            case 'registrazioni':
                return <div className="p-4"><h2>Registrazioni (in costruzione)</h2></div>;
            case 'report':
                return <div className="p-4"><h2>Reportistica (in costruzione)</h2></div>;
            default:
                return <PianoDeiContiView user={user} pdcTree={pdcTree} fetchPdc={fetchPdc} />;
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col">
            <header className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Modulo Contabilità Smart</h1>
                <p className="text-slate-600 mt-1">Gestione completa delle operazioni contabili.</p>
            </header>
            
            <div className="border-b border-slate-200 mb-6">
                <nav className="-mb-px flex space-x-6">
                    {accessibleSections.map(sec => {
                        const Icon = sec.icon;
                        return (
                            <button 
                                key={sec.key}
                                onClick={() => setActiveSection(sec.key)}
                                className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeSection === sec.key 
                                    ? 'border-blue-500 text-blue-600' 
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }`}
                            >
                                <Icon className="h-5 w-5" />
                                <span>{sec.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            <main className="flex-1">
                {renderContent()}
            </main>
        </div>
    );
};

export default ContSmartModule;




