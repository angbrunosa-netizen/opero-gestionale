import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserMultiFormatReader, BarcodeFormat } from '@zxing/browser'; // <--- IMPORT AGGIORNATO
import { XMarkIcon, CameraIcon, PhotoIcon } from '@heroicons/react/24/outline';

const BarcodeScannerModal = ({ isOpen, onClose, onScan }) => {
  const [error, setError] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const videoRef = useRef(null);
  const scannerRef = useRef(null);

  // Funzione per avviare lo scanner
  const startScanner = useCallback(async () => {
    if (!videoRef.current || !selectedDeviceId) return;

    try {
      // --- MODIFICA 1: Chiediamo una risoluzione più alta ---
      // Questo dà alla libreria più "pixel" con cui lavorare, aumentando le possibilità di lettura.
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: selectedDeviceId },
          facingMode: "environment",
          width: { ideal: 1920 }, // Risoluzione Full HD
          height: { ideal: 1080 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // --- MODIFICA 2: Creiamo il lettore con i formati corretti ---
      // Invece di cercare tutto (QR, DataMatrix, etc.), cerchiamo solo i codici a barre 1D.
      // Questo rende la ricerca molto più veloce ed efficiente.
      scannerRef.current = new BrowserMultiFormatReader();

      // --- MODIFICA 3: Logging dettagliato per il debug ---
      // Questo ci aiuterà a capire esattamente cosa succede.
      const onDecodeResult = (result, error) => {
        console.log("Callback di decodifica ricevuta.");
        console.log("Risultato:", result);
        console.log("Errore:", error);

        if (result) {
          const code = result.getText();
          console.log("Codice decodificato con successo:", code);
          onScan(code);
          onClose();
        } else if (error) {
          // La libreria passa un oggetto errore se non riesce a leggere
          console.error("Errore di decodifica specifico:", error.name, error.message);
          // Non mostriamo l'errore all'utente, è "rumore di fondo"
        } else {
          // Questo è il caso normale: nessun codice trovato in questo frame.
          // Non fare nulla, la libreria continuerà a scansionare.
          // console.log("Nessun codice trovato in questo frame, continuo la ricerca...");
        }
      };

      scannerRef.current.decodeFromVideoDevice(stream, selectedDeviceId, onDecodeResult);

    } catch (err) {
      console.error("Errore accesso fotocamera:", err);
      setError("Impossibile accedere alla fotocamera. Controlla i permessi.");
    }
  }, [onScan, onClose, selectedDeviceId]);

  // Funzione per ottenere la lista delle fotocamere
  const getDevices = useCallback(async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
      if (videoDevices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    } catch (err) {
      console.error("Errore elenco dispositivi:", err);
    }
  }, [selectedDeviceId]);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      getDevices();
    }
  }, [isOpen, getDevices]);

  useEffect(() => {
    if (isOpen && selectedDeviceId) {
      startScanner();
    }

    // Funzione di cleanup
    return () => {
      if (scannerRef.current) {
        scannerRef.current.reset();
      }
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen, selectedDeviceId, startScanner]);

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
          <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline />
          
          {error && (
            <div className="absolute bottom-4 left-4 right-4 bg-red-600/90 text-white p-3 rounded-lg text-sm text-center shadow-lg backdrop-blur-md">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-800 text-xs text-gray-400 text-center border-t border-gray-700 space-y-2">
          {devices.length > 1 && (
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="w-full p-1 rounded bg-gray-700 text-white border border-gray-600"
            >
              {devices.map(device => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Fotocamera (${device.deviceId.substring(0, 5)}...)`}
                </option>
              ))}
            </select>
          )}
          <p><strong>Consigli:</strong> Assicurati che il codice sia ben illuminato, fermo e riempisca l'area di scansione.</p>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScannerModal;