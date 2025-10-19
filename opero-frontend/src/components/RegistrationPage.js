// #####################################################################
// # Componente RegistrationPage - v2.3 (Fix Campo Privacy)
// # File: opero-frontend/src/components/RegistrationPage.js
// # Corregge il nome del campo inviato al backend da 'privacy_accettata'
// # a 'privacy' per allinearsi alla struttura del database 'utenti'.
// #####################################################################

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { toast } from 'react-toastify';

const RegistrationPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    // Stati per la gestione del flusso e dei dati
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pageData, setPageData] = useState(null);
    const [step, setStep] = useState(1);
    
    const [formData, setFormData] = useState({
        nome: '',
        cognome: '',
        email: '',
        password: '',
        conferma_password: '',
        codice_fiscale: '',
        telefono: '',
        indirizzo: '',
        citta: '',
        cap: ''
    });
    const [privacyAccepted, setPrivacyAccepted] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await api.get(`/public/register/${token}`);
                if (response.data && response.data.success) {
                    setPageData(response.data);
                } else {
                    throw new Error(response.data.message || 'Dati non validi ricevuti dal server.');
                }
            } catch (err) {
                const errorMessage = err.response?.data?.message || err.message || 'Impossibile caricare i dati. Il link potrebbe essere scaduto o non valido.';
                setError(errorMessage);
                setStep(3);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token]);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.conferma_password) {
            return toast.error('Le password non coincidono.');
        }
        
        try {
            // ++ FIX: Usa 'privacy' invece di 'privacy_accettata' ++
            const payload = { ...formData, privacy: true };
            await api.post(`/public/register/${token}`, payload);
            toast.success('Registrazione completata con successo! Ora puoi effettuare il login.');
            navigate('/login');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Si è verificato un errore durante la registrazione.';
            setError(errorMessage);
            toast.error(errorMessage);
            setStep(3);
        }
    };
    
    if (loading) {
        return <div className="flex justify-center items-center h-screen bg-gray-100"><p className="text-xl text-gray-700">Caricamento...</p></div>;
    }

    if (step === 3) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gray-100 text-center p-4">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Errore di Registrazione</h2>
                <p className="text-lg text-gray-800">{error}</p>
                <button onClick={() => navigate('/login')} className="mt-6 bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700">
                    Torna al Login
                </button>
            </div>
        );
    }

    if (!pageData) {
        return <div className="flex justify-center items-center h-screen bg-gray-100"><p className="text-xl text-red-600">Impossibile visualizzare la pagina.</p></div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
             <div className="sm:mx-auto sm:w-full sm:max-w-3xl">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Crea il tuo account per {pageData.ragioneSociale}
                </h2>
            </div>
            
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-3xl">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">

                    {step === 1 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900">Informativa sulla Privacy</h3>
                            <div className="prose prose-sm max-w-none h-64 overflow-y-auto border p-4 rounded-md bg-gray-50"
                                dangerouslySetInnerHTML={{ __html: pageData.privacyPolicy.corpo_lettera }}
                            />
                            <div className="flex items-center">
                                <input id="privacy" name="privacy" type="checkbox" checked={privacyAccepted} onChange={(e) => setPrivacyAccepted(e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                <label htmlFor="privacy" className="ml-2 block text-sm text-gray-900">
                                    Dichiaro di aver letto e accettato l'informativa sulla privacy.
                                </label>
                            </div>
                            <button onClick={() => setStep(2)} disabled={!privacyAccepted} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                Continua
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                         <form className="space-y-6" onSubmit={handleSubmit}>
                            <fieldset className="border p-4 rounded-md">
                                <legend className="text-lg font-semibold px-2">Dati di Accesso</legend>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <input name="nome" type="text" required value={formData.nome} onChange={handleChange} className="p-3 border rounded-md w-full" placeholder="Nome *" />
                                    <input name="cognome" type="text" required value={formData.cognome} onChange={handleChange} className="p-3 border rounded-md w-full" placeholder="Cognome *" />
                                </div>
                                <div className="mt-6">
                                    <input name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleChange} className="p-3 border rounded-md w-full" placeholder="Indirizzo Email *" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                    <input name="password" type="password" required value={formData.password} onChange={handleChange} className="p-3 border rounded-md w-full" placeholder="Password *" />
                                    <input name="conferma_password" type="password" required value={formData.conferma_password} onChange={handleChange} className="p-3 border rounded-md w-full" placeholder="Conferma Password *" />
                                </div>
                            </fieldset>

                            <fieldset className="border p-4 rounded-md">
                                <legend className="text-lg font-semibold px-2">Dati Anagrafici</legend>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <input name="codice_fiscale" type="text" value={formData.codice_fiscale} onChange={handleChange} className="p-3 border rounded-md w-full" placeholder="Codice Fiscale" />
                                    <input name="telefono" type="tel" value={formData.telefono} onChange={handleChange} className="p-3 border rounded-md w-full" placeholder="Telefono" />
                                    <input name="indirizzo" type="text" value={formData.indirizzo} onChange={handleChange} className="p-3 border rounded-md w-full md:col-span-2" placeholder="Indirizzo (Via, Piazza...)" />
                                    <input name="citta" type="text" value={formData.citta} onChange={handleChange} className="p-3 border rounded-md w-full" placeholder="Città" />
                                    <input name="cap" type="text" value={formData.cap} onChange={handleChange} className="p-3 border rounded-md w-full" placeholder="CAP" />
                                </div>
                            </fieldset>
                            
                            <div>
                                <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                    Completa Registrazione
                                </button>
                                <button type="button" onClick={() => setStep(1)} className="mt-4 w-full flex justify-center py-2 px-4 text-sm font-medium text-gray-700">
                                    Torna alla Privacy Policy
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RegistrationPage;

