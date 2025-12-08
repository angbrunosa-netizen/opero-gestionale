/**
 * @file GalleryAdvancedCustomizer_SIMPLE.js
 * @version semplice - senza errori sintattici
 */

import React, { useState } from 'react';
import {
  XMarkIcon,
  SwatchIcon,
  SparklesIcon,
  ViewColumnsIcon,
  Squares2X2Icon,
  ArrowPathIcon,
  PhotoIcon,
  Cog6ToothIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const GalleryAdvancedCustomizer_SIMPLE = ({ gallery, config = {}, onGalleryUpdate, onClose }) => {
  const [activeTab, setActiveTab] = useState('layout');

  // Se gallery è fornito, usa le impostazioni della galleria, altrimenti usa config
  const galleryConfig = gallery?.impostazioni ? JSON.parse(gallery.impostazioni) : config;

  // Assicurati che gallery_config esista e abbia valori di default
  const safeConfig = {
    gallery_layout: galleryConfig.gallery_layout || 'grid-3',
    gallery_spacing: galleryConfig.gallery_spacing || 'medium',
    gallery_border_radius: galleryConfig.gallery_border_radius || 'medium',
    gallery_border_color: galleryConfig.gallery_border_color || '#e5e7eb',
    gallery_shadow: galleryConfig.gallery_shadow !== false,
    gallery_hover_effect: galleryConfig.gallery_hover_effect || 'zoom',
    gallery_lightbox: galleryConfig.gallery_lightbox !== false,
    gallery_lazy_loading: galleryConfig.gallery_lazy_loading !== false,
    gallery_image_compression: galleryConfig.gallery_image_compression !== false,
    ...galleryConfig
  };

  // Funzione wrapper per gestire l'aggiornamento
  const handleConfigChange = (newConfig) => {
    if (onGalleryUpdate && gallery) {
      // Aggiorna la galleria con nuove impostazioni
      const updatedGallery = {
        ...gallery,
        impostazioni: JSON.stringify({ ...safeConfig, ...newConfig })
      };
      onGalleryUpdate(updatedGallery);
    }
  };

  // Color schemes semplificati
  const colorSchemes = [
    { primary: '#3B82F6', secondary: '#1E40AF', accent: '#60A5FA' },
    { primary: '#10B981', secondary: '#047857', accent: '#34D399' },
    { primary: '#F97316', secondary: '#EA580C', accent: '#FB923C' },
    { primary: '#8B5CF6', secondary: '#7C3AED', accent: '#A78BFA' }
  ];

  const renderLayoutTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {['grid-2', 'grid-3', 'grid-4', 'masonry'].map((layout) => (
          <button
            key={layout}
            onClick={() => handleConfigChange({ gallery_layout: layout })}
            className={`p-4 border rounded-lg text-center transition-all ${
              safeConfig.gallery_layout === layout
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-400'
            }`}
          >
            {layout === 'grid-2' && <Squares2X2Icon className="h-6 w-6 mx-auto mb-2" />}
            {layout === 'grid-3' && <ViewColumnsIcon className="h-6 w-6 mx-auto mb-2" />}
            {layout === 'grid-4' && <ViewColumnsIcon className="h-6 w-6 mx-auto mb-2" />}
            {layout === 'masonry' && <SparklesIcon className="h-6 w-6 mx-auto mb-2" />}
            <div className="text-sm font-medium capitalize">{layout}</div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStylingTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Spaziatura</label>
        <select
          value={safeConfig.gallery_spacing}
          onChange={(e) => handleConfigChange({ gallery_spacing: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="compact">Compatta</option>
          <option value="medium">Media</option>
          <option value="spacious">Spaziosa</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Bordi</label>
        <select
          value={safeConfig.gallery_border_radius}
          onChange={(e) => handleConfigChange({ gallery_border_radius: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="none">Nessuno</option>
          <option value="small">Piccolo</option>
          <option value="medium">Medio</option>
          <option value="large">Grande</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Colore bordi</label>
        <input
          type="color"
          value={safeConfig.gallery_border_color}
          onChange={(e) => handleConfigChange({ gallery_border_color: e.target.value })}
          className="w-full h-10 border border-gray-300 rounded-md"
        />
      </div>
    </div>
  );

  const renderEffectsTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={safeConfig.gallery_zoom_hover !== false}
            onChange={(e) => handleConfigChange({ gallery_zoom_hover: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Zoom al passaggio del mouse</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={safeConfig.gallery_shadow_on_hover !== false}
            onChange={(e) => handleConfigChange({ gallery_shadow_on_hover: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Ombra al passaggio del mouse</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={safeConfig.gallery_show_captions_on_hover !== false}
            onChange={(e) => handleConfigChange({ gallery_show_captions_on_hover: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Mostra didascalie al passaggio</span>
        </label>
      </div>
    </div>
  );

  const renderLightboxTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={safeConfig.gallery_lightbox_enabled !== false}
            onChange={(e) => handleConfigChange({ gallery_lightbox_enabled: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Abilita lightbox</span>
        </label>

        {safeConfig.gallery_lightbox_enabled !== false && (
          <div className="ml-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Effetto transizione</label>
              <select
                value={safeConfig.gallery_lightbox_transition || 'fade'}
                onChange={(e) => handleConfigChange({ gallery_lightbox_transition: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="fade">Dissolvenza</option>
                <option value="slide">Scorrimento</option>
                <option value="zoom">Zoom</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderAdvancedTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={safeConfig.gallery_lazy_loading !== false}
            onChange={(e) => handleConfigChange({ gallery_lazy_loading: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Caricamento progressivo</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={safeConfig.compressionEnabled || false}
            onChange={(e) => handleConfigChange({ compressionEnabled: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Compressione immagini</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={safeConfig.webpEnabled || false}
            onChange={(e) => handleConfigChange({ webpEnabled: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Formato WebP</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={safeConfig.responsiveImages || false}
            onChange={(e) => handleConfigChange({ responsiveImages: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Immagini responsive</span>
        </label>
      </div>
    </div>
  );

  const tabs = [
    { id: 'layout', name: 'Layout', icon: ViewColumnsIcon },
    { id: 'styling', name: 'Stile', icon: SwatchIcon },
    { id: 'effects', name: 'Effetti', icon: SparklesIcon },
    { id: 'lightbox', name: 'Lightbox', icon: EyeIcon },
    { id: 'advanced', name: 'Avanzate', icon: Cog6ToothIcon }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'layout':
        return renderLayoutTab();
      case 'styling':
        return renderStylingTab();
      case 'effects':
        return renderEffectsTab();
      case 'lightbox':
        return renderLightboxTab();
      case 'advanced':
        return renderAdvancedTab();
      default:
        return <div>Tab non disponibile</div>;
    }
  };

  console.log('🔥🔥 GalleryAdvancedCustomizer_SIMPLE MONTATO!', {
  galleryId: gallery?.id,
  galleryNome: gallery?.nome_galleria,
  configGalleryLayout: safeConfig.gallery_layout,
  hasConfig: !!config
});

return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-green-50">
          <div className="flex items-center">
            <PhotoIcon className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Personalizzazione Avanzata Gallerie
              </h2>
              <p className="text-sm text-green-600">
                DEBUG: GalleryAdvancedCustomizer_SIMPLE - Gallery: {gallery?.nome_galleria || 'NESSUNA'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Chiudi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryAdvancedCustomizer_SIMPLE;