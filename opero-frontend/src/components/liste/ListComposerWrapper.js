import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ListComposer from './ListComposer';
import { useAuth } from '../../context/AuthContext';

/**
 * Wrapper per ListComposer con il contesto router corretto
 * Risolve il problema del useBlocker che richiede un BrowserRouter
 */
const ListComposerWrapper = () => {
    const { isAuthenticated } = useAuth();

    // Se non autenticato, reindirizza al login
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Accesso Richiesto</h1>
                    <p className="text-gray-600">Effettua il login per accedere alla gestione delle liste.</p>
                </div>
            </div>
        );
    }

    return (
        <Routes>
            <Route path="/liste/new" element={<ListComposer />} />
            <Route path="/liste/:id" element={<ListComposer />} />
        </Routes>
    );
};

export default ListComposerWrapper;