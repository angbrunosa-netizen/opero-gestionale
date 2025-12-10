/**
 * Gallery Section
 * Componente per gallerie fotografiche con effetti di carosello e transizione
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  PhotoIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlayIcon,
  PauseIcon,
  FolderIcon
} from '@heroicons/react/24/outline';
import ImageSelector from '../ImageSelector';

const GallerySection = ({ data, onChange, onRemove, onMoveUp, onMoveDown, websiteId }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(data.autoplay || false);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const fileInputRef = useRef(null);
  const intervalRef = useRef(null);

  // Gestione autoplay
  useEffect(() => {
    if (isPlaying && data.images?.length > 1) {
      intervalRef.current = setInterval(() => {
        setSelectedImageIndex(prev => (prev + 1) % data.images.length);
      }, data.interval || 3000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying, data.images?.length, data.interval]);

  // Aggiungi immagine
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file, index) => ({
      id: `img_${Date.now()}_${index}`,
      url: URL.createObjectURL(file),
      name: file.name,
      caption: '',
      alt: file.name
    }));

    onChange({
      ...data,
      images: [...(data.images || []), ...newImages]
    });
  };

  // Gestione selezione immagini dall'archivio (multipla)
  const handleImagesSelect = (images) => {
    const newImages = images.map((image, index) => ({
      id: `archive_${image.id}`,
      url: image.previewUrl || `https://cdn.operocloud.it/${image.s3_key}`,
      name: image.file_name_originale,
      caption: '',
      alt: image.file_name_originale,
      imageId: image.id,
      s3Key: image.s3_key
    }));

    onChange({
      ...data,
      images: [...(data.images || []), ...newImages]
    });
    setShowImageSelector(false);
  };

  // Rimuovi immagine
  const removeImage = (imageId) => {
    const image = data.images.find(img => img.id === imageId);
    if (image?.url?.startsWith('blob:')) {
      URL.revokeObjectURL(image.url);
    }

    onChange({
      ...data,
      images: data.images.filter(img => img.id !== imageId)
    });
  };

  // Aggiorna immagine
  const updateImage = (imageId, updates) => {
    onChange({
      ...data,
      images: data.images.map(img =>
        img.id === imageId ? { ...img, ...updates } : img
      )
    });
  };

  // Sposta immagine
  const moveImage = (index, direction) => {
    const newImages = [...data.images];
    const [removed] = newImages.splice(index, 1);

    if (direction === 'up' && index > 0) {
      newImages.splice(index - 1, 0, removed);
    } else if (direction === 'down' && index < newImages.length) {
      newImages.splice(index + 1, 0, removed);
    }

    onChange({ ...data, images: newImages });
  };

  const layoutOptions = [
    { value: 'grid', label: 'Griglia', description: 'Immagini in griglia regolare' },
    { value: 'masonry', label: 'Masonry', description: 'Immagini a cascata' },
    { value: 'carousel', label: 'Carosello', description: 'Slider con navigazione' }
  ];

  const transitionOptions = [
    { value: 'fade', label: 'Dissolvenza' },
    { value: 'slide', label: 'Scorrimento' },
    { value: 'zoom', label: 'Zoom' },
    { value: 'flip', label: 'Ribaltamento' }
  ];

  const gapOptions = [
    { value: 'none', label: 'Nessuno' },
    { value: 'small', label: 'Piccolo' },
    { value: 'medium', label: 'Medio' },
    { value: 'large', label: 'Grande' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <PhotoIcon className="h-6 w-6 text-blue-500 mr-3" />
          <h3 className="text-lg font-semibold">Galleria Fotografica</h3>
        </div>
        <div className="flex items-center space-x-2">
          {onMoveUp && (
            <button
              onClick={onMoveUp}
              className="p-2 text-gray-400 hover:text-gray-600"
              title="Sposta su"
            >
              <ArrowUpIcon className="h-4 w-4" />
            </button>
          )}
          {onMoveDown && (
            <button
              onClick={onMoveDown}
              className="p-2 text-gray-400 hover:text-gray-600"
              title="Sposta giù"
            >
              <ArrowDownIcon className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onRemove}
            className="p-2 text-red-400 hover:text-red-600"
            title="Rimuovi sezione"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Configurazione Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Layout</label>
          <select
            value={data.layout || 'grid'}
            onChange={(e) => onChange({ ...data, layout: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {layoutOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Colonne (Griglia)</label>
          <select
            value={data.columns || 3}
            onChange={(e) => onChange({ ...data, columns: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            disabled={data.layout === 'carousel'}
          >
            {[1, 2, 3, 4, 5, 6].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Spaziatura</label>
          <select
            value={data.gap || 'medium'}
            onChange={(e) => onChange({ ...data, gap: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {gapOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Transizione</label>
          <select
            value={data.transition || 'fade'}
            onChange={(e) => onChange({ ...data, transition: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {transitionOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Opzioni Carosello */}
      {data.layout === 'carousel' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-blue-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Autoplay</label>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                {isPlaying ? (
                  <>
                    <PauseIcon className="h-3 w-3 mr-1" />
                    Pausa
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-3 w-3 mr-1" />
                    Play
                  </>
                )}
              </button>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={data.autoplay || false}
                  onChange={(e) => onChange({ ...data, autoplay: e.target.checked })}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">Automatico</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Intervallo (ms)</label>
            <input
              type="number"
              value={data.interval || 3000}
              onChange={(e) => onChange({ ...data, interval: parseInt(e.target.value) })}
              min="1000"
              max="10000"
              step="500"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Navigazione</label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={data.showNavigation !== false}
                onChange={(e) => onChange({ ...data, showNavigation: e.target.checked })}
                className="h-4 w-4 text-blue-600"
              />
              <span className="ml-2 text-sm text-gray-700">Mostra frecce</span>
            </label>
          </div>
        </div>
      )}

      {/* Opzioni Generali */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={data.showCaptions !== false}
              onChange={(e) => onChange({ ...data, showCaptions: e.target.checked })}
              className="h-4 w-4 text-blue-600"
            />
            <span className="ml-2 text-sm text-gray-700">Mostra didascalie</span>
          </label>
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={data.enableLightbox !== false}
              onChange={(e) => onChange({ ...data, enableLightbox: e.target.checked })}
              className="h-4 w-4 text-blue-600"
            />
            <span className="ml-2 text-sm text-gray-700">Lightbox al click</span>
          </label>
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={data.lazyLoad !== false}
              onChange={(e) => onChange({ ...data, lazyLoad: e.target.checked })}
              className="h-4 w-4 text-blue-600"
            />
            <span className="ml-2 text-sm text-gray-700">Caricamento lazy</span>
          </label>
        </div>
      </div>

      {/* Upload Immagini */}
      <div className="mb-6 space-y-3">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all group"
        >
          <div className="text-center">
            <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-2 group-hover:text-blue-500 group-hover:scale-110 transition-all" />
            <div className="text-gray-600 group-hover:text-blue-600">
              <span className="font-medium">Carica dal computer</span> o trascina qui
            </div>
            <div className="text-sm text-gray-500 mt-1">
              JPG, PNG, WebP fino a 10MB per file
            </div>
          </div>
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">oppure</span>
          </div>
        </div>

        <button
          onClick={() => setShowImageSelector(true)}
          className="w-full p-6 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all group"
        >
          <div className="text-center">
            <FolderIcon className="h-12 w-12 text-blue-400 mx-auto mb-2 group-hover:text-blue-500 group-hover:scale-110 transition-all" />
            <div className="text-blue-600 group-hover:text-blue-700">
              <span className="font-medium">Seleziona multipli dall'archivio</span>
            </div>
            <div className="text-sm text-blue-500 mt-1">
              Sfoglia le immagini già caricate su S3
            </div>
          </div>
        </button>
      </div>

      {/* Elenco Immagini */}
      {data.images && data.images.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Immagini ({data.images.length})</h4>

          {data.layout === 'carousel' ? (
            // Vista Carosello
            <div className="relative bg-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-sm font-medium text-gray-700">Anteprima Carosello</h5>
                <div className="text-sm text-gray-500">
                  {selectedImageIndex + 1} / {data.images.length}
                </div>
              </div>

              <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden">
                {data.images[selectedImageIndex] && (
                  <img
                    src={data.images[selectedImageIndex].url}
                    alt={data.images[selectedImageIndex].alt}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Navigazione */}
                {data.showNavigation !== false && (
                  <>
                    <button
                      onClick={() => setSelectedImageIndex(prev => prev === 0 ? data.images.length - 1 : prev - 1)}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full"
                    >
                      ‹
                    </button>
                    <button
                      onClick={() => setSelectedImageIndex(prev => (prev + 1) % data.images.length)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full"
                    >
                      ›
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail */}
              <div className="flex space-x-2 mt-4 overflow-x-auto">
                {data.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      index === selectedImageIndex ? 'border-blue-500' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Vista Griglia/Masonry
            <div className={`grid gap-4 ${
              data.layout === 'grid'
                ? `grid-cols-${Math.min(data.columns || 3, 6)}`
                : 'columns-1 md:columns-2 lg:columns-3 xl:columns-4'
            }`}>
              {data.images.map((image, index) => (
                <div
                  key={image.id}
                  className={`relative group bg-white border border-gray-200 rounded-lg overflow-hidden ${
                    data.layout === 'masonry' ? 'break-inside-avoid mb-4' : ''
                  }`}
                >
                  <div className={`aspect-video bg-gray-100 ${data.layout === 'masonry' ? '' : 'h-48'}`}>
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-3">
                    <input
                      type="text"
                      value={image.caption || ''}
                      onChange={(e) => updateImage(image.id, { caption: e.target.value })}
                      placeholder="Didascalia (opzionale)"
                      className="w-full text-sm border border-gray-200 rounded px-2 py-1"
                    />
                  </div>

                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                    {index > 0 && (
                      <button
                        onClick={() => moveImage(index, 'up')}
                        className="p-1 bg-white/80 rounded text-gray-600 hover:text-gray-800"
                      >
                        ↑
                      </button>
                    )}
                    {index < data.images.length - 1 && (
                      <button
                        onClick={() => moveImage(index, 'down')}
                        className="p-1 bg-white/80 rounded text-gray-600 hover:text-gray-800"
                      >
                        ↓
                      </button>
                    )}
                    <button
                      onClick={() => removeImage(image.id)}
                      className="p-1 bg-red-500/80 rounded text-white hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messaggio se nessuna immagine */}
      {(!data.images || data.images.length === 0) && (
        <div className="text-center py-8 text-gray-500">
          <PhotoIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <div>Nessuna immagine aggiunta</div>
          <div className="text-sm">Clicca sopra per aggiungere le tue foto</div>
        </div>
      )}
    )}

      {/* Image Selector Modal */}
      {showImageSelector && (
        <ImageSelector
          onSelect={handleImagesSelect}
          onClose={() => setShowImageSelector(false)}
          initialWebsiteId={websiteId}
          initialPageId={null}
          multiSelect={true}
        />
      )}
    </div>
  );
};

export default GallerySection;