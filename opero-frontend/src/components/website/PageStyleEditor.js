/**
 * Page Style Editor Component
 * Interfaccia per personalizzare gli stili della pagina
 */

import React, { useState, useEffect } from 'react';
import {
  SwatchIcon,
  PaintBrushIcon,
  PhotoIcon,
  Font,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

const PageStyleEditor = ({ page, onChange }) => {
  const [styles, setStyles] = useState({
    background_type: 'color',
    background_color: '#ffffff',
    background_gradient: '',
    background_image: '',
    background_size: 'cover',
    background_position: 'center',
    background_repeat: 'no-repeat',
    background_attachment: 'scroll',
    font_family: 'Inter',
    font_size: '16',
    font_color: '#333333',
    heading_font: '',
    heading_color: '#1a1a1a',
    container_max_width: '1200px',
    padding_top: '60px',
    padding_bottom: '60px',
    custom_css: '',
    ...page
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setStyles({
      background_type: page.background_type || 'color',
      background_color: page.background_color || '#ffffff',
      background_gradient: page.background_gradient || '',
      background_image: page.background_image || '',
      background_size: page.background_size || 'cover',
      background_position: page.background_position || 'center',
      background_repeat: page.background_repeat || 'no-repeat',
      background_attachment: page.background_attachment || 'scroll',
      font_family: page.font_family || 'Inter',
      font_size: page.font_size || '16',
      font_color: page.font_color || '#333333',
      heading_font: page.heading_font || '',
      heading_color: page.heading_color || '#1a1a1a',
      container_max_width: page.container_max_width || '1200px',
      padding_top: page.padding_top || '60px',
      padding_bottom: page.padding_bottom || '60px',
      custom_css: page.custom_css || '',
    });
  }, [page]);

  const handleChange = (field, value) => {
    const newStyles = { ...styles, [field]: value };
    setStyles(newStyles);
    onChange(newStyles);
  };

  const fonts = [
    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins',
    'Playfair Display', 'Merriweather', 'Georgia', 'Arial', 'Times New Roman'
  ];

  const gradientPresets = [
    'linear-gradient(45deg, #667eea, #764ba2)',
    'linear-gradient(135deg, #667eea, #764ba2)',
    'linear-gradient(90deg, #4facfe, #00f2fe)',
    'linear-gradient(180deg, #f093fb, #f5576c)',
    'linear-gradient(135deg, #fa709a, #fee140)',
    'linear-gradient(45deg, #a8edea, #fed6e3)'
  ];

  return (
    <div className="space-y-6">
      {/* Background Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <SwatchIcon className="h-5 w-5 mr-2" />
            Background
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo Background
            </label>
            <select
              value={styles.background_type}
              onChange={(e) => handleChange('background_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="color">Colore</option>
              <option value="gradient">Gradiente</option>
              <option value="image">Immagine</option>
            </select>
          </div>

          {styles.background_type === 'color' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Colore Background
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={styles.background_color}
                  onChange={(e) => handleChange('background_color', e.target.value)}
                  className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={styles.background_color}
                  onChange={(e) => handleChange('background_color', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {styles.background_type === 'gradient' && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gradiente Background
              </label>
              <div className="space-y-2">
                <select
                  value={styles.background_gradient}
                  onChange={(e) => handleChange('background_gradient', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleziona un preset...</option>
                  {gradientPresets.map((gradient, index) => (
                    <option key={index} value={gradient}>
                      Gradiente {index + 1}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={styles.background_gradient}
                  onChange={(e) => handleChange('background_gradient', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Oppure inserisci un gradiente CSS personalizzato"
                />
              </div>
            </div>
          )}

          {styles.background_type === 'image' && (
            <>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Immagine Background
                </label>
                <input
                  type="url"
                  value={styles.background_image}
                  onChange={(e) => handleChange('background_image', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://esempio.com/immagine.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dimensione
                </label>
                <select
                  value={styles.background_size}
                  onChange={(e) => handleChange('background_size', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="cover">Cover</option>
                  <option value="contain">Contain</option>
                  <option value="auto">Auto</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Posizione
                </label>
                <select
                  value={styles.background_position}
                  onChange={(e) => handleChange('background_position', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="center">Center</option>
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Typography Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Font className="h-5 w-5 mr-2" />
            Tipografia
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Testo
            </label>
            <select
              value={styles.font_family}
              onChange={(e) => handleChange('font_family', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {fonts.map(font => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dimensione Font (px)
            </label>
            <input
              type="number"
              value={styles.font_size}
              onChange={(e) => handleChange('font_size', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              min="10"
              max="32"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Colore Testo
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={styles.font_color}
                onChange={(e) => handleChange('font_color', e.target.value)}
                className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={styles.font_color}
                onChange={(e) => handleChange('font_color', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Titoli (opzionale)
            </label>
            <select
              value={styles.heading_font}
              onChange={(e) => handleChange('heading_font', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Stesso testo</option>
              {fonts.map(font => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Colore Titoli
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={styles.heading_color}
                onChange={(e) => handleChange('heading_color', e.target.value)}
                className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={styles.heading_color}
                onChange={(e) => handleChange('heading_color', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Layout Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
            Layout e Spaziatura
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Larghezza Massima Container
            </label>
            <input
              type="text"
              value={styles.container_max_width}
              onChange={(e) => handleChange('container_max_width', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="1200px"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Padding Superiore
            </label>
            <input
              type="text"
              value={styles.padding_top}
              onChange={(e) => handleChange('padding_top', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="60px"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Padding Inferiore
            </label>
            <input
              type="text"
              value={styles.padding_bottom}
              onChange={(e) => handleChange('padding_bottom', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="60px"
            />
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <PaintBrushIcon className="h-5 w-5 mr-2" />
            Impostazioni Avanzate
          </h3>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showAdvanced ? 'Nascondi' : 'Mostra'}
          </button>
        </div>

        {showAdvanced && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CSS Personalizzato
            </label>
            <textarea
              value={styles.custom_css}
              onChange={(e) => handleChange('custom_css', e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              placeholder="Inserisci codice CSS personalizzato..."
            />
            <p className="text-sm text-gray-500 mt-1">
              Aggiungi CSS personalizzato per ulteriori personalizzazioni
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageStyleEditor;