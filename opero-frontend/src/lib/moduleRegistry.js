// #####################################################################
// # Registro Centrale dei Moduli v3.1 (Unificato e Allineato)
// # File: opero-gestionale/opero-frontend/src/lib/moduleRegistry.js
// #####################################################################

import React from 'react';
import { 
    HomeIcon, 
    CalculatorIcon, 
    CogIcon, 
    UsersIcon, 
    ChartBarIcon, 
    EnvelopeIcon,
    Eye,
    BanknotesIcon 
} from '@heroicons/react/24/outline';

// --- Definizione del Menu Laterale (per la UI) ---
// Questo array definisce l'aspetto, l'ordine e i permessi di ogni voce nel menu.
// La 'key' di ogni oggetto DEVE corrispondere a una chiave in 'componentMap'.
export const modules = [
    {
        key: 'DASHBOARD',
        label: 'Dashboard',
        icon: HomeIcon,
        permission: 'DASHBOARD_VIEW'
    },
    {
        key: 'CONT_SMART', // Chiave utilizzata nel tuo componentMap
        label: 'Contabilità',
        icon: CalculatorIcon,
        permission: 'CONT_SMART_MODULE'
    },
    {
        key: 'PPA_MODULE', // Chiave utilizzata nel tuo componentMap
        label: 'Processi',
        icon: ChartBarIcon,
        permission: 'PPA_MODULE'
    },
    {
        key: 'FIN_SMART', // Chiave utilizzata nel tuo componentMap
        label: 'Finanze',
        icon: BanknotesIcon,
        permission: 'FIN_SMART'
    },
    {
        key: 'MAIL', // Chiave utilizzata nel tuo componentMap
        label: 'Posta',
        icon: EnvelopeIcon,
        permission: 'MAIL_MODULE'
    },
    {
        key: 'AMMINISTRAZIONE', // Chiave utilizzata nel tuo componentMap
        label: 'Amministrazione',
        icon: UsersIcon,
        permission: 'AMMINISTRAZIONE_MODULE'
    },
    {
        key: 'ADMIN_PANEL', // Chiave utilizzata nel tuo componentMap
        label: 'Admin Sistema',
        icon: CogIcon,
        permission: 'ADMIN_PANEL_VIEW'
    },
     {
        key: 'BSSMART', // Chiave utilizzata nel tuo componentMap
        label: 'Beni Strumentali',
        icon: CogIcon,
        permission: 'BSSMART'
    }
];

// --- Mappatura dei Componenti (per la logica di caricamento) ---
// Usiamo React.lazy per il code-splitting, migliorando le performance.
const Dashboard = React.lazy(() => import('../components/Dashboard'));
const ContSmartModule = React.lazy(() => import('../components/ContSmartModule'));
const PPAModule = React.lazy(() => import('../components/PPAModule'));
const FinanzeModule = React.lazy(() => import('../components/FinanzeModule'));
const MailModule = React.lazy(() => import('../components/MailModule'));
const AmministrazioneModule = React.lazy(() => import('../components/AmministrazioneModule'));
const AdminPanel = React.lazy(() => import('../components/AdminPanel'));
const BeniStrumentaliModule = React.lazy(() => import('../components/BeniStrumentaliModule'));
// Questa mappa collega la 'key' definita sopra al componente React da caricare.
export const componentMap = {
  DASHBOARD: Dashboard,
  CONT_SMART: ContSmartModule,
  PPA_MODULE: PPAModule,
  FIN_SMART: FinanzeModule,
  MAIL: MailModule,
  AMMINISTRAZIONE: AmministrazioneModule,
  ADMIN_PANEL: AdminPanel,
  BSSMART : BeniStrumentaliModule,
};

