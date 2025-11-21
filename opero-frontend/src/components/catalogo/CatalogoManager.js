/**
 * @file opero-frontend/src/components/catalogo/CatalogoManager.js
 * @description Manager con soluzione robusta per mobile (tabella scorrevole con colonna azioni fissa).
 * @date 2025-11-17
 * @version 8.15 (Soluzione mobile robusta)
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import AdvancedDataGrid from '../../shared/AdvancedDataGrid';
import {
    PlusIcon,
    PencilIcon,
    ArchiveBoxIcon,
    BuildingOfficeIcon,
    QrCodeIcon,
    CameraIcon,
    XMarkIcon,
    ListBulletIcon,
    MagnifyingGlassIcon,
    FunnelIcon
} from '@heroicons/react/24/outline';

import ListiniManager from './ListiniManager';
import CodiciFornitoreManager from './CodiciFornitoreManager';
import EanManager from './EanManager';
import AllegatiManager from '../../shared/AllegatiManager';

// Costanti per la paginazione
const PAGE_SIZE = 10;
const INITIAL_PAGE = 1;

// --- Sotto-Componente: Form di Creazione/Modifica (Modal) ---
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
                    <p className="text-sm text-gray-600">Prodotto: <span className="font-medium">{item.codice_entita} - {item.descrizione}</span></p>
                </div>
                <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"><XMarkIcon className="h-6 w-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
                <AllegatiManager entita_tipo="ct_catalogo" entita_id={item.id} idDitta={item.id_ditta} defaultPrivacy="public" />
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
    const [displayedData, setDisplayedData] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [supportData, setSupportData] = useState({ categorie: [], unitaMisura: [], aliquoteIva: [], statiEntita: [] });
    const [includeArchived, setIncludeArchived] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [currentPage, setCurrentPage] = useState(INITIAL_PAGE);
    const [pageSize] = useState(PAGE_SIZE);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [isListiniModalOpen, setIsListiniModalOpen] = useState(false);
    const [isCodiciFornitoreModalOpen, setIsCodiciFornitoreModalOpen] = useState(false);
    const [isEanModalOpen, setIsEanModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isFotoModalOpen, setIsFotoModalOpen] = useState(false);
    const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!hasPermission('CT_VIEW')) return;
            setIsLoading(true);
            try {
                const url = searchTerm && searchTerm.trim() !== ''
                    ? `/catalogo/search/?term=${encodeURIComponent(searchTerm.trim())}&page=${currentPage}&limit=${pageSize}&includeArchived=${includeArchived}`
                    : `/catalogo/entita?page=${currentPage}&limit=${pageSize}&includeArchived=${includeArchived}`;
                const response = await api.get(url);
                let data = [], total = 0;
                if (response.data) {
                    if (Array.isArray(response.data)) { data = response.data; total = response.data.length; }
                    else if (response.data.data && Array.isArray(response.data.data)) { data = response.data.data; total = response.data.total || response.data.data.length; }
                    else if (response.data.results && Array.isArray(response.data.results)) { data = response.data.results; total = response.data.total || response.data.results.length; }
                    else if (response.data.items && Array.isArray(response.data.items)) { data = response.data.items; total = response.data.total || response.data.items.length; }
                }
                setDisplayedData(data);
                setTotalCount(total);
            } catch (error) {
                console.error("[CatalogoManager] Errore caricamento dati:", error);
                setDisplayedData([]); setTotalCount(0);
            } finally { setIsLoading(false); }
        };
        fetchData();
    }, [searchTerm, includeArchived, currentPage, pageSize, hasPermission, refreshKey]);

    useEffect(() => {
        const fetchSupportData = async () => {
            try {
                const [catRes, umRes, ivaRes, statiRes] = await Promise.all([
                    api.get('/catalogo/categorie'), api.get('/catalogo/unita-misura'),
                    api.get('/amministrazione/iva'), api.get('/catalogo/stati-entita')
                ]);
                setSupportData({
                    categorie: catRes.data || [], unitaMisura: umRes.data?.data || [],
                    aliquoteIva: ivaRes.data?.data || [], statiEntita: statiRes.data?.data || [],
                });
            } catch (err) { console.error("Errore caricamento dati di supporto", err); }
        };
        fetchSupportData();
    }, []);

    const forceRefresh = useCallback(() => setRefreshKey(prev => prev + 1), []);
    const handleNew = useCallback(() => { setEditingItem(null); setIsFormModalOpen(true); }, []);
    const handleEdit = useCallback((item) => { setEditingItem(item); setIsFormModalOpen(true); }, []);
    const handleSave = useCallback(async (data, itemId) => {
        try { if (itemId) await api.patch(`/catalogo/entita/${itemId}`, data); else await api.post('/catalogo/entita', data); setIsFormModalOpen(false); forceRefresh(); }
        catch (err) { alert('Errore: ' + (err.response?.data?.message || err.message)); }
    }, [forceRefresh]);
    const handleArchive = useCallback(async (item) => {
        if (!window.confirm(`Sei sicuro di voler archiviare "${item.descrizione}"?`)) return;
        try { await api.delete(`/catalogo/entita/${item.id}`); forceRefresh(); }
        catch (err) { alert('Errore: ' + (err.response?.data?.message || err.message)); }
    }, [forceRefresh]);
    const handleOpenSubManager = useCallback((type, item) => {
        setSelectedItem(item);
        switch (type) { case 'listini': setIsListiniModalOpen(true); break; case 'ean': setIsEanModalOpen(true); break; case 'fornitori': setIsCodiciFornitoreModalOpen(true); break; case 'foto': setIsFotoModalOpen(true); break; default: break; }
    }, []);
    const handlePageChange = useCallback((newPage) => setCurrentPage(newPage), []);
    const handleSearchChange = useCallback((newSearchTerm) => { setSearchTerm(newSearchTerm); setCurrentPage(INITIAL_PAGE); }, []);
    const handleIncludeArchivedChange = useCallback((include) => { setIncludeArchived(include); setCurrentPage(INITIAL_PAGE); }, []);

    // FIX: Rimuoviamo tutte le direttive 'hideOnMobile' per forzare il rendering di tutte le colonne
    const columns = useMemo(() => [
        { header: 'Codice', accessorKey: 'codice_entita' },
        { header: 'Descrizione', accessorKey: 'descrizione' },
        { header: 'Categoria', accessorKey: 'nome_categoria' },
        { header: 'Stato', accessorKey: 'stato_entita' },
        { header: 'Costo Base', accessorKey: 'costo_base', cell: info => `€ ${parseFloat(info.getValue() || 0).toFixed(2)}` },
        { header: 'P. Cess. 1', accessorKey: 'prezzo_cessione_1', cell: info => info.getValue() ? `€ ${parseFloat(info.getValue()).toFixed(2)}` : 'N/D' },
        {
            header: 'Azioni', id: 'actions',
            cell: ({ row }) => <EntityActionButtons item={row.original} hasPermission={hasPermission} onEdit={handleEdit} onArchive={handleArchive} onOpenSubManager={handleOpenSubManager} />
        }
    ], [hasPermission, handleEdit, handleArchive, handleOpenSubManager]);

    if (!hasPermission('CT_VIEW')) return <div className="p-4">Accesso non autorizzato.</div>;
    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <div className="p-2 sm:p-4 bg-gray-50 h-full overflow-hidden flex flex-col">
            <div className="mb-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <h1 className="text-xl font-bold">Anagrafica Catalogo</h1>
                    <button onClick={handleNew} className="relative inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-semibold text-sm rounded-md hover:bg-blue-700 focus:z-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto">
                        <PlusIcon className="h-5 w-5 mr-2" /> Nuovo
                    </button>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="relative flex">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </div>
                            <input type="text" value={searchTerm} onChange={(e) => handleSearchChange(e.target.value)} placeholder="Cerca per descrizione..." className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>
                        <button onClick={() => setIsFiltersExpanded(!isFiltersExpanded)} className="ml-2 p-2 border border-gray-300 rounded-md bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-expanded={isFiltersExpanded}>
                            <FunnelIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </div>
                    {isFiltersExpanded && (
                        <div className="p-3 bg-white border border-gray-200 rounded-md shadow-sm">
                            <div className="flex items-center">
                                <input type="checkbox" id="includeArchived" checked={includeArchived} onChange={(e) => handleIncludeArchivedChange(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <label htmlFor="includeArchived" className="ml-2 text-sm text-gray-700">Mostra anche gli archiviati</label>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* FIX: Contenitore che permette lo scroll orizzontale su mobile */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden">
                <AdvancedDataGrid
                    columns={columns}
                    data={displayedData}
                    isLoading={isLoading}
                    searchConfig={{ enabled: false }}
                    pagination={{ currentPage, totalPages, onPageChange: handlePageChange, totalCount }}
                    // FIX: Rimuoviamo la prop mobileOptimizations
                />
            </div>
            
            {isFormModalOpen && <CatalogoFormModal item={editingItem} onSave={handleSave} onCancel={() => setIsFormModalOpen(false)} supportData={supportData} />}
            {isListiniModalOpen && selectedItem && <ListiniManager entita={selectedItem} onClose={() => { setIsListiniModalOpen(false); forceRefresh(); }} aliquoteIva={supportData.aliquoteIva}/>}
            {isCodiciFornitoreModalOpen && selectedItem && <CodiciFornitoreManager itemId={selectedItem.id} onClose={() => setIsCodiciFornitoreModalOpen(false)} />}
            {isEanModalOpen && selectedItem && <EanManager itemId={selectedItem.id} onClose={() => setIsEanModalOpen(false)} />}
            {isFotoModalOpen && selectedItem && <CatalogoFotoModal item={selectedItem} onClose={() => setIsFotoModalOpen(false)} />}
            
            {/* Stili CSS per la colonna azioni fissa su mobile */}
            <style>{`
                @media (max-width: 640px) {
                    [role="row"] > div:last-child {
                        display: table-cell !important;
                        position: sticky !important;
                        right: 0px !important;
                        background-color: #f9fafb !important;
                        padding-left: 0.5rem !important;
                        padding-right: 0.5rem !important;
                        z-index: 10 !important;
                        min-width: 120px !important;
                        text-align: right !important;
                        vertical-align: middle !important;
                    }
                    [role="rowgroup"] > [role="row"]:first-child > div:last-child {
                        display: table-cell !important;
                        position: sticky !important;
                        right: 0px !important;
                        background-color: #f3f4f6 !important;
                        z-index: 11 !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default CatalogoManager;