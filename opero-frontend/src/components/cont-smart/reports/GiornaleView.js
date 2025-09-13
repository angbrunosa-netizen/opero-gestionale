// #####################################################################
// # Componente per la Visualizzazione del Libro Giornale v2.0
// # File: opero-gestionale/opero-frontend/src/components/cont-smart/reports/GiornaleView.js
// #####################################################################

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../../services/api';
import { ArrowPathIcon, MagnifyingGlassIcon,ArrowDownTrayIcon } from '@heroicons/react/24/outline';

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
const GiornaleView = () => {
    const [righe, setRighe] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
 const [scriptsLoaded, setScriptsLoaded] = useState(false);
    // Funzioni per impostare le date di default
    const getToday = () => new Date().toISOString().split('T')[0];
    const getStartOfYear = () => new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];

    // Stato per i filtri di data
    const [filtri, setFiltri] = useState({
        data_inizio: getStartOfYear(),
        data_fine: getToday()
    });
    // Funzione per caricare script esterni dinamicamente



    const fetchData = useCallback(async () => {
        if (!filtri.data_inizio || !filtri.data_fine) {
            setError("Le date di inizio e fine sono obbligatorie per la ricerca.");
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            // La chiamata API ora include i parametri per le date
            const response = await api.get('/contsmart/reports/giornale', {
                params: filtri
            });
            setRighe(response.data.data || []);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Errore sconosciuto.';
            setError(`Impossibile caricare i dati del libro giornale: ${errorMessage}`);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [filtri]);

    // Carica i dati al primo rendering del componente
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFiltri(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSearch = (e) => {
        e.preventDefault();
        fetchData();
    };

    // Raggruppa le righe per testata per una visualizzazione chiara
    const registrazioniRaggruppate = righe.reduce((acc, riga) => {
        if (!acc[riga.id_testata]) {
            acc[riga.id_testata] = {
                id: riga.id_testata,
                data_registrazione: riga.data_registrazione,
                numero_protocollo: riga.numero_protocollo,
                descrizione_testata: riga.descrizione_testata,
                righe: [],
                totale_dare: 0,
                totale_avere: 0,
            };
        }
        acc[riga.id_testata].righe.push(riga);
        acc[riga.id_testata].totale_dare += parseFloat(riga.importo_dare);
        acc[riga.id_testata].totale_avere += parseFloat(riga.importo_avere);
        return acc;
    }, {});

    const handleExportCSV = () => {
        if (righe.length === 0) return;
        
        const headers = ['Data Registrazione', 'Protocollo', 'Descr. Testata', 'Codice Conto', 'Descr. Conto', 'Descr. Riga', 'Dare', 'Avere'];
        const csvRows = [headers.join(';')];

        righe.forEach(riga => {
            const row = [
                new Date(riga.data_registrazione).toLocaleDateString('it-IT'),
                riga.numero_protocollo,
                `"${riga.descrizione_testata}"`,
                riga.codice_conto,
                `"${riga.descrizione_conto}"`,
                `"${riga.descrizione_riga}"`,
                parseFloat(riga.importo_dare).toFixed(2),
                parseFloat(riga.importo_avere).toFixed(2)
            ];
            csvRows.push(row.join(';'));
        });

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "libro_giornale.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPDF = () => {
        if (Object.keys(registrazioniRaggruppate).length === 0 || !scriptsLoaded) return;
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text("Libro Giornale", 14, 22);
        doc.setFontSize(11);
        doc.text(`Periodo dal ${new Date(filtri.data_inizio).toLocaleDateString('it-IT')} al ${new Date(filtri.data_fine).toLocaleDateString('it-IT')}`, 14, 30);

        let startY = 40;
        
        Object.values(registrazioniRaggruppate).forEach(reg => {
            if (startY > 260) { // Page break
                doc.addPage();
                startY = 20;
            }
            
            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');
            doc.text(`Prot. ${reg.numero_protocollo} del ${new Date(reg.data_registrazione).toLocaleDateString('it-IT')} - ${reg.descrizione_testata}`, 14, startY);
            
            const tableBody = reg.righe.map(r => [
                `${r.codice_conto} - ${r.descrizione_conto}`,
                r.descrizione_riga,
                parseFloat(r.importo_dare).toFixed(2),
                parseFloat(r.importo_avere).toFixed(2)
            ]);
            
            tableBody.push([
                { content: 'Totali', colSpan: 1, styles: { halign: 'right', fontStyle: 'bold' } },
                '',
                { content: reg.totale_dare.toFixed(2), styles: { halign: 'right', fontStyle: 'bold' } },
                { content: reg.totale_avere.toFixed(2), styles: { halign: 'right', fontStyle: 'bold' } }
            ]);

            doc.autoTable({
                startY: startY + 2,
                head: [['Conto', 'Descrizione', 'Dare', 'Avere']],
                body: tableBody,
                theme: 'grid',
                headStyles: { fillColor: [74, 85, 104] }, // slate-700
                footStyles: { fontStyle: 'bold', fillColor: [241, 245, 249] }, // slate-100
            });
            
            startY = doc.lastAutoTable.finalY + 10;
        });

        doc.save('libro_giornale.pdf');
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-slate-700 mb-4">Libro Giornale</h2>
            
            <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-4 p-4 border rounded-lg bg-slate-50 mb-6">
                <div>
                    <label htmlFor="data_inizio" className="block text-sm font-medium text-slate-700 mb-1">Data Inizio</label>
                    <input
                        type="date"
                        name="data_inizio"
                        id="data_inizio"
                        value={filtri.data_inizio}
                        onChange={handleFilterChange}
                        className="block w-full text-sm rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="data_fine" className="block text-sm font-medium text-slate-700 mb-1">Data Fine</label>
                    <input
                        type="date"
                        name="data_fine"
                        id="data_fine"
                        value={filtri.data_fine}
                        onChange={handleFilterChange}
                        className="block w-full text-sm rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
                <div className="self-end">
                    <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 transition-colors">
                        <MagnifyingGlassIcon className="h-5 w-5" /> Cerca
                    </button>
                    {/* Pulsanti di Esportazione */}
                    <button type="button" onClick={handleExportCSV} disabled={righe.length === 0} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 disabled:bg-slate-400">
                        <ArrowDownTrayIcon className="h-5 w-5" /> CSV
                    </button>
                    <button type="button" onClick={handleExportPDF} disabled={righe.length === 0 || !scriptsLoaded} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700 disabled:bg-slate-400">
                        <ArrowDownTrayIcon className="h-5 w-5" /> PDF
                    </button>
                </div>
            </form>

            {isLoading && <div className="text-center p-8"><ArrowPathIcon className="h-8 w-8 animate-spin mx-auto text-slate-500" /></div>}
            {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert"><p className="font-bold">Errore</p><p>{error}</p></div>}
            
            {!isLoading && !error && (
                <div className="space-y-4">
                    {Object.values(registrazioniRaggruppate).map(reg => (
                        <div key={reg.id} className="border rounded-lg overflow-hidden">
                            <div className="bg-slate-100 p-2 border-b text-sm font-semibold text-slate-800 flex justify-between">
                                <span>Prot. {reg.numero_protocollo} del {new Date(reg.data_registrazione).toLocaleDateString('it-IT')}</span>
                                <span>{reg.descrizione_testata}</span>
                            </div>
                            <table className="min-w-full text-sm">
                                <thead className="text-xs text-slate-600 bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left w-1/4">Conto</th>
                                        <th className="px-4 py-2 text-left">Descrizione</th>
                                        <th className="px-4 py-2 text-right w-1/6">Dare</th>
                                        <th className="px-4 py-2 text-right w-1/6">Avere</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reg.righe.map(riga => (
                                        <tr key={riga.id_riga} className="border-t">
                                            <td className="px-4 py-2 font-mono text-xs">{riga.codice_conto} - {riga.descrizione_conto}</td>
                                            <td className="px-4 py-2 text-slate-600">{riga.descrizione_riga}</td>
                                            <td className="px-4 py-2 text-right font-mono">{parseFloat(riga.importo_dare).toFixed(2)}</td>
                                            <td className="px-4 py-2 text-right font-mono">{parseFloat(riga.importo_avere).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-slate-100 font-bold">
                                    <tr>
                                        <td colSpan="2" className="px-4 py-2 text-right">Totali</td>
                                        <td className="px-4 py-2 text-right font-mono">{reg.totale_dare.toFixed(2)}</td>
                                        <td className="px-4 py-2 text-right font-mono">{reg.totale_avere.toFixed(2)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GiornaleView;