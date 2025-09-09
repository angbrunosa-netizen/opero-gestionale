// #####################################################################
// # Componente React Riutilizzabile per Report Dinamici
// # File: opero-gestionale/opero-frontend/src/components/shared/DynamicReportTable.js
// #####################################################################

import React, { useState, useMemo } from 'react';
import { TableCellsIcon, MagnifyingGlassIcon, ChevronUpIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

const DynamicReportTable = ({ data = [], columns = [], isLoading = false, title = "Report", defaultSort = {} }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState(defaultSort);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);

    // --- Memoizzazione per ottimizzare le performance ---
    const processedData = useMemo(() => {
        let filteredData = [...data];

        // 1. Filtro di ricerca
        if (searchTerm) {
            filteredData = filteredData.filter(item =>
                columns.some(column => {
                    const value = item[column.key];
                    return value ? value.toString().toLowerCase().includes(searchTerm.toLowerCase()) : false;
                })
            );
        }

        // 2. Ordinamento
        if (sortConfig.key) {
            filteredData.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return filteredData;
    }, [data, searchTerm, sortConfig, columns]);

    // 3. Paginazione
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return processedData.slice(startIndex, startIndex + itemsPerPage);
    }, [processedData, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(processedData.length / itemsPerPage);

    // --- Gestori di eventi ---
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) return null;
        return sortConfig.direction === 'asc' ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />;
    };

    return (
        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
            <header className="mb-4">
                <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
                <div className="mt-2 relative">
                    <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Cerca in tutte le colonne..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full max-w-sm pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </header>
            
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            {columns.map(col => (
                                <th key={col.key} scope="col" className="px-6 py-3">
                                    <div 
                                        className={`flex items-center gap-1 ${col.sortable ? 'cursor-pointer select-none' : ''}`}
                                        onClick={() => col.sortable && handleSort(col.key)}
                                    >
                                        {col.label}
                                        {col.sortable && <SortIcon columnKey={col.key} />}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={columns.length} className="text-center py-8">Caricamento in corso...</td></tr>
                        ) : paginatedData.length > 0 ? (
                            paginatedData.map((item, index) => (
                                <tr key={item.id || index} className="bg-white border-b hover:bg-slate-50">
                                    {columns.map(col => (
                                        <td key={col.key} className="px-6 py-4">
                                            {col.render ? col.render(item) : item[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={columns.length} className="text-center py-8">Nessun dato trovato.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginazione */}
            {!isLoading && totalPages > 1 && (
                 <div className="flex items-center justify-between pt-4">
                    <span className="text-sm text-slate-600">
                        Pagina {currentPage} di {totalPages}
                    </span>
                    <div className="inline-flex -space-x-px rounded-md shadow-sm">
                        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50">
                            <ChevronLeftIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50">
                            <ChevronRightIcon className="h-5 w-5" />
                        </button>
                    </div>
                 </div>
            )}
        </div>
    );
};

export default DynamicReportTable;
