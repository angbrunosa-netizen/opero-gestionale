/**
 * Products Block Component
 * Blocco per visualizzare una vetrina di prodotti dal catalogo
 */

import React, { useState, useEffect } from 'react';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';

const ProductsBlock = ({ content, onChange, preview = false, site }) => {
  const [data, setData] = useState({
    title: 'I Nostri Prodotti',
    subtitle: 'Scopri la nostra selezione di prodotti di qualità',
    showPrices: false,
    maxProducts: 6,
    columns: 3,
    sortBy: 'name', // name, price, created
    category: 'all', // all, or specific category
    showAddToCart: false,
    ...content
  });

  const [products, setProducts] = useState([]);

  // Simula caricamento prodotti dal catalogo
  useEffect(() => {
    if (preview && site?.id_ditta) {
      // Qui dovremmo chiamare l'API per recuperare i prodotti
      // Per ora usiamo dati di esempio
      setProducts([
        {
          id: 1,
          nome: 'Prodotto 1',
          descrizione_breve: 'Descrizione del prodotto 1',
          prezzo: 29.99,
          immagine_url: '',
          categoria: 'Elettronica'
        },
        {
          id: 2,
          nome: 'Prodotto 2',
          descrizione_breve: 'Descrizione del prodotto 2',
          prezzo: 49.99,
          immagine_url: '',
          categoria: 'Casa'
        },
        {
          id: 3,
          nome: 'Prodotto 3',
          descrizione_breve: 'Descrizione del prodotto 3',
          prezzo: 19.99,
          immagine_url: '',
          categoria: 'Elettronica'
        }
      ]);
    }
  }, [preview, site]);

  const handleChange = (field, value) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    onChange(newData);
  };

  const getGridCols = () => {
    switch (data.columns) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 md:grid-cols-2';
      case 3:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
  };

  if (preview) {
    const displayedProducts = products.slice(0, data.maxProducts);

    if (displayedProducts.length === 0) {
      return (
        <div className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-8 text-center">
            <ShoppingBagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{data.title}</h3>
            <p className="text-gray-600">{data.subtitle}</p>
            <p className="text-gray-500 mt-4">Nessun prodotto disponibile</p>
          </div>
        </div>
      );
    }

    return (
      <div className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{data.title}</h2>
            <p className="text-xl text-gray-600">{data.subtitle}</p>
          </div>

          <div className={`grid ${getGridCols()} gap-8`}>
            {displayedProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                {product.immagine_url ? (
                  <img
                    src={product.immagine_url}
                    alt={product.nome}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <ShoppingBagIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.nome}</h3>
                  <p className="text-gray-600 mb-4">{product.descrizione_breve}</p>
                  <div className="flex items-center justify-between">
                    {data.showPrices && (
                      <span className="text-2xl font-bold text-blue-600">
                        €{product.prezzo.toFixed(2)}
                      </span>
                    )}
                    {data.showAddToCart && (
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                        Aggiungi
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Titolo Sezione
        </label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="I Nostri Prodotti"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sottotitolo
        </label>
        <textarea
          value={data.subtitle}
          onChange={(e) => handleChange('subtitle', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="Scopri la nostra selezione..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Numero Prodotti da Mostrare
          </label>
          <input
            type="number"
            value={data.maxProducts}
            onChange={(e) => handleChange('maxProducts', parseInt(e.target.value) || 6)}
            min="1"
            max="20"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Colonne
          </label>
          <select
            value={data.columns}
            onChange={(e) => handleChange('columns', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={1}>1 colonna</option>
            <option value={2}>2 colonne</option>
            <option value={3}>3 colonne</option>
            <option value={4}>4 colonne</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ordina per
          </label>
          <select
            value={data.sortBy}
            onChange={(e) => handleChange('sortBy', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="name">Nome</option>
            <option value="price">Prezzo</option>
            <option value="created">Data inserimento</option>
            <option value="random">Casuale</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoria
          </label>
          <select
            value={data.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tutte le categorie</option>
            <option value="elettronica">Elettronica</option>
            <option value="casa">Casa</option>
            <option value="abbigliamento">Abbigliamento</option>
            <option value="sport">Sport</option>
          </select>
        </div>
      </div>

      {/* Opzioni aggiuntive */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Opzioni Visualizzazione</h4>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={data.showPrices}
            onChange={(e) => handleChange('showPrices', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Mostra prezzi</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={data.showAddToCart}
            onChange={(e) => handleChange('showAddToCart', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">Mostra pulsante "Aggiungi al carrello"</span>
        </label>
      </div>

      {/* Info note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ShoppingBagIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Informazioni Prodotti
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Questo blocco visualizza i prodotti dal catalogo aziendale.
                I prodotti vengono presi dal sistema esistente e mostrati con
                nome, descrizione, immagine e prezzo (se abilitato).
              </p>
              <p className="mt-1">
                Per modificare i prodotti, vai nella sezione Catalogo dell'applicazione.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsBlock;