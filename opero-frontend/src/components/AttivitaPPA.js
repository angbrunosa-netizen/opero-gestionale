import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// Componente per una singola card di attività
const AttivitaCard = ({ task, statiDisponibili, onStatusChange }) => {
    const [teamStatus, setTeamStatus] = useState([]);
    const [isLoadingTeam, setIsLoadingTeam] = useState(false);
    const [note, setNote] = useState(task.note || '');

    const fetchTeamStatus = useCallback(async () => {
        setIsLoadingTeam(true);
        try {
            const { data } = await api.get(`/ppa/istanze/${task.istanza_procedura_id}/team-status`);
            if (data.success) {
                setTeamStatus(data.data);
            }
        } catch (error) {
            console.error("Errore fetch stato team:", error);
        } finally {
            setIsLoadingTeam(false);
        }
    }, [task.istanza_procedura_id]);

    useEffect(() => {
        fetchTeamStatus();
    }, [fetchTeamStatus]);

    const handleUpdate = () => {
        onStatusChange(task.istanza_azione_id, document.getElementById(`stato-${task.istanza_azione_id}`).value, note);
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md border mb-4">
            <div className="md:flex justify-between">
                <div>
                    <p className="text-sm text-gray-500">{task.ditta_target} / {task.nome_processo}</p>
                    <h3 className="text-lg font-bold text-gray-800">{task.nome_azione}</h3>
                </div>
                <div className="flex items-center gap-2 mt-2 md:mt-0">
                    <select 
                        id={`stato-${task.istanza_azione_id}`}
                        defaultValue={task.id_stato_attuale}
                        className="p-2 border rounded-md"
                    >
                        {statiDisponibili.map(stato => (
                            <option key={stato.ID} value={stato.ID}>{stato.NomeStato}</option>
                        ))}
                    </select>
                    <button onClick={handleUpdate} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Aggiorna</button>
                </div>
            </div>

            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Note di Svolgimento:</label>
                <textarea 
                    value={note} 
                    onChange={(e) => setNote(e.target.value)}
                    rows="2" 
                    className="w-full mt-1 p-2 border rounded-md"
                ></textarea>
            </div>

            <div className="mt-4 border-t pt-4">
                <h4 className="text-sm font-semibold">Stato del Team:</h4>
                {isLoadingTeam ? <p className="text-xs">Caricamento...</p> : (
                    <ul className="text-xs space-y-1 mt-2">
                        {teamStatus.map((member, index) => (
                            <li key={index} className="flex justify-between">
                                <span>{member.nome} {member.cognome} - "{member.nome_azione}"</span>
                                <span style={{ backgroundColor: member.colore_stato, color: 'white' }} className="px-2 py-0.5 rounded-full">{member.stato}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
             {/* Qui potremmo aggiungere un modale per inviare email */}
        </div>
    );
};


// Componente principale che mostra la lista delle attività
const AttivitaPPA = () => {
    const { user } = useAuth();
    const [myTasks, setMyTasks] = useState([]);
    const [stati, setStati] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTasks = useCallback(async () => {
        setIsLoading(true);
        try {
            const [tasksRes, statiRes] = await Promise.all([
                api.get('/ppa/my-tasks'),
                api.get('/ppa/stati-azione')
            ]);
            if (tasksRes.data.success) setMyTasks(tasksRes.data.data);
            if (statiRes.data.success) setStati(statiRes.data.data);
        } catch (error) {
            console.error("Errore nel caricamento delle attività PPA", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleStatusChange = async (istanzaAzioneId, nuovoStatoId, note) => {
        try {
            const { data } = await api.patch(`/ppa/istanze-azioni/${istanzaAzioneId}/status`, {
                id_stato: nuovoStatoId,
                note: note
            });
            if (data.success) {
                alert(data.message);
                fetchTasks(); // Ricarica la lista per mostrare l'aggiornamento
            } else {
                alert(`Errore: ${data.message}`);
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Errore di connessione.');
        }
    };
    
    if (isLoading) return <div className="p-6">Caricamento attività...</div>;

    return (
        <div className="p-6 bg-gray-50 h-full">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Le Mie PPAction</h1>
            {myTasks.length > 0 ? (
                myTasks.map(task => (
                    <AttivitaCard key={task.istanza_azione_id} task={task} statiDisponibili={stati} onStatusChange={handleStatusChange} />
                ))
            ) : (
                <p>Non hai PPAction assegnate al momento.</p>
            )}
        </div>
    );
};

export default AttivitaPPA;