/**
 * Image Section
 * Componente per sezioni con immagini e testo personalizzabile
 */

import React, { useRef, useState } from 'react';
import {
  PhotoIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  FolderIcon
} from '@heroicons/react/24/outline';
import ImageSelector from '../ImageSelector';

const ImageSection = ({ data, onChange, onRemove, onMoveUp, onMoveDown, websiteId }) => {
  const fileInputRef = useRef(null);
  const [showImageSelector, setShowImageSelector] = useState(false);

  const layoutOptions = [
    { value: 'left', label: 'Immagine a sinistra', description: 'Immagine a sinistra, testo a destra' },
    { value: 'right', label: 'Immagine a destra', description: 'Immagine a destra, testo a sinistra' },
    { value: 'center', label: 'Immagine centrata', description: 'Immagine sopra il testo centrata' },
    { value: 'background', label: 'Sfondo', description: 'Immagine come sfondo con testo sopra' }
  ];

  const sizeOptions = [
    { value: 'small', label: 'Piccola (33%)' },
    { value: 'medium', label: 'Media (50%)' },
    { value: 'large', label: 'Grande (66%)' },
    { value: 'full', label: 'Completa (100%)' }
  ];

  // Gestione upload immagine locale
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      onChange({
        ...data,
        imageUrl,
        imageName: file.name,
        imageFile: file
      });
    }
  };

  // Gestione selezione immagine dall'archivio
  const handleImageSelect = (image) => {
    const cdnUrl = image.previewUrl || `https://cdn.operocloud.it/${image.s3_key}`;
    onChange({
      ...data,
      imageUrl: cdnUrl,
      imageName: image.file_name_originale,
      imageId: image.id,
      s3Key: image.s3_key
    });
    setShowImageSelector(false);
  };

  // Rimuovi immagine
  const removeImage = () => {
    if (data.imageUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(data.imageUrl);
    }
    onChange({
      ...data,
      imageUrl: '',
      imageName: '',
      imageFile: null
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <PhotoIcon className="h-6 w-6 text-blue-500 mr-3" />
          <h3 className="text-lg font-semibold">Sezione Immagine</h3>
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
            value={data.layout || 'left'}
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Dimensione immagine</label>
          <select
            value={data.size || 'medium'}
            onChange={(e) => onChange({ ...data, size: e.target.value })}
            disabled={data.layout === 'background'}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {sizeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bordi immagine</label>
          <select
            value={data.imageBorder || 'rounded'}
            onChange={(e) => onChange({ ...data, imageBorder: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="none">Nessuno</option>
            <option value="rounded">Arrotondati</option>
            <option value="circle">Cerchio</option>
            <option value="shadow">Con ombra</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Allineamento testo</label>
          <select
            value={data.textAlign || 'left'}
            onChange={(e) => onChange({ ...data, textAlign: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="left">Sinistra</option>
            <option value="center">Centro</option>
            <option value="right">Destra</option>
            <option value="justify">Giustificato</option>
          </select>
        </div>
      </div>

      {/* Upload Immagine */}
      <div className="mb-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        {!data.imageUrl ? (
          <div className="space-y-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all group"
            >
              <div className="text-center">
                <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-2 group-hover:text-blue-500 group-hover:scale-110 transition-all" />
                <div className="text-gray-600 group-hover:text-blue-600">
                  <span className="font-medium">Carica dal computer</span> o trascina qui
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  JPG, PNG, WebP fino a 10MB
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
                  <span className="font-medium">Seleziona dall'archivio</span>
                </div>
                <div className="text-sm text-blue-500 mt-1">
                  Sfoglia le immagini già caricate su S3
                </div>
              </div>
            </button>
          </div>
        ) : (
          <div className="relative">
            <div className={`rounded-lg overflow-hidden ${
              data.imageBorder === 'shadow' ? 'shadow-lg' :
              data.imageBorder === 'rounded' ? 'rounded-lg' :
              data.imageBorder === 'circle' ? 'rounded-full' : ''
            }`}>
              <img
                src={data.imageUrl}
                alt={data.altText || data.imageName || 'Immagine'}
                className="w-full h-48 object-cover"
              />
            </div>

            <button
              onClick={removeImage}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <TrashIcon className="h-4 w-4" />
            </button>

            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-gray-600 truncate">
                {data.imageName || 'Immagine caricata'}
              </span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Cambia immagine
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Testo e Contenuti */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Titolo</label>
          <input
            type="text"
            value={data.title || ''}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Titolo della sezione (opzionale)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sottotitolo</label>
          <input
            type="text"
            value={data.subtitle || ''}
            onChange={(e) => onChange({ ...data, subtitle: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Sottotitolo descrittivo (opzionale)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Testo</label>
          <textarea
            value={data.description || ''}
            onChange={(e) => onChange({ ...data, description: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Testo descrittivo della sezione..."
          />
        </div>
      </div>

      {/* Alt Text per accessibilità */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Testo Alternativo (Alt Text)
          <span className="text-gray-400 text-xs ml-1">(per accessibilità)</span>
        </label>
        <input
          type="text"
          value={data.altText || ''}
          onChange={(e) => onChange({ ...data, altText: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Descrizione dell'immagine per non vedenti"
        />
      </div>

      {/* Pulsante Call-to-Action */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Testo pulsante</label>
          <input
            type="text"
            value={data.buttonText || ''}
            onChange={(e) => onChange({ ...data, buttonText: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Es: Scopri di più, Contattaci"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Link pulsante</label>
          <input
            type="url"
            value={data.buttonUrl || ''}
            onChange={(e) => onChange({ ...data, buttonUrl: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="https://example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stile pulsante</label>
          <select
            value={data.buttonStyle || 'primary'}
            onChange={(e) => onChange({ ...data, buttonStyle: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="primary">Primario (blu)</option>
            <option value="secondary">Secondario (grigio)</option>
            <option value="success">Successo (verde)</option>
            <option value="danger">Pericolo (rosso)</option>
            <option value="outline">Contorno</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Azione pulsante</label>
          <select
            value={data.buttonAction || 'link'}
            onChange={(e) => onChange({ ...data, buttonAction: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="link">Link esterno</option>
            <option value="page">Pagina interna</option>
            <option value="scroll">Scorri alla sezione</option>
            <option value="modal">Apri modal</option>
            <option value="download">Download file</option>
          </select>
        </div>
      </div>

      {/* Opzioni Avanzate */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={data.parallax || false}
              onChange={(e) => onChange({ ...data, parallax: e.target.checked })}
              className="h-4 w-4 text-blue-600"
            />
            <span className="ml-2 text-sm text-gray-700">Effetto parallax</span>
          </label>
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={data.zoomOnHover || false}
              onChange={(e) => onChange({ ...data, zoomOnHover: e.target.checked })}
              className="h-4 w-4 text-blue-600"
            />
            <span className="ml-2 text-sm text-gray-700">Zoom al passaggio</span>
          </label>
        </div>
      </div>

      {/* Anteprima Layout */}
      {data.imageUrl && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Anteprima Layout</h4>
          <div className="text-sm text-gray-600">
            Layout: {layoutOptions.find(opt => opt.value === data.layout)?.label}<br/>
            {data.layout !== 'background' && `Dimensione: ${sizeOptions.find(opt => opt.value === data.size)?.label}`}<br/>
            {data.buttonText && `Pulsante: "${data.buttonText}"`}
          </div>
        </div>
      )}

      {/* Image Selector Modal */}
      {showImageSelector && (
        <ImageSelector
          onSelect={handleImageSelect}
          onClose={() => setShowImageSelector(false)}
          initialWebsiteId={websiteId}
          initialPageId={null}
        />
      )}
    </div>
  );
};

export default ImageSection;