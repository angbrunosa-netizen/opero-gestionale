/*
 * ======================================================================
 * File: src/components/MainApp.js
 * ======================================================================
 * Versione: 4.11 - Aggiunto Logo Mobile
 *
 * Basato su: V4.10 (Fix ESLint Import Order)
 *
 * --- MODIFICA V4.11 ---
 * - AGGIUNTO: Visualizzazione del logo della ditta anche nell'header
 *   della versione mobile, accanto al menu hamburger.
 *
 * --- CORREZIONE V4.10 ---
 * - FIX: Spostati tutti gli 'import' relativi alla Dashboard completa
 *   nella sezione import iniziale per rispettare le regole ESLint.
 *
 * --- REINTEGRATO DA V3.6 ---
 * - REINTEGRATO: Visualizzazione Logo e Ragione Sociale nella Sidebar.
 * - REINTEGRATO: Componente CalendarWidget nella Sidebar.
 * - SOSTITUITO: Il componente Dashboard (lazy-loaded) con la versione
 *   completa della v3.6, che include il visualizzatore di file e le tab PPA.
 * - AGGIUNTI: Tutti gli import e i componenti helper necessari per la
 *   vecchia Dashboard (DocumentEditor, AttivitaModal, ecc.).
 */
import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

// --- REINTEGRATO DA V3.6: Import aggiuntivi per la Dashboard completa (SPOSTATI IN TESTA) ---
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// --- Import Icone ---
import { 
    ChevronLeftIcon, QuestionMarkCircleIcon,
    HomeIcon, Bars3Icon, XMarkIcon, ChevronRightIcon,
    // Icone per la vecchia gestione moduli (ora non usate direttamente nel render, ma utili per riferimento)
    Cog6ToothIcon, PlusCircleIcon, UserGroupIcon, EnvelopeIcon, 
    BookOpenIcon, ClipboardDocumentListIcon, CurrencyDollarIcon,
    BuildingOfficeIcon, ArchiveBoxIcon, ShoppingBagIcon,
    DocumentTextIcon, CubeIcon, ChartBarIcon
} from '@heroicons/react/24/outline'; 

import { Capacitor } from '@capacitor/core';
import { toast } from 'react-toastify'; 

// Importiamo le MAPPE per il sistema a moduli
import { componentMap, iconMap } from '../lib/moduleRegistry.js';

// --- Codice del modulo ---
ModuleRegistry.registerModules([AllCommunityModule]);

// --- REINTEGRATO DA V3.6: Componente Modale per Nuova Attività ---
const AttivitaModal = ({ onSave, onCancel, selectedDate }) => {
    const [titolo, setTitolo] = useState('');
    const [descrizione, setDescrizione] = useState('');
    const [id_utente_assegnato, setIdUtenteAssegnato] = useState('');
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await api.get('/amministrazione/utenti');
                if (data.success) setUsers(data.data);
            } catch (error) {
                console.error("Impossibile caricare gli utenti");
            }
        };
        fetchUsers();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            titolo,
            descrizione,
            data_scadenza: selectedDate.toISOString().split('T')[0],
            id_utente_assegnato
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-lg font-bold mb-4">Nuova Attività per il {selectedDate.toLocaleDateString()}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Titolo" value={titolo} onChange={e => setTitolo(e.target.value)} required className="w-full p-2 border rounded-md" />
                    <textarea placeholder="Descrizione (opzionale)" value={descrizione} onChange={e => setDescrizione(e.target.value)} className="w-full p-2 border rounded-md h-24"></textarea>
                    <select value={id_utente_assegnato} onChange={e => setIdUtenteAssegnato(e.target.value)} required className="w-full p-2 border rounded-md">
                        <option value="" disabled>Assegna a...</option>
                        {users.map(user => <option key={user.id} value={user.id}>{user.nome} {user.cognome}</option>)}
                    </select>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-md">Annulla</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Salva</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- REINTEGRATO DA V3.6: Componente CalendarWidget ---
