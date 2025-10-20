// #####################################################################
// # Componente Modale per Gestione Permessi Utente - v2.2 (Fix Nome Utente)
// # File: opero-frontend/src/components/admin/GestionePermessiUtenteModal.js
// #####################################################################
import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { X, Shield, ShieldCheck, ShieldOff, Building } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const GestionePermessiUtenteModal = ({ utente, onClose }) => {
    const { user: loggedInUser } = useAuth();
    const [ditteAssociate, setDitteAssociate] = useState([]);
    const [selectedDittaId, setSelectedDittaId] = useState('');
    const [permissionsData, setPermissionsData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // ... (useEffect per fetchDitteUtente rimane invariato) ...
    useEffect(() => {
        const fetchDitteUtente = async () => {
            if (utente) {
                try {
                    const response = await api.get(`/admin/utenti/${utente.id}/ditte`); 
                    setDitteAssociate(response.data);
                    if (response.data.length > 0) {
                        const defaultDitta = loggedInUser.id_ruolo === 2 ? loggedInUser.id_ditta : response.data[0].id;
                        setSelectedDittaId(defaultDitta);
                    }
                } catch (error) {
                    console.error("Errore nel caricamento delle ditte associate:", error);
                    toast.error("Impossibile caricare le ditte dell'utente.");
                }
            }
        };
        fetchDitteUtente();
    }, [utente, loggedInUser]);


    useEffect(() => {
        if (utente && selectedDittaId) {
            const fetchPermissions = async () => {
                setIsLoading(true);
                setPermissionsData([]);
                try {
                    const response = await api.get(`/admin/utenti/${utente.id}/permissions?id_ditta=${selectedDittaId}`);
                    setPermissionsData(response.data);
                } catch (error) {
                    console.error("Errore nel caricamento dei permessi utente:", error);
                    toast.error("Impossibile caricare la configurazione dei permessi.");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchPermissions();
        }
    }, [utente, selectedDittaId]);
    
    // ... (logica e funzioni interne rimangono invariate) ...
    const groupedPermissions = useMemo(() => {
        return permissionsData.reduce((acc, p) => {
            const moduleKey = p.chiave_componente_modulo || 'Generale';
            if (!acc[moduleKey]) acc[moduleKey] = [];
            acc[moduleKey].push(p);
            return acc;
        }, {});
    }, [permissionsData]);

    const handleStateChange = (permissionId, newState) => {
        setPermissionsData(currentData =>
            currentData.map(p =>
                p.id === permissionId ? { ...p, stato_override: newState } : p
            )
        );
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const overrides = permissionsData
                .filter(p => p.stato_override !== 'default')
                .map(p => ({ id_funzione: p.id, azione: p.stato_override }));

            await api.post(`/admin/utenti/${utente.id}/permissions`, { 
                overrides, 
                id_ditta: selectedDittaId 
            });
            toast.success("Permessi utente aggiornati con successo!");
            onClose();
        } catch (error) {
            console.error("Errore nel salvataggio dei permessi:", error);
            toast.error("Si è verificato un errore durante il salvataggio.");
        } finally {
            setIsSaving(false);
        }
    };


    if (!utente) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <header className="flex justify-between items-center p-4 border-b">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Gestione Permessi Personalizzati</h2>
                        {/* --- CORREZIONE: Aggiunta logica di fallback per visualizzare nome o email --- */}
                        <p className="text-sm text-gray-500">
                            Utente: {utente.nome && utente.cognome ? `${utente.nome} ${utente.cognome}` : utente.email}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Building size={16} className="text-gray-500" />
                        <select
                            value={selectedDittaId}
                            onChange={(e) => setSelectedDittaId(e.target.value)}
                            disabled={loggedInUser.id_ruolo === 2 || ditteAssociate.length <= 1}
                            className="p-2 border rounded-md bg-gray-50"
                        >
                            {ditteAssociate.map(ditta => (
                                <option key={ditta.id} value={ditta.id}>{ditta.ragione_sociale}</option>
                            ))}
                        </select>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><X size={24} /></button>
                </header>

                <main className="p-6 overflow-y-auto flex-grow">
                     {isLoading ? (
                        <div className="text-center py-10">Caricamento configurazione...</div>
                    ) : (
                        <div className="space-y-6">
                            {Object.keys(groupedPermissions).length > 0 ? (
                                Object.keys(groupedPermissions).sort().map(moduleKey => (
                                    <div key={moduleKey} className="border rounded-lg">
                                        <h3 className="font-bold text-md text-blue-800 bg-gray-50 p-3 border-b">{moduleKey}</h3>
                                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {groupedPermissions[moduleKey].map(perm => (
                                                <PermissionRow 
                                                    key={perm.id} 
                                                    permission={perm} 
                                                    onStateChange={handleStateChange} 
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-500 py-10">
                                    <p>Nessun permesso da configurare per questa ditta.</p>
                                </div>
                            )}
                        </div>
                    )}
                </main>

                <footer className="p-4 border-t flex justify-end gap-4 bg-gray-50">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Annulla</button>
                    <button onClick={handleSave} disabled={isSaving || isLoading} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                        {isSaving ? 'Salvataggio...' : 'Salva Modifiche'}
                    </button>
                </footer>
            </div>
        </div>
    );
};

const PermissionRow = ({ permission, onStateChange }) => {
    // ... (Componente PermissionRow invariato) ...
    const { id, codice, descrizione, abilitato_da_ruolo, stato_override } = permission;

    const baseStyle = "w-1/3 p-2 text-xs font-semibold text-center rounded-md cursor-pointer transition-colors";
    const activeStyle = "text-white";
    const inactiveStyle = "bg-gray-200 hover:bg-gray-300 text-gray-600";
    
    return (
        <div className="p-3 border rounded-md hover:shadow-md transition-shadow">
            <p className="font-semibold text-sm text-gray-800">{codice}</p>
            <p className="text-xs text-gray-500 mb-3 h-8">{descrizione}</p>

            <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button 
                    onClick={() => onStateChange(id, 'default')}
                    className={`${baseStyle} ${stato_override === 'default' ? (abilitato_da_ruolo ? 'bg-blue-500 ' + activeStyle : 'bg-gray-400 ' + activeStyle) : inactiveStyle}`}
                    title={abilitato_da_ruolo ? "Default: Abilitato dal ruolo" : "Default: Non abilitato dal ruolo"}
                >
                    <div className="flex items-center justify-center gap-1">
                        <Shield size={14}/> Default
                    </div>
                </button>
                <button 
                    onClick={() => onStateChange(id, 'allow')}
                    className={`${baseStyle} ${stato_override === 'allow' ? 'bg-green-500 ' + activeStyle : inactiveStyle}`}
                >
                    <div className="flex items-center justify-center gap-1">
                        <ShieldCheck size={14}/> Permetti
                    </div>
                </button>
                <button 
                    onClick={() => onStateChange(id, 'deny')}
                    className={`${baseStyle} ${stato_override === 'deny' ? 'bg-red-500 ' + activeStyle : inactiveStyle}`}
                >
                    <div className="flex items-center justify-center gap-1">
                        <ShieldOff size={14}/> Nega
                    </div>
                </button>
            </div>
        </div>
    );
};

export default GestionePermessiUtenteModal;

