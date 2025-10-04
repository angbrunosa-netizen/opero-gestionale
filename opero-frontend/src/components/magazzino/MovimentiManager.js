/**
 * @file opero-frontend/src/components/magazzino/MovimentiManager.js
 * @description Manager per la visualizzazione dello storico movimenti e creazione.
 * @version 2.0
 * @date 2025-10-04
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import AdvancedDataGrid from '../../shared/AdvancedDataGrid';
import { PlusIcon } from '@heroicons/react/24/solid';
import MovimentoFormModal from './MovimentoFormModal';
import SearchableInput from '../../shared/SearchableInput';

const MovimentiManager = ({ forceRefreshGiacenze }) => {
    const { hasPermission } = useAuth();
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    
    // Stati per la visualizzazione dello storico
    const [selectedArticolo, setSelectedArticolo] = useState(null);
    const [movimenti, setMovimenti] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Callback per fetchare i movimenti quando un articolo è selezionato
    const fetchMovimenti = useCallback(async (id_catalogo) => {
        if (!id_catalogo) {
            setMovimenti([]);
            return;
        }
        setIsLoading(true);
        try {
            const response = await api.get(`/api/magazzino/movimenti/articolo/${id_catalogo}`);
            setMovimenti(response.data);
        } catch (error) {
            console.error("Errore nel caricamento dei movimenti:", error);
            setMovimenti([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleArticoloSelect = (item) => {
        setSelectedArticolo(item);
        fetchMovimenti(item ? item.id : null);
    };

    const handleSaveSuccess = () => {
        forceRefreshGiacenze(); // Aggiorna la griglia delle giacenze
        if (selectedArticolo) {
            fetchMovimenti(selectedArticolo.id); // Aggiorna lo storico movimenti se un articolo è selezionato
        }
    };
    
    const columns = useMemo(() => [
        { accessorKey: 'data_movimento', header: 'Data', cell: info => new Date(info.getValue()).toLocaleString('it-IT') },
        { accessorKey: 'nome_magazzino', header: 'Magazzino' },
        { accessorKey: 'descrizione_causale', header: 'Causale' },
        { accessorKey: 'quantita', header: 'Quantità', cell: info => {
            const tipo = info.row.original.tipo_movimento;
            const quantita = info.getValue();
            const color = tipo === 'carico' ? 'text-green-600' : 'text-red-600';
            const prefix = tipo === 'carico' ? '+' : '-';
            return <span className={`font-bold ${color}`}>{prefix} {quantita}</span>
        }},
        { accessorKey: 'riferimento_doc', header: 'Rif. Documento' },
        { accessorKey: 'username', header: 'Utente' },
        { accessorKey: 'note', header: 'Note' },
    ], []);

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Gestione Movimenti</h2>
                {hasPermission('MG_MOVIMENTI_MANAGE') && (
                    <button
                        onClick={() => setIsFormModalOpen(true)}
                        className="btn-primary"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Nuovo Movimento
                    </button>
                )}
            </div>
            
            <div className="mb-6 p-4 bg-white rounded-md shadow">
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seleziona un articolo per visualizzarne lo storico
                </label>
                <SearchableInput
                    searchUrl="/api/catalogo/search"
                    displayField="descrizione"
                    placeholder="Cerca articolo per codice, EAN o descrizione..."
                    onItemSelected={handleArticoloSelect}
                />
            </div>

            {selectedArticolo && (
                 <AdvancedDataGrid
                    columns={columns}
                    data={movimenti}
                    isLoading={isLoading}
                    // Disabilitiamo la ricerca interna della griglia, la ricerca è esterna
                    onSearchChange={() => {}} 
                />
            )}

            {isFormModalOpen && (
                <MovimentoFormModal
                    onClose={() => setIsFormModalOpen(false)}
                    onSaveSuccess={handleSaveSuccess}
                />
            )}
        </div>
    );
};

export default MovimentiManager;

