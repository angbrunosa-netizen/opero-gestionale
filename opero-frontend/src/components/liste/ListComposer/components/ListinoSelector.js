import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const ListinoSelector = ({
  isOpen,
  onClose,
  articolo,
  listiniDisponibili,
  currentListinoCessione,
  currentListinoPubblico,
  onConfirm,
 userLevel = 70
}) => {
  const [selectedListinoCessione, setSelectedListinoCessione] = useState(currentListinoCessione || 1);
  const [selectedListinoPubblico, setSelectedListinoPubblico] = useState(currentListinoPubblico || 1);
  const [customPrezzoCessione, setCustomPrezzoCessione] = useState('');
  const [customPrezzoPubblico, setCustomPrezzoPubblico] = useState('');
  const [useCustomPrezzi, setUseCustomPrezzi] = useState(false);

  const canModifyPrezzi = userLevel > 60;

  const handleConfirm = () => {
    const result = {
      listino_cessione: selectedListinoCessione,
      listino_pubblico: selectedListinoPubblico,
      use_custom_prezzi: useCustomPrezzi,
      prezzo_cessione: useCustomPrezzi ? parseFloat(customPrezzoCessione) || 0 : undefined,
      prezzo_pubblico: useCustomPrezzi ? parseFloat(customPrezzoPubblico) || 0 : undefined
    };
    onConfirm(result);
  };

  if (!isOpen) return null;

  const prezzoCessioneCorrente = listiniDisponibili.find(l => l.numero === selectedListinoCessione)?.prezzo_cessione || 0;
  const prezzoPubblicoCorrente = listiniDisponibili.find(l => l.numero === selectedListinoPubblico)?.prezzo_pubblico || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Selezione Listino e Prezzi
            </h3>
            {articolo && (
              <p className="text-sm text-gray-600 mt-1">
                Articolo: <span className="font-medium">{articolo.codice_articolo} - {articolo.descrizione}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Selezione Listini */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Listino Cessione */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Listino Cessione
            </label>
            <select
              value={selectedListinoCessione}
              onChange={(e) => setSelectedListinoCessione(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {listiniDisponibili.map((listino) => (
                <option key={`cesione-${listino.numero}`} value={listino.numero}>
                  Listino {listino.numero}: €{listino.prezzo_cessione?.toFixed(2) || '0.00'}
                </option>
              ))}
            </select>
            <div className="mt-2 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Prezzo Cessione: <span className="font-semibold">€{prezzoCessioneCorrente.toFixed(2)}</span>
              </p>
            </div>
          </div>

          {/* Listino Pubblico */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Listino Pubblico
            </label>
            <select
              value={selectedListinoPubblico}
              onChange={(e) => setSelectedListinoPubblico(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {listiniDisponibili.map((listino) => (
                <option key={`pubblico-${listino.numero}`} value={listino.numero}>
                  Listino {listino.numero}: €{listino.prezzo_pubblico?.toFixed(2) || '0.00'}
                </option>
              ))}
            </select>
            <div className="mt-2 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                Prezzo Pubblico: <span className="font-semibold">€{prezzoPubblicoCorrente.toFixed(2)}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Modifica Prezzi Personalizzati (solo per utenti livello > 60) */}
        {canModifyPrezzi && (
          <div className="border-t pt-4 mb-6">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="useCustomPrezzi"
                checked={useCustomPrezzi}
                onChange={(e) => setUseCustomPrezzi(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="useCustomPrezzi" className="ml-2 text-sm font-medium text-gray-700">
                Utilizza prezzi personalizzati (solo per utenti autorizzati)
              </label>
            </div>

            {useCustomPrezzi && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-yellow-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prezzo Cessione Personalizzato
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                    <input
                      type="number"
                      step="0.01"
                      value={customPrezzoCessione}
                      onChange={(e) => setCustomPrezzoCessione(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prezzo Pubblico Personalizzato
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                    <input
                      type="number"
                      step="0.01"
                      value={customPrezzoPubblico}
                      onChange={(e) => setCustomPrezzoPubblico(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Riepilogo */}
        <div className="border-t pt-4 mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Riepilogo Selezione</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Listino Cessione: <span className="font-medium">{selectedListinoCessione}</span></p>
              <p className="text-gray-600">Prezzo Cessione:
                <span className="font-medium">
                  €{useCustomPrezzi && customPrezzoCessione ?
                    parseFloat(customPrezzoCessione).toFixed(2) :
                    prezzoCessioneCorrente.toFixed(2)}
                </span>
              </p>
            </div>
            <div>
              <p className="text-gray-600">Listino Pubblico: <span className="font-medium">{selectedListinoPubblico}</span></p>
              <p className="text-gray-600">Prezzo Pubblico:
                <span className="font-medium">
                  €{useCustomPrezzi && customPrezzoPubblico ?
                    parseFloat(customPrezzoPubblico).toFixed(2) :
                    prezzoPubblicoCorrente.toFixed(2)}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Pulsanti Azione */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
          >
            Annulla
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Conferma Selezione
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListinoSelector;