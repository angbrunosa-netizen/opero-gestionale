/**
 * @file opero-frontend/src/components/magazzino/GiacenzeManager.js
 * @description Componente per la visualizzazione delle giacenze di magazzino.
 * @version 1.0
 * @date 2025-10-04
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import AdvancedDataGrid from '../../shared/AdvancedDataGrid';
import { ArrowPathIcon } from '@heroicons/react/24/solid';

const GiacenzeManager = () => {
    const { user } = useAuth();
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Funzione per forzare l'aggiornamento dei dati
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get('/magazzino/giacenze');
            setData(response.data);
        } catch (err) {
            setError('Impossibile caricare le giacenze. Riprova più tardi.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const columns = useMemo(() => [
        { accessorKey: 'codice_entita', header: 'Codice Articolo' },
        { accessorKey: 'descrizione', header: 'Descrizione Articolo' },
        { accessorKey: 'nome_magazzino', header: 'Magazzino' },
        { accessorKey: 'giacenza', header: 'Giacenza', cell: info => parseFloat(info.getValue()).toFixed(2) },
    ], []);

    // Filtra i dati in base al termine di ricerca (logica lato client)
    const filteredData = useMemo(() => {
        if (!searchTerm) return data;
        return data.filter(item =>
            item.codice_entita?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.descrizione?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.nome_magazzino?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [data, searchTerm]);

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-700">Giacenze Attuali</h2>
                <button
                    onClick={fetchData}
                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={isLoading}
                >
                    <ArrowPathIcon className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    {isLoading ? 'Caricamento...' : 'Aggiorna'}
                </button>
            </div>

            {error && <div className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</div>}
            
            <AdvancedDataGrid
                columns={columns}
                data={filteredData}
                isLoading={isLoading}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                // Nessuna azione di modifica/eliminazione prevista per la vista giacenze
            />
        </div>
    );
};

export default GiacenzeManager;
