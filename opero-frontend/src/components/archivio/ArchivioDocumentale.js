/**
 * @file opero-frontend/src/components/archivio/ArchivioDocumentale.js
 * @description Modulo "Archivio Aziendale" (DMS).
 * - v2.3: Versione stabile con testo al posto delle icone.
 * - RIMOSSO: Tutte le librerie problematiche (icone, toastify, capacitor).
 * - FUNZIONALE: Logica completa e visualizzazione mobile/desktop.
 * - NOTA: Questa è la base di partenza per risolvere i problemi di dipendenza.
 * @date 2025-11-13
 * @version 2.3
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

// --- Helper Icona SOSTITUITO ---
const FileIcon = ({ mimeType }) => {
    if (!mimeType) return <span className="text-gray-400">[DOC]</span>;
    if (mimeType.startsWith('image/')) return <span className="text-blue-500">[IMG]</span>;
    if (mimeType === 'application/pdf') return <span className="text-red-500">[PDF]</span>;
    if (mimeType.startsWith('application/zip') || mimeType.includes('compressed')) {
        return <span className="text-yellow-600">[ZIP]</span>;
    }
    return <span className="text-gray-500">[FILE]</span>;
};

// --- Helper Dimensione ---
const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// --- Hook per rilevare se siamo su un dispositivo mobile ---
const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    return isMobile;
};

// --- MOCK COMPONENTE CORRETTO ---
const MockAdvancedDataGrid = ({ columns, data, isLoading }) => {
    if (isLoading) {
        return <div className="flex justify-center items-center h-32">Caricamento...</div>;
    }
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.accessorKey || col.id}
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                style={{ width: col.width }}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((row) => (
                        <tr key={row.id_file}>
                            {columns.map((col) => (
                                <td
                                    key={col.accessorKey || col.id}
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                >
                                    {col.cell
                                        ? col.cell({
                                              row: { original: row },
                                              getValue: () => row[col.accessorKey],
                                          })
                                        : row[col.accessorKey]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// --- Componente Principale ---
const ArchivioDocumentale = () => {
    const { hasPermission } = useAuth();
    const [files, setFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const isMobile = useIsMobile();

    // --- Fetch dei dati ---
    const fetchAllFiles = useCallback(async () => {
        if (!hasPermission('DM_FILE_VIEW')) return;
        setIsLoading(true);
        try {
            const response = await api.get('/archivio/all-files');
            setFiles(response.data);
        } catch (error) {
            console.error("Errore nel caricamento dell'archivio:", error);
            alert("Impossibile caricare l'archivio documentale.");
        } finally {
            setIsLoading(false);
        }
    }, [hasPermission]);

    useEffect(() => {
        fetchAllFiles();
    }, [fetchAllFiles]);

    // --- Handler per Download/Condividi ---
    const handleDownloadOrShare = async (file) => {
        try {
            const res = await api.get(`/documenti/generate-download-url/${file.id_file}`);
            const downloadUrl = res.data.downloadUrl;
            alert(`Azione su: ${file.file_name_originale}\nURL: ${downloadUrl}`);
            window.open(downloadUrl, '_blank');
        } catch (err) {
            console.error("Errore in Download/Share:", err);
            alert("Impossibile generare il link per il file.");
        }
    };

    // --- Handler per cambio Privacy ---
    const handleTogglePrivacy = async (fileToUpdate) => {
        if (!hasPermission('DM_FILE_MANAGE')) {
            alert("Non hai i permessi per modificare la privacy dei file.");
            return;
        }
        const newPrivacy = fileToUpdate.privacy === 'public' ? 'private' : 'public';
        try {
            await api.put(`/archivio/file/${fileToUpdate.id_file}/privacy`, { privacy: newPrivacy });
            await fetchAllFiles();
            alert("Privacy aggiornata!");
        } catch (err) {
            console.error("Errore nell'aggiornamento privacy:", err);
            alert("Errore nell'aggiornamento.");
        }
    };

    // --- VISTA DESKTOP ---
    const DesktopView = ({ files, isLoading, hasPermission }) => {
        const columns = [
            { header: 'Tipo', accessorKey: 'mime_type', cell: ({ getValue }) => (<div className="flex justify-center items-center"><FileIcon mimeType={getValue()} /></div>), width: 60, },
            { header: 'Nome File', accessorKey: 'file_name_originale', cell: ({ row }) => (<div className="truncate pr-2" title={row.original.file_name_originale}><span className="font-medium text-gray-900">{row.original.file_name_originale}</span><div className="text-xs text-gray-500 truncate">{row.original.links_descrizione ? (<span className="flex items-center gap-1"><span>[LINK]</span>{row.original.links_descrizione}</span>) : (<span className="text-gray-400 italic">Non collegato</span>)}</div></div>) },
            { header: 'Privacy', accessorKey: 'privacy', width: 110, cell: ({ row }) => { const isPublic = row.original.privacy === 'public'; return (<button type="button" onClick={() => handleTogglePrivacy(row.original)} className={`flex items-center gap-1.5 text-xs font-medium p-1 rounded-md ${isPublic ? 'text-green-700 hover:bg-green-100' : 'text-gray-500 hover:bg-gray-100'}`} title={hasPermission('DM_FILE_MANAGE') ? "Clicca per cambiare privacy" : "Privacy"} disabled={!hasPermission('DM_FILE_MANAGE')}><span>{isPublic ? '[GLOBE]' : '[LOCK]'}</span>{isPublic ? 'Pubblico' : 'Privato'}</button>); } },
            { header: 'Dimensione', accessorKey: 'file_size_bytes', width: 100, cell: ({ getValue }) => formatFileSize(getValue()) },
            { header: 'Caricato da', accessorKey: 'utente_upload', width: 150, cell: ({ getValue }) => <span className="truncate block" title={getValue()}>{getValue() || <span className="italic text-gray-400">N/D</span>}</span> },
            { header: 'Data', accessorKey: 'created_at', width: 110, cell: ({ getValue }) => new Date(getValue()).toLocaleDateString('it-IT') },
            { header: 'Azioni', id: 'actions', width: 120, cell: ({ row }) => (<div className="flex justify-center items-center gap-1">{row.original.previewUrl && (<button type="button" onClick={() => window.open(row.original.previewUrl, '_blank')} title="Anteprima" className="p-1.5 text-gray-500 hover:text-green-600 rounded-full hover:bg-gray-100"><span>[EYE]</span></button>)}<button type="button" onClick={() => handleDownloadOrShare(row.original)} title="Download" className="p-1.5 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100"><span>[DOWN]</span></button></div>) }
        ];

        return <MockAdvancedDataGrid columns={columns} data={files} isLoading={isLoading} />;
    };

    // --- VISTA MOBILE ---
    const MobileView = ({ files, isLoading }) => {
        if (isLoading) return <div>Caricamento...</div>;
        if (files.length === 0) return <div className="text-center text-gray-500 p-4">Nessun file trovato.</div>;
        return (
            <div className="space-y-4">
                {files.map((file) => (
                    <div key={file.id_file} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-start gap-3 mb-3">
                            <FileIcon mimeType={file.mime_type} />
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 truncate" title={file.file_name_originale}>{file.file_name_originale}</h3>
                                <p className="text-sm text-gray-500">{formatFileSize(file.file_size_bytes)}</p>
                            </div>
                        </div>
                        {file.links_descrizione && (<div className="text-xs text-gray-500 mb-3 flex items-center gap-1"><span>[LINK]</span>{file.links_descrizione}</div>)}
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                            <button type="button" onClick={() => handleTogglePrivacy(file)} className={`flex items-center gap-1.5 text-xs font-medium p-1.5 rounded-md ${file.privacy === 'public' ? 'text-green-700 bg-green-50' : 'text-gray-600 bg-gray-100'}`} disabled={!hasPermission('DM_FILE_MANAGE')}><span>{file.privacy === 'public' ? '[GLOBE]' : '[LOCK]'}</span>{file.privacy === 'public' ? 'Pubblico' : 'Privato'}</button>
                            <div className="flex items-center gap-2">
                                {file.previewUrl && (<button type="button" onClick={() => window.open(file.previewUrl, '_blank')} title="Anteprima" className="p-2 text-gray-500 bg-gray-100 hover:bg-green-100 hover:text-green-600 rounded-full"><span>[EYE]</span></button>)}
                                <button type="button" onClick={() => handleDownloadOrShare(file)} title="Download" className="p-2 text-gray-500 bg-gray-100 hover:bg-blue-100 hover:text-blue-600 rounded-full"><span>[DOWN]</span></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    if (!hasPermission('DM_FILE_VIEW')) {
        return <div className="p-4">Accesso non autorizzato.</div>;
    }

    return (
        <div className="p-4 bg-gray-50 h-full overflow-hidden flex flex-col">
            <h1 className="text-xl font-bold text-gray-800 mb-4">Archivio Documentale Aziendale</h1>
            <p className="text-sm text-gray-600 mb-6">Consulta tutti i file caricati.</p>
            <div className="flex-1 overflow-auto">{isMobile ? <MobileView files={files} isLoading={isLoading} /> : <DesktopView files={files} isLoading={isLoading} hasPermission={hasPermission} />}</div>
        </div>
    );
};

export default ArchivioDocumentale;