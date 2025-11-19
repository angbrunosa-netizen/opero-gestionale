/**
 * @file opero-frontend/src/components/archivio/ArchivioDocumentale.js
 * @description Componente avanzato per la gestione centralizzata dei file.
 * - v1.6: Aggiunto filtro per "Tipo Entità" (es. Catalogo, Beni Strumentali).
 * - Mappatura codici entità a etichette leggibili.
 * @version 1.6.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

// Icone da lucide-react
import {
    Search,
    Download,
    Eye,
    List,
    Grid,
    FileImage,
    FileText,
    FileArchive,
    File,
    X,
    UploadCloud,
    Trash2,
    RefreshCw,
    Lock,
    Globe,
    Link as LinkIcon,
    AlertCircle,
    Filter // Icona Filtro
} from 'lucide-react';

// Mappatura Codici -> Etichette Leggibili
const ENTITY_LABELS = {
    'ct_catalogo': 'Catalogo Prodotti',
    'an_anagrafica': 'Anagrafica (Clienti/Fornitori)',
    'BENE_STRUMENTALE': 'Beni Strumentali',
    'op_offerte': 'Offerte',
    'default': 'Altro'
};

const getEntityLabel = (code) => ENTITY_LABELS[code] || code || 'Altro';

// Componente per l'anteprima dell'immagine (Invariato)
const ImagePreviewModal = ({ isOpen, onClose, imageSrc, fileName }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] flex flex-col relative">
                 <button type="button" onClick={onClose} className="absolute top-2 right-2 p-2 bg-white rounded-full text-gray-600 hover:text-gray-900 shadow-md z-10"><X className="w-6 h-6" /></button>
                <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-100 rounded-lg">
                    <img src={imageSrc} alt={fileName} className="max-w-full max-h-[80vh] object-contain" />
                </div>
                <div className="p-4 border-t text-center"><p className="font-medium text-gray-800">{fileName}</p></div>
            </div>
        </div>
    );
};

const ArchivioDocumentale = () => {
    const { hasPermission } = useAuth(); 
    
    const [files, setFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPrivacy, setFilterPrivacy] = useState('all');
    
    // (NUOVO v1.6) Stato per il filtro entità
    const [filterEntity, setFilterEntity] = useState('all'); 

    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [previewFileName, setPreviewFileName] = useState('');

    // Caricamento dati
    const fetchFiles = useCallback(async () => {
        if (!hasPermission('DM_FILE_VIEW')) {
            setError("Non hai i permessi per visualizzare l'archivio.");
            setIsLoading(false);
            return;
        }
        
        setIsLoading(true);
        setError(null);

        try {
            // Chiamata corretta senza doppio /api
            const response = await api.get('/archivio/all-files');
            if (Array.isArray(response.data)) {
                setFiles(response.data);
            } else {
                setError("Formato dati non valido dal server.");
                setFiles([]);
            }
        } catch (err) {
            console.error("ArchivioDocumentale: Errore API:", err);
            setError(err.response?.data?.error || `Errore: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [hasPermission]);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);

    // (NUOVO v1.6) Calcola dinamicamente i tipi di entità presenti
    const availableEntityTypes = useMemo(() => {
        const types = new Set();
        files.forEach(file => {
            if (file.entita_tipi) {
                // Il backend manda una stringa separata da virgole (es. "ct_catalogo,an_clienti")
                file.entita_tipi.split(',').forEach(t => types.add(t));
            }
        });
        return Array.from(types);
    }, [files]);

    const handleDelete = async (file) => {
        if (!window.confirm(`Sei sicuro di voler eliminare definitivamente il file "${file.file_name_originale}"?`)) return;
        alert("Funzione di eliminazione globale in fase di sviluppo.");
    };

    const openPreview = (file) => {
        if (file.mime_type?.startsWith('image/') && file.previewUrl) {
            setPreviewImage(file.previewUrl);
            setPreviewFileName(file.file_name_originale);
            setIsPreviewModalOpen(true);
        } else if (file.previewUrl) {
            window.open(file.previewUrl, '_blank');
        } else {
            alert("Anteprima non disponibile per questo file.");
        }
    };

    const closePreviewModal = () => { setIsPreviewModalOpen(false); setPreviewImage(null); setPreviewFileName(''); };

    const getFileIcon = (mimeType) => {
        if (mimeType?.startsWith('image/')) return <FileImage className="w-6 h-6 text-purple-500" />;
        if (mimeType === 'application/pdf') return <FileText className="w-6 h-6 text-red-500" />;
        if (mimeType?.includes('zip') || mimeType?.includes('rar')) return <FileArchive className="w-6 h-6 text-yellow-500" />;
        return <File className="w-6 h-6 text-gray-400" />;
    };

    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    // Logica di filtro aggiornata (v1.6)
    const filteredFiles = useMemo(() => {
        return files.filter(file => {
            // 1. Ricerca testo
            const matchesSearch = file.file_name_originale.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  (file.links_descrizione && file.links_descrizione.toLowerCase().includes(searchTerm.toLowerCase()));
            
            // 2. Filtro Privacy
            const matchesPrivacy = filterPrivacy === 'all' || file.privacy === filterPrivacy;

            // 3. (NUOVO v1.6) Filtro Entità
            const matchesEntity = filterEntity === 'all' || 
                                  (file.entita_tipi && file.entita_tipi.split(',').includes(filterEntity));

            return matchesSearch && matchesPrivacy && matchesEntity;
        });
    }, [files, searchTerm, filterPrivacy, filterEntity]);

    return (
        <div className="p-6 bg-gray-50 h-full flex flex-col">
            
            {/* Header e Filtri */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Archivio Documentale</h1>
                    <p className="text-sm text-gray-500">Gestione centralizzata di tutti i file e allegati</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    
                    {/* (NUOVO v1.6) Filtro Entità Dropdown */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                            <Filter className="h-4 w-4 text-gray-400" />
                        </div>
                        <select
                            value={filterEntity}
                            onChange={(e) => setFilterEntity(e.target.value)}
                            className="pl-8 pr-8 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer hover:bg-gray-50"
                        >
                            <option value="all">Tutte le Entità</option>
                            {availableEntityTypes.map(type => (
                                <option key={type} value={type}>
                                    {getEntityLabel(type)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Filtro Privacy */}
                    <div className="flex bg-white rounded-lg shadow-sm border p-1">
                        <button onClick={() => setFilterPrivacy('all')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${filterPrivacy === 'all' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Tutti</button>
                        <button onClick={() => setFilterPrivacy('public')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${filterPrivacy === 'public' ? 'bg-green-50 text-green-700' : 'text-gray-500 hover:text-gray-700'}`}><Globe className="w-3 h-3" /> Pubblici</button>
                        <button onClick={() => setFilterPrivacy('private')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${filterPrivacy === 'private' ? 'bg-amber-50 text-amber-700' : 'text-gray-500 hover:text-gray-700'}`}><Lock className="w-3 h-3" /> Privati</button>
                    </div>

                    {/* Barra Ricerca */}
                    <div className="relative flex-1 md:w-48">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Cerca..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Vista Lista/Griglia */}
                    <div className="flex bg-white rounded-lg shadow-sm border">
                        <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600'}`}><List className="w-5 h-5" /></button>
                        <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600'}`}><Grid className="w-5 h-5" /></button>
                    </div>

                    <button onClick={fetchFiles} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Ricarica">
                        <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Contenuto con Gestione Stati */}
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : error ? (
                <div className="flex-1 flex flex-col items-center justify-center text-red-500 bg-red-50 rounded-lg border border-red-200 p-8 m-4">
                    <AlertCircle className="w-12 h-12 mb-4" />
                    <p className="text-lg font-medium">Errore nel caricamento</p>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                    <button onClick={fetchFiles} className="mt-4 px-4 py-2 bg-white border border-red-300 text-red-700 rounded-md hover:bg-red-50 shadow-sm">Riprova</button>
                </div>
            ) : filteredFiles.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                    <UploadCloud className="w-16 h-16 mb-4 opacity-20" />
                    <p>Nessun file trovato con questi filtri</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden flex-1">
                    {viewMode === 'list' ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Tipo</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome File</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Privacy</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilizzato In</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dimensione</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredFiles.map((file) => (
                                        <tr key={file.id_file} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">{getFileIcon(file.mime_type)}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <span className="text-sm font-medium text-gray-900 truncate max-w-xs" title={file.file_name_originale}>{file.file_name_originale}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {file.privacy === 'public' ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800" title="Pubblico"><Globe className="w-3 h-3 mr-1" /> Public</span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800" title="Privato"><Lock className="w-3 h-3 mr-1" /> Private</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {file.links_descrizione ? (
                                                    <div className="flex items-start gap-1 text-sm text-gray-600">
                                                        <LinkIcon className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                                                        <span className="line-clamp-2" title={file.links_descrizione}>{file.links_descrizione}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">Nessun collegamento</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatBytes(file.file_size_bytes)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(file.created_at).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => openPreview(file)} className="p-1 text-gray-400 hover:text-blue-600" title="Anteprima"><Eye className="w-5 h-5" /></button>
                                                    <a href={file.previewUrl} download={file.file_name_originale} className="p-1 text-gray-400 hover:text-green-600" title="Download"><Download className="w-5 h-5" /></a>
                                                    {hasPermission('DM_FILE_DELETE') && <button onClick={() => handleDelete(file)} className="p-1 text-gray-400 hover:text-red-600" title="Elimina"><Trash2 className="w-5 h-5" /></button>}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {filteredFiles.map((file) => (
                                <div key={file.id_file} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        {getFileIcon(file.mime_type)}
                                        {file.privacy === 'public' ? <Globe className="w-4 h-4 text-green-500" /> : <Lock className="w-4 h-4 text-amber-500" />}
                                    </div>
                                    <div className="flex-1 mb-2">
                                        <h3 className="text-sm font-medium text-gray-900 truncate" title={file.file_name_originale}>{file.file_name_originale}</h3>
                                        <p className="text-xs text-gray-500 mt-1">{formatBytes(file.file_size_bytes)}</p>
                                    </div>
                                    {file.mime_type?.startsWith('image/') && (
                                        <div className="h-24 mb-3 bg-gray-100 rounded overflow-hidden flex items-center justify-center cursor-pointer" onClick={() => openPreview(file)}>
                                            <img src={file.previewUrl} alt="" className="object-cover h-full w-full opacity-80 hover:opacity-100" />
                                        </div>
                                    )}
                                    <div className="mt-auto pt-3 border-t flex justify-between items-center">
                                        <span className="text-xs text-gray-400">{new Date(file.created_at).toLocaleDateString()}</span>
                                        <div className="flex gap-1">
                                            <button onClick={() => openPreview(file)} className="p-1 text-gray-400 hover:text-blue-600"><Eye className="w-4 h-4" /></button>
                                            <a href={file.previewUrl} download className="p-1 text-gray-400 hover:text-green-600"><Download className="w-4 h-4" /></a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            
            <ImagePreviewModal isOpen={isPreviewModalOpen} onClose={closePreviewModal} imageSrc={previewImage} fileName={previewFileName} />
        </div>
    );
};

export default ArchivioDocumentale;