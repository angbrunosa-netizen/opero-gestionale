/**
 * File: /opero-frontend/src/shared/AllegatiManager.js
 *
 * Versione: 1.0.0
 *
 * Descrizione: Componente React condiviso per la gestione degli allegati.
 * Questo componente fornisce un'interfaccia completa per:
 * - Visualizzare l'elenco dei file allegati a una specifica entità.
 * - Caricare nuovi file (con Drag-and-Drop) tramite il flusso S3 in 2 passaggi.
 * - Scaricare file esistenti.
 * - Eliminare/scollegare file (con modale di conferma).
 *
 * Utilizza le API definite in /routes/documenti.js e rispetta
 * i permessi DMS (VIEW, UPLOAD, DELETE) utilizzando l'hook useAuth.
 *
 * Props:
 * - entita_tipo (String): Il tipo di entità a cui allegare i file (es. "bs_bene", "sc_registrazione").
 * - entita_id (Number): L'ID univoco dell'entità.
 *
 * Utilizzo (Esempio in un altro componente):
 * <AllegatiManager entita_tipo="bs_bene" entita_id={bene.id} />
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api'; // Il nostro wrapper Axios
import axios from 'axios'; // Importiamo axios puro per l'upload diretto S3
import ConfirmationModal from './ConfirmationModal';
import { Upload, FileText, Download, Trash2, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

// --- Icona per Tipi di File (Helper) ---
const FileIcon = ({ mimeType }) => {
  if (mimeType.startsWith('image/')) {
    return <FileText className="text-blue-500" size={20} />; // Si potrebbe usare icona Immagine
  }
  if (mimeType === 'application/pdf') {
    return <FileText className="text-red-500" size={20} />; // Si potrebbe usare icona PDF
  }
  return <FileText className="text-gray-500" size={20} />;
};

// --- Formattazione Dimensione (Helper) ---
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// --- Formattazione Data (Helper) ---
const formatFileDate = (dateString) => {
  try {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return 'Data non valida';
  }
};

// --- Componente Principale ---
const AllegatiManager = ({ entita_tipo, entita_id }) => {
  const { hasPermission } = useAuth();
  const [allegati, setAllegati] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadingFiles, setUploadingFiles] = useState({}); // Stato per upload singoli
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [selectedLinkToDelete, setSelectedLinkToDelete] = useState(null);

  // --- Permessi ---
  const canView = hasPermission('DM_FILE_VIEW');
  const canUpload = hasPermission('DM_FILE_UPLOAD');
  const canDelete = hasPermission('DM_FILE_DELETE');

  // --- Funzione per caricare l'elenco dei file ---
  const fetchAllegati = useCallback(async () => {
    if (!canView || !entita_tipo || !entita_id) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/documenti/list/${entita_tipo}/${entita_id}`);
      setAllegati(response.data);
    } catch (err) {
      console.error("Errore fetchAllegati:", err);
      setError("Impossibile caricare l'elenco degli allegati.");
    } finally {
      setIsLoading(false);
    }
  }, [entita_tipo, entita_id, canView]);

  // --- Caricamento iniziale ---
  useEffect(() => {
    fetchAllegati();
  }, [fetchAllegati]);

  // --- Logica di UPLOAD (in 3 passaggi) ---
  const handleUpload = async (files) => {
    if (!canUpload) return;
    
    const newUploads = {};
    files.forEach(file => {
      newUploads[file.name] = { status: 'loading', error: null };
    });
    setUploadingFiles(prev => ({ ...prev, ...newUploads }));

    for (const file of files) {
      try {
        // --- PASSO 1: Chiedi URL pre-firmato al nostro backend ---
        // (il backend controlla la quota qui)
        const genUrlRes = await api.post('/documenti/generate-upload-url', {
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        });
        
        const { uploadUrl, s3Key } = genUrlRes.data;

        // --- PASSO 2: Carica il file direttamente su S3 (Aruba) ---
        // Usiamo axios.put puro, senza interceptor, perché l'URL è già firmato
        await axios.put(uploadUrl, file, {
          headers: {
            'Content-Type': file.type,
          },
        });

        // --- PASSO 3: Finalizza l'upload sul nostro backend ---
        // (il backend salva su DB e aggiorna la quota)
        await api.post('/documenti/finalize-upload', {
          s3Key: s3Key,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          entita_tipo: entita_tipo,
          entita_id: entita_id,
        });

        setUploadingFiles(prev => ({ ...prev, [file.name]: { status: 'completed' }}));
        
      } catch (err) {
        console.error(`Errore upload file ${file.name}:`, err);
        const errorMsg = err.response?.data?.error || 'Errore di rete o S3';
        setUploadingFiles(prev => ({ ...prev, [file.name]: { status: 'error', error: errorMsg }}));
      }
    }
    // Ricarica la lista alla fine di tutti gli upload
    fetchAllegati();
  };
  
  // --- Setup Drag-and-Drop (React-Dropzone) ---
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      handleUpload(acceptedFiles);
    }
  }, [handleUpload]); // handleUpload è già wrappato in useCallback indirettamente (non serve)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: !canUpload
  });

  // --- Logica di DOWNLOAD ---
  const handleDownload = async (fileId) => {
    if (!canView) return;
    try {
      const res = await api.get(`/documenti/generate-download-url/${fileId}`);
      // Apri l'URL in un nuovo tab per avviare il download
      window.open(res.data.downloadUrl, '_blank');
    } catch (err) {
      console.error("Errore download:", err);
      setError("Impossibile generare il link per il download.");
    }
  };

  // --- Logica di ELIMINAZIONE ---
  const handleDeleteClick = (link) => {
    if (!canDelete) return;
    setSelectedLinkToDelete(link);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    if (!selectedLinkToDelete) return;
    
    try {
      await api.delete(`/documenti/link/${selectedLinkToDelete.id_link}`);
      // Rimuovi il file dalla UI e ricarica
      setAllegati(prev => prev.filter(a => a.id_link !== selectedLinkToDelete.id_link));
      // Non è necessario un fetch completo, ma per sicurezza sulla quota si
      fetchAllegati(); // Ricarica per sicurezza (quota)
    } catch (err) {
      console.error("Errore eliminazione:", err);
      setError("Impossibile eliminare l'allegato.");
    } finally {
      setShowConfirmDelete(false);
      setSelectedLinkToDelete(null);
    }
  };


  // --- Rendering ---
  if (!entita_id) {
    return (
      <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded-md">
        <p className="font-semibold text-yellow-800">Salva l'entità</p>
        <p className="text-yellow-700">Non è possibile aggiungere allegati finché questa entità non è stata salvata.</p>
      </div>
    );
  }

  if (!canView) {
    return <p className="text-sm text-gray-500">Non hai i permessi per visualizzare gli allegati.</p>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 border rounded-lg shadow-sm bg-white">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Gestione Allegati</h3>
      
      {/* 1. Area di UPLOAD (Dropzone) */}
      {canUpload && (
        <div
          {...getRootProps()}
          className={`p-6 border-2 border-dashed rounded-md text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center">
            <Upload className="text-gray-500 mb-2" size={32} />
            {isDragActive ? (
              <p className="text-blue-600 font-semibold">Rilascia i file qui...</p>
            ) : (
              <p className="text-gray-600">Trascina i file qui, o <span className="text-blue-600 font-semibold">clicca per selezionare</span></p>
            )}
            <p className="text-xs text-gray-500 mt-1">Visibile solo se hai il permesso DM_FILE_UPLOAD</p>
          </div>
        </div>
      )}

      {/* 2. Lista File in UPLOAD */}
      {Object.keys(uploadingFiles).length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold text-sm mb-2">Upload in corso...</h4>
          <ul className="space-y-2">
            {Object.entries(uploadingFiles).map(([fileName, status]) => (
              <li key={fileName} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                <span className="text-sm text-gray-700 truncate">{fileName}</span>
                {status.status === 'loading' && <Loader2 className="animate-spin text-blue-500" size={18} />}
                {status.status === 'completed' && <CheckCircle className="text-green-500" size={18} />}
                {status.status === 'error' && (
                  <div className="flex items-center" title={status.error}>
                    <AlertCircle className="text-red-500" size={18} />
                    <span className="text-xs text-red-600 ml-2 truncate">{status.error}</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* 3. Lista File ALLEGATI */}
      <div className="mt-5">
        <h4 className="font-semibold text-sm mb-2 text-gray-700">Allegati ({allegati.length})</h4>
        {isLoading && <Loader2 className="animate-spin text-blue-500" size={24} />}
        {error && <p className="text-sm text-red-600">{error}</p>}
        
        {!isLoading && !error && allegati.length === 0 && (
          <p className="text-sm text-gray-500 italic">Nessun allegato presente.</p>
        )}
        
        {!isLoading && !error && allegati.length > 0 && (
          <ul className="divide-y divide-gray-200 border rounded-md">
            {allegati.map((file) => (
              <li key={file.id_link} className="flex items-center justify-between p-3 hover:bg-gray-50">
                <div className="flex items-center min-w-0">
                  <FileIcon mimeType={file.mime_type} />
                  <div className="ml-3 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.file_name_originale}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.file_size_bytes)} - {formatFileDate(file.created_at)}
                      {file.utente_upload && ` - ${file.utente_upload}`}
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0 flex items-center space-x-2">
                  {canView && (
                    <button
                      onClick={() => handleDownload(file.id_file)}
                      title="Scarica"
                      className="p-1 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                    >
                      <Download size={18} />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => handleDeleteClick(file)}
                      title="Elimina"
                      className="p-1 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 4. Modale di CONFERMA ELIMINAZIONE */}
      <ConfirmationModal
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={confirmDelete}
        title="Conferma Eliminazione"
        message={`Sei sicuro di voler scollegare il file "${selectedLinkToDelete?.file_name_originale}"? Se non è collegato ad altre entità, il file verrà eliminato definitivamente.`}
        confirmButtonText="Elimina"
        confirmButtonColor="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
};

export default AllegatiManager;
