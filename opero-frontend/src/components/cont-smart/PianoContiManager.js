// #####################################################################
// # Componente per la Gestione del Piano dei Conti v2.5 (API Fix)
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
        }
    }, [item]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...item, ...formData });
    };

    const renderParentOptions = () => {
        const options = [];
        const traverse = (nodes, level) => {
            if (!Array.isArray(nodes)) return;
            nodes.forEach(node => {
                let canBeParent = false;
                if (formData.tipo === 'Conto' && node.tipo === 'Mastro') canBeParent = true;
                else if (formData.tipo === 'Sottoconto' && node.tipo === 'Conto') canBeParent = true;
                
                if (canBeParent) {
                    options.push(
                        <option key={node.id} value={node.id}>
                            {'—'.repeat(level)} {node.codice} - {node.descrizione}
                        </option>
                    );
                }

                if (node.children && node.children.length > 0) {
                    traverse(node.children, level + 1);
                }
            });
        };
        traverse(pdcTree, 0);
        return options;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg">
                <h2 className="text-xl font-bold text-slate-800 mb-4">{item && item.id ? 'Modifica Elemento' : 'Nuovo Elemento'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="tipo" className="block text-sm font-medium text-slate-700">Tipo</label>
                            <select name="tipo" value={formData.tipo} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                <option value="Mastro">Mastro</option>
                                <option value="Conto">Conto</option>
                                <option value="Sottoconto">Sottoconto</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="id_padre" className="block text-sm font-medium text-slate-700">Padre</label>
                            <select name="id_padre" value={formData.id_padre || ''} onChange={handleChange} disabled={formData.tipo === 'Mastro'} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50">
                                <option value="">Nessun Padre</option>
                                {renderParentOptions()}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="descrizione" className="block text-sm font-medium text-slate-700">Descrizione</label>
                            <input type="text" name="descrizione" value={formData.descrizione} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                        </div>
                        {formData.tipo !== 'Mastro' && (
                             <div>
                                <label htmlFor="natura" className="block text-sm font-medium text-slate-700">Natura</label>
                                <select name="natura" value={formData.natura} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                    <option value="Costo">Costo</option>
                                    <option value="Ricavo">Ricavo</option>
                                    <option value="Patrimoniale">Patrimoniale</option>
                                    <option value="Finanziario">Finanziario</option>
                                </select>
                            </div>
                        )}
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Annulla</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Salva</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Componente per il Singolo Nodo dell'Albero ---
const TreeNode = ({ item, level, onAdd, onEdit, onDelete, isExpanded, onToggle, allExpandedNodes }) => {
    const Icon = item.tipo === 'Mastro' ? FolderIcon : DocumentTextIcon;
    const hasChildren = item.children && item.children.length > 0;
    const isVisible = level === 0 || (item.id_padre && allExpandedNodes[item.id_padre]);
    if (!isVisible && level > 0) return null;

    return (
        <div className={`ml-${level * 4}`}>
            <div className="flex items-center hover:bg-slate-100 rounded-md p-1 my-0.5">
                {hasChildren ? (
                    <ChevronRightIcon 
                        className={`h-4 w-4 mr-1 cursor-pointer transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
                        onClick={() => onToggle(item.id)}
                    />
                ) : <span className="w-4 mr-1"></span>}
                <Icon className={`h-5 w-5 mr-2 ${item.tipo === 'Mastro' ? 'text-sky-600' : 'text-slate-500'}`} />
                <span className="font-mono text-sm text-slate-600 w-32 flex-shrink-0">{item.codice}</span>
                <span className="flex-grow text-slate-800">{item.descrizione}</span>
                <div className="flex items-center gap-2">
                    {item.tipo !== 'Sottoconto' && (
                        <button onClick={() => onAdd(item)} className="p-1 text-slate-400 hover:text-green-600" title="Aggiungi figlio"><PlusIcon className="h-4 w-4" /></button>
                    )}
                    <button onClick={() => onEdit(item)} className="p-1 text-slate-400 hover:text-blue-600" title="Modifica"><PencilIcon className="h-4 w-4" /></button>
                    <button onClick={() => onDelete(item)} className="p-1 text-slate-400 hover:text-red-600" title="Elimina"><TrashIcon className="h-4 w-4" /></button>
                </div>
            </div>
            {hasChildren && isExpanded && item.children.map(child => (
                <TreeNode 
                    key={child.id} item={child} level={level + 1}
                    onAdd={onAdd} onEdit={onEdit} onDelete={onDelete}
                    isExpanded={!!allExpandedNodes[child.id]}
                    onToggle={onToggle} allExpandedNodes={allExpandedNodes}
                />
            ))}
        </div>
    );
};

// --- Componente Principale ---
const PianoContiManager = () => {
    const auth = useAuth();
    const [pdcTree, setPdcTree] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedNodes, setExpandedNodes] = useState({});

    const fetchPdcTree = useCallback(async () => {
        setIsLoading(true);
        try {
            // <span style="color:red;">// CORRETTO: Rimosso /api dal percorso</span>
            const response = await api.get('/contsmart/pdc-tree');
            if (response.data.success) {
                setPdcTree(response.data.data);
            }
        } catch (error) {
            console.error("Errore nel caricamento del PDC:", error);
        } finally {
            setIsLoading(false);
        }
    }, [auth.token]);

    useEffect(() => {
        fetchPdcTree();
    }, [fetchPdcTree]);

    const handleAdd = (parentItem = null) => {
        let newItemType = 'Mastro';
        let parentId = null;
        if (parentItem) {
            if (parentItem.tipo === 'Mastro') newItemType = 'Conto';
            else if (parentItem.tipo === 'Conto') newItemType = 'Sottoconto';
            parentId = parentItem.id;
        }
        setEditingItem({ id: null, id_padre: parentId, tipo: newItemType, natura: 'Costo' });
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };
    
    const handleSave = async (itemData) => {
        try {
            if (itemData.id) { // Modifica
                 // <span style="color:red;">// CORRETTO: Rimosso /api dal percorso</span>
                await api.patch(`/contsmart/pdc/${itemData.id}`, itemData);
            } else { // Creazione
                 // <span style="color:red;">// CORRETTO: Rimosso /api dal percorso</span>
                await api.post('/contsmart/piano-dei-conti', itemData);
            }
            fetchPdcTree();
        } catch (error) {
            console.error("Errore nel salvataggio:", error);
            const errorMsg = error.response?.data?.message || "Errore sconosciuto";
            alert(`Salvataggio fallito: ${errorMsg}`);
        } finally {
            handleCancel();
        }
    };
    
    const handleDelete = async (item) => {
        if (window.confirm(`Sei sicuro di voler eliminare "${item.descrizione}"? Verranno eliminati anche tutti i figli.`)) {
            try {
                 // <span style="color:red;">// CORRETTO: Rimosso /api dal percorso</span>
                await api.delete(`/contsmart/pdc/${item.id}`);
                fetchPdcTree();
            } catch (error) {
                console.error("Errore nell'eliminazione:", error);
                const errorMsg = error.response?.data?.message || "Errore sconosciuto";
                alert(`Eliminazione fallita: ${errorMsg}`);
            }
        }
    };

    const filteredTree = useMemo(() => {
        if (!searchTerm) return pdcTree;
        const lowerCaseSearch = searchTerm.toLowerCase();
        const filterNodes = (nodes) => {
            const result = [];
            for (const node of nodes) {
                const hasChildren = node.children && node.children.length > 0;
                const children = hasChildren ? filterNodes(node.children) : [];
                if (
                    node.descrizione.toLowerCase().includes(lowerCaseSearch) ||
                    node.codice.toLowerCase().includes(lowerCaseSearch) ||
                    children.length > 0
                ) {
                    result.push({ ...node, children });
                }
            }
            return result;
        };
        return filterNodes(pdcTree);
    }, [searchTerm, pdcTree]);
    
    const handleToggleNode = (nodeId) => {
        setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
    };

    const expandAll = () => {
        const allIds = {};
        const collectIds = (nodes) => {
            nodes.forEach(node => {
                if (node.children && node.children.length > 0) {
                    allIds[node.id] = true;
                    collectIds(node.children);
                }
            });
        };
        collectIds(pdcTree);
        setExpandedNodes(allIds);
    };

    const collapseAll = () => setExpandedNodes({});
    const handleExportCSV = async () => {};

    if (isLoading) return <div>Caricamento Piano dei Conti...</div>;

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-bold text-slate-700">Manutenzione Piano dei Conti</h2>
                 <div className="flex items-center gap-2">
                    <div className="relative"><MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute top-1/2 left-2 -translate-y-1/2"/><input type="text" placeholder="Cerca..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 pr-2 py-1.5 border border-slate-300 rounded-md text-sm"/></div>
                    <button onClick={expandAll} className="p-2 text-slate-500 hover:text-slate-800" title="Espandi tutto"><ArrowsPointingOutIcon className="h-5 w-5"/></button>
                    <button onClick={collapseAll} className="p-2 text-slate-500 hover:text-slate-800" title="Comprimi tutto"><ArrowsPointingInIcon className="h-5 w-5"/></button>
                    <button onClick={() => handleAdd(null)} className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"><PlusIcon className="h-5 w-5 mr-1"/> Nuovo Mastro</button>
                    <button onClick={handleExportCSV} className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"><ArrowDownTrayIcon className="h-5 w-5 mr-1"/> Esporta CSV</button>
                    <button onClick={fetchPdcTree} title="Ricarica dati" className="p-2 text-slate-500 hover:text-slate-800"><ArrowPathIcon className="h-5 w-5"/></button>
                 </div>
            </div>
            <div>
                {filteredTree.map(rootNode => (
                    <TreeNode 
                        key={rootNode.id} item={rootNode} level={0}
                        onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete}
                        isExpanded={!!expandedNodes[rootNode.id]}
                        onToggle={handleToggleNode} allExpandedNodes={expandedNodes}
                    />
                ))}
            </div>
            {isModalOpen && (
                <PdcEditModal 
                    item={editingItem} onSave={handleSave} onCancel={handleCancel} pdcTree={pdcTree}
                />
            )}
        </div>
    );
};

export default PianoContiManager;

