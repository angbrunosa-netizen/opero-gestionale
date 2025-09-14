// #####################################################################
// # Caricatore di Moduli v3.0 (Allineato al Registro Unificato)
// # File: opero-gestionale/opero-frontend/src/components/ModuleLoader.js
// #####################################################################

import React, { Suspense } from 'react';
// Importiamo 'componentMap' dal registro dei moduli.
import { componentMap } from '../lib/moduleRegistry'; 
import { ArrowPathIcon } from '@heroicons/react/24/solid';

// Componente per mostrare un indicatore di caricamento mentre il modulo viene scaricato.
const LoadingFallback = () => (
    <div className="flex items-center justify-center h-full">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-slate-500" />
    </div>
);

/**
 * Questo componente agisce come un "router" per visualizzare il modulo corretto
 * in base alla chiave del modulo attivo passata come prop.
 */
const ModuleLoader = ({ moduleKey }) => {
    // Selezioniamo il componente direttamente dalla mappa.
    const ComponentToRender = componentMap[moduleKey];

    if (!ComponentToRender) {
        // Messaggio di fallback se nessun modulo è selezionato o la chiave non è valida.
        return (
            <div className="p-6 text-center text-slate-600">
                <h2 className="text-xl font-semibold">Benvenuto in Opero</h2>
                <p>Seleziona un modulo dalla barra laterale per iniziare.</p>
            </div>
        );
    }

    // React.Suspense è necessario per gestire il caricamento "lazy" dei componenti.
    // Mostra il componente 'LoadingFallback' mentre il codice del modulo viene scaricato.
    return (
        <Suspense fallback={<LoadingFallback />}>
            <ComponentToRender />
        </Suspense>
    );
};

export default ModuleLoader;

