/**
 * ======================================================================
 * File: src/components/ArchivioPostaModule.js (v1.0)
 * ======================================================================
 * @description
 * Modulo per la gestione degli allegati della posta nel sistema documentale.
 * - Gestione privacy privata con autorizzazioni download
 * - Visualizzazione allegati inviati con statistiche
 * - Download sicuro con controllo accessi
 * - Eliminazione controllata allegati
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    DocumentIcon,
    PaperClipIcon,
    ArrowDownTrayIcon,
    EyeIcon,
    TrashIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
    CheckCircleIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    FolderIcon
} from '@heroicons/react/24/outline';

const ArchivioPostaModule = () => {
    const { user } = useAuth();
    const [allegati, setAllegati] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAllegato, setSelectedAllegato] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [statistiche, setStatistiche] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const [sortBy, setSortBy] = useState('data_invio');
    const [sortOrder, setSortOrder] = useState('desc');
    const [filterStatus, setFilterStatus] = useState('all'); // all, downloaded, not_downloaded
    const [error, setError] = useState(null);

    // Carica allegati
    const fetchAllegati = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/archivio-posta/allegati');

            if (response.data.success) {
                setAllegati(response.data.allegati);
            } else {
                setError('Impossibile caricare gli allegati');
            }
        } catch (err) {
            console.error('Errore caricamento allegati:', err);
            setError('Errore nel caricamento degli allegati');
        } finally {
            setLoading(false);
        }
    }, []);

    // Carica statistiche
    const fetchStatistiche = useCallback(async () => {
        try {
            setLoadingStats(true);
            const response = await api.get('/archivio-posta/statistiche');

            if (response.data.success) {
                setStatistiche(response.data.statistiche);
            }
        } catch (err) {
            console.error('Errore caricamento statistiche:', err);
        } finally {
            setLoadingStats(false);
        }
    }, []);

    useEffect(() => {
        fetchAllegati();
        fetchStatistiche();
    }, [fetchAllegati, fetchStatistiche]);

    // Filtra e ordina allegati
    const allegatiFiltrati = useMemo(() => {
        let filtrati = [...allegati];

        // Filtra per termine di ricerca
        if (searchTerm) {
            filtrati = filtrati.filter(allegato =>
                allegato.nome_file_originale.toLowerCase().includes(searchTerm.toLowerCase()) ||
                allegato.destinatari.toLowerCase().includes(searchTerm.toLowerCase()) ||
                allegato.oggetto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (allegato.mittente && allegato.mittente.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Filtra per stato download
        if (filterStatus === 'downloaded') {
            filtrati = filtrati.filter(allegato => allegato.scaricato);
        } else if (filterStatus === 'not_downloaded') {
            filtrati = filtrati.filter(allegato => !allegato.scaricato);
        }

        // Ordina
        filtrati.sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];

            if (sortBy === 'dimensione_file') {
                aVal = parseFloat(aVal) || 0;
                bVal = parseFloat(bVal) || 0;
            }

            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        return filtrati;
    }, [allegati, searchTerm, sortBy, sortOrder, filterStatus]);

    // Gestione download
    const handleDownload = async (downloadUrl) => {
        try {
            const fullUrl = `${api.defaults.baseURL}${downloadUrl}`;
            window.open(fullUrl, '_blank');

            // Aggiorna lo stato locale dopo il download
            if (selectedAllegato) {
                setSelectedAllegato({
                    ...selectedAllegato,
                    scaricato: true,
                    data_download: new Date().toISOString()
                });
            }

            // Ricarica i dati
            fetchAllegati();
        } catch (error) {
            console.error('Errore download:', error);
            alert('Errore durante il download del file');
        }
    };

    // Gestione eliminazione
    const handleDelete = async () => {
        if (!selectedAllegato) return;

        try {
            const response = await api.delete(`/archivio-posta/allegato/${selectedAllegato.id}`);

            if (response.data.success) {
                setShowDeleteModal(false);
                setShowDetailModal(false);
                setSelectedAllegato(null);
                fetchAllegati();
                fetchStatistiche();
            } else {
                alert('Errore durante l\'eliminazione dell\'allegato');
            }
        } catch (error) {
            console.error('Errore eliminazione:', error);
            alert('Errore durante l\'eliminazione dell\'allegato');
        }
    };

    // Formatta dimensione file
    const formatFileSize = (bytes) => {
        if (!bytes) return 'N/D';
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    // Formatta data
    const formatDate = (dateString) => {
        if (!dateString) return 'N/D';
        return new Date(dateString).toLocaleString('it-IT');
    };

    return (
        <div className="max-w-7xl mx-auto p-3 sm:p-4">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div className="flex items-center">
                        <FolderIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mr-2 sm:mr-3" />
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Archivio Allegati Posta</h1>
                    </div>
                    <button
                        onClick={() => {
                            fetchAllegati();
                            fetchStatistiche();
                        }}
                        className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                        Aggiorna
                    </button>
                </div>

                {/* Statistiche */}
                {statistiche && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                            <div className="text-xl sm:text-2xl font-bold text-blue-600">{statistiche.totali}</div>
                            <div className="text-xs sm:text-sm text-gray-600">Totali</div>
                        </div>
                        <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                            <div className="text-xl sm:text-2xl font-bold text-green-600">{statistiche.scaricati}</div>
                            <div className="text-xs sm:text-sm text-gray-600">Scaricati</div>
                        </div>
                        <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg">
                            <div className="text-xl sm:text-2xl font-bold text-yellow-600">{statistiche.totali - statistiche.scaricati}</div>
                            <div className="text-xs sm:text-sm text-gray-600">Non scaricati</div>
                        </div>
                        <div className="bg-purple-50 p-3 sm:p-4 rounded-lg">
                            <div className="text-xl sm:text-2xl font-bold text-purple-600">{formatFileSize(statistiche.dimensioneTotale)}</div>
                            <div className="text-xs sm:text-sm text-gray-600">Spazio totale</div>
                        </div>
                        <div className="bg-indigo-50 p-3 sm:p-4 rounded-lg">
                            <div className="text-xl sm:text-2xl font-bold text-indigo-600">{statistiche.recenti}</div>
                            <div className="text-xs sm:text-sm text-gray-600">Ultimi 30 gg</div>
                        </div>
                    </div>
                )}

                {/* Filtri e Ricerca */}
                <div className="space-y-3 sm:space-y-0 sm:flex sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cerca per nome file, destinatario, oggetto..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                    </div>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full sm:w-auto px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">Tutti gli stati</option>
                        <option value="downloaded">Scaricati</option>
                        <option value="not_downloaded">Non scaricati</option>
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full sm:w-auto px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="data_invio">Data invio</option>
                        <option value="nome_file_originale">Nome file</option>
                        <option value="dimensione_file">Dimensione</option>
                        <option value="destinatari">Destinatario</option>
                    </select>

                    <button
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="w-full sm:w-auto px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        {sortOrder === 'asc' ? '↑ A-Z' : '↓ Z-A'}
                    </button>
                </div>
            </div>

            {/* Lista Allegati */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {loading ? (
                    <div className="p-6 sm:p-8 text-center">
                        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600">Caricamento allegati...</p>
                    </div>
                ) : error ? (
                    <div className="p-6 sm:p-8 text-center">
                        <ExclamationTriangleIcon className="h-10 w-10 sm:h-12 sm:w-12 text-red-500 mx-auto mb-3 sm:mb-4" />
                        <p className="text-sm sm:text-base text-red-600">{error}</p>
                    </div>
                ) : allegatiFiltrati.length === 0 ? (
                    <div className="p-6 sm:p-8 text-center">
                        <PaperClipIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                        <p className="text-sm sm:text-base text-gray-500">Nessun allegato trovato</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {allegatiFiltrati.map((allegato) => (
                            <div
                                key={allegato.id}
                                className="p-3 sm:p-4 hover:bg-gray-50 cursor-pointer transition-colors active:bg-gray-100"
                                onClick={() => {
                                    setSelectedAllegato(allegato);
                                    setShowDetailModal(true);
                                }}
                            >
                                <div className="flex items-start sm:items-center justify-between gap-3">
                                    <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                                        <PaperClipIcon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 flex-shrink-0 mt-1 sm:mt-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {allegato.nome_file_originale}
                                            </p>
                                            <p className="text-xs sm:text-sm text-gray-500 truncate">
                                                {allegato.oggetto}
                                            </p>
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mt-1 space-y-1 sm:space-y-0">
                                                <span className="text-xs text-gray-500 truncate">
                                                    Dest: {allegato.destinatari}
                                                </span>
                                                <span className="text-xs text-gray-400 hidden sm:inline">•</span>
                                                <span className="text-xs text-gray-500">
                                                    {formatDate(allegato.data_invio)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 flex-shrink-0">
                                        <span className="text-xs sm:text-sm text-gray-500 text-right sm:text-left">
                                            {formatFileSize(allegato.dimensione_file)}
                                        </span>
                                        {allegato.scaricato ? (
                                            <CheckCircleIcon className="h-5 w-5 text-green-500 mx-auto sm:mx-0" title="Scaricato" />
                                        ) : (
                                            <ClockIcon className="h-5 w-5 text-yellow-500 mx-auto sm:mx-0" title="Non scaricato" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Dettagli Allegato */}
            {showDetailModal && selectedAllegato && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
                    <div className="bg-white rounded-t-2xl sm:rounded-lg w-full sm:max-w-2xl sm:max-h-[90vh] overflow-y-auto transform transition-transform">
                        <div className="p-4 sm:p-6">
                            {/* Header mobile-friendly */}
                            <div className="flex items-center justify-between mb-4 sm:mb-6">
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Dettagli Allegato</h2>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="text-gray-400 hover:text-gray-600 p-1"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="space-y-3 sm:space-y-4">
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Nome file</label>
                                    <p className="text-sm text-gray-900 break-all">{selectedAllegato.nome_file_originale}</p>
                                </div>

                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Oggetto email</label>
                                    <p className="text-sm text-gray-900 break-all">{selectedAllegato.oggetto}</p>
                                </div>

                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Destinatario</label>
                                    <p className="text-sm text-gray-900 break-all">{selectedAllegato.destinatari}</p>
                                </div>

                                {selectedAllegato.mittente && (
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Mittente</label>
                                        <p className="text-sm text-gray-900">{selectedAllegato.mittente}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Dimensione</label>
                                        <p className="text-sm text-gray-900">{formatFileSize(selectedAllegato.dimensione_file)}</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Data invio</label>
                                        <p className="text-sm text-gray-900">{formatDate(selectedAllegato.data_invio)}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Stato download</label>
                                        <div className="flex items-center">
                                            {selectedAllegato.scaricato ? (
                                                <>
                                                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                                                    <span className="text-sm text-green-600">Scaricato</span>
                                                </>
                                            ) : (
                                                <>
                                                    <ClockIcon className="h-5 w-5 text-yellow-500 mr-2" />
                                                    <span className="text-sm text-yellow-600">Non scaricato</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {selectedAllegato.data_download && (
                                        <div>
                                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Data download</label>
                                            <p className="text-sm text-gray-900">{formatDate(selectedAllegato.data_download)}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
                                {selectedAllegato.download_url && (
                                    <button
                                        onClick={() => handleDownload(selectedAllegato.download_url)}
                                        className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                                        Download
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(true);
                                        setShowDetailModal(false);
                                    }}
                                    className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    <TrashIcon className="h-5 w-5 mr-2" />
                                    Elimina
                                </button>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                    Chiudi
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Conferma Eliminazione */}
            {showDeleteModal && selectedAllegato && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
                    <div className="bg-white rounded-t-2xl sm:rounded-lg w-full sm:max-w-md p-4 sm:p-6">
                        <div className="flex items-center mb-4">
                            <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-3" />
                            <h2 className="text-lg font-bold text-gray-900">Conferma Eliminazione</h2>
                        </div>
                        <p className="text-gray-600 mb-6 text-sm sm:text-base">
                            Sei sicuro di voler eliminare l'allegato "{selectedAllegato.nome_file_originale}"?
                            Questa azione non può essere annullata.
                        </p>
                        <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Annulla
                            </button>
                            <button
                                onClick={handleDelete}
                                className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Elimina
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArchivioPostaModule;