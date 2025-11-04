/**
 * ======================================================================
 * File: src/components/FattureAttiveManager.js (Mobile-First Version - FIXED)
 * ======================================================================
 * @description
 * Componente per la gestione delle Fatture Attive.
 * - Implementa una visualizzazione responsive: tabella su desktop, card su mobile.
 * - Gestisce il caricamento dei dati per i menu a tendina (clienti, IVA).
 * - Include la logica per creare, modificare ed eliminare fatture.
 * - Ottimizzato per l'uso in app Android/iOS con Capacitor.
 */
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { DocumentTextIcon } from '@heroicons/react/24/solid';

// --- Componente Modale per Creare/Modificare una Fattura ---
function FatturaEditModal({ fatturaId, onSave, onCancel }) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        id_cliente: '',
        numero_fattura: '',
        data_emissione: new Date().toISOString().split('T')[0],
        importo_imponibile: '',
        id_iva: '',
        importo_totale: '',
        data_scadenza: '',
        stato: 'Emessa',
    });
    const [clienti, setClienti] = useState([]);
    const [iva, setIva] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [clientiRes, ivaRes] = await Promise.all([
                    api.get('/api/amministrazione/anagrafiche?tipo=cliente'),
                    api.get('/api/amministrazione/iva')
                ]);
                if (clientiRes.data.success) setClienti(clientiRes.data.data);
                if (ivaRes.data.success) setIva(ivaRes.data.data);

                if (fatturaId) {
                    const fatturaRes = await api.get(`/api/amministrazione/fatture-attive/${fatturaId}`);
                    if (fatturaRes.data.success) {
                        setFormData(fatturaRes.data.data);
                    }
                }
            } catch (err) {
                console.error("Errore nel caricamento dati per il modale:", err);
                toast.error("Impossibile caricare i dati necessari.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [fatturaId]);

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <h3 className="text-xl font-semibold mb-4 text-slate-800">{fatturaId ? 'Modifica Fattura' : 'Nuova Fattura'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-grow">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Cliente</label>
                            <select name="id_cliente" value={formData.id_cliente} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md">
                                <option value="">Seleziona Cliente</option>
                                {clienti.map(c => <option key={c.id} value={c.id}>{c.ragione_sociale}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Numero Fattura</label>
                            <input name="numero_fattura" value={formData.numero_fattura} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Data Emissione</label>
                            <input type="date" name="data_emissione" value={formData.data_emissione} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Data Scadenza</label>
                            <input type="date" name="data_scadenza" value={formData.data_scadenza} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Imponibile</label>
                            <input type="number" step="0.01" name="importo_imponibile" value={formData.importo_imponibile} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Aliquota IVA</label>
                            <select name="id_iva" value={formData.id_iva} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md">
                                <option value="">Seleziona IVA</option>
                                {iva.map(i => <option key={i.id} value={i.id}>{i.codice} - {i.aliquota}%</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Importo Totale</label>
                            <input type="number" step="0.01" name="importo_totale" value={formData.importo_totale} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Stato</label>
                            <select name="stato" value={formData.stato} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md">
                                <option value="Emessa">Emessa</option>
                                <option value="Pagata">Pagata</option>
                                <option value="Scaduta">Scaduta</option>
                            </select>
                        </div>
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


// --- Componente Principale ---
const FattureAttiveManager = () => {
    const [fatture, setFatture] = useState([]);
    const [filteredFatture, setFilteredFatture] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFatturaId, setSelectedFatturaId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [mobileItemsPerPage] = useState(6);
    const { hasPermission } = useAuth();

    // Hook per rilevare se è mobile
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await api.get('/api/amministrazione/fatture-attive');
            if (data.success) {
                setFatture(data.data);
                setFilteredFatture(data.data);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Errore di connessione.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Logica di filtraggio e paginazione (simile a quella degli altri manager)
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredFatture(fatture);
        } else {
            const filtered = fatture.filter(fattura => {
                const cliente = fattura.ragione_sociale_cliente || '';
                const numero = fattura.numero_fattura || '';
                return cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       numero.toLowerCase().includes(searchTerm.toLowerCase());
            });
            setFilteredFatture(filtered);
        }
        setCurrentPage(1);
    }, [fatture, searchTerm]);

    const handleOpenModal = (id = null) => {
        setSelectedFatturaId(id);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedFatturaId(null);
        fetchData();
    };

    const handleSave = async (itemData) => {
        const isNew = !selectedFatturaId;
        const url = isNew ? '/api/amministrazione/fatture-attive' : `/api/amministrazione/fatture-attive/${selectedFatturaId}`;
        const method = isNew ? 'post' : 'put';
        try {
            const { data } = await api[method](url, itemData);
            if (data.success) {
                toast.success(data.message);
                handleCloseModal();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Errore durante il salvataggio.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Sei sicuro di voler eliminare questa fattura?')) {
            try {
                const { data } = await api.delete(`/api/amministrazione/fatture-attive/${id}`);
                if (data.success) {
                    toast.success(data.message);
                    fetchData();
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                toast.error(error.response?.data?.message || 'Errore durante l\'eliminazione.');
            }
        }
    };
    
    // Calcoli per la paginazione...
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredFatture.slice(indexOfFirstItem, indexOfLastItem);
    const mobileIndexOfLastItem = currentPage * mobileItemsPerPage;
    const mobileIndexOfFirstItem = mobileIndexOfLastItem - mobileItemsPerPage;
    const mobileCurrentItems = filteredFatture.slice(mobileIndexOfFirstItem, mobileIndexOfLastItem);
    const totalPages = Math.ceil(filteredFatture.length / itemsPerPage);
    const mobileTotalPages = Math.ceil(filteredFatture.length / mobileItemsPerPage);
    const paginate = pageNumber => setCurrentPage(pageNumber);

    return (
        <div className="p-4 space-y-4">
            {isModalOpen && <FatturaEditModal fatturaId={selectedFatturaId} onSave={handleSave} onCancel={handleCloseModal} />}
            
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                <h3 className="text-xl font-semibold text-slate-700">Gestione Fatture Attive</h3>
                <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 flex items-center gap-2">
                    <PlusIcon className="h-5 w-5" /> Nuova Fattura
                </button>
            </div>

            {/* Barra di ricerca (simile alle altre) */}
            <div className="bg-white p-4 rounded-lg shadow mb-4">
                 <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Cerca per cliente o numero..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <button
                                type="button"
                                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                onClick={() => setSearchTerm('')}
                            >
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
                {searchTerm && (
                    <div className="mt-2 text-sm text-gray-600">
                        Trovate {filteredFatture.length} fatture per "{searchTerm}"
                    </div>
                )}
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center items-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Caricamento...</span>
                    </div>
                ) : filteredFatture.length > 0 ? (
                    <>
                        {/* VISUALIZZAZIONE DESKTOP: TABELLA */}
                        {!isMobile && (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Cliente</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Numero</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Data Emissione</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Importo Totale</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Stato</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Azioni</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {currentItems.map(row => (
                                            <tr key={row.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4 text-sm font-medium text-slate-800">{row.ragione_sociale_cliente || 'N/D'}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600">{row.numero_fattura}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600">{new Date(row.data_emissione).toLocaleDateString('it-IT')}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600">€{parseFloat(row.importo_totale).toFixed(2)}</td>
                                                <td className="px-6 py-4 text-sm"><span className={`px-2 py-1 rounded-full text-xs ${row.stato === 'Pagata' ? 'bg-green-100 text-green-800' : row.stato === 'Scaduta' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>{row.stato}</span></td>
                                                <td className="px-6 py-4 text-center text-sm font-medium space-x-2">
                                                    <button onClick={() => handleOpenModal(row.id)} className="text-blue-600 hover:text-blue-900"><PencilIcon className="h-5 w-5 inline" /></button>
                                                    <button onClick={() => handleDelete(row.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5 inline" /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        
                        {/* VISUALIZZAZIONE MOBILE: CARD */}
                        {isMobile && (
                            <div className="grid grid-cols-1 gap-4 p-4">
                                {mobileCurrentItems.map(row => (
                                    <div key={row.id} className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="text-lg font-medium text-slate-900">{row.ragione_sociale_cliente || 'N/D'}</h3>
                                                <p className="text-sm text-slate-500">N. {row.numero_fattura}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs ${row.stato === 'Pagata' ? 'bg-green-100 text-green-800' : row.stato === 'Scaduta' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>{row.stato}</span>
                                        </div>
                                        <div className="text-sm text-slate-600 space-y-1">
                                            <p>Data: {new Date(row.data_emissione).toLocaleDateString('it-IT')}</p>
                                            <p>Importo: <span className="font-semibold">€{parseFloat(row.importo_totale).toFixed(2)}</span></p>
                                        </div>
                                        <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
                                            <button onClick={() => handleOpenModal(row.id)} className="p-2 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"><PencilIcon className="h-4 w-4" /></button>
                                            <button onClick={() => handleDelete(row.id)} className="p-2 text-red-600 bg-red-50 rounded-md hover:bg-red-100"><TrashIcon className="h-4 w-4" /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {/* Paginazione per DESKTOP */}
                        {!isMobile && totalPages > 1 && (
                            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-slate-200">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    <button onClick={() => currentPage > 1 && paginate(currentPage - 1)} disabled={currentPage === 1} className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">Precedente</button>
                                    <button onClick={() => currentPage < totalPages && paginate(currentPage + 1)} disabled={currentPage === totalPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">Successivo</button>
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div><p className="text-sm text-slate-700">Mostrando da <span className="font-medium">{indexOfFirstItem + 1}</span> a <span className="font-medium">{Math.min(indexOfLastItem, filteredFatture.length)}</span> di <span className="font-medium">{filteredFatture.length}</span> risultati</p></div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                            <button onClick={() => currentPage > 1 && paginate(currentPage - 1)} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                                <span className="sr-only">Previous</span>
                                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                            </button>
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                                                <button key={number} onClick={() => paginate(number)} className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === number ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'}`}>{number}</button>
                                            ))}
                                            <button onClick={() => currentPage < totalPages && paginate(currentPage + 1)} disabled={currentPage === totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                                <span className="sr-only">Next</span>
                                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Paginazione per MOBILE */}
                        {isMobile && mobileTotalPages > 1 && (
                            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-slate-200">
                                <div className="flex-1 flex justify-between">
                                    <button onClick={() => currentPage > 1 && paginate(currentPage - 1)} disabled={currentPage === 1} className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">Precedente</button>
                                    <span className="text-sm text-slate-700">Pagina {currentPage} di {mobileTotalPages}</span>
                                    <button onClick={() => currentPage < mobileTotalPages && paginate(currentPage + 1)} disabled={currentPage === mobileTotalPages} className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">Successivo</button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-8">
                        <DocumentTextIcon className="mx-auto h-12 w-12 text-slate-400" />
                        <h3 className="mt-2 text-sm font-medium text-slate-900">{searchTerm ? `Nessuna fattura trovata per "${searchTerm}"` : 'Nessuna fattura trovata'}</h3>
                        <p className="mt-1 text-sm text-slate-500">{searchTerm ? 'Prova a modificare i criteri di ricerca' : 'Prova a modificare i criteri di ricerca o aggiungi una nuova fattura.'}</p>
                        {!searchTerm && (
                            <div className="mt-6">
                                <button onClick={() => handleOpenModal()} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                    <PlusIcon className="h-5 w-5 mr-2" /> Nuova Fattura
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FattureAttiveManager;