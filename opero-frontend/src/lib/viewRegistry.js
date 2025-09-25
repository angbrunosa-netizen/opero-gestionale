/**
 * ======================================================================
 * File: src/lib/viewRegistry.js (NUOVO FILE)
 * ======================================================================
 * @description
 * Questo file è l'unico punto di collegamento tra il database e il codice.
 * Mappa il `codice` di una funzione (dal DB) al componente React
 * che la deve visualizzare.
 */
import React from 'react';

// Importa qui TUTTI i componenti che possono essere lanciati da una scorciatoia
import PianoContiManager from '../components/cont-smart/PianoContiManager';
import AddressBook from '../components/AddressBook';
import LeMieAttivitaPPA from '../components/ppa/LeMieAttivitaPPA';
import AssegnaProceduraForm from '../components/ppa/AssegnaProceduraForm';
import ProgettazionePPA from '../components/ppa/ProgettazionePPA';
import MonitorPPAAzienda from '../components/ppa/MonitorPPAAzienda';
import BeniStrumentaliModule from '../components/BeniStrumentaliModule';
import ContSmartModule from '../components/ContSmartModule';

    import PartiteAperteManager from '../components/finanze/PartiteAperteManager';

// Aggiungi qui altri import man mano che ti servono...

export const viewRegistry = {
    // Codice Funzione (dal DB) -> Componente React
    'SC_PIANO_CONTI_VIEW': <PianoContiManager />,
    'AN_ANAGRAFICHE_VIEW': <AddressBook />,
    'PPA_VIEW_MY_TASKS': <LeMieAttivitaPPA />,
    'PPA_ASSIGN_PROCEDURE': <AssegnaProceduraForm />,
    'PPA_DESIGN_PROCEDURE': <ProgettazionePPA />,
    'PPA_MONITOR_ALL': <MonitorPPAAzienda />,
    'FIN_SMART': <PartiteAperteManager/>,
    'BSSMART': <BeniStrumentaliModule />,

    // Aggiungi qui altre associazioni...
};