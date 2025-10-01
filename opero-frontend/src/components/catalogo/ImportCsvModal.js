/**
 * @file opero-frontend/src/components/catalogo/ImportCsvModal.js
 * @description Componente modale per l'importazione massiva di entità catalogo.
 * - v3.3: Corretto il flusso UX. Il modale ora rimane aperto per mostrare il report finale.
 * @date 2025-10-01
 * @version 3.3
 */

import React, { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { api } from '../../services/api';
import { XMarkIcon, ArrowUpTrayIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const ImportCsvModal = ({ onClose, onImportSuccess }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState({ headers: [], rows: [] });
    const [isLoading, setIsLoading] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const [error, setError] = useState('');
    const [updateStrategy, setUpdateStrategy] = useState('skip');

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
            setPreview({ headers: [], rows: [] });
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
        formData.append('updateStrategy', updateStrategy);

        try {
            const response = await api.post('/catalogo/import-csv', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setImportResult(response.data);
            
            // ###############################################################
            // ## CORREZIONE: Non chiudiamo più il modale automaticamente.    ##
            // ## L'utente vedrà il report e chiuderà manualmente.         ##
            // ###############################################################
            if (response.data.success && (response.data.created > 0 || response.data.updated > 0)) {
                // Notifichiamo al genitore che ci sono stati cambiamenti, così può ricaricare i dati.
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
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <header className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">Importa Anagrafica Entità da CSV</h2>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800"><XMarkIcon className="h-6 w-6" /></button>
                </header>

                <main className="flex-1 p-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6">
                                <h3 className="font-bold text-blue-800">Formato File CSV</h3>
                                <p className="text-sm text-blue-700 mt-1">Usare il punto e virgola (`;`) come separatore.</p>
                                <p className="text-sm text-blue-700 mt-2"><strong>Obbligatori:</strong> <code>codice_entita</code>, <code>descrizione</code></p>
                                <p className="text-sm text-blue-700 mt-1"><strong>Opzionali:</strong> <code>codice_categoria TIPO 001.001.000.000.000</code>, <code>codice_iva</code>, <code>costo_base</code>, <code>sigla_um</code>, <code>gestito_a_magazzino 1 </code></p>
                                
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">1. Seleziona il file</h3>
                                    <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                        <div className="space-y-1 text-center">
                                            {!file ? (
                                                <>
                                                    <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
                                                    <div className="flex text-sm text-gray-600">
                                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                                                            <span>Carica un file</span>
                                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".csv,text/csv" onChange={handleFileChange} />
                                                        </label>
                                                        <p className="pl-1">o trascinalo qui</p>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <DocumentTextIcon className="mx-auto h-12 w-12 text-green-500" />
                                                    <p className="font-bold text-gray-800">{file.name}</p>
                                                    <button onClick={resetState} className="mt-2 text-xs text-red-600 hover:underline">Rimuovi</button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">2. In caso di codici già esistenti</h3>
                                    <fieldset className="space-y-2">
                                        <div className="flex items-center">
                                            <input id="skip" name="update-strategy" type="radio" value="skip" checked={updateStrategy === 'skip'} onChange={(e) => setUpdateStrategy(e.target.value)} className="h-4 w-4 text-blue-600"/>
                                            <label htmlFor="skip" className="ml-3 block text-sm">Ignora le righe con codici già presenti</label>
                                        </div>
                                        <div className="flex items-center">
                                            <input id="update" name="update-strategy" type="radio" value="update" checked={updateStrategy === 'update'} onChange={(e) => setUpdateStrategy(e.target.value)} className="h-4 w-4 text-blue-600"/>
                                            <label htmlFor="update" className="ml-3 block text-sm">Aggiorna le entità esistenti con i dati del file</label>
                                        </div>
                                    </fieldset>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-700">3. Anteprima dei dati (prime 5 righe)</h3>
                            <div className="mt-2 overflow-x-auto border rounded-lg max-h-64 bg-gray-50">
                                {preview.headers.length > 0 ? (
                                    <table className="min-w-full divide-y divide-gray-200 text-xs">
                                        <thead className="bg-gray-100">
                                            <tr>{preview.headers.map(h => <th key={h} className="px-4 py-2 text-left font-medium text-gray-600">{h}</th>)}</tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {preview.rows.map((row, i) => <tr key={i}>{preview.headers.map(h => <td key={h} className="px-4 py-2">{row[h]}</td>)}</tr>)}
                                        </tbody>
                                    </table>
                                ) : <div className="text-center p-8 text-gray-400">Seleziona un file...</div>}
                            </div>
                             {importResult && (
                                <div className={`mt-6 p-4 rounded-md border ${importResult.errors > 0 ? 'bg-yellow-50 border-yellow-400' : 'bg-green-50 border-green-400'}`}>
                                    <h3 className="font-bold">Risultato Importazione</h3>
                                    <p><strong>Create:</strong> {importResult.created ?? 0}</p>
                                    <p><strong>Aggiornate:</strong> {importResult.updated ?? 0}</p>
                                    <p><strong>Ignorate:</strong> {importResult.skipped ?? 0}</p>
                                    <p><strong>Errori:</strong> {importResult.errors ?? 0}</p>
                                    {importResult.errorDetails?.length > 0 && (
                                        <div className="mt-2 text-xs max-h-32 overflow-y-auto">
                                            <strong>Dettagli:</strong>
                                            <ul className="list-disc pl-5">
                                                {importResult.errorDetails.map((err, i) => <li key={i}>Riga {err.row}: {err.error}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </main>

                <footer className="flex justify-end items-center p-4 bg-gray-50 border-t">
                    {importResult ? (
                         <button onClick={resetState} className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                            Importa un altro file
                        </button>
                    ) : (
                        <>
                            <button onClick={onClose} className="mr-4 px-6 py-2 bg-gray-200 rounded-md">Annulla</button>
                            <button
                                onClick={handleImport}
                                disabled={!file || isLoading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-300 flex items-center"
                            >
                                {isLoading ? 'Importazione...' : '4. Avvia Importazione'}
                            </button>
                        </>
                    )}
                </footer>
            </div>
        </div>
    );
};

export default ImportCsvModal;

