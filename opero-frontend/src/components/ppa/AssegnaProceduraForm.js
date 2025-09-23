/**
 * File: opero-frontend/src/components/ppa/AssegnaProceduraForm.js
 * Descrizione: Componente React per il form di assegnazione di una nuova procedura PPA.
 * Fase: 3.1.3 & 3.1.4 - Render delle Azioni e Controlli di Input
 */
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

const AssegnaProceduraForm = ({ onClose }) => {
    // == STATO DEL COMPONENTE ==
    const [procedureDisponibili, setProcedureDisponibili] = useState([]);
    const [utentiInterni, setUtentiInterni] = useState([]);
    const [targetEntities, setTargetEntities] = useState([]);
    const [azioni, setAzioni] = useState([]);
    const [selectedProceduraDetails, setSelectedProceduraDetails] = useState(null);

    const [proceduraSelezionata, setProceduraSelezionata] = useState('');
    const [targetEntitySelezionato, setTargetEntitySelezionato] = useState('');
    const [dataFineProcedura, setDataFineProcedura] = useState('');
    
    const [datiAssegnazione, setDatiAssegnazione] = useState({});

    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // == CARICAMENTO DATI ==
    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // NOTA: Queste rotte devono esistere nel backend
                const [procedureRes, utentiRes] = await Promise.all([
                    api.get('/ppa/procedureditta'),
                    api.get('/utenti/interni') 
                ]);
                setProcedureDisponibili(procedureRes.data);
                setUtentiInterni(utentiRes.data);
            } catch (err) {
                console.error("Errore nel caricamento dei dati iniziali:", err);
                setError("Impossibile caricare i dati necessari per l'assegnazione.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (!proceduraSelezionata) {
            setAzioni([]);
            setTargetEntities([]);
            setSelectedProceduraDetails(null);
            return;
        }

        const fetchProceduraDetails = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const procedura = procedureDisponibili.find(p => p.ID === parseInt(proceduraSelezionata));
                if (!procedura) throw new Error("Procedura non trovata.");
                setSelectedProceduraDetails(procedura);
                
                // NOTA: Queste rotte devono esistere nel backend
                const [azioniRes, targetRes] = await Promise.all([
                    api.get(`/ppa/azioni/procedura/${proceduraSelezionata}`),
                    api.get(`/ppa/target-entities/${procedura.TargetEntityTypeAllowed}`)
                ]);

                setAzioni(azioniRes.data);
                setTargetEntities(targetRes.data);
                
                setTargetEntitySelezionato('');
                // Inizializza datiAssegnazione con valori di default
                const initialAssegnazioni = {};
                azioniRes.data.forEach(azione => {
                    initialAssegnazioni[azione.ID] = {
                        utenteId: '',
                        scadenza: '',
                        note: ''
                    };
                });
                setDatiAssegnazione(initialAssegnazioni);

            } catch (err) {
                console.error("Errore nel caricamento dei dettagli della procedura:", err);
                setError("Impossibile caricare i dettagli per la procedura selezionata.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProceduraDetails();
    }, [proceduraSelezionata, procedureDisponibili]);

    // == GESTIONE INPUT ==
    const handleAssegnazioneChange = (azioneId, field, value) => {
        setDatiAssegnazione(prev => ({
            ...prev,
            [azioneId]: {
                ...prev[azioneId],
                [field]: value
            }
        }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            const payload = {
                id_procedura_ditta: proceduraSelezionata,
                targetEntityType: selectedProceduraDetails.TargetEntityTypeAllowed,
                targetEntityId: targetEntitySelezionato,
                data_prevista_fine: dataFineProcedura,
                assegnazioni: datiAssegnazione
            };
            await api.post('/ppa/assegna', payload);
            alert('Procedura assegnata con successo!');
            onClose();
        } catch (err) {
            console.error("Errore durante l'invio del form:", err);
            setError(err.response?.data?.message || "Si è verificato un errore. Riprova.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // == RENDER DEL COMPONENTE ==
    if (isLoading && !procedureDisponibili.length) {
        return <div className="p-6">Caricamento...</div>;
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 border-b pb-4">Assegna Nuova Procedura</h2>
            
            {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* SEZIONE 1: Dati Principali */}
                <fieldset className="border p-4 rounded-md">
                    <legend className="text-lg font-semibold px-2">Dati Principali</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <div>
                            <label htmlFor="procedura" className="block text-sm font-medium text-gray-700 mb-1">Scegli Procedura Modello</label>
                            <select id="procedura" value={proceduraSelezionata} onChange={(e) => setProceduraSelezionata(e.target.value)} className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required>
                                <option value="">-- Seleziona --</option>
                                {procedureDisponibili.map(p => <option key={p.ID} value={p.ID}>{p.NomePersonalizzato}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="dataFine" className="block text-sm font-medium text-gray-700 mb-1">Data Prevista Fine</label>
                            <input type="date" id="dataFine" value={dataFineProcedura} onChange={(e) => setDataFineProcedura(e.target.value)} className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
                        </div>
                        {selectedProceduraDetails && (
                            <div className="md:col-span-2">
                                <label htmlFor="targetEntity" className="block text-sm font-medium text-gray-700 mb-1">Applica a {selectedProceduraDetails.TargetEntityTypeAllowed.toLowerCase()}</label>
                                <select id="targetEntity" value={targetEntitySelezionato} onChange={(e) => setTargetEntitySelezionato(e.target.value)} className="block w-full p-2 border border-gray-300 rounded-md shadow-sm" required disabled={!targetEntities.length}>
                                    <option value="">-- Seleziona un target --</option>
                                    {targetEntities.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                </fieldset>
                
                {/* SEZIONE 2: Dettaglio Azioni */}
                {azioni.length > 0 && (
                    <fieldset className="border p-4 rounded-md">
                        <legend className="text-lg font-semibold px-2">Dettaglio Azioni</legend>
                        <div className="space-y-8 mt-4">
                           {azioni.map((azione, index) => (
                               <div key={azione.ID} className="p-4 bg-gray-50 rounded-lg border">
                                   <p className="font-bold text-gray-800">{index + 1}. {azione.NomeAzione}</p>
                                   <p className="text-sm text-gray-600 ml-5 mb-4">{azione.Descrizione}</p>
                                   
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                       {/* Assegna a */}
                                       <div>
                                           <label htmlFor={`utente-${azione.ID}`} className="block text-xs font-medium text-gray-600 mb-1">Assegna a</label>
                                           <select 
                                               id={`utente-${azione.ID}`}
                                               value={datiAssegnazione[azione.ID]?.utenteId || ''}
                                               onChange={(e) => handleAssegnazioneChange(azione.ID, 'utenteId', e.target.value)}
                                               className="block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm"
                                               required
                                           >
                                               <option value="">-- Seleziona utente --</option>
                                               {utentiInterni.map(u => <option key={u.id} value={u.id}>{u.nome} {u.cognome}</option>)}
                                           </select>
                                       </div>
                                       {/* Data Scadenza Azione */}
                                       <div>
                                           <label htmlFor={`scadenza-${azione.ID}`} className="block text-xs font-medium text-gray-600 mb-1">Scadenza (opzionale)</label>
                                           <input 
                                               type="date"
                                               id={`scadenza-${azione.ID}`}
                                               value={datiAssegnazione[azione.ID]?.scadenza || ''}
                                               onChange={(e) => handleAssegnazioneChange(azione.ID, 'scadenza', e.target.value)}
                                               className="block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm"
                                           />
                                       </div>
                                       {/* Note Particolari */}
                                       <div className="md:col-span-2">
                                           <label htmlFor={`note-${azione.ID}`} className="block text-xs font-medium text-gray-600 mb-1">Note Particolari (opzionale)</label>
                                           <textarea
                                               id={`note-${azione.ID}`}
                                               rows="2"
                                               value={datiAssegnazione[azione.ID]?.note || ''}
                                               onChange={(e) => handleAssegnazioneChange(azione.ID, 'note', e.target.value)}
                                               className="block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm"
                                           ></textarea>
                                       </div>
                                   </div>
                               </div>
                           ))}
                        </div>
                    </fieldset>
                )}

                {/* SEZIONE 3: Pulsanti di Azione */}
                <div className="mt-8 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Annulla</button>
                    <button type="submit" disabled={isSubmitting || !azioni.length} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                        {isSubmitting ? 'Salvataggio...' : 'Assegna Procedura'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AssegnaProceduraForm;

