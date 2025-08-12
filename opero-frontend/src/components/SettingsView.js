// #####################################################################
// # Componente SettingsView
// # File: opero-frontend/src/components/SettingsView.js
// #####################################################################

//import React, { useState } from 'react';
import React, { useState } from 'react';

//const API_URL = 'http://localhost:3001';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function SettingsView({ session, onSessionUpdate }) {
    const [nome, setNome] = useState(session.user.nome || '');
    const [cognome, setCognome] = useState(session.user.cognome || '');
    const [firma, setFirma] = useState(session.user.firma || '');

    const handleProfileSave = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/api/user/profile`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.token}` },
                body: JSON.stringify({ nome, cognome })
            });
            const data = await response.json();
            if (data.success) {
                alert('Profilo aggiornato!');
                const updatedUser = { ...session.user, nome, cognome };
                onSessionUpdate({ ...session, user: updatedUser });
            } else {
                alert(`Errore: ${data.message}`);
            }
        } catch (error) {
            alert(`Errore di connessione: ${error.message}`);
        }
    };

    const handleSignatureSave = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/api/user/signature`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.token}` },
                body: JSON.stringify({ firma })
            });
            const data = await response.json();
            if (data.success) {
                alert('Firma salvata!');
                const updatedUser = { ...session.user, firma };
                onSessionUpdate({ ...session, user: updatedUser });
            } else {
                alert(`Errore: ${data.message}`);
            }
        } catch (error) {
            alert(`Errore di connessione: ${error.message}`);
        }
    };

 

    return (
        <div>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '24px' }}>Impostazioni Profilo</h2>
            
            <form onSubmit={handleProfileSave} style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '24px', backgroundColor: '#f9f9f9' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>Dati Personali</h3>
                <label>Nome:</label>
                <input value={nome} onChange={e => setNome(e.target.value)} required style={{ width: '100%', padding: '8px', margin: '8px 0', boxSizing: 'border-box' }} />
                <label>Cognome:</label>
                <input value={cognome} onChange={e => setCognome(e.target.value)} required style={{ width: '100%', padding: '8px', margin: '8px 0', boxSizing: 'border-box' }} />
                <button type="submit" style={{ padding: '8px 16px', border: 'none', backgroundColor: '#2563eb', color: 'white', borderRadius: '6px', cursor: 'pointer' }}>Salva Dati</button>
            </form>

            <form onSubmit={handleSignatureSave} style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>Firma Email</h3>
                <textarea value={firma} onChange={e => setFirma(e.target.value)} rows="5" style={{ width: '100%', padding: '8px', margin: '8px 0', boxSizing: 'border-box' }}></textarea>
                <button type="submit" style={{ padding: '8px 16px', border: 'none', backgroundColor: '#2563eb', color: 'white', borderRadius: '6px', cursor: 'pointer' }}>Salva Firma</button>
            </form>
        </div>
    );
}

export default SettingsView;
