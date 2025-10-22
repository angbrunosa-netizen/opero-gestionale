// #####################################################################
// # Componente ShowLinkModal (NUOVO)
// # File: opero-frontend/src/shared/ShowLinkModal.js
// # Descrizione: Un semplice modale per mostrare un link generato
// # e permettere all'utente di copiarlo.
// #####################################################################

import React from 'react';
import { toast } from 'react-toastify';
import { XMarkIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';

function ShowLinkModal({ isOpen, onClose, title, link }) {
    if (!isOpen) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(link)
            .then(() => {
                toast.success('Link copiato negli appunti!');
                onClose(); // Chiudi la modale dopo la copia
            })
            .catch(err => {
                toast.error('Errore nella copia automatica. Seleziona e copia manualmente.');
                console.error("Errore copia link:", err);
            });
    };

    return (
        // Overlay scuro
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out">
            {/* Contenitore modale */}
            <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 w-full max-w-lg transform transition-all duration-300 ease-in-out scale-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">{title || 'Link Generato'}</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 focus:outline-none"
                        aria-label="Chiudi"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                    Fornisci il seguente link all'utente. Il link è valido per 1 ora.
                </p>
                
                {/* Input disabilitato per facilitare la copia */}
                <div className="mb-6">
                    <input
                        type="text"
                        value={link}
                        readOnly
                        className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-gray-700"
                        onFocus={(e) => e.target.select()} // Seleziona tutto al click
                    />
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                    >
                        Chiudi
                    </button>
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <ClipboardDocumentIcon className="h-5 w-5 mr-2" />
                        Copia Link
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ShowLinkModal;