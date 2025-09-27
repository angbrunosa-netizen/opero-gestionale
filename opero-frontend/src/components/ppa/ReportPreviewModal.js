/**
 * ======================================================================
 * File: src/components/ppa/ReportPreviewModal.js (NUOVO COMPONENTE)
 * ======================================================================
 * @description
 * Un semplice modale che visualizza un file PDF passato tramite URL,
 * con controlli per la stampa e la chiusura.
 */
import React from 'react';
import { XMarkIcon, PrinterIcon } from '@heroicons/react/24/solid';

const ReportPreviewModal = ({ isOpen, onClose, pdfUrl }) => {
    if (!isOpen) return null;

    const handlePrint = () => {
        const iframe = document.getElementById('pdf-preview-iframe');
        if (iframe) {
            iframe.contentWindow.print();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-[60] p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[95vh] flex flex-col">
                <header className="p-3 border-b flex justify-between items-center bg-gray-50 flex-shrink-0">
                    <h2 className="text-lg font-bold">Anteprima Report</h2>
                    <div className="flex items-center gap-4">
                        <button onClick={handlePrint} className="flex items-center text-sm gap-2 px-3 py-1.5 border rounded-md hover:bg-gray-100">
                            <PrinterIcon className="h-5 w-5" />
                            Stampa
                        </button>
                        <button onClick={onClose}><XMarkIcon className="h-6 w-6" /></button>
                    </div>
                </header>
                <div className="flex-1 p-2">
                    <iframe
                        id="pdf-preview-iframe"
                        src={pdfUrl}
                        title="Anteprima Report PDF"
                        className="w-full h-full border-0"
                    ></iframe>
                </div>
            </div>
        </div>
    );
};

export default ReportPreviewModal;
