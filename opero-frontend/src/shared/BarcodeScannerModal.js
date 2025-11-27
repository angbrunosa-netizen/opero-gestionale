import React, { useState, useEffect } from 'react';
// CORRETTO: Importa 'Scanner' invece di 'QrScanner'
import { Scanner } from '@yudiel/react-qr-scanner'; 
import { XMarkIcon, CameraIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/outline';

const BarcodeScannerModal = ({ isOpen, onClose, onScan }) => {
  const [error, setError] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Resetta l'errore all'apertura
  useEffect(() => {
    if (isOpen) {
      setError(null);
    }
  }, [isOpen]);

  // Funzione per emettere il BEEP
  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      
      const audioCtx = new AudioContext();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'square';
      oscillator.frequency.value = 1500;
      gainNode.gain.value = 0.1;

      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioCtx.close();
      }, 100);
    } catch (e) {
      console.warn("Audio non supportato o bloccato", e);
    }
  };

  const handleDecode = (result) => {
    if (result && result.length > 0) {
      playBeep();
      // Il risultato è un array di oggetti, prendiamo il valore grezzo del primo
      onScan(result[0].rawValue); 
      onClose();
    }
  };

  const handleError = (err) => {
    console.error("Errore dello scanner:", err);
    setError("Impossibile accedere alla fotocamera. Controlla i permessi.");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-700">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-gray-800 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <CameraIcon className="w-6 h-6 text-blue-400" /> 
            Scannerizza EAN/Barcode
          </h3>
          <div className="flex items-center gap-2">
            <button 
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700 transition-colors"
            >
                {soundEnabled ? <SpeakerWaveIcon className="w-5 h-5"/> : <SpeakerXMarkIcon className="w-5 h-5"/>}
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-400 rounded-full hover:bg-gray-700 transition-colors">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Viewport Camera */}
        <div className="relative bg-black flex-1 min-h-[300px] flex items-center justify-center overflow-hidden">
          {/* CORRETTO: Usa il componente 'Scanner' */}
          <Scanner
            onDecode={handleDecode}
            onError={handleError}
            constraints={{
              facingMode: 'environment',
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }}
          />
          
          {/* Overlay Reticolo e ISTRUZIONI */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
             <div className="w-64 h-40 border-2 border-red-500/70 rounded-lg relative bg-transparent box-border shadow-[0_0_0_999px_rgba(0,0,0,0.6)]">
                <div className="absolute top-1/2 left-2 right-2 h-0.5 bg-red-600 shadow-[0_0_8px_rgba(255,0,0,0.8)] animate-pulse"></div>
                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-red-500 -mt-1 -ml-1"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-red-500 -mt-1 -mr-1"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-red-500 -mb-1 -ml-1"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-red-500 -mb-1 -mr-1"></div>
             </div>
             <div className="mt-4 text-center">
                <p className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full mb-2">
                    Tappa sullo schermo per mettere a fuoco
                </p>
                <p className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
                    Avvicina il telefono al codice
                </p>
             </div>
          </div>
          
          {error && (
            <div className="absolute bottom-4 left-4 right-4 bg-red-600/90 text-white p-3 rounded-lg text-sm text-center shadow-lg backdrop-blur-md">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-800 text-xs text-gray-400 text-center border-t border-gray-700">
          Assicurati che il codice sia ben illuminato e nitido.
        </div>
      </div>
    </div>
  );
};

export default BarcodeScannerModal;