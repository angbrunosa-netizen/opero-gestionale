// #####################################################################
// # Modulo Amministrazione - v9.2 (Fix Visualizzazione Tasti UserManager)
// # File: opero-frontend/src/components/AmministrazioneModule.js
// #####################################################################

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { api } from '../services/api'; 
import PianoContiManager from './cont-smart/PianoContiManager';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { 
    Cog6ToothIcon,
    ChevronDownIcon,
    UsersIcon, 
    BuildingOfficeIcon, 
    QueueListIcon, 
    EnvelopeIcon,
    BuildingOffice2Icon,
    WrenchScrewdriverIcon, 
    DocumentTextIcon, 
    AtSymbolIcon, 
    Cog8ToothIcon, 
    HashtagIcon
} from '@heroicons/react/24/solid';
import UserForm from './UserForm';
import PPAModule from './PPAModule';
import ProgressiviManager from './amministrazione/ProgressiviManager';
import { PencilIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import AdvancedDataGrid from '../shared/AdvancedDataGrid';
import InvitaUtenteModal from '../shared/InvitaUtenteModal';
import ShowLinkModal from '../shared/ShowLinkModal';

const NoPermissionMessage = () => <div className="p-6 text-center text-gray-500"><p>Non disponi delle autorizzazioni necessarie per visualizzare questa sezione.</p></div>;

// --- Componente Modale per Form di Modifica/Creazione Anagrafica ---
function AnagraficaEditModal({ anagraficaId, onSave, onCancel }) {
    const { user } = useAuth();
    
    const [formData, setFormData] = useState({
        ragione_sociale: '',
        indirizzo: '',
        citta: '',
        provincia: '',
        cap: '',
        tel1: '',
        tel2: '',
        mail_1: '',
        mail_2: '',
        pec: '',
        sdi: '',
        p_iva: '',
        codice_fiscale: '',
        stato: 1, 
        codice_relazione: '',
    });
    const [relazioni, setRelazioni] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const relazioniRes = await api.get('/amministrazione/relazioni');
                setRelazioni(relazioniRes.data.data);

                if (anagraficaId) {
                    const anagraficaRes = await api.get(`/amministrazione/anagrafiche/${anagraficaId}`);
                    const data = anagraficaRes.data.data;
                    setFormData({
                        ...data,
                        tel1: data.tel1 || data.tel || '', 
                        mail_1: data.mail_1 || data.email || '',
                        sdi: data.sdi || data.codice_sdi || ''
                    });
                } else {
                    setFormData({
                        ragione_sociale: '', indirizzo: '', citta: '', provincia: '', cap: '',
                        tel1: '', tel2: '', mail_1: '', mail_2: '', pec: '', sdi: '',
                        p_iva: '', codice_fiscale: '', stato: 1, codice_relazione: '',
                    });
                }
            } catch (err) {
                setError(err.message || 'Errore di connessione.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [anagraficaId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? (checked ? 1 : 0) : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (isLoading) return <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><p className="text-white">Caricamento...</p></div>;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                <h3 className="text-xl font-semibold mb-4 text-slate-800">{anagraficaId ? 'Modifica Anagrafica' : 'Nuova Anagrafica'}</h3>
                {error && <p className="text-red-500 mb-4"><strong>Errore:</strong> {error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-4 flex-grow">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         {/* Colonna 1 */}
                         <div className="space-y-4">
                             <div>
                                 <label className="block text-sm font-medium text-slate-700">ID</label>
                                 <input value={formData.id || 'Automatico'} readOnly className="mt-1 block w-full p-2 border rounded-md bg-slate-100" />
                             </div>
                             <div>
                                 <label className="block text-sm font-medium text-slate-700">Ragione Sociale</label>
                                 <input name="ragione_sociale" value={formData.ragione_sociale || ''} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md" />
                             </div>
                             <div>
                                 <label className="block text-sm font-medium text-slate-700">Indirizzo</label>
                                 <input name="indirizzo" value={formData.indirizzo || ''} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md" />
                             </div>
                              <div>
                                 <label className="block text-sm font-medium text-slate-700">Città</label>
                                 <input name="citta" value={formData.citta || ''} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md" />
                             </div>
                             <div>
                                 <label className="block text-sm font-medium text-slate-700">Provincia</label>
                                 <input name="provincia" value={formData.provincia || ''} onChange={handleChange} required maxLength="2" className="mt-1 block w-full p-2 border rounded-md" />
                             </div>
                             <div>
                                     <label className="block text-sm font-medium text-slate-700">CAP</label>
                                     <input name="cap" value={formData.cap || ''} onChange={handleChange} required maxLength="5" className="mt-1 block w-full p-2 border rounded-md" />
                             </div>
                         </div>

                         {/* Colonna 2 */}
                         <div className="space-y-4">
                              <div>
                                 <label className="block text-sm font-medium text-slate-700">Telefono 1</label>
                                 <input name="tel1" value={formData.tel1 || ''} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md" />
                             </div>
                              <div>
                                 <label className="block text-sm font-medium text-slate-700">Telefono 2</label>
                                 <input name="tel2" value={formData.tel2 || ''} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" />
                             </div>
                              <div>
                                 <label className="block text-sm font-medium text-slate-700">Email 1</label>
                                 <input type="email" name="mail_1" value={formData.mail_1 || ''} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md" />
                             </div>
                              <div>
                                 <label className="block text-sm font-medium text-slate-700">Email 2</label>
                                 <input type="email" name="mail_2" value={formData.mail_2 || ''} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" />
                             </div>
                              <div>
                                 <label className="block text-sm font-medium text-slate-700">PEC</label>
                                 <input type="email" name="pec" value={formData.pec || ''} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" />
                             </div>
                         </div>

                         {/* Colonna 3 */}
                         <div className="space-y-4">
                              <div>
                                 <label className="block text-sm font-medium text-slate-700">Codice SDI</label>
                                 <input name="sdi" value={formData.sdi || ''} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" />
                             </div>
                             <div>
                                 <label className="block text-sm font-medium text-slate-700">Partita IVA</label>
                                 <input name="p_iva" value={formData.p_iva || ''} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md" />
                             </div>
                             <div>
                                 <label className="block text-sm font-medium text-slate-700">Codice Fiscale</label>
                                 <input name="codice_fiscale" value={formData.codice_fiscale || ''} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md" />
                             </div>
                             <div>
                                 <label className="block text-sm font-medium text-slate-700">Relazione</label>
                                 <select name="codice_relazione" value={formData.codice_relazione || ''} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md">
                                     <option value="" disabled>Seleziona...</option>
                                     {relazioni.map(rel => (
                                         <option key={rel.codice} value={rel.codice}>{rel.descrizione}</option>
                                     ))}
                                 </select>
                             </div>
                             <div className="flex items-center pt-2">
                                 <input type="checkbox" name="stato" id="stato" checked={!!formData.stato} onChange={handleChange} className="h-4 w-4 rounded" />
                                 <label htmlFor="stato" className="ml-2 block text-sm text-slate-800">Attivo</label>
                             </div>
                         </div>
                         
                         {/* Sottoconti collegati (sola lettura) */}
                         {anagraficaId && (
                             <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4 mt-2">
                                 <div>
                                     <label className="block text-sm font-medium text-slate-500">ID Sottoconto Cliente</label>
                                     <input value={formData.id_sottoconto_cliente || 'N/A'} readOnly className="mt-1 block w-full p-2 border rounded-md bg-slate-100" />
                                 </div>
                                  <div>
                                     <label className="block text-sm font-medium text-slate-500">ID Sottoconto Fornitore</label>
                                     <input value={formData.id_sottoconto_fornitore || 'N/A'} readOnly className="mt-1 block w-full p-2 border rounded-md bg-slate-100" />
                                 </div>
                                  <div>
                                     <label className="block text-sm font-medium text-slate-500">ID Sottoconto P. Vendita</label>
                                     <input value={formData.id_sottoconto_puntovendita || 'N/A'} readOnly className="mt-1 block w-full p-2 border rounded-md bg-slate-100" />
                                 </div>
                             </div>
                         )}
                      </div>
                     <div className="flex justify-end gap-4 pt-4 border-t mt-4">
                         <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Annulla</button>
                         <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">Salva</button>
                     </div>
                 </form>
             </div>
         </div>
    );
}

// --- Componente per la Gestione Utenti ---
// --- Componente per la Gestione Utenti (VERSIONE MOBILE-FRIENDLY) ---
// --- Componente per la Gestione Utenti (VERSIONE RESPONSIVE CON TABELLA DESKTOP E CARD MOBILE) ---
// --- Componente per la Gestione Utenti (CON SISTEMA DI RICERCA) ---
// --- Componente per la Gestione Utenti (CON SISTEMA DI RICERCA CORRETTO) ---
function UserManager() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10); // Per la visualizzazione desktop
    const [mobileUsersPerPage] = useState(6); // Per la visualizzazione mobile
    const [searchTerm, setSearchTerm] = useState('');

    const { hasPermission } = useAuth();

    // Funzione per caricare gli utenti
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const { data } = await api.get('/amministrazione/utenti');
            if (data.success) {
                // Assicurati che tutti gli utenti abbiano i campi necessari
                const processedUsers = data.data.map(user => ({
                    ...user,
                    nome: user.nome || '',
                    cognome: user.cognome || '',
                    email: user.email || '',
                    ruolo: user.ruolo || ''
                }));
                setUsers(processedUsers);
                setFilteredUsers(processedUsers); // Inizializza anche gli utenti filtrati
            } else {
                setError(data.message || 'Errore nel caricamento utenti.');
                toast.error(data.message || 'Errore nel caricamento utenti.');
            }
        } catch (err) {
            console.error("Errore fetch utenti:", err);
            const errMsg = err.response?.data?.message || 'Errore di connessione.';
            setError(errMsg);
            toast.error(errMsg);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Effetto per filtrare gli utenti in base al termine di ricerca
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredUsers(users);
        } else {
            const filtered = users.filter(user => {
                // Verifica che i campi esistano prima di chiamare toLowerCase()
                const nome = user.nome || '';
                const cognome = user.cognome || '';
                const email = user.email || '';
                const ruolo = user.ruolo || '';
                
                return nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       cognome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       ruolo.toLowerCase().includes(searchTerm.toLowerCase());
            });
            setFilteredUsers(filtered);
        }
        // Resetta la pagina corrente quando cambia il termine di ricerca
        setCurrentPage(1);
    }, [searchTerm, users]);

    // Funzione chiamata da InvitaUtenteModal quando l'invito ha successo
    const handleInviteSuccess = useCallback(() => {
        setIsInviteModalOpen(false);
        fetchData();
    }, [fetchData]);

    // Funzioni per aprire/chiudere il modale di MODIFICA
    const handleOpenEditModal = useCallback((userId) => {
        if (!hasPermission('UTENTI_EDIT')) {
             toast.warn('Non hai i permessi per modificare gli utenti.');
             return;
        }
        setSelectedUserId(userId);
        setIsEditModalOpen(true);
    }, [hasPermission]);

    const handleCloseEditModal = () => {
        setSelectedUserId(null);
        setIsEditModalOpen(false);
    };

    // Funzione per salvare le modifiche dall'UserEditModal
    const handleSaveUser = async (userId, data) => {
         if (!hasPermission('UTENTI_EDIT')) {
             toast.warn('Non hai i permessi per salvare le modifiche.');
             return;
        }
        try {
            const response = await api.patch(`/amministrazione/utenti/${userId}`, data);
            if (response.data.success) {
                 toast.success(response.data.message || 'Utente aggiornato con successo!');
                 handleCloseEditModal();
                 fetchData();
            } else {
                 toast.error(response.data.message || 'Errore durante il salvataggio.');
            }
        } catch (err) {
            console.error("Errore salvataggio utente:", err);
            const errMsg = err.response?.data?.message || 'Errore durante la comunicazione con il server.';
            toast.error(errMsg);
        }
    };

    // Permessi per UI condizionale
    const canInvite = hasPermission('UTENTI_CREATE');
    const canEdit = hasPermission('UTENTI_EDIT');

    // Calcolo degli utenti da visualizzare in base alla paginazione
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    
    // Calcolo per la visualizzazione mobile
    const mobileIndexOfLastUser = currentPage * mobileUsersPerPage;
    const mobileIndexOfFirstUser = mobileIndexOfLastUser - mobileUsersPerPage;
    const mobileCurrentUsers = filteredUsers.slice(mobileIndexOfFirstUser, mobileIndexOfLastUser);
    
    // Funzione per cambiare pagina
    const paginate = pageNumber => setCurrentPage(pageNumber);
    
    // Calcolo del numero totale di pagine
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const mobileTotalPages = Math.ceil(filteredUsers.length / mobileUsersPerPage);

    // Hook per rilevare la larghezza dello schermo
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Funzione per gestire la ricerca
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Funzione per resettare la ricerca
    const handleClearSearch = () => {
        setSearchTerm('');
    };

    return (
        <div className="p-4 space-y-4">
             {/* Renderizza il modale di MODIFICA UTENTE */}
            {isEditModalOpen && selectedUserId && (
                <UserEditModal
                    userId={selectedUserId}
                    onSave={handleSaveUser}
                    onCancel={handleCloseEditModal}
                />
             )}

             {/* Renderizza il modale di INVITO UTENTE condiviso */}
             {isInviteModalOpen && (
                 <InvitaUtenteModal
                     isOpen={isInviteModalOpen}
                     onClose={() => setIsInviteModalOpen(false)}
                     onInviteSent={handleInviteSuccess}
                     id_ruolo={null}
                 />
             )}

            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                <h3 className="text-xl font-semibold text-slate-700">Gestione Utenti</h3>
                {canInvite && (
                     <button
                        onClick={() => setIsInviteModalOpen(true)}
                        className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 flex items-center gap-2 transition duration-150 ease-in-out"
                    >
                        <UserPlusIcon className="h-5 w-5" />
                        Invita Nuovo Utente
                    </button>
                )}
            </div>

            {/* Barra di ricerca */}
            <div className="bg-white p-4 rounded-lg shadow mb-4">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Cerca per nome, cognome, email o ruolo..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    {searchTerm && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <button
                                type="button"
                                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                onClick={handleClearSearch}
                            >
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
                {searchTerm && (
                    <div className="mt-2 text-sm text-gray-600">
                        Trovati {filteredUsers.length} utenti per "{searchTerm}"
                    </div>
                )}
            </div>

            {error && !isLoading && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Errore: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
             )}

             {/* Visualizzazione condizionale: tabella per desktop, card per mobile */}
             <div className="bg-white shadow rounded-lg overflow-hidden">
                 {isLoading ? (
                     <div className="flex justify-center items-center p-8">
                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                         <span className="ml-2">Caricamento...</span>
                     </div>
                 ) : filteredUsers.length > 0 ? (
                     <>
                         {/* VISUALIZZAZIONE DESKTOP: TABELLA */}
                         {!isMobile && (
                             <div className="overflow-x-auto">
                                 <table className="min-w-full divide-y divide-slate-200">
                                     <thead className="bg-slate-50">
                                         <tr>
                                             <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                 Cognome
                                             </th>
                                             <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                 Nome
                                             </th>
                                             <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                 Email
                                             </th>
                                             <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                 Ruolo
                                             </th>
                                             {canEdit && (
                                                 <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                     Azioni
                                                 </th>
                                             )}
                                         </tr>
                                     </thead>
                                     <tbody className="bg-white divide-y divide-slate-200">
                                         {currentUsers.map((user) => (
                                             <tr key={user.id} className="hover:bg-slate-50">
                                                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                                     {user.cognome || 'N/D'}
                                                 </td>
                                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                     {user.nome || 'N/D'}
                                                 </td>
                                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                     {user.email || 'N/D'}
                                                 </td>
                                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                     {user.ruolo || 'N/D'}
                                                 </td>
                                                 {canEdit && (
                                                     <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                         <button
                                                             onClick={() => handleOpenEditModal(user.id)}
                                                             className="p-2 text-blue-600 hover:text-blue-900 focus:outline-none transition-colors rounded hover:bg-blue-50"
                                                             aria-label="Gestisci utente"
                                                             title="Gestisci utente"
                                                         >
                                                             <PencilIcon className="h-5 w-5" />
                                                         </button>
                                                     </td>
                                                 )}
                                             </tr>
                                         ))}
                                     </tbody>
                                 </table>
                             </div>
                         )}
                         
                         {/* VISUALIZZAZIONE MOBILE: CARD */}
                         {isMobile && (
                             <div className="grid grid-cols-1 gap-4 p-4">
                                 {mobileCurrentUsers.map((user) => (
                                     <div key={user.id} className="bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
                                         <div className="flex items-center mb-3">
                                             <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                                 <span className="text-blue-600 font-semibold text-lg">
                                                     {(user.nome && user.cognome) ? 
                                                         `${user.nome.charAt(0)}${user.cognome.charAt(0)}` : 
                                                         'U'
                                                     }
                                                 </span>
                                             </div>
                                             <div className="ml-3">
                                                 <h3 className="text-lg font-medium text-slate-900">
                                                     {user.nome && user.cognome ? 
                                                         `${user.nome} ${user.cognome}` : 
                                                         'Utente senza nome'
                                                     }
                                                 </h3>
                                                 <p className="text-sm text-slate-500">
                                                     {user.ruolo || 'Nessun ruolo'}
                                                 </p>
                                             </div>
                                         </div>
                                         
                                         <div className="space-y-2">
                                             <div className="flex items-center text-sm text-slate-600">
                                                 <svg className="h-4 w-4 mr-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                 </svg>
                                                 <span className="truncate">{user.email || 'Nessuna email'}</span>
                                             </div>
                                         </div>
                                         
                                         <div className="mt-4 pt-3 border-t border-slate-100">
                                             {canEdit && (
                                                 <button
                                                     onClick={() => handleOpenEditModal(user.id)}
                                                     className="w-full flex justify-center items-center px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                                                     aria-label="Gestisci utente"
                                                     title="Gestisci utente"
                                                 >
                                                     <PencilIcon className="h-4 w-4 mr-2" />
                                                     Modifica
                                                 </button>
                                             )}
                                         </div>
                                     </div>
                                 ))}
                             </div>
                         )}
                         
                         {/* Paginazione per DESKTOP */}
                         {!isMobile && totalPages > 1 && (
                             <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-slate-200">
                                 <div className="flex-1 flex justify-between sm:hidden">
                                     <button 
                                         onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                                         disabled={currentPage === 1}
                                         className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                     >
                                         Precedente
                                     </button>
                                     <button 
                                         onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                                         disabled={currentPage === totalPages}
                                         className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                     >
                                         Successivo
                                     </button>
                                 </div>
                                 <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                     <div>
                                         <p className="text-sm text-slate-700">
                                             Mostrando da <span className="font-medium">{indexOfFirstUser + 1}</span> a{' '}
                                             <span className="font-medium">{Math.min(indexOfLastUser, filteredUsers.length)}</span> di{' '}
                                             <span className="font-medium">{filteredUsers.length}</span> risultati
                                             {searchTerm && ` per "${searchTerm}"`}
                                         </p>
                                     </div>
                                     <div>
                                         <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                             <button 
                                                 onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                                                 disabled={currentPage === 1}
                                                 className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                             >
                                                 <span className="sr-only">Previous</span>
                                                 <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                     <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                                 </svg>
                                             </button>
                                             
                                             {/* Numeri di pagina */}
                                             {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                                                 <button
                                                     key={number}
                                                     onClick={() => paginate(number)}
                                                     className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                         currentPage === number
                                                             ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                             : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'
                                                     }`}
                                                 >
                                                     {number}
                                                 </button>
                                             ))}
                                             
                                             <button 
                                                 onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                                                 disabled={currentPage === totalPages}
                                                 className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                             >
                                                 <span className="sr-only">Next</span>
                                                 <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                     <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                 </svg>
                                             </button>
                                         </nav>
                                     </div>
                                 </div>
                             </div>
                         )}
                         
                         {/* Paginazione per MOBILE */}
                         {isMobile && mobileTotalPages > 1 && (
                             <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-slate-200">
                                 <div className="flex-1 flex justify-between">
                                     <button 
                                         onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                                         disabled={currentPage === 1}
                                         className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                     >
                                         Precedente
                                     </button>
                                     <span className="text-sm text-slate-700">
                                         Pagina {currentPage} di {mobileTotalPages}
                                     </span>
                                     <button 
                                         onClick={() => currentPage < mobileTotalPages && paginate(currentPage + 1)}
                                         disabled={currentPage === mobileTotalPages}
                                         className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                     >
                                         Successivo
                                     </button>
                                 </div>
                             </div>
                         )}
                     </>
                 ) : (
                     <div className="text-center py-8">
                         <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                         </svg>
                         <h3 className="mt-2 text-sm font-medium text-slate-900">
                             {searchTerm ? `Nessun utente trovato per "${searchTerm}"` : 'Nessun utente trovato'}
                         </h3>
                         <p className="mt-1 text-sm text-slate-500">
                             {searchTerm ? 'Prova a modificare i criteri di ricerca' : 'Prova a modificare i criteri di ricerca o aggiungi un nuovo utente.'}
                         </p>
                         {canInvite && !searchTerm && (
                             <div className="mt-6">
                                 <button
                                     onClick={() => setIsInviteModalOpen(true)}
                                     className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                 >
                                     <UserPlusIcon className="h-5 w-5 mr-2" />
                                     Invita Nuovo Utente
                                 </button>
                             </div>
                         )}
                     </div>
                 )}
             </div>
        </div>
    );
}


// --- Componente per la Gestione Anagrafiche ---
// --- Componente per la Gestione Anagrafiche (CON SISTEMA DI RICERCA CORRETTO) ---
function AnagraficheManager() {
    const [anagrafiche, setAnagrafiche] = useState([]);
    const [filteredAnagrafiche, setFilteredAnagrafiche] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAnagraficaId, setSelectedAnagraficaId] = useState(null);
    const { hasPermission } = useAuth();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [relazioneFilter, setRelazioneFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); // Per la visualizzazione desktop
    const [mobileItemsPerPage] = useState(6); // Per la visualizzazione mobile

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await api.get('/amministrazione/anagrafiche');
            if (data.success) {
                // Assicurati che tutte le anagrafiche abbiano i campi necessari
                const processedAnagrafiche = data.data.map(item => ({
                    ...item,
                    ragione_sociale: item.ragione_sociale || '',
                    citta: item.citta || '',
                    provincia: item.provincia || '',
                    relazione: item.relazione || '',
                    p_iva: item.p_iva || '',
                    codice_fiscale: item.codice_fiscale || '',
                    codice_cliente: item.codice_cliente || '',
                    codice_fornitore: item.codice_fornitore || '',
                    codice_puntovendita: item.codice_puntovendita || '',
                    stato: item.stato !== undefined ? item.stato : 1
                }));
                setAnagrafiche(processedAnagrafiche);
                setFilteredAnagrafiche(processedAnagrafiche);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Errore di connessione.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { 
        fetchData(); 
    }, [fetchData]);

    // Effetto per filtrare le anagrafiche in base al termine di ricerca e al filtro relazione
    useEffect(() => {
        let filtered = anagrafiche;
        
        // Filtra per termine di ricerca
        if (searchTerm.trim() !== '') {
            filtered = filtered.filter(anag => {
                // Verifica che i campi esistano prima di chiamare toLowerCase()
                const ragione_sociale = anag.ragione_sociale || '';
                const p_iva = anag.p_iva || '';
                const codice_fiscale = anag.codice_fiscale || '';
                const citta = anag.citta || '';
                const provincia = anag.provincia || '';
                
                const searchTermLower = searchTerm.toLowerCase();
                return ragione_sociale.toLowerCase().includes(searchTermLower) ||
                       p_iva.includes(searchTerm) ||
                       codice_fiscale.toLowerCase().includes(searchTermLower) ||
                       citta.toLowerCase().includes(searchTermLower) ||
                       provincia.toLowerCase().includes(searchTermLower);
            });
        }
        
        // Filtra per relazione
        if (relazioneFilter) {
            filtered = filtered.filter(anag => (anag.relazione || '') === relazioneFilter);
        }
        
        setFilteredAnagrafiche(filtered);
        // Resetta la pagina corrente quando cambiano i filtri
        setCurrentPage(1);
    }, [anagrafiche, searchTerm, relazioneFilter]);

    const handleOpenModal = (id = null) => {
        setSelectedAnagraficaId(id);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedAnagraficaId(null);
        fetchData(); 
    };

    const handleSave = async (formData) => {
        const { id, ...dataToSave } = formData;
        const isNew = !id;
        const url = isNew ? '/amministrazione/anagrafiche' : `/amministrazione/anagrafiche/${id}`;
        const method = isNew ? 'post' : 'patch';

        try {
            const { data } = await api[method](url, dataToSave);
            alert(data.message);
            if (data.success) {
                handleCloseModal();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Errore durante il salvataggio.');
        }
    };

    const canCreate = true; 
    const canEdit = true; 

    // Calcolo degli elementi da visualizzare in base alla paginazione
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAnagrafiche.slice(indexOfFirstItem, indexOfLastItem);
    
    // Calcolo per la visualizzazione mobile
    const mobileIndexOfLastItem = currentPage * mobileItemsPerPage;
    const mobileIndexOfFirstItem = mobileIndexOfLastItem - mobileItemsPerPage;
    const mobileCurrentItems = filteredAnagrafiche.slice(mobileIndexOfFirstItem, mobileIndexOfLastItem);
    
    // Funzione per cambiare pagina
    const paginate = pageNumber => setCurrentPage(pageNumber);
    
    // Calcolo del numero totale di pagine
    const totalPages = Math.ceil(filteredAnagrafiche.length / itemsPerPage);
    const mobileTotalPages = Math.ceil(filteredAnagrafiche.length / mobileItemsPerPage);

    // Hook per rilevare la larghezza dello schermo
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Funzione per gestire la ricerca
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Funzione per resettare la ricerca
    const handleClearSearch = () => {
        setSearchTerm('');
    };

    // Funzione per resettare i filtri
    const handleClearFilters = () => {
        setSearchTerm('');
        setRelazioneFilter('');
    };

    const relazioneOptions = useMemo(() => [...new Set(anagrafiche.map(item => item.relazione).filter(Boolean))], [anagrafiche]);

    if (error) return <div className="text-red-500">Errore: {error}</div>;

    return (
        <div>
            {isModalOpen && <AnagraficaEditModal anagraficaId={selectedAnagraficaId} onSave={handleSave} onCancel={handleCloseModal} />}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-slate-700">Anagrafiche Aziende</h3>
                {canCreate && <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">+ Nuova Anagrafica</button>}
            </div>

            {/* Barra di ricerca e filtri */}
            <div className="mb-4 p-4 bg-white shadow-md rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Cerca per ragione sociale, P.IVA, città..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                        {searchTerm && (
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                <button
                                    type="button"
                                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                    onClick={handleClearSearch}
                                >
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={relazioneFilter}
                            onChange={(e) => setRelazioneFilter(e.target.value)}
                            className="flex-1 p-2 border rounded-md"
                        >
                            <option value="">Tutte le relazioni</option>
                            {relazioneOptions.map(option => <option key={option} value={option}>{option}</option>)}
                        </select>
                        {(searchTerm || relazioneFilter) && (
                            <button
                                onClick={handleClearFilters}
                                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                            >
                                Resetta filtri
                            </button>
                        )}
                    </div>
                </div>
                {(searchTerm || relazioneFilter) && (
                    <div className="mt-2 text-sm text-gray-600">
                        Trovate {filteredAnagrafiche.length} anagrafiche
                        {searchTerm && ` per "${searchTerm}"`}
                        {relazioneFilter && ` con relazione "${relazioneFilter}"`}
                    </div>
                )}
            </div>
            
            {isLoading ? (
                 <div className="flex justify-center items-center p-8">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                     <span className="ml-2">Caricamento...</span>
                 </div>
            ) : (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    {/* VISUALIZZAZIONE DESKTOP: TABELLA */}
                    {!isMobile && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Ragione Sociale</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Città</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Provincia</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Relazione</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Sottoconti (C/F/PV)</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Stato</th>
                                        {canEdit && <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Azioni</th>}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {currentItems.length > 0 ? (
                                        currentItems.map(row => (
                                            <tr key={row.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4 text-sm font-medium text-slate-800">{row.ragione_sociale || 'N/D'}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600">{row.citta || 'N/D'}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600">{row.provincia || 'N/D'}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600">{row.relazione || 'N/D'}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                                                    {row.codice_cliente && <div>C: {row.codice_cliente}</div>}
                                                    {row.codice_fornitore && <div>F: {row.codice_fornitore}</div>}
                                                    {row.codice_puntovendita && <div>PV: {row.codice_puntovendita}</div>}
                                                    {!row.codice_cliente && !row.codice_fornitore && !row.codice_puntovendita && <div>N/D</div>}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div 
                                                        className={`h-3 w-3 rounded-full mx-auto ${row.stato == 1 ? 'bg-green-500' : 'bg-red-500'}`}
                                                        title={row.stato == 1 ? 'Attivo' : 'Inattivo'}
                                                    ></div>
                                                </td>
                                                {canEdit && <td className="px-6 py-4 text-center text-sm font-medium"><button onClick={() => handleOpenModal(row.id)} className="text-blue-600 hover:text-blue-900">Modifica</button></td>}
                                            </tr>
                                        ))
                                     ) : (
                                        <tr>
                                            <td colSpan="7" className="text-center p-4">Nessuna anagrafica corrisponde ai criteri di ricerca.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                    
                    {/* VISUALIZZAZIONE MOBILE: CARD */}
                    {isMobile && (
                        <div className="grid grid-cols-1 gap-4 p-4">
                            {mobileCurrentItems.length > 0 ? (
                                mobileCurrentItems.map(row => (
                                    <div key={row.id} className="bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
                                        <div className="flex items-center mb-3">
                                            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                                <span className="text-blue-600 font-semibold text-lg">
                                                    {row.ragione_sociale ? row.ragione_sociale.charAt(0).toUpperCase() : 'A'}
                                                </span>
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-lg font-medium text-slate-900">
                                                    {row.ragione_sociale || 'Azienda senza nome'}
                                                </h3>
                                                <p className="text-sm text-slate-500">
                                                    {row.relazione || 'Nessuna relazione'}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <div className="flex items-center text-sm text-slate-600">
                                                <svg className="h-4 w-4 mr-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span>{row.citta || 'N/D'}{row.citta && row.provincia ? `, ${row.provincia}` : ''}{row.provincia && !row.citta ? row.provincia : ''}</span>
                                            </div>
                                            <div className="flex items-center text-sm text-slate-600">
                                                <svg className="h-4 w-4 mr-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                </svg>
                                                <span>P.IVA: {row.p_iva || 'N/D'}</span>
                                            </div>
                                            <div className="flex items-center text-sm text-slate-600">
                                                <svg className="h-4 w-4 mr-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <span>Sottoconti: </span>
                                                <span className="font-mono">
                                                    {row.codice_cliente && `C: ${row.codice_cliente}`}
                                                    {row.codice_cliente && row.codice_fornitore && ' | '}
                                                    {row.codice_fornitore && `F: ${row.codice_fornitore}`}
                                                    {(row.codice_cliente || row.codice_fornitore) && row.codice_puntovendita && ' | '}
                                                    {row.codice_puntovendita && `PV: ${row.codice_puntovendita}`}
                                                    {!row.codice_cliente && !row.codice_fornitore && !row.codice_puntovendita && 'N/D'}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                                            <div className="flex items-center">
                                                <div 
                                                    className={`h-3 w-3 rounded-full mr-2 ${row.stato == 1 ? 'bg-green-500' : 'bg-red-500'}`}
                                                    title={row.stato == 1 ? 'Attivo' : 'Inattivo'}
                                                ></div>
                                                <span className="text-sm text-slate-600">
                                                    {row.stato == 1 ? 'Attivo' : 'Inattivo'}
                                                </span>
                                            </div>
                                            {canEdit && (
                                                <button
                                                    onClick={() => handleOpenModal(row.id)}
                                                    className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-sm"
                                                    aria-label="Modifica anagrafica"
                                                    title="Modifica anagrafica"
                                                >
                                                    Modifica
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 col-span-full">
                                    <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-slate-900">
                                        {searchTerm || relazioneFilter ? 'Nessuna anagrafica corrisponde ai criteri di ricerca' : 'Nessuna anagrafica trovata'}
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {searchTerm || relazioneFilter ? 'Prova a modificare i criteri di ricerca' : 'Prova a modificare i criteri di ricerca o aggiungi una nuova anagrafica.'}
                                    </p>
                                    {canCreate && !searchTerm && !relazioneFilter && (
                                        <div className="mt-6">
                                            <button
                                                onClick={() => handleOpenModal()}
                                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                                </svg>
                                                Nuova Anagrafica
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* Paginazione per DESKTOP */}
                    {!isMobile && totalPages > 1 && (
                        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-slate-200">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button 
                                    onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Precedente
                                </button>
                                <button 
                                    onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Successivo
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-slate-700">
                                        Mostrando da <span className="font-medium">{indexOfFirstItem + 1}</span> a{' '}
                                        <span className="font-medium">{Math.min(indexOfLastItem, filteredAnagrafiche.length)}</span> di{' '}
                                        <span className="font-medium">{filteredAnagrafiche.length}</span> risultati
                                        {(searchTerm || relazioneFilter) && (
                                            <span>
                                                {searchTerm && ` per "${searchTerm}"`}
                                                {relazioneFilter && ` con relazione "${relazioneFilter}"`}
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                        <button 
                                            onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span className="sr-only">Previous</span>
                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        
                                        {/* Numeri di pagina */}
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                                            <button
                                                key={number}
                                                onClick={() => paginate(number)}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                    currentPage === number
                                                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                        : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'
                                                }`}
                                            >
                                                {number}
                                            </button>
                                        ))}
                                        
                                        <button 
                                            onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span className="sr-only">Next</span>
                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Paginazione per MOBILE */}
                    {isMobile && mobileTotalPages > 1 && (
                        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-slate-200">
                            <div className="flex-1 flex justify-between">
                                <button 
                                    onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Precedente
                                </button>
                                <span className="text-sm text-slate-700">
                                    Pagina {currentPage} di {mobileTotalPages}
                                </span>
                                <button 
                                    onClick={() => currentPage < mobileTotalPages && paginate(currentPage + 1)}
                                    disabled={currentPage === mobileTotalPages}
                                    className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Successivo
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
// --- Componente Modale per Account Email ---
// --- Componente Modale per Account Email (Responsive) ---
// --- Componente Modale per Account Email (Responsive Corretto) ---
function MailAccountEditModal({ account, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        nome_account: '', email_address: '', 
        imap_host: '', imap_port: 993, 
        smtp_host: '', smtp_port: 465, 
        auth_user: '', auth_pass: ''
    });
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState({ message: '', type: '' });
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    // Hook per rilevare le dimensioni della finestra
    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Determina se è mobile basandosi sulla larghezza della finestra
    const isMobile = windowSize.width < 768;

    useEffect(() => {
        if (account) {
            // Assicurati che tutti i campi abbiano valori di default
            setFormData({ 
                nome_account: account.nome_account || '',
                email_address: account.email_address || '',
                imap_host: account.imap_host || '',
                imap_port: account.imap_port || 993,
                smtp_host: account.smtp_host || '',
                smtp_port: account.smtp_port || 465,
                auth_user: account.auth_user || '',
                auth_pass: '' // Non precompilare la password per sicurezza
            });
        }
    }, [account]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'number' ? (value === '' ? '' : parseInt(value, 10)) : value 
        }));
    };

    const handleTestConnection = async () => {
        setIsTesting(true);
        setTestResult({ message: 'Test in corso...', type: 'info' });
        try {
            const { data } = await api.post('/amministrazione/mail-accounts/test', {
                smtp_host: formData.smtp_host,
                smtp_port: formData.smtp_port,
                auth_user: formData.auth_user,
                auth_pass: formData.auth_pass
            });
            if (data.success) {
                setTestResult({ message: data.message, type: 'success' });
            } else {
                setTestResult({ message: data.message, type: 'error' });
            }
        } catch (err) {
            setTestResult({ message: err.response?.data?.message || 'Errore di rete durante il test.', type: 'error' });
        } finally {
            setIsTesting(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData, account ? account.id : null);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`bg-white rounded-lg shadow-xl w-full ${isMobile ? 'max-w-full' : 'max-w-2xl'} max-h-[90vh] overflow-y-auto`}>
                <div className="sticky top-0 bg-white p-4 md:p-6 border-b border-slate-200">
                    <h3 className="text-lg md:text-xl font-semibold text-slate-800">
                        {account ? 'Modifica Account Email' : 'Nuovo Account Email'}
                    </h3>
                </div>
                
                <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
                    {/* Sezione Informazioni Base */}
                    <div className="space-y-4">
                        <h4 className="text-base font-medium text-slate-700 border-b border-slate-200 pb-2">Informazioni Base</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Nome Account</label>
                                <input 
                                    name="nome_account" 
                                    value={formData.nome_account} 
                                    onChange={handleChange} 
                                    required 
                                    className="mt-1 block w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Indirizzo Email</label>
                                <input 
                                    type="email" 
                                    name="email_address" 
                                    value={formData.email_address} 
                                    onChange={handleChange} 
                                    required 
                                    className="mt-1 block w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sezione Configurazione IMAP */}
                    <div className="space-y-4">
                        <h4 className="text-base font-medium text-slate-700 border-b border-slate-200 pb-2">Configurazione IMAP</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Host IMAP</label>
                                <input 
                                    name="imap_host" 
                                    value={formData.imap_host} 
                                    onChange={handleChange} 
                                    required 
                                    className="mt-1 block w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Porta IMAP</label>
                                <input 
                                    type="number" 
                                    name="imap_port" 
                                    value={formData.imap_port} 
                                    onChange={handleChange} 
                                    required 
                                    className="mt-1 block w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sezione Configurazione SMTP */}
                    <div className="space-y-4">
                        <h4 className="text-base font-medium text-slate-700 border-b border-slate-200 pb-2">Configurazione SMTP</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Host SMTP</label>
                                <input 
                                    name="smtp_host" 
                                    value={formData.smtp_host} 
                                    onChange={handleChange} 
                                    required 
                                    className="mt-1 block w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Porta SMTP</label>
                                <input 
                                    type="number" 
                                    name="smtp_port" 
                                    value={formData.smtp_port} 
                                    onChange={handleChange} 
                                    required 
                                    className="mt-1 block w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sezione Autenticazione */}
                    <div className="space-y-4">
                        <h4 className="text-base font-medium text-slate-700 border-b border-slate-200 pb-2">Autenticazione</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Utente Autenticazione</label>
                                <input 
                                    name="auth_user" 
                                    value={formData.auth_user} 
                                    onChange={handleChange} 
                                    required 
                                    className="mt-1 block w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Password</label>
                                <input 
                                    type="password" 
                                    name="auth_pass" 
                                    value={formData.auth_pass} 
                                    onChange={handleChange} 
                                    required={!account} 
                                    placeholder={account ? 'Lasciare vuoto per non modificare' : ''} 
                                    className="mt-1 block w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Risultato del Test */}
                    {testResult.message && (
                        <div className={`p-3 rounded-md text-sm ${testResult.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {testResult.message}
                        </div>
                    )}

                    {/* Pulsanti di Azione */}
                    <div className={`${isMobile ? 'flex flex-col space-y-3' : 'flex justify-between items-center'} pt-4 border-t mt-4`}>
                        <button 
                            type="button" 
                            onClick={handleTestConnection} 
                            disabled={isTesting}
                            className={`${isMobile ? 'w-full' : ''} px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500`}
                        >
                            {isTesting ? 'Testing...' : 'Testa Account'}
                        </button>
                        <div className={`${isMobile ? 'flex flex-col space-y-3 w-full' : 'flex gap-4'}`}>
                            <button 
                                type="button" 
                                onClick={onCancel} 
                                className={`${isMobile ? 'w-full' : ''} px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500`}
                            >
                                Annulla
                            </button>
                            <button 
                                type="submit" 
                                className={`${isMobile ? 'w-full' : ''} px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            >
                                Salva
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
// --- Componente per la Gestione Account Email ---
// --- Componente per la Gestione Account Email (Responsive) ---
function MailAccountsManager() {
    const [accounts, setAccounts] = useState([]);
    const [filteredAccounts, setFilteredAccounts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); // Per la visualizzazione desktop
    const [mobileItemsPerPage] = useState(6); // Per la visualizzazione mobile
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });
    const { hasPermission } = useAuth();

    // Hook per rilevare le dimensioni della finestra
    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Determina se è mobile basandosi sulla larghezza della finestra
    const isMobile = windowSize.width < 768;

    const canEdit = hasPermission('MAIL_ACCOUNTS_EDIT',79);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await api.get('/amministrazione/mail-accounts');
            if (data.success) {
                // Assicurati che tutti gli account abbiano i campi necessari
                const processedAccounts = data.data.map(account => ({
                    ...account,
                    nome_account: account.nome_account || '',
                    email_address: account.email_address || '',
                    auth_user: account.auth_user || '',
                    imap_host: account.imap_host || '',
                    smtp_host: account.smtp_host || ''
                }));
                setAccounts(processedAccounts);
                setFilteredAccounts(processedAccounts);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Errore di connessione.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Effetto per filtrare gli account in base al termine di ricerca
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredAccounts(accounts);
        } else {
            const filtered = accounts.filter(account => {
                // Verifica che i campi esistano prima di chiamare toLowerCase()
                const nome_account = account.nome_account || '';
                const email_address = account.email_address || '';
                const auth_user = account.auth_user || '';
                
                const searchTermLower = searchTerm.toLowerCase();
                return nome_account.toLowerCase().includes(searchTermLower) ||
                       email_address.toLowerCase().includes(searchTermLower) ||
                       auth_user.toLowerCase().includes(searchTermLower);
            });
            setFilteredAccounts(filtered);
        }
        // Resetta la pagina corrente quando cambia il termine di ricerca
        setCurrentPage(1);
    }, [searchTerm, accounts]);

    const handleOpenModal = (account = null) => {
        setSelectedAccount(account);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedAccount(null);
    };

    const handleSave = async (formData, accountId) => {
        const isNew = !accountId;
        const method = isNew ? 'post' : 'patch';
        const url = isNew ? '/amministrazione/mail-accounts' : `/amministrazione/mail-accounts/${accountId}`;
        
        if (!isNew && !formData.auth_pass) {
            delete formData.auth_pass;
        }

        try {
            const { data } = await api[method](url, formData);
            alert(data.message);
            if (data.success) {
                handleCloseModal();
                fetchData();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Errore durante il salvataggio.');
        }
    };
    
    const handleDelete = async (accountId) => {
        if (window.confirm('Sei sicuro di voler eliminare questo account email?')) {
            try {
                const { data } = await api.delete(`/amministrazione/mail-accounts/${accountId}`);
                alert(data.message);
                if (data.success) {
                    fetchData();
                }
            } catch (err) {
                alert(err.response?.data?.message || 'Errore durante l\'eliminazione.');
            }
        }
    };

    // Calcolo degli elementi da visualizzare in base alla paginazione
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAccounts.slice(indexOfFirstItem, indexOfLastItem);
    
    // Calcolo per la visualizzazione mobile
    const mobileIndexOfLastItem = currentPage * mobileItemsPerPage;
    const mobileIndexOfFirstItem = mobileIndexOfLastItem - mobileItemsPerPage;
    const mobileCurrentItems = filteredAccounts.slice(mobileIndexOfFirstItem, mobileIndexOfLastItem);
    
    // Funzione per cambiare pagina
    const paginate = pageNumber => setCurrentPage(pageNumber);
    
    // Calcolo del numero totale di pagine
    const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
    const mobileTotalPages = Math.ceil(filteredAccounts.length / mobileItemsPerPage);

    // Funzione per gestire la ricerca
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Funzione per resettare la ricerca
    const handleClearSearch = () => {
        setSearchTerm('');
    };

    return (
        <div className="p-4 space-y-4">
            {isModalOpen && <MailAccountEditModal account={selectedAccount} onSave={handleSave} onCancel={handleCloseModal} />}
            
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                <h3 className="text-xl font-semibold text-slate-700">Gestione Account Email</h3>
                {canEdit && (
                    <button 
                        onClick={() => handleOpenModal()} 
                        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 flex items-center gap-2"
                    >
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Nuovo Account
                    </button>
                )}
            </div>

            {/* Barra di ricerca */}
            <div className="bg-white p-4 rounded-lg shadow mb-4">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Cerca per nome account, email o utente..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    {searchTerm && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <button
                                type="button"
                                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                onClick={handleClearSearch}
                            >
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
                {searchTerm && (
                    <div className="mt-2 text-sm text-gray-600">
                        Trovati {filteredAccounts.length} account per "{searchTerm}"
                    </div>
                )}
            </div>

            {error && !isLoading && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Errore: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {/* Visualizzazione condizionale: tabella per desktop, card per mobile */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center items-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Caricamento...</span>
                    </div>
                ) : filteredAccounts.length > 0 ? (
                    <>
                        {/* VISUALIZZAZIONE DESKTOP: TABELLA */}
                        {!isMobile && (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                Nome Account
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                Indirizzo Email
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                Utente
                                            </th>
                                            {canEdit && (
                                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                    Azioni
                                                </th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {currentItems.map(acc => (
                                            <tr key={acc.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                                    {acc.nome_account || 'N/D'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                    {acc.email_address || 'N/D'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                    {acc.auth_user || 'N/D'}
                                                </td>
                                                {canEdit && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                        <div className="flex justify-center space-x-2">
                                                            <button 
                                                                onClick={() => handleOpenModal(acc)} 
                                                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                                                title="Modifica"
                                                            >
                                                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                                </svg>
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDelete(acc.id)} 
                                                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                                                title="Elimina"
                                                            >
                                                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        
                        {/* VISUALIZZAZIONE MOBILE: CARD */}
                        {isMobile && (
                            <div className="grid grid-cols-1 gap-4 p-4">
                                {mobileCurrentItems.map(acc => (
                                    <div key={acc.id} className="bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
                                        <div className="flex items-center mb-3">
                                            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                                <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-lg font-medium text-slate-900">
                                                    {acc.nome_account || 'Account senza nome'}
                                                </h3>
                                                <p className="text-sm text-slate-500">
                                                    {acc.email_address || 'Nessuna email'}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <div className="flex items-center text-sm text-slate-600">
                                                <svg className="h-4 w-4 mr-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                <span>Utente: {acc.auth_user || 'N/D'}</span>
                                            </div>
                                            <div className="flex items-center text-sm text-slate-600">
                                                <svg className="h-4 w-4 mr-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                                                </svg>
                                                <span>IMAP: {acc.imap_host || 'N/D'}:{acc.imap_port || 'N/D'}</span>
                                            </div>
                                            <div className="flex items-center text-sm text-slate-600">
                                                <svg className="h-4 w-4 mr-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                <span>SMTP: {acc.smtp_host || 'N/D'}:{acc.smtp_port || 'N/D'}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-4 pt-3 border-t border-slate-100">
                                            {canEdit && (
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        onClick={() => handleOpenModal(acc)}
                                                        className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-sm flex items-center"
                                                        aria-label="Modifica account"
                                                        title="Modifica account"
                                                    >
                                                        <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                        </svg>
                                                        Modifica
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(acc.id)}
                                                        className="px-3 py-1 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors text-sm flex items-center"
                                                        aria-label="Elimina account"
                                                        title="Elimina account"
                                                    >
                                                        <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        Elimina
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {/* Paginazione per DESKTOP */}
                        {!isMobile && totalPages > 1 && (
                            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-slate-200">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    <button 
                                        onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Precedente
                                    </button>
                                    <button 
                                        onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Successivo
                                    </button>
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-slate-700">
                                            Mostrando da <span className="font-medium">{indexOfFirstItem + 1}</span> a{' '}
                                            <span className="font-medium">{Math.min(indexOfLastItem, filteredAccounts.length)}</span> di{' '}
                                            <span className="font-medium">{filteredAccounts.length}</span> risultati
                                            {searchTerm && ` per "${searchTerm}"`}
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                            <button 
                                                onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <span className="sr-only">Previous</span>
                                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                            
                                            {/* Numeri di pagina */}
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                                                <button
                                                    key={number}
                                                    onClick={() => paginate(number)}
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                        currentPage === number
                                                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                            : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    {number}
                                                </button>
                                            ))}
                                            
                                            <button 
                                                onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <span className="sr-only">Next</span>
                                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Paginazione per MOBILE */}
                        {isMobile && mobileTotalPages > 1 && (
                            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-slate-200">
                                <div className="flex-1 flex justify-between">
                                    <button 
                                        onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Precedente
                                    </button>
                                    <span className="text-sm text-slate-700">
                                        Pagina {currentPage} di {mobileTotalPages}
                                    </span>
                                    <button 
                                        onClick={() => currentPage < mobileTotalPages && paginate(currentPage + 1)}
                                        disabled={currentPage === mobileTotalPages}
                                        className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Successivo
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-8">
                        <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-slate-900">
                            {searchTerm ? `Nessun account trovato per "${searchTerm}"` : 'Nessun account email trovato'}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            {searchTerm ? 'Prova a modificare i criteri di ricerca' : 'Prova a modificare i criteri di ricerca o aggiungi un nuovo account email.'}
                        </p>
                        {canEdit && !searchTerm && (
                            <div className="mt-6">
                                <button
                                    onClick={() => handleOpenModal()}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                    Nuovo Account
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
// --- Componente Modale per la Gestione Utente ---
function UserEditModal({ userId, onSave, onCancel }) {
    const { hasPermission } = useAuth();
    const [formData, setFormData] = useState({});
    const [availableAccounts, setAvailableAccounts] = useState([]);
    const [selectedAccounts, setSelectedAccounts] = useState(new Set());
    const [roles, setRoles] = useState([]);
    const [userTypes, setUserTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('anagrafica');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, accountsRes, rolesRes, typesRes] = await Promise.all([
                    api.get(`/amministrazione/utenti/${userId}`),
                    api.get('/amministrazione/mail-accounts'),
                    api.get('/amministrazione/ruoli-assegnabili'),
                    api.get('/amministrazione/tipi-utente')
                ]);

                if (userRes.data.success) {
                    setFormData(userRes.data.data.userData);
                    setSelectedAccounts(new Set(userRes.data.data.assignedMailAccountIds));
                }
                if (accountsRes.data.success) setAvailableAccounts(accountsRes.data.data);
                if (rolesRes.data.success) setRoles(rolesRes.data.data);
                if (typesRes.data.success) setUserTypes(typesRes.data.data);

            } catch (error) {
                console.error("Errore nel caricamento dati per il modale utente", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [userId]);

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? (checked ? 1 : 0) : value }));
    };

    const handleAccountToggle = (accountId) => {
        const newSelection = new Set(selectedAccounts);
        if (newSelection.has(accountId)) newSelection.delete(accountId);
        else newSelection.add(accountId);
        setSelectedAccounts(newSelection);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(userId, {
            userData: formData,
            mailAccountIds: Array.from(selectedAccounts)
        });
    };

    const ruoloUtente = useMemo(() => {
        return roles.find(r => r.id === formData.id_ruolo)?.tipo || 'N/D';
    }, [formData.id_ruolo, roles]);

    const tipoUtente = useMemo(() => {
        return userTypes.find(t => t.Codice === formData.Codice_Tipo_Utente)?.Descrizione || 'N/D';
    }, [formData.Codice_Tipo_Utente, userTypes]);

    if (isLoading) return <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><p className="text-white">Caricamento...</p></div>;

    const TabButton = ({ tabId, label }) => (
        <button
            type="button"
            onClick={() => setActiveTab(tabId)}
            className={`px-4 py-2 font-medium text-sm rounded-t-md ${
                activeTab === tabId
                    ? 'bg-white border-b-2 border-blue-600 text-blue-600'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-5xl max-h-[95vh] flex flex-col">
                <h3 className="text-xl font-semibold mb-4 text-slate-800">Gestisci Utente: {formData.nome} {formData.cognome}</h3>
                
                <div className="flex border-b border-slate-200 mb-4">
                    <TabButton tabId="anagrafica" label="Dati Anagrafici" />
                    <TabButton tabId="funzionali" label="Dati Funzionali" />
                    <TabButton tabId="mail" label="Settaggi Mail" />
                </div>

                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-4">
                    
                    {activeTab === 'anagrafica' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Colonna 1: Anagrafica Base */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">ID Utente</label>
                                    <input value={formData.id || ''} disabled className="mt-1 block w-full p-2 border rounded-md bg-slate-100" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Nome</label>
                                    <input name="nome" value={formData.nome || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Cognome</label>
                                    <input name="cognome" value={formData.cognome || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Codice Fiscale</label>
                                    <input name="codice_fiscale" value={formData.codice_fiscale || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md" />
                                </div>
                            </div>

                            {/* Colonna 2: Contatti Email */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Email (Registrazione)</label>
                                    <input value={formData.email || ''} disabled className="mt-1 block w-full p-2 border rounded-md bg-slate-100" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Email Contatto</label>
                                    <input name="mail_contatto" value={formData.mail_contatto || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md" placeholder="Email pubblica..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Email Collaboratore</label>
                                    <input name="mail_collaboratore" value={formData.mail_collaboratore || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md" placeholder="Email interna..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Email PEC</label>
                                    <input name="mail_pec" value={formData.mail_pec || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md" placeholder="Indirizzo PEC..." />
                                </div>
                            </div>
                            
                            {/* Colonna 3: Residenza e Telefono */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Telefono</label>
                                    <input name="telefono" value={formData.telefono || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Indirizzo</label>
                                    <input name="indirizzo" value={formData.indirizzo || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Città</label>
                                    <input name="citta" value={formData.citta || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">Provincia</label>
                                        <input name="provincia" value={formData.provincia || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md" maxLength="2" placeholder="Es. MI" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700">CAP</label>
                                        <input name="cap" value={formData.cap || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md" maxLength="5" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'funzionali' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Colonna 1: Opzioni e Note */}
                            <div className="space-y-4">
                                <h4 className="font-semibold text-slate-600 border-b pb-2">Opzioni</h4>
                                <div className="flex items-center gap-6 pt-2">
                                    <div className="flex items-center">
                                        <input type="checkbox" name="attivo" id="user-active" checked={!!formData.attivo} onChange={handleFormChange} className="h-4 w-4" />
                                        <label htmlFor="user-active" className="ml-2">Utente Attivo</label>
                                    </div>
                                    <div className="flex items-center">
                                        <input type="checkbox" name="privacy" id="user-privacy" checked={!!formData.privacy} onChange={handleFormChange} className="h-4 w-4" />
                                        <label htmlFor="user-privacy" className="ml-2">Privacy Accettata</label>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Note</label>
                                    <textarea name="note" value={formData.note || ''} onChange={handleFormChange} className="mt-1 block w-full p-2 border rounded-md h-32"></textarea>
                                </div>
                            </div>
                            
                            {/* Colonna 2: Credenziali (Sola Lettura) */}
                            <div className="space-y-4">
                                <h4 className="font-semibold text-slate-600 border-b pb-2">Credenziali (Sola Lettura)</h4>
                                <div className="bg-slate-50 p-4 rounded-md space-y-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase">Ruolo</label>
                                        <p className="text-base text-slate-800">{ruoloUtente}</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase">Tipo Utente</label>
                                        <p className="text-base text-slate-800">{tipoUtente}</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase">Livello</label>
                                        <p className="text-base text-slate-800">{formData.livello || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'mail' && (
                         <div className="space-y-4">
                            <h4 className="font-semibold text-slate-600 border-b pb-2">Account Email Associati</h4>
                            <div className="space-y-2 max-h-96 overflow-y-auto p-2">
                                {availableAccounts.length > 0 ? availableAccounts.map(acc => (
                                    <div key={acc.id} className="flex items-center p-2 rounded hover:bg-slate-50">
                                        <input 
                                            type="checkbox" 
                                            id={`acc-${acc.id}`} 
                                            checked={selectedAccounts.has(acc.id)} 
                                            onChange={() => handleAccountToggle(acc.id)} 
                                            className="h-4 w-4" 
                                        />
                                        <label htmlFor={`acc-${acc.id}`} className="ml-2">{acc.nome_account}</label>
                                    </div>
                                )) : <p className="text-slate-500">Nessun account email configurato per la ditta.</p>}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-4 pt-6 border-t mt-6">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-200 rounded-md">Annulla</button>
                        <button 
                            type="submit" 
                            className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-slate-400"
                            disabled={!hasPermission('UTENTI_EDIT')}
                        >
                            Salva Modifiche
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// =====================================================================
// ============ COMPONENTE PRINCIPALE DEL MODULO =======================
// =====================================================================
const AmministrazioneModule = () => {
    const { hasPermission } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    const menuItems = [
        { key: 'anagrafiche', label: 'Gestione Aziende', shortLabel: '🏢 Aziende', permission: 'ANAGRAFICHE_VIEW', icon: BuildingOfficeIcon },
        { key: 'utenti', label: 'Gestione Utenti', shortLabel: '👥 Utenti', permission: 'UTENTI_VIEW', icon: UsersIcon },
        { key: 'pdc', label: 'Piano dei Conti', shortLabel: '🔧 PDC', permission: 'PDC_VIEW', icon: WrenchScrewdriverIcon, minLevel: 90 },
        { key: 'mail_accounts', label: 'Account Email', shortLabel: '📧 Email', permission: 'MAIL_ACCOUNTS_VIEW', icon: QueueListIcon },
        { key: 'ppa', label: 'Configurazione PPA', shortLabel: '📋 PPA', permission: 'PPA_MODULE', icon: QueueListIcon },
        { key: 'progressivi', label: 'Gestione Progressivi', shortLabel: '#️⃣ Progressivi', permission: 'PROGRESSIVI_MANAGE', icon: HashtagIcon },
    ];

    const accessibleMenuItems = menuItems.filter(item => hasPermission(item.permission));
    const [activeMenu, setActiveMenu] = useState(accessibleMenuItems.length > 0 ? accessibleMenuItems[0].key : null);

    // Trova l'item attivo per mostrarlo nel dropdown
    const activeMenuItem = accessibleMenuItems.find(item => item.key === activeMenu);

    const renderContent = () => {
        if (!activeMenu) return <NoPermissionMessage />;

        const currentItem = menuItems.find(item => item.key === activeMenu);
        if (!currentItem || !hasPermission(currentItem.permission)) {
            return <NoPermissionMessage />;
        }
        
        switch (activeMenu) {
            case 'anagrafiche': return <AnagraficheManager />;
            case 'utenti': return <UserManager />;
            case 'pdc': return <PianoContiManager />;
            case 'mail_accounts': return <MailAccountsManager />;
            case 'ppa': return <PPAModule />;
            case 'progressivi': return <ProgressiviManager />;
            default: return <p className="p-6">Seleziona una voce dal menu.</p>;
        }
    };

    return (
        <div className="flex flex-col lg:flex-row w-full h-full bg-gray-50">
            {/* DROPDOWN NAVIGATION per mobile (< 1024px) */}
            <div className="lg:hidden bg-white border-b border-slate-200">
                <div className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full flex items-center justify-between py-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        <span className="flex items-center gap-2">
                            {activeMenuItem && <activeMenuItem.icon className="h-5 w-5" />}
                            {activeMenuItem ? activeMenuItem.label : 'Seleziona...'}
                        </span>
                        <ChevronDownIcon className={`h-5 w-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg z-50 max-h-[60vh] overflow-y-auto">
                            {accessibleMenuItems.map(item => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.key}
                                        onClick={() => {
                                            setActiveMenu(item.key);
                                            setIsDropdownOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 py-3 px-4 text-sm transition-colors ${
                                            activeMenu === item.key 
                                                ? 'bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-600' 
                                                : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <Icon className="h-5 w-5 flex-shrink-0" />
                                        <span>{item.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* SIDEBAR per desktop (≥ 1024px) */}
            <aside className="hidden lg:block w-64 border-r border-slate-200 p-4 bg-white flex-shrink-0">
                <h2 className="font-bold mb-4 text-slate-700 text-lg">Menu Amministrazione</h2>
                <ul className="space-y-2">
                    {accessibleMenuItems.map(item => {
                        const Icon = item.icon;
                        return (
                            <li key={item.key}>
                                <button 
                                    onClick={() => setActiveMenu(item.key)} 
                                    className={`w-full text-left p-2 rounded-md transition-colors text-sm flex items-center gap-3 ${
                                        activeMenu === item.key 
                                            ? 'bg-blue-100 text-blue-700 font-semibold' 
                                            : 'hover:bg-slate-100'
                                    }`}
                                >
                                    <Icon className="h-5 w-5 flex-shrink-0" />
                                    <span>{item.label}</span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 p-4 md:p-6 overflow-y-auto">
                {renderContent()}
            </main>
        </div>
    );
};

export default AmministrazioneModule;