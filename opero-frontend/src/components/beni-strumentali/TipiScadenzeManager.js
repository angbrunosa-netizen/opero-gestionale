// #####################################################################
// # Componente Gestione Tipi Scadenze v1.0
// # File: opero-frontend/src/components/beni-strumentali/TipiScadenzeManager.js
// #####################################################################

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import DynamicReportTable from '../../shared/DynamicReportTable';
import TipiScadenzeForm from './TipiScadenzeForm'; 
import { PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const columns = [
    { label: 'Codice', key: 'codice', sortable: true },
    { label: 'Descrizione', key: 'descrizione', sortable: true },
];

const TipiScadenzeManager = () => {
    const [tipi, setTipi] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTipo, setSelectedTipo] = useState(null);
    const auth = useAuth();

    const fetchTipi = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await api.get('/beni-strumentali/tipi-scadenze');
            const dataArray = response.data && response.data.success ? response.data.data : [];
            setTipi(dataArray);
        } catch (err) {
            setError('Impossibile caricare l\'elenco dei tipi di scadenza.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTipi();
    }, [fetchTipi]);

    const handleAdd = useCallback(() => {
        setSelectedTipo(null);
        setIsModalOpen(true);
    }, []);

    const handleEdit = useCallback((tipo) => {
        setSelectedTipo(tipo);
        setIsModalOpen(true);
    }, []);

    const handleDelete = useCallback(async (tipo) => {
        if (window.confirm(`Sei sicuro di voler eliminare il tipo "${tipo.descrizione}"?`)) {
            try {
                await api.delete(`/beni-strumentali/tipi-scadenze/${tipo.id}`);
                fetchTipi();
            } catch (err) {
                setError(err.response?.data?.error || 'Errore durante l\'eliminazione.');
            }
        }
    }, [fetchTipi]);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedTipo(null);
    }, []);

    const handleSave = useCallback(() => {
        handleCloseModal();
        fetchTipi();
    }, [handleCloseModal, fetchTipi]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Anagrafica Tipi Scadenze</h1>
                 <div className="flex items-center space-x-2">
                    <button onClick={fetchTipi} className="p-2 rounded-md hover:bg-slate-200" title="Aggiorna dati">
                        <ArrowPathIcon className={`h-5 w-5 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={handleAdd} className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700">
                        <PlusIcon className="h-5 w-5" />
                        <span>Aggiungi Tipo</span>
                    </button>
                </div>
            </div>

            {error && <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">{error}</div>}

            <DynamicReportTable
                columns={columns}
                data={tipi}
                isLoading={isLoading}
                defaultSort={{ key: 'descrizione', direction: 'asc' }}
                isSelectable={false}
                title="Tipi Scadenze Definiti"
                onSelectionChange={() => {}}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {isModalOpen && (
                <TipiScadenzeForm
                    tipoToEdit={selectedTipo}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default TipiScadenzeManager;

