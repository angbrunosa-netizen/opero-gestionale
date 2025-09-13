import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { PencilIcon, PlusIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

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
            setSelectedProgressivo({ ...progressivo });
        } else {
            setIsEditing(false);
            setSelectedProgressivo({
                codice_progressivo: '',
                descrizione: '',
                ultimo_numero: 0,
                serie: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProgressivo(null);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const data = {
            descrizione: selectedProgressivo.descrizione,
            ultimo_numero: selectedProgressivo.ultimo_numero,
        };

        try {
            if (isEditing) {
                await api.put(`/amministrazione/progressivi/${selectedProgressivo.id}`, data);
            } else {
                data.codice_progressivo = selectedProgressivo.codice_progressivo;
                data.serie = selectedProgressivo.serie || null;
                await api.post('/amministrazione/progressivi', data);
            }
            fetchData(); // Aggiorna la lista
            handleCloseModal();
        } catch (err) {
            alert('Errore nel salvataggio: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSelectedProgressivo(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-slate-800">Gestione Progressivi</h1>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 transition-colors"
                    >
                        <PlusIcon className="h-5 w-5" />
                        Nuovo Progressivo
                    </button>
                </div>

                {isLoading ? (
                    <div className="text-center p-8"><ArrowPathIcon className="h-8 w-8 animate-spin mx-auto text-slate-500" /></div>
                ) : error ? (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                        <p className="font-bold">Errore</p>
                        <p>{error}</p>
                    </div>
                ) : (
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Codice</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Descrizione</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Serie</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ultimo Numero</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Azioni</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {progressivi.map(p => (
                                    <tr key={p.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-900">{p.codice_progressivo}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{p.descrizione}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{p.serie || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-semibold text-right">{p.ultimo_numero}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                            <button onClick={() => handleOpenModal(p)} className="text-blue-600 hover:text-blue-800">
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal per Creazione/Modifica */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">{isEditing ? 'Modifica Progressivo' : 'Crea Nuovo Progressivo'}</h2>
                            <button onClick={handleCloseModal}><XMarkIcon className="h-6 w-6 text-slate-500" /></button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="codice_progressivo" className="block text-sm font-medium text-slate-700">Codice Progressivo</label>
                                    <input
                                        type="text"
                                        name="codice_progressivo"
                                        id="codice_progressivo"
                                        value={selectedProgressivo.codice_progressivo}
                                        onChange={handleChange}
                                        disabled={isEditing}
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-slate-100"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="descrizione" className="block text-sm font-medium text-slate-700">Descrizione</label>
                                    <input
                                        type="text"
                                        name="descrizione"
                                        id="descrizione"
                                        value={selectedProgressivo.descrizione}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="serie" className="block text-sm font-medium text-slate-700">Serie (opzionale)</label>
                                    <input
                                        type="text"
                                        name="serie"
                                        id="serie"
                                        value={selectedProgressivo.serie || ''}
                                        onChange={handleChange}
                                        disabled={isEditing}
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-slate-100"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="ultimo_numero" className="block text-sm font-medium text-slate-700">Ultimo Numero Utilizzato</label>
                                    <input
                                        type="number"
                                        name="ultimo_numero"
                                        id="ultimo_numero"
                                        value={selectedProgressivo.ultimo_numero}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        required
                                    />
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
