/**
 * Image Block Component
 * Blocco per visualizzare una singola immagine con didascalia
 */

import React, { useState } from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';

const ImageBlock = ({ content, onChange, preview = false }) => {
  const [data, setData] = useState({
    url: '',
    alt: 'Descrizione immagine',
    caption: '',
    width: 'full', // full, medium, small
    alignment: 'center', // left, center, right
    ...content
  });

  const handleChange = (field, value) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    onChange(newData);
  };

  const getImageWidth = () => {
    switch (data.width) {
      case 'small':
        return 'max-w-sm';
      case 'medium':
        return 'max-w-2xl';
      default:
        return 'w-full';
    }
  };

  const getImageAlignment = () => {
    switch (data.alignment) {
      case 'left':
        return 'mr-auto';
      case 'right':
        return 'ml-auto';
      default:
        return 'mx-auto';
    }
  };

  if (preview) {
    if (!data.url) {
      return (
        <div className="text-center py-12 bg-gray-100 rounded-lg">
          <PhotoIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Immagine non disponibile</p>
        </div>
      );
    }

    return (
      <div className={`my-8 ${getImageAlignment()}`}>
        <div className={`${getImageWidth()}`}>
          <img
            src={data.url}
            alt={data.alt}
            className="w-full h-auto rounded-lg shadow-lg"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'block';
            }}
          />
          <div
            className="hidden bg-gray-100 rounded-lg flex items-center justify-center"
            style={{ height: '300px' }}
          >
            <PhotoIcon className="h-16 w-16 text-gray-400" />
          </div>
          {data.caption && (
            <p className="text-center text-gray-600 mt-3 italic">{data.caption}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL Immagine *
        </label>
        <input
          type="url"
          value={data.url}
          onChange={(e) => handleChange('url', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="https://esempio.com/immagine.jpg"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Testo Alternativo (alt)
          </label>
          <input
            type="text"
            value={data.alt}
            onChange={(e) => handleChange('alt', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Descrizione per accessibilità"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Didascalia
          </label>
          <input
            type="text"
            value={data.caption}
            onChange={(e) => handleChange('caption', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Didascalia immagine"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dimensione
          </label>
          <select
            value={data.width}
            onChange={(e) => handleChange('width', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="small">Piccola</option>
            <option value="medium">Media</option>
            <option value="full">Completa</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Allineamento
          </label>
          <select
            value={data.alignment}
            onChange={(e) => handleChange('alignment', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="left">Sinistra</option>
            <option value="center">Centro</option>
            <option value="right">Destra</option>
          </select>
        </div>
      </div>

      {/* Preview */}
      {data.url && (
        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-600 mb-2">Anteprima:</p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className={`${getImageAlignment()} ${getImageWidth()}`}>
              <img
                src={data.url}
                alt={data.alt}
                className="w-full h-auto rounded-lg shadow-md"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div
                className="hidden bg-gray-200 rounded-lg flex items-center justify-center text-gray-500"
                style={{ height: '200px' }}
              >
                <div className="text-center">
                  <PhotoIcon className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">Immagine non caricabile</p>
                </div>
              </div>
              {data.caption && (
                <p className="text-center text-gray-600 mt-3 italic">{data.caption}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageBlock;