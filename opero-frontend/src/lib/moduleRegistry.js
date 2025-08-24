// #####################################################################
// # Registro dei Moduli - v1.0
// # File: opero-frontend/src/lib/moduleRegistry.js
// #####################################################################

import React from 'react';
// File: opero-frontend/src/lib/moduleRegistry.js
// ... altri import
import PPAModule from '../components/PPAModule'; // Aggiungi questo


// Importiamo tutti i componenti "contenitore" dei nostri moduli in modo 'lazy'
// per ottimizzare il caricamento dell'applicazione (code-splitting).
const AmministrazioneModule = React.lazy(() => import('../components/AmministrazioneModule'));
const ContSmartModule = React.lazy(() => import('../components/ContSmartModule'));
const MailModule = React.lazy(() => import('../components/MailModule'));
const AdminPanel = React.lazy(() => import('../components/AdminPanel'));
const moduleRegistry = { 
    'PPA_MODULE': PPAModule, // Aggiungi questa riga
};

// Aggiungi qui i futuri moduli che creerai...
// const MagazzinoModule = React.lazy(() => import('../components/MagazzinoModule'));

/**
 * Mappatura statica tra la chiave univoca (dal DB) e il componente React.
 * Questa è l'unica parte di codice che dovrai modificare quando aggiungi un nuovo modulo.
 */
const componentMap = {
  AMMINISTRAZIONE: AmministrazioneModule,
  CONT_SMART: ContSmartModule,
  MAIL: MailModule,
  ADMIN_PANEL: AdminPanel,
  PPA_MODULE: PPAModule, // Aggiunto PPA alla mappa principale per coerenza
};

/**
 * Funzione che restituisce un componente React basato sulla sua chiave.
 * @param {string} componentKey - La chiave univoca del componente (es. 'AMMINISTRAZIONE').
 * @returns {React.Component | null} Il componente React corrispondente o null se non trovato.
 */
export const getModuleComponent = (componentKey) => {
  return componentMap[componentKey] || null;
};

