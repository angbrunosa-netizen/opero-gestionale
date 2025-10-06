// #####################################################################
// # Componente AdminPanel - v15.0 (Fix PDF e Permessi Ditta Admin)
// # File: opero-frontend/src/components/AdminPanel.js
// #####################################################################

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AdvancedDataGrid from '../shared/AdvancedDataGrid';
import { PencilIcon, TrashIcon, DocumentArrowDownIcon, PrinterIcon, PlusIcon } from '@heroicons/react/24/outline';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';


// ====================================================================\
// Utility Functions per Export
// ====================================================================\

const exportToCSV = (data, fileName) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
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
    const startY = 50; // Aumentato per fare spazio all'intestazione

    const generatePdf = (logoImgData = null) => {
        // Aggiungi Logo (con aspect ratio corretto)
        if (logoImgData) {
            const imgProps = doc.getImageProperties(logoImgData);
            const logoWidth = 40;
            const logoHeight = (imgProps.height * logoWidth) / imgProps.width;
            doc.addImage(logoImgData, 'PNG', 15, 10, logoWidth, logoHeight);
        }

        // Aggiungi Dati Ditta
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
        
        // Aggiungi Titolo Documento
        doc.setFontSize(12);
        doc.text(`Elenco Utenti`, 15, startY - 5);

        // Aggiungi Tabella e Footer
        autoTable(doc, {
            head: [tableHeaders],
            body: tableData,
            startY: startY,
            didDrawPage: (data) => {
                // Footer
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


// ====================================================================\
// Sotto-componente: Form di Creazione/Modifica Utente (Modal)
// ====================================================================\
const UserFormModal = ({ user, onSave, onCancel, ditte, ruoli, selectedDittaId }) => {
    const { user: currentUser } = useAuth();
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setFormData({
            id: user ? user.id : null,
            nome: user ? user.nome : '',
            cognome: user ? user.cognome : '',
            email: user ? user.email : '',
            password: '',
            id_ditta: user ? user.id_ditta : selectedDittaId,
            id_ruolo: user ? user.id_ruolo : '',
        });
    }, [user, selectedDittaId]);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.nome) newErrors.nome = 'Il nome è obbligatorio.';
        if (!formData.cognome) newErrors.cognome = 'Il cognome è obbligatorio.';
        if (!formData.email) newErrors.email = 'L\'email è obbligatoria.';
        if (!formData.id && !formData.password) newErrors.password = 'La password è obbligatoria per i nuovi utenti.';
        if (!formData.id_ditta) newErrors.id_ditta = 'La ditta è obbligatoria.';
        if (!formData.id_ruolo) newErrors.id_ruolo = 'Il ruolo è obbligatorio.';
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
                <h3 className="text-lg font-bold mb-4">{user ? 'Modifica Utente' : 'Nuovo Utente'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" name="nome" value={formData.nome || ''} onChange={handleChange} placeholder="Nome" className="p-2 border rounded" />
                        <input type="text" name="cognome" value={formData.cognome || ''} onChange={handleChange} placeholder="Cognome" className="p-2 border rounded" />
                    </div>
                    <input type="email" name="email" value={formData.email || ''} onChange={handleChange} placeholder="Email" className="w-full p-2 border rounded" />
                    <input type="password" name="password" value={formData.password || ''} onChange={handleChange} placeholder={user ? 'Nuova password (lascia vuoto per non cambiare)' : 'Password'} className="w-full p-2 border rounded" />
                    
                    {currentUser.ruolo === 'Amministratore_sistema' && (
                        <select name="id_ditta" value={formData.id_ditta || ''} onChange={handleChange} className="w-full p-2 border rounded">
                            <option value="">Seleziona Ditta</option>
                            {ditte.map(d => <option key={d.id} value={d.id}>{d.ragione_sociale}</option>)}
                        </select>
                    )}
                    
                    <select name="id_ruolo" value={formData.id_ruolo || ''} onChange={handleChange} className="w-full p-2 border rounded">
                        <option value="">Seleziona Ruolo</option>
                        {ruoli.map(r => <option key={r.id} value={r.id}>{r.ruolo}</option>)}
                    </select>
                    
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onCancel} className="btn-secondary">Annulla</button>
                        <button type="submit" className="btn-primary">Salva</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// ====================================================================\
// Sotto-componente: Gestione Utenti
// ====================================================================\
const GestioneUtenti = () => {
    const { user, ditta, hasPermission } = useAuth();
    const [ditte, setDitte] = useState([]);
    const [utenti, setUtenti] = useState([]);
    const [ruoli, setRuoli] = useState([]);
    const [selectedDittaId, setSelectedDittaId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const logAction = useCallback(async (azione, dettagli = '') => {
        try {
            await api.post('/track/log-action', {
                azione,
                dettagli,
                modulo: 'Admin',
                funzione: 'Gestione Utenti'
            });
        } catch (error) {
            console.error("Errore durante la registrazione dell'azione:", error);
        }
    }, []);

    useEffect(() => {
        const loadInitialData = async () => {
            if (!user) return;
            setIsLoading(true);
            try {
                const ruoliRes = await api.get('/admin/ruoli');
                setRuoli(ruoliRes.data.ruoli);

                if (user.ruolo === 'Amministratore_sistema') {
                    const ditteRes = await api.get('/admin/ditte');
                    setDitte(ditteRes.data.ditte);
                } else {
                    // --- FIX: Ripristinata logica per Amministratore Ditta ---
                    // Un Ditta Admin vede solo i suoi utenti. Usiamo l'ID dal contesto
                    // per attivare il caricamento.
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
        if (!selectedDittaId) {
            setUtenti([]);
            return;
        }
        const fetchUtenti = async () => {
            setIsLoading(true);
            try {
                const response = await api.get(`/admin/utenti/ditta/${selectedDittaId}`);
                setUtenti(response.data.utenti);
            } catch (error) {
                console.error(`Errore nel caricamento degli utenti per la ditta ${selectedDittaId}:`, error);
                setUtenti([]);
            }
            setIsLoading(false);
        };
        fetchUtenti();
    }, [selectedDittaId, logAction]);

    const handleNewUser = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleEditUser = async (userId) => {
        try {
            const response = await api.get(`/admin/utenti/${userId}`);
            setEditingUser(response.data.utente);
            setIsModalOpen(true);
        } catch (error) {
            console.error(`Errore nel caricamento dei dati dell'utente ${userId}:`, error);
        }
    };
    
    const handleDeleteUser = async (userId) => {
        if (window.confirm('Sei sicuro di voler eliminare questo utente?')) {
            try {
                const userToDelete = utenti.find(u => u.id === userId);
                await api.delete(`/admin/utenti/${userId}`);
                if (userToDelete) {
                    logAction('Eliminazione utente', `Utente: ${userToDelete.email} (ID: ${userId})`);
                }
                setUtenti(prev => prev.filter(u => u.id !== userId));
            } catch (error) {
                console.error(`Errore durante l'eliminazione dell'utente ${userId}:`, error);
            }
        }
    };

    const handleSaveUser = async (userData) => {
        try {
            await api.post('/admin/utenti', userData);
            const actionType = userData.id ? 'Modifica' : 'Creazione';
            const dittaName = ditte.find(d => d.id === parseInt(userData.id_ditta, 10))?.ragione_sociale || userData.id_ditta;
            logAction(`${actionType} utente`, `Utente: ${userData.email}, Ditta: ${dittaName}`);
            
            setIsModalOpen(false);
            const response = await api.get(`/admin/utenti/ditta/${selectedDittaId}`);
            setUtenti(response.data.utenti);
        } catch (error) {
            console.error('Errore durante il salvataggio dell\'utente:', error);
        }
    };

    const handleExport = (format) => {
        const selectedDitta = ditte.find(d => d.id === parseInt(selectedDittaId, 10));
        if (!selectedDitta) return;

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
            id: 'actions',
            header: 'Azioni',
            cell: ({ row }) => (
                <div className="flex space-x-2">
                    {hasPermission('UTENTI_EDIT') && <button onClick={() => handleEditUser(row.original.id)} className="text-blue-600 hover:text-blue-800"><PencilIcon className="h-5 w-5" /></button>}
                    {hasPermission('UTENTI_EDIT') && <button onClick={() => handleDeleteUser(row.original.id)} className="text-red-600 hover:text-red-800"><TrashIcon className="h-5 w-5" /></button>}
                </div>
            ),
        },
    ], [ruoli, hasPermission, handleEditUser, handleDeleteUser]);

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
                                <button onClick={handleNewUser} className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                                    <PlusIcon className="h-5 w-5" />
                                    <span>Nuovo Utente</span>
                                </button>
                            )}
                        </div>
                    </div>
                    <AdvancedDataGrid columns={columns} data={utenti} isLoading={isLoading} />
                </>
            )}
            {isModalOpen && <UserFormModal user={editingUser} onSave={handleSaveUser} onCancel={() => setIsModalOpen(false)} ditte={ditte} ruoli={ruoli} selectedDittaId={selectedDittaId} />}
        </div>
    );
};


