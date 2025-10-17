/**
 * File: opero-frontend/src/components/admin/AdminDitte.js
 * Versione: 1.1
 * Descrizione: Componente corretto per la gestione delle ditte. Ora interpreta correttamente lo stato (1=attivo, 0/null=sospeso)
 * per la visualizzazione dei colori (semaforo) e per la logica dell'azione di attivazione/sospensione.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { api } from '../../services/api';
import AdvancedDataGrid from '../../shared/AdvancedDataGrid';
import { PlusIcon, PowerIcon, PlayIcon } from '@heroicons/react/24/outline';

const AdminDitte = () => {
    const [ditte, setDitte] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filtroTipo, setFiltroTipo] = useState('tutte'); // 'tutte', 'proprietarie', 'clienti'

    const fetchDitte = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/ditte');
            setDitte(response.data.ditte || []);
        } catch (error) {
            toast.error("Errore nel caricamento delle ditte.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDitte();
    }, [fetchDitte]);

    const handleToggleStato = useCallback(async (ditta) => {
        // Logica Corretta: 1 -> 0, 0/null -> 1
        const nuovoStato = ditta.stato === 1 ? 0 : 1;
        const nuovoStatoLabel = nuovoStato === 1 ? 'attivo' : 'sospeso';

        if (window.confirm(`Sei sicuro di voler impostare lo stato di "${ditta.ragione_sociale}" a "${nuovoStatoLabel}"?`)) {
            try {
                // L'API si aspetta 'stato' nel body della patch
                await api.patch(`/admin/ditte/${ditta.id}`, { stato: nuovoStato });
                toast.success(`Stato della ditta aggiornato a "${nuovoStatoLabel}".`);
                fetchDitte(); // Ricarica i dati per riflettere la modifica
            } catch (error) {
                toast.error("Errore durante l'aggiornamento dello stato della ditta.");
                console.error(error);
            }
        }
    }, [fetchDitte]);

    const ditteFiltrate = useMemo(() => {
        if (filtroTipo === 'proprietarie') {
            return ditte.filter(d => d.id_tipo_ditta === 1);
        }
        if (filtroTipo === 'clienti') {
            return ditte.filter(d => d.id_tipo_ditta === 2);
        }
        return ditte;
    }, [ditte, filtroTipo]);

    const columns = useMemo(() => [
        { header: 'ID', accessorKey: 'id', size: 90 },
        { header: 'Ragione Sociale', accessorKey: 'ragione_sociale', size: 300 },
        { header: 'P.IVA', accessorKey: 'p_iva', size: 150 },
        {
            header: 'Stato',
            accessorKey: 'stato',
            size: 120,
            cell: info => {
                const stato = info.getValue();
                // ++ LOGICA CORRETTA: 1 è attivo (verde), altrimenti sospeso (giallo) ++
                const isAttivo = stato === 1;
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isAttivo ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {isAttivo ? 'Attivo' : 'Sospeso'}
                    </span>
                );
            },
        },
        { header: 'Tipo', accessorKey: 'tipo_ditta_nome', size: 150 },
        {
            id: 'actions',
            header: 'Azioni',
            cell: ({ row }) => {
                const ditta = row.original;
                // ++ LOGICA CORRETTA: L'azione è l'inverso dello stato attuale ++
                const isAttivo = ditta.stato === 1;
                
                return (
                    <div className="flex space-x-2">
                        <button 
                            onClick={() => handleToggleStato(ditta)}
                            className={`p-1 rounded ${isAttivo ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}`}
                            title={isAttivo ? 'Sospendi Ditta' : 'Attiva Ditta'}
                        >
                            {isAttivo ? <PowerIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
                        </button>
                    </div>
                );
            }
        }
    ], [handleToggleStato]);
    
    const FiltroButton = ({ label, tipo, attivo }) => (
         <button
            onClick={() => setFiltroTipo(tipo)}
            className={`px-3 py-1 text-sm rounded-md ${attivo ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <FiltroButton label="Tutte" tipo="tutte" attivo={filtroTipo === 'tutte'} />
                    <FiltroButton label="Proprietarie" tipo="proprietarie" attivo={filtroTipo === 'proprietarie'} />
                    <FiltroButton label="Clienti" tipo="clienti" attivo={filtroTipo === 'clienti'} />
                </div>
                 <button onClick={() => toast.info("Funzionalità 'Nuova Ditta' in sviluppo.")} className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                    <PlusIcon className="h-5 w-5" />
                    <span>Nuova Ditta</span>
                </button>
            </div>
            <AdvancedDataGrid
                columns={columns}
                data={ditteFiltrate}
                isLoading={loading}
            />
        </div>
    );
};

export default AdminDitte;