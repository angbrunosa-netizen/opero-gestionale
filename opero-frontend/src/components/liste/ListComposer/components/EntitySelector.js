import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { api } from '../../../../services/api';
import SearchableCatalogoInput from '../../shared/SearchableCatalogoInput';
import ListinoSelector from './ListinoSelector';

const EntitySelector = ({ listItems, setListItems, listType, idDittaDestinataria }) => {
  const { user } = useAuth();
  const [selectedItem, setSelectedItem] = useState(null);
  const [listinoModalOpen, setListinoModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [listiniDisponibili, setListiniDisponibili] = useState([]);
  const [prezziCliente, setPrezziCliente] = useState({});

  // Funzione migliorata per caricare i prezzi con fallback al Listino 1
  const loadPrezzi = async (articoloId, clienteId) => {
    if (!articoloId) return;

    try {
      let prezzoCessione = 0;
      let prezzoPubblico = 0;
      let listinoCessioneUsato = null;
      let listinoPubblicoUsato = null;

      if (clienteId) {
        try {
          // Chiama l'endpoint corretto che abbiamo creato nel backend
          const responsePrezzi = await api.get(`/liste/prezzi/${articoloId}/${clienteId}`);
          
          if (responsePrezzi.data && responsePrezzi.data.prezziCalcolati) {
            const prezzi = responsePrezzi.data.prezziCalcolati;
            prezzoCessione = prezzi.prezzo_cessione || 0;
            prezzoPubblico = prezzi.prezzo_pubblico || 0;
            listinoCessioneUsato = prezzi.listino_cessione_usato;
            listinoPubblicoUsato = prezzi.listino_pubblico_usato;
          }

          // Se il backend richiede di far scegliere i listini, apri la modale
          if (responsePrezzi.data.richiestaSceltaListini) {
            const responseListini = await api.get(`/liste/prezzi-disponibili/${articoloId}`);
            setListiniDisponibili(responseListini.data.listini_disponibili || []);
            setListinoModalOpen(true);
            return; // Esci, la modale gestirà il resto
          }
        } catch (error) {
          // Se c'è un errore con i prezzi del cliente, passa silenziosamente alla logica di fallback.
          console.warn(`Impossibile caricare i prezzi per il cliente ${clienteId}, uso il default. Errore:`, error.message);
        }
      }

      // LOGICA DI FALLBACK: Se non c'è un cliente ID o i prezzi del cliente non sono validi,
      // carica i prezzi del Listino 1 come default.
      if (prezzoCessione === 0 && prezzoPubblico === 0) {
        const responseListini = await api.get(`/liste/prezzi-disponibili/${articoloId}`);
        const listino1 = responseListini.data.listini_disponibili?.find(l => l.numero === 1);
        
        if (listino1) {
          prezzoCessione = listino1.prezzo_cessione || 0;
          prezzoPubblico = listino1.prezzo_pubblico || 0;
          listinoCessioneUsato = 1; // Indica che è stato usato il listino 1
          listinoPubblicoUsato = 1;
        }
      }

      // Aggiorna lo stato con i prezzi finali (specifici o di fallback)
      setPrezziCliente({
        prezzo_cessione: prezzoCessione,
        prezzo_pubblico: prezzoPubblico,
        listino_cessione_usato: listinoCessioneUsato,
        listino_pubblico_usato: listinoPubblicoUsato
      });

    } catch (error) {
      console.error('Errore generale nel caricamento prezzi:', error);
      // In caso di errore catastrofico, imposta a zero per non bloccare l'UI
      setPrezziCliente({
        prezzo_cessione: 0,
        prezzo_pubblico: 0,
        listino_cessione_usato: null,
        listino_pubblico_usato: null
      });
    }
  };

  // Carica i prezzi quando cambia l'articolo selezionato o il cliente
  useEffect(() => {
    if (selectedItem && listType === 'ORDINE_VEND') {
      loadPrezzi(selectedItem.id, idDittaDestinataria);
    }
  }, [selectedItem, idDittaDestinataria, listType]);

  // Resetta i prezzi quando il cliente cambia per evitare confusione
  useEffect(() => {
    // FIX: Aggiunge un controllo di sicurezza per evitare l'errore "length"
    if (!listItems || listItems.length === 0) {
      setPrezziCliente({});
      return; // Esci precocemente
    }
    
    // Pulisce i riferimenti ai listini per gli articoli già presenti
    const updatedItems = listItems.map(item => ({
      ...item,
      listino_cessione_usato: null,
      listino_pubblico_usato: null,
    }));
    setListItems(updatedItems);
    setPrezziCliente({});
  }, [idDittaDestinataria]);

  const handleAddItem = () => {
    if (!selectedItem) return;

    // FIX: Assicura che listItems sia un array per evitare errori
    const currentItems = listItems || [];
    const existingItemIndex = currentItems.findIndex(item => item.id_articolo === selectedItem.id);

    // I prezzi sono già stati calcolati da loadPrezzi e sono in `prezziCliente`
    const prezzoUnitario = prezziCliente.prezzo_cessione || selectedItem.prezzo || 0;
    const prezzoPubblico = prezziCliente.prezzo_pubblico || selectedItem.prezzo_pubblico || 0;

    if (existingItemIndex >= 0) {
      const updatedItems = [...currentItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        qta: updatedItems[existingItemIndex].qta + 1,
        prezzo_unitario: prezzoUnitario,
        prezzo_pubblico: prezzoPubblico,
        listino_cessione_usato: prezziCliente.listino_cessione_usato,
        listino_pubblico_usato: prezziCliente.listino_pubblico_usato
      };
      setListItems(updatedItems);
    } else {
      const newItem = {
        id_articolo: selectedItem.id,
        articolo: selectedItem,
        qta: 1,
        prezzo_unitario: prezzoUnitario,
        prezzo_pubblico: prezzoPubblico,
        listino_cessione_usato: prezziCliente.listino_cessione_usato,
        listino_pubblico_usato: prezziCliente.listino_pubblico_usato,
        note: ''
      };
      setListItems([...currentItems, newItem]);
    }

    setSelectedItem(null);
  };
  
  const handleUpdateItem = (index, field, value) => {
    const currentItems = listItems || [];
    const updatedItems = [...currentItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setListItems(updatedItems);
  };

  const handlePrezzoChange = (index, type, value) => {
    if (user.livello <= 60) {
      alert('Modifica prezzi consentita solo a utenti con livello > 60');
      return;
    }
    const currentItems = listItems || [];
    const updatedItems = [...currentItems];
    if (type === 'unitario') {
      updatedItems[index].prezzo_unitario = parseFloat(value) || 0;
    } else if (type === 'pubblico') {
      updatedItems[index].prezzo_pubblico = parseFloat(value) || 0;
    }
    setListItems(updatedItems);
  };

  const handleRemoveItem = (index) => {
    const currentItems = listItems || [];
    if (!currentItems) return;
    setListItems(currentItems.filter((_, i) => i !== index));
  };

  const handleListinoConfirm = (listinoScelto) => {
    if (!currentItem) return;

    const currentItems = listItems || [];
    const updatedItems = [...currentItems];
    const itemIndex = updatedItems.findIndex(item => item.id_articolo === currentItem.id_articolo);

    if (itemIndex >= 0) {
      let finalPrezzoCessione = 0;
      let finalPrezzoPubblico = 0;

      if (listinoScelto.use_custom_prezzi) {
        finalPrezzoCessione = listinoScelto.prezzo_cessione || 0;
        finalPrezzoPubblico = listinoScelto.prezzo_pubblico || 0;
      } else {
        const listinoC = listiniDisponibili.find(l => l.numero === listinoScelto.listino_cessione);
        const listinoP = listiniDisponibili.find(l => l.numero === listinoScelto.listino_pubblico);
        finalPrezzoCessione = listinoC?.prezzo_cessione || 0;
        finalPrezzoPubblico = listinoP?.prezzo_pubblico || 0;
      }

      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        prezzo_unitario: finalPrezzoCessione,
        prezzo_pubblico: finalPrezzoPubblico,
        listino_cessione_usato: listinoScelto.listino_cessione,
        listino_pubblico_usato: listinoScelto.listino_pubblico,
      };
      setListItems(updatedItems);
    }

    setListinoModalOpen(false);
    setCurrentItem(null);
  };

  return (
    <>
      <div className="entity-selector p-4 bg-white rounded shadow mb-4">
        <h3 className="text-lg font-medium mb-4">
          Articoli
          {idDittaDestinataria && listType === 'ORDINE_VEND' && (
            <span className="text-sm text-gray-500 ml-2">
              (Prezzi calcolati per cliente)
            </span>
          )}
        </h3>

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

        {/* NUOVO BLOCCO PER ANTEPRIMA PREZZO */}
        {selectedItem && idDittaDestinataria && listType === 'ORDINE_VEND' && (prezziCliente.prezzo_cessione > 0 || prezziCliente.prezzo_pubblico > 0) && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">Anteprima Prezzi per: {selectedItem.descrizione}</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Pr. Cessione:</span>
                {/* FIX: Assicura che il prezzo sia un numero prima di formattarlo */}
                <span className="font-semibold ml-1">€{Number(prezziCliente.prezzo_cessione || 0).toFixed(2)}</span>
                {prezziCliente.listino_cessione_usato && <span className="text-xs text-blue-600 ml-2">(Listino {prezziCliente.listino_cessione_usato})</span>}
              </div>
              <div>
                <span className="text-gray-600">Pr. Pubblico:</span>
                {/* FIX: Assicura che il prezzo sia un numero prima di formattarlo */}
                <span className="font-semibold ml-1">€{Number(prezziCliente.prezzo_pubblico || 0).toFixed(2)}</span>
                {prezziCliente.listino_pubblico_usato && <span className="text-xs text-green-600 ml-2">(Listino {prezziCliente.listino_pubblico_usato})</span>}
              </div>
            </div>
          </div>
        )}

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
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prezzo Cessione
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prezzo Pubblico
                    </th>
                    {user.livello > 60 && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Listino
                      </th>
                    )}
                  </>
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
              {(listItems || []).map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.articolo.codice_articolo || item.articolo.codice}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.articolo.descrizione}
                      </div>
                      {item.listino_cessione_usato && (
                        <div className="text-xs text-blue-600 font-medium">
                          C: {item.listino_cessione_usato}
                        </div>
                      )}
                      {item.listino_pubblico_usato && (
                        <div className="text-xs text-green-600 font-medium">
                          P: {item.listino_pubblico_usato}
                        </div>
                      )}
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
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500 text-sm">€</span>
                          {/* FIX: Assicura che il valore sia un numero prima di formattarlo */}
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={Number(item.prezzo_unitario || 0).toFixed(2)}
                            onChange={(e) => handlePrezzoChange(index, 'unitario', e.target.value)}
                            disabled={user.livello <= 60}
                            className={`w-24 p-1 border rounded text-sm ${user.livello <= 60 ? 'border-gray-200 bg-gray-50' : 'border-gray-300'}`}
                          />
                          {user.livello <= 60 && (
                            <span className="text-xs text-gray-500" title="Modifica prezzi solo per utenti livello > 60">🔒</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500 text-sm">€</span>
                          {/* FIX: Assicura che il valore sia un numero prima di formattarlo */}
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={Number(item.prezzo_pubblico || 0).toFixed(2)}
                            onChange={(e) => handlePrezzoChange(index, 'pubblico', e.target.value)}
                            disabled={user.livello <= 60}
                            className={`w-24 p-1 border rounded text-sm ${user.livello <= 60 ? 'border-gray-200 bg-gray-50' : 'border-gray-300'}`}
                          />
                          {user.livello <= 60 && (
                            <span className="text-xs text-gray-500" title="Modifica prezzi solo per utenti livello > 60">🔒</span>
                          )}
                        </div>
                      </td>
                      {user.livello > 60 && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setCurrentItem(item);
                              // Carica i listini disponibili per questo articolo
                              api.get(`/liste/prezzi-disponibili/${item.id_articolo}`)
                                .then(response => {
                                  setListiniDisponibili(response.data.listini_disponibili);
                                  setListinoModalOpen(true);
                                })
                                .catch(error => {
                                  console.error('Errore caricamento listini:', error);
                                  alert('Impossibile caricare i listini disponibili');
                                });
                            }}
                            className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                          >
                            📋 Listini
                          </button>
                        </td>
                      )}
                    </>
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

          {(!listItems || listItems.length === 0) && (
            <div className="text-center py-4 text-gray-500">
              Nessun articolo aggiunto. Usa il campo di ricerca sopra per aggiungere articoli.
            </div>
          )}
        </div>
      </div>

      {/* Modale selezione listini */}
      <ListinoSelector
        isOpen={listinoModalOpen}
        onClose={() => {
          setListinoModalOpen(false);
          setCurrentItem(null);
        }}
        articolo={currentItem?.articolo}
        listiniDisponibili={listiniDisponibili}
        currentListinoCessione={currentItem?.listino_cessione_usato}
        currentListinoPubblico={currentItem?.listino_pubblico_usato}
        onConfirm={handleListinoConfirm}
        userLevel={user?.livello || 0}
      />
    </>
  );
};

export default EntitySelector;