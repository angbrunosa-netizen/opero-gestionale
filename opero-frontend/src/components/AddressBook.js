import React, { useState, useEffect } from 'react';
import api from '../services/api'; 
import ContactForm from './ContactForm'; 
import ListForm from './ListForm'; // <-- 1. IMPORTA IL NUOVO FORM
import ListMembersManager from './ListMembersManager'; 
// --- SINTASSI DI IMPORT CORRETTA PER HEROICONS V2 ---
import { XMarkIcon as XIcon, PencilIcon, TrashIcon, UserGroupIcon, UserIcon, PlusIcon } from '@heroicons/react/24/solid';

const AddressBook = ({ isModal = false, onClose = () => {}, onSelectContact = () => {}, onSelectList = () => {} }) => {
    // ---- STATI DEL COMPONENTE ----
    const [view, setView] = useState('contatti');
    const [contatti, setContatti] = useState([]);
    const [liste, setListe] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
       const [isListManagerOpen, setIsListManagerOpen] = useState(false);
    const [selectedList, setSelectedList] = useState(null);

    // ...funzioni esistenti...

    const handleOpenListManager = (list) => {
        setSelectedList(list);
        setIsListManagerOpen(true);
    };
     const handleCloseListManager = () => {
        setSelectedList(null);
        setIsListManagerOpen(false);
    };

    // --- Stati per gestire il form di modifica/creazione ---
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingContact, setEditingContact] = useState(null);

// --- 2.  STATI PER IL FORM DELLE LISTE ---
    const [isListFormOpen, setIsListFormOpen] = useState(false);
    const [editingList, setEditingList] = useState(null);


    // ---- EFFETTI ----
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [contattiRes, listeRes] = await Promise.all([
                    api.get('/rubrica/contatti'),
                    api.get('/rubrica/liste')
                ]);
                setContatti(contattiRes.data);
                setListe(listeRes.data);
                setError(null);
            } catch (err) {
                setError("Impossibile caricare i dati della rubrica.");
                console.error("Errore fetch dati rubrica:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // ---- FUNZIONI PER GESTIRE IL FORM ----
    const handleEdit = (contact) => {
        setEditingContact(contact);
        setIsFormOpen(true);
    };
    
    const handleCreateContact  = () => {
        setEditingContact(null);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingContact(null);
    };

    const handleSaveContact = (savedContact) => {
        if (editingContact) {
            setContatti(prev => prev.map(c => c.id === savedContact.id ? savedContact : c));
        } else {
            setContatti(prev => [savedContact, ...prev]);
        }
    };

    const handleDelete = async (id, type) => {
        // ... (logica di eliminazione) ...
    };
    const handleCreateList = () => { setEditingList(null); setIsListFormOpen(true); };
    const handleEditList = (list) => { setEditingList(list); setIsListFormOpen(true); };
    const handleCloseListForm = () => setIsListFormOpen(false);
    const handleSaveList = (savedList) => {
        if (editingList) {
            setListe(prev => prev.map(l => l.id === savedList.id ? savedList : l));
        } else {
            setListe(prev => [savedList, ...prev]);
        }
    }

    // ---- RENDER ----
    const contentPanel = (
        <div className={`bg-white rounded-lg shadow-xl w-full flex flex-col ${isModal ? 'h-3/4 max-w-4xl' : 'h-full'}`}>
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-bold text-gray-800">Rubrica</h2>
                {isModal && (
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200">
                        <XIcon className="h-6 w-6" />
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex border-b px-4">
                <button onClick={() => setView('contatti')} className={`flex items-center gap-2 px-4 py-3 -mb-px text-sm ${view === 'contatti' ? 'border-b-2 border-blue-500 text-blue-600 font-semibold' : 'text-gray-500'}`}>
                    <UserIcon className="h-5 w-5" /> Contatti
                </button>
                <button onClick={() => setView('liste')} className={`flex items-center gap-2 px-4 py-3 -mb-px text-sm ${view === 'liste' ? 'border-b-2 border-blue-500 text-blue-600 font-semibold' : 'text-gray-500'}`}>
                    <UserGroupIcon className="h-5 w-5" /> Liste
                </button>
            </div>

            {/* Corpo */}
            <div className="flex-grow p-4 overflow-y-auto">
                {isLoading && <p>Caricamento...</p>}
                {error && <p className="text-red-500">{error}</p>}
                
                {!isLoading && !error && (
                    <>
                        {view === 'contatti' && (
                            <div>
                                <button onClick={handleCreateContact } className="mb-4 flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600">
                                    <PlusIcon className="h-5 w-5" /> Nuovo Contatto
                                </button>
                                <ul className="divide-y divide-gray-200">
                            {contatti.map(c => (
                                <li key={c.id} className="flex justify-between items-center p-3 hover:bg-gray-50">
                                    <div><p className="font-semibold">{c.nome} {c.cognome}</p><p className="text-sm text-gray-600">{c.email}</p></div>
                                    <div className="flex items-center gap-2">
                                        {/* Pulsante Seleziona per i singoli contatti */}
                                        {isModal && <button onClick={() => { onSelectContact(c); onClose(); }} className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">Seleziona</button>}
                                        <button onClick={() => handleEditContact(c)} className="text-gray-500 hover:text-blue-600 p-1"><PencilIcon className="h-5 w-5"/></button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                            </div>
                        )}
                     {view === 'liste' && (
                   
                   <div>
                       {/* ... */}
                       <ul className="divide-y divide-gray-200">
                           {liste.map(l => (
                               <li key={l.id} className="flex justify-between items-center p-3 hover:bg-gray-50">
                                   <p className="font-semibold">{l.nome_lista}</p>
                                   <div className="flex items-center gap-2">
                                       {/* --- PULSANTE SELEZIONA PER LE LISTE --- */}
                                       {isModal && <button onClick={() => { onSelectList(l); onClose(); }} className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">Seleziona</button>}
                                       <button onClick={() => handleOpenListManager(l)} title="Gestisci Membri" className="text-gray-500 hover:text-blue-600 p-1">
                                           <UserGroupIcon className="h-5 w-5"/>
                                       </button>
                                       <button onClick={() => handleEditList(l)} title="Modifica Nome/Descrizione" className="text-gray-500 hover:text-blue-600 p-1">
                                           <PencilIcon className="h-5 w-5"/>
                                       </button>
                                   </div>
                               </li>
                           ))}
                       </ul>
                   </div>
                )}

                    </>
                )}
            </div>

            {isFormOpen && (
                <ContactForm 
                    contactToEdit={editingContact}
                    onClose={handleCloseForm}
                    onSave={handleSaveContact}
                />
            )}
            {isListFormOpen && <ListForm listToEdit={editingList} onClose={handleCloseListForm} onSave={handleSaveList} />}
            {isListManagerOpen && <ListMembersManager list={selectedList} onClose={handleCloseListManager} />}
        </div>
    );

    if (isModal) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
                {contentPanel}
            </div>
        );
    }
    
    return contentPanel;
};

export default AddressBook;
