/**
 * #####################################################################
 * # Componente Le Mie Attività PPA (v1.1)
 * # File: opero-frontend/src/components/ppa/LeMieAttivitaPPA.js
 * #####################################################################
 *
 * @description
 * Questo componente visualizza l'elenco di tutte le istanze di procedura PPA
 * assegnate all'utente attualmente loggato, utilizzando la rotta /ppa/istanze.
 * * @note
 * Modificato per utilizzare l'endpoint /ppa/istanze al posto del precedente /ppa/my-tasks
 * che restituiva un errore.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api'; // Client Axios per le chiamate API
import { ClockIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const LeMieAttivitaPPA = () => {
    // --- STATO DEL COMPONENTE ---
    const [tasks, setTasks] = useState([]); // Conterrà l'elenco delle attività
    const [loading, setLoading] = useState(true); // Gestisce lo stato di caricamento
    const [error, setError] = useState(null); // Gestisce eventuali errori di fetch

    // --- LOGICA DI FETCH DEI DATI ---
    const fetchMyTasks = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            // CORRETTO: Utilizza la rotta funzionante /ppa/istanze
            const response = await api.get('/ppa/istanze');
            
            // La rotta /istanze restituisce direttamente l'array di dati
            setTasks(response.data);

        } catch (err) {
            console.error("Errore nel recupero delle attività PPA:", err);
            setError("Impossibile caricare le attività PPA. Verificare la connessione o contattare l'assistenza.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMyTasks();
    }, [fetchMyTasks]);

    // --- FUNZIONI DI UTILITY ---
    // Funzione per formattare la data in un formato leggibile
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('it-IT', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // --- RENDER DEL COMPONENTE ---
    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Le Mie Attività PPA</h2>
            
            {loading ? (
                // Mostra un indicatore di caricamento durante il fetch
                <div className="text-center p-8">Caricamento delle attività in corso...</div>
            ) : error ? (
                // Mostra un messaggio di errore se il fetch fallisce
                <div className="text-center p-8 text-red-600 bg-red-100 rounded-lg">{error}</div>
            ) : (
                // Mostra la lista delle attività se il fetch ha successo
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                        {tasks.length > 0 ? (
                            tasks.map((task) => (
                                <li key={task.ID} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        {/* Dettagli principali dell'attività */}
                                        <div>
                                            {/* CORRETTO: Utilizzo dei campi restituiti da /istanze */}
                                            <p className="font-semibold text-gray-800">{task.NomeProcedura}</p>
                                            <p className="text-sm text-gray-600">{`Target: ${task.TargetEntityName}`}</p>
                                        </div>
                                        {/* Stato e scadenza */}
                                        <div className="flex items-center">
                                           <div>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800`}>
                                                    {task.Stato}
                                                </span>
                                                <div className="flex items-center text-sm text-gray-500 mt-2">
                                                    <ClockIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                                                    Scadenza: {formatDate(task.DataPrevistaFine)}
                                                </div>
                                            </div>
                                             <ChevronRightIcon className="h-5 w-5 text-gray-400 ml-4" />
                                        </div>
                                    </div>
                                </li>
                            ))
                        ) : (
                            // Messaggio visualizzato se non ci sono attività
                            <li className="p-6 text-center text-gray-500">
                                Non hai nessuna attività PPA assegnata al momento.
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default LeMieAttivitaPPA;

