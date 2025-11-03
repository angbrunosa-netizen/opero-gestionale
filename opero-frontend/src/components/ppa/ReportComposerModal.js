/**
 * ======================================================================
 * File: src/components/ppa/ReportComposerModal.js (v4.1 - Capacitor Share)
 * ======================================================================
 * @description
 * ADATTATO PER CAPACITOR: Utilizza il plugin Share per una gestione
 * dei PDF più semplice e robusta su Android e iOS.
 * - Rimosso la dipendenza da @capacitor/file-opener.
 * - Utilizza @capacitor/filesystem e @capacitor/share per salvare e condividere.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { XMarkIcon, DocumentArrowDownIcon, ArrowDownTrayIcon, ShareIcon } from '@heroicons/react/24/solid';
import ReportPreviewModal from './ReportPreviewModal';

// Importa solo i plugin necessari
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

const ReportComposerModal = ({ isOpen, onClose, istanza }) => {
    const [azioni, setAzioni] = useState([]);
    const [messaggi, setMessaggi] = useState([]);
    const [selectionState, setSelectionState] = useState({});
    const [selectedMessaggi, setSelectedMessaggi] = useState(new Set());
    const [reportNotes, setReportNotes] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [isPreviewingPdf, setIsPreviewingPdf] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [pdfBlob, setPdfBlob] = useState(null);

    const fetchData = useCallback(async () => {
        if (!istanza) return;
        setIsLoading(true);
        try {
            const fetchedAzioni = istanza.azioni || [];
            setAzioni(fetchedAzioni);

            const initialSelection = {};
            fetchedAzioni.forEach(a => {
                initialSelection[a.ID] = { selected: true, includeNote: true };
            });
            setSelectionState(initialSelection);
            
            if (istanza.TeamID) {
                const messaggiRes = await api.get(`/ppa/team/${istanza.TeamID}/comunicazioni`);
                const fetchedMessaggi = messaggiRes.data.data || [];
                setMessaggi(fetchedMessaggi);
                const allMessaggioIds = fetchedMessaggi.map(m => m.id);
                setSelectedMessaggi(new Set(allMessaggioIds));
            }
        } catch (error) {
            console.error("Errore nel caricamento dati per il report:", error);
        } finally {
            setIsLoading(false);
        }
    }, [istanza]);

    useEffect(() => {
        if (isOpen) {
            setReportNotes('');
            fetchData();
        }
    }, [isOpen, fetchData]);

    const handleAzioneToggle = (azioneId) => {
        setSelectionState(prev => ({
            ...prev,
            [azioneId]: { ...prev[azioneId], selected: !prev[azioneId].selected }
        }));
    };
    
    const handleNoteToggle = (azioneId) => {
        setSelectionState(prev => ({
            ...prev,
            [azioneId]: { ...prev[azioneId], includeNote: !prev[azioneId].includeNote }
        }));
    };

    const handleMessaggioToggle = (messaggioId) => {
        setSelectedMessaggi(prev => {
            const newSet = new Set(prev);
            newSet.has(messaggioId) ? newSet.delete(messaggioId) : newSet.add(messaggioId);
            return newSet;
        });
    };
    
    // Funzione per gestire il PDF nell'ambiente Capacitor usando Share
    const handleCapacitorPdf = async (blob, filename) => {
        try {
            // Converti il blob in base64
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64data = reader.result;
                
                // Scrivi il file nella cache dell'app per poterlo condividere
                const fileResult = await Filesystem.writeFile({
                    path: filename,
                    data: base64data,
                    directory: Directory.Cache,
                    recursive: false
                });

                console.log('File salvato in:', fileResult.uri);

                // Condividi il file. Il sistema operativo si occuperà di proporre
                // le app corrette per aprirlo (es. visualizzatore PDF, email, etc.)
                await Share.share({
                    title: 'Report PPA',
                    text: 'Ecco il report che hai richiesto.',
                    // La proprietà 'files' è la chiave per condividere un file
                    files: [fileResult.uri], 
                });
            };
            reader.readAsDataURL(blob);
        } catch (error) {
            console.error("Errore nella condivisione del file con Capacitor:", error);
            alert("Impossibile condividere il PDF. Riprova.");
        }
    };

    // Funzione per scaricare il PDF nel browser
    const downloadPdfInBrowser = (blob, filename) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    };

    const handleGeneratePdf = async () => {
        setIsPreviewingPdf(true);
        try {
            const selectedAzioniForPdf = azioni
                .filter(a => selectionState[a.ID]?.selected)
                .map(a => {
                    if (!selectionState[a.ID]?.includeNote) {
                        const { Note, ...azioneWithoutNote } = a;
                        return azioneWithoutNote;
                    }
                    return a;
                });

            const payload = {
                istanza,
                selectedAzioni: selectedAzioniForPdf,
                selectedMessaggi: messaggi.filter(m => selectedMessaggi.has(m.id)),
                reportNotes
            };
            
            const response = await api.post('/ppa/generate-report-pdf', payload, {
                responseType: 'blob',
            });
            
            const filename = `Report_${istanza.Titolo || 'PPA'}_${new Date().toLocaleDateString('it-IT').replace(/\//g, '-')}.pdf`;
            setPdfBlob(response.data);

            // Controlla se l'app è in esecuzione su una piattaforma nativa Capacitor
            if (Capacitor.isNativePlatform()) {
                await handleCapacitorPdf(response.data, filename);
            } else {
                // Logica per il browser web standard
                const url = URL.createObjectURL(response.data);
                setPdfUrl(url);
            }
        } catch (error) {
            console.error("Errore generazione PDF:", error);
            alert("Impossibile generare il report. Controlla la connessione e riprova.");
        } finally {
            setIsPreviewingPdf(false);
        }
    };

    const handleSendReport = async () => {
        setIsSending(true);
        try {
            const payload = {
                istanza,
                selectedAzioni: azioni.filter(a => selectionState[a.ID]?.selected),
                selectedMessaggi: messaggi.filter(m => selectedMessaggi.has(m.id)),
                reportNotes
            };
            
            console.log('Invio report con payload:', payload);
            const response = await api.post('/ppa/send-report-email', payload);

            alert(response.data.message);
            onClose();

        } catch (error) {
            console.error("ERRORE durante l'invio del report:", error);
            const errorMessage = error.response?.data?.message || error.message || "Impossibile inviare il report via email. Controlla la connessione.";
            alert(errorMessage);
        } finally {
            setIsSending(false);
        }
    };

    const handleDownloadPdf = () => {
        if (pdfBlob) {
            const filename = `Report_${istanza.Titolo || 'PPA'}_${new Date().toLocaleDateString('it-IT').replace(/\//g, '-')}.pdf`;
            downloadPdfInBrowser(pdfBlob, filename);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                    <header className="p-4 border-b flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">Componi Report di Stato</h2>
                        <button onClick={onClose}><XMarkIcon className="h-6 w-6" /></button>
                    </header>

                    <main className="p-6 overflow-y-auto space-y-6">
                        <div>
                            <label htmlFor="report-notes" className="block text-sm font-medium text-gray-700 mb-1">Note Aggiuntive per il Report</label>
                            <textarea id="report-notes" rows="4" className="w-full p-2 border rounded-md shadow-inner" placeholder="Inserisci qui un sommario o delle note generali..." value={reportNotes} onChange={(e) => setReportNotes(e.target.value)} />
                        </div>

                        {isLoading ? <p>Caricamento...</p> : (
                            <>
                                <div>
                                    <h3 className="font-semibold mb-2">Seleziona Azioni e Note da Includere</h3>
                                    <div className="space-y-3 max-h-48 overflow-y-auto border p-3 rounded-md bg-gray-50">
                                        {azioni.map(a => {
                                            const isAzioneSelected = selectionState[a.ID]?.selected || false;
                                            const isNoteSelected = selectionState[a.ID]?.includeNote || false;

                                            return (
                                                <div key={a.ID} className="p-2 hover:bg-white rounded">
                                                    <label className="flex items-start gap-3 cursor-pointer">
                                                        <input type="checkbox" checked={isAzioneSelected} onChange={() => handleAzioneToggle(a.ID)} className="h-4 w-4 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                                        <div className="text-sm">
                                                            <p className="font-medium text-gray-800">{a.NomeAzione} <span className="text-gray-500 font-normal">(Stato: {a.StatoDescrizione})</span></p>
                                                            <p className="text-xs text-gray-500">
                                                                Dal {a.DataInizio ? new Date(a.DataInizio).toLocaleDateString('it-IT') : 'N/D'} al {a.DataPrevistaFine ? new Date(a.DataPrevistaFine).toLocaleDateString('it-IT') : 'N/D'}
                                                            </p>
                                                            {a.DataCompletamento && (
                                                                <p className="text-xs text-green-700 font-semibold">
                                                                    Evaso il: {new Date(a.DataCompletamento).toLocaleDateString('it-IT')}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </label>
                                                    {a.Note && (
                                                        <div className="pl-7 mt-1">
                                                            <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                                                                <input type="checkbox" checked={isNoteSelected} disabled={!isAzioneSelected} onChange={() => handleNoteToggle(a.ID)} className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"/>
                                                                <span>Includi nota: <em className="italic">"{a.Note.substring(0, 70)}..."</em></span>
                                                            </label>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2">Seleziona Messaggi da Includere</h3>
                                    <div className="space-y-2 max-h-48 overflow-y-auto border p-3 rounded-md bg-gray-50">
                                        {messaggi.map(m => (
                                            <label key={m.id} className="flex items-start gap-3 p-2 hover:bg-white rounded cursor-pointer">
                                                <input type="checkbox" checked={selectedMessaggi.has(m.id)} onChange={() => handleMessaggioToggle(m.id)} className="h-4 w-4 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                                <div className="text-sm">
                                                    <p className="font-medium text-gray-800">Da: {m.nome_mittente}</p>
                                                    <p className="text-xs text-gray-600 italic">"{m.messaggio.substring(0, 100)}..."</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </main>

                    <footer className="p-4 border-t flex justify-between items-center gap-3 bg-gray-50">
                        <div className="flex gap-2">
                            <button 
                                onClick={handleGeneratePdf} 
                                disabled={isPreviewingPdf} 
                                className="flex items-center py-2 px-4 rounded-md text-gray-700 bg-white border hover:bg-gray-100 font-semibold disabled:bg-gray-200"
                            >
                                {Capacitor.isNativePlatform() ? (
                                    <>
                                        <ShareIcon className="h-5 w-5 mr-2" />
                                        {isPreviewingPdf ? 'Genera e Condividi...' : 'Condividi PDF'}
                                    </>
                                ) : (
                                    <>
                                        <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                                        {isPreviewingPdf ? 'Generando PDF...' : 'Anteprima PDF'}
                                    </>
                                )}
                            </button>
                            
                            {!Capacitor.isNativePlatform() && pdfBlob && (
                                <button 
                                    onClick={handleDownloadPdf} 
                                    className="flex items-center py-2 px-4 rounded-md text-gray-700 bg-white border hover:bg-gray-100 font-semibold"
                                    title="Scarica PDF"
                                >
                                    <ArrowDownTrayIcon className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                        
                        <div className="flex gap-3">
                            <button onClick={onClose} className="py-2 px-4 rounded-md text-gray-700 bg-white border hover:bg-gray-100">Annulla</button>
                            <button onClick={handleSendReport} disabled={isSending} className="py-2 px-4 rounded-md text-white bg-teal-600 hover:bg-teal-700 font-semibold disabled:bg-gray-400">
                                {isSending ? 'Invio Email...' : 'Invia Report via Email'}
                            </button>
                        </div>
                    </footer>
                </div>
            </div>

            {/* Modale di anteprima solo su browser web */}
            {!Capacitor.isNativePlatform() && (
                <ReportPreviewModal 
                    isOpen={!!pdfUrl}
                    onClose={() => { setPdfUrl(null); }}
                    pdfUrl={pdfUrl}
                />
            )}
        </>
    );
};

export default ReportComposerModal;