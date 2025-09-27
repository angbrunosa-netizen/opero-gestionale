/**
 * ======================================================================
 * File: src/components/ppa/AzioneCard.js (v2.0 - Interattiva e Completa)
 * ======================================================================
 * @description
 * AGGIORNATO: La card ora è uno strumento di lavoro completo.
 * - Mostra la descrizione dettagliata dell'azione.
 * - Permette all'utente assegnatario di aggiungere e salvare note.
 */
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { CalendarDaysIcon ,CheckCircleIcon} from '@heroicons/react/24/outline'; // NUOVO IMPORT

const AzioneCard = ({ azione, onAzioneUpdate }) => {
    const { user } = useAuth();
    const [statiDisponibili, setStatiDisponibili] = useState([]);
    const [statoCorrenteId, setStatoCorrenteId] = useState(azione.ID_Stato);
    const [isUpdating, setIsUpdating] = useState(false);

    // Nuovi stati per la gestione delle note
    const [noteText, setNoteText] = useState(azione.Note || '');
    const [isSavingNote, setIsSavingNote] = useState(false);

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
            onAzioneUpdate();
        } catch (error) {
            console.error("Errore nell'aggiornamento dello stato:", error);
            alert('Non è stato possibile aggiornare lo stato.');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSaveNote = async () => {
        setIsSavingNote(true);
        try {
            await api.patch(`/ppa/azioni/${azione.ID}/note`, { note: noteText });
            onAzioneUpdate(); // Ricarica i dati per mostrare le note salvate
        } catch (error) {
            console.error("Errore nel salvataggio delle note:", error);
            alert('Non è stato possibile salvare le note.');
        } finally {
            setIsSavingNote(false);
        }
    };

    const isAssegnatario = user.id === azione.ID_UtenteAssegnato;

    return (
        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm transition-all hover:shadow-md">
            {/* Nome e Descrizione Azione */}
            <p className="font-semibold text-lg text-gray-800">{azione.NomeAzione}</p>
            {azione.DescrizioneAzione && (
                 <p className="text-sm text-gray-600 mt-1">{azione.DescrizioneAzione}</p>
            )}
            {/* ## NUOVA SEZIONE: Visualizzazione delle date ## */}
            <div className="mt-2 flex items-center text-xs text-gray-500">
                <CalendarDaysIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                <span>
                    Inizio: {azione.DataInizio ? new Date(azione.DataInizio).toLocaleDateString('it-IT') : 'N/D'}
                </span>
                <span className="mx-2">|</span>
                <span>
                    Fine Prevista: {azione.DataPrevistaFine ? new Date(azione.DataPrevistaFine).toLocaleDateString('it-IT') : 'N/D'}
                </span>
            </div>
           {/* ## LOGICA DI VISUALIZZAZIONE CORRETTA ## */}
                {/* Verrà mostrata solo se il campo 'DataCompletamento' non è nullo. */}
                {azione.DataCompletamento && (
                    <div className="flex items-center text-green-600 font-semibold">
                        <CheckCircleIcon className="h-4 w-4 mr-1.5" />
                        <span>Completata il: {new Date(azione.DataCompletamento).toLocaleDateString('it-IT')}</span>
                    </div>
                )}
            {/* Assegnatario */}
            <p className="text-sm text-gray-500 mt-2">
                Assegnato a: <span className="font-medium text-gray-700">{azione.NomeAssegnatario} {azione.CognomeAssegnatario}</span>
            </p>

            {/* Gestione Note */}
            <div className="mt-4">
                <label className="text-sm font-medium text-gray-700">Note di Lavorazione</label>
                {isAssegnatario ? (
                    <>
                        <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Aggiungi le tue note qui..."
                            rows="3"
                            className="mt-1 w-full p-2 border rounded-md text-sm shadow-inner"
                        ></textarea>
                        <button 
                            onClick={handleSaveNote}
                            disabled={isSavingNote}
                            className="mt-2 px-3 py-1 bg-gray-200 text-gray-800 text-xs font-semibold rounded-md hover:bg-gray-300 disabled:bg-gray-100"
                        >
                            {isSavingNote ? 'Salvataggio...' : 'Salva Note'}
                        </button>
                    </>
                ) : (
                    <div className="mt-1 p-2 border-l-4 border-gray-200 bg-gray-50 rounded-r-md">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{azione.Note || 'Nessuna nota presente.'}</p>
                    </div>
                )}
            </div>

            {/* Gestione Stato */}
            <div className="mt-4 pt-4 border-t flex items-center gap-4">
                <label htmlFor={`stato-${azione.ID}`} className="text-sm font-medium text-gray-700">Stato:</label>
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
