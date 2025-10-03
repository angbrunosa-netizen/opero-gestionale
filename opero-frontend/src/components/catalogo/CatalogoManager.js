/**
 * @file opero-frontend/src/components/catalogo/CatalogoManager.js
 * @description Manager completo per l'anagrafica del catalogo con ricerca server-side unificata e corretta.
 * - v6.3: Riorganizzati i pulsanti di azione in un gruppo funzionale con menu dropdown.
 * @date 2025-10-03
 * @version 6.3
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import AdvancedDataGrid from '../../shared/AdvancedDataGrid';
import { PlusIcon, ArrowPathIcon, DocumentArrowUpIcon, ListBulletIcon, PencilIcon, ArchiveBoxIcon, BuildingOfficeIcon, QrCodeIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

import ImportCsvModal from './ImportCsvModal';
import ListiniManager from './ListiniManager';
import CodiciFornitoreManager from './CodiciFornitoreManager';
import EanManager from './EanManager';
import EanMassImport from './EanMassImport'; // <-- NUOVO IMPORT

// --- Sotto-Componente: Form di Creazione/Modifica (Modal) ---
const CatalogoFormModal = ({ item, onSave, onCancel, supportData }) => {
    // ... (codice del form modale invariato)
    const [formData, setFormData] = useState({});

    useEffect(() => {
        const initialState = {
            codice_entita: '',
            descrizione: '',
            id_categoria: null,
            tipo_entita: 'bene',
            id_unita_misura: null,
            id_aliquota_iva: null,
            costo_base: 0,
            gestito_a_magazzino: false,
            id_stato_entita: null,
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
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <h2 className="text-xl font-bold mb-4">{item && item.id ? 'Modifica Entità Catalogo' : 'Nuova Entità Catalogo'}</h2>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2">
                    {/* ... (contenuto del form invariato) ... */}
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
                            <input type="checkbox" id="gestito_a_magazzino" name="gestito_a_magazzino" checked={formData.gestito_a_magazzino || false} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-blue-600"/>
                            <label htmlFor="gestito_a_magazzino" className="ml-2 block text-sm text-gray-900">Gestito a Magazzino</label>
                        </div>
                    </div>
                    <div className="mt-6 pt-4 border-t flex justify-end gap-4">
                        <button type="button" onClick={onCancel} className="btn-secondary">Annulla</button>
                        <button type="submit" className="btn-primary">Salva</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Hook custom per il debouncing
const useDebounce = (value, delay) => {
    // ... (codice hook invariato)
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
    const [selectedItem, setSelectedItem] = useState(null);
    const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false); // Stato per il nuovo menu
    const actionsMenuRef = useRef(null); // Ref per chiudere il menu al click esterno
        const [isEanMassImportOpen, setIsEanMassImportOpen] = useState(false); // <-- NUOVO STATO
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    
    // ... (tutta la logica di fetching e gestione dati rimane invariata)
    useEffect(() => {
        const updateGridData = async () => {
            if (!hasPermission('CT_VIEW')) return;

            setIsLoading(true);
            try {
                let response;
                if (debouncedSearchTerm.length >= 2) {
                    console.log(`[CatalogoManager] Eseguo ricerca per: "${debouncedSearchTerm}"`);
                    response = await api.get(`/catalogo/search?term=${debouncedSearchTerm}`);
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
    
    // ... (altri gestori handleSave, handleArchive, handleOpenSubManager invariati)
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

    const handleOpenSubManager = useCallback((modalSetter, item) => {
        setSelectedItem(item);
        modalSetter(true);
    }, []);


    const columns = useMemo(() => [
        // ... (definizione colonne invariata)
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
                <div className="flex gap-2 items-center justify-end">
                    {hasPermission('CT_MANAGE') && <button onClick={() => handleEdit(row.original)} className="p-1 text-blue-600 hover:text-blue-800" title="Modifica"><PencilIcon className="h-5 w-5" /></button>}
                    {hasPermission('CT_LISTINI_VIEW') && <button onClick={() => handleOpenSubManager(setIsListiniModalOpen, row.original)} className="p-1 text-green-600 hover:text-green-800" title="Gestisci Listini"><ListBulletIcon className="h-5 w-5" /></button>}
                    {hasPermission('CT_EAN_VIEW') && <button onClick={() => handleOpenSubManager(setIsEanModalOpen, row.original)} className="p-1 text-gray-600 hover:text-gray-900" title="Gestisci EAN"><QrCodeIcon className="h-5 w-5" /></button>}
                    {hasPermission('CT_COD_FORN_VIEW') && <button onClick={() => handleOpenSubManager(setIsCodiciFornitoreModalOpen, row.original)} className="p-1 text-purple-600 hover:text-purple-800" title="Codici Fornitore"><BuildingOfficeIcon className="h-5 w-5" /></button>}
                    {hasPermission('CT_MANAGE') && row.original.codice_stato !== 'DEL' && <button onClick={() => handleArchive(row.original)} className="p-1 text-red-600 hover:text-red-800" title="Archivia"><ArchiveBoxIcon className="h-5 w-5" /></button>}
                </div>
            )
        }
    ], [hasPermission, handleEdit, handleOpenSubManager, handleArchive]);

    if (!hasPermission('CT_VIEW')) {
        return <div className="p-4">Accesso non autorizzato.</div>;
    }

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold">Anagrafica Entità Catalogo</h1>
                <div className="flex items-center gap-2">
                    <div className="flex items-center">
                        <input type="checkbox" id="includeArchived" checked={includeArchived} onChange={(e) => setIncludeArchived(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                        <label htmlFor="includeArchived" className="ml-2 text-sm text-gray-600">Mostra Archiviati</label>
                    </div>

                    {/* GRUPPO PULSANTI AZIONE */}
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
                                        {/* NUOVA VOCE DI MENU */}
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
            
            <AdvancedDataGrid
                columns={columns}
                data={displayedData}
                isLoading={isLoading}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
            />

            {isFormModalOpen && <CatalogoFormModal item={editingItem} onSave={handleSave} onCancel={() => setIsFormModalOpen(false)} supportData={supportData} />}
            {isImportModalOpen && <ImportCsvModal onClose={() => {setIsImportModalOpen(false); forceRefresh();}} onImportSuccess={forceRefresh} />}
            {isEanMassImportOpen && <EanMassImport onClose={() => setIsEanMassImportOpen(false)} onImportSuccess={forceRefresh} />}
            {isListiniModalOpen && selectedItem && <ListiniManager entita={selectedItem} onClose={() => { setIsListiniModalOpen(false); forceRefresh(); }} aliquoteIva={supportData.aliquoteIva}/>}
            {isCodiciFornitoreModalOpen && selectedItem && <CodiciFornitoreManager itemId={selectedItem.id} onClose={() => setIsCodiciFornitoreModalOpen(false)} />}
            {isEanModalOpen && selectedItem && <EanManager itemId={selectedItem.id} onClose={() => setIsEanModalOpen(false)} />}
        </div>
    );
};

export default CatalogoManager;

