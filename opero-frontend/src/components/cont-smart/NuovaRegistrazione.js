import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { PencilSquareIcon, XMarkIcon, PlusIcon, TrashIcon, ArrowDownTrayIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { api } from '../../services/api';
import DynamicReportTable from '../../shared/DynamicReportTable';

const NuovaRegistrazione = () => {
    // --- STATO DEL COMPONENTE ---
    const [funzioni, setFunzioni] = useState([]);
    const [pianoConti, setPianoConti] = useState([]);
    const [pianoContiMap, setPianoContiMap] = useState(null);
    const [pdcTree, setPdcTree] = useState(null);
    const [aliquoteIva, setAliquoteIva] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [anagrafiche, setAnagrafiche] = useState([]);
    const [isAnagraficheLoading, setIsAnagraficheLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [activeField, setActiveField] = useState(null);
    const formRef = useRef(null);

    const [isElencoMode, setIsElencoMode] = useState(false);
    const [elencoData, setElencoData] = useState([]);
    const [isElencoLoading, setIsElencoLoading] = useState(false);
    const [selectedElencoIds, setSelectedElencoIds] = useState([]);
    const [reportTitle, setReportTitle] = useState('Elenco Partite');
    const [originatoDaElenco, setOriginatoDaElenco] = useState(false);


    const initialState = useMemo(() => ({
        selectedFunzioneId: '',
        datiDocumento: {
            data_registrazione: new Date().toISOString().slice(0, 10),
            id_anagrafica: '',
            numero_documento: '',
            data_documento: '',
            data_scadenza: '',
            totale_documento: '',
            descrizione: '',
        },
        righeScrittura: [],
        scomposizioneIva: [{ id: Date.now(), imponibile: '', id_aliquota: '' }],
    }), []);

    const [state, setState] = useState(initialState);
    const { selectedFunzioneId, datiDocumento, righeScrittura, scomposizioneIva } = state;

    const selectedFunzione = useMemo(() => funzioni.find(f => f.id === parseInt(selectedFunzioneId)), [funzioni, selectedFunzioneId]);

    // --- CALCOLI DERIVATI ---
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
        return { sbilancioDocumento: sbilancio, totaleImponibile: totaleImponibileCalc, totaleIva: totaleIvaCalc };
    }, [scomposizioneIva, aliquoteIva, datiDocumento.totale_documento]);

    const { totaleDare, totaleAvere, sbilancioScrittura } = useMemo(() => {
        const dare = righeScrittura.reduce((acc, riga) => acc + (parseFloat(riga.importo_dare) || 0), 0);
        const avere = righeScrittura.reduce((acc, riga) => acc + (parseFloat(riga.importo_avere) || 0), 0);
        return { totaleDare: Math.round(dare * 100) / 100, totaleAvere: Math.round(avere * 100) / 100, sbilancioScrittura: Math.round((dare - avere) * 100) / 100 };
    }, [righeScrittura]);
    
    const selectedTotal = useMemo(() => {
        return elencoData
            .filter(p => selectedElencoIds.includes(p.id))
            .reduce((sum, item) => sum + Number(item.importo), 0);
    }, [selectedElencoIds, elencoData]);


    const canGenerateScrittura = useMemo(() => Math.abs(sbilancioDocumento) < 0.01 && parseFloat(datiDocumento.totale_documento) > 0, [sbilancioDocumento, datiDocumento.totale_documento]);
    const canSave = useMemo(() => Math.abs(sbilancioScrittura) < 0.01 && righeScrittura.length >= 2 && totaleDare > 0, [sbilancioScrittura, righeScrittura.length, totaleDare]);

    // --- CARICAMENTO DATI ---
    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [funzioniRes, pdcRes, ivaRes] = await Promise.all([
                api.get('/contsmart/funzioni-contabili'),
                api.get('/contsmart/pdc-tree'),
                api.get('/contsmart/aliquote-iva'),
            ]);

            const rawPdcTree = pdcRes.data?.data || [];
            setPdcTree(rawPdcTree);

            const createPdcMap = (nodes) => {
                const map = {};
                const traverse = (node, parent) => {
                    map[node.id] = { id: node.id, id_padre: node.id_padre, natura: node.natura || parent?.natura };
                    if (node.children) node.children.forEach(child => traverse(child, map[node.id]));
                };
                if (Array.isArray(nodes)) nodes.forEach(node => traverse(node, null));
                return map;
            };
            setPianoContiMap(createPdcMap(rawPdcTree));

            const flattenPdcTree = (nodes) => {
                const flatList = [];
                const traverse = (node, level) => {
                    flatList.push({ id: node.id, descrizione: `${'--'.repeat(level)} ${node.descrizione}`, isSelectable: node.tipo === 'Sottoconto' });
                    if (node.children) node.children.forEach(child => traverse(child, level + 1));
                };
                if (Array.isArray(nodes)) nodes.forEach(node => traverse(node, 0));
                return flatList;
            };
            setPianoConti(flattenPdcTree(rawPdcTree));

            setFunzioni(funzioniRes.data.data || []);
            setAliquoteIva(ivaRes.data.data || []);
            setError('');
        } catch (err) { setError('Impossibile caricare i dati necessari.'); } finally { setIsLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const findSottocontiIds = useCallback((parentNodeId, tree) => {
        if (!tree) return [];
        let ids = [];
        const findNode = (id, nodes) => {
            for (const node of nodes) {
                if (node.id === id) return node;
                if (node.children) { const found = findNode(id, node.children); if (found) return found; }
            }
            return null;
        };
        const collectIds = (node) => {
            if (node.tipo === 'Sottoconto') ids.push(node.id);
            if (node.children) node.children.forEach(collectIds);
        };
        const parentNode = findNode(parentNodeId, tree);
        if (parentNode) collectIds(parentNode);
        return ids;
    }, []);

    useEffect(() => {
        const fetchAnagraficheFiltrate = async () => {
            if (!selectedFunzione || selectedFunzione.tipo_funzione !== 'Finanziaria' || !pianoContiMap) {
                setAnagrafiche([]);
                return;
            }
            setIsAnagraficheLoading(true);
            try {
                const params = {};
                const rigaRicerca = selectedFunzione.righe_predefinite.find(r => r.is_conto_ricerca);

                if (!rigaRicerca) {
                    setAnagrafiche([]);
                    setIsAnagraficheLoading(false);
                    return;
                }
                
                let tipoAnagrafica = null;
                const contoPadre = pianoContiMap[rigaRicerca.id_conto];
                
                if (contoPadre) {
                    if (contoPadre.natura === 'Attività') tipoAnagrafica = 'clienti';
                    else if (contoPadre.natura === 'Passività') tipoAnagrafica = 'fornitori';
                    else if (contoPadre.natura === 'Ricavo') tipoAnagrafica = 'PuntoVendita';
                }

                if (tipoAnagrafica === 'clienti') params.relazioni = 'C,E';
                else if (tipoAnagrafica === 'fornitori') params.relazioni = 'F,E';
                else if (tipoAnagrafica === 'PuntoVendita') params.relazioni = 'P';
                
                if (!params.relazioni) {
                    setAnagrafiche([]);
                    setIsAnagraficheLoading(false);
                    return;
                }

                const res = await api.get('/amministrazione/ditte', { params });
                setAnagrafiche(res.data?.data || []);
                setError('');
            } catch (error) {
                setError(`Impossibile caricare l'elenco delle anagrafiche.`);
                setAnagrafiche([]);
            } finally {
                setIsAnagraficheLoading(false);
            }
        };
        fetchAnagraficheFiltrate();
    }, [selectedFunzione, pianoContiMap]);

    useEffect(() => {
        const checkAndFetchElenco = async () => {
            const isElencoEnabled = selectedFunzione &&
                selectedFunzione.tipo_funzione === 'Finanziaria' &&
                (selectedFunzione.gestioni_abbinate || '').includes('E');

            if (isElencoEnabled && datiDocumento.id_anagrafica && pianoContiMap) {
                
                let tipoPartita = null;
                const rigaRicerca = selectedFunzione.righe_predefinite.find(r => r.is_conto_ricerca);
                if (rigaRicerca) {
                    const contoPadre = pianoContiMap[rigaRicerca.id_conto];
                    if (contoPadre) {
                        if (contoPadre.natura === 'Attività') {
                            tipoPartita = 'attive';
                            setReportTitle('Elenco Partite Clienti Aperte');
                        } else if (contoPadre.natura === 'Passività') {
                            tipoPartita = 'passive';
                            setReportTitle('Elenco Partite Fornitori Aperte');
                        }
                    }
                }

                if (!tipoPartita) {
                    setError("Impossibile determinare il tipo di partita (attiva/passiva) dalla configurazione della funzione.");
                    setIsElencoMode(false);
                    return;
                }
                
                setIsElencoMode(true);
                setIsElencoLoading(true);
                try {
                    const res = await api.get(`/contsmart/reports/partite-aperte/${tipoPartita}?id_anagrafica=${datiDocumento.id_anagrafica}`);
                    
                    const allPartite = res.data.data || [];
                    const tipoMovimentoAtteso = tipoPartita === 'attive' ? 'Apertura_Credito' : 'Apertura_Debito';
                    const filteredPartite = allPartite.filter(p => p.tipo_movimento === tipoMovimentoAtteso);
                    
                    setElencoData(filteredPartite);

                } catch (err) {
                    setError('Impossibile caricare le partite aperte.');
                    setElencoData([]);
                } finally {
                    setIsElencoLoading(false);
                }
            } else {
                setIsElencoMode(false);
                setElencoData([]);
                setSelectedElencoIds([]);
            }
        };

        checkAndFetchElenco();
    }, [selectedFunzione, datiDocumento.id_anagrafica, pianoContiMap]);


    // --- HANDLER AZIONI UTENTE ---
    const handleNewRegistration = useCallback(() => {
        setState(initialState);
        setIsEditing(true);
        setActiveField('selectedFunzioneId');
        setOriginatoDaElenco(false);
        setSelectedElencoIds([]);
    }, [initialState]);

    const handleSaveRegistrazione = useCallback(async () => {
        if (!canSave) { alert("La scrittura non è bilanciata o incompleta."); return; }
        try {
            const payload = {
                datiDocumento: { ...datiDocumento, id_funzione_contabile: parseInt(selectedFunzioneId), id_anagrafica: parseInt(datiDocumento.id_anagrafica) || null, totale_documento: parseFloat(datiDocumento.totale_documento) || 0 },
                scrittura: righeScrittura.map(({ id, isRicerca, opzioni, ...riga }) => ({ ...riga, id_conto: parseInt(riga.id_conto), importo_dare: parseFloat(riga.importo_dare) || 0, importo_avere: parseFloat(riga.importo_avere) || 0 })),
                iva: scomposizioneIva.filter(r => parseFloat(r.imponibile) > 0).map(rigaIva => {
                    const aliquotaData = aliquoteIva.find(a => a.id === parseInt(rigaIva.id_aliquota));
                    const imponibile = parseFloat(rigaIva.imponibile) || 0;
                    const percAliquota = aliquotaData ? parseFloat(aliquotaData.aliquota) : 0;
                    const imposta = (imponibile * percAliquota / 100);
                    return { id_codice_iva: parseInt(rigaIva.id_aliquota), imponibile: imponibile, imposta: parseFloat(imposta.toFixed(2)), aliquota: percAliquota };
                }),
                ...(originatoDaElenco && { partiteDaChiudere: selectedElencoIds })
            };

            const response = await api.post('/contsmart/registrazioni', payload);
            alert(response.data.message || 'Registrazione salvata con successo!');
            setIsEditing(false);
            setState(initialState);
            setOriginatoDaElenco(false);
            setSelectedElencoIds([]);
        } catch (error) {
            alert(error.response?.data?.message || 'Errore durante il salvataggio.');
        }
    }, [canSave, datiDocumento, righeScrittura, scomposizioneIva, aliquoteIva, selectedFunzioneId, initialState, originatoDaElenco, selectedElencoIds]);

    const handleCancelRegistration = () => { setIsEditing(false); setState(initialState); setOriginatoDaElenco(false); setSelectedElencoIds([]); };
    const handleFunzioneChange = (e) => {
        const id = e.target.value;
        const funzioneScelta = funzioni.find(f => f.id === parseInt(id));
        setState(prev => ({ ...initialState, selectedFunzioneId: id, datiDocumento: { ...initialState.datiDocumento, descrizione: funzioneScelta?.nome_funzione || '' } }));
        setOriginatoDaElenco(false); 
        if (funzioneScelta && funzioneScelta.tipo_funzione !== 'Finanziaria' && !(funzioneScelta.gestioni_abbinate || '').includes('I')) {
            let righeGenerate = [];
            (funzioneScelta.righe_predefinite || []).forEach(rigaTemplate => {
                if (rigaTemplate.is_conto_ricerca) {
                    const sottoconti = findSottocontiIds(rigaTemplate.id_conto, pdcTree);
                    righeGenerate.push({
                        id: Date.now() + Math.random(), isRicerca: true, opzioni: sottoconti.map(scId => pianoConti.find(c => c.id === scId)).filter(Boolean),
                        id_conto: '', descrizione: rigaTemplate.descrizione_riga_predefinita || '',
                        importo_dare: '', importo_avere: ''
                    });
                } else {
                    const isAvere = (rigaTemplate.tipo_movimento || 'D').toUpperCase() === 'A';
                    righeGenerate.push({
                        id: Date.now() + Math.random(), isRicerca: false, opzioni: [],
                        id_conto: rigaTemplate.id_conto, descrizione: rigaTemplate.descrizione_riga_predefinita || '',
                        importo_dare: isAvere ? '' : '', importo_avere: isAvere ? '' : ''
                    });
                }
            });
            setState(prev => ({ ...prev, righeScrittura: righeGenerate }));
        }
        setActiveField('data_registrazione');
    };
    const handleDocChange = (e) => { const { name, value } = e.target; setState(prev => ({ ...prev, datiDocumento: { ...prev.datiDocumento, [name]: value } })); };
    const handleIvaChange = (id, field, value) => { setState(prev => ({ ...prev, scomposizioneIva: prev.scomposizioneIva.map(r => r.id === id ? { ...r, [field]: value } : r) })); };
    const addIvaRow = () => { setState(prev => ({ ...prev, scomposizioneIva: [...prev.scomposizioneIva, { id: Date.now(), imponibile: '', id_aliquota: '' }] })); };
    const removeIvaRow = (id) => { setState(prev => ({ ...prev, scomposizioneIva: prev.scomposizioneIva.filter(r => r.id !== id) })); };
    const handleRigaChange = (id, field, value) => {
        setState(prev => ({
            ...prev, righeScrittura: prev.righeScrittura.map(riga => {
                if (riga.id === id) {
                    const updatedRiga = { ...riga, [field]: value };
                    if (field === 'importo_dare' && (parseFloat(value) || 0) !== 0) updatedRiga.importo_avere = '';
                    else if (field === 'importo_avere' && (parseFloat(value) || 0) !== 0) updatedRiga.importo_dare = '';
                    return updatedRiga;
                }
                return riga;
            })
        }));
    };
    const addRigaScrittura = () => { setState(prev => ({ ...prev, righeScrittura: [...prev.righeScrittura, { id: Date.now(), id_conto: '', descrizione: '', importo_dare: '', importo_avere: '' }] })); };
    const removeRigaScrittura = (id) => { setState(prev => ({ ...prev, righeScrittura: prev.righeScrittura.filter(r => r.id !== id) })); };

    const handleGenerateScrittura = () => {
        if (!canGenerateScrittura || !selectedFunzione) return;
        setOriginatoDaElenco(false);
        const anagrafica = anagrafiche.find(a => a.id === parseInt(datiDocumento.id_anagrafica));
        
        // <span style="color:red;">// MODIFICA CHIAVE: Aggiunta logica per Corrispettivi</span>
        const isCorrispettivo = (selectedFunzione.categoria || '').toLowerCase().includes('corrispettivi');

        if (isCorrispettivo) {
            if (!anagrafica) {
                alert("Selezionare un punto vendita.");
                return;
            }
            const templates = selectedFunzione.righe_predefinite;
            const tplContropartita = templates.find(r => !r.is_conto_ricerca);
            const tplRicavo = templates.find(r => r.is_conto_ricerca);
            const tplIva = templates.find(r => pianoConti.find(c => c.id === r.id_conto)?.descrizione.toLowerCase().includes('iva'));

            if (!tplContropartita || !tplRicavo || !tplIva) {
                alert("Funzione 'Corrispettivi' non configurata correttamente. Mancano i template per contropartita, ricavo o IVA.");
                return;
            }
            
            let righeGenerate = [];
            // DARE: Contropartita (Cassa/Banca) per il totale
            righeGenerate.push({ id: Date.now(), id_conto: tplContropartita.id_conto, descrizione: tplContropartita.descrizione_riga_predefinita, importo_dare: datiDocumento.totale_documento, importo_avere: '' });
            
            // AVERE: Ricavo per l'imponibile
            righeGenerate.push({ id: Date.now() + 1, id_conto: anagrafica.id_sottoconto_puntovendita || tplRicavo.id_conto, descrizione: `Corrispettivo ${anagrafica.ragione_sociale}`, importo_dare: '', importo_avere: totaleImponibile.toFixed(2) });
            
            // AVERE: IVA per l'imposta
            if (totaleIva > 0) {
                 righeGenerate.push({ id: Date.now() + 2, id_conto: tplIva.id_conto, descrizione: tplIva.descrizione_riga_predefinita, importo_dare: '', importo_avere: totaleIva.toFixed(2) });
            }
            setState(prev => ({ ...prev, righeScrittura: righeGenerate }));

        } else {
            // Logica esistente per fatture
            if (!anagrafica) { alert("Selezionare un cliente/fornitore."); return; }
            let righeGenerate = [];
            const templates = selectedFunzione.righe_predefinite;
            const tplClienteFornitore = templates.find(r => r.is_conto_ricerca);
            const tplIva = templates.find(r => pianoConti.find(c => c.id === r.id_conto)?.descrizione.toLowerCase().includes('iva'));
            const tplCostoRicavo = templates.find(r => r.id_conto !== tplClienteFornitore?.id_conto && r.id_conto !== tplIva?.id_conto);
            if (!tplClienteFornitore || !tplCostoRicavo) { alert("Funzione non configurata correttamente."); return; }

            let idContoDaUsare = anagrafica.id_sottoconto_cliente || anagrafica.id_sottoconto_fornitore || tplClienteFornitore.id_conto;

            const isAvereCF = (tplClienteFornitore.tipo_movimento || 'A').toUpperCase() === 'A';
            righeGenerate.push({ id: Date.now(), id_conto: idContoDaUsare, descrizione: `Rif. doc ${datiDocumento.numero_documento} ${anagrafica.ragione_sociale}`, importo_dare: !isAvereCF ? datiDocumento.totale_documento : '', importo_avere: isAvereCF ? datiDocumento.totale_documento : '' });

            const isAvereCR = (tplCostoRicavo.tipo_movimento || 'D').toUpperCase() === 'A';
            righeGenerate.push({ id: Date.now() + 1, id_conto: tplCostoRicavo.id_conto, descrizione: tplCostoRicavo.descrizione_riga_predefinita, importo_dare: !isAvereCR ? totaleImponibile.toFixed(2) : '', importo_avere: isAvereCR ? totaleImponibile.toFixed(2) : '' });

            if (tplIva && totaleIva > 0) {
                const isAvereIva = (tplIva.tipo_movimento || 'D').toUpperCase() === 'A';
                righeGenerate.push({ id: Date.now() + 2, id_conto: tplIva.id_conto, descrizione: `${tplIva.descrizione_riga_predefinita || 'IVA'}`, importo_dare: !isAvereIva ? totaleIva.toFixed(2) : '', importo_avere: isAvereIva ? totaleIva.toFixed(2) : '' });
            }
            setState(prev => ({ ...prev, righeScrittura: righeGenerate }));
        }
    };

    const handleGenerateFromElenco = () => {
        const selectedRows = elencoData.filter(row => selectedElencoIds.includes(row.id));
        if (selectedRows.length === 0 || !selectedFunzione) return;
        setError('');
        setOriginatoDaElenco(true); 

        const totalSelected = selectedRows.reduce((sum, row) => sum + parseFloat(row.importo), 0);

        const contropartitaTemplate = selectedFunzione.righe_predefinite.find(r => !r.is_conto_ricerca);
        if (!contropartitaTemplate) {
            setError("Errore: Manca la configurazione della contropartita nella funzione contabile.");
            return;
        }

        const righePartite = selectedRows.map(row => {
            if (!row.id_sottoconto) {
                console.error("Riga partita senza id_sottoconto:", row);
                return null;
            }
            return {
                id: Date.now() + Math.random(),
                id_conto: row.id_sottoconto,
                descrizione: `Incasso/Pagamento Fatt. ${row.numero_documento || 'N/D'}`,
                importo_dare: contropartitaTemplate.tipo_movimento === 'A' ? parseFloat(row.importo).toFixed(2) : '',
                importo_avere: contropartitaTemplate.tipo_movimento === 'D' ? parseFloat(row.importo).toFixed(2) : '',
            };
        }).filter(Boolean);

        if (righePartite.length !== selectedRows.length) {
            setError("Errore critico: una o più partite selezionate non hanno un sottoconto associato.");
            return;
        }

        const rigaContropartita = {
            id: Date.now() + Math.random(),
            id_conto: contropartitaTemplate.id_conto,
            descrizione: contropartitaTemplate.descrizione_riga_predefinita || 'Incasso/Pagamento',
            importo_dare: contropartitaTemplate.tipo_movimento === 'D' ? totalSelected.toFixed(2) : '',
            importo_avere: contropartitaTemplate.tipo_movimento === 'A' ? totalSelected.toFixed(2) : '',
        };

        const finalRighe = [...righePartite, rigaContropartita];

        setState(prev => ({
            ...prev,
            righeScrittura: finalRighe,
            datiDocumento: {
                ...prev.datiDocumento,
                totale_documento: totalSelected.toFixed(2)
            }
        }));
        setIsElencoMode(false);
    };

    // --- HOOKS PER SCORCIATOIE TASTIERA E NAVIGAZIONE ---
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
    
    const elencoColumns = useMemo(() => [
        { label: 'Scadenza', key: 'data_scadenza', sortable: true, format: 'date' },
        { label: 'Ragione Sociale', key: 'ragione_sociale', sortable: true },
        { label: 'Num. Doc.', key: 'numero_documento', sortable: true },
        { label: 'Data Doc.', key: 'data_documento', sortable: true, format: 'date' },
        { label: 'Importo', key: 'importo', sortable: true, format: 'currency' },
        { label: 'Stato', key: 'stato', sortable: true },
    ], []);

    // --- RENDER DEL COMPONENTE ---
    if (isLoading) return <div className="text-center p-8"><ArrowPathIcon className="h-6 w-6 animate-spin mx-auto" /> Caricamento dati...</div>;
    

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-slate-700 mb-4">Nuova Registrazione Contabile</h2>
            {error && <div className="text-red-600 bg-red-100 p-4 rounded-md mb-4">Errore: {error}</div>}

            {!isEditing ? (
                <div className="text-center py-10"><button onClick={handleNewRegistration} className="px-6 py-3 rounded-lg text-white font-semibold bg-blue-600 hover:bg-blue-700 flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl transition-shadow"><PencilSquareIcon className="h-5 w-5" /> Immetti Nuova Scrittura (F1)</button></div>
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
                        <div className="flex items-end"><button onClick={handleCancelRegistration} className="px-4 py-2 w-full rounded-md text-sm text-slate-700 bg-slate-200 hover:bg-slate-300 flex items-center justify-center gap-2"><XMarkIcon className="h-4 w-4" /> Annulla</button></div>
                    </div>

                    {selectedFunzioneId && (
                        <>
                         <fieldset className="border rounded-lg p-4 mb-6">
                                <legend className="px-2 font-semibold text-slate-600">Dati Documento e Testata</legend>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div><label htmlFor="data_registrazione" className="block text-sm font-medium text-slate-700 mb-1">Data Registrazione</label><input type="date" name="data_registrazione" value={datiDocumento.data_registrazione} onChange={handleDocChange} onFocus={handleFocus} className={getFieldClass('data_registrazione')} /></div>
                                    <div className="md:col-span-3">
                                        <label htmlFor="id_anagrafica" className="block text-sm font-medium text-slate-700 mb-1">Anagrafica</label>
                                        <select name="id_anagrafica" value={datiDocumento.id_anagrafica} onChange={handleDocChange} onFocus={handleFocus} className={getFieldClass('id_anagrafica')} disabled={isAnagraficheLoading}>
                                            <option value="">{isAnagraficheLoading ? 'Caricamento...' : '-- Seleziona --'}</option>
                                            {anagrafiche.map(a => (<option key={a.id} value={a.id}>{`${a.ragione_sociale} (${a.citta || 'N/D'}, P.IVA: ${a.p_iva || 'N/D'})`}</option>))}
                                        </select>
                                    </div>
                                    { !isElencoMode && (
                                        <>
                                        <div><label htmlFor="numero_documento" className="block text-sm font-medium text-slate-700 mb-1">Num. Documento</label><input type="text" name="numero_documento" value={datiDocumento.numero_documento} onChange={handleDocChange} onFocus={handleFocus} className={getFieldClass('numero_documento')} /></div>
                                        <div><label htmlFor="data_documento" className="block text-sm font-medium text-slate-700 mb-1">Data Documento</label><input type="date" name="data_documento" value={datiDocumento.data_documento} onChange={handleDocChange} onFocus={handleFocus} className={getFieldClass('data_documento')} /></div>
                                        <div><label htmlFor="data_scadenza" className="block text-sm font-medium text-slate-700 mb-1">Data Scadenza</label><input type="date" name="data_scadenza" value={datiDocumento.data_scadenza} onChange={handleDocChange} onFocus={handleFocus} className={getFieldClass('data_scadenza')} /></div>
                                        <div><label htmlFor="totale_documento" className="block text-sm font-medium text-slate-700 mb-1">Totale Documento</label><input type="number" step="0.01" name="totale_documento" value={datiDocumento.totale_documento} onChange={handleDocChange} onFocus={handleFocus} className={getFieldClass('totale_documento')} /></div>
                                        </>
                                    )}
                                    <div className="md:col-span-4"><label htmlFor="descrizione" className="block text-sm font-medium text-slate-700 mb-1">Descrizione Registrazione</label><input type="text" name="descrizione" value={datiDocumento.descrizione} onChange={handleDocChange} onFocus={handleFocus} className={getFieldClass('descrizione')} /></div>
                                </div>
                            </fieldset>
                        {isElencoMode ? (
                            <fieldset className="border rounded-lg p-4 mb-6 animate-fade-in">
                                <legend className="px-2 font-semibold text-slate-600">Selezione Partite Aperte</legend>
                                {isElencoLoading ? (
                                    <div className="text-center p-4">Caricamento elenco...</div>
                                ) : (
                                    <>
                                        <DynamicReportTable
                                            data={elencoData}
                                            columns={elencoColumns}
                                            isSelectable={true}
                                            onSelectionChange={(ids) => setSelectedElencoIds(ids)}
                                            title={reportTitle}
                                        />
                                        <div className="mt-4 flex justify-between items-center p-3 bg-slate-100 rounded-md">
                                            <div className="text-sm font-semibold">
                                                Totale Selezionato: <span className="font-bold text-blue-600">
                                                    {selectedTotal.toFixed(2)} €
                                                </span>
                                            </div>
                                            <button
                                                onClick={handleGenerateFromElenco}
                                                disabled={selectedElencoIds.length === 0}
                                                className="px-4 py-2 text-sm rounded-md text-white font-semibold bg-green-600 hover:bg-green-700 disabled:bg-slate-400"
                                            >
                                                Genera Scrittura da Selezione
                                            </button>
                                        </div>
                                    </>
                                )}
                            </fieldset>
                        ) : (
                            <>
                                {(selectedFunzione?.gestioni_abbinate || '').includes('I') && (
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
                                )}

                                <fieldset className="border rounded-lg p-4">
                                    <legend className="px-2 font-semibold text-slate-600">Scrittura in Partita Doppia</legend>
                                    <table className="w-full text-sm text-left text-slate-500">
                                        <thead className="text-xs text-slate-700 uppercase bg-slate-100"><tr><th className="px-2 py-2 w-3/12">Conto</th><th className="px-2 py-2 w-4/12">Descrizione</th><th className="px-2 py-2 w-2/12">Dare</th><th className="px-2 py-2 w-2/12">Avere</th><th className="px-2 py-2 w-1/12"></th></tr></thead>
                                        <tbody>
                                        {righeScrittura.map(riga => (
                                            <tr key={riga.id} className="bg-white border-b">
                                                <td>
                                                    {riga.isRicerca ? (
                                                        <select value={riga.id_conto} onChange={e => handleRigaChange(riga.id, 'id_conto', e.target.value)} className="w-full border-0 text-sm focus:ring-0">
                                                            <option value="">-- Seleziona Sottoconto --</option>
                                                            {riga.opzioni.map(opt => <option key={opt.id} value={opt.id}>{opt.descrizione}</option>)}
                                                        </select>
                                                    ) : (
                                                        <select value={riga.id_conto} onChange={e => handleRigaChange(riga.id, 'id_conto', e.target.value)} className="w-full border-0 text-sm focus:ring-0">
                                                            <option value="">-- Conto --</option>
                                                            {pianoConti.map(c=><option key={c.id} value={c.id} disabled={!c.isSelectable}>{c.descrizione}</option>)}
                                                        </select>
                                                    )}
                                                </td>
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
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default NuovaRegistrazione;

