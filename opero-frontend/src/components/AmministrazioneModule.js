// #####################################################################
// # Modulo Amministrazione - v7.1 (Refactoring Definitivo con Context API)
// # File: opero-frontend/src/components/AmministrazioneModule.js
// #####################################################################

import React, { useState, useCallback, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Importiamo il nostro servizio API centralizzato e l'hook di autenticazione
import api from '../services/api'; 
import { useAuth } from '../context/AuthContext';

// =====================================================================
// ============ SOTTO-COMPONENTI REFACTORIZZATI ========================
// =====================================================================

// --- Componente per la Gestione Anagrafiche ---
function AnagraficheManager() {
    const [anagrafiche, setAnagrafiche] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAnagraficaId, setSelectedAnagraficaId] = useState(null);
    const { hasPermission } = useAuth();

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await api.get('/amministrazione/anagrafiche');
            if (data.success) {
                setAnagrafiche(data.data);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Errore di connessione durante il caricamento delle anagrafiche.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenModal = (id = null) => {
        setSelectedAnagraficaId(id);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedAnagraficaId(null);
    };

    const handleSave = async (formData) => {
        const isNew = !formData.id;
        const url = isNew ? '/amministrazione/anagrafiche' : `/amministrazione/anagrafiche/${formData.id}`;
        const method = isNew ? 'post' : 'patch';

        try {
            const { data } = await api[method](url, formData);
            alert(data.message);
            if (data.success) {
                handleCloseModal();
                fetchData();
            }
        } catch (error) {
            alert('Errore di connessione durante il salvataggio.');
        }
    };

    const canCreate = hasPermission('ANAGRAFICHE_CREATE');
    const canEdit = hasPermission('ANAGRAFICHE_EDIT');

    return (
        <div>
            {isModalOpen && (
                <AnagraficaEditModal 
                    anagraficaId={selectedAnagraficaId}
                    onSave={handleSave}
                    onCancel={handleCloseModal}
                />
            )}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-slate-700">Anagrafiche Clienti & Fornitori</h3>
                {canCreate && (
                    <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">
                        + Nuova Anagrafica
                    </button>
                )}
            </div>
            {isLoading && <p>Caricamento...</p>}
            {error && <p className="text-red-500">Errore: {error}</p>}
            {!isLoading && !error && (
                 <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ragione Sociale</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">P.IVA / C.F.</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Relazione</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Stato</th>
                                {canEdit && <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Azioni</th>}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {anagrafiche.map(row => (
                                <tr key={row.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{row.ragione_sociale}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{row.p_iva || row.codice_fiscale}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{row.relazione}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${row.stato === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {row.stato === 1 ? 'Attivo' : 'Non Attivo'}
                                        </span>
                                    </td>
                                    {canEdit && (
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <button onClick={() => handleOpenModal(row.id)} className="text-blue-600 hover:text-blue-900">
                                                Modifica
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// --- Componente Modale per Form di Modifica Anagrafica ---
function AnagraficaEditModal({ anagraficaId, onSave, onCancel }) {
    const [formData, setFormData] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnagrafica = async () => {
            setIsLoading(true);
            if (anagraficaId) {
                try {
                    const { data } = await api.get(`/amministrazione/anagrafiche/${anagraficaId}`);
                    setFormData(data.success ? data.data : {});
                } catch (error) {
                    alert('Errore di connessione.');
                    onCancel();
                }
            } else {
                setFormData({ stato: 1, codice_relazione: 'N' });
            }
            setIsLoading(false);
        };
        fetchAnagrafica();
    }, [anagraficaId, onCancel]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (isLoading) return <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><p className="text-white">Caricamento...</p></div>;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <h3 className="text-xl font-semibold mb-4 text-slate-800">{anagraficaId ? 'Modifica Anagrafica' : 'Nuova Anagrafica'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-4 flex-grow">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700">Ragione Sociale</label>
                            <input name="ragione_sociale" value={formData.ragione_sociale || ''} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        {/* Aggiungi qui gli altri campi del form come nel tuo file originale */}
                    </div>
                    <div className="flex justify-end gap-4 pt-4 border-t mt-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Annulla</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">Salva</button>
                    </div>
                </form>
            </div>
        </div>
    );
}


// =====================================================================
// ============ COMPONENTE PRINCIPALE DEL MODULO =======================
// =====================================================================
const AmministrazioneModule = () => {
    const [activeMenu, setActiveMenu] = useState('anagrafiche');
    const { hasPermission } = useAuth();

    const menuItems = [
        { key: 'anagrafiche', label: 'Clienti / Fornitori', permission: 'ANAGRAFICHE_VIEW' },
        // Aggiungi qui le altre voci di menu con i rispettivi permessi
    ];

    const renderContent = () => {
        switch (activeMenu) {
            case 'anagrafiche':
                return hasPermission('ANAGRAFICHE_VIEW') ? <AnagraficheManager /> : <p>Non hai i permessi per visualizzare le anagrafiche.</p>;
            default:
                return <p>Seleziona una voce dal menu.</p>;
        }
    };

    return (
        <div className="flex w-full h-full bg-gray-50">
            <aside className="w-56 border-r border-slate-200 p-4 bg-white">
                <h2 className="font-bold mb-4 text-slate-700">Menu Amministrazione</h2>
                <ul className="space-y-2">
                    {menuItems.filter(item => hasPermission(item.permission)).map(item => (
                        <li key={item.key}>
                            <button 
                                onClick={() => setActiveMenu(item.key)} 
                                className={`w-full text-left p-2 rounded-md transition-colors text-sm ${activeMenu === item.key ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-slate-100'}`}
                            >
                                {item.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </aside>
            <main className="flex-1 p-6 overflow-y-auto">
                {renderContent()}
            </main>
        </div>
    );
}

export default AmministrazioneModule;
