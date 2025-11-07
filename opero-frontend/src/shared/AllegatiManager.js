/**
 * File: /opero-frontend/src/shared/AllegatiManager.js
 *
 * Versione: 1.5.0 (Fix Rules of Hooks + Fix Conflitto Modal)
 *
 * Descrizione: Componente React riutilizzabile per la gestione
 * degli allegati (upload, download, delete) collegati a
 * qualsiasi entità del gestionale (Beni, Scritture, ecc.).
 * Utilizza l'architettura S3 pre-firmata.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { api } from '../services/api'; // Import nominato
import axios from 'axios'; // Necessario per l'upload diretto a S3
import { useAuth } from '../context/AuthContext';
import ConfirmationModal from './ConfirmationModal'; // Assumendo che esista

// Import icone (lucide-react)
import {
    Paperclip,
    Download,
    Trash2,
    FileText,
    FileImage,
    FileArchive,
    File,
    AlertTriangle,
    UploadCloud,
    Loader2
} from 'lucide-react';

// --- Helper Interni ---

const FileIcon = ({ mimeType }) => {
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

// --- Componente Principale ---

const AllegatiManager = ({ entita_tipo, entita_id }) => {
    // 1. CHIAMATE HOOK (TUTTE ALL'INIZIO)
    const { auth } = useAuth(); // Per i permessi
    
    // Stato dati
    const [allegati, setAllegati] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Stato per l'upload
    const [uploadingFiles, setUploadingFiles] = useState([]); // Array di { id, file, progress, error }

    // Stato per il modal di conferma eliminazione (con nomi univoci per evitare conflitti)
    const [isAllegatoDeleteModalOpen, setIsAllegatoDeleteModalOpen] = useState(false);
    const [allegatoLinkToDelete, setAllegatoLinkToDelete] = useState(null);

    // Hook per caricamento dati
    const fetchAllegati = useCallback(async () => {
        if (!entita_tipo || !entita_id) return;
        setIsLoading(true);
        setError(null);
        try {
            const res = await api.get(`/documenti/list/${entita_tipo}/${entita_id}`);
            setAllegati(res.data);
        } catch (err) {
            console.error("Errore nel caricamento degli allegati:", err);
            setError(err.response?.data?.error || "Impossibile caricare gli allegati.");
        } finally {
            setIsLoading(false);
        }
    }, [entita_tipo, entita_id]);

    // Hook Effetto
    useEffect(() => {
        if (auth) { // Esegui solo se l'auth è pronto
            fetchAllegati();
        }
    }, [fetchAllegati, auth]); // Dipende da auth per rieseguire quando auth è pronto
    
    // Logica di UPLOAD (Flusso in 3 fasi)
    const handleUpload = (acceptedFiles) => {
        if (!auth?.hasPermission('DM_FILE_UPLOAD')) return;

        const newUploads = acceptedFiles.map(file => ({
            id: `${file.name}-${file.lastModified}`, // ID temporaneo
            file,
            progress: 0,
            error: null,
        }));

        setUploadingFiles(prev => [...prev, ...newUploads]);

        newUploads.forEach(upload => {
            performUpload(upload);
        });
    };
    
    // Hook Dropzone (deve stare all'inizio con gli altri hook)
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: handleUpload,
        // Usiamo optional chaining 'auth?.' per evitare crash se auth è null al primo render
        noClick: !auth?.hasPermission('DM_FILE_UPLOAD'),
        noKeyboard: !auth?.hasPermission('DM_FILE_UPLOAD'),
        disabled: !auth?.hasPermission('DM_FILE_UPLOAD'),
    });

    // 3. GUARDIA DI SICUREZZA (DOPO TUTTI GLI HOOK)
    // Se l'auth non è pronto, ci fermiamo qui per questo render.
    if (!auth) {
        return (
            <div className="flex justify-center items-center py-4">
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                <span className="ml-2 text-gray-500">Caricamento permessi...</span>
            </div>
        );
    }
    // Da qui in poi, 'auth' esiste sicuramente.

    // 4. ALTRE FUNZIONI (Handler e Logica)

    const performUpload = async (upload) => {
        const { file } = upload;

        const setUploadStatus = (progress, error = null) => {
            setUploadingFiles(prev =>
                prev.map(u =>
                    u.id === upload.id
                        ? { ...u, progress, error: error ? error.toString() : null }
                        : u
                )
            );
        };

        try {
            setUploadStatus(10); 
            const resUrl = await api.post('/documenti/generate-upload-url', {
                fileName: file.name,
                fileSize: file.size,
                mimeType: file.type,
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
                s3Key,
                fileName: file.name,
                fileSize: file.size,
                mimeType: file.type,
                entita_tipo,
                entita_id,
            });

            setUploadStatus(100);
            fetchAllegati(); 

            setTimeout(() => {
                setUploadingFiles(prev => prev.filter(u => u.id !== upload.id));
            }, 1000);

        } catch (err) {
            console.error("Errore durante l'upload:", err);
            const errMsg = err.response?.data?.error || err.message || "Errore sconosciuto";
            setUploadStatus(0, errMsg); 
        }
    };

    const handleDownload = async (file) => {
        if (!auth.hasPermission('DM_FILE_VIEW')) return;
        try {
            const res = await api.get(`/documenti/generate-download-url/${file.id_file}`);
            const { downloadUrl } = res.data;
            window.open(downloadUrl, '_blank');
        } catch (err) {
            console.error("Errore nel download:", err);
            setError(err.response?.data?.error || "Impossibile generare il link per il download.");
        }
    };

    const handleDeleteClick = (link) => {
        if (!auth.hasPermission('DM_FILE_DELETE')) return;
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

    // --- 5. RENDERING ---
    return (
        <div className="w-full max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Gestione Allegati</h3>

            {/* Area di Upload (visibile solo con permesso) */}
            {auth.hasPermission('DM_FILE_UPLOAD') && (
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400'}
                    `}
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
                        <p className="text-xs text-gray-500 mt-1">
                            (Documenti, Immagini, ZIP, ecc.)
                        </p>
                    </div>
                </div>
            )}

            {/* Messaggio di Errore Globale */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {/* Lista File in Caricamento */}
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
                                    <div
                                        className={`h-2 rounded-full transition-all ${up.error ? 'bg-red-500' : 'bg-blue-500'}`}
                                        style={{ width: up.error ? '100%' : `${up.progress}%` }}
                                    ></div>
                                </div>
                                {up.error && <p className="text-xs text-red-600 mt-1">{up.error}</p>}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Lista Allegati Esistenti */}
            <div className="mt-6">
                {isLoading && (
                    <div className="flex justify-center items-center py-4">
                        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                        <span className="ml-2 text-gray-500">Caricamento allegati...</span>
                    </div>
                )}

                {!isLoading && allegati.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                        Nessun allegato presente.
                    </div>
                )}

                {!isLoading && allegati.length > 0 && (
                    <ul className="space-y-3">
                        {allegati.map(file => (
                            <li
                                key={file.id_link}
                                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md shadow-sm"
                            >
                                <div className="flex items-center min-w-0 flex-1">
                                    <FileIcon mimeType={file.mime_type} />
                                    <div className="ml-3 min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {file.file_name_originale}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatFileSize(file.file_size_bytes)}
                                            <span className="mx-1">·</span>
                                            Caricato il {formatFileDate(file.created_at)}
                                            {file.utente_upload && ` da ${file.utente_upload}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                                    {auth.hasPermission('DM_FILE_VIEW') && (
                                        <button
                                            onClick={() => handleDownload(file)}
                                            title="Download"
                                            className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100"
                                        >
                                            <Download className="w-5 h-5" />
                                        </button>
                                    )}
                                    {auth.hasPermission('DM_FILE_DELETE') && (
                                        <button
                                            onClick={() => handleDeleteClick(file)}
                                            title="Scollega"
                                            className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Modale di Conferma Eliminazione Allegato (con nomi di stato univoci) */}
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