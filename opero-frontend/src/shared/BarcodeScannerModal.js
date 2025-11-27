import React, { useState, useEffect } from 'react';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';
import { XMarkIcon, CameraIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/outline';

const BarcodeScannerModal = ({ isOpen, onClose, onScan }) => {
  const [error, setError] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastScan, setLastScan] = useState(null);

  // Reset stato all'apertura
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setLastScan(null);
    }
  }, [isOpen]);

  // Feedback sonoro (BEEP)
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
      console.warn("Audio feedback error", e);
    }
  };

  const handleUpdate = (err, result) => {
    if (result) {
      // Evita letture multiple immediate dello stesso codice
      if (lastScan === result.text) return;
      
      setLastScan(result.text);
      playBeep();
      onScan(result.text);
      onClose(); // Chiude la modale dopo la lettura
    }
    // Ignoriamo gli errori di "NotFound" che avvengono a ogni frame
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-700">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-gray-800 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <CameraIcon className="w-6 h-6 text-blue-400" /> 
            Scannerizza EAN-8/13
          </h3>
          <div className="flex items-center gap-2">
            <button 
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700"
            >
                {soundEnabled ? <SpeakerWaveIcon className="w-5 h-5"/> : <SpeakerXMarkIcon className="w-5 h-5"/>}
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-400 rounded-full hover:bg-gray-700">
                <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Area Fotocamera */}
        <div className="relative bg-black flex-1 min-h-[300px] flex items-center justify-center overflow-hidden">
          <BarcodeScannerComponent
            width={500}
            height={500}
            onUpdate={handleUpdate}
            facingMode="environment" // Usa la fotocamera posteriore (migliore focus)
            stopStream={!isOpen}
          />
          
          {/* Mirino Rosso */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
             <div className="w-64 h-32 border-2 border-red-500/70 rounded-lg relative shadow-[0_0_0_999px_rgba(0,0,0,0.6)]">
                <div className="absolute top-1/2 left-2 right-2 h-0.5 bg-red-600 shadow-[0_0_8px_rgba(255,0,0,0.8)] animate-pulse"></div>
             </div>
             <p className="mt-4 text-white text-xs font-medium bg-black/50 px-2 py-1 rounded">
                Inquadra il codice a barre
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScannerModal;