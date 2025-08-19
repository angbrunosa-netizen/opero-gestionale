// #####################################################################
// # Pagina di Registrazione Pubblica per Nuovi Utenti
// # File: opero-frontend/src/components/RegistrationPage.js
// #####################################################################

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

const RegistrationPage = () => {
    const { token } = useParams();
    const [privacyPolicy, setPrivacyPolicy] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1); // 1: Privacy, 2: Form, 3: Successo/Errore finale
    const [privacyAccepted, setPrivacyAccepted] = useState(false);
    const [formData, setFormData] = useState({
        nome: '', cognome: '', codice_fiscale: '', telefono: '', indirizzo: '',
        citta: '', cap: '', note: '', email: '', password: ''
    });
    const [finalMessage, setFinalMessage] = useState('');

    useEffect(() => {
        const verifyTokenAndFetchPrivacy = async () => {
            try {
                const { data } = await api.get(`/public/register/${token}`);
                if (data.success) {
                    setPrivacyPolicy(data.privacy);
                } else {
                    setError(data.message);
                    setStep(3); // Va direttamente al messaggio di errore finale
                    setFinalMessage(data.message);
                }
            } catch (err) {
                const errMsg = err.response?.data?.message || 'Link non valido o scaduto.';
                setError(errMsg);
                setStep(3);
                setFinalMessage(errMsg);
            } finally {
                setIsLoading(false);
            }
        };
        verifyTokenAndFetchPrivacy();
    }, [token]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRegistrationSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const { data } = await api.post(`/public/register/${token}`, formData);
            if (data.success) {
                setStep(3);
                setFinalMessage(data.message);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Errore durante la registrazione.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="text-center p-10">Caricamento...</div>;
    }

    if (step === 3) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="w-full max-w-xl p-8 text-center bg-white rounded-lg shadow-md">
                    <h2 className={`text-2xl font-bold ${error ? 'text-red-600' : 'text-green-600'}`}>
                        {error ? 'Errore' : 'Registrazione Inviata'}
                    </h2>
                    <p className="mt-4">{finalMessage}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-4xl p-8 space-y-6 bg-white rounded-lg shadow-md">
                {step === 1 && privacyPolicy && (
                    <div>
                        <h2 className="text-2xl font-bold text-center text-gray-800">Informativa sulla Privacy</h2>
                        <div className="mt-4 p-4 border rounded-md max-h-96 overflow-y-auto" dangerouslySetInnerHTML={{ __html: privacyPolicy.corpo_lettera }}></div>
                        <p className="mt-4 text-right font-semibold">Responsabile del Trattamento: {privacyPolicy.responsabile_trattamento}</p>
                        <div className="mt-6 flex items-center">
                            <input type="checkbox" id="privacy" checked={privacyAccepted} onChange={() => setPrivacyAccepted(!privacyAccepted)} className="h-4 w-4" />
                            <label htmlFor="privacy" className="ml-2 block text-sm text-gray-900">Dichiaro di aver letto e accettato l'informativa sulla privacy.</label>
                        </div>
                        <button onClick={() => setStep(2)} disabled={!privacyAccepted} className="mt-4 w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                            Continua con la Registrazione
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <h2 className="text-2xl font-bold text-center text-gray-800">Completa la Registrazione</h2>
                        <form onSubmit={handleRegistrationSubmit} className="mt-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input name="nome" placeholder="Nome" onChange={handleInputChange} required className="w-full p-2 border rounded-md" />
                                <input name="cognome" placeholder="Cognome" onChange={handleInputChange} required className="w-full p-2 border rounded-md" />
                                <input name="codice_fiscale" placeholder="Codice Fiscale" onChange={handleInputChange} className="w-full p-2 border rounded-md" />
                                <input name="telefono" placeholder="Telefono" onChange={handleInputChange} className="w-full p-2 border rounded-md" />
                                <input name="indirizzo" placeholder="Indirizzo" onChange={handleInputChange} className="w-full p-2 border rounded-md" />
                                <input name="citta" placeholder="Città" onChange={handleInputChange} className="w-full p-2 border rounded-md" />
                                <input name="cap" placeholder="CAP" onChange={handleInputChange} className="w-full p-2 border rounded-md" />
                                <input name="email" type="email" placeholder="Email" onChange={handleInputChange} required className="w-full p-2 border rounded-md" />
                                <input name="password" type="password" placeholder="Password" onChange={handleInputChange} required className="w-full p-2 border rounded-md" />
                            </div>
                            <textarea name="note" placeholder="Note aggiuntive..." onChange={handleInputChange} className="w-full p-2 border rounded-md"></textarea>
                            {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                            <button type="submit" className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
                                Registrati
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RegistrationPage;
