// #####################################################################
// # Modulo Amministrazione - v9.1 (Fix Modifica e Dropdown)
// # File: opero-frontend/src/components/AmministrazioneModule.js
// #####################################################################

import React, { useState, useCallback, useEffect ,useMemo} from 'react';
import { api } from '../services/api'; 
import PianoContiManager from './cont-smart/PianoContiManager'; // Importato il componente reale
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Cog6ToothIcon,
        ChevronDownIcon,
         UsersIcon, BuildingOfficeIcon, QueueListIcon, EnvelopeIcon,BuildingOffice2Icon,WrenchScrewdriverIcon, DocumentTextIcon, AtSymbolIcon, Cog8ToothIcon, HashtagIcon} from '@heroicons/react/24/solid'; // Aggiunta icona per PPA
import UserForm from './UserForm'; // Esempio, potrebbero essere gestori più complessi
import PPAModule from './PPAModule'; // <-- IMPORTA IL NUOVO MODULO PPA
import ProgressiviManager from './amministrazione/ProgressiviManager';
//import DynamicReportTable from '../shared/DynamicReportTable'; // <-- IMPORTAZIONE COMPONENTE
import { PencilIcon, UserPlusIcon } from '@heroicons/react/24/outline';

// Importa il componente AdvancedDataGrid dal percorso corretto
import AdvancedDataGrid from '../shared/AdvancedDataGrid'; // Assicurati che il percorso sia giusto!

import InvitaUtenteModal from '../shared/InvitaUtenteModal';
// --- MODIFICA: Import del nuovo modale ---
import ShowLinkModal from '../shared/ShowLinkModal';


//const AnagraficheManager = () => <div className="p-6"><h2 className="text-2xl font-bold">Gestione Anagrafiche</h2><p>Interfaccia per la gestione di Clienti e Fornitori.</p></div>;
//const UserManager = () => <div className="p-6"><h2 className="text-2xl font-bold">Gestione Utenti</h2><p>Interfaccia per la gestione degli utenti della ditta.</p></div>;
//const PianoDeiContiManager = () => <div className="p-6"><h2 className="text-2xl font-bold">Piano dei Conti</h2><p>Interfaccia per la gestione di Mastri, Conti e Sottoconti.</p></div>;
//const MailAccountsManager = () => <div className="p-6"><h2 className="text-2xl font-bold">Gestione Account Email</h2><p>Interfaccia per la configurazione degli account email della ditta.</p></div>;
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
                    // Per le nuove anagrafiche, imposta uno stato iniziale pulito
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
                                 {/* // <span style="color:green;">// MODIFICA: Rimosso il 'disabled' per permettere la modifica della relazione</span> */}
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


