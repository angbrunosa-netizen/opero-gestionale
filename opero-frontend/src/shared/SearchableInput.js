/**
 * @file opero-frontend/src/shared/SearchableInput.js
 * @description Componente riutilizzabile per la ricerca e selezione di entità.
 * @version 1.0
 * @date 2025-10-04
 */
import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';

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

    useEffect(() => {
        if (initialValue) {
            setSelectedItem(initialValue);
            setSearchTerm(initialValue[displayField]);
        }
    }, [initialValue, displayField]);

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

    const handleSearch = async (term) => {
        if (term.length < 2) {
            setResults([]);
            return;
        }
        setIsLoading(true);
        try {
            const response = await api.get(`${searchUrl}?search=${term}`);
            setResults(response.data);
        } catch (error) {
            console.error("Errore nella ricerca:", error);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        setSelectedItem(null); // Deseleziona quando l'utente modifica
        onItemSelected(null); // Notifica il genitore
        setIsDropdownVisible(true);
        handleSearch(term);
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
            {isDropdownVisible && searchTerm && !selectedItem && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {isLoading && <div className="p-2">Caricamento...</div>}
                    {!isLoading && results.length === 0 && searchTerm.length > 1 && <div className="p-2 text-gray-500">Nessun risultato.</div>}
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

