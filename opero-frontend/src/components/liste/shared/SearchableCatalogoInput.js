import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../../services/api';
import { Search, X } from 'lucide-react';

// Aggiungiamo un semplice hook per il debounce
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay || 500);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const SearchableCatalogoInput = ({ value, onChange, placeholder = "Cerca articolo..." }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  // Usiamo il valore prop passato dal componente padre
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedQuery.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        // Usiamo l'endpoint che sappiamo funzionare
        const response = await api.get(`/catalogo/search?q=${encodeURIComponent(debouncedQuery)}&limit=50`);
        setResults(response.data);
      } catch (error) {
        console.error("Errore nella ricerca:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  const handleChange = (e) => {
    setQuery(e.target.value);
    setIsOpen(true);
  };

  const handleSelect = (articolo) => {
    onChange(articolo);
    setQuery(articolo.descrizione);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full p-2 pr-10 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-2 p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <Search className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {isOpen && (query.length >= 2 || isLoading) && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading && (
            <li className="px-4 py-2 text-gray-500">Caricamento...</li>
          )}
          {!isLoading && results.length === 0 && query.length >= 2 && (
            <li className="px-4 py-2 text-gray-500">Nessun articolo trovato.</li>
          )}
          {results.map((articolo) => (
            <li
              key={articolo.id}
              onClick={() => handleSelect(articolo)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <div className="font-medium">{articolo.descrizione}</div>
              <div className="text-sm text-gray-500">Cod. {articolo.codice}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchableCatalogoInput;