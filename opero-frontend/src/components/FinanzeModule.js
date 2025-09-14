// #####################################################################
// # Modulo Finanze - v1.0
// # File: opero-gestionale/opero-frontend/src/components/FinanzeModule.js
// #####################################################################

import React from 'react';
// <span style="color:red;">// CORREZIONE: Assicuriamoci che il componente PartiteAperteManager sia importato.</span>
// <span style="color:green;">// Questo è il collegamento che mancava.</span>
import PartiteAperteManager from './finanze/PartiteAperteManager';

/**
 * Questo componente funge da punto di ingresso per tutte le funzionalità finanziarie.
 * Al momento, visualizza direttamente il gestore delle partite aperte. In futuro,
 * potrà essere espanso con un menu interno per navigare tra Scadenziario,
 * Cash Flow, Riconciliazione Bancaria, ecc.
 */
const FinanzeModule = () => {
    return (
        <div>
            {/* Renderizza il componente per la gestione delle partite aperte */}
            <PartiteAperteManager />
        </div>
    );
};

export default FinanzeModule;

