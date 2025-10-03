/**
 * @file opero-frontend/src/components/catalogo/EanMassImport.js
 * @description Componente per l'importazione massiva di codici EAN da file CSV.
 * @date 2025-10-03
 * @version 1.0
 */
import React, { useState } from 'react';
import { api } from '../../services/api';
import { DocumentArrowUpIcon, XMarkIcon, QrCodeIcon } from '@heroicons/react/24/solid';

const EanMassImport = ({ onClose, onImportSuccess }) => {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [importResult, setImportResult] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleImport = async () => {
        if (!file) {
            alert('Per favore, seleziona un file CSV.');
            return;
        }

        const formData = new FormData();
        formData.append('csvFile', file);
        setIsUploading(true);
        setImportResult(null);

        try {
            const response = await api.post('/catalogo/import-ean-csv', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setImportResult(response.data);
            if (response.data.success) {
                onImportSuccess(); // Notifica il genitore per ricaricare i dati se necessario
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Errore imprevisto durante l\'importazione.';
            setImportResult({ success: false, message: errorMessage, errors: [] });
        } finally {
            setIsUploading(false);
        }
    };
    
     const generateTemplate = () => {
        const header = "codice_entita;codice_ean";
        const exampleRow1 = "ART001;8098765432109";
        const exampleRow2 = "ART001;8011223344556";
        const csvContent = "data:text/csv;charset=utf-8," + [header, exampleRow1, exampleRow2].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "template_import_ean.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold flex items-center"><QrCodeIcon className="h-6 w-6 mr-2 text-gray-600"/>Importazione Massiva EAN</h2>
                    <button onClick={onClose}><XMarkIcon className="h-6 w-6" /></button>
                </div>
                
                 <div className="text-sm bg-gray-50 p-4 rounded-md border border-gray-200 mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Istruzioni:</h4>
                    <p className="text-gray-600">Carica un file CSV con due colonne: `codice_entita` (dell'articolo esistente) e `codice_ean` (il nuovo EAN da associare).</p>
                    <button onClick={generateTemplate} className="text-sm text-blue-600 hover:underline mt-3 font-semibold">
                        Scarica Template
                    </button>
                </div>
                
                <div className="mt-4">
                    <input type="file" accept=".csv" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                </div>

                <div className="mt-6 flex justify-end gap-4">
                     <button onClick={onClose} className="btn-secondary">Annulla</button>
                    <button onClick={handleImport} disabled={isUploading || !file} className="btn-primary inline-flex items-center">
                        <DocumentArrowUpIcon className="h-5 w-5 mr-2" />
                        {isUploading ? 'Importazione...' : 'Importa EAN'}
                    </button>
                </div>

                {importResult && (
                    <div className={`mt-4 p-4 rounded-md text-sm ${importResult.success ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                        <p className="font-bold mb-2">{importResult.message}</p>
                        {importResult.success && (
                            <ul className="list-disc list-inside">
                                <li>Codici EAN Inseriti: {importResult.inserted}</li>
                                <li>Righe Saltate: {importResult.skipped}</li>
                            </ul>
                        )}
                        {importResult.errors && importResult.errors.length > 0 && (
                            <div className="mt-2">
                                <p className="font-semibold">Dettaglio Errori:</p>
                                <ul className="list-disc list-inside text-xs max-h-24 overflow-y-auto">
                                    {importResult.errors.map((err, i) => <li key={i}>Riga {err.line}: {err.message}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EanMassImport;

