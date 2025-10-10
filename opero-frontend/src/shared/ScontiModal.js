/**
 * Componente: ScontiModal
 * Versione: 1.0.0
 * Data: 11/10/2025
 * Posizione: opero-frontend/src/shared/ScontiModal.js
 * Descrizione: Modale riutilizzabile per la gestione di una catena di sconti a scalare.
 */
import React, { useState, useEffect } from 'react';
import { FaSave, FaTimesCircle, FaTrash, FaPlusCircle } from 'react-icons/fa';

const ScontiModal = ({ isOpen, onClose, onSave, initialSconti = [] }) => {
    const [sconti, setSconti] = useState([]);

    useEffect(() => {
        // Inizializza lo stato con gli sconti passati, garantendo che sia un array
        setSconti(Array.isArray(initialSconti) ? initialSconti : []);
    }, [initialSconti, isOpen]);

    const handleScontoChange = (index, field, value) => {
        const newSconti = [...sconti];
        newSconti[index] = { ...newSconti[index], [field]: value };
        setSconti(newSconti);
    };

    const addScontoRow = () => {
        setSconti([
            ...sconti,
            {
                ordine_applicazione: sconti.length + 1,
                tipo_sconto: 'percentuale',
                valore_sconto: '',
                tipo_esigibilita: 'immediata'
            }
        ]);
    };

    const removeScontoRow = (index) => {
        const newSconti = sconti
            .filter((_, i) => i !== index)
            .map((s, i) => ({ ...s, ordine_applicazione: i + 1 }));
        setSconti(newSconti);
    };

    const handleSave = () => {
        onSave(sconti);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold">Gestione Sconti a Scalare</h3>
                </div>
                <div className="p-4 max-h-96 overflow-y-auto">
                    {sconti.map((sconto, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 items-center mb-2">
                             <div className="col-span-1"><span className="font-bold text-gray-500">{sconto.ordine_applicazione}</span></div>
                             <div className="col-span-3">
                                <select value={sconto.tipo_sconto} onChange={(e) => handleScontoChange(index, 'tipo_sconto', e.target.value)} className="w-full p-2 border rounded-md">
                                    <option value="percentuale">%</option>
                                    <option value="importo">€</option>
                                </select>
                            </div>
                            <div className="col-span-4">
                                <input type="number" step="0.01" value={sconto.valore_sconto} onChange={(e) => handleScontoChange(index, 'valore_sconto', e.target.value)} placeholder="Valore" className="w-full p-2 border rounded-md" />
                            </div>
                             <div className="col-span-3">
                                <select value={sconto.tipo_esigibilita} onChange={(e) => handleScontoChange(index, 'tipo_esigibilita', e.target.value)} className="w-full p-2 border rounded-md">
                                    <option value="immediata">Immediata</option>
                                    <option value="differita">Differita</option>
                                </select>
                            </div>
                            <div className="col-span-1 text-right">
                                <button onClick={() => removeScontoRow(index)} className="text-red-500 hover:text-red-700 p-1"><FaTrash /></button>
                            </div>
                        </div>
                    ))}
                    <button onClick={addScontoRow} className="mt-2 text-blue-600 font-semibold inline-flex items-center"><FaPlusCircle className="mr-2" /> Aggiungi Sconto</button>
                </div>
                <div className="p-4 border-t flex justify-end gap-2">
                    <button onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300">Annulla</button>
                    <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Salva Sconti</button>
                </div>
            </div>
        </div>
    );
};

export default ScontiModal;