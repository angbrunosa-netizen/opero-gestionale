/**
 * @file GalleryAdvancedCustomizer.js
 * @description Componente per opzioni avanzate personalizzazione gallerie
 * @version 1.0
 */

import React, { useState, useEffect } from 'react';
import {
  PhotoIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon,
  SwatchIcon,
  EyeIcon,
  ArrowPathIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const GalleryAdvancedCustomizer = ({ gallery, onGalleryUpdate, onClose }) => {
  const [activeTab, setActiveTab] = useState('layout');
  const [config, setConfig] = useState({
    layout: gallery?.layout || 'grid-3',
    spacing: gallery?.impostazioni?.spacing || 'medium',
    borderRadius: gallery?.impostazioni?.border_radius || 'medium',
    zoomOnHover: gallery?.impostazioni?.zoom_on_hover !== false,
    shadowOnHover: gallery?.impostazioni?.shadow_on_hover !== false,
    showCaptionsOnHover: gallery?.impostazioni?.show_captions_on_hover !== false,
    primaryColor: gallery?.impostazioni?.primary_color || '#3B82F6',
    backgroundColor: gallery?.impostazioni?.background_color || '#FFFFFF',
    lightboxEnabled: gallery?.impostazioni?.lightbox_enabled !== false,
    lightboxTransition: gallery?.impostazioni?.lightbox_transition || 'fade',
    autoPlay: gallery?.impostazioni?.auto_play || false,
    showThumbnails: gallery?.impostazioni?.show_thumbnails !== false,
    filterEffects: gallery?.impostazioni?.filter_effects || 'none',
    lazyLoading: gallery?.impostazioni?.lazy_loading !== false
  });

  const tabs = [
    { id: 'layout', name: 'Layout', icon: ViewColumnsIcon },
    { id: 'styling', name: 'Stile', icon: SwatchIcon },
    { id: 'effects', name: 'Effetti', icon: SparklesIcon },
    { id: 'lightbox', name: 'Lightbox', icon: EyeIcon },
    {    id: 'advanced', name: 'Avanzate', icon: Cog6ToothIcon }
  ];

  const layouts = [
    { id: 'grid-2', name: 'Griglia 2 Colonne', icon: '⚏' },
    { id: 'grid-3', name: 'Griglia 3 Colonne', icon: '⚏' },
    {id: 'grid-4', name: 'Griglia 4 Colonne', icon: '⚏' },
    { id: 'masonry', name: 'Masonry', icon: '🔱' },
    { id: 'carousel', name: 'Carousel', icon: '🎠' },
    { id: 'list', name: 'Lista', icon: '📝' }
  ];

  const spacingOptions = [
    { id: 'compact', name: 'Compatta', description: 'Spazio minimo tra immagini' },
    { id: 'medium', name: 'Media', description: 'Spazio standard' },
    { id: 'spacious', name: 'Spaziosa', description: 'Spazio extra' }
  ];

  const borderOptions = [
    { id: 'none', name: 'Nessuno', preview: 'square' },
    { id: 'small', name: 'Piccolo', preview: 'rounded-sm' },
    { id: 'medium', name: 'Medio', preview: 'rounded' },
    { id: 'large', name: 'Grande', preview: 'rounded-lg' },
    { id: 'extra-large', name: 'Extra Grande', preview: 'rounded-xl' }
  ];

  const filterEffects = [
    { id: 'none', name: 'Nessuno', description: 'Nessun effetto applicato' },
    { id: 'grayscale', name: 'Bianco e Nero', description: 'Rimuovi tutti i colori' },
    { id: 'sepia', name: 'Seppia', description: 'Tono marrone vintage' },
    { id: 'blur', name: 'Sfocatura', description: 'Effetto sfocato leggero' },
    { id: 'brightness', name: 'Luminosità', description: 'Regola luminosità' },
    { id: 'contrast', name: 'Contrasto', description: 'Aumenta contrasto' }
  ];

  const colorSchemes = [
    { name: 'Professional Blue', primary: '#3B82F6', secondary: '#1E40AF', accent: '#60A5FA' },
    { name: 'Nature Green', primary: '#10B981', secondary: '#047857', accent: '#34D399' },
    { name: 'Sunset Orange', primary: '#F97316', secondary: '#EA580C', accent: '#FB923C' },
    { name: 'Purple Dream', primary: '#8B5CF6', secondary: '#6D28D9', accent: '#A78BFA' },
    { name: 'Modern Gray', primary: '#6B7280', secondary: '#374151', accent: '#9CA3AF' },
    { name: 'Warm Red', primary: '#EF4444', secondary: '#DC2626', accent: '#F87171' }
  ];

  const updateConfig = (newConfig) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);

    // Save to gallery impostazioni
    const impostazioni = {
      ...gallery?.impostazioni,
      spacing: updatedConfig.spacing,
      border_radius: updatedConfig.borderRadius,
      zoom_on_hover: updatedConfig.zoomOnHover,
      shadow_on_hover: updatedConfig.shadowOnHover,
      show_captions_on_hover: updatedConfig.showCaptionsOnHover,
      primary_color: updatedConfig.primaryColor,
      background_color: updatedConfig.backgroundColor,
      lightbox_enabled: updatedConfig.lightboxEnabled,
      lightbox_transition: updatedConfig.lightboxTransition,
      auto_play: updatedConfig.autoPlay,
      show_thumbnails: updatedConfig.showThumbnails,
      filter_effects: updatedConfig.filterEffects,
      lazy_loading: updatedConfig.lazyLoading
    };

    if (onGalleryUpdate) {
      onGalleryUpdate({
        ...gallery,
        impostazioni: impostazioni
      });
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'layout':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Layout Galleria</h3>
              <div className="grid grid-cols-3 gap-3">
                {layouts.map((layout) => (
                  <button
                    key={layout.id}
                    onClick={() => updateConfig({ layout: layout.id })}
                    className={`p-4 border rounded-lg text-left transition-all ${
                      config.layout === layout.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">{layout.icon}</div>
                    <div className="font-medium">{layout.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Spaziatura</h4>
              <div className="grid grid-cols-3 gap-2">
                {spacingOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => updateConfig({ spacing: option.id })}
                    className={`p-3 border rounded-lg text-sm ${
                      config.spacing === option.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div>{option.name}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Gallerie per Riga</h4>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={config.imagesPerRow || 3}
                  onChange={(e) => updateConfig({ imagesPerRow: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600">{config.imagesPerRow || 3} immagini</span>
              </div>
            </div>
          </div>
        );

      case 'styling':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Stile e Aspetto</h3>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Bordi Arrotondati</h4>
                <div className="grid grid-cols-5 gap-3">
                  {borderOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => updateConfig({ borderRadius: option.id })}
                      className={`p-3 border-2 rounded-lg text-center transition-all ${
                        config.borderRadius === option.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-8 h-8 mx-auto mb-2 ${
                        option.preview === 'square' ? '' :
                        option.preview
                      } bg-gray-300`}></div>
                      <div className="text-xs">{option.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Colori Tema</h4>
              <div className="grid grid-cols-3 gap-3">
                {colorSchemes.map((scheme, index) => (
                  <button
                    key={index}
                    onClick={() => updateConfig({
                      primaryColor: scheme.primary,
                      backgroundColor: scheme.secondary
                    })}
                    className={`p-3 border-2 rounded-lg transition-all ${
                      config.primaryColor === scheme.primary
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex space-x-2 mb-2">
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: scheme.primary }}
                      ></div>
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: scheme.secondary }}
                      ></div>
                    </div>
                    <div className="text-sm font-medium">{scheme.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm fontfont-medium text-gray-900 mb-3">Sfumato</h4>
              <select
                value={config.backgroundColor}
                onChange={(e) => updateConfig({ backgroundColor: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="#FFFFFF">Bianco</option>
                <option value="#F9FAFB">Grigio Chiaro</option>
                <option value="#1F2937">Grigio Scuro</option>
                <option value="#111827">Nero</option>
                <option value="#FEF3C7">Grigio Caldo</option>
              </select>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Ombra</h4>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={config.boxShadow || 0}
                  onChange={(e) => updateConfig({ boxShadow: e.target.value })}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600">{config.boxShadow}px</span>
              </div>
            </div>
          </div>
        );

      case 'effects':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Effetti e Animazioni</h3>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Effetti Hover</h4>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={config.zoomOnHover}
                      onChange={(e) => updateConfig({ zoomOnHover: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Zoom al passaggio mouse</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={config.shadowOnHover}
                      onChange={(e) => updateConfig({ shadowOnHover: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Ombra al passaggio mouse</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={config.showCaptionsOnHover}
                      onChange={(e) => updateConfig({ showCaptionsOnHover: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Mostra didascalie al hover</span>
                  </label>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Filtri Immagini</h4>
                <div className="grid grid-cols-3 gap-3">
                  {filterEffects.map((effect) => (
                    <button
                      key={effect.id}
                      onClick={() => updateConfig({ filterEffects: effect.id })}
                      className={`p-3 border rounded-lg text-center transition-all ${
                        config.filterEffects === effect.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">{effect.name}</div>
                      <div className="text-xs text-gray-500">{effect.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Animazioni</h4>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={config.lazyLoading}
                      onChange={(e) => updateConfig({ lazyLoading: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Lazy Loading</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={config.fadeIn}
                      onChange={(e) => updateConfig({ fadeIn: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Fade In</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={config.slideIn}
                      onChange={(e) => updateConfig({ slideIn: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Slide In</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={config.scaleOnHover}
                      onChange={(e) => updateConfig({ scaleOnHover: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Scala al hover</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'lightbox':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg fontium text-gray-900 mb-4">Lightbox</h3>

              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={config.lightboxEnabled}
                    onChange={(e) => updateConfig({ lightboxEnabled: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Abilita Lightbox</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={config.showThumbnails}
                    onChange={(e) => updateConfig({ showThumbnails: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={!config.lightboxEnabled}
                  />
                  <span className="text-sm text-gray-700">Mostra miniature</span>
                </label>

                <label className="flex items-center-x-3">
                  <input
                    type="checkbox"
                    checked={config.autoPlay}
                    onChange={(e) => updateConfig({ autoPlay: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Auto-play (carousel)</span>
                </label>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Effetto Transizione</h4>
                <select
                  value={config.lightboxTransition}
                  onChange={(e) => updateConfig({ lightboxTransition: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  disabled={!config.lightboxEnabled}
                >
                  <option value="fade">Dissolvenza</option>
                  <option value="zoom">Zoom</option>
                  <option value="slide">Scorrimento</option>
                  <option value="flip">Ribaltamento</option>
                </select>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Tempo Transizione (ms)</h4>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="100"
                    max="2000"
                    step="100"
                    value={config.lightboxDuration || 300}
                    onChange={(e) => updateConfig({ lightboxDuration: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600">{config.lightboxDuration || 300}ms</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'advanced':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Opzioni Avanzate</h3>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Caricamento Automatico</h4>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={config.lazyLoading}
                      onChange={(e) => updateConfig({ lazyLoading: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Lazy Loading immagini</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={config.progressiveLoading}
                      onChange={(e) => updateConfig({ progressiveLoading: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Caricamento progressivo</span>
                  </label>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-900 mb-3">Ottimizzazione</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={config.compressionEnabled || false}
                      onChange={(e) => updateConfig({ compressionEnabled: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Compressione immagini</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={config.webpEnabled || false}
                      onChange={(e) => updateConfig({ webpEnabled: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Formato WebP</span>
                  </label>

                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={config.responsiveImages || false}
                      onChange={(e) => updateConfig({ responsiveImages: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Immagini responsive</span>
                  </label>
                </div>
              </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-99900 mb-3">Temi Predefiniti</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {colorSchemes.map((scheme, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        updateConfig({
                          primaryColor: scheme.primary,
                          backgroundColor: scheme.secondary,
                          spacing: index % 3 === 0 ? 'compact' : index % 3 === 1 ? 'medium' : 'spacious',
                          borderRadius: index % 2 === 0 ? 'small' : 'medium'
                        });
                      }}
                      className="p-3 border-2 rounded-lg text-center transition-all"
                    >
                      <div className="flex justify-center space-x-2 mb-2">
                        <div className="w-6 h-6 rounded" style={{ backgroundColor: scheme.primary }}></div>
                        <div
                          className="w-6 h-6 rounded"
                          style={{ backgroundColor: scheme.secondary }}
                        ></div>
                      </div>
                      <div className="text-sm font-medium">{scheme.name}</div>
                      <div className="text-xs text-gray-500">Applica tema completo</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Esporta/Importa</h4>
                <div className="flex space-x-3">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Esporta Configurazione
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400">
                    Importa Configurazione
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <PhotoIcon className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Personalizzazione Galleria</h3>
            <span className="text-sm text-gray-500">
              {gallery?.nome_galleria || 'Nuova Galleria'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium text-sm border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:text-gray-700'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderTabContent()}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
          >
            Annulla
          </button>
          <button
            onClick={() => {
              updateConfig(config);
              if (onGalleryUpdate) {
                onGalleryUpdate({
                  ...gallery,
                  impostazioni: {
                    ...gallery?.impostazioni,
                    spacing: config.spacing,
                    border_radius: config.borderRadius,
                    zoom_on_hover: config.zoomOnHover,
                    shadow_on_hover: config.shadowOnHover,
                    show_captions_on_hover: config.showCaptionsOnHover,
                    primary_color: config.primaryColor,
                    background_color: config.backgroundColor,
                    lightbox_enabled: config.lightboxEnabled,
                    lightbox_transition: config.lightboxTransition,
                    auto_play: config.autoPlay,
                    show_thumbnails: config.showThumbnails,
                    filter_effects: config.filterEffects,
                    lazy_loading: config.lazyLoading
                  }
                });
              }
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            Salva Impostazioni
          </button>
        </div>
      </div>
    </div>
  );
};

export default GalleryAdvancedCustomizer;