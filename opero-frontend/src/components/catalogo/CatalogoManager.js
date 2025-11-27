/**
 * @file opero-frontend/src/components/catalogo/CatalogoManager.js
 * @description Manager con vista mobile e ottimizzazioni di performance (debounce + hard limit).
 * @date 2025-11-26
 * @version 9.9 (Fix definitivo performance mobile e paginazione ricerca)
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import AdvancedDataGrid from '../../shared/AdvancedDataGrid';
import {
    PlusIcon, PencilIcon, ArchiveBoxIcon, BuildingOfficeIcon, QrCodeIcon,
    CameraIcon, XMarkIcon, ListBulletIcon, MagnifyingGlassIcon, FunnelIcon,
    ChevronLeftIcon, ChevronRightIcon
} from '@heroicons/react/24/outline';

import ListiniManager from './ListiniManager';
import CodiciFornitoreManager from './CodiciFornitoreManager';
import EanManager from './EanManager';
import AllegatiManager from '../../shared/AllegatiManager';
import BarcodeScannerModal from '../../shared/BarcodeScannerModal'; // <--- IMPORT GIÀ PRESENTE

// Costanti per la paginazione
const PAGE_SIZE = 10;
const INITIAL_PAGE = 1;

// Hook per il debounce di un valore (usato solo per la ricerca)
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}


// MODIFICATO: Aggiunta della prop onOpenScanner
const MobileCatalogoView = ({ data, isLoading, totalCount, hasPermission, onEdit, onArchive, onOpenSubManager, currentPage, totalPages, onPageChange, onOpenScanner }) => {
    if (isLoading) {
        return <div className="flex justify-center items-center h-32"><div className="text-gray-500">Caricamento...</div></div>;
    }

    if (!data || data.length === 0) {
        return <div className="text-center p-4 text-gray-500 bg-white rounded-lg">Nessun dato trovato.</div>;
    }

    return (
        <>
            {totalCount > data.length && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-md text-sm">
                    Trovati {totalCount} risultati totali. Visualizzati {data.length} elementi (pagina {currentPage} di {totalPages}).
                </div>
            )}
            <div className="space-y-4 pb-4">
                {data.map((item) => (
                    <div key={item.id} className="bg-white p-4 rounded-lg shadow border border-gray-200 grid grid-rows-[auto_1fr_auto] gap-y-2">
                        <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-lg text-gray-800 flex-1 mr-2">{item.descrizione}</h3>
                            <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${item.stato_entita === 'ATTIVO' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {item.stato_entita}
                            </span>
                        </div>
                        <div className="flex justify-around text-sm text-gray-600">
                            <p><span className="font-medium">P. Acquisto:</span> € {parseFloat(item.costo_base || 0).toFixed(2)}</p>
                            <p><span className="font-medium">P. Cessione:</span> {item.prezzo_cessione_1 ? `€ ${parseFloat(item.prezzo_cessione_1).toFixed(2)}` : 'N/D'}</p>
                        </div>
                        <div className="flex justify-center">
                            <EntityActionButtons
                                item={item}
                                hasPermission={hasPermission}
                                onEdit={onEdit}
                                onArchive={onArchive}
                                onOpenSubManager={onOpenSubManager}
                            />
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-between items-center p-4 bg-white border-t border-gray-200 rounded-b-lg">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronLeftIcon className="h-4 w-4 mr-1" /> Precedente
                </button>
                <span className="text-sm text-gray-700">
                    Pagina {currentPage} di {totalPages}
                </span>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Successiva <ChevronRightIcon className="h-4 w-4 ml-1" />
                </button>
            </div>
        </>
    );
};

// Sotto-Componente: Form di Creazione/Modifica (Modal)
const CatalogoFormModal = ({ item, onSave, onCancel, supportData }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        const initialState = {
            codice_entita: '', descrizione: '', id_categoria: null, tipo_entita: 'bene',
            id_unita_misura: null, id_aliquota_iva: null, costo_base: 0,
            gestito_a_magazzino: false, id_stato_entita: null, peso_lordo_pz: 0,
            volume_pz: 0, h_pz: 0, l_pz: 0, p_pz: 0, s_im: 0, pezzi_per_collo: 0,
            colli_per_strato: 0, strati_per_pallet: 0,
        };
        setFormData(item ? { ...initialState, ...item } : initialState);
    }, [item]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData, item ? item.id : null);
    };

    const renderCategoryOptions = (nodes, depth = 0) => {
        return nodes.flatMap(node => [
            <option key={node.id} value={node.id}>
                {'\u00A0'.repeat(depth * 4)} {node.codice_categoria} - {node.nome_categoria}
            </option>,
            ...(node.children ? renderCategoryOptions(node.children, depth + 1) : [])
        ]);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <h2 className="text-xl font-bold mb-4">{item && item.id ? 'Modifica Entità' : 'Nuova Entità'}</h2>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2 space-y-4">
                    <div className="p-4 border rounded-md">
                        <h3 className="text-lg font-semibold mb-3 text-gray-700">Dati Anagrafici</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label htmlFor="codice_entita" className="block text-sm font-medium text-gray-700">Codice</label><input type="text" name="codice_entita" value={formData.codice_entita || ''} onChange={handleChange} required disabled={!!(item && item.id)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm disabled:bg-gray-100" /></div>
                            <div><label htmlFor="descrizione" className="block text-sm font-medium text-gray-700">Descrizione</label><input type="text" name="descrizione" value={formData.descrizione || ''} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                            <div className="col-span-2"><label htmlFor="id_categoria" className="block text-sm font-medium text-gray-700">Categoria</label><select name="id_categoria" value={formData.id_categoria || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"><option value="">-- Seleziona --</option>{supportData.categorie && renderCategoryOptions(supportData.categorie)}</select></div>
                            <div><label htmlFor="costo_base" className="block text-sm font-medium text-gray-700">Costo Base</label><input type="number" step="0.01" name="costo_base" value={formData.costo_base || 0} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                            <div><label htmlFor="id_aliquota_iva" className="block text-sm font-medium text-gray-700">Aliquota IVA</label><select name="id_aliquota_iva" value={formData.id_aliquota_iva || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"><option value="">-- Seleziona --</option>{supportData.aliquoteIva?.map(iva => <option key={iva.id} value={iva.id}>{iva.descrizione}</option>)}</select></div>
                            <div><label htmlFor="id_unita_misura" className="block text-sm font-medium text-gray-700">Unità di Misura</label><select name="id_unita_misura" value={formData.id_unita_misura || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"><option value="">-- Seleziona --</option>{supportData.unitaMisura?.map(um => <option key={um.id} value={um.id}>{um.sigla_um}</option>)}</select></div>
                            <div><label htmlFor="id_stato_entita" className="block text-sm font-medium text-gray-700">Stato</label><select name="id_stato_entita" value={formData.id_stato_entita || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"><option value="">-- Seleziona --</option>{supportData.statiEntita?.map(stato => <option key={stato.id} value={stato.id}>{stato.descrizione}</option>)}</select></div>
                            <div className="col-span-2 flex items-center"><input type="checkbox" id="gestito_a_magazzino" name="gestito_a_magazzino" checked={formData.gestito_a_magazzino || false} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/><label htmlFor="gestito_a_magazzino" className="ml-2 block text-sm text-gray-900">Gestito a Magazzino</label></div>
                        </div>
                    </div>
                    {formData.gestito_a_magazzino && (
                        <div className="p-4 border rounded-md bg-gray-50">
                            <h3 className="text-lg font-semibold mb-3 text-gray-700">Dati Logistici</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div><label htmlFor="peso_lordo_pz" className="block text-sm font-medium text-gray-700">Peso Lordo (Kg)</label><input type="number" step="0.001" name="peso_lordo_pz" value={formData.peso_lordo_pz || 0} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                                <div><label htmlFor="volume_pz" className="block text-sm font-medium text-gray-700">Volume (m³)</label><input type="number" step="0.000001" name="volume_pz" value={formData.volume_pz || 0} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                                <div><label htmlFor="s_im" className="block text-sm font-medium text-gray-700">Pz. per Sottoimballo</label><input type="number" name="s_im" value={formData.s_im || 0} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                                <div><label htmlFor="l_pz" className="block text-sm font-medium text-gray-700">Larghezza (cm)</label><input type="number" step="0.01" name="l_pz" value={formData.l_pz || 0} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                                <div><label htmlFor="p_pz" className="block text-sm font-medium text-gray-700">Profondità (cm)</label><input type="number" step="0.01" name="p_pz" value={formData.p_pz || 0} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                                <div><label htmlFor="h_pz" className="block text-sm font-medium text-gray-700">Altezza (cm)</label><input type="number" step="0.01" name="h_pz" value={formData.h_pz || 0} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                                <div><label htmlFor="pezzi_per_collo" className="block text-sm font-medium text-gray-700">Pezzi per Collo</label><input type="number" name="pezzi_per_collo" value={formData.pezzi_per_collo || 0} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                                <div><label htmlFor="colli_per_strato" className="block text-sm font-medium text-gray-700">Colli per Strato</label><input type="number" name="colli_per_strato" value={formData.colli_per_strato || 0} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                                <div><label htmlFor="strati_per_pallet" className="block text-sm font-medium text-gray-700">Strati per Pallet</label><input type="number" name="strati_per_pallet" value={formData.strati_per_pallet || 0} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                            </div>
                        </div>
                    )}
                    <div className="mt-6 pt-4 border-t flex justify-end gap-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-400">Annulla</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">Salva</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Modale dedicato alla gestione delle foto
const CatalogoFotoModal = ({ item, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 pb-4 border-b">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Gestione Immagini</h2>
                    <p className="text-sm text-gray-600">
                        Prodotto: <span className="font-medium">{item.codice_entita} - {item.descrizione}</span>
                    </p>
                </div>
                <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                    <XMarkIcon className="h-6 w-6" />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
                <AllegatiManager
                    entita_tipo="ct_catalogo"
                    entita_id={item.id}
                    idDitta={item.id_ditta}
                    defaultPrivacy="public"
                    isPublic={true} 
                />
            </div>
        </div>
    </div>
);

// Componente per i pulsanti di azione
const EntityActionButtons = ({ item, hasPermission, onEdit, onArchive, onOpenSubManager }) => (
    <div className="flex gap-1 sm:gap-2 items-center justify-end">
        {hasPermission('CT_MANAGE') && <button onClick={() => onEdit(item)} className="p-1 text-blue-600 hover:text-blue-800" title="Modifica"><PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" /></button>}
        {hasPermission('CT_MANAGE') && <button onClick={() => onOpenSubManager('foto', item)} className="p-1 text-teal-600 hover:text-teal-800" title="Gestisci Foto"><CameraIcon className="h-4 w-4 sm:h-5 sm:w-5" /></button>}
        {hasPermission('CT_LISTINI_VIEW') && <button onClick={() => onOpenSubManager('listini', item)} className="p-1 text-green-600 hover:text-green-800" title="Gestisci Listini"><ListBulletIcon className="h-4 w-4 sm:h-5 sm:w-5" /></button>}
        {hasPermission('CT_EAN_VIEW') && <button onClick={() => onOpenSubManager('ean', item)} className="p-1 text-gray-600 hover:text-gray-900" title="Gestisci EAN"><QrCodeIcon className="h-4 w-4 sm:h-5 sm:w-5" /></button>}
        {hasPermission('CT_COD_FORN_VIEW') && <button onClick={() => onOpenSubManager('fornitori', item)} className="p-1 text-purple-600 hover:text-purple-800" title="Codici Fornitore"><BuildingOfficeIcon className="h-4 w-4 sm:h-5 sm:w-5" /></button>}
        {hasPermission('CT_MANAGE') && item.codice_stato !== 'DEL' && <button onClick={() => onArchive(item)} className="p-1 text-red-600 hover:text-red-800" title="Archivia"><ArchiveBoxIcon className="h-4 w-4 sm:h-5 sm:w-5" /></button>}
    </div>
);

// Componente Principale
const CatalogoManager = () => {
    const { hasPermission } = useAuth();
    
    // STATI DI GESTIONE DATI
    const [displayedData, setDisplayedData] = useState([]);
    const [allSearchResults, setAllSearchResults] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [supportData, setSupportData] = useState({ categorie: [], unitaMisura: [], aliquoteIva: [], statiEntita: [] });
    const [includeArchived, setIncludeArchived] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    
    // Stati per la paginazione
    const [currentPage, setCurrentPage] = useState(INITIAL_PAGE);
    const [pageSize] = useState(PAGE_SIZE);
    
    // STATI DI GESTIONE UI (MODALI)
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [isListiniModalOpen, setIsListiniModalOpen] = useState(false);
    const [isCodiciFornitoreModalOpen, setIsCodiciFornitoreModalOpen] = useState(false);
    const [isEanModalOpen, setIsEanModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isFotoModalOpen, setIsFotoModalOpen] = useState(false);
    const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
    
    // NUOVO: Stato per la gestione del modale dello scanner
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    
    // STATO PER LA GESTIONE DELLA VISUALIZZAZIONE MOBILE
    const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Memoizzazione delle mappe per l'enrichment dei dati
    const categoryMap = useMemo(() => {
        const map = new Map();
        const flatten = (nodes) => {
            nodes.forEach(node => {
                map.set(node.id, node.nome_categoria);
                if (node.children) flatten(node.children);
            });
        };
        flatten(supportData.categorie);
        return map;
    }, [supportData.categorie]);

    const ivaMap = useMemo(() => {
        return new Map(supportData.aliquoteIva.map(iva => [iva.id, iva.descrizione]));
    }, [supportData.aliquoteIva]);

    // --- CORREZIONE FINALE: LOGICA DI FETCHING SEPARATA ---

    // 1. Effetto per gestire la RICERCA (non dipende da currentPage)
    useEffect(() => {
        const fetchSearchData = async () => {
            // Esegui solo se c'è un termine di ricerca
            if (!debouncedSearchTerm || debouncedSearchTerm.trim() === '') {
                return;
            }
            if (!hasPermission('CT_VIEW')) return;

            setIsLoading(true);
            try {
                const url = `/catalogo/search/?term=${encodeURIComponent(debouncedSearchTerm.trim())}&includeArchived=${includeArchived}`;
                const response = await api.get(url);
                
                let allResults = [];
                if (response.data && Array.isArray(response.data.data)) {
                    allResults = response.data.data;
                } else if (Array.isArray(response.data)) {
                    allResults = response.data;
                }

                setAllSearchResults(allResults);
                setTotalCount(allResults.length);
                
                // OTTIMIZZAZIONE MOBILE: Imposta subito displayedData con la slice della prima pagina
                // Questo previene che l'UI riceva il set completo (es. 1000 record) prima che lo useEffect di paginazione intervenga.
                setCurrentPage(1); 
                setDisplayedData(allResults.slice(0, pageSize));

            } catch (error) {
                console.error("[CatalogoManager] Errore durante la ricerca:", error);
                setAllSearchResults([]);
                setDisplayedData([]);
                setTotalCount(0);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSearchData();
    // NOTA: `currentPage` è stato RIMOSSO dalle dipendenze, aggiunto pageSize
    }, [debouncedSearchTerm, includeArchived, hasPermission, pageSize]);

    // 2. Effetto per gestire la LISTA NORMALE (dipende da currentPage)
    useEffect(() => {
        const fetchListData = async () => {
            // Esegui solo se NON c'è un termine di ricerca
            if (debouncedSearchTerm && debouncedSearchTerm.trim() !== '') {
                return;
            }
            if (!hasPermission('CT_VIEW')) return;

            setIsLoading(true);
            try {
                const params = new URLSearchParams({
                    page: currentPage,
                    limit: pageSize,
                    includeArchived,
                });
                if (selectedCategoryId) {
                    params.set('id_categoria', selectedCategoryId);
                }
                const url = `/catalogo/entita?${params.toString()}`;
                const response = await api.get(url);

                let data = [];
                let total = 0;
                if (response.data.data && Array.isArray(response.data.data)) {
                    data = response.data.data;
                    total = response.data.total || response.data.data.length;
                }
                
                setAllSearchResults([]); // Svuota i risultati di ricerca
                setDisplayedData(data);
                setTotalCount(total);
                
            } catch (error) {
                console.error("[CatalogoManager] Errore durante il caricamento della lista:", error);
                setDisplayedData([]);
                setTotalCount(0);
            } finally {
                setIsLoading(false);
            }
        };
        fetchListData();
    // NOTA: `debouncedSearchTerm` è stato RIMOSSO, ma `currentPage` è presente
    }, [selectedCategoryId, includeArchived, currentPage, pageSize, hasPermission, refreshKey]);

    // 3. Effetto per gestire la paginazione lato client dei risultati di ricerca
    useEffect(() => {
        // Questo effetto gestisce i cambi pagina successivi al primo per i risultati di ricerca
        if (allSearchResults.length > 0) {
            const startIndex = (currentPage - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const paginatedData = allSearchResults.slice(startIndex, endIndex);

            setDisplayedData(paginatedData);
        }
    }, [currentPage, allSearchResults, pageSize]);

    // --- FINE CORREZIONE ---


    // Effetto per caricare i dati di supporto
    useEffect(() => {
        const fetchSupportData = async () => {
            try {
                const [catRes, umRes, ivaRes, statiRes] = await Promise.all([
                    api.get('/catalogo/categorie'),
                    api.get('/catalogo/unita-misura'),
                    api.get('/amministrazione/iva'),
                    api.get('/catalogo/stati-entita')
                ]);
                setSupportData({
                    categorie: catRes.data || [],
                    unitaMisura: umRes.data?.data || [],
                    aliquoteIva: ivaRes.data?.data || [],
                    statiEntita: statiRes.data?.data || [],
                });
            } catch (err) {
                console.error("Errore nel caricamento dei dati di supporto", err);
            }
        };
        fetchSupportData();
    }, []);

    // Dati arricchiti per la visualizzazione mobile
    const enrichedData = useMemo(() => {
        if (!isMobile) return displayedData;

        // FIX CRITICO MOBILE: Hard-slice dei dati.
        // Anche se displayedData dovesse contenere erroneamente tutti i record (es. 1000),
        // ne passiamo alla vista mobile solo un numero pari a PAGE_SIZE.
        // Questo è il "firewall" finale contro i problemi di performance.
        const safeData = displayedData.length > pageSize ? displayedData.slice(0, pageSize) : displayedData;

        return safeData.map(item => ({
            ...item,
            nome_categoria: categoryMap.get(item.id_categoria) || 'N/D',
            descrizione_iva: ivaMap.get(item.id_aliquota_iva) || 'N/D'
        }));
    }, [displayedData, isMobile, categoryMap, ivaMap, pageSize]);

    // Funzioni callback
    const forceRefresh = useCallback(() => {
        setRefreshKey(prev => prev + 1);
    }, []);

    const handleNew = useCallback(() => {
        setEditingItem(null);
        setIsFormModalOpen(true);
    }, []);

    const handleEdit = useCallback((item) => {
        setEditingItem(item);
        setIsFormModalOpen(true);
    }, []);
    
    const handleSave = useCallback(async (data, itemId) => {
        try {
            if (itemId) {
                await api.patch(`/catalogo/entita/${itemId}`, data);
            } else {
                await api.post('/catalogo/entita', data);
            }
            setIsFormModalOpen(false);
            forceRefresh();
        } catch (err) {
            alert('Errore: ' + (err.response?.data?.message || err.message));
        }
    }, [forceRefresh]);

    const handleArchive = useCallback(async (item) => {
        if (!window.confirm(`Sei sicuro di voler archiviare l'entità "${item.descrizione}"?`)) {
            return;
        }
        try {
            await api.delete(`/catalogo/entita/${item.id}`);
            forceRefresh();
        } catch (err) {
            alert('Errore: ' + (err.response?.data?.message || err.message));
        }
    }, [forceRefresh]);

    const handleOpenSubManager = useCallback((type, item) => {
        setSelectedItem(item);
        switch (type) {
            case 'listini': setIsListiniModalOpen(true); break;
            case 'ean': setIsEanModalOpen(true); break;
            case 'fornitori': setIsCodiciFornitoreModalOpen(true); break;
            case 'foto': setIsFotoModalOpen(true); break;
            default: break;
        }
    }, []);

    const handlePageChange = useCallback((newPage) => {
        setCurrentPage(newPage);
    }, []);

    const handleSearchChange = useCallback((newSearchTerm) => {
        setSearchTerm(newSearchTerm);
        setCurrentPage(INITIAL_PAGE);
    }, []);

    const handleCategoryChange = useCallback((newCategoryId) => {
        setSelectedCategoryId(newCategoryId);
        setCurrentPage(INITIAL_PAGE);
    }, []);

    const handleIncludeArchivedChange = useCallback((include) => {
        setIncludeArchived(include);
        setCurrentPage(INITIAL_PAGE);
    }, []);

    // NUOVO: Funzioni per la gestione dello scanner
    const handleScan = useCallback((scannedCode) => {
        setSearchTerm(scannedCode);
        setIsScannerOpen(false);
        // handleSearchChange già si occupa di resettare la pagina a 1
    }, []);

    const handleOpenScanner = useCallback(() => {
        setIsScannerOpen(true);
    }, []);

    const handleCloseScanner = useCallback(() => {
        setIsScannerOpen(false);
    }, []);

    const columns = useMemo(() => [
        { header: 'Codice', accessorKey: 'codice_entita' },
        { header: 'Descrizione', accessorKey: 'descrizione' },
        { header: 'Categoria', accessorKey: 'nome_categoria' },
        { header: 'Stato', accessorKey: 'stato_entita' },
        { header: 'Costo Base', accessorKey: 'costo_base', cell: info => `€ ${parseFloat(info.getValue() || 0).toFixed(2)}` },
        { header: 'P. Cess. 1', accessorKey: 'prezzo_cessione_1', cell: info => info.getValue() ? `€ ${parseFloat(info.getValue()).toFixed(2)}` : 'N/D' },
        {
            header: 'Azioni',
            id: 'actions',
            cell: ({ row }) => (
                <EntityActionButtons
                    item={row.original}
                    hasPermission={hasPermission}
                    onEdit={handleEdit}
                    onArchive={handleArchive}
                    onOpenSubManager={handleOpenSubManager}
                />
            )
        }
    ], [hasPermission, handleEdit, handleArchive, handleOpenSubManager]);

    if (!hasPermission('CT_VIEW')) {
        return <div className="p-4">Accesso non autorizzato.</div>;
    }

    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <div className="p-2 sm:p-4 bg-gray-50 h-full overflow-hidden flex flex-col">
            {/* Header Principale */}
            <div className="mb-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <h1 className="text-xl font-bold">Anagrafica Catalogo</h1>
                    <button
                        type="button"
                        onClick={handleNew}
                        className="relative inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-semibold text-sm rounded-md hover:bg-blue-700 focus:z-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Nuovo
                    </button>
                </div>
                {/* MODIFICATO: Aggiunto pulsante scanner per Desktop */}
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            placeholder="Cerca per descrizione o EAN..."
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                    <select
                        value={selectedCategoryId}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="block w-full sm:w-auto px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                        <option value="">Tutte le categorie</option>
                        {supportData.categorie.map(cat => <option key={cat.id} value={cat.id}>{cat.nome_categoria}</option>)}
                    </select>
                    {/* NUOVO: Pulsante Scanner Desktop */}
                    <button
                        type="button"
                        onClick={handleOpenScanner}
                        className="ml-2 p-2 border border-gray-300 rounded-md bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="Scannerizza EAN/Barcode"
                    >
                        <QrCodeIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                        className="ml-2 p-2 border border-gray-300 rounded-md bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-expanded={isFiltersExpanded}
                    >
                        <FunnelIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                </div>
                {isFiltersExpanded && (
                    <div className="p-3 bg-white border border-gray-200 rounded-md shadow-sm">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="includeArchived"
                                checked={includeArchived}
                                onChange={(e) => handleIncludeArchivedChange(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="includeArchived" className="ml-2 text-sm text-gray-700">Mostra anche gli archiviati</label>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="flex-1 overflow-y-auto">
                {isMobile ? (
                    <MobileCatalogoView
                        data={enrichedData}
                        totalCount={totalCount}
                        isLoading={isLoading}
                        hasPermission={hasPermission}
                        onEdit={handleEdit}
                        onArchive={handleArchive}
                        onOpenSubManager={handleOpenSubManager}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        // NUOVO: Passa la funzione per aprire lo scanner alla vista mobile
                        onOpenScanner={handleOpenScanner}
                    />
                ) : (
                    <AdvancedDataGrid
                        columns={columns}
                        data={displayedData}
                        isLoading={isLoading}
                        searchConfig={{ enabled: false }}
                        pagination={{
                            currentPage,
                            totalPages,
                            onPageChange: handlePageChange,
                            totalCount
                        }}
                    />
                )}
            </div>

            {/* Modali */}
            {isFormModalOpen && <CatalogoFormModal item={editingItem} onSave={handleSave} onCancel={() => setIsFormModalOpen(false)} supportData={supportData} />}
            {isListiniModalOpen && selectedItem && <ListiniManager entita={selectedItem} onClose={() => { setIsListiniModalOpen(false); forceRefresh(); }} aliquoteIva={supportData.aliquoteIva}/>}
            {isCodiciFornitoreModalOpen && selectedItem && <CodiciFornitoreManager itemId={selectedItem.id} onClose={() => setIsCodiciFornitoreModalOpen(false)} />}
            {isEanModalOpen && selectedItem && <EanManager itemId={selectedItem.id} onClose={() => setIsEanModalOpen(false)} />}
            {isFotoModalOpen && selectedItem && <CatalogoFotoModal item={selectedItem} onClose={() => setIsFotoModalOpen(false)} />}
            
            {/* NUOVO: Modale dello Scanner */}
            {isScannerOpen && (
                <BarcodeScannerModal
                    isOpen={isScannerOpen}
                    onClose={handleCloseScanner}
                    onScan={handleScan}
                />
            )}
        </div>
    );
};

export default CatalogoManager;