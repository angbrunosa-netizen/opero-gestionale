// #####################################################################
// # Componente React Riutilizzabile per Report Dinamici v2.1 (con Azioni)
// # File: opero-frontend/src/shared/DynamicReportTable.js
// #####################################################################

import React,  { useState, useMemo, useEffect } from 'react';
import { TableCellsIcon, MagnifyingGlassIcon, ChevronUpIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ArrowPathIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

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
    }
    return String(value);
};

const DynamicReportTable = ({
    data = [],
    columns = [],
    isLoading = false,
    defaultSort = { key: '', direction: 'asc' },
    isSelectable = false,
    onSelectionChange = () => {},
    title = 'Report',
    onEdit = null,      // <span style="color:green;">// NUOVO: Prop per la funzione di modifica</span>
    onDelete = null     // <span style="color:green;">// NUOVO: Prop per la funzione di eliminazione</span>
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState(defaultSort);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRows, setSelectedRows] = useState(new Set());
    const itemsPerPage = 15;

    useEffect(() => {
        onSelectionChange(Array.from(selectedRows));
    }, [selectedRows, onSelectionChange]);

    const finalColumns = useMemo(() => {
        let cols = [...columns];
        // <span style="color:green;">// NUOVO: Aggiunge dinamicamente la colonna "Azioni" se necessario</span>
        if (onEdit || onDelete) {
            cols.push({
                label: 'Azioni',
                key: 'actions',
                sortable: false,
            });
        }
        return cols;
    }, [columns, onEdit, onDelete]);


    const filteredData = useMemo(() => {
        if (!data) return [];
        return data.filter(item => 
            finalColumns.some(col => 
                String(item[col.key]).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [data, searchTerm, finalColumns]);

    const sortedData = useMemo(() => {
        let sortableItems = [...filteredData];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredData, sortConfig]);
    
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedData.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedData, currentPage]);

    const totalPages = Math.ceil(sortedData.length / itemsPerPage);

    const handleSort = (key) => {
        if (!key) return;
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleSelectRow = (id) => {
        const newSelection = new Set(selectedRows);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedRows(newSelection);
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedRows(new Set(sortedData.map(item => item.id)));
        } else {
            setSelectedRows(new Set());
        }
    };
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-700">{title}</h3>
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Cerca..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            {isSelectable && (
                                <th className="px-6 py-3"><input type="checkbox" onChange={handleSelectAll} /></th>
                            )}
                            {finalColumns.map(col => (
                                <th key={col.key} onClick={() => col.sortable && handleSort(col.key)} className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer">
                                    <div className="flex items-center">
                                        {col.label}
                                        {sortConfig.key === col.key && (sortConfig.direction === 'asc' ? <ChevronUpIcon className="h-4 w-4 ml-1" /> : <ChevronDownIcon className="h-4 w-4 ml-1" />)}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {isLoading ? (
                            <tr><td colSpan={finalColumns.length + (isSelectable ? 1 : 0)} className="text-center py-8"><ArrowPathIcon className="h-6 w-6 animate-spin mx-auto text-slate-500" /></td></tr>
                        ) : paginatedData.length > 0 ? (
                            paginatedData.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50">
                                    {isSelectable && (
                                        <td className="px-6 py-4"><input type="checkbox" checked={selectedRows.has(item.id)} onChange={() => handleSelectRow(item.id)} /></td>
                                    )}
                                    {columns.map(col => (
                                        <td key={`${item.id}-${col.key}`} className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                            <RenderCell value={item[col.key]} format={col.format} />
                                        </td>
                                    ))}
                                    {/* <span style="color:green;">// NUOVO: Rendering della cella Azioni</span> */}
                                    {(onEdit || onDelete) && (
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                            <div className="flex items-center justify-end space-x-3">
                                                {onEdit && (
                                                    <button onClick={() => onEdit(item)} className="text-blue-600 hover:text-blue-800" title="Modifica">
                                                        <PencilIcon className="h-5 w-5" />
                                                    </button>
                                                )}
                                                {onDelete && (
                                                    <button onClick={() => onDelete(item)} className="text-red-600 hover:text-red-800" title="Elimina">
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={finalColumns.length + (isSelectable ? 1 : 0)} className="text-center py-8 text-slate-500">Nessun dato trovato.</td></tr>
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
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50">
                            <ChevronLeftIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50">
                            <ChevronRightIcon className="h-5 w-5" />
                        </button>
                    </div>
                 </div>
            )}
        </div>
    );
};

export default DynamicReportTable;

