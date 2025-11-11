/**
 * @file opero-frontend/src/lib/moduleRegistry.js
 * @description Registro Centrale dei Moduli v3.4 (Fix Percorsi)
 * - Corregge i percorsi 'lazy' per Catalogo e Beni Strumentali.
 * - Commenta i moduli 'DASHBOARD' e 'SETUP'
 * che non hanno file corrispondenti (causavano l'errore 
 * 'Module not found').
 */

import React from 'react';
import { 
    HomeIcon, // Commentato v3.4
    CalculatorIcon, 
    // CogIcon, // Sostituito v3.4
    BanknotesIcon,
    BuildingOffice2Icon,
    ArchiveBoxIcon,
    ClipboardDocumentListIcon,
    EnvelopeIcon,
    CurrencyDollarIcon,
    UserGroupIcon,
    BookOpenIcon,
    ComputerDesktopIcon,
    // WrenchScrewdriverIcon, // Commentato v3.4
    UserCircleIcon
} from '@heroicons/react/24/outline';

// --- Definizione del Menu Laterale (per la UI) ---
export const modules = [
    { // (COMMENTATO v3.4)
         key: 'DASHBOARD',
         label: 'Dashboard',
         icon: HomeIcon,
         permission: 'DASHBOARD_VIEW' 
     },
    {
        key: 'ANAGRAFICHE',
        label: 'Rubrica_Smart',
        icon: UserGroupIcon,
        permission: 'ANAGRAFICHE_VIEW'
    },
    {
        key: 'AMMINISTRAZIONE_MODULE',
        label: 'Amministrazione',
        icon: BuildingOffice2Icon,
        permission: 'VIEW_AMMINISTRAZIONE'
    },
    {
        key: 'CONT_SMART',
        label: 'Contabilità',
        icon: CalculatorIcon,
        permission: 'CONT_SMART'
    },
    {
        key: 'CATALOGO_MODULE',
        label: 'Catalogo',
        icon: BookOpenIcon,
        permission: 'CT_VIEW'
    },
    {
        key: 'ARCHIVIO',
        label: 'Archivio',
        icon: ArchiveBoxIcon,
        permission: 'DM_FILE_VIEW'
    },
    {
        key: 'MAIL_MODULE',
        label: 'Posta',
        icon: EnvelopeIcon,
        permission: 'VIEW_MAIL'
    },
    {
        key: 'BENI_STRUMENTALI_MODULE',
        label: 'Beni Strumentali',
        icon: ComputerDesktopIcon,
        permission: 'BS_VIEW_BENE'
    },
    // --- (Commentati v3.4) ---
     {
         key: 'FIN_SMART',
         label: 'Finanze',
         icon: BanknotesIcon,
         permission: 'FIN_SMART'
     },
     {
         key: 'PPA_SIS',
         label: 'PPA Sis',
         icon: ClipboardDocumentListIcon,
         permission: 'PPA_SIS_MODULE_VIEW'
     },
     {
         key: 'MAGAZZINO_MODULE',
         label: 'Magazzino',
         icon: ArchiveBoxIcon,
         permission: 'MG_VIEW'
     },
     {
         key: 'VENDITE_MODULE',
         label: 'Vendite',
         icon: CurrencyDollarIcon,
         permission: 'VENDITE_VIEW'
     },
    // ---
    // { // (COMMENTATO v3.4)
    //     key: 'SETUP',
    //     label: 'Setup',
    //     icon: WrenchScrewdriverIcon,
    //     permission: 'IS_ADMIN'
    // },
    {
        key: 'ADMIN',
        label: 'Admin',
        icon: UserCircleIcon,
        permission: 'ADMIN_PANEL'
    }
];

// --- Definizione dei Componenti (con Lazy Loading) ---

// (COMMENTATO v3.4) - File non trovato
const Dashboard = React.lazy(() => import('../components/Dashboard')); 
const ContSmartModule = React.lazy(() => import('../components/ContSmartModule'));
 const FinanzeModule = React.lazy(() => import('../components/FinanzeModule')); // Commentato
const MailModule = React.lazy(() => import('../components/MailModule'));
const AmministrazioneModule = React.lazy(() => import('../components/AmministrazioneModule'));
const AdminPanel = React.lazy(() => import('../components/AdminPanel'));

// (COMMENTATO v3.4) - File non trovato
 const PPASisModule = React.lazy(() => import('../components/PPASisModule')); 

// (COMMENTATO v3.4) - File non trovato
const MagazzinoModule = React.lazy(() => import('../components/MagazzinoModule')); 

// (COMMENTATO v3.4) - File non trovato
 const VenditeModule = React.lazy(() => import('../components/VenditeModule')); 

// (COMMENTATO v3.4) - File non trovato
// const SetupModule = React.lazy(() => import('../components/SetupModule')); 

// --- (PERCORSI CORRETTI v3.4) ---
const BeniStrumentaliModule = React.lazy(() => import('../components/beni-strumentali/BeniManager'));
const CatalogoModule = React.lazy(() => import('../components/catalogo/CatalogoManager'));
const ArchivioDocumentale = React.lazy(() => import('../components/archivio/ArchivioDocumentale'));
const AddressBook = React.lazy(() => import('../components/AddressBook'));
// ---


// Questa mappa collega la 'key' definita sopra al componente React da caricare.
export const componentMap = {
 DASHBOARD: Dashboard, // (COMMENTATO v3.4)
  AMMINISTRAZIONE_MODULE: AmministrazioneModule,
  CONT_SMART: ContSmartModule,
  FIN_SMART: FinanzeModule, // (COMMENTATO v3.4)
  BENI_STRUMENTALI_MODULE: BeniStrumentaliModule, // (CORRETTO v3.4)
 PPA_SIS: PPASisModule, // (COMMENTATO v3.4)
  MAIL_MODULE: MailModule,
  CATALOGO_MODULE: CatalogoModule, // (CORRETTO v3.4)
   MAGAZZINO_MODULE: MagazzinoModule, // (COMMENTATO v3.4)
   VENDITE_MODULE: VenditeModule, // (COMMENTATO v3.4)
  // SETUP: SetupModule, // (COMMENTATO v3.4)
  ADMIN: AdminPanel,
  ARCHIVIO: ArchivioDocumentale,
  ANAGRAFICHE: AddressBook,
};