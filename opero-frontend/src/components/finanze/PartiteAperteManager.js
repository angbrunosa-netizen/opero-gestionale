// #####################################################################
// # Componente Gestione Partite Aperte v2.1 (Fix: Esportazione Componente)
// # File: opero-gestionale/opero-frontend/src/components/finanze/PartiteAperteManager.js
// #####################################################################

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../../services/api';
import DynamicReportTable from '../../shared/DynamicReportTable';
import { ArrowPathIcon, DocumentTextIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

// Funzione per caricare script esterni per il PDF (invariata)
const loadScript = (src) => {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve(); return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Script load error for ${src}`));
        document.body.appendChild(script);
    });
};

// CORREZIONE: Il componente è ora dichiarato come una "named export".
// La parola chiave "export" viene aggiunta prima di "const".
export const PartiteAperteManager = () => {
    const [activeTab, setActiveTab] = useState('attive'); // 'attive' o 'passive'
    const [partite, setPartite] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]); // NUOVO: Stato di selezione "piatto"
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [scriptsLoaded, setScriptsLoaded] = useState(false);

    // Caricamento script per PDF
    useEffect(() => {
        Promise.all([
            loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'),
            loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.min.js')
        ]).then(() => {
            setScriptsLoaded(true);
        }).catch(err => {
            console.error(err);
            setError('Impossibile caricare le librerie per la generazione PDF.');
        });
    }, []);
    
    const fetchPartite = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const endpoint = activeTab === 'attive' ? '/reports/partite-aperte/attive' : '/reports/partite-aperte/passive';
            const response = await api.get(endpoint);
            setPartite(response.data);
            setSelectedIds([]); // Deseleziona tutto al cambio tab o refresh
        } catch (err) {
            console.error("Errore nel recupero delle partite aperte:", err);
            setError('Impossibile caricare i dati. Riprovare più tardi.');
        } finally {
            setIsLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchPartite();
    }, [fetchPartite]);
    
    const handleSelectionChange = (newSelectedIds) => {
        setSelectedIds(newSelectedIds);
    };

    const columns = useMemo(() => [
        { key: 'ragione_sociale', label: 'Cliente/Fornitore', sortable: true },
        { key: 'numero_documento', label: 'Num. Doc.', sortable: true },
        { key: 'data_documento', label: 'Data Doc.', sortable: true, format: 'date' },
        { key: 'data_scadenza', label: 'Scadenza', sortable: true, format: 'date', highlight: (value) => new Date(value) < new Date() },
        { key: 'importo_scaduto', label: 'Importo', sortable: true, format: 'currency' },
        { key: 'giorni_ritardo', label: 'Ritardo (gg)', sortable: true, align: 'center' }
    ], []);

    const handleGeneratePDF = () => {
        if (!scriptsLoaded || !window.jspdf) {
            setError('Libreria PDF non ancora caricata.');
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const selectedPartite = partite.filter(p => selectedIds.includes(p.id));
        if (selectedPartite.length === 0) return;

        const first = selectedPartite[0];
        const title = activeTab === 'attive' ? `Estratto Conto Cliente: ${first.ragione_sociale}` : `Estratto Conto Fornitore: ${first.ragione_sociale}`;
        
        doc.setFontSize(18);
        doc.text(title, 14, 22);

        const tableColumn = ["Num. Doc.", "Data Doc.", "Scadenza", "Importo", "Ritardo (gg)"];
        const tableRows = [];

        selectedPartite.forEach(item => {
            const ticketData = [
                item.numero_documento,
                new Date(item.data_documento).toLocaleDateString('it-IT'),
                new Date(item.data_scadenza).toLocaleDateString('it-IT'),
                new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(item.importo_scaduto),
                item.giorni_ritardo,
            ];
            tableRows.push(ticketData);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 30,
        });
        
        doc.save(`estratto_conto_${first.ragione_sociale.replace(/\s/g, '_')}.pdf`);
    };

    return (
        <div className="p-4 sm:p-6 bg-slate-50 min-h-screen">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center border-b pb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Gestione Scadenziario</h1>
                        <p className="text-sm text-slate-500">Visualizza e gestisci i crediti e debiti aperti.</p>
                    </div>
                    <button onClick={fetchPartite} disabled={isLoading} className="p-2 rounded-full hover:bg-slate-100 disabled:opacity-50">
                        <ArrowPathIcon className={`h-5 w-5 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <nav className="mt-4">
                    <button onClick={() => setActiveTab('attive')} className={`px-4 py-2 text-sm font-medium rounded-l-md ${activeTab === 'attive' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                        Partite Aperte Clienti
                    </button>
                    <button onClick={() => setActiveTab('passive')} className={`px-4 py-2 text-sm font-medium rounded-r-md ${activeTab === 'passive' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                        Partite Aperte Fornitori
                    </button>
                </nav>
            </div>

            <div className="mt-6">
                <div className="flex justify-end gap-2 mb-4">
                    <button onClick={handleGeneratePDF} disabled={selectedIds.length === 0 || !scriptsLoaded} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700 disabled:bg-slate-300">
                        <DocumentTextIcon className="h-4 w-4" /> PDF Estratto Conto
                    </button>
                    <button disabled={selectedIds.length === 0} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-600 text-white rounded-md shadow-sm hover:bg-gray-700 disabled:bg-slate-300">
                        <EnvelopeIcon className="h-4 w-4" /> Invia Sollecito
                    </button>
                </div>

                {error && <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">{error}</div>}

                <DynamicReportTable
                    data={partite}
                    columns={columns}
                    isLoading={isLoading}
                    title={activeTab === 'attive' ? 'Crediti Aperti' : 'Debiti Aperti'}
                    defaultSort={{ key: 'ragione_sociale', direction: 'asc' }}
                    onSelectionChange={handleSelectionChange}
                    isSelectable={true}
                />
            </div>
        </div>
    );
};

export default PartiteAperteManager;

