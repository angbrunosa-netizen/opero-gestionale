/**
 * Nome File: CatalogSelections.js
 * Percorso: opero-frontend/src/components/cms/CatalogSelections.js
 * Data: 22/12/2025
 * Descrizione: Componente per gestione selezioni prodotti (collezioni)
 * - Lista selezioni esistenti
 * - Creazione/modifica selezioni
 * - Gestione articoli nella selezione con ricerca avanzata e selezione multipla
 */

import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
    BookmarkIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    CheckCircleIcon,
    XCircleIcon,
    MagnifyingGlassIcon,
    FunnelIcon
} from '@heroicons/react/24/outline';

const CatalogSelections = ({ dittaId }) => {
    // Stati
    const [selezioni, setSelezioni] = useState([]);
    const [selectedSelezione, setSelectedSelezione] = useState(null);
    const [articoliSelezione, setArticoliSelezione] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Modal creazione/modifica
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // create | edit
    const [formData, setFormData] = useState({
        nome: '',
        descrizione: '',
        layout: 'grid',
        prodotti_per_riga: 4,
        mostra_prezzo: true,
        mostra_giacenza: true,
        mostra_descrizione: true,
        attivo: true,
        colore_sfondo: '',
        colore_testo: '',
        colore_accento: '',
        // Nuovi campi listino e sconto
        listino_tipo: 'pubblico',
        listino_index: 1,
        applica_sconto: false,
        sconto_percentuale: 0
    });

    // Stato per Modale di Conferma personalizzata (sostituisce confirm nativo)
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null
    });

    // Ricerca prodotti da aggiungere
    const [showAddProducts, setShowAddProducts] = useState(false);
    const [availableProducts, setAvailableProducts] = useState([]);
    const [selectedProductsToAdd, setSelectedProductsToAdd] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    // Filtri ricerca avanzata
    const [searchFilters, setSearchFilters] = useState({
        search_term: '',
        categoria_id: '',
        page: 1,
        limit: 50,
        sort_by: 'descrizione',
        sort_order: 'ASC'
    });
    const [categories, setCategories] = useState([]);
    const [searchPagination, setSearchPagination] = useState({
        total: 0,
        page: 1,
        totalPages: 0
    });

    // Helper per mostrare la conferma
    const showConfirm = (title, message, onConfirm) => {
        setConfirmDialog({
            isOpen: true,
            title,
            message,
            onConfirm
        });
    };

    // Helper per chiudere la conferma
    const closeConfirm = () => {
        setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null });
    };

    // Carica categorie
    const loadCategories = async () => {
        try {
            const res = await api.get(`/admin/cms/${dittaId}/catalog/categories`);
            if (res.data.success) {
                const flattenCategories = (cats, level = 0) => {
                    let result = [];
                    cats.forEach(cat => {
                        result.push({
                            ...cat,
                            nome: '─'.repeat(level) + ' ' + cat.nome_categoria
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

    // Carica selezioni
    const loadSelezioni = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/cms/${dittaId}/catalog/selezioni`);
            if (res.data.success) {
                setSelezioni(res.data.data);
            }
        } catch (error) {
            console.error('Errore caricamento selezioni:', error);
        } finally {
            setLoading(false);
        }
    };

    // Carica articoli di una selezione
    const loadArticoliSelezione = async (selezioneId) => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/cms/${dittaId}/catalog/selezioni/${selezioneId}`);
            if (res.data.success) {
                setArticoliSelezione(res.data.data.articoli);
                setSelectedSelezione(res.data.data.selezione);
            }
        } catch (error) {
            console.error('Errore caricamento articoli selezione:', error);
        } finally {
            setLoading(false);
        }
    };

    // Ricerca prodotti disponibili con filtri avanzati
    const searchAvailableProducts = async () => {
        try {
            const params = {
                ...searchFilters,
                listino_tipo: 'pubblico',
                listino_index: 1,
                mostra_esauriti: true
            };

            const res = await api.get(`/admin/cms/${dittaId}/catalog/products`, { params });
            if (res.data.success) {
                setAvailableProducts(res.data.data);
                setSearchPagination(res.data.meta);
            }
        } catch (error) {
            console.error('Errore ricerca prodotti:', error);
        }
    };

    // Aggiungi prodotti selezionati alla selezione
    const addSelectedProducts = async () => {
        if (selectedProductsToAdd.length === 0) return;

        setSaving(true);
        let added = 0;
        let skipped = 0;
        let errors = 0;

        try {
            const existingIds = articoliSelezione.map(a => a.id);
            const productsToAdd = selectedProductsToAdd.filter(id => !existingIds.includes(id));

            if (productsToAdd.length === 0) {
                alert('Tutti i prodotti selezionati sono già presenti nella selezione!');
                setSaving(false);
                return;
            }

            skipped = selectedProductsToAdd.length - productsToAdd.length;

            for (const productId of productsToAdd) {
                try {
                    const response = await api.post(`/admin/cms/${dittaId}/catalog/selezioni/${selectedSelezione.id}/articoli`, {
                        id_articolo: productId,
                        in_evidenza: false
                    });
                    added++;
                } catch (err) {
                    console.error(`Errore aggiunta prodotto ${productId}:`, err);
                    errors++;
                }
            }

            setSelectedProductsToAdd([]);
            setSelectAll(false);
            setShowAddProducts(false);
            setSearchFilters({
                search_term: '',
                categoria_id: '',
                page: 1,
                limit: 50,
                sort_by: 'descrizione',
                sort_order: 'ASC'
            });
            setAvailableProducts([]);

            await loadArticoliSelezione(selectedSelezione.id);

            let message = `${added} prodotti aggiunti con successo!`;
            if (skipped > 0) message += `\n${skipped} prodotti erano già presenti e sono stati saltati.`;
            if (errors > 0) message += `\n${errors} prodotti hanno dato errore.`;
            alert(message);
        } catch (error) {
            console.error('Errore aggiunta prodotti:', error);
            alert('Errore nell\'aggiunta dei prodotti');
        } finally {
            setSaving(false);
        }
    };

    // Toggle selezione prodotto
    const toggleProductSelection = (productId) => {
        if (selectedProductsToAdd.includes(productId)) {
            setSelectedProductsToAdd(prev => prev.filter(id => id !== productId));
        } else {
            setSelectedProductsToAdd(prev => [...prev, productId]);
        }
    };

    // Toggle selezione tutti
    const toggleSelectAll = () => {
        if (selectAll) {
            setSelectedProductsToAdd([]);
        } else {
            setSelectedProductsToAdd(availableProducts.map(p => p.id));
        }
        setSelectAll(!selectAll);
    };

    // Crea nuova selezione
    const createSelezione = async () => {
        setSaving(true);
        try {
            await api.post(`/admin/cms/${dittaId}/catalog/selezioni`, formData);
            setShowModal(false);
            resetForm();
            loadSelezioni();
            alert('Selezione creata con successo!');
        } catch (error) {
            console.error('Errore creazione selezione:', error);
            alert('Errore nella creazione della selezione');
        } finally {
            setSaving(false);
        }
    };

    // Aggiorna selezione
    const updateSelezione = async () => {
        setSaving(true);
        try {
            await api.put(`/admin/cms/${dittaId}/catalog/selezioni/${selectedSelezione.id}`, formData);
            setShowModal(false);
            loadSelezioni();
            if (selectedSelezione) {
                loadArticoliSelezione(selectedSelezione.id);
            }
            alert('Selezione aggiornata con successo!');
        } catch (error) {
            console.error('Errore aggiornamento selezione:', error);
            alert('Errore nell\'aggiornamento della selezione');
        } finally {
            setSaving(false);
        }
    };

    // Elimina selezione (con modale custom)
    const deleteSelezione = (selezioneId) => {
        showConfirm(
            'Elimina Selezione',
            'Sei sicuro di voler eliminare questa selezione?',
            async () => {
                try {
                    await api.delete(`/admin/cms/${dittaId}/catalog/selezioni/${selezioneId}`);
                    if (selectedSelezione?.id === selezioneId) {
                        setSelectedSelezione(null);
                        setArticoliSelezione([]);
                    }
                    loadSelezioni();
                    alert('Selezione eliminata con successo!');
                    closeConfirm();
                } catch (error) {
                    console.error('Errore eliminazione selezione:', error);
                    alert('Errore nell\'eliminazione della selezione');
                    closeConfirm();
                }
            }
        );
    };

    // Rimuovi prodotto dalla selezione (con modale custom)
    const removeProductFromSelection = (articoloId) => {
        showConfirm(
            'Rimuovi Prodotto',
            'Rimuovere questo prodotto dalla selezione?',
            async () => {
                try {
                    await api.delete(`/admin/cms/${dittaId}/catalog/selezioni/${selectedSelezione.id}/articoli/${articoloId}`);
                    loadArticoliSelezione(selectedSelezione.id);
                    closeConfirm();
                } catch (error) {
                    console.error('Errore rimozione prodotto:', error);
                    alert('Errore nella rimozione del prodotto');
                    closeConfirm();
                }
            }
        );
    };

    // Toggle evidenza prodotto
    const toggleProductEvidenza = async (articolo) => {
        try {
            await api.put(`/admin/cms/${dittaId}/catalog/selezioni/${selectedSelezione.id}/articoli/${articolo.id}/options`, {
                etichetta_personalizzata: articolo.etichetta_personalizzata || null,
                in_evidenza: !articolo.in_evidenza,
                note_interne: null
            });
            loadArticoliSelezione(selectedSelezione.id);
        } catch (error) {
            console.error('Errore toggle evidenza:', error);
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            nome: '',
            descrizione: '',
            layout: 'grid',
            prodotti_per_riga: 4,
            mostra_prezzo: true,
            mostra_giacenza: true,
            mostra_descrizione: true,
            attivo: true,
            colore_sfondo: '',
            colore_testo: '',
            colore_accento: ''
        });
    };

    // Open modal per creazione
    const openCreateModal = () => {
        resetForm();
        setModalMode('create');
        setShowModal(true);
    };

    // Open modal per modifica
    const openEditModal = (selezione) => {
        setFormData({
            nome: selezione.nome,
            descrizione: selezione.descrizione || '',
            layout: selezione.layout,
            prodotti_per_riga: selezione.prodotti_per_riga,
            mostra_prezzo: selezione.mostra_prezzo,
            mostra_giacenza: selezione.mostra_giacenza,
            mostra_descrizione: selezione.mostra_descrizione,
            attivo: selezione.attivo,
            colore_sfondo: selezione.colore_sfondo || '',
            colore_testo: selezione.colore_testo || '',
            colore_accento: selezione.colore_accento || '',
            // Campi listino e sconto
            listino_tipo: selezione.listino_tipo || 'pubblico',
            listino_index: selezione.listino_index || 1,
            applica_sconto: selezione.applica_sconto || false,
            sconto_percentuale: selezione.sconto_percentuale || 0
        });
        setSelectedSelezione(selezione);
        setModalMode('edit');
        setShowModal(true);
    };

    // Apri modulo aggiunta prodotti
    const openAddProducts = () => {
        setShowAddProducts(true);
        loadCategories();
        setSearchFilters({
            search_term: '',
            categoria_id: '',
            page: 1,
            limit: 50,
            sort_by: 'descrizione',
            sort_order: 'ASC'
        });
        setAvailableProducts([]);
        setSelectedProductsToAdd([]);
        setSelectAll(false);
    };

    // Effetti
    useEffect(() => {
        if (dittaId) {
            loadSelezioni();
        }
    }, [dittaId]);

    useEffect(() => {
        if (showAddProducts) {
            searchAvailableProducts();
        }
    }, [searchFilters.page, searchFilters.sort_by, searchFilters.sort_order]);

    useEffect(() => {
        if (showAddProducts) {
            const timeoutId = setTimeout(() => {
                searchAvailableProducts();
            }, 500);
            return () => clearTimeout(timeoutId);
        }
    }, [searchFilters.search_term, searchFilters.categoria_id]);

    return (
        <div className="space-y-6">
            {/* Modal Creazione/Modifica */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b">
                            <h3 className="text-lg font-semibold">
                                {modalMode === 'create' ? 'Nuova Selezione' : 'Modifica Selezione'}
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                                <input
                                    type="text"
                                    value={formData.nome}
                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="Es: Prodotti in offerta, Nuovi arrivi"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
                                <textarea
                                    value={formData.descrizione}
                                    onChange={(e) => setFormData({ ...formData, descrizione: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    rows={3}
                                    placeholder="Descrizione della selezione..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Layout</label>
                                    <select
                                        value={formData.layout}
                                        onChange={(e) => setFormData({ ...formData, layout: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    >
                                        <option value="grid">Griglia</option>
                                        <option value="list">Lista</option>
                                        <option value="carousel">Carosello</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Prodotti per riga</label>
                                    <select
                                        value={formData.prodotti_per_riga}
                                        onChange={(e) => setFormData({ ...formData, prodotti_per_riga: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    >
                                        <option value={2}>2</option>
                                        <option value={3}>3</option>
                                        <option value={4}>4</option>
                                        <option value={6}>6</option>
                                    </select>
                                </div>
                            </div>

                            {/* Sezione Listino */}
                            <div className="border-t pt-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">Configurazione Prezzi</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Listino</label>
                                        <select
                                            value={formData.listino_tipo || 'pubblico'}
                                            onChange={(e) => setFormData({ ...formData, listino_tipo: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        >
                                            <option value="pubblico">Pubblico</option>
                                            <option value="cessione">Cessione</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Indice Listino</label>
                                        <select
                                            value={formData.listino_index || 1}
                                            onChange={(e) => setFormData({ ...formData, listino_index: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        >
                                            <option value={1}>Listino 1</option>
                                            <option value={2}>Listino 2</option>
                                            <option value={3}>Listino 3</option>
                                            <option value={4}>Listino 4</option>
                                            <option value={5}>Listino 5</option>
                                            <option value={6}>Listino 6</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.applica_sconto || false}
                                            onChange={(e) => setFormData({ ...formData, applica_sconto: e.target.checked })}
                                            className="rounded"
                                        />
                                        <span className="text-sm">Applica sconto</span>
                                    </label>
                                </div>
                                {(formData.applica_sconto) && (
                                    <div className="mt-3">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Percentuale Sconto ({formData.sconto_percentuale || 0}%)
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            step="1"
                                            value={formData.sconto_percentuale || 0}
                                            onChange={(e) => setFormData({ ...formData, sconto_percentuale: parseInt(e.target.value) })}
                                            className="w-full"
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>0%</span>
                                            <span className="font-semibold text-blue-600">{formData.sconto_percentuale || 0}%</span>
                                            <span>100%</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.mostra_prezzo}
                                        onChange={(e) => setFormData({ ...formData, mostra_prezzo: e.target.checked })}
                                        className="rounded"
                                    />
                                    <span className="text-sm">Mostra prezzo</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.mostra_giacenza}
                                        onChange={(e) => setFormData({ ...formData, mostra_giacenza: e.target.checked })}
                                        className="rounded"
                                    />
                                    <span className="text-sm">Mostra giacenza</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.mostra_descrizione}
                                        onChange={(e) => setFormData({ ...formData, mostra_descrizione: e.target.checked })}
                                        className="rounded"
                                    />
                                    <span className="text-sm">Mostra descrizione</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.attivo}
                                        onChange={(e) => setFormData({ ...formData, attivo: e.target.checked })}
                                        className="rounded"
                                    />
                                    <span className="text-sm">Attiva selezione</span>
                                </label>
                            </div>
                        </div>
                        <div className="p-6 border-t flex justify-end gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Annulla
                            </button>
                            <button
                                onClick={modalMode === 'create' ? createSelezione : updateSelezione}
                                disabled={saving || !formData.nome}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {saving ? 'Salvataggio...' : modalMode === 'create' ? 'Crea' : 'Salva'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal di Conferma Personalizzata */}
            {confirmDialog.isOpen && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6 border-b">
                            <h3 className="text-lg font-semibold text-gray-900">{confirmDialog.title}</h3>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-700">{confirmDialog.message}</p>
                        </div>
                        <div className="p-6 border-t flex justify-end gap-3">
                            <button
                                onClick={closeConfirm}
                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700"
                            >
                                Annulla
                            </button>
                            <button
                                onClick={() => {
                                    if (confirmDialog.onConfirm) {
                                        confirmDialog.onConfirm();
                                    }
                                }}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                Conferma
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Selezioni Prodotti</h2>
                    <p className="text-sm text-gray-500">Crea collezioni di prodotti da inserire nelle pagine</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    <PlusIcon className="h-5 w-5" />
                    Nuova Selezione
                </button>
            </div>

            <div className="flex gap-6">
                {/* Lista Selezioni */}
                <div className="w-80 flex-shrink-0">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="p-4 border-b">
                            <h3 className="font-semibold">Collezioni</h3>
                        </div>
                        <div className="max-h-[600px] overflow-y-auto">
                            {loading && selezioni.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">Caricamento...</div>
                            ) : selezioni.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <BookmarkIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                                    <p className="text-sm">Nessuna selezione creata</p>
                                </div>
                            ) : (
                                selezioni.map((selezione) => (
                                    <div
                                        key={selezione.id}
                                        onClick={() => loadArticoliSelezione(selezione.id)}
                                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                                            selectedSelezione?.id === selezione.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                                        }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900">{selezione.nome}</h4>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {selezione.numero_articoli} prodotti
                                                </p>
                                                <span className={`inline-block mt-2 px-2 py-0.5 text-xs rounded-full ${
                                                    selezione.attivo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {selezione.attivo ? 'Attiva' : 'Non attiva'}
                                                </span>
                                            </div>
                                            <div className="flex gap-1 ml-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); openEditModal(selezione); }}
                                                    className="p-1 text-gray-400 hover:text-blue-600"
                                                    title="Modifica"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); deleteSelezione(selezione.id); }}
                                                    className="p-1 text-gray-400 hover:text-red-600"
                                                    title="Elimina"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Dettaglio Selezione */}
                <div className="flex-1">
                    {!selectedSelezione ? (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                            <BookmarkIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna selezione selezionata</h3>
                            <p className="text-gray-500">Seleziona una collezione dalla lista per vedere i prodotti</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Header Selezione */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{selectedSelezione.nome}</h3>
                                        {selectedSelezione.descrizione && (
                                            <p className="text-sm text-gray-600 mt-1">{selectedSelezione.descrizione}</p>
                                        )}
                                        <div className="flex gap-2 mt-2">
                                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                {articoliSelezione.length} prodotti
                                            </span>
                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                {selectedSelezione.layout}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSelectedSelezione(null);
                                            setArticoliSelezione([]);
                                        }}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            {/* Aggiungi Prodotti con Ricerca Avanzata */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="p-4 border-b">
                                    {!showAddProducts ? (
                                        <button
                                            onClick={openAddProducts}
                                            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:border-blue-500 hover:text-blue-600 transition"
                                        >
                                            + Aggiungi prodotti
                                        </button>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-semibold">Ricerca Avanzata Prodotti</h4>
                                                <button
                                                    onClick={() => {
                                                        setShowAddProducts(false);
                                                        setSearchFilters({
                                                            search_term: '',
                                                            categoria_id: '',
                                                            page: 1,
                                                            limit: 50,
                                                            sort_by: 'descrizione',
                                                            sort_order: 'ASC'
                                                        });
                                                        setAvailableProducts([]);
                                                        setSelectedProductsToAdd([]);
                                                        setSelectAll(false);
                                                    }}
                                                    className="text-gray-400 hover:text-gray-600"
                                                >
                                                    ✕
                                                </button>
                                            </div>

                                            {/* Filtri */}
                                            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <FunnelIcon className="h-4 w-4 text-gray-500" />
                                                    <span className="text-sm font-medium text-gray-700">Filtri</span>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    {/* Ricerca */}
                                                    <div className="relative">
                                                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                        <input
                                                            type="text"
                                                            placeholder="Cerca per codice, descrizione, EAN..."
                                                            value={searchFilters.search_term}
                                                            onChange={(e) => setSearchFilters({ ...searchFilters, search_term: e.target.value, page: 1 })}
                                                            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </div>

                                                    {/* Categoria */}
                                                    <select
                                                        value={searchFilters.categoria_id}
                                                        onChange={(e) => setSearchFilters({ ...searchFilters, categoria_id: e.target.value, page: 1 })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                                    >
                                                        <option value="">Tutte le categorie</option>
                                                        {categories.map(cat => (
                                                            <option key={cat.id} value={cat.id}>{cat.nome}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Reset Filtri */}
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-gray-500">
                                                        {searchPagination.total} prodotti trovati
                                                    </span>
                                                    <button
                                                        onClick={() => setSearchFilters({
                                                            search_term: '',
                                                            categoria_id: '',
                                                            page: 1,
                                                            limit: 50,
                                                            sort_by: 'descrizione',
                                                            sort_order: 'ASC'
                                                        })}
                                                        className="text-sm text-blue-600 hover:text-blue-700"
                                                    >
                                                        Reset filtri
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Risultati con Datagrid */}
                                            {availableProducts.length > 0 && (
                                                <div className="space-y-3">
                                                    {/* Azioni massime */}
                                                    <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                                                        <div className="flex items-center gap-4">
                                                            <label className="flex items-center gap-2">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectAll}
                                                                    onChange={toggleSelectAll}
                                                                    className="rounded text-blue-600"
                                                                />
                                                                <span className="text-sm font-medium">
                                                                    Seleziona tutti ({availableProducts.length})
                                                                </span>
                                                            </label>
                                                            <span className="text-sm text-blue-700">
                                                                {selectedProductsToAdd.length} selezionati
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={addSelectedProducts}
                                                            disabled={saving || selectedProductsToAdd.length === 0}
                                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                                        >
                                                            {saving ? 'Aggiunta...' : `Aggiungi ${selectedProductsToAdd.length} prodotti`}
                                                        </button>
                                                    </div>

                                                    {/* Datagrid */}
                                                    <div className="border rounded-md overflow-hidden max-h-96 overflow-y-auto">
                                                        <table className="min-w-full divide-y divide-gray-200">
                                                            <thead className="bg-gray-50 sticky top-0">
                                                                <tr>
                                                                    <th className="px-4 py-3 w-12">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={selectAll}
                                                                            onChange={toggleSelectAll}
                                                                            className="rounded text-blue-600"
                                                                        />
                                                                    </th>
                                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Codice</th>
                                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrizione</th>
                                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prezzo</th>
                                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giacenza</th>
                                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stato</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="bg-white divide-y divide-gray-200">
                                                                {availableProducts.map(product => {
                                                                    const isAlreadyInSelection = articoliSelezione.some(a => a.id === product.id);
                                                                    const isSelected = selectedProductsToAdd.includes(product.id);

                                                                    return (
                                                                        <tr
                                                                            key={product.id}
                                                                            className={`hover:bg-gray-50 ${
                                                                                isSelected ? 'bg-blue-50' : ''
                                                                            } ${
                                                                                isAlreadyInSelection ? 'bg-gray-100' : ''
                                                                            }`}
                                                                        >
                                                                            <td className="px-4 py-3">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={isSelected}
                                                                                    onChange={() => toggleProductSelection(product.id)}
                                                                                    className="rounded text-blue-600"
                                                                                    disabled={isAlreadyInSelection}
                                                                                />
                                                                            </td>
                                                                            <td className="px-4 py-3 text-sm font-mono text-gray-900">
                                                                                {product.codice}
                                                                                {isAlreadyInSelection && (
                                                                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-gray-200 text-gray-700">
                                                                                        Già presente
                                                                                    </span>
                                                                                )}
                                                                            </td>
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
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>

                                                    {/* Pagination */}
                                                    {searchPagination.totalPages > 1 && (
                                                        <div className="flex justify-center gap-2">
                                                            <button
                                                                onClick={() => setSearchFilters({ ...searchFilters, page: searchFilters.page - 1 })}
                                                                disabled={searchPagination.page === 1}
                                                                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                                                            >
                                                                Precedente
                                                            </button>
                                                            <span className="px-3 py-1 text-sm text-gray-600">
                                                                Pagina {searchPagination.page} di {searchPagination.totalPages}
                                                            </span>
                                                            <button
                                                                onClick={() => setSearchFilters({ ...searchFilters, page: searchFilters.page + 1 })}
                                                                disabled={searchPagination.page === searchPagination.totalPages}
                                                                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                                                            >
                                                                Successiva
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Lista Prodotti nella Selezione */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="p-4 border-b">
                                    <h4 className="font-semibold">Prodotti nella selezione</h4>
                                </div>
                                {loading ? (
                                    <div className="p-8 text-center text-gray-500">Caricamento...</div>
                                ) : articoliSelezione.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        Nessun prodotto in questa selezione
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {articoliSelezione.map((articolo, index) => (
                                            <div key={articolo.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                                                <span className="text-gray-400 text-sm w-6">{index + 1}</span>
                                                {articolo.immagini && articolo.immagini.length > 0 ? (
                                                    <img
                                                        src={articolo.immagini[0].previewUrl}
                                                        alt={articolo.descrizione}
                                                        className="w-16 h-16 object-cover rounded"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                                                        No img
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">{articolo.descrizione}</p>
                                                    <p className="text-xs text-gray-500">{articolo.codice}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-sm font-semibold text-blue-600">
                                                            € {articolo.prezzo?.toFixed(2)}
                                                        </span>
                                                        {articolo.etichetta_personalizzata && (
                                                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                                                                {articolo.etichetta_personalizzata}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => toggleProductEvidenza(articolo)}
                                                        className={`p-2 rounded ${
                                                            articolo.in_evidenza
                                                                ? 'bg-yellow-100 text-yellow-700'
                                                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                        }`}
                                                        title={articolo.in_evidenza ? 'Rimuovi evidenza' : 'Metti in evidenza'}
                                                    >
                                                        ⭐
                                                    </button>
                                                    <button
                                                        onClick={() => removeProductFromSelection(articolo.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                                        title="Rimuovi"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CatalogSelections;