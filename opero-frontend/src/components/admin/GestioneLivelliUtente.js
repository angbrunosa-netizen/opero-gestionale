// #####################################################################
// # Sottocomponente Gestione Livelli Utente v1.8 (Fix Column IDs v2)
// # File: src/components/admin/GestioneLivelliUtente.js
// # Modifica: Assicurato che ogni definizione di colonna abbia un 'id'
// #           univoco e ben definito, anche quando 'accessorKey' è presente.
// #####################################################################

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import AdvancedDataGrid from '../../shared/AdvancedDataGrid';
import { PencilIcon, CheckIcon, XMarkIcon, ExclamationTriangleIcon, ArrowPathIcon, InformationCircleIcon } from '@heroicons/react/24/solid';

// Componente principale
function GestioneLivelliUtente() {
    // --- HOOKS ---
    const { user, hasPermission, ditta } = useAuth();
    const [utentiDitta, setUtentiDitta] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [editingUserId, setEditingUserId] = useState(null);
    const [newLevel, setNewLevel] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // --- PERMESSI ---
    const canManageLevels = hasPermission('AM_UTE_LVL');

    // --- FUNZIONI ---
    const fetchUtentiDitta = useCallback(async () => {
        // ... (logica invariata) ...
        if (!canManageLevels || !ditta || !ditta.id) {
            setError('Informazioni sulla ditta non disponibili. Effettua nuovamente il login o seleziona una ditta.');
            setUtentiDitta([]); return;
        }
        setLoading(true); setError(''); setSuccessMessage('');
        try {
            const response = await api.get('/admin/utenti-ditta');
            if (response.data.success) {
                const filteredData = response.data.data.filter(u => u.id !== user.id);
                setUtentiDitta(filteredData);
            } else { setError(response.data.message || 'Errore nel caricamento utenti.'); }
        } catch (err) {
            console.error('Errore API fetchUtentiDitta:', err);
             if (err.response?.data?.message === 'ID ditta non trovato nel token.') { setError('ID ditta non trovato nel token recuperato dal backend. Potrebbe essere necessario effettuare nuovamente il login.'); }
             else { setError(err.response?.data?.message || 'Errore di comunicazione con il server.'); }
        } finally { setLoading(false); }
    }, [user.id, canManageLevels, ditta]);

    useEffect(() => {
        // ... (logica invariata) ...
         if (canManageLevels && ditta && ditta.id) { fetchUtentiDitta(); }
         else if (canManageLevels && (!ditta || !ditta.id)) { setError('Informazioni sulla ditta non disponibili nel contesto. Effettua nuovamente il login o seleziona una ditta.'); }
    }, [fetchUtentiDitta, canManageLevels, ditta]);

    const handleEdit = (utente) => { /* ... (logica invariata) ... */ setEditingUserId(utente.id); setNewLevel(utente.livello_accesso !== null ? String(utente.livello_accesso) : ''); setError(''); setSuccessMessage(''); };
    const handleCancel = () => { /* ... (logica invariata) ... */ setEditingUserId(null); setNewLevel(''); setError(''); };
    const handleSave = async (userId) => { /* ... (logica invariata) ... */
        if (!ditta || !ditta.id) { setError('Impossibile salvare: informazioni sulla ditta mancanti.'); return; }
        const levelToSave = parseInt(newLevel, 10);
        if (isNaN(levelToSave) || levelToSave < 0) { setError('Inserisci un livello numerico valido (>= 0).'); return; }
        setLoading(true); setError(''); setSuccessMessage('');
        try {
            const response = await api.put(`/admin/utenti-ditta/${userId}/livello`, { livello: levelToSave });
            if (response.data.success) {
                setEditingUserId(null); setNewLevel(''); setSuccessMessage(response.data.message || 'Livello aggiornato!');
                await fetchUtentiDitta(); setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                 if (response.data.message === 'ID ditta non trovato nel token.') { setError('ID ditta non trovato nel token inviato al backend. Potrebbe essere necessario effettuare nuovamente il login.'); }
                 else { setError(response.data.message || 'Errore durante il salvataggio.'); }
            }
        } catch (err) {
            console.error('Errore API handleSave:', err);
             if (err.response?.data?.message === 'ID ditta non trovato nel token.') { setError('ID ditta non trovato nel token inviato al backend. Potrebbe essere necessario effettuare nuovamente il login.'); }
             else { setError(err.response?.data?.message || 'Errore di comunicazione con il server durante il salvataggio.'); }
        } finally { setLoading(false); }
     };


    // --- COLONNE (CORRETTE CON ID ESPLICITI E COERENTI) ---
    const columns = useMemo(() => [
        {
            id: 'nome', // ID Esplicito = accessorKey
            header: 'Nome',
            accessorKey: 'nome'
        },
        {
            id: 'cognome', // ID Esplicito = accessorKey
            header: 'Cognome',
            accessorKey: 'cognome'
        },
        {
            id: 'email', // ID Esplicito = accessorKey
            header: 'Email',
            accessorKey: 'email'
        },
        {
            id: 'livello_accesso', // ID Esplicito = accessorKey
            header: 'Livello Accesso',
            accessorKey: 'livello_accesso',
            cell: ({ row }) => {
                 const utente = row.original;
                 const isEditing = editingUserId === utente.id;
                 return isEditing ? ( <input type="number" min="0" value={newLevel} onChange={(e) => setNewLevel(e.target.value)} className="px-2 py-1 border border-blue-300 rounded-md w-20 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100" autoFocus disabled={loading} /> )
                 : ( <span className={`px-2 py-1 rounded text-sm ${utente.livello_accesso === null ? 'text-gray-400 italic' : 'font-medium text-gray-700'}`}> {utente.livello_accesso !== null ? utente.livello_accesso : 'Non Def.'} </span> );
            }
        },
        {
            // Per colonne senza accessorKey diretto, l'ID è obbligatorio
            id: 'actions', // ID Esplicito e univoco
            header: 'Azioni',
            // Non c'è accessorKey qui perché la cella è calcolata
            cell: ({ row }) => {
                 const utente = row.original;
                 const isEditing = editingUserId === utente.id;
                 return isEditing ? ( <div className="flex space-x-2"> <button onClick={() => handleSave(utente.id)} className="p-1 text-green-600 hover:text-green-800 disabled:opacity-50" disabled={loading} title="Salva" > <CheckIcon className="h-5 w-5" /> </button> <button onClick={handleCancel} className="p-1 text-red-600 hover:text-red-800 disabled:opacity-50" disabled={loading} title="Annulla" > <XMarkIcon className="h-5 w-5" /> </button> </div> )
                 : ( <button onClick={() => handleEdit(utente)} className="p-1 text-blue-600 hover:text-blue-800 disabled:opacity-50" disabled={loading || editingUserId !== null} title="Modifica Livello" > <PencilIcon className="h-5 w-5" /> </button> );
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ], [editingUserId, newLevel, loading]);


    // --- RENDER ---
    if (!canManageLevels) { /* ... errore permessi ... */ return ( <div className="p-4 text-center text-red-600 bg-red-100 rounded-md border border-red-200"> Non hai i permessi necessari (AM_UTE_LVL) per gestire i livelli utente. </div> ); }
    if (!ditta || !ditta.id) { /* ... errore ditta mancante ... */ return ( <div className="p-4 md:p-6 bg-white rounded-lg shadow-md mt-6"> <h2 className="text-xl font-semibold text-gray-800 mb-4">Gestione Livelli Accesso Utenti Ditta</h2> <div className="mb-4 p-3 text-sm text-yellow-700 bg-yellow-100 rounded-md border border-yellow-200 flex items-center"> <InformationCircleIcon className="h-5 w-5 inline mr-2 flex-shrink-0" /> <span>Nessuna ditta selezionata nel contesto o informazioni utente incomplete. Potrebbe essere necessario effettuare nuovamente il login o selezionare una ditta.</span> </div> </div> ); }

    return (
        // ... (JSX render invariato) ...
         <div className="p-4 md:p-6 bg-white rounded-lg shadow-md mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Gestione Livelli Accesso Utenti Ditta</h2>
            {error && ( <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-md border border-red-200 flex items-center"> <ExclamationTriangleIcon className="h-5 w-5 inline mr-2 flex-shrink-0" /> <span>{error}</span> </div> )}
            {successMessage && !error && ( <div className="mb-4 p-3 text-sm text-green-700 bg-green-100 rounded-md border border-green-200 flex items-center"> <CheckIcon className="h-5 w-5 inline mr-2 flex-shrink-0" /> <span>{successMessage}</span> </div> )}
            <AdvancedDataGrid columns={columns} data={utentiDitta} loading={loading && !editingUserId} filterable={true} pagination={true} defaultPageSize={10} />
            {loading && editingUserId && ( <p className="text-sm text-blue-600 mt-2 flex items-center"> <ArrowPathIcon className="h-4 w-4 animate-spin mr-1" /> Salvataggio in corso... </p> )}
        </div>
    );
}

export default GestioneLivelliUtente;

