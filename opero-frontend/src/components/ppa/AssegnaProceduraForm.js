/**
 * #####################################################################
 * # Form Assegnazione Procedura PPA - v3.1 (UI Completa)
 * # File: opero-frontend/src/components/ppa/AssegnaProceduraForm.js
 * #####################################################################
 *
 * @description
 * Componente aggiornato per integrare correttamente il componente figlio
 * AzioneAssegnazioneCard, che gestisce l'input dei dati per ogni
 * singola azione nella Fase 2 del form.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import AzioneAssegnazioneCard from './AzioneAssegnazioneCard'; // Import del componente figlio
import { ArrowRightIcon } from '@heroicons/react/24/solid';

const AssegnaProceduraForm = ({ onClose, onSaveSuccess }) => {
    // --- STATI DI CONTROLLO FLUSSO ---
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
 const [proceduraSelezionataId, setProceduraSelezionataId] = useState('');
    // --- STATI PER DATI DI SUPPORTO (Fase 1) ---
    const [procedureDisponibili, setProcedureDisponibili] = useState([]);
    const [ditteDisponibili, setDitteDisponibili] = useState([]);
    const [utentiEsterni, setUtentiEsterni] = useState([]);
    const [beniDisponibili, setBeniDisponibili] = useState([]);
const [targetEntityId, setTargetEntityId] = useState('');
 const [utentiDisponibili, setUtentiDisponibili] = useState([]);
  const [dataFine, setDataFine] = useState('');
    const [assegnazioni, setAssegnazioni] = useState({});
    // --- STATI PER LA SELEZIONE (Fase 1) ---
    const [proceduraSelezionata, setProceduraSelezionata] = useState('');
    const [targetType, setTargetType] = useState('DITTA');
    const [targetEntitySelezionato, setTargetEntitySelezionato] = useState('');
    const [dataFineProcedura, setDataFineProcedura] = useState('');

    // --- STATI PER L'ASSEGNAZIONE (Fase 2) ---
    const [dettagliProcedura, setDettagliProcedura] = useState(null);
    const [datiAssegnazione, setDatiAssegnazione] = useState({});

    // Carica tutti i dati necessari per i menu a tendina della prima fase
    const fetchInitialData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [procRes, ditteRes, utentiRes, beniRes] = await Promise.all([
                api.get('/ppa/procedure-ditta'),
                api.get('/amministrazione/anagrafiche'),
                api.get('/ppa/utenti/interni'),
                api.get('/benistrumentali')
            ]);
            setProcedureDisponibili(procRes.data.data || []);
            setDitteDisponibili(ditteRes.data.data || []);
            setUtentiEsterni(utentiRes.data.data || []);
            setBeniDisponibili(beniRes.data.data || []);
        } catch (err) {
            setError("Errore nel caricamento dei dati iniziali.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    // Passa alla fase 2: carica i dettagli della procedura selezionata
    const handleProceedToAssignment = async () => {
        if (!proceduraSelezionata || !targetEntitySelezionato) {
            alert("Selezionare una procedura e un target prima di procedere.");
            return;
        }
        setIsLoading(true);
        try {
            const response = await api.get(`/ppa/procedure-ditta/${proceduraSelezionata}`);
            setDettagliProcedura(response.data.data);
            setStep(2);
        } catch (err) {
            setError("Impossibile caricare i dettagli della procedura selezionata.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // Gestisce l'aggiornamento dei dati per una singola azione dal componente figlio
    const handleAzioneUpdate = (azioneId, data) => {
        setDatiAssegnazione(prev => ({
            ...prev,
            [azioneId]: data,
        }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // ##################################################################
        // ## VERIFICA E COSTRUZIONE PAYLOAD COMPLETO                    ##
        // ##################################################################
        
        // 1. Trova il nome della procedura selezionata
        const procedura = procedureDisponibili.find(p => p.ID == proceduraSelezionataId);
        
        // 2. Trova il nome del target selezionato
        let targetName = '';
        if (targetType === 'DITTA') {
            const ditta = ditteDisponibili.find(d => d.id == targetEntityId);
            targetName = ditta ? ditta.ragione_sociale : '';
        } else if (targetType === 'UTENTE') {
            const utente = utentiDisponibili.find(u => u.id == targetEntityId);
            targetName = utente ? `${utente.cognome} ${utente.nome}` : '';
        } else if (targetType === 'BENE') {
            const bene = beniDisponibili.find(b => b.id == targetEntityId);
            targetName = bene ? bene.nome_bene : '';
        }

        const payload = {
            proceduraId: proceduraSelezionataId,
            targetType: targetType,
            targetEntityId: targetEntityId,
            dataFine: dataFine,
            assegnazioni: assegnazioni,
            nomeProcedura: procedura ? procedura.NomeProcedura : 'N/D', // Aggiunto
            nomeTarget: targetName // Aggiunto
        };

        try {
            const response = await api.post('/ppa/istanze', payload);
            if (response.data.success) {
                alert(response.data.message);
                if (onClose) onClose();
            }
        } catch (err) {
            console.error("Errore durante il salvataggio:", err);
            alert(err.response?.data?.message || "Errore imprevisto durante il salvataggio.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderTargetSelect = () => {
        let options = [];
        switch (targetType) {
            case 'DITTA':
                options = ditteDisponibili.map(d => ({ value: d.id, label: d.ragione_sociale }));
                break;
            case 'UTENTE':
                options = utentiEsterni.map(u => ({ value: u.id, label: `${u.cognome} ${u.nome}` }));
                break;
            case 'BENE':
                options = beniDisponibili.map(b => ({ value: b.id, label: b.nome_bene }));
                break;
            default:
                return null;
        }
        return (
            <select value={targetEntitySelezionato} onChange={(e) => setTargetEntitySelezionato(e.target.value)} className="w-full p-2 border rounded-md">
                <option value="">Seleziona un {targetType.toLowerCase()}...</option>
                {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
        );
    };

    if (isLoading) return <p>Caricamento in corso...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <form onSubmit={handleSubmit} className="p-4 space-y-6">
            {step === 1 && (
                <div id="fase-1-selezione">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Fase 1: Selezione Procedura e Target</h2>
                    <fieldset className="border p-4 rounded-md space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Procedura</label>
                            <select value={proceduraSelezionata} onChange={e => setProceduraSelezionata(e.target.value)} className="w-full p-2 border rounded-md">
                                <option value="">Seleziona una procedura...</option>
                                {procedureDisponibili.map(p => <option key={p.ID} value={p.ID}>{p.NomeProcedura}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Target di rifermento </label>
                            <div className="flex rounded-md shadow-sm">
                                <button type="button" onClick={() => setTargetType('DITTA')} className={`px-4 py-2 text-sm font-medium ${targetType === 'DITTA' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'} border rounded-l-md`}>Ditta</button>
                                <button type="button" onClick={() => setTargetType('UTENTE')} className={`px-4 py-2 text-sm font-medium ${targetType === 'UTENTE' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'} border-t border-b`}>Utente</button>
                                <button type="button" onClick={() => setTargetType('BENE')} className={`px-4 py-2 text-sm font-medium ${targetType === 'BENE' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'} border rounded-r-md`}>Bene</button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Target Specifico</label>
                            {renderTargetSelect()}
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Data Chiusura Prevista</label>
                            <input type="date" value={dataFineProcedura} onChange={e => setDataFineProcedura(e.target.value)} className="w-full p-2 border rounded-md"/>
                        </div>
                    </fieldset>
                    <div className="mt-6 flex justify-end">
                        <button type="button" onClick={handleProceedToAssignment} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            Prosegui con l'Assegnazione <ArrowRightIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            )}

            {step === 2 && dettagliProcedura && (
                <div id="fase-2-assegnazione">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Fase 2: Assegnazione Azioni</h2>
                    <div className="space-y-6">
                        {dettagliProcedura.processi.map(processo => (
                            <fieldset key={processo.ID} className="border p-4 rounded-md">
                                <legend className="text-lg font-medium text-gray-700 px-2">{processo.NomeProcesso}</legend>
                                <div className="space-y-4 pt-2">
                                    {processo.azioni.map(azione => (
                                        <AzioneAssegnazioneCard
                                            key={azione.ID}
                                            azione={azione}
                                            onUpdate={handleAzioneUpdate}
                                        />
                                    ))}
                                </div>
                            </fieldset>
                        ))}
                    </div>
                </div>
            )}
            
            <div className="mt-8 flex justify-end gap-4 border-t pt-4">
                <button type="button" onClick={step === 2 ? () => setStep(1) : onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                    {step === 2 ? 'Indietro' : 'Annulla'}
                </button>
                {step === 2 && (
                    <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300">
                        {isSubmitting ? 'Salvataggio...' : 'Salva Assegnazione'}
                    </button>
                )}
            </div>
        </form>
    );
};

export default AssegnaProceduraForm;

