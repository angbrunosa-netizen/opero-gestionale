/**
 * @file ImageGalleryManager.js
 * @description Componente per la gestione delle immagini dei siti web
 * - Integrazione con AllegatiManager esistente
 * - Categorie immagini (logo, banner, gallery, prodotti)
 * - Upload multipli con drag & drop
 * - Preview e organizzazione
 * @version 1.0
 */

import React, { useState, useCallback } from 'react';
import {
  PhotoIcon,
  PlusIcon,
  EyeIcon,
  TrashIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  ArrowUpTrayIcon,
  XMarkIcon,
  CheckCircleIcon,
  RectangleGroupIcon
} from '@heroicons/react/24/outline';
import AllegatiManager from '../../shared/AllegatiManager';

const ImageGalleryManager = ({ images, onUpload, onDelete, onOpenAllegatiManager }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [showPreview, setShowPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Categorie immagini
  const categories = [
    { id: 'all', name: 'Tutte le immagini', icon: RectangleGroupIcon },
    { id: 'logos', name: 'Logo e Brand', icon: PhotoIcon },
    { id: 'banners', name: 'Banner e Header', icon: PhotoIcon },
    { id: 'gallery', name: 'Gallery', icon: PhotoIcon },
    { id: 'products', name: 'Prodotti', icon: PhotoIcon },
    { id: 'team', name: 'Team', icon: PhotoIcon },
    { id: 'blog', name: 'Blog', icon: PhotoIcon },
    { id: 'general', name: 'Generali', icon: FolderIcon }
  ];

  // Filtra immagini
  const filteredImages = images.filter(img => {
    const matchesCategory = selectedCategory === 'all' || img.category === selectedCategory;
    const matchesSearch = img.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Gestione drag & drop
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFilesUpload(e.dataTransfer.files);
    }
  }, []);

  // Upload files
  const handleFilesUpload = async (files) => {
    const imageFiles = Array.from(files).filter(file =>
      file.type.startsWith('image/')
    );

    if (imageFiles.length === 0) {
      alert('Seleziona solo file immagine');
      return;
    }

    const formattedFiles = imageFiles.map(file => ({
      name: file.name,
      file: file,
      type: file.type,
      size: file.size
    }));

    await onUpload(formattedFiles);
  };

  // Selezione immagini
  const toggleImageSelection = (imageId) => {
    const newSelection = new Set(selectedImages);
    if (newSelection.has(imageId)) {
      newSelection.delete(imageId);
    } else {
      newSelection.add(imageId);
    }
    setSelectedImages(newSelection);
  };

  // Elimina immagini selezionate
  const deleteSelectedImages = async () => {
    if (selectedImages.size === 0) return;

    if (!confirm(`Sei sicuro di voler eliminare ${selectedImages.size} immagini?`)) {
      return;
    }

    try {
      await Promise.all(
        Array.from(selectedImages).map(imageId => onDelete(imageId))
      );
      setSelectedImages(new Set());
    } catch (error) {
      console.error('Errore eliminazione immagini:', error);
    }
  };

  // Formatta dimensione file
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Gestione Immagini</h3>
          <p className="text-sm text-gray-600">
            {filteredImages.length} immagini totali
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {selectedImages.size > 0 && (
            <button
              onClick={deleteSelectedImages}
              className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Elimina ({selectedImages.size})
            </button>
          )}

          <button
            onClick={onOpenAllegatiManager}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Seleziona dal Documentale
          </button>
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-4">
          <label className="cursor-pointer">
            <span className="mt-2 block text-sm font-medium text-gray-900">
              Trascina le immagini qui o
            </span>
            <span className="text-blue-600 hover:text-blue-500">carica da computer</span>
            <input
              type="file"
              className="hidden"
              multiple
              accept="image/*"
              onChange={(e) => handleFilesUpload(e.target.files)}
            />
          </label>
          <p className="mt-1 text-xs text-gray-500">
            PNG, JPG, GIF fino a 10MB per file
          </p>
        </div>
      </div>

      {/* Filtro e Ricerca */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Categorie */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-100 text-blue-700 border-blue-200'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                } border`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {category.name}
              </button>
            );
          })}
        </div>

        {/* Ricerca */}
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cerca immagini..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Griglia immagini */}
      {filteredImages.length === 0 ? (
        <div className="text-center py-12">
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nessuna immagine trovata</h3>
          <p className="mt-1 text-sm text-gray-500">
            Prova a modificare i filtri o caricare nuove immagini
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 ${
                selectedImages.has(image.id)
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleImageSelection(image.id)}
            >
              {/* Checkbox selezione */}
              <div className="absolute top-2 left-2 z-10">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  selectedImages.has(image.id)
                    ? 'bg-blue-600 border-blue-600'
                    : 'bg-white border-gray-300'
                }`}>
                  {selectedImages.has(image.id) && (
                    <CheckCircleIcon className="h-3 w-3 text-white" />
                  )}
                </div>
              </div>

              {/* Immagine */}
              <div className="aspect-square bg-gray-100">
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/placeholder-image.png';
                  }}
                />
              </div>

              {/* Overlay informazioni */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="text-white text-xs truncate font-medium">
                    {image.name}
                  </p>
                  <p className="text-white/80 text-xs">
                    {formatFileSize(image.size)}
                  </p>
                </div>
              </div>

              {/* Azioni rapida */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPreview(image);
                  }}
                  className="p-1 bg-white/90 rounded hover:bg-white"
                  title="Anteprima"
                >
                  <EyeIcon className="h-4 w-4 text-gray-700" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(image.id);
                  }}
                  className="p-1 bg-white/90 rounded hover:bg-red-500 hover:text-white"
                  title="Elimina"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>

              {/* Badge categoria */}
              {image.category && image.category !== 'general' && (
                <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  {image.category}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Preview */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={showPreview.url}
              alt={showPreview.name}
              className="max-w-full max-h-[90vh] object-contain"
            />

            {/* Informazioni immagine */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-4">
              <h4 className="font-medium">{showPreview.name}</h4>
              <p className="text-sm text-gray-300">
                Dimensione: {formatFileSize(showPreview.size)} •
                Tipo: {showPreview.type} •
                Categoria: {showPreview.category || 'Generale'}
              </p>
            </div>

            {/* Pulsanti chiusura */}
            <button
              onClick={() => setShowPreview(null)}
              className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20"
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Modal AllegatiManager */}
      <AllegatiManagerModal
        isOpen={onOpenAllegatiManager ? true : false}
        onClose={onOpenAllegatiManager ? () => {} : null}
        onFileSelect={onOpenAllegatiManager ? (files) => {
          const imageFiles = files.filter(file =>
            file.mime_type?.startsWith('image/')
          );
          const formattedFiles = imageFiles.map(file => ({
            name: file.file_name_originale,
            file: file, // Formato compatibile
            type: file.mime_type,
            size: file.file_size_bytes
          }));
          onUpload(formattedFiles);
        } : null}
        allowMultiple={true}
        filterType="image"
      />
    </div>
  );
};

// Wrapper per AllegatiManager modal
const AllegatiManagerModal = ({ isOpen, onClose, onFileSelect, allowMultiple, filterType }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Seleziona Immagini dal Documentale</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
          <AllegatiManager
            entitaTipo="WEBSITE_IMAGES"
            entitaId={1} // placeholder
            onFileSelect={onFileSelect}
            allowMultiple={allowMultiple}
            filterType={filterType}
            showOnly={true}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageGalleryManager;