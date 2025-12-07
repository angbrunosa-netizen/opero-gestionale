/**
 * Pages Manager Simple - Componente di test
 */

import React, { useState, useEffect } from 'react';

const PagesManagerSimple = ({ siteId, siteTitle, subdomain }) => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    console.log('PagesManagerSimple: componente montato, siteId:', siteId);
    setMounted(true);
    loadPages();

    // Cleanup per evitare memory leak
    return () => {
      console.log('PagesManagerSimple: componente smontato');
      setMounted(false);
    };
  }, [siteId]);

  const loadPages = async () => {
    try {
      if (!mounted) {
        console.log('PagesManagerSimple: componente non più montato, interrompo');
        return;
      }

      console.log('PagesManagerSimple: inizio fetch pagine');
      setLoading(true);

      const response = await fetch(`/api/website/${siteId}/pages`);
      const data = await response.json();

      console.log('PagesManagerSimple: risposta API:', data);

      if (!mounted) {
        console.log('PagesManagerSimple: componente smontato durante fetch, ignoro risultato');
        return;
      }

      if (data.success) {
        console.log('PagesManagerSimple: imposto pagine:', data.pages?.length || 0);
        setPages(data.pages || []);
        setMessage(`Caricate ${data.pages?.length || 0} pagine`);
      } else {
        console.log('PagesManagerSimple: errore API:', data.error);
        setMessage('Errore nel caricamento');
      }
    } catch (error) {
      console.error('PagesManagerSimple: errore fetch:', error);
      if (mounted) {
        setMessage('Errore di connessione');
        setPages([]);
      }
    } finally {
      if (mounted) {
        setLoading(false);
        console.log('PagesManagerSimple: caricamento completato');
      }
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p>Caricamento pagine...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white">
      <h2 className="text-2xl font-bold mb-4">Gestione Pagine - {siteTitle}</h2>
      <p className="text-gray-600 mb-6">Sottodominio: {subdomain}.operocloud.it</p>

      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-blue-800">{message}</p>
      </div>

      {pages.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Nessuna pagina trovata</p>
          <button
            onClick={() => alert('Funzione crea pagina in arrivo!')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Crea Prima Pagina
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Pagine trovate ({pages.length}):</h3>
          {pages.map((page) => (
            <div key={page.id} className="p-4 border rounded-lg">
              <h4 className="font-semibold">{page.titolo}</h4>
              <p className="text-gray-600">Slug: /{page.slug}</p>
              <p className="text-sm text-gray-500">
                Pubblicata: {page.is_published ? 'Sì' : 'No'} |
                Ordine: {page.menu_order}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PagesManagerSimple;