// --- Componente per la Gestione Utenti (Placeholder) ---
// --- Componente per la Gestione Utenti ---
// --- Componente per la Gestione Utenti ---
// --- Componente per la Gestione Utenti (CORRETTO) ---
function UserManager() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);

    // Stato per il modale di INVITO (usato solo per aprirlo/chiuderlo)
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    // Lo stato isInviting non serve più qui, è gestito dentro InvitaUtenteModal

    const { hasPermission } = useAuth();

    // Funzione per caricare gli utenti
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const { data } = await api.get('/amministrazione/utenti');
            if (data.success) {
                setUsers(data.data);
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

    // --- RIMOSSA LA FUNZIONE handleSendInvite ---
    // La logica di invio è interna a InvitaUtenteModal e non possiamo cambiarla.
    // Useremo la prop onInviteSent del modale per aggiornare i dati.

    // Funzione chiamata da InvitaUtenteModal quando l'invito ha successo
    const handleInviteSuccess = useCallback(() => {
        setIsInviteModalOpen(false); // Chiudi il modale
        fetchData(); // Aggiorna la lista utenti
    }, [fetchData]); // Dipende solo da fetchData


    // Funzioni per aprire/chiudere il modale di MODIFICA
    const handleOpenEditModal = (userId) => {
        if (!hasPermission('UTENTI_EDIT')) {
             toast.warn('Non hai i permessi per modificare gli utenti.');
             return;
        }
        setSelectedUserId(userId);
        setIsEditModalOpen(true);
    };

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


    // Permessi per UI condizionale (controlla UTENTI_CREATE per il pulsante)
    const canInvite = hasPermission('UTENTI_CREATE'); // Visibilità pulsante basata su UTENTI_CREATE
    const canEdit = hasPermission('UTENTI_EDIT');

    // Colonne per AdvancedDataGrid
    const columns = useMemo(() => [
        { accessorKey: 'cognome', header: 'Cognome', size: 150 },
        { accessorKey: 'nome', header: 'Nome', size: 150 },
        { accessorKey: 'email', header: 'Email', size: 250 },
        { accessorKey: 'ruolo', header: 'Ruolo', size: 150 },
        {
            id: 'actions',
            header: 'Azioni',
            size: 100,
            enableSorting: false,
            enableHiding: false,
            cell: ({ row }) => (
                canEdit && (
                    <div className="flex justify-center">
                        <button
                            onClick={() => handleOpenEditModal(row.original.id)}
                            className="p-1 text-blue-600 hover:text-blue-900 focus:outline-none"
                            aria-label="Gestisci utente"
                            title="Gestisci utente"
                        >
                            <PencilIcon className="h-5 w-5" />
                        </button>
                    </div>
                )
            ),
        },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ], [canEdit]); // Rimosso handleOpenEditModal dalle dipendenze, non cambia


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
                     isOpen={isInviteModalOpen} // Passa lo stato per la visibilità
                     onClose={() => setIsInviteModalOpen(false)} // Passa funzione per chiudere
                     onInviteSent={handleInviteSuccess} // Passa funzione da chiamare DOPO l'invio riuscito
                     id_ruolo={4} // Passa 4 o un ruolo di default se necessario dal modale
                     // NOTA: Non passiamo più onSendInvite o isLoading perché sono gestiti internamente dal modale
                 />
             )}


            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                <h3 className="text-xl font-semibold text-slate-700">Gestione Utenti</h3>
                {canInvite && ( // Mostra pulsante se UTENTI_CREATE è true
                     <button
                        onClick={() => setIsInviteModalOpen(true)} // Apre il modale
                        className={`px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 flex items-center gap-2 transition duration-150 ease-in-out`}
                        // disabled non è più necessario qui, lo gestirà il modale internamente
                    >
                        <UserPlusIcon className="h-5 w-5" />
                        Invita Nuovo Utente
                    </button>
                )}
            </div>

            {error && !isLoading && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Errore: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
             )}

             <div style={{ height: 600, width: '100%' }} className="bg-white shadow rounded-lg">
                 <AdvancedDataGrid
                     data={users}
                     columns={columns}
                     loading={isLoading}
                     getRowId={(row) => row.id}
                     initialState={{
                         pagination: { paginationModel: { pageSize: 10 } },
                     }}
                     pageSizeOptions={[5, 10, 25, 50]}
                     autoHeight={false}
                 />
            </div>
        </div>
    );
}
/*

// --- Componente per la Gestione Anagrafiche (AGGIORNATO) ---
function AnagraficheManager() {
    const [anagrafiche, setAnagrafiche] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAnagraficaId, setSelectedAnagraficaId] = useState(null);
    const { hasPermission } = useAuth();

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await api.get('/amministrazione/anagrafiche');
            if (data.success) {
                setAnagrafiche(data.data);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Errore di connessione.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

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
        const isNew = !formData.id;
        const url = isNew ? '/amministrazione/anagrafiche' : `/amministrazione/anagrafiche/${formData.id}`;
        const method = isNew ? 'post' : 'patch';

        try {
            const { data } = await api[method](url, formData);
            alert(data.message);
            if (data.success) {
                handleCloseModal();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Errore durante il salvaggio.');
        }
    };

    const canCreate = true; // hasPermission('ANAGRAFICHE_CREATE');
    const canEdit = true; // hasPermission('ANAGRAFICHE_EDIT');

    if (isLoading) return <div>Caricamento...</div>;
    if (error) return <div className="text-red-500">Errore: {error}</div>;

    return (
        <div>
            {isModalOpen && <AnagraficaEditModal anagraficaId={selectedAnagraficaId} onSave={handleSave} onCancel={handleCloseModal} />}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-slate-700">Anagrafiche Aziende </h3>
                {canCreate && <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">+ Nuova Anagrafica</button>}
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Ragione Sociale</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Relazione</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Sottoconti (C/F/PV)</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Stato</th>
                            {canEdit && <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Azioni</th>}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {anagrafiche.map(row => (
                            <tr key={row.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 text-sm font-medium text-slate-800">{row.ragione_sociale}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{row.relazione}</td>
                                <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                                    {row.codice_cliente && <div>C: {row.codice_cliente}</div>}
                                    {row.codice_fornitore && <div>F: {row.codice_fornitore}</div>}
                                    {row.codice_puntovendita && <div>PV: {row.codice_puntovendita}</div>}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    
                                    <div 
                                        className={`h-3 w-3 rounded-full mx-auto ${row.stato == 1 ? 'bg-green-500' : 'bg-red-500'}`}
                                        title={row.stato == 1 ? 'Attivo' : 'Inattivo'}
                                    ></div>
                                </td>
                                {canEdit && <td className="px-6 py-4 text-center text-sm font-medium"><button onClick={() => handleOpenModal(row.id)} className="text-blue-600 hover:text-blue-900">Modifica</button></td>}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
*/

