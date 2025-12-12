import React, { useState, useEffect } from 'react';
import { FaPalette, FaFont, FaImage, FaExpand, FaSave, FaUndo } from 'react-icons/fa';

const StyleEditor = ({
  styles = {},
  onStyleChange,
  onSave,
  title = "Configurazione Stile",
  showGlobalStyles = true,
  showPageStyles = true
}) => {
  const [localStyles, setLocalStyles] = useState({
    // Stili Background
    background_type: 'color',
    background_color: '#ffffff',
    background_gradient: null,
    background_image: null,
    background_size: 'cover',
    background_position: 'center',
    background_repeat: 'no-repeat',
    background_attachment: 'scroll',

    // Stili Tipografia
    font_family: 'Inter',
    font_size: '16',
    font_color: '#333333',
    heading_font: 'Inter',
    heading_color: '#1a1a1a',

    // Color Scheme
    primary_color: '#3B82F6',
    secondary_color: '#64748B',
    accent_color: '#EF4444',
    button_background_color: '#3B82F6',
    button_text_color: '#ffffff',
    link_color: '#2563EB',

    // Layout
    container_max_width: '1200px',
    padding_top: '60px',
    padding_bottom: '60px',

    // Personalizzazione
    custom_css: '',
    style_config: {},
    ...styles
  });

  const [activeTab, setActiveTab] = useState('background');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalStyles({
      background_type: 'color',
      background_color: '#ffffff',
      background_gradient: null,
      background_image: null,
      background_size: 'cover',
      background_position: 'center',
      background_repeat: 'no-repeat',
      background_attachment: 'scroll',
      font_family: 'Inter',
      font_size: '16',
      font_color: '#333333',
      heading_font: 'Inter',
      heading_color: '#1a1a1a',
      primary_color: '#3B82F6',
      secondary_color: '#64748B',
      accent_color: '#EF4444',
      button_background_color: '#3B82F6',
      button_text_color: '#ffffff',
      link_color: '#2563EB',
      container_max_width: '1200px',
      padding_top: '60px',
      padding_bottom: '60px',
      custom_css: '',
      style_config: {},
      ...styles
    });
  }, [styles]);

  const handleChange = (field, value) => {
    const newStyles = { ...localStyles, [field]: value };
    setLocalStyles(newStyles);
    setHasChanges(true);

    if (onStyleChange) {
      onStyleChange(newStyles);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(localStyles);
      setHasChanges(false);
    }
  };

  const handleReset = () => {
    setLocalStyles(styles);
    setHasChanges(false);
  };

  const fonts = [
    'Inter', 'Arial', 'Helvetica', 'Times New Roman', 'Georgia',
    'Verdana', 'Courier New', 'Comic Sans MS', 'Roboto', 'Open Sans'
  ];

  const tabs = [
    { id: 'background', label: 'Sfondo', icon: FaImage },
    { id: 'typography', label: 'Tipografia', icon: FaFont },
    { id: 'colors', label: 'Colori', icon: FaPalette },
    { id: 'layout', label: 'Layout', icon: FaExpand },
    { id: 'custom', label: 'Personalizza', icon: FaPalette }
  ];

  const renderBackgroundSettings = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Tipo di Sfondo</label>
        <select
          value={localStyles.background_type}
          onChange={(e) => handleChange('background_type', e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="color">Colore Unito</option>
          <option value="gradient">Gradiente</option>
          <option value="image">Immagine</option>
        </select>
      </div>

      {localStyles.background_type === 'color' && (
        <div>
          <label className="block text-sm font-medium mb-2">Colore Sfondo</label>
          <input
            type="color"
            value={localStyles.background_color}
            onChange={(e) => handleChange('background_color', e.target.value)}
            className="w-full h-10 rounded cursor-pointer"
          />
        </div>
      )}

      {localStyles.background_type === 'gradient' && (
        <div>
          <label className="block text-sm font-medium mb-2">Gradiente CSS</label>
          <input
            type="text"
            value={localStyles.background_gradient || ''}
            onChange={(e) => handleChange('background_gradient', e.target.value)}
            placeholder="linear-gradient(45deg, #667eea, #764ba2)"
            className="w-full p-2 border rounded"
          />
        </div>
      )}

      {localStyles.background_type === 'image' && (
        <>
          <div>
            <label className="block text-sm font-medium mb-2">URL Immagine</label>
            <input
              type="text"
              value={localStyles.background_image || ''}
              onChange={(e) => handleChange('background_image', e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Dimensione</label>
              <select
                value={localStyles.background_size}
                onChange={(e) => handleChange('background_size', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Posizione</label>
              <select
                value={localStyles.background_position}
                onChange={(e) => handleChange('background_position', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="center">Center</option>
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Ripeti</label>
              <select
                value={localStyles.background_repeat}
                onChange={(e) => handleChange('background_repeat', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="no-repeat">No Repeat</option>
                <option value="repeat">Repeat</option>
                <option value="repeat-x">Repeat X</option>
                <option value="repeat-y">Repeat Y</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Allegato</label>
              <select
                value={localStyles.background_attachment}
                onChange={(e) => handleChange('background_attachment', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="scroll">Scroll</option>
                <option value="fixed">Fixed</option>
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderTypographySettings = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Font Testo</label>
        <select
          value={localStyles.font_family}
          onChange={(e) => handleChange('font_family', e.target.value)}
          className="w-full p-2 border rounded"
        >
          {fonts.map(font => (
            <option key={font} value={font}>{font}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Dimensione Font Testo (px)</label>
        <input
          type="text"
          value={localStyles.font_size}
          onChange={(e) => handleChange('font_size', e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Colore Testo</label>
        <input
          type="color"
          value={localStyles.font_color}
          onChange={(e) => handleChange('font_color', e.target.value)}
          className="w-full h-10 rounded cursor-pointer"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Font Titoli</label>
        <select
          value={localStyles.heading_font}
          onChange={(e) => handleChange('heading_font', e.target.value)}
          className="w-full p-2 border rounded"
        >
          {fonts.map(font => (
            <option key={font} value={font}>{font}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Colore Titoli</label>
        <input
          type="color"
          value={localStyles.heading_color}
          onChange={(e) => handleChange('heading_color', e.target.value)}
          className="w-full h-10 rounded cursor-pointer"
        />
      </div>
    </div>
  );

  const renderColorSettings = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Colore Primario</label>
          <input
            type="color"
            value={localStyles.primary_color}
            onChange={(e) => handleChange('primary_color', e.target.value)}
            className="w-full h-10 rounded cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Colore Secondario</label>
          <input
            type="color"
            value={localStyles.secondary_color}
            onChange={(e) => handleChange('secondary_color', e.target.value)}
            className="w-full h-10 rounded cursor-pointer"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Colore d'Accento</label>
          <input
            type="color"
            value={localStyles.accent_color}
            onChange={(e) => handleChange('accent_color', e.target.value)}
            className="w-full h-10 rounded cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Colore Link</label>
          <input
            type="color"
            value={localStyles.link_color}
            onChange={(e) => handleChange('link_color', e.target.value)}
            className="w-full h-10 rounded cursor-pointer"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Sfondo Pulsanti</label>
          <input
            type="color"
            value={localStyles.button_background_color}
            onChange={(e) => handleChange('button_background_color', e.target.value)}
            className="w-full h-10 rounded cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Testo Pulsanti</label>
          <input
            type="color"
            value={localStyles.button_text_color}
            onChange={(e) => handleChange('button_text_color', e.target.value)}
            className="w-full h-10 rounded cursor-pointer"
          />
        </div>
      </div>
    </div>
  );

  const renderLayoutSettings = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Larghezza Massima Container</label>
        <select
          value={localStyles.container_max_width}
          onChange={(e) => handleChange('container_max_width', e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="100%">Full Width</option>
          <option value="1200px">1200px</option>
          <option value="1024px">1024px</option>
          <option value="768px">768px</option>
          <option value="640px">640px</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Padding Superiore</label>
          <input
            type="text"
            value={localStyles.padding_top}
            onChange={(e) => handleChange('padding_top', e.target.value)}
            placeholder="60px"
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Padding Inferiore</label>
          <input
            type="text"
            value={localStyles.padding_bottom}
            onChange={(e) => handleChange('padding_bottom', e.target.value)}
            placeholder="60px"
            className="w-full p-2 border rounded"
          />
        </div>
      </div>
    </div>
  );

  const renderCustomSettings = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">CSS Personalizzato</label>
        <textarea
          value={localStyles.custom_css || ''}
          onChange={(e) => handleChange('custom_css', e.target.value)}
          placeholder="Inserisci codice CSS personalizzato..."
          className="w-full p-2 border rounded h-32 font-mono text-sm"
        />
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'background':
        return renderBackgroundSettings();
      case 'typography':
        return renderTypographySettings();
      case 'colors':
        return renderColorSettings();
      case 'layout':
        return renderLayoutSettings();
      case 'custom':
        return renderCustomSettings();
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>

      <div className="p-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 border-b">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                <Icon className="text-sm" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="mb-6">
          {renderTabContent()}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleReset}
            disabled={!hasChanges}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            <FaUndo />
            <span>Annulla</span>
          </button>

          <button
            onClick={handleSave}
            disabled={!hasChanges || !onSave}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            <FaSave />
            <span>Salva Stili</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StyleEditor;