/**
 * ImageGallery Component
 * Componente per la gestione di gallerie fotografiche con AllegatiManager integration
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  PhotoIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  PencilIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  SparklesIcon,
  ViewColumnsIcon,
  Squares2X2Icon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

import { api } from '../../../services/api';
import WebsiteGalleryService from '../../../services/websiteGalleryService';

const ImageGallery = ({
  pageId,
  siteId,
  sectionData,
  onSectionUpdate,
  isEditing = false,
  previewMode = false
}) => {
  const [layout, setLayout] = useState(sectionData?.layout || 'grid-3');
  const [images, setImages] = useState(sectionData?.images || []);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showLightbox, setShowLightbox] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllegatiManager, setShowAllegatiManager] = useState(false);

  // Stati per gestione persistenza
  const [galleryId, setGalleryId] = useState(sectionData?.gallery_id || null);
  const [galleryName, setGalleryName] = useState(sectionData?.gallery_name || '');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [autoSave, setAutoSave] = useState(sectionData?.auto_save !== false);
  const [lastSaved, setLastSaved] = useState(null);

  const layouts = [
    {
      id: 'grid-2',
      name: 'Griglia 2 Colonne',
      description: '2 immagini per riga',
      icon: ViewColumnsIcon,
      columns: 'grid-cols-2'
    },
    {
      id: 'grid-3',
      name: 'Griglia 3 Colonne',
      description: '3 immagini per riga',
      icon: Squares2X2Icon,
      columns: 'grid-cols-3'
    },
    {
      id: 'grid-4',
      name: 'Griglia 4 Colonne',
      description: '4 immagini per riga',
      icon: Squares2X2Icon,
      columns: 'grid-cols-4'
    },
    {
      id: 'masonry',
      name: 'Masonry',
      description: 'Layout a cascata',
      icon: SparklesIcon,
      columns: 'masonry'
    },
    {
      id: 'carousel',
      name: 'Carousel',
      description: 'Scorrimento orizzontale',
      icon: ArrowsPointingOutIcon,
      columns: 'carousel'
    }
  ];

  useEffect(() => {
    if (sectionData) {
      setLayout(sectionData.layout || 'grid-3');
      setImages(sectionData.images || []);
      setGalleryId(sectionData.gallery_id || null);
      setGalleryName(sectionData.gallery_name || '');
      setAutoSave(sectionData.auto_save !== false);

      // Se c'è un gallery_id ma non ci sono immagini, caricale dal backend
      if (sectionData.gallery_id && (!sectionData.images || sectionData.images.length === 0)) {
        console.log('🔥 ImageGallery: Caricamento immagini mancanti per gallery_id:', sectionData.gallery_id);
        loadGallery(sectionData.gallery_id);
      }
    }
  }, [sectionData]);

  // Auto-save quando cambiano dati
  useEffect(() => {
    if (autoSave && galleryId && !previewMode && isEditing) {
      const timer = setTimeout(() => {
        saveGallery(true);
      }, 2000); // Auto-save dopo 2 secondi di inattività

      return () => clearTimeout(timer);
    }
  }, [images, layout, autoSave, galleryId, previewMode, isEditing]);

  const handleLayoutChange = (newLayout) => {
    setLayout(newLayout);
    if (onSectionUpdate) {
      onSectionUpdate({
        ...sectionData,
        layout: newLayout
      });
    }
  };

  const handleImagesUpdate = (newImages) => {
    setImages(newImages);
    if (onSectionUpdate) {
      onSectionUpdate({
        ...sectionData,
        images: newImages,
        gallery_id: galleryId,
        gallery_name: galleryName,
        auto_save: autoSave
      });
    }
  };

  // Funzione per salvare la galleria
  const saveGallery = useCallback(async (isAutoSave = false) => {
    if (!siteId || (!isAutoSave && !galleryName.trim())) {
      return;
    }

    if (!isAutoSave) {
      setSaving(true);
    }

    try {
      const galleryData = {
        nome_galleria: galleryName || `Galleria ${new Date().toLocaleDateString()}`,
        layout: layout,
        id_pagina: pageId || null,
        impostazioni: {
          auto_save: autoSave,
          created_by: 'website_builder'
        }
      };

      let result;
      if (galleryId) {
        // Aggiorna galleria esistente
        result = await WebsiteGalleryService.updateGallery(siteId, galleryId, galleryData);
      } else {
        // Crea nuova galleria
        result = await WebsiteGalleryService.createGallery(siteId, galleryData);
        setGalleryId(result.id);
      }

      // Sincronizza immagini
      if (images.length > 0) {
        const syncResult = await WebsiteGalleryService.syncGalleryImages(
          siteId,
          result.id || galleryId,
          images.map(img => ({
            id_file: img.id_file,
            caption: img.caption || '',
            alt_text: img.alt_text || img.file_name_originale,
            title_text: img.title_text || img.file_name_originale,
            order_pos: img.order_pos || 0
          }))
        );
      }

      // Aggiorna section data
      if (onSectionUpdate) {
        onSectionUpdate({
          ...sectionData,
          gallery_id: result.id || galleryId,
          gallery_name: galleryName,
          layout: layout,
          images: images,
          auto_save: autoSave,
          last_saved: new Date().toISOString()
        });
      }

      setLastSaved(new Date());

      if (!isAutoSave) {
        setShowSaveModal(false);
      }

    } catch (error) {
      console.error('Errore salvataggio galleria:', error);
      if (!isAutoSave) {
        alert('Errore nel salvataggio: ' + error.message);
      }
    } finally {
      if (!isAutoSave) {
        setSaving(false);
      }
    }
  }, [siteId, pageId, galleryId, galleryName, layout, images, autoSave, sectionData, onSectionUpdate]);

  // Funzione per caricare galleria esistente
  const loadGallery = useCallback(async (galleryIdToLoad) => {
    if (!siteId || !galleryIdToLoad) return;

    setLoading(true);
    try {
      const galleryData = await WebsiteGalleryService.getGalleryDetail(siteId, galleryIdToLoad);

      setLayout(galleryData.gallery.layout);
      setImages(galleryData.images.map(img => ({
        ...img,
        previewUrl: img.preview_url || img.url_file
      })));
      setGalleryName(galleryData.gallery.nome_galleria);

      if (onSectionUpdate) {
        onSectionUpdate({
          ...sectionData,
          gallery_id: galleryData.gallery.id,
          gallery_name: galleryData.gallery.nome_galleria,
          layout: galleryData.gallery.layout,
          images: galleryData.images,
          auto_save: autoSave
        });
      }

    } catch (error) {
      console.error('Errore caricamento galleria:', error);
      alert('Errore nel caricamento della galleria: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [siteId, sectionData, autoSave, onSectionUpdate]);

  const handleImageSelect = async (image) => {
    // Se l'immagine ha un file property, significa che deve essere caricata
    if (image.file) {
      try {
        // Crea FormData per l'upload
        const formData = new FormData();
        formData.append('file', image.file);
        formData.append('refType', 'WEBSITE_IMAGES');

        // Chiama API di upload
        const response = await api.post(`/website/${siteId}/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data.success) {
          // Sostituisci l'immagine fake con quella reale dal server
          const uploadedImage = response.data.file;
          const newImages = [...images, {
            id_file: uploadedImage.id_file,
            file_name_originale: uploadedImage.file_name_originale,
            previewUrl: uploadedImage.url_file || uploadedImage.previewUrl,
            caption: '',
            alt_text: uploadedImage.file_name_originale,
            order: images.length + 1
          }];
          handleImagesUpdate(newImages);
        }
      } catch (error) {
        console.error('Errore upload immagine:', error);
        alert('Errore durante il caricamento dell\'immagine');
      }
    } else {
      // Aggiungi immagine alla gallery se non è già presente (per immagini esistenti)
      if (!images.find(img => img.id_file === image.id_file)) {
        const newImages = [...images, {
          id_file: image.id_file,
          file_name_originale: image.file_name_originale,
          previewUrl: image.previewUrl,
          caption: '',
          alt_text: image.file_name_originale,
          order: images.length + 1
        }];
        handleImagesUpdate(newImages);
      }
    }
  };

  const removeImage = (indexToRemove) => {
    const newImages = images.filter((_, index) => index !== indexToRemove);
    // Ricalcola gli ordini
    const reorderedImages = newImages.map((img, index) => ({
      ...img,
      order: index + 1
    }));
    handleImagesUpdate(reorderedImages);
  };

  const updateImageMetadata = (index, field, value) => {
    const newImages = [...images];
    newImages[index] = {
      ...newImages[index],
      [field]: value
    };
    handleImagesUpdate(newImages);
  };

  const moveImage = (fromIndex, toIndex) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);

    // Ricalcola gli ordini
    const reorderedImages = newImages.map((img, index) => ({
      ...img,
      order: index + 1
    }));

    handleImagesUpdate(reorderedImages);
  };

  const openLightbox = (index) => {
    setCurrentImageIndex(index);
    setSelectedImage(images[index]);
    setShowLightbox(true);
  };

  const navigateLightbox = (direction) => {
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentImageIndex + 1) % images.length;
    } else {
      newIndex = currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1;
    }
    setCurrentImageIndex(newIndex);
    setSelectedImage(images[newIndex]);
  };

  const renderGalleryPreview = () => {
    if (images.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <PhotoIcon className="h-16 w-16 mb-4" />
          <h3 className="text-lg font-medium mb-2">Nessuna immagine nella galleria</h3>
          <p className="text-sm">Aggiungi immagini per creare la tua galleria</p>
        </div>
      );
    }

    const currentLayout = layouts.find(l => l.id === layout);

    if (layout === 'carousel') {
      return (
        <div className="relative">
          <div className="overflow-x-auto pb-4">
            <div className="flex space-x-4" style={{ width: `${images.length * 320}px` }}>
              {images.map((image, index) => (
                <div key={index} className="flex-shrink-0 w-80">
                  <GalleryImage
                    image={image}
                    index={index}
                    isEditing={isEditing}
                    onEdit={() => openLightbox(index)}
                    onRemove={() => removeImage(index)}
                    onUpdate={(field, value) => updateImageMetadata(index, field, value)}
                    previewMode={previewMode}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (layout === 'masonry') {
      return (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
          {images.map((image, index) => (
            <div key={index} className="break-inside-avoid">
              <GalleryImage
                image={image}
                index={index}
                isEditing={isEditing}
                onEdit={() => openLightbox(index)}
                onRemove={() => removeImage(index)}
                onUpdate={(field, value) => updateImageMetadata(index, field, value)}
                previewMode={previewMode}
                aspectRatio="auto"
              />
            </div>
          ))}
        </div>
      );
    }

    // Grid layouts
    const gridClass = currentLayout?.columns || 'grid-cols-3';

    return (
      <div className={`grid ${gridClass} gap-4`}>
        {images.map((image, index) => (
          <GalleryImage
            key={index}
            image={image}
            index={index}
            isEditing={isEditing}
            onEdit={() => openLightbox(index)}
            onRemove={() => removeImage(index)}
            onUpdate={(field, value) => updateImageMetadata(index, field, value)}
            previewMode={previewMode}
            aspectRatio={layout !== 'masonry' ? 'aspect-video' : 'auto'}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header e Controlli */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold text-gray-900">Galleria Immagini</h3>
              {galleryId && (
                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                  <CheckCircleIcon className="h-3 w-3 mr-1" />
                  Salvata
                </span>
              )}
              {lastSaved && (
                <span className="text-xs text-gray-500">
                  Ultimo salvataggio: {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">{images.length} immagini</p>
          </div>

          {isEditing && (
            <div className="flex items-center space-x-3">
              {/* Gallery Name */}
              <input
                type="text"
                placeholder="Nome galleria..."
                value={galleryName}
                onChange={(e) => setGalleryName(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-48"
              />

              {/* Auto-save toggle */}
              <label className="flex items-center text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={autoSave}
                  onChange={(e) => setAutoSave(e.target.checked)}
                  className="mr-2 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                />
                Auto-save
              </label>

              {/* Save Button */}
              <button
                onClick={() => setShowSaveModal(true)}
                disabled={saving}
                className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvataggio...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    Salva Galleria
                  </>
                )}
              </button>

              {/* Layout Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Layout:</span>
                <select
                  value={layout}
                  onChange={(e) => handleLayoutChange(e.target.value)}
                  className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  {layouts.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>

              {/* Add Images Button */}
              <button
                onClick={() => setShowAllegatiManager(true)}
                className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Aggiungi Immagini
              </button>
            </div>
          )}
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="flex items-center justify-center py-2 bg-blue-50 text-blue-600 text-sm rounded">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Caricamento galleria...
          </div>
        )}
      </div>

      {/* Gallery Preview */}
      <div className="bg-gray-50 rounded-lg p-6">
        {renderGalleryPreview()}
      </div>

      {/* AllegatiManager Modal */}
      {showAllegatiManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Seleziona Immagini</h3>
                <button
                  onClick={() => setShowAllegatiManager(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Seleziona le immagini da aggiungere alla galleria
              </p>
            </div>

            <div className="p-6">
              <div className="text-center">
                <p className="text-gray-600 mb-4">Carica immagini dal tuo computer</p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Trascina le immagini qui o clicca per selezionare
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF fino a 10MB
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="mt-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      files.forEach(file => {
                        // Crea preview URL temporaneo
                        const previewUrl = URL.createObjectURL(file);
                        const fakeImage = {
                          id_file: Date.now() + Math.random(),
                          file_name_originale: file.name,
                          previewUrl: previewUrl,
                          size: file.size,
                          file: file // Salva il file per upload futuro
                        };
                        handleImageSelect(fakeImage);
                      });
                    }}
                  />

                  {/* Anteprima immagini selezionate */}
                  {images.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Immagini selezionate:</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {images.map((img, index) => (
                          <div key={index} className="relative">
                            <img
                              src={img.previewUrl}
                              alt={img.file_name_originale}
                              className="w-16 h-16 object-cover rounded border-2 border-gray-200"
                            />
                            <button
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowAllegatiManager(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {showLightbox && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-7xl w-full">
            <button
              onClick={() => setShowLightbox(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
            >
              <ArrowsPointingInIcon className="h-8 w-8" />
            </button>

            <div className="relative">
              <img
                src={selectedImage.previewUrl}
                alt={selectedImage.alt_text}
                className="w-full h-auto max-h-[80vh] object-contain"
              />

              {selectedImage.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-4">
                  <p className="text-center">{selectedImage.caption}</p>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <>
                <button
                  onClick={() => navigateLightbox('prev')}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300"
                >
                  <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" />
                  </svg>
                </button>
                <button
                  onClick={() => navigateLightbox('next')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300"
                >
                  <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Save Confirmation Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Salva Galleria</h4>
              <button
                onClick={() => setShowSaveModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Galleria
                </label>
                <input
                  type="text"
                  value={galleryName}
                  onChange={(e) => setGalleryName(e.target.value)}
                  placeholder="Inserisci un nome per la galleria..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Layout Visualizzazione
                </label>
                <select
                  value={layout}
                  onChange={(e) => setLayout(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  {layouts.map(l => (
                    <option key={l.id} value={l.id}>{l.name} - {l.description}</option>
                  ))}
                </select>
              </div>

              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-600">
                  <strong>Riepilogo:</strong><br/>
                  • {images.length} immagini nella galleria<br/>
                  • Layout: {layouts.find(l => l.id === layout)?.name}<br/>
                  • Auto-save: {autoSave ? 'Attivo' : 'Disattivato'}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                disabled={saving}
              >
                Annulla
              </button>
              <button
                onClick={() => saveGallery(false)}
                disabled={saving || !galleryName.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvataggio...
                  </>
                ) : (
                  'Salva Galleria'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * GalleryImage Component
 * Componente singolo per ogni immagine della galleria
 */
const GalleryImage = ({
  image,
  index,
  isEditing,
  onEdit,
  onRemove,
  onUpdate,
  previewMode,
  aspectRatio = 'aspect-video'
}) => {
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [metadata, setMetadata] = useState({
    caption: image.caption || '',
    alt_text: image.alt_text || image.file_name_originale
  });

  const handleSaveMetadata = () => {
    onUpdate('caption', metadata.caption);
    onUpdate('alt_text', metadata.alt_text);
    setIsEditingMetadata(false);
  };

  if (previewMode) {
    return (
      <div className={`${aspectRatio} bg-gray-100 rounded-lg overflow-hidden group cursor-pointer`}>
        <img
          src={image.previewUrl}
          alt={image.alt_text}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onClick={onEdit}
        />
        {image.caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm">
            {image.caption}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className={`${aspectRatio} bg-gray-100 rounded-lg overflow-hidden`}>
        <img
          src={image.previewUrl}
          alt={image.alt_text}
          className="w-full h-full object-cover cursor-pointer hover:opacity-90"
          onClick={onEdit}
        />
      </div>

      {isEditing && (
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
            <button
              onClick={() => setIsEditingMetadata(true)}
              className="p-2 bg-white text-gray-800 rounded-full hover:bg-gray-100"
              title="Modifica metadati"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onRemove(index)}
              className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50"
              title="Rimuovi"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Edit Metadata Modal */}
      {isEditingMetadata && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h4 className="text-lg font-semibold mb-4">Modifica Metadati Immagine</h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Testo Alternativo (SEO)
                </label>
                <input
                  type="text"
                  value={metadata.alt_text}
                  onChange={(e) => setMetadata({ ...metadata, alt_text: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Descrizione per accessibilità"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Didascalia
                </label>
                <textarea
                  value={metadata.caption}
                  onChange={(e) => setMetadata({ ...metadata, caption: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Didascalia visualizzata sotto l'immagine"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsEditingMetadata(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Annulla
              </button>
              <button
                onClick={handleSaveMetadata}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Salva
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// DEBUG WRAPPER
export default (props) => {
  console.log('🔥🔥 ImageGallery COMPONENT MONTATO!', {
    siteId: props.siteId,
    pageId: props.pageId,
    galleryId: props.sectionData?.gallery_id,
    imagesCount: props.sectionData?.images?.length || 0,
    sectionDataKeys: Object.keys(props.sectionData || {})
  });
  return <ImageGallery {...props} />;
};