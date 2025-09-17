// #####################################################################
// # Componente Gestione Partite Aperte v5.3 (PDF con Logo e Footer)
// # File: opero-frontend/src/components/finanze/PartiteAperteManager.js
// #####################################################################

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../../services/api';
import DynamicReportTable from '../../shared/DynamicReportTable';
import { ArrowPathIcon, DocumentTextIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

// Funzione di utility per caricare uno script
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

// <span style="color:green;">// NUOVO: Funzione helper per convertire l'URL del logo in Base64</span>
const imageToBase64 = async (url) => {
    if (!url) return null;
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error("Errore nella conversione del logo in Base64:", error);
        return null; // Non blocca la generazione del PDF se il logo non è raggiungibile
    }
};

export const PartiteAperteManager = () => {
    const [tipoPartita, setTipoPartita] = useState('passive');
    const [tipoVista, setTipoVista] = useState('sintesi');
    const [partite, setPartite] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [scriptsLoaded, setScriptsLoaded] = useState(false);
    const [dittaInfo, setDittaInfo] = useState(null);
    
    useEffect(() => {
        Promise.all([
            loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"),
            loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js"),
            api.get('/amministrazione/ditta-info')
        ]).then(([, , dittaRes]) => {
            if (window.jspdf && window.jspdf.jsPDF && typeof window.jspdf.jsPDF.API.autoTable === 'function') {
                setScriptsLoaded(true);
            } else {
                 throw new Error('Il plugin autoTable non si è agganciato correttamente a jspdf.');
            }
            setDittaInfo(dittaRes.data.data);
        }).catch(error => {
            console.error("Errore nel caricamento iniziale:", error);
            setError("Impossibile caricare le risorse necessarie. Ricaricare la pagina.");
        });
    }, []);

    const fetchPartite = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const endpoint = `/reports/partite-aperte/${tipoVista}/${tipoPartita}`;
            const response = await api.get(endpoint);
            setPartite(response.data);
            setSelectedIds([]);
        } catch (err) {
            console.error("Errore nel recupero delle partite aperte:", err);
            setError('Impossibile caricare i dati. Riprovare più tardi.');
        } finally {
            setIsLoading(false);
        }
    }, [tipoPartita, tipoVista]);

    useEffect(() => {
        fetchPartite();
    }, [fetchPartite]);

    const handleSelectionChange = (newSelectedIds) => {
        setSelectedIds(newSelectedIds);
    };

    const processedData = useMemo(() => {
        return partite.map(p => {
            const oggi = new Date();
            const scadenza = new Date(p.data_scadenza);
            const diffTime = Math.max(0, oggi - scadenza);
            const giorni_ritardo = p.stato === 'APERTA' ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;
            return { ...p, giorni_ritardo };
        });
    }, [partite]);

    const selectedTotal = useMemo(() => {
        return processedData
            .filter(p => selectedIds.includes(p.id))
            .reduce((sum, item) => sum + Number(item.importo), 0);
    }, [selectedIds, processedData]);
    
    const columns = useMemo(() => {
        // ...definizione colonne (invariata)
        const baseCols = [
            { label: 'Cliente/Fornitore', key: 'ragione_sociale', sortable: true },
            { label: 'Num. Doc.', key: 'numero_documento', sortable: true },
            { label: 'Data Doc.', key: 'data_documento', sortable: true, format: 'date' },
            { label: 'Scadenza', key: 'data_scadenza', sortable: true, format: 'date', highlight: (value) => new Date(value) < new Date() },
            { label: 'Importo', key: 'importo', sortable: true, format: 'currency' },
            { label: 'Stato', key: 'stato', sortable: true },
            { label: 'Ritardo (gg)', key: 'giorni_ritardo', sortable: true, align: 'center' }
        ];
        if (tipoVista === 'dettaglio') {
            baseCols.splice(5, 0, { label: 'Tipo Mov.', key: 'tipo_movimento', sortable: true });
        }
        return baseCols;
    }, [tipoVista]);

    // <span style="color:green;">// MODIFICATO: La funzione è ora asincrona per gestire la conversione del logo.</span>
    const handleGeneratePDF = async () => {
        setError('');
        if (!scriptsLoaded) {
            setError('Le librerie PDF non sono pronte.');
            return;
        }
        if (selectedIds.length === 0) {
            setError('Nessuna riga selezionata per l\'esportazione.');
            return;
        }
        
        const selectedPartite = processedData.filter(p => selectedIds.includes(p.id));
        const uniqueClients = [...new Set(selectedPartite.map(p => p.ragione_sociale))];
        if (uniqueClients.length > 1) {
            setError("È possibile generare un estratto conto per un solo cliente/fornitore alla volta.");
            return;
        }

        try {
            // <span style="color:green;">// NUOVO: Conversione del logo in Base64 prima di creare il PDF.</span>
            const logoBase64 = await imageToBase64(dittaInfo?.logo);

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            const pageHeight = doc.internal.pageSize.height;
            const pageWidth = doc.internal.pageSize.width;
            const margin = 14;

            // --- INTESTAZIONE PDF ---
            // <span style="color:green;">// NUOVO: Aggiunta del logo al PDF se disponibile.</span>
            if (logoBase64) {
                doc.addImage(logoBase64, 'PNG', margin, 15, 30, 15); // x, y, larghezza, altezza
            }
            
            if (dittaInfo) {
                const textX = logoBase64 ? margin + 35 : margin; // Sposta il testo a destra se c'è il logo
                doc.setFontSize(10);
                doc.setFont(undefined, 'bold');
                doc.text(dittaInfo.ragione_sociale, textX, 20);
                doc.setFont(undefined, 'normal');
                doc.text(`${dittaInfo.indirizzo}, ${dittaInfo.cap}, ${dittaInfo.citta} (${dittaInfo.provincia})`, textX, 25);
                doc.text(`P.IVA: ${dittaInfo.p_iva} - C.F: ${dittaInfo.codice_fiscale}`, textX, 30);
            }

            const clientInfo = selectedPartite[0];
            if(clientInfo) {
                doc.setFontSize(10);
                doc.setFont(undefined, 'bold');
                doc.text("Spett.le", pageWidth - margin, 20, { align: 'right' });
                doc.setFont(undefined, 'normal');
                doc.text(clientInfo.ragione_sociale, pageWidth - margin, 25, { align: 'right' });
            }
            
            const printDate = `Data di stampa: ${new Date().toLocaleDateString('it-IT')}`;
            doc.setFontSize(8);
            doc.text(printDate, pageWidth - margin, 35, { align: 'right' });

            const title = `Estratto Conto ${tipoPartita === 'attive' ? 'Cliente' : 'Fornitore'}`;
            doc.setFontSize(18);
            doc.text(title, pageWidth / 2, 50, { align: 'center' });

            // --- TABELLA --- (logica invariata)
            const tableHead = columns.map(col => col.label);
            const tableBody = selectedPartite.map(item => 
                columns.map(col => {
                    const value = item[col.key];
                    if (value === null || typeof value === 'undefined') return '';
                    if (col.format === 'currency') return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(Number(value));
                    if (col.format === 'date') {
                        const date = new Date(value);
                        return date instanceof Date && !isNaN(date) ? date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';
                    }
                    return value.toString();
                })
            );
            
            const totalRow = Array(columns.length).fill('');
            const importoIndex = columns.findIndex(c => c.key === 'importo');
            if (importoIndex !== -1) {
                totalRow[importoIndex - 1] = 'TOTALE';
                totalRow[importoIndex] = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(selectedTotal);
            }
            tableBody.push(totalRow);


            doc.autoTable({
                head: [tableHead],
                body: tableBody,
                startY: 60,
                theme: 'grid',
                headStyles: { fillColor: [41, 128, 185], textColor: 255 },
                didParseCell: function(data) {
                    if (data.row.index === selectedPartite.length) { 
                        data.cell.styles.fontStyle = 'bold';
                        data.cell.styles.halign = 'right';
                        if (data.column.index === importoIndex) {
                             data.cell.styles.halign = 'left';
                        }
                    }
                }
            });

            // <span style="color:green;">// NUOVO: Aggiunta del footer al PDF.</span>
            const footerText = "Questo documento è stato generato dal gestionale OPERO www.operogo.it";
            doc.setFontSize(6);
            doc.setFont(undefined, 'bold');
            doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });


            doc.save(`estratto_conto_${clientInfo.ragione_sociale.replace(/\s/g, '_')}.pdf`);
        } catch (e) {
            console.error('Errore durante la generazione del PDF:', e);
            setError(e.message || 'Si è verificato un errore imprevisto durante la creazione del PDF.');
        }
    };

    return (
        <div className="p-4 sm:p-6 bg-slate-50 min-h-screen pb-20"> 
            <div className="bg-white p-6 rounded-lg shadow-md">
                {/* ... UI (invariata) ... */}
                <div className="flex flex-wrap justify-between items-center border-b pb-4 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Gestione Scadenziario</h1>
                        <p className="text-sm text-slate-500">Visualizza e gestisci crediti e debiti.</p>
                    </div>
                    <div className="flex items-center border border-gray-300 rounded-md p-1">
                        <label className="mr-2 font-semibold text-gray-600 text-sm">Vista:</label>
                        <button onClick={() => setTipoVista('sintesi')} className={`px-3 py-1 text-xs rounded ${tipoVista === 'sintesi' ? 'bg-gray-700 text-white' : 'bg-transparent text-gray-600'}`}>
                            Sintetica
                        </button>
                        <button onClick={() => setTipoVista('dettaglio')} className={`px-3 py-1 text-xs rounded ${tipoVista === 'dettaglio' ? 'bg-gray-700 text-white' : 'bg-transparent text-gray-600'}`}>
                            Analitica
                        </button>
                    </div>
                </div>
                <div className="flex flex-wrap justify-between items-center mt-4 gap-4">
                    <nav>
                        <button onClick={() => setTipoPartita('attive')} className={`px-4 py-2 text-sm font-medium rounded-l-md ${tipoPartita === 'attive' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                            Clienti (Attive)
                        </button>
                        <button onClick={() => setTipoPartita('passive')} className={`px-4 py-2 text-sm font-medium rounded-r-md ${tipoPartita === 'passive' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                            Fornitori (Passive)
                        </button>
                    </nav>
                    <div className="flex justify-end gap-2">
                        <button 
                            onClick={handleGeneratePDF} 
                            disabled={!scriptsLoaded || selectedIds.length === 0} 
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
                        >
                            <DocumentTextIcon className="h-4 w-4" /> PDF
                        </button>
                        <button disabled={selectedIds.length === 0} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-600 text-white rounded-md shadow-sm hover:bg-gray-700 disabled:bg-slate-300">
                            <EnvelopeIcon className="h-4 w-4" /> Invia Sollecito
                        </button>
                        <button onClick={fetchPartite} disabled={isLoading} className="p-2 rounded-full hover:bg-slate-100 disabled:opacity-50">
                            <ArrowPathIcon className={`h-5 w-5 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>
            <div className="mt-6">
                {error && <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">{error}</div>}
                <DynamicReportTable
                    data={processedData}
                    columns={columns}
                    isLoading={isLoading}
                    defaultSort={{ key: 'ragione_sociale', direction: 'asc' }}
                    onSelectionChange={handleSelectionChange}
                    isSelectable={true}
                    title={tipoPartita === 'attive' ? 'Crediti Clienti' : 'Debiti Fornitori'}
                />
            </div>

            {selectedIds.length > 0 && (
                <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-auto bg-gray-800 text-white py-2 px-6 rounded-t-lg shadow-lg flex justify-center items-center z-50">
                    <span className="font-semibold">Selezionati: {selectedIds.length}</span>
                    <span className="mx-4 text-gray-500">|</span>
                    <span className="font-semibold">Totale: {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(selectedTotal)}</span>
                </div>
            )}
        </div>
    );
};

export default PartiteAperteManager;

