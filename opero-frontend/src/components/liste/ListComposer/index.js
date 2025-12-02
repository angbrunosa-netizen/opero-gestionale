import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ListHeader from './components/ListHeader';
import EntitySelector from './components/EntitySelector';
import ListActions from './components/ListActions';
import { useListData } from './hooks/useListData';
// PERCORSO CORRETTO DA components/liste/ListComposer a hooks/
import { useNotification } from '../../../hooks/useNotification';
// PERCORSO CORRETTO PER I FILE STILI
import styles from './styles/ListComposer.module.css';

const ListComposer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  const [listData, setListData] = useState({
    id_ditta: 1,
    id_causale_movimento: '',
    descrizione: '',
    id_ditta_destinataria: null,
    id_magazzino: null,
    data_riferimento: new Date().toISOString().split('T')[0],
    stato: 'BOZZA',
    meta_dati: {}
  });
  
  const [listItems, setListItems] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);

  const { isLoading, error, loadList, saveList, processList, deleteList, cloneList } = useListData(id);

  // Blocco navigazione quando ci sono modifiche non salvate (alternativa compatibile)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = ''; // Standard per la maggior parte dei browser
        return '';
      }
    };

    // Gestione navigazione con React Router
    const unblock = navigate.block ? navigate.block((location) => {
      if (isDirty && location.pathname !== window.location.pathname) {
        setShowConfirmDialog(true);
        setPendingNavigation(() => () => navigate(location));
        return false; // Blocca la navigazione
      }
      return true; // Permetti la navigazione
    }) : null;

    // Event listener per beforeunload (chiusura tab/finestra)
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (unblock) unblock();
    };
  }, [isDirty, navigate]);

  // Gestione conferma navigazione
  const handleConfirmNavigation = (confirmed) => {
    setShowConfirmDialog(false);
    if (confirmed && pendingNavigation) {
      setIsDirty(false);
      pendingNavigation();
    }
    setPendingNavigation(null);
  };

  // Tracciamento modifiche
  useEffect(() => {
    const hasUnsavedChanges = listItems.length > 0 ||
                              listData.descrizione !== '' ||
                              listData.id_causale_movimento !== '';
    setIsDirty(hasUnsavedChanges);
  }, [listData, listItems]);

  const handleSave = async () => {
    try {
      await saveList(listData, listItems);
      setIsDirty(false); // Resetta stato dirty dopo salvataggio
      showNotification('Lista salvata con successo', 'success');
    } catch (err) {
      showNotification(err.message || 'Errore durante il salvataggio', 'error');
    }
  };

  const handleProcess = async () => {
    try {
      const result = await processList();
      showNotification(`Documento generato con successo: ${result.documento_generato.tipo} ID ${result.documento_generato.movimenti[0].id}`, 'success');
    } catch (err) {
      showNotification(err.message || 'Errore durante la generazione del documento', 'error');
    }
  };
  
  const handlePrint = () => {
    if (id) {
      window.open(`/api/liste/${id}/print`, '_blank');
    } else {
      showNotification('Salva la lista prima di stamparla', 'warning');
    }
  };
  
  const handleDelete = async () => {
    if (window.confirm('Sei sicuro di voler eliminare questa lista?')) {
      try {
        await deleteList();
        showNotification('Lista eliminata con successo', 'success');
        navigate('/liste');
      } catch (err) {
        showNotification(err.message || 'Errore durante l\'eliminazione', 'error');
      }
    }
  };

  const handleClone = async () => {
    try {
      const newListId = await cloneList();
      showNotification('Lista clonata con successo', 'success');
      navigate(`/liste/${newListId}`);
    } catch (err) {
      showNotification(err.message || 'Errore durante la clonazione', 'error');
    }
  };

  if (isLoading && id) {
    return <div className="flex justify-center items-center h-64">Caricamento...</div>;
  }

  return (
    <div className={styles.listComposer}>
        {/* Indicatore stato modifiche non salvate */}
        {isDirty && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <span className="font-medium">Modifiche non salvate</span> - Ricorda di salvare prima di uscire
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header con pulsante "Crea Nuova Lista" quando siamo in modalità creazione */}
        {!id && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-blue-900">Crea Nuova Lista</h2>
                <p className="text-sm text-blue-700 mt-1">
                  Compila i dati della lista e aggiungi gli articoli. Il numero progressivo verrà assegnato automaticamente al salvataggio.
                </p>
              </div>
              <button
                onClick={handleSave}
                disabled={!listData.descrizione || !listData.id_causale_movimento || listItems.length === 0}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Salva Lista
              </button>
            </div>
          </div>
        )}

        <ListHeader listData={listData} setListData={setListData} />
        <EntitySelector
          listItems={listItems}
          setListItems={setListItems}
          listType={listData.tipo_documento}
          idDittaDestinataria={listData.id_ditta_destinataria}
        />
        <ListActions listData={listData} onSave={handleSave} onProcess={handleProcess} onPrint={handlePrint} onDelete={handleDelete} onClone={handleClone} />

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
            <strong className="font-bold">Errore:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {/* Dialogo di conferma per navigazione con modifiche non salvate */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Modifiche non salvate
              </h3>
              <p className="text-gray-600 mb-6">
                Hai delle modifiche non salvate. Sei sicuro di voler uscire senza salvare?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => handleConfirmNavigation(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={() => handleConfirmNavigation(true)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Esci senza salvare
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

  );
};

export default ListComposer;