/*
 * ======================================================================
 * File: src/components/StandaloneModule.js (NUOVO FILE)
 * ======================================================================
 * Descrizione: Questo componente renderizza un modulo a schermo intero.
 * Verrà usato per le nuove finestre aperte dalle scorciatoie.
 */
import React from 'react';
import { useParams } from 'react-router-dom';
import ModuleLoader from './ModuleLoader';
import { useAuth } from '../context/AuthContext';

const StandaloneModule = () => {
    const { moduleKey } = useParams();
    const { loading } = useAuth();

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Caricamento...</div>;
    }

    return (
        <div className="h-screen w-screen bg-gray-100">
            <ModuleLoader moduleKey={moduleKey} />
        </div>
    );
};

export default StandaloneModule;