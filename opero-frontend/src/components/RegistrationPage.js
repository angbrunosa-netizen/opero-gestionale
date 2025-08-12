// #####################################################################
// # Componente RegistrationPage - v1.1 con Form Completo
// # File: opero-frontend/src/components/RegistrationPage.js
// #####################################################################

import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3001';

function RegistrationPage() {
    const [token, setToken] = useState(null);
    const [dittaInfo, setDittaInfo] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({ 
        nome: '', 
        cognome: '', 
        email: '', 
        password: '',
        codice_fiscale: '',
        telefono: '',
        indirizzo: '',
        citta: '',
        provincia: ''
    });

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get('token');
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
            const verifyToken = async () => {
                try {
                    const response = await fetch(`${API_URL}/api/public/verify-token/${tokenFromUrl}`);
                    const data = await response.json();
                    if (data.success) {
                        setDittaInfo(data.ditta);
                    } else {
                        setError(data.message);
                    }
                } catch (err) {
                    setError('Errore di connessione al server.');
                }
            };
            verifyToken();
        } else {
            setError('Token di registrazione mancante.');
        }
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await fetch(`${API_URL}/api/public/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, token })
            });
            const data = await response.json();
            if (data.success) {
                setSuccess(data.message);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Errore di connessione al server.');
        }
    };

    if (error) {
        return <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}><h1>Errore</h1><p>{error}</p></div>;
    }
    
    if (success) {
        return <div style={{ padding: '40px', textAlign: 'center', color: 'green' }}><h1>Successo</h1><p>{success}</p><a href="/">Torna al Login</a></div>;
    }

    if (!dittaInfo) {
        return <div style={{ padding: '40px', textAlign: 'center' }}><h1>Verifica in corso...</h1></div>;
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'sans-serif' }}>
            <div style={{ width: '100%', maxWidth: '500px', backgroundColor: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center' }}>Registrazione Utente</h1>
                <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '24px' }}>Stai per registrarti per la ditta: <strong>{dittaInfo.ragione_sociale}</strong></p>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input name="nome" value={formData.nome} onChange={handleChange} placeholder="Nome *" required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                    <input name="cognome" value={formData.cognome} onChange={handleChange} placeholder="Cognome *" required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                    <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email *" required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                    <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Password *" required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                    <hr style={{ margin: '12px 0' }} />
                    <input name="codice_fiscale" value={formData.codice_fiscale} onChange={handleChange} placeholder="Codice Fiscale" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                    <input name="telefono" value={formData.telefono} onChange={handleChange} placeholder="Telefono" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                    <input name="indirizzo" value={formData.indirizzo} onChange={handleChange} placeholder="Indirizzo" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
                    <div style={{display: 'flex', gap: '12px'}}>
                        <input name="citta" value={formData.citta} onChange={handleChange} placeholder="Città" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', flex: 2 }} />
                        <input name="provincia" value={formData.provincia} onChange={handleChange} placeholder="Prov." style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', flex: 1 }} />
                    </div>
                    <button type="submit" style={{ padding: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '12px' }}>Registrati</button>
                </form>
            </div>
        </div>
    );
}

export default RegistrationPage;
