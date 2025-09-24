/**
 * #####################################################################
 * # Vista Dettaglio Istanza PPA - v1.1 (con Safeguard ID)
 * # File: opero-frontend/src/components/ppa/IstanzaDetailView.js
 * #####################################################################
 *
 * @description
 * AGGIORNATO: Aggiunto un controllo di sicurezza per impedire il caricamento
 * dei dati se l'ID dell'istanza non è presente nell'URL, risolvendo
 * l'errore "Cannot GET /api/ppa/istanze/undefined/details".
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import TeamBacheca from './TeamBacheca';
import ReportComposerModal from './ReportComposerModal'; // NUOVO IMPORT

import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

const IstanzaDetailView = () => {
    const { istanzaId } = useParams();
    const { user } = useAuth();

    const [istanza, setIstanza] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // NUOVO: Stato per il modale del report
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    const fetchIstanzaDetails = useCallback(async () => {
        // ###############################################################
        // ## NUOVO SAFEGUARD: Esegui la chiamata solo se l'ID è valido ##
        // ###############################################################
        if (!istanzaId) {
            setError("ID della procedura non valido o mancante.");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.get(`/ppa/istanze/${istanzaId}/details`);
            setIstanza(response.data.data);
        } catch (err) {
            setError("Impossibile caricare i dettagli della procedura.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [istanzaId]);

    useEffect(() => {
        fetchIstanzaDetails();
    }, [fetchIstanzaDetails]);

    const handleOpenReportModal = () => {
        setIsReportModalOpen(true);
    };

    
    // Funzione per inviare il report al target
    const handleSendReport = async () => {
        if (!window.confirm("Sei sicuro di voler inviare il report di stato al target?")) {
            return;
        }
        try {
            const response = await api.post(`/ppa/istanze/${istanzaId}/invia-report-target`);
            alert(response.data.message);
        } catch (err) {
            alert(err.response?.data?.message || "Errore durante l'invio del report.");
        }
    };
    
    const getStatusColor = (stato) => {
        switch (stato) {
            case 'Completata': return 'bg-green-100 text-green-800';
            case 'Annullata': return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    if (isLoading) return <div className="p-6 text-center">Caricamento in corso...</div>;
    if (error) return <div className="bg-red-100 text-red-700 p-4 rounded-md">{error}</div>;
    if (!istanza) return <div className="p-6 text-center">Nessun dato trovato per questa procedura.</div>;

    const isCreator = user.id === istanza.ID_UtenteCreatore;

     return (
        <div className="p-4 md:p-6 max-w-6xl mx-auto bg-gray-50">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">{istanza.NomeProcedura}</h1>
                    <p>Target: {istanza.TargetEntityName}</p>
                </div>
                {isCreator && (
                    <button onClick={handleOpenReportModal} className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600">
                        <PaperAirplaneIcon className="h-5 w-5" />
                        Componi e Invia Report
                    </button>
                )}
            </header>
                        <main className="space-y-8">
                {/* ##################################################################
                  ## NUOVO: Diagramma Orizzontale della Procedura               ##
                  ################################################################## */}
                <section className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Flusso Operativo</h2>
                    <div className="space-y-6">
                        {istanza.processi && istanza.processi.map(processo => (
                            <div key={processo.ID}>
                                <h3 className="text-lg font-bold text-blue-700 border-l-4 border-blue-500 pl-3">{processo.NomeProcesso}</h3>
                                <div className="mt-3 pl-4 space-y-4">
                                    {processo.azioni.map(azione => (
                                        <div key={azione.ID} className="p-4 bg-gray-50 rounded-md border">
                                            <p className="font-semibold text-gray-900">{azione.NomeAzione}</p>
                                            <p className="text-sm text-gray-600 mt-1 mb-3">{azione.Descrizione}</p>
                                            <div className="border-t pt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <span className="block text-gray-500">Assegnata a</span>
                                                    <span className="font-medium">{azione.NomeAssegnatario} {azione.CognomeAssegnatario}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-gray-500">Stato</span>
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(azione.StatoDescrizione)}`}>
                                                        {azione.StatoDescrizione}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="block text-gray-500">Note</span>
                                                    <span className="font-medium italic">{azione.NoteParticolari || 'Nessuna'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ##################################################################
                  ## Bacheca di Comunicazione (posizionata sotto)               ##
                  ################################################################## */}
                <section className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Bacheca del Team</h2>
               <TeamBacheca teamId={istanza.TeamID} />
                </section>
            </main>

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ... (Sezione dettagli e avanzamento) ... */}
                <aside className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-3">Bacheca del Team</h2>
                    <TeamBacheca teamId={istanza.TeamID} />
                </aside>
            </main>

            {/* Inclusione del nuovo modale */}
            <ReportComposerModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                istanza={istanza}
            />
        </div>
    );
};

export default IstanzaDetailView;

