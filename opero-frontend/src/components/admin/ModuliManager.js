/**
 * @file opero-frontend/src/components/admin/ModuliManager.js
 * @description Componente per gestire la tabella 'moduli'.
 * - v1.2: Fix ER_BAD_FIELD_ERROR.
 * - Sostituito 'id' (errato) con 'codice' (corretto)
 * come chiave primaria (nel form, nelle API, nella tabella).
 * @date 2025-11-13
 * @version 1.2
 */

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { iconMap } from '../../lib/moduleRegistry';
import * as Icons from '@heroicons/react/24/outline';

const iconNameList = Object.keys(iconMap)
  .filter(key => key !== 'QuestionMarkCircleIcon')
  .sort();

// Sotto-componente: Modale di Modifica/Creazione
const ModuloFormModal = ({ modalState, onClose, onSave }) => {
    
    // (MODIFICATO v1.2) Aggiunto 'codice'
    const [formData, setFormData] = useState(
        modalState.mode === 'new' ? {
            codice: '', // <-- FIX: Aggiunto
            label: '',
            chiave_componente: '',
            permission_required: '',
            icon_name: '',
            ordine: 100,
            attivo: true
        } : modalState.data
    );

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData, modalState.mode);
    };

    const isNew = modalState.mode === 'new';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b">
                        <h3 className="text-xl font-semibold text-gray-800">
                            {isNew ? 'Nuovo Modulo di Sistema' : `Modifica Modulo: ${formData.chiave_componente}`}
                        </h3>
                    </div>

                    <div className="p-6 space-y-4 overflow-y-auto">
                        
                        {/* (NUOVO CAMPO v1.2) */}
                        <div>
                            <label htmlFor="codice" className="block text-sm font-medium text-gray-700">Codice (Chiave Primaria)</label>
                            <input
                                type="number"
                                id="codice"
                                name="codice"
                                value={formData.codice}
                                onChange={handleChange}
                                disabled={!isNew}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm font-mono disabled:bg-gray-100 disabled:text-gray-500"
                                placeholder="Es. 10, 20, 130..."
                                required
                            />
                            {isNew && (
                                <p className="mt-1 text-xs text-gray-500">
                                    Questo è l'ID univoco (PK) della tabella `moduli`.
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="label" className="block text-sm font-medium text-gray-700">Etichetta Menu (Descrizione)</label>
                            <input
                                type="text"
                                id="label"
                                name="label"
                                value={formData.label}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="chiave_componente" className="block text-sm font-medium text-gray-700">Chiave Componente (da `moduleRegistry.js`)</label>
                            <input
                                type="text"
                                id="chiave_componente"
                                name="chiave_componente"
                                value={formData.chiave_componente}
                                onChange={handleChange}
                                disabled={!isNew}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm font-mono disabled:bg-gray-100 disabled:text-gray-500"
                                placeholder="Es. CT_VIEW, MG_VIEW..."
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="permission_required" className="block text-sm font-medium text-gray-700">Permesso Richiesto (per il menu)</label>
                            <input
                                type="text"
                                id="permission_required"
                                name="permission_required"
                                value={formData.permission_required}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm font-mono"
                                placeholder="Es. CT_VIEW_MDVIEW"
                                required
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="icon_name" className="block text-sm font-medium text-gray-700">Icona</label>
                            <select
                                id="icon_name"
                                name="icon_name"
                                value={formData.icon_name}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            >
                                <option value="">-- Seleziona Icona --</option>
                                {iconNameList.map(iconName => (
                                    <option key={iconName} value={iconName}>{iconName}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="ordine" className="block text-sm font-medium text-gray-700">Ordine</label>
                            <input
                                type="number"
                                id="ordine"
                                name="ordine"
                                value={formData.ordine}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                required
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="attivo"
                                name="attivo"
                                checked={formData.attivo}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="attivo" className="ml-2 block text-sm text-gray-900">Attivo (visibile nel menu)</label>
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="btn-secondary">Annulla</button>
                        <button type="submit" className="btn-primary">Salva Modifiche</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// Componente Principale
const ModuliManager = () => {
    const { hasPermission } = useAuth();
    const [moduli, setModuli] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalState, setModalState] = useState({ mode: 'closed', data: null });

    const fetchModuli = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/system/modules/admin');
            setModuli(res.data);
        } catch (err) {
            toast.error("Errore nel caricamento dei moduli: " + err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (hasPermission('ADMIN_PANEL_MDVIEW')) {
            fetchModuli();
        }
    }, [fetchModuli, hasPermission]);

    const handleEdit = (modulo) => {
        setModalState({ mode: 'edit', data: modulo });
    };

    const handleNew = () => {
        setModalState({ mode: 'new', data: null });
    };

    // (MODIFICATO v1.2)
    const handleSave = async (formData, mode) => {
        const payload = {
            codice: formData.codice, // <-- FIX: Aggiunto
            descrizione: formData.label,
            chiave_componente: formData.chiave_componente,
            permission_required: formData.permission_required,
            icon_name: formData.icon_name,
            ordine: formData.ordine,
            attivo: formData.attivo,
        };

        try {
            if (mode === 'edit') {
                // API PUT (Modifica)
                await api.put(`/system/moduli/${formData.codice}`, payload); // <-- FIX: Era formData.id
                toast.success(`Modulo '${formData.label}' aggiornato.`);
            } else {
                // API POST (Nuovo)
                await api.post(`/system/moduli`, payload);
                toast.success(`Modulo '${formData.label}' creato con successo.`);
            }
            setModalState({ mode: 'closed', data: null });
            fetchModuli(); // Ricarica la lista
        } catch (err) {
            toast.error("Errore salvataggio: " + (err.response?.data?.error || err.message));
        }
    };

    if (!hasPermission('ADMIN_PANEL_MDVIEW')) {
         return <div className="p-4">Accesso non autorizzato.</div>;
    }

    if (isLoading) {
        return <div className="p-4">Caricamento moduli...</div>
    }

    return (
        <div className="p-4 md:p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Gestione Moduli di Sistema</h2>
                <button
                    onClick={handleNew}
                    className="btn-primary"
                >
                    <Icons.PlusIcon className="w-5 h-5 mr-2" />
                    Nuovo Modulo
                </button>
            </div>
            
            <p className="text-gray-600 mb-6">
                Da questo pannello puoi configurare i moduli visibili nel menu laterale, le loro icone e i permessi di accesso.
                <br />
                <span className="font-semibold">Nota:</span> L'aggiunta di un componente (es. 'MG_VIEW') deve essere fatta nel codice (`moduleRegistry.js`) da uno sviluppatore.
            </p>

            <div className="bg-white shadow rounded-lg border overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stato</th>
                            {/* (MODIFICATO v1.2) Aggiunta colonna Codice */}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Codice</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modulo (Etichetta)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Icona</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permesso Richiesto</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ordine</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Azione</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {moduli.map(m => {
                            const IconComponent = iconMap[m.icon_name] || Icons.QuestionMarkCircleIcon;
                            return (
                                // (MODIFICATO v1.2) Key ora usa 'codice'
                                <tr key={m.codice}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {m.attivo ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Attivo</span>
                                        ) : (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Nascosto</span>
                                        )}
                                    </td>
                                    {/* (MODIFICATO v1.2) Aggiunta colonna Codice */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{m.codice}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">{m.label}</div>
                                        <div className="text-sm text-gray-500">{m.chiave_componente}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <IconComponent className="w-5 h-5 text-gray-600" />
                                            <span>{m.icon_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{m.permission_required}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{m.ordine}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleEdit(m)} className="text-blue-600 hover:text-blue-900">Modifica</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {modalState.mode !== 'closed' && (
                <ModuloFormModal
                    modalState={modalState}
                    onClose={() => setModalState({ mode: 'closed', data: null })}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default ModuliManager;