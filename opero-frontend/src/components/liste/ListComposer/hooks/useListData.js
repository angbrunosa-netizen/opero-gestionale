// src/components/liste/ListComposer/hooks/useListData.js



import { useState, useCallback } from 'react';
import { api } from '../../../../services/api';

export const useListData = (listId) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Funzione per caricare una lista esistente
  const loadList = useCallback(async () => {
    if (!listId) return null;
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/liste/${listId}`);
      return response.data; // { testata: {...}, righe: [...] }
    } catch (err) {
      console.error("Errore nel caricamento della lista:", err);
      setError(err.response?.data?.error || 'Errore nel caricamento della lista.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [listId]);

  // Funzione per salvare (creare o aggiornare) una lista
  const saveList = useCallback(async (testata, righe) => {
    setIsLoading(true);
    setError(null);
    try {
      let response;
      if (listId) {
        // Aggiorna lista esistente
        await api.put(`/liste/${listId}`, testata);
        // Aggiorna le righe (potrebbe richiedere una logica più complessa per sync aggiunte/rimosse/modificate)
        // Per semplicità, qui assumiamo una API che gestisce il sync delle righe
        await api.post(`/liste/${listId}/sync-righe`, { righe });
        response = { id: listId, ...testata };
      } else {
        // Crea nuova lista
        const listaResponse = await api.post('/liste', testata);
        const newListId = listaResponse.data.id;
        await api.post(`/liste/${newListId}/righe-bulk`, { righe }); // API bulk insert
        response = listaResponse.data;
      }
      return response;
    } catch (err) {
      console.error("Errore nel salvataggio della lista:", err);
      setError(err.response?.data?.error || 'Errore durante il salvataggio.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [listId]);

  // Funzione per processare la lista in un documento reale
  const processList = useCallback(async () => {
    if (!listId) return null;
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post(`/liste/${listId}/processa`);
      return response.data; // { message, documento: { tipo, id, ... } }
    } catch (err) {
      console.error("Errore durante il processamento:", err);
      setError(err.response?.data?.error || 'Errore durante la generazione del documento.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [listId]);

  // Funzione per eliminare una lista
  const deleteList = useCallback(async () => {
    if (!listId) return;
    setIsLoading(true);
    setError(null);
    try {
      await api.delete(`/liste/${listId}`);
    } catch (err) {
      console.error("Errore nell'eliminazione della lista:", err);
      setError(err.response?.data?.error || 'Errore durante l\'eliminazione.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [listId]);

  // Funzione per clonare una lista
  const cloneList = useCallback(async () => {
    if (!listId) return null;
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post(`/liste/${listId}/clona`);
      return response.data.id; // Restituisce l'ID della nuova lista
    } catch (err) {
      console.error("Errore nella clonazione della lista:", err);
      setError(err.response?.data?.error || 'Errore durante la clonazione.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [listId]);

  return {
    isLoading,
    error,
    loadList,
    saveList,
    processList,
    deleteList,
    cloneList,
  };
};