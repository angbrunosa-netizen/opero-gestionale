/**
 * @file opero-frontend/src/lib/moduleRegistry.js
 * @description Mappe statiche (DEFINITIVE) per risolvere chiavi dal DB.
 * - v4.2: Mappa TUTTE le 'chiave_componente' da 'moduli (2).sql'.
 * - I moduli senza componente React sono commentati.
 * - Per attivarli: 1) Creare il file. 2) Decommentare la riga.
 */

import React from 'react';
import * as Icons from '@heroicons/react/24/outline';

// --- Mappa delle Icone ---
// Mappa stringhe DB -> Componenti Icona React
export const iconMap = {
    CalculatorIcon: Icons.CalculatorIcon,
    BuildingOffice2Icon: Icons.BuildingOffice2Icon,
    ArchiveBoxIcon: Icons.ArchiveBoxIcon,
    EnvelopeIcon: Icons.EnvelopeIcon,
    UserGroupIcon: Icons.UserGroupIcon,
    BookOpenIcon: Icons.BookOpenIcon,
    ComputerDesktopIcon: Icons.ComputerDesktopIcon,
    UserCircleIcon: Icons.UserCircleIcon,
    BanknotesIcon: Icons.BanknotesIcon,
    ClipboardDocumentListIcon: Icons.ClipboardDocumentListIcon,
    DocumentTextIcon: Icons.DocumentTextIcon, // Icona per il modulo LISTE
    CurrencyDollarIcon: Icons.CurrencyDollarIcon,
    GlobeAltIcon: Icons.GlobeAltIcon, // Icona per il modulo SITE_BUILDER
    QuestionMarkCircleIcon: Icons.QuestionMarkCircleIcon // Fallback
};

// --- Definizione dei Componenti (Lazy Loading) ---
const ContSmartModule = React.lazy(() => import('../components/ContSmartModule'));
const MailModule = React.lazy(() => import('../components/MailModule'));
const AmministrazioneModule = React.lazy(() => import('../components/AmministrazioneModule'));
const AdminPanel = React.lazy(() => import('../components/AdminPanel'));
const BeniStrumentaliModule = React.lazy(() => import('../components/beni-strumentali/BeniManager'));
const CatalogoModule = React.lazy(() => import('../components/CatalogoModule'));
const ArchivioDocumentale = React.lazy(() => import('../components/archivio/ArchivioDocumentale'));
const AddressBook = React.lazy(() => import('../components/AddressBook'));
const FinanzeModule = React.lazy(() => import('../components/FinanzeModule'));
const PPAModule = React.lazy(() => import('../components/PPAModule'));
 const MagazzinoModule = React.lazy(() => import('../components/MagazzinoModule'));
 const VenditeModule = React.lazy(() => import('../components/VenditeModule'));
//const WebsiteBuilderModule = React.lazy(() => import('../components/WebsiteBuilderModule'));
const ListModule = React.lazy(() => import('../components/ListModule')); // Componente per il modulo LISTE
const SiteBuilderModule = React.lazy(() => import('../components/SiteBuilderModule'));

// --- Mappa dei Componenti (BASATA SUL TUO SQL) ---
// Collega la 'chiave_componente' del DB al componente React.
export const componentMap = {
  AMMINISTRAZIONE: AmministrazioneModule,
  CONT_SMART: ContSmartModule,
  ADMIN_PANEL: AdminPanel,
  MAIL: MailModule,
  RUBRICA: AddressBook,
  BSSMART: BeniStrumentaliModule,
  CT_VIEW: CatalogoModule,
  DOCUMENTI: ArchivioDocumentale,
  SITE_BUILDER: SiteBuilderModule,
  // --- Moduli pronti per essere attivati ---
  // Per attivarli: 1. Crea il componente. 2. Decommenta le due righe.
LISTE: ListModule,  
 FIN_SMART: FinanzeModule,
 PPA_SIS: PPAModule, 
 MG_VIEW: MagazzinoModule,
VA_CLIENTI_VIEW: VenditeModule,
  
};