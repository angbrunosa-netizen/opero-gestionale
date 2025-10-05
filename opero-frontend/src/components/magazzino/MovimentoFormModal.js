/**
 * @file opero-frontend/src/components/magazzino/MovimentoFormModal.js
 * @description Modale per la creazione di un nuovo movimento di magazzino.
 * @version 2.3 - Aggiornato per usare l'API di ricerca stabile /search. * @date 2025-10-05
 */

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import SearchableInput from '../../shared/SearchableInput';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';

const MovimentoFormModal = ({ onClose, onSaveSuccess }) => {
    const [formData, setFormData] = useState({
        id_magazzino: null,
        id_catalogo: null,
        id_causale: null,
        quantita: '',
        note: '',
        riferimento_doc: '',
        lotti: [], // [{ lotto: 'L123', quantita: 10 }]
    });
    const [causali, setCausali] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [lottoInput, setLottoInput] = useState({ lotto: '', quantita: '' });

    // Carica le causali all'apertura del modale
    useEffect(() => {
        const fetchCausali = async () => {
            try {
                const response = await api.get('/magazzino/causali');
                setCausali(response.data);
            } catch (error) {
                console.error("Errore nel caricamento delle causali:", error);
            }
        };
        fetchCausali();
    }, []);

    const validate = () => {
        const newErrors = {};
        if (!formData.id_catalogo) newErrors.id_catalogo = 'Articolo obbligatorio.';
        if (!formData.id_magazzino) newErrors.id_magazzino = 'Magazzino obbligatorio.';
        if (!formData.id_causale) newErrors.id_causale = 'Causale obbligatoria.';
        if (!formData.quantita || parseFloat(formData.quantita) <= 0) {
            newErrors.quantita = 'Quantità deve essere maggiore di zero.';
        }
        
        const isLottoManaged = formData.lotti.length > 0;
        const totalLottiQuantita = formData.lotti.reduce((sum, lotto) => sum + parseFloat(lotto.quantita || 0), 0);
        
        if (isLottoManaged && totalLottiQuantita !== parseFloat(formData.quantita)) {
            newErrors.lotti = `La somma delle quantità dei lotti (${totalLottiQuantita}) non corrisponde alla quantità totale (${formData.quantita}).`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSaving(true);
        try {
            await api.post('/magazzino/movimenti', formData);
            onSaveSuccess();
            onClose();
        } catch (error) {
            console.error("Errore durante il salvataggio del movimento:", error);
            setErrors({ form: 'Si è verificato un errore durante il salvataggio.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleLottoAdd = () => {
        if (lottoInput.lotto && lottoInput.quantita > 0) {
            setFormData(prev => ({
                ...prev,
                lotti: [...prev.lotti, { ...lottoInput }]
            }));
            setLottoInput({ lotto: '', quantita: '' });
        }
    };

    const handleLottoRemove = (index) => {
        setFormData(prev => ({
            ...prev,
            lotti: prev.lotti.filter((_, i) => i !== index)
        }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6">Nuovo Movimento di Magazzino</h2>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Colonna Sinistra */}
                        <div>
                             <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Articolo *</label>
                                <SearchableInput
                                    searchUrl="/catalogo/search" // CORRETTO: Ripristinata API stabile
                                    searchParam="term" // Il parametro atteso dalla vecchia API
                                    displayField="descrizione"
                                    placeholder="Cerca per codice o descrizione..."
                                    onItemSelected={(item) => setFormData(prev => ({ ...prev, id_catalogo: item ? item.id : null }))}
                                />
                                {errors.id_catalogo && <p className="text-red-500 text-xs mt-1">{errors.id_catalogo}</p>}
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Magazzino *</label>
                                 <SearchableInput
                                    searchUrl="/magazzino/magazzini"
                                    displayField="descrizione"
                                    placeholder="Cerca magazzino..."
                                    onItemSelected={(item) => setFormData(prev => ({ ...prev, id_magazzino: item ? item.id : null }))}
                                />
                                {errors.id_magazzino && <p className="text-red-500 text-xs mt-1">{errors.id_magazzino}</p>}
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Causale *</label>
                                <select
                                    value={formData.id_causale || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, id_causale: e.target.value }))}
                                    className="mt-1 block w-full input-style"
                                >
                                    <option value="">Seleziona una causale</option>
                                    {causali.map(c => (
                                        <option key={c.id} value={c.id}>{c.descrizione}</option>
                                    ))}
                                </select>
                                {errors.id_causale && <p className="text-red-500 text-xs mt-1">{errors.id_causale}</p>}
                            </div>

                             <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Quantità *</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={formData.quantita}
                                    onChange={(e) => setFormData(prev => ({ ...prev, quantita: e.target.value }))}
                                    className="mt-1 block w-full input-style"
                                />
                                {errors.quantita && <p className="text-red-500 text-xs mt-1">{errors.quantita}</p>}
                            </div>
                        </div>

                        {/* Colonna Destra - Gestione Lotti */}
                        <div className="border-l border-gray-200 pl-6">
                            <h3 className="text-lg font-semibold mb-4">Gestione Lotti (opzionale)</h3>
                            <div className="flex items-start gap-2 mb-4">
                                <input
                                    type="text"
                                    placeholder="Codice Lotto"
                                    value={lottoInput.lotto}
                                    onChange={e => setLottoInput(prev => ({...prev, lotto: e.target.value}))}
                                    className="input-style w-1/2"
                                />
                                <input
                                    type="number"
                                    step="any"
                                    placeholder="Quantità"
                                    value={lottoInput.quantita}
                                     onChange={e => setLottoInput(prev => ({...prev, quantita: e.target.value}))}
                                    className="input-style w-1/3"
                                />
                                 <button type="button" onClick={handleLottoAdd} className="btn-secondary h-10">
                                    <PlusIcon className="h-5 w-5"/>
                                </button>
                            </div>
                            
                            {/* Lista lotti inseriti */}
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {formData.lotti.map((lotto, index) => (
                                    <div key={index} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                                        <span>Lotto: <span className="font-semibold">{lotto.lotto}</span></span>
                                        <span>Q.tà: <span className="font-semibold">{lotto.quantita}</span></span>
                                        <button type="button" onClick={() => handleLottoRemove(index)}>
                                            <XMarkIcon className="h-5 w-5 text-red-500"/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                             {errors.lotti && <p className="text-red-500 text-xs mt-2">{errors.lotti}</p>}
                        </div>
                    </div>
                    
                    {/* Sezione Note e Riferimenti */}
                     <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700">Riferimento Documento</label>
                        <input
                            type="text"
                            value={formData.riferimento_doc}
                            onChange={(e) => setFormData(prev => ({ ...prev, riferimento_doc: e.target.value }))}
                            className="mt-1 block w-full input-style"
                            placeholder="Es. DDT 123 del 01/01/2025"
                        />
                    </div>
                     <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Note</label>
                        <textarea
                            value={formData.note}
                            onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                            rows="2"
                            className="mt-1 block w-full input-style"
                        ></textarea>
                    </div>

                    {errors.form && <p className="text-red-600 mt-4">{errors.form}</p>}

                    <div className="flex justify-end gap-4 mt-8">
                        <button type="button" onClick={onClose} disabled={isSaving} className="btn-secondary">Annulla</button>
                        <button type="submit" disabled={isSaving} className="btn-primary">
                            {isSaving ? 'Salvataggio...' : 'Salva Movimento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MovimentoFormModal;

