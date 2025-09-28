/**
 * #####################################################################
 * # Componente Progettazione PPA - v1.2 (con Logica di Modifica)
 * # File: opero-frontend/src/components/ppa/ProgettazionePPA.js
 * #####################################################################
 *
 * @description
 * AGGIORNATO: La funzione handleSave ora distingue tra creazione (POST) e
 * modifica (PUT) in base alla presenza di una procedura selezionata.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { ProceduraModal } from './ProceduraModal';
import { PencilIcon, PlusIcon } from '@heroicons/react/24/outline';

const ProgettazionePPA = () => {
    const [procedure, setProcedure] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProcedure, setSelectedProcedure] = useState(null);

    const fetchProcedure = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get('/ppa/procedure-ditta');
            if (response.data.success) {
                setProcedure(response.data.data || []);
            }
        } catch (err) {
            setError("Impossibile caricare i modelli di procedura.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProcedure();
    }, [fetchProcedure]);

    const handleOpenModalForNew = () => {
        setSelectedProcedure(null);
        setIsModalOpen(true);
    };

    const handleOpenModalForEdit = (proc) => {
        setSelectedProcedure(proc);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProcedure(null);
    };

    // ##################################################################
    // ## LOGICA AGGIORNATA: Distingue tra POST (nuovo) e PUT (modifica) ##
    // ##################################################################
    const handleSave = async (procedureData) => {
        try {
            let response;
            if (selectedProcedure && selectedProcedure.ID) {
                // Modalità Modifica
                response = await api.put(`/ppa/procedure-ditta/${selectedProcedure.ID}`, procedureData);
            } else {
                // Modalità Creazione
                response = await api.post('/ppa/procedure-ditta', procedureData);
            }

            if (response.data.success) {
                alert(response.data.message); // Da sostituire con un sistema di notifiche migliore
                handleCloseModal();
                fetchProcedure();
            }
        } catch (err) {
            console.error("Errore durante il salvataggio:", err);
            setError(err.response?.data?.message || "Errore imprevisto.");
        }
    };

    if (isLoading) return <div>Caricamento in corso...</div>;

    return (
        <div>
            {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</div>}
            
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-700">Modelli di Procedura</h2>
                <button onClick={handleOpenModalForNew} className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">
                    <PlusIcon className="h-5 w-5" />
                    Crea Nuova Procedura
                </button>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                 <ul className="divide-y divide-gray-200">
                    {procedure.length > 0 ? procedure.map(proc => (
                        <li key={proc.ID} className="p-4 flex justify-between items-center hover:bg-gray-50">
                            <p className="font-semibold text-gray-800">{proc.NomePersonalizzato}</p>
                            <button onClick={() => handleOpenModalForEdit(proc)} className="p-2 rounded-full hover:bg-gray-200">
                                <PencilIcon className="h-5 w-5 text-gray-500" />
                            </button>
                        </li>
                    )) : (
                        <li className="p-6 text-center text-gray-500">Nessun modello di procedura trovato.</li>
                    )}
                </ul>
            </div>
            
            <ProceduraModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                procedureData={selectedProcedure}
                onSave={handleSave}
            />
        </div>
    );
};

export default ProgettazionePPA;

