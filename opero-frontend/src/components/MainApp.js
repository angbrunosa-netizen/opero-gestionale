// #####################################################################
// # Componente Principale dell'Applicazione - v3.4 (Fix Caricamento Dati)
// # File: opero-frontend/src/components/MainApp.js
// #####################################################################

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import AdminPanel from './AdminPanel';
import AmministrazioneModule from './AmministrazioneModule';
import ContSmartModule from './ContSmartModule';
import MailModule from './MailModule';
import mammoth from 'mammoth'; // Per leggere file .docx
import * as XLSX from 'xlsx';   // Per leggere file .xlsx

// --- Componente Modale per Nuovo Incarico ---
const IncaricoModal = ({ onSave, onCancel, selectedDate }) => {
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
                console.error("Impossibile caricare gli utenti per l'assegnazione");
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
                <h3 className="text-lg font-bold mb-4">Nuovo Incarico per il {selectedDate.toLocaleDateString()}</h3>
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


// --- Componente Calendario e Incarichi ---
const CalendarWidget = () => {
    const [date, setDate] = useState(new Date());
    const [incarichi, setIncarichi] = useState([]);
    const [selectedDay, setSelectedDay] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchIncarichi = useCallback(async (currentDate) => {
        try {
            const anno = currentDate.getFullYear();
            const mese = currentDate.getMonth();
            const { data } = await api.get(`/incarichi?anno=${anno}&mese=${mese}`);
            if (data.success) {
                setIncarichi(data.data);
            }
        } catch (error) {
            console.error("Errore nel caricamento degli incarichi");
        }
    }, []);

    useEffect(() => {
        fetchIncarichi(date);
    }, [date, fetchIncarichi]);

    const changeMonth = (offset) => {
        setDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() + offset, 1));
    };
    
    const handleSaveIncarico = async (incaricoData) => {
        try {
            const { data } = await api.post('/incarichi', incaricoData);
            if(data.success) {
                setIsModalOpen(false);
                fetchIncarichi(date);
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert('Errore durante la creazione dell\'incarico.');
        }
    };

    const incarichiPerGiorno = incarichi.reduce((acc, curr) => {
        const day = new Date(curr.data_scadenza).getDate();
        if (!acc[day]) acc[day] = [];
        acc[day].push(curr);
        return acc;
    }, {});

    const incarichiDelGiornoSelezionato = incarichi.filter(inc => 
        new Date(inc.data_scadenza).toDateString() === selectedDay.toDateString()
    );

    const monthNames = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return (
        <div className="p-2 flex flex-col h-full">
            {isModalOpen && <IncaricoModal onSave={handleSaveIncarico} onCancel={() => setIsModalOpen(false)} selectedDate={selectedDay} />}
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
                                {incarichiPerGiorno[day] && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full"></span>}
                            </button>
                        );
                    })}
                </div>
            </div>
            <div className="flex-grow mt-4 bg-slate-700 rounded-lg shadow-inner border border-slate-600 p-3 overflow-y-auto">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-sm text-white">Incarichi del {selectedDay.toLocaleDateString()}</h4>
                    <button onClick={() => setIsModalOpen(true)} className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full hover:bg-blue-600">+</button>
                </div>
                <ul className="space-y-2">
                    {incarichiDelGiornoSelezionato.length > 0 ? incarichiDelGiornoSelezionato.map(inc => (
                        <li key={inc.id} className="text-xs p-2 bg-slate-600 rounded-md">
                            <p className="font-semibold text-white">{inc.titolo}</p>
                            <p className="text-slate-300">Assegnato a: {inc.assegnato_a_nome}</p>
                        </li>
                    )) : <p className="text-xs text-slate-400">Nessun incarico per oggi.</p>}
                </ul>
            </div>
        </div>
    );
};
// --- Nuovo Componente: Visualizzatore Documenti Office ---
const DocumentViewer = () => {
    const [content, setContent] = useState('<p class="text-slate-400">Seleziona un file .docx o .xlsx per visualizzare un\'anteprima.</p>');
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (event) => {
        setIsLoading(true);
        const file = event.target.files[0];
        if (!file) {
            setIsLoading(false);
            return;
        }

        const reader = new FileReader();

        reader.onload = async (e) => {
            const arrayBuffer = e.target.result;
            try {
                if (file.name.endsWith('.docx')) {
                    const result = await mammoth.convertToHtml({ arrayBuffer });
                    setContent(result.value);
                } else if (file.name.endsWith('.xlsx')) {
                    const workbook = XLSX.read(arrayBuffer, { type: 'buffer' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const html = XLSX.utils.sheet_to_html(worksheet);
                    setContent(html);
                } else {
                    setContent('<p class="text-red-500">Formato file non supportato. Seleziona .docx o .xlsx.</p>');
                }
            } catch (error) {
                console.error("Errore nella lettura del file:", error);
                setContent('<p class="text-red-500">Impossibile leggere il file.</p>');
            } finally {
                setIsLoading(false);
            }
        };

        reader.readAsArrayBuffer(file);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border col-span-1 md:col-span-2 lg:col-span-3">
            <h3 className="font-bold text-lg text-slate-700 border-b pb-2 mb-4">Visualizzatore Documenti</h3>
            <input 
                type="file" 
                accept=".docx,.xlsx" 
                onChange={handleFileChange} 
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {isLoading ? (
                <div className="mt-4 p-4 border rounded-md text-center">Caricamento anteprima...</div>
            ) : (
                <div 
                    className="mt-4 p-4 border rounded-md max-h-96 overflow-y-auto prose max-w-none" 
                    dangerouslySetInnerHTML={{ __html: content }} 
                />
            )}
        </div>
    );
};


// --- Componente Dashboard Dettagliata (AGGIORNATO) ---
const Dashboard = ({ user, ditta }) => {
    const [myTasks, setMyTasks] = useState([]);
    const [companyTasks, setCompanyTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const isAdmin = user.ruolo === 'Amministratore_Azienda' || user.ruolo === 'Amministratore_sistema';

    useEffect(() => {
        const fetchTasks = async () => {
            setIsLoading(true);
            try {
                const promises = [api.get('/incarichi/miei-futuri')];
                if (isAdmin) {
                    promises.push(api.get('/incarichi/ditta/futuri'));
                }

                const results = await Promise.all(promises);

                if (results[0] && results[0].data.success) {
                    setMyTasks(results[0].data.data);
                }

                if (isAdmin && results[1] && results[1].data.success) {
                    setCompanyTasks(results[1].data.data);
                }
            } catch (error) {
                console.error("Errore nel caricamento degli incarichi", error);
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
                {/* Card Dati Utente */}
                <div className="bg-white p-6 rounded-lg shadow-md border">
                    <h3 className="font-bold text-lg text-slate-700 border-b pb-2 mb-4">I Tuoi Dati</h3>
                    <div className="space-y-2 text-sm">
                        <p><strong>ID Utente:</strong> {user.id}</p>
                        <p><strong>Nome:</strong> {user.nome} {user.cognome}</p>
                        <p><strong>Ruolo:</strong> {user.ruolo}</p>
                    </div>
                </div>
                {/* Card Dati Azienda */}
                <div className="bg-white p-6 rounded-lg shadow-md border">
                    <h3 className="font-bold text-lg text-slate-700 border-b pb-2 mb-4">Dati Azienda</h3>
                    <div className="space-y-2 text-sm">
                        <p><strong>ID Ditta:</strong> {ditta.id}</p>
                        <p><strong>Ragione Sociale:</strong> {ditta.ragione_sociale}</p>
                    </div>
                </div>
                {/* Card Incarichi Personali */}
                <div className="bg-white p-6 rounded-lg shadow-md border">
                    <h3 className="font-bold text-lg text-slate-700 border-b pb-2 mb-4">I Miei Prossimi Incarichi</h3>
                    {isLoading ? <p>Caricamento...</p> : (
                        <ul className="space-y-3">
                            {myTasks.length > 0 ? myTasks.map(task => (
                                <li key={task.id} className="text-sm">
                                    <p className="font-semibold">{task.titolo}</p>
                                    <p className="text-slate-500">Scadenza: {new Date(task.data_scadenza).toLocaleDateString()}</p>
                                    <p className="text-slate-500">Assegnato da: {task.creatore_nome} {task.creatore_cognome}</p>
                                </li>
                            )) : <p>Nessun incarico imminente.</p>}
                        </ul>
                    )}
                </div>
            </div>

            {/* Sezione Visibile solo agli Admin */}
            {isAdmin && (
                <div className="mt-8">
                    <h2 className="text-xl font-bold text-slate-800">Panoramica Incarichi della Ditta</h2>
                    <div className="mt-4 bg-white p-6 rounded-lg shadow-md border overflow-x-auto">
                        {isLoading ? <p>Caricamento...</p> : (
                            <table className="min-w-full">
                                <thead className="border-b">
                                    <tr>
                                        <th className="text-left py-2 px-3 text-sm font-semibold text-slate-600">Titolo</th>
                                        <th className="text-left py-2 px-3 text-sm font-semibold text-slate-600">Assegnato a</th>
                                        <th className="text-left py-2 px-3 text-sm font-semibold text-slate-600">Assegnato da</th>
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
                                        <tr><td colSpan="5" className="py-4 text-center text-slate-500">Nessun incarico futuro per la ditta.</td></tr>
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


// --- Componente Principale ---
const MainApp = () => {
    const { user, ditta, modules, logout, loading } = useAuth();
    const [activeModule, setActiveModule] = useState('DASHBOARD');

    if (loading || !user || !ditta) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-800 text-white">
                <p>Caricamento applicazione...</p>
            </div>
        );
    }

    const renderActiveModule = () => {
        switch (activeModule) {
            case 'DASHBOARD':
                return <Dashboard user={user} ditta={ditta} />;
            case 'ADMIN_PANEL': return <AdminPanel />;
            case 'AMMINISTRAZIONE': return <AmministrazioneModule />;
            case 'CONT_SMART': return <ContSmartModule />;
            case 'MAIL': return <MailModule />;
            default: return <div className="p-6">Seleziona un modulo per iniziare.</div>;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
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
                        {modules.map(module => (
                            <li key={module.codice}>
                                <button onClick={() => setActiveModule(module.chiave_componente)} className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeModule === module.chiave_componente ? 'bg-slate-900 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}>
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
                <header className="bg-white border-b flex items-center justify-end p-4">
                    <span className="text-sm mr-4">Benvenuto, {user.nome} {user.cognome}</span>
                    <button onClick={logout} className="text-sm font-medium text-red-600 hover:underline">Logout</button>
                </header>
                <main className="flex-1 overflow-y-auto">
                    {renderActiveModule()}
                </main>
            </div>
        </div>
    );
};

export default MainApp;
