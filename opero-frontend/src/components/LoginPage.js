// #####################################################################
// # Componente LoginPage - v2.0 con Stile Tailwind CSS
// # File: opero-frontend/src/components/LoginPage.js
// #####################################################################

import React, { useState } from 'react';

//const API_URL = 'http://localhost:3001';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/authenticate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.success && data.token) {
        onLoginSuccess(data);
      } else {
        setError(data.message || 'Errore di autenticazione.');
      }
    } catch (err) {
      setError('Errore di connessione al server.');
    }
  };

  return (
    // Contenitore principale che centra il form
    <div className="flex items-center justify-center min-h-screen bg-slate-100 font-sans">
      {/* Card del form */}
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center text-slate-800">Benvenuto in Opero</h1>
        <p className="text-center text-slate-500 mb-6">Accedi per continuare</p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Campo Email */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {/* Campo Password */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          {/* Messaggio di errore */}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          {/* Pulsante di Login */}
          <button 
            type="submit" 
            className="px-4 py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Login / Registrati
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
