/**
 * Componente: CondizioniAcquistiManager
 * Versione: 2.2.0
 * Data: 11/10/2025
 * Posizione: opero-frontend/src/components/acquisti/CondizioniAcquistiManager.js
 * Descrizione: Aggiunto calcolo e visualizzazione in tempo reale del prezzo netto.
 * Il prezzo netto viene ora salvato e usato per aggiornare il costo base nel catalogo.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../../services/api';
import { FaPlus, FaSave, FaTrash, FaPlusCircle, FaPercentage, FaArrowLeft, FaEdit } from 'react-icons/fa';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import SearchModal from '../../shared/SearchModal';
import ScontiModal from '../../shared/ScontiModal';

// NUOVO: Funzione di utility per il calcolo del prezzo netto
const calculateNetPrice = (listPrice, sconti = []) => {
    if (!listPrice || isNaN(parseFloat(listPrice))) return 0;

    let prezzoNetto = parseFloat(listPrice);
    
    // Ordina gli sconti per sicurezza, anche se dovrebbero già esserlo
    const sortedSconti = [...sconti].sort((a, b) => a.ordine_applicazione - b.ordine_applicazione);

    for (const sconto of sortedSconti) {
        const valore = parseFloat(sconto.valore_sconto);
        if (isNaN(valore)) continue;

        if (sconto.tipo_sconto === 'percentuale') {
            prezzoNetto *= (1 - valore / 100);
        } else { // 'importo'
            prezzoNetto -= valore;
        }
    }
    return prezzoNetto;
};


// Sotto-componente per la gestione delle righe articolo nel form
const ArticoloRow = ({ riga, index, onRigaChange, onRemoveRiga, onManageSconti }) => {
    const [modalOpen, setModalOpen] = useState(false);
    
    // NUOVO: Calcolo memoizzato del prezzo netto per performance ottimali
    const prezzoNettoCalcolato = useMemo(() => 
        calculateNetPrice(riga.prezzo_listino, riga.sconti)
    , [riga.prezzo_listino, riga.sconti]);
    
    const handleSelectArticolo = (articolo) => {
        onRigaChange(index, { 
            ...riga, 
            id_articolo: articolo.id, 
            nome_articolo: `${articolo.codice_entita} - ${articolo.descrizione}` 
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        onRigaChange(index, { ...riga, [name]: value });
    };

    return (
        <div className="grid grid-cols-12 gap-4 items-center p-2 border-b">
            <div className="col-span-5">
                 <label className="text-xs font-semibold text-gray-600">Articolo</label>
                 <div className="flex">
                    <input type="text" value={riga.nome_articolo} readOnly className="w-full p-2 border rounded-l-md bg-gray-100" placeholder="Seleziona articolo..." />
                    <button type="button" onClick={() => setModalOpen(true)} className="bg-gray-200 p-2 rounded-r-md hover:bg-gray-300">
                        <MagnifyingGlassIcon className="h-5 w-5" />
                    </button>
                 </div>
            </div>
            <div className="col-span-2">
                 <label className="text-xs font-semibold text-gray-600">Prezzo Listino</label>
                 <input type="number" step="0.01" name="prezzo_listino" value={riga.prezzo_listino} onChange={handleInputChange} className="w-full p-2 border rounded-md" />
            </div>
            {/* NUOVO: Visualizzazione Prezzo Netto Calcolato */}
            <div className="col-span-2">
                 <label className="text-xs font-semibold text-gray-600">Prezzo Netto</label>
                 <div className="w-full p-2 border rounded-md bg-gray-100 text-right font-mono">
                    {prezzoNettoCalcolato.toFixed(4)} €
                 </div>
            </div>
            <div className="col-span-3 flex items-end space-x-2">
                <button type="button" onClick={() => onManageSconti(index)} className="text-blue-600 hover:text-blue-800 p-2" title="Gestisci Sconti">
                    <FaPercentage /> ({riga.sconti?.length || 0})
                </button>
                <button type="button" onClick={() => onRemoveRiga(index)} className="text-red-500 hover:text-red-700 p-2">
                    <FaTrash />
                </button>
            </div>
             {modalOpen && (
                <SearchModal
                    isOpen={true}
                    onClose={() => setModalOpen(false)}
                    onSelect={handleSelectArticolo}
                    searchEndpoint="/catalogo/search?term="
                    title="Cerca Articolo"
                    displayFields={{ primary: 'descrizione', secondary: 'codice_entita' }}
                />
            )}
        </div>
    );
};


