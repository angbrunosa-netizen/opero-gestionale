/**
 * @file opero-frontend/src/components/catalogo/ImportFotoCatalogoModal.js
 * @description Modale per l'import massivo di foto catalogo.
 * - v1.2: Invia 'privacy: "public"' alla nuova API (v3.7)
 * per rendere i file pubblici.
 * @date 2025-11-11
 * @version 1.2
 */

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { XMarkIcon, UploadCloud, CheckCircleIcon, XCircleIcon, SparklesIcon, PhotoIcon, CloudArrowUpIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { removeBackground } from '@imgly/background-removal';

// Funzione helper (invariata)
const extractCodeFromName = (fileName) => {
    let name = fileName.split('.').slice(0, -1).join('.');
    name = name.split('_')[0];
    return name;
};

const ImportFotoCatalogoModal = ({ onClose, onImportSuccess }) => {
    const { hasPermission } = useAuth();
    const [stagedFiles, setStagedFiles] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [removeBg, setRemoveBg] = useState(true);
    const [error, setError] = useState(null);
    const [matchBy, setMatchBy] = useState('codice_entita');

    // onDrop (invariato v1.1)
    const onDrop = useCallback((acceptedFiles) => {
        const newFiles = acceptedFiles
            .filter(file => file.type.startsWith('image/'))
            .map(file => ({
                id: `${file.name}-${file.lastModified}`,
                file: file,
                matchCode: extractCodeFromName(file.name),
                status: 'pending',
                errorMessage: null,
            }));
        setStagedFiles(prev => [...prev, ...newFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
        disabled: isProcessing
    });

    // handleRemoveFile (invariato)
    const handleRemoveFile = (id) => {
        if (isProcessing) return;
        setStagedFiles(prev => prev.filter(f => f.id !== id));
    };

    // --- (MODIFICA v1.2) ---
    const handleProcessUploads = async () => {
        if (!hasPermission('CT_MANAGE') || !hasPermission('DM_FILE_UPLOAD')) {
            setError("Permessi non sufficienti per caricare i file.");
            return;
        }

        setIsProcessing(true);
        setError(null);

        for (let i = 0; i < stagedFiles.length; i++) {
            const stagedFile = stagedFiles[i];

            setStagedFiles(prev => prev.map(f =>
                f.id === stagedFile.id ? { ...f, status: 'processing' } : f
            ));

            let fileToUpload = stagedFile.file;
            let finalFileName = stagedFile.file.name;

            try {
                // 2. Rimozione Sfondo (Invariato)
                if (removeBg) {
                    let imageUrl = null;
                    try {
                        imageUrl = window.URL.createObjectURL(stagedFile.file);
                        const config = {
                            publicPath: `${window.location.origin}/assets/imgly-bg-remover/`
                        };
                        const blob = await removeBackground(imageUrl, config);
                        const originalName = stagedFile.file.name.replace(/\.[^/.]+$/, '');
                        finalFileName = `${originalName}_nobg.png`;
                        fileToUpload = new window.File([blob], finalFileName, {
                            type: 'image/png',
                            lastModified: Date.now(),
                        });
                    } catch (aiErr) {
                        console.error("Errore rimozione sfondo:", aiErr);
                    } finally {
                        if (imageUrl) {
                            window.URL.revokeObjectURL(imageUrl);
                        }
                    }
                }

                // 3. Creazione FormData
                const formData = new FormData();
                formData.append('image', fileToUpload);
                formData.append('matchCode', stagedFile.matchCode);
                formData.append('matchBy', matchBy);
                formData.append('fileName', finalFileName);
                // formData.append('privacy', 'public'); // <-- (MODIFICA v1.2) - Questo non è necessario
                                                      // L'API v3.7 lo imposta già a 'public'
                                                      // per questa rotta specifica.

                // 4. Chiamata API (Invariata)
                await api.post('/documenti/upload-e-abbina-catalogo', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                // 5. Success
                setStagedFiles(prev => prev.map(f =>
                    f.id === stagedFile.id ? { ...f, status: 'success' } : f
                ));

            } catch (uploadErr) {
                console.error(`Errore upload file ${stagedFile.file.name}:`, uploadErr);
                // 6. Error
                setStagedFiles(prev => prev.map(f =>
                    f.id === stagedFile.id ? {
                        ...f,
                        status: 'error',
                        errorMessage: uploadErr.response?.data?.error || uploadErr.message
                    } : f
                ));
            }
        }

        setIsProcessing(false);
    };
    // ---

    // JSX (Render) (Invariato v1.1)
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4 pb-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Import Massivo Foto Catalogo</h2>
                    <button type="button" onClick={onClose} disabled={isProcessing} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 disabled:opacity-50">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Area di Contenuto */}
                <div className="flex-1 overflow-y-auto space-y-6">

                    {/* 1. Dropzone */}
                    {!isProcessing && (
                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
                                isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                            }`}
                        >
                            <input {...getInputProps()} />
                            <div className="flex flex-col items-center">
                                <CloudArrowUpIcon className="w-12 h-12 text-gray-400" />
                                <p className="mt-2 text-gray-600">
                                    Trascina le foto qui, o <span className="font-semibold text-blue-600">clicca per selezionare</span>
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                    Assicurati che i nomi dei file corrispondano ai codici articolo o EAN.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* 2. Scelta Abbinamento */}
                    {stagedFiles.length > 0 && !isProcessing && (
                        <div className="p-4 bg-gray-50 rounded-md border">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Modalità di abbinamento</h4>
                            <fieldset className="space-y-2">
                                <div className="flex items-center">
                                    <input
                                        id="match_by_code"
                                        name="matchBy"
                                        type="radio"
                                        value="codice_entita"
                                        checked={matchBy === 'codice_entita'}
                                        onChange={(e) => setMatchBy(e.target.value)}
                                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                    />
                                    <label htmlFor="match_by_code" className="ml-3 block text-sm text-gray-700">
                                        Abbina per <span className="font-semibold">Codice Articolo</span> (es. "ART-001.jpg")
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        id="match_by_ean"
                                        name="matchBy"
                                        type="radio"
                                        value="codice_ean"
                                        checked={matchBy === 'codice_ean'}
                                        onChange={(e) => setMatchBy(e.target.value)}
                                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                    />
                                    <label htmlFor="match_by_ean" className="ml-3 block text-sm text-gray-700">
                                        Abbina per <span className="font-semibold">Codice EAN</span> (es. "8012345678901.png")
                                    </label>
                                </div>
                            </fieldset>
                        </div>
                    )}

                    {/* 3. Checkbox Rimozione Sfondo */}
                    {stagedFiles.length > 0 && (
                        <div className="flex items-center justify-center p-4 bg-gray-50 rounded-md border">
                            <input
                                type="checkbox"
                                id="removeBg"
                                checked={removeBg}
                                onChange={(e) => setRemoveBg(e.target.checked)}
                                disabled={isProcessing}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="removeBg" className="ml-3 flex items-center text-sm font-medium text-gray-700">
                                <SparklesIcon className="w-5 h-5 mr-1 text-blue-500" />
                                Rimuovi automaticamente lo sfondo (crea .png trasparente)
                            </label>
                        </div>
                    )}

                    {/* 4. Lista File "Staged" */}
                    {stagedFiles.length > 0 && (
                        <div className="space-y-3 max-h-64 overflow-y-auto border rounded-md p-3">
                            {stagedFiles.map(stagedFile => (
                                <div key={stagedFile.id} className="flex items-center p-3 bg-white border rounded-md shadow-sm">
                                    <PhotoIcon className="w-8 h-8 text-gray-400 flex-shrink-0" />
                                    <div className="ml-3 min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gray-900 truncate">{stagedFile.file.name}</p>
                                        <p className="text-sm text-gray-500">
                                            Codice rilevato: <span className="font-semibold text-blue-600">{stagedFile.matchCode}</span>
                                        </p>
                                    </div>
                                    <div className="ml-4 flex-shrink-0">
                                        {stagedFile.status === 'pending' && (
                                            <button onClick={() => handleRemoveFile(stagedFile.id)} disabled={isProcessing} className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50">
                                                <XCircleIcon className="w-6 h-6" />
                                            </button>
                                        )}
                                        {stagedFile.status === 'processing' && <ArrowPathIcon className="w-6 h-6 text-blue-500 animate-spin" />}
                                        {stagedFile.status === 'success' && <CheckCircleIcon className="w-6 h-6 text-green-500" />}
                                        {stagedFile.status === 'error' && (
                                            <div title={stagedFile.errorMessage}>
                                                <XCircleIcon className="w-6 h-6 text-red-500" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 5. Messaggio di Errore Globale */}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-center">
                            {error}
                        </div>
                    )}

                </div>

                {/* Footer Azioni */}
                <div className="mt-6 pt-4 border-t flex justify-end gap-4">
                    <button type="button" onClick={onClose} disabled={isProcessing} className="btn-secondary disabled:opacity-50">
                        Chiudi
                    </button>
                    <button
                        type="button"
                        onClick={handleProcessUploads}
                        disabled={isProcessing || stagedFiles.length === 0}
                        className="btn-primary flex items-center disabled:opacity-50"
                    >
                        {isProcessing ? (
                            <>
                                <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                                Caricamento in corso...
                            </>
                        ) : (
                            `Avvia Import di ${stagedFiles.length} Foto`
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ImportFotoCatalogoModal;