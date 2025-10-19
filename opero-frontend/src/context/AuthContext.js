// #####################################################################
// # Contesto di Autenticazione - v4.2 (Fix Reattività con useMemo/useCallback)
// #####################################################################
// - Utilizza `useMemo` e `useCallback` per stabilizzare tutte le funzioni e l'oggetto 'value'.
// - Questo garantisce che i componenti figli si ri-renderizzino in modo affidabile
//   quando lo stato di autenticazione cambia.

import React, { createContext, useState, useContext, useEffect, useCallback, useRef, useMemo } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        token: localStorage.getItem('token'),
        user: null, ditta: null, permissions: [], modules: [],
    });
    const [loading, setLoading] = useState(true);
    const heartbeatIntervalRef = useRef(null);

    const stopHeartbeat = useCallback(() => {
        if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
            heartbeatIntervalRef.current = null;
        }
    }, []);

    const logout = useCallback(async () => {
        console.log("Eseguo logout potenziato...");
        stopHeartbeat();
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error("Errore durante la chiamata di logout al backend:", error);
        } finally {
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
            setAuthState({ token: null, user: null, ditta: null, permissions: [], modules: [] });
        }
    }, [stopHeartbeat]);

    const startHeartbeat = useCallback(() => {
        stopHeartbeat(); // Pulisci sempre prima di iniziare
        heartbeatIntervalRef.current = setInterval(() => {
            api.post('/auth/heartbeat').catch(err => {
                console.error("Heartbeat fallito:", err);
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    logout();
                }
            });
        }, 300000);
    }, [logout, stopHeartbeat]);

    const handleAuthSuccess = useCallback((data) => {
        console.log("[AuthContext] Eseguo handleAuthSuccess.");
        if (!data || !data.token || !data.user || !data.ditta) {
             console.error("[AuthContext] Dati di login incompleti!", data);
             logout();
             return;
        }
        localStorage.setItem('token', data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        setAuthState({
            token: data.token, user: data.user, ditta: data.ditta,
            permissions: data.permissions || [], modules: data.modules || [],
        });
        startHeartbeat();
        console.log("[AuthContext] Stato aggiornato. L'utente è autenticato.");
    }, [logout, startHeartbeat]);

    const loadUserFromToken = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false); return;
        }
        try {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const { data } = await api.get('/auth/me');
            if (data && data.success === true && data.user) {
                handleAuthSuccess({ token, ...data });
            } else {
                throw new Error("Token non valido o sessione scaduta.");
            }
        } catch (error) {
            console.error("Ripristino sessione fallito:", error.message);
            await logout();
        } finally {
            setLoading(false);
        }
    }, [logout, handleAuthSuccess]);

    useEffect(() => {
        loadUserFromToken();
        return () => stopHeartbeat();
    }, [loadUserFromToken, stopHeartbeat]);
    
    // Funzione login originale mantenuta per possibile uso futuro
    const login = useCallback(async (credentials) => {
        try {
            const { data } = await api.post('/auth/login', credentials);
            if (data.success) {
                handleAuthSuccess(data);
            }
        } catch (error) {
            console.error("Errore di login:", error);
            throw error;
        }
    }, [handleAuthSuccess]);
    
    const hasPermission = useCallback((requiredFunctionCode, requiredLevel = 0) => {
        if (!authState.user) return false;
        if (authState.user.livello < requiredLevel) return false;
        return authState.permissions.includes(requiredFunctionCode);
    }, [authState.user, authState.permissions]);

    const value = useMemo(() => ({ 
        ...authState, 
        loading, 
        login,
        logout, 
        hasPermission, 
        isAuthenticated: !!authState.token,
        handleAuthSuccess 
    }), [authState, loading, login, logout, hasPermission, handleAuthSuccess]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

