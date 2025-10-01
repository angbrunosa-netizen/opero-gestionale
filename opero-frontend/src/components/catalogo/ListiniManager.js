/**
 * @file opero-frontend/src/components/catalogo/ListiniManager.js
 * @description Nuovo componente modale per la gestione avanzata dei listini di un'entità.
 * @date 2025-10-01
 * @version 1.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import AdvancedDataGrid from '../../shared/AdvancedDataGrid';
import { PlusIcon, ArrowPathIcon, XMarkIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';

// --- Sotto-Componente: Form di Creazione/Modifica Listino ---
const ListinoFormModal = ({ listino, entitaId, onSave, onCancel }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        const initialState = {
            nome_listino: '',
            data_inizio_validita: new Date().toISOString().slice(0, 10),
            data_fine_validita: null,
        };
        for (let i = 1; i <= 6; i++) {
            initialState[`prezzo_cessione_${i}`] = 0;
            initialState[`prezzo_pubblico_${i}`] = 0;
            initialState[`ricarico_${i}`] = 0;
        }
        
        // Se stiamo modificando, popoliamo con i dati esistenti
        if (listino) {
            const data = { ...initialState, ...listino };
            // Formatta le date per il campo input type="date"
            if (data.data_inizio_validita) data.data_inizio_validita = data.data_inizio_validita.slice(0,10);
            if (data.data_fine_validita) data.data_fine_validita = data.data_fine_validita.slice(0,10);
            setFormData(data);
        } else {
            setFormData(initialState);
        }
    }, [listino]);

    const handlePriceChange = (index, type, value) => {
        // ... (logica di calcolo ricarico/prezzo pubblico come da versione precedente)
    };

    const handleSubmit = (e) => { e.preventDefault(); onSave(formData, listino ? listino.id : null); };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[60]">
             <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <h2 className="text-xl font-bold mb-4">{listino ? 'Modifica Listino' : 'Nuovo Listino'}</h2>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2">
                    {/* ... Form completo con i 6 blocchi prezzo ... */}
                </form>
             </div>
        </div>
    );
};


// --- Componente Principale: Gestore Listini ---
const ListiniManager = ({ entita, onClose }) => {
    const { hasPermission } = useAuth();
    const [listini, setListini] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingListino, setEditingListino] = useState(null);

    const fetchListini = useCallback(async () => { /* ... logica invariata ... */ });

    useEffect(() => { fetchListini(); }, [fetchListini]);

    const handleSave = async (data, listinoId) => { /* ... logica di salvataggio ... */ };
    const handleEdit = (listino) => { setEditingListino(listino); setIsFormOpen(true); };
    const handleDelete = async (listino) => { /* ... logica eliminazione ... */ };

    const columns = useMemo(() => [
        { header: 'Nome Listino', accessorKey: 'nome_listino' },
        { header: 'Inizio Validità', accessorKey: 'data_inizio_validita', cell: info => new Date(info.getValue()).toLocaleDateString('it-IT') },
        { header: 'Fine Validità', accessorKey: 'data_fine_validita', cell: info => info.getValue() ? new Date(info.getValue()).toLocaleDateString('it-IT') : 'Senza Scadenza' },
        { header: 'P. Cessione 1', accessorKey: 'prezzo_cessione_1', cell: info => `€ ${parseFloat(info.getValue() || 0).toFixed(2)}` },
        { header: 'Azioni', id: 'actions', cell: ({row}) => (
            <div className="flex gap-2">
                {hasPermission('CT_LISTINI_MANAGE') && (
                    <>
                        <button onClick={() => handleEdit(row.original)} title="Modifica"><PencilIcon className="h-5 w-5 text-blue-600"/></button>
                        <button onClick={() => handleDelete(row.original)} title="Elimina"><TrashIcon className="h-5 w-5 text-red-600"/></button>
                    </>
                )}
            </div>
        )}
    ], [hasPermission]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-slate-50 rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
                <header className="flex justify-between items-center p-4 border-b">
                    <div>
                        <h2 className="text-xl font-bold">Gestione Listini</h2>
                        <p className="text-sm text-gray-600">{entita.codice_entita} - {entita.descrizione}</p>
                    </div>
                    <button onClick={onClose}><XMarkIcon className="h-6 w-6"/></button>
                </header>
                <main className="flex-1 p-4 overflow-y-auto">
                    <div className="flex justify-end mb-4">
                        {hasPermission('CT_LISTINI_MANAGE') && (
                             <button onClick={() => { setEditingListino(null); setIsFormOpen(true); }} className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md text-sm"><PlusIcon className="h-5 w-5 mr-1"/> Nuovo Listino</button>
                        )}
                         <button onClick={fetchListini} title="Ricarica dati" className="p-2 ml-2"><ArrowPathIcon className="h-5 w-5"/></button>
                    </div>
                    <AdvancedDataGrid columns={columns} data={listini} loading={loading} error={error} />
                </main>

                {isFormOpen && (
                    <ListinoFormModal 
                        listino={editingListino}
                        entitaId={entita.id}
                        onSave={handleSave}
                        onCancel={() => setIsFormOpen(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default ListiniManager;

