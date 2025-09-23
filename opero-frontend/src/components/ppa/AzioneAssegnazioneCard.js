/**
 * #####################################################################
 * # Card Assegnazione Azione - v1.2 (Input Corretto)
 * # File: opero-frontend/src/components/ppa/AzioneAssegnazioneCard.js
 * #####################################################################
 *
 * @description
 * Componente figlio riutilizzabile che rappresenta la "card" per assegnare
 * una singola azione PPA. La logica di gestione dello stato è stata
 * semplificata per garantire la corretta funzionalità dei campi di input.
 * L'aggiornamento dello stato del genitore avviene direttamente
 * all'interno degli event handler (onChange) per una maggiore reattività e robustezza.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';

const AzioneAssegnazioneCard = ({ azione, onUpdate }) => {
    // --- STATI INTERNI ALLA CARD ---
    const [utentiPerRuolo, setUtentiPerRuolo] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Stato locale per i valori dei campi di input
    const [assignedUserId, setAssignedUserId] = useState('');
    const [scadenza, setScadenza] = useState('');
    const [note, setNote] = useState('');

    // Carica la lista di utenti filtrata per il ruolo di default dell'azione
    const fetchUtenti = useCallback(async (ruoloId) => {
        if (!ruoloId) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const response = await api.get(`/ppa/utenti/by-ruolo/${ruoloId}`);
            setUtentiPerRuolo(response.data.data || []);
        } catch (error) {
            console.error(`Errore nel caricare utenti per ruolo ${ruoloId}`, error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUtenti(azione.ID_RuoloDefault);
    }, [azione.ID_RuoloDefault, fetchUtenti]);

    // --- HANDLER PER L'INPUT UTENTE ---
    // Ogni handler aggiorna sia lo stato locale che quello del genitore.

    const handleUserChange = (e) => {
        const newUserId = e.target.value;
        setAssignedUserId(newUserId);
        onUpdate(azione.ID, {
            utenteId: newUserId,
            dataScadenza: scadenza,
            note: note,
        });
    };

    const handleScadenzaChange = (e) => {
        const newScadenza = e.target.value;
        setScadenza(newScadenza);
        onUpdate(azione.ID, {
            utenteId: assignedUserId,
            dataScadenza: newScadenza,
            note: note,
        });
    };

    const handleNoteChange = (e) => {
        const newNote = e.target.value;
        setNote(newNote);
        onUpdate(azione.ID, {
            utenteId: assignedUserId,
            dataScadenza: scadenza,
            note: newNote,
        });
    };

    return (
        <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
            <p className="font-semibold text-gray-800">{azione.NomeAzione}</p>
            <p className="text-sm text-gray-600 mb-3">{azione.Descrizione}</p>

            {isLoading ? (
                <p className="text-xs text-center text-gray-500">Caricamento utenti...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Selezione Utente */}
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Assegna a</label>
                        <select
                            value={assignedUserId}
                            onChange={handleUserChange}
                            className="w-full p-2 text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">-- Seleziona Utente --</option>
                            {utentiPerRuolo.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.cognome} {user.nome}
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* Data Scadenza Azione */}
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Scadenza Azione</label>
                        <input
                            type="date"
                            value={scadenza}
                            onChange={handleScadenzaChange}
                            className="w-full p-2 text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    {/* Note Particolari */}
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Note</label>
                        <input
                            type="text"
                            value={note}
                            onChange={handleNoteChange}
                            placeholder="Istruzioni specifiche..."
                            className="w-full p-2 text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AzioneAssegnazioneCard;

