/**
 * @file opero-frontend/src/components/archivio/ArchivioDocumentale.js
 * @description Componente avanzato per la gestione centralizzata dei file.
 * - v1.14: Altezza fissa per le immagini nella vista mobile
 * - v1.13: Fix scrollbar verticale nella vista desktop griglia
 * - v1.12: Le immagini ora si adattano interamente al riquadro (object-contain)
 * - v1.11: Layout compatto per info e pulsanti, immagini più grandi
 * - v1.10: Aggiunto Lazy Loading per le immagini per migliorare le prestazioni
 * - v1.9: Visualizzazione quadrata per card mobile e immagini più grandi su desktop
 * - v1.8: Ottimizzazione layout card mobile per migliore usabilità
 * - v1.7: Risolto problema nomi file "blob" e ottimizzata vista mobile
 * - v1.6: Aggiunto filtro per "Tipo Entità" (es. Catalogo, Beni Strumentali).
 * - Mappatura codici entità a etichette leggibili.
 * @version 1.14.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import ArchivioPostaModule from '../ArchivioPostaModule';

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
    Filter,
    ChevronDown,
    Menu,
    Mail
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

// Componente per l'anteprima dell'immagine
const ImagePreviewModal = ({ isOpen, onClose, imageSrc, fileName }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] flex flex-col relative">
                 <button type="button" onClick={onClose} className="absolute top-2 right-2 p-2 bg-white rounded-full text-gray-600 hover:text-gray-900 shadow-md z-10"><X className="w-6 h-6" /></button>
                <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-100 rounded-lg">
                    <img src={imageSrc} alt={fileName} className="max-w-full max-h-[80vh] object-contain" loading="lazy" />
                </div>
                <div className="p-4 border-t text-center"><p className="font-medium text-gray-800">{fileName}</p></div>
            </div>
        </div>
    );
};

const ArchivioDocumentale = () => {
    const { hasPermission } = useAuth();

    // Stati per la navigazione tra sezioni
    const [activeSection, setActiveSection] = useState('documenti'); // 'documenti' o 'posta'

    const [files, setFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('grid'); // Impostato di default a grid
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPrivacy, setFilterPrivacy] = useState('all');
    const [filterEntity, setFilterEntity] = useState('all');

    // Stati per la gestione della vista mobile
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [previewFileName, setPreviewFileName] = useState('');

    // Funzione per gestire i nomi dei file (FIX per il problema "blob")
    const getDisplayName = (file) => {
        if (file.file_name_originale && file.file_name_originale !== 'blob') {
            return file.file_name_originale;
        }
        
        // Se il nome è blob o mancante, genera un nome basato sull'ID e data
        const date = new Date(file.created_at).toLocaleDateString('it-IT').replace(/\//g, '');
        return `file_${file.id_file}_${date}`;
    };

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

    // Calcola dinamicamente i tipi di entità presenti
    const availableEntityTypes = useMemo(() => {
        const types = new Set();
        files.forEach(file => {
            if (file.entita_tipi) {
                file.entita_tipi.split(',').forEach(t => types.add(t));
            }
        });
        return Array.from(types);
    }, [files]);

    // Detect screen size changes
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleDelete = async (file) => {
        if (!window.confirm(`Sei sicuro di voler eliminare definitivamente il file "${getDisplayName(file)}"?`)) return;
        alert("Funzione di eliminazione globale in fase di sviluppo.");
    };

    const openPreview = (file) => {
        if (file.mime_type?.startsWith('image/') && file.previewUrl) {
            setPreviewImage(file.previewUrl);
            setPreviewFileName(getDisplayName(file));
            setIsPreviewModalOpen(true);
        } else if (file.previewUrl) {
            window.open(file.previewUrl, '_blank');
        } else {
            alert("Anteprima non disponibile per questo file.");
        }
    };

    const closePreviewModal = () => { 
        setIsPreviewModalOpen(false); 
        setPreviewImage(null); 
        setPreviewFileName(''); 
    };

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

    // Logica di filtro aggiornata
    const filteredFiles = useMemo(() => {
        return files.filter(file => {
            // 1. Ricerca testo
            const matchesSearch = getDisplayName(file).toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  (file.links_descrizione && file.links_descrizione.toLowerCase().includes(searchTerm.toLowerCase()));
            
            // 2. Filtro Privacy
            const matchesPrivacy = filterPrivacy === 'all' || file.privacy === filterPrivacy;

            // 3. Filtro Entità
            const matchesEntity = filterEntity === 'all' || 
                                  (file.entita_tipi && file.entita_tipi.split(',').includes(filterEntity));

            return matchesSearch && matchesPrivacy && matchesEntity;
        });
    }, [files, searchTerm, filterPrivacy, filterEntity]);

    // Componente per la vista mobile dei filtri
    const MobileFilters = () => (
        <div className={`md:hidden fixed inset-0 z-40 ${isMobileFilterOpen ? 'block' : 'hidden'}`}>
            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setIsMobileFilterOpen(false)}></div>
            <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl p-4 max-h-80 overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Filtri</h3>
                    <button onClick={() => setIsMobileFilterOpen(false)} className="p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                {/* Filtro Entità */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo Entità</label>
                    <select
                        value={filterEntity}
                        onChange={(e) => setFilterEntity(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Privacy</label>
                    <div className="flex bg-white rounded-lg shadow-sm border p-1">
                        <button onClick={() => setFilterPrivacy('all')} className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${filterPrivacy === 'all' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Tutti</button>
                        <button onClick={() => setFilterPrivacy('public')} className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1 ${filterPrivacy === 'public' ? 'bg-green-50 text-green-700' : 'text-gray-500 hover:text-gray-700'}`}><Globe className="w-3 h-3" /> Pubblici</button>
                        <button onClick={() => setFilterPrivacy('private')} className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1 ${filterPrivacy === 'private' ? 'bg-amber-50 text-amber-700' : 'text-gray-500 hover:text-gray-700'}`}><Lock className="w-3 h-3" /> Privati</button>
                    </div>
                </div>

                <button 
                    onClick={() => setIsMobileFilterOpen(false)} 
                    className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium"
                >
                    Applica Filtri
                </button>
            </div>
        </div>
    );

    // Componente per la card mobile di un file (Layout con altezza fissa)
    const MobileFileCard = ({ file }) => (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden flex flex-col">
            {/* Immagine con altezza fissa e object-contain */}
            <div className="h-40 bg-gray-100 flex-shrink-0"> {/* MODIFICA: da aspect-square a h-40 per un'altezza fissa */}
                {file.mime_type?.startsWith('image/') && file.previewUrl ? (
                    <img 
                        src={file.previewUrl} 
                        alt={getDisplayName(file)} 
                        className="w-full h-full object-contain"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        {getFileIcon(file.mime_type)}
                    </div>
                )}
            </div>
            
            {/* Unico riquadro compatto per info e azioni in basso */}
            <div className="p-3 flex flex-col flex-shrink-0">
                {/* Riga 1: Nome + Pulsanti */}
                <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-gray-900 truncate pr-2" title={getDisplayName(file)}>
                        {getDisplayName(file)}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0">
                        {file.privacy === 'public' ? 
                            <Globe className="w-4 h-4 text-green-500" /> : 
                            <Lock className="w-4 h-4 text-amber-500" />
                        }
                        <button onClick={() => openPreview(file)} className="p-1 text-gray-400 hover:text-blue-600 rounded" title="Anteprima">
                            <Eye className="w-4 h-4" />
                        </button>
                        <a href={file.previewUrl} download={getDisplayName(file)} className="p-1 text-gray-400 hover:text-green-600 rounded" title="Download">
                            <Download className="w-4 h-4" />
                        </a>
                        {hasPermission('DM_FILE_DELETE') && (
                            <button onClick={() => handleDelete(file)} className="p-1 text-gray-400 hover:text-red-600 rounded" title="Elimina">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
                
                {/* Riga 2: Info aggiuntive */}
                {file.links_descrizione && (
                    <div className="text-xs text-gray-500">
                        <div className="flex items-start gap-1">
                            <LinkIcon className="w-3 h-3 mt-0.5 text-gray-400 flex-shrink-0" />
                            <span className="line-clamp-2" title={file.links_descrizione}>{file.links_descrizione}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    // Componente per la card desktop di un file (Con immagini più grandi e layout compatto)
    const DesktopFileCard = ({ file }) => (
        <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white flex flex-col h-full">
            {/* Immagine più grande con Lazy Loading e object-contain */}
            <div className="h-64 bg-gray-100 flex-shrink-0">
                {file.mime_type?.startsWith('image/') && file.previewUrl ? (
                    <img 
                        src={file.previewUrl} 
                        alt={getDisplayName(file)} 
                        className="w-full h-full object-contain cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => openPreview(file)}
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        {getFileIcon(file.mime_type)}
                    </div>
                )}
            </div>
            
            {/* Unico riquadro compatto per info e azioni in basso */}
            <div className="p-3 flex flex-col flex-shrink-0">
                {/* Riga 1: Nome + Pulsanti */}
                <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-gray-900 truncate pr-2" title={getDisplayName(file)}>
                        {getDisplayName(file)}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0">
                        {file.privacy === 'public' ? 
                            <Globe className="w-4 h-4 text-green-500" /> : 
                            <Lock className="w-4 h-4 text-amber-500" />
                        }
                        <button onClick={() => openPreview(file)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50" title="Anteprima">
                            <Eye className="w-4 h-4" />
                        </button>
                        <a href={file.previewUrl} download={getDisplayName(file)} className="p-1.5 text-gray-400 hover:text-green-600 rounded-full hover:bg-green-50" title="Download">
                            <Download className="w-4 h-4" />
                        </a>
                        {hasPermission('DM_FILE_DELETE') && (
                            <button onClick={() => handleDelete(file)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50" title="Elimina">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
                
                {/* Riga 2: Info aggiuntive */}
                <div className="text-xs text-gray-500 space-y-1">
                    {file.links_descrizione && (
                        <div className="flex items-start gap-1">
                            <LinkIcon className="w-3 h-3 mt-0.5 text-gray-400 flex-shrink-0" />
                            <span className="line-clamp-2" title={file.links_descrizione}>{file.links_descrizione}</span>
                        </div>
                    )}
                    <p>{formatBytes(file.file_size_bytes)}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-4 md:p-6 bg-gray-50 h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col mb-4">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Archivio Documentale</h1>
                        <p className="text-sm text-gray-500">Gestione centralizzata di tutti i file e allegati</p>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveSection('documenti')}
                        className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                            activeSection === 'documenti'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <File className="w-4 h-4" />
                            <span>Documenti Generali</span>
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveSection('posta')}
                        className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                            activeSection === 'posta'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span>Allegati Posta</span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Contenuto dinamico basato sulla sezione attiva */}
            {activeSection === 'posta' ? (
                <ArchivioPostaModule />
            ) : (
                <>
                    {/* Header per sezione documenti (contenuto originale) */}
                    <div className="flex justify-between items-center mb-2">
                        {/* Menu mobile */}
                        {isMobile && (
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 rounded-lg hover:bg-gray-100"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                
                {/* Barra di ricerca e filtri per desktop */}
                <div className={`flex flex-wrap items-center gap-3 w-full md:w-auto ${isMobile && !isMobileMenuOpen ? 'hidden' : 'flex'}`}>
                    {/* Barra Ricerca */}
                    <div className="relative flex-1 md:flex-initial md:w-48">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Cerca..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Filtri per desktop */}
                    {!isMobile && (
                        <>
                            {/* Filtro Entità Dropdown */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                    <Filter className="h-4 w-4 text-gray-400" />
                                </div>
                                <select
                                    value={filterEntity}
                                    onChange={(e) => setFilterEntity(e.target.value)}
                                    className="pl-8 pr-8 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer hover:bg-gray-50"
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

                            {/* Vista Lista/Griglia */}
                            <div className="flex bg-white rounded-lg shadow-sm border">
                                <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600'}`}><List className="w-5 h-5" /></button>
                                <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600'}`}><Grid className="w-5 h-5" /></button>
                            </div>

                            <button onClick={fetchFiles} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Ricarica">
                                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                        </>
                    )}

                    {/* Pulsante filtri per mobile */}
                    {isMobile && (
                        <button 
                            onClick={() => setIsMobileFilterOpen(true)} 
                            className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                        >
                            <Filter className="w-4 h-4" />
                            Filtri
                            <ChevronDown className="w-4 h-4" />
                        </button>
                    )}
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
                    <div className="flex-1 overflow-hidden">
                        {/* Vista mobile - griglia con altezza fissa */}
                        {isMobile ? (
                            <div className="h-full overflow-y-auto pb-4">
                                <div className="grid grid-cols-2 gap-3">
                                    {filteredFiles.map((file) => (
                                        <MobileFileCard key={file.id_file} file={file} />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            /* Vista desktop */
                            <div className="bg-white rounded-lg shadow overflow-hidden h-full overflow-y-auto">
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
                                                                <span className="text-sm font-medium text-gray-900 truncate max-w-xs" title={getDisplayName(file)}>
                                                                    {getDisplayName(file)}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            {file.privacy === 'public' ? (
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800" title="Pubblico">
                                                                    <Globe className="w-3 h-3 mr-1" /> Public
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800" title="Privato">
                                                                    <Lock className="w-3 h-3 mr-1" /> Private
                                                                </span>
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
                                                                <button onClick={() => openPreview(file)} className="p-1 text-gray-400 hover:text-blue-600" title="Anteprima">
                                                                    <Eye className="w-5 h-5" />
                                                                </button>
                                                                <a href={file.previewUrl} download={getDisplayName(file)} className="p-1 text-gray-400 hover:text-green-600" title="Download">
                                                                    <Download className="w-5 h-5" />
                                                                </a>
                                                                {hasPermission('DM_FILE_DELETE') && (
                                                                    <button onClick={() => handleDelete(file)} className="p-1 text-gray-400 hover:text-red-600" title="Elimina">
                                                                        <Trash2 className="w-5 h-5" />
                                                                    </button>
                                                                )}
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
                                            <DesktopFileCard key={file.id_file} file={file} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <ImagePreviewModal isOpen={isPreviewModalOpen} onClose={closePreviewModal} imageSrc={previewImage} fileName={previewFileName} />

                {/* Pannello filtri mobile */}
                <MobileFilters />
                </>
            )}
        </div>
    );
};

export default ArchivioDocumentale;