import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { PencilIcon, PlusIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

// <span style="color:green;">// NUOVO: Funzione helper per formattare la data in YYYY-MM-DD per l'input.</span>
// Gestisce sia stringhe ISO che oggetti Date, e valori nulli.
const formatDateForInput = (date) => {
    if (!date) return '';
    try {
        return new Date(date).toISOString().split('T')[0];
    } catch (e) {
        return '';
    }
};

const ProgressiviManager = () => {
    const [progressivi, setProgressivi] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedProgressivo, setSelectedProgressivo] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/amministrazione/progressivi');
            setProgressivi(response.data.data || []);
            setError('');
        } catch (err) {
            setError('Impossibile caricare i progressivi. ' + (err.response?.data?.message || err.message));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenModal = (progressivo = null) => {
        if (progressivo) {
            setIsEditing(true);
            // <span style="color:green;">// MODIFICATO: Formatta data_ult per il campo di input.</span>
            setSelectedProgressivo({ 
                ...progressivo,
                data_ult: formatDateForInput(progressivo.data_ult)
            });
        } else {
            setIsEditing(false);
            setSelectedProgressivo({
                codice_progressivo: '',
                descrizione: '',
                ultimo_numero: 0,
                serie: '',
                // <span style="color:green;">// NUOVO: Imposta la data di oggi come default per i nuovi progressivi.</span>
                data_ult: formatDateForInput(new Date()) 
            });
        }
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProgressivo(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSelectedProgressivo(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // <span style="color:green;">// MODIFICATO: Il payload ora include sempre i campi per PUT e POST.</span>
            // La rotta PUT del backend si aspetta descrizione, ultimo_numero e data_ult.
            const payload = {
                codice_progressivo: selectedProgressivo.codice_progressivo,
                descrizione: selectedProgressivo.descrizione,
                ultimo_numero: selectedProgressivo.ultimo_numero,
                serie: selectedProgressivo.serie,
                data_ult: selectedProgressivo.data_ult
            };

            if (isEditing) {
                await api.put(`/amministrazione/progressivi/${selectedProgressivo.id}`, payload);
            } else {
                await api.post('/amministrazione/progressivi', payload);
            }
            fetchData();
            handleCloseModal();
        } catch (err) {
            setError('Errore nel salvataggio del progressivo: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="p-6 bg-slate-50 min-h-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Gestione Progressivi</h1>
                <div className="flex items-center gap-2">
                    <button onClick={() => fetchData()} disabled={isLoading} className="p-2 rounded-full hover:bg-slate-200 transition-colors">
                        <ArrowPathIcon className={`h-5 w-5 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm">
                        <PlusIcon className="h-5 w-5" />
                        <span>Nuovo</span>
                    </button>
                </div>
            </div>

            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-200 rounded-md">{error}</div>}

            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Codice</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Descrizione</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Serie</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Ultimo Numero</th>
                            {/* <span style="color:green;">// NUOVO: Colonna per la data.</span> */}
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Data Ult. Utilizzo</th>
                            <th className="relative px-6 py-3"><span className="sr-only">Modifica</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {isLoading ? (
                            <tr><td colSpan="7" className="text-center py-4">Caricamento...</td></tr>
                        ) : (
                            progressivi.map(p => (
                                <tr key={p.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">{p.codice_progressivo}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{p.descrizione}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{p.serie || 'N/D'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{p.ultimo_numero}</td>
                                    {/* <span style="color:green;">// NUOVO: Visualizzazione della data formattata.</span> */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                        {p.data_ult ? new Date(p.data_ult).toLocaleDateString('it-IT') : 'N/D'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleOpenModal(p)} className="text-blue-600 hover:text-blue-800">
                                            <PencilIcon className="h-5 w-5"/>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">{isEditing ? 'Modifica Progressivo' : 'Nuovo Progressivo'}</h2>
                            <button onClick={handleCloseModal}><XMarkIcon className="h-6 w-6 text-slate-500 hover:text-slate-800"/></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="codice_progressivo" className="block text-sm font-medium text-slate-700">Codice</label>
                                    <input type="text" name="codice_progressivo" id="codice_progressivo" value={selectedProgressivo.codice_progressivo} onChange={handleChange} disabled={isEditing} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-slate-100"/>
                                </div>
                                <div>
                                    <label htmlFor="serie" className="block text-sm font-medium text-slate-700">Serie (opzionale)</label>
                                    <input type="text" name="serie" id="serie" value={selectedProgressivo.serie || ''} onChange={handleChange} disabled={isEditing} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-slate-100"/>
                                </div>
                            </div>
                            <div className="mt-4">
                                <label htmlFor="descrizione" className="block text-sm font-medium text-slate-700">Descrizione</label>
                                <input type="text" name="descrizione" id="descrizione" value={selectedProgressivo.descrizione} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"/>
                            </div>
                             {/* <span style="color:green;">// NUOVO: Contenitore grid per allineare ultimo numero e data.</span> */}
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="ultimo_numero" className="block text-sm font-medium text-slate-700">Ultimo Numero</label>
                                    <input type="number" name="ultimo_numero" id="ultimo_numero" value={selectedProgressivo.ultimo_numero} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"/>
                                </div>
                                 {/* <span style="color:green;">// NUOVO: Campo input per la data.</span> */}
                                <div>
                                    <label htmlFor="data_ult" className="block text-sm font-medium text-slate-700">Data Ultimo Utilizzo</label>
                                    <input type="date" name="data_ult" id="data_ult" value={selectedProgressivo.data_ult} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"/>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-4">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Annulla</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Salva</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProgressiviManager;
