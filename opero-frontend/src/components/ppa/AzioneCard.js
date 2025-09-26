/**
 * ======================================================================
 * File: src/components/ppa/AzioneCard.js (v1.1 - Dati Allineati)
 * ======================================================================
 * @description
 * CORRETTO: La logica di rendering del menu a tendina ora utilizza il
 * campo 'NomeStato' invece di 'Descrizione', allineandosi alla
 * struttura dei dati inviata dall'API e risolvendo il problema
 * del menu vuoto.
 */
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AzioneCard = ({ azione, onAzioneUpdate }) => {
    const { user } = useAuth();
    const [statiDisponibili, setStatiDisponibili] = useState([]);
    const [statoCorrenteId, setStatoCorrenteId] = useState(azione.ID_Stato);
    const [isUpdating, setIsUpdating] = useState(false);

    // Carica gli stati disponibili al primo render
    useEffect(() => {
        const fetchStati = async () => {
            try {
                const response = await api.get('/ppa/stati-azione');
                setStatiDisponibili(response.data.data);
            } catch (error) {
                console.error("Impossibile caricare gli stati delle azioni", error);
            }
        };
        fetchStati();
    }, []);

    const handleStatoChange = async (event) => {
        const idNuovoStato = parseInt(event.target.value);
        setIsUpdating(true);
        try {
            await api.patch(`/ppa/azioni/${azione.ID}/stato`, { idNuovoStato });
            setStatoCorrenteId(idNuovoStato);
            onAzioneUpdate(); // Notifica il genitore di ricaricare i dati
        } catch (error) {
            console.error("Errore nell'aggiornamento dello stato:", error);
            alert('Non è stato possibile aggiornare lo stato. Assicurati di essere l\'assegnatario corretto.');
        } finally {
            setIsUpdating(false);
        }
    };

    const isAssegnatario = user.id === azione.ID_UtenteAssegnato;

    return (
        <div className="p-4 bg-gray-50 rounded-md border transition-all hover:shadow-sm">
            <p className="font-semibold text-gray-800">{azione.NomeAzione}</p>
            <p className="text-sm text-gray-500 mt-1">
                Assegnato a: <span className="font-medium text-gray-700">{azione.NomeAssegnatario} {azione.CognomeAssegnatario}</span>
            </p>
            <div className="mt-3 flex items-center gap-4">
                <label htmlFor={`stato-${azione.ID}`} className="text-sm font-medium text-gray-600">Stato:</label>
                {isAssegnatario ? (
                    <select
                        id={`stato-${azione.ID}`}
                        value={statoCorrenteId}
                        onChange={handleStatoChange}
                        disabled={isUpdating}
                        className="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                        {statiDisponibili.map(stato => (
                            <option key={stato.ID} value={stato.ID}>
                                {/* ## CORREZIONE: Usiamo 'NomeStato' ## */}
                                {stato.NomeStato}
                            </option>
                        ))}
                    </select>
                ) : (
                    <span className="px-3 py-1 text-sm font-semibold text-white bg-gray-500 rounded-full">
                        {azione.StatoDescrizione}
                    </span>
                )}
            </div>
        </div>
    );
};

export default AzioneCard;