// --- Componente per la Gestione Anagrafiche ---
function AnagraficheManager() {
    const [anagrafiche, setAnagrafiche] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAnagraficaId, setSelectedAnagraficaId] = useState(null);
    const { hasPermission } = useAuth();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [relazioneFilter, setRelazioneFilter] = useState('');

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await api.get('/amministrazione/anagrafiche');
            if (data.success) {
                setAnagrafiche(data.data);
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

    useEffect(() => { fetchData(); }, [fetchData]);

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

    const filteredAnagrafiche = useMemo(() => {
        return anagrafiche.filter(anag => {
            if (!anag.ragione_sociale) return false;
            const searchTermLower = searchTerm.toLowerCase();
            // <span style="color:green;">// MODIFICA: La ricerca ora include anche città e provincia</span>
            const matchesSearch = anag.ragione_sociale.toLowerCase().includes(searchTermLower) ||
                                  (anag.p_iva && anag.p_iva.includes(searchTerm)) ||
                                  (anag.codice_fiscale && anag.codice_fiscale.toLowerCase().includes(searchTermLower)) ||
                                  (anag.citta && anag.citta.toLowerCase().includes(searchTermLower)) ||
                                  (anag.provincia && anag.provincia.toLowerCase().includes(searchTermLower));

            const matchesRelazione = relazioneFilter ? anag.relazione === relazioneFilter : true;

            return matchesSearch && matchesRelazione;
        });
    }, [anagrafiche, searchTerm, relazioneFilter]);

    const relazioneOptions = useMemo(() => [...new Set(anagrafiche.map(item => item.relazione).filter(Boolean))], [anagrafiche]);

    if (error) return <div className="text-red-500">Errore: {error}</div>;

    return (
        <div>
            {isModalOpen && <AnagraficaEditModal anagraficaId={selectedAnagraficaId} onSave={handleSave} onCancel={handleCloseModal} />}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-slate-700">Anagrafiche Aziende</h3>
                {canCreate && <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">+ Nuova Anagrafica</button>}
            </div>

            <div className="mb-4 p-4 bg-white shadow-md rounded-lg flex items-center gap-4">
                <input
                    type="text"
                    placeholder="Cerca per nome, P.IVA, città..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="p-2 border rounded-md w-full md:w-1/3"
                />
                <select
                    value={relazioneFilter}
                    onChange={(e) => setRelazioneFilter(e.target.value)}
                    className="p-2 border rounded-md"
                >
                    <option value="">Tutte le relazioni</option>
                    {relazioneOptions.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
            </div>
            
            {isLoading ? (
                 <div>Caricamento...</div>
            ) : (
                <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Ragione Sociale</th>
                                {/* // <span style="color:green;">// NUOVO: Aggiunte le colonne Città e Provincia</span> */}
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Città</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Provincia</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Relazione</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Sottoconti (C/F/PV)</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Stato</th>
                                {canEdit && <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Azioni</th>}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {filteredAnagrafiche.length > 0 ? (
                                filteredAnagrafiche.map(row => (
                                    <tr key={row.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-800">{row.ragione_sociale}</td>
                                        {/* // <span style="color:green;">// NUOVO: Aggiunti i dati per Città e Provincia</span> */}
                                        <td className="px-6 py-4 text-sm text-slate-600">{row.citta}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{row.provincia}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{row.relazione}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                                            {row.codice_cliente && <div>C: {row.codice_cliente}</div>}
                                            {row.codice_fornitore && <div>F: {row.codice_fornitore}</div>}
                                            {row.codice_puntovendita && <div>PV: {row.codice_puntovendita}</div>}
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
        </div>
    );
}


// --- Componente Modale per Account Email ---
function MailAccountEditModal({ account, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        nome_account: '', email_address: '', 
        imap_host: '', imap_port: 993, 
        smtp_host: '', smtp_port: 465, 
        auth_user: '', auth_pass: ''
    });
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState({ message: '', type: '' });

    useEffect(() => {
        if (account) {
            setFormData({ ...account, auth_pass: '' });
        }
    }, [account]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value, 10) : value }));
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
                <h3 className="text-xl font-semibold mb-4 text-slate-800">{account ? 'Modifica Account Email' : 'Nuovo Account Email'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* ... campi del form ... */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Nome Account</label>
                            <input name="nome_account" value={formData.nome_account} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Indirizzo Email</label>
                            <input type="email" name="email_address" value={formData.email_address} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Host IMAP</label>
                            <input name="imap_host" value={formData.imap_host} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Porta IMAP</label>
                            <input type="number" name="imap_port" value={formData.imap_port} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Host SMTP</label>
                            <input name="smtp_host" value={formData.smtp_host} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Porta SMTP</label>
                            <input type="number" name="smtp_port" value={formData.smtp_port} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Utente Autenticazione</label>
                            <input name="auth_user" value={formData.auth_user} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Password</label>
                            <input type="password" name="auth_pass" value={formData.auth_pass} onChange={handleChange} required={!account} placeholder={account ? 'Lasciare vuoto per non modificare' : ''} className="mt-1 block w-full p-2 border rounded-md" />
                        </div>
                    </div>

                    {/* --- Risultato del Test --- */}
                    {testResult.message && (
                        <div className={`p-3 rounded-md text-sm ${testResult.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {testResult.message}
                        </div>
                    )}

                    <div className="flex justify-between items-center gap-4 pt-4 border-t mt-4">
                        <button 
                            type="button" 
                            onClick={handleTestConnection} 
                            disabled={isTesting}
                            className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 disabled:bg-gray-400"
                        >
                            {isTesting ? 'Testing...' : 'Testa Account'}
                        </button>
                        <div className="flex gap-4">
                            <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Annulla</button>
                            <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">Salva</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}




// --- Componente per la Gestione Account Email ---
function MailAccountsManager() {
    const [accounts, setAccounts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const { hasPermission } = useAuth();

    const canEdit = hasPermission('MAIL_ACCOUNTS_EDIT',79);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await api.get('/amministrazione/mail-accounts');
            if (data.success) {
                setAccounts(data.data);
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

    return (
        <div>
            {isModalOpen && <MailAccountEditModal account={selectedAccount} onSave={handleSave} onCancel={handleCloseModal} />}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-slate-700">Gestione Account Email</h3>
                {canEdit && <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">+ Nuovo Account</button>}
            </div>
            {isLoading && <p>Caricamento...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!isLoading && !error && (
                <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Nome Account</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Indirizzo Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Utente</th>
                                {canEdit && <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Azioni</th>}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {accounts.map(acc => (
                                <tr key={acc.id}>
                                    <td className="px-6 py-4 font-medium">{acc.nome_account}</td>
                                    <td className="px-6 py-4">{acc.email_address}</td>
                                    <td className="px-6 py-4">{acc.auth_user}</td>
                                    {canEdit && (
                                        <td className="px-6 py-4 text-center space-x-4">
                                            <button onClick={() => handleOpenModal(acc)} className="text-blue-600 hover:text-blue-900">Modifica</button>
                                            <button onClick={() => handleDelete(acc.id)} className="text-red-600 hover:text-red-900">Elimina</button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// --- Componente Modale per la Gestione Utente (POTENZIATO con Etichette) ---
function UserEditModal({ userId, onSave, onCancel }) {
    const { hasPermission } = useAuth(); // <-- 2. INIZIALIZZIAMO L'HOOK PER I PERMESSI
    const [formData, setFormData] = useState({});
    const [availableAccounts, setAvailableAccounts] = useState([]);
    const [selectedAccounts, setSelectedAccounts] = useState(new Set());
    const [roles, setRoles] = useState([]);
    const [userTypes, setUserTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // <-- 3. AGGIUNGIAMO STATO PER LE TAB
    const [activeTab, setActiveTab] = useState('anagrafica');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Il caricamento dati esistente va già bene
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

    // --- Helper per trovare le descrizioni (Sola Lettura Tab 2) ---
    // Usiamo useMemo per non ricalcolare ad ogni render
    const ruoloUtente = useMemo(() => {
        return roles.find(r => r.id === formData.id_ruolo)?.tipo || 'N/D';
    }, [formData.id_ruolo, roles]);

    const tipoUtente = useMemo(() => {
        return userTypes.find(t => t.Codice === formData.Codice_Tipo_Utente)?.Descrizione || 'N/D';
    }, [formData.Codice_Tipo_Utente, userTypes]);
    // --- Fine Helper ---


    if (isLoading) return <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><p className="text-white">Caricamento...</p></div>;

    // --- Componente Helper per le Tab (per pulizia codice) ---
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
                
                {/* <-- 4. INIZIO NAVIGAZIONE TAB --> */}
                <div className="flex border-b border-slate-200 mb-4">
                    <TabButton tabId="anagrafica" label="Dati Anagrafici" />
                    <TabButton tabId="funzionali" label="Dati Funzionali" />
                    <TabButton tabId="mail" label="Settaggi Mail" />
                </div>
                {/* <-- FINE NAVIGAZIONE TAB --> */}

                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-4">
                    
                    {/* <-- 5. PANNELLO TAB 1: DATI ANAGRAFICI --> */}
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

                    {/* <-- 6. PANNELLO TAB 2: DATI FUNZIONALI --> */}
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

                    {/* <-- 7. PANNELLO TAB 3: SETTAGGI MAIL --> */}
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

                    {/* <-- 8. PULSANTI DI AZIONE --> */}
                    <div className="flex justify-end gap-4 pt-6 border-t mt-6">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-200 rounded-md">Annulla</button>
                        <button 
                            type="submit" 
                            className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-slate-400"
                            disabled={!hasPermission('UTENTI_EDIT')} // <-- 9. PROTEZIONE PERMESSO
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