const CalendarWidget = () => {
    const days = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    let blanks = [];
    const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; 
    for (let i = 0; i < startDay; i++) {
        blanks.push(<div key={`blank-${i}`}></div>);
    }

    let daysOfMonth = [];
    for (let d = 1; d <= daysInMonth; d++) {
        daysOfMonth.push(
            <div key={`day-${d}`} className={`flex items-center justify-center h-8 w-8 rounded-full ${d === currentDay ? 'bg-blue-600 text-white' : 'text-gray-700'}`}>
                {d}
            </div>
        );
    }

    const totalSlots = [...blanks, ...daysOfMonth];

    return (
        <div className="bg-white p-4 rounded-lg shadow mt-4 mx-2">
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-800 text-sm">{today.toLocaleString('it-IT', { month: 'long', year: 'numeric' })}</h4>
            </div>
            <div className="grid grid-cols-7 text-center text-xs text-gray-500">
                {days.map((day, index) => (
                    <div key={`${day}-${index}`} className="font-semibold">{day}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 mt-2 text-sm">
                {totalSlots.map((slot, index) => <div key={index}>{slot}</div>)}
            </div>
        </div>
    );
};

// --- REINTEGRATO DA V3.6: Componente DocumentEditor ---
const DocumentEditor = () => {
    const [fileType, setFileType] = useState(null);
    const [wordContent, setWordContent] = useState('');
    const [excelData, setExcelData] = useState({ columnDefs: [], rowData: [] });
    const [fileName, setFileName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const gridRef = useRef();

    const handleFileChange = (event) => {
        setIsLoading(true);
        const file = event.target.files[0];
        if (!file) {
            setIsLoading(false);
            return;
        }
        setFileName(file.name);
        const reader = new FileReader();

        reader.onload = async (e) => {
            const arrayBuffer = e.target.result;
            try {
                if (file.name.endsWith('.docx')) {
                    setFileType('docx');
                    const result = await mammoth.convertToHtml({ arrayBuffer });
                    setWordContent(result.value);
                } else if (file.name.endsWith('.xlsx')) {
                    setFileType('xlsx');
                    const workbook = XLSX.read(arrayBuffer, { type: 'buffer' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    
                    if (!jsonData || jsonData.length === 0 || !jsonData[0] || jsonData[0].length === 0) {
                        setExcelData({ 
                            columnDefs: [{ headerName: "Info", field: "message" }], 
                            rowData: [{ message: "Il file Excel è vuoto o non contiene dati leggibili." }] 
                        });
                        setIsLoading(false);
                        return;
                    }

                    const headers = jsonData[0];
                    const rows = jsonData.slice(1);

                    const columnDefs = headers.map(header => ({
                        headerName: header,
                        field: String(header),
                        editable: true,
                    }));
                    
                    const rowData = rows.map(row => {
                        const rowObject = {};
                        headers.forEach((header, index) => {
                            rowObject[String(header)] = row[index] || '';
                        });
                        return rowObject;
                    });

                    setExcelData({ columnDefs, rowData });
                } else {
                    setFileType(null);
                    setWordContent('<p class="text-red-500">Formato file non supportato.</p>');
                }
            } catch (error) {
                console.error("Errore nella lettura del file:", error);
                setWordContent('<p class="text-red-500">Impossibile leggere il file.</p>');
            } finally {
                setIsLoading(false);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleExportExcel = () => {
        gridRef.current.api.exportDataAsCsv({ fileName: `modificato_${fileName.replace('.xlsx', '.csv')}` });
    };
    
    const handleExportWord = () => {
        const blob = new Blob([wordContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `modificato_${fileName.replace('.docx', '.html')}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const renderEditor = () => {
        if (isLoading) return <div className="text-center p-4">Caricamento...</div>;
        if (!fileType) return <div className="p-4 text-slate-400">Seleziona un file .docx o .xlsx per iniziare.</div>;

        if (fileType === 'xlsx') {
            return (
                <div className="ag-theme-alpine" style={{ height: 400, width: '100%' }}>
                    <AgGridReact
                        ref={gridRef}
                        rowData={excelData.rowData}
                        columnDefs={excelData.columnDefs}
                        defaultColDef={{
                            sortable: true,
                            filter: true,
                            resizable: true,
                        }}
                    />
                </div>
            );
        }

        if (fileType === 'docx') {
            return <ReactQuill theme="snow" value={wordContent} onChange={setWordContent} className="h-80" />;
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
                <h3 className="font-bold text-lg text-slate-700">Editor Documenti</h3>
                <div>
                    {fileType === 'docx' && <button onClick={handleExportWord} className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 mr-2">Esporta in HTML</button>}
                    {fileType === 'xlsx' && <button onClick={handleExportExcel} className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700">Esporta in CSV</button>}
                </div>
            </div>
            <input 
                type="file" 
                accept=".docx,.xlsx" 
                onChange={handleFileChange} 
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-4"
            />
            {renderEditor()}
        </div>
    );
};


// --- REINTEGRATO DA V3.6: Componente Dashboard Completa ---
// NOTA: Questo componente sostituisce l'import lazy di './Dashboard'
const Dashboard = ({ user, ditta }) => {
    const [myTasks, setMyTasks] = useState([]);
    const [companyTasks, setCompanyTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const isAdmin = user.ruolo === 'Amministratore_Azienda' || user.ruolo === 'Amministratore_sistema';

    useEffect(() => {
        const fetchTasks = async () => {
            setIsLoading(true);
            try {
                const myTasksRes = await api.get('/attivita/mie-future');
                if (myTasksRes.data.success) {
                    setMyTasks(myTasksRes.data.data);
                }

                if (isAdmin) {
                    const companyTasksRes = await api.get('/attivita/ditta/future');
                    if (companyTasksRes.data.success) {
                        setCompanyTasks(companyTasksRes.data);
                    }
                }
            } catch (error) {
                console.error("Errore nel caricamento delle attività", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTasks();
    }, [isAdmin]);

    return (
        <div className="p-4 md:p-6">
            <h2 className="text-2xl font-bold text-slate-800">Dashboard Principale</h2>
            <p className="text-slate-600 mt-1">Benvenuto in Opero, {user.nome}!</p>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md border">
                    <h3 className="font-bold text-lg text-slate-700 border-b pb-2 mb-4">I Tuoi Dati</h3>
                    <div className="space-y-2 text-sm">
                        <p><strong>ID Utente:</strong> {user.id}</p>
                        <p><strong>Nome:</strong> {user.nome} {user.cognome}</p>
                        <p><strong>Ruolo:</strong> {user.ruolo}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border">
                    <h3 className="font-bold text-lg text-slate-700 border-b pb-2 mb-4">Dati Azienda</h3>
                    <div className="space-y-2 text-sm">
                        <p><strong>ID Ditta:</strong> {ditta.id}</p>
                        <p><strong>Ragione Sociale:</strong> {ditta.ragione_sociale}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border">
                    <h3 className="font-bold text-lg text-slate-700 border-b pb-2 mb-4">Le Mie Prossime Attività</h3>
                    {isLoading ? <p>Caricamento...</p> : (
                        <ul className="space-y-3">
                            {myTasks.length > 0 ? myTasks.map(task => (
                                <li key={task.id} className="text-sm">
                                    <p className="font-semibold">{task.titolo}</p>
                                    <p className="text-slate-500">Scadenza: {new Date(task.data_scadenza).toLocaleDateString()}</p>
                                    <p className="text-slate-500">Assegnata da: {task.creatore_nome} {task.creatore_cognome}</p>
                                </li>
                            )) : <p>Nessuna attività imminente.</p>}
                        </ul>
                    )}
                </div>
            </div>

            <div className="mt-8">
                <DocumentEditor />
            </div>

            {isAdmin && (
                <div className="mt-8">
                    <h2 className="text-xl font-bold text-slate-800">Panoramica Attività della Ditta (PPA)</h2>
                    <div className="mt-4 bg-white p-6 rounded-lg shadow-md border overflow-x-auto">
                        {isLoading ? <p>Caricamento...</p> : (
                            <table className="min-w-full">
                                <thead className="border-b">
                                    <tr>
                                        <th className="text-left py-2 px-3 text-sm font-semibold text-slate-600">Titolo</th>
                                        <th className="text-left py-2 px-3 text-sm font-semibold text-slate-600">Assegnata a</th>
                                        <th className="text-left py-2 px-3 text-sm font-semibold text-slate-600">Assegnata da</th>
                                        <th className="text-left py-2 px-3 text-sm font-semibold text-slate-600">Scadenza</th>
                                        <th className="text-left py-2 px-3 text-sm font-semibold text-slate-600">Stato</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {companyTasks.length > 0 ? companyTasks.map(task => (
                                        <tr key={task.id} className="border-b hover:bg-slate-50">
                                            <td className="py-2 px-3 text-sm">{task.titolo}</td>
                                            <td className="py-2 px-3 text-sm">{task.assegnato_nome} {task.assegnato_cognome}</td>
                                            <td className="py-2 px-3 text-sm">{task.creatore_nome} {task.creatore_cognome}</td>
                                            <td className="py-2 px-3 text-sm">{new Date(task.data_scadenza).toLocaleDateString()}</td>
                                            <td className="py-2 px-3 text-sm">{task.stato}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="5" className="py-4 text-center text-slate-500">Nessuna attività futura per la ditta.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};


const MainApp = () => {
    const { user, ditta, logout, hasPermission, loading: authLoading } = useAuth();
    const [activeModule, setActiveModule] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [shortcuts, setShortcuts] = useState([]); // Ora array di OGGETTI
    
    // Stato per i moduli caricati dal DB
    const [dbModules, setDbModules] = useState([]);
    const [modulesLoading, setModulesLoading] = useState(true);
    
    const sidebarRef = useRef(null);

    // 1. Caricamento Moduli dal DB (Invariato v4.5)
    useEffect(() => {
        const fetchModules = async () => {
            try {
                const res = await api.get('/system/modules');
                
                const enrichedModules = res.data.map(m => ({
                    key: m.chiave_componente,
                    permission: m.permission_required,
                    label: m.label,
                    icon: iconMap[m.icon_name] || QuestionMarkCircleIcon 
                }));

                const homeModule = {
                    key: '__HOME__',
                    permission: null,
                    label: 'Dashboard',
                    icon: HomeIcon
                };
                setDbModules([homeModule, ...enrichedModules]);

            } catch (err) {
                console.error("Errore caricamento moduli sistema:", err);
            } finally {
                setModulesLoading(false);
            }
        };
        
        if (user) {
            fetchModules();
        }
    }, [user]);

    // 2. Caricamento Shortcuts (Logica corretta v4.8)
    const fetchShortcuts = useCallback(async () => {
        if (Capacitor.isNativePlatform()) return;
        try {
            const res = await api.get('/auth/funzioni-scorciatoie');
            setShortcuts(res.data.shortcuts || []);
        } catch (err) {
            console.error("Errore nel caricamento delle scorciatoie:", err);
        }
    }, []);

    useEffect(() => {
        if (!Capacitor.isNativePlatform()) {
            fetchShortcuts();
        }
    }, [fetchShortcuts]);
    
    // 4. handleModuleClick (Invariato v4.5)
    const handleModuleClick = (moduleKey) => {
        if (moduleKey === '__HOME__') {
            setActiveModule(null);
        } else if (activeModule === moduleKey) {
            setActiveModule(null);
        } else {
            setActiveModule(moduleKey);
        }
        
        if (Capacitor.isNativePlatform() || window.innerWidth < 1024) {
             setSidebarOpen(false);
        }
    };

    // 5. renderContent (MODIFICATO v4.9 per usare la Dashboard completa)
    const renderContent = () => {
        if (!activeModule) {
            // --- MODIFICA v4.9: Usiamo la Dashboard completa invece di quella lazy-importata ---
            return <Dashboard user={user} ditta={ditta} />;
        }

        const ComponentToRender = componentMap[activeModule];

        if (!ComponentToRender) {
             return (
                <div className="p-8">
                    <h2 className="text-2xl font-semibold text-red-600">Modulo non disponibile</h2>
                    <p className="mt-2 text-gray-600">Il modulo "{activeModule}" esiste nel database ma non è mappato nel file `moduleRegistry.js`.</p>
                </div>
            );
        }

        return (
            <Suspense fallback={
                <div className="flex justify-center items-center h-full p-8">
                    <span className="text-gray-600">Caricamento modulo...</span>
                </div>
            }>
                <ComponentToRender />
            </Suspense>
        );
    };

    if (authLoading || modulesLoading) {
        return <div className="flex justify-center items-center h-screen">Caricamento Sistema...</div>;
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar (v4.5 con integrazioni v3.6) */}
            <aside 
                ref={sidebarRef}
                className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex items-center justify-between p-4 h-16 border-b border-slate-700">
                    <span className="text-xl font-bold">OPERO</span>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-gray-400 hover:text-white">
                        <ChevronLeftIcon className="h-6 w-6" />
                    </button>
                </div>
                
                {/* --- REINTEGRATO DA V3.6: Logo e Ragione Sociale --- */}
                <div className="hidden lg:block text-center my-4 px-4">
                    <img 
                        src={ditta.logo_url || 'https://placehold.co/100x100/FFFFFF/334155?text=Logo'} 
                        alt="Logo Azienda" 
                        className="w-24 h-24 rounded-full mx-auto border-2 border-slate-600"
                        onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/100x100/FFFFFF/334155?text=Logo'; }}
                    />
                    <p className="text-sm font-semibold text-white mt-2 truncate">{ditta.ragione_sociale}</p>
                </div>
                
                <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                    {dbModules.map(module => (
                        (module.key === '__HOME__' || hasPermission(module.permission)) && (
                            <button
                                key={module.key}
                                onClick={() => handleModuleClick(module.key)}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    (activeModule === module.key || (module.key === '__HOME__' && activeModule === null))
                                    ? 'bg-blue-600 text-white' 
                                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                                }`}
                            >
                                <module.icon className="h-5 w-5" />
                                {module.label}
                            </button>
                        )
                    ))}
                </nav>

                {/* --- REINTEGRATO DA V3.6: Widget Calendario --- */}
                <div className="hidden lg:block p-2 pb-4">
                    <CalendarWidget />
                </div>
            </aside>
            
            {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)}></div>}

            {/* Header */}
            <div className="flex-1 flex flex-col ml-0 lg:ml-64">
                <header className="sticky top-0 z-10 flex items-center justify-between h-16 bg-slate-900 lg:bg-white shadow px-4 lg:px-8">
                    
                    <div className="flex items-center gap-3 lg:hidden">
                        <button 
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 rounded-md text-white hover:bg-slate-700"
                        >
                            <Bars3Icon className="h-6 w-6" />
                        </button>
                        {/* --- MODIFICA V4.11: Aggiunto Logo Mobile --- */}
                        <img 
                            src={ditta.logo_url || 'https://placehold.co/100x100/FFFFFF/334155?text=Logo'} 
                            alt="Logo Azienda" 
                            className="h-8 w-8 rounded-full object-cover border border-slate-600"
                            onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/100x100/FFFFFF/334155?text=Logo'; }}
                        />
                        <div className="flex flex-col">
                            <span className="text-white font-bold text-lg leading-tight">Opero Go</span>
                            <span className="text-blue-300 text-xs font-medium">{ditta.ragione_sociale}</span>
                        </div>
                    </div>
                    
                    <div className="hidden lg:block">
                        {ditta && <span className="text-lg font-semibold text-white lg:text-gray-700">{ditta.ragione_sociale}</span>}
                    </div>
                    
                    {/* Scorciatoie (Logica aggiornata per oggetti - v4.8) */}
                    {!Capacitor.isNativePlatform() && (
                        <div className="hidden lg:flex items-center gap-2">
                            {shortcuts.map(shortcut => {
                                const module = dbModules.find(m => m.key === shortcut.chiave_componente_modulo);
                                const Icon = module ? module.icon : QuestionMarkCircleIcon;
                                
                                return (
                                    <button
                                        key={shortcut.codice}
                                        onClick={() => handleModuleClick(shortcut.chiave_componente_modulo)}
                                        title={shortcut.descrizione}
                                        className={`p-2 rounded-full transition-colors ${
                                            activeModule === shortcut.chiave_componente_modulo 
                                            ? 'bg-blue-100 text-blue-600' 
                                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                        }`}
                                    >
                                        <Icon className="h-5 w-5" />
                                    </button>
                                );
                            })}
                        </div>
                    )}
                    
                    {/* Info Utente */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs lg:text-sm text-white lg:text-gray-700 block sm:block">
                            {user.nome} {user.cognome}
                        </span>
                        
                        <button 
                            onClick={logout} 
                            className="text-xs lg:text-sm font-medium text-red-400 lg:text-red-600 hover:underline px-2"
                        >
                            Exit
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto bg-gray-100">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default MainApp;