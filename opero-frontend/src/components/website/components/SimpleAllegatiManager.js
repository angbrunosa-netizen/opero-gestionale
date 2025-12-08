/**
 * SimpleAllegatiManager Component
 * Versione semplificata per l'upload di immagini del sito web
 */

import React, { useState } from 'react';
import {
  PhotoIcon,
  ArrowUpTrayIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// Importa il servizio API
import { api } from '../../../services/api';

const SimpleAllegatiManager = ({
  refId = 'website',
  refType = 'website',
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxSize = 5 * 1024 * 1024, // 5MB
  maxFiles = 10,
  autoUpload = true,
  showPreview = true,
  onFilesUploaded = () => {}
}) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

  const handleFiles = (selectedFiles) => {
    const validFiles = selectedFiles.filter(file => {
      // Controllo tipo file
      if (!allowedTypes.includes(file.type)) {
        return false;
      }
      // Controllo dimensione
      if (file.size > maxSize) {
        return false;
      }
      return true;
    });

    // Limita numero di file
    const remainingSlots = maxFiles - files.length;
    const filesToAdd = validFiles.slice(0, remainingSlots);

    const newFiles = filesToAdd.map(file => ({
      file,
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      previewUrl: URL.createObjectURL(file),
      status: 'pending',
      progress: 0
    }));

    setFiles([...files, ...newFiles]);

    if (autoUpload) {
      uploadFiles(newFiles);
    }
  };

  const uploadFiles = async (filesToUpload) => {
    console.log('🔥 [UPLOAD FILES] Inizio upload per', filesToUpload.length, 'files');
    console.log('🔥 [UPLOAD FILES] refId:', refId, 'refType:', refType);

    for (const fileObj of filesToUpload) {
      try {
        console.log('🔥 [UPLOAD FILES] Processing file:', fileObj);

        // Aggiorna stato
        setFiles(prev => prev.map(f =>
          f.id === fileObj.id
            ? { ...f, status: 'uploading', progress: 0 }
            : f
        ));

        // Crea FormData
        const formData = new FormData();
        formData.append('file', fileObj.file);
        formData.append('refId', refId);
        formData.append('refType', refType);

        console.log('🔥 [UPLOAD FILES] FormData preparato, chiamo API...');

        // Simula upload progress
        const progressInterval = setInterval(() => {
          setFiles(prev => prev.map(f => {
            if (f.id === fileObj.id && f.status === 'uploading') {
              const newProgress = Math.min(f.progress + 10, 90);
              return { ...f, progress: newProgress };
            }
            return f;
          }));
        }, 200);

        // Chiama API di upload reale
        try {
          console.log('🔥 [UPLOAD FILES] Chiamo API:', `/website/${refId}/upload`);

          // Chiamata API reale (uso il formData già creato sopra)
          const response = await api.post(`/website/${refId}/upload`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              console.log('🔥 [UPLOAD FILES] Progress:', progress + '%');
              setFiles(prev => prev.map(f =>
                f.id === fileObj.id
                  ? { ...f, progress: Math.min(progress, 90) }
                  : f
              ));
            }
          });

          console.log('🔥 [UPLOAD FILES] Risposta API:', response.data);

          if (response.data.success) {
            console.log('🔥 [UPLOAD FILES] Upload success! Aggiorno stato file');
            setFiles(prev => prev.map(f =>
              f.id === fileObj.id
                ? {
                    ...f,
                    status: 'completed',
                    progress: 100,
                    ...response.data.file
                  }
                : f
            ));
          } else {
            console.error('🔥 [UPLOAD FILES] Upload fallito:', response.data.error);
            throw new Error(response.data.error || 'Upload fallito');
          }

        } catch (uploadError) {
          clearInterval(progressInterval);
          console.error('Errore upload:', uploadError);

          setFiles(prev => prev.map(f =>
            f.id === fileObj.id
              ? { ...f, status: 'error', error: uploadError.message }
              : f
          ));
        }

      } catch (error) {
        console.error('Errore gestione file:', error);
        setFiles(prev => prev.map(f =>
          f.id === fileObj.id
            ? { ...f, status: 'error', error: 'Errore durante l\'elaborazione del file' }
            : f
        ));
      }
    }

    // Chiama callback quando tutti gli upload sono completati (usa callback di setFiles)
    const checkCompletedAndCallback = () => {
      setFiles(currentFiles => {
        const completedFiles = currentFiles.filter(f => f.status === 'completed');
        console.log('🔥 [SIMPLE ALLEGATI] Upload completati (callback):', completedFiles);
        console.log('🔥 [SIMPLE ALLEGATI] Stato files corrente:', currentFiles);

        if (completedFiles.length > 0) {
          console.log('🔥 [SIMPLE ALLEGATI] Chiamo onFilesUploaded con:', completedFiles);
          onFilesUploaded(completedFiles);
        } else {
          console.warn('🔥 [SIMPLE ALLEGATI] Nessun file completed trovato!');
        }

        return currentFiles; // Restituisci lo stato senza modificarlo
      });
    };

    // Richiama la funzione dopo un breve delay per assicurarsi che tutti gli aggiornamenti siano completati
    setTimeout(checkCompletedAndCallback, 100);
  };

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) {
      return <PhotoIcon className="h-6 w-6 text-blue-500" />;
    }
    return <div className="h-6 w-6 bg-gray-300 rounded flex items-center justify-center">
      <span className="text-xs text-gray-600">FILE</span>
    </div>;
  };

  return (
    <div className="w-full">
      {/* Upload area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <input
          type="file"
          multiple
          accept={allowedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          id={`file-upload-${refId}`}
          disabled={uploading || files.length >= maxFiles}
        />

        <label htmlFor={`file-upload-${refId}`} className="cursor-pointer">
          {uploading ? (
            <div className="space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600">Caricamento in corso...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Carica immagini
                </p>
                <p className="text-sm text-gray-500">
                  Trascina i file qui sopra o clicca per selezionare
                </p>
                <p className="text-xs text-gray-400">
                  {allowedTypes.join(', ')} • Max {formatFileSize(maxSize)} • Max {maxFiles} file
                </p>
              </div>
            </div>
          )}
        </label>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Files list */}
      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-medium text-gray-900">
            File ({files.length}/{maxFiles})
          </h4>

          {files.map((file) => (
            <div key={file.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {showPreview && file.type.startsWith('image/') && (
                    <img
                      src={file.previewUrl}
                      alt={file.name}
                      className="h-12 w-12 object-cover rounded"
                    />
                  )}

                  {!showPreview && getFileIcon(file.type)}

                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {file.status === 'uploading' && (
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">{file.progress}%</span>
                    </div>
                  )}

                  {file.status === 'completed' && (
                    <CheckIcon className="h-5 w-5 text-green-500" />
                  )}

                  {file.status === 'error' && (
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                  )}

                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Error message for specific file */}
              {file.status === 'error' && file.error && (
                <p className="mt-2 text-xs text-red-600">{file.error}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload completed message */}
      {files.filter(f => f.status === 'completed').length > 0 && !uploading && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center">
            <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-sm text-green-700">
              {files.filter(f => f.status === 'completed').length} file caricati con successo!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleAllegatiManager;