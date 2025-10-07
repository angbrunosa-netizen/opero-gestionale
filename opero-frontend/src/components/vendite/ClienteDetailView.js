/**
 * @file opero-frontend/src/components/vendite/ClienteDetailView.js
 * @description Componente per la visualizzazione e modifica del dettaglio di un cliente, con select ricercabili e gestione stato.
 * @version 1.2
 */
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import { ArrowLeftIcon, BuildingOffice2Icon, MapPinIcon, BanknotesIcon, TruckIcon, UserCircleIcon, LinkIcon } from '@heroicons/react/24/outline';
import SearchableSelect from '../../shared/SearchableSelect'; 

// Sotto-componente per un campo del form, per ridurre la duplicazione
const FormField = ({ label, name, value, onChange, type = 'text', disabled = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <input
            type={type}
            id={name}
            name={name}
            value={value || ''}
            onChange={onChange}
            className="mt-1 block w-full input-style"
            disabled={disabled}
        />
    </div>
);


const ClienteDetailView = ({ clienteId, onBack }) => {
    const [cliente, setCliente] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('anagrafica');
    const { hasPermission } = useAuth();
    const canEdit = hasPermission('VA_CLIENTI_MANAGE');

    // State per le opzioni dei select
    const [categorieOptions, setCategorieOptions] = useState([]);
    const [gruppiOptions, setGruppiOptions] = useState([]);
    const [matriciOptions, setMatriciOptions] = useState([]);
    const [pagamentiOptions, setPagamentiOptions] = useState([]);

    const fetchClienteDetails = useCallback(async () => {
        setLoading(true);
        try {
            // Carica in parallelo i dettagli del cliente e le opzioni per i select
            const [clienteRes, categorieRes, gruppiRes, matriciRes, pagamentiRes] = await Promise.all([
                api.get(`/vendite/clienti/${clienteId}`),
                api.get('/vendite/categorie'),
                api.get('/vendite/gruppi'),
                api.get('/vendite/matrici-sconti'),
                api.get('/amministrazione/tipi-pagamento')
            ]);
            
            setCliente(clienteRes.data);
            
            // Funzione per appiattire l'albero delle categorie
            const flattenCategories = (categories, level = 0) => {
                let list = [];
                categories.forEach(cat => {
                    list.push({ id: cat.id, descrizione: `${'\u00A0'.repeat(level*4)}└ ${cat.nome_categoria}` });
                    if (cat.children) {
                        list = list.concat(flattenCategories(cat.children, level + 1));
                    }
                });
                return list;
            };

            setCategorieOptions(flattenCategories(categorieRes.data));
            setGruppiOptions(gruppiRes.data);
            setMatriciOptions(matriciRes.data);
            setPagamentiOptions(pagamentiRes.data);

        } catch (error) {
            toast.error("Errore nel caricamento dei dati.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [clienteId]);

    useEffect(() => {
        fetchClienteDetails();
    }, [fetchClienteDetails]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCliente(prev => ({ ...prev, [name]: value }));
    };
    
    // Handler specifico per i componenti SearchableSelect
    const handleSelectChange = (name, value) => {
        setCliente(prev => ({ ...prev, [name]: value }));
    };


    const handleSave = async () => {
        try {
            await api.put(`/vendite/clienti/${clienteId}`, cliente);
            toast.success("Cliente aggiornato con successo!");
            fetchClienteDetails();
        } catch (error) {
            toast.error("Errore durante l'aggiornamento del cliente.");
            console.error(error);
        }
    };

    const tabs = [
        { id: 'anagrafica', label: 'Anagrafica', icon: BuildingOffice2Icon },
        { id: 'condizioni', label: 'Condizioni', icon: BanknotesIcon },
        { id: 'logistica', label: 'Logistica', icon: TruckIcon },
        { id: 'referenti', label: 'Referenti', icon: UserCircleIcon },
        { id: 'altro', label: 'Altro', icon: LinkIcon }
    ];

    if (loading) {
        return <div className="p-8">Caricamento in corso...</div>;
    }

    if (!cliente) {
        return <div className="p-8">Nessun dato cliente trovato.</div>;
    }

    return (
        <div className="p-6 bg-gray-100 min-h-full">
            <ToastContainer position="bottom-right" />
            
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200">
                        <ArrowLeftIcon className="h-6 w-6 text-gray-700" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{cliente.ragione_sociale}</h1>
                        <p className="text-sm text-gray-500">ID: {cliente.id}</p>
                    </div>
                </div>
                {canEdit && <button onClick={handleSave} className="btn-primary">Salva Modifiche</button>}
            </div>

            <div className="bg-white p-2 rounded-lg shadow-md mb-6">
                <nav className="flex space-x-2" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 font-medium text-sm rounded-md ${activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                            <tab.icon className="h-5 w-5" />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            
            <div className="space-y-6">
                {activeTab === 'anagrafica' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                           <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><BuildingOffice2Icon className="h-6 w-6 mr-2 text-blue-500"/>Dati Aziendali</h3>
                           <div className="space-y-4">
                                <FormField label="Ragione Sociale" name="ragione_sociale" value={cliente.ragione_sociale} onChange={handleInputChange} disabled={!canEdit}/>
                                <FormField label="Partita IVA" name="piva" value={cliente.piva} onChange={handleInputChange} disabled={!canEdit}/>
                                <FormField label="Codice Fiscale" name="cf" value={cliente.cf} onChange={handleInputChange} disabled={!canEdit}/>
                                
                                {/* --- NUOVO CAMPO STATO CLIENTE --- */}
                                <div>
                                    <label htmlFor="stato" className="block text-sm font-medium text-gray-700">Stato Cliente</label>
                                    <select
                                        id="stato"
                                        name="stato"
                                        value={cliente.stato || 'Attivo'}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full input-style"
                                        disabled={!canEdit}
                                    >
                                        <option value="Attivo">Attivo</option>
                                        <option value="Sospeso">Sospeso</option>
                                        <option value="Bloccato">Bloccato</option>
                                    </select>
                                </div>

                                <FormField label="Email" name="email" value={cliente.email} onChange={handleInputChange} type="email" disabled={!canEdit}/>
                                <FormField label="PEC" name="pec" value={cliente.pec} onChange={handleInputChange} type="email" disabled={!canEdit}/>
                                <FormField label="Codice SDI" name="codice_sdi" value={cliente.codice_sdi} onChange={handleInputChange} disabled={!canEdit}/>
                           </div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                           <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><MapPinIcon className="h-6 w-6 mr-2 text-green-500"/>Sede Legale</h3>
                           <div className="space-y-4">
                                <FormField label="Indirizzo" name="indirizzo" value={cliente.indirizzo} onChange={handleInputChange} disabled={!canEdit}/>
                                <FormField label="Città" name="citta" value={cliente.citta} onChange={handleInputChange} disabled={!canEdit}/>
                                <FormField label="Provincia" name="provincia" value={cliente.provincia} onChange={handleInputChange} disabled={!canEdit}/>
                                <FormField label="CAP" name="cap" value={cliente.cap} onChange={handleInputChange} disabled={!canEdit}/>
                                <FormField label="Telefono" name="tel1" value={cliente.tel1} onChange={handleInputChange} disabled={!canEdit}/>
                           </div>
                        </div>
                    </div>
                )}
                {activeTab === 'condizioni' && (
                     <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><BanknotesIcon className="h-6 w-6 mr-2 text-yellow-500"/>Condizioni Commerciali</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* --- CAMPI SEMPLICI --- */}
                            <FormField label="Listino Cessione (1-6)" name="listino_cessione" value={cliente.listino_cessione} onChange={handleInputChange} type="number" disabled={!canEdit}/>
                            <FormField label="Listino Pubblico (1-6)" name="listino_pubblico" value={cliente.listino_pubblico} onChange={handleInputChange} type="number" disabled={!canEdit}/>
                            
                            {/* --- NUOVI COMPONENTI DI RICERCA --- */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Categoria Cliente</label>
                                <SearchableSelect
                                    options={categorieOptions}
                                    value={cliente.id_categoria_cliente}
                                    onChange={(value) => handleSelectChange('id_categoria_cliente', value)}
                                    placeholder="Seleziona una categoria"
                                    displayField="descrizione"
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Gruppo Cliente</label>
                                <SearchableSelect
                                    options={gruppiOptions}
                                    value={cliente.id_gruppo_cliente}
                                    onChange={(value) => handleSelectChange('id_gruppo_cliente', value)}
                                    placeholder="Seleziona un gruppo"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Matrice Sconti</label>
                                <SearchableSelect
                                    options={matriciOptions}
                                    value={cliente.id_matrice_sconti}
                                    onChange={(value) => handleSelectChange('id_matrice_sconti', value)}
                                    placeholder="Seleziona una matrice"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tipo Pagamento</label>
                                <SearchableSelect
                                    options={pagamentiOptions}
                                    value={cliente.id_tipo_pagamento}
                                    onChange={(value) => handleSelectChange('id_tipo_pagamento', value)}
                                    placeholder="Seleziona un tipo di pagamento"
                                />
                            </div>
                        </div>
                     </div>
                )}
            </div>
        </div>
    );
};

export default ClienteDetailView;

