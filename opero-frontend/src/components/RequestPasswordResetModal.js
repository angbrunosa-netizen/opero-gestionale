//COMPONENTE PER IL RECUPERO DELLA PASSWORD IN AUTONOMIA UTENTE
//22/10/2025 VER 1
// src/components/RequestPasswordResetModal.js

import React, { useState } from 'react';
import { api } from '../services/api';

function RequestPasswordResetModal({ onClose }) {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false); // Stato per mostrare il messaggio di conferma

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);
        setSubmitted(false);

        try {
            const response = await api.post('/auth/request-password-reset', { email });
            // Mostriamo il messaggio generico di successo indipendentemente dalla risposta
            setMessage(response.message || 'Se l\'indirizzo email è registrato, riceverai un link per il reset della password.');
            setSubmitted(true); // Imposta lo stato per cambiare la UI dopo l'invio
            // Non chiudiamo automaticamente la modale, l'utente può chiuderla manualmente
            // setTimeout(onClose, 5000); // Opzionale: chiudi dopo 5 secondi
        } catch (err) {
            // Mostriamo un errore generico in caso di fallimento della chiamata API
            setError('Si è verificato un errore durante la richiesta. Riprova più tardi.');
             console.error("Errore API request-password-reset:", err); // Log per debug
        } finally {
            setLoading(false);
        }
    };

    return (
        // Overlay scuro per lo sfondo
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out">
            {/* Contenitore della modale */}
            <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 w-full max-w-md transform transition-all duration-300 ease-in-out scale-100">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">Recupera Password</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl font-bold leading-none focus:outline-none"
                        aria-label="Chiudi"
                    >
                        &times; {/* Carattere 'x' per chiusura */}
                    </button>
                </div>

                {!submitted ? (
                    // Form per inserire l'email
                    <form onSubmit={handleSubmit}>
                        <p className="text-gray-600 text-sm mb-4">
                            Inserisci l'indirizzo email associato al tuo account. Ti invieremo un link per reimpostare la password.
                        </p>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="reset-email">
                                Email
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                id="reset-email"
                                type="email"
                                placeholder="iltuo@indirizzo.email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}

                        <div className="flex items-center justify-end">
                            <button
                                className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Invio...' : 'Invia Link di Recupero'}
                            </button>
                        </div>
                    </form>
                ) : (
                    // Messaggio di conferma dopo l'invio
                    <div className="text-center">
                        <p className="text-green-600 font-medium mb-4">{message}</p>
                        <button
                            onClick={onClose}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
                        >
                            Chiudi
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default RequestPasswordResetModal;
