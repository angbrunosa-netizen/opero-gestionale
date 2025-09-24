/**
 * #####################################################################
 * # Componente Monitoraggio PPA - v2.1 (API Corretta)
 * # File: opero-frontend/src/components/ppa/MonitorPPAAzienda.js
 * #####################################################################
 *
 * @description
 * AGGIORNATO: La chiamata API è stata corretta per utilizzare l'endpoint
 * stabile `/ppa/istanze` invece di `/ppa/istanze/all-by-ditta`,
 * risolvendo il problema del caricamento dati.
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
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col max-h-[80vh]">
                <header className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Bacheca Team: {istanza.NomeProcedura}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">&times;</button>
                </header>
                <main className="p-4 overflow-y-auto">
                    {/* Assicuriamoci che istanza.TeamID esista prima di renderizzare */}
                    {istanza.TeamID && <TeamBacheca teamId={istanza.TeamID} />}
                </main>
            </div>
        </div>
    );
};


const MonitorPPAAzienda = () => {
    const [istanze, setIstanze] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Stati per gestire i modali e l'istanza selezionata
    const [selectedIstanza, setSelectedIstanza] = useState(null);
    const [isBachecaOpen, setIsBachecaOpen] = useState(false);
    const [isReportComposerOpen, setIsReportComposerOpen] = useState(false);

    const fetchAllIstanze = useCallback(async () => {
        setIsLoading(true);
        try {
            // ##################################################################
            // ## CORREZIONE: Utilizzo della rotta API corretta '/ppa/istanze' ##
            // ##################################################################
            const response = await api.get('/ppa/istanze');
            // La rotta /istanze restituisce direttamente l'array, quindi accediamo a response.data
            setIstanze(response.data || []);
        } catch (err) {
            setError("Impossibile caricare i dati di monitoraggio.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllIstanze();
    }, [fetchAllIstanze]);

    // Handler per aprire i modali
    const handleOpenBacheca = (istanza) => {
        setSelectedIstanza(istanza);
        setIsBachecaOpen(true);
    };

    const handleOpenReportComposer = (istanza) => {
        setSelectedIstanza(istanza);
        setIsReportComposerOpen(true);
    };


    if (isLoading) return <div className="text-center p-4">Caricamento dati...</div>;
    if (error) return <div className="bg-red-100 text-red-700 p-4 rounded-md">{error}</div>;

    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Monitoraggio Procedure Aziendali</h2>
            <div className="bg-white shadow rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Procedura</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scadenza</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Azioni</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {istanze.map(istanza => (
                            <tr key={istanza.ID}>
                                <td className="px-4 py-4 text-sm font-medium text-gray-900">{istanza.NomeProcedura}</td>
                                <td className="px-4 py-4 text-sm text-gray-600">{istanza.TargetEntityName}</td>
                                <td className="px-4 py-4 text-sm text-gray-500">{new Date(istanza.DataPrevistaFine).toLocaleDateString('it-IT')}</td>
                                <td className="px-4 py-4 text-sm font-medium text-center">
                                    <div className="flex justify-center items-center gap-2">
                                        <Link to={`/ppa/task/${istanza.ID}`} title="Visualizza Dettagli" className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100">
                                            <EyeIcon className="h-5 w-5" />
                                        </Link>
                                        <button onClick={() => handleOpenBacheca(istanza)} title="Apri Bacheca Team" className="p-2 text-gray-500 hover:text-green-600 rounded-full hover:bg-gray-100">
                                            <ChatBubbleBottomCenterTextIcon className="h-5 w-5" />
                                        </button>
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

