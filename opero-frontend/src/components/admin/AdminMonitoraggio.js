/**
 * File: opero-frontend/src/components/admin/AdminMonitoraggio.js
 * Versione: 1.0
 * Descrizione: Componente dedicato alla visualizzazione dei log di sistema (azioni, accessi) e delle sessioni utente attive.
 * Viene caricato come una scheda all'interno del pannello di amministrazione principale.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AdvancedDataGrid from '../../shared/AdvancedDataGrid';

const AdminMonitoraggio = () => {
    const { hasPermission } = useAuth();
    const [subTab, setSubTab] = useState('log_azioni');

    // Stati per i dati
    const [logAzioni, setLogAzioni] = useState([]);
    const [logAccessi, setLogAccessi] = useState([]);
    const [sessioniAttive, setSessioniAttive] = useState([]);
    const [loading, setLoading] = useState(false);

    // Funzioni di fetch
    const fetchLogAzioni = useCallback(async () => {
        if (!hasPermission('ADMIN_LOGS_VIEW')) return;
        setLoading(true);
        try {
            const response = await api.get('/admin/logs/azioni');
            setLogAzioni(response.data.data);
        } catch (error) {
            toast.error("Errore nel caricamento dei log azioni.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [hasPermission]);

    const fetchLogAccessi = useCallback(async () => {
        if (!hasPermission('ADMIN_LOGS_VIEW')) return;
        setLoading(true);
        try {
            const response = await api.get('/admin/logs/accessi');
            setLogAccessi(response.data.data);
        } catch (error) {
            toast.error("Errore nel caricamento dei log accessi.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [hasPermission]);

    const fetchSessioniAttive = useCallback(async () => {
        if (!hasPermission('ADMIN_SESSIONS_VIEW')) return;
        setLoading(true);
        try {
            const response = await api.get('/admin/logs/sessioni-attive');
            setSessioniAttive(response.data.data);
        } catch (error) {
            toast.error("Errore nel caricamento delle sessioni attive.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [hasPermission]);

    useEffect(() => {
        // Imposta il tab predefinito in base ai permessi
        if (hasPermission('ADMIN_LOGS_VIEW')) {
            setSubTab('log_azioni');
        } else if (hasPermission('ADMIN_SESSIONS_VIEW')) {
            setSubTab('sessioni');
        }
    }, [hasPermission]);

    useEffect(() => {
        if (subTab === 'log_azioni') fetchLogAzioni();
        if (subTab === 'log_accessi') fetchLogAccessi();
        if (subTab === 'sessioni') fetchSessioniAttive();
    }, [subTab, fetchLogAzioni, fetchLogAccessi, fetchSessioniAttive]);

    // Definizioni colonne
    const logAzioniColumns = [
        { header: 'ID', accessorKey: 'id', size: 90 },
        { header: 'Data/Ora', accessorKey: 'timestamp', cell: info => new Date(info.getValue()).toLocaleString('it-IT') },
        { header: 'Utente', accessorKey: 'email' },
        { header: 'Ditta', accessorKey: 'ragione_sociale' },
        { header: 'Azione', accessorKey: 'azione' },
        { header: 'Dettagli', accessorKey: 'dettagli', size: 400 },
    ];
    
    const logAccessiColumns = [
        { header: 'ID', accessorKey: 'id', size: 90 },
        { header: 'Data/Ora', accessorKey: 'data_ora_accesso', cell: info => new Date(info.getValue()).toLocaleString('it-IT') },
        { header: 'Utente', accessorKey: 'email' },
        { header: 'Indirizzo IP', accessorKey: 'indirizzo_ip' },
        { header: 'Esito', accessorKey: 'dettagli_azione' },
    ];

    const sessioniColumns = [
        { header: 'Utente', accessorKey: 'email' },
        { header: 'Nome', accessorKey: 'nome' },
        { header: 'Cognome', accessorKey: 'cognome' },
        { header: 'Ditta Attiva', accessorKey: 'ditta_attiva' },
        { header: 'Login', accessorKey: 'login_timestamp', cell: info => new Date(info.getValue()).toLocaleString('it-IT') },
        { header: 'Ultima Attività', accessorKey: 'last_heartbeat_timestamp', cell: info => new Date(info.getValue()).toLocaleString('it-IT') },
    ];
    
    const SubTabButton = ({ active, onClick, children }) => (
        <button
            onClick={onClick}
            className={`px-3 py-1.5 text-sm font-medium rounded ${
                active
                    ? 'bg-gray-200 text-gray-800'
                    : 'text-gray-500 hover:bg-gray-100'
            }`}
        >
            {children}
        </button>
    );

    return (
        <div className="p-4">
             <div className="flex space-x-2 mb-4 border-b pb-2">
                 {hasPermission('ADMIN_LOGS_VIEW') && <SubTabButton active={subTab === 'log_azioni'} onClick={() => setSubTab('log_azioni')}>Log Azioni</SubTabButton>}
                 {hasPermission('ADMIN_LOGS_VIEW') && <SubTabButton active={subTab === 'log_accessi'} onClick={() => setSubTab('log_accessi')}>Log Accessi</SubTabButton>}
                 {hasPermission('ADMIN_SESSIONS_VIEW') && <SubTabButton active={subTab === 'sessioni'} onClick={() => setSubTab('sessioni')}>Sessioni Attive</SubTabButton>}
            </div>
            {subTab === 'log_azioni' && hasPermission('ADMIN_LOGS_VIEW') && (
                <AdvancedDataGrid title="Log delle Azioni" columns={logAzioniColumns} data={logAzioni} isLoading={loading} onRefresh={fetchLogAzioni} />
            )}
            {subTab === 'log_accessi' && hasPermission('ADMIN_LOGS_VIEW') && (
                 <AdvancedDataGrid title="Log degli Accessi" columns={logAccessiColumns} data={logAccessi} isLoading={loading} onRefresh={fetchLogAccessi} />
            )}
            {subTab === 'sessioni' && hasPermission('ADMIN_SESSIONS_VIEW') && (
                 <AdvancedDataGrid title="Sessioni Utente Attive" columns={sessioniColumns} data={sessioniAttive} isLoading={loading} onRefresh={fetchSessioniAttive} />
            )}
        </div>
    );
};

export default AdminMonitoraggio;
