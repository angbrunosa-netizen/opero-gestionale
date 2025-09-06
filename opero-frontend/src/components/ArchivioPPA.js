// #####################################################################
// # Componente Archivio Procedure Assegnate - v1.1 (con Controllo Token)
// # File: opero-frontend/src/components/ArchivioPPA.js
// #####################################################################

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { XMarkIcon } from '@heroicons/react/24/solid';

// --- Modale per visualizzare i dettagli del Team ---
const TeamDetailModal = ({ istanza, onClose }) => {
    const [team, setTeam] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTeam = async () => {
            setIsLoading(true);
            try {
                const { data } = await api.get(`/ppa/istanze/${istanza.id}/team`);
                if (data.success) {
                    setTeam(data.data);
                }
            } catch (error) {
                console.error("Errore nel caricamento del team", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTeam();
    }, [istanza.id]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-bold">Team per: {istanza.nome_procedura}</h3>
                    <button type="button" onClick={onClose}><XMarkIcon className="h-6 w-6" /></button>
                </div>
                <div className="p-6">
                    <p className="text-sm mb-4">Applicata a: <strong>{istanza.ditta_target}</strong></p>
                    {isLoading ? <p>Caricamento membri...</p> : (
                        <ul className="space-y-2">
                            {team.map(member => (
                                <li key={member.email} className="text-sm">
                                    <strong>{member.nome} {member.cognome}</strong> ({member.email})
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="flex justify-end p-4 bg-gray-50 border-t">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md">Chiudi</button>
                </div>
            </div>
        </div>
    );
};


// --- Componente Principale dell'Archivio ---
const ArchivioPPA = () => {
    const [istanze, setIstanze] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(''); // Stato per gestire i messaggi di errore
    const [selectedIstanza, setSelectedIstanza] = useState(null);

    const fetchIstanze = useCallback(async () => {
        setIsLoading(true);
        setError(''); // Resetta l'errore a ogni nuovo caricamento

        // FIX: Controlliamo esplicitamente la presenza del token prima della chiamata API
        const token = localStorage.getItem('token');
        if (!token) {
            setError("Sessione non valida o scaduta. Per favore, effettua nuovamente il login.");
            setIsLoading(false);
            return;
        }

        try {
            const { data } = await api.get('/ppa/istanze');
            if (data.success) {
                setIstanze(data.data);
            } else {
                // Se il server risponde con un errore (anche se il token c'era), lo mostriamo
                setError(data.message || "Si è verificato un errore sconosciuto.");
            }
        } catch (err) {
            // Gestisce errori di rete o altri errori non gestiti dal server
            setError(err.response?.data?.message || "Impossibile caricare l'archivio delle procedure. Verifica la connessione.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchIstanze();
    }, [fetchIstanze]);

    const renderContent = () => {
        if (isLoading) {
            return <p className="p-6 text-center text-gray-500">Caricamento archivio...</p>;
        }
        if (error) {
            return <p className="p-6 text-center text-red-600 font-semibold">{error}</p>;
        }
        if (istanze.length === 0) {
            return <p className="p-6 text-center text-gray-500">Nessuna procedura trovata nell'archivio.</p>;
        }
        return (
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Procedura</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicata a</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Avvio</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stato</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Team</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {istanze.map(istanza => (
                            <tr key={istanza.id}>
                                <td className="px-6 py-4 font-medium">{istanza.nome_procedura}</td>
                                <td className="px-6 py-4">{istanza.ditta_target}</td>
                                <td className="px-6 py-4">{new Date(istanza.data_inizio).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${istanza.stato === 'Completata' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {istanza.stato}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button onClick={() => setSelectedIstanza(istanza)} className="text-blue-600 hover:underline text-sm">Visualizza</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="p-6">
            {selectedIstanza && <TeamDetailModal istanza={selectedIstanza} onClose={() => setSelectedIstanza(null)} />}
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Archivio Procedure Assegnate</h1>
            {renderContent()}
        </div>
    );
};

export default ArchivioPPA;
