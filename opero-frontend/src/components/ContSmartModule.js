// #####################################################################
// # Componente per il Modulo ContSmart v1.1 (con Manutenzione PDC)
// # File: opero-gestionale-main/opero-frontend/src/components/ContSmartModule.js
// #####################################################################

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FolderIcon, PencilSquareIcon, ChartBarIcon, ChevronRightIcon, PlusIcon, PencilIcon } from '@heroicons/react/24/solid';

// --- NUOVO: Componente Modale per Creazione/Modifica Piano dei Conti ---
const PdcEditModal = ({ item, onSave, onCancel, pdcTree }) => {
    const [formData, setFormData] = useState({
        codice: '',
        descrizione: '',
        id_padre: null,
        tipo: 'Sottoconto',
        natura: 'Costo',
    });

    useEffect(() => {
        if (item) {
            setFormData({
                codice: item.codice || '',
                descrizione: item.descrizione || '',
                id_padre: item.id_padre || null,
                tipo: item.tipo || 'Sottoconto',
                natura: item.natura || 'Costo',
            });
        } else {
            // Se stiamo creando un nuovo item, possiamo pre-impostare un padre se fornito
            setFormData(prev => ({ ...prev, id_padre: item?.id_padre || null }));
        }
    }, [item]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData, item?.id);
    };

    // Funzione per appiattire l'albero e usarlo nel dropdown
    const flattenPdc = (nodes, level = 0) => {
        let flatList = [];
        nodes.forEach(node => {
            // Possiamo aggiungere solo Mastri e Conti come padri
            if (node.tipo === 'Mastro' || node.tipo === 'Conto') {
                flatList.push({ ...node, level });
                if (node.figli) {
                    flatList = flatList.concat(flattenPdc(node.figli, level + 1));
                }
            }
        });
        return flatList;
    };
    
    const potentialParents = flattenPdc(pdcTree);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
                <h3 className="text-xl font-semibold mb-4 text-slate-800">{item?.id ? 'Modifica Conto' : 'Nuovo Conto'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Tipo</label>
                        <select name="tipo" value={formData.tipo} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" disabled={!!item?.id}>
                            <option value="Mastro">Mastro</option>
                            <option value="Conto">Conto</option>
                            <option value="Sottoconto">Sottoconto</option>
                        </select>
                    </div>
                     {formData.tipo !== 'Mastro' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Conto Padre</label>
                            <select name="id_padre" value={formData.id_padre || ''} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md">
                                <option value="" disabled>Seleziona un padre...</option>
                                {potentialParents.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {'\u00A0'.repeat(p.level * 4)} {p.codice} - {p.descrizione}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Codice</label>
                        <input name="codice" value={formData.codice} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md" disabled={!!item?.id} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Descrizione</label>
                        <input name="descrizione" value={formData.descrizione} onChange={handleChange} required className="mt-1 block w-full p-2 border rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Natura</label>
                        <select name="natura" value={formData.natura} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md">
                            <option value="Attività">Attività</option>
                            <option value="Passività">Passività</option>
                            <option value="Costo">Costo</option>
                            <option value="Ricavo">Ricavo</option>
                            <option value="Patrimonio Netto">Patrimonio Netto</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-4 pt-4 border-t mt-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Annulla</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">Salva</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Componenti di Sezione (MODIFICATO) ---

// 1. GESTIONE PIANO DEI CONTI
const PianoDeiContiManager = () => {
    const [pdc, setPdc] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const { hasPermission } = useAuth();
    const canEdit = hasPermission('PDC_EDIT', 90);

    const fetchPdc = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await api.get('/contsmart/piano-dei-conti');
            if (data.success) setPdc(data.data);
        } catch (error) {
            console.error("Errore fetch piano dei conti:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPdc();
    }, [fetchPdc]);

    const handleOpenModal = (item = null) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingItem(null);
        setIsModalOpen(false);
    };

    const handleSave = async (formData, itemId) => {
        try {
            let response;
            if (itemId) {
                // Logica di modifica (PATCH) - da implementare nel backend
                // response = await api.patch(`/contsmart/piano-dei-conti/${itemId}`, formData);
                alert("Funzione di modifica non ancora implementata nel backend.");
            } else {
                // Logica di creazione (POST)
                response = await api.post('/contsmart/piano-dei-conti', formData);
            }
            
            if (response && response.data.success) {
                alert(response.data.message);
                handleCloseModal();
                fetchPdc(); // Ricarica i dati
            } else if (response) {
                 alert(`Errore: ${response.data.message}`);
            }
        } catch (error) {
            alert(`Errore di rete: ${error.response?.data?.message || error.message}`);
        }
    };

    // Componente ricorsivo per renderizzare l'albero del piano dei conti
    const ContoNode = ({ conto, level }) => {
        const [isOpen, setIsOpen] = useState(level < 2);
        const hasChildren = conto.figli && conto.figli.length > 0;

        return (
            <div style={{ marginLeft: `${level * 20}px` }}>
                <div className="flex items-center justify-between p-2 hover:bg-slate-100 rounded-md group">
                    <div className="flex items-center gap-2">
                        {hasChildren ? (
                            <ChevronRightIcon className={`h-4 w-4 cursor-pointer transition-transform ${isOpen ? 'rotate-90' : ''}`} onClick={() => setIsOpen(!isOpen)} />
                        ) : <div className="w-4 h-4"></div>}
                        <FolderIcon className={`h-5 w-5 flex-shrink-0 ${conto.tipo === 'Mastro' ? 'text-yellow-600' : 'text-blue-600'}`} />
                        <span className="font-medium text-sm">{conto.codice} - {conto.descrizione}</span>
                        <span className="text-xs text-gray-500 px-2 py-1 bg-gray-200 rounded-full">{conto.tipo}</span>
                    </div>
                    {canEdit && (
                        <button onClick={() => handleOpenModal(conto)} className="text-blue-600 text-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            <PencilIcon className="h-4 w-4" /> Modifica
                        </button>
                    )}
                </div>
                {isOpen && hasChildren && (
                    <div>
                        {conto.figli.map(figlio => <ContoNode key={figlio.id} conto={figlio} level={level + 1} />)}
                    </div>
                )}
            </div>
        );
    };

    if (isLoading) return <p>Caricamento Piano dei Conti...</p>;

    return (
        <div>
            {isModalOpen && <PdcEditModal item={editingItem} onSave={handleSave} onCancel={handleCloseModal} pdcTree={pdc} />}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-slate-700">Struttura Piano dei Conti</h3>
                {canEdit && (
                    <button onClick={() => handleOpenModal(null)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">
                        <PlusIcon className="h-5 w-5" /> Nuovo Conto
                    </button>
                )}
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md max-h-[60vh] overflow-y-auto">
                {pdc.map(mastro => <ContoNode key={mastro.id} conto={mastro} level={0} />)}
            </div>
        </div>
    );
};

// 2. GESTIONE REGISTRAZIONI CONTABILI (invariato)
const RegistrazioniManager = () => {
    const { hasPermission } = useAuth();
    const [registrazioni, setRegistrazioni] = useState([]);
    const canCreate = hasPermission('CONTABILITA_CREATE', 50);

    useEffect(() => {
        const fetchRegistrazioni = async () => {
            try {
                const { data } = await api.get('/contsmart/registrazioni');
                if (data.success) setRegistrazioni(data.data);
            } catch (error) {
                console.error("Errore fetch registrazioni:", error);
            }
        };
        fetchRegistrazioni();
    }, []);

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-slate-700">Ultime Registrazioni</h3>
                {canCreate && (
                    <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700">
                        <PlusIcon className="h-5 w-5" /> Nuova Registrazione
                    </button>
                )}
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Data</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Descrizione</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Stato</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Utente</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Azioni</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {registrazioni.map(reg => (
                            <tr key={reg.id}>
                                <td className="px-6 py-4">{new Date(reg.data_registrazione).toLocaleDateString()}</td>
                                <td className="px-6 py-4 font-medium">{reg.descrizione_testata}</td>
                                <td className="px-6 py-4">
                                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                         reg.stato === 'Confermato' ? 'bg-green-100 text-green-800' :
                                         reg.stato === 'Annullato' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                     }`}>{reg.stato}</span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">{reg.nome} {reg.cognome}</td>
                                <td className="px-6 py-4 text-center">
                                    <button className="text-blue-600 hover:text-blue-900 text-sm">Visualizza</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// 3. REPORT E INTERROGAZIONI (invariato)
const ReportManager = () => {
    return (
        <div>
            <h3 className="text-xl font-semibold text-slate-700 mb-4">Report e Interrogazioni</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                    <h4 className="font-bold text-slate-800">Bilancio di Verifica</h4>
                    <p className="text-sm text-slate-600 mt-1">Controlla la quadratura dei conti in un dato periodo.</p>
                </div>
                 <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                    <h4 className="font-bold text-slate-800">Partitari Contabili</h4>
                    <p className="text-sm text-slate-600 mt-1">Visualizza i movimenti di un singolo conto.</p>
                </div>
                 <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                    <h4 className="font-bold text-slate-800">Liquidazione IVA</h4>
                    <p className="text-sm text-slate-600 mt-1">Prepara i dati per la liquidazione periodica dell'IVA.</p>
                </div>
            </div>
        </div>
    );
};


// --- Componente Principale del Modulo (invariato) ---
const ContSmartModule = () => {
    const { hasPermission } = useAuth();
    const sections = [
        { key: 'pdc', label: 'Piano dei Conti', permission: 'PDC_VIEW', icon: FolderIcon, component: PianoDeiContiManager },
        { key: 'registrazioni', label: 'Registrazioni', permission: 'CONTABILITA_VIEW', icon: PencilSquareIcon, component: RegistrazioniManager },
        { key: 'report', label: 'Report', permission: 'REPORT_VIEW', icon: ChartBarIcon, component: ReportManager },
    ];
    const accessibleSections = sections.filter(sec => hasPermission(sec.permission));
    const [activeSection, setActiveSection] = useState(accessibleSections.length > 0 ? accessibleSections[0].key : null);

    const renderContent = () => {
        if (!activeSection) {
            return <div className="p-6 text-center text-gray-500">Nessuna sezione disponibile. Contattare l'amministratore.</div>;
        }
        const CurrentComponent = sections.find(s => s.key === activeSection)?.component;
        return CurrentComponent ? <CurrentComponent /> : null;
    };

    return (
        <div className="w-full h-full flex flex-col bg-slate-50 p-4 md:p-6">
            <header className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Modulo Contabilità Smart</h1>
                <p className="text-slate-600 mt-1">Gestione completa delle operazioni contabili.</p>
            </header>
            
            <div className="border-b border-slate-200 mb-6">
                <nav className="-mb-px flex space-x-6">
                    {accessibleSections.map(sec => {
                        const Icon = sec.icon;
                        return (
                            <button 
                                key={sec.key}
                                onClick={() => setActiveSection(sec.key)}
                                className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeSection === sec.key 
                                    ? 'border-blue-500 text-blue-600' 
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }`}
                            >
                                <Icon className="h-5 w-5" />
                                <span>{sec.label}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            <main className="flex-1">
                {renderContent()}
            </main>
        </div>
    );
};

export default ContSmartModule;
