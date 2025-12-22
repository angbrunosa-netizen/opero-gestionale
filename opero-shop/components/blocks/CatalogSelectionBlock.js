/**
 * Nome File: CatalogSelectionBlock.js
 * Percorso: opero-frontend/src/components/blocks/CatalogSelectionBlock.js
 * Data: 22/12/2025
 * Descrizione: Blocco per visualizzare selezioni prodotti con ricerca integrata
 * - Ricerca prodotti integrata (codice, descrizione, EAN)
 * - Layout personalizzabile (grid, list, carousel)
 * - Effetti hover, transizioni, animazioni
 * - Filtri per categoria
 * - Ordinamento prodotti
 * - Prezzi scontati con indicazione originale
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    ChevronDownIcon,
    TagIcon,
    CheckCircleIcon,
    XCircleIcon,
    SparklesIcon,
    ShoppingCartIcon
} from '@heroicons/react/24/outline';

const CatalogSelectionBlock = ({
    config,
    dittaId,
    siteUrl,
    isPreview = false
}) => {
    // Stati
    const [selezione, setSelezione] = useState(null);
    const [prodotti, setProdotti] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoriaFiltro, setCategoriaFiltro] = useState('');
    const [ordinamento, setOrdinamento] = useState('nome'); // nome, prezzo, giacenza
    const [showFilters, setShowFilters] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [hoveredProduct, setHoveredProduct] = useState(null);

    // Configurazione blocco
    const blockConfig = config || {};
    const {
        selezione_id,
        layout = 'grid',
        prodotti_per_riga = 4,
        mostra_prezzo = true,
        mostra_giacenza = true,
        mostra_descrizione = true,
        mostra_ricerca = true,
        mostra_filtri = true,
        mostra_ordinamento = true,
        // Stili
        colore_sfondo = '#ffffff',
        colore_testo = '#1f2937',
        colore_accento = '#3b82f6',
        raggio_bordo = 8,
        ombra = true,
        // Animazioni
        effetto_hover = 'scale', // scale, shadow, lift, glow, none
        animazione_caricamento = 'fade', // fade, slide, stagger, none
        durata_transizione = 300,
        // Badges
        badge_sconto = true,
        badge_nuovo = false,
        badge_esaurito = true,
        // Card
        card_padding = 16,
        card_aspect_ratio = 'square', // square, portrait, landscape
    } = blockConfig;

    // Carica selezione e prodotti
    useEffect(() => {
        if (selezione_id) {
            loadSelezione();
        }
    }, [selezione_id]);

    const loadSelezione = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/public/catalog/selezioni/${selezione_id}`);

            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setSelezione(data.data.selezione);
                    setProdotti(data.data.articoli || []);
                }
            } else {
                console.error('Errore caricamento selezione:', res.statusText);
            }
        } catch (error) {
            console.error('Errore caricamento selezione:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filtra prodotti
    const prodottiFiltrati = prodotti.filter(prodotto => {
        // Filtro ricerca
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            const matchCodice = prodotto.codice?.toLowerCase().includes(search);
            const matchDescrizione = prodotto.descrizione?.toLowerCase().includes(search);
            const matchEan = prodotto.ean?.some(e => e.toLowerCase().includes(search));
            if (!matchCodice && !matchDescrizione && !matchEan) return false;
        }

        // Filtro categoria
        if (categoriaFiltro && prodotto.id_categoria !== parseInt(categoriaFiltro)) {
            return false;
        }

        return true;
    });

    // Ordina prodotti
    const prodottiOrdinati = [...prodottiFiltrati].sort((a, b) => {
        switch (ordinamento) {
            case 'prezzo':
                return a.prezzo - b.prezzo;
            case 'prezzo_desc':
                return b.prezzo - a.prezzo;
            case 'giacenza':
                return b.giacenza - a.giacenza;
            case 'nome':
            default:
                return a.descrizione?.localeCompare(b.descrizione);
        }
    });

    // Categorie uniche
    const categorie = [...new Set(prodotti.map(p => p.id_categoria).filter(Boolean))];

    // Stili dinamici
    const getCardStyle = (productId) => {
        const baseStyle = {
            backgroundColor: blockConfig.colore_sfondo_card || '#ffffff',
            borderRadius: `${raggio_bordo}px`,
            padding: `${card_padding}px`,
            transition: `all ${durata_transizione}ms ease-in-out`,
            boxShadow: ombra ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
        };

        // Effetto hover
        if (hoveredProduct === productId) {
            switch (effetto_hover) {
                case 'scale':
                    baseStyle.transform = 'scale(1.05)';
                    baseStyle.zIndex = 10;
                    break;
                case 'shadow':
                    baseStyle.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)';
                    break;
                case 'lift':
                    baseStyle.transform = 'translateY(-8px)';
                    baseStyle.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.1)';
                    break;
                case 'glow':
                    baseStyle.boxShadow = `0 0 20px ${colore_accento}40`;
                    break;
                default:
                    break;
            }
        }

        return baseStyle;
    };

    const getImageStyle = () => {
        const ratios = {
            square: '100%',
            portrait: '125%',
            landscape: '75%'
        };
        return { aspectRatio: ratios[card_aspect_ratio] || '100%' };
    };

    if (loading) {
        return (
            <div
                className="p-8 text-center"
                style={{ backgroundColor: colore_sfondo, color: colore_testo }}
            >
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: colore_accento }}></div>
                <p className="mt-4">Caricamento prodotti...</p>
            </div>
        );
    }

    if (!selezione || prodotti.length === 0) {
        return (
            <div
                className="p-8 text-center"
                style={{ backgroundColor: colore_sfondo, color: colore_testo }}
            >
                <SparklesIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nessun prodotto disponibile in questa selezione</p>
            </div>
        );
    }

    return (
        <div
            className="catalog-selection-block"
            style={{
                backgroundColor: colore_sfondo,
                color: colore_testo,
                padding: '20px'
            }}
        >
            {/* Header Selezione */}
            {blockConfig.mostra_titolo !== false && (
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2" style={{ color: colore_testo }}>
                        {selezione.nome}
                    </h2>
                    {selezione.descrizione && (
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            {selezione.descrizione}
                        </p>
                    )}
                    {selezione.sconto_applicato > 0 && (
                        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: `${colore_accento}20`, color: colore_accento }}>
                            <TagIcon className="h-5 w-5" />
                            <span className="font-semibold">Sconto {selezione.sconto_applicato}% applicato</span>
                        </div>
                    )}
                </div>
            )}

            {/* Barra Ricerca */}
            {mostra_ricerca && (
                <div className="max-w-2xl mx-auto mb-6">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cerca prodotti per codice, descrizione, EAN..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2"
                            style={{
                                borderColor: `${colore_accento}40`,
                                '--tw-ring-color': colore_accento
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Filtri e Ordinamento */}
            {(mostra_filtri || mostra_ordinamento) && (
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b">
                    <div className="flex items-center gap-3">
                        {mostra_filtri && categorie.length > 1 && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
                                    style={{ borderColor: `${colore_accento}40` }}
                                >
                                    <FunnelIcon className="h-4 w-4" />
                                    <span>Filtri</span>
                                    <ChevronDownIcon className={`h-4 w-4 transition ${showFilters ? 'rotate-180' : ''}`} />
                                </button>

                                {showFilters && (
                                    <div className="absolute top-full left-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10 p-2">
                                        <button
                                            onClick={() => setCategoriaFiltro('')}
                                            className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 ${!categoriaFiltro ? 'bg-gray-100 font-semibold' : ''}`}
                                        >
                                            Tutte le categorie
                                        </button>
                                        {categorie.map(catId => {
                                            const cat = categorie.find(c => c.id === catId);
                                            return (
                                                <button
                                                    key={catId}
                                                    onClick={() => setCategoriaFiltro(catId)}
                                                    className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 ${categoriaFiltro === catId ? 'bg-gray-100 font-semibold' : ''}`}
                                                >
                                                    {cat?.nome_categoria || `Categoria ${catId}`}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {categoriaFiltro && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm" style={{ backgroundColor: `${colore_accento}20`, color: colore_accento }}>
                                Filtri attivi
                                <button onClick={() => setCategoriaFiltro('')} className="hover:opacity-70">×</button>
                            </span>
                        )}
                    </div>

                    {mostra_ordinamento && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Ordina per:</span>
                            <select
                                value={ordinamento}
                                onChange={(e) => setOrdinamento(e.target.value)}
                                className="px-3 py-2 border rounded-lg text-sm"
                                style={{ borderColor: `${colore_accento}40` }}
                            >
                                <option value="nome">Nome A-Z</option>
                                <option value="prezzo">Prezzo crescente</option>
                                <option value="prezzo_desc">Prezzo decrescente</option>
                                <option value="giacenza">Disponibilità</option>
                            </select>
                        </div>
                    )}
                </div>
            )}

            {/* Conteggio risultati */}
            <p className="text-sm text-gray-600 mb-4">
                {prodottiOrdinati.length} prodotti trovati
                {searchTerm && ` per "${searchTerm}"`}
            </p>

            {/* Griglia Prodotti */}
            <div
                className={`grid gap-6 ${
                    layout === 'grid'
                        ? `grid-cols-1 sm:grid-cols-2 lg:grid-cols-${prodotti_per_riga}`
                        : 'grid-cols-1'
                }`}
            >
                {prodottiOrdinati.map((prodotto, index) => (
                    <div
                        key={prodotto.id}
                        className="product-card cursor-pointer"
                        style={getCardStyle(prodotto.id)}
                        onMouseEnter={() => setHoveredProduct(prodotto.id)}
                        onMouseLeave={() => setHoveredProduct(null)}
                        onClick={() => setSelectedProduct(prodotto)}
                    >
                        {/* Immagine */}
                        <div className="relative mb-4 rounded-lg overflow-hidden bg-gray-100" style={getImageStyle()}>
                            {prodotto.immagini && prodotto.immagini.length > 0 ? (
                                <img
                                    src={prodotto.immagini[0].previewUrl}
                                    alt={prodotto.descrizione}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <SparklesIcon className="h-12 w-12 text-gray-300" />
                                </div>
                            )}

                            {/* Badges */}
                            <div className="absolute top-2 left-2 flex flex-col gap-1">
                                {prodotto.prezzo_originale && badge_sconto && (
                                    <span className="px-2 py-1 rounded-full text-xs font-bold text-white bg-red-500">
                                        -{Math.round((1 - prodotto.prezzo / prodotto.prezzo_originale) * 100)}%
                                    </span>
                                )}
                                {!prodotto.disponibile && badge_esaurito && (
                                    <span className="px-2 py-1 rounded-full text-xs font-bold text-white bg-gray-800">
                                        Esaurito
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Info Prodotto */}
                        <div>
                            {mostra_descrizione && (
                                <h3 className="font-semibold mb-1" style={{ color: colore_testo }}>
                                    {prodotto.descrizione}
                                </h3>
                            )}
                            <p className="text-sm text-gray-500 mb-2">{prodotto.codice}</p>

                            {/* Prezzo */}
                            {mostra_prezzo && (
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-2xl font-bold" style={{ color: colore_accento }}>
                                        € {prodotto.prezzo?.toFixed(2)}
                                    </span>
                                    {prodotto.prezzo_originale && (
                                        <span className="text-sm text-gray-400 line-through">
                                            € {prodotto.prezzo_originale?.toFixed(2)}
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Giacenza */}
                            {mostra_giacenza && (
                                <div className="flex items-center gap-1 text-sm">
                                    {prodotto.disponibile ? (
                                        <>
                                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                            <span className="text-green-600">
                                                {prodotto.giacenza > 5 ? 'Disponibile' : `Solo ${prodotto.giacenza} rimasti`}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <XCircleIcon className="h-4 w-4 text-red-500" />
                                            <span className="text-red-600">Non disponibile</span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Nessun risultato */}
            {prodottiOrdinati.length === 0 && (
                <div className="text-center py-12">
                    <MagnifyingGlassIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">Nessun prodotto trovato con i filtri selezionati</p>
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setCategoriaFiltro('');
                        }}
                        className="mt-4 px-6 py-2 rounded-lg text-white"
                        style={{ backgroundColor: colore_accento }}
                    >
                        Resetta filtri
                    </button>
                </div>
            )}

            {/* Modal Dettaglio Prodotto */}
            {selectedProduct && (
                <div
                    className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedProduct(null)}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold">{selectedProduct.descrizione}</h3>
                                <button
                                    onClick={() => setSelectedProduct(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Immagine */}
                                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                    {selectedProduct.immagini && selectedProduct.immagini.length > 0 ? (
                                        <img
                                            src={selectedProduct.immagini[0].previewUrl}
                                            alt={selectedProduct.descrizione}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <SparklesIcon className="h-16 w-16 text-gray-300" />
                                        </div>
                                    )}
                                </div>

                                {/* Dettagli */}
                                <div>
                                    <p className="text-sm text-gray-500 mb-2">{selectedProduct.codice}</p>

                                    {selectedProduct.categoria_nome && (
                                        <p className="text-sm mb-4">
                                            <span className="font-semibold">Categoria:</span> {selectedProduct.categoria_nome}
                                        </p>
                                    )}

                                    {/* Prezzo */}
                                    <div className="mb-4">
                                        {selectedProduct.prezzo_originale && (
                                            <span className="text-sm text-gray-400 line-through mr-2">
                                                € {selectedProduct.prezzo_originale.toFixed(2)}
                                            </span>
                                        )}
                                        <span className="text-3xl font-bold" style={{ color: colore_accento }}>
                                            € {selectedProduct.prezzo.toFixed(2)}
                                        </span>
                                    </div>

                                    {/* Giacenza */}
                                    <div className="mb-6">
                                        {selectedProduct.disponibile ? (
                                            <div className="flex items-center gap-2 text-green-600">
                                                <CheckCircleIcon className="h-5 w-5" />
                                                <span>
                                                    {selectedProduct.giacenza > 10
                                                        ? 'Disponibile'
                                                        : `Solo ${selectedProduct.giacenza} pezzi disponibili`}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-red-600">
                                                <XCircleIcon className="h-5 w-5" />
                                                <span>Non disponibile</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Azioni */}
                                    <button
                                        className="w-full py-3 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{ backgroundColor: colore_accento }}
                                        disabled={!selectedProduct.disponibile}
                                    >
                                        <ShoppingCartIcon className="h-5 w-5" />
                                        Aggiungi al carrello
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CatalogSelectionBlock;
