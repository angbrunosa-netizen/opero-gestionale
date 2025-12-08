/**
 * @file TemplateCustomizer.js
 * @description Componente per la personalizzazione dei template siti web
 * - Colori e branding
 * - Font family e tipografia
 * - Layout e spaziature
 * - Header e footer customization
 * - Preview real-time delle modifiche
 * @version 1.0
 */

import React, { useState, useCallback } from 'react';
import GalleryAdvancedCustomizer from './GalleryAdvancedCustomizer_SIMPLE';
import {
  PaintBrushIcon,
  SwatchIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  SparklesIcon,
  ArrowPathIcon,
  PhotoIcon,
  ViewColumnsIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';

const TemplateCustomizer = ({ config, onConfigChange }) => {
  const [activeSection, setActiveSection] = useState('colors');
  const [previewMode, setPreviewMode] = useState(false);
  const [showGalleryAdvanced, setShowGalleryAdvanced] = useState(false);
  const [selectedGallery, setSelectedGallery] = useState(null);

  // Predefined color schemes
  const colorSchemes = [
    {
      name: 'Professional Blue',
      primary: '#3B82F6',
      secondary: '#1E40AF',
      accent: '#60A5FA'
    },
    {
      name: 'Corporate Gray',
      primary: '#6B7280',
      secondary: '#374151',
      accent: '#9CA3AF'
    },
    {
      name: 'Nature Green',
      primary: '#10B981',
      secondary: '#047857',
      accent: '#34D399'
    },
    {
      name: 'Sunset Orange',
      primary: '#F97316',
      secondary: '#EA580C',
      accent: '#FB923C'
    },
    {
      name: 'Royal Purple',
      primary: '#8B5CF6',
      secondary: '#7C3AED',
      accent: '#A78BFA'
    },
    {
      name: 'Elegant Black',
      primary: '#1F2937',
      secondary: '#111827',
      accent: '#4B5563'
    }
  ];

  // Font families
  const fontFamilies = [
    { name: 'Inter', value: 'Inter, system-ui, sans-serif', category: 'Sans-serif' },
    { name: 'Roboto', value: 'Roboto, sans-serif', category: 'Sans-serif' },
    { name: 'Open Sans', value: 'Open Sans, sans-serif', category: 'Sans-serif' },
    { name: 'Montserrat', value: 'Montserrat, sans-serif', category: 'Sans-serif' },
    { name: 'Lato', value: 'Lato, sans-serif', category: 'Sans-serif' },
    { name: 'Poppins', value: 'Poppins, sans-serif', category: 'Sans-serif' },
    { name: 'Playfair Display', value: 'Playfair Display, serif', category: 'Serif' },
    { name: 'Merriweather', value: 'Merriweather, serif', category: 'Serif' },
    { name: 'DM Sans', value: 'DM Sans, sans-serif', category: 'Sans-serif' },
    { name: 'Space Grotesk', value: 'Space Grotesk, sans-serif', category: 'Sans-serif' }
  ];

  // Layout options
  const layoutOptions = [
    {
      name: 'Standard',
      description: 'Layout classico con header sticky',
      maxWidth: '1200px',
      spacing: 'comfortable',
      borderRadius: 'medium'
    },
    {
      name: 'Minimal',
      description: 'Design minimalista con molto spazio bianco',
      maxWidth: '1000px',
      spacing: 'spacious',
      borderRadius: 'none'
    },
    {
      name: 'Compact',
      description: 'Layout compatto per più contenuti',
      maxWidth: '1400px',
      spacing: 'tight',
      borderRadius: 'small'
    },
    {
      name: 'Creative',
      description: 'Layout creativo con angoli arrotondati',
      maxWidth: '1100px',
      spacing: 'generous',
      borderRadius: 'large'
    }
  ];

  // Update configuration
  const updateConfig = useCallback((updates) => {
    onConfigChange({ ...config, ...updates });
  }, [config, onConfigChange]);

  const handleGalleryAdvanced = (gallery = null) => {
    setSelectedGallery(gallery);
    setShowGalleryAdvanced(true);
  };

  // Apply color scheme
  const applyColorScheme = (scheme) => {
    updateConfig({
      primary_color: scheme.primary,
      secondary_color: scheme.secondary,
      accent_color: scheme.accent
    });
  };

  // Header sections for navigation
  const sections = [
    {
      id: 'colors',
      name: 'Colori e Branding',
      icon: SwatchIcon,
      description: 'Personalizza palette colori del sito'
    },
    {
      id: 'typography',
      name: 'Tipografia',
      icon: PaintBrushIcon,
      description: 'Font family e stili di testo'
    },
    {
      id: 'layout',
      name: 'Layout e Spaziature',
      icon: AdjustmentsHorizontalIcon,
      description: 'Struttura e organizzazione contenuti'
    },
    {
      id: 'header',
      name: 'Header e Navigazione',
      icon: Cog6ToothIcon,
      description: 'Aspetto del menu di navigazione'
    },
    {
      id: 'footer',
      name: 'Footer',
      icon: Cog6ToothIcon,
      description: 'Piè di pagina e informazioni contatto'
    },
    {
      id: 'galleries',
      name: 'Gallerie Fotografiche',
      icon: PhotoIcon,
      description: 'Layout e impostazioni globali gallerie'
    }
  ];

  // Render content per ogni sezione
  const renderSectionContent = () => {
    switch (activeSection) {
      case 'colors':
        return (
          <div className="space-y-6">
            {/* Color schemes predefiniti */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Schemi Colori Predefiniti</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {colorSchemes.map((scheme, index) => (
                  <button
                    key={index}
                    onClick={() => applyColorScheme(scheme)}
                    className="p-3 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex -space-x-2">
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white"
                          style={{ backgroundColor: scheme.primary }}
                        />
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white"
                          style={{ backgroundColor: scheme.secondary }}
                        />
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white"
                          style={{ backgroundColor: scheme.accent }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {scheme.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom color picker */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Colori Personalizzati</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <label className="w-32 text-sm text-gray-700">Colore Primario</label>
                  <input
                    type="color"
                    value={config.primary_color || '#3B82F6'}
                    onChange={(e) => updateConfig({ primary_color: e.target.value })}
                    className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.primary_color || '#3B82F6'}
                    onChange={(e) => updateConfig({ primary_color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="#3B82F6"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <label className="w-32 text-sm text-gray-700">Colore Secondario</label>
                  <input
                    type="color"
                    value={config.secondary_color || '#1E40AF'}
                    onChange={(e) => updateConfig({ secondary_color: e.target.value })}
                    className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.secondary_color || '#1E40AF'}
                    onChange={(e) => updateConfig({ secondary_color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="#1E40AF"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <label className="w-32 text-sm text-gray-700">Colore Accento</label>
                  <input
                    type="color"
                    value={config.accent_color || '#60A5FA'}
                    onChange={(e) => updateConfig({ accent_color: e.target.value })}
                    className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.accent_color || '#60A5FA'}
                    onChange={(e) => updateConfig({ accent_color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="#60A5FA"
                  />
                </div>
              </div>
            </div>

            {/* Background colors */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Colori di Sfondo</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <label className="w-32 text-sm text-gray-700">Background</label>
                  <input
                    type="color"
                    value={config.bg_color || '#FFFFFF'}
                    onChange={(e) => updateConfig({ bg_color: e.target.value })}
                    className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.bg_color || '#FFFFFF'}
                    onChange={(e) => updateConfig({ bg_color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="#FFFFFF"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <label className="w-32 text-sm text-gray-700">Background Secondario</label>
                  <input
                    type="color"
                    value={config.bg_secondary || '#F9FAFB'}
                    onChange={(e) => updateConfig({ bg_secondary: e.target.value })}
                    className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.bg_secondary || '#F9FAFB'}
                    onChange={(e) => updateConfig({ bg_secondary: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="#F9FAFB"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'typography':
        return (
          <div className="space-y-6">
            {/* Font family */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Font Principale</h4>
              <select
                value={config.font_family || 'Inter, system-ui, sans-serif'}
                onChange={(e) => updateConfig({ font_family: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {fontFamilies.map((font, index) => (
                  <option key={index} value={font.value}>
                    {font.name} ({font.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Heading font */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Font Titoli</h4>
              <select
                value={config.heading_font || 'Inter, system-ui, sans-serif'}
                onChange={(e) => updateConfig({ heading_font: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Usa font principale</option>
                {fontFamilies.map((font, index) => (
                  <option key={index} value={font.value}>
                    {font.name} ({font.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Font sizes */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Dimensioni Font</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <label className="w-32 text-sm text-gray-700">Testo Base</label>
                  <select
                    value={config.base_font_size || '16'}
                    onChange={(e) => updateConfig({ base_font_size: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="14">Piccolo (14px)</option>
                    <option value="16">Normale (16px)</option>
                    <option value="18">Grande (18px)</option>
                    <option value="20">Molto grande (20px)</option>
                  </select>
                </div>

                <div className="flex items-center space-x-3">
                  <label className="w-32 text-sm text-gray-700">H1 Titoli</label>
                  <select
                    value={config.h1_size || '48'}
                    onChange={(e) => updateConfig({ h1_size: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="36">Medio (36px)</option>
                    <option value="42">Grande (42px)</option>
                    <option value="48">Molto grande (48px)</option>
                    <option value="56">Enorme (56px)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Font weights */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Spessore Font</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <label className="w-32 text-sm text-gray-700">Testo Normale</label>
                  <select
                    value={config.font_weight_normal || '400'}
                    onChange={(e) => updateConfig({ font_weight_normal: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="300">Light</option>
                    <option value="400">Regular</option>
                    <option value="500">Medium</option>
                    <option value="600">Semibold</option>
                  </select>
                </div>

                <div className="flex items-center space-x-3">
                  <label className="w-32 text-sm text-gray-700">Titoli</label>
                  <select
                    value={config.font_weight_heading || '700'}
                    onChange={(e) => updateConfig({ font_weight_heading: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="600">Semibold</option>
                    <option value="700">Bold</option>
                    <option value="800">Extra Bold</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Line height */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Altezza Linea</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <label className="w-32 text-sm text-gray-700">Testo</label>
                  <select
                    value={config.line_height_body || '1.6'}
                    onChange={(e) => updateConfig({ line_height_body: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1.4">Compatto</option>
                    <option value="1.5">Normale</option>
                    <option value="1.6">Leggibile</option>
                    <option value="1.7">Spazioso</option>
                  </select>
                </div>

                <div className="flex items-center space-x-3">
                  <label className="w-32 text-sm text-gray-700">Titoli</label>
                  <select
                    value={config.line_height_heading || '1.2'}
                    onChange={(e) => updateConfig({ line_height_heading: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1.1">Compatto</option>
                    <option value="1.2">Normale</option>
                    <option value="1.3">Spazioso</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'layout':
        return (
          <div className="space-y-6">
            {/* Layout presets */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Layout Predefiniti</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {layoutOptions.map((layout, index) => (
                  <button
                    key={index}
                    onClick={() => updateConfig({
                      layout_preset: layout.name,
                      max_width: layout.maxWidth,
                      spacing: layout.spacing,
                      border_radius: layout.borderRadius
                    })}
                    className={`p-4 border rounded-lg text-left ${
                      config.layout_preset === layout.name
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <h5 className="font-medium text-gray-900">{layout.name}</h5>
                    <p className="text-sm text-gray-600 mt-1">{layout.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Container width */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Larghezza Contenitore</h4>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="800"
                  max="1600"
                  step="50"
                  value={parseInt(config.max_width) || 1200}
                  onChange={(e) => updateConfig({ max_width: e.target.value + 'px' })}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 w-24 text-right">
                  {config.max_width || '1200px'}
                </span>
              </div>
            </div>

            {/* Spacing */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Spaziatura Sezioni</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Padding sezioni</label>
                  <select
                    value={config.section_padding || 'py-16'}
                    onChange={(e) => updateConfig({ section_padding: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="py-8">Compatto</option>
                    <option value="py-12">Normale</option>
                    <option value="py-16">Spazioso</option>
                    <option value="py-20">Molto spazioso</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">Margin tra sezioni</label>
                  <select
                    value={config.section_margin || 'mb-16'}
                    onChange={(e) => updateConfig({ section_margin: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="mb-8">Compatto</option>
                    <option value="mb-12">Normale</option>
                    <option value="mb-16">Spazioso</option>
                    <option value="mb-20">Molto spazioso</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Border radius */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Bordi Arrotondati</h4>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="0"
                  max="24"
                  value={parseInt(config.border_radius) || 8}
                  onChange={(e) => updateConfig({ border_radius: e.target.value + 'px' })}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 w-16 text-right">
                  {config.border_radius || '8px'}
                </span>
              </div>
            </div>

            {/* Card styles */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Stile Card</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <label className="w-32 text-sm text-gray-700">Ombra card</label>
                  <select
                    value={config.card_shadow || 'medium'}
                    onChange={(e) => updateConfig({ card_shadow: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="none">Nessuna</option>
                    <option value="light">Leggera</option>
                    <option value="medium">Media</option>
                    <option value="large">Forte</option>
                  </select>
                </div>

                <div className="flex items-center space-x-3">
                  <label className="w-32 text-sm text-gray-700">Padding card</label>
                  <select
                    value={config.card_padding || 'p-6'}
                    onChange={(e) => updateConfig({ card_padding: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="p-4">Compatto</option>
                    <option value="p-6">Normale</option>
                    <option value="p-8">Spazioso</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'header':
        return (
          <div className="space-y-6">
            {/* Header style */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Stile Header</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <label className="w-32 text-sm text-gray-700">Tipo header</label>
                  <select
                    value={config.header_style || 'sticky'}
                    onChange={(e) => updateConfig({ header_style: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="sticky">Fisso in alto</option>
                    <option value="static">Statico</option>
                    <option value="floating">Fluttuante</option>
                  </select>
                </div>

                <div className="flex items-center space-x-3">
                  <label className="w-32 text-sm text-gray-700">Background header</label>
                  <select
                    value={config.header_bg || 'white'}
                    onChange={(e) => updateConfig({ header_bg: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="white">Bianco</option>
                    <option value="transparent">Trasparente</option>
                    <option value="primary">Colore primario</option>
                    <option value="gradient">Gradiente</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Logo positioning */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Posizionamento Logo</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <label className="w-32 text-sm text-gray-700">Dimensione logo</label>
                  <select
                    value={config.logo_size || 'medium'}
                    onChange={(e) => updateConfig({ logo_size: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="small">Piccolo</option>
                    <option value="medium">Medio</option>
                    <option value="large">Grande</option>
                  </select>
                </div>

                <div className="flex items-center space-x-3">
                  <label className="w-32 text-sm text-gray-700">Allineamento</label>
                  <select
                    value={config.logo_align || 'left'}
                    onChange={(e) => updateConfig({ logo_align: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="left">Sinistra</option>
                    <option value="center">Centro</option>
                    <option value="right">Destra</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Navigation style */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Stile Navigazione</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <label className="w-32 text-sm text-gray-700">Menu items</label>
                  <select
                    value={config.nav_style || 'horizontal'}
                    onChange={(e) => updateConfig({ nav_style: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="horizontal">Orizzontale</option>
                    <option value="mega">Mega menu</option>
                    <option value="dropdown">Dropdown</option>
                  </select>
                </div>

                <div className="flex items-center space-x-3">
                  <label className="w-32 text-sm text-gray-700">Action buttons</label>
                  <select
                    value={config.nav_buttons || 'solid'}
                    onChange={(e) => updateConfig({ nav_buttons: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="solid">Solid</option>
                    <option value="outline">Outline</option>
                    <option value="ghost">Ghost</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'footer':
        return (
          <div className="space-y-6">
            {/* Footer style */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Layout Footer</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <label className="w-32 text-sm text-gray-700">Layout</label>
                  <select
                    value={config.footer_layout || 'columns'}
                    onChange={(e) => updateConfig({ footer_layout: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="columns">Colonne</option>
                    <option value="stacked">Impilato</option>
                    <option value="minimal">Minimale</option>
                  </select>
                </div>

                <div className="flex items-center space-x-3">
                  <label className="w-32 text-sm text-gray-700">Background</label>
                  <select
                    value={config.footer_bg || 'dark'}
                    onChange={(e) => updateConfig({ footer_bg: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="dark">Scuro</option>
                    <option value="light">Chiaro</option>
                    <option value="primary">Colore primario</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Footer content */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Contenuti Footer</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={config.show_social_links !== false}
                    onChange={(e) => updateConfig({ show_social_links: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="text-sm text-gray-700">
                    Mostra link social media
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={config.show_newsletter !== false}
                    onChange={(e) => updateConfig({ show_newsletter: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="text-sm text-gray-700">
                    Mostra iscrizione newsletter
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={config.show_copyright !== false}
                    onChange={(e) => updateConfig({ show_copyright: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="text-sm text-gray-700">
                    Mostra copyright
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'galleries':
        return (
          <div className="space-y-6">
            {/* Impostazioni Layout Gallerie Predefinito */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Layout Default Gallerie</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <button
                  onClick={() => updateConfig({
                    gallery_default_layout: 'grid-3',
                    gallery_spacing: 'medium'
                  })}
                  className={`p-3 border rounded-lg text-left transition-colors ${
                    config.gallery_default_layout === 'grid-3'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <ViewColumnsIcon className="h-5 w-5 mb-2" />
                  <div className="text-sm">Griglia 3</div>
                </button>

                <button
                  onClick={() => updateConfig({
                    gallery_default_layout: 'masonry',
                    gallery_spacing: 'medium'
                  })}
                  className={`p-3 border rounded-lg text-left transition-colors ${
                    config.gallery_default_layout === 'masonry'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <SparklesIcon className="h-5 w-5 mb-2" />
                  <div className="text-sm">Masonry</div>
                </button>

                <button
                  onClick={() => updateConfig({
                    gallery_default_layout: 'carousel',
                    gallery_spacing: 'compact'
                  })}
                  className={`p-3 border rounded-lg text-left transition-colors ${
                    config.gallery_default_layout === 'carousel'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <ArrowPathIcon className="h-5 w-5 mb-2" />
                  <div className="text-sm">Carousel</div>
                </button>
              </div>
            </div>

            {/* Spaziatura Gallerie */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Spaziatura tra Immagini</h4>
              <div className="flex items-center space-x-3">
                <label className="text-sm text-gray-700">Spaziatura:</label>
                <select
                  value={config.gallery_spacing || 'medium'}
                  onChange={(e) => updateConfig({ gallery_spacing: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="compact">Compatta</option>
                  <option value="medium">Media</option>
                  <option value="spacious">Spaziosa</option>
                </select>
              </div>
            </div>

            {/* Bordi Arrotondati */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Bordi Immagini</h4>
              <div className="flex items-center space-x-3">
                <label className="text-sm text-gray-700">Arrotondamento:</label>
                <select
                  value={config.gallery_border_radius || 'medium'}
                  onChange={(e) => updateConfig({ gallery_border_radius: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="none">Nessuno</option>
                  <option value="small">Piccolo</option>
                  <option value="medium">Medio</option>
                  <option value="large">Grande</option>
                </select>
              </div>
            </div>

            {/* Effetti Hover */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Effetti Hover</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={config.gallery_zoom_on_hover !== false}
                    onChange={(e) => updateConfig({ gallery_zoom_on_hover: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="text-sm text-gray-700">Zoom al passaggio mouse</label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={config.gallery_shadow_on_hover !== false}
                    onChange={(e) => updateConfig({ gallery_shadow_on_hover: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="text-sm text-gray-700">Ombra al passaggio mouse</label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={config.gallery_show_captions_on_hover !== false}
                    onChange={(e) => updateConfig({ gallery_show_captions_on_hover: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="text-sm text-gray-700">Mostra didascalie al hover</label>
                </div>
              </div>
            </div>

            {/* Lightbox Settings */}
            <div>
              <h4 className="text-start text-sm font-medium text-gray-900 mb-3">Lightbox</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={config.gallery_lightbox_enabled !== false}
                    onChange={(e) => updateConfig({ gallery_lightbox_enabled: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="text-sm text-gray-700">Abilita lightbox</label>
                </div>

                <div className="flex items-center space-x-3">
                  <label className="text-sm text-gray-700">Effetto transizione:</label>
                  <select
                    value={config.gallery_lightbox_transition || 'fade'}
                    onChange={(e) => updateConfig({ gallery_lightbox_transition: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                    disabled={config.gallery_lightbox_enabled === false}
                  >
                    <option value="fade">Dissolvenza</option>
                    <option value="zoom">Zoom</option>
                    <option value="slide">Scorrimento</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Colori Galleria */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Colori Tema Galleria</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div
                  onClick={() => updateConfig({
                    gallery_primary_color: '#3B82F6',
                    gallery_background_color: '#FFFFFF'
                  })}
                  className="border-2 border-gray-200 rounded-lg p-3 cursor-pointer hover:border-blue-400"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded bg-blue-500"></div>
                    <span className="text-sm">Blu</span>
                  </div>
                </div>

                <div
                  onClick={() => updateConfig({
                    gallery_primary_color: '#10B981',
                    gallery_background_color: '#FFFFFF'
                  })}
                  className="border-2 border-gray-200 rounded-lg p-3 cursor-pointer hover:border-green-400"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded bg-green-500"></div>
                    <span className="text-sm">Verde</span>
                  </div>
                </div>

                <div
                  onClick={() => updateConfig({
                    gallery_primary_color: '#6B7280',
                    gallery_background_color: '#FFFFFF'
                  })}
                  className="border-2 border-gray-200 rounded-lg p-3 cursor-pointer hover:border-gray-400"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded bg-gray-500"></div>
                    <span className="text-sm">Grigio</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pulsante Personalizzazione Avanzata */}
            <div>
              <button
                onClick={() => handleGalleryAdvanced()}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
              >
                <AdjustmentsHorizontalIcon className="w-5 h-5" />
                <span className="font-medium">Personalizzazione Avanzata Gallerie</span>
              </button>
            </div>

            {/* Anteprima */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Anteprima Impostazioni</h4>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div
                      key={i}
                      className={`aspect-square rounded-lg ${
                        config.gallery_border_radius === 'none' ? '' : 'rounded'
                      } ${
                        config.gallery_border_radius === 'small' ? 'rounded-sm' :
                        config.gallery_border_radius === 'large' ? 'rounded-lg' : 'rounded'
                      } bg-white border border-gray-200`}
                      style={{
                        boxShadow: config.gallery_shadow_on_hover !== false ? '0 4px 6px rgba(0,0,0,0.1)' : 'none'
                      }}
                    >
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                        <PhotoIcon className="w-6 h-6" />
                      </div>
                    </div>
                  ))}
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
    <div className="flex h-full">
      {/* Sidebar navigation */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Personalizza Template</h3>
        <nav className="space-y-1">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                <div className="flex-1 text-left">
                  <div>{section.name}</div>
                  <div className="text-xs opacity-75">{section.description}</div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {sections.find(s => s.id === activeSection)?.name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {sections.find(s => s.id === activeSection)?.description}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              {previewMode ? 'Nascondi anteprima' : 'Mostra anteprima'}
            </button>

            <button
              onClick={() => {
                // Reset to defaults
                updateConfig({
                  primary_color: '#3B82F6',
                  secondary_color: '#1E40AF',
                  accent_color: '#60A5FA',
                  font_family: 'Inter, system-ui, sans-serif',
                  layout_preset: 'Standard'
                });
              }}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Reset predefiniti
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={previewMode ? 'opacity-50' : ''}>
          {renderSectionContent()}
        </div>

        {/* Preview overlay */}
        {previewMode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold">Anteprima Template</h3>
                <button
                  onClick={() => setPreviewMode(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="overflow-y-auto p-8" style={{ maxHeight: 'calc(90vh - 80px)' }}>
                <TemplatePreview config={config} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modale GalleryAdvancedCustomizer */}
      {showGalleryAdvanced && (
        <GalleryAdvancedCustomizer
          gallery={selectedGallery}
          onGalleryUpdate={(gallery) => {
            // Qui puoi gestire l'aggiornamento della galleria
            console.log('Gallery updated:', gallery);
          }}
          onClose={() => {
            setShowGalleryAdvanced(false);
            setSelectedGallery(null);
          }}
        />
      )}
    </div>
  );
};

// Componente anteprima template
const TemplatePreview = ({ config }) => {
  return (
    <div
      className="border rounded-lg overflow-hidden"
      style={{
        fontFamily: config.font_family || 'Inter, system-ui, sans-serif',
        backgroundColor: config.bg_color || '#FFFFFF',
        maxWidth: config.max_width || '1200px'
      }}
    >
      {/* Header preview */}
      <div
        className="p-4 border-b"
        style={{
          backgroundColor: config.header_bg === 'primary' ? config.primary_color :
                         config.header_bg === 'gradient' ? `linear-gradient(135deg, ${config.primary_color}, ${config.secondary_color})` :
                         config.header_bg || '#FFFFFF'
        }}
      >
        <div className="flex items-center justify-between">
          <div
            className="text-xl font-bold"
            style={{
              color: config.header_bg === 'white' ? '#000000' : '#FFFFFF'
            }}
          >
            {config.site_title || 'Nome Azienda'}
          </div>
          <nav className="flex space-x-4">
            {['Home', 'Chi Siamo', 'Servizi', 'Contatti'].map(item => (
              <a
                key={item}
                href="#"
                className="hover:opacity-75"
                style={{
                  color: config.header_bg === 'white' ? '#374151' : '#FFFFFF'
                }}
              >
                {item}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Content preview */}
      <div className="p-8">
        <h1
          style={{
            fontSize: (parseInt(config.h1_size) || 48) + 'px',
            fontWeight: config.font_weight_heading || '700',
            color: config.primary_color || '#3B82F6',
            lineHeight: config.line_height_heading || '1.2',
            marginBottom: '2rem'
          }}
        >
          Titolo Esempio
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="border rounded-lg p-6"
              style={{
                backgroundColor: config.bg_secondary || '#F9FAFB',
                borderColor: config.primary_color || '#3B82F6',
                borderRadius: config.border_radius || '8px'
              }}
            >
              <h3
                className="font-medium mb-2"
                style={{
                  color: config.primary_color || '#3B82F6',
                  fontSize: (parseInt(config.base_font_size) || 16) + 4 + 'px'
                }}
              >
                Servizio {i}
              </h3>
              <p
                style={{
                  fontSize: config.base_font_size || '16px',
                  lineHeight: config.line_height_body || '1.6'
                }}
              >
                Descrizione del servizio con testo di esempio per mostrare il font e la spaziatura del template.
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer preview */}
      <div
        className="p-6 border-t"
        style={{
          backgroundColor: config.footer_bg === 'dark' ? '#1F2937' :
                         config.footer_bg === 'primary' ? config.primary_color : '#F9FAFB'
        }}
      >
        <div
          className="text-center"
          style={{
            color: config.footer_bg === 'dark' || config.footer_bg === 'primary' ? '#FFFFFF' : '#374151'
          }}
        >
          <p>© 2024 {config.site_title || 'Nome Azienda'}. Tutti i diritti riservati.</p>
        </div>
      </div>
    </div>
  );
};

export default TemplateCustomizer;