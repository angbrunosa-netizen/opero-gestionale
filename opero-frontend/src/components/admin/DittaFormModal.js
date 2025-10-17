/**
 * File: opero-frontend/src/components/admin/DittaFormModal.js
 * Versione: 1.2
 * Descrizione: Sostituito 'max_utenti' con i campi specifici 'max_utenti_interni' e 'max_utenti_esterni'
 * per allinearsi alla struttura del database.
 */
import React, { useState, useEffect } from 'react';

const DittaFormModal = ({ ditta, onSave, onCancel }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (ditta) {
            setFormData({ 
                ...ditta,
                // Assicuriamoci che i valori siano numeri, default a 1 se non presenti
                max_utenti_interni: ditta.max_utenti_interni || 1,
                max_utenti_esterni: ditta.max_utenti_esterni || 1
            });
        } else {
            setFormData({
                ragione_sociale: '',
                p_iva: '',
                codice_fiscale: '',
                indirizzo: '',
                cap: '',
                citta: '',
                provincia: '',
                tel1: '',
                email_gen: '',
                id_tipo_ditta: 1,
                stato: 1,
                max_utenti_interni: 1, // Default per nuove ditte
                max_utenti_esterni: 1, // Default per nuove ditte
                nome_utente: '',
                cognome_utente: '',
                email_utente: '',
                password_utente: ''
            });
        }
    }, [ditta]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'number' ? parseInt(value, 10) : value 
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const isCreating = !ditta;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
                <h3 className="text-xl font-bold mb-6">{isCreating ? 'Nuova Ditta Proprietaria' : 'Modifica Ditta'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    <fieldset className="border p-4 rounded-md">
                        <legend className="text-lg font-semibold px-2">Anagrafica Ditta</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" name="ragione_sociale" value={formData.ragione_sociale || ''} onChange={handleChange} placeholder="Ragione Sociale *" required className="p-2 border rounded" />
                            <input type="text" name="p_iva" value={formData.p_iva || ''} onChange={handleChange} placeholder="Partita IVA" className="p-2 border rounded" />
                            <input type="text" name="codice_fiscale" value={formData.codice_fiscale || ''} onChange={handleChange} placeholder="Codice Fiscale" className="p-2 border rounded" />
                            <input type="text" name="indirizzo" value={formData.indirizzo || ''} onChange={handleChange} placeholder="Indirizzo" className="p-2 border rounded" />
                            <input type="text" name="cap" value={formData.cap || ''} onChange={handleChange} placeholder="CAP" className="p-2 border rounded" />
                            <input type="text" name="citta" value={formData.citta || ''} onChange={handleChange} placeholder="Città" className="p-2 border rounded" />
                            <input type="text" name="provincia" value={formData.provincia || ''} onChange={handleChange} placeholder="Provincia (es. MI)" className="p-2 border rounded" />
                            <input type="tel" name="tel1" value={formData.tel1 || ''} onChange={handleChange} placeholder="Telefono" className="p-2 border rounded" />
                            <input type="email" name="email_gen" value={formData.email_gen || ''} onChange={handleChange} placeholder="Email Generale" className="p-2 border rounded" />
                             <select name="id_tipo_ditta" value={formData.id_tipo_ditta || ''} onChange={handleChange} className="w-full p-2 border rounded">
                                <option value="1">Proprietaria</option>
                                <option value="2">Cliente</option>
                            </select>
                            {/* ++ CAMPI MAX UTENTI AGGIORNATI ++ */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="max_utenti_interni" className="text-sm font-medium text-gray-600">Max Utenti Interni</label>
                                    <input id="max_utenti_interni" type="number" name="max_utenti_interni" value={formData.max_utenti_interni || 1} onChange={handleChange} min="0" className="w-full p-2 border rounded" />
                                </div>
                                <div>
                                    <label htmlFor="max_utenti_esterni" className="text-sm font-medium text-gray-600">Max Utenti Esterni</label>
                                    <input id="max_utenti_esterni" type="number" name="max_utenti_esterni" value={formData.max_utenti_esterni || 1} onChange={handleChange} min="0" className="w-full p-2 border rounded" />
                                </div>
                            </div>
                        </div>
                    </fieldset>

                    {isCreating && (
                         <fieldset className="border p-4 rounded-md">
                            <legend className="text-lg font-semibold px-2">Amministratore Iniziale</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="text" name="nome_utente" value={formData.nome_utente || ''} onChange={handleChange} placeholder="Nome Utente *" required className="p-2 border rounded" />
                                <input type="text" name="cognome_utente" value={formData.cognome_utente || ''} onChange={handleChange} placeholder="Cognome Utente *" required className="p-2 border rounded" />
                                <input type="email" name="email_utente" value={formData.email_utente || ''} onChange={handleChange} placeholder="Email Utente *" required className="p-2 border rounded" />
                                <input type="password" name="password_utente" value={formData.password_utente || ''} onChange={handleChange} placeholder="Password Utente *" required className="p-2 border rounded" />
                            </div>
                        </fieldset>
                    )}
                    
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Annulla</button>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Salva</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DittaFormModal;

