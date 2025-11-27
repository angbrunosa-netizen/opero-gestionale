import React, { useState, useEffect, useRef } from 'react';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';
import { XMarkIcon, CameraIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/outline';

const BarcodeScannerModal = ({ isOpen, onClose, onScan }) => {
  const [error, setError] = useState(null);
  const [permissionState, setPermissionState] = useState('prompt'); // 'prompt', 'granted', 'denied'
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastScan, setLastScan] = useState(null);
  const streamRef = useRef(null); // Per gestire lo stream della fotocamera

  // Controlla i permessi all'apertura del modale
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setLastScan(null);
      // Controlla lo stato del permesso per la fotocamera
      navigator.permissions.query({ name: 'camera' }).then((result) => {
        setPermissionState(result.state);
        result.onchange = () => setPermissionState(result.state);
      }).catch(err => {
        // Se il browser non supporta l'API permissions, assumiamo che sia in 'prompt'
        console.warn("API Permissions non supportata per la camera.");
        setPermissionState('prompt');
      });
    } else {
      // Quando il modale si chiude, ferma lo stream se è attivo
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
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

  const handleUpdate = (err, result, stream) => {
    // Salva il riferimento allo stream per poterlo fermare dopo
    if (stream) {
        streamRef.current = stream;
    }

    if (result) {
      if (lastScan === result.text) return; 
      
      setLastScan(result.text);
      playBeep();
      onScan(result.text); 
      onClose(); 
    } else if (err) {
      // L'errore "NotFoundException" è normale e viene ignorato
      if (err.name !== "NotFoundException") {
        console.error("Errore dello scanner:", err);
        setError(err.message || "Errore durante la scansione.");
      }
    }
  };
  
  // Se il modale non è aperto, non renderizzare nulla
  if (!isOpen) return null;

  // Se i permessi sono stati negati, mostra un messaggio chiaro
  if (permissionState === 'denied') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md text-center">
            <CameraIcon className="h-12 w-12 text-red-500 mx-auto mb-4"/>
            <h3 className="text-lg font-bold text-gray-900">Accesso alla Fotocamera Negato</h3>
            <p className="mt-2 text-sm text-gray-600">
                Per utilizzare lo scanner, concedi l'accesso alla fotocamera nelle impostazioni del tuo browser.
            </p>
            <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Chiudi</button>
        </div>
      </div>
    )
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
          {permissionState === 'prompt' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
              <p className="text-white text-center px-4">
                Attendi il permesso per la fotocamera o clicca sull'icona della fotocamera nella barra degli indirizzi per consentire l'accesso.
              </p>
            </div>
          )}
          <BarcodeScannerComponent
            width={500}
            height={500}
            onUpdate={handleUpdate}
            facingMode="environment"
             tryHarder={true} 
          />
          
          {/* Overlay Reticolo */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
             <div className="w-64 h-40 border-2 border-red-500/70 rounded-lg relative bg-transparent box-border shadow-[0_0_0_999px_rgba(0,0,0,0.6)]">
                <div className="absolute top-1/2 left-2 right-2 h-0.5 bg-red-600 shadow-[0_0_8px_rgba(255,0,0,0.8)] animate-pulse"></div>
                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-red-500 -mt-1 -ml-1"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-red-500 -mt-1 -mr-1"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-red-500 -mb-1 -ml-1"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-red-500 -mb-1 -mr-1"></div>
             </div>
             <p className="mt-4 text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
                Inquadra il codice a barre
             </p>
          </div>
          
          {error && (
            <div className="absolute bottom-4 left-4 right-4 bg-red-600/90 text-white p-3 rounded-lg text-sm text-center shadow-lg backdrop-blur-md">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-800 text-xs text-gray-400 text-center border-t border-gray-700">
          Supporta EAN-13, EAN-8, UPC, Code128. Assicurati che ci sia luce sufficiente.
        </div>
      </div>
    </div>
  );
};

export default BarcodeScannerModal;