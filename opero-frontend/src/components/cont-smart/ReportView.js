// #####################################################################
// # Componente Contenitore per la Sezione Reportistica v1.2 (Corretto)
// # File: opero-gestionale/opero-frontend/src/components/cont-smart/ReportView.js
// #####################################################################

import React, { useState } from 'react';
import { BookOpenIcon, QueueListIcon, ScaleIcon } from '@heroicons/react/24/outline';

// --- Importazione dei componenti reali per i report ---
import GiornaleView from './reports/GiornaleView';
import SchedaContabileView from './reports/SchedaContabileView';
import BilancioVerificaView from './reports/BilancioVerificaView';

// --- NOTA: Le definizioni placeholder sono state rimosse per risolvere l'errore ---

const ReportView = () => {
    const [activeReport, setActiveReport] = useState('giornale');

    const reports = [
        { key: 'giornale', label: 'Libro Giornale', icon: BookOpenIcon, component: GiornaleView },
        { key: 'scheda', label: 'Schede Contabili', icon: QueueListIcon, component: SchedaContabileView },
        { key: 'bilancio', label: 'Bilancio di Verifica', icon: ScaleIcon, component: BilancioVerificaView },
    ];

    const renderActiveReport = () => {
        const report = reports.find(r => r.key === activeReport);
        if (report) {
            const Component = report.component;
            return <Component />;
        }
        return null;
    };

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-xl font-semibold text-slate-700 mb-4">Reportistica Contabile</h2>
            
            <div className="flex items-center border-b border-slate-200 mb-6">
                {reports.map(report => (
                    <button
                        key={report.key}
                        onClick={() => setActiveReport(report.key)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-t-md ${
                            activeReport === report.key
                                ? 'bg-white border-b-2 border-blue-500 text-blue-600'
                                : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        <report.icon className="h-5 w-5" />
                        <span>{report.label}</span>
                    </button>
                ))}
            </div>

            <div className="flex-1 mt-4">
                {renderActiveReport()}
            </div>
        </div>
    );
};

export default ReportView;

