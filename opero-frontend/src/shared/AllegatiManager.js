/**
 * File: /opero-frontend/src/shared/AllegatiManager.js
 *
 * Versione: 20.0 (Fix "Resource metadata not found")
 * - CHANGE: Switch a UNPKG (@latest/dist/). Questo indirizzo contiene
 * sicuramente i file .json di manifesto necessari che mancavano prima.
 * - CONFIG: Configurazione semplificata per massima compatibilità.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { api } from '../services/api';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ConfirmationModal from './ConfirmationModal';
import Cropper from 'react-easy-crop';
import imageCompression from 'browser-image-compression';

// --- MOTORE PROFESSIONALE ---
import { removeBackground } from "@imgly/background-removal";

// --- ICONE ---
import { 
    ArrowDownTrayIcon, TrashIcon, DocumentIcon, PhotoIcon, ArchiveBoxIcon, 
    CloudArrowUpIcon, ArrowPathIcon, EyeIcon, CameraIcon, CheckIcon, 
    XMarkIcon, SparklesIcon
} from '@heroicons/react/24/outline';

// ======================================================================
// HELPER
// ======================================================================

const FileIconHelper = ({ mimeType }) => {
    if (!mimeType) return <DocumentIcon className="w-6 h-6 text-gray-500" />;
    if (mimeType.startsWith('image/')) return <PhotoIcon className="w-6 h-6 text-blue-500" />;
    if (mimeType === 'application/pdf') return <DocumentIcon className="w-6 h-6 text-red-500" />;
    return <DocumentIcon className="w-6 h-6 text-gray-500" />;
};

const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
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
    } catch (e) { return 'Data non valida'; }
};

const createImage = (url) => new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
});

const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            blob ? resolve(blob) : reject(new Error('Errore canvas blob'));
        }, 'image/png');
    });
};

// ======================================================================
// COMPONENTE PRINCIPALE
// ======================================================================

const AllegatiManager = ({ entitaId, entitaTipo, entita_id, entita_tipo, idDitta, forceRefresh, defaultPrivacy = 'private' }) => {
    const { idDitta: dittaAuth, hasPermission } = useAuth();
    const effectiveEntitaId = entita_id || entitaId;
    const effectiveEntitaTipo = entita_tipo || entitaTipo;
    const effectivePrivacy = effectiveEntitaTipo === 'ct_catalogo' ? 'public' : defaultPrivacy;
    
    const [allegati, setAllegati] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [uploadingFiles, setUploadingFiles] = useState([]);
    const [effectiveIdDitta, setEffectiveIdDitta] = useState(idDitta);
    
    const [isAllegatoDeleteModalOpen, setIsAllegatoDeleteModalOpen] = useState(false);
    const [allegatoLinkToDelete, setAllegatoLinkToDelete] = useState(null);
    
    const fileInputRef = useRef(null);
    const uploadCancelTokens = useRef(new Map());

    // Stati Editor
    const [cameraFile, setCameraFile] = useState(null);
    const [imageToCrop, setImageToCrop] = useState(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [aspectRatio, setAspectRatio] = useState(1);

    // Stati AI
    const [isProcessingAI, setIsProcessingAI] = useState(false);
    const [processedImage, setProcessedImage] = useState(null); 
    const [processingStep, setProcessingStep] = useState('');
    const [downloadProgress, setDownloadProgress] = useState(0);

    const aspectRatios = [
        { name: 'Instagram (1:1)', value: 1 }, 
        { name: 'Story (4:5)', value: 4/5 }, 
        { name: 'Landscape (16:9)', value: 16/9 },
        { name: 'Originale', value: null }
    ];

    const optimizeImage = async (file, forcePng = false) => {
        try {
            const fileType = forcePng ? 'image/png' : 'image/jpeg';
            const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true, fileType: fileType };
            return await imageCompression(file, options);
        } catch (e) { return file; }
    };

    useEffect(() => { setEffectiveIdDitta(idDitta || dittaAuth); }, [idDitta, dittaAuth]);

    const fetchAllegati = useCallback(async () => {
        if (!effectiveEntitaId) return;
        setIsLoading(true);
        try {
            const res = await api.get(`/archivio/entita/${effectiveEntitaTipo}/${effectiveEntitaId}`, { params: { idDitta: effectiveIdDitta } });
            setAllegati(res.data);
        } catch (e) { setError("Errore caricamento allegati."); } finally { setIsLoading(false); }
    }, [effectiveEntitaId, effectiveEntitaTipo, effectiveIdDitta]);

    useEffect(() => { fetchAllegati(); }, [fetchAllegati]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCameraFile(file);
            setImageToCrop(URL.createObjectURL(file));
            setIsEditorOpen(true);
            setProcessedImage(null);
            setZoom(1);
            setCrop({ x: 0, y: 0 });
        }
    };

    const closeEditor = () => {
        setIsEditorOpen(false);
        setCameraFile(null);
        setImageToCrop(null);
        setProcessedImage(null);
        setProcessingStep('');
        setDownloadProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const getCroppedFile = async () => {
        try {
            const blob = await getCroppedImg(imageToCrop, croppedAreaPixels);
            return new File([blob], "temp_crop.png", { type: "image/png" });
        } catch (e) { return null; }
    };

    // --- FUNZIONE CHIAVE: SCONTORNO CON UNPKG ---
    const handleProcessAI = async () => {
        setError(null);
        const croppedFile = await getCroppedFile();
        if (!croppedFile) { setError("Impossibile ritagliare."); return; }

        setIsProcessingAI(true);
        setProcessingStep("Avvio AI (Attendi...)...");
        setDownloadProgress(0);

        try {
            // CONFIGURAZIONE UNPKG (Più stabile)
            const config = {
                // Puntiamo a 'dist' della versione latest. Questo include manifest.json, wasm, onnx.
                publicPath: "https://unpkg.com/@imgly/background-removal-data@latest/dist/",
                debug: true, // Lasciamo attivo per vedere i log
                model: "small", // Iniziamo col piccolo
                progress: (key, current, total) => {
                    if (key === 'fetch') {
                        const percent = Math.round((current / total) * 100);
                        setDownloadProgress(percent);
                        setProcessingStep(`Scaricamento Dati AI: ${percent}%`);
                    } else if (key === 'compute') {
                        setProcessingStep("Elaborazione Sfondo...");
                        setDownloadProgress(100);
                    }
                }
            };

            console.log("Avvio IMG.LY con path:", config.publicPath);
            
            // Passiamo direttamente il FILE object
            const blob = await removeBackground(croppedFile, config);
            
            console.log("Scontorno completato!", blob);

            const finalPngFile = new File([blob], "pro_product.png", { type: "image/png", lastModified: Date.now() });
            setProcessedImage(finalPngFile);

        } catch (err) {
            console.error("AI ERROR DETTAGLIATO:", err);
            // Mostra errore pulito a schermo
            setError(`Errore AI: ${err.message}. Controlla la console (F12) per dettagli.`);
        } finally {
            setIsProcessingAI(false);
        }
    };

    // 3. SALVATAGGIO
    const handleSave = async () => {
        let finalFile = null;

        if (processedImage) {
            finalFile = processedImage;
        } else if (imageToCrop && croppedAreaPixels) {
            const blob = await getCroppedImg(imageToCrop, croppedAreaPixels);
            let jpegFile = new File([blob], "image.jpg", { type: "image/jpeg" });
            finalFile = await optimizeImage(jpegFile, false);
        } else {
             setError("Nessuna immagine da salvare.");
             return;
        }

        const formData = new FormData();
        formData.append('file', finalFile);
        formData.append('entitaId', effectiveEntitaId);
        formData.append('entitaTipo', effectiveEntitaTipo);
        formData.append('idDitta', effectiveIdDitta);
        formData.append('privacy', effectivePrivacy);
        
        try {
            setProcessingStep("Upload...");
            setIsProcessingAI(true);
            await api.post('/archivio/upload', formData);
            fetchAllegati();
            closeEditor();
        } catch (e) { setError("Errore upload."); } 
        finally { setIsProcessingAI(false); }
    };

    const handleDropUpload = (acceptedFiles) => {
        if (!hasPermission('DM_FILE_UPLOAD')) return;
        if (acceptedFiles.length === 1 && acceptedFiles[0].type.startsWith('image/')) {
            const file = acceptedFiles[0];
            setCameraFile(file);
            setImageToCrop(URL.createObjectURL(file));
            setIsEditorOpen(true);
            return;
        }
        const newUploads = acceptedFiles.map(file => ({ id: `${file.name}-${Date.now()}`, file, progress: 0, error: null }));
        setUploadingFiles(prev => [...prev, ...newUploads]);
        newUploads.forEach(upload => performUpload(upload));
    };
    
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: handleDropUpload,
        noClick: !hasPermission('DM_FILE_UPLOAD'),
        disabled: !hasPermission('DM_FILE_UPLOAD'),
    });

    const performUpload = useCallback(async (upload) => {
        const { id, file } = upload;
        const source = axios.CancelToken.source();
        uploadCancelTokens.current.set(id, source);
        if (!effectiveEntitaId) return;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('entitaId', effectiveEntitaId);
        formData.append('entitaTipo', effectiveEntitaTipo);
        formData.append('idDitta', effectiveIdDitta);
        formData.append('privacy', effectivePrivacy);
        const setUploadStatus = (progress, error = null) => {
            setUploadingFiles(prev => prev.map(u => u.id === upload.id ? { ...u, progress, error: error ? error.toString() : null } : u));
        };
        try {
            setUploadStatus(10);
            await api.post('/archivio/upload', formData, {
                cancelToken: source.token,
                onUploadProgress: (ev) => { if (ev.total) setUploadStatus(Math.round((ev.loaded * 100) / ev.total)); }
            });
            setUploadStatus(100); fetchAllegati();
            setTimeout(() => setUploadingFiles(prev => prev.filter(u => u.id !== upload.id)), 1000);
        } catch (err) { setUploadStatus(0, err.message); } finally { uploadCancelTokens.current.delete(id); }
    }, [effectiveEntitaId, effectiveEntitaTipo, effectiveIdDitta, fetchAllegati, effectivePrivacy]);

    const confirmDelete = async () => { 
        if (!allegatoLinkToDelete) return;
        try { await api.delete(`/archivio/scollega/${allegatoLinkToDelete.id_link}`, { params: { idDitta: effectiveIdDitta } }); setIsAllegatoDeleteModalOpen(false); fetchAllegati(); if(forceRefresh) forceRefresh(); } catch(e) { setError("Errore eliminazione."); }
    };

    if (!hasPermission) return <div>No Auth</div>;

    return (
        <div className="w-full max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                Foto e Documenti 
                <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-normal">{effectivePrivacy === 'public' ? 'Visibili nel Catalogo' : 'Privati'}</span>
            </h3>
            
            {hasPermission('DM_FILE_UPLOAD') && (
                <div {...getRootProps()} className={`border-2 border-dashed p-8 text-center rounded-xl cursor-pointer transition-all ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}>
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="p-3 bg-blue-100 rounded-full text-blue-600"><CameraIcon className="w-8 h-8"/></div>
                        <p className="text-sm text-gray-600 font-medium">Scatta foto o trascina qui i file</p>
                        <p className="text-xs text-gray-400">Ottimizzato per Cataloghi Instagram</p>
                    </div>
                </div>
            )}
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4">
                    <strong className="font-bold">Errore: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {isLoading && <div className="col-span-full text-center py-4 text-gray-500"><ArrowPathIcon className="w-5 h-5 animate-spin inline mr-2"/> Caricamento...</div>}
                {allegati.map(file => (
                    <div key={file.id_link} className="flex items-center p-3 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center border">
                            {file.mime_type.startsWith('image/') ? <img src={file.previewUrl} className="w-full h-full object-cover" /> : <FileIconHelper mimeType={file.mime_type}/>}
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{file.file_name_originale}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.file_size_bytes)} • {formatFileDate(file.created_at)}</p>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={() => window.open(file.previewUrl, '_blank')} className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50"><EyeIcon className="w-5 h-5"/></button>
                            <button onClick={() => {setAllegatoLinkToDelete(file); setIsAllegatoDeleteModalOpen(true);}} className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                    </div>
                ))}
            </div>

            {isEditorOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col p-0 sm:p-4">
                    <div className="bg-white w-full h-full sm:rounded-xl flex flex-col overflow-hidden shadow-2xl relative">
                        
                        <div className="px-4 py-3 border-b flex justify-between items-center bg-white z-10">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <SparklesIcon className="w-5 h-5 text-purple-600"/> Editor Catalogo
                            </h3>
                            <button onClick={closeEditor} className="p-1 hover:bg-gray-100 rounded-full"><XMarkIcon className="w-6 h-6 text-gray-500"/></button>
                        </div>

                        <div className="flex-1 relative bg-gray-900 overflow-hidden">
                            {processedImage ? (
                                <div className="w-full h-full flex items-center justify-center p-4" style={{backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
                                    <img src={URL.createObjectURL(processedImage)} className="max-w-full max-h-full object-contain shadow-2xl" alt="Risultato" />
                                </div>
                            ) : (
                                <Cropper 
                                    image={imageToCrop} crop={crop} zoom={zoom} aspect={aspectRatio} 
                                    onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={(area, pixels) => setCroppedAreaPixels(pixels)} 
                                    objectFit="contain"
                                />
                            )}

                            {isProcessingAI && (
                                <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 text-white p-6 text-center">
                                    <ArrowPathIcon className="w-12 h-12 animate-spin mb-6 text-purple-500"/>
                                    <h3 className="text-xl font-bold mb-2">{processingStep}</h3>
                                    {downloadProgress > 0 && downloadProgress < 100 && (
                                        <div className="w-full max-w-xs bg-gray-700 rounded-full h-2.5 mb-4">
                                            <div className="bg-purple-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${downloadProgress}%` }}></div>
                                        </div>
                                    )}
                                    <p className="text-sm text-gray-400">Scarico modelli AI (richiede connessione)...</p>
                                </div>
                            )}
                        </div>

                        <div className="bg-white border-t p-4 flex flex-col gap-4 safe-area-bottom">
                            {!processedImage && (
                                <div className="flex justify-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                    {aspectRatios.map(ar => (
                                        <button key={ar.name} onClick={() => setAspectRatio(ar.value)} className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${aspectRatio === ar.value ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{ar.name}</button>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-between items-center gap-3">
                                {processedImage ? (
                                    <>
                                        <button onClick={() => setProcessedImage(null)} className="px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 flex-1 border">Indietro</button>
                                        <button onClick={handleSave} className="px-4 py-3 rounded-lg text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 flex-1 shadow-lg flex justify-center items-center gap-2"><CheckIcon className="w-5 h-5"/> Salva nel Catalogo</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={handleSave} className="px-4 py-3 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200">Salva Originale</button>
                                        <button onClick={handleProcessAI} disabled={isProcessingAI} className="px-6 py-3 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex-1 shadow-lg flex justify-center items-center gap-2">
                                            <SparklesIcon className="w-5 h-5"/> 
                                            {isProcessingAI ? 'Attendere...' : 'Rimuovi Sfondo PRO'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isAllegatoDeleteModalOpen && <ConfirmationModal isOpen={isAllegatoDeleteModalOpen} onClose={() => setIsAllegatoDeleteModalOpen(false)} onConfirm={confirmDelete} title="Elimina" message="Sei sicuro?" confirmButtonText="Elimina" confirmButtonColor="red" />}
        </div>
    );
};

export default AllegatiManager;