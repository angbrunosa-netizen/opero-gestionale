// #####################################################################
// # Componente Modale Riutilizzabile per Invito Utenti - v4.0 (Scelta Statica)
// # File: opero-frontend/src/shared/InvitaUtenteModal.js
// # - MODIFICA: La scelta del tipo utente non è più dinamica (da API).
// # - Viene presentata una scelta fissa tra "Utente Interno" (codice 1) e "Utente Esterno" (codice 2).
// # - Il componente ora è più semplice e non dipende da un endpoint secondario.
// #####################################################################

import React, { useState } from 'react'; // 'useEffect' non è più necessario
import { api } from '../services/api';
import { toast } from 'react-toastify';
import { PaperAirplaneIcon, ClipboardDocumentIcon, XMarkIcon } from '@heroicons/react/24/outline';

const InvitaUtenteModal = ({ isOpen, onClose, onInviteSent, id_ruolo }) => {
    const [email, setEmail] = useState('');
    // Impostiamo un valore di default per il tipo utente (1 = Interno)
    const [codiceTipoUtente, setCodiceTipoUtente] = useState('1'); 
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [generatedLink, setGeneratedLink] = useState(null);

    // Il useEffect per recuperare i tipi utente è stato rimosso

    const handleInvite = async () => {
        if (!email || !id_ruolo ) {
            setError('Tutti i campi sono obbligatori.');
            return;
        }
        setIsLoading(true);
        setError('');
        
        try {
            const response = await api.post('/amministrazione/utenti/invita', {
                email,
                id_ruolo,
                // Convertiamo la stringa in numero prima di inviarla
                //Codice_Tipo_Utente: parseInt(codiceTipoUtente, 10),
            });
            
            toast.success(response.data.message);
            
            if (response.data.link) {
                setGeneratedLink(response.data.link);
            } else {
                handleClose(true);
            }

        } catch (err) {
            const errorMessage = err.response?.data?.message || "Si è verificato un errore.";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!generatedLink) return;
        navigator.clipboard.writeText(generatedLink).then(() => {
            toast.info('Link copiato negli appunti!');
        }).catch(err => {
            toast.error('Impossibile copiare il link.');
            console.error('Errore durante la copia:', err);
        });
    };

    const handleClose = (invitationWasSuccessful = false) => {
        setEmail('');
        setError('');
        // Resettiamo il tipo utente al valore di default
        setCodiceTipoUtente('1'); 
        setGeneratedLink(null);
        onClose();
        if (invitationWasSuccessful || generatedLink) {
            onInviteSent();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity">
            <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-lg relative transform transition-all">
                <button onClick={() => handleClose(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
                    <XMarkIcon className="h-6 w-6" />
                </button>
                
                <h3 className="text-xl font-bold mb-4 text-gray-800">
                    {generatedLink ? 'Invito Creato' : 'Invita o Associa Utente'}
                </h3>
                
                {generatedLink ? (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                            L'invito è stato creato. Puoi inviare manualmente il link sottostante se l'utente non riceve l'email.
                        </p>
                        <div className="flex items-center space-x-2">
                            <input 
                                type="text"
                                value={generatedLink}
                                readOnly
                                className="w-full p-2 border rounded-md bg-gray-100 text-gray-700 focus:ring-1 focus:ring-blue-500"
                            />
                            <button 
                                onClick={copyToClipboard}
                                className="flex items-center gap-2 bg-gray-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                                title="Copia Link"
                            >
                                <ClipboardDocumentIcon className="h-5 w-5" />
                                <span>Copia</span>
                            </button>
                        </div>
                        <div className="flex justify-end pt-2">
                            <button onClick={() => handleClose(true)} className="btn-secondary">
                                Chiudi
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                            Inserisci l'email. Se l'utente esiste già, verrà associato a questa ditta, altrimenti riceverà un invito.
                        </p>
                        <div>
                            <label htmlFor="email-invite" className="block text-sm font-medium text-gray-700 mb-1">Email Utente</label>
                            <input
                                id="email-invite"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="nome.cognome@esempio.com"
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                                disabled={isLoading}
                            />
                        </div>

                        {/* --- CAMPO: SELEZIONE TIPO UTENTE (STATICA) --- */}
                        <div>
                            <label htmlFor="tipo-utente-invite" className="block text-sm font-medium text-gray-700 mb-1">Tipo Utente</label>
                            <select
                                id="tipo-utente-invite"
                                value={codiceTipoUtente}
                                onChange={(e) => setCodiceTipoUtente(e.target.value)}
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
                                disabled={isLoading}
                            >
                                <option value="1">Utente Interno</option>
                                <option value="2">Utente Esterno</option>
                            </select>
                        </div>

                        {error && <p className="text-sm text-red-600">{error}</p>}
                        <div className="flex justify-end gap-2 pt-2">
                            <button onClick={() => handleClose(false)} disabled={isLoading} className="btn-secondary">
                                Annulla
                            </button>
                            <button onClick={handleInvite} disabled={isLoading} className="btn-primary flex items-center gap-2">
                                <PaperAirplaneIcon className="h-5 w-5" />
                                {isLoading ? 'Elaborazione...' : 'Invita o Associa'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvitaUtenteModal;