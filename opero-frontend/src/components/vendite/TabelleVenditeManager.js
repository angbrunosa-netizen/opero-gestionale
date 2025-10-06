/**
 * @file opero-frontend/src/components/vendite/TabelleVenditeManager.js
 * @description Pannello per la gestione delle anagrafiche di supporto al modulo Vendite.
 * @version 2.2 (Aggiunta icone cartelle all'albero)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PlusIcon, PencilIcon, TrashIcon, ChevronDownIcon, ChevronRightIcon, AlertTriangleIcon, FolderIcon, FolderOpenIcon, FileTextIcon } from 'lucide-react';

// --- Sotto-componente Modale di Conferma ---
const ConfirmationModal = ({ message, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Conferma Eliminazione</h3>
                    <div className="mt-2">
                        <p className="text-sm text-gray-500">{message}</p>
                    </div>
                </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button type="button" onClick={onConfirm} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm">
                    Elimina
                </button>
                <button type="button" onClick={onCancel} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm">
                    Annulla
                </button>
            </div>
        </div>
    </div>
);


// --- Sotto-componente Form Modale Categorie ---
const CategoriaClienteFormModal = ({ item, allCategories, onSave, onCancel }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        setFormData(item || { codice_categoria: '', nome_categoria: '', descrizione: '', id_padre: null });
    }, [item]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const renderCategoryOptions = (categories, depth = 0) => {
        let options = [];
        categories.forEach(category => {
            // Escludi la categoria corrente e i suoi discendenti dalla lista dei padri possibili
            if (item && (category.id === item.id || isDescendant(category, item.id, allCategories))) {
                return;
            }
            options.push(
                <option key={category.id} value={category.id}>
                    {'\u00A0'.repeat(depth * 4)}|-- {category.nome_categoria}
                </option>
            );
            if (category.children && category.children.length > 0) {
                options = options.concat(renderCategoryOptions(category.children, depth + 1));
            }
        });
        return options;
    };
    
    // Funzione helper per verificare se una categoria è discendente di un'altra
    const isDescendant = (category, parentId, all) => {
        if (category.id_padre === parentId) return true;
        if (category.id_padre === null) return false;
        const parent = all.find(c => c.id === category.id_padre);
        if (!parent) return false;
        return isDescendant(parent, parentId, all);
    };
    
    const flatCategories = (categories) => {
        let flat = [];
        categories.forEach(cat => {
            flat.push(cat);
            if(cat.children) {
                flat = flat.concat(flatCategories(cat.children));
            }
        });
        return flat;
    }


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-xl font-semibold mb-4">{item && item.id ? 'Modifica Categoria' : 'Nuova Categoria'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-4">
                        <input type="text" name="codice_categoria" value={formData.codice_categoria || ''} onChange={handleChange} placeholder="Codice" className="input-style" />
                        <input type="text" name="nome_categoria" value={formData.nome_categoria || ''} onChange={handleChange} placeholder="Nome Categoria" className="input-style" required />
                        <textarea name="descrizione" value={formData.descrizione || ''} onChange={handleChange} placeholder="Descrizione" className="input-style"></textarea>
                        <select name="id_padre" value={formData.id_padre || ''} onChange={handleChange} className="input-style">
                            <option value="">Nessuna Categoria Padre</option>
                            {renderCategoryOptions(allCategories)}
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

// --- Componente ricorsivo per la visualizzazione ad albero ---
const CategoriaTreeNode = ({ node, onEdit, onDelete, allCategories }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;

    return (
        <div className="ml-6">
            <div className="flex items-center group my-1">
                {hasChildren ? (
                    <button onClick={() => setIsExpanded(!isExpanded)} className="mr-1 p-1 rounded hover:bg-gray-200">
                        {isExpanded ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
                    </button>
                ) : (
                    <div className="w-8"></div>
                )}

                {hasChildren ? (
                    isExpanded ? <FolderOpenIcon className="h-5 w-5 mr-2 text-yellow-500" /> : <FolderIcon className="h-5 w-5 mr-2 text-yellow-500" />
                ) : (
                    <FileTextIcon className="h-5 w-5 mr-2 text-gray-400" />
                )}

                <span className="flex-grow">{node.nome_categoria} ({node.codice_categoria})</span>
                
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(node)} className="p-1 text-blue-600 hover:text-blue-800">
                        <PencilIcon className="h-4 w-4" />
                    </button>
                    <button onClick={() => onDelete(node)} className="p-1 text-red-600 hover:text-red-800">
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {isExpanded && hasChildren && (
                <div className="border-l-2 border-gray-200">
                    {node.children.map(child => (
                        <CategoriaTreeNode key={child.id} node={child} onEdit={onEdit} onDelete={onDelete} allCategories={allCategories} />
                    ))}
                </div>
            )}
        </div>
    );
};


const TabelleVenditeManager = () => {
    const [activeTab, setActiveTab] = useState('categorieClienti');
    const { hasPermission } = useAuth();

    // Stati per Categorie Clienti
    const [categorie, setCategorie] = useState([]);
    const [loadingCategorie, setLoadingCategorie] = useState(true);
    const [isCategoriaModalOpen, setIsCategoriaModalOpen] = useState(false);
    const [editingCategoria, setEditingCategoria] = useState(null);
    const [categoriaToDelete, setCategoriaToDelete] = useState(null);


    const fetchCategorie = useCallback(async () => {
        try {
            setLoadingCategorie(true);
            const res = await api.get('/vendite/categorie');
            setCategorie(res.data);
        } catch (error) {
            toast.error("Errore nel recupero delle categorie clienti.");
            console.error(error);
        } finally {
            setLoadingCategorie(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'categorieClienti') {
            fetchCategorie();
        }
    }, [activeTab, fetchCategorie]);

    const handleSaveCategoria = async (categoriaData) => {
        try {
            if (categoriaData.id) {
                await api.put(`/vendite/categorie/${categoriaData.id}`, categoriaData);
                toast.success('Categoria aggiornata con successo!');
            } else {
                await api.post('/vendite/categorie', categoriaData);
                toast.success('Categoria creata con successo!');
            }
            fetchCategorie();
        } catch (error) {
            toast.error('Errore durante il salvataggio della categoria.');
            console.error(error);
        } finally {
            setIsCategoriaModalOpen(false);
            setEditingCategoria(null);
        }
    };

    const handleEditCategoria = (categoria) => {
        setEditingCategoria(categoria);
        setIsCategoriaModalOpen(true);
    };

    const handleDeleteCategoria = (categoria) => {
        setCategoriaToDelete(categoria);
    };

    const confirmDeleteCategoria = async () => {
        if (!categoriaToDelete) return;
        try {
            await api.delete(`/vendite/categorie/${categoriaToDelete.id}`);
            toast.success('Categoria eliminata con successo.');
            fetchCategorie();
        } catch (error) {
            toast.error("Errore durante l'eliminazione della categoria.");
            console.error(error);
        } finally {
            setCategoriaToDelete(null);
        }
    };


    const renderContent = () => {
        switch (activeTab) {
            case 'categorieClienti':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-700">Categorie Clienti</h3>
                            {hasPermission('VA_CLIENTI_MANAGE') && (
                                <button onClick={() => { setEditingCategoria(null); setIsCategoriaModalOpen(true); }} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                    <PlusIcon className="h-5 w-5 mr-2" />
                                    Nuova Categoria
                                </button>
                            )}
                        </div>
                        {loadingCategorie ? <p>Caricamento...</p> : (
                             <div className="bg-white p-4 rounded shadow">
                                {categorie.map(node => (
                                    <CategoriaTreeNode key={node.id} node={node} onEdit={handleEditCategoria} onDelete={handleDeleteCategoria} allCategories={categorie} />
                                ))}
                            </div>
                        )}
                    </div>
                );
            // Altri casi per le altre tabelle...
            default:
                return null;
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} />
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Tabelle Vendite</h2>

            <div className="mb-4 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('categorieClienti')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'categorieClienti' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        Categorie Clienti
                    </button>
                    {/* Aggiungere qui altri bottoni per le altre tabelle */}
                </nav>
            </div>

            <div>
                {renderContent()}
            </div>

            {isCategoriaModalOpen && (
                <CategoriaClienteFormModal 
                    item={editingCategoria} 
                    allCategories={categorie} 
                    onSave={handleSaveCategoria} 
                    onCancel={() => { setIsCategoriaModalOpen(false); setEditingCategoria(null); }} 
                />
            )}
            
            {categoriaToDelete && (
                <ConfirmationModal 
                    message={`Sei sicuro di voler eliminare la categoria "${categoriaToDelete.nome_categoria}"? Tutte le sotto-categorie verranno spostate al livello principale.`}
                    onConfirm={confirmDeleteCategoria}
                    onCancel={() => setCategoriaToDelete(null)}
                />
            )}
        </div>
    );
};

export default TabelleVenditeManager;

