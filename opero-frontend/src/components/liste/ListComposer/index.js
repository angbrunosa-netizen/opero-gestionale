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
  
  const { isLoading, error, loadList, saveList, processList, deleteList, cloneList } = useListData(id);

  const handleSave = async () => {
    try {
      await saveList(listData, listItems);
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
        <EntitySelector listItems={listItems} setListItems={setListItems} listType={listData.tipo_documento} />
        <ListActions listData={listData} onSave={handleSave} onProcess={handleProcess} onPrint={handlePrint} onDelete={handleDelete} onClone={handleClone} />

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
            <strong className="font-bold">Errore:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}
      </div>
    
  );
};

export default ListComposer;