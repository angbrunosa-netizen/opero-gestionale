/**
 * Nome File: CatalogBlock.js
 * Percorso: opero-shop/components/blocks/CatalogBlock.js
 * Data: 22/12/2025
 * Descrizione: Blocco Next.js per visualizzazione catalogo prodotti pubblico
 * - Recupero dati da API backend
 * - Filtri categoria, ricerca, prezzo
 * - Paginazione lato server
 * - Grid responsive prodotti con immagini S3
 */

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';

export default function CatalogBlock({ config, siteSlug }) {
    // Stati
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 12,
        totalPages: 0
    });

    // Filtri
    const [filters, setFilters] = useState({
        categoria_id: '',
        search_term: '',
        prezzo_min: '',
        prezzo_max: '',
        page: 1,
        limit: 12,
        sort_by: 'descrizione',
        sort_order: 'ASC'
    });

    // Stati UI
    const [showFilters, setShowFilters] = useState(false);

    // Caricamento dati iniziale
    useEffect(() => {
        loadCategories();
        loadProducts();
    }, []);

    // Ricarica prodotti quando i filtri cambiano
    useEffect(() => {
        loadProducts();
    }, [filters]);

    // Carica categorie
    const loadCategories = async () => {
        try {
            const res = await fetch(`/api/public/shop/${siteSlug}/catalog/categories`);
            const data = await res.json();
            if (data.success) {
                setCategories(data.data);
            }
        } catch (error) {
            console.error('Errore caricamento categorie:', error);
        }
    };

    // Carica prodotti
    const loadProducts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(
                Object.entries(filters).filter(([_, v]) => v !== '' && v !== null)
            ).toString();

            const res = await fetch(`/api/public/shop/${siteSlug}/catalog?${params}`);
            const data = await res.json();

            if (data.success) {
                setProducts(data.data);
                setPagination(data.meta);
            }
        } catch (error) {
            console.error('Errore caricamento prodotti:', error);
        } finally {
            setLoading(false);
        }
    };

    // Reset filtri
    const resetFilters = () => {
        setFilters({
            ...filters,
            categoria_id: '',
            search_term: '',
            prezzo_min: '',
            prezzo_max: '',
            page: 1
        });
    };

    // Gestione cambio pagina
    const changePage = (newPage) => {
        setFilters({ ...filters, page: newPage });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Render categorie ricorsive
    const renderCategories = (cats, level = 0) => {
        return cats.map(cat => (
            <div key={cat.id}>
                <button
                    onClick={() => setFilters({ ...filters, categoria_id: cat.id, page: 1 })}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition ${
                        filters.categoria_id === cat.id
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-gray-100'
                    }`}
                    style={{ paddingLeft: `${level * 16 + 12}px` }}
                >
                    {cat.nome}
                </button>
                {cat.children && cat.children.length > 0 && renderCategories(cat.children, level + 1)}
            </div>
        ));
    };

    return (
        <div
            className="py-12 min-h-screen"
            style={{ backgroundColor: 'var(--block-background-color)' }}
        >
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-2">{config?.titolo || "Catalogo Prodotti"}</h2>
                    {config?.descrizione && (
                        <p className="text-gray-600">{config.descrizione}</p>
                    )}
                </div>

                {/* Barra Ricerca e Filtri Mobile */}
                <div className="mb-6 space-y-4">
                    {/* Ricerca */}
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cerca prodotti per nome, codice..."
                            value={filters.search_term}
                            onChange={(e) => setFilters({ ...filters, search_term: e.target.value, page: 1 })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Toggle Filtri Mobile */}
                    <div className="flex gap-3 md:hidden">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            <FunnelIcon className="h-5 w-5" />
                            {showFilters ? 'Nascondi Filtri' : 'Mostra Filtri'}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Filtri (Desktop) */}
                    <aside className="hidden md:block w-64 flex-shrink-0">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-900">Filtri</h3>
                                {(filters.categoria_id || filters.prezzo_min || filters.prezzo_max) && (
                                    <button
                                        onClick={resetFilters}
                                        className="text-sm text-blue-600 hover:text-blue-700"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>

                            {/* Categorie */}
                            {categories.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Categorie</h4>
                                    <div className="space-y-1 max-h-96 overflow-y-auto">
                                        <button
                                            onClick={() => setFilters({ ...filters, categoria_id: '', page: 1 })}
                                            className={`w-full text-left px-3 py-2 text-sm rounded-md transition ${
                                                !filters.categoria_id
                                                    ? 'bg-blue-600 text-white'
                                                    : 'hover:bg-gray-100'
                                            }`}
                                        >
                                            Tutte le categorie
                                        </button>
                                        {renderCategories(categories)}
                                    </div>
                                </div>
                            )}

                            {/* Filtro Prezzo */}
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Prezzo (€)</h4>
                                <div className="space-y-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={filters.prezzo_min}
                                        onChange={(e) => setFilters({ ...filters, prezzo_min: e.target.value, page: 1 })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={filters.prezzo_max}
                                        onChange={(e) => setFilters({ ...filters, prezzo_max: e.target.value, page: 1 })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Filtri Mobile Panel */}
                    {showFilters && (
                        <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
                            <div className="absolute right-0 top-0 h-full w-80 bg-white p-4 overflow-y-auto">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-gray-900">Filtri</h3>
                                    <button
                                        onClick={() => setShowFilters(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {categories.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Categorie</h4>
                                        <div className="space-y-1 max-h-96 overflow-y-auto">
                                            <button
                                                onClick={() => {
                                                    setFilters({ ...filters, categoria_id: '', page: 1 });
                                                    setShowFilters(false);
                                                }}
                                                className={`w-full text-left px-3 py-2 text-sm rounded-md transition ${
                                                    !filters.categoria_id
                                                        ? 'bg-blue-600 text-white'
                                                        : 'hover:bg-gray-100'
                                                }`}
                                            >
                                                Tutte le categorie
                                            </button>
                                            {renderCategories(categories)}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Prezzo (€)</h4>
                                    <div className="space-y-2">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={filters.prezzo_min}
                                            onChange={(e) => setFilters({ ...filters, prezzo_min: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={filters.prezzo_max}
                                            onChange={(e) => setFilters({ ...filters, prezzo_max: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Grid Prodotti */}
                    <div className="flex-1">
                        {/* Info risultati */}
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                {pagination.total} prodotti trovati
                                {filters.categoria_id && ` • Categoria filtrata`}
                            </p>
                            {/* Sort */}
                            <select
                                value={`${filters.sort_by}-${filters.sort_order}`}
                                onChange={(e) => {
                                    const [sort_by, sort_order] = e.target.value.split('-');
                                    setFilters({ ...filters, sort_by, sort_order });
                                }}
                                className="text-sm border border-gray-300 rounded-md px-3 py-1"
                            >
                                <option value="descrizione-ASC">Nome A-Z</option>
                                <option value="descrizione-DESC">Nome Z-A</option>
                                <option value="prezzo-ASC">Prezzo crescente</option>
                                <option value="prezzo-DESC">Prezzo decrescente</option>
                            </select>
                        </div>

                        {/* Loading */}
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="mt-4 text-gray-500">Caricamento prodotti...</p>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-lg">
                                <div className="text-gray-400 text-6xl mb-4">📦</div>
                                <p className="text-gray-600">Nessun prodotto trovato</p>
                                {(filters.categoria_id || filters.search_term || filters.prezzo_min || filters.prezzo_max) && (
                                    <button
                                        onClick={resetFilters}
                                        className="mt-4 text-blue-600 hover:text-blue-700"
                                    >
                                        Resetta i filtri
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {products.map(product => (
                                        <div
                                            key={product.id}
                                            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition group"
                                        >
                                            {/* Immagine */}
                                            <div className="relative aspect-square bg-gray-100">
                                                {product.immagini && product.immagini.length > 0 ? (
                                                    <Image
                                                        src={product.immagini[0].previewUrl}
                                                        alt={product.descrizione}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                )}

                                                {/* Badge disponibilità */}
                                                <div className="absolute top-2 right-2">
                                                    {product.disponibile ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                                            <CheckCircleIcon className="h-3 w-3" />
                                                            Disponibile
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                                            <XCircleIcon className="h-3 w-3" />
                                                            Esaurito
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div className="p-4">
                                                <p className="text-xs text-gray-500 font-mono mb-1">{product.codice}</p>
                                                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                                                    {product.descrizione}
                                                </h3>
                                                {product.categoria_nome && (
                                                    <p className="text-xs text-gray-500 mb-2">{product.categoria_nome}</p>
                                                )}

                                                {/* Prezzo e Giacenza */}
                                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                                    <div>
                                                        <p className="text-lg font-bold text-blue-600">
                                                            € {product.prezzo?.toFixed(2) || '0.00'}
                                                        </p>
                                                        {product.giacenza !== null && (
                                                            <p className="text-xs text-gray-500">
                                                                {product.giacenza} pezzi
                                                            </p>
                                                        )}
                                                    </div>
                                                    <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition">
                                                        Dettagli
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {pagination.totalPages > 1 && (
                                    <div className="mt-8 flex justify-center items-center gap-2">
                                        <button
                                            onClick={() => changePage(filters.page - 1)}
                                            disabled={filters.page === 1}
                                            className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeftIcon className="h-5 w-5" />
                                        </button>

                                        <div className="flex gap-1">
                                            {[...Array(pagination.totalPages)].map((_, i) => {
                                                const pageNum = i + 1;
                                                // Show first, last, current and adjacent pages
                                                if (
                                                    pageNum === 1 ||
                                                    pageNum === pagination.totalPages ||
                                                    (pageNum >= filters.page - 1 && pageNum <= filters.page + 1)
                                                ) {
                                                    return (
                                                        <button
                                                            key={pageNum}
                                                            onClick={() => changePage(pageNum)}
                                                            className={`w-10 h-10 rounded-md font-medium text-sm ${
                                                                filters.page === pageNum
                                                                    ? 'bg-blue-600 text-white'
                                                                    : 'border border-gray-300 hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    );
                                                } else if (
                                                    pageNum === filters.page - 2 ||
                                                    pageNum === filters.page + 2
                                                ) {
                                                    return (
                                                        <span key={pageNum} className="w-10 flex items-center justify-center text-gray-400">
                                                            ...
                                                        </span>
                                                    );
                                                }
                                                return null;
                                            })}
                                        </div>

                                        <button
                                            onClick={() => changePage(filters.page + 1)}
                                            disabled={filters.page === pagination.totalPages}
                                            className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronRightIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
