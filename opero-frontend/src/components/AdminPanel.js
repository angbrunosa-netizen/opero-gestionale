// #####################################################################
// # Componente AdminPanel - v17.16 (Integrazione Gestione Livelli)
// # File: opero-frontend/src/components/AdminPanel.js
// # Aggiunto il componente GestioneLivelliUtente sotto la tabella
// # nella scheda Gestione Utenti, visibile solo con permesso AM_UTE_LVL.
// #####################################################################

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AdvancedDataGrid from '../shared/AdvancedDataGrid';
// --- MODIFICA: Assicura che KeyIcon sia importato ---
import { PencilIcon, TrashIcon, DocumentArrowDownIcon, PrinterIcon, PlusIcon, LockOpenIcon ,UserPlusIcon, KeyIcon,
    XMarkIcon,ChevronDownIcon } from '@heroicons/react/24/outline';
import { ShieldCheck } from 'lucide-react';
import GestioneFunzioni from './admin/GestioneFunzioni';
import GestioneRuoliPermessi from './admin/GestioneRuoliPermessi';
import GestionePermessiUtenteModal from './admin/GestionePermessiUtenteModal';
// ++ NUOVI IMPORT ++
import AdminDitte from './admin/AdminDitte'; // Assumendo esista questo componente per Gestione Ditte
import AdminMonitoraggio from './admin/AdminMonitoraggio';
import GestioneLivelliUtente from './admin/GestioneLivelliUtente'; // <-- 1. IMPORTA IL COMPONENTE
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'; // <-- Importa icona per la nuova tab (o scegline un'altra)
// FINE NUOVI IMPORT
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import { toast } from 'react-toastify';

import InvitaUtenteModal from '../shared/InvitaUtenteModal';
// --- MODIFICA: Import del nuovo modale ---
import ShowLinkModal from '../shared/ShowLinkModal';

import DmsTestTab from './dms-test/DmsTestTab';   //lo cancellero dopo il test

// --- Componente Interno per la Gestione Utenti ---
// (Questo componente non sembra utilizzato, lo lascio invariato)
const UserManager = () => {
    const { hasPermission } = useAuth();
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    const handleInviteSuccess = () => {
        setIsInviteModalOpen(false);
        // fetchUtenti();
    };
    const [activeTab, setActiveTab] = useState('utenti');

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Gestione Utenti</h2>
                {hasPermission('ADMIN_USERS_CREATE') && (
                    <button
                        onClick={() => setIsInviteModalOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <UserPlusIcon className="h-5 w-5" />
                        <span>Invita Nuovo Utente</span>
                    </button>
                )}
            </div>

            <div className="bg-white p-4 rounded-md shadow">
                <p className="text-gray-500">Elenco degli utenti del sistema.</p>
                {/* Esempio: <AdvancedDataGrid data={utenti} columns={userColumns} /> */}
            </div>

            <InvitaUtenteModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onInviteSent={handleInviteSuccess}
                id_ruolo={3} // Invita come "Utente Esterno" (ID 3)
            />
        </div>
    );
};


// ====================================================================
// ICONE (Aggiunta Icona Monitoraggio)
// ====================================================================
const MonitorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;


// ====================================================================
// Utility Functions per Export (invariate e pulite)
// ====================================================================
const exportToCSV = (data, fileName) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' }); // Aggiunto BOM
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const exportToPDF = (data, columns, fileName, ditta) => {
    const doc = new jsPDF();
    const tableHeaders = columns.map(col => col.label);
    const tableData = data.map(item => columns.map(col => item[col.key]));
    const startY = 50;

    const generatePdf = (logoImgData = null) => {
        if (logoImgData) {
            const imgProps = doc.getImageProperties(logoImgData);
            const logoWidth = 40;
            const logoHeight = (imgProps.height * logoWidth) / imgProps.width;
            doc.addImage(logoImgData, 'PNG', 15, 10, logoWidth, logoHeight);
        }

        if (ditta) {
            const xPos = 60;
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text(ditta.ragione_sociale || '', xPos, 15);
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.text(ditta.indirizzo || '', xPos, 21);
            doc.text(`${ditta.cap || ''} ${ditta.citta || ''} (${ditta.provincia || ''})`, xPos, 26);
            doc.text(`P.IVA: ${ditta.p_iva || ''}`, xPos, 31);
        }

        doc.setFontSize(12);
        doc.text(`Elenco Utenti`, 15, startY - 5);

        autoTable(doc, {
            head: [tableHeaders],
            body: tableData,
            startY: startY,
            didDrawPage: (data) => {
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(
                    'Stampato con Opero - www.operogo.it',
                    data.settings.margin.left,
                    doc.internal.pageSize.getHeight() - 10
                );
            },
        });

        doc.save(`${fileName}.pdf`);
    };

    if (ditta && ditta.logo_url) {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = ditta.logo_url;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const dataURL = canvas.toDataURL('image/png');
            generatePdf(dataURL);
        };
        img.onerror = () => {
            console.error("Logo non trovato o errore di caricamento. Genero PDF senza logo.");
            generatePdf();
        };
    } else {
        generatePdf();
    }
};


// ====================================================================
// Sotto-componente: Form di Creazione/Modifica Utente (Modal) (invariato)
// ====================================================================
// --- MODIFICA: Aggiungi 'selectedDittaId' tra le props ---
/*
* File: /opero-frontend/src/components/AdminPanel.js
* Revisione: 1.4 (Fix UserFormModal state initialization)
* Descrizione: Corretto l'errore nell'inizializzazione dello stato 'formData'
* nel componente UserFormModal.
*/

// ... (Import e altri componenti come nel file fornito) ...

// ====================================================================
// Sotto-componente: Form di Creazione/Modifica Utente (Modal) (CORRETTO)
// ====================================================================
// ====================================================================
// Sotto-componente: Form di Creazione/Modifica Utente (Modal) (RIVISTO)
// ====================================================================
const UserFormModal = ({ user, onSave, onCancel, ruoli, selectedDittaId }) => {
    const { user: currentUser } = useAuth();
    const [errors, setErrors] = useState({});

    // --- NUOVA LOGICA DI INIZIALIZZAZIONE ---
    // Definiamo una funzione per creare lo stato iniziale basato sulle props.
    // Usiamo 'useMemo' per ricalcolarlo solo se 'user' o 'selectedDittaId' cambiano DAVVERO.
    const initialFormData = useMemo(() => {
        // console.log("[UserFormModal] Calcolo initialFormData. User:", user); // DEBUG se necessario
        return {
            id: user?.id || "",
            nome: user?.nome || '',
            cognome: user?.cognome || '',
            email: user?.email || '',
            id_ruolo: user?.id_ruolo || '',
            livello: user?.livello || '',
            Codice_Tipo_Utente: user?.Codice_Tipo_Utente || '',
            stato: user?.stato || 'attivo',
            id_ditta: selectedDittaId || user?.id_ditta || '', // Priorità a selectedDittaId
        };
    }, [user, selectedDittaId]);

    // Inizializziamo lo stato con i valori calcolati.
    const [formData, setFormData] = useState(initialFormData);

    // Questo useEffect serve ORA SOLO a sincronizzare lo stato
    // SE le props cambiano DOPO il montaggio iniziale.
    // È una salvaguardia, ma l'inizializzazione chiave è fatta sopra.
    useEffect(() => {
        // console.log("[UserFormModal] useEffect [user, selectedDittaId] triggered."); // DEBUG se necessario
        setFormData(initialFormData); // Resetta allo stato calcolato dalle props correnti
        setErrors({}); // Resetta errori quando l'utente cambia
    }, [initialFormData]); // Usiamo initialFormData come dipendenza, che a sua volta dipende da user/selectedDittaId

    // --- DEBUG AGGIUNTIVO: Logga lo stato DOPO ogni potenziale aggiornamento ---
    useEffect(() => {
        console.log('[UserFormModal] Stato formData aggiornato:', formData);
    }, [formData]);
    // --- FINE DEBUG AGGIUNTIVO ---


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        // ... (Logica di validazione invariata) ...
         const newErrors = {};
        if (!formData.nome) newErrors.nome = 'Il nome è obbligatorio.';
        if (!formData.cognome) newErrors.cognome = 'Il cognome è obbligatorio.';
        if (formData.id_ruolo === undefined || formData.id_ruolo === '' || formData.id_ruolo === null) {
             newErrors.id_ruolo = 'Il ruolo è obbligatorio.';
        }


        let maxLevel = 80;
        if (currentUser?.id_ruolo === 2) maxLevel = 90;
        else if (currentUser?.id_ruolo === 1) maxLevel = 100;

        const livelloNum = parseInt(formData.livello, 10);
        if (isNaN(livelloNum) || livelloNum < 1 || livelloNum > maxLevel) {
            newErrors.livello = `Il livello deve essere un numero tra 1 e ${maxLevel}.`;
        }
        if (currentUser?.id_ruolo === 2) {
            if (livelloNum > 90) {
                 newErrors.livello = 'Come Amministratore Ditta, non puoi impostare un livello superiore a 90.';
            }
            if (formData.id_ruolo && parseInt(formData.id_ruolo, 10) <= 2) {
                newErrors.id_ruolo = 'Non puoi assegnare ruoli di Amministratore.';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        // ... (Logica handleSubmit invariata) ...
         e.preventDefault();
        if (validateForm()) {
            const dataToSave = { ...formData, id_ditta: selectedDittaId };
            onSave(dataToSave);
        } else {
             console.log('[UserFormModal] Validazione fallita:', errors);
             toast.warn("Correggi gli errori nel form prima di salvare.");
        }
    };

    // Il JSX del return rimane identico alla versione precedente
    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-lg font-bold mb-4">{user?.id ? 'Modifica Dati Utente' : 'Crea Nuovo Utente'}</h3>
                 <form onSubmit={handleSubmit} className="space-y-4">
                     {/* Nome e Cognome */}
                     <div className="grid grid-cols-2 gap-4">
                         <div>
                             <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome</label>
                             <input type="text" id="nome" name="nome" value={formData.nome || ''} onChange={handleChange} className={`mt-1 p-2 border rounded w-full ${errors.nome ? 'border-red-500' : 'border-gray-300'}`} />
                             {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
                         </div>
                         <div>
                             <label htmlFor="cognome" className="block text-sm font-medium text-gray-700">Cognome</label>
                             <input type="text" id="cognome" name="cognome" value={formData.cognome || ''} onChange={handleChange} className={`mt-1 p-2 border rounded w-full ${errors.cognome ? 'border-red-500' : 'border-gray-300'}`} />
                             {errors.cognome && <p className="text-red-500 text-xs mt-1">{errors.cognome}</p>}
                         </div>
                     </div>

                     {/* Email (Readonly) */}
                     <div>
                         <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                         <input type="email" id="email" name="email" value={formData.email || ''} readOnly className="mt-1 p-2 border rounded w-full bg-gray-100 cursor-not-allowed" />
                     </div>

                     {/* Livello */}
                     <div>
                         <label htmlFor="livello" className="block text-sm font-medium text-gray-700">Livello (1-{currentUser?.id_ruolo === 1 ? 100 : currentUser?.id_ruolo === 2 ? 90 : 80})</label>
                         <input
                             type="number"
                             id="livello"
                             name="livello"
                             value={formData.livello || ''}
                             onChange={handleChange}
                             min="1"
                             max={currentUser?.id_ruolo === 1 ? 100 : currentUser?.id_ruolo === 2 ? 90 : 80}
                             className={`mt-1 p-2 border rounded w-full ${errors.livello ? 'border-red-500' : 'border-gray-300'}`}
                         />
                         {errors.livello && <p className="text-red-500 text-xs mt-1">{errors.livello}</p>}
                     </div>

                     {/* Stato */}
                     <div>
                         <label htmlFor="stato" className="block text-sm font-medium text-gray-700">Stato</label>
                         <select id="stato" name="stato" value={formData.stato || 'attivo'} onChange={handleChange} className="mt-1 p-2 border border-gray-300 rounded w-full">
                             <option value="attivo">Attivo</option>
                             <option value="bloccato">Bloccato</option>
                         </select>
                     </div>

                     {/* Codice Tipo Utente */}
                     <div>
                         <label htmlFor="Codice_Tipo_Utente" className="block text-sm font-medium text-gray-700">Codice Tipo Utente</label>
                         <input type="text" id="Codice_Tipo_Utente" name="Codice_Tipo_Utente" value={formData.Codice_Tipo_Utente || ''} onChange={handleChange} className="mt-1 p-2 border border-gray-300 rounded w-full" placeholder="Es. AGENTE, INTERNO (opzionale)" />
                     </div>

                     {/* Ruolo */}
                     <div>
                         <label htmlFor="id_ruolo" className="block text-sm font-medium text-gray-700">Ruolo</label>
                         <select id="id_ruolo" name="id_ruolo" value={formData.id_ruolo || ''} onChange={handleChange} className={`mt-1 p-2 border rounded w-full ${errors.id_ruolo ? 'border-red-500' : 'border-gray-300'}`}>
                             <option value="">Seleziona Ruolo</option>
                             {ruoli
                                .filter(r => {
                                    if (currentUser?.id_ruolo === 1) return true;
                                    if (currentUser?.id_ruolo === 2) return r.id > 2;
                                    return false;
                                })
                                .map(r => <option key={r.id} value={r.id}>{r.ruolo}</option>)
                             }
                         </select>
                         {errors.id_ruolo && <p className="text-red-500 text-xs mt-1">{errors.id_ruolo}</p>}
                     </div>

                     {/* Pulsanti */}
                     <div className="flex justify-end gap-2 pt-4">
                         <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">Annulla</button>
                         <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Salva</button>
                     </div>
                 </form>
            </div>
        </div>
    );
};
// ... (Resto del file AdminPanel.js come fornito, con GestioneUtenti, AssociaModuliDitta, etc.) ...
// Assicurati che il file termini con l'export corretto:
// export default AdminPanel;
// ====================================================================
// Sotto-componente: Gestione Utenti (MODIFICATO per includere invito, recupero PW e gestione livelli)
// ====================================================================
/*
/*
/*
 * #####################################################################
 * # Componente GestioneUtenti - v2.2 (Con Funzione di Ricerca)
 * # File: opero-frontend/src/components/admin/GestioneUtenti.js
 * # Modifiche principali:
 * # - Aggiunta barra di ricerca per filtrare utenti
 * # - La ricerca funziona su nome, cognome, email e ruolo
 * # - Layout della ricerca ottimizzato per mobile e desktop
 * #####################################################################
 */

const GestioneUtenti = () => {
    const { user, ditta, hasPermission } = useAuth();
    const [ditte, setDitte] = useState([]);
    const [utenti, setUtenti] = useState([]);
    const [ruoli, setRuoli] = useState([]);
    const [selectedDittaId, setSelectedDittaId] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // --- NUOVO STATO PER LA RICERCA ---
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [editingPermissionsForUser, setEditingPermissionsForUser] = useState(null);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    const [loadingRecoveryLink, setLoadingRecoveryLink] = useState(false);
    const [generatedLink, setGeneratedLink] = useState('');
    const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);

    const [showMobileActions, setShowMobileActions] = useState(false);

    const logAction = useCallback(async (azione, dettagli = '') => {
        try { 
            await api.post('/track/log-action', { azione, dettagli, modulo: 'Admin', funzione: 'Gestione Utenti' });
        } catch (error) {
            console.error("Errore during la registrazione dell'azione:", error);
        }
    }, []);

    const fetchUtentiForDitta = useCallback(async (dittaId) => {
        if (!dittaId) { setUtenti([]); return; }
        setIsLoading(true);
        try {
            const response = await api.get(`/admin/utenti/ditta/${dittaId}`);
            setUtenti(response.data.utenti || response.data || []);
        } catch (error) {
            toast.error("Impossibile caricare l'elenco degli utenti.");
            console.error(`Errore nel caricamento degli utenti per la ditta ${dittaId}:`, error);
            setUtenti([]);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        const loadInitialData = async () => {
            if (!user) return;
            setIsLoading(true);
            try {
                const ruoliRes = await api.get('/admin/ruoli');
                setRuoli(ruoliRes.data.ruoli || ruoliRes.data || []);
                if (user.ruolo === 'Amministratore_sistema') {
                    const ditteRes = await api.get('/admin/ditte');
                    setDitte(ditteRes.data.ditte || ditteRes.data || []);
                } else {
                    setDitte([ditta]);
                    setSelectedDittaId(ditta.id);
                }
            } catch (error) {
                console.error("Errore nel caricamento dei dati di supporto:", error);
            }
            setIsLoading(false);
        };
        loadInitialData();
    }, [user, ditta]);

    useEffect(() => {
        if (selectedDittaId) {
            fetchUtentiForDitta(selectedDittaId);
        }
    }, [selectedDittaId, fetchUtentiForDitta]);

    // --- LOGICA DI FILTRAGGIO CON USEMEMO ---
    const filteredUsers = useMemo(() => {
        if (!searchTerm) return utenti;
        
        const lowerCaseTerm = searchTerm.toLowerCase();
        return utenti.filter(user => {
            const ruolo = ruoli.find(r => r.id === user.id_ruolo)?.ruolo || '';
            return (
                user.nome.toLowerCase().includes(lowerCaseTerm) ||
                user.cognome.toLowerCase().includes(lowerCaseTerm) ||
                user.email.toLowerCase().includes(lowerCaseTerm) ||
                ruolo.toLowerCase().includes(lowerCaseTerm)
            );
        });
    }, [utenti, ruoli, searchTerm]);

    const handleInviteUser = () => setIsInviteModalOpen(true);
    const handleInviteSuccess = () => {
        setIsInviteModalOpen(false);
        toast.info("Invito inviato. L'elenco utenti si aggiornerà quando l'utente completerà la registrazione.");
    };

    const handleEditUser = useCallback((userId) => {
        const userToEdit = utenti.find(u => u.id === userId);
        if (userToEdit) {
            setEditingUser(userToEdit);
            setIsModalOpen(true);
        } else {
            toast.error("Impossibile modificare l'utente. Prova a ricaricare.");
        }
    }, [utenti]);

    const handleDeleteUser = useCallback(async (userId) => {
        if (window.confirm('Sei sicuro di voler eliminare questo utente?')) {
            try {
                const userToDelete = utenti.find(u => u.id === userId);
                await api.delete(`/admin/utenti/${userId}`);
                if (userToDelete) logAction('Eliminazione utente', `Utente: ${userToDelete.email} (ID: ${userId})`);
                setUtenti(prev => prev.filter(u => u.id !== userId));
            } catch (error) {
                console.error(`Errore during l'eliminazione dell'utente ${userId}:`, error);
            }
        }
    }, [utenti, logAction]);

    const handleUnlockUser = useCallback(async (userId) => {
        if (window.confirm("Sei sicuro di voler sbloccare questo utente?")) {
            try {
                const { data } = await api.post(`/admin/utenti/${userId}/sblocca`);
                toast.success(data.message);
                logAction('Sblocco utente', `Sbloccato utente ID: ${userId}`);
                fetchUtentiForDitta(selectedDittaId);
            } catch (error) {
                toast.error(error.response?.data?.message || "Errore during lo sblocco dell'utente.");
            }
        }
    }, [selectedDittaId, fetchUtentiForDitta, logAction]);

    const handleGenerateRecoveryLink = useCallback(async (userId, userEmail) => {
        if (!hasPermission('ADM_PWD_REC')) { toast.warn('Non hai i permessi necessari.'); return; }
        if (!window.confirm(`Sei sicuro di voler generare un nuovo link di recupero password per ${userEmail}?`)) return;
        setLoadingRecoveryLink(true);
        try {
            const response = await api.post(`/admin/utenti/${userId}/generate-recovery-link`);
            if (response.data.success && response.data.recoveryLink) {
                setGeneratedLink(response.data.recoveryLink);
                setIsRecoveryModalOpen(true);
                toast.success('Link di recupero generato!');
            } else {
                 toast.error(response.data.message || 'Errore imprevisto.');
            }
        } catch (err) {
            console.error("Errore API:", err);
            toast.error(err.response?.data?.message || 'Errore di comunicazione.');
        } finally {
             setLoadingRecoveryLink(false);
        }
    }, [hasPermission]);

    const handleSaveUser = useCallback(async (userData) => {
        const { id } = userData;
        try {
            if (id) {
                await api.put(`/admin/utenti/${id}`, userData);
                const dittaName = ditte.find(d => d.id === parseInt(userData.id_ditta, 10))?.ragione_sociale || userData.id_ditta;
                logAction('Modifica utente', `Utente: ${userData.email}, Ditta: ${dittaName}`);
                setIsModalOpen(false); setEditingUser(null);
                if (selectedDittaId) fetchUtentiForDitta(selectedDittaId);
            } else {
                toast.error("Errore: questo form può solo modificare utenti. Usa 'Invita Utente' per crearne di nuovi.");
            }
        } catch (error) {
            console.error(`Errore durante il salvataggio:`, error);
            toast.error(`Errore durante il salvataggio: ${error.message}`);
        }
    }, [ditte, selectedDittaId, logAction, fetchUtentiForDitta]);

    const handleExport = (format) => {
        const selectedDitta = ditte.find(d => d.id === parseInt(selectedDittaId, 10));
        if (!selectedDitta) { toast.warn("Seleziona una ditta prima di esportare."); return; }
        // Esporta i dati filtrati, non l'intero elenco
        const dataToExport = filteredUsers.map(u => ({
            username: `${u.nome} ${u.cognome}`,
            email: u.email,
            ruolo: ruoli.find(r => r.id === u.id_ruolo)?.ruolo || 'N/D',
            stato: u.stato
        }));
        const fileName = `elenco_utenti_${selectedDitta.ragione_sociale.replace(/\s/g, '_')}`;
        if (format === 'csv') {
            logAction('Export CSV', `Esportato elenco utenti per ditta: ${selectedDitta.ragione_sociale}`);
            exportToCSV(Papa.unparse(dataToExport), fileName);
        } else if (format === 'pdf') {
            logAction('Stampa PDF', `Stampato elenco utenti per ditta: ${selectedDitta.ragione_sociale}`);
            exportToPDF(dataToExport, [
                { label: 'Utente', key: 'username' },
                { label: 'Email', key: 'email' },
                { label: 'Ruolo', key: 'ruolo' },
                { label: 'Stato', key: 'stato' }
            ], fileName, selectedDitta);
        }
    };

    const renderUserCard = (user) => {
        const ruolo = ruoli.find(r => r.id === user.id_ruolo);
        return (
            <div key={user.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                        <p className="text-lg font-semibold text-gray-900 truncate">{user.nome} {user.cognome}</p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                    <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
                        user.stato === 'bloccato' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                        {user.stato}
                    </span>
                </div>
                
                <div className="text-sm text-gray-600 mb-4">
                    <span className="font-medium">Ruolo:</span> {ruolo ? ruolo.ruolo : 'N/D'} | 
                    <span className="font-medium ml-2">Livello:</span> {user.livello}
                </div>

                <div className="flex items-center justify-around border-t border-gray-100 pt-3">
                    {hasPermission('UTENTI_EDIT') && (
                        <button onClick={() => handleEditUser(user.id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Modifica">
                            <PencilIcon className="h-5 w-5" />
                        </button>
                    )}
                    {hasPermission('UTENTI_EDIT') && (
                        <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Elimina">
                            <TrashIcon className="h-5 w-5" />
                        </button>
                    )}
                    {hasPermission('ADMIN_USER_PERMISSIONS_MANAGE') && (
                        <button onClick={() => setEditingPermissionsForUser(user)} className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors" title="Permessi">
                            <ShieldCheck size={20} />
                        </button>
                    )}
                    {hasPermission('ADM_PWD_REC') && (
                        <button onClick={() => handleGenerateRecoveryLink(user.id, user.email)} className={`p-2 text-orange-600 hover:bg-orange-50 rounded-md transition-colors ${loadingRecoveryLink ? 'opacity-50 cursor-not-allowed' : ''}`} title="Reset Password" disabled={loadingRecoveryLink}>
                            <KeyIcon className="h-5 w-5" />
                        </button>
                    )}
                    {user.stato === 'bloccato' && hasPermission('ADMIN_UTENTI_SBLOCCA') && (
                        <button onClick={() => handleUnlockUser(user.id)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Sblocca">
                            <LockOpenIcon className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full">
            {user.ruolo === 'Amministratore_sistema' && (
                <div className="px-4 py-3 bg-white border-b border-gray-200">
                    <label htmlFor="ditta-select" className="block text-sm font-medium text-gray-700 mb-1">Seleziona una ditta</label>
                    <select id="ditta-select" value={selectedDittaId} onChange={e => setSelectedDittaId(e.target.value)} className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Seleziona una ditta...</option>
                        {ditte.map(d => <option key={d.id} value={d.id}>{d.ragione_sociale}</option>)}
                    </select>
                </div>
            )}

            {selectedDittaId && (
                <>
                    {/* Header con titolo, ricerca e azioni */}
                    <div className="px-4 py-4 bg-white border-b border-gray-200 space-y-4">
                        {/* Titolo e Ricerca */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                            <h3 className="text-lg font-bold text-gray-900">Elenco Utenti</h3>
                            <div className="relative w-full sm:w-64">
                                <input
                                    type="text"
                                    placeholder="Cerca per nome, email o ruolo..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Azioni */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                            <p className="text-sm text-gray-500">
                                {filteredUsers.length} {filteredUsers.length === 1 ? 'utente trovato' : 'utenti trovati'}
                            </p>
                            <div className="flex items-center gap-2">
                                <div className="sm:hidden">
                                    <button onClick={() => setShowMobileActions(!showMobileActions)} className="flex items-center p-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"> Azioni <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg> </button>
                                    {showMobileActions && (<div className="absolute right-4 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"><div className="py-1"><button onClick={() => { handleExport('csv'); setShowMobileActions(false); }} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"><DocumentArrowDownIcon className="h-5 w-5 mr-2 text-gray-500" />Esporta CSV</button><button onClick={() => { handleExport('pdf'); setShowMobileActions(false); }} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"><PrinterIcon className="h-5 w-5 mr-2 text-gray-500" />Stampa PDF</button></div></div>)}
                                </div>
                                <div className="hidden sm:flex items-center gap-2">
                                    <button onClick={() => handleExport('csv')} title="Esporta CSV" className="p-2 rounded-md hover:bg-slate-200 transition-colors"><DocumentArrowDownIcon className="h-5 w-5 text-slate-600" /></button>
                                    <button onClick={() => handleExport('pdf')} title="Stampa PDF" className="p-2 rounded-md hover:bg-slate-200 transition-colors"><PrinterIcon className="h-5 w-5 text-slate-600" /></button>
                                </div>
                                {hasPermission('UTENTI_CREATE') && (
                                    <button onClick={handleInviteUser} className="flex items-center gap-2 bg-green-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-green-700 transition-colors"><UserPlusIcon className="h-5 w-5" /><span className="hidden sm:inline">Invita Utente</span><span className="sm:hidden">Invita</span></button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Lista Utenti - Card View */}
                    <div className="flex-1 overflow-auto bg-gray-50 p-4">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-32"><div className="text-gray-500">Caricamento...</div></div>
                        ) : filteredUsers.length > 0 ? (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {filteredUsers.map(renderUserCard)}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-500">
                                    {searchTerm ? `Nessun utente corrispondente alla ricerca per "${searchTerm}"` : 'Nessun utente trovato per questa ditta.'}
                                </p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Modali */}
            {isModalOpen && <UserFormModal user={editingUser} onSave={handleSaveUser} onCancel={() => { setIsModalOpen(false); setEditingUser(null); }} ditte={ditte} ruoli={ruoli} selectedDittaId={selectedDittaId} />}
            {editingPermissionsForUser && <GestionePermessiUtenteModal utente={editingPermissionsForUser} onClose={() => setEditingPermissionsForUser(null)} />}
            <InvitaUtenteModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} onInviteSent={handleInviteSuccess} id_ruolo={3} />
            {isRecoveryModalOpen && <ShowLinkModal isOpen={isRecoveryModalOpen} onClose={() => setIsRecoveryModalOpen(false)} title="Link di Recupero Password" link={generatedLink} />}
        </div>
    );
};
// ====================================================================
// Sotto-componente: Associa Moduli Ditta (invariato)
// ====================================================================
const AssociaModuliDitta = () => {
    const [ditte, setDitte] = useState([]);
    const [moduli, setModuli] = useState([]);
    const [selectedDittaId, setSelectedDittaId] = useState('');
    const [moduliAssociati, setModuliAssociati] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [ditteRes, moduliRes] = await Promise.all([
                    api.get('/admin/ditte'),
                    api.get('/admin/moduli')
                ]);
                setDitte(ditteRes.data.ditte);
                setModuli(moduliRes.data.moduli);
            } catch (error) {
                console.error("Errore nel caricamento dati iniziali:", error);
            }
            setIsLoading(false);
        };
        loadData();
    }, []);

    useEffect(() => {
        if (!selectedDittaId) {
            setModuliAssociati([]);
            return;
        }
        const fetchAssociazioni = async () => {
            setIsLoading(true);
            try {
                const response = await api.get(`/admin/associazioni/${selectedDittaId}`);
                setModuliAssociati(response.data.moduli);
            } catch (error) {
                console.error(`Errore recupero associazioni per ditta ${selectedDittaId}:`, error);
            }
            setIsLoading(false);
        };
        fetchAssociazioni();
    }, [selectedDittaId]);

    const handleCheckboxChange = (moduloId) => {
        setModuliAssociati(prev =>
            prev.includes(moduloId)
            ? prev.filter(id => id !== moduloId)
            : [...prev, moduloId]
        );
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.post('/admin/salva-associazioni', { id_ditta: selectedDittaId, moduli: moduliAssociati });
            toast.success('Associazioni salvate con successo!');
        } catch (error) {
            console.error('Errore durante il salvataggio:', error);
            toast.error('Si è verificato un errore durante il salvataggio.');
        }
        setIsSaving(false);
    };

    return (
        <div className="p-4">
            <h3 className="text-lg font-bold mb-4">Associa Moduli alle Ditte</h3>
            {isLoading && <p>Caricamento...</p>}
            <select value={selectedDittaId} onChange={e => setSelectedDittaId(e.target.value)} className="w-full p-2 border rounded mb-4">
                <option value="">Seleziona una ditta...</option>
                {ditte.map(d => <option key={d.id} value={d.id}>{d.ragione_sociale}</option>)}
            </select>

            {selectedDittaId && (
                <div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {moduli.map(modulo => (
                            <label key={modulo.id} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={moduliAssociati.includes(modulo.id)}
                                    onChange={() => handleCheckboxChange(modulo.id)}
                                />
                                <span>{modulo.nome_modulo}</span>
                            </label>
                        ))}
                    </div>
                    <button onClick={handleSave} disabled={isSaving} className="btn-primary">
                        {isSaving ? 'Salvataggio...' : 'Salva Associazioni'}
                    </button>
                </div>
            )}
        </div>
    );
};


// ====================================================================
// Sotto-componente: Gestione Privacy per Ditta (invariato)
// ====================================================================
const PrivacyDittaManager = () => {
    const { user, ditta } = useAuth();
    const [ditte, setDitte] = useState([]);
    const [utentiDitta, setUtentiDitta] = useState([]);
    const [selectedDittaId, setSelectedDittaId] = useState('');
    const [privacyData, setPrivacyData] = useState({ responsabile_trattamento: '', corpo_lettera: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            if (!user) return;
            setIsLoading(true);
            if (user.ruolo === 'Amministratore_sistema') {
                try {
                    const ditteRes = await api.get('/admin/ditte');
                    setDitte(ditteRes.data.ditte);
                } catch (error) { console.error("Errore caricamento ditte:", error); }
            } else {
                setSelectedDittaId(ditta.id);
            }
            setIsLoading(false);
        };
        loadInitialData();
    }, [user, ditta]);

    useEffect(() => {
        const fetchDataForDitta = async () => {
            if (!selectedDittaId) {
                setUtentiDitta([]);
                setPrivacyData({ responsabile_trattamento: '', corpo_lettera: '' });
                return;
            }
            setIsLoading(true);
            try {
                const [utentiRes, privacyRes] = await Promise.all([
                    api.get(`/admin/utenti/ditta/${selectedDittaId}`),
                    api.get(`/admin/privacy-ditta/${selectedDittaId}`)
                ]);
                setUtentiDitta(utentiRes.data.utenti);
                if (privacyRes.data.privacy) {
                    setPrivacyData(privacyRes.data.privacy);
                } else {
                    setPrivacyData({ responsabile_trattamento: '', corpo_lettera: '' });
                }
            } catch (error) {
                console.error(`Errore nel caricamento dei dati per la ditta ${selectedDittaId}`, error);
            }
            setIsLoading(false);
        };
        fetchDataForDitta();
    }, [selectedDittaId]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.post('/admin/privacy-ditta', {
                id_ditta: selectedDittaId,
                ...privacyData
            });
            toast.success('Privacy policy salvata con successo!');
        } catch (error) {
            console.error('Errore durante il salvataggio:', error);
            toast.error('Si è verificato un errore durante il salvataggio.');
        }
        setIsSaving(false);
    };

    const handleQuillChange = (value) => {
        setPrivacyData(prev => ({ ...prev, corpo_lettera: value }));
    };

    const handleSelectChange = (e) => {
        setPrivacyData(prev => ({ ...prev, responsabile_trattamento: e.target.value }));
    };

    if (isLoading && !ditte.length && user?.ruolo === 'Amministratore_sistema') {
        return <p className="p-4">Caricamento ditte...</p>;
    }

    const showForm = (user?.ruolo === 'Amministratore_sistema' && selectedDittaId) || user?.ruolo !== 'Amministratore_sistema';

    return (
        <div className="p-4">
            <h3 className="text-lg font-bold mb-4">Gestione Privacy Policy</h3>

            {user?.ruolo === 'Amministratore_sistema' && (
                <select value={selectedDittaId} onChange={e => setSelectedDittaId(e.target.value)} className="w-full p-2 border rounded mb-4">
                    <option value="">Seleziona una ditta per gestire la privacy...</option>
                    {ditte.map(d => <option key={d.id} value={d.id}>{d.ragione_sociale}</option>)}
                </select>
            )}

            {isLoading && selectedDittaId && <p>Caricamento dati policy...</p>}

            {showForm && !isLoading && (
                <div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Responsabile Trattamento Dati</label>
                        <select
                            value={privacyData.responsabile_trattamento || ''}
                            onChange={handleSelectChange}
                            className="w-full p-2 border rounded"
                        >
                            <option value="">Seleziona un utente</option>
                            {utentiDitta.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Corpo della Policy</label>
                        <ReactQuill
                            theme="snow"
                            value={privacyData.corpo_lettera || ''}
                            onChange={handleQuillChange}
                        />
                    </div>

                    <button onClick={handleSave} disabled={isSaving} className="btn-primary">
                        {isSaving ? 'Salvataggio...' : 'Salva Policy'}
                    </button>
                </div>
            )}
        </div>
    );
};

// ====================================================================
// ++ NUOVO Sotto-componente: Gestione Ditte ++
// ====================================================================
const GestioneDitte = () => {
    const [ditte, setDitte] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchDitte = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/ditte');
            setDitte(response.data.ditte);
        } catch (error) {
            toast.error("Errore nel caricamento delle ditte.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDitte();
    }, [fetchDitte]);

    const handleToggleStato = useCallback(async (ditta) => {
        const nuovoStato = ditta.stato === 'attivo' ? 'sospeso' : 'attivo';
        if (window.confirm(`Sei sicuro di voler impostare lo stato di "${ditta.ragione_sociale}" a "${nuovoStato}"?`)) {
            try {
                await api.patch(`/admin/ditte/${ditta.id}`, { stato: nuovoStato });
                toast.success(`Stato della ditta aggiornato a "${nuovoStato}".`);
                fetchDitte();
            } catch (error) {
                toast.error("Errore durante l'aggiornamento dello stato della ditta.");
                console.error(error);
            }
        }
    }, [fetchDitte]);

    const columns = useMemo(() => [
        { header: 'ID', accessorKey: 'id', size: 90 },
        { header: 'Ragione Sociale', accessorKey: 'ragione_sociale', size: 300 },
        { header: 'P.IVA', accessorKey: 'p_iva', size: 150 },
        {
            header: 'Stato',
            accessorKey: 'stato',
            size: 120,
            cell: info => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${info.getValue() === 'attivo' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {info.getValue()}
                </span>
            ),
        },
        { header: 'Tipo', accessorKey: 'tipo_ditta_nome', size: 150 },
        {
            id: 'actions',
            header: 'Azioni',
            cell: ({ row }) => (
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleToggleStato(row.original)}
                        className={`p-1 rounded ${row.original.stato === 'attivo' ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}`}
                        title={row.original.stato === 'attivo' ? 'Sospendi Ditta' : 'Attiva Ditta'}
                    >
                        {/* Semplice icona per il toggle */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                    </button>
                    {/* Altre azioni come modifica in futuro */}
                </div>
            )
        }
    ], [handleToggleStato]);

    return (
        <AdvancedDataGrid
            title="Elenco Ditte"
            columns={columns}
            data={ditte}
            isLoading={loading}
            onRefresh={fetchDitte}
            canAdd={true}
            onAddClick={() => toast.info("Modale per creare ditta in sviluppo.")}
        />
    );
};

/*
 * #####################################################################
 * # Componente MonitoraggioSistema - v2.0 (Versione Responsive Ottimizzata)
 * # File: opero-frontend/src/components/admin/MonitoraggioSistema.js
 * # Modifiche principali:
 * # - Aggiunto menu a tendina per dispositivi mobili
 * # - Ottimizzata la visualizzazione per schermi piccoli
 * # - Aggiunta funzionalità di ricerca per ogni tabella
 * # - Migliorata la responsività delle tabelle
 * #####################################################################
 */

const MonitoraggioSistema = () => {
    const { hasPermission } = useAuth();
    const [subTab, setSubTab] = useState('log_azioni');
    const [logAzioni, setLogAzioni] = useState([]);
    const [logAccessi, setLogAccessi] = useState([]);
    const [sessioniAttive, setSessioniAttive] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Stati per la ricerca
    const [searchLogAzioni, setSearchLogAzioni] = useState('');
    const [searchLogAccessi, setSearchLogAccessi] = useState('');
    const [searchSessioni, setSearchSessioni] = useState('');
    
    // Stato per il menu mobile
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const fetchLogAzioni = useCallback(async () => {
        if (!hasPermission('ADMIN_LOGS_VIEW')) return;
        setLoading(true);
        try {
            const response = await api.get('/admin/logs/azioni');
            setLogAzioni(response.data.data || []);
        } catch (error) { 
            toast.error("Errore caricamento log azioni."); 
            console.error("Errore nel caricamento dei log azioni:", error);
        }
        finally { setLoading(false); }
    }, [hasPermission]);

    const fetchLogAccessi = useCallback(async () => {
        if (!hasPermission('ADMIN_LOGS_VIEW')) return;
        setLoading(true);
        try {
            const response = await api.get('/admin/logs/accessi');
            setLogAccessi(response.data.data || []);
        } catch (error) { 
            toast.error("Errore caricamento log accessi."); 
            console.error("Errore nel caricamento dei log accessi:", error);
        }
        finally { setLoading(false); }
    }, [hasPermission]);

    const fetchSessioniAttive = useCallback(async () => {
        if (!hasPermission('ADMIN_SESSIONS_VIEW')) return;
        setLoading(true);
        try {
            const response = await api.get('/admin/logs/sessioni-attive');
            setSessioniAttive(response.data.data || []);
        } catch (error) { 
            toast.error("Errore caricamento sessioni."); 
            console.error("Errore nel caricamento delle sessioni attive:", error);
        }
        finally { setLoading(false); }
    }, [hasPermission]);

    useEffect(() => {
        if (subTab === 'log_azioni') fetchLogAzioni();
        if (subTab === 'log_accessi') fetchLogAccessi();
        if (subTab === 'sessioni') fetchSessioniAttive();
    }, [subTab, fetchLogAzioni, fetchLogAccessi, fetchSessioniAttive]);

    // Filtri per la ricerca
    const filteredLogAzioni = useMemo(() => {
        if (!searchLogAzioni) return logAzioni;
        const lowerCaseTerm = searchLogAzioni.toLowerCase();
        return logAzioni.filter(log => 
            log.email?.toLowerCase().includes(lowerCaseTerm) ||
            log.ragione_sociale?.toLowerCase().includes(lowerCaseTerm) ||
            log.azione?.toLowerCase().includes(lowerCaseTerm) ||
            log.dettagli?.toLowerCase().includes(lowerCaseTerm)
        );
    }, [logAzioni, searchLogAzioni]);

    const filteredLogAccessi = useMemo(() => {
        if (!searchLogAccessi) return logAccessi;
        const lowerCaseTerm = searchLogAccessi.toLowerCase();
        return logAccessi.filter(log => 
            log.email?.toLowerCase().includes(lowerCaseTerm) ||
            log.indirizzo_ip?.toLowerCase().includes(lowerCaseTerm) ||
            log.dettagli_azione?.toLowerCase().includes(lowerCaseTerm)
        );
    }, [logAccessi, searchLogAccessi]);

    const filteredSessioni = useMemo(() => {
        if (!searchSessioni) return sessioniAttive;
        const lowerCaseTerm = searchSessioni.toLowerCase();
        return sessioniAttive.filter(sessione => 
            sessione.email?.toLowerCase().includes(lowerCaseTerm) ||
            sessione.nome?.toLowerCase().includes(lowerCaseTerm) ||
            sessione.cognome?.toLowerCase().includes(lowerCaseTerm) ||
            sessione.ditta_attiva?.toLowerCase().includes(lowerCaseTerm)
        );
    }, [sessioniAttive, searchSessioni]);

    // Definizione delle colonne con ottimizzazioni per mobile
    const logAzioniColumns = useMemo(() => [
        { 
            header: 'ID', 
            accessorKey: 'id', 
            size: 90,
            meta: { hideOnMobile: true }
        },
        { 
            header: 'Data/Ora', 
            accessorKey: 'timestamp', 
            cell: info => new Date(info.getValue()).toLocaleString('it-IT'),
            meta: { hideOnMobile: true }
        },
        { header: 'Utente', accessorKey: 'email' },
        { header: 'Ditta', accessorKey: 'ragione_sociale', meta: { hideOnMobile: true } },
        { header: 'Azione', accessorKey: 'azione' },
        { 
            header: 'Dettagli', 
            accessorKey: 'dettagli', 
            size: 400,
            meta: { hideOnMobile: true }
        },
    ], []);

    const logAccessiColumns = useMemo(() => [
        { 
            header: 'ID', 
            accessorKey: 'id', 
            size: 90,
            meta: { hideOnMobile: true }
        },
        { 
            header: 'Data/Ora', 
            accessorKey: 'data_ora_accesso', 
            cell: info => new Date(info.getValue()).toLocaleString('it-IT'),
            meta: { hideOnMobile: true }
        },
        { header: 'Utente', accessorKey: 'email' },
        { header: 'Indirizzo IP', accessorKey: 'indirizzo_ip', meta: { hideOnMobile: true } },
        { header: 'Esito', accessorKey: 'dettagli_azione' },
    ], []);

    const sessioniColumns = useMemo(() => [
        { header: 'Utente', accessorKey: 'email' },
        { header: 'Nome', accessorKey: 'nome', meta: { hideOnMobile: true } },
        { header: 'Cognome', accessorKey: 'cognome', meta: { hideOnMobile: true } },
        { header: 'Ditta Attiva', accessorKey: 'ditta_attiva', meta: { hideOnMobile: true } },
        { 
            header: 'Login', 
            accessorKey: 'login_timestamp', 
            cell: info => new Date(info.getValue()).toLocaleString('it-IT'),
            meta: { hideOnMobile: true }
        },
        { 
            header: 'Ultima Attività', 
            accessorKey: 'last_heartbeat_timestamp', 
            cell: info => new Date(info.getValue()).toLocaleString('it-IT'),
            meta: { hideOnMobile: true }
        },
    ], []);

    // Componente per il menu mobile
    const MobileMenu = () => (
        <div className="lg:hidden">
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex items-center justify-between w-full p-4 bg-white border-b border-gray-200 text-left"
            >
                <span className="font-medium text-gray-900">
                    {subTab === 'log_azioni' && 'Log Azioni'}
                    {subTab === 'log_accessi' && 'Log Accessi'}
                    {subTab === 'sessioni' && 'Sessioni Attive'}
                </span>
                {isMobileMenuOpen ? (
                    <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                )}
            </button>
            
            {isMobileMenuOpen && (
                <div className="bg-white border-b border-gray-200 shadow-lg">
                    <nav className="py-2">
                        {hasPermission('ADMIN_LOGS_VIEW') && (
                            <button
                                onClick={() => {
                                    setSubTab('log_azioni');
                                    setIsMobileMenuOpen(false);
                                }}
                                className={`block w-full text-left px-4 py-3 text-sm ${
                                    subTab === 'log_azioni'
                                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                                        : 'text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                Log Azioni
                            </button>
                        )}
                        {hasPermission('ADMIN_LOGS_VIEW') && (
                            <button
                                onClick={() => {
                                    setSubTab('log_accessi');
                                    setIsMobileMenuOpen(false);
                                }}
                                className={`block w-full text-left px-4 py-3 text-sm ${
                                    subTab === 'log_accessi'
                                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                                        : 'text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                Log Accessi
                            </button>
                        )}
                        {hasPermission('ADMIN_SESSIONS_VIEW') && (
                            <button
                                onClick={() => {
                                    setSubTab('sessioni');
                                    setIsMobileMenuOpen(false);
                                }}
                                className={`block w-full text-left px-4 py-3 text-sm ${
                                    subTab === 'sessioni'
                                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                                        : 'text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                Sessioni Attive
                            </button>
                        )}
                    </nav>
                </div>
            )}
        </div>
    );

    // Componente per la barra di ricerca
    const SearchBar = ({ searchTerm, setSearchTerm, placeholder }) => (
        <div className="relative w-full md:w-64 mb-4">
            <input
                type="text"
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
            </div>
            {searchTerm && (
                <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            )}
        </div>
    );

    return (
        <div className="flex flex-col h-full">
            {/* Menu mobile per schermi piccoli */}
            <MobileMenu />

            {/* Navigazione Tabs per schermi grandi */}
            <div className="hidden lg:block bg-white border-b border-gray-200">
                <div className="px-6">
                    <nav className="flex space-x-8" aria-label="Tabs">
                        {hasPermission('ADMIN_LOGS_VIEW') && (
                            <button
                                onClick={() => setSubTab('log_azioni')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    subTab === 'log_azioni'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                                aria-current={subTab === 'log_azioni' ? 'page' : undefined}
                            >
                                Log Azioni
                            </button>
                        )}
                        {hasPermission('ADMIN_LOGS_VIEW') && (
                            <button
                                onClick={() => setSubTab('log_accessi')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    subTab === 'log_accessi'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                                aria-current={subTab === 'log_accessi' ? 'page' : undefined}
                            >
                                Log Accessi
                            </button>
                        )}
                        {hasPermission('ADMIN_SESSIONS_VIEW') && (
                            <button
                                onClick={() => setSubTab('sessioni')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    subTab === 'sessioni'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                                aria-current={subTab === 'sessioni' ? 'page' : undefined}
                            >
                                Sessioni Attive
                            </button>
                        )}
                    </nav>
                </div>
            </div>

            {/* Contenuto principale */}
            <div className="flex-1 overflow-auto bg-gray-50 p-4">
                {/* Log Azioni */}
                {subTab === 'log_azioni' && hasPermission('ADMIN_LOGS_VIEW') && (
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 md:mb-0">Log delle Azioni</h3>
                            <div className="flex items-center gap-2">
                                <SearchBar 
                                    searchTerm={searchLogAzioni} 
                                    setSearchTerm={setSearchLogAzioni} 
                                    placeholder="Cerca nei log azioni..." 
                                />
                                <button 
                                    onClick={fetchLogAzioni} 
                                    className="p-2 rounded-md hover:bg-slate-200 transition-colors"
                                    title="Aggiorna"
                                >
                                    <svg className="h-5 w-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="text-sm text-gray-500 mb-2">
                            {filteredLogAzioni.length} {filteredLogAzioni.length === 1 ? 'risultato trovato' : 'risultati trovati'}
                        </div>
                        <AdvancedDataGrid 
                            columns={logAzioniColumns} 
                            data={filteredLogAzioni} 
                            isLoading={loading} 
                            responsive={true}
                        />
                    </div>
                )}

                {/* Log Accessi */}
                {subTab === 'log_accessi' && hasPermission('ADMIN_LOGS_VIEW') && (
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 md:mb-0">Log degli Accessi</h3>
                            <div className="flex items-center gap-2">
                                <SearchBar 
                                    searchTerm={searchLogAccessi} 
                                    setSearchTerm={setSearchLogAccessi} 
                                    placeholder="Cerca nei log accessi..." 
                                />
                                <button 
                                    onClick={fetchLogAccessi} 
                                    className="p-2 rounded-md hover:bg-slate-200 transition-colors"
                                    title="Aggiorna"
                                >
                                    <svg className="h-5 w-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="text-sm text-gray-500 mb-2">
                            {filteredLogAccessi.length} {filteredLogAccessi.length === 1 ? 'risultato trovato' : 'risultati trovati'}
                        </div>
                        <AdvancedDataGrid 
                            columns={logAccessiColumns} 
                            data={filteredLogAccessi} 
                            isLoading={loading} 
                            responsive={true}
                        />
                    </div>
                )}

                {/* Sessioni Attive */}
                {subTab === 'sessioni' && hasPermission('ADMIN_SESSIONS_VIEW') && (
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 md:mb-0">Sessioni Utente Attive</h3>
                            <div className="flex items-center gap-2">
                                <SearchBar 
                                    searchTerm={searchSessioni} 
                                    setSearchTerm={setSearchSessioni} 
                                    placeholder="Cerca nelle sessioni..." 
                                />
                                <button 
                                    onClick={fetchSessioniAttive} 
                                    className="p-2 rounded-md hover:bg-slate-200 transition-colors"
                                    title="Aggiorna"
                                >
                                    <svg className="h-5 w-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="text-sm text-gray-500 mb-2">
                            {filteredSessioni.length} {filteredSessioni.length === 1 ? 'risultato trovato' : 'risultati trovati'}
                        </div>
                        <AdvancedDataGrid 
                            columns={sessioniColumns} 
                            data={filteredSessioni} 
                            isLoading={loading} 
                            responsive={true}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

// Componente MenuMobile per la navigazione su schermi piccoli
const MenuMobile = ({ tabs, activeTab, setActiveTab, isOpen, setIsOpen }) => {
    return (
        <div className="lg:hidden">
            {/* Pulsante per aprire/chiudere il menu mobile */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full p-4 bg-white border-b border-gray-200 text-left"
            >
                <span className="font-medium text-gray-900">
                    {tabs.find(tab => tab.key === activeTab)?.label || 'Menu'}
                </span>
                {isOpen ? (
                    <XMarkIcon className="h-5 w-5 text-gray-500" />
                ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                )}
            </button>
            
            {/* Menu a tendina */}
            {isOpen && (
                <div className="bg-white border-b border-gray-200 shadow-lg">
                    <nav className="py-2">
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => {
                                    setActiveTab(tab.key);
                                    setIsOpen(false);
                                }}
                                className={`block w-full text-left px-4 py-3 text-sm ${
                                    activeTab === tab.key
                                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                                        : 'text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            )}
        </div>
    );
};

// ====================================================================
// COMPONENTE PRINCIPALE AdminPanel (Container delle Tabs) - VERSIONE RESPONSIVE
// ====================================================================
function AdminPanel() {
    const { hasPermission } = useAuth();
    const [activeTab, setActiveTab] = useState('utenti');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Definiamo le tab e i componenti che devono renderizzare
    const TABS = useMemo(() => ([
        {
            key: 'utenti',
            label: 'Gestione Utenti',
            component: <GestioneUtenti />,
            permission: ['UTENTI_VIEW', 'ADMIN_USERS_VIEW', 'ADMIN_USER_PERMISSIONS_MANAGE', 'ADMIN_UTENTI_SBLOCCA']
        },
        {
            key: 'ditte',
            label: 'Gestione Ditte',
            component: <GestioneDitte />,
            permission: 'ADMIN_DITTE_VIEW'
        },
        {
            key: 'moduli',
            label: 'Associa Moduli Ditta',
            component: <AssociaModuliDitta />,
            permission: 'SUPER_ADMIN'
        },
        {
            key: 'privacy',
            label: 'Gestione Privacy',
            component: <PrivacyDittaManager />,
            permission: 'PRIVACY_MANAGE'
        },
        {
            key: 'funzioni',
            label: 'Funzioni Applicative',
            component: <GestioneFunzioni />,
            permission: 'ADMIN_FUNZIONI_VIEW'
        },
        {
            key: 'ruoli',
            label: 'Ruoli e Permessi',
            component: <GestioneRuoliPermessi />,
            permission: 'ADMIN_RUOLI_VIEW'
        },
        {
            key: 'test',
            label: 'test',
            component: <DmsTestTab />,
            permission: 'ADMIN_RUOLI_VIEW'
        },
        {
            key: 'monitoraggio',
            label: 'Monitoraggio Sistema',
            component: <MonitoraggioSistema />,
            permission: ['ADMIN_LOGS_VIEW', 'ADMIN_SESSIONS_VIEW']
        },
    ]), []);

    // Filtra le tab in base ai permessi
    const visibleTabs = useMemo(() => {
        return TABS.filter(tab => {
            if (!tab.permission) return true;
            
            if (Array.isArray(tab.permission)) {
                return tab.permission.some(p => hasPermission(p));
            } else {
                return hasPermission(tab.permission);
            }
        });
    }, [TABS, hasPermission]);

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Header con titolo - visibile su tutti i dispositivi */}
            <div className="px-4 py-6 bg-white border-b border-gray-200 shadow-sm">
                <h1 className="text-2xl font-bold text-gray-900">Pannello Amministrazione</h1>
            </div>

            {/* Menu mobile per schermi piccoli */}
            <MenuMobile 
                tabs={visibleTabs} 
                activeTab={activeTab} 
                setActiveTab={setActiveTab}
                isOpen={isMobileMenuOpen}
                setIsOpen={setIsMobileMenuOpen}
            />

            {/* Navigazione Tabs per schermi grandi */}
            <div className="hidden lg:block bg-white border-b border-gray-200">
                <div className="px-6">
                    <nav className="flex space-x-8" aria-label="Tabs">
                        {visibleTabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === tab.key
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                                aria-current={activeTab === tab.key ? 'page' : undefined}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Contenuto principale */}
            <div className="flex-1 overflow-auto">
                <div className="py-6 px-4 sm:px-6 lg:px-8">
                    {visibleTabs.find(tab => tab.key === activeTab)?.component || 
                        <div className="text-center py-12">
                            <p className="text-gray-500">Seleziona una scheda per visualizzare il contenuto.</p>
                        </div>
                    }
                </div>
            </div>
        </div>
    );
}
export default AdminPanel;

