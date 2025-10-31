// #####################################################################
// # Componente per la Visualizzazione delle Schede Contabili (Responsive)
// # File: opero-gestionale/opero-frontend/src/components/cont-smart/reports/SchedaContabileView.js
// #####################################################################

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../../services/api';
import { ArrowPathIcon, MagnifyingGlassIcon, ArrowDownTrayIcon, CalendarIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

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

// Componente Card per visualizzazione mobile dei movimenti
const MovimentoCard = ({ movimento, index, saldoProgressivo }) => {
    const dare = parseFloat(movimento.importo_dare);
    const avere = parseFloat(movimento.importo_avere);
    
    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-3">
            <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                    <p className="text-sm text-gray-500">{new Date(movimento.data_registrazione).toLocaleDateString('it-IT')}</p>
                    <p className="text-sm text-gray-500">Prot. {movimento.numero_protocollo}</p>
                </div>
                <div className="text-right">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        Saldo: {saldoProgressivo.toFixed(2)}
                    </span>
                </div>
            </div>
            
            <div className="mb-3">
                <p className="text-sm text-gray-700">{movimento.descrizione_testata}</p>
                <p className="text-sm text-gray-600">{movimento.descrizione_riga}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="text-right">
                    <p className="text-sm text-gray-500">Dare</p>
                    <p className="font-semibold text-green-600">{dare.toFixed(2)}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Avere</p>
                    <p className="font-semibold text-red-600">{avere.toFixed(2)}</p>
                </div>
            </div>
        </div>
    );
};

