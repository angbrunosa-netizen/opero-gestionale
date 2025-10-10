/**
 * Componente: SearchModal
 * Versione: 1.0.0
 * Data: 11/10/2025
 * Posizione: opero-frontend/src/shared/SearchModal.js
 * Descrizione: Componente modale riutilizzabile per la ricerca e selezione di anagrafiche.
 * Esegue una ricerca "live" tramite API e restituisce l'oggetto selezionato.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import debounce from 'lodash.debounce';

const SearchModal = ({ isOpen, onClose, onSelect, searchEndpoint, title, displayFields }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Funzione di ricerca con debouncing per non sovraccaricare il server
    const performSearch = useCallback(
        debounce(async (term) => {
            if (term.length < 2) {
                setResults([]);
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                const response = await api.get(`${searchEndpoint}${term}`);
                setResults(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error(`Errore durante la ricerca (${title}):`, error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 300),
        [searchEndpoint, title]
    );

    useEffect(() => {
        performSearch(searchTerm);
    }, [searchTerm, performSearch]);

    const handleSelect = (item) => {
        onSelect(item);
        onClose();
        setSearchTerm('');
        setResults([]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl m-4">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-4">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cerca..."
                            className="w-full p-2 pl-10 border rounded-md"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>
                <div className="p-4 h-96 overflow-y-auto">
                    {isLoading && <p className="text-center text-gray-500">Caricamento...</p>}
                    {!isLoading && results.length === 0 && searchTerm.length > 1 && (
                        <p className="text-center text-gray-500">Nessun risultato trovato.</p>
                    )}
                    <ul className="divide-y">
                        {results.map((item) => (
                            <li
                                key={item.id}
                                onClick={() => handleSelect(item)}
                                className="p-3 hover:bg-gray-100 cursor-pointer"
                            >
                                <p className="font-semibold">{item[displayFields.primary]}</p>
                                {displayFields.secondary && (
                                    <p className="text-sm text-gray-600">{item[displayFields.secondary]}</p>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default SearchModal;
