/**
 * @file PublicGallery.js
 * @description Componente per visualizzare gallerie fotografiche nel sito pubblico
 * @version 1.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  PhotoIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { api } from '../../services/api';

const PublicGallery = ({
  siteId,
  galleryId,
  slug,
  layout = 'grid-3',
  className = '',
  showTitle = true,
  showDescription = true,
  maxImages = null,
  lightbox = true
}) => {
  const [gallery, setGallery] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Carica dati galleria
  const loadGallery = useCallback(async () => {
    if (!siteId || (!galleryId && !slug)) return;

    setLoading(true);
    setError(null);

    try {
      let response;

      if (slug) {
        // Carica per slug (richiede endpoint pubblico)
        response = await api.get(`/public/website/${siteId}/galleries/slug/${slug}`);
      } else {
        // Carica per ID
        response = await api.get(`/public/website/${siteId}/galleries/${galleryId}`);
      }

      if (response.data.success) {
        const galleryData = response.data.data;
        setGallery(galleryData.gallery);

        // Applica limite maxImages se specificato
        let processedImages = galleryData.images || [];
        if (maxImages && maxImages > 0) {
          processedImages = processedImages.slice(0, maxImages);
        }

        setImages(processedImages);
      } else {
        setError(response.data.error || 'Galleria non trovata');
      }
    } catch (err) {
      console.error('Errore caricamento galleria:', err);
      setError('Impossibile caricare la galleria');
    } finally {
      setLoading(false);
    }
  }, [siteId, galleryId, slug, maxImages]);

  useEffect(() => {
    loadGallery();
  }, [loadGallery]);

  // Gestione lightbox
  const openLightbox = (index) => {
    if (!lightbox) return;
    setCurrentImageIndex(index);
    setLightboxImage(images[index]);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  const navigateLightbox = (direction) => {
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentImageIndex + 1) % images.length;
    } else {
      newIndex = currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1;
    }
    setCurrentImageIndex(newIndex);
    setLightboxImage(images[newIndex]);
  };

  // Keyboard navigation per lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxImage) return;

      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          navigateLightbox('prev');
          break;
        case 'ArrowRight':
          navigateLightbox('next');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [lightboxImage, currentImageIndex, images.length]);

  // Loading state
  if (loading) {
    return (
      <div className={`bg-gray-100 rounded-lg p-8 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-gray-600">Caricamento galleria...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-8 ${className}`}>
        <div className="text-center">
          <PhotoIcon className="mx-auto h-12 w-12 text-red-400 mb-2" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!images || images.length === 0) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-8 ${className}`}>
        <div className="text-center">
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400 mb-2" />
          <p className="text-gray-500">Nessuna immagine in questa galleria</p>
        </div>
      </div>
    );
  }

  // Layout classes
  const getLayoutClasses = () => {
    switch (layout) {
      case 'grid-2':
        return 'grid grid-cols-2 gap-4';
      case 'grid-3':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
      case 'grid-4':
        return 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3';
      case 'masonry':
        return 'columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4';
      case 'carousel':
        return 'overflow-x-auto pb-4';
      default:
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';
    }
  };

  // Render layout specifico
  const renderImages = () => {
    if (layout === 'carousel') {
      return (
        <div className="flex space-x-4" style={{ width: `${images.length * 320}px` }}>
          {images.map((image, index) => (
            <PublicGalleryImage
              key={image.id}
              image={image}
              index={index}
              layout={layout}
              onClick={() => openLightbox(index)}
              lightbox={lightbox}
            />
          ))}
        </div>
      );
    }

    if (layout === 'masonry') {
      return images.map((image, index) => (
        <div key={image.id} className="break-inside-avoid">
          <PublicGalleryImage
            image={image}
            index={index}
            layout={layout}
            onClick={() => openLightbox(index)}
            lightbox={lightbox}
          />
        </div>
      ));
    }

    // Grid layouts
    return images.map((image, index) => (
      <PublicGalleryImage
        key={image.id}
        image={image}
        index={index}
        layout={layout}
        onClick={() => openLightbox(index)}
        lightbox={lightbox}
      />
    ));
  };

  return (
    <div className={`gallery-container ${className}`}>
      {/* Header */}
      {(showTitle || showDescription) && gallery && (
        <div className="text-center mb-6">
          {showTitle && gallery.nome_galleria && (
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{gallery.nome_galleria}</h2>
          )}
          {showDescription && gallery.descrizione && (
            <p className="text-gray-600 max-w-2xl mx-auto">{gallery.descrizione}</p>
          )}
        </div>
      )}

      {/* Gallery */}
      <div className={getLayoutClasses()}>
        {renderImages()}
      </div>

      {/* Load more button */}
      {maxImages && images.length >= maxImages && hasMore && (
        <div className="text-center mt-6">
          <button
            onClick={() => {
              setPage(prev => prev + 1);
              // Qui implementeresti il caricamento di più immagini
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Carica altre immagini
          </button>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && lightboxImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-7xl w-full">
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 p-2"
            >
              <XMarkIcon className="h-8 w-8" />
            </button>

            {/* Image */}
            <div className="relative">
              <img
                src={lightboxImage.url_file || lightboxImage.previewUrl}
                alt={lightboxImage.alt_text || lightboxImage.file_name_originale}
                className="w-full h-auto max-h-[80vh] object-contain"
              />

              {/* Caption */}
              {lightboxImage.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-4">
                  <p className="text-center">{lightboxImage.caption}</p>
                </div>
              )}
            </div>

            {/* Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => navigateLightbox('prev')}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2"
                >
                  <ChevronLeftIcon className="h-8 w-8" />
                </button>
                <button
                  onClick={() => navigateLightbox('next')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2"
                >
                  <ChevronRightIcon className="h-8 w-8" />
                </button>

                {/* Image counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black bg-opacity-50 px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * PublicGalleryImage Component
 * Componente singolo per immagine pubblica
 */
const PublicGalleryImage = ({
  image,
  index,
  layout,
  onClick,
  lightbox = true
}) => {
  const [loaded, setLoaded] = useState(false);

  const imageClasses = `
    ${lightbox ? 'cursor-pointer' : ''}
    ${loaded ? 'opacity-100' : 'opacity-0'}
    transition-opacity duration-300
  `;

  const containerClasses = {
    'grid-2': 'aspect-square',
    'grid-3': 'aspect-square',
    'grid-4': 'aspect-square',
    'masonry': '',
    'carousel': 'w-80 flex-shrink-0'
  };

  return (
    <div className={`${containerClasses[layout] || containerClasses['grid-3']} relative group overflow-hidden rounded-lg bg-gray-100`}>
      {lightbox && (
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 z-10" />
      )}

      {lightbox && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
          <div className="bg-white bg-opacity-90 rounded-full p-3">
            <EyeIcon className="h-6 w-6 text-gray-800" />
          </div>
        </div>
      )}

      <img
        src={image.url_file || image.previewUrl}
        alt={image.alt_text || image.file_name_originale}
        title={image.title_text}
        className={`${imageClasses} w-full h-full object-cover`}
        onClick={onClick}
        onLoad={() => setLoaded(true)}
        loading="lazy"
      />

      {!loaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}

      {/* Caption overlay */}
      {image.caption && layout !== 'masonry' && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <p className="text-white text-sm">{image.caption}</p>
        </div>
      )}
    </div>
  );
};

export default PublicGallery;