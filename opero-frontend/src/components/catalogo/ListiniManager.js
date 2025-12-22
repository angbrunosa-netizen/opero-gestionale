import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import AdvancedDataGrid from '../../shared/AdvancedDataGrid';
import { PlusIcon, ArrowPathIcon, XMarkIcon, PencilIcon, TrashIcon, CalculatorIcon } from '@heroicons/react/24/solid';

// --- Sotto-Componente: Form di Creazione/Modifica Listino ---
const ListinoFormModal = ({ listino, onSave, onCancel, entita, aliquotaIva }) => {
    const [formData, setFormData] = useState({});
    const [simulationCostoBase, setSimulationCostoBase] = useState(0);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);

    useEffect(() => {
        const initialState = { nome_listino: '', data_inizio_validita: new Date().toISOString().slice(0, 10), data_fine_validita: null };
        for (let i = 1; i <= 6; i++) { 
            initialState[`ricarico_cessione_${i}`] = 0; 
            initialState[`prezzo_cessione_${i}`] = 0; 
            initialState[`ricarico_pubblico_${i}`] = 0; 
            initialState[`prezzo_pubblico_${i}`] = 0; 
        }
        setFormData(listino ? { ...initialState, ...listino } : initialState);
        setSimulationCostoBase(entita?.costo_base || 0);
    }, [listino, entita]);

    const handleChange = (e) => { 
        const { name, value } = e.target; 
        setFormData(prev => ({ ...prev, [name]: value === '' ? null : value }));
    };

    const calculatePrice = (costoBase, ricarico, aliquotaIva) => {
        const prezzoCessione = costoBase * (1 + (ricarico || 0) / 100);
        const prezzoPubblico = prezzoCessione * (1 + (aliquotaIva || 0) / 100) * (1 + (ricarico || 0) / 100);
        return { 
            prezzoCessione: Math.round(prezzoCessione * 10000) / 10000, // Arrotondato a 4 cifre
            prezzoPubblico: Math.round(prezzoPubblico * 100) / 100 // Arrotondato a 2 cifre
        };
    };

    const handleRicaricoChange = (index, type, value) => {
        const ricaricoFieldName = type === 'cessione' ? `ricarico_cessione_${index}` : `ricarico_pubblico_${index}`;
        const prezzoFieldName = type === 'cessione' ? `prezzo_cessione_${index}` : `prezzo_pubblico_${index}`;
        
        // Aggiorna la percentuale di ricarico
        setFormData(prev => ({ ...prev, [ricaricoFieldName]: value === '' ? 0 : parseFloat(value) }));
        
        // Calcola e aggiorna il prezzo corrispondente
        const { prezzoCessione, prezzoPubblico } = calculatePrice(
            simulationCostoBase, 
            type === 'cessione' ? parseFloat(value) : formData[`ricarico_cessione_${index}`] || 0,
            aliquotaIva
        );
        
        setFormData(prev => ({ 
            ...prev, 
            [prezzoFieldName]: type === 'cessione' ? prezzoCessione : prezzoPubblico 
        }));
    };

    const handlePrezzoChange = (index, type, value) => {
        const fieldName = type === 'cessione' ? `prezzo_cessione_${index}` : `prezzo_pubblico_${index}`;
        setFormData(prev => ({ ...prev, [fieldName]: value === '' ? 0 : parseFloat(value) }));
    };

    const calculateAllPrices = (index) => {
        const ricaricoCessione = formData[`ricarico_cessione_${index}`] || 0;
        const { prezzoCessione, prezzoPubblico } = calculatePrice(simulationCostoBase, ricaricoCessione, aliquotaIva);
        
        setFormData(prev => ({
            ...prev,
            [`prezzo_cessione_${index}`]: prezzoCessione,
            [`prezzo_pubblico_${index}`]: prezzoPubblico
        }));
    };

