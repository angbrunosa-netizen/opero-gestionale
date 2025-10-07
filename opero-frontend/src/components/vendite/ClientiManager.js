/**
 * @file opero-frontend/src/components/vendite/ClientiManager.js
 * @description Componente per la gestione dell'anagrafica clienti con layout avanzato, filtri e ricerca.
 * @version 2.3 - Corretto errore TypeError su onRowClick e onEdit.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AdvancedDataGrid from '../../shared/AdvancedDataGrid';
import ClienteDetailView from './ClienteDetailView';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { 
    UsersIcon, 
    UserPlusIcon, 
    CheckCircleIcon, 
    XCircleIcon, 
    PauseCircleIcon, 
    CircleStackIcon,
    WrenchScrewdriverIcon
} from '@heroicons/react/24/solid';

const ClientiManager = ({ onNavigateToTabelle }) => {
    const [view, setView] = useState('list');
    const [selectedClienteId, setSelectedClienteId] = useState(null);
    const [clienti, setClienti] = useState([]);
    const [loading, setLoading] = useState(true);
    const { hasPermission } = useAuth();
    const navigate = useNavigate();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('tutti');

    const fetchClienti = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/vendite/clienti');
            setClienti(res.data);
        } catch (error) {
            toast.error("Errore nel recupero dei clienti.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (view === 'list') {
            fetchClienti();
        }
    }, [fetchClienti, view]);

    const handleViewDetails = (id) => {
        setSelectedClienteId(id);
        setView('detail');
    };

    const handleNewCliente = () => {
        navigate('/amministrazione');
    };
    
    const filteredClienti = useMemo(() => {
        return clienti
            .filter(cliente => {
                if (activeFilter === 'tutti') return true;
                const statoCliente = cliente.stato ? cliente.stato.toLowerCase() : 'n/d';
                return statoCliente === activeFilter;
            })
            .filter(cliente => {
                const search = searchTerm.toLowerCase();
                return (
                    cliente.ragione_sociale?.toLowerCase().includes(search) ||
                    cliente.piva?.toLowerCase().includes(search) ||
                    cliente.cf?.toLowerCase().includes(search) ||
                    cliente.citta?.toLowerCase().includes(search)
                );
            });
    }, [clienti, activeFilter, searchTerm]);


    const columns = useMemo(() => [
        { accessorKey: 'ragione_sociale', header: 'Ragione Sociale' },
        { accessorKey: 'piva', header: 'Partita IVA' },
        { accessorKey: 'citta', header: 'Città' },
        { accessorKey: 'provincia', header: 'Prov.' },
        {
            accessorKey: 'stato',
            header: 'Stato',
            cell: info => {
                const stato = info.getValue();
                let colorClass = 'bg-gray-200 text-gray-800';
                if (stato === 'Attivo') colorClass = 'bg-green-100 text-green-800';
                if (stato === 'Sospeso') colorClass = 'bg-yellow-100 text-yellow-800';
                if (stato === 'Bloccato') colorClass = 'bg-red-100 text-red-800';
                return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>{stato || 'N/D'}</span>;
            }
        },
    ], []);

    const menuItems = [
        { key: 'tutti', label: 'Tutti i Clienti', icon: CircleStackIcon, action: () => setActiveFilter('tutti') },
        { key: 'attivo', label: 'Clienti Attivi', icon: CheckCircleIcon, action: () => setActiveFilter('attivo') },
        { key: 'sospeso', label: 'Clienti Sospesi', icon: PauseCircleIcon, action: () => setActiveFilter('sospeso') },
        { key: 'bloccato', label: 'Clienti Bloccati', icon: XCircleIcon, action: () => setActiveFilter('bloccato') },
    ];

    if (view === 'detail') {
        return <ClienteDetailView clienteId={selectedClienteId} onBack={() => { setView('list'); }} />;
    }

    return (
        <div className="flex w-full h-full bg-gray-50">
            <aside className="w-64 border-r border-slate-200 p-4 bg-white flex-shrink-0 flex flex-col">
                <div>
                    <h2 className="font-bold mb-4 text-slate-700 text-lg flex items-center gap-2">
                        <UsersIcon className="h-6 w-6 text-blue-600" />
                        Anagrafica Clienti
                    </h2>
                    <ul className="space-y-2">
                        {menuItems.map(item => (
                            <li key={item.key}>
                                <button 
                                    onClick={item.action} 
                                    className={`w-full text-left p-2 rounded-md transition-colors text-sm flex items-center gap-3 ${activeFilter === item.key ? 'bg-blue-100 text-blue-700 font-semibold' : 'hover:bg-slate-100'}`}
                                >
                                    <item.icon className="h-5 w-5 flex-shrink-0" />
                                    <span>{item.label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>
            
            <main className="flex-1 p-6 overflow-y-auto">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">Elenco Clienti</h3>
                    <div className="flex items-center gap-2">
                        {hasPermission('ANAGRAFICHE_MANAGE') && (
                            <button 
                                onClick={handleNewCliente} 
                                className="btn-secondary flex items-center"
                            >
                                <UserPlusIcon className="h-5 w-5 mr-2" />
                                Nuova Anagrafica
                            </button>
                        )}
                         <button 
                            onClick={onNavigateToTabelle} 
                            className="btn-primary flex items-center"
                        >
                            <WrenchScrewdriverIcon className="h-5 w-5 mr-2" />
                            Tabelle Vendite
                        </button>
                    </div>
                </div>
                
                <AdvancedDataGrid
                    columns={columns}
                    data={filteredClienti}
                    isLoading={loading}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onRowClick={(cliente) => handleViewDetails(cliente.id)}
                    onEdit={hasPermission('VA_CLIENTI_MANAGE') ? (cliente) => handleViewDetails(cliente.id) : null}
                />
            </main>
        </div>
    );
};

export default ClientiManager;

