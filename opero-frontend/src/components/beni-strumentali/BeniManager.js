// #####################################################################
// # Componente Gestione Beni Strumentali - v1.9 (Fix Colonne Tabella)
// # File: opero-frontend/src/components/beni-strumentali/BeniManager.js
// #####################################################################

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import DynamicReportTable from '../../shared/DynamicReportTable';
import BeneForm from './BeneForm'; 
import { PlusIcon, ArrowPathIcon, DocumentArrowDownIcon, PrinterIcon } from '@heroicons/react/24/outline';

// <span style="color:red; font-weight:bold;">// CORREZIONE DECISIVA: Le proprietà sono state rinominate in 'label' e 'key'
// // per corrispondere all'API del componente DynamicReportTable, come negli esempi funzionanti.</span>
const columns = [
    { label: 'Codice', key: 'codice_bene', sortable: true },
    { label: 'Descrizione', key: 'descrizione', sortable: true },
    { label: 'Categoria', key: 'categoria_descrizione', sortable: true },
    { label: 'Stato', key: 'stato', sortable: true },
    { label: 'Data Acquisto', key: 'data_acquisto', sortable: true, format: 'date' },
    { label: 'Valore Acquisto', key: 'valore_acquisto', sortable: true, format: 'currency' },
];

const loadScript = (src) => {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Errore caricamento script: ${src}`));
        document.body.appendChild(script);
    });
};

const BeniManager = () => {
    const [beni, setBeni] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBene, setSelectedBene] = useState(null);
    const auth = useAuth();

    const fetchBeni = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await api.get('/beni-strumentali');
            const dataArray = response.data && response.data.success ? response.data.data : [];
            setBeni(dataArray);
        } catch (err) {
            setError('Impossibile caricare l\'elenco dei beni.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBeni();
    }, [fetchBeni]);

    const processedData = useMemo(() => {
        if (!beni) return [];
        return beni.map(b => ({ ...b }));
    }, [beni]);


    const handleExportCSV = () => {
        // <span style="color:orange;">// MODIFICATO: Utilizza 'label' e 'key' per coerenza</span>
        const headers = columns.map(c => c.label).join(';');
        const rows = processedData.map(bene => 
            columns.map(c => bene[c.key] || '').join(';')
        ).join('\n');
        const csvContent = `${headers}\n${rows}`;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'elenco_beni_strumentali.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrintPDF = async () => {
        setIsLoading(true);
        try {
            await Promise.all([
                loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'),
                loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.min.js')
            ]);
            
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            doc.text(`Elenco Beni StrumDentali - ${auth.ditta?.ragione_sociale || ''}`, 14, 20);
            doc.autoTable({
                // <span style="color:orange;">// MODIFICATO: Utilizza 'label' e 'key' per coerenza</span>
                head: [columns.map(c => c.label)],
                body: processedData.map(bene => columns.map(c => {
                    const value = bene[c.key];
                    if (c.format === 'date' && value) return new Date(value).toLocaleDateString('it-IT');
                    if (c.format === 'currency' && value) return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
                    return value || '';
                })),
                startY: 25,
            });
            doc.save('Elenco_Beni_Strumentali.pdf');
        } catch (err) {
            setError('Errore durante la generazione del PDF.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAdd = () => {
        setSelectedBene(null);
        setIsModalOpen(true);
    };

    const handleEdit = (bene) => {
        setSelectedBene(bene);
        setIsModalOpen(true);
    };

    const handleDelete = async (bene) => {
        if (window.confirm(`Sei sicuro di voler eliminare il bene "${bene.descrizione}"?`)) {
            try {
                await api.delete(`/beni-strumentali/${bene.id}`);
                fetchBeni();
            } catch (err) {
                setError('Errore durante l\'eliminazione del bene.');
                console.error(err);
            }
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedBene(null);
    };

    const handleSave = () => {
        handleCloseModal();
        fetchBeni();
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Elenco Beni Strumentali</h1>
                 <div className="flex items-center space-x-2">
                    <button onClick={fetchBeni} className="p-2 rounded-md hover:bg-slate-200" title="Aggiorna dati">
                        <ArrowPathIcon className={`h-5 w-5 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={handleExportCSV} className="p-2 rounded-md hover:bg-slate-200" title="Esporta CSV">
                        <DocumentArrowDownIcon className="h-5 w-5 text-slate-600" />
                    </button>
                    <button onClick={handlePrintPDF} className="p-2 rounded-md hover:bg-slate-200" title="Stampa PDF">
                        <PrinterIcon className="h-5 w-5 text-slate-600" />
                    </button>
                    {auth.hasPermission('BS_CREATE_BENE') && (
                        <button onClick={handleAdd} className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                            <PlusIcon className="h-5 w-5" />
                            <span>Aggiungi Bene</span>
                        </button>
                    )}
                </div>
            </div>

            {error && <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">{error}</div>}

            <DynamicReportTable
                columns={columns}
                data={processedData}
                isLoading={isLoading}
                defaultSort={{ key: 'codice_bene', direction: 'asc' }}
                isSelectable={false}
                title="Elenco Beni"
                onSelectionChange={() => {}}
                onEdit={auth.hasPermission('BS_EDIT_BENE') ? handleEdit : null}
                onDelete={auth.hasPermission('BS_DELETE_BENE') ? handleDelete : null}
            />

            {isModalOpen && (
                <BeneForm
                    beneToEdit={selectedBene}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default BeniManager;