const CondizioniAcquistiManager = () => {
    // ... (stati esistenti: condizioni, isLoading, view, etc.) ...
    const [condizioni, setCondizioni] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [view, setView] = useState('list');
    const [editingCondizione, setEditingCondizione] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    const initialFormData = {
        testata: { id_fornitore: '', descrizione: '', data_inizio_validita: new Date().toISOString().slice(0, 10) },
        righe: []
    };
    const [formData, setFormData] = useState(initialFormData);
    const [selectedFornitoreName, setSelectedFornitoreName] = useState('');
    const [isFornitoreModalOpen, setIsFornitoreModalOpen] = useState(false);
    const [scontiModalState, setScontiModalState] = useState({ isOpen: false, rowIndex: null });


    const fetchCondizioni = useCallback(async () => {
        // ... (logica fetch invariata) ...
        setIsLoading(true);
        try {
            const res = await api.get('/acquisti/condizioni');
            setCondizioni(res.data);
        } catch (error) {
            console.error("Errore caricamento condizioni:", error);
            setNotification({ show: true, message: 'Impossibile caricare le condizioni.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (view === 'list') {
            fetchCondizioni();
        }
    }, [view, fetchCondizioni]);
    // ... (handler esistenti: handleNew, handleSelectFornitore, etc.) ...
     const handleNew = () => {
        setEditingCondizione(null);
        setFormData(initialFormData);
        setSelectedFornitoreName('');
        setView('form');
    };

    const handleSelectFornitore = (fornitore) => {
        setFormData(prev => ({ ...prev, testata: { ...prev.testata, id_fornitore: fornitore.id } }));
        setSelectedFornitoreName(fornitore.ragione_sociale);
    };

    const handleTestataChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, testata: { ...prev.testata, [name]: value } }));
    };

    const addRiga = () => {
        setFormData(prev => ({
            ...prev,
            righe: [...prev.righe, { id_articolo: '', nome_articolo: '', prezzo_listino: '', sconti: [] }]
        }));
    };

    const handleRigaChange = (index, updatedRiga) => {
        const newRighe = [...formData.righe];
        newRighe[index] = updatedRiga;
        setFormData(prev => ({ ...prev, righe: newRighe }));
    };

    const removeRiga = (index) => {
        setFormData(prev => ({
            ...prev,
            righe: prev.righe.filter((_, i) => i !== index)
        }));
    };
    
    const handleManageSconti = (rowIndex) => {
        setScontiModalState({ isOpen: true, rowIndex });
    };

    const handleSaveSconti = (updatedSconti) => {
        const { rowIndex } = scontiModalState;
        const newRighe = [...formData.righe];
        newRighe[rowIndex].sconti = updatedSconti;
        setFormData(prev => ({ ...prev, righe: newRighe }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // MODIFICATO: Calcola il prezzo netto finale per ogni riga prima di inviare
        const payload = {
            ...formData,
            righe: formData.righe.map(riga => {
                const { nome_articolo, ...restOfRiga } = riga;
                return {
                    ...restOfRiga,
                    prezzo_netto: calculateNetPrice(riga.prezzo_listino, riga.sconti)
                };
            })
        };

        try {
            await api.post('/acquisti/condizioni', payload);
            setNotification({ show: true, message: 'Condizione salvata e catalogo aggiornato!', type: 'success' });
            setView('list');
        } catch (error) {
            console.error("Errore salvataggio:", error);
            const errorMessage = error.response?.data?.error || 'Errore durante il salvataggio.';
            setNotification({ show: true, message: `Salvataggio fallito: ${errorMessage}`, type: 'error' });
        }
    };
    
    // ... (Render del componente, JSX) ...
    if (view === 'list') {
        return (
            <div className="bg-white p-4 rounded-lg shadow-sm w-full">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Condizioni Commerciali Acquisti</h2>
                    <button onClick={handleNew} className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        <FaPlus className="mr-2" /> Nuova Condizione
                    </button>
                </div>
                <div className="mt-4">
                    {isLoading ? <p>Caricamento...</p> : 
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="py-2 px-4 text-left">Descrizione</th>
                                    <th className="py-2 px-4 text-left">Fornitore</th>
                                    <th className="py-2 px-4 text-left">Inizio Validità</th>
                                    <th className="py-2 px-4 text-left">Stato</th>
                                    <th className="py-2 px-4 text-left">Azioni</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(condizioni || []).map(c => (
                                    <tr key={c.id} className="border-b hover:bg-gray-50">
                                        <td className="py-2 px-4">{c.descrizione}</td>
                                        <td className="py-2 px-4">{c.fornitore}</td>
                                        <td className="py-2 px-4">{new Date(c.data_inizio_validita).toLocaleDateString()}</td>
                                        <td className="py-2 px-4">{c.attiva ? 'Attiva' : 'Non Attiva'}</td>
                                        <td className="py-2 px-4">
                                            <button className="text-gray-500 hover:text-blue-700 p-1"><FaEdit /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    }
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm w-full">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{editingCondizione ? 'Modifica' : 'Crea'} Condizione Commerciale</h2>
                <button onClick={() => setView('list')} className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
                   <FaArrowLeft className="mr-1" /> Annulla e torna alla lista
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <fieldset className="border p-4 rounded-md">
                    <legend className="font-semibold px-2 text-gray-700">Testata</legend>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        <div>
                             <label className="block text-sm font-medium text-gray-700">Fornitore</label>
                             <div className="flex">
                                <input type="text" value={selectedFornitoreName} readOnly className="w-full p-2 border rounded-l-md bg-gray-100" />
                                <button type="button" onClick={() => setIsFornitoreModalOpen(true)} className="bg-gray-200 p-2 rounded-r-md hover:bg-gray-300">
                                    <MagnifyingGlassIcon className="h-5 w-5" />
                                </button>
                             </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Descrizione</label>
                            <input type="text" name="descrizione" value={formData.testata.descrizione} onChange={handleTestataChange} className="w-full p-2 border rounded-md" required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Data Inizio Validità</label>
                            <input type="date" name="data_inizio_validita" value={formData.testata.data_inizio_validita} onChange={handleTestataChange} className="w-full p-2 border rounded-md" required />
                        </div>
                    </div>
                </fieldset>
                
                <fieldset className="border p-4 rounded-md">
                     <legend className="font-semibold px-2 text-gray-700">Articoli in Condizione</legend>
                     <div className="mt-2 space-y-2">
                         {formData.righe.map((riga, index) => (
                            <ArticoloRow key={index} index={index} riga={riga} onRigaChange={handleRigaChange} onRemoveRiga={removeRiga} onManageSconti={handleManageSconti} />
                         ))}
                     </div>
                     <button type="button" onClick={addRiga} className="mt-4 text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center">
                        <FaPlusCircle className="mr-2" /> Aggiungi Articolo
                     </button>
                </fieldset>

                <div className="flex justify-end gap-4">
                     <button type="button" onClick={() => setView('list')} className="bg-gray-600 text-white px-4 py-2 rounded-md">Annulla</button>
                     <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md">Salva Condizione</button>
                </div>
            </form>

            {isFornitoreModalOpen && (
                <SearchModal
                    isOpen={true}
                    onClose={() => setIsFornitoreModalOpen(false)}
                    onSelect={handleSelectFornitore}
                    searchEndpoint="/amministrazione/fornitori/?term="
                    title="Cerca Fornitore"
                    displayFields={{ primary: 'ragione_sociale', secondary: 'p_iva' }}
                />
            )}
            
            {scontiModalState.isOpen && (
                 <ScontiModal
                    isOpen={scontiModalState.isOpen}
                    onClose={() => setScontiModalState({ isOpen: false, rowIndex: null })}
                    onSave={handleSaveSconti}
                    initialSconti={formData.righe[scontiModalState.rowIndex]?.sconti}
                />
            )}
        </div>
    );
};

export default CondizioniAcquistiManager;

