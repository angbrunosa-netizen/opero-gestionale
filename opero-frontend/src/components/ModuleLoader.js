// #####################################################################
// # Caricatore di Moduli Dinamico - v2.0 (con Registro)
// # File: opero-frontend/src/components/ModuleLoader.js
// #####################################################################

import React from 'react';
import { getModuleComponent } from '../lib/moduleRegistry'; // Importiamo la nostra nuova funzione

/**
 * Componente che riceve una chiave testuale e renderizza il modulo corretto.
 * @param {object} props
 * @param {string} props.moduleKey - La chiave univoca del modulo (es. 'AMMINISTRAZIONE').
 */
const ModuleLoader = ({ moduleKey }) => {
  // Otteniamo il componente dal nostro registro
  const ModuleComponent = getModuleComponent(moduleKey);

  // Se la chiave non corrisponde a nessun componente, mostriamo un messaggio.
  if (!ModuleComponent) {
    return (
      <div className="text-center p-8 bg-yellow-100 border border-yellow-400 rounded">
        <h2 className="text-xl font-semibold">Modulo non implementato</h2>
        <p>Il modulo con chiave '<strong>{moduleKey}</strong>' non è stato ancora configurato nel file `moduleRegistry.js`.</p>
      </div>
    );
  }

  // Usiamo Suspense per mostrare un messaggio di caricamento mentre il componente
  // del modulo viene scaricato dal browser.
  return (
    <React.Suspense fallback={<div className="text-center p-8">Caricamento modulo...</div>}>
      <ModuleComponent />
    </React.Suspense>
  );
};

export default ModuleLoader;
