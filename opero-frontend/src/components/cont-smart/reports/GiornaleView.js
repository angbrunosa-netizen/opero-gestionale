// #####################################################################
// # Componente per la Visualizzazione del Libro Giornale
// # File: opero-gestionale/opero-frontend/src/components/cont-smart/reports/GiornaleView.js
// #####################################################################

import React, { useState, useCallback } from 'react';
import { api } from '../../../services/api';
import DynamicReportTable from '../../../shared/DynamicReportTable';

// Funzione di utilità per formattare le date in YYYY-MM-DD
const getFormattedDate = (date) => date.toISOString().split('T')[0];

// Funzione di utilità per formattare i numeri come valuta
const formatCurrency = (value) => {
    const num = parseFloat(value);
    if (isNaN(num) || num === 0) return '';
    return num.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};


const GiornaleView = () => {
    const [filters, setFilters] = useState({
        startDate: getFormattedDate(new Date(new Date().getFullYear(), 0, 1)), // Primo giorno dell'anno
        endDate: getFormattedDate(new Date()), // Oggi
    });
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
            const response = await api.get(`/contsmart/reports/giornale`, { params: filters });
            if (response.data.success) {
                setData(response.data.data);
            } else {
                throw new Error(response.data.message || 'Errore nel caricamento dei dati');
            }
        } catch (err) {
            console.error(err);
            setError(err.message || 'Si è verificato un errore durante il recupero dei dati.');
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    const columns = [
        { key: 'data_registrazione', label: 'Data', sortable: true, render: item => new Date(item.data_registrazione).toLocaleDateString('it-IT') },
        { key: 'codice_conto', label: 'Conto', sortable: true },
        { key: 'descrizione_conto', label: 'Descrizione Conto', sortable: true },
        { key: 'descrizione_riga', label: 'Descrizione Movimento', sortable: true },
        { key: 'importo_dare', label: 'Dare', sortable: true, render: item => <span className="text-right block">{formatCurrency(item.importo_dare)}</span> },
        { key: 'importo_avere', label: 'Avere', sortable: true, render: item => <span className="text-right block">{formatCurrency(item.importo_avere)}</span> },
    ];

    return (
        <div>
            <div className="bg-slate-50 p-4 rounded-lg mb-6 border border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-2">Filtri Libro Giornale</h3>
                <div className="flex flex-wrap gap-4 items-end">
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-slate-600">Dal</label>
                        <input type="date" name="startDate" id="startDate" value={filters.startDate} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-slate-600">Al</label>
                        <input type="date" name="endDate" id="endDate" value={filters.endDate} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                    </div>
                    <button onClick={fetchData} disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                        {isLoading ? 'Caricamento...' : 'Applica Filtri'}
                    </button>
                </div>
                 {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>

            <DynamicReportTable
                data={data}
                columns={columns}
                isLoading={isLoading}
                title="Libro Giornale"
                defaultSort={{ key: 'data_registrazione', direction: 'asc' }}
            />
        </div>
    );
};

export default GiornaleView;
