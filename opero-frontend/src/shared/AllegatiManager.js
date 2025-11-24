/**
 * File: /opero-frontend/src/shared/AllegatiManager.js
 *
 * Versione: 5.2 (Rimozione Sfondo con Trasparenza e Zoom Post-Processo)
 *
 * Descrizione:
 * - FIX: La rimozione dello sfondo ora produce correttamente immagini PNG con sfondo trasparente.
 * - FEATURE: Dopo la rimozione dello sfondo, l'utente può ritagliare, zoomare e modificare nuovamente l'immagine prima del salvataggio.
 * - UX: Semplificato il flusso con un unico modale di editing e pulsanti di azione più chiari.
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
import Cropper from 'react-easy-crop';
import { Area } from 'react-easy-crop';
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
    Eye
} from 'lucide-react';

// --- COMPONENTI ICONA SVG INLINE (COMPLETI) ---
const CameraIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
        <circle cx="12" cy="13" r="3"></circle>
    </svg>
);

const CheckIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

const XIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

// ======================================================================
// HELPER INTERNI (COMPLETI)
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

const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });

// --- MODIFICATO: Usa 'image/png' per supportare la trasparenza
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

    // --- RIGA AGGIUNTA: PULISCE IL CANVAS RENDENDOLO COMPLETAMENTE TRASPARENTE ---
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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

    return new Promise((resolve) => {
        // Usiamo 'image/png' per preservare la trasparenza
        canvas.toBlob((blob) => {
            resolve(blob);
        }, 'image/png');
    });

};

// ======================================================================
// COMPONENTE PRINCIPALE
// ======================================================================

const AllegatiManager = ({ entita_tipo, entita_id }) => {
    const { loading, hasPermission } = useAuth();
    
    const [allegati, setAllegati] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [uploadingFiles, setUploadingFiles] = useState([]);
    const [isAllegatoDeleteModalOpen, setIsAllegatoDeleteModalOpen] = useState(false);
    const [allegatoLinkToDelete, setAllegatoLinkToDelete] = useState(null);
    
    const fileInputRef = useRef(null);

    // Stati per la gestione del ritaglio
    const [cameraFile, setCameraFile] = useState(null);
    const [imageToCrop, setImageToCrop] = useState(null);
    const [isCroppingModalOpen, setIsCroppingModalOpen] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    
    // Stato per il rapporto di aspetto, con un predefinito verticale
    const [aspectRatio, setAspectRatio] = useState(3 / 4);

    // Stato per gestire il caricamento del processo AI all'interno dell'editor
    const [isRemovingBg, setIsRemovingBg] = useState(false);

    const isCropReady = croppedAreaPixels && croppedAreaPixels.width > 0 && croppedAreaPixels.height > 0;

    const aspectRatios = [
        { name: 'Quadrato (1:1)', value: 1 / 1 },
        { name: 'Verticale (3:4)', value: 3 / 4 },
        { name: 'Verticale Estrema (1:3)', value: 1.5 / 3 },
        { name: 'Standard (4:3)', value: 4 / 3 },
        { name: 'Panoramica (16:9)', value: 16 / 9 },
    ];

    // --- MODIFICATO: La funzione di ottimizzazione ora accetta un formato di output ---
    const optimizeImage = async (file, outputFormat = 'image/jpeg') => {
        console.log('Dimensione file originale:', (file.size / 1024 / 1024).toFixed(2), 'MB');
        const options = {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 1200,
            useWebWorker: true,
            fileType: outputFormat,
        };
        try {
            const compressedFile = await imageCompression(file, options);
            console.log('Dimensione file ottimizzato:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');
            return compressedFile;
        } catch (error) {
            console.error('Errore durante l\'ottimizzazione dell\'immagine:', error);
            setError('Impossibile ottimizzare l\'immagine, verrà caricata l\'originale.');
            return file;
        }
    };

    const fetchAllegati = useCallback(async () => {
        if (!entita_tipo || !entita_id) return;
        setIsLoading(true);
        setError(null);
        try {
            const res = await api.get(`/documenti/list/${entita_tipo}/${entita_id}`);
            const allegatiConNome = res.data.map(a => ({
               ...a,
               utente_upload: (a.utente_nome || a.utente_cognome)
                   ? `${a.utente_nome || ''} ${a.utente_cognome || ''}`.trim()
                   : (a.utente_nome === null ? 'Utente Eliminato' : 'N/D')
            }));
            setAllegati(allegatiConNome);
        } catch (err) {
            console.error("Errore nel caricamento degli allegati:", err);
            setError(err.response?.data?.error || "Impossibile caricare gli allegati.");
        } finally {
            setIsLoading(false);
        }
    }, [entita_tipo, entita_id]);

    useEffect(() => {
        if (!entita_tipo || !entita_id) return;
        if (loading) return;
        fetchAllegati();
    }, [fetchAllegati, loading]);

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

    const performUpload = async (upload) => {
        const { file } = upload;
        const setUploadStatus = (progress, error = null) => {
            setUploadingFiles(prev =>
                prev.map(u =>
                    u.id === upload.id ? { ...u, progress, error: error ? error.toString() : null } : u
                )
            );
        };
        try {
            setUploadStatus(10); 
            const resUrl = await api.post('/documenti/generate-upload-url', {
                fileName: file.name, fileSize: file.size, mimeType: file.type,
            });
            const { uploadUrl, s3Key } = resUrl.data;
            setUploadStatus(30); 
            await axios.put(uploadUrl, file, {
                headers: { 'Content-Type': file.type },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadStatus(30 + (percent * 0.6)); 
                    }
                },
            });
            setUploadStatus(95);
            await api.post('/documenti/finalize-upload', {
                s3Key, fileName: file.name, fileSize: file.size, mimeType: file.type,
                entita_tipo, entita_id,
            });
            setUploadStatus(100);
            fetchAllegati(); 
            setTimeout(() => setUploadingFiles(prev => prev.filter(u => u.id !== upload.id)), 1000);
        } catch (err) {
            console.error("Errore durante l'upload:", err);
            const errMsg = err.response?.data?.error || err.message || "Errore sconosciuto";
            setUploadStatus(0, errMsg); 
        }
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
            await api.delete(`/documenti/link/${allegatoLinkToDelete.id_link}`);
            setAllegati(prev => prev.filter(a => a.id_link !== allegatoLinkToDelete.id_link));
        } catch (err) {
            console.error("Errore nell'eliminazione dell'allegato:", err);
            setError(err.response?.data?.error || "Impossibile eliminare l'allegato.");
        } finally {
            setIsAllegatoDeleteModalOpen(false);
            setAllegatoLinkToDelete(null);
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
            setAspectRatio(3 / 4);
            setCrop({ x: 0, y: 0 });
        }
    };

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    // --- NUOVA FUNZIONE: Gestisce il salvataggio finale dell'immagine corrente nell'editor ---
    const handleSave = async () => {
        if (!imageToCrop || !isCropReady) return;
        
        try {
            const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
            const originalName = cameraFile.name.replace(/\.[^/.]+$/, "");
            let finalFile = new window.File([croppedBlob], `${originalName}_edited.png`, { type: 'image/png' });

            // Ottimizziamo sempre in PNG per preservare eventuali trasparenze
            const optimizedFile = await optimizeImage(finalFile, 'image/png');
            
            handleUpload([optimizedFile]);
            closeAllModals();
        } catch (e) {
            console.error("Errore in handleSave:", e);
            setError(`Errore durante il salvataggio: ${e.message}`);
        }
    };

    // --- RIVISTA: Funzione per la rimozione dello sfondo ---
const handleBackgroundRemoval = async () => {
        if (!imageToCrop || !isCropReady) return;
        
        setIsRemovingBg(true);
        setError(null);

        try {
            // Riduciamo la dimensione dell'immagine prima della rimozione dello sfondo per velocizzare
            const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
            
            // Ridimensioniamo l'immagine a massimo 1024px sul lato più lungo
            const resizedBlob = await new Promise((resolve) => {
                const img = new Image();
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                img.onload = () => {
                    const maxSize = 1024;
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > height && width > maxSize) {
                        height = (height * maxSize) / width;
                        width = maxSize;
                    } else if (height > maxSize) {
                        width = (width * maxSize) / height;
                        height = maxSize;
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);
                    canvas.toBlob(resolve, 'image/png');
                };
                
                img.src = URL.createObjectURL(croppedBlob);
            });
            
            const imageUrl = URL.createObjectURL(resizedBlob);
            
            const bgRemovalModule = await import("@imgly/background-removal");
            const removeBackgroundFn = bgRemovalModule.removeBackground || bgRemovalModule.default || bgRemovalModule;
            
            if (typeof removeBackgroundFn !== 'function') {
                throw new Error('La funzione removeBackground non è disponibile');
            }
            
            // Configurazione ottimizzata per velocità
            const blob = await removeBackgroundFn(imageUrl, {
                model: 'small', // Usa il modello più piccolo e veloce
                output: { quality: 0.8, type: 'image/png' }
            });
            URL.revokeObjectURL(imageUrl);

            // Convertiamo il Blob risultante (con sfondo trasparente) in un dataURL
            const resultDataURL = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });

            // Aggiorniamo l'immagine nell'editor con quella senza sfondo
            setImageToCrop(resultDataURL);
            
            // Diamo all'utente il controllo totale per modificare ulteriormente
            setAspectRatio(undefined); // Aspect ratio libero
            setZoom(1);
            setCrop({ x: 0, y: 0 });

        } catch (err) {
            console.error("Errore durante la rimozione dello sfondo:", err);
            setError(`Errore: ${err.message || 'Impossibile rimuovere lo sfondo'}`);
        } finally {
            setIsRemovingBg(false);
        }
    };

    const closeAllModals = () => {
        setIsCroppingModalOpen(false);
        setCameraFile(null);
        if (imageToCrop) {
            URL.revokeObjectURL(imageToCrop);
            setImageToCrop(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    
    if (loading) {
        return (
            <div className="w-full max-w-4xl mx-auto flex justify-center items-center py-8">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <span className="ml-3 text-gray-600">Caricamento permessi...</span>
            </div>
        );
    }

    if (typeof hasPermission !== 'function') {
        return (
            <div className="w-full max-w-4xl mx-auto text-center py-8 text-red-600">
                Errore Critico: Contesto di autenticazione non disponibile.
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Gestione Allegati</h3>

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
                            <CameraIcon className="w-6 h-6 mr-2" />
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

            {/* Modale UNIFICATO per il RITAGLIO e l'EDITING */}
            {isCroppingModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-lg w-full h-full max-w-4xl max-h-[90vh] flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-800">Modifica Immagine</h3>
                            <button onClick={closeAllModals} className="text-gray-500 hover:text-gray-700">
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>
                        
                        {/* Controlli Aspect Ratio e Zoom */}
                        <div className="p-4 border-b space-y-3">
                            <div className="flex justify-center space-x-2 flex-wrap">
                                {aspectRatios.map((ratio) => (
                                    <button
                                        key={ratio.name}
                                        type="button"
                                        onClick={() => { setAspectRatio(ratio.value); setCrop({ x: 0, y: 0 }); }}
                                        className={`px-3 py-1 text-xs rounded-md transition ${aspectRatio === ratio.value ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                    >
                                        {ratio.name}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-600 w-12">Zoom</span>
                                <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(e.target.value)} className="flex-1 h-2 bg-gray-200 rounded-lg cursor-pointer" />
                            </div>
                        </div>

                        {/* Area Cropper */}
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

                        {/* Pulsanti Azione */}
                        <div className="p-4 border-t flex justify-between items-center">
                            <button
                                type="button"
                                onClick={handleBackgroundRemoval}
                                disabled={!isCropReady || isRemovingBg}
                                className={`px-4 py-2 rounded-md transition flex items-center ${
                                    isRemovingBg ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700'
                                }`}
                            >
                                {isRemovingBg ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Elaborazione AI...
                                    </>
                                ) : (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-1" />
                                        Rimuovi Sfondo
                                    </>
                                )}
                            </button>
                            <div className="flex gap-2">
                                <button type="button" onClick={closeAllModals} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition">Annulla</button>
                                <button type="button" onClick={handleSave} disabled={!isCropReady} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center">
                                    <CheckIcon className="w-4 h-4 mr-1" />
                                    Salva
                                </button>
                            </div>
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