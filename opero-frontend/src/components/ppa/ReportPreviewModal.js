/**
 * ======================================================================
 * File: src/components/ppa/ReportPreviewModal.js (NUOVO COMPONENTE)
 * ======================================================================
 * @description
 * Un semplice modale che visualizza un file PDF passato tramite URL,
 * con controlli per la stampa e la chiusura.
 */
// src/components/ppa/ReportPreviewModal.js

import React from 'react';
import { XMarkIcon, ArrowDownTrayIcon, ShareIcon } from '@heroicons/react/24/solid';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

const ReportPreviewModal = ({ isOpen, onClose, pdfUrl, pdfBlob, filename }) => {
    if (!isOpen) return null;

    // Funzione per salvare il file su mobile
    const handleSave = async () => {
        if (!pdfBlob || !Capacitor.isNativePlatform()) return;

        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64data = reader.result;
                await Filesystem.writeFile({
                    path: filename,
                    data: base64data,
                    directory: Directory.Documents, // Salva in Documents per trovarlo facilmente
                });
                alert(`File "${filename}" salvato correttamente nei Documenti.`);
            };
            reader.readAsDataURL(pdfBlob);
        } catch (error) {
            console.error("Errore durante il salvataggio:", error);
            alert("Impossibile salvare il file.");
        }
    };

    // Funzione per condividere il file su mobile
    const handleShare = async () => {
        if (!pdfBlob || !Capacitor.isNativePlatform()) return;

        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64data = reader.result;
                // Scrivi il file in una cache temporanea
                const fileResult = await Filesystem.writeFile({
                    path: filename,
                    data: base64data,
                    directory: Directory.Cache,
                });
                
                // Ottieni un URI condivisibile (content:// per Android)
                const shareableUri = await Filesystem.getUri({
                    directory: Directory.Cache,
                    path: filename,
                });

                // Avvia la condivisione nativa
                await Share.share({
                    title: 'Report PPA',
                    text: 'Ecco il report che hai richiesto.',
                    files: [shareableUri.uri],
                });
            };
            reader.readAsDataURL(pdfBlob);
        } catch (error) {
            console.error("Errore durante la condivisione:", error);
            alert("Impossibile condividere il file.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header con i pulsanti d'azione */}
                <header className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-800">Anteprima Report</h3>
                    <div className="flex items-center gap-2">
                        {/* Mostra questi pulsanti SOLO su mobile (Android/iOS) */}
                        {Capacitor.isNativePlatform() && (
                            <>
                                <button
                                    onClick={handleSave}
                                    className="p-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                    title="Salva nei Documenti"
                                >
                                    <ArrowDownTrayIcon className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="p-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
                                    title="Condividi"
                                >
                                    <ShareIcon className="h-5 w-5" />
                                </button>
                            </>
                        )}
                        <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-200">
                            <XMarkIcon className="h-6 w-6 text-gray-700" />
                        </button>
                    </div>
                </header>

                {/* Corpo con l'anteprima del PDF */}
                <main className="flex-grow overflow-hidden">
                    {pdfUrl ? (
                        <iframe
                            src={pdfUrl}
                            className="w-full h-full border-0"
                            title="Anteprima PDF"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p>Caricamento anteprima...</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ReportPreviewModal;