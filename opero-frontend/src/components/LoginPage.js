/*
 * File: LoginPage.js
 * Percorso: /opero-frontend/src/components/
 * Versione: 3.0 (Trasparenza ridotta + Logo ditte nella selezione)
 * - Ridotta la trasparenza della finestra di login per migliore leggibilità
 * - Aggiunto il logo aziendale nel modale di selezione ditta
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import logo from '../assets/logo_opero.jpg';
import { useNavigate } from 'react-router-dom';
import loginBackground from '../assets/login-background.png';
import RequestPasswordResetModal from './RequestPasswordResetModal';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [mostraSelezioneDitta, setMostraSelezioneDitta] = useState(false);
    const [ditteDaScegliere, setDitteDaScegliere] = useState([]);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);

    const { handleAuthSuccess } = useAuth();
    const navigate = useNavigate();

    // Pulizia cookie all'avvio per risolvere l'errore 431
    React.useEffect(() => {
        console.log('Pulizia cookie per risolvere errore 431...');
        // Pulisce tutti i cookie per localhost
        document.cookie.split(";").forEach(function(c) {
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });

        // Pulisce anche localStorage e sessionStorage da dati potenzialmente corrotti
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('token') || key.includes('auth') || key.includes('user'))) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));

        sessionStorage.clear();
        console.log('Pulizia completata');
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await api.post('/auth/login', { email, password });

            if (response.data.success) {
                if (response.data.needsDittaSelection && response.data.ditte && response.data.ditte.length > 0) {
                    // Logica multi-ditta
                    setDitteDaScegliere(response.data.ditte);
                    setMostraSelezioneDitta(true);
                    sessionStorage.setItem('pendingUserEmail', email);
                    sessionStorage.setItem('pendingUserPassword', password);
                } else {
                    // Login diretto
                    handleAuthSuccess(response.data);
                    navigate('/');
                }
            } else {
                setError(response.data.message || 'Credenziali non valide.');
            }
        } catch (err) {
            console.error("Errore durante il login:", err);
            setError(err.response?.data?.message || 'Errore di connessione o del server.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectDitta = async (id_ditta_scelta) => {
        setLoading(true);
        setError('');
        try {
            const pendingEmail = sessionStorage.getItem('pendingUserEmail');
            const pendingPassword = sessionStorage.getItem('pendingUserPassword');

            if (!pendingEmail || !pendingPassword) {
                throw new Error("Informazioni temporanee mancanti per selezione ditta.");
            }

            const response = await api.post('/auth/select-ditta',
                { email: pendingEmail, password: pendingPassword, id_ditta_scelta }
            );

            if (response.data.success) {
                handleAuthSuccess(response.data);
                sessionStorage.removeItem('pendingUserEmail');
                sessionStorage.removeItem('pendingUserPassword');
                navigate('/');
            } else {
                setError(response.data.message || 'Errore durante la selezione della ditta.');
                setMostraSelezioneDitta(false);
            }

        } catch (err) {
            console.error("Errore selezione ditta:", err);
            setError(err.response?.data?.message || 'Errore di connessione o del server.');
            setMostraSelezioneDitta(false);
        } finally {
            setLoading(false);
            sessionStorage.removeItem('pendingUserEmail');
            sessionStorage.removeItem('pendingUserPassword');
        }
    };

    const handleOpenResetModal = () => setIsResetModalOpen(true);
    const handleCloseResetModal = () => setIsResetModalOpen(false);

    // Render Selezione Ditta con Logo
    if (mostraSelezioneDitta) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg z-10 border border-gray-200">
                    <div>
                        <img className="mx-auto h-16 w-auto" src={logo} alt="Opero Logo" />
                        <h2 className="mt-6 text-center text-2xl font-extrabold text-gray-900">
                            Seleziona la Ditta
                        </h2>
                    </div>
                    <div className="mt-8 space-y-6">
                        <p className="text-center text-sm text-gray-600">
                            Il tuo account è associato a più ditte. Seleziona quella con cui vuoi accedere:
                        </p>
                        <div className="rounded-md shadow-sm flex flex-col space-y-3">
                            {ditteDaScegliere.map((ditta) => (
                                <button
                                    key={ditta.id}
                                    onClick={() => handleSelectDitta(ditta.id)}
                                    disabled={loading}
                                    className="relative w-full flex items-center justify-between py-3 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-indigo-50 hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-200"
                                >
                                    <div className="flex items-center space-x-3">
                                        {ditta.logo_url ? (
                                            <img 
                                                src={ditta.logo_url} 
                                                alt={`Logo ${ditta.denominazione || ditta.ragione_sociale}`}
                                                className="h-10 w-10 rounded-full object-cover border border-gray-200"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                <span className="text-indigo-600 font-bold text-lg">
                                                    {(ditta.denominazione || ditta.ragione_sociale).charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                        <span className="text-left font-semibold">
                                            {ditta.denominazione || ditta.ragione_sociale}
                                        </span>
                                    </div>
                                    <svg 
                                        className="h-5 w-5 text-gray-400" 
                                        fill="none" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth="2" 
                                        viewBox="0 0 24 24" 
                                        stroke="currentColor"
                                    >
                                        <path d="M9 5l7 7-7 7"></path>
                                    </svg>
                                </button>
                            ))}
                        </div>
                        {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
                        <button
                            onClick={() => {
                                setMostraSelezioneDitta(false);
                                setError('');
                                sessionStorage.removeItem('pendingUserEmail');
                                sessionStorage.removeItem('pendingUserPassword');
                            }}
                            disabled={loading}
                            className="mt-4 w-full text-center text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                        >
                            ← Torna al Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Form di Login principale con trasparenza ridotta
    return (
        <div
            className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-cover bg-center relative"
            style={{ backgroundImage: `url(${loginBackground})` }}
        >
            <div className="absolute inset-0 bg-black opacity-50"></div>

            {/* MODIFICA: bg-opacity-90 cambiato in bg-opacity-95 per maggiore opacità */}
            <div className="max-w-md w-full space-y-8 bg-white bg-opacity-50 p-10 rounded-xl shadow-2xl z-10 border border-gray-200">
                <div>
                    <img className="mx-auto h-16 w-auto" src={logo} alt="Opero Logo" />
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Accedi al tuo account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Bentornato in Opero Gestionale
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <input type="hidden" name="remember" defaultValue="true" />
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Indirizzo Email</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Indirizzo Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-end">
                        <div className="text-sm">
                            <button
                                type="button"
                                onClick={handleOpenResetModal}
                                className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
                            >
                                Password dimenticata?
                            </button>
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                        >
                            {loading ? 'Accesso in corso...' : 'Accedi'}
                        </button>
                    </div>
                </form>
            </div>

            {isResetModalOpen && (
                <RequestPasswordResetModal onClose={handleCloseResetModal} />
            )}
        </div>
    );
};

export default LoginPage;