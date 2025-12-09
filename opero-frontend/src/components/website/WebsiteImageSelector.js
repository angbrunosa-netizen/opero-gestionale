/**
 * Website Image Selector
 * Componente per selezionare immagini dall'archivio esistente o caricarne di nuove
 * Integrato con il sistema di archivio documentale
 */

import React, { useState, useEffect } from 'react';
import { PhotoIcon, XMarkIcon, CheckIcon, UploadIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { api } from '../../services/api';

const WebsiteImageSelector = ({
  isOpen,
  onClose,
  onSelect,
  websiteId,
  allowMultiple = false
}) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'images', 'this_site'
  const [searchTerm, setSearchTerm] = useState('');
  const [allFiles, setAllFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Carica tutti i file dall'archivio
  const loadAllFiles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/archivio/all-files');
      setAllFiles(response.data || []);
    } catch (err) {
      console.error('Errore caricamento archivio:', err);
      setError(err.response?.data?.error || 'Impossibile caricare i file');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtra i file in base ai criteri
  const filteredFiles = allFiles.filter(file => {
    // Solo immagini
    if (!file.mime_type?.startsWith('image/')) return false;

    // Ricerca testo
    const matchesSearch = !searchTerm ||
      file.file_name_originale?.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtro entità
    if (filter === 'this_site' && websiteId) {
      // Mostra solo i file collegati a questo sito web
      return matchesSearch && file.links_descrizione?.includes('siti_web_aziendali');
    }

    return matchesSearch;
  });

  // Gestisce la selezione dell'immagine
  const handleSelectImage = (file) => {
    console.log('WebsiteImageSelector - handleSelectImage called with file:', file);
    console.log('WebsiteImageSelector - file.id_file:', file.id_file);
    console.log('WebsiteImageSelector - file.previewUrl:', file.previewUrl);

    const imageData = {
      id: file.id_file,
      url: file.previewUrl,
      alt: file.file_name_originale,
      filename: file.file_name_originale,
      privacy: file.privacy
    };

    console.log('WebsiteImageSelector - Created imageData:', imageData);

    if (allowMultiple) {
      const isSelected = selectedImages.find(img => img.id === file.id_file);
      if (isSelected) {
        setSelectedImages(prev => prev.filter(img => img.id !== file.id_file));
      } else {
        setSelectedImages(prev => [...prev, imageData]);
      }
    } else {
      setSelectedImages([imageData]);
    }
  };

  // Conferma la selezione
  const handleConfirm = () => {
    console.log('WebsiteImageSelector - handleConfirm called');
    console.log('WebsiteImageSelector - selectedImages:', selectedImages);
    console.log('WebsiteImageSelector - allowMultiple:', allowMultiple);

    if (selectedImages.length === 0) {
      console.log('WebsiteImageSelector - No images selected');
      return;
    }

    const imageData = allowMultiple ? selectedImages : selectedImages[0];
    console.log('WebsiteImageSelector - Calling onSelect with imageData:', imageData);

    onSelect(imageData);
    handleClose();
  };

  // Chiudi e resetta
  const handleClose = () => {
    onClose();
    setSelectedImages([]);
    setSearchTerm('');
    setFilter('all');
  };

  // Carica i file all'apertura
  useEffect(() => {
    if (isOpen) {
      loadAllFiles();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg w-full h-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {allowMultiple ? 'Seleziona Immagini' : 'Seleziona Immagine'}
            </h3>
            <p className="text-sm text-gray-600">
              {websiteId ? `Sito Web ID: ${websiteId}` : 'Nessun sito selezionato'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Controlli */}
        <div className="p-4 border-b space-y-4">
          {/* Ricerca */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca immagini..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filtri */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Filtra:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-sm rounded-md ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Tutte
              </button>
              {websiteId && (
                <button
                  onClick={() => setFilter('this_site')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    filter === 'this_site'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Questo Sito
                </button>
              )}
            </div>
          </div>

          {/* Selezione attuale */}
          {selectedImages.length > 0 && (
            <div className="flex items-center justify-between bg-blue-50 p-3 rounded-md">
              <span className="text-sm text-blue-800">
                {selectedImages.length} {allowMultiple ? 'immagini selezionate' : 'immagine selezionata'}
              </span>
              <button
                onClick={handleConfirm}
                className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <CheckIcon className="w-4 h-4" />
                Conferma
              </button>
            </div>
          )}
        </div>

        {/* Lista immagini */}
        <div className="flex-1 overflow-auto p-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-center">
                <p className="text-red-600 mb-2">{error}</p>
                <button
                  onClick={loadAllFiles}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Riprova
                </button>
              </div>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-center">
                <PhotoIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nessuna immagine trovata</p>
                {searchTerm && (
                  <p className="text-sm text-gray-400 mt-2">
                    Prova a modificare i filtri di ricerca
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredFiles.map((file) => {
                const isSelected = selectedImages.some(img => img.id === file.id_file);

                return (
                  <div
                    key={file.id_file}
                    onClick={() => handleSelectImage(file)}
                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      isSelected
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* Immagine */}
                    <div className="aspect-square bg-gray-100 relative">
                      <img
                        src={file.previewUrl}
                        alt={file.file_name_originale}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />

                      {/* Badge privacy */}
                      {file.privacy === 'public' ? (
                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                          Pubblico
                        </div>
                      ) : (
                        <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded">
                          Privato
                        </div>
                      )}

                      {/* Overlay selezione */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                          <div className="bg-blue-600 text-white rounded-full p-2">
                            <CheckIcon className="w-4 h-4" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Informazioni file */}
                    <div className="p-2 bg-white">
                      <p className="text-xs text-gray-900 truncate" title={file.file_name_originale}>
                        {file.file_name_originale}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.file_size_bytes / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {filteredFiles.length} immagini disponibili
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Annulla
            </button>
            {selectedImages.length > 0 && (
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {allowMultiple ? `Seleziona (${selectedImages.length})` : 'Seleziona'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteImageSelector;