/**
 * ======================================================================
 * File: src/components/StandaloneModule.js (Versione Allineata al DB)
 * ======================================================================
 * @description
 * La logica di rendering (switch) è stata aggiornata per utilizzare le
 * esatte 'chiave_componente_modulo' provenienti dal database,
 * risolvendo il problema dei moduli non visualizzati.
 */
import React from 'react';
import { useParams ,useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Importiamo tutti i componenti modulo necessari
import AmministrazioneModule from './AmministrazioneModule';
import ContSmartModule from './ContSmartModule';
import MailModule from './MailModule';
import FinanzeModule from './FinanzeModule';
import BeniStrumentaliModule from './BeniStrumentaliModule';
import PPAModule from './PPAModule';
import PPASisModule from './PPASisModule';
import WebsiteBuilderModule from './WebsiteBuilderModule';
import { viewRegistry } from '../lib/viewRegistry'; 

const StandaloneModule = () => {
    const { moduleKey } = useParams();
    const [searchParams] = useSearchParams();
    // Leggiamo il codice della funzione dall'URL
    const initialView = searchParams.get('view') || '';

    const { ditta } = useAuth();
     const viewKey = searchParams.get('view'); // Es: 'SC_PIANO_CONTI_VIEW'
     const ComponentToRender = viewRegistry[viewKey];   

// ++ ISTRUZIONE DI DEBUGGING ++
    // Questo ti mostrerà nella console del browser (F12) la chiave esatta ricevuta.
    console.log('[StandaloneModule] Chiave modulo ricevuta dall\'URL:', moduleKey);

   const renderModule = () => {
        // Passiamo 'initialView' (che ora è un codice, es. 'SC_PIANO_CONTI_VIEW') come prop
        switch (moduleKey) {
            case 'AMMINISTRAZIONE':
                return <AmministrazioneModule initialView={initialView} />;
            case 'CONT_SMART':
                return <ContSmartModule initialView={initialView} />;
            case 'FIN_SMART':
                return <FinanzeModule initialView={initialView} />;
            case 'BSSMART':
                return <BeniStrumentaliModule initialView={initialView} />;
            case 'PPA SIS':
                return <PPAModule initialView={initialView} />;
            case 'WEBSITE':
                return <WebsiteBuilderModule initialView={initialView} />;
            default:
                return (<div className="text-center"><h1 className="text-2xl font-bold">Modulo non trovato: {moduleKey}</h1></div>);
        }
    };

     return (
        <div className="h-screen bg-gray-100 flex flex-col">
            <header className="bg-white shadow-md p-4">
                <h1 className="text-xl font-bold text-gray-800">Opero - {ditta ? ditta.ragione_sociale : 'Caricamento...'}</h1>
            </header>
            <main className="flex-1 p-6 overflow-y-auto">
                {ComponentToRender ? (
                    ComponentToRender // Se trovato, lo renderizza
                ) : (
                    <div className="text-center">
                        <h1 className="text-2xl font-bold">Errore di Configurazione</h1>
                        <p className="text-gray-600">
                            La funzione richiesta (<code>{viewKey || 'Nessuna'}</code>) non è stata trovata nel dizionario <code>viewRegistry.js</code>.
                        </p>
                        <p className="text-sm text-gray-500 mt-2">Verificare che il codice della funzione sia stato aggiunto al registro.</p>
                    </div>
                )}
            </main>
        </div>
    );
    
};

export default StandaloneModule;

