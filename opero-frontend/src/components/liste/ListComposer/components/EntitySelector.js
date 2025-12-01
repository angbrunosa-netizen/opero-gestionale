// EntitySelector.js
import React, { useState } from 'react';
import SearchableCatalogoInput from '../../shared/SearchableCatalogoInput';

const EntitySelector = ({ listItems, setListItems, listType }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  
  const handleAddItem = () => {
    if (!selectedItem) return;
    
    // Controlla se l'articolo è già presente
    const existingItemIndex = listItems.findIndex(item => item.id_articolo === selectedItem.id);
    
    if (existingItemIndex >= 0) {
      // Se esiste, incrementa la quantità
      const updatedItems = [...listItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        qta: updatedItems[existingItemIndex].qta + 1
      };
      setListItems(updatedItems);
    } else {
      // Altrimenti aggiungi un nuovo elemento
      setListItems([
        ...listItems,
        {
          id_articolo: selectedItem.id,
          articolo: selectedItem, // Dettagli completi dell'articolo
          qta: 1,
          prezzo_indicativo: selectedItem.prezzo || 0,
          note: ''
        }
      ]);
    }
    
    setSelectedItem(null);
  };
  
  const handleUpdateItem = (index, field, value) => {
    const updatedItems = [...listItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    setListItems(updatedItems);
  };
  
  const handleRemoveItem = (index) => {
    setListItems(listItems.filter((_, i) => i !== index));
  };
  
  return (
    <div className="entity-selector p-4 bg-white rounded shadow mb-4">
      <h3 className="text-lg font-medium mb-4">Articoli</h3>
      
      {/* Input per aggiungere articoli */}
      <div className="flex mb-4">
        <div className="flex-1 mr-2">
          <SearchableCatalogoInput
            value={selectedItem}
            onChange={setSelectedItem}
            placeholder="Cerca articolo..."
          />
        </div>
        <button
          onClick={handleAddItem}
          disabled={!selectedItem}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
        >
          Aggiungi
        </button>
      </div>
      
      {/* Tabella delle righe */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Articolo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantità
              </th>
              {(listType === 'ORDINE_ACQ' || listType === 'ORDINE_VEND') && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prezzo
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Note
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Azioni
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {listItems.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {item.articolo.codice}
                    </div>
                    <div className="text-sm text-gray-500">
                      {item.articolo.descrizione}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.qta}
                    onChange={(e) => handleUpdateItem(index, 'qta', parseFloat(e.target.value) || 0)}
                    className="w-20 p-1 border border-gray-300 rounded"
                  />
                </td>
                {(listType === 'ORDINE_ACQ' || listType === 'ORDINE_VEND') && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.prezzo_indicativo}
                      onChange={(e) => handleUpdateItem(index, 'prezzo_indicativo', parseFloat(e.target.value) || 0)}
                      className="w-24 p-1 border border-gray-300 rounded"
                    />
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    value={item.note || ''}
                    onChange={(e) => handleUpdateItem(index, 'note', e.target.value)}
                    className="w-full p-1 border border-gray-300 rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Rimuovi
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {listItems.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            Nessun articolo aggiunto. Usa il campo di ricerca sopra per aggiungere articoli.
          </div>
        )}
      </div>
    </div>
  );
};

export default EntitySelector;