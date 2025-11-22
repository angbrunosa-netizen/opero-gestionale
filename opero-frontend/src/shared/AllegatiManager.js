/**
 * File: /opero-frontend/src/shared/AllegatiManager.js
 *
 * Versione: 20.5 (Fix AI - Switch a JSDELIVR CDN & Fallback)
 * - CHANGE: Switch a cdn.jsdelivr.net (più affidabile per WASM/CORS).
 * - FIX: Se l'AI fallisce, l'errore viene gestito e l'utente può caricare l'originale.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { api } from '../services/api';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ConfirmationModal from './ConfirmationModal';
import Cropper from 'react-easy-crop';
import imageCompression from 'browser-image-compression';

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
    if (mimeType.startsWith('image/')) return <PhotoIcon className="w-6 h-6 text-purple-500" />;
    if (mimeType === 'application/pdf') return <DocumentIcon className="w-6 h-6 text-red-500" />;
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return <DocumentIcon className="w-6 h-6 text-green-500" />;
    return <DocumentIcon className="w-6 h-6 text-gray-500" />;
};

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
        }, 'image/jpeg');
    });
};

// ======================================================================
// COMPONENTE PRINCIPALE
// ======================================================================

const AllegatiManager = ({ entita_tipo, entita_id, idDitta, defaultPrivacy = 'private' }) => {
    const { hasPermission, user } = useAuth();
    const [allegati, setAllegati] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isAllegatoDeleteModalOpen, setIsAllegatoDeleteModalOpen] = useState(false);
    const [allegatoToDelete, setAllegatoToDelete] = useState(null);
    
    // Stati Editor
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [currentFile, setCurrentFile] = useState(null);
    const [isProcessingAI, setIsProcessingAI] = useState(false);
    const [processedImageSrc, setProcessedImageSrc] = useState(null); 

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

    // 2. Gestione Dropzone (Apertura Editor)
    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;
        
        // Se è un'immagine, apri l'editor
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImageSrc(reader.result);
                setCurrentFile(file);
                setIsEditorOpen(true);
                setProcessedImageSrc(null); // Reset
            });
            reader.readAsDataURL(file);
        } else {
            // Se non è immagine, carica diretto
            await uploadFile(file);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    // 3. Upload Effettivo
    const uploadFile = async (fileToUpload) => {
        setLoading(true);
        const formData = new FormData();
        formData.append('file', fileToUpload);
        formData.append('entita_tipo', entita_tipo);
        formData.append('entita_id', entita_id);
        formData.append('privacy', defaultPrivacy); // 'public' o 'private'

        try {
            await api.post('/documenti/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchAllegati();
            setIsEditorOpen(false);
        } catch (error) {
            console.error("Errore upload:", error);
            alert("Errore durante l'upload del file.");
        } finally {
            setLoading(false);
        }
    };

    // 4. Funzioni Editor Immagini
    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        if (!imageSrc || !currentFile) return;
        
        try {
            let fileToUpload;

            if (processedImageSrc) {
                const res = await fetch(processedImageSrc);
                const blob = await res.blob();
                fileToUpload = new File([blob], currentFile.name, { type: "image/png" });
            } else {
                const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
                const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
                const compressedFile = await imageCompression(croppedBlob, options);
                fileToUpload = new File([compressedFile], currentFile.name, { type: currentFile.type });
            }

            await uploadFile(fileToUpload);

        } catch (e) {
            console.error(e);
            alert("Errore durante l'elaborazione dell'immagine.");
        }
    };

    // 5. AI REMOVE BACKGROUND (FIX JSDELIVR)
    const handleProcessAI = async () => {
        if (!imageSrc) return;
        setIsProcessingAI(true);
        try {
            const module = await import('@imgly/background-removal');
            const removeBackground = module.removeBackground || module.default; 

            // --- FIX v20.5: Uso JSDELIVR (spesso più affidabile di UNPKG per CORS) ---
            const config = {
                publicPath: 'https://cdn.jsdelivr.net/npm/@imgly/background-removal-data@1.0.6/dist/', 
                debug: true, 
                model: 'small',
            };

            console.log("Avvio AI con JSDELIVR:", config.publicPath);

            const blob = await removeBackground(imageSrc, config);
            const url = URL.createObjectURL(blob);
            setProcessedImageSrc(url); 
        } catch (error) {
            console.error("Errore AI Dettagliato:", error);
            // Messaggio utente più chiaro con suggerimento
            alert("Impossibile scaricare i modelli AI (Errore di Rete/CORS). Verifica la connessione o riprova più tardi. Puoi comunque salvare l'immagine originale.");
        } finally {
            setIsProcessingAI(false);
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
            alert("Impossibile scaricare il file.");
        }
    };

    return (
        <div className="mt-4">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <ArchiveBoxIcon className="w-4 h-4"/> Allegati
                </h3>
                <span className="text-xs text-gray-500">{allegati.length} file</span>
            </div>

            {/* Dropzone */}
            {hasPermission('DM_FILE_UPLOAD') && (
                <div {...getRootProps()} 
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                    ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}`}>
                    <input {...getInputProps()} />
                    <CloudArrowUpIcon className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-xs text-gray-500">Clicca o trascina qui i file</p>
                </div>
            )}

            {/* Lista Allegati */}
            <div className="mt-4 space-y-2">
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
                            <button 
                                onClick={() => handleDownload(file.id_file, file.file_name_originale)}
                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" 
                                title="Scarica/Visualizza"
                            >
                                <ArrowDownTrayIcon className="w-4 h-4" />
                            </button>
                            {hasPermission('DM_FILE_DELETE') && (
                                <button 
                                    onClick={() => { setAllegatoToDelete(file); setIsAllegatoDeleteModalOpen(true); }}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                    title="Elimina"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* MODALE EDITOR / CROPPER / AI */}
            {isEditorOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
                    <div className="w-full max-w-5xl h-[90vh] bg-white rounded-xl overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <CameraIcon className="w-5 h-5"/> Editor Immagine
                            </h3>
                            <button onClick={() => setIsEditorOpen(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500">
                                <XMarkIcon className="w-6 h-6"/>
                            </button>
                        </div>

                        {/* Area di lavoro */}
                        <div className="flex-1 relative bg-gray-900 overflow-hidden">
                            {processedImageSrc ? (
                                <div className="w-full h-full flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/checkered-light-emboss.png')]">
                                    <img src={processedImageSrc} alt="Processed" className="max-h-full max-w-full object-contain shadow-2xl" />
                                </div>
                            ) : (
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
                        </div>

                        {/* Footer Controlli */}
                        <div className="p-4 bg-white border-t">
                            {!processedImageSrc && (
                                <div className="mb-4 flex items-center gap-4">
                                    <span className="text-sm text-gray-600 w-16">Zoom</span>
                                    <input
                                        type="range"
                                        value={zoom}
                                        min={1}
                                        max={3}
                                        step={0.1}
                                        aria-labelledby="Zoom"
                                        onChange={(e) => setZoom(e.target.value)}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                            )}

                            <div className="flex justify-end gap-3">
                                <button onClick={() => setIsEditorOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Annulla</button>
                                
                                {processedImageSrc ? (
                                    <>
                                        <button onClick={() => setProcessedImageSrc(null)} className="px-4 py-2 text-blue-600 hover:underline font-medium">Torna all'originale</button>
                                        <button onClick={handleSave} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-md flex items-center gap-2">
                                            <CheckIcon className="w-5 h-5"/> Conferma e Salva
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button 
                                            onClick={handleProcessAI} 
                                            disabled={isProcessingAI}
                                            className="px-4 py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg font-medium flex items-center gap-2 transition-colors"
                                        >
                                            {isProcessingAI ? (
                                                <>
                                                    <ArrowPathIcon className="w-5 h-5 animate-spin"/> Elaborazione AI...
                                                </>
                                            ) : (
                                                <>
                                                    <SparklesIcon className="w-5 h-5"/> Rimuovi Sfondo
                                                </>
                                            )}
                                        </button>

                                        <button onClick={handleSave} disabled={isProcessingAI} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md">
                                            Salva Ritaglio
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isAllegatoDeleteModalOpen && <ConfirmationModal isOpen={isAllegatoDeleteModalOpen} onClose={() => setIsAllegatoDeleteModalOpen(false)} onConfirm={confirmDelete} title="Elimina" message="Sei sicuro di voler eliminare questo file?" confirmButtonText="Elimina" confirmButtonColor="red" />}
        </div>
    );
};

export default AllegatiManager;