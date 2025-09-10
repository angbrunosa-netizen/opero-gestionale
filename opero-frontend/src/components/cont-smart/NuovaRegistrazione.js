// #####################################################################
// # Componente Registrazioni Contabili v3.0 (Fix Calcolo e UI IVA)
// # File: opero-gestionale/opero-frontend/src/components/cont-smart/NuovaRegistrazione.js
// #####################################################################

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { api } from '../../services/api';
import { PlusIcon, TrashIcon, ArrowDownTrayIcon, PencilSquareIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

const NuovaRegistrazione = () => {
    // --- STATO DEL COMPONENTE ---
    const [funzioni, setFunzioni] = useState([]);
    const [pianoConti, setPianoConti] = useState([]);
    // --- NOVITÀ: 'anagrafiche' ora conterrà la lista filtrata ---
    const [anagrafiche, setAnagrafiche] = useState([]);
    const [aliquoteIva, setAliquoteIva] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAnagraficheLoading, setIsAnagraficheLoading] = useState(false);

    // --- STATO PER LA UI E RIFERIMENTI ---
    const [isEditing, setIsEditing] = useState(false);
    const [activeField, setActiveField] = useState(null);
    const formRef = useRef(null);

    // --- Stato Iniziale e di Lavoro ---
    const initialState = useMemo(() => ({
        selectedFunzioneId: '',
        datiDocumento: {
            data_registrazione: new Date().toISOString().slice(0, 10),
            id_anagrafica: '',
            num_documento: '',
            data_documento: '',
            totale_documento: '',
            descrizione: '',
        },
        righeScrittura: [],
        scomposizioneIva: [{ id: Date.now(), imponibile: '', id_aliquota: '' }],
    }), []);
    
    const [state, setState] = useState(initialState);
    const { selectedFunzioneId, datiDocumento, righeScrittura, scomposizioneIva } = state;
    
    // --- Calcoli Derivati e Validazioni (useMemo) ---
    const { sbilancioDocumento, totaleImponibile, totaleIva } = useMemo(() => {
        const totaleIvaCalc = scomposizioneIva.reduce((acc, riga) => {
            const imponibile = parseFloat(riga.imponibile) || 0;
            const aliquotaData = aliquoteIva.find(a => a.id === parseInt(riga.id_aliquota));
            const percAliquota = aliquotaData ? parseFloat(aliquotaData.aliquota) : 0;
            return acc + (imponibile * percAliquota / 100);
        }, 0);
        
        const totaleImponibileCalc = scomposizioneIva.reduce((acc, riga) => acc + (parseFloat(riga.imponibile) || 0), 0);
        const totaleDocCalcolato = totaleImponibileCalc + totaleIvaCalc;
        const totaleDocInput = parseFloat(datiDocumento.totale_documento) || 0;
        const sbilancio = totaleDocInput - totaleDocCalcolato;

        return {
            sbilancioDocumento: sbilancio,
            totaleImponibile: totaleImponibileCalc,
            totaleIva: totaleIvaCalc
        };
    }, [scomposizioneIva, aliquoteIva, datiDocumento.totale_documento]);

    const { totaleDare, totaleAvere, sbilancioScrittura } = useMemo(() => {
        const dare = righeScrittura.reduce((acc, riga) => acc + (parseFloat(riga.importo_dare) || 0), 0);
        const avere = righeScrittura.reduce((acc, riga) => acc + (parseFloat(riga.importo_avere) || 0), 0);
        return { totaleDare: dare, totaleAvere: avere, sbilancioScrittura: dare - avere };
    }, [righeScrittura]);
    
    const canGenerateScrittura = useMemo(() => {
        return Math.abs(sbilancioDocumento) < 0.01 && parseFloat(datiDocumento.totale_documento) > 0;
    }, [sbilancioDocumento, datiDocumento.totale_documento]);

    const canSave = useMemo(() => {
        const isScritturaQuadrata = Math.abs(sbilancioScrittura) < 0.01;
        const hasMinRighe = righeScrittura.length >= 2;
        const hasValore = totaleDare > 0;
        return isScritturaQuadrata && hasMinRighe && hasValore;
    }, [sbilancioScrittura, righeScrittura.length, totaleDare]);

    const selectedFunzione = useMemo(() => {
        return funzioni.find(f => f.id === parseInt(selectedFunzioneId));
    }, [funzioni, selectedFunzioneId]);

    // --- NOVITÀ: La fetch iniziale non carica più tutte le anagrafiche ---
    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [funzioniRes, pdcRes, ivaRes] = await Promise.all([
                api.get('/contsmart/funzioni'),
                api.get('/contsmart/pdc-tree'),
                api.get('/contsmart/aliquote-iva')
            ]);
            
            const flattenPdcTree = (nodes) => {
                const flatList = [];
                const traverse = (node, level) => {
                    flatList.push({
                        id: node.id,
                        codice: node.codice,
                        descrizione: `${'--'.repeat(level)} ${node.descrizione}`,
                        isSelectable: node.tipo === 'Sottoconto'
                    });
                    if (node.children) {
                        node.children.forEach(child => traverse(child, level + 1));
                    }
                };
                nodes.forEach(node => traverse(node, 0));
                return flatList;
            };

            setFunzioni(funzioniRes.data || []); 
            const flattenedPdc = flattenPdcTree(pdcRes.data.data || []);
            setPianoConti(flattenedPdc);
            setAliquoteIva(ivaRes.data.data || []);
            
            setError('');
        } catch (err) {
            setError('Impossibile caricare i dati necessari.');
            console.error("Dettaglio errore fetchData:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // --- NOVITÀ: useEffect per caricare le anagrafiche filtrate quando la funzione cambia ---
    useEffect(() => {
        const fetchFilteredAnagrafiche = async () => {
            if (selectedFunzione && selectedFunzione.tipo_funzione === 'Finanziaria' && selectedFunzione.categoria) {
                setIsAnagraficheLoading(true);
                try {
                    const res = await api.get(`/contsmart/anagrafiche-filtrate?categoria=${selectedFunzione.categoria}`);
                    setAnagrafiche(res.data.data || []);
                } catch (error) {
                    console.error("Errore nel caricamento delle anagrafiche filtrate:", error);
                    setAnagrafiche([]); // Svuota in caso di errore
                } finally {
                    setIsAnagraficheLoading(false);
                }
            } else {
                setAnagrafiche([]); // Svuota se la funzione non è adatta o non ha categoria
            }
        };

        fetchFilteredAnagrafiche();
    }, [selectedFunzione]);


    const handleNewRegistration = useCallback(() => {
        setState(initialState);
        setIsEditing(true);
        setActiveField('selectedFunzioneId');
        setTimeout(() => document.getElementsByName('selectedFunzioneId')[0]?.focus(), 0);
    }, [initialState]);
    
    const handleSaveRegistrazione = useCallback(async () => {
        if (!canSave) {
            alert("La scrittura non è bilanciata o è incompleta.");
            return;
        }
        try {
            const payload = {
                testata: { ...datiDocumento, id_funzione: selectedFunzioneId },
                righe: righeScrittura
            };
            await api.post('/contsmart/registrazioni', payload);
            alert('Registrazione salvata con successo!');
            setIsEditing(false);
            setState(initialState);
        } catch (error) {
            console.error('Errore nel salvataggio:', error);
            alert('Errore durante il salvataggio della registrazione.');
        }
    }, [canSave, datiDocumento, selectedFunzioneId, righeScrittura, initialState]);
    
    const handleCancelRegistration = () => {
        setIsEditing(false);
        setState(initialState);
        setActiveField(null);
    };

    const handleFunzioneChange = (e) => {
        const id = e.target.value;
        const funzioneScelta = funzioni.find(f => f.id === parseInt(id));
        setState(prev => ({
            ...initialState,
            selectedFunzioneId: id,
            datiDocumento: {
                ...initialState.datiDocumento,
                descrizione: funzioneScelta?.nome_funzione || '',
            }
        }));
        
        if (funzioneScelta && funzioneScelta.tipo_funzione !== 'Finanziaria') {
            const righeVuote = [
                { id: Date.now(), id_conto: '', descrizione: '', importo_dare: '', importo_avere: '' },
                { id: Date.now() + 1, id_conto: '', descrizione: '', importo_dare: '', importo_avere: '' }
            ];
            setState(prev => ({ ...prev, righeScrittura: righeVuote }));
        }
        setActiveField('data_registrazione');
    };

    const handleDocChange = (e) => {
        const { name, value } = e.target;
        setState(prev => ({ ...prev, datiDocumento: { ...prev.datiDocumento, [name]: value } }));
    };

    const handleIvaChange = (id, field, value) => {
        setState(prev => ({ ...prev, scomposizioneIva: prev.scomposizioneIva.map(r => r.id === id ? { ...r, [field]: value } : r) }));
    };

    const addIvaRow = () => {
        setState(prev => ({ ...prev, scomposizioneIva: [...prev.scomposizioneIva, { id: Date.now(), imponibile: '', id_aliquota: '' }] }));
    };
    
    const removeIvaRow = (id) => {
        setState(prev => ({ ...prev, scomposizioneIva: prev.scomposizioneIva.filter(r => r.id !== id) }));
    };

    const handleRigaChange = (id, field, value) => {
        setState(prev => ({ ...prev, righeScrittura: prev.righeScrittura.map(r => r.id === id ? { ...r, [field]: value } : r) }));
    };

    const addRigaScrittura = () => {
        setState(prev => ({ ...prev, righeScrittura: [...prev.righeScrittura, { id: Date.now(), id_conto: '', descrizione: '', importo_dare: '', importo_avere: '' }] }));
    };

    const removeRigaScrittura = (id) => {
        setState(prev => ({ ...prev, righeScrittura: prev.righeScrittura.filter(r => r.id !== id) }));
    };

    const handleGenerateScrittura = () => {
        if (!canGenerateScrittura || !selectedFunzione || !selectedFunzione.righe_predefinite) {
            alert("Impossibile generare: funzione non selezionata o non configurata correttamente.");
            return;
        }

        const righePredefinite = selectedFunzione.righe_predefinite;
        const righeDare = righePredefinite.filter(r => r.dare_avere === 'D');
        const righeAvere = righePredefinite.filter(r => r.dare_avere === 'A');
        let righeGenerate = [];

        if (righeAvere.length === 1 && righeDare.length >= 2) {
            righeGenerate.push({ id: Date.now(), id_conto: righeAvere[0].id_conto, descrizione: righeAvere[0].descrizione_riga_predefinita || `Fatt. ${datiDocumento.num_documento}`, importo_dare: '', importo_avere: parseFloat(datiDocumento.totale_documento).toFixed(2) });
            righeGenerate.push({ id: Date.now() + 1, id_conto: righeDare[0].id_conto, descrizione: righeDare[0].descrizione_riga_predefinita || 'Costo acquisto', importo_dare: totaleImponibile.toFixed(2), importo_avere: '' });
            if (totaleIva > 0) {
                righeGenerate.push({ id: Date.now() + 2, id_conto: righeDare[1].id_conto, descrizione: righeDare[1].descrizione_riga_predefinita || 'IVA ns/credito', importo_dare: totaleIva.toFixed(2), importo_avere: '' });
            }
        } else if (righeDare.length === 1 && righeAvere.length >= 2) {
            righeGenerate.push({ id: Date.now(), id_conto: righeDare[0].id_conto, descrizione: righeDare[0].descrizione_riga_predefinita || `Fatt. ${datiDocumento.num_documento}`, importo_dare: parseFloat(datiDocumento.totale_documento).toFixed(2), importo_avere: '' });
            righeGenerate.push({ id: Date.now() + 1, id_conto: righeAvere[0].id_conto, descrizione: righeAvere[0].descrizione_riga_predefinita || 'Ricavo vendita', importo_dare: '', importo_avere: totaleImponibile.toFixed(2) });
            if (totaleIva > 0) {
                righeGenerate.push({ id: Date.now() + 2, id_conto: righeAvere[1].id_conto, descrizione: righeAvere[1].descrizione_riga_predefinita || 'IVA ns/debito', importo_dare: '', importo_avere: totaleIva.toFixed(2) });
            }
        } else {
            alert("Configurazione della funzione non valida per la generazione automatica. (Es. Fattura Acquisto richiede 1 conto in Avere e 2 in Dare).");
            return;
        }
        
        setState(prev => ({...prev, righeScrittura: righeGenerate }));
    };

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'F1' && !isEditing) { event.preventDefault(); handleNewRegistration(); }
            if (event.key === 'F12' && isEditing && canSave) { event.preventDefault(); handleSaveRegistrazione(); }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isEditing, canSave, handleNewRegistration, handleSaveRegistrazione]);
    
    useEffect(() => {
        const handleNavKeyDown = (event) => {
            if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
            const focusable = Array.from(formRef.current?.querySelectorAll('input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])') ?? []);
            const currentIndex = focusable.findIndex(el => el === document.activeElement);
            if (currentIndex === -1) return;
            event.preventDefault();
            const nextIndex = (event.key === 'ArrowDown') ? (currentIndex + 1) % focusable.length : (currentIndex - 1 + focusable.length) % focusable.length;
            focusable[nextIndex]?.focus();
        };
        const form = formRef.current;
        form?.addEventListener('keydown', handleNavKeyDown);
        return () => form?.removeEventListener('keydown', handleNavKeyDown);
    }, [isEditing]);

    const handleFocus = (e) => setActiveField(e.target.name);
    const getFieldClass = (fieldName) => {
        const baseClass = "block w-full text-sm rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500";
        return (activeField === fieldName) ? `${baseClass} ring-2 ring-blue-500` : baseClass;
    };

    if (isLoading) return <div className="text-center p-8"><ArrowPathIcon className="h-6 w-6 animate-spin mx-auto" /> Caricamento dati...</div>;
    if (error) return <div className="text-red-600 bg-red-100 p-4 rounded-md">Errore: {error}</div>;

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-slate-700 mb-4">Nuova Registrazione Contabile</h2>
            
            {!isEditing ? (
                <div className="text-center py-10"><button onClick={handleNewRegistration} className="px-6 py-3 rounded-lg text-white font-semibold bg-blue-600 hover:bg-blue-700 flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl transition-shadow"><PencilSquareIcon className="h-5 w-5"/> Immetti Nuova Scrittura (F1)</button></div>
            ) : (
                <div ref={formRef}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-slate-50 mb-6">
                        <div className="md:col-span-2">
                             <label htmlFor="selectedFunzioneId" className="block text-sm font-medium text-slate-700 mb-1">Tipo Scrittura</label>
                             <select id="selectedFunzioneId" name="selectedFunzioneId" value={selectedFunzioneId} onChange={handleFunzioneChange} onFocus={handleFocus} className={getFieldClass('selectedFunzioneId')}>
                                <option value="">-- Seleziona una funzione --</option>
                                {funzioni.map(f => <option key={f.id} value={f.id}>{f.nome_funzione}</option>)}
                            </select>
                        </div>
                        <div className="flex items-end"><button onClick={handleCancelRegistration} className="px-4 py-2 w-full rounded-md text-sm text-slate-700 bg-slate-200 hover:bg-slate-300 flex items-center justify-center gap-2"><XMarkIcon className="h-4 w-4"/> Annulla</button></div>
                    </div>

                    {selectedFunzioneId && (
                    <>
                        {selectedFunzione?.tipo_funzione === 'Finanziaria' && (
                        <>
                        <fieldset className="border rounded-lg p-4 mb-6">
                            <legend className="px-2 font-semibold text-slate-600">Dati Documento e Testata</legend>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div><label htmlFor="data_registrazione" className="block text-sm font-medium text-slate-700 mb-1">Data Registrazione</label><input type="date" name="data_registrazione" value={datiDocumento.data_registrazione} onChange={handleDocChange} onFocus={handleFocus} className={getFieldClass('data_registrazione')} /></div>
                                {/* --- NOVITÀ: Select per anagrafica aggiornata --- */}
                                <div className="md:col-span-3">
                                    <label htmlFor="id_anagrafica" className="block text-sm font-medium text-slate-700 mb-1">
                                        {selectedFunzione?.categoria === 'Acquisto' ? 'Fornitore' : selectedFunzione?.categoria === 'Vendita' ? 'Cliente' : 'Anagrafica'}
                                    </label>
                                    <select name="id_anagrafica" value={datiDocumento.id_anagrafica} onChange={handleDocChange} onFocus={handleFocus} className={getFieldClass('id_anagrafica')} disabled={isAnagraficheLoading}>
                                        <option value="">{isAnagraficheLoading ? 'Caricamento...' : '-- Seleziona --'}</option>
                                        {anagrafiche.map(a => (
                                            <option key={a.id} value={a.id}>
                                                {`${a.ragione_sociale} (${a.citta || 'N/D'}, P.IVA: ${a.partita_iva || 'N/D'})`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div><label htmlFor="num_documento" className="block text-sm font-medium text-slate-700 mb-1">Num. Documento</label><input type="text" name="num_documento" value={datiDocumento.num_documento} onChange={handleDocChange} onFocus={handleFocus} className={getFieldClass('num_documento')} /></div>
                                <div><label htmlFor="data_documento" className="block text-sm font-medium text-slate-700 mb-1">Data Documento</label><input type="date" name="data_documento" value={datiDocumento.data_documento} onChange={handleDocChange} onFocus={handleFocus} className={getFieldClass('data_documento')} /></div>
                                <div><label htmlFor="totale_documento" className="block text-sm font-medium text-slate-700 mb-1">Totale Documento</label><input type="number" step="0.01" name="totale_documento" value={datiDocumento.totale_documento} onChange={handleDocChange} onFocus={handleFocus} className={getFieldClass('totale_documento')} /></div>
                                <div className="md:col-span-4"><label htmlFor="descrizione" className="block text-sm font-medium text-slate-700 mb-1">Descrizione Registrazione</label><input type="text" name="descrizione" value={datiDocumento.descrizione} onChange={handleDocChange} onFocus={handleFocus} className={getFieldClass('descrizione')} /></div>
                            </div>
                        </fieldset>
                        <fieldset className="border rounded-lg p-4 mb-6">
                            <legend className="px-2 font-semibold text-slate-600">Scomposizione IVA e Quadratura</legend>
                            <div className="grid grid-cols-12 gap-2 mb-1 text-xs font-bold text-slate-600"><div className="col-span-4">Imponibile</div><div className="col-span-4">Aliquota</div><div className="col-span-2">Imposta</div></div>
                            {scomposizioneIva.map((riga) => {
                                const imponibile = parseFloat(riga.imponibile) || 0;
                                const aliquotaData = aliquoteIva.find(a => a.id === parseInt(riga.id_aliquota));
                                const percAliquota = aliquotaData ? parseFloat(aliquotaData.aliquota) : 0;
                                const impostaCalcolata = (imponibile * percAliquota / 100).toFixed(2);
                                return (
                                <div key={riga.id} className="grid grid-cols-12 gap-2 mb-2 items-center">
                                    <div className="col-span-4"><input type="number" placeholder="Imponibile" value={riga.imponibile} onChange={e => handleIvaChange(riga.id, 'imponibile', e.target.value)} className="block w-full text-sm rounded-md border-slate-300"/></div>
                                    <div className="col-span-4"><select value={riga.id_aliquota} onChange={e => handleIvaChange(riga.id, 'id_aliquota', e.target.value)} className="block w-full text-sm rounded-md border-slate-300"><option value="">-- Aliquota IVA --</option>{aliquoteIva.map(a => <option key={a.id} value={a.id}>{a.descrizione || `Aliquota ${a.aliquota}%`}</option>)}</select></div>
                                    <div className="col-span-2"><input type="text" value={impostaCalcolata} disabled className="block w-full text-sm rounded-md border-slate-300 bg-slate-100 text-right"/></div>
                                    <div className="col-span-2 text-center">{scomposizioneIva.length > 1 && <button onClick={() => removeIvaRow(riga.id)} className="p-1 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon className="h-4 w-4"/></button>}</div>
                                </div>
                            )})}
                            <button onClick={addIvaRow} className="text-sm text-blue-600 flex items-center gap-1 mt-2"><PlusIcon className="h-4 w-4"/> Aggiungi riga IVA</button>
                            <div className="mt-4 p-3 bg-slate-100 rounded-md text-sm"><p>Sbilancio Documento: <span className={`font-bold ${Math.abs(sbilancioDocumento) > 0.01 ? 'text-red-600' : 'text-green-600'}`}>{sbilancioDocumento.toFixed(2)}</span></p></div>
                            <div className="mt-2 text-right"><button onClick={handleGenerateScrittura} disabled={!canGenerateScrittura} className="px-4 py-2 text-sm rounded-md text-white font-semibold bg-green-600 hover:bg-green-700 disabled:bg-slate-400">Genera Scrittura P.D.</button></div>
                        </fieldset>
                        </>
                        )}
                        <fieldset className="border rounded-lg p-4">
                             <legend className="px-2 font-semibold text-slate-600">Scrittura in Partita Doppia</legend>
                             <table className="w-full text-sm text-left text-slate-500">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-100"><tr><th className="px-2 py-2 w-3/12">Conto</th><th className="px-2 py-2 w-4/12">Descrizione</th><th className="px-2 py-2 w-2/12">Dare</th><th className="px-2 py-2 w-2/12">Avere</th><th className="px-2 py-2 w-1/12"></th></tr></thead>
                                <tbody>
                                {righeScrittura.map(riga => (
                                    <tr key={riga.id} className="bg-white border-b">
                                        <td><select value={riga.id_conto} onChange={e => handleRigaChange(riga.id, 'id_conto', e.target.value)} className="w-full border-0 text-sm focus:ring-0"><option value="">-- Conto --</option>{pianoConti.map(c=><option key={c.id} value={c.id} disabled={!c.isSelectable}>{c.descrizione}</option>)}</select></td>
                                        <td><input type="text" value={riga.descrizione} onChange={e => handleRigaChange(riga.id, 'descrizione', e.target.value)} className="w-full border-0 text-sm focus:ring-0"/></td>
                                        <td><input type="number" step="0.01" value={riga.importo_dare} onChange={e => handleRigaChange(riga.id, 'importo_dare', e.target.value)} className="w-full border-0 text-sm focus:ring-0 text-right"/></td>
                                        <td><input type="number" step="0.01" value={riga.importo_avere} onChange={e => handleRigaChange(riga.id, 'importo_avere', e.target.value)} className="w-full border-0 text-sm focus:ring-0 text-right"/></td>
                                        <td><button onClick={() => removeRigaScrittura(riga.id)} className="p-1 text-red-500"><TrashIcon className="h-4 w-4"/></button></td>
                                    </tr>
                                ))}
                                </tbody>
                                <tfoot>
                                    <tr><td colSpan="5"><button onClick={addRigaScrittura} className="text-sm text-blue-600 flex items-center gap-1 mt-2"><PlusIcon className="h-4 w-4"/> Aggiungi riga libera</button></td></tr>
                                    <tr className="border-t-2"><td colSpan="2" className="p-2 text-right font-bold">Sbilancio P.D.: <span className={`font-mono ${Math.abs(sbilancioScrittura) > 0.01 ? 'text-red-600' : 'text-green-600'}`}>{sbilancioScrittura.toFixed(2)}</span></td><td className="p-2 text-right font-bold font-mono bg-slate-100">{totaleDare.toFixed(2)}</td><td className="p-2 text-right font-bold font-mono bg-slate-100">{totaleAvere.toFixed(2)}</td><td></td></tr>
                                </tfoot>
                             </table>
                        </fieldset>
                        <div className="mt-6 flex justify-end"><button onClick={handleSaveRegistrazione} disabled={!canSave} className="px-6 py-3 rounded-lg text-white font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"><ArrowDownTrayIcon className="h-5 w-5"/> Salva Registrazione (F12)</button></div>
                    </>
                    )}
                </div>
            )}
        </div>
    );
};
export default NuovaRegistrazione;


