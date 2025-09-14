// #####################################################################
// # Componente per la Visualizzazione del Libro Giornale v2.3 (Fix Definitivo Export PDF)
// # File: opero-gestionale/opero-frontend/src/components/cont-smart/reports/GiornaleView.js
// #####################################################################

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../../services/api';
import { ArrowPathIcon, MagnifyingGlassIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

// Funzione per caricare script esterni dinamicamente
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
    const [dittaInfo, setDittaInfo] = useState(null); // NUOVO: Stato per i dati della ditta
    const getToday = () => new Date().toISOString().split('T')[0];
    const getStartOfYear = () => new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];

    const [filtri, setFiltri] = useState({
        data_inizio: getStartOfYear(),
        data_fine: getToday()
    });

   // Carica le librerie per l'export PDF e i dati della ditta
   // Carica le librerie per l'export PDF e i dati della ditta
    useEffect(() => {
        Promise.all([
            loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"),
            loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js"),
            api.get('/amministrazione/ditta-info') // Chiamata per i dati dell'azienda
        ]).then(([, , dittaRes]) => {
            if (window.jspdf && window.jspdf.jsPDF && typeof window.jspdf.jsPDF.API.autoTable === 'function') {
                setScriptsLoaded(true);
            }
            setDittaInfo(dittaRes.data.data);
        }).catch(error => {
            console.error("Errore nel caricamento iniziale:", error);
            setError("Impossibile caricare le risorse necessarie per il report.");
        });
    }, []);


    const fetchData = useCallback(async () => {
        if (!filtri.data_inizio || !filtri.data_fine) {
            setError("Le date di inizio e fine sono obbligatorie.");
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const response = await api.get('/contsmart/reports/giornale', { params: filtri });
            setRighe(response.data.data || []);
        } catch (err) {
            setError('Impossibile caricare i dati: ' + (err.response?.data?.message || err.message));
        } finally {
            setIsLoading(false);
        }
    }, [filtri]);

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
        if (!scriptsLoaded || !dittaInfo || righe.length === 0) {
            alert("Dati o librerie per la generazione del PDF non sono pronti. Riprova.");
            return;
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Prepara i dati per la tabella, aggiungendo una proprietà 'meta' per il tracciamento
        const tableBody = righe.map(riga => ({
            data: new Date(riga.data_registrazione).toLocaleDateString('it-IT'),
            protocollo: riga.numero_protocollo,
            conto: `${riga.codice_conto} - ${riga.descrizione_conto}`,
            descrizione: riga.descrizione_riga || riga.descrizione_testata,
            dare: parseFloat(riga.importo_dare),
            avere: parseFloat(riga.importo_avere),
            meta: {} // Oggetto per memorizzare la pagina di appartenenza
        }));

        doc.autoTable({
            head: [['Data', 'Prot.', 'Conto', 'Descrizione', 'Dare', 'Avere']],
            body: tableBody.map(r => Object.values(r).slice(0, -1)), // Passa solo i dati, non 'meta'
            theme: 'grid',
            startY: 40,
            margin: { top: 35, bottom: 25 },
            // Questo hook viene eseguito per ogni cella e ci permette di "marcare" ogni riga con il suo numero di pagina
            willDrawCell: (data) => {
                if (data.section === 'body') {
                    // La riga originale è in data.row.raw
                    const originalRow = tableBody[data.row.index];
                    if (originalRow) {
                        originalRow.meta.pageNumber = data.pageNumber;
                    }
                }
            },
            didDrawPage: (data) => {
                // --- Intestazione ---
                doc.setFontSize(14); doc.setFont(undefined, 'bold');
                doc.text(dittaInfo.ragione_sociale, 14, 15);
                doc.setFontSize(9); doc.setFont(undefined, 'normal');
                doc.text(`${dittaInfo.indirizzo} - ${dittaInfo.cap} ${dittaInfo.citta} (${dittaInfo.provincia})`, 14, 21);
                doc.text(`P.IVA: ${dittaInfo.p_iva} - C.F: ${dittaInfo.codice_fiscale}`, 14, 26);
                doc.setFontSize(14); doc.setFont(undefined, 'bold');
                doc.text("Libro Giornale", doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
                doc.setFontSize(8);
                doc.text(`Stampa del: ${new Date().toLocaleDateString('it-IT')}`, doc.internal.pageSize.getWidth() - 14, 15, { align: 'right' });
                doc.text(`Pagina ${data.pageNumber}`, doc.internal.pageSize.getWidth() - 14, 20, { align: 'right' });
                
                // --- Calcolo e Stampa dei Riporti e Totali ---
                
                // Calcola il riporto dalle pagine PRECEDENTI
                const riportoDare = tableBody
                    .filter(row => row.meta.pageNumber < data.pageNumber)
                    .reduce((sum, row) => sum + row.dare, 0);
                const riportoAvere = tableBody
                    .filter(row => row.meta.pageNumber < data.pageNumber)
                    .reduce((sum, row) => sum + row.avere, 0);

                if (data.pageNumber > 1) {
                    const riportoText = `Riporto dalla pagina precedente: Dare ${riportoDare.toFixed(2)} - Avere ${riportoAvere.toFixed(2)}`;
                    doc.setFontSize(7);
                    doc.setFont(undefined, 'italic');
                    doc.text(riportoText, 14, 34);
                }

                // Calcola i totali progressivi FINO ALLA PAGINA CORRENTE
                const totaleDareProgressivo = tableBody
                    .filter(row => row.meta.pageNumber <= data.pageNumber)
                    .reduce((sum, row) => sum + row.dare, 0);
                const totaleAvereProgressivo = tableBody
                    .filter(row => row.meta.pageNumber <= data.pageNumber)
                    .reduce((sum, row) => sum + row.avere, 0);
                
                const totaliText = `Totali a riportare: Dare ${totaleDareProgressivo.toFixed(2)} - Avere ${totaleAvereProgressivo.toFixed(2)}`;
                doc.setFontSize(9);
                doc.setFont(undefined, 'bold');
                doc.text(totaliText, 14, doc.internal.pageSize.getHeight() - 15);
            },
        });

        doc.save(`Libro_Giornale_${filtri.data_inizio}_${filtri.data_fine}.pdf`);
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
                <div className="self-end flex gap-2">
                    <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700">
                        <MagnifyingGlassIcon className="h-5 w-5" /> Cerca
                    </button>
                    <button type="button" onClick={handleExportCSV} disabled={righe.length === 0} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 disabled:bg-slate-400">
                        <ArrowDownTrayIcon className="h-5 w-5" /> CSV
                    </button>
                    <button type="button" onClick={handleExportPDF} disabled={righe.length === 0 || !scriptsLoaded} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700 disabled:bg-slate-400">
                        <ArrowDownTrayIcon className="h-5 w-5" /> PDF
                    </button>
                </div>
            </form>

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

