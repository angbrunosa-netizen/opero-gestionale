/**
 * File: opero-frontend/src/components/ppa/IstanzaDetailView.js
 * Descrizione: Componente per la visualizzazione dettagliata di una singola istanza di procedura PPA.
 * Fase: 4.3 - Creazione Vista di Dettaglio e Integrazione Modale
 */
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import TeamCommunicationModal from './TeamCommunicationModal'; // Importiamo la modale
import { ArrowLeftIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

const IstanzaDetailView = ({ istanzaId, onBack }) => {
    const [details, setDetails] = useState(null);
    const [actions, setActions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Stato per la modale di comunicazione
    const [isCommModalOpen, setIsCommModalOpen] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get(`/ppa/istanze/${istanzaId}`);
            setDetails(response.data.details);
            setActions(response.data.actions);
        } catch (err) {
            console.error(`Errore nel caricamento dei dettagli per l'istanza ${istanzaId}:`, err);
            setError("Impossibile caricare i dettagli della procedura.");
        } finally {
            setIsLoading(false);
        }
    }, [istanzaId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completata': return 'bg-green-100 text-green-800';
            case 'In Corso': return 'bg-yellow-100 text-yellow-800';
            case 'Non Avviata': return 'bg-gray-100 text-gray-800';
            default: return 'bg-red-100 text-red-800';
        }
    };

    if (isLoading) {
        return <div className="p-6 text-center">Caricamento dettagli procedura...</div>;
    }

    if (error) {
        return <div className="p-6 bg-red-100 text-red-700 rounded-md">{error}</div>;
    }

    return (
        <div className="p-6 bg-slate-50">
            {/* Header con pulsante Indietro e Azioni */}
            <div className="flex justify-between items-center mb-6">
                <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900">
                    <ArrowLeftIcon className="h-5 w-5" />
                    <span>Torna all'elenco</span>
                </button>
                <button 
                    onClick={() => setIsCommModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                    <ChatBubbleLeftRightIcon className="h-5 w-5" />
                    <span>Comunica con il Team</span>
                </button>
            </div>

            {/* Dettagli Principali Istanza */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-2xl font-bold text-gray-800">{details.NomeProcedura}</h2>
                <p className="text-md text-gray-500 mt-1">
                    Applicata a: <span className="font-semibold text-gray-700">{details.TargetEntityName}</span>
                </p>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <span className="block text-gray-500">Stato</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(details.Stato)}`}>{details.Stato}</span>
                    </div>
                    <div>
                        <span className="block text-gray-500">Creata il</span>
                        <span className="font-semibold">{new Date(details.DataCreazione).toLocaleDateString('it-IT')}</span>
                    </div>
                    <div>
                        <span className="block text-gray-500">Scadenza</span>
                        <span className="font-semibold">{new Date(details.DataPrevistaFine).toLocaleDateString('it-IT')}</span>
                    </div>
                    <div>
                        <span className="block text-gray-500">Creata da</span>
                        <span className="font-semibold">{details.NomeCreatore} {details.CognomeCreatore}</span>
                    </div>
                </div>
            </div>

            {/* Lista Azioni */}
            <div>
                <h3 className="text-xl font-bold text-gray-700 mb-4">Dettaglio Attività</h3>
                <div className="space-y-4">
                    {actions.map(action => (
                        <div key={action.ID} className="bg-white p-4 rounded-lg border">
                            <p className="font-bold">{action.NomeAzione}</p>
                            <p className="text-sm text-gray-600 mt-1">{action.DescrizioneAzione}</p>
                            {action.NoteParticolari && (
                                <p className="text-sm mt-2 p-2 bg-yellow-50 border-l-4 border-yellow-400">
                                    <strong>Note:</strong> {action.NoteParticolari}
                                </p>
                            )}
                            <div className="mt-3 text-xs grid grid-cols-3 gap-2">
                                <div>
                                    <span className="block text-gray-500">Assegnata a</span>
                                    <span className="font-semibold">{action.NomeAssegnato} {action.CognomeAssegnato}</span>
                                </div>
                                <div>
                                    <span className="block text-gray-500">Stato</span>
                                    <span className={`px-2 py-1 rounded-full ${getStatusColor(action.ID_Stato)}`}>{action.ID_Stato}</span>
                                </div>
                                <div>
                                    <span className="block text-gray-500">Scadenza Azione</span>
                                    <span className="font-semibold">{new Date(action.DataScadenza).toLocaleDateString('it-IT')}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modale di Comunicazione */}
            <TeamCommunicationModal
                isOpen={isCommModalOpen}
                onClose={() => setIsCommModalOpen(false)}
                istanzaId={istanzaId}
                nomeProcedura={details.NomeProcedura}
            />
        </div>
    );
};

export default IstanzaDetailView;
