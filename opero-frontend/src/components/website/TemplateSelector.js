/**
 * Template Selector Component
 * Interfaccia per la selezione e anteprima dei template
 */

import React, { useState } from 'react';
import {
  SwatchIcon,
  EyeIcon,
  CheckCircleIcon,
  StarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const TemplateSelector = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(1);
  const [filter, setFilter] = useState('all');

  const templates = [
    {
      id: 1,
      name: 'Professional',
      category: 'basic',
      description: 'Template professionale pulito e moderno',
      preview_image: '/images/templates/professional-preview.jpg',
      features: ['Responsive Design', 'SEO Optimized', 'Fast Loading'],
      colors: { primary: '#3B82F6', secondary: '#1E40AF' },
      popular: true
    },
    {
      id: 2,
      name: 'Modern',
      category: 'basic',
      description: 'Template moderno con design minimalista',
      preview_image: '/images/templates/modern-preview.jpg',
      features: ['Clean Design', 'Typography Focus', 'High Contrast'],
      colors: { primary: '#10B981', secondary: '#047857' },
      popular: false
    },
    {
      id: 3,
      name: 'Creative',
      category: 'premium',
      description: 'Template creativo con design accattivante',
      preview_image: '/images/templates/creative-preview.jpg',
      features: ['Unique Layout', 'Animation Effects', 'Custom Components'],
      colors: { primary: '#8B5CF6', secondary: '#7C3AED' },
      popular: true
    },
    {
      id: 4,
      name: 'Ecommerce',
      category: 'ecommerce',
      description: 'Template ottimizzato per vendita online',
      preview_image: '/images/templates/ecommerce-preview.jpg',
      features: ['Product Catalog', 'Shopping Cart', 'Payment Integration'],
      colors: { primary: '#F97316', secondary: '#EA580C' },
      popular: false
    },
    {
      id: 5,
      name: 'Corporate',
      category: 'basic',
      description: 'Template corporate elegante e formale',
      preview_image: '/images/templates/corporate-preview.jpg',
      features: ['Business Focus', 'Professional Layout', 'Trust Signals'],
      colors: { primary: '#6B7280', secondary: '#374151' },
      popular: false
    }
  ];

  const filteredTemplates = filter === 'all'
    ? templates
    : templates.filter(t => t.category === filter);

  const getCategoryBadge = (category) => {
    const styles = {
      basic: 'bg-blue-100 text-blue-800',
      premium: 'bg-purple-100 text-purple-800',
      ecommerce: 'bg-green-100 text-green-800'
    };

    const labels = {
      basic: 'Base',
      premium: 'Premium',
      ecommerce: 'E-commerce'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[category]}`}>
        {labels[category]}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          Scegli il Template Perfetto
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Seleziona un template per dare al tuo sito un aspetto professionale in pochi minuti
        </p>
      </div>

      {/* Filter */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          {['all', 'basic', 'premium', 'ecommerce'].map((filterValue) => (
            <button
              key={filterValue}
              onClick={() => setFilter(filterValue)}
              className={`${
                filter === filterValue
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } px-4 py-2 text-sm font-medium border ${
                filterValue !== 'all' ? 'border-l-0' : ''
              } border-gray-300 first:rounded-l-md last:rounded-r-md focus:z-10 focus:ring-2 focus:ring-blue-500 focus:text-blue-700`}
            >
              {filterValue === 'all' ? 'Tutti' :
               filterValue === 'basic' ? 'Base' :
               filterValue === 'premium' ? 'Premium' : 'E-commerce'}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className={`relative bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ${
              selectedTemplate === template.id ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            {/* Popular Badge */}
            {template.popular && (
              <div className="absolute top-3 right-3 z-10">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <StarIcon className="w-3 h-3 mr-1" />
                  Popolare
                </span>
              </div>
            )}

            {/* Preview Image */}
            <div className="aspect-w-16 aspect-h-9 bg-gray-100 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ backgroundColor: template.colors.primary + '20' }}
                >
                  <SwatchIcon
                    className="w-16 h-16"
                    style={{ color: template.colors.primary }}
                  />
                </div>
              </div>

              {/* Preview Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                <button className="opacity-0 hover:opacity-100 transition-opacity duration-200 bg-white text-gray-900 px-3 py-1 rounded-md text-sm font-medium flex items-center">
                  <EyeIcon className="w-4 h-4 mr-1" />
                  Anteprima
                </button>
              </div>

              {/* Selected Indicator */}
              {selectedTemplate === template.id && (
                <div className="absolute top-3 left-3">
                  <div className="bg-blue-500 text-white rounded-full p-1">
                    <CheckCircleIcon className="w-5 h-5" />
                  </div>
                </div>
              )}
            </div>

            {/* Template Info */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                {getCategoryBadge(template.category)}
              </div>

              <p className="text-gray-600 text-sm mb-4">{template.description}</p>

              {/* Color Preview */}
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-xs text-gray-500">Colori:</span>
                <div
                  className="w-6 h-6 rounded-full border border-gray-300"
                  style={{ backgroundColor: template.colors.primary }}
                  title="Primary Color"
                />
                <div
                  className="w-6 h-6 rounded-full border border-gray-300"
                  style={{ backgroundColor: template.colors.secondary }}
                  title="Secondary Color"
                />
              </div>

              {/* Features */}
              <div className="space-y-2 mb-4">
                {template.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-600">
                    <SparklesIcon className="w-4 h-4 mr-2 text-blue-500" />
                    {feature}
                  </div>
                ))}
              </div>

              {/* Select Button */}
              <button
                onClick={() => setSelectedTemplate(template.id)}
                className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  selectedTemplate === template.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {selectedTemplate === template.id ? 'Selezionato' : 'Seleziona Template'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <SwatchIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nessun template trovato</h3>
          <p className="mt-1 text-sm text-gray-500">
            Prova a cambiare il filtro per vedere altri template.
          </p>
        </div>
      )}

      {/* Action Section */}
      {selectedTemplate && (
        <div className="mt-8 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              Template Selezionato: {templates.find(t => t.id === selectedTemplate)?.name}
            </h3>
            <p className="text-blue-700 mb-4">
              Puoi applicare questo template quando crei o modifichi un sito web.
            </p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700">
              Applica Template a Nuovo Sito
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateSelector;