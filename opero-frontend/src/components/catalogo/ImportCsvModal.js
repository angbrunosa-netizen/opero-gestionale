import React, { useState, useCallback } from 'react';
import { api } from '../../services/api';
import { DocumentArrowUpIcon, XMarkIcon } from '@heroicons/react/24/solid';

const ImportCsvModal = ({ onClose, onImportSuccess }) => {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [importResult, setImportResult] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleImport = async () => {
        if (!file) {
            alert('Seleziona un file CSV.');
            return;
        }

        const formData = new FormData();
        formData.append('csvFile', file);

        setIsUploading(true);
        setImportResult(null);

        try {
            const response = await api.post('/catalogo/import-csv', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setImportResult(response.data);
            onImportSuccess(); // Notifica il genitore di ricaricare i dati
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Errore durante l\'importazione.';
            setImportResult({ success: false, message: errorMessage });
        } finally {
            setIsUploading(false);
        }
    };

    const generateTemplate = () => {
        const header = "codice_entita;descrizione;categoria;costo_base;prezzo_cessione_1;codice_ean_principale;fornitore_piva;codice_articolo_fornitore";
        const exampleRow = "ART001;Descrizione Articolo 1;CAT01;10.50;15.75;8012345678901;IT01234567890;FORN-ART-001";
        const csvContent = "data:text/csv;charset=utf-8," + header + "\n" + exampleRow;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "template_import_catalogo.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Importa Anagrafica da CSV</h2>
                    <button onClick={onClose}><XMarkIcon className="h-6 w-6" /></button>
                </div>
                
                <div className="text-sm bg-blue-50 p-4 rounded-md border border-blue-200 mb-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Istruzioni per il file CSV:</h4>
                    <ul className="list-disc list-inside text-blue-700 space-y-1">
                        <li>Usa il punto e virgola (;) come separatore.</li>
                        <li>La prima riga deve contenere le intestazioni delle colonne.</li>
                        <li><b>Campi Obbligatori:</b> `codice_entita`, `descrizione`.</li>
                        <li><b>Campi Opzionali:</b> `costo_base`, `prezzo_cessione_1`, `codice_ean_principale`, `fornitore_piva`, `codice_articolo_fornitore`.</li>
                    </ul>
                    <button onClick={generateTemplate} className="text-sm text-blue-600 hover:underline mt-3 font-semibold">
                        Scarica Template CSV
                    </button>
                </div>

                <div className="mt-4">
                    <input type="file" accept=".csv" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                </div>

                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={onClose} className="btn-secondary">Annulla</button>
                    <button onClick={handleImport} disabled={isUploading || !file} className="btn-primary inline-flex items-center">
                        <DocumentArrowUpIcon className="h-5 w-5 mr-2" />
                        {isUploading ? 'Caricamento...' : 'Importa'}
                    </button>
                </div>

                {importResult && (
                    <div className={`mt-4 p-4 rounded-md text-sm ${importResult.success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                        <p className="font-bold mb-2">{importResult.message}</p>
                        {importResult.success && (
                            <ul className="list-disc list-inside">
                                <li>Articoli Creati: {importResult.inserted}</li>
                                <li>Listini Base Creati: {importResult.listini}</li>
                                <li>EAN Associati: {importResult.ean}</li>
                                <li>Codici Fornitore Associati: {importResult.fornitori}</li>
                                <li>Righe Saltate: {importResult.skipped}</li>
                            </ul>
                        )}
                        {importResult.errors && importResult.errors.length > 0 && (
                            <div className="mt-2">
                                <p className="font-semibold">Dettaglio Errori:</p>
                                <ul className="list-disc list-inside text-xs">
                                    {importResult.errors.slice(0, 5).map((err, i) => <li key={i}>Riga {err.line}: {err.message}</li>)}
                                    {importResult.errors.length > 5 && <li>...e altri {importResult.errors.length - 5} errori.</li>}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImportCsvModal;
