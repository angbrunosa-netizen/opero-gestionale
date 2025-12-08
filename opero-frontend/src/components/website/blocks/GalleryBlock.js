import React from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';

const GalleryBlock = ({
  gallery,
  images,
  layout = 'grid-3',
  className = '',
  onImageClick,
  showCaptions = true,
  borderRadius = 'medium',
  spacing = 'medium'
}) => {
  if (!images || images.length === 0) {
    return (
      <div className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center ${className}`}>
        <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">Nessuna immagine nella galleria</p>
      </div>
    );
  }

  return (
    <div className={`gallery-block ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div key={image.id || index} className="relative group">
            <img
              src={image.preview_url || image.url_file}
              alt={image.alt_text || image.caption || 'Immagine galleria'}
              className="w-full h-48 object-cover rounded-md cursor-pointer transform transition-transform duration-200 hover:scale-105 hover:shadow-lg"
              onClick={() => onImageClick && onImageClick(image)}
            />
            {showCaptions && image.caption && (
              <div className="absolute inset-x-0 bottom-0 bg-black bg-opacity-75 text-white p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                <p className="text-sm text-center truncate">{image.caption}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GalleryBlock;
