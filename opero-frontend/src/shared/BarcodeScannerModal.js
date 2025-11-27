import React, { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { XMarkIcon, CameraIcon } from '@heroicons/react/24/outline';

const BarcodeScannerModal = ({ isOpen, onClose, onScan }) => {
  const [error, setError] = useState(null);
  // Aggiungiamo una chiave per forzare il remount del componente Scanner
  const [scannerKey, setScannerKey] = useState(0);

  useEffect(() => {
    console.log("BarcodeScannerModal: il modale è aperto?", isOpen);
    if (isOpen) {
      setError(null);
      // Forza il remount dello scanner ogni volta che il modale si apre
      setScannerKey(prev => prev + 1);
    }
  }, [isOpen]);

  const handleDecode = (result) => {
    console.log("handleDecode chiamato con:", result);
    if (result && result.length > 0) {
      const code = result[0].rawValue;
      console.log("Codice trovato:", code);
      if (code) {
        onScan(code);
        onClose();
      }
    }
  };

  const handleError = (error) => {
    console.error("Errore inizializzazione scanner:", error);
    setError("Errore: " + error.message);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-700">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-gray-800 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <CameraIcon className="w-6 h-6 text-blue-400" /> 
            Scannerizza EAN/Barcode
          </h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-400 rounded-full hover:bg-gray-700 transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Viewport Camera */}
        <div className="relative bg-black flex-1 min-h-[300px] flex items-center justify-center overflow-hidden">
          {/* 
            MODIFICHE CHIAVE:
            1. Aggiunto `key={scannerKey}` per forzare un reset completo.
            2. Rimosso completamente l'oggetto `constraints` per usare le impostazioni di default del browser.
          */}
          <Scanner
            key={scannerKey}
            onDecode={handleDecode}
            onError={handleError}
          />
          
          {error && (
            <div className="absolute bottom-4 left-4 right-4 bg-red-600/90 text-white p-3 rounded-lg text-sm text-center shadow-lg backdrop-blur-md">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-800 text-xs text-gray-400 text-center border-t border-gray-700">
          Inquadra il codice a barre.
        </div>
      </div>
    </div>
  );
};

export default BarcodeScannerModal;