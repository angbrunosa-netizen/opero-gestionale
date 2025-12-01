import React from 'react';
import { Save, Printer, Play, Trash2, Copy } from 'lucide-react';
// PERCORSO CORRETTO DA components/liste/ListComposer/components a context/
import { useAuth } from '../../../../context/AuthContext';
import styles from '../styles/ListComposer.module.css';

const ListActions = ({ listData, onSave, onProcess, onPrint, onDelete, onClone }) => {
  const { hasPermission } = useAuth(); 
  
  const canProcess = listData.stato === 'BOZZA' && hasPermission('LS_LISTE_PROCESS');
  const canDelete = listData.stato === 'BOZZA' && hasPermission('LS_LISTE_DELETE');
  const canClone = hasPermission('LS_LISTE_CREATE');

  return (
    <div className={styles.listActions}>
      <button onClick={onSave} className={`${styles.button} bg-blue-600 hover:bg-blue-700 text-white`}>
        <Save className="w-4 h-4 inline mr-2" />
        Salva Bozza
      </button>
      
      <button onClick={onPrint} disabled={!canClone} className={`${styles.button} bg-gray-600 hover:bg-gray-700 text-white disabled:bg-gray-400`}>
        <Printer className="w-4 h-4 inline mr-2" />
        Stampa PDF
      </button>
      
      {canProcess && (
        <button onClick={onProcess} className={`${styles.button} bg-green-600 hover:bg-green-700 text-white`}>
          <Play className="w-4 h-4 inline mr-2" />
          Genera Documento
        </button>
      )}
      
      {canClone && (
        <button onClick={onClone} className={`${styles.button} bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-400`}>
          <Copy className="w-4 h-4 inline mr-2" />
          Duplica Lista
        </button>
      )}
      
      {canDelete && (
        <button onClick={onDelete} className={`${styles.button} bg-red-600 hover:bg-red-700 text-white`}>
          <Trash2 className="w-4 h-4 inline mr-2" />
          Elimina
        </button>
      )}
    </div>
  );
};

export default ListActions;