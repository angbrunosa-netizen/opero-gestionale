// src/components/ResetPasswordPage.js

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';// Assicurati che il percorso sia corretto
import logo from '../assets/logo_opero.jpg'; // Logo per coerenza

function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [token, setToken] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false); // Stato per mostrare messaggio di successo e bottone login

    // Estrai il token dall'URL all'avvio del componente
    useEffect(() => {
        const urlToken = searchParams.get('token');
        if (urlToken) {
            setToken(urlToken);
        } else {
            setError('Token di reset mancante o non valido nell\'URL.');
            // Potresti reindirizzare alla login page qui se il token manca
            // navigate('/'); 
        }
    }, [searchParams, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);
        setSuccess(false);

        // Validazione base
        if (!token) {
            setError('Token non disponibile.');
            setLoading(false);
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Le password non coincidono.');
            setLoading(false);
            return;
        }
        if (newPassword.length < 8) {
            setError('La password deve contenere almeno 8 caratteri.');
            setLoading(false);
            return;
        }

        try {
            const response = await api.post('/auth/reset-password', { token, newPassword });
            
            if (response.success) {
                setMessage(response.data.message || 'Password aggiornata con successo. Ora puoi effettuare il login.');
                setSuccess(true); // Imposta successo per cambiare UI
                // Non reindirizzare subito, mostra il messaggio e il bottone Login
            } else {
                 setError(response.data.message || 'Si è verificato un errore durante il reset della password.');
            }

        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Errore di connessione o risposta non valida dal server.');
             console.error("Errore API reset-password:", err);
        } finally {
            setLoading(false);
        }
    };
    
    // Funzione per reindirizzare al login dopo successo
    const handleGoToLogin = () => {
        navigate('/'); // O la tua rotta di login
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-blue-100 p-4">
            <div className="bg-white p-8 md:p-12 rounded-lg shadow-xl w-full max-w-md">
                <img src={logo} alt="Opero Logo" className="mx-auto h-16 w-auto mb-8" />
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Reimposta Password</h2>

                {!success ? (
                    // Mostra il form se non abbiamo ancora avuto successo
                    <form onSubmit={handleSubmit}>
                        {!token && !error && <p className="text-yellow-600 text-center mb-4">Recupero token dall'URL...</p>}
                        
                        <p className="text-gray-600 text-sm mb-4">
                            Inserisci la tua nuova password qui sotto. Assicurati che sia sicura.
                        </p>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="new-password">
                                Nuova Password
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                id="new-password"
                                type="password"
                                placeholder="******************"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                disabled={!token || loading} // Disabilita se manca il token o sta caricando
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirm-password">
                                Conferma Nuova Password
                            </label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                id="confirm-password"
                                type="password"
                                placeholder="******************"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={!token || loading}
                            />
                        </div>

                        {error && <p className="text-red-500 text-xs italic text-center mb-4">{error}</p>}

                        <div className="flex items-center justify-center">
                            <button
                                className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out ${loading || !token ? 'opacity-50 cursor-not-allowed' : ''}`}
                                type="submit"
                                disabled={loading || !token}
                            >
                                {loading ? 'Aggiornamento...' : 'Imposta Nuova Password'}
                            </button>
                        </div>
                    </form>
                ) : (
                    // Mostra messaggio di successo e bottone per andare al login
                     <div className="text-center">
                        <p className="text-green-600 font-medium mb-6">{message}</p>
                        <button
                            onClick={handleGoToLogin}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
                        >
                            Vai alla Pagina di Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ResetPasswordPage;
/*
### Spiegazione del Codice

1.  **`useSearchParams`:** Hook di `react-router-dom` per leggere i parametri dall'URL (in questo caso, `?token=...`).
2.  **`useNavigate`:** Hook per reindirizzare l'utente dopo il successo.
3.  **Stato:**
    * `token`: Memorizza il token letto dall'URL.
    * `newPassword`, `confirmPassword`: Per gli input.
    * `message`, `error`, `loading`: Per feedback e UI.
    * `success`: Per cambiare la visualizzazione dopo l'aggiornamento riuscito.
4.  **`useEffect`:** Al montaggio del componente, legge il parametro `token` dall'URL e lo salva nello stato. Se manca, mostra un errore.
5.  **`handleSubmit`:**
    * Esegue validazioni (presenza token, coincidenza password, lunghezza minima).
    * Chiama l'API `POST /api/auth/reset-password` inviando `token` e `newPassword`.
    * Se la risposta è `success: true`, imposta `success` a `true` per mostrare il messaggio di conferma e il pulsante per andare al login.
    * Se la risposta è `success: false` o c'è un errore API, mostra il messaggio di errore restituito dal backend.
6.  **`handleGoToLogin`:** Semplice funzione per reindirizzare alla pagina di login.
7.  **Renderizzazione Condizionale:**
    * Se `success` è `false`, mostra il form per inserire la nuova password (disabilitato se il token non è ancora stato letto o se è in corso il caricamento).
    * Se `success` è `true`, mostra il messaggio di successo e il pulsante "Vai alla Pagina di Login".

### Prossimo Passo: Routing

Ora devi **aggiungere questa nuova pagina alla configurazione del tuo router** in `App.js` (o dove gestisci le rotte). Dovrai aggiungere una rotta simile a questa:

```jsx
// In App.js o nel tuo file di routing
import ResetPasswordPage from './components/ResetPasswordPage'; 

// ... altre rotte ...
<Route path="/reset-password" element={<ResetPasswordPage />} /> 
// ...
*/
