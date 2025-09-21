// #####################################################################
// # Componente Gestione Categorie Beni Strumentali v1.0
// # File: opero-frontend/src/components/beni-strumentali/CategorieManager.js
// #####################################################################

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import DynamicReportTable from '../../shared/DynamicReportTable';
import CategorieForm from './CategorieForm';
import { PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const columns = [
    { label: 'Codice', key: 'codice', sortable: true },
    { label: 'Descrizione', key: 'descrizione', sortable: true },
];

const CategorieManager = () => {
    const [categorie, setCategorie] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategoria, setSelectedCategoria] = useState(null);
    const auth = useAuth();

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await api.get('/beni-strumentali/categorie');
            const dataArray = response.data && response.data.success ? response.data.data : [];
            setCategorie(dataArray);
        } catch (err) {
            setError('Impossibile caricare le categorie.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAdd = useCallback(() => {
        setSelectedCategoria(null);
        setIsModalOpen(true);
    }, []);

    const handleEdit = useCallback((categoria) => {
        setSelectedCategoria(categoria);
        setIsModalOpen(true);
    }, []);
    
    const handleDelete = useCallback(async (categoria) => {
        if (window.confirm(`Sei sicuro di voler eliminare la categoria "${categoria.descrizione}"?`)) {
            try {
                await api.delete(`/beni-strumentali/categorie/${categoria.id}`);
                fetchData();
            } catch (err) {
                const errorMsg = err.response?.data?.error || 'Errore durante l\'eliminazione.';
                setError(errorMsg);
                console.error(err);
            }
        }
    }, [fetchData]);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedCategoria(null);
    }, []);

    const handleSave = useCallback(() => {
        handleCloseModal();
        fetchData();
    }, [handleCloseModal, fetchData]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Gestione Categorie Beni Strumentali</h1>
                <div className="flex items-center space-x-2">
                    <button onClick={fetchData} className="p-2 rounded-md hover:bg-slate-200" title="Aggiorna dati">
                        <ArrowPathIcon className={`h-5 w-5 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={handleAdd} className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700">
                        <PlusIcon className="h-5 w-5" />
                        <span>Nuova Categoria</span>
                    </button>
                </div>
            </div>

            {error && <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">{error}</div>}

            <DynamicReportTable
                columns={columns}
                data={categorie}
                isLoading={isLoading}
                defaultSort={{ key: 'codice', direction: 'asc' }}
                isSelectable={false}
                title="Elenco Categorie"
                onSelectionChange={() => {}}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {isModalOpen && (
                <CategorieForm
                    categoriaToEdit={selectedCategoria}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default CategorieManager;

