// #####################################################################
// # Componente React Riutilizzabile per Report Dinamici v2.0 (Fix Formattazione)
// # File: opero-frontend/src/shared/DynamicReportTable.js
// #####################################################################

import React,  { useState, useMemo, useEffect } from 'react';
import { TableCellsIcon, MagnifyingGlassIcon, ChevronUpIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

// <span style="color:red;">// CORREZIONE: Sub-componente robusto per la formattazione delle celle</span>
const RenderCell = ({ value, format }) => {
    if (value === null || typeof value === 'undefined') {
        return <span className="text-slate-400">N/D</span>;
    }

    if (format === 'date') {
        const date = new Date(value);
        if (date instanceof Date && !isNaN(date)) {
            return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
        }
        return <span className="text-red-500">Data Invalida</span>;
    }

    if (format === 'currency') {
        const number = Number(value);
        if (!isNaN(number)) {
            return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(number);
        }
        return <span className="text-red-500">Valore Invalido</span>;
    }
    
    return value.toString();
};


const DynamicReportTable = ({ 
    data = [], 
    columns = [], 
    isLoading = false, 
    title = "Report", 
    defaultSort = {},
    isSelectable = false,
    onSelectionChange = () => {}
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState(defaultSort);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [selectedRows, setSelectedRows] = useState([]);

    // Reset paginazione e selezione quando i dati cambiano
    useEffect(() => {
        setCurrentPage(1);
        setSelectedRows([]);
    }, [data, searchTerm]);

    useEffect(() => {
        onSelectionChange(selectedRows);
    }, [selectedRows, onSelectionChange]);

    const handleRowSelect = (id) => {
        setSelectedRows(prev => 
            prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedRows(paginatedData.map(item => item.id));
        } else {
            setSelectedRows([]);
        }
    };

    const processedData = useMemo(() => {
        let filteredData = [...data];

        if (searchTerm) {
            filteredData = filteredData.filter(item =>
                columns.some(column => {
                    const value = item[column.key];
                    return value ? value.toString().toLowerCase().includes(searchTerm.toLowerCase()) : false;
                })
            );
        }

        if (sortConfig.key) {
            filteredData.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filteredData;
    }, [data, searchTerm, sortConfig, columns]);

    const totalPages = Math.ceil(processedData.length / itemsPerPage);
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return processedData.slice(startIndex, startIndex + itemsPerPage);
    }, [processedData, currentPage, itemsPerPage]);

    const requestSort = (key) => {
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

    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <TableCellsIcon className="h-6 w-6" />
                    {title}
                </h2>
                <div className="relative w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder="Cerca in tutte le colonne..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-64 pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-100">
                            {isSelectable && (
                                <th className="p-3 text-sm font-semibold text-slate-600 text-center w-12">
                                    <input type="checkbox" onChange={handleSelectAll} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                </th>
                            )}
                            {columns.map(column => (
                                <th key={column.key} onClick={() => column.sortable && requestSort(column.key)} className={`p-3 text-sm font-semibold text-slate-600 ${column.align === 'center' ? 'text-center' : 'text-left'} ${column.sortable ? 'cursor-pointer hover:bg-slate-200' : ''}`}>
                                    <div className="flex items-center gap-1">
                                        {column.label}
                                        {column.sortable && sortConfig.key === column.key && (
                                            sortConfig.direction === 'asc' ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={columns.length + (isSelectable ? 1 : 0)} className="text-center py-8"><ArrowPathIcon className="h-6 w-6 animate-spin mx-auto text-slate-500" /></td></tr>
                        ) : paginatedData.length > 0 ? (
                            paginatedData.map(item => (
                                <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                                    {isSelectable && (
                                        <td className="p-3 text-sm text-slate-500 text-center">
                                            <input type="checkbox" checked={selectedRows.includes(item.id)} onChange={() => handleRowSelect(item.id)} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"/>
                                        </td>
                                    )}
                                    {columns.map(column => {
                                        const isHighlighted = column.highlight ? column.highlight(item[column.key]) : false;
                                        return (
                                            <td key={column.key} className={`p-3 text-sm text-slate-700 ${column.align === 'center' ? 'text-center' : 'text-left'} ${isHighlighted ? 'text-red-600 font-bold' : ''}`}>
                                                {/* <span style="color:red;">// CORREZIONE: Utilizzo del sub-componente per una visualizzazione sicura</span> */}
                                                <RenderCell value={item[column.key]} format={column.format} />
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={columns.length + (isSelectable ? 1 : 0)} className="text-center py-8 text-slate-500">Nessun dato trovato.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

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
