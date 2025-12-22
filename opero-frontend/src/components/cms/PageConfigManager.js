/**
 * Nome File: PageConfigManager.js
 * Posizione: src/components/cms/PageConfigManager.js
 * Data: 21/12/2025
 * Descrizione: Gestione avanzata configurazione pagine con SEO, visibilità e menu multilivello
 */
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
    PencilIcon, TrashIcon, PlusIcon, EyeIcon, EyeSlashIcon,
    ArrowsUpDownIcon, LinkIcon, CalendarIcon, LockClosedIcon,
    DocumentTextIcon, GlobeAltIcon, PhotoIcon, Cog6ToothIcon,
    ChevronUpIcon, ChevronDownIcon, ChevronRightIcon
} from '@heroicons/react/24/outline';

// Sotto-componente per la configurazione SEO
const SEOConfigPanel = ({ pageData, onChange }) => {
    return (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <GlobeAltIcon className="h-5 w-5 text-blue-600" />
                Configurazione SEO
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Titolo SEO (Meta Title)
                    </label>
                    <input
                        type="text"
                        value={pageData.titolo_seo || ''}
                        onChange={(e) => onChange('titolo_seo', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="Titolo visualizzato nei motori di ricerca"
                        maxLength={60}
                    />
                    <p className="text-xs text-gray-500 mt-1">{(pageData.titolo_seo || '').length}/60 caratteri</p>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descrizione SEO (Meta Description)
                    </label>
                    <textarea
                        value={pageData.descrizione_seo || ''}
                        onChange={(e) => onChange('descrizione_seo', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        rows={3}
                        placeholder="Descrizione visualizzata nei motori di ricerca"
                        maxLength={160}
                    />
                    <p className="text-xs text-gray-500 mt-1">{(pageData.descrizione_seo || '').length}/160 caratteri</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Keywords (separate da virgola)
                    </label>
                    <input
                        type="text"
                        value={pageData.keywords_seo || ''}
                        onChange={(e) => onChange('keywords_seo', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="parola1, parola2, parola3"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        URL Canonical
                    </label>
                    <input
                        type="url"
                        value={pageData.canonical_url || ''}
                        onChange={(e) => onChange('canonical_url', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="https://example.com/pagina"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Immagine Social (Open Graph)
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="url"
                            value={pageData.immagine_social || ''}
                            onChange={(e) => onChange('immagine_social', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                            placeholder="URL immagine per condivisione social"
                        />
                        {pageData.immagine_social && (
                            <img
                                src={pageData.immagine_social}
                                alt="Anteprima social"
                                className="h-10 w-10 object-cover rounded"
                            />
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Robots Index</label>
                        <select
                            value={pageData.robots_index || 'index'}
                            onChange={(e) => onChange('robots_index', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                            <option value="index">Index (consigliato)</option>
                            <option value="noindex">No Index</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Robots Follow</label>
                        <select
                            value={pageData.robots_follow || 'follow'}
                            onChange={(e) => onChange('robots_follow', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                            <option value="follow">Follow (consigliato)</option>
                            <option value="nofollow">No Follow</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sotto-componente per la configurazione menu
const MenuConfigPanel = ({ pageData, pages, onChange }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const parentPages = pages.filter(p => p.id !== pageData.id && p.livello_menu < 3);

    return (
        <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <ArrowsUpDownIcon className="h-5 w-5 text-blue-600" />
                    Configurazione Menu
                </h4>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-1 text-gray-500 hover:text-gray-700"
                >
                    {isExpanded ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
                </button>
            </div>

            {isExpanded && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={pageData.mostra_menu !== false}
                            onChange={(e) => onChange('mostra_menu', e.target.checked)}
                            className="rounded text-blue-600"
                        />
                        <label className="text-sm font-medium text-gray-700">
                            Mostra nel menu di navigazione
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Posizione nel menu
                        </label>
                        <input
                            type="number"
                            value={pageData.ordine_menu || 0}
                            onChange={(e) => onChange('ordine_menu', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            min="0"
                            placeholder="0 per primo"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pagina parent (sottolivello)
                        </label>
                        <select
                            value={pageData.id_page_parent || ''}
                            onChange={(e) => onChange('id_page_parent', e.target.value ? parseInt(e.target.value) : null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                            <option value="">Livello principale</option>
                            {parentPages.map(parent => (
                                <option key={parent.id} value={parent.id}>
                                    {'  '.repeat(parent.livello_menu || 1)}{parent.titolo_seo}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Icona menu (FontAwesome)
                        </label>
                        <input
                            type="text"
                            value={pageData.icona_menu || ''}
                            onChange={(e) => onChange('icona_menu', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            placeholder="fas fa-home"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Link esterno (opzionale)
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="url"
                                value={pageData.link_esterno || ''}
                                onChange={(e) => onChange('link_esterno', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                                placeholder="https://example.com"
                            />
                            <select
                                value={pageData.target_link || '_self'}
                                onChange={(e) => onChange('target_link', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                            >
                                <option value="_self">Stessa finestra</option>
                                <option value="_blank">Nuova finestra</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Componente principale
const PageConfigManager = ({ dittaId, onClose }) => {
    const { hasPermission } = useAuth();
    const [pages, setPages] = useState([]);
    const [selectedPage, setSelectedPage] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('list');
    const [draggedPage, setDraggedPage] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadPages();
    }, [dittaId]);

    const loadPages = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/cms/${dittaId}/pages-advanced`);
            setPages(response.data || []);
        } catch (error) {
            console.error('Errore caricamento pagine:', error);
        } finally {
            setLoading(false);
        }
    };

    const savePage = async (pageData) => {
        try {
            setLoading(true);
            const url = pageData.id
                ? `/admin/cms/pages/${pageData.id}/advanced`
                : `/admin/cms/${dittaId}/pages/advanced`;

            const method = pageData.id ? 'put' : 'post';
            await api[method](url, pageData);

            await loadPages();
            setIsEditing(false);
            setSelectedPage(null);
        } catch (error) {
            alert('Errore: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const deletePage = async (pageId) => {
        if (!window.confirm('Sei sicuro di voler eliminare questa pagina?')) return;

        try {
            await api.delete(`/admin/cms/pages/${pageId}`);
            await loadPages();
        } catch (error) {
            alert('Errore: ' + (error.response?.data?.message || error.message));
        }
    };

    const togglePageVisibility = async (page) => {
        try {
            await api.patch(`/admin/cms/pages/${page.id}`, {
                pubblicata: !page.pubblicata
            });
            await loadPages();
        } catch (error) {
            alert('Errore: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDragStart = (page) => {
        setDraggedPage(page);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = async (targetPage) => {
        console.log('🔄 handleDrop called', {
            draggedPage,
            targetPage,
            draggedPageId: draggedPage?.id,
            targetPageId: targetPage?.id
        });

        if (!draggedPage || draggedPage.id === targetPage.id) {
            console.log('❌ Drag drop cancelled: same page or no dragged page');
            return;
        }

        try {
            // Calcola il nuovo ordine delle pagine
            const currentPageOrder = [...pages];
            const draggedIndex = currentPageOrder.findIndex(p => p.id === draggedPage.id);
            const targetIndex = currentPageOrder.findIndex(p => p.id === targetPage.id);

            console.log('📍 Current order indices:', { draggedIndex, targetIndex });
            console.log('📋 Current order:', currentPageOrder.map(p => ({ id: p.id, slug: p.slug, ordine_menu: p.ordine_menu })));

            // Rimuovi la pagina trascinata dalla sua posizione attuale
            const [draggedItem] = currentPageOrder.splice(draggedIndex, 1);

            // Inseriscila nella nuova posizione
            currentPageOrder.splice(targetIndex, 0, draggedItem);

            // Aggiorna gli ordini in base alla nuova posizione
            const updatedPageIds = currentPageOrder.map((page, index) => {
                const updatedPage = { ...page, ordine_menu: index + 1 };
                console.log(`📝 Page ${page.slug} -> ordine_menu: ${index + 1}`);
                return updatedPage.id;
            });

            console.log('🚀 Sending reorder request with IDs:', updatedPageIds);

            // Invia tutti gli ID nel nuovo ordine al backend
            const response = await api.post(`/admin/cms/pages/reorder`, {
                pageIds: updatedPageIds
            });

            console.log('✅ Reorder response:', response.data);

            console.log('🔄 Reloading pages...');
            await loadPages();
            console.log('✅ Pages reloaded');
        } catch (error) {
            console.error('❌ Reorder error:', error);
            alert('Errore riordinamento: ' + (error.response?.data?.message || error.message));
        }

        setDraggedPage(null);
    };

    const filteredPages = pages.filter(page =>
        page.titolo_seo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.slug?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getPageStatus = (page) => {
        if (!page.pubblicata) return { color: 'gray', text: 'Bozza' };
        if (page.data_pubblicazione && new Date(page.data_pubblicazione) > new Date()) {
            return { color: 'yellow', text: 'Programmata' };
        }
        if (page.data_scadenza && new Date(page.data_scadenza) < new Date()) {
            return { color: 'red', text: 'Scaduta' };
        }
        if (page.password_protetta) return { color: 'orange', text: 'Protetta' };
        return { color: 'green', text: 'Pubblicata' };
    };

    if (isEditing && selectedPage) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
                    <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                        <h2 className="text-xl font-bold">
                            {selectedPage.id ? 'Modifica Pagina' : 'Nuova Pagina'}
                        </h2>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Informazioni base */}
                        <div className="space-y-4 p-4 bg-white rounded-lg border">
                            <h4 className="text-lg font-semibold text-gray-900">Informazioni Base</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Titolo Pagina (H1)
                                    </label>
                                    <input
                                        type="text"
                                        value={selectedPage.titolo_pagina || ''}
                                        onChange={(e) => setSelectedPage(prev => ({
                                            ...prev,
                                            titolo_pagina: e.target.value
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        placeholder="Titolo principale della pagina"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Slug (URL)
                                    </label>
                                    <input
                                        type="text"
                                        value={selectedPage.slug || ''}
                                        onChange={(e) => setSelectedPage(prev => ({
                                            ...prev,
                                            slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        placeholder="url-della-pagina"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SEO Configuration */}
                        <SEOConfigPanel
                            pageData={selectedPage}
                            onChange={(field, value) => setSelectedPage(prev => ({
                                ...prev,
                                [field]: value
                            }))}
                        />

                        {/* Menu Configuration */}
                        <MenuConfigPanel
                            pageData={selectedPage}
                            pages={pages}
                            onChange={(field, value) => setSelectedPage(prev => ({
                                ...prev,
                                [field]: value
                            }))}
                        />

                        {/* Publishing Options */}
                        <div className="space-y-4 p-4 bg-green-50 rounded-lg">
                            <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <CalendarIcon className="h-5 w-5 text-green-600" />
                                Opzioni Pubblicazione
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedPage.pubblicata || false}
                                        onChange={(e) => setSelectedPage(prev => ({
                                            ...prev,
                                            pubblicata: e.target.checked
                                        }))}
                                        className="rounded text-green-600"
                                    />
                                    <label className="text-sm font-medium text-gray-700">
                                        Pubblica immediatamente
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Password protezione
                                    </label>
                                    <input
                                        type="password"
                                        value={selectedPage.password_protetta || ''}
                                        onChange={(e) => setSelectedPage(prev => ({
                                            ...prev,
                                            password_protetta: e.target.value || null
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        placeholder="Lascia vuoto per nessuna protezione"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Data pubblicazione
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={selectedPage.data_pubblicazione ?
                                            new Date(selectedPage.data_pubblicazione).toISOString().slice(0, 16) :
                                            ''}
                                        onChange={(e) => setSelectedPage(prev => ({
                                            ...prev,
                                            data_pubblicazione: e.target.value || null
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Data scadenza
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={selectedPage.data_scadenza ?
                                            new Date(selectedPage.data_scadenza).toISOString().slice(0, 16) :
                                            ''}
                                        onChange={(e) => setSelectedPage(prev => ({
                                            ...prev,
                                            data_scadenza: e.target.value || null
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex justify-end gap-4">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                            disabled={loading}
                        >
                            Annulla
                        </button>
                        <button
                            onClick={() => savePage(selectedPage)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Salvaggio...' : 'Salva'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
                <div className="px-6 py-4 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Gestione Pagine Avanzata</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        ✕
                    </button>
                </div>

                <div className="flex-1 overflow-auto">
                    {/* Tabs */}
                    <div className="border-b px-6">
                        <nav className="flex space-x-8">
                            <button
                                onClick={() => setActiveTab('list')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'list'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Elenco Pagine
                            </button>
                            {hasPermission('CT_PAGES_MANAGE') && (
                                <button
                                    onClick={() => {
                                        setSelectedPage({
                                            pubblicata: false,
                                            mostra_menu: true,
                                            ordine_menu: 0,
                                            livello_menu: 1,
                                            robots_index: 'index',
                                            robots_follow: 'follow'
                                        });
                                        setIsEditing(true);
                                    }}
                                    className="py-4 px-1 border-b-2 font-medium text-sm border-transparent text-green-600 hover:text-green-700 hover:border-green-300 bg-green-50 hover:bg-green-100 transition-all"
                                >
                                    <PlusIcon className="h-5 w-5 inline mr-1" />
                                    Nuova Pagina
                                </button>
                            )}
                        </nav>
                    </div>

                    <div className="p-6">
                        {/* Instructions */}
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="font-semibold text-blue-900 mb-2">Come modificare le impostazioni SEO:</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• <strong>Clicca su una pagina</strong> nella lista per modificare le sue impostazioni SEO, menu e pubblicazione</li>
                                <li>• <strong>Trascina le pagine</strong> per riordinare il menu di navigazione</li>
                                <li>• Usa il <strong>pulsante "Nuova Pagina"</strong> per creare nuove pagine SEO-ottimizzate</li>
                            </ul>
                        </div>

                        {/* Ricerca */}
                        <div className="mb-6">
                            <input
                                type="text"
                                placeholder="Cerca pagina per titolo o slug..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md"
                            />
                        </div>

                        {/* Lista pagine */}
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="mt-4 text-gray-500">Caricamento...</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredPages.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                        <p>Nessuna pagina trovata</p>
                                    </div>
                                ) : (
                                    filteredPages.map(page => {
                                        const status = getPageStatus(page);
                                        return (
                                            <div
                                                key={page.id}
                                                className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group"
                                                draggable
                                                onDragStart={() => handleDragStart(page)}
                                                onDragOver={handleDragOver}
                                                onDrop={() => handleDrop(page)}
                                                onClick={() => {
                                                    setSelectedPage(page);
                                                    setIsEditing(true);
                                                }}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <ArrowsUpDownIcon className="h-5 w-5 text-gray-400 cursor-move" />

                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                                    {page.titolo_seo || page.slug}
                                                                </h3>
                                                                <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${status.color}-100 text-${status.color}-800`}>
                                                                    {status.text}
                                                                </span>
                                                                {page.password_protetta && (
                                                                    <LockClosedIcon className="h-4 w-4 text-orange-500" />
                                                                )}
                                                                <span className="text-xs text-gray-400 group-hover:text-blue-500 transition-colors">
                                                                    (Clicca per modificare)
                                                                </span>
                                                            </div>
                                                            <div className="text-sm text-gray-500 mt-1">
                                                                /{page.slug}
                                                                {page.id_page_parent && (
                                                                    <span className="ml-2 text-blue-600">
                                                                        (Sottolivello)
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {page.link_esterno && (
                                                            <LinkIcon className="h-4 w-4 text-blue-500" />
                                                        )}
                                                        {page.icona_menu && (
                                                            <span className="text-sm text-gray-500">{page.icona_menu}</span>
                                                        )}

                                                        {hasPermission('CT_PAGES_MANAGE') && (
                                                            <>
                                                                <button
                                                                    onClick={() => togglePageVisibility(page)}
                                                                    className="p-2 text-gray-500 hover:text-gray-700"
                                                                    title={page.pubblicata ? 'Nascondi' : 'Pubblica'}
                                                                >
                                                                    {page.pubblicata ? (
                                                                        <EyeIcon className="h-5 w-5" />
                                                                    ) : (
                                                                        <EyeSlashIcon className="h-5 w-5" />
                                                                    )}
                                                                </button>

                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedPage(page);
                                                                        setIsEditing(true);
                                                                    }}
                                                                    className="p-2 text-blue-600 hover:text-blue-800"
                                                                    title="Modifica"
                                                                >
                                                                    <PencilIcon className="h-5 w-5" />
                                                                </button>

                                                                <button
                                                                    onClick={() => deletePage(page.id)}
                                                                    className="p-2 text-red-600 hover:text-red-800"
                                                                    title="Elimina"
                                                                >
                                                                    <TrashIcon className="h-5 w-5" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PageConfigManager;