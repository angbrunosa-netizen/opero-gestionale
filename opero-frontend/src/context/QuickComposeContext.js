/* UTILIZZEREMO QUESTO CONTEX PER PERMETTERE DI IMPORTARE E CONDIVIDERE FILE GENERATI DALLE PROCEDURE DI OPERO
CREATO IL 3/11 DA ZAI 
*/

// src/context/QuickComposeContext.js
import React, { createContext, useState, useContext } from 'react';

// Crea il context
const QuickComposeContext = createContext();

// Crea un provider component
export const QuickComposeProvider = ({ children }) => {
    const [isQuickComposing, setIsQuickComposing] = useState(false);
    const [composeData, setComposeData] = useState(null);

    // Funzione per attivare la composizione rapida
    const triggerQuickCompose = (data) => {
        setComposeData(data);
        setIsQuickComposing(true);
    };

    // Funzione per resettare lo stato dopo l'invio o l'annullamento
    const resetQuickCompose = () => {
        setIsQuickComposing(false);
        setComposeData(null);
    };

    return (
        <QuickComposeContext.Provider value={{ isQuickComposing, composeData, triggerQuickCompose, resetQuickCompose }}>
            {children}
        </QuickComposeContext.Provider>
    );
};

// Hook personalizzato per usare facilmente il context
export const useQuickCompose = () => {
    const context = useContext(QuickComposeContext);
    if (!context) {
        throw new Error('useQuickCompose must be used within a QuickComposeProvider');
    }
    return context;
};