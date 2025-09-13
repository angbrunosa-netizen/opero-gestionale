// #####################################################################
// # Componente per la Visualizzazione delle Schede Contabili
// # File: opero-gestionale/opero-frontend/src/components/cont-smart/reports/SchedaContabileView.js
// #####################################################################

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../../services/api';
import { ArrowPathIcon, MagnifyingGlassIcon ,ArrowDownTrayIcon} from '@heroicons/react/24/outline';

const loadScript = (src) => {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Script load error for ${src}`));
        document.body.appendChild(script);
    });
};

const SchedaContabileView = () => {
    const [conti, setConti] = useState([]);
    const [reportData, setReportData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
     const [scriptsLoaded, setScriptsLoaded] = useState(false);

    const getToday = () => new Date().toISOString().split('T')[0];
    const getStartOfYear = () => new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];

    const [filtri, setFiltri] = useState({
        id_conto: '',
        data_inizio: getStartOfYear(),
        data_fine: getToday()
    });
// Carica le librerie per l'export PDF al montaggio del componente
    useEffect(() => {
        Promise.all([
            loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"),
            loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.min.js")
        ]).then(() => {
            setScriptsLoaded(true);
        }).catch(error => console.error("Errore nel caricamento degli script per PDF:", error));
    }, []);

    // Carica l'elenco dei conti per il menu a tendina
    const fetchConti = useCallback(async () => {
        try {
            const response = await api.get('/contsmart/pdc-flat');
            setConti(response.data.data || []);
        } catch (err) {
            console.error("Errore nel caricamento del piano dei conti:", err);
            setError('Impossibile caricare l\'elenco dei conti.');
        }
    }, []);

    useEffect(() => {
        fetchConti();
    }, [fetchConti]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFiltri(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!filtri.id_conto) {
            setError("Selezionare un conto per generare il report.");
            return;
        }
        setIsLoading(true);
        setError('');
        setReportData(null);

        try {
            const response = await api.get('/contsmart/reports/scheda-contabile', { params: filtri });
            setReportData(response.data.data);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Errore sconosciuto.';
            setError(`Impossibile caricare i dati della scheda: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleExportCSV = () => {
        if (!reportData) return;
        
        let saldoProgressivo = parseFloat(reportData.saldo_iniziale);
        const headers = ['Data', 'Protocollo', 'Descrizione', 'Dare', 'Avere', 'Saldo Progressivo'];
        
        const rows = reportData.movimenti.map(mov => {
            const dare = parseFloat(mov.importo_dare);
            const avere = parseFloat(mov.importo_avere);
            saldoProgressivo += (dare - avere);
            return [
                new Date(mov.data_registrazione).toLocaleDateString('it-IT'),
                mov.numero_protocollo,
                `"${mov.descrizione_testata} - ${mov.descrizione_riga}"`,
                dare.toFixed(2),
                avere.toFixed(2),
                saldoProgressivo.toFixed(2)
            ].join(';');
        });

        const saldoInizialeRow = `Saldo Iniziale al ${new Date(filtri.data_inizio).toLocaleDateString('it-IT')};;;;;${parseFloat(reportData.saldo_iniziale).toFixed(2)}`;
        const saldoFinaleRow = `Saldo Finale al ${new Date(filtri.data_fine).toLocaleDateString('it-IT')};;;;;${saldoProgressivo.toFixed(2)}`;
        
        const csvContent = [headers.join(';'), saldoInizialeRow, ...rows, saldoFinaleRow].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `scheda_contabile_${filtri.id_conto}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPDF = () => {
        if (!reportData || !scriptsLoaded) return;
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const selectedConto = conti.find(c => c.id === parseInt(filtri.id_conto));
        
        doc.setFontSize(18);
        doc.text(`Scheda Contabile: ${selectedConto ? selectedConto.descrizione : ''}`, 14, 22);
        doc.setFontSize(11);
        doc.text(`Periodo dal ${new Date(filtri.data_inizio).toLocaleDateString('it-IT')} al ${new Date(filtri.data_fine).toLocaleDateString('it-IT')}`, 14, 30);
        
        doc.setFontSize(12);
        doc.text(`Saldo Iniziale: ${parseFloat(reportData.saldo_iniziale).toFixed(2)}`, 14, 40);

        let saldoProgressivo = parseFloat(reportData.saldo_iniziale);
        const tableBody = reportData.movimenti.map(mov => {
            const dare = parseFloat(mov.importo_dare);
            const avere = parseFloat(mov.importo_avere);
            saldoProgressivo += (dare - avere);
            return [
                new Date(mov.data_registrazione).toLocaleDateString('it-IT'),
                mov.numero_protocollo,
                `${mov.descrizione_testata} - ${mov.descrizione_riga}`,
                dare.toFixed(2),
                avere.toFixed(2),
                saldoProgressivo.toFixed(2)
            ];
        });

        doc.autoTable({
            startY: 45,
            head: [['Data', 'Prot.', 'Descrizione', 'Dare', 'Avere', 'Saldo']],
            body: tableBody,
            theme: 'grid',
            headStyles: { fillColor: [22, 160, 133] },
        });

        doc.setFontSize(12);
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.text(`Saldo Finale: ${saldoProgressivo.toFixed(2)}`, 14, finalY);

        doc.save(`scheda_contabile_${filtri.id_conto}.pdf`);
    };


    let saldoProgressivo = reportData ? parseFloat(reportData.saldo_iniziale) : 0;

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-slate-700 mb-4">Scheda Contabile</h2>
            
            <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-4 p-4 border rounded-lg bg-slate-50 mb-6">
                <div className="flex-grow">
                    <label htmlFor="id_conto" className="block text-sm font-medium text-slate-700 mb-1">Conto</label>
                    <select
                        name="id_conto"
                        id="id_conto"
                        value={filtri.id_conto}
                        onChange={handleFilterChange}
                        className="block w-full text-sm rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="">-- Seleziona un sottoconto --</option>
                        {conti.map(conto => (
                            <option key={conto.id} value={conto.id}>{conto.codice} - {conto.descrizione}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="data_inizio" className="block text-sm font-medium text-slate-700 mb-1">Data Inizio</label>
                    <input type="date" name="data_inizio" value={filtri.data_inizio} onChange={handleFilterChange} className="input-style"/>
                </div>
                <div>
                    <label htmlFor="data_fine" className="block text-sm font-medium text-slate-700 mb-1">Data Fine</label>
                    <input type="date" name="data_fine" value={filtri.data_fine} onChange={handleFilterChange} className="input-style"/>
                </div>
                <div className="self-end">
                    <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700">
                        <MagnifyingGlassIcon className="h-5 w-5" /> Visualizza
                    </button>
                    {/* Pulsanti di Esportazione */}
                    <button type="button" onClick={handleExportCSV} disabled={!reportData} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 disabled:bg-slate-400">
                        <ArrowDownTrayIcon className="h-4 w-5" /> CSV
                    </button>
                    <button type="button" onClick={handleExportPDF} disabled={!reportData || !scriptsLoaded} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700 disabled:bg-slate-400">
                        <ArrowDownTrayIcon className="h-5 w-5" /> PDF
                    </button>
                </div>
            </form>

            {isLoading && <div className="text-center p-8"><ArrowPathIcon className="h-8 w-8 animate-spin mx-auto text-slate-500" /></div>}
            {error && <div className="bg-red-100 text-red-700 p-4 rounded-md"><p className="font-bold">Errore</p><p>{error}</p></div>}
            
            {reportData && (
                <div className="border rounded-lg overflow-hidden mt-6">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-100 text-xs text-slate-600 uppercase">
                            <tr>
                                <th className="px-4 py-2 text-left">Data</th>
                                <th className="px-4 py-2 text-left">Prot.</th>
                                <th className="px-4 py-2 text-left">Descrizione</th>
                                <th className="px-4 py-2 text-right">Dare</th>
                                <th className="px-4 py-2 text-right">Avere</th>
                                <th className="px-4 py-2 text-right">Saldo Progressivo</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="bg-slate-50 font-semibold">
                                <td colSpan="5" className="px-4 py-2 text-right">Saldo Iniziale al {new Date(filtri.data_inizio).toLocaleDateString('it-IT')}</td>
                                <td className="px-4 py-2 text-right font-mono">{parseFloat(reportData.saldo_iniziale).toFixed(2)}</td>
                            </tr>
                            {reportData.movimenti.map((mov, index) => {
                                const dare = parseFloat(mov.importo_dare);
                                const avere = parseFloat(mov.importo_avere);
                                saldoProgressivo += (dare - avere);
                                return (
                                    <tr key={index} className="border-t hover:bg-slate-50">
                                        <td className="px-4 py-2">{new Date(mov.data_registrazione).toLocaleDateString('it-IT')}</td>
                                        <td className="px-4 py-2 text-center">{mov.numero_protocollo}</td>
                                        <td className="px-4 py-2 text-slate-700">{mov.descrizione_testata} - {mov.descrizione_riga}</td>
                                        <td className="px-4 py-2 text-right font-mono text-green-600">{dare.toFixed(2)}</td>
                                        <td className="px-4 py-2 text-right font-mono text-red-600">{avere.toFixed(2)}</td>
                                        <td className="px-4 py-2 text-right font-mono font-semibold">{saldoProgressivo.toFixed(2)}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                        <tfoot className="bg-slate-200 font-bold">
                            <tr>
                                <td colSpan="5" className="px-4 py-2 text-right">Saldo Finale al {new Date(filtri.data_fine).toLocaleDateString('it-IT')}</td>
                                <td className="px-4 py-2 text-right font-mono text-lg">{saldoProgressivo.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}
        </div>
    );
};

export default SchedaContabileView;
