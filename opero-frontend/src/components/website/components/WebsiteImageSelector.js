/**
 * WebsiteImageSelector Component
 * Componente specializzato per la selezione di immagini del sito web
 * Integra AllegatiManager per caricare e selezionare immagini
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  PhotoIcon,
  PlusIcon,
  XMarkIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  FolderIcon,
  ArrowsPointingOutIcon
} from '@heroicons/react/24/outline';

// Importa il servizio API
import { api } from '../../../services/api';
import { api as axios } from '../../../services/api';

// Importa il componente AllegatiManager semplificato
import SimpleAllegatiManager from './SimpleAllegatiManager';

const WebsiteImageSelector = ({
  onImageSelect,
  selectedImage,
  multiple = false,
  maxImages = 1,
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxSize = 5 * 1024 * 1024, // 5MB
  websiteId, // Aggiunto websiteId per l'upload
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState('gallery'); // 'gallery' | 'upload'

  // Inizializza le immagini selezionate
  useEffect(() => {
    if (selectedImage) {
      if (multiple && Array.isArray(selectedImage)) {
        setSelectedImages(selectedImage);
      } else {
        setSelectedImages(selectedImage ? [selectedImage] : []);
      }
    }
  }, [selectedImage, multiple]);

  // Carica le immagini dal server (semplificato - usa solo upload)
  // Per evitare loop, aggiungiamo un controllo
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  const loadImages = async () => {
    if (isLoadingImages) return; // Evita richieste multiple

    setIsLoadingImages(true);
    setLoading(true);
    try {
      console.log('🔥 [LOAD IMAGES] Carico immagini esistenti per websiteId:', websiteId);

      // Chiama API per recuperare immagini esistenti
      const response = await api.get(`/website/${websiteId}/images`);
      console.log('🔥 [LOAD IMAGES] Risposta API:', response.data);

      if (response.data.success && response.data.images) {
        setImages(response.data.images);
        setFilteredImages(response.data.images);
        console.log('🔥 [LOAD IMAGES] Caricate', response.data.images.length, 'immagini esistenti');
      } else {
        // Se non ci sono immagini esistenti, mostra un messaggio vuoto
        setImages([]);
        setFilteredImages([]);
        console.log('🔥 [LOAD IMAGES] Nessuna immagine esistente trovata');
      }
    } catch (error) {
      console.error('🔥 [LOAD IMAGES] Errore caricamento immagini:', error);
      // In caso di errore, mostra comunque le immagini di esempio
      const sampleImages = [
        {
          id_file: 'hero-1',
          file_name_originale: 'Hero Business.jpg',
          previewUrl: 'https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=Hero+Image',
          tipo_file: 'image/jpeg',
          dimensione_file: 250000
        },
        {
          id_file: 'about-1',
          file_name_originale: 'About Office.jpg',
          previewUrl: 'https://via.placeholder.com/600x400/6B7280/FFFFFF?text=About+Image',
          tipo_file: 'image/jpeg',
          dimensione_file: 180000
        }
      ];
      setImages(sampleImages);
      setFilteredImages(sampleImages);
    } finally {
      setLoading(false);
      setIsLoadingImages(false);
    }
  };

  // Filtra le immagini in base al termine di ricerca
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredImages(images);
    } else {
      const filtered = images.filter(img =>
        img.file_name_originale.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredImages(filtered);
    }
  }, [searchTerm, images]);

  // Carica le immagini quando il componente si apre (usa ref per evitare loop)
  const hasLoadedImages = useRef(false);
  const loadingTimeout = useRef(null);

  useEffect(() => {
    if (isOpen && websiteId && !hasLoadedImages.current) {
      console.log('🔥 [EFFECT] Caricamento immagini - primo avvio');
      hasLoadedImages.current = true;
      loadImages();
    }
  }, [isOpen, websiteId]);

  // Resetta il flag quando il componente si chiude
  useEffect(() => {
    if (!isOpen) {
      if (loadingTimeout.current) {
        clearTimeout(loadingTimeout.current);
      }
      loadingTimeout.current = setTimeout(() => {
        hasLoadedImages.current = false;
      }, 1000);
    }
    return () => {
      if (loadingTimeout.current) {
        clearTimeout(loadingTimeout.current);
      }
    };
  }, [isOpen]);

  // Gestisce la selezione delle immagini
  const handleImageClick = (image) => {
    if (multiple) {
      const isSelected = selectedImages.some(img => img.id_file === image.id_file);
      if (isSelected) {
        setSelectedImages(selectedImages.filter(img => img.id_file !== image.id_file));
      } else if (selectedImages.length < maxImages) {
        setSelectedImages([...selectedImages, image]);
      }
    } else {
      setSelectedImages([image]);
    }
  };

  // Conferma la selezione
  const handleConfirm = () => {
    if (selectedImages.length > 0) {
      const result = multiple ? selectedImages : selectedImages[0];
      onImageSelect(result);
      setIsOpen(false);
    }
  };

  // Gestisce l'upload completato (usato timeout per evitare setState durante render)
  const handleUploadComplete = useCallback((uploadedFiles) => {
    console.log('🔥 [UPLOAD COMPLETE] Upload completato:', uploadedFiles);

    // Usa setTimeout(0) per evitare setState durante render
    setTimeout(() => {

    // Converti i file caricati nel formato corretto per la galleria
    const newImages = uploadedFiles.map(file => ({
      id_file: file.id_file,
      file_name_originale: file.file_name_originale || file.name,
      previewUrl: file.previewUrl || file.url,
      tipo_file: file.tipo_file || file.type,
      dimensione_file: file.dimensione_file || file.size
    }));

    console.log('🔥 [UPLOAD COMPLETE] Nuove immagini:', newImages);

    // Aggiungi le nuove immagini alla lista
    setImages(prev => {
      const updatedImages = [...prev, ...newImages];
      setFilteredImages(updatedImages);
      console.log('🔥 [UPLOAD COMPLETE] Immagini aggiornate:', updatedImages);
      return updatedImages;
    });

    // SELEZIONA AUTOMATICAMENTE le immagini appena caricate
    if (uploadedFiles.length > 0) {
      if (multiple) {
        // Per selezione multipla, aggiungi alle immagini selezionate esistenti
        setSelectedImages(prev => {
          const selectedNewImages = uploadedFiles.map(file => ({
            id_file: file.id_file,
            file_name_originale: file.file_name_originale || file.name,
            previewUrl: file.previewUrl || file.url
          }));
          const newSelected = [...prev, ...selectedNewImages].slice(0, maxImages);
          console.log('🔥 [UPLOAD COMPLETE] Selezione multipla:', newSelected);
          return newSelected;
        });
      } else {
        // Per selezione singola, seleziona la prima immagine caricata
        const firstImage = uploadedFiles[0];
        const newSelected = [{
          id_file: firstImage.id_file,
          file_name_originale: firstImage.file_name_originale || firstImage.name,
          previewUrl: firstImage.previewUrl || firstImage.url
        }];
        console.log('🔥 [UPLOAD COMPLETE] Selezione singola:', newSelected);
        setSelectedImages(newSelected);
      }
    }

    // Cambia vista a gallery
    setCurrentView('gallery');
    }, 0);
  }, [multiple, maxImages]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${className}`}
      >
        {selectedImages.length > 0 ? (
          <>
            <PhotoIcon className="h-4 w-4 mr-2 text-green-600" />
            {multiple ? `${selectedImages.length} immagini selezionate` : selectedImages[0].file_name_originale}
          </>
        ) : (
          <>
            <PlusIcon className="h-4 w-4 mr-2" />
            {multiple ? 'Seleziona immagini' : 'Seleziona immagine'}
          </>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setIsOpen(false)} />

            <div className="relative inline-block w-full max-w-6xl p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <PhotoIcon className="h-6 w-6 text-blue-600 mr-3" />
                  <h3 className="text-lg font-medium text-gray-900">
                    {multiple ? 'Seleziona Immagini' : 'Seleziona Immagine'}
                  </h3>
                  {multiple && (
                    <span className="ml-3 text-sm text-gray-500">
                      ({selectedImages.length}/{maxImages} selezionate)
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* View Toggle */}
              <div className="flex space-x-1 mb-4 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setCurrentView('gallery')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'gallery'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <PhotoIcon className="h-4 w-4 inline mr-2" />
                  Galleria
                </button>
                <button
                  onClick={() => setCurrentView('upload')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'upload'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <PlusIcon className="h-4 w-4 inline mr-2" />
                  Carica Nuove
                </button>
              </div>

              {/* Content */}
              {currentView === 'gallery' ? (
                <>
                  {/* Search Bar */}
                  <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Cerca immagini per nome..."
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>

                  {/* Images Grid */}
                  <div className="mb-6">
                    {loading ? (
                      <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : filteredImages.length === 0 ? (
                      <div className="text-center py-12">
                        <PhotoIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-sm font-medium text-gray-900 mb-1">
                          {searchTerm ? 'Nessuna immagine trovata' : 'Nessuna immagine disponibile'}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                          {searchTerm ? 'Prova con altri termini di ricerca' : 'Carica delle immagini per iniziare'}
                        </p>
                        <button
                          onClick={() => setCurrentView('upload')}
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Carica Immagini
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                        {filteredImages.map((image, index) => (
                          <div
                            key={`img-${image.id_file}-${index}`}
                            onClick={() => handleImageClick(image)}
                            className={`relative cursor-pointer group rounded-lg overflow-hidden border-2 transition-all ${
                              selectedImages.some(img => img.id_file === image.id_file)
                                ? 'border-blue-500 ring-2 ring-blue-200'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {/* Preview */}
                            <div className="aspect-square bg-gray-100">
                              <img
                                src={image.previewUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmaWxsPSIjNkI3MjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjE0IiBkeT0iLjNlbSI+SW1tYWdpbmU8L3RleHQ+Cjwvc3ZnPg=='}
                                alt={image.file_name_originale}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRUZENkQ2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmaWxsPSIjRDc2ODE2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjEyIiBkeT0iLjNlbSI+RXJyb3JlPC90ZXh0Pgo8L3N2Zz4=';
                                }}
                              />
                            </div>

                            {/* Selection indicator */}
                            {selectedImages.some(img => img.id_file === image.id_file) && (
                              <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1">
                                <CheckIcon className="h-3 w-3" />
                              </div>
                            )}

                            {/* Hover actions */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Qui potremmo aprire un lightbox per vedere l'immagine grande
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-gray-800 p-2 rounded-full"
                              >
                                <ArrowsPointingOutIcon className="h-4 w-4" />
                              </button>
                            </div>

                            {/* Image info */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                              <p className="text-white text-xs truncate">
                                {image.file_name_originale}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="mb-6">
                  <SimpleAllegatiManager
                    refId={websiteId || "website"}
                    refType="website"
                    allowedTypes={allowedTypes}
                    maxSize={maxSize}
                    maxFiles={maxImages}
                    autoUpload={true}
                    showPreview={true}
                    onFilesUploaded={handleUploadComplete}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  {multiple
                    ? `${selectedImages.length} di ${maxImages} immagini selezionate`
                    : selectedImages.length === 1
                    ? '1 immagine selezionata'
                    : 'Nessuna immagine selezionata'
                  }
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Annulla
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={selectedImages.length === 0}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Conferma Selezione
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WebsiteImageSelector;