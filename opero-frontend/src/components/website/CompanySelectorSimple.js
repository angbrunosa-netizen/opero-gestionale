/**
 * Company Selector Simple Test Component
 * Versione semplificata per debugging
 */

import React, { useState, useEffect } from 'react';

const CompanySelectorSimple = ({ onCompanySelected, onBack }) => {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    // Dati mock di test
    setCompanies([
      { id: 1, ragione_sociale: 'Azienda Test 1' },
      { id: 2, ragione_sociale: 'Azienda Test 2' }
    ]);
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Seleziona Azienda (Simple)</h2>
        <p className="text-gray-600 mt-1">Versione di test per debugging</p>
      </div>

      <div className="space-y-4">
        {companies.map((company) => (
          <div
            key={company.id}
            onClick={() => onCompanySelected({ company })}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg cursor-pointer"
          >
            <h3 className="text-lg font-semibold text-gray-900">
              {company.ragione_sociale}
            </h3>
          </div>
        ))}
      </div>

      <button
        onClick={onBack}
        className="mt-6 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
      >
        ← Indietro
      </button>
    </div>
  );
};

export default CompanySelectorSimple;