/**
 * PageContentEditor Component
 * Editor WYSIWYG per la modifica dei contenuti testuali delle sezioni
 */

import React, { useState, useEffect } from 'react';
import {
  PencilIcon,
  EyeIcon,
  PlusIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  PhotoIcon,
  LinkIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

// Importa il selettore di immagini
import WebsiteImageSelector from './WebsiteImageSelector';

const PageContentEditor = ({
  section,
  sectionData,
  onSectionUpdate,
  isEditing = false,
  previewMode = false,
  templateId = 1,
  websiteId // Aggiunto websiteId per l'upload delle immagini
}) => {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [content, setContent] = useState(sectionData || {});
  const [activeField, setActiveField] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(previewMode);

  useEffect(() => {
    if (sectionData) {
      setContent(sectionData);
    }
  }, [sectionData]);

  const handleSectionUpdate = (updatedContent) => {
    setContent(updatedContent);
    if (onSectionUpdate) {
      onSectionUpdate(updatedContent);
    }
  };

  const handleFieldChange = (field, value) => {
    const updatedContent = {
      ...content,
      [field]: value
    };
    handleSectionUpdate(updatedContent);
  };

  const addArrayItem = (arrayField, defaultItem = {}) => {
    const currentArray = content[arrayField] || [];
    const newItem = {
      id: Date.now(),
      ...defaultItem
    };
    const updatedArray = [...currentArray, newItem];
    handleFieldChange(arrayField, updatedArray);
  };

  const updateArrayItem = (arrayField, index, field, value) => {
    const currentArray = content[arrayField] || [];
    const updatedArray = [...currentArray];
    updatedArray[index] = {
      ...updatedArray[index],
      [field]: value
    };
    handleFieldChange(arrayField, updatedArray);
  };

  const removeArrayItem = (arrayField, index) => {
    const currentArray = content[arrayField] || [];
    const updatedArray = currentArray.filter((_, i) => i !== index);
    handleFieldChange(arrayField, updatedArray);
  };

  const moveArrayItem = (arrayField, fromIndex, toIndex) => {
    const currentArray = content[arrayField] || [];
    const updatedArray = [...currentArray];
    const [movedItem] = updatedArray.splice(fromIndex, 1);
    updatedArray.splice(toIndex, 0, movedItem);
    handleFieldChange(arrayField, updatedArray);
  };

  const renderContentField = (fieldConfig) => {
    const { field, type, label, placeholder, required, options } = fieldConfig;
    const value = content[field];

    switch (type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            placeholder={placeholder}
            required={required}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            placeholder={placeholder}
            rows={fieldConfig.rows || 4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        );

      case 'richtext':
        return (
          <div className="border border-gray-300 rounded-md">
            <RichTextEditor
              value={value || ''}
              onChange={(content) => handleFieldChange(field, content)}
              placeholder={placeholder}
            />
          </div>
        );

      case 'color':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={value || '#000000'}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={value || ''}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              placeholder="#000000"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Seleziona...</option>
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleFieldChange(field, e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              {fieldConfig.checkboxLabel || 'Abilitato'}
            </span>
          </label>
        );

      case 'link':
        return (
          <div className="space-y-2">
            <input
              type="text"
              value={value?.text || ''}
              onChange={(e) => handleFieldChange(field, { ...value, text: e.target.value })}
              placeholder="Testo del link"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="url"
              value={value?.url || ''}
              onChange={(e) => handleFieldChange(field, { ...value, url: e.target.value })}
              placeholder="URL del link"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        );

      case 'image':
        return (
          <div className="space-y-2">
            <WebsiteImageSelector
              onImageSelect={(image) => handleFieldChange(field, image)}
              selectedImage={value}
              multiple={false}
              websiteId={websiteId}
              className="w-full"
            />
            {value && (
              <div className="mt-2">
                <img
                  src={value.previewUrl || 'https://via.placeholder.com/300x200/f3f4f6/6b7280?text=Anteprima'}
                  alt={value.file_name_originale || 'Preview'}
                  className="max-w-full h-auto rounded border border-gray-200"
                  style={{ maxHeight: '200px' }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {value.file_name_originale}
                </p>
              </div>
            )}
          </div>
        );

      case 'images':
        return (
          <div className="space-y-2">
            <WebsiteImageSelector
              onImageSelect={(images) => handleFieldChange(field, images)}
              selectedImage={value}
              multiple={true}
              maxImages={fieldConfig.maxImages || 10}
              websiteId={websiteId}
              className="w-full"
            />
            {value && value.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {value.map((image, index) => (
                  <div key={image.id_file || index} className="relative">
                    <img
                      src={image.previewUrl || 'https://via.placeholder.com/150x150/f3f4f6/6b7280?text=Immagine'}
                      alt={image.file_name_originale || `Image ${index + 1}`}
                      className="w-full h-24 object-cover rounded border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newImages = value.filter((_, i) => i !== index);
                        handleFieldChange(field, newImages);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <TrashIcon className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        );
    }
  };

  const renderArrayEditor = (arrayField, itemConfig, title) => {
    const items = content[arrayField] || [];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900">{title}</h4>
          <button
            type="button"
            onClick={() => addArrayItem(arrayField, itemConfig.defaultItem)}
            className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          >
            <PlusIcon className="h-3 w-3 mr-1" />
            Aggiungi
          </button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-md border-2 border-dashed border-gray-300">
            <p className="text-gray-500">Nessun elemento aggiunto</p>
            <button
              type="button"
              onClick={() => addArrayItem(arrayField, itemConfig.defaultItem)}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
            >
              Aggiungi il primo elemento
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-sm font-medium text-gray-900">
                    {itemConfig.itemLabel || `Elemento ${index + 1}`}
                  </h5>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => moveArrayItem(arrayField, index, index - 1)}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                      <ChevronUpIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveArrayItem(arrayField, index, index + 1)}
                      disabled={index === items.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                      <ChevronDownIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeArrayItem(arrayField, index)}
                      className="p-1 text-red-400 hover:text-red-600"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {itemConfig.fields.map((field) => (
                    <div key={field.field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                      </label>
                      {renderArrayItemField(arrayField, index, field)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderArrayItemField = (arrayField, itemIndex, fieldConfig) => {
    const items = content[arrayField] || [];
    const item = items[itemIndex] || {};
    const value = item[fieldConfig.field];

    switch (fieldConfig.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => updateArrayItem(arrayField, itemIndex, fieldConfig.field, e.target.value)}
            placeholder={fieldConfig.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => updateArrayItem(arrayField, itemIndex, fieldConfig.field, e.target.value)}
            placeholder={fieldConfig.placeholder}
            rows={fieldConfig.rows || 2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => updateArrayItem(arrayField, itemIndex, fieldConfig.field, e.target.value)}
            placeholder={fieldConfig.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        );
    }
  };

  const renderPreview = () => {
    switch (section.id) {
      case 'hero':
        return (
          <div className="text-center py-12 px-6 rounded-lg" style={{ backgroundColor: content.background_color || '#3B82F6' }}>
            <h1 className="text-4xl font-bold text-white mb-4">{content.title}</h1>
            <p className="text-xl text-white/90 mb-8">{content.subtitle}</p>
            {content.cta_text && content.cta_link && (
              <a href={content.cta_link} className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100">
                {content.cta_text}
              </a>
            )}
          </div>
        );

      case 'about':
        return (
          <div className="py-12 px-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">{content.title}</h2>
            <p className="text-xl text-gray-600 mb-6 text-center">{content.subtitle}</p>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content.content || '<p>Contenuto della sezione...</p>' }} />
          </div>
        );

      case 'services':
        return (
          <div className="py-12 px-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">{content.title}</h2>
            <p className="text-xl text-gray-600 mb-8 text-center">{content.subtitle}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {content.services?.map((service, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'features':
        return (
          <div className="py-12 px-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{content.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {content.features?.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">{feature.icon || '✨'}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="py-12 px-6 bg-gray-50 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.name}</h2>
            <p className="text-gray-600">Anteprima non disponibile per questo tipo di sezione</p>
          </div>
        );
    }
  };

  const getSectionFields = () => {
    const sectionFieldConfigs = {
      hero: [
        { field: 'title', type: 'text', label: 'Titolo', placeholder: 'Titolo principale', required: true },
        { field: 'subtitle', type: 'textarea', label: 'Sottotitolo', placeholder: 'Sottotitolo descrittivo', rows: 2 },
        { field: 'cta_text', type: 'text', label: 'Testo Pulsante', placeholder: 'Scopri di più' },
        { field: 'cta_link', type: 'text', label: 'Link Pulsante', placeholder: '#contatti' },
        { field: 'background_color', type: 'color', label: 'Colore di Sfondo' },
        { field: 'background_image', type: 'image', label: 'Immagine di Sfondo' }
      ],
      about: [
        { field: 'title', type: 'text', label: 'Titolo', placeholder: 'Titolo sezione', required: true },
        { field: 'subtitle', type: 'textarea', label: 'Sottotitolo', placeholder: 'Sottotitolo descrittivo', rows: 2 },
        { field: 'content', type: 'richtext', label: 'Contenuto', placeholder: 'Testo completo della sezione' },
        { field: 'layout', type: 'select', label: 'Layout', options: [
          { value: 'text-left', label: 'Testo a sinistra' },
          { value: 'text-right', label: 'Testo a destra' },
          { value: 'text-center', label: 'Testo centrato' }
        ]},
        { field: 'image', type: 'image', label: 'Immagine Azienda' }
      ],
      services: [
        { field: 'title', type: 'text', label: 'Titolo', placeholder: 'I Nostri Servizi', required: true },
        { field: 'subtitle', type: 'textarea', label: 'Sottotitolo', placeholder: 'Descrizione servizi', rows: 2 },
        { field: 'background_image', type: 'image', label: 'Immagine Sezione Servizi' },
        { field: 'cta_text', type: 'text', label: 'Testo Pulsante CTA' },
        { field: 'cta_link', type: 'text', label: 'Link Pulsante CTA' }
      ],
      gallery: [
        { field: 'title', type: 'text', label: 'Titolo Galleria', placeholder: 'La Nostra Galleria' },
        { field: 'subtitle', type: 'textarea', label: 'Sottotitolo', placeholder: 'Scopri i nostri lavori', rows: 2 },
        { field: 'layout', type: 'select', label: 'Layout', options: [
          { value: 'grid-2', label: 'Griglia 2 colonne' },
          { value: 'grid-3', label: 'Griglia 3 colonne' },
          { value: 'grid-4', label: 'Griglia 4 colonne' },
          { value: 'masonry', label: 'Masonry' }
        ]},
        { field: 'images', type: 'images', label: 'Immagini Galleria', maxImages: 12 }
      ]
    };

    return sectionFieldConfigs[section.id] || [];
  };

  const getArrayConfigs = () => {
    const arrayConfigs = {
      services: {
        itemLabel: 'Servizio',
        defaultItem: { title: '', description: '' },
        fields: [
          { field: 'title', type: 'text', label: 'Titolo Servizio', placeholder: 'Nome servizio' },
          { field: 'description', type: 'textarea', label: 'Descrizione', placeholder: 'Descrizione dettagliata' }
        ]
      },
      features: {
        itemLabel: 'Caratteristica',
        defaultItem: { icon: '✨', title: '', description: '' },
        fields: [
          { field: 'icon', type: 'text', label: 'Icona', placeholder: '✨' },
          { field: 'title', type: 'text', label: 'Titolo', placeholder: 'Nome caratteristica' },
          { field: 'description', type: 'text', label: 'Descrizione', placeholder: 'Breve descrizione' }
        ]
      }
    };

    return arrayConfigs;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{section.name}</h3>
          <p className="text-sm text-gray-600">{section.description || 'Modifica i contenuti di questa sezione'}</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`inline-flex items-center px-3 py-2 text-sm rounded-md ${
              isPreviewMode
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            <EyeIcon className="h-4 w-4 mr-2" />
            {isPreviewMode ? 'Modifica' : 'Anteprima'}
          </button>

          {isEditing && !isPreviewMode && (
            <button
              onClick={() => setIsConfiguring(!isConfiguring)}
              className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200"
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
              {isConfiguring ? 'Chiudi Opzioni' : 'Opzioni Avanzate'}
            </button>
          )}
        </div>
      </div>

      {/* Preview Mode */}
      {isPreviewMode ? (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {renderPreview()}
        </div>
      ) : (
        /* Edit Mode */
        <div className="space-y-6">
          {/* Basic Fields */}
          {getSectionFields().map((fieldConfig) => (
            <div key={fieldConfig.field}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {fieldConfig.label}
                {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {renderContentField(fieldConfig)}
            </div>
          ))}

          {/* Array Fields */}
          {Object.entries(getArrayConfigs()).map(([arrayField, config]) => (
            <div key={arrayField}>
              {renderArrayEditor(arrayField, config, config.itemLabel + 's')}
            </div>
          ))}

          {/* Advanced Configuration */}
          {isConfiguring && isEditing && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Opzioni Avanzate</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CSS Custom Class
                  </label>
                  <input
                    type="text"
                    value={content.custom_class || ''}
                    onChange={(e) => handleFieldChange('custom_class', e.target.value)}
                    placeholder="classi CSS personalizzate"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID Sezione
                  </label>
                  <input
                    type="text"
                    value={content.section_id || ''}
                    onChange={(e) => handleFieldChange('section_id', e.target.value)}
                    placeholder="id html sezione"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Simple Rich Text Editor Component
 */
const RichTextEditor = ({ value, onChange, placeholder }) => {
  const handleInput = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-300 p-2">
        <span className="text-xs text-gray-600">Editor Testo Semplice</span>
      </div>
      <textarea
        value={value || ''}
        onChange={handleInput}
        placeholder={placeholder}
        rows={4}
        className="w-full p-3 border-0 focus:outline-none resize-y min-h-[120px]"
      />
    </div>
  );
};

export default PageContentEditor;