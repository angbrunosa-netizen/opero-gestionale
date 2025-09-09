// #####################################################################
// # Componente per la Visualizzazione del Bilancio di Verifica
// # File: opero-gestionale/opero-frontend/src/components/cont-smart/reports/BilancioVerificaView.js
// #####################################################################

import React, { useState, useCallback, useMemo } from 'react';
import { api } from '../../../services/api';
import DynamicReportTable from '../../../shared/DynamicReportTable';

const getFormattedDate = (date) => date.toISOString().split('T')[0];
const formatCurrency = (value) => {
    const num = parseFloat(value);
    if (isNaN(num) || num === 0) return '';
    return num.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};


const BilancioVerificaView = () => {
    const [filters, setFilters] = useState({ date: getFormattedDate(new Date()) });
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError('');
        setData([]);
        try {
            const response = await api.get(`/contsmart/reports/bilancio-verifica`, { params: filters });
            if (response.data.success) {
                setData(response.data.data);
            } else {
                throw new Error(response.data.message || 'Errore');
            }
        } catch (err) {
            console.error(err);
            setError(err.message || 'Si è verificato un errore.');
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    // Calcoliamo i totali e i saldi con useMemo per efficienza
    const { processedData, totals } = useMemo(() => {
        let totalDare = 0;
        let totalAvere = 0;
        const processed = data.map(item => {
            totalDare += parseFloat(item.totale_dare);
            totalAvere += parseFloat(item.totale_avere);
            const saldo = item.totale_dare - item.totale_avere;
            return {
                ...item,
                saldo_dare: saldo > 0 ? saldo : 0,
                saldo_avere: saldo < 0 ? -saldo : 0,
            };
        });
        return { 
            processedData: processed, 
            totals: { totalDare, totalAvere }
        };
    }, [data]);

    const columns = [
        { key: 'codice_conto', label: 'Conto', sortable: true },
        { key: 'descrizione_conto', label: 'Descrizione', sortable: true },
        { key: 'totale_dare', label: 'Totale Dare', sortable: true, render: item => <span className="text-right block">{formatCurrency(item.totale_dare)}</span> },
        { key: 'totale_avere', label: 'Totale Avere', sortable: true, render: item => <span className="text-right block">{formatCurrency(item.totale_avere)}</span> },
        { key: 'saldo_dare', label: 'Saldo Dare', sortable: true, render: item => <span className="font-semibold text-right block">{formatCurrency(item.saldo_dare)}</span> },
        { key: 'saldo_avere', label: 'Saldo Avere', sortable: true, render: item => <span className="font-semibold text-right block">{formatCurrency(item.saldo_avere)}</span> },
    ];

    return (
        <div>
            <div className="bg-slate-50 p-4 rounded-lg mb-6 border border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-2">Filtri Bilancio</h3>
                <div className="flex flex-wrap gap-4 items-end">
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-slate-600">Bilancio alla data</label>
                        <input type="date" name="date" id="date" value={filters.date} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                    </div>
                    <button onClick={fetchData} disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                        {isLoading ? 'Calcolo...' : 'Elabora Bilancio'}
                    </button>
                </div>
                 {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>

            <DynamicReportTable data={processedData} columns={columns} isLoading={isLoading} title="Bilancio di Verifica" />

            {!isLoading && data.length > 0 && (
                <div className="mt-4 p-4 bg-slate-100 rounded-lg text-right">
                    <h4 className="text-lg font-bold text-slate-800">Totali di Controllo</h4>
                    <p className="text-slate-600">Totale Dare: <span className="font-mono">{formatCurrency(totals.totalDare)}</span></p>
                    <p className="text-slate-600">Totale Avere: <span className="font-mono">{formatCurrency(totals.totalAvere)}</span></p>
                    <p className={`font-bold mt-2 ${Math.abs(totals.totalDare - totals.totalAvere) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                       Quadrato: {formatCurrency(totals.totalDare - totals.totalAvere)}
                    </p>
                </div>
            )}
        </div>
    );
};

export default BilancioVerificaView;
