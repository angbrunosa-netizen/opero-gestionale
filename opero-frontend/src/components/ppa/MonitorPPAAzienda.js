/**
 * ======================================================================
 * File: src/components/ppa/MonitorPPAAzienda.js (v3.0 - Responsive Corretto)
 * ======================================================================
 * @description
 * Versione responsive del componente di monitoraggio procedure aziendali.
 * Utilizza una visualizzazione a tabella su desktop e a card su mobile.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { EyeIcon, ChatBubbleBottomCenterTextIcon, PaperAirplaneIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';

// Importiamo i componenti modali che verranno utilizzati
import TeamBacheca from './TeamBacheca'; 
import ReportComposerModal from './ReportComposerModal';

// Componente Modale per la Bacheca (wrapper responsive)
const BachecaModal = ({ isOpen, onClose, istanza }) => {
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

    if (!isOpen || !istanza) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className={`bg-white rounded-lg shadow-xl w-full ${isMobile ? 'max-w-full' : 'max-w-lg'} flex flex-col max-h-[90vh]`}>
                <header className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-bold">Bacheca Team: {istanza.NomeProcedura}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">X</button>
                </header>
                <main className="p-4 overflow-y-auto flex-grow">
                    {/* Passiamo il TeamID al componente bacheca */}
                    <TeamBacheca teamId={istanza.TeamID} />
                </main>
            </div>
        </div>
    );
};

