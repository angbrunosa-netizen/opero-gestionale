/**
 * File: /opero-frontend/src/shared/AllegatiManager.js
 *
 * Versione: 5.6 (Privacy automatica per 'ct_catalogo' con debug migliorato)
 *
 * Descrizione:
 * - Basato sulla v5.5.
 * - Corretta la gestione della privacy per 'ct_catalogo'.
 * - Aggiunto supporto per entrambi i formati di props (entitaTipo/entita_tipo).
 * - Migliorato il debug per verificare i dati inviati al backend.
 * - Rimossi componenti icona duplicati.
 */

// ======================================================================
// IMPORTAZIONI
// ======================================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { api } from '../services/api';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ConfirmationModal from './ConfirmationModal';

// Import di react-easy-crop
import Cropper from 'react-easy-crop';
import { Area } from 'react-easy-crop';

// Import della libreria di compressione
import imageCompression from 'browser-image-compression';

// Icone da lucide-react
import {
    Download,
    Trash2,
    FileText,
    FileImage,
    FileArchive,
    File,
    AlertTriangle,
    UploadCloud,
    Loader2,
    Eye,
    Camera,
    Check,
    Pencil,
    X
} from 'lucide-react';

// ======================================================================
// HELPER INTERNI
// ======================================================================

const FileIconHelper = ({ mimeType }) => {
    if (!mimeType) return <File className="w-6 h-6 text-gray-500" />;
    if (mimeType.startsWith('image/')) {
        return <FileImage className="w-6 h-6 text-blue-500" />;
    }
    if (mimeType === 'application/pdf') {
        return <FileText className="w-6 h-6 text-red-500" />;
    }
    if (mimeType.startsWith('application/zip') || mimeType.includes('compressed')) {
        return <FileArchive className="w-6 h-6 text-yellow-600" />;
    }
    return <File className="w-6 h-6 text-gray-500" />;
};

const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatFileDate = (dateString) => {
    try {
        return new Date(dateString).toLocaleDateString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    } catch (e) {
        return 'Data non valida';
    }
};

// --- FUNZIONE HELPER ---
const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });

const getCroppedImg = async (imageSrc, pixelCrop) => {
    if (!pixelCrop || !pixelCrop.width || !pixelCrop.height) {
        throw new Error('Area di ritaglio non valida o non definita.');
    }

    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Impossibile ottenere il contesto 2D del canvas.');
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('Impossibile creare il blob dal canvas.'));
                return;
            }
            resolve(blob);
        }, 'image/jpeg');
    });
};

// ======================================================================
// COMPONENTE PRINCIPALE
// ======================================================================

