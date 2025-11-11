/**
 * @file opero-frontend/src/components/archivio/ArchivioDocumentale.js
 * @description Modulo "Archivio Aziendale" (DMS).
 * - v1.0: Fase 1 - Consultazione.
 * - Carica tutti i file da `dm_files` e i loro link da `dm_allegati_link`.
 * - Utilizza AdvancedDataGrid per la visualizzazione e il filtro.
 * @date 2025-11-11
 * @version 1.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import AdvancedDataGrid from '../../shared/AdvancedDataGrid';
import { Download, Eye, FileText, FileImage, FileArchive, File, Link, Globe, Lock } from 'lucide-react';
import { toast } from 'react-toastify';

// Helper per l'icona del file
const FileIcon = ({ mimeType }) => {
    if (!mimeType) return <File className="w-5 h-5 text-gray-400" />;
    if (mimeType.startsWith('image/')) return <FileImage className="w-5 h-5 text-blue-500" />;
    if (mimeType === 'application/pdf') return <FileText className="w-5 h-5 text-red-500" />;
    if (mimeType.startsWith('application/zip') || mimeType.includes('compressed')) {
        return <FileArchive className="w-5 h-5 text-yellow-600" />;
    }
    return <File className="w-5 h-5 text-gray-500" />;
};

// Helper per formattare la dimensione
const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const ArchivioDocumentale = () => {
    const { hasPermission } = useAuth();
    const [files, setFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Carica tutti i file all'avvio
    const fetchAllFiles = useCallback(async () => {
        if (!hasPermission('DM_FILE_VIEW')) return;
        setIsLoading(true);
        try {
            // Chiama la nuova API (che creeremo in 'routes/archivio.js')
            const response = await api.get('/archivio/all-files');
            setFiles(response.data);
        } catch (error) {
            console.error("Errore nel caricamento dell'archivio:", error);
            toast.error("Impossibile caricare l'archivio documentale.");
        } finally {
            setIsLoading(false);
        }
    }, [hasPermission]);

    useEffect(() => {
        fetchAllFiles();
    }, [fetchAllFiles]);

    // Gestore per il download
    const handleDownload = async (id_file) => {
        try {
            const res = await api.get(`/documenti/generate-download-url/${id_file}`);
            window.open(res.data.downloadUrl, '_self');
        } catch (err) {
            console.error("Errore nel download:", err);
            toast.error("Impossibile generare il link per il download.");
        }
    };

    // Definizione delle colonne per la griglia
    const columns = useMemo(() => [
        {
            header: 'Tipo',
            accessorKey: 'mime_type',
            cell: ({ getValue }) => (
                <div className="flex justify-center items-center">
                    <FileIcon mimeType={getValue()} />
                </div>
            ),
            size: 60,
        },
        {
            header: 'Nome File',
            accessorKey: 'file_name_originale',
            cell: ({ row }) => (
                <div>
                    <span className="font-medium text-gray-900">{row.original.file_name_originale}</span>
                    <div className="text-xs text-gray-500">
                        {/* Mostra il link all'entità, se esiste */}
                        {row.original.links ? (
                            <span className="flex items-center gap-1">
                                <Link className="w-3 h-3" />
                                {row.original.links}
                            </span>
                        ) : (
                            <span className="text-gray-400 italic">Non collegato</span>
                        )}
                    </div>
                </div>
            )
        },
        {
            header: 'Privacy',
            accessorKey: 'privacy',
            cell: ({ getValue }) => (
                getValue() === 'public' ? (
                    <span className="flex items-center gap-1.5 text-xs text-green-700">
                        <Globe className="w-4 h-4" /> Pubblico
                    </span>
                ) : (
                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Lock className="w-4 h-4" /> Privato
                    </span>
                )
            ),
            size: 120,
        },
        {
            header: 'Dimensione',
            accessorKey: 'file_size_bytes',
            cell: ({ getValue }) => formatFileSize(getValue()),
            size: 120,
        },
        {
            header: 'Caricato da',
            accessorKey: 'utente_upload',
            cell: ({ getValue }) => getValue() || <span className="italic text-gray-400">N/D</span>,
            size: 150,
        },
        {
            header: 'Data Caricamento',
            accessorKey: 'created_at',
            cell: ({ getValue }) => new Date(getValue()).toLocaleDateString('it-IT'),
            size: 150,
        },
        {
            header: 'Azioni',
            id: 'actions',
            size: 100,
            cell: ({ row }) => (
                <div className="flex justify-center items-center gap-2">
                    {/* Pulsante Anteprima (se 'previewUrl' esiste) */}
                    {row.original.previewUrl && (
                        <button
                            type="button"
                            onClick={() => window.open(row.original.previewUrl, '_blank')}
                            title="Anteprima"
                            className="p-1 text-gray-500 hover:text-green-600 rounded-full hover:bg-gray-100"
                        >
                            <Eye className="w-5 h-5" />
                        </button>
                    )}
                    {/* Pulsante Download (sempre) */}
                    <button
                        type="button"
                        onClick={() => handleDownload(row.original.id_file)}
                        title="Download"
                        className="p-1 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100"
                    >
                        <Download className="w-5 h-5" />
                    </button>
                </div>
            )
        }
    ], [handleDownload]);

    if (!hasPermission('DM_FILE_VIEW')) {
        return <div className="p-4">Accesso non autorizzato.</div>;
    }

    return (
        <div className="p-4 bg-gray-50 h-full overflow-hidden flex flex-col">
            <h1 className="text-xl font-bold text-gray-800 mb-4">Archivio Documentale Aziendale</h1>
            <p className="text-sm text-gray-600 mb-6">
                Consulta tutti i file caricati nel sistema. Usa la barra di ricerca per filtrare per nome, tipo, utente o entità collegata.
            </p>
            
            <div className="flex-1 overflow-y-auto">
                <AdvancedDataGrid
                    columns={columns}
                    data={files}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
};

export default ArchivioDocumentale;