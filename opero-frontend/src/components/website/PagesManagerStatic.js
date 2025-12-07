/**
 * Pages Manager Static - Versione statica senza stati per evitare re-render
 */

import React from 'react';

const PagesManagerStatic = ({ siteId, siteTitle, subdomain }) => {
  // Versione statica senza stati - mostriamo solo HTML fisso per test
  return (
    <div className="p-8 bg-white border-4 border-green-500">
      <h2 className="text-2xl font-bold mb-4 text-green-800">
        GESTIONE PAGINE (STATIC TEST)
      </h2>

      <div className="mb-6 p-4 bg-green-50 rounded-lg">
        <p className="text-green-800 font-semibold">DATI RICEVUTI:</p>
        <p className="text-green-700">Site ID: {siteId || 'NON DEFINITO'}</p>
        <p className="text-green-700">Site Title: {siteTitle || 'NON DEFINITO'}</p>
        <p className="text-green-700">Subdomain: {subdomain || 'NON DEFINITO'}.operocloud.it</p>
      </div>

      <div className="mb-6">
        <button
          onClick={() => {
            console.log('TEST CLICK: pulsante premuto');
            alert('Componente statico funzionante! Site ID: ' + siteId);
          }}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
        >
          TEST CLICK QUI
        </button>
      </div>

      <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-lg text-gray-700 mb-2">Se vedi questo, il componente è caricato correttamente!</p>
        <p className="text-sm text-gray-500">Nessun reindirizzamento dovrebbero avvenire</p>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-blue-800 text-sm">
          Se questo componente rimane visibile senza sparire, il problema è negli stati
          e useEffect nel componente PagesManagerSimple.
        </p>
      </div>
    </div>
  );
};

export default PagesManagerStatic;