const SchedaContabileView = () => {
    const [conti, setConti] = useState([]);
    const [reportData, setReportData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [scriptsLoaded, setScriptsLoaded] = useState(false);
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Hook per rilevare le dimensioni della finestra
    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Determina se è mobile basandosi sulla larghezza della finestra
    const isMobile = windowSize.width < 768;

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

    // Calcola il saldo progressivo
    let saldoProgressivo = reportData ? parseFloat(reportData.saldo_iniziale) : 0;
    const calculateSaldoProgressivo = (movimenti, saldoIniziale) => {
        let saldo = parseFloat(saldoIniziale);
        return movimenti.map(mov => {
            const dare = parseFloat(mov.importo_dare);
            const avere = parseFloat(mov.importo_avere);
            saldo += (dare - avere);
            return { ...mov, saldoProgressivo: saldo };
        });
    };

    // Funzione per gestire il menu mobile
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Funzione per resettare la ricerca
    const handleResetFilters = () => {
        setFiltri({
            id_conto: '',
            data_inizio: getStartOfYear(),
            data_fine: getToday()
        });
        setReportData(null);
    };

    // Ottieni l'etichetta del conto selezionato
    const getSelectedContoLabel = () => {
        if (!filtri.id_conto) return 'Nessun conto selezionato';
        const selectedConto = conti.find(c => c.id === parseInt(filtri.id_conto));
        return selectedConto ? `${selectedConto.codice} - ${selectedConto.descrizione}` : 'Conto non trovato';
    };

    return (
        <div className="p-2 md:p-4 bg-gray-100 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800">Scheda Contabile</h2>
                </div>

                {/* Filtri */}
                <div className="bg-white p-4 rounded-lg shadow mb-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-slate-800">Filtri Scheda Contabile</h3>
                        {isMobile && (
                            <button
                                onClick={toggleMobileMenu}
                                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                            >
                                {isMobileMenuOpen ? (
                                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                ) : (
                                    <FunnelIcon className="h-6 w-6" aria-hidden="true" />
                                )}
                                <span className="sr-only">Filtri</span>
                            </button>
                        )}
                    </div>
                    
                    <form onSubmit={handleSearch} className={`${isMobile && !isMobileMenuOpen ? 'hidden' : ''} space-y-4`}>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-2">
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
                                <div className="relative mt-1">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <CalendarIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input 
                                        type="date" 
                                        name="data_inizio" 
                                        value={filtri.data_inizio} 
                                        onChange={handleFilterChange} 
                                        className="pl-10 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" 
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="data_fine" className="block text-sm font-medium text-slate-700 mb-1">Data Fine</label>
                                <div className="relative mt-1">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <CalendarIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input 
                                        type="date" 
                                        name="data_fine" 
                                        value={filtri.data_fine} 
                                        onChange={handleFilterChange} 
                                        className="pl-10 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" 
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-4">
                            <div className="flex gap-2">
                                <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700">
                                    <MagnifyingGlassIcon className="h-5 w-5" /> Visualizza
                                </button>
                                <button 
                                    type="button" 
                                    onClick={handleResetFilters}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md shadow-sm hover:bg-gray-300"
                                >
                                    Resetta
                                </button>
                            </div>
                            
                            {/* Pulsanti di Esportazione */}
                            <div className="flex gap-2">
                                <button 
                                    type="button" 
                                    onClick={handleExportCSV} 
                                    disabled={!reportData} 
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 disabled:bg-slate-400"
                                >
                                    <ArrowDownTrayIcon className="h-4 w-5" /> CSV
                                </button>
                                <button 
                                    type="button" 
                                    onClick={handleExportPDF} 
                                    disabled={!reportData || !scriptsLoaded} 
                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700 disabled:bg-slate-400"
                                >
                                    <ArrowDownTrayIcon className="h-4 w-5" /> PDF
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Menu Mobile per i filtri */}
                {isMobile && isMobileMenuOpen && (
                    <div className="bg-white rounded-lg shadow mb-4 p-4">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="id_conto_mobile" className="block text-sm font-medium text-slate-700 mb-1">Conto</label>
                                <select
                                    name="id_conto"
                                    id="id_conto_mobile"
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
                                <label htmlFor="data_inizio_mobile" className="block text-sm font-medium text-slate-700 mb-1">Data Inizio</label>
                                <input 
                                    type="date" 
                                    name="data_inizio" 
                                    id="data_inizio_mobile"
                                    value={filtri.data_inizio} 
                                    onChange={handleFilterChange} 
                                    className="block w-full text-sm rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                                />
                            </div>
                            <div>
                                <label htmlFor="data_fine_mobile" className="block text-sm font-medium text-slate-700 mb-1">Data Fine</label>
                                <input 
                                    type="date" 
                                    name="data_fine" 
                                    id="data_fine_mobile"
                                    value={filtri.data_fine} 
                                    onChange={handleFilterChange} 
                                    className="block w-full text-sm rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                                />
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button 
                                    onClick={handleSearch} 
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 w-full"
                                >
                                    <MagnifyingGlassIcon className="h-5 w-5" /> Visualizza
                                </button>
                                <button 
                                    type="button" 
                                    onClick={toggleMobileMenu}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md shadow-sm hover:bg-gray-300 w-full"
                                >
                                    Chiudi
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Indicatore del conto selezionato */}
                {filtri.id_conto && (
                    <div className="bg-white p-3 rounded-lg shadow mb-4">
                        <div className="flex items-center">
                            <svg className="h-5 w-5 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <p className="text-sm text-gray-700">Conto selezionato: <span className="font-medium">{getSelectedContoLabel()}</span></p>
                        </div>
                    </div>
                )}

                {isLoading && (
                    <div className="flex justify-center items-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Caricamento dati...</span>
                    </div>
                )}
                
                {error && (
                    <div className="bg-red-100 text-red-700 p-4 rounded-md">
                        <p className="font-bold">Errore</p>
                        <p>{error}</p>
                    </div>
                )}
                
                {reportData && (
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        {/* VISUALIZZAZIONE DESKTOP: TABELLA */}
                        {!isMobile && (
                            <div className="overflow-x-auto">
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
                        
                        {/* VISUALIZZAZIONE MOBILE: CARD */}
                        {isMobile && (
                            <div className="p-4">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Dettagli Movimenti</h3>
                                
                                {/* Saldo Iniziale */}
                                <div className="bg-slate-50 p-3 rounded-lg mb-4">
                                    <div className="flex justify-between">
                                        <p className="text-sm text-gray-600">Saldo Iniziale al {new Date(filtri.data_inizio).toLocaleDateString('it-IT')}</p>
                                        <p className="font-mono font-semibold">{parseFloat(reportData.saldo_iniziale).toFixed(2)}</p>
                                    </div>
                                </div>
                                
                                {/* Movimenti */}
                                <div className="space-y-3">
                                    {calculateSaldoProgressivo(reportData.movimenti, reportData.saldo_iniziale).map((movimento, index) => (
                                        <MovimentoCard 
                                            key={index} 
                                            movimento={movimento} 
                                            index={index} 
                                            saldoProgressivo={movimento.saldoProgressivo}
                                        />
                                    ))}
                                </div>
                                
                                {/* Saldo Finale */}
                                <div className="bg-slate-200 p-3 rounded-lg">
                                    <div className="flex justify-between">
                                        <p className="text-sm text-gray-600">Saldo Finale al {new Date(filtri.data_fine).toLocaleDateString('it-IT')}</p>
                                        <p className="font-mono font-bold text-lg">{saldoProgressivo.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Pulsanti di esportazione per mobile */}
                        {isMobile && reportData && (
                            <div className="p-4 bg-gray-50 border-t">
                                <div className="flex gap-2 justify-center">
                                    <button 
                                        onClick={handleExportCSV} 
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700"
                                    >
                                        <ArrowDownTrayIcon className="h-4 w-5" /> CSV
                                    </button>
                                    <button 
                                        onClick={handleExportPDF} 
                                        disabled={!scriptsLoaded} 
                                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700 disabled:bg-slate-400"
                                    >
                                        <ArrowDownTrayIcon className="h-4 w-5" /> PDF
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SchedaContabileView;