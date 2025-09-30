/**
 * @file opero-frontend/src/components/catalogo/ImportCsvModal.js
 * @description componente modale per l'importazione massiva di entità catalogo da file csv.
 * - v1.2: Corretta la sintassi JSX che causava errori di compilazione.
 * @date 2025-09-30
 * @version 1.2
 */

import React, {
    useState,
    useCallback
} from 'react';
import Papa from 'papaparse';
import {
    api
} from '../../services/api';
import {
    XMarkIcon,
    ArrowUpTrayIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';

const ImportCsvModal = ({
    onClose,
    onImportSuccess
}) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState({
        headers: [],
        rows: []
    });
    const [isLoading, setIsLoading] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const [error, setError] = useState('');

    const handleFileChange = useCallback((e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv'))) {
            setFile(selectedFile);
            setError('');
            setImportResult(null);

            Papa.parse(selectedFile, {
                header: true,
                skipEmptyLines: true,
                preview: 5,
                delimiter: ';',
                complete: (results) => {
                    setPreview({
                        headers: results.meta.fields || [],
                        rows: results.data,
                    });
                },
            });
        } else {
            setFile(null);
            setError('Seleziona un file in formato CSV valido.');
            setPreview({
                headers: [],
                rows: []
            });
        }
    }, []);

    const handleImport = async () => {
        if (!file) {
            setError('Nessun file selezionato.');
            return;
        }
        setIsLoading(true);
        setError('');
        setImportResult(null);
        const formData = new FormData();
        formData.append('csvFile', file);
        try {
            const response = await api.post('/catalogo/import-csv', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setImportResult(response.data);
            if (response.data.success && response.data.imported > 0) {
                onImportSuccess();
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Errore durante la comunicazione con il server.';
            setError(`Errore durante l'importazione: ${errorMessage}`);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const resetState = () => {
        setFile(null);
        setPreview({ headers: [], rows: [] });
        setImportResult(null);
        setError('');
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <header className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">Importa Entità da File CSV</h2>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </header>

                <main className="flex-1 p-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Colonna Istruzioni e Caricamento */}
                        <div>
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                                <h3 className="font-bold text-blue-800">Formato File CSV</h3>
                                <p className="text-sm text-blue-700 mt-1">
                                    Il file deve essere in formato CSV con separatore punto e virgola (`;`).
                                    <br />
                                    La prima riga deve contenere le intestazioni.
                                </p>
                                <p className="text-sm text-blue-700 mt-2">
                                    <strong>Campi Obbligatori:</strong> <code>codice_entita</code>, <code>descrizione</code>
                                </p>
                                <p className="text-sm text-blue-700 mt-1">
                                    <strong>Campi Opzionali:</strong> <code>codice_categoria</code>, <code>codice_iva</code>, <code>prezzo_acquisto</code>, <code>prezzo_vendita</code>
                                </p>
                            </div>

                            <div className="mt-6">
                                <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
                                    1. Seleziona il file CSV
                                </label>
                                <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                    <div className="space-y-1 text-center">
                                        {!file ? (
                                            <>
                                                <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
                                                <div className="flex text-sm text-gray-600">
                                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                                                        <span>Carica un file</span>
                                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".csv" onChange={handleFileChange} />
                                                    </label>
                                                    <p className="pl-1">o trascinalo qui</p>
                                                </div>
                                                <p className="text-xs text-gray-500">File CSV fino a 10 MB</p>
                                            </>
                                        ) : (
                                            <>
                                                <DocumentTextIcon className="mx-auto h-12 w-12 text-green-500" />
                                                <p className="font-bold text-gray-800">{file.name}</p>
                                                <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                                                <button onClick={() => { setFile(null); setPreview({ headers: [], rows: [] }); setImportResult(null); }} className="mt-2 text-xs text-red-600 hover:underline">
                                                    Rimuovi file
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Colonna Anteprima e Risultati */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700">2. Anteprima dei dati (prime 5 righe)</h3>
                            <div className="mt-2 overflow-x-auto border rounded-lg max-h-64">
                                <table className="min-w-full divide-y divide-gray-200 text-xs">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            {preview.headers.map((header) => (
                                                <th key={header} className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {preview.rows.map((row, index) => (
                                            <tr key={index}>
                                                {preview.headers.map((header) => (
                                                    <td key={header} className="px-4 py-2 whitespace-nowrap">{row[header]}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {preview.rows.length === 0 && (
                                    <div className="text-center p-8 text-gray-400">
                                        Nessun dato da visualizzare. Seleziona un file per vedere l'anteprima.
                                    </div>
                                )}
                            </div>

                            {/* Risultati Importazione */}
                            {importResult && (
                                <div className={
                                    `mt-6 p-4 rounded-md ${
                                        importResult.errors > 0 ? 'bg-yellow-50 border-yellow-400' : 'bg-green-50 border-green-400'
                                    } border`
                                }>
                                    <h3 className="font-bold">Risultato Importazione</h3>
                                    <p><strong>Entità Importate:</strong> {importResult.imported}</p>
                                    <p><strong>Errori Rilevati:</strong> {importResult.errors}</p>
                                    {importResult.errorDetails && importResult.errorDetails.length > 0 && (
                                        <div className="mt-2 text-xs max-h-32 overflow-y-auto">
                                            <strong>Dettaglio Errori:</strong>
                                            <ul className="list-disc pl-5">
                                                {importResult.errorDetails.map((err, i) => (
                                                    <li key={i}>Riga {err.row}: {err.error}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {error && <div className="mt-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}
                </main>

                <footer className="flex justify-end items-center p-4 bg-gray-50 border-t border-gray-200">
                    {importResult ? (
                        <button onClick={resetState} className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                            Importa un altro file
                        </button>
                    ) : (
                        <>
                            <button onClick={onClose} className="mr-4 px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                                Annulla
                            </button>
                            <button
                                onClick={handleImport}
                                disabled={!file || isLoading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Importazione in corso...
                                    </>
                                ) : '3. Avvia Importazione'}
                            </button>
                        </>
                    )}
                </footer>
            </div>
        </div>
    );
};

export default ImportCsvModal;

