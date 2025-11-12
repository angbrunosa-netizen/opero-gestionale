/**
 * @file opero-frontend/src/components/Dashboard.js
 * @description Componente Dashboard (v1.1).
 * - (v1.1) Riceve 'shortcuts' e 'onShortcutClick'
 * come props da MainApp e le visualizza.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import 'react-quill/dist/quill.snow.css';
import { iconMap } from '../lib/moduleRegistry'; // (Aggiunto v1.1)
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline'; // (Aggiunto v1.1)

// Funzione helper per visualizzare i file (invariata)
const FileViewer = ({ file }) => {
    // ... (Codice invariato)
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!file) return;

        const loadFile = async () => {
            setLoading(true);
            setContent(null);
            try {
                const response = await fetch(file.previewUrl);
                const blob = await response.blob();
                
                if (file.mime_type.includes('wordprocessingml.document')) {
                    // DOCX
                    const arrayBuffer = await blob.arrayBuffer();
                    const result = await mammoth.convertToHtml({ arrayBuffer });
                    setContent(result.value);
                } else if (file.mime_type.includes('spreadsheetml.sheet')) {
                    // XLSX
                    const arrayBuffer = await blob.arrayBuffer();
                    const data = new Uint8Array(arrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const html = XLSX.utils.sheet_to_html(worksheet);
                    setContent(html);
                } else if (file.mime_type === 'application/pdf') {
                    // PDF
                    setContent(`<iframe src="${file.previewUrl}" style="width:100%; height: 70vh;" title="PDF Viewer"></iframe>`);
                } else if (file.mime_type.startsWith('image/')) {
                    // Immagine
                    setContent(`<img src="${file.previewUrl}" alt="${file.file_name_originale}" style="max-width: 100%; height: auto;" />`);
                } else {
                    setContent('<p>Anteprima non disponibile per questo tipo di file.</p>');
                }
            } catch (err) {
                console.error("Errore visualizzazione file:", err);
                setContent('<p>Impossibile caricare l\'anteprima.</p>');
            } finally {
                setLoading(false);
            }
        };

        loadFile();
    }, [file]);

    if (loading) {
        return <div className="p-4">Caricamento anteprima...</div>;
    }

    if (!content) {
        return <div className="p-4">Seleziona un file per l'anteprima.</div>;
    }

    return (
        <div 
            className="p-4 border rounded bg-white" 
            dangerouslySetInnerHTML={{ __html: content }} 
        />
    );
};

// Componente Dashboard Principale (MODIFICATO v1.1)
const Dashboard = ({ shortcuts = [], onShortcutClick }) => {
    const { user, ditta, hasPermission } = useAuth();
    const [ppaSintesi, setPpaSintesi] = useState([]);
    
    // Logica PPA (invariata)
    const loadPPASintesi = useCallback(async () => {
        if (!hasPermission('PPA SIS')) return; 
        try {
            const res = await api.get('/ppa/sintesi');
            setPpaSintesi(res.data);
        } catch (err) {
            console.error("Errore caricamento sintesi PPA:", err);
        }
    }, [hasPermission]);

    useEffect(() => {
        loadPPASintesi();
    }, [loadPPASintesi]);

    // Stato per il file viewer
    const [selectedFile, setSelectedFile] = useState(null);

    return (
        <div className="p-4 md:p-8 space-y-6">
            {/* 1. Info Utente e Ditta (invariato) */}
            <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-800">
                    Bentornato, {user.nome} {user.cognome}!
                </h2>
                <p className="mt-1 text-gray-600">
                    Stai operando come: <span className="font-medium text-gray-900">{user.ruolo}</span>
                </p>
                {ditta && (
                    <p className="mt-1 text-gray-600">
                        Ditta: <span className="font-medium text-gray-900">{ditta.ragione_sociale}</span>
                    </p>
                )}
            </div>

            {/* --- (NUOVA SEZIONE v1.1) --- */}
            {/* 2. Scorciatoie Rapide */}
            {shortcuts.length > 0 && (
                <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Scorciatoie Rapide</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {shortcuts.map(shortcut => {
                            // Troviamo l'icona mappata in moduleRegistry
                            const Icon = iconMap[shortcut.icon_name] || QuestionMarkCircleIcon;
                            return (
                                <button
                                    key={shortcut.codice}
                                    onClick={() => onShortcutClick(shortcut.chiave_componente_modulo)}
                                    className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-100 transition-colors"
                                >
                                    <Icon className="h-8 w-8 text-blue-600" />
                                    <span className="mt-2 text-sm font-medium text-gray-700 text-center">{shortcut.descrizione}</span> 
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
            {/* --- FINE NUOVA SEZIONE --- */}


            {/* 3. Sintesi PPA (invariato) */}
            {ppaSintesi.length > 0 && (
                <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Sintesi PPA</h3>
                    <ul className="space-y-2">
                        {ppaSintesi.map(item => (
                            <li key={item.id} className="text-sm text-gray-700">
                                {item.descrizione} - Scadenza: {new Date(item.data_scadenza).toLocaleDateString('it-IT')}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* 4. File Viewer (invariato) */}
            <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Visualizzatore Documenti</h3>
                <FileViewer file={selectedFile} />
                {!selectedFile && <p className="text-sm text-gray-500">Logica per "File Recenti" da implementare.</p>}
            </div>
        </div>
    );
};

export default Dashboard;