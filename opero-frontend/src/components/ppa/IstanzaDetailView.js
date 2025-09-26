/**
 * ======================================================================
 * File: src/components/ppa/IstanzaDetailView.js (v3.3 - con Debugging)
 * ======================================================================
 * @description
 * Aggiunto un console.log per ispezionare i dati ricevuti dall'API
 * e diagnosticare il problema di visualizzazione dell'elenco azioni.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import TeamBacheca from './TeamBacheca';
import ReportComposerModal from './ReportComposerModal';
import { PaperAirplaneIcon, ArrowLeftIcon, UserGroupIcon } from '@heroicons/react/24/solid';
import AzioneCard from './AzioneCard'; // NUOVO IMPORT
const IstanzaDetailView = () => {
    const { istanzaId } = useParams();

    const [istanza, setIstanza] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

        const fetchIstanzaDetails = useCallback(async () => {
        if (!istanzaId) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get(`/ppa/istanze/${istanzaId}/details`);
            setIstanza(response.data.data);
        } catch (err) {
            console.error("Errore nel caricamento dei dettagli dell'istanza:", err);
            setError('Impossibile caricare i dettagli della procedura.');
        } finally {
            setIsLoading(false);
        }
    }, [istanzaId]);


    useEffect(() => {
        fetchIstanzaDetails();
    }, [fetchIstanzaDetails]);

    // Renderizza stati di caricamento ed errore
    if (isLoading) return <div className="p-8 text-center">Caricamento dettagli procedura...</div>;
    if (error) return <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg">{error}</div>;
    if (!istanza) return <div className="p-8 text-center">Nessun dato disponibile per questa procedura.</div>;

    // Calcolo dell'avanzamento basato sui dati reali
    const azioniTotali = istanza.azioni ? istanza.azioni.length : 0;
    const azioniCompletate = istanza.azioni ? istanza.azioni.filter(a => a.StatoDescrizione === 'Completata').length : 0;
    const avanzamento = azioniTotali > 0 ? (azioniCompletate / azioniTotali) * 100 : 0;

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <Link to="/" className="flex items-center text-sm text-blue-600 hover:underline mb-4">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Torna al Monitoraggio
            </Link>

            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{istanza.NomeProcedura}</h1>
                    <p className="text-lg text-gray-600 mt-1">Target: {istanza.TargetEntityName}</p>
                    <p className="text-sm text-gray-500">Creata da: {istanza.NomeCreatore} {istanza.CognomeCreatore}</p>
                </div>
                <button 
                    onClick={() => setIsReportModalOpen(true)}
                    className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg shadow hover:bg-teal-700 transition-colors"
                >
                    <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                    Invia Report di Stato
                </button>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Elenco Azioni</h2>
                          <div className="space-y-4">
                        {/* ## MODIFICA: Usiamo il nuovo componente AzioneCard ## */}
                        {istanza.azioni && istanza.azioni.length > 0 ? istanza.azioni.map(azione => (
                            <AzioneCard 
                                key={azione.ID} 
                                azione={azione}
                                // Passiamo la funzione per ricaricare i dati dopo un aggiornamento
                                onAzioneUpdate={fetchIstanzaDetails}
                            />
                        )) : <p>Nessuna azione definita per questa procedura.</p>}
                    </div>
                </div>
                <aside className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Avanzamento</h3>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                            <div className="bg-blue-600 h-4 rounded-full" style={{ width: `${avanzamento}%` }}></div>
                        </div>
                        <p className="text-right mt-2 font-semibold text-blue-700">{avanzamento.toFixed(0)}% Completato</p>
                        <p className="text-sm text-gray-500 text-center mt-1">({azioniCompletate} di {azioniTotali} azioni)</p>
                    </div>
                    {istanza.TeamID && (
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                <UserGroupIcon className="h-5 w-5 mr-2 text-gray-500"/>
                                Team Associato
                            </h3>
                            <TeamBacheca teamId={istanza.TeamID} />
                        </div>
                    )}
                </aside>
            </section>

            <ReportComposerModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                istanza={istanza}
            />
        </div>
    );
};

export default IstanzaDetailView;

