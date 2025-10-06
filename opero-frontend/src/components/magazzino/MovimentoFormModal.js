/**
 * @file opero-frontend/src/components/magazzino/MovimentoFormModal.js
 * @description Modale per la creazione di un nuovo movimento di magazzino.
 * @version 3.0 - Utilizza il componente condiviso e stabile SearchableCatalogoInput.
 * @date 2025-10-05
 */
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import SearchableCatalogoInput from '../../shared/SearchableCatalogoInput'; // <-- CORRETTO: Usa il componente giusto
import SearchableInput from '../../shared/SearchableInput'; // Per Magazzini e Causali
import { PlusIcon ,XMarkIcon} from '@heroicons/react/24/solid';
const MovimentoFormModal = ({ onClose, onSaveSuccess }) => {
    const [formData, setFormData] = useState({
        id_magazzino: null,
        id_catalogo: null,
        id_causale: null,
        quantita: '',
        note: '',
        riferimento_doc: '',
        lotti: [],
    });
    
    // Stato per visualizzare la descrizione dell'articolo selezionato
    const [articoloSelezionato, setArticoloSelezionato] = useState(null);

    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [lottoInput, setLottoInput] = useState({ lotto: '', quantita: '' });

    const handleArticoloSelected = (articolo) => {
        if (articolo) {
            setFormData(prev => ({ ...prev, id_catalogo: articolo.id }));
            setArticoloSelezionato(articolo);
        } else {
            setFormData(prev => ({ ...prev, id_catalogo: null }));
            setArticoloSelezionato(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validazione
        const newErrors = {};
        if (!formData.id_catalogo) newErrors.articolo = 'Selezionare un articolo.';
        if (!formData.id_magazzino) newErrors.magazzino = 'Selezionare un magazzino.';
        if (!formData.id_causale) newErrors.causale = 'Selezionare una causale.';
        if (!formData.quantita || parseFloat(formData.quantita) <= 0) newErrors.quantita = 'La quantità deve essere maggiore di zero.';
        
        const totaleQuantitaLotti = formData.lotti.reduce((sum, lotto) => sum + parseFloat(lotto.quantita || 0), 0);
        if (formData.lotti.length > 0 && parseFloat(formData.quantita) !== totaleQuantitaLotti) {
            newErrors.lotti = `La somma delle quantità dei lotti (${totaleQuantitaLotti}) non corrisponde alla quantità totale (${formData.quantita}).`;
        }
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSaving(true);
        setErrors({});
        try {
            await api.post('/magazzino/movimenti', formData);
            onSaveSuccess();
            onClose();
        } catch (error) {
            console.error("Errore durante il salvataggio del movimento:", error);
            setErrors({ form: error.response?.data?.message || 'Si è verificato un errore imprevisto.' });
        } finally {
            setIsSaving(false);
        }
    };
    
    // ... (altra logica del componente come gestione lotti, etc. rimane invariata)
    const handleAddLotto = () => {
        if (lottoInput.lotto && lottoInput.quantita) {
            setFormData(prev => ({
                ...prev,
                lotti: [...prev.lotti, { ...lottoInput }]
            }));
            setLottoInput({ lotto: '', quantita: '' });
        }
    };

    const handleRemoveLotto = (index) => {
        setFormData(prev => ({
            ...prev,
            lotti: prev.lotti.filter((_, i) => i !== index)
        }));
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <h2 className="text-xl font-bold mb-4">Nuovo Movimento di Magazzino</h2>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2">
                    {/* --- CAMPO ARTICOLO CORRETTO --- */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Articolo</label>
                        <SearchableCatalogoInput onItemSelected={handleArticoloSelected} />
                         {articoloSelezionato && (
                            <div className="mt-2 p-2 bg-gray-100 rounded-md">
                                <p className="text-sm font-medium text-gray-800">{articoloSelezionato.codice_entita} - {articoloSelezionato.descrizione}</p>
                            </div>
                        )}
                        {errors.articolo && <p className="text-red-600 text-sm mt-1">{errors.articolo}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                             <label className="block text-sm font-medium text-gray-700">Magazzino di Destinazione</label>
                             <SearchableInput
                                searchUrl="/magazzino/magazzini"
                                displayField="descrizione"
                                placeholder="Cerca magazzino..."
                                onItemSelected={(item) => setFormData(prev => ({ ...prev, id_magazzino: item ? item.id : null }))}
                            />
                            {errors.magazzino && <p className="text-red-600 text-sm mt-1">{errors.magazzino}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Causale Movimento</label>
                             <SearchableInput
                                searchUrl="/magazzino/causali"
                                displayField="descrizione"
                                placeholder="Cerca causale..."
                                onItemSelected={(item) => setFormData(prev => ({ ...prev, id_causale: item ? item.id : null }))}
                            />
                            {errors.causale && <p className="text-red-600 text-sm mt-1">{errors.causale}</p>}
                        </div>
                    </div>
                     <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Quantità</label>
                        <input
                            type="number"
                            step="any"
                            value={formData.quantita}
                            onChange={(e) => setFormData(prev => ({ ...prev, quantita: e.target.value }))}
                            className="mt-1 block w-full input-style"
                            required
                        />
                         {errors.quantita && <p className="text-red-600 text-sm mt-1">{errors.quantita}</p>}
                    </div>

                    {/* Gestione Lotti */}
                    <div className="mt-6 border-t pt-4">
                        <h3 className="text-lg font-medium text-gray-900">Gestione Lotti (opzionale)</h3>
                        <div className="flex items-end gap-2 mt-2">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700">Lotto</label>
                                <input type="text" value={lottoInput.lotto} onChange={e => setLottoInput(p => ({...p, lotto: e.target.value}))} className="input-style w-full" />
                            </div>
                            <div className="flex-1">
                                 <label className="block text-sm font-medium text-gray-700">Quantità Lotto</label>
                                <input type="number" step="any" value={lottoInput.quantita} onChange={e => setLottoInput(p => ({...p, quantita: e.target.value}))} className="input-style w-full" />
                            </div>
                            <button type="button" onClick={handleAddLotto} className="btn-secondary h-10"><PlusIcon className="h-5 w-5"/></button>
                        </div>
                         {errors.lotti && <p className="text-red-600 text-sm mt-1">{errors.lotti}</p>}
                        <ul className="mt-2 space-y-1">
                            {formData.lotti.map((lotto, index) => (
                                <li key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                    <span>Lotto: <strong>{lotto.lotto}</strong> - Q.tà: <strong>{lotto.quantita}</strong></span>
                                    <button type="button" onClick={() => handleRemoveLotto(index)}><XMarkIcon className="h-5 w-5 text-red-500"/></button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Riferimento Documento (es. DDT)</label>
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

