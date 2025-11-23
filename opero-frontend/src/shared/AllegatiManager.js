/**
 * File: /opero-frontend/src/shared/AllegatiManager.js
 *
 * Versione: 24.0 (Fix AI Task & Restore Crop)
 * - FIX AI: Uso 'image-matting' con 'Xenova/modnet' (modello pubblico corretto).
 * - FIX: Risolve errore "Unauthorized access" e "Unsupported model type".
 * - RESTORE: Funzione di ritaglio manuale sempre disponibile.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ConfirmationModal from './ConfirmationModal';
import Cropper from 'react-easy-crop';
import imageCompression from 'browser-image-compression';

// --- TRANSFORMERS.JS ---
import { pipeline, env } from '@xenova/transformers';

// --- ICONE ---
import { 
    ArrowDownTrayIcon, TrashIcon, DocumentIcon, PhotoIcon, ArchiveBoxIcon, 
    CloudArrowUpIcon, ArrowPathIcon, CameraIcon, CheckIcon, 
    XMarkIcon, VideoCameraIcon, SparklesIcon, ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// ======================================================================
// CONFIGURAZIONE AI
// ======================================================================
// Disabilitiamo i modelli locali per forzare il download dalla cache/CDN corretta
env.allowLocalModels = false; 
env.useBrowserCache = true;

// ======================================================================
// HELPER
// ======================================================================

const FileIconHelper = ({ mimeType }) => {
    if (!mimeType) return <DocumentIcon className="w-6 h-6 text-gray-500" />;
    if (mimeType.startsWith('image/')) return <PhotoIcon className="w-6 h-6 text-purple-500" />;
    if (mimeType === 'application/pdf') return <DocumentIcon className="w-6 h-6 text-red-500" />;
    return <DocumentIcon className="w-6 h-6 text-gray-500" />;
};

// Funzione per ottenere il blob dell'immagine ritagliata
const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => { image.onload = resolve; });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

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

    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            resolve(blob);
        }, 'image/jpeg', 0.95);
    });
};

// ======================================================================
// COMPONENTE PRINCIPALE
// ======================================================================

const AllegatiManager = ({ entita_tipo, entita_id, idDitta, defaultPrivacy = 'private' }) => {
    const { hasPermission } = useAuth();
    const [allegati, setAllegati] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Modali
    const [isAllegatoDeleteModalOpen, setIsAllegatoDeleteModalOpen] = useState(false);
    const [allegatoToDelete, setAllegatoToDelete] = useState(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    
    // Stati Editor & Camera
    const [imageSrc, setImageSrc] = useState(null);
    const [currentFile, setCurrentFile] = useState(null);
    
    // Cropper State
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    
    // AI State
    const [isProcessingAI, setIsProcessingAI] = useState(false);
    const [processedImageSrc, setProcessedImageSrc] = useState(null);
    const [aiError, setAiError] = useState(null);
    
    // Camera State
    const [isCameraMode, setIsCameraMode] = useState(false);
    const videoRef = useRef(null);
    const [cameraStream, setCameraStream] = useState(null);

    // 1. Caricamento allegati
    const fetchAllegati = useCallback(async () => {
        if (!entita_id) return;
        try {
            const res = await api.get(`/documenti/lista/${entita_tipo}/${entita_id}`);
            if (res.data.success) {
                setAllegati(res.data.data);
            }
        } catch (error) {
            console.error("Errore fetch allegati:", error);
        }
    }, [entita_tipo, entita_id]);

    useEffect(() => {
        fetchAllegati();
    }, [fetchAllegati]);

    // Pulizia stream camera allo smontaggio
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    // 2. Gestione Dropzone
    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;
        
        if (file.type.startsWith('image/')) {
            openEditorWithFile(file);
        } else {
            await uploadFile(file);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    // Helper: Apre l'editor con un file
    const openEditorWithFile = (file) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            setImageSrc(reader.result);
            setCurrentFile(file);
            setIsEditorOpen(true);
            setIsCameraMode(false); 
            setProcessedImageSrc(null);
            setAiError(null);
        });
        reader.readAsDataURL(file);
    };

    // 3. Gestione Fotocamera
    const startCamera = async () => {
        setIsCameraMode(true);
        setIsEditorOpen(true);
        setImageSrc(null); 
        setProcessedImageSrc(null);
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            setCameraStream(stream);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Errore accesso camera:", err);
            alert("Impossibile accedere alla fotocamera.");
            setIsCameraMode(false);
            setIsEditorOpen(false);
        }
    };

    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
    };

    const capturePhoto = () => {
        if (!videoRef.current) return;
        
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        
        ctx.drawImage(videoRef.current, 0, 0);
        
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImageSrc(dataUrl);
        
        fetch(dataUrl)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
                setCurrentFile(file);
                setIsCameraMode(false); 
                stopCamera();
            });
    };

    // 4. Logica AI con Transformers.js (Corretta per 'modnet')
    const handleProcessAI = async () => {
        if (!imageSrc) return;
        
        setIsProcessingAI(true);
        setAiError(null);

        try {
            // FIX: Usiamo 'image-matting' invece di 'image-segmentation' per MODNet
            // Questo risolve l'errore "Unsupported model type"
            const segmenter = await pipeline('image-matting', 'Xenova/modnet');
            
            // Eseguiamo la predizione
            const output = await segmenter(imageSrc);
            
            // output[0] è la maschera alfa (RawImage)
            const mask = output[0]; 
            
            const originalImg = new Image();
            originalImg.src = imageSrc;
            await new Promise(r => originalImg.onload = r);

            const canvas = document.createElement('canvas');
            canvas.width = originalImg.width;
            canvas.height = originalImg.height;
            const ctx = canvas.getContext('2d');

            // 1. Disegna immagine originale
            ctx.drawImage(originalImg, 0, 0);
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            // 2. Prepara la maschera (ridimensionata al canvas originale)
            const maskCanvas = mask.toCanvas(); 
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(maskCanvas, 0, 0, canvas.width, canvas.height);
            const maskData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);

            // 3. Applica Alpha Channel dalla maschera all'immagine
            for (let i = 0; i < imgData.data.length; i += 4) {
                // Usa il canale rosso della maschera come alpha
                const alpha = maskData.data[i]; 
                imgData.data[i + 3] = alpha; 
            }

            ctx.putImageData(imgData, 0, 0);

            const processedUrl = canvas.toDataURL('image/png');
            setProcessedImageSrc(processedUrl);

        } catch (error) {
            console.error("Transformers.js Error:", error);
            setAiError("Errore AI: " + (error.message || "Modello non supportato. Usa il ritaglio manuale."));
        } finally {
            setIsProcessingAI(false);
        }
    };

    // 5. Upload Effettivo
    const uploadFile = async (fileToUpload) => {
        setLoading(true);
        const formData = new FormData();
        formData.append('file', fileToUpload);
        formData.append('entita_tipo', entita_tipo);
        formData.append('entita_id', entita_id);
        formData.append('privacy', defaultPrivacy);

        try {
            await api.post('/documenti/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchAllegati();
            setIsEditorOpen(false);
            setProcessedImageSrc(null);
        } catch (error) {
            console.error("Errore upload:", error);
            alert("Errore durante l'upload del file.");
        } finally {
            setLoading(false);
        }
    };

    // Gestione salvataggio unificata
    const handleSave = async () => {
        if (!currentFile) return;

        try {
            let fileToUpload;

            if (processedImageSrc) {
                // Salva risultato AI
                const res = await fetch(processedImageSrc);
                const blob = await res.blob();
                fileToUpload = new File([blob], currentFile.name.replace(/\.[^/.]+$/, "") + "_nobg.png", { type: "image/png" });
            } else if (imageSrc) {
                // Salva ritaglio manuale (Fallback)
                // Se non c'è pixelCrop (es. zoom e posiz. default), usa immagine intera
                if (!croppedAreaPixels) {
                     const res = await fetch(imageSrc);
                     const blob = await res.blob();
                     fileToUpload = new File([blob], currentFile.name, { type: currentFile.type });
                } else {
                    const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
                    const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
                    const compressedFile = await imageCompression(croppedBlob, options);
                    fileToUpload = new File([compressedFile], currentFile.name, { type: currentFile.type });
                }
            } else {
                fileToUpload = currentFile;
            }

            await uploadFile(fileToUpload);

        } catch (e) {
            console.error(e);
            alert("Errore durante il salvataggio.");
        }
    };

    // 6. Eliminazione e Download
    const confirmDelete = async () => {
        if (!allegatoToDelete) return;
        try {
            await api.delete(`/documenti/link/${allegatoToDelete.id_link}`);
            setAllegati(prev => prev.filter(a => a.id_link !== allegatoToDelete.id_link));
            setIsAllegatoDeleteModalOpen(false);
            setAllegatoToDelete(null);
        } catch (error) {
            console.error("Errore eliminazione:", error);
            alert("Errore eliminazione file.");
        }
    };

    const handleDownload = async (id_file, fileName) => {
        try {
            const res = await api.get(`/documenti/download/${id_file}`);
            if (res.data.success) {
                const link = document.createElement('a');
                link.href = res.data.url;
                link.setAttribute('download', fileName);
                link.setAttribute('target', '_blank');
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
            }
        } catch (error) {
            console.error("Errore download:", error);
        }
    };

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    return (
        <div className="mt-4">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <ArchiveBoxIcon className="w-4 h-4"/> Allegati
                </h3>
                <span className="text-xs text-gray-500">{allegati.length} file</span>
            </div>

            {/* Dropzone e Pulsante Camera */}
            {hasPermission('DM_FILE_UPLOAD') && (
                <div className="flex gap-2 mb-4">
                    <div {...getRootProps()} 
                        className={`flex-1 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
                        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}`}>
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center justify-center">
                            <CloudArrowUpIcon className="h-8 w-8 text-gray-400" />
                            <span className="mt-1 text-xs text-gray-500">Carica File</span>
                        </div>
                    </div>
                    
                    <button 
                        onClick={startCamera}
                        className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center hover:bg-gray-50 hover:border-gray-400 transition-colors text-gray-500"
                    >
                        <CameraIcon className="h-8 w-8" />
                        <span className="mt-1 text-xs">Scatta Foto</span>
                    </button>
                </div>
            )}

            {/* Lista Allegati */}
            <div className="space-y-2">
                {loading && <div className="text-center text-xs text-gray-500">Caricamento...</div>}
                {allegati.map((file) => (
                    <div key={file.id_link} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <FileIconHelper mimeType={file.mime_type} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate max-w-[150px] sm:max-w-[200px]" title={file.file_name_originale}>
                                    {file.file_name_originale}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {(file.file_size_bytes / 1024).toFixed(1)} KB • {new Date(file.uploaded_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={() => handleDownload(file.id_file, file.file_name_originale)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full" title="Scarica">
                                <ArrowDownTrayIcon className="w-4 h-4" />
                            </button>
                            {hasPermission('DM_FILE_DELETE') && (
                                <button onClick={() => { setAllegatoToDelete(file); setIsAllegatoDeleteModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full" title="Elimina">
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* MODALE UNIFICATO: CAMERA + EDITOR */}
            {isEditorOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95">
                    <div className="w-full max-w-4xl h-[90vh] bg-black md:bg-white md:rounded-xl overflow-hidden flex flex-col">
                        
                        {/* Header */}
                        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-800 md:border-gray-200 bg-black md:bg-white text-white md:text-gray-800">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                {isCameraMode ? <VideoCameraIcon className="w-5 h-5"/> : <CameraIcon className="w-5 h-5"/>}
                                {isCameraMode ? 'Scatta Foto' : 'Modifica Immagine'}
                            </h3>
                            <button onClick={() => { setIsEditorOpen(false); stopCamera(); }} className="p-2 hover:bg-gray-700 md:hover:bg-gray-200 rounded-full">
                                <XMarkIcon className="w-6 h-6"/>
                            </button>
                        </div>

                        {/* Area Centrale */}
                        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
                            {isCameraMode ? (
                                // VISTA FOTOCAMERA
                                <div className="relative w-full h-full flex items-center justify-center">
                                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                                    <button onClick={capturePhoto} className="absolute bottom-8 w-16 h-16 bg-white rounded-full border-4 border-gray-300 shadow-lg hover:bg-gray-100 transition-transform active:scale-95 flex items-center justify-center" />
                                </div>
                            ) : processedImageSrc ? (
                                // VISTA AI RESULT (Trasparenza)
                                <div className="w-full h-full flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/checkered-light-emboss.png')]">
                                    <img src={processedImageSrc} alt="Processed" className="max-h-full max-w-full object-contain shadow-2xl" />
                                </div>
                            ) : (
                                // VISTA CROPPER (Sempre disponibile se no AI result)
                                <Cropper
                                    image={imageSrc}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={4 / 3}
                                    onCropChange={setCrop}
                                    onCropComplete={onCropComplete}
                                    onZoomChange={setZoom}
                                />
                            )}

                            {/* Messaggio Errore AI (Non bloccante) */}
                            {aiError && (
                                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 shadow-lg backdrop-blur-sm z-50">
                                    <ExclamationTriangleIcon className="w-5 h-5" />
                                    {aiError}
                                    <button onClick={() => setAiError(null)} className="ml-2 font-bold">&times;</button>
                                </div>
                            )}
                        </div>

                        {/* Footer Controlli (Solo per Editor) */}
                        {!isCameraMode && (
                            <div className="p-4 bg-white border-t border-gray-200 flex flex-col gap-4">
                                {!processedImageSrc && (
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm text-gray-600 w-12">Zoom</span>
                                        <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(e.target.value)} className="flex-1 h-2 bg-gray-200 rounded-lg cursor-pointer" />
                                    </div>
                                )}
                                <div className="flex justify-end gap-3">
                                    <button onClick={() => setIsEditorOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Annulla</button>
                                    
                                    {processedImageSrc ? (
                                        <>
                                            <button onClick={() => setProcessedImageSrc(null)} className="px-4 py-2 text-blue-600 hover:underline font-medium">Torna all'originale</button>
                                            <button onClick={handleSave} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-md flex items-center gap-2">
                                                <CheckIcon className="w-5 h-5"/> Salva AI
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={handleProcessAI} disabled={isProcessingAI} className="px-4 py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg font-medium flex items-center gap-2">
                                                {isProcessingAI ? <ArrowPathIcon className="w-5 h-5 animate-spin"/> : <SparklesIcon className="w-5 h-5"/>}
                                                {isProcessingAI ? 'Elaborazione...' : 'Rimuovi Sfondo'}
                                            </button>
                                            
                                            {/* PULSANTE SALVA RITAGLIO SEMPRE VISIBILE */}
                                            <button onClick={handleSave} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md flex items-center gap-2">
                                                <CheckIcon className="w-5 h-5"/> Salva Ritaglio
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {isAllegatoDeleteModalOpen && <ConfirmationModal isOpen={isAllegatoDeleteModalOpen} onClose={() => setIsAllegatoDeleteModalOpen(false)} onConfirm={confirmDelete} title="Elimina" message="Sei sicuro?" confirmButtonText="Elimina" confirmButtonColor="red" />}
        </div>
    );
};

export default AllegatiManager;