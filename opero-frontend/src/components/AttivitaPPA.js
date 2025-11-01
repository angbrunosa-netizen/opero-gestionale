/**
 * File: opero-frontend/src/components/AttivitaPPA.js
 * Descrizione: Componente per visualizzare e gestire le attività PPA in corso.
 * Fase: 4.4 (Ottimizzazione Mobile) - Adattamento della vista tabellare per mobile.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import IstanzaDetailView from './ppa/IstanzaDetailView';
import { EyeIcon } from '@heroicons/react/24/outline';

const AttivitaPPA = ({ refreshKey }) => {
    const [istanze, setIstanze] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedIstanzaId, setSelectedIstanzaId] = useState(null);

    const fetchIstanze = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get('/ppa/istanze');
            setIstanze(response.data);
        } catch (err) {
            console.error("Errore nel caricamento delle istanze:", err);
            setError("Impossibile caricare le procedure in corso.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchIstanze();
    }, [fetchIstanze, refreshKey]);

    const handleViewDetails = (id) => {
        setSelectedIstanzaId(id);
    };

    const handleBackToList = () => {
        setSelectedIstanzaId(null);
    };

    // Logica di rendering condizionale per la vista di dettaglio
    if (selectedIstanzaId) {
        return <IstanzaDetailView istanzaId={selectedIstanzaId} onBack={handleBackToList} />;
    }

    // Stati di caricamento ed errore
    if (isLoading) {
        return <div className="p-4 text-center">Caricamento attività...</div>;
    }

    if (error) {
        return <div className="p-4 bg-red-100 text-red-700 rounded-md">{error}</div>;
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Procedure in Corso</h3>
            
            {/* Vista Desktop: Tabella tradizionale (visibile solo su schermi medi e grandi) */}
            <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Procedura</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicata a</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stato</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scadenza</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {istanze.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">Nessuna procedura in corso.</td>
                            </tr>
                        ) : (
                            istanze.map((istanza) => (
                                <tr key={istanza.ID} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{istanza.NomeProcedura}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{istanza.TargetEntityName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{istanza.Stato}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(istanza.DataPrevistaFine).toLocaleDateString('it-IT')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleViewDetails(istanza.ID)} className="text-blue-600 hover:text-blue-900 flex items-center gap-1">
                                            <EyeIcon className="h-4 w-4" />
                                            Dettagli
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Vista Mobile: Layout a card (visibile solo su schermi piccoli) */}
            <div className="md:hidden space-y-4">
                {istanze.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-md">Nessuna procedura in corso.</div>
                ) : (
                    istanze.map((istanza) => (
                        <div key={istanza.ID} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="text-sm font-semibold text-gray-900">{istanza.NomeProcedura}</h4>
                                <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full">{istanza.Stato}</span>
                            </div>
                            <p className="text-xs text-gray-600 mb-1">
                                <span className="font-medium">Applicata a:</span> {istanza.TargetEntityName}
                            </p>
                            <p className="text-xs text-gray-600 mb-3">
                                <span className="font-medium">Scadenza:</span> {new Date(istanza.DataPrevistaFine).toLocaleDateString('it-IT')}
                            </p>
                            <div className="flex justify-end">
                                <button 
                                    onClick={() => handleViewDetails(istanza.ID)} 
                                    className="text-blue-600 hover:text-blue-900 flex items-center gap-1 text-sm font-medium"
                                >
                                    <EyeIcon className="h-4 w-4" />
                                    Dettagli
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AttivitaPPA;