// #####################################################################
// # Componente per la Visualizzazione del Bilancio di Verifica (Responsive)
// # File: opero-gestionale/opero-frontend/src/components/cont-smart/reports/BilancioVerificaView.js
// #####################################################################

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { api } from '../../../services/api';
import DynamicReportTable from '../../../shared/DynamicReportTable';
import { MagnifyingGlassIcon, ChevronDownIcon, CalendarIcon } from '@heroicons/react/24/outline';

const getFormattedDate = (date) => date.toISOString().split('T')[0];
const formatCurrency = (value) => {
    const num = parseFloat(value);
    if (isNaN(num) || num === 0) return '';
    return num.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Componente Card per visualizzazione mobile delle righe del bilancio
const BilancioCard = ({ item, index }) => {
    const saldo = item.totale_dare - item.totale_avere;
    const saldoDare = saldo > 0 ? saldo : 0;
    const saldoAvere = saldo < 0 ? -saldo : 0;
    
    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-3">
            <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{item.descrizione_conto}</h3>
                    <p className="text-sm text-gray-500">{item.codice_conto}</p>
                </div>
                <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        saldo > 0 ? 'bg-blue-100 text-blue-800' : 
                        saldo < 0 ? 'bg-red-100 text-red-800' : 
                        'bg-gray-100 text-gray-800'
                    }`}>
                        {saldo > 0 ? 'Saldo Dare' : saldo < 0 ? 'Saldo Avere' : 'In Pareggio'}
                    </span>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="text-right">
                    <p className="text-sm text-gray-500">Totale Dare</p>
                    <p className="font-semibold">{formatCurrency(item.totale_dare)}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Totale Avere</p>
                    <p className="font-semibold">{formatCurrency(item.totale_avere)}</p>
                </div>
            </div>
            
            {(saldoDare > 0 || saldoAvere > 0) && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4">
                        {saldoDare > 0 && (
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Saldo Dare</p>
                                <p className="font-bold text-blue-600">{formatCurrency(saldoDare)}</p>
                            </div>
                        )}
                        {saldoAvere > 0 && (
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Saldo Avere</p>
                                <p className="font-bold text-red-600">{formatCurrency(saldoAvere)}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const BilancioVerificaView = () => {
    const [filters, setFilters] = useState({ date: getFormattedDate(new Date()) });
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); // Per la visualizzazione desktop
    const [mobileItemsPerPage] = useState(5); // Per la visualizzazione mobile
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    // Hook per rilevare le dimensioni della finestra
    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Determina se è mobile basandosi sulla larghezza della finestra
    const isMobile = windowSize.width < 768;

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError('');
        setData([]);
        try {
            const response = await api.get(`/contsmart/reports/bilancio-verifica`, { params: filters });
            if (response.data.success) {
                // Assicurati che tutti i dati abbiano i campi necessari
                const processedData = (response.data.data || []).map(item => ({
                    ...item,
                    codice_conto: item.codice_conto || '',
                    descrizione_conto: item.descrizione_conto || '',
                    totale_dare: item.totale_dare || 0,
                    totale_avere: item.totale_avere || 0
                }));
                setData(processedData);
                setFilteredData(processedData);
            } else {
                throw new Error(response.data.message || 'Errore');
            }
        } catch (err) {
            console.error(err);
            setError(err.message || 'Si è verificato un errore.');
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    // Effetto per filtrare i dati in base al termine di ricerca
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredData(data);
        } else {
            const filtered = data.filter(item => {
                // Verifica che i campi esistano prima di chiamare toLowerCase()
                const codiceConto = item.codice_conto || '';
                const descrizioneConto = item.descrizione_conto || '';
                
                const searchTermLower = searchTerm.toLowerCase();
                return codiceConto.toLowerCase().includes(searchTermLower) ||
                       descrizioneConto.toLowerCase().includes(searchTermLower);
            });
            setFilteredData(filtered);
        }
        // Resetta la pagina corrente quando cambia il termine di ricerca
        setCurrentPage(1);
    }, [searchTerm, data]);

    // Calcoliamo i totali e i saldi con useMemo per efficienza
    const { processedData, totals } = useMemo(() => {
        let totalDare = 0;
        let totalAvere = 0;
        const processed = filteredData.map(item => {
            totalDare += parseFloat(item.totale_dare);
            totalAvere += parseFloat(item.totale_avere);
            const saldo = item.totale_dare - item.totale_avere;
            return {
                ...item,
                saldo_dare: saldo > 0 ? saldo : 0,
                saldo_avere: saldo < 0 ? -saldo : 0,
            };
        });
        return { 
            processedData: processed, 
            totals: { totalDare, totalAvere }
        };
    }, [filteredData]);

    // Calcolo degli elementi da visualizzare in base alla paginazione
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = processedData.slice(indexOfFirstItem, indexOfLastItem);
    
    // Calcolo per la visualizzazione mobile
    const mobileIndexOfLastItem = currentPage * mobileItemsPerPage;
    const mobileIndexOfFirstItem = mobileIndexOfLastItem - mobileItemsPerPage;
    const mobileCurrentItems = processedData.slice(mobileIndexOfFirstItem, mobileIndexOfLastItem);
    
    // Funzione per cambiare pagina
    const paginate = pageNumber => setCurrentPage(pageNumber);
    
    // Calcolo del numero totale di pagine
    const totalPages = Math.ceil(processedData.length / itemsPerPage);
    const mobileTotalPages = Math.ceil(processedData.length / mobileItemsPerPage);

    // Funzione per gestire la ricerca
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Funzione per resettare la ricerca
    const handleClearSearch = () => {
        setSearchTerm('');
    };

    const columns = [
        { key: 'codice_conto', label: 'Conto', sortable: true },
        { key: 'descrizione_conto', label: 'Descrizione', sortable: true },
        { key: 'totale_dare', label: 'Totale Dare', sortable: true, render: item => <span className="text-right block">{formatCurrency(item.totale_dare)}</span> },
        { key: 'totale_avere', label: 'Totale Avere', sortable: true, render: item => <span className="text-right block">{formatCurrency(item.totale_avere)}</span> },
        { key: 'saldo_dare', label: 'Saldo Dare', sortable: true, render: item => <span className="font-semibold text-right block">{formatCurrency(item.saldo_dare)}</span> },
        { key: 'saldo_avere', label: 'Saldo Avere', sortable: true, render: item => <span className="font-semibold text-right block">{formatCurrency(item.saldo_avere)}</span> },
    ];

    return (
        <div className="p-2 md:p-4 bg-gray-100 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800">Bilancio di Verifica</h2>
                </div>

                {/* Filtri */}
                <div className="bg-white p-4 rounded-lg shadow mb-4">
                    <h3 className="font-semibold text-slate-800 mb-2">Filtri Bilancio</h3>
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1">
                            <label htmlFor="date" className="block text-sm font-medium text-slate-600">Bilancio alla data</label>
                            <div className="relative mt-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input 
                                    type="date" 
                                    name="date" 
                                    id="date" 
                                    value={filters.date} 
                                    onChange={handleFilterChange} 
                                    className="pl-10 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" 
                                />
                            </div>
                        </div>
                        <button 
                            onClick={fetchData} 
                            disabled={isLoading} 
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Calcolo...
                                </>
                            ) : (
                                <>
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h8a1 1 0 100-2H7z" clipRule="evenodd" />
                                    </svg>
                                    Elabora Bilancio
                                </>
                            )}
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>

                {/* Barra di ricerca */}
                {processedData.length > 0 && (
                    <div className="bg-white p-4 rounded-lg shadow mb-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Cerca per codice conto o descrizione..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                            {searchTerm && (
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <button
                                        type="button"
                                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                        onClick={handleClearSearch}
                                    >
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>
                        {searchTerm && (
                            <div className="mt-2 text-sm text-gray-600">
                                Trovati {filteredData.length} conti per "{searchTerm}"
                            </div>
                        )}
                    </div>
                )}

                {/* Visualizzazione condizionale: tabella per desktop, card per mobile */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    {isLoading ? (
                        <div className="flex justify-center items-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2">Caricamento dati...</span>
                        </div>
                    ) : processedData.length > 0 ? (
                        <>
                            {/* VISUALIZZAZIONE DESKTOP: TABELLA */}
                            {!isMobile && (
                                <DynamicReportTable 
                                    data={currentItems} 
                                    columns={columns} 
                                    isLoading={isLoading} 
                                    title="Bilancio di Verifica" 
                                />
                            )}
                            
                            {/* VISUALIZZAZIONE MOBILE: CARD */}
                            {isMobile && (
                                <div className="p-4">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Dettagli Bilancio</h3>
                                    <div className="space-y-3">
                                        {mobileCurrentItems.map((item, index) => (
                                            <BilancioCard key={item.id || index} item={item} index={index} />
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* Totali di Controllo */}
                            <div className="p-4 bg-slate-100 border-t border-slate-200">
                                <div className="text-right">
                                    <h4 className="text-lg font-bold text-slate-800">Totali di Controllo</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 mt-2">
                                        <div>
                                            <p className="text-slate-600">Totale Dare</p>
                                            <p className="font-mono font-semibold">{formatCurrency(totals.totalDare)}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-600">Totale Avere</p>
                                            <p className="font-mono font-semibold">{formatCurrency(totals.totalAvere)}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-600">Quadratura</p>
                                            <p className={`font-mono font-bold ${
                                                Math.abs(totals.totalDare - totals.totalAvere) < 0.01 ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                {formatCurrency(totals.totalDare - totals.totalAvere)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Paginazione per DESKTOP */}
                            {!isMobile && totalPages > 1 && (
                                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-slate-200">
                                    <div className="flex-1 flex justify-between sm:hidden">
                                        <button 
                                            onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Precedente
                                        </button>
                                        <button 
                                            onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Successivo
                                        </button>
                                    </div>
                                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm text-slate-700">
                                                Mostrando da <span className="font-medium">{indexOfFirstItem + 1}</span> a{' '}
                                                <span className="font-medium">{Math.min(indexOfLastItem, processedData.length)}</span> di{' '}
                                                <span className="font-medium">{processedData.length}</span> risultati
                                                {searchTerm && ` per "${searchTerm}"`}
                                            </p>
                                        </div>
                                        <div>
                                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                                <button 
                                                    onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                                                    disabled={currentPage === 1}
                                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <span className="sr-only">Previous</span>
                                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                                
                                                {/* Numeri di pagina */}
                                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                                                    <button
                                                        key={number}
                                                        onClick={() => paginate(number)}
                                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                            currentPage === number
                                                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                                : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        {number}
                                                    </button>
                                                ))}
                                                
                                                <button 
                                                    onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                                                    disabled={currentPage === totalPages}
                                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <span className="sr-only">Next</span>
                                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </nav>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Paginazione per MOBILE */}
                            {isMobile && mobileTotalPages > 1 && (
                                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-slate-200">
                                    <div className="flex-1 flex justify-between">
                                        <button 
                                            onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Precedente
                                        </button>
                                        <span className="text-sm text-slate-700">
                                            Pagina {currentPage} di {mobileTotalPages}
                                        </span>
                                        <button 
                                            onClick={() => currentPage < mobileTotalPages && paginate(currentPage + 1)}
                                            disabled={currentPage === mobileTotalPages}
                                            className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Successivo
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v1a1 1 0 001 1h4a1 1 0 001-1v-1m3-2V8a2 2 0 00-2-2H8a2 2 0 00-2 2v8m3-2h6m-6-4h.01M9 3h6m-6 4h.01M12 7h.01M15 17h.01M12 14h.01" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                                {searchTerm ? `Nessun conto trovato per "${searchTerm}"` : 'Nessun dato disponibile'}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {searchTerm ? 'Prova a modificare i criteri di ricerca' : 'Seleziona una data e clicca su "Elabora Bilancio" per visualizzare i dati.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BilancioVerificaView;