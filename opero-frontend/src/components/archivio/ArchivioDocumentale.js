/**
 * @file opero-frontend/src/components/archivio/ArchivioDocumentale.js
 * @description Modulo "Archivio Aziendale" (DMS).
 * - v1.2: Fix Totale (Icone, Descrizioni, Filtri, Share)
 * - SOSTITUITE: Icone lucide-react con heroicons (fix icona crash).
 * - AGGIUNTO: Visualizzazione 'links_descrizione' (da API v1.2).
 * - AGGIUNTO: Filtri 'floatingFilter: true' su AdvancedDataGrid.
 * - AGGIUNTO: Logica Capacitor { Share } per 'handleDownloadOrShare'.
 * @date 2025-11-13
 * @version 1.2
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import AdvancedDataGrid from '../../shared/AdvancedDataGrid';
import { toast } from 'react-toastify';

// --- (MODIFICA v1.2) Import da @heroicons ---
import { 
    ArrowDownTrayIcon, 
    EyeIcon, 
    DocumentTextIcon, 
    PhotoIcon, 
    ArchiveBoxIcon, 
    DocumentIcon, 
    LinkIcon, 
    GlobeAltIcon, 
    LockClosedIcon 
} from '@heroicons/react/24/outline';
// ---

// --- (NUOVO v1.2) Import Capacitor ---
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
// ---

// --- (MODIFICA v1.2) Helper Icona con Heroicons ---
const FileIcon = ({ mimeType }) => {
    if (!mimeType) return <DocumentIcon className="w-5 h-5 text-gray-400" />;
    if (mimeType.startsWith('image/')) return <PhotoIcon className="w-5 h-5 text-blue-500" />;
    if (mimeType === 'application/pdf') return <DocumentTextIcon className="w-5 h-5 text-red-500" />;
    if (mimeType.startsWith('application/zip') || mimeType.includes('compressed')) {
        return <ArchiveBoxIcon className="w-5 h-5 text-yellow-600" />;
    }
    return <DocumentIcon className="w-5 h-5 text-gray-500" />;
};
// ---

// Helper Dimensione (invariato)
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

    // fetchAllFiles (invariato)
    const fetchAllFiles = useCallback(async () => {
        if (!hasPermission('DM_FILE_VIEW')) return;
        setIsLoading(true);
        try {
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

    // --- (MODIFICA v1.2) ---
    // Gestore per Download (Desktop) o Share (Mobile)
    const handleDownloadOrShare = async (file) => {
        try {
            // 1. Ottieni il link di download (sempre necessario)
            const res = await api.get(`/documenti/generate-download-url/${file.id_file}`);
            const downloadUrl = res.data.downloadUrl;

            // 2. Controlla se siamo su Piattaforma Nativa (Android/iOS)
            if (Capacitor.isNativePlatform()) {
                // 3. Usa il Plugin Share di Capacitor
                await Share.share({
                    title: file.file_name_originale,
                    url: downloadUrl,
                    dialogTitle: 'Condividi file',
                });
            } else {
                // 4. Fallback per Desktop (Download normale)
                window.open(downloadUrl, '_self');
            }
        } catch (err) {
            // Gestisce l'errore se l'utente annulla la condivisione
            if (err.message !== 'Share canceled') {
                console.error("Errore in Download/Share:", err);
                toast.error("Impossibile generare il link per il file.");
            }
        }
    };
    // ---

    // handleTogglePrivacy (invariato v1.1)
    const handleTogglePrivacy = async (fileToUpdate) => {
        if (!hasPermission('DM_FILE_MANAGE')) {
            toast.warn("Non hai i permessi per modificare la privacy dei file.");
            return;
        }

        const newPrivacy = fileToUpdate.privacy === 'public' ? 'private' : 'public';
        const toastId = toast.loading(`Aggiornamento privacy a ${newPrivacy}...`);

        try {
            await api.put(`/archivio/file/${fileToUpdate.id_file}/privacy`, { 
                privacy: newPrivacy 
            });
            
            // Ricarica tutto per aggiornare gli URL
            await fetchAllFiles();
            
            toast.update(toastId, { 
                render: "Privacy aggiornata!", 
                type: "success", 
                isLoading: false, 
                autoClose: 3000 
            });

        } catch (err) {
            console.error("Errore nell'aggiornamento privacy:", err);
            toast.update(toastId, { 
                render: "Errore nell'aggiornamento.", 
                type: "error", 
                isLoading: false, 
                autoClose: 3000 
            });
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
            filter: false, // Disabilita filtro per colonna icone
        },
        {
            header: 'Nome File',
            accessorKey: 'file_name_originale',
            cell: ({ row }) => (
                <div>
                    <span className="font-medium text-gray-900">{row.original.file_name_originale}</span>
                    {/* --- (MODIFICA v1.2) Mostra la descrizione --- */}
                    <div className="text-xs text-gray-500">
                        {row.original.links_descrizione ? (
                            <span className="flex items-center gap-1">
                                <LinkIcon className="w-3 h-3" />
                                {row.original.links_descrizione}
                            </span>
                        ) : (
                            <span className="text-gray-400 italic">Non collegato</span>
                        )}
                    </div>
                    {/* --- */}
                </div>
            )
        },
        {
            header: 'Privacy',
            accessorKey: 'privacy',
            cell: ({ row }) => {
                const isPublic = row.original.privacy === 'public';
                return (
                    <button
                        type="button"
                        onClick={() => handleTogglePrivacy(row.original)}
                        // (MODIFICA v1.2) Icone Heroicons
                        className={`flex items-center gap-1.5 text-xs font-medium p-1 rounded-md ${
                            isPublic 
                                ? 'text-green-700 hover:bg-green-100' 
                                : 'text-gray-500 hover:bg-gray-100'
                        }`}
                        title={hasPermission('DM_FILE_MANAGE') ? "Clicca per cambiare privacy" : "Privacy"}
                        disabled={!hasPermission('DM_FILE_MANAGE')}
                    >
                        {isPublic ? (
                            <GlobeAltIcon className="w-4 h-4" />
                        ) : (
                            <LockClosedIcon className="w-4 h-4" />
                        )}
                        {isPublic ? 'Pubblico' : 'Privato'}
                    </button>
                )
            },
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
            filter: false,
            cell: ({ row }) => (
                <div className="flex justify-center items-center gap-2">
                    {row.original.previewUrl && (
                        <button
                            type="button"
                            onClick={() => window.open(row.original.previewUrl, '_blank')}
                            title="Anteprima"
                            className="p-1 text-gray-500 hover:text-green-600 rounded-full hover:bg-gray-100"
                        >
                            {/* (MODIFICA v1.2) */}
                            <EyeIcon className="w-5 h-5" />
                        </button>
                    )}
                    <button
                        type="button"
                        // --- (MODIFICA v1.2) ---
                        onClick={() => handleDownloadOrShare(row.original)}
                        title="Download / Condividi"
                        // ---
                        className="p-1 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100"
                    >
                        {/* (MODIFICA v1.2) */}
                        <ArrowDownTrayIcon className="w-5 h-5" />
                    </button>
                </div>
            )
        }
    ], [handleDownloadOrShare, handleTogglePrivacy, hasPermission]); // Dipendenze aggiornate

    if (!hasPermission('DM_FILE_VIEW')) {
        return <div className="p-4">Accesso non autorizzato.</div>;
    }

    return (
        <div className="p-4 bg-gray-50 h-full overflow-hidden flex flex-col">
            <h1 className="text-xl font-bold text-gray-800 mb-4">Archivio Documentale Aziendale</h1>
            {/* --- (NUOVO v1.2) --- */}
            <p className="text-sm text-gray-600 mb-6">
                Consulta tutti i file caricati. Usa la riga sotto le intestazioni per filtrare la tabella.
            </p>
            {/* --- */}
            
            <div className="flex-1 overflow-y-auto">
                <AdvancedDataGrid
                    columns={columns}
                    data={files}
                    isLoading={isLoading}
                    // --- (MODIFICA v1.2) ---
                    // Abilita i filtri "floating"
                    defaultColDef={{
                        sortable: true,
                        resizable: true,
                        filter: true,
                        floatingFilter: true, 
                    }}
                    // ---
                />
            </div>
        </div>
    );
};

export default ArchivioDocumentale;