// #####################################################################
// # Componente per la Gestione del Piano dei Conti v2.3 (Scope Corretto)
// # File: opero-gestionale/opero-frontend/src/components/cont-smart/PianoContiManager.js
// #####################################################################

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { 
    FolderIcon, DocumentTextIcon, ChevronRightIcon, PlusIcon, ArrowPathIcon, 
    PencilIcon, TrashIcon, MagnifyingGlassIcon, ArrowDownTrayIcon,
    ArrowsPointingOutIcon, ArrowsPointingInIcon 
} from '@heroicons/react/24/solid';

// --- Componente Modale per Creazione/Modifica ---
const PdcEditModal = ({ item, onSave, onCancel, pdcTree }) => {
    const [formData, setFormData] = useState({
        codice: '', descrizione: '', id_padre: null, tipo: 'Sottoconto', natura: 'Costo',
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
             setFormData({ codice: '', descrizione: '', id_padre: null, tipo: 'Sottoconto', natura: 'Costo' });
        }
    }, [item]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };
    
    const renderSelectOptions = (nodes, level = 0) => {
        let options = [];
        nodes.forEach(node => {
            if (node.tipo === 'Mastro' || (node.children && node.children.length > 0)) {
                options.push(
                    <option key={node.id} value={node.id}>
                        {'--'.repeat(level)} {node.codice} - {node.descrizione}
                    </option>
                );
                if (node.children && node.children.length > 0) {
                    options = options.concat(renderSelectOptions(node.children, level + 1));
                }
            }
        });
        return options;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">{item?.id ? 'Modifica Voce' : 'Nuova Voce'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">Tipo</label>
                        <select id="tipo" name="tipo" value={formData.tipo} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                            <option value="Mastro">Mastro</option>
                            <option value="Sottoconto">Sottoconto</option>
                        </select>
                    </div>
                     {formData.tipo === 'Sottoconto' && (
                        <>
                            <div>
                                <label htmlFor="id_padre" className="block text-sm font-medium text-gray-700">Mastro/Conto di appartenenza</label>
                                <select id="id_padre" name="id_padre" value={formData.id_padre || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                    <option value="">Nessuno</option>
                                    {renderSelectOptions(pdcTree)}
                                </select>
                            </div>
                             <div>
                                <label htmlFor="natura" className="block text-sm font-medium text-gray-700">Natura</label>
                                <select id="natura" name="natura" value={formData.natura} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                    <option value="Costo">Costo</option>
                                    <option value="Ricavo">Ricavo</option>
                                    <option value="Patrimoniale">Patrimoniale</option>
                                    <option value="Finanziario">Finanziario</option>
                                </select>
                            </div>
                        </>
                    )}
                    <div>
                        <label htmlFor="codice" className="block text-sm font-medium text-gray-700">Codice</label>
                        <input type="text" id="codice" name="codice" value={formData.codice} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                        <label htmlFor="descrizione" className="block text-sm font-medium text-gray-700">Descrizione</label>
                        <input type="text" id="descrizione" name="descrizione" value={formData.descrizione} onChange={handleChange} required className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                     <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Annulla</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Salva</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Componente per il Singolo Nodo dell'Albero ---
// --- NOVITÀ: Aggiunto 'allExpandedNodes' come prop per risolvere il problema di scope ---
const TreeNode = ({ item, level, onAdd, onEdit, onDelete, isExpanded, onToggle, allExpandedNodes }) => {
    const hasChildren = item.children && item.children.length > 0;
    const Icon = hasChildren ? FolderIcon : DocumentTextIcon;
    const iconColor = hasChildren ? "text-blue-500" : "text-slate-500";

    return (
        <div className="my-1">
            <div className={`flex items-center p-2 rounded-md ${level === 0 ? 'bg-slate-100' : ''} hover:bg-blue-50`}>
                <div style={{ paddingLeft: `${level * 1.5}rem` }} className="flex-grow flex items-center">
                    {hasChildren ? (
                        <ChevronRightIcon
                            className={`h-5 w-5 mr-2 text-slate-500 cursor-pointer transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                            onClick={() => onToggle(item.id)}
                        />
                    ) : <div className="w-5 mr-2 h-5"></div>}
                    <Icon className={`h-5 w-5 mr-2 ${iconColor}`}/>
                    <span className="font-medium text-slate-800 mr-2">{item.codice}</span>
                    <span className="text-slate-600">{item.descrizione}</span>
                </div>
                <div className="flex-shrink-0 flex items-center space-x-2">
                    {hasChildren && (
                         <button onClick={() => onAdd(item.id, 'Sottoconto')} title="Aggiungi Sottoconto" className="text-slate-400 hover:text-blue-600 p-1 rounded-full"><PlusIcon className="h-4 w-4"/></button>
                    )}
                    <button onClick={() => onEdit(item)} title="Modifica" className="text-slate-400 hover:text-green-600 p-1 rounded-full"><PencilIcon className="h-4 w-4"/></button>
                    <button onClick={() => onDelete(item)} title="Elimina" className="text-slate-400 hover:text-red-600 p-1 rounded-full"><TrashIcon className="h-4 w-4"/></button>
                </div>
            </div>
            {isExpanded && hasChildren && (
                <div className="border-l-2 border-slate-200 ml-4">
                    {item.children.map(child => (
                        <TreeNode 
                            key={child.id} item={child} level={level + 1}
                            onAdd={onAdd} onEdit={onEdit} onDelete={onDelete}
                            // --- NOVITÀ: Ora usiamo 'allExpandedNodes' per determinare lo stato del figlio ---
                            isExpanded={!!allExpandedNodes[child.id]} 
                            onToggle={onToggle}
                            allExpandedNodes={allExpandedNodes} // E lo passiamo ricorsivamente
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Componente Principale del Gestore PDC ---
const PianoContiManager = () => {
    const [pdcTree, setPdcTree] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedNodes, setExpandedNodes] = useState({});

    const fetchPdcTree = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get('/contsmart/pdc-tree');
            if (response.data.success) {
                setPdcTree(response.data.data);
            } else {
                throw new Error(response.data.message || 'Errore nel caricamento dei dati.');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Impossibile connettersi al server.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPdcTree();
    }, [fetchPdcTree]);
    
    const getAllNodeIds = (nodes) => {
        let ids = {};
        nodes.forEach(node => {
            if (node.children && node.children.length > 0) {
                ids[node.id] = true;
                Object.assign(ids, getAllNodeIds(node.children));
            }
        });
        return ids;
    };
    
    const handleExpandAll = () => setExpandedNodes(getAllNodeIds(pdcTree));
    const handleCollapseAll = () => setExpandedNodes({});
    const handleToggleNode = (nodeId) => {
        setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
    };

    const filteredTree = useMemo(() => {
        if (!searchTerm) return pdcTree;
        const term = searchTerm.toLowerCase();
        
        const filterNodes = (nodes) => {
            const result = [];
            for (const node of nodes) {
                const children = node.children ? filterNodes(node.children) : [];
                const matches = node.descrizione.toLowerCase().includes(term) || node.codice.toLowerCase().includes(term);
                if (matches || children.length > 0) {
                    result.push({ ...node, children });
                }
            }
            return result;
        };
        // Quando si cerca, espande automaticamente tutti i nodi per mostrare i risultati
        if(searchTerm) {
            const allIds = getAllNodeIds(filterNodes(pdcTree));
            setExpandedNodes(allIds);
        }
        return filterNodes(pdcTree);
    }, [pdcTree, searchTerm]);

    const handleExportCSV = () => {
        const flattenData = (nodes, parentCodice = '') => {
            let data = [];
            nodes.forEach(node => {
                data.push({
                    codice: node.codice,
                    descrizione: node.descrizione,
                    tipo: node.tipo,
                    natura: node.natura || '',
                    codice_padre: parentCodice
                });
                if (node.children && node.children.length > 0) {
                    data = data.concat(flattenData(node.children, node.codice));
                }
            });
            return data;
        };
        const flatPdc = flattenData(pdcTree);
        const header = "Codice;Descrizione;Tipo;Natura;Codice Padre\n";
        const csvContent = flatPdc.map(row => 
            `${row.codice};"${row.descrizione}";${row.tipo};${row.natura};${row.codice_padre}`
        ).join("\n");
        const blob = new Blob(["\uFEFF" + header + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "piano_dei_conti.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleAdd = (parentId = null, type = 'Mastro') => {
        setEditingItem({ id_padre: parentId, tipo: type, natura: 'Costo', codice: '', descrizione: '' });
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };
    
    const handleDelete = async (item) => {
        if(window.confirm(`Sei sicuro di voler eliminare "${item.descrizione}"?`)) {
            try {
                await api.delete(`/contsmart/pdc/${item.id}`);
                fetchPdcTree();
            } catch(err) {
                alert(err.response?.data?.message || 'Errore durante l\'eliminazione.');
            }
        }
    };
    
    const handleSave = async (formData) => {
        try {
            if (editingItem?.id) {
                await api.put(`/contsmart/pdc/${editingItem.id}`, formData);
            } else {
                await api.post('/contsmart/pdc', formData);
            }
            fetchPdcTree();
            handleCancel();
        } catch (err) {
            alert(err.response?.data?.message || 'Errore durante il salvataggio.');
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    if (isLoading) return <div className="p-4 text-center">Caricamento del Piano dei Conti...</div>;
    if (error) return <div className="p-4 text-red-600 bg-red-50 rounded-md">Errore: {error}</div>;

    return (
        <div className="p-4 bg-white shadow rounded-lg">
            <div className="mb-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                     <h2 className="text-xl font-semibold text-slate-800">Gestione Piano dei Conti</h2>
                     <div className="relative">
                        <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2"/>
                        <input
                            type="text"
                            placeholder="Cerca per codice o descrizione..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-64 pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
                 <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button onClick={() => handleAdd(null, 'Mastro')} className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                        <PlusIcon className="h-5 w-5 mr-1"/> Nuovo Mastro
                    </button>
                    <button onClick={handleExpandAll} className="flex items-center px-3 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 text-sm">
                        <ArrowsPointingOutIcon className="h-5 w-5 mr-1"/> Espandi
                    </button>
                    <button onClick={handleCollapseAll} className="flex items-center px-3 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 text-sm">
                        <ArrowsPointingInIcon className="h-5 w-5 mr-1"/> Comprimi
                    </button>
                     <button onClick={handleExportCSV} className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">
                        <ArrowDownTrayIcon className="h-5 w-5 mr-1"/> Esporta CSV
                    </button>
                    <button onClick={fetchPdcTree} title="Ricarica dati" className="p-2 text-slate-500 hover:text-slate-800"><ArrowPathIcon className="h-5 w-5"/></button>
                 </div>
            </div>

            <div>
                {filteredTree.map(rootNode => (
                    <TreeNode 
                        key={rootNode.id} 
                        item={rootNode} 
                        level={0}
                        onAdd={handleAdd}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        isExpanded={!!expandedNodes[rootNode.id]}
                        onToggle={handleToggleNode}
                        // --- NOVITÀ: Passiamo l'intero oggetto 'expandedNodes' come prop ---
                        allExpandedNodes={expandedNodes}
                    />
                ))}
            </div>

            {isModalOpen && (
                <PdcEditModal 
                    item={editingItem}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    pdcTree={pdcTree}
                />
            )}
        </div>
    );
};

export default PianoContiManager;

