/*
 * #####################################################################
 * # Componente React Riutilizzabile per Report Dinamici v4.0 (Versione Finale e Corretta)
 * # File: opero-frontend/src/shared/DynamicReportTable.js
 * #####################################################################
 */

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { 
    TableCellsIcon, MagnifyingGlassIcon, ChevronUpIcon, ChevronDownIcon, 
    ChevronLeftIcon, ChevronRightIcon, ArrowPathIcon, PencilIcon, 
    TrashIcon, XMarkIcon, FunnelIcon, CheckIcon
} from '@heroicons/react/24/outline';

// Componente helper per renderizzare il contenuto di una cella
const RenderCell = ({ value, format, highlight }) => {
    if (value === null || typeof value === 'undefined') {
        return <span className="text-slate-400">N/D</span>;
    }
    
    let displayValue = String(value);
    
    if (format === 'date') {
        const date = new Date(value);
        if (date instanceof Date && !isNaN(date)) {
            displayValue = date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } else {
            return <span className="text-red-500">Data Invalida</span>;
        }
    }
    
    if (format === 'currency') {
        const number = Number(value);
        if (!isNaN(number)) {
            displayValue = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(number);
        }
    }
    
    if (highlight && format === 'date') {
        const date = new Date(value);
        const isPast = date < new Date();
        return <span className={isPast ? 'text-red-600 font-semibold' : ''}>{displayValue}</span>;
    }
    
    return <span>{displayValue}</span>;
};

