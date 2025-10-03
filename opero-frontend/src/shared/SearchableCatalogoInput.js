/**
 * @file opero-frontend/src/shared/SearchableCatalogoInput.js
 * @description Componente riutilizzabile per la ricerca di entità nel catalogo.
 * Mostra un pulsante che apre un modale di ricerca.
 * Esegue la ricerca in modo dinamico e restituisce l'oggetto
 * selezionato tramite una callback.
 * @date 2025-10-03
 * @version 1.0
 */

import React  from 'react';
import { useState, useEffect, useCallback } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import {api} from '../services/api';

// Hook custom per il debouncing
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

const SearchableCatalogoInput = ({ onItemSelected, label = "Cerca Articolo" }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms di ritardo

    // Funzione per eseguire la ricerca
    const searchItems = useCallback(async (term) => {
        if (term && term.length >= 2) {
            setIsLoading(true);
            try {
                const response = await api.get(`/catalogo/search?term=${term}`);
                setResults(response.data);
            } catch (error) {
                console.error("Errore durante la ricerca nel catalogo:", error);
                setResults([]); // Pulisci i risultati in caso di errore
            } finally {
                setIsLoading(false);
            }
        } else {
            setResults([]);
        }
    }, []);
    
    // useEffect per triggerare la ricerca quando il termine "debonced" cambia
    useEffect(() => {
        searchItems(debouncedSearchTerm);
    }, [debouncedSearchTerm, searchItems]);

    // Gestione della selezione di un item
    const handleSelect = (item) => {
        onItemSelected(item);
        setIsModalOpen(false);
        setSearchTerm('');
        setResults([]);
    };
    
    // Gestione apertura/chiusura modale
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        setSearchTerm('');
        setResults([]);
    };

    return (
        <>
            <button
                type="button"
                onClick={openModal}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                <MagnifyingGlassIcon className="h-5 w-5 mr-2 text-gray-400" />
                {label} (F6)
            </button>

            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-start pt-20 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all">
                        <div className="px-4 py-3 border-b flex justify-between items-center">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Ricerca nel Catalogo</h3>
                            <button onClick={closeModal}>
                                <XMarkIcon className="h-6 w-6 text-gray-500 hover:text-gray-800" />
                            </button>
                        </div>
                        
                        <div className="p-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Cerca per codice, descrizione, EAN, codice fornitore o categoria..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    autoFocus
                                />
                                {isLoading && <div className="absolute right-3 top-2 text-gray-400">Caricamento...</div>}
                            </div>
                        </div>

                        <div className="px-4 pb-4 max-h-96 overflow-y-auto">
                            {results.length > 0 ? (
                                <ul className="divide-y divide-gray-200">
                                    {results.map((item) => (
                                        <li key={item.id} onClick={() => handleSelect(item)} className="p-3 hover:bg-gray-100 cursor-pointer rounded-md">
                                            <div className="font-semibold text-gray-800">{item.codice_entita} - {item.descrizione}</div>
                                            <div className="text-sm text-gray-500">Categoria: {item.categoria || 'Non specificata'}</div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center text-gray-500 py-6">
                                    {searchTerm.length < 2 ? "Digita almeno 2 caratteri per iniziare la ricerca." : "Nessun risultato trovato."}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SearchableCatalogoInput;
