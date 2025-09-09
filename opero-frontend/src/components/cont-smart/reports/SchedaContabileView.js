// #####################################################################
// # Componente per la Visualizzazione delle Schede Contabili
// # File: opero-gestionale/opero-frontend/src/components/cont-smart/reports/SchedaContabileView.js
// #####################################################################

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../../services/api';
import DynamicReportTable from '../../../shared/DynamicReportTable';

const getFormattedDate = (date) => date.toISOString().split('T')[0];
const formatCurrency = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? '0,00' : num.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const SchedaContabileView = () => {
    const [filters, setFilters] = useState({
        startDate: getFormattedDate(new Date(new Date().getFullYear(), 0, 1)),
        endDate: getFormattedDate(new Date()),
        contoId: ''
    });
    const [conti, setConti] = useState([]);
    const [data, setData] = useState({ saldo_iniziale: 0, movimenti: [] });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Carica la lista dei sottoconti per il filtro
        const fetchConti = async () => {
            try {
                const response = await api.get('/contsmart/pdc-flat'); // Assumiamo esista questa API per una lista flat
                if (response.data.success) {
                    // Filtriamo solo per i sottoconti che possono essere movimentati
                    setConti(response.data.data.filter(c => c.tipo === 'Sottoconto'));
                }
            } catch (err) {
                console.error("Errore nel caricamento del piano dei conti:", err);
            }
        };
        fetchConti();
    }, []);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const fetchData = useCallback(async () => {
        if (!filters.contoId) {
            setError('Selezionare un conto prima di procedere.');
            return;
        }
        setIsLoading(true);
        setError('');
        setData({ saldo_iniziale: 0, movimenti: [] });
        try {
            const response = await api.get(`/contsmart/reports/scheda-contabile`, { params: filters });
            if (response.data.success) {
                setData(response.data.data);
            } else {
                throw new Error(response.data.message || 'Errore nel caricamento dei dati');
            }
        } catch (err) {
            console.error(err);
            setError(err.message || 'Si è verificato un errore.');
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    const columns = [
        { key: 'data_registrazione', label: 'Data', sortable: true, render: item => new Date(item.data_registrazione).toLocaleDateString('it-IT') },
        { key: 'descrizione_testata', label: 'Descrizione', sortable: true },
        { key: 'importo_dare', label: 'Dare', sortable: true, render: item => <span className="text-right block">{formatCurrency(item.importo_dare)}</span> },
        { key: 'importo_avere', label: 'Avere', sortable: true, render: item => <span className="text-right block">{formatCurrency(item.importo_avere)}</span> },
    ];
    
    // Calcoliamo il saldo progressivo e finale
    let saldoProgressivo = data.saldo_iniziale;
    const movimentiConSaldo = data.movimenti.map(mov => {
        saldoProgressivo += mov.importo_dare - mov.importo_avere;
        return {...mov, saldo: saldoProgressivo};
    });
    const saldoFinale = saldoProgressivo;


    return (
        <div>
            <div className="bg-slate-50 p-4 rounded-lg mb-6 border border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-2">Filtri Scheda Contabile</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="md:col-span-2">
                        <label htmlFor="contoId" className="block text-sm font-medium text-slate-600">Conto</label>
                        <select name="contoId" id="contoId" value={filters.contoId} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                            <option value="">-- Seleziona un conto --</option>
                            {conti.map(conto => <option key={conto.id} value={conto.id}>{conto.codice} - {conto.descrizione}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-slate-600">Dal</label>
                        <input type="date" name="startDate" id="startDate" value={filters.startDate} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-slate-600">Al</label>
                        <input type="date" name="endDate" id="endDate" value={filters.endDate} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                    </div>
                </div>
                <div className="mt-4">
                     <button onClick={fetchData} disabled={isLoading || !filters.contoId} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                        {isLoading ? 'Caricamento...' : 'Cerca Movimenti'}
                    </button>
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>

            {data.movimenti.length > 0 && (
                <div className="mb-4 font-semibold text-slate-700">
                    <p>Saldo Iniziale al {new Date(filters.startDate).toLocaleDateString('it-IT')}: {formatCurrency(data.saldo_iniziale)}</p>
                </div>
            )}

            <DynamicReportTable data={movimentiConSaldo} columns={columns} isLoading={isLoading} title="Dettaglio Movimenti"/>
            
            {data.movimenti.length > 0 && (
                <div className="mt-4 text-right font-bold text-lg text-slate-800">
                    <p>Saldo Finale al {new Date(filters.endDate).toLocaleDateString('it-IT')}: {formatCurrency(saldoFinale)}</p>
                </div>
            )}
        </div>
    );
};

export default SchedaContabileView;
