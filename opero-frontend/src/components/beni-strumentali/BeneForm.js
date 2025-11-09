/**
 * File: /opero-frontend/src/components/beni-strumentali/BeneForm.js
 *
 * Versione: 4.1 (Fix useState)
 *
 * Descrizione:
 * - Re-inserisce le definizioni useState mancanti
 * (loading, isLoadingData, fornitori) che sono
 * state erroneamente rimosse nella v4.0,
 * causando gli errori ESLint 'no-undef'.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, Check, X, Info } from 'lucide-react';
import AllegatiManager from '../../shared/AllegatiManager';

// ... (Componenti helper FormInput, FormTextarea, FormSelect non modificati) ...
// Componente per i campi di input standardizzati
const FormInput = ({ label, id, value, onChange, ...props }) => (
    <div className="mb-4">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
        </label>
        <input
            type="text"
            id={id}
            name={id}
            value={value || ''}
            onChange={onChange}
            className="form-input" // Usa la classe definita nello stile
            {...props}
        />
    </div>
);

// Componente per i campi textarea
const FormTextarea = ({ label, id, value, onChange, ...props }) => (
    <div className="mb-4">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
        </label>
        <textarea
            id={id}
            name={id}
            value={value || ''}
            onChange={onChange}
            className="form-input" // Usa la classe definita nello stile
            rows="3"
            {...props}
        />
    </div>
);

// Componente per i campi select
const FormSelect = ({ label, id, value, onChange, children, ...props }) => (
    <div className="mb-4">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
        </label>
        <select
            id={id}
            name={id}
            value={value || ''}
            onChange={onChange}
            className="form-input" // Usa la classe definita nello stile
            {...props}
        >
            {children}
        </select>
    </div>
);


// --- MODIFICA v4.0: Accetta 'beneToEdit' (oggetto) e 'onClose' ---
const BeneForm = ({ beneToEdit, onSave, onClose }) => {
    
    // --- MODIFICA v4.0: Estrae l'ID dall'oggetto ---
    const beneId = beneToEdit?.id; 

    // --- CORREZIONE v4.1: Reinseriti gli state mancanti ---
    const [bene, setBene] = useState({});
    const [categorie, setCategorie] = useState([]);
    const [fornitori, setFornitori] = useState([]); // <-- CORRETTO
    const [loading, setLoading] = useState(false); // <-- CORRETTO
    const [isLoadingData, setIsLoadingData] = useState(true); // <-- CORRETTO
    // --- FINE CORREZIONE ---
    const navigate = useNavigate();

    // Stili (come v3.9)
    const stiliForm = `
        .form-input {
            width: 100%;
            padding: 0.5rem 0.75rem;
            border: 1px solid #D1D5DB; /* gray-300 */
            border-radius: 0.375rem; /* rounded-md */
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
            transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }
        .form-input:focus {
            outline: none;
            border-color: #3B82F6; /* blue-500 */
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25); /* Anello focus */
        }
        .form-input[disabled] {
            background-color: #F3F4F6; /* gray-100 */
            color: #6B7280; /* gray-500 */
            cursor: not-allowed;
        }
    `;

    // Caricamento dati per dropdown (come v3.9)
    const loadDropdownData = useCallback(async () => {
        try {
            const [categorieRes, fornitoriRes] = await Promise.all([
                api.get('/beni-strumentali/categorie'),
                api.get('/amministrazione/anagrafiche?tipo=fornitore')
            ]);

            setCategorie(Array.isArray(categorieRes.data) ? categorieRes.data : []);
            setFornitori(Array.isArray(fornitoriRes.data) ? fornitoriRes.data : []); // <-- ORA FUNZIONA

        } catch (error) {
            console.error("Errore nel caricamento dei dati per il form:", error);
            toast.error("Impossibile caricare i dati (categorie/fornitori).");
        }
    }, []);
        const [attachmentRefreshKey, setAttachmentRefreshKey] = useState(0);


    // --- MODIFICA v4.0: 'loadBene' rimosso, non più necessario ---

    // Effetto principale
    useEffect(() => {
        setIsLoadingData(true); // <-- ORA FUNZIONA
        // Carica solo i dati dei menu a tendina
        loadDropdownData().then(() => {
            // --- MODIFICA v4.0: Logica di caricamento basata su 'beneToEdit' ---
            if (beneId) {
                // MODALITÀ MODIFICA: i dati arrivano dalle props
                setBene(beneToEdit);
                setIsLoadingData(false); // <-- ORA FUNZIONA
            } else {
                // MODALITÀ CREA: stato iniziale
                setBene({ data_acquisto: new Date().toISOString().split('T')[0] });
                setIsLoadingData(false); // <-- ORA FUNZIONA
            }
            // --- FINE MODIFICA ---
        });
        // --- MODIFICA v4.0: Aggiornate le dipendenze ---
    }, [beneId, beneToEdit, loadDropdownData]);


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setBene(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    // Funzione handleSubmit (come v3.9, già corretta)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // <-- ORA FUNZIONA

        // Pulisce i campi numerici vuoti
        const dataToSave = {
            ...bene,
            valore_acquisto: bene.valore_acquisto || null,
            valore_ammortamento: bene.valore_ammortamento || null,
            id_categoria: bene.id_categoria || null,
            id_fornitore: bene.id_fornitore || null,
        };

        // --- CORREZIONE (v3.9) (Ancora valida) ---
        // Rimuoviamo i campi "virtuali" (dai JOIN)
        // che non esistono nella tabella 'bs_beni'.
        delete dataToSave.categoria_descrizione;
        delete dataToSave.created_at;
        delete dataToSave.updated_at;
        // --- FINE CORREZIONE ---

        try {
            if (beneId) {
                // Modifica (PATCH)
                await api.patch(`/beni-strumentali/${beneId}`, dataToSave);
                toast.success("Bene aggiornato con successo!");
            } else {
                // Creazione (POST)
                const res = await api.post('/beni-strumentali', dataToSave);
                toast.success("Bene creato con successo!");
                // ATTENZIONE: Questo 'navigate' potrebbe non essere
                // il comportamento desiderato in un modale.
                // Lo lasciamo, ma 'onSave()' è più importante.
                // navigate(`/beni-strumentali/${res.data.id}/edit`);
            }
            if (onSave) onSave(); // Chiude il modale e aggiorna la tabella
        } catch (error) {
            console.error("Errore nel salvataggio del bene:", error);
            toast.error("Errore nel salvataggio del bene. (Vedi console per dettagli)");
        } finally {
            setLoading(false); // <-- ORA FUNZIONA
        }
    };

    if (isLoadingData) { // <-- ORA FUNZIONA
        return <div className="p-4 text-center">Caricamento dati...</div>;
    }

    return (
        <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
            <style>{stiliForm}</style>

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                    {/* --- MODIFICA v4.0: Usa 'beneId' (derivato) --- */}
                    {beneId ? "Modifica Bene Strumentale" : "Nuovo Bene Strumentale"}
                </h2>
                {/* --- MODIFICA v4.0: Usa 'onClose' --- */}
                <button
                    onClick={onClose} 
                    className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Indietro
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Colonna 1: Dati Principali */}
                    <div className="md:col-span-2 space-y-4 bg-white p-6 rounded-lg shadow border">
                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
                            Dettagli Bene
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput
                                label="Codice (Identificativo)"
                                id="codice_bene" // CORRETTO (da bs_beni.sql)
                                name="codice_bene" // CORRETTO
                                value={bene.codice_bene} // CORRETTO
                                onChange={handleChange}
                                required
                            />
                            <FormSelect
                                label="Categoria"
                                id="id_categoria"
                                value={bene.id_categoria}
                                onChange={handleChange}
                            >
                                <option value="">Nessuna categoria</option>
                                {categorie.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.nome_categoria}
                                    </option>
                                ))}
                            </FormSelect>
                        </div>

                        <FormInput
                            label="Descrizione"
                            id="descrizione"
                            value={bene.descrizione}
                            onChange={handleChange}
                            required
                        />
                        <FormTextarea
                            label="Note"
                            id="note"
                            value={bene.note}
                            onChange={handleChange}
                        />

                        {/* Sezione Dati Acquisto */}
                        <div className="pt-4 mt-4 border-t">
                            <h4 className="text-md font-medium text-gray-700 mb-3">Dati Acquisto</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormInput
                                    label="Data Acquisto"
                                    id="data_acquisto"
                                    type="date"
                                    value={bene.data_acquisto ? bene.data_acquisto.split('T')[0] : ''}
                                    onChange={handleChange}
                                />
                                <FormInput
                                    label="Valore Acquisto (€)"
                                    id="valore_acquisto"
                                    type="number"
                                    step="0.01"
                                    value={bene.valore_acquisto}
                                    onChange={handleChange}
                                />
                                <FormSelect
                                    label="Fornitore"
                                    id="id_fornitore"
                                    value={bene.id_fornitore}
                                    onChange={handleChange}
                                >
                                    <option value="">Nessun fornitore</option>
                                    {fornitori.map(f => ( // <-- ORA FUNZIONA
                                        <option key={f.id} value={f.id}>
                                            {f.ragione_sociale}
                                        </option>
                                    ))}
                                </FormSelect>
                            </div>
                        </div>

                        {/* Sezione Ammortamento */}
                        <div className="pt-4 mt-4 border-t">
                            <h4 className="text-md font-medium text-gray-700 mb-3">Dati Contabili</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormInput
                                    label="Sottoconto Cespite"
                                    id="id_sottoconto_cespite" // CORRETTO (da bs_beni.sql)
                                    name="id_sottoconto_cespite" // CORRETTO
                                    value={bene.id_sottoconto_cespite} // CORRETTO
                                    onChange={handleChange}
                                    placeholder="Es. 24001"
                                />
                                <FormInput
                                    label="Sottoconto Costo"
                                    id="id_sottoconto_costo" // CORRETTO (da bs_beni.sql)
                                    name="id_sottoconto_costo" // CORRETTO
                                    value={bene.id_sottoconto_costo} // CORRETTO
                                    onChange={handleChange}
                                    placeholder="Es. 68001"
                                />
                                <FormInput
                                    label="Valore Ammortamento (€)"
                                    id="valore_ammortamento"
                                    type="number"
                                    step="0.01"
                                    value={bene.valore_ammortamento}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Colonna 2: Stato e Pulsanti */}
                    <div className="md:col-span-1 space-y-6">
                        {/* Box Stato */}
                        <div className="bg-white p-6 rounded-lg shadow border">
                            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
                                Stato
                            </h3>
                            <FormSelect
                                label="Stato del bene"
                                id="stato"
                                value={bene.stato}
                                onChange={handleChange}
                            >
                                <option value="In uso">In uso</option>
                                <option value="In magazzino">In magazzino</option>
                                <option value="In manutenzione">In manutenzione</option>
                                <option value="Dismesso">Dismesso</option>
                                <option value="Altro">Altro</option>
                            </FormSelect>

                            <FormInput
                                label="Ubicazione"
                                id="ubicazione"
                                value={bene.ubicazione}
                                onChange={handleChange}
                                placeholder="Es. Ufficio Amministrazione"
                            />
                            
                            {/* Esempio di altri campi da bs_beni.sql */}
                             <FormInput
                                label="Matricola"
                                id="matricola"
                                value={bene.matricola}
                                onChange={handleChange}
                                placeholder="Matricola o Seriale"
                            />
                             <FormInput
                                label="Rif. Fattura Acquisto"
                                id="riferimento_fattura"
                                value={bene.riferimento_fattura}
                                onChange={handleChange}
                                placeholder="Fattura n. 123"
                            />

                            {/*
                            <div className="mt-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="cespite_ammortizzabile" // Questo campo non c'è in bs_beni.sql
                                        checked={bene.cespite_ammortizzabile || false}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Cespite Ammortizzabile</span>
                                </label>
                            </div>
                            */}
                        </div>

                        {/* Box Azioni */}
                        <div className="bg-white p-6 rounded-lg shadow border">
                            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
                                Azioni
                            </h3>
                            <div className="flex flex-col space-y-3">
                                <button
                                    type="submit"
                                    disabled={loading} // <-- ORA FUNZIONA
                                    className="w-full flex justify-center items-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 disabled:bg-blue-300 transition"
                                >
                                    <Check className="w-5 h-5 mr-2" />
                                    {/* --- MODIFICA v4.0: Usa 'beneId' (derivato) --- */}
                                    {loading ? "Salvataggio..." : (beneId ? "Salva Modifiche" : "Crea Bene")} {/* <-- ORA FUNZIONA */}
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose} // --- MODIFICA v4.0: Usa 'onClose' ---
                                    className="w-full flex justify-center items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                                >
                                    <X className="w-5 h-5 mr-2" />
                                    Annulla
                                </button>
                            </div>
                        </div>

                        {/* Box Informazioni */}
                        {/* --- MODIFICA v4.0: Usa 'beneId' (derivato) --- */}
                        {beneId && (
                             <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg shadow">
                                 <div className="flex">
                                     <Info className="w-5 h-5 mr-3 flex-shrink-0" />
                                     <div>
                                        <p className="text-sm font-medium">ID Bene: {bene.id}</p>
                                        <p className="text-xs mt-1">ID Categoria: {bene.id_categoria || 'N/D'}</p>
                                        <p className="text-xs mt-1">ID Fornitore: {bene.id_fornitore || 'N/D'}</p>
                                     </div>
                                 </div>
                             </div>
                        )}
                    </div>
                </div>

                {/* --- SEZIONE ALLEGATI --- */}
                {/* --- MODIFICA v4.0: Usa 'beneId' (derivato) --- */}
                {beneId && (
                    <div className="mt-8 bg-white p-6 rounded-lg shadow border">
                        <AllegatiManager
                            entita_tipo="BENE_STRUMENTALE"
                            entita_id={beneId}
                            refreshKey={attachmentRefreshKey}

                        />
                    </div>
                )}
            </form>
        </div>
    );
};

export default BeneForm;