// Componente Principale
const DynamicReportTable = ({
    data = [],
    columns = [],
    isLoading = false,
    defaultSort = { key: '', direction: 'asc' },
    isSelectable = false,
    onSelectionChange = () => {},
    title = 'Report',
    onEdit = null,
    onDelete = null,
    responsive = true,
    itemsPerPage = 15
}) => {
    // Stati del componente
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState(defaultSort);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const tableRef = useRef(null);

    // Effetto per rilevare la dimensione dello schermo
    useEffect(() => {
        const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);
        return () => window.removeEventListener('resize', checkIsMobile);
    }, []);

    // Effetto per notificare il componente genitore dei cambiamenti di selezione
    useEffect(() => {
        onSelectionChange(Array.from(selectedRows));
    }, [selectedRows, onSelectionChange]);

    // Calcolo delle colonne finali (aggiunge la colonna Azioni se necessario)
    const finalColumns = useMemo(() => {
        let cols = [...columns];
        if (onEdit || onDelete) {
            cols.push({
                label: 'Azioni',
                key: 'actions',
                sortable: false,
                hideOnMobile: true
            });
        }
        return cols;
    }, [columns, onEdit, onDelete]);

    // Dati filtrati in base al termine di ricerca
    const filteredData = useMemo(() => {
        if (!data) return [];
        return data.filter(item => 
            finalColumns.some(col => 
                String(item[col.key]).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [data, searchTerm, finalColumns]);

    // Dati ordinati
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
    
    // Dati per la paginazione
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedData.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedData, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(sortedData.length / itemsPerPage);

    // Handler per l'ordinamento
    const handleSort = (key) => {
        if (!key) return;
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Handler per la selezione di una singola riga
    const handleSelectRow = useCallback((itemId) => {
        setSelectedRows(prevSelectedRows => {
            const newSelection = new Set(prevSelectedRows);
            if (newSelection.has(itemId)) {
                newSelection.delete(itemId);
            } else {
                newSelection.add(itemId);
            }
            return newSelection;
        });
    }, []);

    // Handler per la selezione di tutte le righe
    const handleSelectAll = useCallback((e) => {
        if (e.target.checked) {
            const allIds = sortedData.map(item => item.id);
            setSelectedRows(new Set(allIds));
        } else {
            setSelectedRows(new Set());
        }
    }, [sortedData]);

    // Componente per la visualizzazione a card su mobile
    const MobileCardView = () => (
        <div className={`${responsive && isMobile ? 'block' : 'hidden'}`}>
            {isLoading ? (
                <div className="flex justify-center items-center py-8">
                    <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-500" />
                </div>
            ) : paginatedData.length > 0 ? (
                <div className="space-y-4">
                    {paginatedData.map(item => {
                        const isSelected = selectedRows.has(item.id);
                        return (
                            <div 
                                key={item.id}
                                className={`bg-white border rounded-lg shadow-sm p-4 transition-all ${
                                    isSelected 
                                        ? 'border-blue-500 bg-blue-50' 
                                        : 'border-gray-200'
                                }`}
                            >
                                {isSelectable && (
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center">
                                            <input 
                                                type="checkbox" 
                                                checked={isSelected}
                                                onChange={() => handleSelectRow(item.id)}
                                                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                                            />
                                            <span className="text-sm font-medium text-gray-700">
                                                {isSelected ? 'Selezionato' : 'Seleziona'}
                                            </span>
                                        </div>
                                        {isSelected && (
                                            <CheckIcon className="h-5 w-5 text-blue-600" />
                                        )}
                                    </div>
                                )}
                                
                                <div className="space-y-2">
                                    {columns.filter(col => !col.hideOnMobile).map(col => (
                                        <div key={col.key} className="flex justify-between">
                                            <span className="text-sm font-medium text-gray-500">{col.label}:</span>
                                            <span className="text-sm text-gray-900 text-right">
                                                <RenderCell 
                                                    value={item[col.key]} 
                                                    format={col.format} 
                                                    highlight={col.highlight}
                                                />
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                
                                {(onEdit || onDelete) && (
                                    <div className="flex justify-end space-x-2 mt-4 pt-3 border-t border-gray-100">
                                        {onEdit && (
                                            <button 
                                                onClick={() => onEdit(item)} 
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                title="Modifica"
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                        )}
                                        {onDelete && (
                                            <button 
                                                onClick={() => onDelete(item)} 
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                title="Elimina"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    {searchTerm ? `Nessun risultato per "${searchTerm}"` : 'Nessun dato trovato.'}
                </div>
            )}
        </div>
    );

    // Componente per la barra di ricerca responsive
    const ResponsiveSearchBar = () => (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
            <h3 className="text-lg font-semibold text-slate-700">{title}</h3>
            <div className="flex items-center gap-2">
                {responsive && isMobile && (
                    <button 
                        onClick={() => setShowMobileSearch(!showMobileSearch)} 
                        className="p-2 text-gray-500 hover:text-gray-700 rounded-md" 
                        title="Cerca"
                    >
                        <MagnifyingGlassIcon className="h-5 w-5" />
                    </button>
                )}
                {(!responsive || !isMobile || showMobileSearch) && (
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Cerca..." 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)} 
                            className={`pl-10 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${responsive && isMobile ? 'w-full' : ''}`} 
                            autoFocus={responsive && isMobile} 
                        />
                        <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
                        {responsive && isMobile && (
                            <button 
                                onClick={() => setShowMobileSearch(false)} 
                                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                )}
                {responsive && isMobile && (
                    <button 
                        onClick={() => setShowMobileFilters(!showMobileFilters)} 
                        className="p-2 text-gray-500 hover:text-gray-700 rounded-md" 
                        title="Filtri"
                    >
                        <FunnelIcon className="h-5 w-5" />
                    </button>
                )}
            </div>
        </div>
    );

    // Componente per i controlli di paginazione responsive
    const ResponsivePagination = () => {
        if (totalPages <= 1) return null;
        return (
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-4">
                <span className="text-sm text-slate-600 text-center sm:text-left">
                    Pagina {currentPage} di {totalPages} ({sortedData.length} risultati)
                </span>
                <div className="flex items-center justify-center">
                    <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                        disabled={currentPage === 1} 
                        className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                    >
                        <ChevronLeftIcon className="h-5 w-5" />
                        <span className="hidden sm:inline ml-1">Precedente</span>
                    </button>
                    <div className="px-4 py-2 bg-white border-t border-b border-slate-300 text-sm text-slate-700">
                        {currentPage}
                    </div>
                    <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                        disabled={currentPage === totalPages} 
                        className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                    >
                        <span className="hidden sm:inline mr-1">Successivo</span>
                        <ChevronRightIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        );
    };

    // Componente per i filtri su mobile
    const MobileFilters = () => {
        if (!responsive || !isMobile || !showMobileFilters) return null;
        return (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-medium text-gray-900">Filtri e ordinamento</h4>
                    <button 
                        onClick={() => setShowMobileFilters(false)} 
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ordina per</label>
                        <select 
                            value={sortConfig.key} 
                            onChange={(e) => handleSort(e.target.value)} 
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        >
                            <option value="">Nessun ordinamento</option>
                            {columns.filter(col => col.sortable).map(col => (
                                <option key={col.key} value={col.key}>{col.label}</option>
                            ))}
                        </select>
                    </div>
                    {sortConfig.key && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Direzione</label>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setSortConfig({...sortConfig, direction: 'asc'})}
                                    className={`flex-1 py-2 px-3 text-sm rounded-md ${
                                        sortConfig.direction === 'asc' 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-gray-200 text-gray-700'
                                    }`}
                                >
                                    Crescente
                                </button>
                                <button
                                    onClick={() => setSortConfig({...sortConfig, direction: 'desc'})}
                                    className={`flex-1 py-2 px-3 text-sm rounded-md ${
                                        sortConfig.direction === 'desc' 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-gray-200 text-gray-700'
                                    }`}
                                >
                                    Decrescente
                                </button>
                            </div>
                        </div>
                    )}
                    {isSelectable && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Selezione</label>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setSelectedRows(new Set(sortedData.map(item => item.id)))}
                                    className="flex-1 py-2 px-3 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                                >
                                    Seleziona tutto
                                </button>
                                <button
                                    onClick={() => setSelectedRows(new Set())}
                                    className="flex-1 py-2 px-3 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                                >
                                    Deseleziona tutto
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Render principale del componente
    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md" ref={tableRef}>
            <ResponsiveSearchBar />
            <MobileFilters />
            
            {/* Vista tabella per desktop */}
            <div className={`${responsive && isMobile ? 'hidden' : 'block'} overflow-x-auto`}>
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            {isSelectable && (
                                <th className="px-6 py-3">
                                    <input 
                                        type="checkbox" 
                                        onChange={handleSelectAll} 
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                                    />
                                </th>
                            )}
                            {finalColumns.map(col => (
                                <th 
                                    key={col.key} 
                                    onClick={() => col.sortable && handleSort(col.key)} 
                                    className={`px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider ${col.sortable ? 'cursor-pointer' : ''}`}
                                >
                                    <div className="flex items-center">
                                        {col.label}
                                        {sortConfig.key === col.key && (
                                            sortConfig.direction === 'asc' 
                                                ? <ChevronUpIcon className="h-4 w-4 ml-1" /> 
                                                : <ChevronDownIcon className="h-4 w-4 ml-1" />
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {isLoading ? (
                            <tr>
                                <td colSpan={finalColumns.length + (isSelectable ? 1 : 0)} className="text-center py-8">
                                    <ArrowPathIcon className="h-6 w-6 animate-spin mx-auto text-slate-500" />
                                </td>
                            </tr>
                        ) : paginatedData.length > 0 ? (
                            paginatedData.map(item => {
                                const isSelected = selectedRows.has(item.id);
                                return (
                                    <tr key={item.id} className={`hover:bg-slate-50 ${isSelected ? 'bg-blue-50' : ''}`}>
                                        {isSelectable && (
                                            <td className="px-6 py-4">
                                                <input 
                                                    type="checkbox" 
                                                    checked={isSelected} 
                                                    onChange={() => handleSelectRow(item.id)} 
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                                                />
                                            </td>
                                        )}
                                        {columns.map(col => (
                                            <td key={`${item.id}-${col.key}`} className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                                <RenderCell value={item[col.key]} format={col.format} highlight={col.highlight} />
                                            </td>
                                        ))}
                                        {(onEdit || onDelete) && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                                <div className="flex items-center justify-end space-x-3">
                                                    {onEdit && (
                                                        <button 
                                                            onClick={() => onEdit(item)} 
                                                            className="text-blue-600 hover:text-blue-800" 
                                                            title="Modifica"
                                                        >
                                                            <PencilIcon className="h-5 w-5" />
                                                        </button>
                                                    )}
                                                    {onDelete && (
                                                        <button 
                                                            onClick={() => onDelete(item)} 
                                                            className="text-red-600 hover:text-red-800" 
                                                            title="Elimina"
                                                        >
                                                            <TrashIcon className="h-5 w-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={finalColumns.length + (isSelectable ? 1 : 0)} className="text-center py-8 text-slate-500">
                                    {searchTerm ? `Nessun risultato per "${searchTerm}"` : 'Nessun dato trovato.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Vista card per mobile */}
            <MobileCardView />
            
            {/* Paginazione responsive */}
            <ResponsivePagination />
        </div>
    );
};

export default DynamicReportTable;