// #####################################################################
// # Modulo Contabilità Smart - v2.0 (Refactoring con Context API)
// # File: opero-frontend/src/components/ContSmartModule.js
// #####################################################################

import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api'; // Usiamo il nostro servizio API centralizzato
import { useAuth } from '../context/AuthContext'; // Usiamo il nostro "cervello" centrale

// --- Sotto-componente per la Gestione Anagrafiche ---
// Ora è autonomo e non dipende più da props esterne per l'autenticazione.
function AnagraficheManager() {
    const [anagrafiche, setAnagrafiche] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const { hasPermission } = useAuth(); // Usiamo l'hook per i permessi

    // La funzione ora usa 'api' e non ha bisogno del token
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            // La rotta è specifica per ContSmart
            const { data } = await api.get('/contsmart/anagrafiche');
            if (data.success) {
                setAnagrafiche(data.data);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Errore di connessione durante il caricamento delle anagrafiche.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (isLoading) return <p>Caricamento anagrafiche...</p>;
    if (error) return <p className="text-red-500">Errore: {error}</p>;

    return (
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ragione Sociale</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">P.IVA / C.F.</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {anagrafiche.map(row => (
                        <tr key={row.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{row.ragione_sociale}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{row.p_iva || row.codice_fiscale}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{row.mail_1}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}


// --- Componente Principale del Modulo ---
const ContSmartModule = () => {
  const { hasPermission } = useAuth();

  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4">
        Modulo Contabilità Smart
      </h1>
      
      <main>
        {/* Controlliamo il permesso prima di mostrare il gestore delle anagrafiche */}
        {hasPermission('ANAGRAFICHE_VIEW') ? (
            <AnagraficheManager />
        ) : (
            <p className="text-red-500">Non hai i permessi per visualizzare le anagrafiche.</p>
        )}
      </main>
    </div>
  );
};

export default ContSmartModule;
