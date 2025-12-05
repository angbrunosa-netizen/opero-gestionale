/**
 * @file CatalogManager.js
 * @description Componente per la gestione del catalogo prodotti dinamico
 * - Integrazione con database prodotti Opero (catalogo_prodotti)
 * - Utilizzo immagini esistenti da dm_files
 * - Configurazione layout e visualizzazione
 * - Preparazione per evoluzione a e-commerce completo
 * @version 1.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import {
  ShoppingBagIcon,
  Cog6ToothIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  GridIcon,
  ListBulletIcon,
  CurrencyEuroIcon,
  PackageIcon,
  TagIcon
} from '@heroicons/react/24/outline';

const CatalogManager = ({ websiteId, companyId, settings, onSettingsChange, onSave }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    featured: false,
    inStock: true
  });

  // Carica dati catalogo
  const loadCatalogData = useCallback(async () => {
    try {
      setLoading(true);

      const [productsRes, categoriesRes] = await Promise.all([
        api.get(`/catalogo/prodotti?azienda=${companyId}`),
        api.get(`/catalogo/categorie?azienda=${companyId}`)
      ]);

      setProducts(productsRes.data.prodotti || []);
      setCategories(categoriesRes.data.categorie || []);

    } catch (error) {
      console.error('Errore caricamento catalogo:', error);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // Filtra prodotti
  const filteredProducts = products.filter(product => {
    const matchesSearch = !filters.search ||
      product.nome_prodotto.toLowerCase().includes(filters.search.toLowerCase()) ||
      product.codice_prodotto?.toLowerCase().includes(filters.search.toLowerCase());

    const matchesCategory = !filters.category ||
      product.categoria_slug === filters.category;

    const matchesFeatured = !filters.featured ||
      product.is_featured;

    const matchesStock = !filters.inStock ||
      product.quantita_disponibile > 0;

    return matchesSearch && matchesCategory && matchesFeatured && matchesStock;
  });

  // Aggiorna configurazione catalogo
  const updateSettings = useCallback((newSettings) => {
    onSettingsChange({ ...settings, ...newSettings });
    onSave('catalog_settings', { ...settings, ...newSettings });
  }, [settings, onSettingsChange, onSave]);

  // Gestione prodotti selezionati
  const toggleProductSelection = (productId) => {
    const isSelected = selectedProducts.includes(productId);
    if (isSelected) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  // Aggiorna prodotto featured
  const toggleProductFeatured = async (productId) => {
    try {
      const product = products.find(p => p.id === productId);
      await api.put(`/catalogo/prodotti/${productId}`, {
        ...product,
        is_featured: !product.is_featured
      });
      setProducts(products.map(p =>
        p.id === productId ? { ...p, is_featured: !p.is_featured } : p
      ));
    } catch (error) {
      console.error('Errore aggiornamento prodotto:', error);
    }
  };

  useEffect(() => {
    if (companyId) {
      loadCatalogData();
    }
  }, [companyId, loadCatalogData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Statistiche */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Catalogo Prodotti</h3>
            <p className="text-sm text-gray-600 mt-1">
              {products.length} prodotti totali • {categories.length} categorie
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">In evidenza</p>
              <p className="text-xl font-semibold text-gray-900">
                {products.filter(p => p.is_featured).length}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Disponibili</p>
              <p className="text-xl font-semibold text-green-600">
                {products.filter(p => p.quantita_disponibile > 0).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Configurazione Catalogo */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Configurazione Vetrina</h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Layout */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Layout Visualizzazione
            </label>
            <select
              value={settings.catalog_layout || 'grid'}
              onChange={(e) => updateSettings({ catalog_layout: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="grid">Griglia</option>
              <option value="list">Lista</option>
              <option value="cards">Card</option>
            </select>
          </div>

          {/* Prodotti per pagina */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prodotti per pagina
            </label>
            <input
              type="number"
              value={settings.products_per_page || 12}
              onChange={(e) => updateSettings({ products_per_page: parseInt(e.target.value) })}
              min="6"
              max="48"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Mostra prezzi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mostra Prezzi
            </label>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.show_prices !== false}
                onChange={(e) => updateSettings({ show_prices: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Visualizza prezzi prodotti
              </span>
            </div>
          </div>

          {/* Abilita carrello */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pulsanti Acquisto
            </label>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.enable_cart || false}
                onChange={(e) => updateSettings({ enable_cart: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Abilita pulsanti "Aggiungi al carrello"
              </span>
            </div>
          </div>

          {/* Ordinamento default */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ordinamento Default
            </label>
            <select
              value={settings.default_sort || 'name_asc'}
              onChange={(e) => updateSettings({ default_sort: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="name_asc">Nome (A-Z)</option>
              <option value="name_desc">Nome (Z-A)</option>
              <option value="price_asc">Prezzo (crescente)</option>
              <option value="price_desc">Prezzo (decrescente)</option>
              <option value="created_desc">Più recenti</option>
            </select>
          </div>

          {/* Mostra disponibilità */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mostra Disponibilità
            </label>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.show_stock !== false}
                onChange={(e) => updateSettings({ show_stock: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Indica disponibilità prodotti
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Ricerca */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca prodotti..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Controlli */}
          <div className="flex items-center space-x-3">
            {/* Filtri */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
              Filtri
            </button>

            {/* View mode */}
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              >
                <GridIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              >
                <ListBulletIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Seleziona tutto */}
            <button
              onClick={() => {
                if (selectedProducts.length === filteredProducts.length) {
                  setSelectedProducts([]);
                } else {
                  setSelectedProducts(filteredProducts.map(p => p.id));
                }
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {selectedProducts.length === filteredProducts.length ? 'Deseleziona tutto' : 'Seleziona tutto'}
            </button>
          </div>
        </div>

        {/* Filtri dettagliati */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Categoria */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tutte le categorie</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.nome_categoria}
                    </option>
                  ))}
                </select>
              </div>

              {/* Solo in evidenza */}
              <div className="flex items-center pt-6">
                <input
                  type="checkbox"
                  id="featured-only"
                  checked={filters.featured}
                  onChange={(e) => setFilters({ ...filters, featured: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="featured-only" className="ml-2 text-sm text-gray-700">
                  Solo prodotti in evidenza
                </label>
              </div>

              {/* Solo disponibili */}
              <div className="flex items-center pt-6">
                <input
                  type="checkbox"
                  id="in-stock-only"
                  checked={filters.inStock}
                  onChange={(e) => setFilters({ ...filters, inStock: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="in-stock-only" className="ml-2 text-sm text-gray-700">
                  Solo disponibili
                </label>
              </div>

              {/* Reset filtri */}
              <button
                onClick={() => setFilters({ category: '', search: '', featured: false, inStock: true })}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 mt-6"
              >
                Reset Filtri
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lista prodotti */}
      <div className="bg-white rounded-lg border border-gray-200">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nessun prodotto trovato</h3>
            <p className="mt-1 text-sm text-gray-500">
              Prova a modificare i filtri o aggiungere nuovi prodotti
            </p>
          </div>
        ) : (
          <>
            {/* Selezione multipla */}
            {selectedProducts.length > 0 && (
              <div className="p-4 border-b border-gray-200 bg-blue-50">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-blue-700">
                    {selectedProducts.length} prodotti selezionati
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        const productsToUpdate = products.filter(p =>
                          selectedProducts.includes(p.id) && !p.is_featured
                        );
                        productsToUpdate.forEach(p => toggleProductFeatured(p.id));
                      }}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Imposta come in evidenza
                    </button>
                    <button
                      onClick={() => setSelectedProducts([])}
                      className="px-3 py-1 border border-blue-600 text-blue-600 text-sm rounded hover:bg-blue-50"
                    >
                      Deseleziona tutto
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Products Grid/List */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6' : 'divide-y divide-gray-200'}>
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  viewMode={viewMode}
                  isSelected={selectedProducts.includes(product.id)}
                  onToggleSelect={() => toggleProductSelection(product.id)}
                  onToggleFeatured={() => toggleProductFeatured(product.id)}
                  settings={settings}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Componente Product Card
const ProductCard = ({ product, viewMode, isSelected, onToggleSelect, onToggleFeatured, settings }) => {
  // Carica immagini da dm_files se disponibili
  const [images, setImages] = useState([]);

  useEffect(() => {
    // Simula caricamento immagini - in reale chiamerebbe API
    // per ora mostra placeholder
    setImages([`/placeholder-product-${product.id}.jpg`]);
  }, [product.id]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(price || 0);
  };

  const getStockStatus = (quantity) => {
    if (quantity > 10) return { text: 'Disponibile', class: 'text-green-600' };
    if (quantity > 0) return { text: `Solo ${quantity} pezzi`, class: 'text-yellow-600' };
    return { text: 'Non disponibile', class: 'text-red-600' };
  };

  if (viewMode === 'list') {
    const stockStatus = getStockStatus(product.quantita_disponibile);
    return (
      <div className={`p-4 hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
        <div className="flex items-center space-x-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />

          {/* Immagine */}
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0">
            {images.length > 0 ? (
              <img
                src={images[0]}
                alt={product.nome_prodotto}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <PackageIcon className="w-full h-full p-4 text-gray-400" />
            )}
          </div>

          {/* Informazioni */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {product.nome_prodotto}
                </h4>
                {product.codice_prodotto && (
                  <p className="text-xs text-gray-500">
                    Cod: {product.codice_prodotto}
                  </p>
                )}
              </div>

              <div className="text-right ml-4">
                {settings.show_prices !== false && (
                  <p className="font-semibold text-gray-900">
                    {formatPrice(product.prezzo_vendita)}
                  </p>
                )}
                {product.prezzo_offerta && (
                  <p className="text-sm text-red-600">
                    {formatPrice(product.prezzo_offerta)}
                  </p>
                )}
              </div>
            </div>

            {/* Categoria e disponibilità */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-3">
                {product.nome_categoria && (
                  <span className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                    <TagIcon className="h-3 w-3 mr-1" />
                    {product.nome_categoria}
                  </span>
                )}

                {settings.show_stock !== false && (
                  <span className={`text-xs ${stockStatus.class}`}>
                    {stockStatus.text}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={onToggleFeatured}
                  className={`p-1 rounded ${product.is_featured ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                  title={product.is_featured ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
                >
                  <StarIcon className="h-4 w-4" />
                </button>
                <button
                  className="p-1 text-gray-400 hover:text-blue-500"
                  title="Visualizza prodotto"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  const stockStatus = getStockStatus(product.quantita_disponibile);
  return (
    <div className={`relative group cursor-pointer rounded-lg border-2 ${
      isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
    }`}>
      {/* Checkbox selezione */}
      <div className="absolute top-2 left-2 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      </div>

      {/* Badge in evidenza */}
      {product.is_featured && (
        <div className="absolute top-2 right-2 z-10">
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
            <StarIcon className="h-3 w-3 mr-1" />
            In evidenza
          </span>
        </div>
      )}

      {/* Card content */}
      <div className="p-4">
        {/* Immagine */}
        <div className="aspect-square bg-gray-100 rounded-lg mb-4 relative overflow-hidden">
          {images.length > 0 ? (
            <img
              src={images[0]}
              alt={product.nome_prodotto}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              onError={(e) => {
                e.target.src = '/placeholder-product.png';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PackageIcon className="h-12 w-12 text-gray-400" />
            </div>
          )}

          {/* Overlay azioni */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex space-x-2">
              <button
                className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                title="Visualizza prodotto"
              >
                <EyeIcon className="h-4 w-4 text-gray-700" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFeatured();
                }}
                className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                title={product.is_featured ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
              >
                <StarIcon className={`h-4 w-4 ${product.is_featured ? 'text-yellow-500' : 'text-gray-700'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Informazioni prodotto */}
        <div className="space-y-2">
          <h3 className="font-medium text-gray-900 line-clamp-2">
            {product.nome_prodotto}
          </h3>

          {product.codice_prodotto && (
            <p className="text-xs text-gray-500">
              Cod: {product.codice_prodotto}
            </p>
          )}

          {product.nome_categoria && (
            <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
              {product.nome_categoria}
            </span>
          )}

          {/* Prezzo */}
          {settings.show_prices !== false && (
            <div className="flex items-center justify-between">
              <div>
                {product.prezzo_offerta ? (
                  <>
                    <p className="text-lg font-bold text-red-600">
                      {formatPrice(product.prezzo_offerta)}
                    </p>
                    <p className="text-sm text-gray-500 line-through">
                      {formatPrice(product.prezzo_vendita)}
                    </p>
                  </>
                ) : (
                  <p className="text-lg font-bold text-gray-900">
                    {formatPrice(product.prezzo_vendita)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Disponibilità */}
          {settings.show_stock !== false && (
            <div className={`text-xs ${stockStatus.class} font-medium`}>
              {stockStatus.text}
            </div>
          )}

          {/* Pulsante acquisto */}
          {settings.enable_cart && product.quantita_disponibile > 0 && (
            <button
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Aggiungi al carrello
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Icona Star mancante
const StarIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

export default CatalogManager;