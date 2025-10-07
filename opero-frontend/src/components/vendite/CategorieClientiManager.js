/**
 * @file opero-frontend/src/components/vendite/CategorieClientiManager.js
 * @description Componente dedicato alla gestione dell'anagrafica gerarchica delle categorie clienti.
 * @version 1.0
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { FolderIcon, FolderOpenIcon, ChevronRightIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import ConfirmationModal from '../../shared/ConfirmationModal';

// --- Componente per il Form Modale di Creazione/Modifica Categoria ---
const CategorieClientiFormModal = ({ item, onSave, onCancel, categorieList }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        setFormData(item || { nome_categoria: '', descrizione: '', codice_categoria: '', id_padre: null });
    }, [item]);

    const handleChange = e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSubmit = e => { e.preventDefault(); onSave(formData); };

    const flattenCategories = (categories, level = 0) => {
        let flatList = [];
        categories.forEach(cat => {
            if (!item || item.id !== cat.id) {
                flatList.push({ ...cat, level });
                if (cat.children) {
                    flatList = flatList.concat(flattenCategories(cat.children, level + 1));
                }
            }
        });
        return flatList;
    };

    const flatCategorieList = useMemo(() => flattenCategories(categorieList), [categorieList, item]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-xl font-semibold mb-4">{item && item.id ? 'Modifica Categoria' : 'Nuova Categoria'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-4">
                        <input type="text" name="codice_categoria" value={formData.codice_categoria || ''} onChange={handleChange} placeholder="Codice Categoria" className="input-style" />
                        <input type="text" name="nome_categoria" value={formData.nome_categoria || ''} onChange={handleChange} placeholder="Nome Categoria" className="input-style" required />
                        <textarea name="descrizione" value={formData.descrizione || ''} onChange={handleChange} placeholder="Descrizione" className="input-style"></textarea>
                        <select name="id_padre" value={formData.id_padre || ''} onChange={handleChange} className="input-style">
                            <option value="">Nessuna Categoria Padre</option>
                            {flatCategorieList.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {'\u00A0'.repeat(cat.level * 4)}└ {cat.nome_categoria}
                                </option>
                            ))}
                        </select>
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


// --- Componente ricorsivo per renderizzare i nodi dell'albero ---
const CategoriaTreeNode = ({ node, level = 0, onEdit, onDelete, onAddChild }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasChildren = node.children && node.children.length > 0;

    return (
        <div style={{ marginLeft: `${level * 24}px` }}>
            <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md group">
                <div className="flex items-center cursor-pointer" onClick={() => hasChildren && setIsExpanded(!isExpanded)}>
                    {hasChildren ? (
                        <ChevronRightIcon className={`h-5 w-5 text-gray-500 mr-1 transition-transform transform ${isExpanded ? 'rotate-90' : ''}`} />
                    ) : (
                        <div className="w-5 mr-1"></div>
                    )}
                    {isExpanded ? 
                        <FolderOpenIcon className="h-5 w-5 mr-2 text-blue-500" /> : 
                        <FolderIcon className="h-5 w-5 mr-2 text-blue-500" />
                    }
                    <span className="font-medium text-gray-800">{node.nome_categoria}</span>
                </div>
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onAddChild(node.id)} title="Aggiungi Sottocategoria" className="p-1 text-gray-400 hover:text-blue-600"><PlusIcon className="h-5 w-5"/></button>
                    <button onClick={() => onEdit(node)} title="Modifica" className="p-1 text-gray-400 hover:text-green-600"><PencilIcon className="h-5 w-5"/></button>
                    <button onClick={() => onDelete(node)} title="Elimina" className="p-1 text-gray-400 hover:text-red-600"><TrashIcon className="h-5 w-5"/></button>
                </div>
            </div>
            {isExpanded && hasChildren && (
                <div>
                    {node.children.map(child => (
                        <CategoriaTreeNode key={child.id} node={child} level={level + 1} onEdit={onEdit} onDelete={onDelete} onAddChild={onAddChild} />
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Componente Manager per le Categorie Clienti ---
const CategorieClientiManager = () => {
    const [categorie, setCategorie] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingCategoria, setEditingCategoria] = useState(null);
    const [categoriaToDelete, setCategoriaToDelete] = useState(null);
    const { hasPermission } = useAuth();

    const fetchCategorie = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/vendite/categorie');
            setCategorie(res.data);
        } catch (error) { toast.error("Errore nel recupero delle categorie clienti."); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchCategorie(); }, [fetchCategorie]);

    const handleSave = async (formData) => {
        try {
            if (formData.id) {
                await api.put(`/vendite/categorie/${formData.id}`, formData);
                toast.success('Categoria aggiornata con successo!');
            } else {
                await api.post('/vendite/categorie', formData);
                toast.success('Categoria creata con successo!');
            }
            fetchCategorie();
        } catch (error) { toast.error("Errore durante il salvataggio della categoria."); }
        finally { setIsFormModalOpen(false); setEditingCategoria(null); }
    };

    const confirmDelete = async () => {
        if (!categoriaToDelete) return;
        try {
            await api.delete(`/vendite/categorie/${categoriaToDelete.id}`);
            toast.success('Categoria eliminata con successo.');
            fetchCategorie();
        } catch (error) { toast.error("Errore durante l'eliminazione della categoria."); }
        finally { setCategoriaToDelete(null); }
    };

    const handleEdit = (categoria) => { setEditingCategoria(categoria); setIsFormModalOpen(true); };
    const handleAddChild = (parentId) => { setEditingCategoria({ id_padre: parentId }); setIsFormModalOpen(true); };

    return (
        <div>
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Struttura Categorie Clienti</h3>
                {hasPermission('VA_CLIENTI_MANAGE') && (
                    <button onClick={() => { setEditingCategoria(null); setIsFormModalOpen(true); }} className="btn-primary">
                        <PlusIcon className="h-5 w-5 mr-2" /> Nuova Categoria Radice
                    </button>
                )}
            </div>
            {loading ? <p>Caricamento...</p> : (
                <div className="bg-white p-4 rounded-lg border">
                    {categorie.map(node => (
                        <CategoriaTreeNode key={node.id} node={node} onEdit={handleEdit} onDelete={setCategoriaToDelete} onAddChild={handleAddChild}/>
                    ))}
                </div>
            )}
            {isFormModalOpen && (
                <CategorieClientiFormModal
                    item={editingCategoria}
                    onSave={handleSave}
                    onCancel={() => { setIsFormModalOpen(false); setEditingCategoria(null); }}
                    categorieList={categorie}
                />
            )}
            {categoriaToDelete && (
                <ConfirmationModal
                    message={`Sei sicuro di voler eliminare la categoria "${categoriaToDelete.nome_categoria}"? Eventuali sottocategorie verranno spostate al livello principale.`}
                    onConfirm={confirmDelete}
                    onCancel={() => setCategoriaToDelete(null)}
                />
            )}
        </div>
    );
};

export default CategorieClientiManager;
