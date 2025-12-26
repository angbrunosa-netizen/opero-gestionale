/**
 * File: opero-frontend/src/components/admin/DittaFormModal.js
 * Versione: 3.0 (Con Controllo Accessi per Ruolo)
 * Descrizione:
 * - SUPER_ADMIN: Può modificare tutti i campi
 * - Altri ruoli: NON possono modificare ragione sociale e altri campi critici
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const DittaFormModal = ({ ditta, onSave, onCancel }) => {
    const { hasPermission } = useAuth();
    const isSystemAdmin = hasPermission('SUPER_ADMIN');
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (ditta) {
            setFormData({
                ...ditta,
                max_utenti_interni: ditta.max_utenti_interni || 1,
                max_utenti_esterni: ditta.max_utenti_esterni || 1
            });
        } else {
            // Stato iniziale per la creazione di una nuova ditta
            setFormData({
                ragione_sociale: '',
                p_iva: '',
                codice_fiscale: '',
                indirizzo: '',
                cap: '',
                citta: '',
                provincia: '',
                tel1: '',
                // ++ CAMPO EMAIL CORRETTO ++
                mail_1: '',
                // ++ NUOVI CAMPI ++
                mail_2: '',
                logo_url: '',
                sdi: '',
                pec: '',
                id_tipo_ditta: 1,
                stato: 1,
                max_utenti_interni: 1,
                max_utenti_esterni: 1,
                email_amministratore: '',
                max_storage_mb :1000,
                current_storage_bytes :0
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

                {/* Avviso per non-amministratori */}
                {!isSystemAdmin && !isCreating && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-sm text-yellow-800">
                            <strong>Nota:</strong> Alcuni campi (Ragione Sociale, Partita IVA) possono essere modificati solo dagli amministratori di sistema.
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    <fieldset className="border p-4 rounded-md">
                        <legend className="text-lg font-semibold px-2">Anagrafica Ditta</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Campi critici: modificabili solo da SUPER_ADMIN */}
                            <input
                                type="text"
                                name="ragione_sociale"
                                value={formData.ragione_sociale || ''}
                                onChange={handleChange}
                                placeholder="Ragione Sociale *"
                                required
                                disabled={!isSystemAdmin && !isCreating}
                                className={`p-2 border rounded ${!isSystemAdmin && !isCreating ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                title={!isSystemAdmin && !isCreating ? 'Solo gli amministratori di sistema possono modificare la ragione sociale' : ''}
                            />
                            <input
                                type="text"
                                name="p_iva"
                                value={formData.p_iva || ''}
                                onChange={handleChange}
                                placeholder="Partita IVA *"
                                required
                                disabled={!isSystemAdmin && !isCreating}
                                className={`p-2 border rounded ${!isSystemAdmin && !isCreating ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                title={!isSystemAdmin && !isCreating ? 'Solo gli amministratori di sistema possono modificare la P.IVA' : ''}
                            />
                            <input type="text" name="codice_fiscale" value={formData.codice_fiscale || ''} onChange={handleChange} placeholder="Codice Fiscale" className="p-2 border rounded" />
                            <input type="text" name="indirizzo" value={formData.indirizzo || ''} onChange={handleChange} placeholder="Indirizzo" className="p-2 border rounded" />
                            <input type="text" name="cap" value={formData.cap || ''} onChange={handleChange} placeholder="CAP" className="p-2 border rounded" />
                            <input type="text" name="citta" value={formData.citta || ''} onChange={handleChange} placeholder="Città" className="p-2 border rounded" />
                            <input type="text" name="provincia" value={formData.provincia || ''} onChange={handleChange} placeholder="Provincia (es. MI)" className="p-2 border rounded" />
                            <input type="tel" name="tel1" value={formData.tel1 || ''} onChange={handleChange} placeholder="Telefono" className="p-2 border rounded" />

                            {/* ++ CAMPO EMAIL PRINCIPALE ++ */}
                            <input type="email" name="mail_1" value={formData.mail_1 || ''} onChange={handleChange} placeholder="Email Principale" className="p-2 border rounded" />

                            {/* ++ NUOVI CAMPI: Email Secondaria, SDI, PEC, Logo ++ */}
                            <input type="email" name="mail_2" value={formData.mail_2 || ''} onChange={handleChange} placeholder="Email Secondaria" className="p-2 border rounded" />
                            <input type="text" name="pec" value={formData.pec || ''} onChange={handleChange} placeholder="PEC (Posta Elettronica Certificata)" className="p-2 border rounded" />
                            <input type="text" name="sdi" value={formData.sdi || ''} onChange={handleChange} placeholder="SDI (max 7 caratteri)" maxLength="7" className="p-2 border rounded" />
                            <input type="url" name="logo_url" value={formData.logo_url || ''} onChange={handleChange} placeholder="URL Logo (es. https://...)" className="p-2 border rounded md:col-span-2" />

                            {isCreating && (
                                <input
                                    type="email"
                                    name="email_amministratore"
                                    value={formData.email_amministratore || ''}
                                    onChange={handleChange}
                                    placeholder="Email Amministratore Ditta *"
                                    required
                                    className="p-2 border rounded"
                                />
                            )}

                             <select name="id_tipo_ditta" value={formData.id_tipo_ditta || ''} onChange={handleChange} className="w-full p-2 border rounded" disabled={!isCreating}>
                                 <option value="1">Proprietaria</option>
                             </select>
                            
                            <div className="grid grid-cols-2 gap-4 md:col-span-2">
                                <div>
                                    <label htmlFor="max_utenti_interni" className="text-sm font-medium text-gray-600">Max Utenti Interni</label>
                                    <input id="max_utenti_interni" type="number" name="max_utenti_interni" value={formData.max_utenti_interni || 1} onChange={handleChange} min="0" className="w-full p-2 border rounded" />
                                </div>
                                <div>
                                    <label htmlFor="max_utenti_esterni" className="text-sm font-medium text-gray-600">Max Utenti Esterni</label>
                                    <input id="max_utenti_esterni" type="number" name="max_utenti_esterni" value={formData.max_utenti_esterni || 1} onChange={handleChange} min="0" className="w-full p-2 border rounded" />
                                </div>
                                 <div>
                                    <label htmlFor="Spazio di Archiviazione" className="text-sm font-medium text-gray-600">Spazio di archiviazione</label>
                                    <input id="Spazio di Archiviazione" type="number" name="max_storage_mb" value={formData.max_storage_mb || 1000} onChange={handleChange} min="0" className="w-full p-2 border rounded" />
                                </div>
                                <div>
                                    <label htmlFor="Utilizzo storage MB" className="text-sm font-medium text-gray-600">Utilizzo storage MB </label>
                                    <input id="Utilizzo storage" type="number" name="currend_storage_bytes " value={formData.current_storage_bytes } onChange={handleChange} min="0" className="w-full p-2 border rounded" />
                                </div>
                            </div>
                        </div>
                    </fieldset>
                    
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

