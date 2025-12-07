/**
 * Hero Block Component
 * Sezione hero con titolo, sottotitolo e bottone
 */

import React, { useState } from 'react';

const HeroBlock = ({ content, onChange, preview = false }) => {
  const [data, setData] = useState({
    title: 'Titolo Principale',
    subtitle: 'Sottotitolo descrittivo',
    buttonText: 'Scopri di più',
    buttonUrl: '#',
    backgroundImage: '',
    backgroundColor: '#3B82F6',
    ...content
  });

  const handleChange = (field, value) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    onChange(newData);
  };

  if (preview) {
    return (
      <div
        className="relative py-20 px-8 text-white text-center"
        style={{
          backgroundColor: data.backgroundColor,
          backgroundImage: data.backgroundImage ? `url(${data.backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {data.title}
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            {data.subtitle}
          </p>
          {data.buttonText && (
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              {data.buttonText}
            </button>
          )}
        </div>
        {data.backgroundImage && (
          <div className="absolute inset-0 bg-black/40"></div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Titolo Principale
        </label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="Titolo principale della sezione"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sottotitolo
        </label>
        <textarea
          value={data.subtitle}
          onChange={(e) => handleChange('subtitle', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="Sottotitolo descrittivo"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Testo Bottone
          </label>
          <input
            type="text"
            value={data.buttonText}
            onChange={(e) => handleChange('buttonText', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Scopri di più"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL Bottone
          </label>
          <input
            type="text"
            value={data.buttonUrl}
            onChange={(e) => handleChange('buttonUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="#contatti"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Colore Sfondo
        </label>
        <div className="flex items-center space-x-3">
          <input
            type="color"
            value={data.backgroundColor}
            onChange={(e) => handleChange('backgroundColor', e.target.value)}
            className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
          />
          <input
            type="text"
            value={data.backgroundColor}
            onChange={(e) => handleChange('backgroundColor', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="#3B82F6"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL Immagine di Sfondo (opzionale)
        </label>
        <input
          type="url"
          value={data.backgroundImage}
          onChange={(e) => handleChange('backgroundImage', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="https://esempio.com/immagine.jpg"
        />
        {data.backgroundImage && (
          <div className="mt-2">
            <img
              src={data.backgroundImage}
              alt="Background preview"
              className="w-full h-40 object-cover rounded-md"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      {/* Mini preview */}
      <div className="border-t border-gray-200 pt-4">
        <p className="text-sm text-gray-600 mb-2">Anteprima:</p>
        <div
          className="py-12 px-6 rounded-lg text-white text-center"
          style={{
            backgroundColor: data.backgroundColor,
            backgroundImage: data.backgroundImage ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${data.backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <h3 className="text-2xl font-bold mb-2">{data.title}</h3>
          <p className="text-gray-100 mb-4">{data.subtitle}</p>
          {data.buttonText && (
            <span className="inline-block bg-white text-gray-900 px-4 py-2 rounded font-medium">
              {data.buttonText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroBlock;