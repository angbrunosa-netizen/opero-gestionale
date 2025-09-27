/**
 * ======================================================================
 * File: src/components/ppa/LeMieAttivitaPPA.js (v3.0 - con Ricerca)
 * ======================================================================
 * @description
 * AGGIORNATO: Componente potenziato con un'interfaccia di ricerca
 * che permette di filtrare le procedure per target, tipo e data.
 * La lista si aggiorna dinamicamente in base ai filtri impostati.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { ChevronRightIcon, CalendarDaysIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';

const LeMieAttivitaPPA = () => {
    const [istanze, setIstanze] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- STATI PER LA GESTIONE DEI FILTRI ---
    const [procedureTipi, setProcedureTipi] = useState([]);
    const [filters, setFilters] = useState({
        target: '',
        dateFrom: '',
        dateTo: '',
        proceduraId: ''
    });

    // Carica i tipi di procedura per il menu a tendina dei filtri
    useEffect(() => {
        const fetchProcedureTipi = async () => {
            try {
                const response = await api.get('/ppa/procedure-ditta');
                setProcedureTipi(response.data.data || []);
            } catch (err) {
                console.error("Impossibile caricare i tipi di procedura.", err);
            }
        };
        fetchProcedureTipi();
    }, []);

    // Funzione di fetch che invia i filtri al backend
    const fetchMyIstanze = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (filters.target) params.append('targetSearch', filters.target);
            if (filters.dateFrom && filters.dateTo) {
                params.append('dateFrom', filters.dateFrom);
                params.append('dateTo', filters.dateTo);
            }
            if (filters.proceduraId) params.append('proceduraId', filters.proceduraId);

            const response = await api.get(`/ppa/my-istanze?${params.toString()}`);
            setIstanze(response.data.data || []);
        } catch (err) {
            setError("Impossibile caricare le tue procedure.");
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    // Riesegue il fetch ogni volta che i filtri cambiano
    useEffect(() => {
        // Aggiungiamo un piccolo debounce per non fare troppe chiamate
        const handler = setTimeout(() => {
            fetchMyIstanze();
        }, 500); // Attende 500ms dopo l'ultimo cambio prima di cercare

        return () => {
            clearTimeout(handler);
        };
    }, [filters, fetchMyIstanze]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="bg-white rounded-lg shadow">
            {/* Sezione Filtri */}
            <div className="p-4 border-b">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    {/* Filtro per Target */}
                    <div>
                        <label htmlFor="target" className="block text-sm font-medium text-gray-700">Ricerca Target</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                name="target"
                                id="target"
                                className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                placeholder="Nome cliente/utente..."
                                value={filters.target}
                                onChange={handleFilterChange}
                            />
                        </div>
                    </div>
                    {/* Filtro per Tipo Procedura */}
                    <div>
                        <label htmlFor="proceduraId" className="block text-sm font-medium text-gray-700">Tipo Procedura</label>
                        <select
                            id="proceduraId"
                            name="proceduraId"
                            className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                            value={filters.proceduraId}
                            onChange={handleFilterChange}
                        >
                            <option value="">Tutte</option>
                            {procedureTipi.map(p => (
                                <option key={p.ID} value={p.ID}>{p.NomePersonalizzato}</option>
                            ))}
                        </select>
                    </div>
                    {/* Filtro per Data */}
                    <div>
                        <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700">Scadenza Da</label>
                        <input type="date" name="dateFrom" id="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700">Scadenza A</label>
                        <input type="date" name="dateTo" id="dateTo" value={filters.dateTo} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" />
                    </div>
                </div>
            </div>

            {/* Lista Risultati */}
            <div>
                {isLoading && <p className="p-6 text-center">Caricamento...</p>}
                {error && <p className="p-6 text-center text-red-600">{error}</p>}
                {!isLoading && !error && (
                    <ul className="divide-y divide-gray-200">
                        {istanze.length > 0 ? (
                            istanze.map(istanza => (
                                <li key={istanza.id_istanza}>
                                    <Link to={`/ppa/task/${istanza.id_istanza}`} className="block p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-blue-600">{istanza.NomeProcedura}</p>
                                                <p className="text-sm text-gray-600">Target: {istanza.TargetEntityName}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <CalendarDaysIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                                                    Scadenza: {new Date(istanza.DataPrevistaFine).toLocaleDateString('it-IT')}
                                                </div>
                                                <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            ))
                        ) : (
                            <li className="p-6 text-center text-gray-500">
                                Nessuna procedura trovata con i criteri di ricerca specificati.
                            </li>
                        )}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default LeMieAttivitaPPA;