// ====================================================================\
// Sotto-componente: Associa Moduli Ditta
// ====================================================================\
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
            alert('Associazioni salvate con successo!');
        } catch (error) {
            console.error('Errore durante il salvataggio:', error);
            alert('Si è verificato un errore durante il salvataggio.');
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


// ====================================================================\
// Sotto-componente: Gestione Privacy per Ditta
// ====================================================================\
const PrivacyDittaManager = () => {
    const { user, ditta } = useAuth();
    const [ditte, setDitte] = useState([]);
    const [utentiDitta, setUtentiDitta] = useState([]);
    const [selectedDittaId, setSelectedDittaId] = useState('');
    const [privacyData, setPrivacyData] = useState({ responsabile_trattamento: '', corpo_lettera: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Carica i dati iniziali (ditte per sysadmin o imposta ditta per ditta-admin)
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

    // Carica i dati specifici (utenti e policy) quando una ditta è selezionata
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
            alert('Privacy policy salvata con successo!');
        } catch (error) {
            console.error('Errore durante il salvataggio:', error);
            alert('Si è verificato un errore durante il salvataggio.');
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


// ====================================================================\
// Componente Principale: AdminPanel
// ====================================================================\
function AdminPanel() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('utenti');

    if (!user) {
        return <div className="p-4">Caricamento...</div>;
    }

    const TABS = {
        utenti: { label: 'Gestione Utenti', component: <GestioneUtenti /> },
        moduli: { label: 'Associa Moduli', component: <AssociaModuliDitta />, adminOnly: true },
        privacy: { label: 'Privacy Policy', component: <PrivacyDittaManager />, adminOnly: false },
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-shrink-0 bg-white border-b p-4">
                <h2 className="text-xl font-bold">Pannello Amministratore</h2>
                <div className="flex gap-2 mt-4 border-b">
                    {Object.entries(TABS).map(([key, tab]) => {
                        const isSystemAdmin = user.ruolo === 'Amministratore_sistema';
                        if (tab.adminOnly && !isSystemAdmin) {
                            return null;
                        }
                        return (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`py-2 px-4 text-sm font-medium text-center border-b-2 ${activeTab === key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>
            <div className="flex-grow bg-gray-50 overflow-y-auto">
                {TABS[activeTab].component}
            </div>
        </div>
    );
}

export default AdminPanel;

