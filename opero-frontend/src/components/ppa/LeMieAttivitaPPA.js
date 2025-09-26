/**
 * ======================================================================
 * File: src/components/ppa/LeMieAttivitaPPA.js (v2.0 - Navigazione Interattiva)
 * ======================================================================
 * @description
 * AGGIORNATO: Trasformato in un portale che visualizza un elenco di
 * procedure. Ogni procedura è un link cliccabile che naviga allo
 * spazio collaborativo (IstanzaDetailView).
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom'; // Importa Link per la navigazione
import { api } from '../../services/api';
import { ChevronRightIcon, CalendarDaysIcon } from '@heroicons/react/24/solid';

const LeMieAttivitaPPA = () => {
    const [istanze, setIstanze] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMyIstanze = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/ppa/my-istanze');
            setIstanze(response.data.data || []);
        } catch (err) {
            setError("Impossibile caricare le tue procedure.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMyIstanze();
    }, [fetchMyIstanze]);

    if (isLoading) return <div className="text-center p-8">Caricamento delle tue attività...</div>;
    if (error) return <div className="text-center p-8 text-red-600 bg-red-50 rounded-lg">{error}</div>;

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
                <h2 className="text-xl font-semibold text-gray-800">Le Mie Procedure Attive</h2>
            </div>
            <div>
                <ul className="divide-y divide-gray-200">
                    {istanze.length > 0 ? (
                        istanze.map(istanza => (
                            <li key={istanza.id_istanza}>
                                {/* ## MODIFICA: L'intera riga ora è un link ## */}
                                <Link 
                                    to={`/ppa/task/${istanza.id_istanza}`} 
                                    className="block p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-blue-600">{istanza.NomeProcedura}</p>
                                            <p className="text-sm text-gray-600">Target: {istanza.TargetEntityName}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center text-sm text-gray-500">
                                                <CalendarDaysIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                                                Scadenza: {new Date(istanza.DataPrevistaFine).toLocaleDateString('it-IT')}
                                            </div>
                                            <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        ))
                    ) : (
                        <li className="p-6 text-center text-gray-500">
                            Non partecipi a nessuna procedura al momento.
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default LeMieAttivitaPPA;
