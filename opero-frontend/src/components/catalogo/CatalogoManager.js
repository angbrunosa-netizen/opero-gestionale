/**
 * @file opero-frontend/src/components/catalogo/CatalogoManager.js
 * @description Manager completo per l'anagrafica del catalogo.
 * - v7.1: Corretto 'entita_tipo' in 'ct_catalogo' per coerenza
 * con il database (richiesta utente).
 * @date 2025-11-11
 * @version 7.1 (Fix entita_tipo)
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import AdvancedDataGrid from '../../shared/AdvancedDataGrid';
// (MODIFICATO v6.9) Aggiunte CameraIcon e XMarkIcon
import { 
    PlusIcon, ArrowPathIcon, DocumentArrowUpIcon, ListBulletIcon, 
    PencilIcon, ArchiveBoxIcon, BuildingOfficeIcon, QrCodeIcon, 
    ChevronDownIcon, MagnifyingGlassIcon, CameraIcon, XMarkIcon 
} from '@heroicons/react/24/outline';

import ImportCsvModal from './ImportCsvModal';
import ListiniManager from './ListiniManager';
import CodiciFornitoreManager from './CodiciFornitoreManager';
import EanManager from './EanManager';
import EanMassImport from './EanMassImport';

// --- (CORRETTO v7.0) ---
// Import di AllegatiManager spostato qui per la regola 'import/first'
import AllegatiManager from '../../shared/AllegatiManager';

// --- Sotto-Componente: Form di Creazione/Modifica (Modal) ---
const CatalogoFormModal = ({ item, onSave, onCancel, supportData }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        const initialState = {
            // Dati principali
            codice_entita: '',
            descrizione: '',
            id_categoria: null,
            tipo_entita: 'bene',
            id_unita_misura: null,
            id_aliquota_iva: null,
            costo_base: 0,
            gestito_a_magazzino: false,
            id_stato_entita: null,
            // Dati logistici
            peso_lordo_pz: 0,
            volume_pz: 0,
            h_pz: 0,
            l_pz: 0,
            p_pz: 0,
            s_im: 0,
            pezzi_per_collo: 0,
            colli_per_strato: 0,
            strati_per_pallet: 0,
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
        let options = [];
        nodes.forEach(node => {
            options.push(
                <option key={node.id} value={node.id}>
                    {'\u00A0'.repeat(depth * 4)} {node.codice_categoria} - {node.nome_categoria}
                </option>
            );
            if (node.children && node.children.length > 0) {
                options = options.concat(renderCategoryOptions(node.children, depth + 1));
            }
        });
        return options;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            {/* (MODIFICATO v6.9) Riportato a max-w-4xl */}
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <h2 className="text-xl font-bold mb-4">{item && item.id ? 'Modifica Entità Catalogo' : 'Nuova Entità Catalogo'}</h2>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2 space-y-4">
                    
                    {/* --- SEZIONE DATI ANAGRAFICI --- */}
                    <div className="p-4 border rounded-md">
                        <h3 className="text-lg font-semibold mb-3 text-gray-700">Dati Anagrafici</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="codice_entita" className="block text-sm font-medium text-gray-700">Codice</label>
                                <input type="text" name="codice_entita" value={formData.codice_entita || ''} onChange={handleChange} required disabled={!!(item && item.id)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm disabled:bg-gray-100" />
                            </div>
                            <div>
                                <label htmlFor="descrizione" className="block text-sm font-medium text-gray-700">Descrizione</label>
                                <input type="text" name="descrizione" value={formData.descrizione || ''} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                            </div>
                            <div className="col-span-2">
                                <label htmlFor="id_categoria" className="block text-sm font-medium text-gray-700">Categoria</label>
                                <select name="id_categoria" value={formData.id_categoria || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                    <option value="">-- Seleziona --</option>
                                    {supportData.categorie && renderCategoryOptions(supportData.categorie)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="costo_base" className="block text-sm font-medium text-gray-700">Costo Base</label>
                                <input type="number" step="0.01" name="costo_base" value={formData.costo_base || 0} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                            </div>
                            <div>
                               <label htmlFor="id_aliquota_iva" className="block text-sm font-medium text-gray-700">Aliquota IVA</label>
                                <select name="id_aliquota_iva" value={formData.id_aliquota_iva || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                    <option value="">-- Seleziona --</option>
                                    {supportData.aliquoteIva?.map(iva => <option key={iva.id} value={iva.id}>{iva.descrizione}</option>)}
                                </select>
                            </div>
                            <div>
                               <label htmlFor="id_unita_misura" className="block text-sm font-medium text-gray-700">Unità di Misura</label>
                                <select name="id_unita_misura" value={formData.id_unita_misura || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                    <option value="">-- Seleziona --</option>
                                    {supportData.unitaMisura?.map(um => <option key={um.id} value={um.id}>{um.sigla_um}</option>)}
                                </select>
                            </div>
                            <div>
                               <label htmlFor="id_stato_entita" className="block text-sm font-medium text-gray-700">Stato</label>
                                <select name="id_stato_entita" value={formData.id_stato_entita || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                    <option value="">-- Seleziona --</option>
                                    {supportData.statiEntita?.map(stato => <option key={stato.id} value={stato.id}>{stato.descrizione}</option>)}
                                </select>
                            </div>
                             <div className="col-span-2 flex items-center">
                                <input type="checkbox" id="gestito_a_magazzino" name="gestito_a_magazzino" checked={formData.gestito_a_magazzino || false} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                                <label htmlFor="gestito_a_magazzino" className="ml-2 block text-sm text-gray-900">Gestito a Magazzino</label>
                            </div>
                        </div>
                    </div>

                    {/* --- SEZIONE DATI LOGISTICI (CONDIZIONALE) --- */}
                    {formData.gestito_a_magazzino && (
                        <div className="p-4 border rounded-md bg-gray-50">
                            <h3 className="text-lg font-semibold mb-3 text-gray-700">Dati Logistici</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="peso_lordo_pz" className="block text-sm font-medium text-gray-700">Peso Lordo (Kg)</label>
                                    <input type="number" step="0.001" name="peso_lordo_pz" value={formData.peso_lordo_pz || 0} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                                </div>
                                <div>
                                    <label htmlFor="volume_pz" className="block text-sm font-medium text-gray-700">Volume (m³)</label>
                                    <input type="number" step="0.000001" name="volume_pz" value={formData.volume_pz || 0} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                                </div>
                                <div>
                                    <label htmlFor="s_im" className="block text-sm font-medium text-gray-700">Pz. per Sottoimballo</label>
                                    <input type="number" name="s_im" value={formData.s_im || 0} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                                </div>
                                <div>
                                    <label htmlFor="l_pz" className="block text-sm font-medium text-gray-700">Larghezza (cm)</label>
                                    <input type="number" step="0.01" name="l_pz" value={formData.l_pz || 0} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                                </div>
                                <div>
                                    <label htmlFor="p_pz" className="block text-sm font-medium text-gray-700">Profondità (cm)</label>
                                    <input type="number" step="0.01" name="p_pz" value={formData.p_pz || 0} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                                </div>
                                <div>
                                    <label htmlFor="h_pz" className="block text-sm font-medium text-gray-700">Altezza (cm)</label>
                                    <input type="number" step="0.01" name="h_pz" value={formData.h_pz || 0} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                                </div>
                                 <div>
                                    <label htmlFor="pezzi_per_collo" className="block text-sm font-medium text-gray-700">Pezzi per Collo</label>
                                    <input type="number" name="pezzi_per_collo" value={formData.pezzi_per_collo || 0} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                                </div>
                                <div>
                                    <label htmlFor="colli_per_strato" className="block text-sm font-medium text-gray-700">Colli per Strato</label>
                                    <input type="number" name="colli_per_strato" value={formData.colli_per_strato || 0} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                                </div>
                                <div>
                                    <label htmlFor="strati_per_pallet" className="block text-sm font-medium text-gray-700">Strati per Pallet</label>
                                    <input type="number" name="strati_per_pallet" value={formData.strati_per_pallet || 0} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- (RIMOSSO v6.9) La sezione Gestione Immagini non è più qui --- */}

                    <div className="mt-6 pt-4 border-t flex justify-end gap-4">
                        <button type="button" onClick={onCancel} className="btn-secondary">Annulla</button>
                        <button type="submit" className="btn-primary">Salva</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- (NUOVO SOTTO-COMPONENTE v6.9) ---
// Modale dedicato ESCLUSIVAMENTE alla gestione delle foto
// (L'import è stato spostato in cima al file - v7.0)

const CatalogoFotoModal = ({ item, onClose }) => {
  return (
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
                {/* --- (CORREZIONE v7.1) --- */}
                <AllegatiManager
                    entita_tipo="ct_catalogo"
                    entita_id={item.id}
                />
                {/* --- FINE CORREZIONE --- */}
            </div>
        </div>
    </div>
  );
};
// --- FINE NUOVO SOTTO-COMPONENTE ---


// --- Componente per i pulsanti di azione nella vista Desktop ---
const EntityActionButtons = ({ item, hasPermission, onEdit, onArchive, onOpenSubManager }) => (
    <div className="flex gap-2 items-center justify-end">
        {hasPermission('CT_MANAGE') && <button onClick={() => onEdit(item)} className="p-1 text-blue-600 hover:text-blue-800" title="Modifica"><PencilIcon className="h-5 w-5" /></button>}
        
        {/* --- (NUOVO PULSANTE v6.9) --- */}
        {hasPermission('CT_MANAGE') && <button onClick={() => onOpenSubManager('foto', item)} className="p-1 text-teal-600 hover:text-teal-800" title="Gestisci Foto"><CameraIcon className="h-5 w-5" /></button>}
        
        {hasPermission('CT_LISTINI_VIEW') && <button onClick={() => onOpenSubManager('listini', item)} className="p-1 text-green-600 hover:text-green-800" title="Gestisci Listini"><ListBulletIcon className="h-5 w-5" /></button>}
        {hasPermission('CT_EAN_VIEW') && <button onClick={() => onOpenSubManager('ean', item)} className="p-1 text-gray-600 hover:text-gray-900" title="Gestisci EAN"><QrCodeIcon className="h-5 w-5" /></button>}
        {hasPermission('CT_COD_FORN_VIEW') && <button onClick={() => onOpenSubManager('fornitori', item)} className="p-1 text-purple-600 hover:text-purple-800" title="Codici Fornitore"><BuildingOfficeIcon className="h-5 w-5" /></button>}
        {hasPermission('CT_MANAGE') && item.codice_stato !== 'DEL' && <button onClick={() => onArchive(item)} className="p-1 text-red-600 hover:text-red-800" title="Archivia"><ArchiveBoxIcon className="h-5 w-5" /></button>}
    </div>
);

// --- Componente per i pulsanti di azione nella vista Mobile ---
const MobileEntityActionButtons = ({ item, hasPermission, onEdit, onArchive, onOpenSubManager }) => (
    <div className="flex flex-wrap gap-2 justify-end mt-4 pt-4 border-t border-gray-200">
        {hasPermission('CT_MANAGE') && <button onClick={() => onEdit(item)} className="flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm font-medium" title="Modifica"><PencilIcon className="h-4 w-4" /> Modifica</button>}
        
        {/* --- (NUOVO PULSANTE v6.9) --- */}
        {hasPermission('CT_MANAGE') && <button onClick={() => onOpenSubManager('foto', item)} className="flex items-center gap-1 px-3 py-2 bg-teal-100 text-teal-700 rounded-md hover:bg-teal-200 text-sm font-medium" title="Gestisci Foto"><CameraIcon className="h-4 w-4" /> Foto</button>}

        {hasPermission('CT_LISTINI_VIEW') && <button onClick={() => onOpenSubManager('listini', item)} className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm font-medium" title="Gestisci Listini"><ListBulletIcon className="h-4 w-4" /> Listini</button>}
        {hasPermission('CT_EAN_VIEW') && <button onClick={() => onOpenSubManager('ean', item)} className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium" title="Gestisci EAN"><QrCodeIcon className="h-4 w-4" /> EAN</button>}
        {hasPermission('CT_COD_FORN_VIEW') && <button onClick={() => onOpenSubManager('fornitori', item)} className="flex items-center gap-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 text-sm font-medium" title="Codici Fornitore"><BuildingOfficeIcon className="h-4 w-4" /> Fornitori</button>}
        {hasPermission('CT_MANAGE') && item.codice_stato !== 'DEL' && <button onClick={() => onArchive(item)} className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm font-medium" title="Archivia"><ArchiveBoxIcon className="h-4 w-4" /> Archivia</button>}
    </div>
);

// --- Hook custom per il debouncing ---
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => { clearTimeout(handler); };
    }, [value, delay]);
    return debouncedValue;
};

// --- Componente Principale ---
const CatalogoManager = () => {
    const { hasPermission } = useAuth();
    
    // STATI DI GESTIONE DATI
    const [displayedData, setDisplayedData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [supportData, setSupportData] = useState({ categorie: [], unitaMisura: [], aliquoteIva: [], statiEntita: [] });
    const [includeArchived, setIncludeArchived] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    
    // STATI DI GESTIONE UI (MODALI)
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isListiniModalOpen, setIsListiniModalOpen] = useState(false);
    const [isCodiciFornitoreModalOpen, setIsCodiciFornitoreModalOpen] = useState(false);
    const [isEanModalOpen, setIsEanModalOpen] = useState(false);
    const [isEanMassImportOpen, setIsEanMassImportOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
    const actionsMenuRef = useRef(null);
    
    // --- (NUOVO STATO v6.9) ---
    const [isFotoModalOpen, setIsFotoModalOpen] = useState(false);


    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    
    // Effetto unificato per caricare/cercare dati per la griglia
    useEffect(() => {
        const updateGridData = async () => {
            if (!hasPermission('CT_VIEW')) return;

            setIsLoading(true);
            try {
                let response;
                if (debouncedSearchTerm.length >= 2) {
                    console.log(`[CatalogoManager] Eseguo ricerca per: "${debouncedSearchTerm}"`);
                    response = await api.get(`/catalogo/search/?term=${debouncedSearchTerm}`);
                    setDisplayedData(response.data || []);
                } else {
                    console.log("[CatalogoManager] Carico lista completa...");
                    response = await api.get(`/catalogo/entita?includeArchived=${includeArchived}`);
                    setDisplayedData(response.data.data || []);
                }
            } catch (error) {
                console.error("Errore durante l'aggiornamento dei dati:", error);
                setDisplayedData([]);
            } finally {
                setIsLoading(false);
            }
        };

        updateGridData();
    }, [debouncedSearchTerm, includeArchived, hasPermission, refreshTrigger]);

    // Effetto per caricare i dati di supporto (es. categorie), solo una volta
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
                    categorie: catRes.data,
                    unitaMisura: umRes.data.data,
                    aliquoteIva: ivaRes.data.data,
                    statiEntita: statiRes.data.data,
                });
            } catch (err) {
                console.error("Errore nel caricamento dei dati di supporto", err);
            }
        };
        fetchSupportData();
    }, []);

    // Gestione chiusura menu dropdown al click esterno
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target)) {
                setIsActionsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const forceRefresh = () => setRefreshTrigger(t => t + 1);

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
    }, []);

    const handleArchive = useCallback(async (item) => {
        if (window.confirm(`Sei sicuro di voler archiviare l'entità "${item.descrizione}"?`)) {
            try {
                await api.delete(`/catalogo/entita/${item.id}`);
                forceRefresh();
            } catch (err) {
                alert('Errore: ' + (err.response?.data?.message || err.message));
            }
        }
    }, []);

    // Gestore unificato per l'apertura delle sottomodali
    const handleOpenSubManager = useCallback((type, item) => {
        setSelectedItem(item);
        switch (type) {
            case 'listini': setIsListiniModalOpen(true); break;
            case 'ean': setIsEanModalOpen(true); break;
            case 'fornitori': setIsCodiciFornitoreModalOpen(true); break;
            // --- (NUOVA CASE v6.9) ---
            case 'foto': setIsFotoModalOpen(true); break;
            default: break;
        }
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

    return (
        <div className="p-4 bg-gray-50 h-full overflow-hidden flex flex-col">
            {/* Header Principale */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
                <h1 className="text-xl font-bold">Anagrafica Entità Catalogo</h1>
                <div className="flex items-center gap-2">
                    <div className="flex items-center">
                        <input type="checkbox" id="includeArchived" checked={includeArchived} onChange={(e) => setIncludeArchived(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                        <label htmlFor="includeArchived" className="ml-2 text-sm text-gray-600">Mostra Archiviati</label>
                    </div>

                    <div className="flex items-center rounded-md shadow-sm">
                        {hasPermission('CT_MANAGE') && (
                            <button
                                type="button"
                                onClick={handleNew}
                                className="relative inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold text-sm rounded-l-md hover:bg-blue-700 focus:z-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <PlusIcon className="h-5 w-5 mr-2" />
                                Nuovo
                            </button>
                        )}
                        <div ref={actionsMenuRef} className="relative">
                            <button
                                type="button"
                                onClick={() => setIsActionsMenuOpen(!isActionsMenuOpen)}
                                className="relative inline-flex items-center px-2 py-2 bg-white text-gray-500 rounded-r-md border border-gray-300 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <ChevronDownIcon className="h-5 w-5" />
                            </button>
                            {isActionsMenuOpen && (
                                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                                    <div className="py-1" role="menu" aria-orientation="vertical">
                                        {hasPermission('CT_IMPORT_CSV') && (
                                            <a href="#" onClick={(e) => { e.preventDefault(); setIsImportModalOpen(true); setIsActionsMenuOpen(false); }} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                                                <DocumentArrowUpIcon className="h-5 w-5 mr-3 text-gray-400" />
                                                Importa Catalogo
                                            </a>
                                        )}
                                        {hasPermission('CT_EAN_MANAGE') && (
                                            <a href="#" onClick={(e) => { e.preventDefault(); setIsEanMassImportOpen(true); setIsActionsMenuOpen(false); }} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                                                <QrCodeIcon className="h-5 w-5 mr-3 text-gray-400" />
                                                Importa EAN Multipli
                                            </a>
                                        )}
                                        <a href="#" onClick={(e) => { e.preventDefault(); forceRefresh(); setIsActionsMenuOpen(false); }} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                                            <ArrowPathIcon className="h-5 w-5 mr-3 text-gray-400" />
                                            Ricarica Dati
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Barra di Ricerca Persistente */}
            <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cerca per codice o descrizione..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
            </div>
            
            {/* Area del contenuto scrollabile */}
            <div className="flex-1 overflow-y-auto">
                {/* VISTA DESKTOP: Tabella */}
                <div className="hidden md:block h-full">
                    <AdvancedDataGrid
                        columns={columns}
                        data={displayedData}
                        isLoading={isLoading}
                    />
                </div>

                {/* VISTA MOBILE: Card */}
                <div className="md:hidden space-y-4">
                    {isLoading && <div className="text-center p-4">Caricamento...</div>}
                    {!isLoading && displayedData.length === 0 && <div className="text-center p-4 text-gray-500">Nessuna entità trovata.</div>}
                    {!isLoading && displayedData.map(item => (
                        <div key={item.id} className="p-4 bg-white rounded-lg shadow border border-gray-200">
                            <div className="flex justify-between items-start">
                                <div className="flex-1 pr-2">
                                    <h3 className="text-lg font-semibold text-gray-900 leading-tight">{item.descrizione}</h3>
                                    <p className="text-sm text-gray-500 mt-1">Codice: {item.codice_entita}</p>
                                </div>
                                <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full whitespace-nowrap">{item.stato_entita}</span>
                            </div>
                            <div className="mt-3 space-y-1 text-sm text-gray-600">
                                <p><span className="font-medium">Categoria:</span> {item.nome_categoria}</p>
                                <p><span className="font-medium">Costo Base:</span> € {parseFloat(item.costo_base || 0).toFixed(2)}</p>
                                <p><span className="font-medium">P. Cess. 1:</span> {item.prezzo_cessione_1 ? `€ ${parseFloat(item.prezzo_cessione_1).toFixed(2)}` : 'N/D'}</p>
                            </div>
                            <MobileEntityActionButtons
                                item={item}
                                hasPermission={hasPermission}
                                onEdit={handleEdit}
                                onArchive={handleArchive}
                                onOpenSubManager={handleOpenSubManager}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Modali */}
            {isFormModalOpen && <CatalogoFormModal item={editingItem} onSave={handleSave} onCancel={() => setIsFormModalOpen(false)} supportData={supportData} />}
            {isImportModalOpen && <ImportCsvModal onClose={() => {setIsImportModalOpen(false); forceRefresh();}} onImportSuccess={forceRefresh} />}
            
            {isEanMassImportOpen && <EanMassImport onClose={() => setIsEanMassImportOpen(false)} onImportSuccess={forceRefresh} />}
                                    
            {isListiniModalOpen && selectedItem && <ListiniManager entita={selectedItem} onClose={() => { setIsListiniModalOpen(false); forceRefresh(); }} aliquoteIva={supportData.aliquoteIva}/>}
            {isCodiciFornitoreModalOpen && selectedItem && <CodiciFornitoreManager itemId={selectedItem.id} onClose={() => setIsCodiciFornitoreModalOpen(false)} />}
            {isEanModalOpen && selectedItem && <EanManager itemId={selectedItem.id} onClose={() => setIsEanModalOpen(false)} />}
            
            {/* --- (NUOVO MODALE v6.9) --- */}
            {isFotoModalOpen && selectedItem && <CatalogoFotoModal item={selectedItem} onClose={() => setIsFotoModalOpen(false)} />}
        </div>
    );
};

export default CatalogoManager;