const MonitorPPAAzienda = () => {
    const [istanze, setIstanze] = useState([]);
    const [filteredIstanze, setFilteredIstanze] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); // Per la visualizzazione desktop
    const [mobileItemsPerPage] = useState(6); // Per la visualizzazione mobile
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    // Stati per la gestione dei modali
    const [selectedIstanza, setSelectedIstanza] = useState(null);
    const [isBachecaOpen, setIsBachecaOpen] = useState(false);
    const [isReportComposerOpen, setIsReportComposerOpen] = useState(false);

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

    const fetchIstanze = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/ppa/istanze');
            // Assicurati che tutte le istanze abbiano i campi necessari
            const processedIstanze = (response.data.data || []).map(istanza => ({
                ...istanza,
                NomeProcedura: istanza.NomeProcedura || '',
                TargetEntityName: istanza.TargetEntityName || '',
                Stato: istanza.Stato || '',
                DataPrevistaFine: istanza.DataPrevistaFine || new Date(),
                TeamID: istanza.TeamID || null
            }));
            setIstanze(processedIstanze);
            setFilteredIstanze(processedIstanze);
        } catch (err) {
            setError('Impossibile caricare i dati di monitoraggio.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchIstanze();
    }, [fetchIstanze]);

    // Effetto per filtrare le istanze in base al termine di ricerca
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredIstanze(istanze);
        } else {
            const filtered = istanze.filter(istanza => {
                // Verifica che i campi esistano prima di chiamare toLowerCase()
                const nomeProcedura = istanza.NomeProcedura || '';
                const targetEntityName = istanza.TargetEntityName || '';
                const stato = istanza.Stato || '';
                
                const searchTermLower = searchTerm.toLowerCase();
                return nomeProcedura.toLowerCase().includes(searchTermLower) ||
                       targetEntityName.toLowerCase().includes(searchTermLower) ||
                       stato.toLowerCase().includes(searchTermLower);
            });
            setFilteredIstanze(filtered);
        }
        // Resetta la pagina corrente quando cambia il termine di ricerca
        setCurrentPage(1);
    }, [searchTerm, istanze]);

    // Calcolo degli elementi da visualizzare in base alla paginazione
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredIstanze.slice(indexOfFirstItem, indexOfLastItem);
    
    // Calcolo per la visualizzazione mobile
    const mobileIndexOfLastItem = currentPage * mobileItemsPerPage;
    const mobileIndexOfFirstItem = mobileIndexOfLastItem - mobileItemsPerPage;
    const mobileCurrentItems = filteredIstanze.slice(mobileIndexOfFirstItem, mobileIndexOfLastItem);
    
    // Funzione per cambiare pagina
    const paginate = pageNumber => setCurrentPage(pageNumber);
    
    // Calcolo del numero totale di pagine
    const totalPages = Math.ceil(filteredIstanze.length / itemsPerPage);
    const mobileTotalPages = Math.ceil(filteredIstanze.length / mobileItemsPerPage);

    // Gestori per l'apertura dei modali
    const handleOpenBacheca = (istanza) => {
        setSelectedIstanza(istanza);
        setIsBachecaOpen(true);
    };

    const handleOpenReportComposer = (istanza) => {
        setSelectedIstanza(istanza);
        setIsReportComposerOpen(true);
    };

    // Funzione per gestire la ricerca
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Funzione per resettare la ricerca
    const handleClearSearch = () => {
        setSearchTerm('');
    };

    // Funzione per formattare la data
    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('it-IT');
        } catch (error) {
            return 'N/D';
        }
    };

    // Funzione per determinare il colore dello stato
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completato':
                return 'bg-green-100 text-green-800';
            case 'in corso':
                return 'bg-blue-100 text-blue-800';
            case 'in ritardo':
                return 'bg-red-100 text-red-800';
            case 'da iniziare':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (isLoading) return (
        <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Caricamento dati di monitoraggio...</span>
        </div>
    );
    
    if (error) return (
        <div className="text-center p-8 text-red-600 bg-red-50 rounded-lg">
            {error}
        </div>
    );

    return (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                <h2 className="text-xl font-semibold text-gray-800">Monitoraggio Procedure Aziendali</h2>
            </div>

            {/* Barra di ricerca */}
            <div className="bg-white p-4 rounded-lg shadow mb-4">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Cerca per procedura, target o stato..."
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
                        Trovate {filteredIstanze.length} procedure per "{searchTerm}"
                    </div>
                )}
            </div>

            {/* Visualizzazione condizionale: tabella per desktop, card per mobile */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                {filteredIstanze.length > 0 ? (
                    <>
                        {/* VISUALIZZAZIONE DESKTOP: TABELLA */}
                        {!isMobile && (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Procedura</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stato</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scadenza</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {currentItems.map(istanza => (
                                            <tr key={istanza.id_istanza} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{istanza.NomeProcedura || 'N/D'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{istanza.TargetEntityName || 'N/D'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(istanza.Stato)}`}>
                                                        {istanza.Stato || 'N/D'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(istanza.DataPrevistaFine)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                                                    <div className="flex justify-center items-center gap-2">
                                                        <Link to={`/ppa/task/${istanza.id_istanza}`} title="Visualizza Dettagli" className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100">
                                                            <EyeIcon className="h-5 w-5" />
                                                        </Link>
                                                        
                                                        {/* Mostra il pulsante solo se c'è un team */}
                                                        {istanza.TeamID && (
                                                            <button onClick={() => handleOpenBacheca(istanza)} title="Apri Bacheca Team" className="p-2 text-gray-500 hover:text-green-600 rounded-full hover:bg-gray-100">
                                                                <ChatBubbleBottomCenterTextIcon className="h-5 w-5" />
                                                            </button>
                                                        )}

                                                        <button onClick={() => handleOpenReportComposer(istanza)} title="Invia Report al Target" className="p-2 text-gray-500 hover:text-teal-600 rounded-full hover:bg-gray-100">
                                                            <PaperAirplaneIcon className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        
                        {/* VISUALIZZAZIONE MOBILE: CARD */}
                        {isMobile && (
                            <div className="grid grid-cols-1 gap-4 p-4">
                                {mobileCurrentItems.map(istanza => (
                                    <div key={istanza.id_istanza} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900">{istanza.NomeProcedura || 'Procedura senza nome'}</h3>
                                                <p className="text-sm text-gray-500 mt-1">Target: {istanza.TargetEntityName || 'N/D'}</p>
                                            </div>
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(istanza.Stato)}`}>
                                                {istanza.Stato || 'N/D'}
                                            </span>
                                        </div>
                                        
                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span>Scadenza: {formatDate(istanza.DataPrevistaFine)}</span>
                                            </div>
                                            {istanza.TeamID && (
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                    <span>Team ID: {istanza.TeamID}</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex justify-end space-x-2">
                                            <Link 
                                                to={`/ppa/task/${istanza.id_istanza}`} 
                                                title="Visualizza Dettagli" 
                                                className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100"
                                            >
                                                <EyeIcon className="h-5 w-5" />
                                            </Link>
                                            
                                            {/* Mostra il pulsante solo se c'è un team */}
                                            {istanza.TeamID && (
                                                <button 
                                                    onClick={() => handleOpenBacheca(istanza)} 
                                                    title="Apri Bacheca Team" 
                                                    className="p-2 text-gray-500 hover:text-green-600 rounded-full hover:bg-gray-100"
                                                >
                                                    <ChatBubbleBottomCenterTextIcon className="h-5 w-5" />
                                                </button>
                                            )}

                                            <button 
                                                onClick={() => handleOpenReportComposer(istanza)} 
                                                title="Invia Report al Target" 
                                                className="p-2 text-gray-500 hover:text-teal-600 rounded-full hover:bg-gray-100"
                                            >
                                                <PaperAirplaneIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {/* Paginazione per DESKTOP */}
                        {!isMobile && totalPages > 1 && (
                            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    <button 
                                        onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Precedente
                                    </button>
                                    <button 
                                        onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Successivo
                                    </button>
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Mostrando da <span className="font-medium">{indexOfFirstItem + 1}</span> a{' '}
                                            <span className="font-medium">{Math.min(indexOfLastItem, filteredIstanze.length)}</span> di{' '}
                                            <span className="font-medium">{filteredIstanze.length}</span> risultati
                                            {searchTerm && ` per "${searchTerm}"`}
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                            <button 
                                                onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {number}
                                                </button>
                                            ))}
                                            
                                            <button 
                                                onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                                <div className="flex-1 flex justify-between">
                                    <button 
                                        onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Precedente
                                    </button>
                                    <span className="text-sm text-gray-700">
                                        Pagina {currentPage} di {mobileTotalPages}
                                    </span>
                                    <button 
                                        onClick={() => currentPage < mobileTotalPages && paginate(currentPage + 1)}
                                        disabled={currentPage === mobileTotalPages}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                            {searchTerm ? `Nessuna procedura trovata per "${searchTerm}"` : 'Nessuna procedura trovata'}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm ? 'Prova a modificare i criteri di ricerca' : 'Non ci sono procedure da monitorare al momento.'}
                        </p>
                    </div>
                )}
            </div>

            {/* Inclusione dei modali (vengono renderizzati solo se aperti) */}
            <BachecaModal 
                isOpen={isBachecaOpen}
                onClose={() => setIsBachecaOpen(false)}
                istanza={selectedIstanza}
            />
            {selectedIstanza && (
                <ReportComposerModal
                    isOpen={isReportComposerOpen}
                    onClose={() => setIsReportComposerOpen(false)}
                    istanza={selectedIstanza}
                />
            )}
        </div>
    );
};

export default MonitorPPAAzienda;