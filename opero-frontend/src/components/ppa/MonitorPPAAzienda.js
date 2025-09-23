/**
 * #####################################################################
 * # Componente Monitoraggio PPA Azienda (v1.1 - con Comunicazione Team)
 * # File: opero-frontend/src/components/ppa/MonitorPPAAzienda.js
 * #####################################################################
 *
 * @description
 * Dashboard di monitoraggio di tutte le istanze di procedura PPA.
 * Integra la possibilità di avviare una comunicazione con il team direttamente
 * dalla lista delle istanze.
 */
import React, { useState } from 'react';
import IstanzaDetailView from './IstanzaDetailView'; // Importa la vista dettaglio esistente
import TeamCommunicationModal from './TeamCommunicationModal'; // NUOVO: Importa il modale di comunicazione
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'; // NUOVO: Importa l'icona

const MonitorPPAAzienda = () => {
    // --- STATO DEL COMPONENTE ---
    const [selectedIstanzaId, setSelectedIstanzaId] = useState(null);
    
    // NUOVO: Stati per gestire il modale di comunicazione
    const [isCommModalOpen, setIsCommModalOpen] = useState(false);
    const [selectedIstanzaForComm, setSelectedIstanzaForComm] = useState(null);

    // Dati mock in attesa dell'endpoint API
    const istanzeMock = [
        { ID: 1, NomeProcedura: 'Onboarding Nuovo Cliente', TargetEntity: 'Ditta Prova S.r.l.', Stato: 'In Corso' },
        { ID: 2, NomeProcedura: 'Chiusura Mensile Contabilità', TargetEntity: 'Ufficio Amministrazione', Stato: 'Completata' },
    ];

    // --- HANDLERS ---
    const handleNavigateToDetail = (id) => {
        setSelectedIstanzaId(id);
    };

    // NUOVO: Funzione per aprire il modale di comunicazione
    const handleOpenCommModal = (istanza, e) => {
        e.stopPropagation(); // Impedisce al click di propagarsi all'elemento <li> e di attivare la navigazione
        setSelectedIstanzaForComm(istanza);
        setIsCommModalOpen(true);
    };

    // NUOVO: Funzione per chiudere il modale
    const handleCloseCommModal = () => {
        setIsCommModalOpen(false);
        setSelectedIstanzaForComm(null);
    };


    // --- RENDER ---
    // Se è stata selezionata un'istanza, mostra la vista di dettaglio
    if (selectedIstanzaId) {
        return <IstanzaDetailView istanzaId={selectedIstanzaId} onBack={() => setSelectedIstanzaId(null)} />;
    }

    // Altrimenti, mostra la lista di monitoraggio
    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Monitoraggio Procedure Aziendali</h2>
            <div className="bg-white shadow rounded-lg">
                <ul className="divide-y divide-gray-200">
                    {istanzeMock.map(istanza => (
                        <li 
                            key={istanza.ID} 
                            className="p-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleNavigateToDetail(istanza.ID)}
                        >
                            {/* Dettagli dell'istanza */}
                            <div className="flex-grow">
                                <p className="font-semibold">{istanza.NomeProcedura}</p>
                                <p className="text-sm text-gray-600">Assegnata a: {istanza.TargetEntity}</p>
                                <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">{istanza.Stato}</span>
                            </div>
                            
                            {/* NUOVO: Pulsante per avviare la comunicazione */}
                            <button
                                onClick={(e) => handleOpenCommModal(istanza, e)}
                                className="ml-4 p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                                title="Comunica con il team"
                            >
                                <ChatBubbleLeftRightIcon className="h-5 w-5" />
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* NUOVO: Render del modale di comunicazione */}
            {selectedIstanzaForComm && (
                <TeamCommunicationModal
                    isOpen={isCommModalOpen}
                    onClose={handleCloseCommModal}
                    istanzaId={selectedIstanzaForComm.ID}
                    nomeProcedura={selectedIstanzaForComm.NomeProcedura}
                />
            )}
        </div>
    );
};

export default MonitorPPAAzienda;

