/**
 * ======================================================================
 * File: src/components/ppa/MonitorPPAAzienda.js (v2.2 - con Bacheca)
 * ======================================================================
 * @description
 * AGGIORNATO: Il pulsante per la bacheca del team è ora funzionale.
 * Appare solo se un team è associato alla procedura e apre un modale
 * con la bacheca per la comunicazione diretta.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { EyeIcon, ChatBubbleBottomCenterTextIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';

// Importiamo i componenti modali che verranno utilizzati
import TeamBacheca from './TeamBacheca'; 
import ReportComposerModal from './ReportComposerModal';

// Componente Modale per la Bacheca (wrapper)
const BachecaModal = ({ isOpen, onClose, istanza }) => {
    if (!isOpen || !istanza) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col max-h-[80vh]">
                <header className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-bold">Bacheca Team: {istanza.NomeProcedura}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">X</button>
                </header>
                <main className="p-4 overflow-y-auto">
                    {/* Passiamo il TeamID al componente bacheca */}
                    <TeamBacheca teamId={istanza.TeamID} />
                </main>
            </div>
        </div>
    );
};


const MonitorPPAAzienda = () => {
    const [istanze, setIstanze] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Stati per la gestione dei modali
    const [selectedIstanza, setSelectedIstanza] = useState(null);
    const [isBachecaOpen, setIsBachecaOpen] = useState(false);
    const [isReportComposerOpen, setIsReportComposerOpen] = useState(false);

    const fetchIstanze = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/ppa/istanze');
            setIstanze(response.data.data || []);
        } catch (err) {
            setError('Impossibile caricare i dati di monitoraggio.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchIstanze();
    }, [fetchIstanze]);

    // Gestori per l'apertura dei modali
    const handleOpenBacheca = (istanza) => {
        setSelectedIstanza(istanza);
        setIsBachecaOpen(true);
    };

    const handleOpenReportComposer = (istanza) => {
        setSelectedIstanza(istanza);
        setIsReportComposerOpen(true);
    };
    
    if (isLoading) return <div className="text-center p-8">Caricamento dati di monitoraggio...</div>;
    if (error) return <div className="text-center p-8 text-red-600 bg-red-50 rounded-lg">{error}</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Monitoraggio Procedure Aziendali</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Procedura</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stato</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scadenza</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {istanze.map(istanza => (
                            <tr key={istanza.id_istanza} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{istanza.NomeProcedura}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{istanza.TargetEntityName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{istanza.Stato}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(istanza.DataPrevistaFine).toLocaleDateString('it-IT')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                                    <div className="flex justify-center items-center gap-2">
                                        <Link to={`/ppa/task/${istanza.id_istanza}`} title="Visualizza Dettagli" className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100">
                                            <EyeIcon className="h-5 w-5" />
                                        </Link>
                                        
                                        {/* ## NUOVA LOGICA: Mostra il pulsante solo se c'è un team ## */}
                                        {istanza.TeamID && (
                                            <button onClick={() => handleOpenBacheca(istanza)} title="Apri Bacheca Team" className="p-2 text-gray-500 hover:text-green-600 rounded-full hover:bg-gray-100">
                                                <ChatBubbleBottomCenterTextIcon className="h-5 w-5" />
                                            </button>
                                        )}

                                        <button onClick={() => handleOpenReportComposer(istanza)} title="Invia Report al Target" className="p-2 text-gray-500 hover:text-teal-600 rounded-full hover:bg-gray-100">
                                            <PaperAirplaneIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Inclusione dei modali (vengono renderizzati solo se aperti) */}
            <BachecaModal 
                isOpen={isBachecaOpen}
                onClose={() => setIsBachecaOpen(false)}
                istanza={selectedIstanza}
            />
            {selectedIstanza && (
                <ReportComposerModal
                    isOpen={isReportComposerOpen}
                    onClose={() => setIsReportComposerOpen(false)}
                    istanza={selectedIstanza}
                />
            )}
        </div>
    );
};

export default MonitorPPAAzienda;
