/**
 * @file opero-frontend/src/shared/AdvancedDataGrid.js
 * @description Griglia dati avanzata con ricerca "controllata" dal componente genitore.
 * @version 4.1 (Componente di ricerca reso "controllato")
 */
import React, { useState, useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
} from '@tanstack/react-table';
import { ChevronUpIcon, ChevronDownIcon, PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

// --- SOTTO-COMPONENTE SEARCHBAR RESO "CONTROLLATO" ---
// Ora non ha più uno stato interno, ma riceve il suo valore dal genitore.
const SearchBar = ({ value, onSearchChange }) => {
    return (
        <div className="mb-4">
            <input
                value={value || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Cerca per codice, descrizione, categoria, EAN..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
        </div>
    );
};


const AdvancedDataGrid = ({ columns, data, isLoading, searchTerm, onSearchChange, onEdit, onDelete, onNew, newButtonText = "Nuovo" }) => {
    const [sorting, setSorting] = useState([]);
    const memoizedData = useMemo(() => data, [data]);
    
    const tableColumns = useMemo(() => {
        const actionColumn = {
            id: 'actions',
            header: () => <div className="text-right">Azioni</div>,
            cell: ({ row }) => (
                <div className="flex justify-end items-center space-x-3">
                    {onEdit && (
                        <button onClick={() => onEdit(row.original)} className="text-blue-600 hover:text-blue-900" title="Modifica">
                            <PencilIcon className="h-5 w-5" />
                        </button>
                    )}
                    {onDelete && (
                        <button onClick={() => onDelete(row.original.id)} className="text-red-600 hover:text-red-900" title="Elimina">
                            <TrashIcon className="h-5 w-5" />
                        </button>
                    )}
                </div>
            ),
        };
        return (onEdit || onDelete) ? [...columns, actionColumn] : columns;
    }, [columns, onEdit, onDelete]);

    const table = useReactTable({
        data: memoizedData,
        columns: tableColumns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <div>
             <div className="flex justify-between items-center mb-4">
                {onSearchChange && (
                    <div className="flex-grow mr-4">
                       <SearchBar value={searchTerm} onSearchChange={onSearchChange} />
                    </div>
                )}
                {onNew && (
                    <button onClick={onNew} className="btn-primary inline-flex items-center self-start">
                        <PlusIcon className="h-5 w-5 mr-2" />
                        {newButtonText}
                    </button>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className={header.column.getCanSort() ? 'cursor-pointer select-none flex items-center' : ''} onClick={header.column.getToggleSortingHandler()}>
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {{ asc: <ChevronUpIcon className="h-4 w-4 ml-1" />, desc: <ChevronDownIcon className="h-4 w-4 ml-1" /> }[header.column.getIsSorted()] ?? null}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                            <tr><td colSpan={columns.length + 1} className="text-center p-8">Caricamento...</td></tr>
                        ) : table.getRowModel().rows.length === 0 ? (
                            <tr><td colSpan={columns.length + 1} className="text-center p-8">Nessun dato trovato.</td></tr>
                        ) : (
                            table.getRowModel().rows.map(row => (
                                <tr key={row.id}>
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            <div className="py-3 flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                    <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="btn-secondary">Precedente</button>
                    <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="btn-secondary">Successivo</button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Pagina{' '}
                            <span className="font-medium">{table.getState().pagination.pageIndex + 1}</span> di{' '}
                            <span className="font-medium">{table.getPageCount()}</span>
                        </p>
                    </div>
                    <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">Precedente</button>
                            <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">Successivo</button>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvancedDataGrid;

