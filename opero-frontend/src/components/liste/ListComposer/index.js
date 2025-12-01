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
  
  useEffect(() => {
    if (id) {
      loadList()
        .then(data => {
          if (data) {
            setListData(data.testata);
            setListItems(data.righe || []);
          }
        })
        .catch(err => {
          showNotification(err.message || 'Errore nel caricamento della lista', 'error');
        });
    }
  }, [id, loadList]);

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