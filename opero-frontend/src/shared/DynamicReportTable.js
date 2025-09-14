// #####################################################################
// # Componente React Riutilizzabile per Report Dinamici
// # File: opero-gestionale/opero-frontend/src/shared/DynamicReportTable.js
// #####################################################################

import React, { useState, useMemo } from 'react';
import { TableCellsIcon, MagnifyingGlassIcon, ChevronUpIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

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
                    if (column.key === 'selection') return false; // Esclude la colonna delle checkbox dalla ricerca
                    const value = item[column.key];
                    return value ? value.toString().toLowerCase().includes(searchTerm.toLowerCase()) : false;
                })
            );
        }

        // 2. Ordinamento
        if (sortConfig.key) {
            filteredData.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return filteredData;
    }, [data, searchTerm, sortConfig, columns]);

    // --- Gestione della paginazione ---
    const totalPages = Math.ceil(processedData.length / itemsPerPage);
    const paginatedData = processedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };
    
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <TableCellsIcon className="h-6 w-6" />
                    {title}
                </h3>
                <div className="relative w-full sm:w-auto">
                    <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Cerca..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full sm:w-64 rounded-md border border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            {columns.map((column) => (
                                <th key={column.key} className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    <div onClick={() => column.key !== 'selection' && handleSort(column.key)} className="flex items-center gap-2 cursor-pointer">
                                        {column.header}
                                        {sortConfig.key === column.key && (
                                            sortConfig.direction === 'ascending' ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {isLoading ? (
                            <tr><td colSpan={columns.length} className="text-center py-8"><ArrowPathIcon className="h-8 w-8 animate-spin mx-auto text-slate-500" /></td></tr>
                        ) : paginatedData.length > 0 ? (
                            paginatedData.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50">
                                    {columns.map((column) => (
                                        <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                            {column.render ? column.render(item) : item[column.key]}
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
