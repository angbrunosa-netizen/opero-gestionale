/**
 * File: LoginPage.js
 * Percorso: /opero-frontend/src/components/
 * Versione: 2.6 (UI Refresh)
 * - Aggiunto un sottotitolo di benvenuto.
 * - Applicato un overlay scuro all'immagine di sfondo per migliorare il contrasto.
 * - Aumentata la trasparenza del box di login per un look più moderno.
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import logo from '../assets/logo_opero.jpg';
import { useNavigate } from 'react-router-dom';
import loginBackground from '../assets/login-background.png';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const [mostraSelezioneDitta, setMostraSelezioneDitta] = useState(false);
    const [ditteDaScegliere, setDitteDaScegliere] = useState([]);

    const { handleAuthSuccess } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', { email, password });
            if (data.needsDittaSelection) {
                setDitteDaScegliere(data.ditte);
                setMostraSelezioneDitta(true);
            } else if (data.success && data.token) {
                handleAuthSuccess(data);
                navigate('/');
            } else {
                setError(data.message || 'Risposta non valida dal server.');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Errore durante il login. Riprova.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleDittaSelection = async (id_ditta_scelta) => {
        setError('');
        setLoading(true);
        try {
            const { data } = await api.post('/auth/select-ditta', { email, password, id_ditta_scelta });
            if (data.success && data.token) {
                handleAuthSuccess(data);
                navigate('/');
            } else {
                setError(data.message || 'Errore durante la selezione della ditta.');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Errore durante la selezione della ditta. Riprova.';
            setError(errorMessage);
            setMostraSelezioneDitta(false);
        } finally {
            setLoading(false);
        }
    };

    // La UI per la selezione ditta rimane invariata
    if (mostraSelezioneDitta) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Seleziona Ditta</h2>
                    <p className="text-center text-gray-600 mb-6">Il tuo account è abilitato per più ditte. Scegli con quale accedere.</p>
                    <div className="space-y-4">
                        {ditteDaScegliere.map((ditta) => (
                            <button
                                key={ditta.id}
                                onClick={() => handleDittaSelection(ditta.id)}
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ease-in-out disabled:bg-blue-300"
                            >
                                {loading ? 'Caricamento...' : ditta.denominazione}
                            </button>
                        ))}
                    </div>
                     {error && <p className="mt-4 text-center text-red-500">{error}</p>}
                    <button
                        onClick={() => { setMostraSelezioneDitta(false); setError(''); }}
                        className="w-full mt-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg focus:outline-none"
                    >
                        Annulla
                    </button>
                </div>
            </div>
        );
    }

    // UI di login principale con le modifiche grafiche
    return (
        <div
            className="min-h-screen flex items-center justify-center"
            style={{
                // --- MODIFICA 1: Aggiunto overlay scuro ---
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${loginBackground})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {/* --- MODIFICA 2: Aumentata trasparenza del form --- */}
            <div className="max-w-md w-full bg-white bg-opacity-80 p-8 rounded-lg shadow-lg backdrop-blur-sm">
                <div className="text-center mb-8">
                    <img src={logo} alt="Opero Logo" className="mx-auto h-20 w-auto" />
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Bentornato!
                    </h2>
                    {/* --- MODIFICA 3: Aggiunto sottotitolo --- */}
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Accedi alla piattaforma Opero per ottimizzare ogni processo.
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="sr-only">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            placeholder="Indirizzo email"
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
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
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
        </div>
    );
};

export default LoginPage;

