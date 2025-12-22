/**
 * Nome File: CatalogManager.js
 * Percorso: opero-frontend/src/components/cms/CatalogManager.js
 * Data: 22/12/2025
 * Descrizione: Componente React per la gestione del catalogo prodotti
 * - Tab Prodotti: Lista prodotti con filtri e pagination
 * - Tab Selezioni: Gestione collezioni prodotti
 * - Tab Configurazione: Impostazioni listino (tipo, index, opzioni visualizzazione)
 * - Tab Immagini: Gestione immagini prodotti tramite archivio esistente
 */

import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import CatalogSelections from './CatalogSelections';
import {
    ShoppingBagIcon,
    Cog6ToothIcon,
    PhotoIcon,
    BookmarkIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    PencilIcon,
    EyeIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';

const CatalogManager = ({ dittaId }) => {
    // Stati Tabs
    const [activeTab, setActiveTab] = useState('products'); // products, selections, config, images

    // Stati Prodotti
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Filtri Prodotti
    const [filters, setFilters] = useState({
        categoria_id: '',
        search_term: '',
        prezzo_min: '',
        prezzo_max: '',
        page: 1,
        limit: 20,
        sort_by: 'descrizione',
        sort_order: 'ASC'
    });

    // Pagination metadata
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0
    });

    // Stati Configurazione
    const [config, setConfig] = useState({
        listino_tipo: 'pubblico',
        listino_index: 1,
        mostra_esauriti: true,
        mostra_ricerca: true,
        mostra_filtri: true
    });
    const [savingConfig, setSavingConfig] = useState(false);

    // Stati Immagini
    const [productImages, setProductImages] = useState([]);
    const [loadingImages, setLoadingImages] = useState(false);

    // Effetti
    useEffect(() => {
        if (dittaId) {
            loadConfig();
            loadCategories();
        }
    }, [dittaId]);

    useEffect(() => {
        if (activeTab === 'products' && dittaId) {
            loadProducts();
        }
    }, [activeTab, filters, dittaId]);

    useEffect(() => {
        if (activeTab === 'images' && selectedProduct) {
            loadProductImages();
        }
    }, [activeTab, selectedProduct]);

    // === CARICAMENTO DATI ===

    const loadProducts = async () => {
        setLoadingProducts(true);
        try {
            const params = {
                ...filters,
                listino_tipo: config.listino_tipo,
                listino_index: config.listino_index,
                mostra_esauriti: config.mostra_esauriti
            };

            const res = await api.get(`/admin/cms/${dittaId}/catalog/products`, { params });

            if (res.data.success) {
                setProducts(res.data.data);
                setPagination(res.data.meta);
            }
        } catch (error) {
            console.error('Errore caricamento prodotti:', error);
        } finally {
            setLoadingProducts(false);
        }
    };

    const loadCategories = async () => {
        try {
            const res = await api.get(`/admin/cms/${dittaId}/catalog/categories`);
            if (res.data.success) {
                // Appiattisci l'albero per il select
                const flattenCategories = (cats, level = 0) => {
                    let result = [];
                    cats.forEach(cat => {
                        result.push({
                            ...cat,
                            nome: '─'.repeat(level) + ' ' + cat.nome
                        });
                        if (cat.children && cat.children.length > 0) {
                            result = result.concat(flattenCategories(cat.children, level + 1));
                        }
                    });
                    return result;
                };
                setCategories(flattenCategories(res.data.data));
            }
        } catch (error) {
            console.error('Errore caricamento categorie:', error);
        }
    };

    const loadConfig = async () => {
        try {
            const res = await api.get(`/admin/cms/${dittaId}/catalog/config`);
            if (res.data.success) {
                const data = res.data.data;
                setConfig({
                    listino_tipo: data.catalog_listino_tipo || 'pubblico',
                    listino_index: data.catalog_listino_index || 1,
                    mostra_esauriti: data.catalog_mostra_esauriti !== undefined ? data.catalog_mostra_esauriti : true,
                    mostra_ricerca: data.catalog_mostra_ricerca !== undefined ? data.catalog_mostra_ricerca : true,
                    mostra_filtri: data.catalog_mostra_filtri !== undefined ? data.catalog_mostra_filtri : true
                });
            }
        } catch (error) {
            console.error('Errore caricamento configurazione:', error);
        }
    };

    const loadProductImages = async () => {
        if (!selectedProduct) return;

        setLoadingImages(true);
        try {
            const res = await api.get(`/admin/cms/${dittaId}/catalog/${selectedProduct.id}/images`);
            if (res.data.success) {
                setProductImages(res.data.data);
            }
        } catch (error) {
            console.error('Errore caricamento immagini:', error);
        } finally {
            setLoadingImages(false);
        }
    };

    // === GESTIONE CONFIGURAZIONE ===

    const saveConfig = async () => {
        setSavingConfig(true);
        try {
            await api.put(`/admin/cms/${dittaId}/catalog/config`, config);
            alert('Configurazione salvata con successo!');
            loadProducts(); // Ricarica prodotti con nuova config
        } catch (error) {
            console.error('Errore salvataggio configurazione:', error);
            alert('Errore nel salvataggio della configurazione');
        } finally {
            setSavingConfig(false);
        }
    };

    // === RENDER TABS ===

    return (
        <div className="space-y-6">
            {/* Header Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`py-4 px-6 border-b-2 font-medium text-sm flex items-center gap-2 transition ${
                                activeTab === 'products'
                                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <ShoppingBagIcon className="h-5 w-5" />
                            Prodotti
                            {pagination.total > 0 && (
                                <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                                    {pagination.total}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('selections')}
                            className={`py-4 px-6 border-b-2 font-medium text-sm flex items-center gap-2 transition ${
                                activeTab === 'selections'
                                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <BookmarkIcon className="h-5 w-5" />
                            Selezioni
                        </button>
                        <button
                            onClick={() => setActiveTab('config')}
                            className={`py-4 px-6 border-b-2 font-medium text-sm flex items-center gap-2 transition ${
                                activeTab === 'config'
                                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <Cog6ToothIcon className="h-5 w-5" />
                            Configurazione
                        </button>
                        <button
                            onClick={() => setActiveTab('images')}
                            className={`py-4 px-6 border-b-2 font-medium text-sm flex items-center gap-2 transition ${
                                activeTab === 'images'
                                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <PhotoIcon className="h-5 w-5" />
                            Immagini
                        </button>
                    </nav>
                </div>

                {/* Content Area */}
                <div className="p-6">
                    {/* TAB PRODOTTI */}
                    {activeTab === 'products' && (
                        <div className="space-y-6">
                            {/* Filtri */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <FunnelIcon className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-700">Filtri</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {/* Ricerca */}
                                    <div className="relative">
                                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Cerca prodotto..."
                                            value={filters.search_term}
                                            onChange={(e) => setFilters({ ...filters, search_term: e.target.value, page: 1 })}
                                            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    {/* Categoria */}
                                    <select
                                        value={filters.categoria_id}
                                        onChange={(e) => setFilters({ ...filters, categoria_id: e.target.value, page: 1 })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Tutte le categorie</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.nome}</option>
                                        ))}
                                    </select>

                                    {/* Prezzo Min */}
                                    <input
                                        type="number"
                                        placeholder="Prezzo min"
                                        value={filters.prezzo_min}
                                        onChange={(e) => setFilters({ ...filters, prezzo_min: e.target.value, page: 1 })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                    />

                                    {/* Prezzo Max */}
                                    <input
                                        type="number"
                                        placeholder="Prezzo max"
                                        value={filters.prezzo_max}
                                        onChange={(e) => setFilters({ ...filters, prezzo_max: e.target.value, page: 1 })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                {/* Reset Filtri */}
                                <div className="mt-3 flex justify-between items-center">
                                    <span className="text-xs text-gray-500">
                                        {pagination.total} prodotti trovati
                                    </span>
                                    <button
                                        onClick={() => setFilters({
                                            ...filters,
                                            categoria_id: '',
                                            search_term: '',
                                            prezzo_min: '',
                                            prezzo_max: '',
                                            page: 1
                                        })}
                                        className="text-sm text-blue-600 hover:text-blue-700"
                                    >
                                        Reset filtri
                                    </button>
                                </div>
                            </div>

                            {/* Lista Prodotti */}
                            {loadingProducts ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                    <p className="mt-2 text-sm text-gray-500">Caricamento prodotti...</p>
                                </div>
                            ) : products.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-lg">
                                    <ShoppingBagIcon className="h-12 w-12 text-gray-400 mx-auto" />
                                    <p className="mt-2 text-gray-500">Nessun prodotto trovato</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    <button
                                                        onClick={() => setFilters({
                                                            ...filters,
                                                            sort_by: 'codice',
                                                            sort_order: filters.sort_by === 'codice' && filters.sort_order === 'ASC' ? 'DESC' : 'ASC'
                                                        })}
                                                        className="hover:text-gray-700"
                                                    >
                                                        Codice
                                                    </button>
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    <button
                                                        onClick={() => setFilters({
                                                            ...filters,
                                                            sort_by: 'descrizione',
                                                            sort_order: filters.sort_by === 'descrizione' && filters.sort_order === 'ASC' ? 'DESC' : 'ASC'
                                                        })}
                                                        className="hover:text-gray-700"
                                                    >
                                                        Descrizione
                                                    </button>
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    <button
                                                        onClick={() => setFilters({
                                                            ...filters,
                                                            sort_by: 'prezzo',
                                                            sort_order: filters.sort_by === 'prezzo' && filters.sort_order === 'ASC' ? 'DESC' : 'ASC'
                                                        })}
                                                        className="hover:text-gray-700"
                                                    >
                                                        Prezzo
                                                    </button>
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giacenza</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stato</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {products.map(product => (
                                                <tr key={product.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm font-mono text-gray-900">{product.codice}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">{product.descrizione}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{product.categoria_nome || '-'}</td>
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                        € {product.prezzo?.toFixed(2) || '0.00'}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">{product.giacenza || 0}</td>
                                                    <td className="px-4 py-3">
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
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedProduct(product);
                                                                    setActiveTab('images');
                                                                }}
                                                                className="text-blue-600 hover:text-blue-700"
                                                                title="Gestisci immagini"
                                                            >
                                                                <PhotoIcon className="h-5 w-5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="flex justify-between items-center mt-4">
                                    <button
                                        onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                                        disabled={filters.page === 1}
                                        className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Precedente
                                    </button>
                                    <span className="text-sm text-gray-600">
                                        Pagina {filters.page} di {pagination.totalPages}
                                    </span>
                                    <button
                                        onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                                        disabled={filters.page === pagination.totalPages}
                                        className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Successiva
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB CONFIGURAZIONE */}
                    {activeTab === 'config' && (
                        <div className="space-y-6 max-w-2xl">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 className="text-sm font-medium text-blue-800 mb-2">Configurazione Listino</h3>
                                <p className="text-xs text-blue-600">
                                    Queste impostazioni determinano quali prezzi e quali prodotti vengono mostrati nel catalogo pubblico.
                                </p>
                            </div>

                            {/* Tipo Listino */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tipo Listino
                                </label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            checked={config.listino_tipo === 'pubblico'}
                                            onChange={() => setConfig({ ...config, listino_tipo: 'pubblico' })}
                                            className="text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm">Pubblico</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            checked={config.listino_tipo === 'cessione'}
                                            onChange={() => setConfig({ ...config, listino_tipo: 'cessione' })}
                                            className="text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm">Cessione</span>
                                    </label>
                                </div>
                            </div>

                            {/* Indice Listino */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Indice Listino (1-6)
                                </label>
                                <select
                                    value={config.listino_index}
                                    onChange={(e) => setConfig({ ...config, listino_index: parseInt(e.target.value) })}
                                    className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {[1, 2, 3, 4, 5, 6].map(i => (
                                        <option key={i} value={i}>Listino {i}</option>
                                    ))}
                                </select>
                                <p className="mt-1 text-xs text-gray-500">
                                    Seleziona quale delle 6 colonne prezzo utilizzare
                                </p>
                            </div>

                            {/* Opzioni Visualizzazione */}
                            <div className="space-y-3 border-t pt-4">
                                <h4 className="text-sm font-medium text-gray-700">Opzioni Visualizzazione</h4>

                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={config.mostra_esauriti}
                                        onChange={(e) => setConfig({ ...config, mostra_esauriti: e.target.checked })}
                                        className="text-blue-600 focus:ring-blue-500 rounded"
                                    />
                                    <span className="text-sm">Mostra prodotti esauriti</span>
                                </label>

                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={config.mostra_ricerca}
                                        onChange={(e) => setConfig({ ...config, mostra_ricerca: e.target.checked })}
                                        className="text-blue-600 focus:ring-blue-500 rounded"
                                    />
                                    <span className="text-sm">Mostra barra di ricerca</span>
                                </label>

                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={config.mostra_filtri}
                                        onChange={(e) => setConfig({ ...config, mostra_filtri: e.target.checked })}
                                        className="text-blue-600 focus:ring-blue-500 rounded"
                                    />
                                    <span className="text-sm">Mostra filtri categorie</span>
                                </label>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end pt-4 border-t">
                                <button
                                    onClick={saveConfig}
                                    disabled={savingConfig}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    {savingConfig ? 'Salvataggio...' : 'Salva Configurazione'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* TAB IMMAGINI */}
                    {activeTab === 'images' && (
                        <div className="space-y-6">
                            {!selectedProduct ? (
                                <div className="text-center py-12 bg-gray-50 rounded-lg">
                                    <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto" />
                                    <p className="mt-2 text-gray-500">Seleziona un prodotto dalla tab Prodotti per gestire le immagini</p>
                                    <button
                                        onClick={() => setActiveTab('products')}
                                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Vai a Prodotti
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Header Prodotto */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900">
                                                    {selectedProduct.codice} - {selectedProduct.descrizione}
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {selectedProduct.categoria_nome || 'Nessuna categoria'}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setSelectedProduct(null)}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                Cambia prodotto
                                            </button>
                                        </div>
                                    </div>

                                    {/* Immagini */}
                                    {loadingImages ? (
                                        <div className="text-center py-12">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                        </div>
                                    ) : productImages.length === 0 ? (
                                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                                            <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto" />
                                            <p className="mt-2 text-gray-500">Nessuna immagine trovata per questo prodotto</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Usa il modulo Archivio per caricare immagini collegate all'entità "ct_catalogo" e ID {selectedProduct.id}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                            {productImages.map(img => (
                                                <div key={img.id} className="relative group">
                                                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                                        <img
                                                            src={img.previewUrl}
                                                            alt={img.file_name_originale}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                        <a
                                                            href={img.previewUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 bg-white rounded-full text-blue-600 hover:bg-blue-50"
                                                        >
                                                            <EyeIcon className="h-5 w-5" />
                                                        </a>
                                                    </div>
                                                    <p className="mt-1 text-xs text-gray-500 truncate">{img.file_name_originale}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB SELEZIONI */}
                    {activeTab === 'selections' && (
                        <CatalogSelections dittaId={dittaId} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default CatalogManager;
