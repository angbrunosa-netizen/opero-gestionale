// #####################################################################
// # Componente Registrazioni Contabili v27.2 (con Debug Logica Anagrafiche)
// # File: opero-gestionale/opero-frontend/src/components/cont-smart/NuovaRegistrazione.js
// #####################################################################

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { api } from '../../services/api';
import { PlusIcon, TrashIcon, ArrowDownTrayIcon, PencilSquareIcon, XMarkIcon, ArrowPathIcon ,ExclamationTriangleIcon} from '@heroicons/react/24/solid';
// --- Sotto-componente per il modale di conferma ---
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex items-start">
                    <div className="flex-shrink-0 mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
                        <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3 className="text-lg leading-6 font-bold text-gray-900" id="modal-title">
                            {title}
                        </h3>
                        <div className="mt-2">
                            <p className="text-sm text-gray-600">
                                {children}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={onConfirm}
                    >
                        Conferma e Procedi
                    </button>
                    <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
                        onClick={onClose}
                    >
                        Annulla
                    </button>
                </div>
            </div>
        </div>
    );
};

const FunzioneModal = ({ funzione, onClose, onSave, pianoConti }) => {
    const [testata, setTestata] = useState({
        nome_funzione: '', descrizione: '', tipo_funzione: 'Primaria', categoria: '', gestioni_abbinate: []
    });
    const [righe, setRighe] = useState([]);

    useEffect(() => {
        if (funzione) {
            setTestata({
                nome_funzione: funzione.nome_funzione || '',
                descrizione: funzione.descrizione || '',
                tipo_funzione: funzione.tipo_funzione || 'Primaria',
                categoria: funzione.categoria || '',
                gestioni_abbinate: funzione.gestioni_abbinate || []
            });
            setRighe(funzione.righe_predefinite.map(r => ({...r, uniqueId: Math.random()})));
        }
    }, [funzione]);
    
    const handleTestataChange = (e) => {
        setTestata({ ...testata, [e.target.name]: e.target.value });
    };
    
    const handleGestioneAbbinataChange = (e) => {
        const { value, checked } = e.target;
        setTestata(prev => {
            const gestioni = new Set(prev.gestioni_abbinate);
            if (checked) gestioni.add(value);
            else gestioni.delete(value);
            return { ...prev, gestioni_abbinate: Array.from(gestioni) };
        });
    };

    const handleRigaChange = (uniqueId, field, value) => {
        let newRighe = righe.map(r => r.uniqueId === uniqueId ? { ...r, [field]: value } : r);
        
        if (field === 'is_conto_ricerca' && value === true) {
            newRighe = newRighe.map(r => r.uniqueId !== uniqueId ? { ...r, is_conto_ricerca: false } : r);
        }
        
        setRighe(newRighe);
    };

    const addRiga = () => {
        setRighe([...righe, { uniqueId: Math.random(), id_conto: '', tipo_movimento: 'D', is_sottoconto_modificabile: true, is_conto_ricerca: false, descrizione_riga_predefinita: '' }]);
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ testata, righe: righe.map(({uniqueId, ...rest}) => rest) });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
             <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-bold mb-6">{funzione ? 'Modifica' : 'Crea'} Funzione Contabile</h3>
                <form onSubmit={handleSubmit}>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-4">
                        <div className="relative">
                            <label htmlFor="nome_funzione" className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-bold text-gray-900">Nome Funzione</label>
                            <input type="text" name="nome_funzione" id="nome_funzione" value={testata.nome_funzione} onChange={handleTestataChange} required className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600"/>
                        </div>
                        <div className="relative">
                            <label htmlFor="categoria" className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-bold text-gray-900">Categoria</label>
                            <input type="text" name="categoria" id="categoria" value={testata.categoria} onChange={handleTestataChange} className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600"/>
                        </div>
                        <div className="relative md:col-span-2">
                             <label htmlFor="descrizione" className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-bold text-gray-900">Descrizione</label>
                             <textarea name="descrizione" id="descrizione" rows="2" value={testata.descrizione} onChange={handleTestataChange} className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600"/>
                        </div>
                         <div className="relative">
                            <label htmlFor="tipo_funzione" className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-bold text-gray-900">Tipo Funzione</label>
                            <select name="tipo_funzione" id="tipo_funzione" value={testata.tipo_funzione} onChange={handleTestataChange} className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600">
                                <option>Primaria</option>
                                <option>Finanziaria</option>
                                <option>Secondaria</option>
                                <option>Sistema</option>
                            </select>
                        </div>
                    </div>

                    <div className="mb-4 border p-3 rounded-md">
                        <p className="font-semibold text-sm mb-2">Gestioni Abbinate</p>
                        <div className="flex flex-wrap gap-x-6 gap-y-2">
                            <label className="inline-flex items-center">
                                <input type="checkbox" value="I" checked={testata.gestioni_abbinate.includes('I')} onChange={handleGestioneAbbinataChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                                <span className="ml-2 text-sm">Gestione IVA</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input type="checkbox" value="C" checked={testata.gestioni_abbinate.includes('C')} onChange={handleGestioneAbbinataChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                                <span className="ml-2 text-sm">Centri di Costo</span>
                            </label>
                             <label className="inline-flex items-center">
                                <input type="checkbox" value="E" checked={testata.gestioni_abbinate.includes('E')} onChange={handleGestioneAbbinataChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                                <span className="ml-2 text-sm">Elenchi</span>
                            </label>
                        </div>
                    </div>

                    <h4 className="font-semibold mb-2 mt-6">Righe Predefinite</h4>
                    <div className="space-y-3 mb-4">
                        {righe.map(riga => (
                            <div key={riga.uniqueId} className="grid grid-cols-12 gap-2 items-center p-2 border rounded-md">
                                <select value={riga.id_conto} onChange={e => handleRigaChange(riga.uniqueId, 'id_conto', e.target.value)} className="col-span-12 md:col-span-5 p-2 border rounded text-sm">
                                    <option value="">Seleziona Conto</option>
                                    {pianoConti.map(c => <option key={c.id} value={c.id} disabled={!c.isSelectable}>{c.descrizione}</option>)}
                                </select>
                                <select value={riga.tipo_movimento} onChange={e => handleRigaChange(riga.uniqueId, 'tipo_movimento', e.target.value)} className="col-span-6 md:col-span-2 p-2 border rounded text-sm">
                                    <option value="D">DARE</option>
                                    <option value="A">AVERE</option>
                                </select>
                                <label className="col-span-6 md:col-span-4 flex items-center text-sm select-none">
                                    <input type="checkbox" checked={riga.is_conto_ricerca} onChange={e => handleRigaChange(riga.uniqueId, 'is_conto_ricerca', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                                    <span className="ml-2">Conto di Ricerca</span>
                                </label>
                                <button type="button" onClick={() => setRighe(righe.filter(r => r.uniqueId !== riga.uniqueId))} className="col-span-12 md:col-span-1 p-2 text-red-500 hover:bg-red-100 rounded-full flex justify-center">
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addRiga} className="text-sm text-blue-600 mb-6 flex items-center gap-1"><PlusIcon className="h-4 w-4"/> Aggiungi Riga</button>

                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Annulla</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Salva</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

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

    // --- CALCOLI DERIVATI (Inalterati) ---
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
                // <span style="color:red;">// MODIFICA CHIAVE: La logica ora invia i parametri corretti al backend.</span>
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
                }

                if (!tipoAnagrafica) {
                    setAnagrafiche([]);
                    setIsAnagraficheLoading(false);
                    return;
                }

                const params = {};
                if (tipoAnagrafica === 'fornitori') {
                    params.relazioni = 'F,E';
                } else if (tipoAnagrafica === 'clienti') {
                    params.relazioni = 'C,E';
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

    // --- HANDLER AZIONI UTENTE ---
    const handleNewRegistration = useCallback(() => {
        setState(initialState);
        setIsEditing(true);
        setActiveField('selectedFunzioneId');
        setTimeout(() => document.getElementsByName('selectedFunzioneId')[0]?.focus(), 0);
    }, [initialState]);
    
    const handleSaveRegistrazione = useCallback(async () => {
        if (!canSave) { alert("La scrittura non è bilanciata o incompleta."); return; }
        try {
            const payload = {
                datiDocumento: { ...datiDocumento, id_funzione_contabile: parseInt(selectedFunzioneId), id_anagrafica: parseInt(datiDocumento.id_anagrafica) || null, totale_documento: parseFloat(datiDocumento.totale_documento) || 0 },
                scrittura: righeScrittura.map(({id, isRicerca, opzioni, ...riga}) => ({ ...riga, id_conto: parseInt(riga.id_conto), importo_dare: parseFloat(riga.importo_dare) || 0, importo_avere: parseFloat(riga.importo_avere) || 0 })),
                iva: scomposizioneIva.filter(r => parseFloat(r.imponibile) > 0).map(rigaIva => {
                    const aliquotaData = aliquoteIva.find(a => a.id === parseInt(rigaIva.id_aliquota));
                    const imponibile = parseFloat(rigaIva.imponibile) || 0;
                    const percAliquota = aliquotaData ? parseFloat(aliquotaData.aliquota) : 0;
                    const imposta = (imponibile * percAliquota / 100);
                    return { id_codice_iva: parseInt(rigaIva.id_aliquota), imponibile: imponibile, imposta: parseFloat(imposta.toFixed(2)), aliquota: percAliquota };
                })
            };
            const response = await api.post('/contsmart/registrazioni', payload);
            alert(response.data.message || 'Registrazione salvata con successo!');
            setIsEditing(false);
            setState(initialState);
        } catch (error) {
            alert(error.response?.data?.message || 'Errore durante il salvataggio.');
        }
    }, [canSave, datiDocumento, righeScrittura, scomposizioneIva, aliquoteIva, selectedFunzioneId, initialState]);
    
    const handleCancelRegistration = () => { setIsEditing(false); setState(initialState); };
    const handleFunzioneChange = (e) => {
        const id = e.target.value;
        const funzioneScelta = funzioni.find(f => f.id === parseInt(id));
        setState(prev => ({ ...initialState, selectedFunzioneId: id, datiDocumento: { ...initialState.datiDocumento, descrizione: funzioneScelta?.nome_funzione || '' } }));
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
        setState(prev => ({ ...prev, righeScrittura: prev.righeScrittura.map(riga => {
            if (riga.id === id) {
                const updatedRiga = { ...riga, [field]: value };
                if (field === 'importo_dare' && (parseFloat(value) || 0) !== 0) updatedRiga.importo_avere = '';
                else if (field === 'importo_avere' && (parseFloat(value) || 0) !== 0) updatedRiga.importo_dare = '';
                return updatedRiga;
            }
            return riga;
        }) }));
    };
    const addRigaScrittura = () => { setState(prev => ({ ...prev, righeScrittura: [...prev.righeScrittura, { id: Date.now(), id_conto: '', descrizione: '', importo_dare: '', importo_avere: '' }] })); };
    const removeRigaScrittura = (id) => { setState(prev => ({ ...prev, righeScrittura: prev.righeScrittura.filter(r => r.id !== id) })); };

    const handleGenerateScrittura = () => {
        if (!canGenerateScrittura || !selectedFunzione) return;
        const anagrafica = anagrafiche.find(a => a.id === parseInt(datiDocumento.id_anagrafica));
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
        
        if (tplIva) {
            scomposizioneIva.forEach((rigaIva, index) => {
                const imponibile = parseFloat(rigaIva.imponibile) || 0;
                if (imponibile === 0) return;
                const aliquota = aliquoteIva.find(a => a.id === parseInt(rigaIva.id_aliquota));
                const imposta = (imponibile * (aliquota ? parseFloat(aliquota.aliquota) : 0) / 100);
                if (imposta > 0) {
                    const isAvereIva = (tplIva.tipo_movimento || 'D').toUpperCase() === 'A';
                    righeGenerate.push({ id: Date.now() + 2 + index, id_conto: tplIva.id_conto, descrizione: `${tplIva.descrizione_riga_predefinita || 'IVA'} ${aliquota?.aliquota || ''}%`, importo_dare: !isAvereIva ? imposta.toFixed(2) : '', importo_avere: isAvereIva ? imposta.toFixed(2) : '' });
                }
            });
        }
        setState(prev => ({ ...prev, righeScrittura: righeGenerate }));
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

    // --- RENDER DEL COMPONENTE ---
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
                        {(selectedFunzione?.tipo_funzione === 'Finanziaria' || (selectedFunzione?.gestioni_abbinate || '').includes('I')) && (
                        <>
                        <fieldset className="border rounded-lg p-4 mb-6">
                            <legend className="px-2 font-semibold text-slate-600">Dati Documento e Testata</legend>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div><label htmlFor="data_registrazione" className="block text-sm font-medium text-slate-700 mb-1">Data Registrazione</label><input type="date" name="data_registrazione" value={datiDocumento.data_registrazione} onChange={handleDocChange} onFocus={handleFocus} className={getFieldClass('data_registrazione')} /></div>
                                <div className="md:col-span-3">
                                    <label htmlFor="id_anagrafica" className="block text-sm font-medium text-slate-700 mb-1">Cliente/Fornitore</label>
                                    <select name="id_anagrafica" value={datiDocumento.id_anagrafica} onChange={handleDocChange} onFocus={handleFocus} className={getFieldClass('id_anagrafica')} disabled={isAnagraficheLoading}>
                                        <option value="">{isAnagraficheLoading ? 'Caricamento...' : '-- Seleziona --'}</option>
                                        {anagrafiche.map(a => (<option key={a.id} value={a.id}>{`${a.ragione_sociale} (${a.citta || 'N/D'}, P.IVA: ${a.p_iva || 'N/D'})`}</option>))}
                                    </select>
                                </div>
                                <div><label htmlFor="numero_documento" className="block text-sm font-medium text-slate-700 mb-1">Num. Documento</label><input type="text" name="numero_documento" value={datiDocumento.numero_documento} onChange={handleDocChange} onFocus={handleFocus} className={getFieldClass('numero_documento')} /></div>
                                <div><label htmlFor="data_documento" className="block text-sm font-medium text-slate-700 mb-1">Data Documento</label><input type="date" name="data_documento" value={datiDocumento.data_documento} onChange={handleDocChange} onFocus={handleFocus} className={getFieldClass('data_documento')} /></div>
                                <div><label htmlFor="data_scadenza" className="block text-sm font-medium text-slate-700 mb-1">Data Scadenza</label><input type="date" name="data_scadenza" value={datiDocumento.data_scadenza} onChange={handleDocChange} onFocus={handleFocus} className={getFieldClass('data_scadenza')} /></div>
                                <div><label htmlFor="totale_documento" className="block text-sm font-medium text-slate-700 mb-1">Totale Documento</label><input type="number" step="0.01" name="totale_documento" value={datiDocumento.totale_documento} onChange={handleDocChange} onFocus={handleFocus} className={getFieldClass('totale_documento')} /></div>
                                <div className="md:col-span-4"><label htmlFor="descrizione" className="block text-sm font-medium text-slate-700 mb-1">Descrizione Registrazione</label><input type="text" name="descrizione" value={datiDocumento.descrizione} onChange={handleDocChange} onFocus={handleFocus} className={getFieldClass('descrizione')} /></div>
                            </div>
                        </fieldset>
                        
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
                        </>
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
                </div>
            )}
        </div>
    );
};

export default NuovaRegistrazione;

