// #####################################################################
// # Registro Centrale dei Moduli v3.2 (Unificato e Pulito)
// # File: opero-gestionale/opero-frontend/src/lib/moduleRegistry.js
// #####################################################################

import React from 'react';
import { 
    HomeIcon, 
    CalculatorIcon, 
    CogIcon, 
    BanknotesIcon,
    BuildingOffice2Icon,
    ArchiveBoxIcon,
    ClipboardDocumentListIcon,
    EnvelopeIcon,
    CurrencyDollarIcon 
} from '@heroicons/react/24/outline';
// --- Definizione del Menu Laterale (per la UI) ---
// Questo array è l'unica fonte di verità per le voci del menu laterale.
export const modules = [
    {
        key: 'DASHBOARD',
        label: 'Dashboard',
        icon: HomeIcon,
        permission: 'DASHBOARD_VIEW'
    },
    {
        key: 'AMMINISTRAZIONE_MODULE',
        label: 'Amministrazione',
        icon: BuildingOffice2Icon,
        permission: 'AMMINISTRAZIONE_MODULE_VIEW'
    },
    {
        key: 'CONT_SMART',
        label: 'Contabilità',
        icon: CalculatorIcon,
        permission: 'CONT_SMART_MODULE'
    },
    {
        key: 'FIN_SMART',
        label: 'Finanze',
        icon: BanknotesIcon,
        permission: 'FINANZE_MODULE_VIEW'
    },
    {
        key: 'BENI_STRUMENTALI_MODULE',
        label: 'Beni Strumentali',
        icon: ArchiveBoxIcon,
        permission: 'BENI_STRUMENTALI_MODULE_VIEW'
    },
    // ## VECCHIA VOCE PPA RIMOSSA ##
    {
        // ## NUOVA E UNICA VOCE PER PPA ##
        key: 'PPA_SIS', 
        label: 'PPA SIS', // Etichetta chiara come da richiesta
        icon: ClipboardDocumentListIcon,
        permission: 'PPA_SIS_MODULE_VIEW'
    },
     {
        // ## NUOVA E UNICA VOCE PER catalogo ##
        key: 'CT_VIEW', 
        label: 'CATALOGO', // Etichetta chiara come da richiesta
        icon: ClipboardDocumentListIcon,
        permission: 'CT_VIEW'
    },
     {
        // ## NUOVA E UNICA VOCE PER catalogo ##
        key: 'MG_VIEW', 
        label: 'MAGAZZINO', // Etichetta chiara come da richiesta
        icon: ClipboardDocumentListIcon,
        permission: 'MG_VIEW'
    },
    {
        key: 'MAIL_MODULE',
        label: 'Mail',
        icon: EnvelopeIcon,
        permission: 'MAIL_MODULE_VIEW'
    },
    {
        key: 'VA_CLIENTI_VIEW',
        label: 'VENDITE',
        icon: EnvelopeIcon,
        permission: 'VA_CLIENTI_VIEW', // Usiamo il permesso di base per vedere i clienti
    }
];

// --- Mappatura dei Componenti (per la logica di caricamento) ---
const Dashboard = React.lazy(() => import('../components/Dashboard'));
const ContSmartModule = React.lazy(() => import('../components/ContSmartModule'));
const FinanzeModule = React.lazy(() => import('../components/FinanzeModule'));
const MailModule = React.lazy(() => import('../components/MailModule'));
const AmministrazioneModule = React.lazy(() => import('../components/AmministrazioneModule'));
const AdminPanel = React.lazy(() => import('../components/AdminPanel'));
const BeniStrumentaliModule = React.lazy(() => import('../components/BeniStrumentaliModule'));
const PPASisModule = React.lazy(() => import('../components/PPASisModule')); // Il nostro nuovo modulo
const CatalogoModule = React.lazy(() => import('../components/CatalogoModule'));
const MagazzinoModule = React.lazy(() => import('../components/MagazzinoModule'));
const VenditeModule = React.lazy(() => import('../components/VenditeModule'));

// Questa mappa collega la 'key' definita sopra al componente React da caricare.

export const componentMap = {
  DASHBOARD: Dashboard,
  AMMINISTRAZIONE_MODULE: AmministrazioneModule,
  CONT_SMART: ContSmartModule,
  FIN_SMART: FinanzeModule,
  BENI_STRUMENTALI_MODULE: BeniStrumentaliModule,
  // ## VECCHIA CHIAVE PPA_MODULE RIMOSSA ##
  PPA_SIS: PPASisModule, // ## NUOVA E UNICA CHIAVE PER PPA ##
  MAIL_MODULE: MailModule,
  ADMIN_PANEL: AdminPanel,
  CT_VIEW: CatalogoModule,
  MG_VIEW: MagazzinoModule,
    VA_CLIENTI_VIEW: VenditeModule,

};
