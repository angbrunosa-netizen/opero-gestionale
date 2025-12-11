// #####################################################################
// # Componente UserForm (Riutilizzabile) - v1.1 Corretto
// # File: opero-frontend/src/components/UserForm.js
// #####################################################################

import React, { useState, useEffect, useCallback } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3003';

function UserForm({ session, onSave, onCancel }) {
    const [newUser, setNewUser] = useState({ email: '', password: '', nome: '', cognome: '', id_ditta: '', id_ruolo: '' });
    const [ditte, setDitte] = useState([]);
    const [ruoli, setRuoli] = useState([]);

    const isSystemAdmin = session.user.ruolo === 'Amministratore_sistema';

    const fetchData = useCallback(async (endpoint) => {
        try {
            const response = await fetch(`${API_URL}/api/admin/${endpoint}`, { headers: { 'Authorization': `Bearer ${session.token}` } });
            return await response.json();
        } catch (error) { console.error(error); return { success: false }; }
    }, [session.token]);

    useEffect(() => {
        fetchData('ditte').then(data => data.success && setDitte(data.ditte));
        fetchData('ruoli').then(data => data.success && setRuoli(data.ruoli));
        if (!isSystemAdmin) {
            setNewUser(prev => ({ ...prev, id_ditta: session.dittaId }));
        }
    }, [fetchData, isSystemAdmin, session.dittaId]);

    const handleChange = (e) => {
        setNewUser({ ...newUser, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(newUser);
    };

    return (
        <form onSubmit={handleSubmit} style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>Crea Nuovo Utente</h3>
            <input name="nome" value={newUser.nome} onChange={handleChange} placeholder="Nome" style={{ width: '100%', padding: '8px', margin: '8px 0', boxSizing: 'border-box' }} />
            <input name="cognome" value={newUser.cognome} onChange={handleChange} placeholder="Cognome" style={{ width: '100%', padding: '8px', margin: '8px 0', boxSizing: 'border-box' }} />
            <input name="email" type="email" value={newUser.email} onChange={handleChange} placeholder="Email" required style={{ width: '100%', padding: '8px', margin: '8px 0', boxSizing: 'border-box' }} />
            <input name="password" value={newUser.password} onChange={handleChange} placeholder="Password Iniziale" required style={{ width: '100%', padding: '8px', margin: '8px 0', boxSizing: 'border-box' }} />
            
            {isSystemAdmin && (
                 <select name="id_ditta" value={newUser.id_ditta} onChange={handleChange} required style={{ width: '100%', padding: '8px', margin: '8px 0', boxSizing: 'border-box' }}>
                    <option value="">Seleziona Ditta</option>
                    {ditte.map(d => <option key={d.id} value={d.id}>{d.ragione_sociale}</option>)}
                </select>
            )}
           
            <select name="id_ruolo" value={newUser.id_ruolo} onChange={handleChange} required style={{ width: '100%', padding: '8px', margin: '8px 0', boxSizing: 'border-box' }}>
                <option value="">Seleziona Ruolo</option>
                {ruoli.map(r => <option key={r.id} value={r.id}>{r.tipo}</option>)}
            </select>
            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '12px'}}>
                <button type="button" onClick={onCancel}>Annulla</button>
                <button type="submit" style={{ padding: '8px 16px' }}>Crea Utente</button>
            </div>
        </form>
    );
}

export default UserForm;