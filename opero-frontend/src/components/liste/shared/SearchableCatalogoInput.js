import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../../services/api';

/**
 * Hook per il debounce di un valore, per evitare troppe chiamate API.
 * @param {any} value - Il valore da debouncare.
 * @param {number} delay - Il ritardo in millisecondi.
 * @returns {any} - Il valore debounced.
 */
function useDebounce(value, delay) {
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
}

/**
 * Componente per la ricerca e selezione di articoli dal catalogo.
 * Utilizza l'endpoint di ricerca completo gestito da `CatalogoManager`.
 * Mostra un input con una tendina a comparsire i risultati.
 */
const SearchableCatalogoInput = ({ value, onChange, placeholder }) => {
  // Ogni variabile di stato deve avere il suo hook `useState`.
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce della query per evitare troppe chiamate API
  const debouncedQuery = useDebounce(query, 500);

  const fetchResults = useCallback(async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      // Chiama l'endpoint di ricerca completo gestito da `CatalogoManager`
      const url = `/catalogo/search?term=${encodeURIComponent(searchTerm)}`;
      const response = await api.get(url);

      // La risposta dell'endpoint è { success: true, data: [...] }
      const data = response.data.data || [];
      setResults(data);
      setIsOpen(true);
    } catch (error) {
      console.error("Errore nella ricerca catalogo:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effettua la chiamata API quando la query cambia (dopo il debounce)
  useEffect(() => {
    fetchResults(debouncedQuery);
  }, [debouncedQuery, fetchResults]);

  const handleSelect = (item) => {
    onChange(item);
    setQuery(item.descrizione);
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    if (!newQuery) {
      onChange(null); // Se l'input viene svuotato, resetta il valore nel genitore
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={() => query.length >= 2 && setIsOpen(true)}
        placeholder={placeholder}
        className="w-full p-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {isLoading && (
        <div className="absolute z-10 w-full bg-white border-gray-300 rounded-md mt-1 p-2 text-center">
          Caricamento...
        </div>
      )}
      {isOpen && !isLoading && results.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
          {results.map((item) => (
            <li
              key={item.id}
              onClick={() => handleSelect(item)}
              className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="font-medium text-gray-900">{item.codice_articolo || item.codice}</div>
              <div className="text-sm text-gray-600">{item.descrizione}</div>
              <div className="text-sm text-gray-800 font-semibold">
                Prezzo: €{Number(item.prezzo_cessione_1 || 0).toFixed(2)}
              </div>
            </li>
          ))}
        </ul>
      )}
      {isOpen && !isLoading && results.length === 0 && query.length >= 2 && (
        <div className="absolute z-10 w-full bg-white border-gray-300 rounded-md mt-1 p-2 text-center text-gray-500">
          Nessun articolo trovato.
        </div>
      )}
    </div>
  );
};

export default SearchableCatalogoInput;