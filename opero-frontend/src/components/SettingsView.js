// #####################################################################
// # Componente SettingsView - v2.0 (Refactoring con Context API)
// # File: opero-frontend/src/components/SettingsView.js
// #####################################################################

import React, { useState, useEffect } from 'react';
import { api } from '../services/api'; // Usiamo il nostro servizio API centralizzato
import { useAuth } from '../context/AuthContext'; // Usiamo il nostro "cervello" centrale

const SettingsView = () => {
  // Prendiamo i dati dell'utente direttamente dal contesto
  const { user, login } = useAuth(); 

  // Stati locali per i campi del form
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [firma, setFirma] = useState('');
  const [message, setMessage] = useState('');

  // Quando il componente si carica, popola i campi del form con i dati dell'utente
  useEffect(() => {
    if (user) {
      setNome(user.nome || '');
      setCognome(user.cognome || '');
      setFirma(user.firma || '');
    }
  }, [user]);

  // Funzione per salvare le modifiche al profilo
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const { data } = await api.patch('/user/profile', { nome, cognome });
      if (data.success) {
        // Aggiorniamo lo stato globale con i nuovi dati
        const updatedUser = { ...user, nome, cognome };
        // Trucco: ri-eseguiamo il login con i dati aggiornati per rinfrescare il contesto
        // In un'app più complessa, il contesto avrebbe una funzione apposita updateUser()
        const token = localStorage.getItem('token');
        login({ token, user: updatedUser, ditta: (await api.get('/user/ditta')).data.ditta, modules: (await api.get('/user/modules')).data.modules, permissions: (await api.get('/user/permissions')).data.permissions });
        setMessage('Profilo aggiornato con successo!');
      }
    } catch (error) {
      setMessage('Errore durante l\'aggiornamento del profilo.');
    }
  };

  // Funzione per salvare la firma
  const handleSignatureSave = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const { data } = await api.patch('/user/signature', { firma });
       if (data.success) {
        const updatedUser = { ...user, firma };
        const token = localStorage.getItem('token');
        login({ token, user: updatedUser, ditta: (await api.get('/user/ditta')).data.ditta, modules: (await api.get('/user/modules')).data.modules, permissions: (await api.get('/user/permissions')).data.permissions });
        setMessage('Firma aggiornata con successo!');
      }
    } catch (error) {
      setMessage('Errore durante l\'aggiornamento della firma.');
    }
  };

  if (!user) {
    return <div>Caricamento impostazioni...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Impostazioni Utente</h1>
      {message && <p className="mb-4 text-center text-green-600 bg-green-100 p-2 rounded">{message}</p>}
      
      {/* Form per il Profilo */}
      <form onSubmit={handleProfileSave} className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-slate-700 border-b pb-2 mb-4">Profilo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-slate-600">Nome</label>
            <input type="text" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} className="mt-1 p-2 w-full border rounded-md" />
          </div>
          <div>
            <label htmlFor="cognome" className="block text-sm font-medium text-slate-600">Cognome</label>
            <input type="text" id="cognome" value={cognome} onChange={(e) => setCognome(e.target.value)} className="mt-1 p-2 w-full border rounded-md" />
          </div>
        </div>
        <div className="mt-4 text-right">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">Salva Profilo</button>
        </div>
      </form>

      {/* Form per la Firma */}
      <form onSubmit={handleSignatureSave} className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-slate-700 border-b pb-2 mb-4">Firma Email</h2>
        <p className="text-sm text-slate-500 mb-2">Questa firma verrà aggiunta automaticamente alle email che invii.</p>
        <textarea value={firma} onChange={(e) => setFirma(e.target.value)} rows="4" className="w-full p-2 border rounded-md"></textarea>
        <div className="mt-4 text-right">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">Salva Firma</button>
        </div>
      </form>
    </div>
  );
};

export default SettingsView;
