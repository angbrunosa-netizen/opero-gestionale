import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, Image as ImageIcon, Loader, CheckCircle, AlertCircle, Wand2 } from 'lucide-react';
import { api } from '../../services/api';

const ImportFotoCatalogoModal = ({ isOpen, onClose, onSuccess }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({}); 
  const [options, setOptions] = useState({
    removeBackground: false,
    matchBy: 'codice_ean', 
    overwrite: false
  });
  const [isLibraryLoading, setIsLibraryLoading] = useState(false);
  const [libraryError, setLibraryError] = useState(null);
  const [cancelToken, setCancelToken] = useState(null);
  const cancelTokenRef = useRef(null);
  
  // Aggiorna il ref quando cambia il cancelToken
  useEffect(() => {
    cancelTokenRef.current = cancelToken;
  }, [cancelToken]);

  // Pulisci le risorse quando il componente viene smontato
  useEffect(() => {
    return () => {
      // Revoca gli URL delle anteprime per evitare memory leak
      files.forEach(fileObj => {
        if (fileObj.preview) URL.revokeObjectURL(fileObj.preview);
      });
      
      // Se c'è un'operazione in corso, cancellala
      if (cancelTokenRef.current) {
        cancelTokenRef.current.abort();
      }
    };
  }, [files]);

  const onDrop = useCallback((acceptedFiles) => {
    // Usa requestAnimationFrame per non bloccare l'UI durante il processamento dei file
    requestAnimationFrame(() => {
      const imageFiles = acceptedFiles.filter(file => file.type.startsWith('image/'));
      
      const newFiles = imageFiles.map(file => ({
        file,
        id: `${file.name}-${Date.now()}`, // ID più unico per evitare collisioni
        preview: URL.createObjectURL(file),
        status: 'pending' 
      }));

      setFiles(prev => [...prev, ...newFiles]);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': []
    }
  });

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    const fileToRemove = files.find(f => f.id === fileId);
    if (fileToRemove && fileToRemove.preview) URL.revokeObjectURL(fileToRemove.preview);
  };

  const processFileWithBackgroundRemoval = async (fileObj, removeBackgroundLib) => {
    return new Promise((resolve) => {
      // Usa setTimeout con ritardo 0 per eseguire l'operazione in un altro frame
      setTimeout(async () => {
        try {
          const config = {
            publicPath: 'https://static.img.ly/background-removal-data/1.0.0/', 
            debug: false, // Disabilita il debug in produzione
            device: 'gpu', 
            model: 'small', 
          };

          // Usa la funzione caricata dinamicamente
          const blob = await removeBackgroundLib(fileObj.file, config);
          const processedFile = new File([blob], fileObj.file.name, { type: 'image/png' });
          resolve(processedFile);
        } catch (bgError) {
          console.error("Errore rimozione sfondo:", bgError);
          // In caso di errore, restituisci il file originale
          resolve(fileObj.file);
        }
      }, 0);
    });
  };

  const uploadFile = async (fileObj, removeBackgroundLib, options, abortSignal) => {
    const fileName = fileObj.file.name;
    
    // Controlla se l'operazione è stata cancellata
    if (abortSignal.aborted) {
      throw new Error('Operazione cancellata');
    }
    
    setProgress(prev => ({
      ...prev,
      [fileObj.id]: { status: 'processing', message: options.removeBackground ? 'Rimozione sfondo in corso...' : 'Preparazione...' }
    }));

    let fileToUpload = fileObj.file;

    if (options.removeBackground && removeBackgroundLib) {
      try {
        fileToUpload = await processFileWithBackgroundRemoval(fileObj, removeBackgroundLib);
      } catch (bgError) {
        console.error("Errore rimozione sfondo:", bgError);
        setProgress(prev => ({
          ...prev,
          [fileObj.id]: { status: 'processing', message: 'AI fallita, uso immagine originale...' }
        }));
      }
    }
    
    // Controlla di nuovo se l'operazione è stata cancellata
    if (abortSignal.aborted) {
      throw new Error('Operazione cancellata');
    }

    setProgress(prev => ({
      ...prev,
      [fileObj.id]: { status: 'uploading', message: 'Caricamento sul server...' }
    }));

    const nomeFileSenzaEstensione = fileName.substring(0, fileName.lastIndexOf('.'));
    
    const formData = new FormData();
    formData.append('image', fileToUpload);
    formData.append('matchCode', nomeFileSenzaEstensione);
    formData.append('matchBy', options.matchBy);
    formData.append('fileName', fileName); 

    await api.post('/documenti/upload-e-abbina-catalogo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      signal: abortSignal // Passa il signal di abort alla richiesta API
    });

    setProgress(prev => ({
      ...prev,
      [fileObj.id]: { status: 'success', message: 'Completato' }
    }));
  };

  const handleProcessUploads = async () => {
    setUploading(true);
    setLibraryError(null);
    
    // Crea un AbortController per poter cancellare le operazioni
    const controller = new AbortController();
    setCancelToken(controller);
    
    const initialProgress = {};
    files.forEach(f => {
      initialProgress[f.id] = { status: 'pending', message: 'In coda...' };
    });
    setProgress(initialProgress);

    // Importazione dinamica della libreria solo se serve rimuovere lo sfondo
    let removeBackgroundLib = null;
    if (options.removeBackground) {
        setIsLibraryLoading(true);
        try {
            // Caricamento lazy per non bloccare la UI
            const module = await import('@imgly/background-removal');
            removeBackgroundLib = module.removeBackground || module.default;
        } catch (libError) {
            console.error("Impossibile caricare la libreria di rimozione sfondo", libError);
            setLibraryError("Errore nel caricamento del modulo AI. L'upload procederà senza rimozione sfondo.");
            setOptions(prev => ({ ...prev, removeBackground: false }));
        } finally {
            setIsLibraryLoading(false);
        }
    }

    try {
      // Limita il numero di upload simultanei per non sovraccaricare il browser
      const MAX_CONCURRENT_UPLOADS = 3;
      const chunks = [];
      
      // Dividi i file in chunk
      for (let i = 0; i < files.length; i += MAX_CONCURRENT_UPLOADS) {
        chunks.push(files.slice(i, i + MAX_CONCURRENT_UPLOADS));
      }
      
      // Processa i chunk in sequenza, ma i file all'interno di ogni chunk in parallelo
      for (const chunk of chunks) {
        if (controller.signal.aborted) {
          throw new Error('Operazione cancellata');
        }
        
        await Promise.all(
          chunk.map(fileObj => 
            uploadFile(fileObj, removeBackgroundLib, options, controller.signal)
              .catch(error => {
                // Gestisci gli errori per ogni file singolarmente
                console.error(`Errore upload file ${fileObj.file.name}:`, error);
                
                let errorMsg = 'Errore sconosciuto';
                if (error.response) {
                  errorMsg = error.response.data?.error || error.response.data?.message || `Errore server (${error.response.status})`;
                } else if (error.request) {
                  errorMsg = 'Nessuna risposta dal server';
                } else {
                  errorMsg = error.message;
                }
                
                setProgress(prev => ({
                  ...prev,
                  [fileObj.id]: { status: 'error', message: errorMsg }
                }));
                
                // Non propagare l'errore per non bloccare gli altri upload
                return null;
              })
          )
        );
      }
      
      // Se arriviamo qui, tutti gli upload sono stati completati (con o senza errori)
      if (onSuccess) onSuccess();
    } catch (error) {
      if (error.message !== 'Operazione cancellata') {
        console.error('Errore durante il processamento:', error);
      }
    } finally {
      setUploading(false);
      setCancelToken(null);
    }
  };

  const handleCancel = () => {
    if (cancelTokenRef.current) {
      cancelTokenRef.current.abort();
    }
    setUploading(false);
  };

  // Se il modal non è aperto, non renderizzare nulla
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Upload className="w-6 h-6 text-blue-600" />
            Importazione Massiva Foto
          </h3>
          <button 
            onClick={uploading ? handleCancel : onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* Messaggio di errore per la libreria */}
          {libraryError && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-amber-600 mr-2" />
                <p className="text-sm text-amber-800">{libraryError}</p>
              </div>
            </div>
          )}
          
          {/* Opzioni */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <label className="block text-sm font-medium text-blue-900 mb-2">Metodo di Abbinamento</label>
              <select 
                value={options.matchBy}
                onChange={(e) => setOptions({...options, matchBy: e.target.value})}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                disabled={uploading}
              >
                <option value="codice_ean">Codice a Barre (EAN)</option>
                <option value="codice_entita">Codice Articolo</option>
              </select>
              <p className="text-xs text-blue-700 mt-1">Il nome del file deve corrispondere al codice (es. 800123...jpg)</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
               <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-purple-900">AI Magic Remover</label>
                <Wand2 className="w-4 h-4 text-purple-600" />
               </div>
               <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={options.removeBackground} 
                    onChange={(e) => setOptions({...options, removeBackground: e.target.checked})}
                    className="rounded text-purple-600 focus:ring-purple-500"
                    disabled={uploading || isLibraryLoading}
                  />
                  <span className="text-sm text-purple-800">
                    {isLibraryLoading ? 'Caricamento AI...' : 'Rimuovi sfondo automaticamente'}
                  </span>
               </label>
               <p className="text-xs text-purple-600 mt-1">Richiede più tempo per l'elaborazione.</p>
            </div>

             <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 opacity-50">
                <label className="block text-sm font-medium text-gray-900 mb-2">Sovrascrittura</label>
                 <label className="flex items-center space-x-2">
                  <input type="checkbox" disabled className="rounded text-gray-400" />
                  <span className="text-sm text-gray-500">Sovrascrivi immagini esistenti (WIP)</span>
               </label>
             </div>
          </div>

          {/* Dropzone */}
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer mb-6
              ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
              ${uploading ? 'opacity-50 pointer-events-none' : ''}
            `}
          >
            <input {...getInputProps()} />
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Trascina qui le immagini o clicca per selezionarle</p>
            <p className="text-sm text-gray-400 mt-1">Supportati: JPG, PNG, WEBP</p>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700 sticky top-0 bg-white py-2 border-b">
                File in coda ({files.length})
              </h4>
              {files.map((fileObj) => (
                <div key={fileObj.id} className="flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border border-gray-100 bg-gray-50 relative">
                    <img src={fileObj.preview} alt={fileObj.file.name} className="w-full h-full object-cover" />
                    {progress[fileObj.id]?.status === 'processing' && (
                         <div className="absolute inset-0 bg-black/30 flex items-center justify-center"><Wand2 className="w-6 h-6 text-white animate-pulse" /></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{fileObj.file.name}</p>
                    <p className="text-xs text-gray-500">{(fileObj.file.size / 1024).toFixed(1)} KB</p>
                    
                    {progress[fileObj.id] && (
                      <div className="mt-1 flex items-center gap-2">
                        {progress[fileObj.id].status === 'processing' && <Loader className="w-3 h-3 animate-spin text-purple-500" />}
                        {progress[fileObj.id].status === 'uploading' && <Loader className="w-3 h-3 animate-spin text-blue-500" />}
                        {progress[fileObj.id].status === 'success' && <CheckCircle className="w-3 h-3 text-green-500" />}
                        {progress[fileObj.id].status === 'error' && <AlertCircle className="w-3 h-3 text-red-500" />}
                        
                        <span className={`text-xs font-medium
                          ${progress[fileObj.id].status === 'error' ? 'text-red-600' : 
                            progress[fileObj.id].status === 'success' ? 'text-green-600' : 'text-gray-500'}
                        `}>
                          {progress[fileObj.id].message}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0">
                    {!uploading && progress[fileObj.id]?.status !== 'success' && (
                       <button 
                         onClick={() => removeFile(fileObj.id)}
                         className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
                       >
                         <X className="w-5 h-5" />
                       </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={uploading ? handleCancel : onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {uploading ? 'Annulla' : 'Chiudi'}
          </button>
          <button
            onClick={handleProcessUploads}
            disabled={files.length === 0 || uploading || isLibraryLoading}
            className={`
              px-4 py-2 text-sm font-medium text-white rounded-lg flex items-center gap-2
              ${files.length === 0 || uploading || isLibraryLoading
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm'}
            `}
          >
            {uploading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Elaborazione...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Avvia Importazione
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportFotoCatalogoModal;