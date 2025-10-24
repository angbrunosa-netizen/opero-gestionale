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
import { PencilIcon, TrashIcon, DocumentArrowDownIcon, PrinterIcon, PlusIcon, LockOpenIcon ,UserPlusIcon, KeyIcon } from '@heroicons/react/24/outline';
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
const UserFormModal = ({ user, onSave, onCancel, ruoli, selectedDittaId }) => {
    const { user: currentUser } = useAuth();
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});

    useEffect(() => {
        // --- MODIFICA: Aggiungi 'id_ditta' allo stato del form ---
        setFormData({
            id: user.id,
            nome: user.nome || '',
            cognome: user.cognome || '',
            email: user.email || '',
            id_ruolo: user.id_ruolo || '',
            livello: user.livello || '',
            Codice_Tipo_Utente: user.Codice_Tipo_Utente || '',
            stato: user.stato || 'attivo',
            id_ditta: user.id_ditta || selectedDittaId, // <--- AGGIUNTA QUI
        });
    }, [user, selectedDittaId]); // Aggiungi selectedDittaId alle dipendenze

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.nome) newErrors.nome = 'Il nome è obbligatorio.';
        if (!formData.cognome) newErrors.cognome = 'Il cognome è obbligatorio.';
        if (!formData.id_ruolo) newErrors.id_ruolo = 'Il ruolo è obbligatorio.';
        const livelloNum = parseInt(formData.livello, 10);
        if (isNaN(livelloNum) || livelloNum < 1 || livelloNum > 80) {
            newErrors.livello = 'Il livello deve essere un numero tra 1 e 80.';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSave(formData);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-lg font-bold mb-4">Modifica Dati Utente</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* --- MODIFICA: Aggiungi un campo nascosto per id_ditta --- */}
                    <input type="hidden" name="id_ditta" value={formData.id_ditta} />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome</label>
                            <input type="text" id="nome" name="nome" value={formData.nome} onChange={handleChange} className="mt-1 p-2 border rounded w-full" />
                            {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
                        </div>
                        <div>
                            <label htmlFor="cognome" className="block text-sm font-medium text-gray-700">Cognome</label>
                            <input type="text" id="cognome" name="cognome" value={formData.cognome} onChange={handleChange} className="mt-1 p-2 border rounded w-full" />
                            {errors.cognome && <p className="text-red-500 text-xs mt-1">{errors.cognome}</p>}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" id="email" name="email" value={formData.email} readOnly className="mt-1 p-2 border rounded w-full bg-gray-100 cursor-not-allowed" />
                    </div>

                    <div>
                        <label htmlFor="livello" className="block text-sm font-medium text-gray-700">Livello (1-80)</label>
                        <input 
                            type="number" 
                            id="livello" 
                            name="livello" 
                            value={formData.livello} 
                            onChange={handleChange} 
                            min="1" 
                            max="80"
                            className="mt-1 p-2 border rounded w-full" 
                        />
                        {errors.livello && <p className="text-red-500 text-xs mt-1">{errors.livello}</p>}
                    </div>

                    <div>
                        <label htmlFor="stato" className="block text-sm font-medium text-gray-700">Stato</label>
                        <select id="stato" name="stato" value={formData.stato} onChange={handleChange} className="mt-1 p-2 border rounded w-full">
                            <option value="attivo">Attivo</option>
                            <option value="bloccato">Bloccato</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="Codice_Tipo_Utente" className="block text-sm font-medium text-gray-700">Codice Tipo Utente</label>
                        <input type="text" id="Codice_Tipo_Utente" name="Codice_Tipo_Utente" value={formData.Codice_Tipo_Utente} onChange={handleChange} className="mt-1 p-2 border rounded w-full" />
                    </div>

                    <div>
                        <label htmlFor="id_ruolo" className="block text-sm font-medium text-gray-700">Ruolo</label>
                        <select id="id_ruolo" name="id_ruolo" value={formData.id_ruolo} onChange={handleChange} className="mt-1 p-2 border rounded w-full">
                            <option value="">Seleziona Ruolo</option>
                            {ruoli.map(r => <option key={r.id} value={r.id}>{r.ruolo}</option>)}
                        </select>
                        {errors.id_ruolo && <p className="text-red-500 text-xs mt-1">{errors.id_ruolo}</p>}
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={onCancel} className="btn-secondary">Annulla</button>
                        <button type="submit" className="btn-primary">Salva</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ====================================================================
// Sotto-componente: Gestione Utenti (MODIFICATO per includere invito, recupero PW e gestione livelli)
// ====================================================================
const GestioneUtenti = () => {
    const { user, ditta, hasPermission } = useAuth();
    const [ditte, setDitte] = useState([]);
    const [utenti, setUtenti] = useState([]);
    const [ruoli, setRuoli] = useState([]);
    const [selectedDittaId, setSelectedDittaId] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [editingPermissionsForUser, setEditingPermissionsForUser] = useState(null);

    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    // --- MODIFICA: Stati per il nuovo modale ---
    const [loadingRecoveryLink, setLoadingRecoveryLink] = useState(false);
    const [generatedLink, setGeneratedLink] = useState('');
    const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);

    const logAction = useCallback(async (azione, dettagli = '') => {
        try {
            await api.post('/track/azione', {
                azione,
                dettagli,
                modulo: 'Admin',
                funzione: 'Gestione Utenti'
            });
        } catch (error) {
            console.error("Errore during la registrazione dell'azione:", error);
        }
    }, []);

    const fetchUtentiForDitta = useCallback(async (dittaId) => {
        if (!dittaId) {
            setUtenti([]);
            return;
        }
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

    const handleInviteUser = () => {
        setIsInviteModalOpen(true);
    };

    const handleInviteSuccess = () => {
        setIsInviteModalOpen(false);
        toast.info("Invito inviato. L'elenco utenti si aggiornerà quando l'utente completerà la registrazione.");
    };

    const handleEditUser = useCallback(async (userId) => {
        try {
            const response = await api.get(`/admin/utenti/${userId}`);
            setEditingUser(response.data.utente);
            setIsModalOpen(true);
        } catch (error) {
            console.error(`Errore nel caricamento dei dati dell'utente ${userId}:`, error);
        }
    }, []);

    const handleDeleteUser = useCallback(async (userId) => {
        if (window.confirm('Sei sicuro di voler eliminare questo utente?')) {
            try {
                const userToDelete = utenti.find(u => u.id === userId);
                await api.delete(`/admin/utenti/${userId}`);
                if (userToDelete) {
                    logAction('Eliminazione utente', `Utente: ${userToDelete.email} (ID: ${userId})`);
                }
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
                console.error(error);
            }
        }
    }, [selectedDittaId, fetchUtentiForDitta, logAction]);

    // --- MODIFICA: Aggiornata funzione per aprire il modale ---
    const handleGenerateRecoveryLink = useCallback(async (userId, userEmail) => {
        if (!hasPermission('ADM_PWD_REC')) {
            toast.warn('Non hai i permessi necessari per eseguire questa operazione.');
            return;
        }
        if (!window.confirm(`Sei sicuro di voler generare un nuovo link di recupero password per l'utente ${userEmail}? Il link precedente (se esistente) verrà invalidato e questo sarà valido per 1 ora.`)) {
            return;
        }
        setLoadingRecoveryLink(true);
        try {
            const response = await api.post(`/admin/utenti/${userId}/generate-recovery-link`);
            if (response.data.success && response.data.recoveryLink) {
                // --- APRI IL MODALE ---
                setGeneratedLink(response.data.recoveryLink);
                setIsRecoveryModalOpen(true);
                toast.success('Link di recupero generato!');
            } else {
                 toast.error(response.data.message || 'Errore imprevisto nella generazione del link.');
            }
        } catch (err) {
            console.error("Errore API /generate-recovery-link:", err);
            toast.error(err.response?.data?.message || 'Errore during la comunicazione con il server.');
        } finally {
             setLoadingRecoveryLink(false);
        }
    }, [hasPermission]); // Aggiunta dipendenza hasPermission

    const handleSaveUser = async (userData) => {
        try {
            await api.put('/admin/utenti/${id}', userData);
            const actionType = userData.id ? 'Modifica' : 'Creazione';
            const dittaName = ditte.find(d => d.id === parseInt(userData.id_ditta, 10))?.ragione_sociale || userData.id_ditta;
            logAction(`${actionType} utente`, `Utente: ${userData.email}, Ditta: ${dittaName}`);

            setIsModalOpen(false);
            setEditingUser(null);
            fetchUtentiForDitta(selectedDittaId);
            toast.success(`Utente ${actionType === 'Modifica' ? 'modificato' : 'creato'} con successo.`);
        } catch (error) {
            console.error('Errore during il salvataggio dell\'utente:', error);
            toast.error(error.response?.data?.message || "Errore during salvataggio.");
        }
    };

    const handleExport = (format) => {
        const selectedDitta = ditte.find(d => d.id === parseInt(selectedDittaId, 10));
        if (!selectedDitta) {
            toast.warn("Seleziona una ditta prima di esportare.");
            return;
        }

        const columnsToExport = [
            { label: 'Username', key: 'username' },
            { label: 'Email', key: 'email' },
            { label: 'Ruolo', key: 'ruolo' }
        ];

        const dataToExport = utenti.map(u => ({
            username: u.username,
            email: u.email,
            ruolo: ruoli.find(r => r.id === u.id_ruolo)?.ruolo || 'N/D'
        }));

        const fileName = `elenco_utenti_${selectedDitta.ragione_sociale.replace(/\s/g, '_')}`;

        if (format === 'csv') {
            logAction('Export CSV', `Esportato elenco utenti per ditta: ${selectedDitta.ragione_sociale}`);
            const csvData = [
                columnsToExport.map(col => col.label),
                ...dataToExport.map(row => columnsToExport.map(col => row[col.key]))
            ];
            exportToCSV(csvData, fileName);
        } else if (format === 'pdf') {
            logAction('Stampa PDF', `Stampato elenco utenti per ditta: ${selectedDitta.ragione_sociale}`);
            exportToPDF(dataToExport, columnsToExport, fileName, selectedDitta);
        }
    };

    // --- Definizione 'columns' ---
    const columns = useMemo(() => [
        { header: 'Username', accessorKey: 'username' },
        { header: 'Email', accessorKey: 'email' },
        {
            header: 'Ruolo',
            accessorKey: 'id_ruolo',
            cell: info => {
                const ruolo = ruoli.find(r => r.id === info.getValue());
                return ruolo ? ruolo.ruolo : 'N/D';
            }
        },
        {
            header: 'Stato',
            accessorKey: 'stato',
            cell: info => (
                info.getValue() === 'bloccato' ?
                <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">Bloccato</span> :
                <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Attivo</span>
            ),
        },
        {
            id: 'actions',
            header: 'Azioni',
            cell: (info) => ( // 'info' è il 'params' corretto per tanstack-table
                <div className="flex space-x-2">
                    {hasPermission('UTENTI_EDIT') && <button
                     onClick={() => handleEditUser(info.row.original.id)} 
                     className="text-blue-600 hover:text-blue-800"
                     title="modifica dati utente"   
                     >
                        <PencilIcon className="h-5 w-5" /></button>}
                   
                    {hasPermission('UTENTI_EDIT') && <button onClick={() => handleDeleteUser(info.row.original.id)} className="text-red-600 hover:text-red-800"><TrashIcon className="h-5 w-5" /></button>}

                    {hasPermission('ADMIN_USER_PERMISSIONS_MANAGE') && (
                        <button
                            onClick={() => setEditingPermissionsForUser(info.row.original)}
                            className="p-1 text-gray-500 hover:text-green-600"
                            title="Gestisci permessi personalizzati"
                        >
                            <ShieldCheck size={18} />
                        </button>
                    )}

                    {/* --- MODIFICA: Pulsante Recupero Password --- */}
                    {hasPermission('ADM_PWD_REC') && (
                         <button
                            onClick={() => handleGenerateRecoveryLink(info.row.original.id, info.row.original.email)}
                            className={`p-1 text-orange-600 hover:text-orange-800 focus:outline-none ${loadingRecoveryLink ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="Genera Link Recupero Password"
                            disabled={loadingRecoveryLink}
                        >
                            <KeyIcon className="h-5 w-5" />
                        </button>
                    )}
                    {/* --- FINE MODIFICA --- */}

                    {info.row.original.stato === 'bloccato' && hasPermission('ADMIN_UTENTI_SBLOCCA') && (
                        <button
                            onClick={() => handleUnlockUser(info.row.original.id)}
                            className="p-1 text-gray-500 hover:text-blue-600"
                            title="Sblocca utente"
                        >
                            <LockOpenIcon className="h-5 w-5" />
                        </button>
                    )}
                </div>
            ),
        },
    // --- MODIFICA: Aggiunte dipendenze ---
    ], [ruoli, hasPermission, handleEditUser, handleDeleteUser, handleUnlockUser, loadingRecoveryLink, handleGenerateRecoveryLink, setEditingPermissionsForUser]);

    return (
        <div className="p-4">
            {user.ruolo === 'Amministratore_sistema' && (
                <select value={selectedDittaId} onChange={e => setSelectedDittaId(e.target.value)} className="w-full p-2 border rounded mb-4">
                    <option value="">Seleziona una ditta...</option>
                    {ditte.map(d => <option key={d.id} value={d.id}>{d.ragione_sociale}</option>)}
                </select>
            )}
            {selectedDittaId && (
                <>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">Elenco Utenti</h3>
                        <div className="flex items-center gap-2">
                            <button onClick={() => handleExport('csv')} title="Esporta CSV" className="p-2 rounded-md hover:bg-slate-200 transition-colors">
                                <DocumentArrowDownIcon className="h-5 w-5 text-slate-600" />
                            </button>
                            <button onClick={() => handleExport('pdf')} title="Stampa PDF" className="p-2 rounded-md hover:bg-slate-200 transition-colors">
                                <PrinterIcon className="h-5 w-5 text-slate-600" />
                            </button>
                            {hasPermission('UTENTI_CREATE') && (
                                <button onClick={handleInviteUser} className="flex items-center gap-2 bg-green-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                                    <UserPlusIcon className="h-5 w-5" />
                                    <span>Invita Utente</span>
                                </button>
                            )}
                        </div>
                    </div>
                    <AdvancedDataGrid columns={columns} data={utenti} isLoading={isLoading} />

                    {/* --- 2. INSERIMENTO NUOVO COMPONENTE --- */}
                    {hasPermission('AM_UTE_LVL') && (
                        <GestioneLivelliUtente />
                    )}
                </>
            )}
            {isModalOpen && <UserFormModal user={editingUser} onSave={handleSaveUser} onCancel={() => { setIsModalOpen(false); setEditingUser(null); }} ditte={ditte} ruoli={ruoli} selectedDittaId={selectedDittaId} />}

            {editingPermissionsForUser && (
                <GestionePermessiUtenteModal
                    utente={editingPermissionsForUser}
                    onClose={() => setEditingPermissionsForUser(null)}
                />
            )}

            <InvitaUtenteModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onInviteSent={handleInviteSuccess}
                id_ruolo={3} // Invita come "Utente Esterno"
            />

            {/* --- MODIFICA: Aggiunta del modale per mostrare il link --- */}
            {isRecoveryModalOpen && (
                <ShowLinkModal
                    isOpen={isRecoveryModalOpen}
                    onClose={() => setIsRecoveryModalOpen(false)}
                    title="Link di Recupero Password"
                    link={generatedLink}
                />
            )}
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

// ====================================================================
// ++ NUOVO Sotto-componente: Monitoraggio Sistema ++
// ====================================================================
const MonitoraggioSistema = () => {
    const { hasPermission } = useAuth();
    const [subTab, setSubTab] = useState('log_azioni');
    const [logAzioni, setLogAzioni] = useState([]);
    const [logAccessi, setLogAccessi] = useState([]);
    const [sessioniAttive, setSessioniAttive] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchLogAzioni = useCallback(async () => {
        if (!hasPermission('ADMIN_LOGS_VIEW')) return;
        setLoading(true);
        try {
            const response = await api.get('/admin/logs/azioni');
            setLogAzioni(response.data.data);
        } catch (error) { toast.error("Errore caricamento log azioni."); }
        finally { setLoading(false); }
    }, [hasPermission]);

    const fetchLogAccessi = useCallback(async () => {
        if (!hasPermission('ADMIN_LOGS_VIEW')) return;
        setLoading(true);
        try {
            const response = await api.get('/admin/logs/accessi');
            setLogAccessi(response.data.data);
        } catch (error) { toast.error("Errore caricamento log accessi."); }
        finally { setLoading(false); }
    }, [hasPermission]);

    const fetchSessioniAttive = useCallback(async () => {
        if (!hasPermission('ADMIN_SESSIONS_VIEW')) return;
        setLoading(true);
        try {
            const response = await api.get('/admin/logs/sessioni-attive');
            setSessioniAttive(response.data.data);
        } catch (error) { toast.error("Errore caricamento sessioni."); }
        finally { setLoading(false); }
    }, [hasPermission]);

    useEffect(() => {
        if (subTab === 'log_azioni') fetchLogAzioni();
        if (subTab === 'log_accessi') fetchLogAccessi();
        if (subTab === 'sessioni') fetchSessioniAttive();
    }, [subTab, fetchLogAzioni, fetchLogAccessi, fetchSessioniAttive]);

    const logAzioniColumns = useMemo(() => [
        { header: 'ID', accessorKey: 'id', size: 90 },
        { header: 'Data/Ora', accessorKey: 'timestamp', cell: info => new Date(info.getValue()).toLocaleString('it-IT') },
        { header: 'Utente', accessorKey: 'email' },
        { header: 'Ditta', accessorKey: 'ragione_sociale' },
        { header: 'Azione', accessorKey: 'azione' },
        { header: 'Dettagli', accessorKey: 'dettagli', size: 400 },
    ], []);

    const logAccessiColumns = useMemo(() => [
        { header: 'ID', accessorKey: 'id', size: 90 },
        { header: 'Data/Ora', accessorKey: 'data_ora_accesso', cell: info => new Date(info.getValue()).toLocaleString('it-IT') },
        { header: 'Utente', accessorKey: 'email' },
        { header: 'Indirizzo IP', accessorKey: 'indirizzo_ip' },
        { header: 'Esito', accessorKey: 'dettagli_azione' },
    ], []);

    const sessioniColumns = useMemo(() => [
        { header: 'Utente', accessorKey: 'email' },
        { header: 'Nome', accessorKey: 'nome' },
        { header: 'Cognome', accessorKey: 'cognome' },
        { header: 'Ditta Attiva', accessorKey: 'ditta_attiva' },
        { header: 'Login', accessorKey: 'login_timestamp', cell: info => new Date(info.getValue()).toLocaleString('it-IT') },
        { header: 'Ultima Attività', accessorKey: 'last_heartbeat_timestamp', cell: info => new Date(info.getValue()).toLocaleString('it-IT') },
    ], []);

    const SubTabButton = ({ active, onClick, children }) => (
        <button
            onClick={onClick}
            className={`px-3 py-1.5 text-sm font-medium rounded ${
                active ? 'bg-gray-200 text-gray-800' : 'text-gray-500 hover:bg-gray-100'
            }`}
        >
            {children}
        </button>
    );

    return (
        <div className="p-4">
            <div className="flex space-x-2 mb-4 border-b pb-2">
                {hasPermission('ADMIN_LOGS_VIEW') && <SubTabButton active={subTab === 'log_azioni'} onClick={() => setSubTab('log_azioni')}>Log Azioni</SubTabButton>}
                {hasPermission('ADMIN_LOGS_VIEW') && <SubTabButton active={subTab === 'log_accessi'} onClick={() => setSubTab('log_accessi')}>Log Accessi</SubTabButton>}
                {hasPermission('ADMIN_SESSIONS_VIEW') && <SubTabButton active={subTab === 'sessioni'} onClick={() => setSubTab('sessioni')}>Sessioni Attive</SubTabButton>}
            </div>
            {subTab === 'log_azioni' && hasPermission('ADMIN_LOGS_VIEW') && (
                <AdvancedDataGrid title="Log delle Azioni" columns={logAzioniColumns} data={logAzioni} isLoading={loading} onRefresh={fetchLogAzioni} />
            )}
            {subTab === 'log_accessi' && hasPermission('ADMIN_LOGS_VIEW') && (
                 <AdvancedDataGrid title="Log degli Accessi" columns={logAccessiColumns} data={logAccessi} isLoading={loading} onRefresh={fetchLogAccessi} />
            )}
            {subTab === 'sessioni' && hasPermission('ADMIN_SESSIONS_VIEW') && (
                 <AdvancedDataGrid title="Sessioni Utente Attive" columns={sessioniColumns} data={sessioniAttive} isLoading={loading} onRefresh={fetchSessioniAttive} />
            )}
        </div>
    );
};


// ====================================================================
// COMPONENTE PRINCIPALE AdminPanel (Container delle Tabs)
// ====================================================================
function AdminPanel() {
    const { hasPermission } = useAuth();
    const [activeTab, setActiveTab] = useState('utenti');

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
            permission: 'SUPER_ADMIN' // o un permesso specifico
        },
        {
            key: 'privacy',
            label: 'Gestione Privacy',
            component: <PrivacyDittaManager />,
            permission: 'PRIVACY_MANAGE' // o un permesso specifico
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
            key: 'monitoraggio',
            label: 'Monitoraggio Sistema',
            component: <MonitoraggioSistema />,
            permission: ['ADMIN_LOGS_VIEW', 'ADMIN_SESSIONS_VIEW']
        },
        {
             key: 'livelliUtente',
             label: 'Livelli Utente Ditta',
             component: <GestioneLivelliUtente />,
             permission: 'AM_UTE_LVL',
             isSystemAdminOnly: false
         }, // <-- NUOVA TAB
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ]), []); // Rimosse dipendenze non necessarie, i componenti sono definiti sopra

    return (
        <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-full flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Pannello Amministrazione</h1>

            {/* Navigazione Tabs */}
            <div className="mb-6 border-b border-gray-300">
                <div className="flex space-x-4 overflow-x-auto">
                    {TABS.map(tab => {
                        let isVisible = true;
                        if (tab.permission) {
                            if (Array.isArray(tab.permission)) {
                                if (!tab.permission.some(p => hasPermission(p))) {
                                    isVisible = false;
                                }
                            } else {
                                if (!hasPermission(tab.permission)) {
                                    isVisible = false;
                                }
                            }
                        }

                        if (!isVisible) return null;

                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`py-2 px-4 text-sm font-medium text-center border-b-2 whitespace-nowrap ${activeTab === tab.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} focus:outline-none`}
                                aria-current={activeTab === tab.key ? 'page' : undefined}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex-grow bg-gray-50 overflow-y-auto">
                {TABS.find(tab => tab.key === activeTab)?.component || <p>Seleziona una scheda.</p>}
            </div>

            {/* Le modali sono gestite dai sotto-componenti, quindi non servono qui */}

        </div>
    );
}

export default AdminPanel;

