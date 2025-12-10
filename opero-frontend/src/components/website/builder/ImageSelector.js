/**
 * Image Selector
 * Componente per selezione immagini dall'archivio documentale esistente
 * Integrazione con AllegatiManager e archivio.js backend
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  PhotoIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  CheckIcon,
  FolderIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import { api } from '../../../services/api';
import { useDropzone } from 'react-dropzone';

const ImageSelector = ({
  onSelect,
  onClose,
  initialWebsiteId,
  initialPageId,
  multiSelect = false
}) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadMode, setUploadMode] = useState(false);

  // Carica immagini dall'archivio usando l'endpoint corretto
  const loadImages = async () => {
    setLoading(true);
    try {
      const response = await api.get('/archivio/all-files');

      // La risposta ha struttura diversa, adattala
      const files = response.data?.files || response.data || [];

      // Filtra solo file di tipo immagine e entità 'website' o pubblica
      const filteredImages = files.filter(file =>
        file.mime_type && file.mime_type.startsWith('image/') &&
        (file.entita_tipi === 'website' || file.privacy === 'public')
      ).map(file => ({
        ...file,
        // Se previewUrl non esiste, costruiscilo dal S3 key
        previewUrl: file.previewUrl || `https://cdn.operocloud.it/${file.s3_key}`,
        id: file.id_file || file.id // Standardizza l'ID
      }));

      setImages(filteredImages);
    } catch (error) {
      console.error('Errore caricamento immagini:', error);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  // Gestisce selezione immagine
  const handleImageSelect = (image) => {
    if (multiSelect) {
      setSelectedImages(prev => {
        const isSelected = prev.some(img => img.id === image.id);
        if (isSelected) {
          return prev.filter(img => img.id !== image.id);
        } else {
          return [...prev, image];
        }
      });
    } else {
      setSelectedImages([image]);
    }
  };

  // Conferma selezione
  const handleConfirm = () => {
    if (selectedImages.length > 0) {
      if (multiSelect) {
        onSelect(selectedImages);
      } else {
        onSelect(selectedImages[0]);
      }
      onClose();
    }
  };

  // Formatta URL CDN
  const getCdnUrl = (image) => {
    if (image.previewUrl) {
      return image.previewUrl;
    }
    // Fallback al pattern CDN
    return `https://cdn.operocloud.it/${image.s3_key}`;
  };

  // Gestisce upload nuove immagini usando logica AllegatiManager
  const handleUpload = async (files) => {
    if (!initialWebsiteId) {
      alert('ID sito web non disponibile. Assicurati che il sito sia selezionato.');
      return;
    }

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        alert('Solo file immagine sono consentiti');
        continue;
      }

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('entitaTipo', 'website');
        formData.append('entitaId', initialPageId || initialWebsiteId);
        formData.append('privacy', 'public'); // Forza privacy pubblica per sito web

        await api.post('/archivio/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              console.log(`Upload progress: ${percent}%`);
            }
          },
        });
      } catch (error) {
        console.error('Errore upload:', error);
        const errorMessage = error.response?.data?.error || error.message || "Errore sconosciuto";
        alert(`Errore nel caricamento dell'immagine: ${errorMessage}`);
      }
    }

    // Ricarica le immagini dopo l'upload
    await loadImages();
    setUploadMode(false);
  };

  // Configurazione dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleUpload,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.svg']
    },
    multiple: true
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <PhotoIcon className="h-6 w-6 text-blue-500 mr-3" />
            <h2 className="text-xl font-semibold">Seleziona Immagini</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <div className="flex items-center space-x-4 flex-1">
            {/* Title */}
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {uploadMode ? 'Carica Nuove Immagini' : 'Seleziona Immagini dall\'Archivio'}
              </h3>
              <p className="text-sm text-gray-600">
                {uploadMode ? 'Trascina o clicca per caricare' : `${images.length} immagini disponibili`}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              {/* Refresh button */}
              {!uploadMode && (
                <button
                  onClick={loadImages}
                  className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                  title="Ricarica immagini"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              )}

              {/* Toggle Upload */}
              <button
                onClick={() => setUploadMode(!uploadMode)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                {uploadMode ? 'Torna all\'Archivio' : 'Carica Nuove'}
              </button>
            </div>
          </div>

          {/* Selected Counter */}
          {selectedImages.length > 0 && (
            <div className="flex items-center text-sm text-gray-600">
              <CheckIcon className="h-4 w-4 mr-1 text-green-500" />
              {selectedImages.length} selezionat{selectedImages.length > 1 ? 'e' : 'a'}
            </div>
          )}
        </div>

        {/* Upload Area */}
        {uploadMode && (
          <div className="p-6 border-b bg-blue-50">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                isDragActive
                  ? 'border-blue-500 bg-blue-100'
                  : 'border-blue-300 bg-white hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              <input {...getInputProps()} />
              <CloudArrowUpIcon className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isDragActive
                  ? 'Rilascia le immagini qui'
                  : 'Trascina qui le immagini o clicca per selezionarle'
                }
              </h3>
              <p className="text-gray-600">
                JPG, PNG, WebP, GIF, SVG • Multipla selezione supportata
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Le immagini verranno caricate su S3 con accesso pubblico
              </p>
            </div>
          </div>
        )}

        {/* Images Grid */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12">
              <FolderIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nessuna immagine trovata
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery ? 'Prova con altri termini di ricerca' : 'Carica le prime immagini del sito web'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  onClick={() => handleImageSelect(image)}
                  className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImages.some(img => img.id === image.id)
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Image Preview */}
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={getCdnUrl(image)}
                      alt={image.file_name_originale || image.fileName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Selection Overlay */}
                  {selectedImages.some(img => img.id === image.id) && (
                    <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                      <div className="bg-blue-500 rounded-full p-1">
                        <CheckIcon className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  )}

                  {/* Image Info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <p
                      className="text-white text-xs truncate"
                      title={image.file_name_originale || image.fileName}
                    >
                      {image.file_name_originale || image.fileName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {images.length} immagini disponibili
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Annulla
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedImages.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {multiSelect
                ? `Conferma (${selectedImages.length})`
                : 'Conferma Selezione'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageSelector;