/**
 * @file opero-frontend/src/shared/AdvancedDataGrid.js
 * @description Griglia dati con ricerca ultra-performante e isolata.
 * @version 5.6 (Performance massima e fix ricerca)
 */
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
} from '@tanstack/react-table';
import { 
    ChevronUpIcon, 
    ChevronDownIcon, 
    PencilIcon, 
    TrashIcon, 
    PlusIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
    EllipsisVerticalIcon
} from '@heroicons/react/24/outline';

// --- SEARCHBAR COMPLETAMENTE ISOLATA ---
const SearchBar = React.memo(({ 
    value, 
    onChange, 
    placeholder = "Cerca..." 
}) => {
    // Stato locale isolato - non causa MAI re-render del parent
    const [localValue, setLocalValue] = useState(value || '');

    // Sincronizza solo se il valore esterno cambia (es. reset)
    useEffect(() => {
        if (value !== localValue) {
            setLocalValue(value || '');
        }
    }, [value]);

    const handleChange = useCallback((e) => {
        const newValue = e.target.value;
        setLocalValue(newValue);
        
        // Notifica il parent solo quando l'utente preme Invio o il pulsante cerca
        if (e.key === 'Enter') {
            onChange(newValue);
        }
    }, [onChange]);

    const handleSearch = useCallback(() => {
        onChange(localValue);
    }, [localValue, onChange]);

    const handleClear = useCallback(() => {
        setLocalValue('');
        onChange('');
    }, [onChange]);

    return (
        <div className="relative w-full">
            <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    value={localValue}
                    onChange={handleChange}
                    onKeyDown={handleChange}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-20 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm"
                />
                <div className="absolute right-0 top-0 h-full flex">
                    {localValue && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="px-2 text-gray-400 hover:text-gray-600"
                            title="Cancella ricerca"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleSearch}
                        className="px-3 text-blue-600 hover:text-blue-800 border-l border-gray-300"
                        title="Esegui ricerca (Invio)"
                    >
                        <MagnifyingGlassIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
});

SearchBar.displayName = 'SearchBar';

// --- MENU AZIONI MOBILE ---
const MobileActionsMenu = React.memo(({ onNew, newButtonText, headerActions }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!onNew && !headerActions) return null;

    return (
        <div className="relative md:hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm font-medium"
            >
                <EllipsisVerticalIcon className="h-5 w-5 mr-2" />
                Azioni
            </button>
            
            {isOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden">
                        {onNew && (
                            <button
                                onClick={() => {
                                    onNew();
                                    setIsOpen(false);
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center text-gray-700 border-b border-gray-100"
                            >
                                <PlusIcon className="h-5 w-5 mr-3 text-blue-600" />
                                <span className="font-medium">{newButtonText}</span>
                            </button>
                        )}
                        {headerActions && (
                            <div className="p-2 space-y-1">
                                {React.Children.map(headerActions.props?.children || headerActions, (child, index) => {
                                    if (!child) return null;
                                    return (
                                        <div 
                                            key={index}
                                            onClick={() => setIsOpen(false)}
                                            className="w-full"
                                        >
                                            {React.cloneElement(child, {
                                                className: "w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center justify-center text-sm rounded-md " + (child.props.className || '')
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
});

MobileActionsMenu.displayName = 'MobileActionsMenu';

// --- PULSANTI DESKTOP ---
const DesktopActions = React.memo(({ onNew, newButtonText, headerActions, hideDefaultNewButton }) => {
    if ((!onNew || hideDefaultNewButton) && !headerActions) return null;

    return (
        <div className="hidden md:flex flex-wrap gap-2">
            {!hideDefaultNewButton && onNew && (
                <button 
                    onClick={onNew} 
                    className="btn-primary inline-flex items-center justify-center whitespace-nowrap px-4 py-2 rounded-lg shadow-sm"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    {newButtonText}
                </button>
            )}
            {headerActions}
        </div>
    );
});

DesktopActions.displayName = 'DesktopActions';

// --- CARD VIEW PER MOBILE ---
const MobileCard = React.memo(({ row, onEdit, onDelete }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm">
            {row.getVisibleCells().map(cell => {
                if (cell.column.id === 'actions') return null;
                const headerText = typeof cell.column.columnDef.header === 'function' 
                    ? cell.column.id 
                    : cell.column.columnDef.header;
                
                return (
                    <div key={cell.id} className="mb-3 last:mb-0">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                            {headerText}
                        </div>
                        <div className="text-sm text-gray-900">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
                    </div>
                );
            })}
            {(onEdit || onDelete) && (
                <div className="flex justify-end space-x-3 mt-4 pt-3 border-t border-gray-200">
                    {onEdit && (
                        <button 
                            onClick={() => onEdit(row.original)} 
                            className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1.5 rounded hover:bg-blue-50"
                        >
                            <PencilIcon className="h-4 w-4 mr-1.5" />
                            Modifica
                        </button>
                    )}
                    {onDelete && (
                        <button 
                            onClick={() => onDelete(row.original.id)} 
                            className="flex items-center text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1.5 rounded hover:bg-red-50"
                        >
                            <TrashIcon className="h-4 w-4 mr-1.5" />
                            Elimina
                        </button>
                    )}
                </div>
            )}
        </div>
    );
});

MobileCard.displayName = 'MobileCard';

const AdvancedDataGrid = React.memo(({ 
    columns, 
    data, 
    isLoading, 
    searchTerm, 
    onSearchChange, 
    onEdit, 
    onDelete, 
    onNew, 
    newButtonText = "Nuovo",
    enableGlobalFilter = true,
    headerActions,
    hideDefaultNewButton = false,
    searchConfig = {
        enabled: true,
        placeholder: "Cerca..."
    }
}) => {
    const [sorting, setSorting] = useState([]);
    const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobileView(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const memoizedData = useMemo(() => data, [data]);
    
    const tableColumns = useMemo(() => {
        const actionColumn = {
            id: 'actions',
            header: () => <div className="text-right">Azioni</div>,
            cell: ({ row }) => (
                <div className="flex justify-end items-center space-x-3">
                    {onEdit && (
                        <button 
                            onClick={() => onEdit(row.original)} 
                            className="text-blue-600 hover:text-blue-900" 
                            title="Modifica"
                        >
                            <PencilIcon className="h-5 w-5" />
                        </button>
                    )}
                    {onDelete && (
                        <button 
                            onClick={() => onDelete(row.original.id)} 
                            className="text-red-600 hover:text-red-900" 
                            title="Elimina"
                        >
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
        state: { 
            sorting,
            globalFilter: searchTerm,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        globalFilterFn: 'includesString',
    });

    const resultsCount = table.getFilteredRowModel().rows.length;
    const hasActions = (onNew && !hideDefaultNewButton) || headerActions;

    return (
        <div className="w-full">
            {/* Header con ricerca e azioni */}
            <div className="mb-4">
                {/* Layout Mobile: Search + Menu Azioni in colonna */}
                <div className="flex flex-col gap-3 md:hidden">
                    {enableGlobalFilter && searchConfig.enabled && (
                        <SearchBar 
                            value={searchTerm} 
                            onChange={onSearchChange}
                            placeholder={searchConfig.placeholder}
                        />
                    )}
                    {hasActions && (
                        <MobileActionsMenu 
                            onNew={!hideDefaultNewButton ? onNew : null}
                            newButtonText={newButtonText}
                            headerActions={headerActions}
                        />
                    )}
                </div>

                {/* Layout Desktop: Search + Pulsanti in riga */}
                <div className="hidden md:flex md:items-start md:gap-4">
                    {enableGlobalFilter && searchConfig.enabled && (
                        <div className="flex-grow max-w-md">
                            <SearchBar 
                                value={searchTerm} 
                                onChange={onSearchChange}
                                placeholder={searchConfig.placeholder}
                            />
                        </div>
                    )}
                    {hasActions && (
                        <DesktopActions 
                            onNew={onNew}
                            newButtonText={newButtonText}
                            headerActions={headerActions}
                            hideDefaultNewButton={hideDefaultNewButton}
                        />
                    )}
                </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="text-center p-8 bg-white rounded-lg border border-gray-200">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Caricamento...</p>
                </div>
            ) : table.getRowModel().rows.length === 0 ? (
                <div className="text-center p-8 bg-white rounded-lg border border-gray-200">
                    <p className="text-gray-600">
                        {searchTerm ? 'Nessun risultato trovato per la ricerca.' : 'Nessun dato disponibile.'}
                    </p>
                </div>
            ) : (
                <>
                    {/* VISTA MOBILE - CARDS */}
                    {isMobileView ? (
                        <div className="md:hidden">
                            {table.getRowModel().rows.map(row => (
                                <MobileCard 
                                    key={row.id} 
                                    row={row} 
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                />
                            ))}
                        </div>
                    ) : (
                        /* VISTA DESKTOP - TABELLA */
                        <div className="hidden md:block overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    {table.getHeaderGroups().map(headerGroup => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map(header => (
                                                <th 
                                                    key={header.id} 
                                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    <div 
                                                        className={header.column.getCanSort() ? 'cursor-pointer select-none flex items-center hover:text-gray-700' : ''} 
                                                        onClick={header.column.getToggleSortingHandler()}
                                                    >
                                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                                        {{
                                                            asc: <ChevronUpIcon className="h-4 w-4 ml-1" />,
                                                            desc: <ChevronDownIcon className="h-4 w-4 ml-1" />
                                                        }[header.column.getIsSorted()] ?? null}
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {table.getRowModel().rows.map(row => (
                                        <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                            {row.getVisibleCells().map(cell => (
                                                <td 
                                                    key={cell.id} 
                                                    className="px-4 py-3 whitespace-nowrap text-sm text-gray-700"
                                                >
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* PAGINAZIONE */}
                    <div className="py-3 flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
                        <div className="text-sm text-gray-700 order-2 sm:order-1">
                            Pagina{' '}
                            <span className="font-medium">{table.getState().pagination.pageIndex + 1}</span> di{' '}
                            <span className="font-medium">{table.getPageCount()}</span>
                            {' '}({resultsCount} {resultsCount === 1 ? 'elemento' : 'elementi'})
                        </div>
                        <nav className="flex gap-2 order-1 sm:order-2">
                            <button 
                                onClick={() => table.previousPage()} 
                                disabled={!table.getCanPreviousPage()} 
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
                            >
                                Precedente
                            </button>
                            <button 
                                onClick={() => table.nextPage()} 
                                disabled={!table.getCanNextPage()} 
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
                            >
                                Successivo
                            </button>
                        </nav>
                    </div>
                </>
            )}
        </div>
    );
});

AdvancedDataGrid.displayName = 'AdvancedDataGrid';

export default AdvancedDataGrid;