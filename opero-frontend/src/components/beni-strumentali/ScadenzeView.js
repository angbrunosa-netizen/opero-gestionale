// #####################################################################
// # Componente Vista Scadenze Beni v1.0
// # File: opero-frontend/src/components/beni-strumentali/ScadenzeView.js
// #####################################################################

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import DynamicReportTable from '../../shared/DynamicReportTable';
import ScadenzaForm from './ScadenzaForm'; 
import { PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const columns = [
    { label: 'Bene Strumentale', key: 'bene_descrizione', sortable: true },
    { label: 'Tipo Scadenza', key: 'tipo_scadenza_descrizione', sortable: true },
    { label: 'Data Scadenza', key: 'data_scadenza', sortable: true, format: 'date' },
    { label: 'Importo Previsto', key: 'importo_previsto', sortable: true, format: 'currency' },
    { label: 'Stato', key: 'stato', sortable: true },
];

const ScadenzeView = () => {
    const [scadenze, setScadenze] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedScadenza, setSelectedScadenza] = useState(null);
    const auth = useAuth();

    const fetchScadenze = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await api.get('/beni-strumentali/scadenze/prossime');
            setScadenze(response.data.data || []);
        } catch (err) {
            setError('Impossibile caricare l\'elenco delle scadenze.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchScadenze();
    }, [fetchScadenze]);

    const handleAdd = useCallback(() => {
        setSelectedScadenza(null);
        setIsModalOpen(true);
    }, []);

    const handleEdit = useCallback((scadenza) => {
        setSelectedScadenza(scadenza);
        setIsModalOpen(true);
    }, []);

    const handleDelete = useCallback(async (scadenza) => {
        if (window.confirm(`Sei sicuro di voler eliminare questa scadenza?`)) {
            try {
                await api.delete(`/beni-strumentali/scadenze/${scadenza.id}`);
                fetchScadenze();
            } catch (err) {
                setError(err.response?.data?.error || 'Errore durante l\'eliminazione.');
            }
        }
    }, [fetchScadenze]);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedScadenza(null);
    }, []);

    const handleSave = useCallback(() => {
        handleCloseModal();
        fetchScadenze();
    }, [handleCloseModal, fetchScadenze]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Scadenze Beni Strumentali</h1>
                 <div className="flex items-center space-x-2">
                    <button onClick={fetchScadenze} className="p-2 rounded-md hover:bg-slate-200" title="Aggiorna dati">
                        <ArrowPathIcon className={`h-5 w-5 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                     {auth.hasPermission('BS_MANAGE_SCADENZE') && (
                        <button onClick={handleAdd} className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700">
                            <PlusIcon className="h-5 w-5" />
                            <span>Aggiungi Scadenza</span>
                        </button>
                    )}
                </div>
            </div>

            {error && <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">{error}</div>}

            <DynamicReportTable
                columns={columns}
                data={scadenze}
                isLoading={isLoading}
                defaultSort={{ key: 'data_scadenza', direction: 'asc' }}
                isSelectable={false}
                title="Prossime Scadenze"
                onSelectionChange={() => {}}
                onEdit={auth.hasPermission('BS_MANAGE_SCADENZE') ? handleEdit : null}
                onDelete={auth.hasPermission('BS_MANAGE_SCADENZE') ? handleDelete : null}
            />

            {isModalOpen && (
                <ScadenzaForm
                    scadenzaToEdit={selectedScadenza}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default ScadenzeView;