const validatePrices = () => {
    const errors = [];
    const costoBase = parseFloat(simulationCostoBase) || 0;
    
    for (let i = 1; i <= 6; i++) {
        const prezzoCessione = parseFloat(formData[`prezzo_cessione_${i}`]) || 0;
        const prezzoPubblico = parseFloat(formData[`prezzo_pubblico_${i}`]) || 0;
        const iva = parseFloat(aliquotaIva) || 0;
        
        // Verifica che il prezzo di cessione sia >= costo base
        if (prezzoCessione < costoBase) {
            errors.push(`Listino ${i}: Prezzo di cessione (${prezzoCessione.toFixed(2)}€) inferiore al costo base (${costoBase.toFixed(2)}€)`);
        }
        
        // Verifica che il prezzo al pubblico sia >= prezzo di cessione + IVA
        const prezzoCessioneConIva = prezzoCessione * (1 + iva / 100);
        if (prezzoPubblico < prezzoCessioneConIva) {
            errors.push(`Listino ${i}: Prezzo al pubblico (${prezzoPubblico.toFixed(2)}€) inferiore al prezzo di cessione + IVA (${prezzoCessioneConIva.toFixed(2)}€)`);
        }
    }
    
    return errors;
};
    const handleSubmit = async (e) => { 
        e.preventDefault();
        
        const errors = validatePrices();
        if (errors.length > 0) {
            setValidationErrors(errors);
            setShowConfirmDialog(true);
            return;
        }
        
        onSave(formData, listino ? listino.id : null);
    };

    const handleConfirmSave = () => {
        setShowConfirmDialog(false);
        setValidationErrors([]);
        onSave(formData, listino ? listino.id : null);
    };

    const handleCancelSave = () => {
        setShowConfirmDialog(false);
        setValidationErrors([]);
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[60]">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                <h2 className="text-xl font-bold mb-4">{listino ? 'Modifica Listino' : 'Nuovo Listino'}</h2>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pb-4 border-b">
                        <div><label className="text-sm font-medium">Nome Listino</label><input type="text" name="nome_listino" value={formData.nome_listino || ''} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/></div>
                        <div><label className="text-sm font-medium">Inizio Validità</label><input type="date" name="data_inizio_validita" value={formData.data_inizio_validita ? new Date(formData.data_inizio_validita).toISOString().slice(0,10) : ''} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/></div>
                        <div><label className="text-sm font-medium">Fine Validità (opzionale)</label><input type="date" name="data_fine_validita" value={formData.data_fine_validita ? new Date(formData.data_fine_validita).toISOString().slice(0,10) : ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/></div>
                    </div>
                    <div className="mb-6 p-3 bg-indigo-50 rounded-lg flex items-center justify-center gap-4">
                        <label htmlFor="simulationCostoBase" className="text-sm font-medium text-indigo-800">Costo Base di Calcolo:</label>
                        <input type="number" step="0.01" id="simulationCostoBase" value={simulationCostoBase} onChange={(e) => setSimulationCostoBase(parseFloat(e.target.value) || 0)} className="w-32 text-lg font-bold text-indigo-900 bg-white border border-indigo-200 rounded-md text-center p-1"/>
                        <button type="button" onClick={() => setSimulationCostoBase(entita?.costo_base || 0)} title="Ripristina al costo base originale dell'entità" className="p-2 text-indigo-600 hover:text-indigo-800 rounded-full hover:bg-indigo-100"><ArrowPathIcon className="h-5 w-5" /></button>
                    </div>
                    <div className="space-y-3">{[...Array(6)].map((_, i) => { const index = i + 1; return (<div key={index} className="grid grid-cols-5 gap-3 items-center p-3 border rounded-lg bg-gray-50">
                        <div className="font-bold text-gray-700">Listino {index}</div>
                        
                        <div>
                            <label className="text-xs font-medium text-gray-500">Ric. Cessione %</label>
                            <input 
                                type="number" 
                                step="0.01" 
                                value={formData[`ricarico_cessione_${index}`] || 0} 
                                onChange={(e) => handleRicaricoChange(index, 'cessione', e.target.value)}
                                className="mt-1 block w-full text-sm rounded-md border-gray-300"
                            />
                        </div>
                        
                        <div>
                            <label className="text-xs font-medium text-gray-500">P. Cessione</label>
                            <input 
                                type="number" 
                                step="0.01" 
                                value={formData[`prezzo_cessione_${index}`] || 0} 
                                onChange={(e) => handlePrezzoChange(index, 'cessione', e.target.value)}
                                className="mt-1 block w-full text-sm rounded-md border-gray-300"
                            />
                        </div>
                        
                        <div>
                            <label className="text-xs font-medium text-gray-500">Ric. Pubblico %</label>
                            <input 
                                type="number" 
                                step="0.01" 
                                value={formData[`ricarico_pubblico_${index}`] || 0} 
                                onChange={(e) => handleRicaricoChange(index, 'pubblico', e.target.value)}
                                className="mt-1 block w-full text-sm rounded-md border-gray-300"
                            />
                        </div>
                        
                        <div>
                            <label className="text-xs font-medium text-gray-500">P. Pubblico (IVA incl.)</label>
                            <input 
                                type="number" 
                                step="0.01" 
                                value={formData[`prezzo_pubblico_${index}`] || 0} 
                                onChange={(e) => handlePrezzoChange(index, 'pubblico', e.target.value)}
                                className="mt-1 block w-full text-sm rounded-md border-gray-300"
                            />
                        </div>
                        
                        <div className="flex items-end">
                            <button 
                                type="button"
                                onClick={() => calculateAllPrices(index)}
                                title="Calcola prezzi automaticamente"
                                className="p-2 text-blue-600 hover:text-blue-800 rounded-md hover:bg-blue-50"
                            >
                                <CalculatorIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>); })}</div>
                    <div className="mt-6 pt-4 border-t flex justify-end gap-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-md">Annulla</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Salva</button>
                    </div>
                </form>
            </div>

            {/* Dialog di conferma per errori di validazione */}
            {showConfirmDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold mb-4 text-red-600">Attenzione: Prezzi non validi</h3>
                        <div className="mb-4 max-h-48 overflow-y-auto">
                            {validationErrors.map((error, index) => (
                                <p key={index} className="text-sm text-gray-700 mb-2">{error}</p>
                            ))}
                        </div>
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={handleCancelSave}
                                className="px-4 py-2 bg-gray-200 rounded-md"
                            >
                                Annulla
                            </button>
                            <button 
                                onClick={handleConfirmSave}
                                className="px-4 py-2 bg-red-600 text-white rounded-md"
                            >
                                Conferma e Salva
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// NUOVO: Componente per i pulsanti di azione nella vista Desktop
const ListinoActionButtons = ({ item, hasPermission, onEdit, onDelete }) => (
    <div className="flex gap-2">
        {hasPermission('CT_LISTINI_MANAGE') && (
            <>
                <button onClick={() => onEdit(item)} className="p-1 text-blue-600 hover:text-blue-800" title="Modifica"><PencilIcon className="h-5 w-5"/></button>
                <button onClick={() => onDelete(item)} className="p-1 text-red-600 hover:text-red-800" title="Elimina"><TrashIcon className="h-5 w-5"/></button>
            </>
        )}
    </div>
);

// NUOVO: Componente per i pulsanti di azione nella vista Mobile
const MobileListinoActionButtons = ({ item, hasPermission, onEdit, onDelete }) => (
    <div className="flex flex-wrap gap-2 justify-end mt-4 pt-4 border-t border-gray-200">
        {hasPermission('CT_LISTINI_MANAGE') && (
            <>
                <button onClick={() => onEdit(item)} className="flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm font-medium" title="Modifica"><PencilIcon className="h-4 w-4" /> Modifica</button>
                <button onClick={() => onDelete(item)} className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm font-medium" title="Elimina"><TrashIcon className="h-4 w-4" /> Elimina</button>
            </>
        )}
    </div>
);


// --- Componente Principale: Gestore Listini ---
const ListiniManager = ({ entita, onClose, aliquoteIva }) => {
    const { hasPermission } = useAuth();
    const [listini, setListini] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingListino, setEditingListino] = useState(null);

    const aliquotaCorrente = useMemo(() => { if (!entita || !aliquoteIva) return 0; const iva = aliquoteIva.find(i => i.id === entita.id_aliquota_iva); return iva ? parseFloat(iva.aliquota) : 0; }, [entita, aliquoteIva]);

    const fetchListini = useCallback(async () => {
        if (!entita?.id) return;
        setLoading(true);
        try {
            const response = await api.get(`/catalogo/entita/${entita.id}/listini`);
            setListini(response.data.data || []);
            setError(null);
        } catch (err) {
            setError('Errore nel caricamento dei listini.');
        } finally {
            setLoading(false);
        }
    }, [entita]);

    useEffect(() => { fetchListini(); }, [fetchListini]);

    const handleSave = async (data, listinoId) => {
        try {
            if (listinoId) { await api.patch(`/catalogo/listini/${listinoId}`, data); } else { await api.post(`/catalogo/entita/${entita.id}/listini`, data); }
            fetchListini(); setIsFormOpen(false);
        } catch (err) { alert('Errore: ' + (err.response?.data?.message || err.message)); }
    };
    const handleAdd = () => { setEditingListino(null); setIsFormOpen(true); };
    const handleEdit = (listino) => { setEditingListino(listino); setIsFormOpen(true); };
    const handleDelete = async (listino) => { if (window.confirm(`Sei sicuro di voler eliminare il listino "${listino.nome_listino}"?`)) { try { await api.delete(`/catalogo/listini/${listino.id}`); fetchListini(); } catch (err) { alert('Errore: ' + (err.response?.data?.message || err.message)); } } };

    const columns = useMemo(() => [
        { header: 'Nome', accessorKey: 'nome_listino' },
        { header: 'Inizio Validità', accessorKey: 'data_inizio_validita', cell: info => new Date(info.getValue()).toLocaleDateString('it-IT') },
        { header: 'Fine Validità', accessorKey: 'data_fine_validita', cell: info => info.getValue() ? new Date(info.getValue()).toLocaleDateString('it-IT') : 'Senza Scadenza' },
        { header: 'P. Cessione 1', accessorKey: 'prezzo_cessione_1', cell: info => `€ ${parseFloat(info.getValue() || 0).toFixed(2)}` },
        {
            header: 'Azioni', id: 'actions', cell: ({row}) => (
                <ListinoActionButtons
                    item={row.original}
                    hasPermission={hasPermission}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )
        }
    ], [hasPermission, handleEdit, handleDelete]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-slate-50 rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
                <header className="flex justify-between items-center p-4 border-b bg-white">
                    <div>
                        <h2 className="text-xl font-bold">Gestione Listini</h2>
                        <p className="text-sm text-gray-600">{entita.codice_entita} - {entita.descrizione}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800"><XMarkIcon className="h-6 w-6"/></button>
                </header>
                <main className="flex-1 p-4 overflow-y-auto">
                    <div className="flex justify-end mb-4 items-center gap-2">
                        {hasPermission('CT_LISTINI_MANAGE') && <button onClick={handleAdd} className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md text-sm"><PlusIcon className="h-5 w-5 mr-1"/> Nuovo Listino</button>}
                         <button onClick={fetchListini} title="Ricarica Dati" className="p-2 text-gray-500 hover:text-gray-800"><ArrowPathIcon className="h-5 w-5"/></button>
                    </div>

                    {/* VISTA DESKTOP: Tabella */}
                    <div className="hidden md:block">
                        <AdvancedDataGrid columns={columns} data={listini} loading={loading} error={error} />
                    </div>

                    {/* NUOVO: VISTA MOBILE: Card */}
                    <div className="md:hidden space-y-4">
                        {loading && <div className="text-center p-4">Caricamento...</div>}
                        {error && <div className="p-4 bg-red-100 text-red-700 rounded-md">{error}</div>}
                        {!loading && !error && listini.length === 0 && <div className="text-center p-4 text-gray-500">Nessun listino trovato.</div>}
                        {!loading && !error && listini.map(item => (
                            <div key={item.id} className="p-4 bg-white rounded-lg shadow border border-gray-200">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 pr-2">
                                        <h3 className="text-lg font-semibold text-gray-900 leading-tight">{item.nome_listino}</h3>
                                        <p className="text-sm text-gray-500 mt-1">Valido dal: {new Date(item.data_inizio_validita).toLocaleDateString('it-IT')}</p>
                                    </div>
                                    <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full whitespace-nowrap">
                                        € {parseFloat(item.prezzo_cessione_1 || 0).toFixed(2)}
                                    </span>
                                </div>
                                <div className="mt-3 space-y-1 text-sm text-gray-600">
                                    <p><span className="font-medium">Fine Validità:</span> {item.data_fine_validita ? new Date(item.data_fine_validita).toLocaleDateString('it-IT') : 'Senza Scadenza'}</p>
                                </div>
                                <MobileListinoActionButtons
                                    item={item}
                                    hasPermission={hasPermission}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            </div>
                        ))}
                    </div>
                </main>

                {isFormOpen && (
                    <ListinoFormModal 
                        listino={editingListino}
                        onSave={handleSave}
                        onCancel={() => setIsFormOpen(false)}
                        entita={entita}
                        aliquotaIva={aliquotaCorrente}
                    />
                )}
            </div>
        </div>
    );
};

export default ListiniManager;