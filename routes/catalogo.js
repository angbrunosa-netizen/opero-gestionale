/**
 * @file opero-frontend/src/components/catalogo/CategorieManager.js
 * @description componente react per la gestione gerarchica delle categorie del catalogo.
 * - v2.7: aggiunto il campo 'codice_categoria' all'export csv.
 * @date 2025-09-29
 * @version 2.7 (export csv completo)
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

// --- LIBRERIE INTERNE PER ESPORTAZIONE E STAMPA ---
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useReactToPrint } from 'react-to-print';

// --- ICONE ---
import { 
    FolderIcon, FolderOpenIcon, ChevronRightIcon, PlusIcon, ArrowPathIcon, 
    PencilIcon, TrashIcon, MagnifyingGlassIcon, ArrowDownTrayIcon, PrinterIcon,
    ArrowsPointingOutIcon, ArrowsPointingInIcon
} from '@heroicons/react/24/solid';


// --- Componente Modale per Creazione/Modifica (invariato) ---
const CategoriaFormModal = ({ item, onSave, onCancel, allCategories }) => {
    const [formData, setFormData] = useState({ nome_categoria: '', descrizione: '', id_padre: null });

    useEffect(() => {
        if (item && item.id) {
            setFormData({
                nome_categoria: item.nome_categoria || '',
                descrizione: item.descrizione || '',
                id_padre: item.id_padre || null,
            });
        } else if (item && item.id_padre) { // Caso "Aggiungi Sottocategoria"
            setFormData({ nome_categoria: '', descrizione: '', id_padre: item.id_padre });
        } else { // Caso "Nuova Categoria Principale"
             setFormData({ nome_categoria: '', descrizione: '', id_padre: null });
        }
    }, [item]);

    // Funzione per trovare un nodo e tutti i suoi figli (per escluderli dal dropdown)
    const getDescendantIds = useMemo(() => {
        const collectedIds = new Set();
        const findAndCollect = (nodes, targetId) => {
            for (const node of nodes) {
                if (node.id === targetId) {
                    collectAllChildren(node, collectedIds);
                    return true;
                }
                if (node.children && findAndCollect(node.children, targetId)) {
                    return true;
                }
            }
            return false;
        };
        const collectAllChildren = (node, ids) => {
            ids.add(node.id);
            if (node.children) {
                node.children.forEach(child => collectAllChildren(child, ids));
            }
        };
        
        if (item && item.id) {
            findAndCollect(allCategories, item.id);
        }
        return collectedIds;
    }, [item, allCategories]);

    const renderCategoryOptions = (nodes, depth = 0) => {
        let options = [];
        nodes.forEach(node => {
            if (getDescendantIds.has(node.id)) {
                 return;
            }
            options.push(
                <option key={node.id} value={node.id}>
                    {'\u00A0'.repeat(depth * 4)}
                    {node.codice_categoria} - {node.nome_categoria}
                </option>
            );
            if (node.children && node.children.length > 0) {
                options = options.concat(renderCategoryOptions(node.children, depth + 1));
            }
        });
        return options;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value === '' ? null : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData, item ? item.id : null);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-xl font-bold mb-4">{item && item.id ? 'Modifica Categoria' : 'Nuova Categoria'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="nome_categoria" className="block text-sm font-medium text-gray-700">Nome Categoria</label>
                        <input type="text" name="nome_categoria" id="nome_categoria" value={formData.nome_categoria} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="descrizione" className="block text-sm font-medium text-gray-700">Descrizione</label>
                        <textarea name="descrizione" id="descrizione" value={formData.descrizione} onChange={handleChange} rows="3" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"></textarea>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="id_padre" className="block text-sm font-medium text-gray-700">Categoria Genitore</label>
                        <select name="id_padre" id="id_padre" value={formData.id_padre || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                            <option value="">-- Nessuna (Categoria Principale) --</option>
                            {renderCategoryOptions(allCategories)}
                        </select>
                    </div>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Annulla</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Salva</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Componente Ricorsivo per renderizzare l'albero ---
const TreeNode = ({ node, level, onAdd, onEdit, onDelete, onToggle, allExpandedNodes }) => {
    const { hasPermission } = useAuth();
    const isNodeExpanded = allExpandedNodes[node.id];

    return (
        <div className="border-l border-gray-200" style={{ marginLeft: `${level === 0 ? 0 : 20}px` }}>
            <div className="flex items-center justify-between py-2 px-3 hover:bg-gray-100 rounded-md group">
                <div className="flex items-center cursor-pointer flex-grow" onClick={() => onToggle(node.id)}>
                    <ChevronRightIcon 
                        className={`h-5 w-5 text-gray-500 mr-2 transform transition-transform ${isNodeExpanded ? 'rotate-90' : 'rotate-0'} ${!node.children || node.children.length === 0 ? 'opacity-0' : ''}`} 
                    />
                    {isNodeExpanded ? <FolderOpenIcon className="h-6 w-6 text-yellow-500 mr-2"/> : <FolderIcon className="h-6 w-6 text-yellow-500 mr-2"/>}
                    <span className="font-mono text-sm text-gray-600 mr-2">{node.codice_categoria}</span>
                    <span className="font-medium">{node.nome_categoria}</span>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {hasPermission('CT_MANAGE') && (
                        <>
                            <button onClick={(e) => {e.stopPropagation(); onAdd(node.id);}} title="Aggiungi Sottocategoria" className="p-1 text-gray-500 hover:text-green-600"><PlusIcon className="h-5 w-5"/></button>
                            <button onClick={(e) => {e.stopPropagation(); onEdit(node);}} title="Modifica Categoria" className="p-1 text-gray-500 hover:text-blue-600"><PencilIcon className="h-5 w-5"/></button>
                            <button onClick={(e) => {e.stopPropagation(); onDelete(node);}} title="Elimina Categoria" className="p-1 text-gray-500 hover:text-red-600"><TrashIcon className="h-5 w-5"/></button>
                        </>
                    )}
                </div>
            </div>
            {isNodeExpanded && node.children && node.children.map(child => (
                <TreeNode key={child.id} node={child} level={level + 1} onAdd={onAdd} onEdit={onEdit} onDelete={onDelete} onToggle={onToggle} allExpandedNodes={allExpandedNodes}/>
            ))}
        </div>
    );
};


// --- Componente Principale ---
const CategorieManager = () => {
    const { hasPermission, user, ditta } = useAuth();
    const [categorieTree, setCategorieTree] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [expandedNodes, setExpandedNodes] = useState({});
    
    const printRef = useRef();

    const fetchCategorieTree = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/catalogo/categorie');
            setCategorieTree(response.data);
            setError(null);
        } catch (err) {
            setError('Errore nel caricamento delle categorie.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategorieTree();
    }, [fetchCategorieTree]);
    
    const getAllIds = useCallback((nodes) => {
        let ids = {};
        nodes.forEach(node => {
            if (node.children && node.children.length > 0) {
                ids[node.id] = true;
                Object.assign(ids, getAllIds(node.children));
            }
        });
        return ids;
    }, []);

    const handleExpandAll = () => setExpandedNodes(getAllIds(categorieTree));
    const handleCollapseAll = () => setExpandedNodes({});
    const handleToggleNode = (nodeId) => {
        setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
    };

    const handleAdd = (parentId = null) => {
        setEditingItem({ id_padre: parentId }); 
        setIsModalOpen(true);
    };
    
    const handleEdit = (item) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (item) => {
        if (window.confirm(`Sei sicuro di voler eliminare la categoria "${item.nome_categoria}"?`)) {
            try {
                await api.delete(`/catalogo/categorie/${item.id}`);
                fetchCategorieTree();
            } catch (err) {
                alert('Errore durante l\'eliminazione: ' + (err.response?.data?.message || err.message));
            }
        }
    };

    const handleSave = async (data, itemId) => {
        const itemToSave = { ...data };
        try {
            if (itemId) {
                await api.patch(`/catalogo/categorie/${itemId}`, itemToSave);
            } else {
                await api.post('/catalogo/categorie', itemToSave);
            }
            fetchCategorieTree();
            setIsModalOpen(false);
            setEditingItem(null);
        } catch (err) {
            alert('Errore durante il salvataggio: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const filteredTree = useMemo(() => {
        if (!searchTerm) return categorieTree;
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const filterNodes = (nodes) => {
            return nodes.reduce((acc, node) => {
                const children = filterNodes(node.children || []);
                const match = node.nome_categoria.toLowerCase().includes(lowerCaseSearchTerm) || 
                              (node.codice_categoria && node.codice_categoria.toLowerCase().includes(lowerCaseSearchTerm));
                if (match || children.length > 0) {
                    acc.push({ ...node, children });
                }
                return acc;
            }, []);
        };
        const results = filterNodes(categorieTree);
        if(results.length > 0 && searchTerm) {
            setTimeout(() => setExpandedNodes(getAllIds(results)), 0);
        }
        return results;
    }, [searchTerm, categorieTree, getAllIds]);

    const flattenTreeForExport = useCallback((nodes) => {
        let flatList = [];
        nodes.forEach(node => {
            flatList.push({ 
                codice: node.codice_categoria || '',
                nome: node.nome_categoria, 
                descrizione: node.descrizione || '' 
            });
            if (node.children && node.children.length > 0) {
                flatList = flatList.concat(flattenTreeForExport(node.children));
            }
        });
        return flatList;
    }, []);

    const handleExportCSV = () => {
        const flatData = flattenTreeForExport(categorieTree);
        const header = "Codice;Nome Categoria;Descrizione\n";
        const csvContent = flatData.map(row => `"${row.codice}";"${row.nome}";"${row.descrizione}"`).join("\n");
        const blob = new Blob([`\uFEFF${header}${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "categorie_catalogo.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const handleExportPDF = () => {
        const doc = new jsPDF();
        const flatData = flattenTreeForExport(categorieTree);

        const pageContent = (data) => {
            doc.setFontSize(14);
            doc.setTextColor(40);
            doc.setFont('helvetica', 'bold');
            doc.text(ditta?.ragione_sociale || 'Opero Gestionale', data.settings.margin.left, 22);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            const userInfo = `Stampato da: ${user?.nome || ''} ${user?.cognome || ''}`;
            const dateInfo = `Data: ${new Date().toLocaleDateString('it-IT')}`;
            doc.text(userInfo, data.settings.margin.left, 28);
            const dateWidth = doc.getStringUnitWidth(dateInfo) * doc.getFontSize() / doc.internal.scaleFactor;
            doc.text(dateInfo, doc.internal.pageSize.getWidth() - data.settings.margin.right - dateWidth, 28);
            const str = "Documento generato da Opero il gestionale full prompt www.operogo.it";
            doc.setFontSize(8);
            const pageWidth = doc.internal.pageSize.getWidth();
            doc.text(str, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
        };

        autoTable(doc, {
            startY: 35,
            head: [['Codice', 'Nome Categoria', 'Descrizione']],
            body: flatData.map(row => [row.codice, row.nome, row.descrizione]),
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185] },
            didDrawPage: pageContent,
        });

        doc.save('categorie_catalogo.pdf');
    };

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
        documentTitle: 'Struttura Categorie Catalogo',
    });

    if (loading) return <div>Caricamento in corso...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4 no-print">
                <h1 className="text-xl font-bold">Gestione Categorie Catalogo</h1>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input type="text" placeholder="Cerca..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border rounded-md"/>
                    </div>
                    <button onClick={handleExpandAll} className="p-2 text-gray-500 hover:text-gray-800" title="Espandi tutto"><ArrowsPointingOutIcon className="h-5 w-5"/></button>
                    <button onClick={handleCollapseAll} className="p-2 text-gray-500 hover:text-gray-800" title="Comprimi tutto"><ArrowsPointingInIcon className="h-5 w-5"/></button>
                    <button onClick={handleExportCSV} className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"><ArrowDownTrayIcon className="h-5 w-5 mr-1"/> CSV</button>
                    <button onClick={handleExportPDF} className="flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"><ArrowDownTrayIcon className="h-5 w-5 mr-1"/> PDF</button>
                    <button onClick={handlePrint} className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"><PrinterIcon className="h-5 w-5 mr-1"/> Stampa</button>
                    {hasPermission('CT_MANAGE') && (
                        <button onClick={() => handleAdd(null)} className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"><PlusIcon className="h-5 w-5 mr-1"/> Nuova</button>
                    )}
                    <button onClick={fetchCategorieTree} title="Ricarica dati" className="p-2 text-gray-500 hover:text-gray-800"><ArrowPathIcon className="h-5 w-5"/></button>
                 </div>
            </div>
            
            <div ref={printRef} className="bg-white p-4 rounded-lg shadow print-container">
                 <h1 className="print-only-title" style={{display: 'none'}}>Categorie del Catalogo</h1>
                 <style type="text/css" media="print">
                  {`
                    @page { size: auto; margin: 20mm; }
                    body { -webkit-print-color-adjust: exact; }
                    .no-print { display: none !important; }
                    .print-only-title { display: block !important; text-align: center; font-size: 1.5rem; margin-bottom: 1rem; }
                    .print-container { box-shadow: none !important; border: none !important; }
                  `}
                </style>
                {filteredTree.length > 0 ? (
                    filteredTree.map(rootNode => (
                        <TreeNode 
                            key={rootNode.id} 
                            node={rootNode} 
                            level={0} 
                            onAdd={handleAdd} 
                            onEdit={handleEdit} 
                            onDelete={handleDelete}
                            onToggle={handleToggleNode}
                            allExpandedNodes={expandedNodes}
                         />
                    ))
                ) : (
                    <div className="text-center text-gray-500 py-8">Nessuna categoria trovata.</div>
                )}
            </div>

            {isModalOpen && (
                <CategoriaFormModal 
                    item={editingItem} 
                    onSave={handleSave} 
                    onCancel={handleCancel}
                    allCategories={categorieTree} 
                />
            )}
        </div>
    );
};

export default CategorieManager;

