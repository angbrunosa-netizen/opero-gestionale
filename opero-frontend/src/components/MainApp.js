/*
 * ======================================================================
 * File: src/components/MainApp.js (MODIFICATO)
 * ======================================================================
 * Descrizione: Modifichiamo la logica del click per aprire una nuova finestra.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import AdminPanel from './AdminPanel';
import AmministrazioneModule from './AmministrazioneModule';
import ContSmartModule from './ContSmartModule';
import MailModule from './MailModule';
import AddressBook from './AddressBook';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import ShortcutSettingsModal from './ShortcutSettingsModal'; 
// ++ NUOVI IMPORT PER LE ICONE ++
import { Cog6ToothIcon, PlusCircleIcon, UserGroupIcon, EnvelopeIcon, BookOpenIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import AttivitaPPA from './AttivitaPPA';
import FinanzeModule from './FinanzeModule';
import BeniStrumentaliModule from './BeniStrumentaliModule';
ModuleRegistry.registerModules([AllCommunityModule]);


// --- Componente Modale per Nuova Attività ---
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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

// --- Componente Calendario e Attività ---
const CalendarWidget = () => {
    const [date, setDate] = useState(new Date());
    const [attivita, setAttivita] = useState([]);
    const [selectedDay, setSelectedDay] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchAttivita = useCallback(async (currentDate) => {
        try {
            const anno = currentDate.getFullYear();
            const mese = currentDate.getMonth();
            const { data } = await api.get(`/attivita?anno=${anno}&mese=${mese}`);
            if (data.success) {
                setAttivita(data.data);
            }
        } catch (error) {
            console.error("Errore nel caricamento delle attività");
        }
    }, []);

    useEffect(() => {
        fetchAttivita(date);
    }, [date, fetchAttivita]);

    const changeMonth = (offset) => {
        setDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() + offset, 1));
    };
    
    const handleSaveAttivita = async (attivitaData) => {
        try {
            const { data } = await api.post('/attivita', attivitaData);
            if(data.success) {
                setIsModalOpen(false);
                fetchAttivita(date);
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert('Errore durante la creazione dell\'attività.');
        }
    };

    const attivitaPerGiorno = attivita.reduce((acc, curr) => {
        const day = new Date(curr.data_scadenza).getDate();
        if (!acc[day]) acc[day] = [];
        acc[day].push(curr);
        return acc;
    }, {});

    const attivitaDelGiornoSelezionato = attivita.filter(inc => 
        new Date(inc.data_scadenza).toDateString() === selectedDay.toDateString()
    );

    const monthNames = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return (
        <div className="p-2 flex flex-col h-full">
            {isModalOpen && <AttivitaModal onSave={handleSaveAttivita} onCancel={() => setIsModalOpen(false)} selectedDate={selectedDay} />}
            <div className="bg-slate-700 rounded-lg shadow-inner border border-slate-600 p-3">
                <div className="flex items-center justify-between mb-2">
                    <button onClick={() => changeMonth(-1)} className="text-slate-300 hover:text-white">&lt;</button>
                    <h3 className="font-semibold text-sm text-white">{monthNames[month]} {year}</h3>
                    <button onClick={() => changeMonth(1)} className="text-slate-300 hover:text-white">&gt;</button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                    {["Do", "Lu", "Ma", "Me", "Gi", "Ve", "Sa"].map(d => <div key={d} className="font-bold text-slate-400">{d}</div>)}
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`}></div>)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const currentDate = new Date(year, month, day);
                        const isSelected = currentDate.toDateString() === selectedDay.toDateString();
                        return (
                            <button key={day} onClick={() => setSelectedDay(currentDate)} className={`relative p-1 rounded-full focus:outline-none ${isSelected ? 'bg-blue-600 text-white' : 'text-slate-200 hover:bg-slate-600'}`}>
                                {day}
                                {attivitaPerGiorno[day] && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full"></span>}
                            </button>
                        );
                    })}
                </div>
            </div>
            <div className="flex-grow mt-4 bg-slate-700 rounded-lg shadow-inner border border-slate-600 p-3 overflow-y-auto">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-sm text-white">Attività del {selectedDay.toLocaleDateString()}</h4>
                    <button onClick={() => setIsModalOpen(true)} className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full hover:bg-blue-600">+</button>
                </div>
                <ul className="space-y-2">
                    {attivitaDelGiornoSelezionato.length > 0 ? attivitaDelGiornoSelezionato.map(att => (
                        <li key={att.id} className="text-xs p-2 bg-slate-600 rounded-md">
                            <p className="font-semibold text-white">{att.titolo}</p>
                            <p className="text-slate-300">Assegnato a: {att.assegnato_a_nome}</p>
                        </li>
                    )) : <p className="text-xs text-slate-400">Nessuna attività per oggi.</p>}
                </ul>
            </div>
        </div>
    );
};
// --- Componente: Editor Documenti Office con AG Grid ---
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


// --- Componente Dashboard Dettagliata ---
const Dashboard = ({ user, ditta }) => {
    const [myTasks, setMyTasks] = useState([]);
    const [companyTasks, setCompanyTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    console.log('--- DASHBOARD COMPONENT RENDERED ---');
    console.log('Dati ricevuti:', { user, ditta });
    const isAdmin = user.ruolo === 'Amministratore_Azienda' || user.ruolo === 'Amministratore_sistema';

    useEffect(() => {
        console.log('--- USEEFFECT IN DASHBOARD TRIGGERED ---');
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
                        setCompanyTasks(companyTasksRes.data.data);
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
        <div className="p-6">
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
                    <h2 className="text-xl font-bold text-slate-800">Panoramica Attività della Ditta</h2>
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


// ++ MODIFICA QUI: Mappatura icone più completa ++
// Helper per mappare i codici funzione alle icone
const getIconForFunction = (codice) => {
    switch (codice) {
        case 'ANAGRAFICHE_CREATE': return <PlusCircleIcon className="h-5 w-5" />;
        case 'ANAGRAFICHE_VIEW': return <UserGroupIcon className="h-5 w-5" />;
        case 'UTENTI_VIEW': return <UserGroupIcon className="h-5 w-5" />;
        case 'PPA_MODULE': return <ClipboardDocumentListIcon className="h-5 w-5" />;
        case 'RUBRICA_MANAGE': return <BookOpenIcon className="h-5 w-5" />;
        case 'AddressBookManager': return <EnvelopeIcon className="h-5 w-5" />;
        // Aggiungi altri 'case' per le funzioni che vuoi mappare a un'icona
        default: return <Cog6ToothIcon className="h-5 w-5" />;
    }
};

// --- Componente Principale ---
const MainApp = () => {
    const { user, ditta, modules, logout, loading } = useAuth();
    const authData = useAuth();
    const [activeModule, setActiveModule] = useState('DASHBOARD');
    const [shortcuts, setShortcuts] = useState([]);
    const [isShortcutModalOpen, setIsShortcutModalOpen] = useState(false);
    
    console.log('STATO CORRENTE AUTH CONTEXT:', authData);
    const fetchShortcuts = useCallback(async () => {
        if (!user) return; // Non fare nulla se l'utente non è ancora caricato
        try {
            const { data } = await api.get('/user/shortcuts');
            if (data.success) {
                setShortcuts(data.data);
            }
        } catch (error) {
            console.error("Impossibile caricare le scorciatoie", error);
        }
    }, [user]); // Dipende da 'user' per assicurarsi che venga eseguito dopo il login

    useEffect(() => {
        fetchShortcuts();
    }, [fetchShortcuts]);

    if (loading || !user || !ditta) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-800 text-white">
                <p>Caricamento applicazione...</p>
            </div>
        );
    }
    
    const handleShortcutClick = (shortcut) => {
        if (shortcut.chiave_componente_modulo) {
            const url = `/module/${shortcut.chiave_componente_modulo}`;
            window.open(url, '_blank', 'noopener,noreferrer');
        } else {
            alert(`La funzione '${shortcut.descrizione}' non è collegata a un modulo apribile.`);
        }
    };
    
    const renderActiveModule = () => {
        switch (activeModule) {
            case 'DASHBOARD':
                return <Dashboard user={user} ditta={ditta} />;
            case 'MY_PPA_TASKS': 
                return <AttivitaPPA />;
            case 'ADMIN_PANEL': return <AdminPanel />;
            case 'AMMINISTRAZIONE': return <AmministrazioneModule />;
            case 'CONT_SMART': return <ContSmartModule />;
            case 'MAIL': return <MailModule />;
            case 'RUBRICA': return <AddressBook />;
            case 'FIN_SMART': return <FinanzeModule />;
            case 'BSSMART': return <BeniStrumentaliModule />;
            default: return <div className="p-6">Seleziona un modulo per iniziare.</div>;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {isShortcutModalOpen && 
                <ShortcutSettingsModal 
                    currentShortcuts={shortcuts}
                    onClose={() => setIsShortcutModalOpen(false)}
                    onSave={() => {
                        fetchShortcuts(); 
                        setIsShortcutModalOpen(false);
                    }}
                />
            }
            <aside className="w-64 bg-slate-800 flex flex-col">
                <div className="p-4 border-b border-slate-700 text-center">
                    <h1 className="text-xl font-bold text-white">Opero</h1>
                    <img 
                        src={ditta.logo_url || 'https://placehold.co/100x100/FFFFFF/334155?text=Logo'} 
                        alt="Logo Azienda" 
                        className="w-24 h-24 rounded-full mx-auto my-4 border-2 border-slate-600"
                        onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/100x100/FFFFFF/334155?text=Logo'; }}
                    />
                    <p className="text-sm font-semibold text-white">{ditta.ragione_sociale}</p>
                </div>
                <nav className="p-4">
                    <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Menu</h2>
                    <ul className="space-y-2">
                        <li>
                            <button onClick={() => setActiveModule('DASHBOARD')} className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeModule === 'DASHBOARD' ? 'bg-slate-900 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}>
                                Dashboard
                            </button>
                        </li>
                        <li>
                            <button onClick={() => setActiveModule('MY_PPA_TASKS')} className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeModule === 'MY_PPA_TASKS' ? 'bg-slate-900 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}>
                                Le Mie Attività PPA
                            </button>
                        </li>
                        {modules.map(module => (
                            /*<li key={module.codice}>
                                <button onClick={() => setActiveModule(module.chiave_componente)} className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeModule === module.chiave_componente ? 'bg-slate-900 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}>
                                    {module.descrizione}
                                </button>
                            </li>*/
                            <li key={module.codice}>
        <button onClick={() => {
            console.log('CAMBIO MODULO RICHIESTO:', module.chiave_componente);
            setActiveModule(module.chiave_componente);
        }} className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeModule === module.chiave_componente ? 'bg-slate-900 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}>
            {module.descrizione}
        </button>
    </li>
                        ))}
                    </ul>
                </nav>
                <div className="flex-grow mt-4">
                    <CalendarWidget />
                </div>
            </aside>
            <div className="flex-1 flex flex-col">
                <header className="bg-white border-b flex items-center justify-between p-4">
                    <div className="flex items-center gap-2">
                        {shortcuts.map(sc => (
                            <button 
                                key={sc.id}
                                onClick={() => handleShortcutClick(sc)}
                                title={sc.descrizione} // Questo crea il tooltip al passaggio del mouse
                                className="p-2 rounded-full bg-slate-700 text-white hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                {getIconForFunction(sc.codice)}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm hidden md:block">Benvenuto, {user.nome} {user.cognome}</span>
                        <button onClick={() => setIsShortcutModalOpen(true)} title="Personalizza scorciatoie">
                            <Cog6ToothIcon className="h-6 w-6 text-gray-600 hover:text-blue-600" />
                        </button>
                        <button onClick={logout} className="text-sm font-medium text-red-600 hover:underline">Logout</button>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto">
                    {renderActiveModule()}
                </main>
            </div>
        </div>
    );
};

export default MainApp;