// #####################################################################
// # Componente per la Gestione del Piano dei Conti v3.0 (Responsive)
// # File: opero-gestionale/opero-frontend/src/components/cont-smart/PianoContiManager.js
// #####################################################################

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { 
    FolderIcon, DocumentTextIcon, ChevronRightIcon, PlusIcon, ArrowPathIcon, 
    PencilIcon, TrashIcon, MagnifyingGlassIcon, ArrowDownTrayIcon,
    ArrowsPointingOutIcon, ArrowsPointingInIcon, ChevronDownIcon
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
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

// --- Componente per il Singolo Nodo dell'Albero (Desktop) ---
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

// --- Componente Card per Visualizzazione Mobile ---
const PdcCard = ({ item, onAdd, onEdit, onDelete, onToggle, isExpanded, level = 0 }) => {
    const Icon = item.tipo === 'Mastro' ? FolderIcon : DocumentTextIcon;
    const hasChildren = item.children && item.children.length > 0;
    const [showChildren, setShowChildren] = useState(isExpanded);

    const handleToggle = () => {
        setShowChildren(!showChildren);
        onToggle(item.id);
    };

    return (
        <div className={`bg-white border border-slate-200 rounded-lg shadow-sm mb-3 ${level > 0 ? 'ml-4' : ''}`}>
            <div className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center">
                        {hasChildren && (
                            <button 
                                onClick={handleToggle}
                                className="mr-2 p-1 rounded-full hover:bg-slate-100"
                            >
                                <ChevronDownIcon 
                                    className={`h-5 w-5 text-slate-500 transition-transform ${showChildren ? 'rotate-180' : ''}`} 
                                />
                            </button>
                        )}
                        <Icon className={`h-6 w-6 mr-3 ${item.tipo === 'Mastro' ? 'text-sky-600' : 'text-slate-500'}`} />
                        <div>
                            <h3 className="text-lg font-medium text-slate-900">{item.descrizione}</h3>
                            <div className="flex items-center mt-1">
                                <span className="text-sm text-slate-500 mr-2">Codice:</span>
                                <span className="font-mono text-sm text-slate-600">{item.codice}</span>
                            </div>
                            <div className="flex items-center mt-1">
                                <span className="text-sm text-slate-500 mr-2">Tipo:</span>
                                <span className="text-sm text-slate-600">{item.tipo}</span>
                                {item.natura && (
                                    <>
                                        <span className="text-sm text-slate-500 mx-2">|</span>
                                        <span className="text-sm text-slate-600">{item.natura}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        {item.tipo !== 'Sottoconto' && (
                            <button 
                                onClick={() => onAdd(item)} 
                                className="p-2 text-green-600 bg-green-50 rounded-full hover:bg-green-100" 
                                title="Aggiungi figlio"
                            >
                                <PlusIcon className="h-4 w-4" />
                            </button>
                        )}
                        <button 
                            onClick={() => onEdit(item)} 
                            className="p-2 text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100" 
                            title="Modifica"
                        >
                            <PencilIcon className="h-4 w-4" />
                        </button>
                        <button 
                            onClick={() => onDelete(item)} 
                            className="p-2 text-red-600 bg-red-50 rounded-full hover:bg-red-100" 
                            title="Elimina"
                        >
                            <TrashIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
            {hasChildren && showChildren && (
                <div className="px-4 pb-4">
                    {item.children.map(child => (
                        <PdcCard 
                            key={child.id} 
                            item={child} 
                            level={level + 1}
                            onAdd={onAdd} 
                            onEdit={onEdit} 
                            onDelete={onDelete}
                            onToggle={onToggle}
                            isExpanded={false}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Componente Principale ---
const PianoContiManager = () => {
    const auth = useAuth();
    const [pdcTree, setPdcTree] = useState([]);
    const [filteredPdcTree, setFilteredPdcTree] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedNodes, setExpandedNodes] = useState({});
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Hook per rilevare la larghezza dello schermo
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchPdcTree = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/contsmart/pdc-tree');
            if (response.data.success) {
                // Assicurati che tutti gli elementi abbiano i campi necessari
                const processedData = response.data.data.map(item => ({
                    ...item,
                    codice: item.codice || '',
                    descrizione: item.descrizione || '',
                    tipo: item.tipo || 'Sottoconto',
                    natura: item.natura || 'Costo',
                    children: item.children || []
                }));
                setPdcTree(processedData);
                setFilteredPdcTree(processedData);
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

    // Effetto per filtrare gli elementi in base al termine di ricerca
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredPdcTree(pdcTree);
        } else {
            const filterNodes = (nodes) => {
                const result = [];
                for (const node of nodes) {
                    const hasChildren = node.children && node.children.length > 0;
                    const children = hasChildren ? filterNodes(node.children) : [];
                    
                    // Verifica che i campi esistano prima di chiamare toLowerCase()
                    const descrizione = node.descrizione || '';
                    const codice = node.codice || '';
                    
                    if (
                        descrizione.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        codice.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        children.length > 0
                    ) {
                        result.push({ ...node, children });
                    }
                }
                return result;
            };
            setFilteredPdcTree(filterNodes(pdcTree));
        }
    }, [searchTerm, pdcTree]);

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
                await api.patch(`/contsmart/pdc/${itemData.id}`, itemData);
            } else { // Creazione
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
                await api.delete(`/contsmart/pdc/${item.id}`);
                fetchPdcTree();
            } catch (error) {
                console.error("Errore nell'eliminazione:", error);
                const errorMsg = error.response?.data?.message || "Errore sconosciuto";
                alert(`Eliminazione fallita: ${errorMsg}`);
            }
        }
    };

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

    // Funzione per resettare la ricerca
    const handleClearSearch = () => {
        setSearchTerm('');
    };

    if (isLoading) return (
        <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Caricamento Piano dei Conti...</span>
        </div>
    );

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                 <h2 className="text-xl font-bold text-slate-700">Manutenzione Piano dei Conti</h2>
                 <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-grow sm:flex-grow-0">
                        <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute top-1/2 left-2 -translate-y-1/2"/>
                        <input 
                            type="text" 
                            placeholder="Cerca..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            className="pl-8 pr-8 py-1.5 border border-slate-300 rounded-md text-sm w-full sm:w-auto"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-2 flex items-center"
                                onClick={handleClearSearch}
                            >
                                <svg className="h-5 w-5 text-gray-400 hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </button>
                        )}
                    </div>
                    {!isMobile && (
                        <>
                            <button onClick={expandAll} className="p-2 text-slate-500 hover:text-slate-800" title="Espandi tutto"><ArrowsPointingOutIcon className="h-5 w-5"/></button>
                            <button onClick={collapseAll} className="p-2 text-slate-500 hover:text-slate-800" title="Comprimi tutto"><ArrowsPointingInIcon className="h-5 w-5"/></button>
                        </>
                    )}
                    <button onClick={() => handleAdd(null)} className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"><PlusIcon className="h-5 w-5 mr-1"/> Nuovo Mastro</button>
                    <button onClick={handleExportCSV} className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"><ArrowDownTrayIcon className="h-5 w-5 mr-1"/> Esporta CSV</button>
                    <button onClick={fetchPdcTree} title="Ricarica dati" className="p-2 text-slate-500 hover:text-slate-800"><ArrowPathIcon className="h-5 w-5"/></button>
                 </div>
            </div>
            
            {searchTerm && (
                <div className="mb-4 text-sm text-gray-600">
                    Trovati {filteredPdcTree.length} elementi per "{searchTerm}"
                </div>
            )}
            
            {/* VISUALIZZAZIONE DESKTOP: ALBERO */}
            {!isMobile && (
                <div>
                    {filteredPdcTree.length > 0 ? (
                        filteredPdcTree.map(rootNode => (
                            <TreeNode 
                                key={rootNode.id} item={rootNode} level={0}
                                onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete}
                                isExpanded={!!expandedNodes[rootNode.id]}
                                onToggle={handleToggleNode} allExpandedNodes={expandedNodes}
                            />
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-slate-900">
                                {searchTerm ? `Nessun elemento trovato per "${searchTerm}"` : 'Nessun elemento nel Piano dei Conti'}
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                                {searchTerm ? 'Prova a modificare i criteri di ricerca' : 'Inizia aggiungendo un nuovo mastro al Piano dei Conti.'}
                            </p>
                            {!searchTerm && (
                                <div className="mt-6">
                                    <button
                                        onClick={() => handleAdd(null)}
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <PlusIcon className="h-5 w-5 mr-2" />
                                        Nuovo Mastro
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
            
            {/* VISUALIZZAZIONE MOBILE: CARD */}
            {isMobile && (
                <div className="space-y-2">
                    {filteredPdcTree.length > 0 ? (
                        filteredPdcTree.map(rootNode => (
                            <PdcCard 
                                key={rootNode.id} 
                                item={rootNode} 
                                onAdd={handleAdd} 
                                onEdit={handleEdit} 
                                onDelete={handleDelete}
                                onToggle={handleToggleNode}
                                isExpanded={!!expandedNodes[rootNode.id]}
                            />
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-slate-900">
                                {searchTerm ? `Nessun elemento trovato per "${searchTerm}"` : 'Nessun elemento nel Piano dei Conti'}
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                                {searchTerm ? 'Prova a modificare i criteri di ricerca' : 'Inizia aggiungendo un nuovo mastro al Piano dei Conti.'}
                            </p>
                            {!searchTerm && (
                                <div className="mt-6">
                                    <button
                                        onClick={() => handleAdd(null)}
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <PlusIcon className="h-5 w-5 mr-2" />
                                        Nuovo Mastro
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
            
            {isModalOpen && (
                <PdcEditModal 
                    item={editingItem} onSave={handleSave} onCancel={handleCancel} pdcTree={pdcTree}
                />
            )}
        </div>
    );
};

export default PianoContiManager;