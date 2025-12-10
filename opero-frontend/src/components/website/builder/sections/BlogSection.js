/**
 * Blog Section
 * Componente per visualizzare articoli di blog recenti
 */

import React, { useState } from 'react';
import {
  DocumentTextIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarIcon,
  UserIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const BlogSection = ({ data, onChange, onRemove, onMoveUp, onMoveDown }) => {
  // Dati di esempio per il preview
  const samplePosts = [
    {
      id: 1,
      title: 'Le ultime novità del settore',
      excerpt: 'Scopri le tendenze più recenti che stanno trasformando il nostro settore...',
      author: 'Mario Rossi',
      date: '2024-12-10',
      readTime: '5 min',
      image: 'https://via.placeholder.com/400x300',
      category: 'Novità',
      likes: 42,
      comments: 8
    },
    {
      id: 2,
      title: 'Guida completa al nostro servizio',
      excerpt: 'Tutto quello che devi sapere per sfruttare al meglio le nostre funzionalità...',
      author: 'Laura Bianchi',
      date: '2024-12-08',
      readTime: '8 min',
      image: 'https://via.placeholder.com/400x300',
      category: 'Guide',
      likes: 67,
      comments: 12
    },
    {
      id: 3,
      title: 'Storie di successo dai nostri clienti',
      excerpt: 'Come le aziende hanno trasformato il loro business con la nostra soluzione...',
      author: 'Paolo Verdi',
      date: '2024-12-05',
      readTime: '6 min',
      image: 'https://via.placeholder.com/400x300',
      category: 'Case Study',
      likes: 89,
      comments: 15
    }
  ];

  const layoutOptions = [
    { value: 'grid', label: 'Griglia', description: 'Card in griglia regolare' },
    { value: 'list', label: 'Lista', description: 'Articoli in elenco verticale' },
    { value: 'carousel', label: 'Carosello', description: 'Slider orizzontale' },
    { value: 'masonry', label: 'Masonry', description: 'Layout a cascata' }
  ];

  const categoryOptions = [
    { value: 'all', label: 'Tutte le categorie' },
    { value: 'news', label: 'Novità' },
    { value: 'guides', label: 'Guide' },
    { value: 'tutorials', label: 'Tutorial' },
    { value: 'case-studies', label: 'Case Study' },
    { value: 'interviews', label: 'Interviste' }
  ];

  const sortOptions = [
    { value: 'recent', label: 'Più recenti' },
    { value: 'popular', label: 'Più popolari' },
    { value: 'comments', label: 'Più commentati' },
    { value: 'alphabetical', label: 'Alfabetico' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <DocumentTextIcon className="h-6 w-6 text-green-500 mr-3" />
          <h3 className="text-lg font-semibold">Blog Articoli</h3>
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

      {/* Titolo Sezione */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Titolo Sezione
        </label>
        <input
          type="text"
          value={data.title || 'Ultimi Articoli'}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Es: Ultimi Articoli, Novità, Blog"
        />
      </div>

      {/* Configurazione Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Layout</label>
          <select
            value={data.layout || 'grid'}
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Articoli da mostrare</label>
          <input
            type="number"
            value={data.postsToShow || 3}
            onChange={(e) => onChange({ ...data, postsToShow: parseInt(e.target.value) })}
            min="1"
            max="20"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Colonne (Griglia)</label>
          <select
            value={data.columns || 3}
            onChange={(e) => onChange({ ...data, columns: parseInt(e.target.value) })}
            disabled={data.layout === 'list'}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {[1, 2, 3, 4].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ordinamento</label>
          <select
            value={data.sortBy || 'recent'}
            onChange={(e) => onChange({ ...data, sortBy: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filtri e Opzioni */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Filtro Categoria</h4>

          <select
            value={data.category || 'all'}
            onChange={(e) => onChange({ ...data, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {categoryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={data.tags || ''}
            onChange={(e) => onChange({ ...data, tags: e.target.value })}
            placeholder="Tag (separati da virgola)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Elementi da Mostrare</h4>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={data.showReadMore !== false}
              onChange={(e) => onChange({ ...data, showReadMore: e.target.checked })}
              className="h-4 w-4 text-blue-600"
            />
            <span className="ml-2 text-sm text-gray-700">Pulsante "Leggi tutto"</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={data.showAuthor !== false}
              onChange={(e) => onChange({ ...data, showAuthor: e.target.checked })}
              className="h-4 w-4 text-blue-600"
            />
            <span className="ml-2 text-sm text-gray-700">Autore articolo</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={data.showDate !== false}
              onChange={(e) => onChange({ ...data, showDate: e.target.checked })}
              className="h-4 w-4 text-blue-600"
            />
            <span className="ml-2 text-sm text-gray-700">Data pubblicazione</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={data.showReadTime !== false}
              onChange={(e) => onChange({ ...data, showReadTime: e.target.checked })}
              className="h-4 w-4 text-blue-600"
            />
            <span className="ml-2 text-sm text-gray-700">Tempo di lettura</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={data.showMeta !== false}
              onChange={(e) => onChange({ ...data, showMeta: e.target.checked })}
              className="h-4 w-4 text-blue-600"
            />
            <span className="ml-2 text-sm text-gray-700">Meta (like, commenti)</span>
          </label>
        </div>
      </div>

      {/* Anteprima Layout */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">Anteprima Layout</h4>

        {data.layout === 'grid' && (
          <div className={`grid gap-4 ${
            data.columns === 1 ? 'grid-cols-1' :
            data.columns === 2 ? 'grid-cols-2' :
            data.columns === 3 ? 'grid-cols-3' :
            'grid-cols-4'
          }`}>
            {samplePosts.slice(0, data.postsToShow || 3).map(post => (
              <div key={post.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="h-32 bg-gray-200"></div>
                <div className="p-3">
                  <h5 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">
                    {post.title}
                  </h5>
                  {data.showDate && (
                    <p className="text-xs text-gray-500 mb-2">
                      <CalendarIcon className="h-3 w-3 inline mr-1" />
                      {post.date}
                    </p>
                  )}
                  {data.showReadTime && (
                    <p className="text-xs text-gray-500 mb-2">
                      <ClockIcon className="h-3 w-3 inline mr-1" />
                      {post.readTime}
                    </p>
                  )}
                  {data.showReadMore && (
                    <button className="text-blue-600 text-sm hover:text-blue-700">
                      Leggi tutto →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {data.layout === 'list' && (
          <div className="space-y-3">
            {samplePosts.slice(0, data.postsToShow || 3).map(post => (
              <div key={post.id} className="flex bg-white rounded-lg border border-gray-200 p-3">
                <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0 mr-3"></div>
                <div className="flex-1">
                  <h5 className="font-semibold text-sm text-gray-900 mb-1">{post.title}</h5>
                  <p className="text-xs text-gray-600 mb-1 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center text-xs text-gray-500 space-x-3">
                    {data.showAuthor && (
                      <span><UserIcon className="h-3 w-3 inline mr-1" />{post.author}</span>
                    )}
                    {data.showDate && (
                      <span><CalendarIcon className="h-3 w-3 inline mr-1" />{post.date}</span>
                    )}
                    {data.showReadTime && (
                      <span><ClockIcon className="h-3 w-3 inline mr-1" />{post.readTime}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {data.layout === 'carousel' && (
          <div className="relative">
            <div className="flex overflow-x-auto space-x-4 pb-4">
              {samplePosts.slice(0, data.postsToShow || 3).map(post => (
                <div key={post.id} className="flex-shrink-0 w-64 bg-white rounded-lg border border-gray-200">
                  <div className="h-32 bg-gray-200"></div>
                  <div className="p-3">
                    <h5 className="font-semibold text-sm text-gray-900 mb-1">{post.title}</h5>
                    <p className="text-xs text-gray-600 line-clamp-2">{post.excerpt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.layout === 'masonry' && (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
            {samplePosts.slice(0, data.postsToShow || 3).map(post => (
              <div key={post.id} className="break-inside-avoid mb-4 bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="h-24 bg-gray-200"></div>
                <div className="p-3">
                  <h5 className="font-semibold text-sm text-gray-900 mb-1">{post.title}</h5>
                  <p className="text-xs text-gray-600 mb-2">{post.excerpt}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* API Configuration */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Configurazione API Blog</h4>
        <p className="text-sm text-gray-600 mb-3">
          Per caricare articoli reali, configura l'endpoint del tuo blog:
        </p>
        <input
          type="url"
          value={data.apiEndpoint || ''}
          onChange={(e) => onChange({ ...data, apiEndpoint: e.target.value })}
          placeholder="https://api.miosito.it/blog/posts"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">
          L'API deve restituire un array di post con struttura: id, title, excerpt, author, date, image
        </p>
      </div>
    </div>
  );
};

export default BlogSection;