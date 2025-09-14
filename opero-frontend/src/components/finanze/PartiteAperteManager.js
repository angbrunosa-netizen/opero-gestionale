// #####################################################################
// # Componente Gestione Partite Aperte v2.0 (Refactoring con DynamicReportTable)
// # File: opero-gestionale/opero-frontend/src/components/finanze/PartiteAperteManager.js
// #####################################################################

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../../services/api';
import DynamicReportTable from '../../shared/DynamicReportTable'; // NUOVO: Importazione del componente dinamico
import { ArrowPathIcon, DocumentTextIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

// Funzione per caricare script esterni per il PDF
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

const PartiteAperteManager = () => {
    const [activeTab, setActiveTab] = useState('attive'); // 'attive' o 'passive'
    const [partite, setPartite] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]); // NUOVO: Stato di selezione "piatto"
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [scriptsLoaded, setScriptsLoaded] = useState(false);

    // Carica le librerie per l'export PDF
    useEffect(() => {
        Promise.all([
            loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"),
            loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js")
        ]).then(() => setScriptsLoaded(true)).catch(err => console.error("Errore caricamento script PDF:", err));
    }, []);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError('');
        setSelectedIds([]); // Resetta la selezione al cambio tab o al refresh
        try {
            const response = await api.get('/contsmart/partite-aperte', { params: { tipo: activeTab } });
            setPartite(response.data.data || []);
        } catch (err) {
            setError('Impossibile caricare le partite aperte. ' + (err.response?.data?.message || err.message));
        } finally {
            setIsLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSelect = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (currentData) => {
        if (selectedIds.length === currentData.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(currentData.map(item => item.id));
        }
    };

    const handleGeneratePDF = () => {
        if (!scriptsLoaded) {
            alert("Libreria PDF non ancora caricata. Riprova tra un momento.");
            return;
        }
        const itemsToPrint = partite.filter(item => selectedIds.includes(item.id));
        if (itemsToPrint.length === 0) {
            alert("Seleziona almeno una partita per generare l'estratto conto.");
            return;
        }

        // Raggruppa gli elementi selezionati per anagrafica
        const groupedByAnagrafica = itemsToPrint.reduce((acc, p) => {
            (acc[p.ragione_sociale] = acc[p.ragione_sociale] || []).push(p);
            return acc;
        }, {});

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        let startY = 22;

        doc.setFontSize(18);
        doc.text("Estratto Conto Partite Scoperte", 14, startY);
        startY += 8;
        doc.setFontSize(11);
        doc.text(`Situazione al: ${new Date().toLocaleDateString('it-IT')}`, 14, startY);
        startY += 10;
        
        for (const anagrafica in groupedByAnagrafica) {
            if (startY > 250) {
                doc.addPage();
                startY = 22;
            }

            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text(anagrafica, 14, startY);
            startY += 7;

            const items = groupedByAnagrafica[anagrafica];
            const tableBody = items.map(item => [
                item.numero_documento || 'N/D',
                new Date(item.data_documento).toLocaleDateString('it-IT'),
                new Date(item.data_scadenza).toLocaleDateString('it-IT'),
                parseFloat(item.importo).toFixed(2) + ' €'
            ]);
            const total = items.reduce((sum, item) => sum + parseFloat(item.importo), 0);
            
            doc.autoTable({
                startY: startY,
                head: [['N. Doc', 'Data Doc.', 'Scadenza', 'Importo']],
                body: tableBody,
                theme: 'striped',
                foot: [['', '', 'Totale', `${total.toFixed(2)} €`]],
                footStyles: { fontStyle: 'bold', fontSize: 10 },
            });
            startY = doc.lastAutoTable.finalY + 15;
        }

        doc.save(`estratto_conto.pdf`);
    };

    // NUOVO: Definizione delle colonne per DynamicReportTable
    const columns = useMemo(() => [
        {
            key: 'selection',
            header: <input type="checkbox" onChange={() => handleSelectAll(partite)} checked={selectedIds.length === partite.length && partite.length > 0} />,
            render: (item) => <input type="checkbox" onChange={() => handleSelect(item.id)} checked={selectedIds.includes(item.id)} />
        },
        { key: 'ragione_sociale', header: 'Cliente/Fornitore' },
        { key: 'numero_documento', header: 'N. Doc' },
        { key: 'data_documento', header: 'Data Doc.', render: (item) => new Date(item.data_documento).toLocaleDateString('it-IT') },
        { key: 'data_scadenza', header: 'Scadenza', render: (item) => <span className="font-semibold text-red-600">{new Date(item.data_scadenza).toLocaleDateString('it-IT')}</span> },
        { key: 'importo', header: 'Importo', render: (item) => <span className="font-mono text-right block">{parseFloat(item.importo).toFixed(2)} €</span> },
    ], [partite, selectedIds]);

    return (
        <div className="p-6 bg-slate-50">
            <h1 className="text-2xl font-bold text-slate-800 mb-4">Gestione Finanze</h1>
            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-8">
                    <button onClick={() => setActiveTab('attive')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'attive' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                        Crediti verso Clienti
                    </button>
                    <button onClick={() => setActiveTab('passive')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'passive' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                        Debiti verso Fornitori
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

                {/* NUOVO: Utilizzo del componente DynamicReportTable */}
                <DynamicReportTable
                    data={partite}
                    columns={columns}
                    isLoading={isLoading}
                    title={activeTab === 'attive' ? 'Crediti Aperti' : 'Debiti Aperti'}
                    defaultSort={{ key: 'ragione_sociale', direction: 'ascending' }}
                />
            </div>
        </div>
    );
};

export default PartiteAperteManager;

