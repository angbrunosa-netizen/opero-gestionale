/**
 * File: /opero-frontend/src/components/dms-test/DmsTestTab.js
 *
 * Versione: 1.0.1 (Rimossa Guardia di Sicurezza)
 *
 * Descrizione: Rimossa la guardia 'if (!auth)' per testare
 * la teoria del provider. Questo componente ora si aspetta
 * che 'auth' sia sempre disponibile, come il resto dell'app.
 * Se 'auth' è null, crasherà.
 */

import React from 'react';
import AllegatiManager from '../../shared/AllegatiManager'; // Importa il componente
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

const DmsTestTab = () => {
    const { auth } = useAuth();

    // 1. Guardia di Sicurezza RIMOSSA
    // if (!auth) { ... }

    // 2. Render del pannello di test
    // Passiamo 'auth' (che potrebbe essere null)
    // ad AllegatiManager.
    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Test Ciclo Completo DMS (Database + S3)
            </h2>
            <p className="text-sm text-gray-600 mb-6">
                Qualsiasi file caricato qui sarà collegato all'entità fittizia:
                (<code>entita_tipo="TEST_DMS"</code>, <code>entita_id="1"</code>).
            </p>
            
            <AllegatiManager
                entita_tipo="TEST_DMS"
                entita_id="1"
            />
        </div>
    );
};

export default DmsTestTab;