const AllegatiManager = ({
    entitaId,
    entitaTipo,
    entita_tipo, // Supporto per snake_case
    idDitta,
    forceRefresh,
    defaultPrivacy = 'private'
}) => {
    const { idDitta: dittaAuth, hasPermission } = useAuth();
    
    // Usa entita_tipo se disponibile, altrimenti usa entitaTipo
    const entityType = entita_tipo || entitaTipo;
    
    // Se entityType è 'ct_catalogo', imposta automaticamente la privacy a 'public'
    const effectivePrivacy = entityType === 'ct_catalogo' ? 'public' : defaultPrivacy;
    
    // Debug per verificare i valori
    console.log('DEBUG: entitaTipo ricevuto:', entitaTipo);
    console.log('DEBUG: entita_tipo ricevuto:', entita_tipo);
    console.log('DEBUG: entityType calcolato:', entityType);
    console.log('DEBUG: effectivePrivacy calcolato:', effectivePrivacy);
    
    const [allegati, setAllegati] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [uploadingFiles, setUploadingFiles] = useState([]);
    const [effectiveIdDitta, setEffectiveIdDitta] = useState(idDitta);
    const [isAllegatoDeleteModalOpen, setIsAllegatoDeleteModalOpen] = useState(false);
    const [allegatoLinkToDelete, setAllegatoLinkToDelete] = useState(null);
    const [editingAllegato, setEditingAllegato] = useState(null);
    const [currentNote, setCurrentNote] = useState('');
    
    const fileInputRef = useRef(null);
    const uploadCancelTokens = useRef(new Map());

    // Stati per la gestione del ritaglio
    const [cameraFile, setCameraFile] = useState(null);
    const [imageToCrop, setImageToCrop] = useState(null);
    const [isCroppingModalOpen, setIsCroppingModalOpen] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    
    // Stato per il rapporto di aspetto, con un predefinito verticale
    const [aspectRatio, setAspectRatio] = useState(3 / 4);

    // Stati per la gestione della rimozione sfondo
    const [croppedFileForBgRemoval, setCroppedFileForBgRemoval] = useState(null);
    const [isRemovingBg, setIsRemovingBg] = useState(false);

    const isCropReady = croppedAreaPixels && croppedAreaPixels.width > 0 && croppedAreaPixels.height > 0;

    // Array di opzioni per l'aspect ratio personalizzate
    const aspectRatios = [
        { name: 'Quadrato (1:1)', value: 1 / 1 },
        { name: 'Verticale (3:4)', value: 3 / 4 },
        { name: 'Verticale Estrema (1:3)', value: 1.5 / 3 },
        { name: 'Standard (4:3)', value: 4 / 3 },
        { name: 'Panoramica (16:9)', value: 16 / 9 },
    ];

    // Funzione helper per ottimizzare l'immagine
    const optimizeImage = async (file) => {
        console.log('Dimensione file originale:', (file.size / 1024 / 1024).toFixed(2), 'MB');
        
        const options = {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 1200,
            useWebWorker: true,
            fileType: 'image/jpeg',
        };

        try {
            const compressedFile = await imageCompression(file, options);
            console.log('Dimensione file ottimizzato:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');
            console.log('Riduzione del:', ((1 - compressedFile.size / file.size) * 100).toFixed(2), '%');
            return compressedFile;
        } catch (error) {
            console.error('Errore durante l\'ottimizzazione dell\'immagine:', error);
            setError('Impossibile ottimizzare l\'immagine, verrà caricata l\'originale.');
            return file;
        }
    };

    useEffect(() => {
        setEffectiveIdDitta(idDitta || dittaAuth);
    }, [idDitta, dittaAuth]);

    const fetchAllegati = useCallback(async () => {
        if (!entitaId || !entityType || !effectiveIdDitta) return;
        setIsLoading(true);
        try {
            const response = await api.get(`/api/archivio/entita/${entityType}/${entitaId}`, {
                params: { idDitta: effectiveIdDitta }
            });
            setAllegati(response.data);
            setError(null);
        } catch (err) {
            console.error("Errore nel recupero degli allegati:", err);
            setError("Impossibile caricare gli allegati.");
        } finally {
            setIsLoading(false);
        }
    }, [entitaId, entityType, effectiveIdDitta]);

    useEffect(() => {
        fetchAllegati();
    }, [fetchAllegati]);

    const handleUpload = (acceptedFiles) => {
        if (!hasPermission('DM_FILE_UPLOAD')) return;
        const newUploads = acceptedFiles.map(file => ({
            id: `${file.name}-${file.lastModified}`,
            file,
            progress: 0,
            error: null,
        }));
        setUploadingFiles(prev => [...prev, ...newUploads]);
        newUploads.forEach(upload => performUpload(upload));
    };
    
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: handleUpload,
        noClick: !hasPermission('DM_FILE_UPLOAD'),
        noKeyboard: !hasPermission('DM_FILE_UPLOAD'),
        disabled: !hasPermission('DM_FILE_UPLOAD'),
    });

    // =====================================================================
    // FUNZIONE 'performUpload' (MODIFICATA v5.6)
    // =====================================================================
    const performUpload = useCallback(async (upload) => {
        const { id, file } = upload;
        const source = axios.CancelToken.source();
        uploadCancelTokens.current.set(id, source);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('entitaId', entitaId);
        formData.append('entitaTipo', entityType); // Usa entityType calcolato
        formData.append('idDitta', effectiveIdDitta);
        formData.append('note', ''); // In questa versione, la nota non viene chiesta all'inizio
        
        // Utilizza 'effectivePrivacy' calcolato internamente
        formData.append('privacy', effectivePrivacy);
        
        // Debug per verificare i dati inviati
        console.log('DEBUG: Dati FormData inviati al backend:');
        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }

        const setUploadStatus = (progress, error = null) => {
            setUploadingFiles(prev =>
                prev.map(u =>
                    u.id === upload.id ? { ...u, progress, error: error ? error.toString() : null } : u
                )
            );
        };

        try {
            setUploadStatus(10);
            
            await api.post('/archivio/upload', formData, {
                cancelToken: source.token,
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadStatus(percent);
                    }
                }
            });
            
            setUploadStatus(100);
            fetchAllegati();
            if (forceRefresh) forceRefresh();
            setTimeout(() => setUploadingFiles(prev => prev.filter(u => u.id !== upload.id)), 1000);
        } catch (err) {
            console.error("Errore durante l'upload:", err);
            const errMsg = err.response?.data?.error || err.message || "Errore sconosciuto";
            setUploadStatus(0, errMsg);
        } finally {
            uploadCancelTokens.current.delete(id);
        }
    }, [entitaId, entityType, effectiveIdDitta, forceRefresh, fetchAllegati, effectivePrivacy]);

    const cancelUpload = (id) => {
        const source = uploadCancelTokens.current.get(id);
        if (source) {
            source.cancel('Upload annullato dall\'utente.');
        }
        setUploadingFiles(prev => prev.filter(f => f.id !== id));
        uploadCancelTokens.current.delete(id);
    };

    const handleDownload = async (file) => {
        if (!hasPermission('DM_FILE_VIEW')) return;
        try {
            const res = await api.get(`/documenti/generate-download-url/${file.id_file}`);
            const { downloadUrl } = res.data;
            window.open(downloadUrl, '_self');
        } catch (err) {
            console.error("Errore nel download:", err);
            setError(err.response?.data?.error || "Impossibile generare il link per il download.");
        }
    };

    const handleDeleteClick = (link) => {
        if (!hasPermission('DM_FILE_DELETE')) return;
        setAllegatoLinkToDelete(link);
        setIsAllegatoDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!allegatoLinkToDelete) return;
        try {
            await api.delete(`/api/archivio/scollega/${allegatoLinkToDelete.id_link}`, {
                params: { idDitta: effectiveIdDitta }
            });
            setIsAllegatoDeleteModalOpen(false);
            setAllegatoLinkToDelete(null);
            fetchAllegati();
            if (forceRefresh) forceRefresh();
        } catch (err) {
            console.error("Errore durante l'eliminazione:", err);
            setError(err.response?.data?.error || "Impossibile eliminare l'allegato.");
        }
    };

    const handleEditNote = (allegato) => {
        setEditingAllegato(allegato);
        setCurrentNote(allegato.note || '');
    };

    const saveNote = async () => {
        if (!editingAllegato) return;
        try {
            await api.put(`/api/archivio/note/${editingAllegato.id_link}`, {
                note: currentNote,
                idDitta: effectiveIdDitta
            });
            setEditingAllegato(null);
            setCurrentNote('');
            fetchAllegati();
        } catch (err) {
            console.error("Errore durante il salvataggio della nota:", err);
            setError(err.response?.data?.error || "Impossibile salvare la nota.");
        }
    };
    
    const handleCameraClick = (e) => {
        e.stopPropagation();
        fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setCameraFile(file);
            const imageUrl = URL.createObjectURL(file);
            setImageToCrop(imageUrl);
            setIsCroppingModalOpen(true);
            setCroppedAreaPixels(null);
            setAspectRatio(3 / 4); // Imposta il predefinito verticale
            setCrop({ x: 0, y: 0 });
        }
    };

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleCropAndRemoveBg = async () => {
        try {
            const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
            const originalName = cameraFile.name.replace(/\.[^/.]+$/, "");
            let croppedFile = new window.File([croppedBlob], `${originalName}_cropped.jpg`, { type: 'image/jpeg' });
            
            const optimizedFile = await optimizeImage(croppedFile);
            setCroppedFileForBgRemoval(optimizedFile);
            setIsCroppingModalOpen(false);
        } catch (e) {
            console.error("Errore in handleCropAndRemoveBg:", e);
            setError(`Errore durante il ritaglio: ${e.message}`);
        }
    };

    const handleCropAndUpload = async () => {
        try {
            const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
            const originalName = cameraFile.name.replace(/\.[^/.]+$/, "");
            let croppedFile = new window.File([croppedBlob], `${originalName}_cropped.jpg`, { type: 'image/jpeg' });
            
            const optimizedFile = await optimizeImage(croppedFile);
            
            handleUpload([optimizedFile]);
            closeAllModals();
        } catch (e) {
            console.error("Errore in handleCropAndUpload:", e);
            setError(`Errore durante il ritaglio: ${e.message}`);
        }
    };
    
    const closeAllModals = () => {
        setIsCroppingModalOpen(false);
        setCroppedFileForBgRemoval(null);
        setCameraFile(null);
        if (imageToCrop) {
            URL.revokeObjectURL(imageToCrop);
            setImageToCrop(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleBackgroundRemoval = async () => {
        if (!croppedFileForBgRemoval) return;
        
        setIsRemovingBg(true);
        setError(null);
        let imageUrl = null;

        try {
            imageUrl = window.URL.createObjectURL(croppedFileForBgRemoval);
            const bgRemovalModule = await import("@imgly/background-removal");
            const removeBackgroundFn = bgRemovalModule.removeBackground || bgRemovalModule.default || bgRemovalModule;
            
            if (typeof removeBackgroundFn !== 'function') {
                throw new Error('La funzione removeBackground non è disponibile');
            }
            
            const blob = await removeBackgroundFn(imageUrl);
            window.URL.revokeObjectURL(imageUrl);

            const originalName = cameraFile.name.replace(/\.[^/.]+$/, '');
            let bgRemovedFile = new window.File([blob], `${originalName}_cropped_nobg.png`, {
                type: 'image/png',
                lastModified: Date.now(),
            });

            const optimizedFile = await optimizeImage(bgRemovedFile);
            
            handleUpload([optimizedFile]);
            closeAllModals();

        } catch (err) {
            console.error("=== ERRORE DETTAGLIATO ===", err);
            setError(`Errore: ${err.message || 'Impossibile rimuovere lo sfondo'}`);
            
            if (imageUrl) {
                window.URL.revokeObjectURL(imageUrl);
            }
        } finally {
            setIsRemovingBg(false);
        }
    };
    
    if (!hasPermission) {
        return (
            <div className="w-full max-w-4xl mx-auto text-center py-8 text-red-600">
                Errore Critico: Contesto di autenticazione non disponibile.
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Gestione Allegati 
                {/* Indicatore visivo della privacy */}
                <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                    effectivePrivacy === 'public' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                }`}>
                    {effectivePrivacy === 'public' ? 'Pubblico' : 'Privato'}
                </span>
            </h3>

            {hasPermission('DM_FILE_UPLOAD') && (
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                        isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                    }`}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center">
                        <UploadCloud className="w-12 h-12 text-gray-400" />
                        {isDragActive ? (
                            <p className="mt-2 text-gray-600">Rilascia i file qui...</p>
                        ) : (
                            <p className="mt-2 text-gray-600">
                                Trascina i file qui, o <span className="font-semibold text-blue-600">clicca per selezionare</span>
                            </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">(Documenti, Immagini, ZIP, ecc.)</p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-300">
                        <p className="text-sm text-gray-600 mb-3">Oppure scatta una foto:</p>
                        <button
                            type="button"
                            onClick={handleCameraClick}
                            className="flex items-center justify-center w-full px-4 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                            <Camera className="w-6 h-6 mr-2" />
                            Apri Fotocamera
                        </button>
                    </div>
                </div>
            )}
            
            {!hasPermission('DM_FILE_UPLOAD') && (
                 <div className="border-2 border-dashed rounded-lg p-8 text-center bg-gray-50">
                     <p className="text-gray-500">Non hai i permessi per caricare nuovi file.</p>
                 </div>
            )}

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {uploadingFiles.length > 0 && (
                <div className="mt-4">
                    <h4 className="font-semibold text-sm text-gray-600 mb-2">In caricamento...</h4>
                    <ul className="space-y-2">
                        {uploadingFiles.map(up => (
                            <li key={up.id} className="p-3 bg-white border rounded-md">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700 truncate min-w-0 pr-4">{up.file.name}</span>
                                    {up.error && <AlertTriangle className="w-5 h-5 text-red-500" title={up.error} />}
                                    {up.progress === 100 && !up.error && <Loader2 className="w-5 h-5 text-green-500 animate-spin" />}
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                    <div className={`h-2 rounded-full transition-all ${up.error ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: up.error ? '100%' : `${up.progress}%` }}></div>
                                </div>
                                {up.error && <p className="text-xs text-red-600 mt-1">{up.error}</p>}
                                {!up.error && (
                                    <button 
                                        onClick={() => cancelUpload(up.id)} 
                                        className="mt-2 text-xs text-red-500 hover:text-red-700"
                                    >
                                        Annulla upload
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="mt-6">
                {isLoading && (
                    <div className="flex justify-center items-center py-4">
                        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                        <span className="ml-2 text-gray-500">Caricamento allegati...</span>
                    </div>
                )}
                {!isLoading && allegati.length === 0 && (
                    <div className="text-center py-4 text-gray-500">Nessun allegato presente.</div>
                )}
                {!isLoading && allegati.length > 0 && (
                    <ul className="space-y-3">
                        {allegati.map(file => (
                            <li key={file.id_link} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md shadow-sm">
                                <div className="flex items-center min-w-0 flex-1">
                                    {file.mime_type.startsWith('image/') && file.previewUrl ? (
                                        <img 
                                            src={file.previewUrl} 
                                            alt={file.file_name_originale}
                                            className="w-10 h-10 object-cover rounded-md flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
                                            <FileIconHelper mimeType={file.mime_type} />
                                        </div>
                                    )}
                                    <div className="ml-3 min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gray-900 truncate">{file.file_name_originale}</p>
                                        <p className="text-xs text-gray-500">
                                            {formatFileSize(file.file_size_bytes)}
                                            <span className="mx-1">·</span>
                                            Caricato il {formatFileDate(file.created_at)}
                                            {file.utente_upload && ` da ${file.utente_upload}`}
                                        </p>
                                        {editingAllegato?.id_link === file.id_link ? (
                                            <div className="mt-1 flex items-center">
                                                <input
                                                    type="text"
                                                    value={currentNote}
                                                    onChange={(e) => setCurrentNote(e.target.value)}
                                                    className="text-xs border rounded px-1 py-0.5 mr-1"
                                                    placeholder="Aggiungi nota..."
                                                />
                                                <button
                                                    onClick={saveNote}
                                                    className="text-green-600 hover:text-green-800"
                                                    title="Salva"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setEditingAllegato(null)}
                                                    className="text-red-600 hover:text-red-800 ml-1"
                                                    title="Annulla"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            file.note && (
                                                <p className="text-xs text-gray-600 mt-1">Nota: {file.note}</p>
                                            )
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                                    {file.previewUrl && hasPermission('DM_FILE_VIEW') && (
                                        <button 
                                            type="button" 
                                            onClick={() => window.open(file.previewUrl, '_blank')} 
                                            title="Anteprima" 
                                            className="p-2 text-gray-500 hover:text-green-600 rounded-full hover:bg-gray-100"
                                        ><Eye className="w-5 h-5" /></button>
                                    )}
                                    {hasPermission('DM_FILE_VIEW') && (
                                        <button 
                                            type="button" 
                                            onClick={() => handleDownload(file)} 
                                            title="Download" 
                                            className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100"
                                        ><Download className="w-5 h-5" /></button>
                                    )}
                                    {hasPermission('DM_FILE_EDIT') && (
                                        <button 
                                            type="button" 
                                            onClick={() => handleEditNote(file)} 
                                            title="Modifica nota" 
                                            className="p-2 text-gray-500 hover:text-yellow-600 rounded-full hover:bg-gray-100"
                                        ><Pencil className="w-5 h-5" /></button>
                                    )}
                                    {hasPermission('DM_FILE_DELETE') && (
                                        <button 
                                            type="button" 
                                            onClick={() => handleDeleteClick(file)} 
                                            title="Scollega" 
                                            className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50"
                                        ><Trash2 className="w-5 h-5" /></button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
            />

            {/* Modale per il RITAGLIO */}
            {isCroppingModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-lg w-full h-full max-w-4xl max-h-[90vh] flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-800">Ritaglia l'immagine</h3>
                            <button onClick={closeAllModals} className="text-gray-500 hover:text-gray-700">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-2 border-b flex justify-center space-x-2 flex-wrap">
                            {aspectRatios.map((ratio) => (
                                <button
                                    key={ratio.name}
                                    type="button"
                                    onClick={() => {
                                        setAspectRatio(ratio.value);
                                        setCrop({ x: 0, y: 0 });
                                    }}
                                    className={`px-3 py-1 text-xs rounded-md transition ${
                                        aspectRatio === ratio.value
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    {ratio.name}
                                </button>
                            ))}
                        </div>
                        <div className="relative flex-1 bg-black" style={{ minHeight: '300px' }}>
                            <Cropper
                                image={imageToCrop}
                                crop={crop}
                                zoom={zoom}
                                aspect={aspectRatio}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                            />
                        </div>
                        <div className="p-4 border-t flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                            <button
                                type="button"
                                onClick={handleCropAndUpload}
                                disabled={!isCropReady}
                                className={`px-4 py-2 rounded-md transition flex items-center justify-center ${
                                    isCropReady
                                        ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                <Check className="w-4 h-4 mr-1" />
                                Usa Immagine Ritagliata
                            </button>
                            <button
                                type="button"
                                onClick={handleCropAndRemoveBg}
                                disabled={!isCropReady}
                                className={`px-4 py-2 rounded-md transition flex items-center justify-center ${
                                    isCropReady
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-blue-300 text-white cursor-not-allowed'
                                }`}
                            >
                                {isRemovingBg ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Elaborazione...
                                    </>
                                ) : (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-1" />
                                        Rimuovi Sfondo
                                    </>
                                )}
                            </button>
                        </div>
                        {!isCropReady && (
                            <div className="px-4 pb-2 text-center text-sm text-gray-500">
                                <Loader2 className="w-4 h-4 inline-block animate-spin mr-1" />
                                Inizializzazione dell'area di ritaglio...
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modale per la RIMOZIONE SFONDO */}
            {croppedFileForBgRemoval && !isCroppingModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Rimuovere lo sfondo?</h3>
                        <img src={URL.createObjectURL(croppedFileForBgRemoval)} alt="Anteprima ritagliata" className="w-full h-auto rounded-md mb-4" />
                        <p className="text-sm text-gray-600 mb-6">Vuoi rimuovere lo sfondo da questa foto ritagliata?</p>
                        
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => handleUpload([croppedFileForBgRemoval])}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition flex items-center"
                                disabled={isRemovingBg}
                            >
                                <X className="w-4 h-4 mr-1" />
                                Mantieni Sfondo
                            </button>
                            <button
                                type="button"
                                onClick={handleBackgroundRemoval}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center"
                                disabled={isRemovingBg}
                            >
                                {isRemovingBg ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Elaborazione...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4 mr-1" />
                                        Rimuovi Sfondo
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isAllegatoDeleteModalOpen && (
                <ConfirmationModal
                    isOpen={isAllegatoDeleteModalOpen}
                    onClose={() => setIsAllegatoDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    title="Conferma eliminazione allegato"
                    message={`Sei sicuro di voler scollegare il file "${allegatoLinkToDelete?.file_name_originale || 'file selezionato'}"? Se non è collegato ad altre entità, il file verrà eliminato definitivamente.`}
                    confirmButtonText="Scollega"
                    confirmButtonColor="red"
                />
            )}
        </div>
    );
};

export default AllegatiManager;