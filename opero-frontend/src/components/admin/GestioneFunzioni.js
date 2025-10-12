// #####################################################################
// # Componente GestioneFunzioni - v7.0 (Soluzione Tabella Semplice)
// # File: opero-frontend/src/components/admin/GestioneFunzioni.js
// # Sostituisce AdvancedDataGrid con una tabella HTML semplice e robusta
// # per risolvere definitivamente il problema di visualizzazione.
// #####################################################################
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Edit, PlusCircle, Settings, Building } from 'lucide-react';

import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
// Rimosso import di AdvancedDataGrid, non più necessario

// #region Sottocomponente: Anagrafica Funzioni di Sistema
const FunzioneFormModal = ({ isOpen, onClose, onSave, funzione }) => {
    const [formData, setFormData] = useState({ codice: '', descrizione: '', modulo: '' });

    useEffect(() => {
        if (funzione) {
            setFormData({
                codice: funzione.codice || '',
                descrizione: funzione.descrizione || '',
                modulo: funzione.chiave_componente_modulo || '' 
            });
        } else {
            setFormData({ codice: '', descrizione: '', modulo: '' });
        }
    }, [funzione, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        const finalValue = (name === 'codice' || name === 'modulo') ? value.toUpperCase() : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            codice: formData.codice,
            descrizione: formData.descrizione,
            chiave_componente_modulo: formData.modulo
        };
        onSave(payload);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6">{funzione ? 'Modifica Funzione' : 'Crea Nuova Funzione'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="codice" className="block text-sm font-medium text-gray-700">Codice</label>
                        <input type="text" id="codice" name="codice" value={formData.codice} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required disabled={!!funzione} />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="descrizione" className="block text-sm font-medium text-gray-700">Descrizione</label>
                        <input type="text" id="descrizione" name="descrizione" value={formData.descrizione} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="modulo" className="block text-sm font-medium text-gray-700">Modulo</label>
                        <input type="text" id="modulo" name="modulo" value={formData.modulo} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
                    </div>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Annulla</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Salva</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AnagraficaFunzioni = () => {
    const [funzioni, setFunzioni] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFunzione, setEditingFunzione] = useState(null);

    const fetchFunzioniAnagrafica = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/funzioni');
            setFunzioni(response.data.funzioni || []);
        } catch (error) {
            toast.error("Errore nel caricamento dell'anagrafica funzioni.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFunzioniAnagrafica();
    }, [fetchFunzioniAnagrafica]);

    const handleOpenModal = useCallback((funzione = null) => { setEditingFunzione(funzione); setIsModalOpen(true); }, []);
    const handleCloseModal = () => { setIsModalOpen(false); setEditingFunzione(null); };

    const handleSave = async (payload) => {
        try {
            if (editingFunzione) {
                await api.put(`/admin/funzioni/${editingFunzione.id}`, payload);
                toast.success("Funzione aggiornata!");
            } else {
                await api.post('/admin/funzioni', payload);
                toast.success("Funzione creata!");
            }
            fetchFunzioniAnagrafica();
            handleCloseModal();
        } catch (error) { toast.error(error.response?.data?.message || "Errore nel salvataggio."); }
    };
    
    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Anagrafica Funzioni di Sistema</h2>
                <button onClick={() => handleOpenModal()} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                    <PlusCircle size={20} className="mr-2" /> Nuova Funzione
                </button>
            </div>
            
            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Codice</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrizione</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modulo</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="5" className="text-center p-8">Caricamento dati...</td></tr>
                        ) : funzioni.length > 0 ? (
                            funzioni.map(funzione => (
                                <tr key={funzione.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{funzione.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{funzione.codice}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{funzione.descrizione}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{funzione.chiave_componente_modulo}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button onClick={() => handleOpenModal(funzione)} className="p-1 text-blue-600 hover:text-blue-800">
                                            <Edit size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" className="text-center p-8 text-gray-500">Nessuna funzione trovata.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <FunzioneFormModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSave} funzione={editingFunzione} />
        </div>
    );
};
// #endregion

// #region Sottocomponente: Abilitazione Funzioni per Ditta
const AbilitaFunzioniDitta = () => {
    const [ditte, setDitte] = useState([]);
    const [funzioni, setFunzioni] = useState([]);
    const [selectedDittaId, setSelectedDittaId] = useState('');
    const [funzioniAssociate, setFunzioniAssociate] = useState(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                const [ditteRes, funzioniRes] = await Promise.all([
                    api.get('/admin/ditte'),
                    api.get('/admin/funzioni') 
                ]);
                setDitte(ditteRes.data.ditte || []);
                const funzioniData = funzioniRes.data.funzioni || [];
                const formattedFunzioni = funzioniData.map(f => ({ ...f, id: Number(f.id) }));
                setFunzioni(formattedFunzioni);
            } catch (error) {
                toast.error("Errore nel caricamento dati per associazione ditte.");
            }
            setIsLoading(false);
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        if (!selectedDittaId) {
            setFunzioniAssociate(new Set());
            return;
        }
        const fetchAssociazioni = async () => {
            setIsLoading(true);
            try {
                const response = await api.get(`/admin/funzioni-ditta/${selectedDittaId}`);
                const idSet = new Set((response.data.funzioni || []).map(Number));
                setFunzioniAssociate(idSet);
            } catch (error) {
                toast.error(`Errore recupero associazioni per ditta.`);
                setFunzioniAssociate(new Set());
            }
            setIsLoading(false);
        };
        fetchAssociazioni();
    }, [selectedDittaId]);

    const groupedFunzioni = useMemo(() => {
        return funzioni.reduce((acc, f) => {
            const key = f.chiave_componente_modulo || 'Generale';
            if (!acc[key]) acc[key] = [];
            acc[key].push(f);
            return acc;
        }, {});
    }, [funzioni]);

    const sortedModuleKeys = useMemo(() => Object.keys(groupedFunzioni).sort(), [groupedFunzioni]);

    const handleCheckboxChange = (funzioneId) => {
        setFunzioniAssociate(prevSet => {
            const newSet = new Set(prevSet);
            if (newSet.has(funzioneId)) newSet.delete(funzioneId);
            else newSet.add(funzioneId);
            return newSet;
        });
    };

    const handleToggleModule = (moduleKey, select = true) => {
        const moduleFunzioniIds = groupedFunzioni[moduleKey].map(f => f.id);
        setFunzioniAssociate(prevSet => {
            const newSet = new Set(prevSet);
            if (select) moduleFunzioniIds.forEach(id => newSet.add(id));
            else moduleFunzioniIds.forEach(id => newSet.delete(id));
            return newSet;
        });
    };

    const handleSave = async () => {
        if (!selectedDittaId) {
            toast.warn('Seleziona una ditta prima di salvare.');
            return;
        }
        setIsSaving(true);
        try {
            await api.post('/admin/funzioni-ditta', {
                id_ditta: selectedDittaId,
                funzioni: Array.from(funzioniAssociate)
            });
            toast.success('Associazioni salvate con successo!');
        } catch (error) {
            toast.error('Errore durante il salvataggio.');
        }
        setIsSaving(false);
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Abilita Funzionalità per Ditta</h2>
            <select value={selectedDittaId} onChange={e => setSelectedDittaId(e.target.value)} className="w-full p-2 border rounded mb-6" disabled={isLoading}>
                <option value="">{isLoading ? 'Caricamento...' : 'Seleziona una ditta...'}</option>
                {ditte.map(d => <option key={d.id} value={d.id}>{d.ragione_sociale}</option>)}
            </select>
            {selectedDittaId && (
                <div>
                    {isLoading ? <p>Caricamento funzioni...</p> : (
                        <div className="space-y-6">
                            {sortedModuleKeys.map(moduleKey => (
                                <div key={moduleKey} className="border rounded-lg p-4 shadow-sm bg-white">
                                    <div className="flex justify-between items-center mb-3 border-b pb-2">
                                        <h4 className="font-bold text-md text-blue-800">{moduleKey}</h4>
                                        <div>
                                            <button onClick={() => handleToggleModule(moduleKey, true)} className="text-xs text-green-600 hover:underline mr-3">Seleziona Modulo</button>
                                            <button onClick={() => handleToggleModule(moduleKey, false)} className="text-xs text-red-600 hover:underline">Deseleziona Modulo</button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {groupedFunzioni[moduleKey].map(funzione => (
                                            <label key={funzione.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer">
                                                <input type="checkbox" className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                                                    checked={funzioniAssociate.has(funzione.id)}
                                                    onChange={() => handleCheckboxChange(funzione.id)}
                                                />
                                                <div>
                                                    <span className="font-semibold text-gray-800">{funzione.codice}</span>
                                                    <p className="text-xs text-gray-500">{funzione.descrizione}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="mt-6 text-right">
                         <button onClick={handleSave} disabled={isSaving || isLoading} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                             {isSaving ? 'Salvataggio...' : 'Salva Associazioni'}
                         </button>
                    </div>
                </div>
            )}
        </div>
    );
};
// #endregion

// #region Componente Principale con Tabs
const GestioneFunzioni = () => {
    const { hasPermission, isAuthLoading } = useAuth();
    const [activeTab, setActiveTab] = useState('anagrafica');

    useEffect(() => {
        if (!isAuthLoading) {
            const canManageAnagrafica = hasPermission('FUNZIONI_MANAGE');
            const canManageDitte = hasPermission('ADMIN_FUNZIONI_MANAGE');
            if (!canManageAnagrafica && canManageDitte) {
                setActiveTab('ditte');
            } else {
                setActiveTab('anagrafica');
            }
        }
    }, [isAuthLoading, hasPermission]);

    if (isAuthLoading) {
        return <div className="p-6 text-center">Caricamento permessi...</div>;
    }

    const canManageAnagrafica = hasPermission('FUNZIONI_MANAGE');
    const canManageDitte = hasPermission('ADMIN_FUNZIONI_MANAGE');

    if (!canManageAnagrafica && !canManageDitte) {
        return (
            <div className="p-6 text-center text-gray-500">
                Non si dispone dei permessi necessari per visualizzare questa sezione.
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Gestione Funzionalità</h1>
            
            <div className="border-b border-gray-200 mb-4">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {canManageAnagrafica && (
                        <button onClick={() => setActiveTab('anagrafica')} className={`${activeTab === 'anagrafica' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}>
                           <Settings size={16} /> Anagrafica Funzioni
                        </button>
                    )}
                    {canManageDitte && (
                        <button onClick={() => setActiveTab('ditte')} className={`${activeTab === 'ditte' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}>
                            <Building size={16} /> Abilita Funzioni per Ditta
                        </button>
                    )}
                </nav>
            </div>

            <div>
                {activeTab === 'anagrafica' && canManageAnagrafica && <AnagraficaFunzioni />}
                {activeTab === 'ditte' && canManageDitte && <AbilitaFunzioniDitta />}
            </div>
        </div>
    );
}

export default GestioneFunzioni;
// #endregion

