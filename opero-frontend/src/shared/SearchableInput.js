/**
 * @file opero-frontend/src/shared/SearchableInput.js
 * @description Componente riutilizzabile per la ricerca e selezione di entità, con debounce.
 * @version 2.0
 * @date 2025-10-05
 */
import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';

// Hook custom per il "debouncing" dell'input utente
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

const SearchableInput = ({
    searchUrl,
    displayField,
    placeholder,
    onItemSelected,
    initialValue
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const wrapperRef = useRef(null);

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Effetto per popolare il valore iniziale
    useEffect(() => {
        if (initialValue) {
            setSelectedItem(initialValue);
            setSearchTerm(initialValue[displayField]);
        }
    }, [initialValue, displayField]);

    // Effetto per eseguire la ricerca quando il termine "debounced" cambia
    useEffect(() => {
        const executeSearch = async () => {
            if (debouncedSearchTerm.length < 2) {
                setResults([]);
                return;
            }
            setIsLoading(true);
            try {
                const response = await api.get(searchUrl, { params: { search: debouncedSearchTerm } });
                setResults(response.data);
            } catch (error) {
                console.error('Errore nella ricerca:', error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        };

        if (!selectedItem) {
             executeSearch();
        }
    }, [debouncedSearchTerm, searchUrl, selectedItem]);


    // Effetto per chiudere il dropdown al click esterno
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsDropdownVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleInputChange = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        setSelectedItem(null); // Deseleziona quando l'utente inizia a scrivere
        onItemSelected(null);  // Notifica il genitore della deselezione
        setIsDropdownVisible(true);
    };

    const handleSelect = (item) => {
        setSelectedItem(item);
        setSearchTerm(item[displayField]);
        onItemSelected(item);
        setResults([]);
        setIsDropdownVisible(false);
    };
    
    const handleReset = () => {
        setSearchTerm('');
        setSelectedItem(null);
        onItemSelected(null);
        setResults([]);
        setIsDropdownVisible(false);
    }

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div className="flex items-center">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={() => setIsDropdownVisible(true)}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    disabled={!!selectedItem}
                />
                 {selectedItem && (
                    <button type="button" onClick={handleReset} className="ml-2 text-red-500 hover:text-red-700">
                        &#10005;
                    </button>
                )}
            </div>
            {isDropdownVisible && debouncedSearchTerm.length > 1 && !selectedItem && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {isLoading && <div className="p-2">Caricamento...</div>}
                    {!isLoading && results.length === 0 && <div className="p-2 text-gray-500">Nessun risultato.</div>}
                    {results.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => handleSelect(item)}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                        >
                            {item[displayField]} ({item.codice_entita || item.codice})
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchableInput;

