// #####################################################################
// # Componente Gestione Partite Aperte v6.1 (Correzione Race Condition)
// # File: opero-frontend/src/components/finanze/PartiteAperteManager.js
// #####################################################################

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../../services/api';
import DynamicReportTable from '../../shared/DynamicReportTable';
import { ArrowPathIcon, DocumentTextIcon, EnvelopeIcon, DocumentArrowDownIcon, XCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

// ... (Funzioni loadScript e imageToBase64 invariate) ...
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
        return null;
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
    const [mailAccounts, setMailAccounts] = useState([]);
    const [selectedMailAccount, setSelectedMailAccount] = useState('');
    const [showReminderModal, setShowReminderModal] = useState(false);
    const [isSendingReminder, setIsSendingReminder] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                const [dittaRes, accountsRes] = await Promise.all([
                    api.get('/amministrazione/ditta-info'),
                    api.get('/mail/mail-accounts')
                ]);
                
                setDittaInfo(dittaRes.data.data);
                
                if (accountsRes.data.success) {
                    setMailAccounts(accountsRes.data.accounts);
                    if (accountsRes.data.accounts.length > 0) {
                        setSelectedMailAccount(accountsRes.data.accounts[0].id);
                    }
                }
                
                // <span style="color:green;">// MODIFICA: Risolve la race condition caricando prima la libreria principale
                // e poi il plugin, con un piccolo delay per garantire l'inizializzazione.</span>
                await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
                await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js");
                
                // Attende un ciclo di rendering per permettere al plugin di agganciarsi
                await new Promise(resolve => setTimeout(resolve, 100)); 

                if (window.jspdf && typeof window.jspdf.jsPDF.API.autoTable === 'function') {
                    setScriptsLoaded(true);
                } else {
                    throw new Error('Il plugin autoTable non si è agganciato correttamente a jspdf.');
                }
            } catch (error) {
                console.error("Errore nel caricamento iniziale:", error);
                setError("Impossibile caricare le risorse necessarie. Ricaricare la pagina.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    // ... (Il resto del componente rimane invariato) ...
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
    
    const handleSelectionChange = useCallback((newSelectedIds) => {
        setSelectedIds(newSelectedIds);
    }, []);

    const processedData = useMemo(() => {
        return partite.map(p => {
            const oggi = new Date();
            const scadenza = new Date(p.data_scadenza);
            const diffTime = Math.max(0, oggi - scadenza);
            const giorni_ritardo = (p.stato === 'APERTA' && diffTime > 0) ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;
            return { ...p, giorni_ritardo };
        });
    }, [partite]);

    const selectedPartiteData = useMemo(() => {
        return processedData.filter(p => selectedIds.includes(p.id));
    }, [selectedIds, processedData]);
    
    const selectedTotal = useMemo(() => {
        return selectedPartiteData.reduce((sum, item) => sum + Number(item.importo), 0);
    }, [selectedPartiteData]);
    
    const columns = useMemo(() => {
        const baseCols = [
            { label: 'Cliente/Fornitore', key: 'ragione_sociale', sortable: true },
            { label: 'Scadenza', key: 'data_scadenza', sortable: true, format: 'date', highlight: (value) => new Date(value) < new Date() },
            { label: 'Importo', key: 'importo', sortable: true, format: 'currency' },
        ];
        
        if (tipoVista === 'dettaglio') {
            baseCols.splice(1, 0, { label: 'Num. Doc.', key: 'numero_documento', sortable: true });
            baseCols.splice(2, 0, { label: 'Data Doc.', key: 'data_documento', sortable: true, format: 'date' });
            baseCols.push({ label: 'Stato', key: 'stato', sortable: true });
            baseCols.push({ label: 'Ritardo (gg)', key: 'giorni_ritardo', sortable: true, align: 'center' });
        }
        return baseCols;
    }, [tipoVista]);
    
    const pdfButtonState = useMemo(() => {
        if (!scriptsLoaded) return { enabled: false, tooltip: 'Librerie PDF in caricamento...' };
        if (!dittaInfo) return { enabled: false, tooltip: 'Dati aziendali in caricamento...' };
        if (selectedIds.length === 0) return { enabled: false, tooltip: 'Seleziona almeno una partita per generare il PDF.' };
        const uniqueClients = [...new Set(selectedPartiteData.map(p => p.ragione_sociale))];
        if (uniqueClients.length > 1) return { enabled: false, tooltip: 'Puoi selezionare partite solo per un cliente/fornitore alla volta.' };
        return { enabled: true, tooltip: 'Genera estratto conto in PDF' };
    }, [scriptsLoaded, dittaInfo, selectedIds, selectedPartiteData]);

    const reminderButtonState = useMemo(() => {
        if (mailAccounts.length === 0) return { enabled: false, tooltip: 'Nessun account email configurato per l\'invio.' };
        if (selectedIds.length === 0) return { enabled: false, tooltip: 'Seleziona almeno una partita per inviare un sollecito.' };
        
        const uniqueClients = [...new Set(selectedPartiteData.map(p => p.ragione_sociale))];
        if (uniqueClients.length > 1) return { enabled: false, tooltip: 'Puoi selezionare partite solo per un cliente/fornitore alla volta.' };
        
        const recipient = selectedPartiteData[0];
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!recipient || !recipient.email) {
            return { enabled: false, tooltip: 'L\'anagrafica del cliente non ha un\'email valida.' };
        }
        if (!emailRegex.test(recipient.email)) {
            return { enabled: false, tooltip: `L'email '${recipient.email}' non è valida.` };
        }

        return { enabled: true, tooltip: 'Invia sollecito via email' };
    }, [selectedIds, selectedPartiteData, mailAccounts]);
    
    const showNotification = (message, type = 'success', duration = 3000) => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), duration);
    };

    const handleExportCSV = () => {
        if (processedData.length === 0) return;
        const headers = columns.map(c => c.label).join(';');
        const rows = processedData.map(item =>
            columns.map(col => {
                const value = item[col.key] || '';
                if (col.format === 'date') return new Date(value).toLocaleDateString('it-IT');
                if (col.format === 'currency') return `"${Number(value).toFixed(2)}"`;
                return `"${value}"`;
            }).join(';')
        );
        const csvContent = [headers, ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `scadenziario_${tipoPartita}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleGeneratePDF = async () => {
        if (!pdfButtonState.enabled) return;
        setError('');
        
        try {
            const logoBase64 = await imageToBase64(dittaInfo?.logo);
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            const pageHeight = doc.internal.pageSize.height;
            const pageWidth = doc.internal.pageSize.width;
            const margin = 14;

            if (logoBase64) doc.addImage(logoBase64, 'PNG', margin, 15, 30, 15);
            
            if (dittaInfo) {
                const textX = logoBase64 ? margin + 35 : margin;
                doc.setFontSize(10);
                doc.setFont(undefined, 'bold');
                doc.text(dittaInfo.ragione_sociale, textX, 20);
                doc.setFont(undefined, 'normal');
                doc.text(`${dittaInfo.indirizzo}, ${dittaInfo.cap}, ${dittaInfo.citta} (${dittaInfo.provincia})`, textX, 25);
                doc.text(`P.IVA: ${dittaInfo.p_iva} - C.F: ${dittaInfo.codice_fiscale}`, textX, 30);
            }

            const clientInfo = selectedPartiteData[0];
            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');
            doc.text("Spett.le", pageWidth - margin, 20, { align: 'right' });
            doc.setFont(undefined, 'normal');
            doc.text(clientInfo.ragione_sociale, pageWidth - margin, 25, { align: 'right' });
            
            doc.setFontSize(8);
            doc.text(`Data di stampa: ${new Date().toLocaleDateString('it-IT')}`, pageWidth - margin, 35, { align: 'right' });

            const title = `Estratto Conto ${tipoPartita === 'attive' ? 'Cliente' : 'Fornitore'}`;
            doc.setFontSize(14);
            doc.text(title, pageWidth / 2, 50, { align: 'center' });

            const pdfColumns = columns.filter(col => tipoVista === 'dettaglio' || ['ragione_sociale', 'data_scadenza', 'importo'].includes(col.key));
            const tableHead = pdfColumns.map(col => col.label);
            const tableBody = selectedPartiteData.map(item => 
                pdfColumns.map(col => {
                    const value = item[col.key];
                    if (value === null || typeof value === 'undefined') return '';
                    if (col.format === 'currency') return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(Number(value));
                    if (col.format === 'date') return new Date(value).toLocaleDateString('it-IT');
                    return value.toString();
                })
            );
            
            const totalRow = Array(pdfColumns.length).fill('');
            const importoIndex = pdfColumns.findIndex(c => c.key === 'importo');
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
                didParseCell: (data) => {
                    if (data.row.index === selectedPartiteData.length) { 
                        data.cell.styles.fontStyle = 'bold';
                        data.cell.styles.halign = 'right';
                        if (data.column.index === importoIndex) {
                            data.cell.styles.halign = 'right';
                        }
                    }
                }
            });

            const footerText = "Questo documento è stato generato dal gestionale OPERO www.operogo.it";
            doc.setFontSize(6);
            doc.setFont(undefined, 'bold');
            doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });

            doc.save(`estratto_conto_${clientInfo.ragione_sociale.replace(/\s/g, '_')}.pdf`);
        } catch (e) {
            console.error('Errore durante la generazione del PDF:', e);
            setError('Si è verificato un errore imprevisto durante la creazione del PDF.');
        }
    };
    
    const handleSendReminder = async () => {
        if (!reminderButtonState.enabled || !selectedMailAccount) {
            showNotification("Impossibile inviare: mancano i dati necessari.", "error");
            return;
        }
        setIsSendingReminder(true);
        const recipient = selectedPartiteData[0];
        try {
            await api.post('/mail/send-reminder', {
                accountId: selectedMailAccount,
                recipientEmail: recipient.email,
                recipientName: recipient.ragione_sociale,
                partite: selectedPartiteData,
                totalAmount: selectedTotal
            });
            showNotification("Sollecito inviato con successo!", "success");
        } catch (error) {
            console.error("Errore invio sollecito:", error);
            showNotification("Errore durante l'invio del sollecito.", "error");
        } finally {
            setIsSendingReminder(false);
            setShowReminderModal(false);
        }
    };

    const ToastNotification = () => notification.show && (
        <div className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white z-50 ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
            <div className="flex items-center">
                {notification.type === 'success' ? <CheckCircleIcon className="h-6 w-6 mr-2" /> : <XCircleIcon className="h-6 w-6 mr-2" />}
                {notification.message}
            </div>
        </div>
    );

    const ReminderModal = () => showReminderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Invia Sollecito</h2>
                <div className="text-sm space-y-2 mb-4">
                    <p><strong>Destinatario:</strong> {selectedPartiteData[0]?.ragione_sociale}</p>
                    <p><strong>Email:</strong> {selectedPartiteData[0]?.email}</p>
                    <p><strong>Partite Selezionate:</strong> {selectedPartiteData.length}</p>
                    <p><strong>Importo Totale:</strong> {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(selectedTotal)}</p>
                </div>
                <div className="mb-4">
                    <label htmlFor="mailAccount" className="block text-sm font-medium text-gray-700 mb-1">Invia da:</label>
                    <select id="mailAccount" value={selectedMailAccount} onChange={(e) => setSelectedMailAccount(e.target.value)} className="w-full p-2 border rounded-md">
                        {mailAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.nome_account} ({acc.user})</option>)}
                    </select>
                </div>
                <div className="flex justify-end gap-4">
                    <button onClick={() => setShowReminderModal(false)} className="px-4 py-2 border rounded-md hover:bg-slate-100">Annulla</button>
                    <button onClick={handleSendReminder} disabled={isSendingReminder} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                        {isSendingReminder ? 'Invio in corso...' : 'Conferma e Invia'}
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-4 sm:p-6 bg-slate-50 min-h-screen pb-20">
            <ToastNotification />
            <ReminderModal />
            <div className="bg-white p-6 rounded-lg shadow-md">
                {/* ... (UI del componente invariata) ... */}
                 <div className="flex flex-wrap justify-between items-center border-b pb-4 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Gestione Scadenziario</h1>
                        <p className="text-sm text-slate-500">Visualizza e gestisci crediti e debiti.</p>
                    </div>
                    <div className="flex items-center border border-gray-300 rounded-md p-1">
                        <label className="mr-2 font-semibold text-gray-600 text-sm">Vista:</label>
                        <button onClick={() => setTipoVista('sintesi')} className={`px-3 py-1 text-xs rounded ${tipoVista === 'sintesi' ? 'bg-gray-700 text-white' : 'bg-transparent text-gray-600'}`}>Sintetica</button>
                        <button onClick={() => setTipoVista('dettaglio')} className={`px-3 py-1 text-xs rounded ${tipoVista === 'dettaglio' ? 'bg-gray-700 text-white' : 'bg-transparent text-gray-600'}`}>Analitica</button>
                    </div>
                </div>
                <div className="flex flex-wrap justify-between items-center mt-4 gap-4">
                    <nav>
                        <button onClick={() => setTipoPartita('attive')} className={`px-4 py-2 text-sm font-medium rounded-l-md ${tipoPartita === 'attive' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>Clienti (Attive)</button>
                        <button onClick={() => setTipoPartita('passive')} className={`px-4 py-2 text-sm font-medium rounded-r-md ${tipoPartita === 'passive' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>Fornitori (Passive)</button>
                    </nav>
                    <div className="flex justify-end gap-2">
                        <button onClick={handleExportCSV} disabled={processedData.length === 0} title="Esporta la vista corrente in formato CSV" className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed">
                            <DocumentArrowDownIcon className="h-4 w-4" /> CSV
                        </button>
                        <button onClick={handleGeneratePDF} disabled={!pdfButtonState.enabled} title={pdfButtonState.tooltip} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed">
                            <DocumentTextIcon className="h-4 w-4" /> PDF
                        </button>
                        <button onClick={() => setShowReminderModal(true)} disabled={!reminderButtonState.enabled} title={reminderButtonState.tooltip} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-600 text-white rounded-md shadow-sm hover:bg-gray-700 disabled:bg-slate-300 disabled:cursor-not-allowed">
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

